// src/pages/report/ReportActivityExpense.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import { InputNumber, Table, Form, Row, Col, Select } from "antd";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import Title from "../../components/title/Title";
import ExportActivityExpenseExcelButton from "../../components/export/ExportActivityExpenseExcelButton";
import DynamicButton from "../../components/button/DynamicButton";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

// ===== helpers year =====
const getYearCodeFrom = (y) => {
  if (y == null) return "";
  if (typeof y === "string" || typeof y === "number") return String(y);
  return (
    y.year_code ??
    y.code ??
    y.value ??
    y.label ??
    y.name ??
    y.year ??
    ""
  );
};

const pickLatestYearCode = (yearsArr) => {
  if (!Array.isArray(yearsArr) || yearsArr.length === 0) {
    return dayjs().tz("Asia/Bangkok").format("YYYY");
  }
  let best = yearsArr[0];
  for (const cur of yearsArr) {
    const b = Number(getYearCodeFrom(best)) || 0;
    const c = Number(getYearCodeFrom(cur)) || 0;
    if (c > b) best = cur;
  }
  return getYearCodeFrom(best);
};

export default function ReportActivityExpense() {
  const { showNotification, userInfo } = useContext(AuthContext);
  const [areaId, setAreaId] = useState();
  const [roleId, setRoleId] = useState();
  const [formCustom] = Form.useForm();
  const watchedAreaId = Form.useWatch("area_id", formCustom);
  const watchedSaleId = Form.useWatch("user_id", formCustom);

  const [loading, setLoading] = useState(false);

  // masters
  const [years, setYears] = useState([]);        // array of string year codes
  const [defaultYear, setDefaultYear] = useState(null);
  const [areaList, setAreaList] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [dealerList, setDealerList] = useState([]);

  // table
  const [itemColumn, setItemColumn] = useState([]);
  const [permission, setPermission] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [isAreaSelected, setIsAreaSelected] = useState(false);
  const [isSalesSelected, setIsSalesSelected] = useState(false);
  // form & step-watch
  const [form] = Form.useForm();
  const selectedArea = Form.useWatch("area_id", form);
  const selectedSale = Form.useWatch("user_id", form);
  const isAdmin = Number(roleId) === 1;
  //load user detail to get area_id and role_id
  useEffect(() => {
    (async () => {
      try {
        const res = await useServiceAPI.get(
          `${paths.pathMasterUsersDetail}/${userInfo.id}`,
          {},
          setLoading
        );

        if (res?.status === 200) {
          const aId = res.data.area_id;
          const rId = res.data.role_id;

          setAreaId(aId);
          setRoleId(rId);

          // ✅ roleId != 1 ให้ set area_id ลงฟอร์มทันที
          if (Number(rId) !== 1) {
            form.setFieldsValue({ area_id: aId });
          }
        }
      } catch (e) {
        showNotification("error", e?.message || "เกิดข้อผิดพลาด");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // local table params (keep year filter)
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
  });



  // ====== Load masters: Year + Area ======
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [yearsRes, areaRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear),
          useServiceAPI.get(paths.pathMasterAreas),
        ]);

        const yearRaw = yearsRes?.data || [];
        const yearCodes = yearRaw.map(getYearCodeFrom).filter(Boolean);

        setYears(yearCodes);

        const currentYear = dayjs().tz("Asia/Bangkok").format("YYYY");
        const yearToUse = yearCodes.includes(currentYear)
          ? currentYear
          : (yearCodes[0] || currentYear);

        setDefaultYear(yearToUse);

        // ✅ set default year filter + form “ครั้งเดียวพอ”
        setTableParams((prev) => ({
          ...prev,
          filters: { ...prev.filters, year_code: yearToUse },
        }));
        form.setFieldsValue({ year_code: yearToUse });

        setAreaList(
          (areaRes?.data || []).map((a) => ({
            value: a.id,
            label: a.name,
          }))
        );
      } catch (e) {
        showNotification?.("error", e?.message || "โหลดข้อมูลตั้งต้นไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== Cascade: Area → Sales ======
  useEffect(() => {
    let alive = true;

    const loadSales = async () => {
      if (!selectedArea) {
        setSalesList([]);
        setDealerList([]);
        form.setFieldsValue({ user_id: undefined, dealer_id: undefined });
        return;
      }

      try {
        const res = await useServiceAPI.get(paths.pathMasterSaleReport, {
          area_id: selectedArea,
        });

        const raw = res?.data?.data ?? res?.data ?? [];
        const list = Array.isArray(raw) ? raw : [];

        const options = list.map((x) => ({
          value: Number(x.user_id ?? x.id),      // id จริงของ sales
          label: x.user_name ?? x.name,
        }));

        if (!alive) return;

        setSalesList(options);
        setDealerList([]);

        // ✅ reset เฉพาะตอน area เปลี่ยนจริง (admin เปลี่ยนได้)
        form.setFieldsValue({ user_id: undefined, dealer_id: undefined });
      } catch (e) {
        if (!alive) return;
        setSalesList([]);
        setDealerList([]);
        form.setFieldsValue({ user_id: undefined, dealer_id: undefined });
      }
    };

    loadSales();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea]);


  // ====== Cascade: Sales → Dealer ======
  useEffect(() => {
    let alive = true;

    const loadDealers = async () => {
      if (!selectedSale) {
        setDealerList([]);
        form.setFieldsValue({ dealer_id: undefined });
        return;
      }

      try {
        const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
          user_id: selectedSale,
        });

        const raw = res?.data?.data ?? res?.data ?? [];
        const list = Array.isArray(raw) ? raw : [];

        if (!alive) return;

        setDealerList(list.map((x) => ({ value: Number(x.id), label: x.name })));
        form.setFieldsValue({ dealer_id: undefined });
      } catch {
        if (!alive) return;
        setDealerList([]);
        form.setFieldsValue({ dealer_id: undefined });
      }
    };

    loadDealers();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSale]);


  // ====== Fetch ======
  const fetchData = async (overrideFilters) => {
    setTableLoading(true);
    try {
      const f = overrideFilters ?? tableParams.filters ?? {};
      const v = form.getFieldsValue();

      const requestData = {
        keyword: f.keyword || "",
        year_code:
          f.year_code ||
          defaultYear ||
          years[0] ||
          dayjs().tz("Asia/Bangkok").format("YYYY"),
        area_id: v.area_id || null,
        user_id: v.user_id || null,
        dealer_id: v.dealer_id || null,
        page_length: 1,
        page_size: tableParams.pagination.pageSize,
      };

      const response = await useServiceAPI.get(
        paths.pathReportActivityByMonth,
        requestData
      );
      if (response?.status === 200) {
        const { item, records_filtered, permission, total } =
          response.data || {};
        const rows = (item || []).map((row, index) => ({
          key: index + 1,
          month_name: row.month_name,
          month_id: row.month_id,
          item: row.item,
        }));

        console.log("Response Activity By Month:", response.data);
        setPermission(permission || []);
        setDataSource(rows);
        setItemColumn(total || []);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: records_filtered || rows.length,
          },
        }));
      }
    } catch (e) {
      console.error(e);
      setDataSource([]);
      setItemColumn([]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (years.length > 0 && tableParams.filters.year_code) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tableParams.filters), years.length]);

  const handleSearch = () => fetchData();

  const handleClear = async () => {
    const yearToUse =
      defaultYear || years[0] || dayjs().tz("Asia/Bangkok").format("YYYY");

    if (Number(roleId) !== 1) {
      // ✅ non-admin: คง area เดิมไว้
      form.resetFields(["user_id", "dealer_id", "year_code"]);
      form.setFieldsValue({ area_id: areaId, year_code: yearToUse });

      // ✅ ไม่ล้าง salesList เพราะ area ไม่ได้เปลี่ยน
      setDealerList([]);
    } else {
      // ✅ admin: reset ได้หมด
      form.resetFields(["area_id", "user_id", "dealer_id", "year_code"]);
      form.setFieldsValue({ year_code: yearToUse });
      setSalesList([]);
      setDealerList([]);
    }

    setTableParams((prev) => ({
      ...prev,
      filters: { ...prev.filters, year_code: yearToUse },
      pagination: { current: 1, pageSize: prev.pagination.pageSize },
    }));

    await fetchData({ year_code: yearToUse });
  };


  const handleTableChange = (pagination) => {
    setTableParams((prev) => ({ ...prev, pagination }));
  };

  // ====== Table header ======
  const columnColors = ["#009845", "#7DB41E", "#93CC23"];
  const header = [
    {
      title: "Month",
      dataIndex: "month_name",
      key: "month_name",
      fixed: "left",
      width: 125,
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
    },
    ...itemColumn.map((act, index) => {
      const bgColor = columnColors[index % columnColors.length];
      const activityId = act.activity_type_id;
      return {
        title: act.activity_type_name,
        key: `activity_${activityId}`,
        width: 125,
        onHeaderCell: () => ({
          style: {
            backgroundColor: bgColor,
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          },
        }),
        render: (_, record) => {
          const activityItem = (record.item || []).find(
            (x) => x.activity_type_id === activityId
          );
          const set_value = activityItem
            ? Number(activityItem.total_unit_convert_value) || 0
            : 0;
          return (
            <InputNumber
              className="w-full"
              min={0}
              value={set_value}
              formatter={(value) =>
                `${parseInt(value || 0, 10)}`.replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  ","
                )
              }
              disabled
            />
          );
        },
      };
    }),
  ];

  // ====== Export helpers ======
  const toText = (v) =>
    v == null
      ? ""
      : typeof v === "string" || typeof v === "number"
        ? String(v)
        : v.name ?? v.label ?? v.value ?? v.code ?? "";

  // แก้เป็น:
  const footerTotals = useMemo(() => {
    const sums = {};
    (itemColumn || []).forEach((act) => {
      const price = Number(act?.unit_convert_value) || 0;
      const sum = (dataSource || []).reduce((acc, row) => {
        const it = (row?.item || []).find(
          (x) => x?.activity_type_id === act?.activity_type_id
        );
        const valueFromAPI = Number(it?.total_unit_convert_value);
        if (!Number.isNaN(valueFromAPI) && valueFromAPI > 0)
          return acc + valueFromAPI;
        const qty = Number(it?.total) || 0;
        return acc + qty * price;
      }, 0);
      sums[act.activity_type_id] = sum;
    });
    return sums;
  }, [itemColumn, dataSource]);

  const buildFileName = () => {
    const f = tableParams?.filters || {};
    const v = form.getFieldsValue();
    const ts = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD_HHmm");
    const yearText =
      toText(f.year_code) || dayjs().tz("Asia/Bangkok").format("YYYY");
    const areaLabel = (areaList.find((x) => x.value === v.area_id) || {})
      .label;
    const salesLabel = (salesList.find((x) => x.value === v.user_id) || {})
      .label;
    const dealerLabel = (dealerList.find((x) => x.value === v.dealer_id) || {})
      .label;
    return [
      `Activity_Report_By_Month_${yearText}`,
      areaLabel && `Area_${areaLabel}`,
      salesLabel && `Sales_${salesLabel}`,
      dealerLabel && `Dealer_${dealerLabel}`,
      ts,
    ]
      .filter(Boolean)
      .join("_")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "_");
  };

  // ====== UI ======
  return (
    <MainLayout loading={loading}>
      <Title prefix="Activity Expenses Report" />

      <Form
        form={form}
        layout="vertical"
        onValuesChange={(chg) => {
          // reset ตาม step
          if ("area_id" in chg) form.setFieldsValue({ user_id: undefined, dealer_id: undefined });
          if ("user_id" in chg) form.setFieldsValue({ dealer_id: undefined });
        }}
      >
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">

            <Col md={6}>
              <Form.Item
                label="Area"
                name="area_id"
                tooltip="เลือก Area ก่อนเพื่อเปิด Sales"
              >
                <Select
                  placeholder="Select Area"
                  options={areaList}
                  disabled={Number(roleId) !== 1}     // ✅ ล็อก
                  allowClear={Number(roleId) === 1}  // ✅ admin เท่านั้นที่ล้างได้
                />

              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item
                label="Sales"
                name="user_id"
                tooltip="เลือก Sales หลังจากเลือก Area"
              >
                <Select
                  placeholder="Select Sales"
                  options={salesList}
                  allowClear
                  disabled={!selectedArea}
                />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item
                label="Dealer"
                name="dealer_id"
                tooltip="เลือก Dealer หลังจากเลือก Sales"
              >
                <Select
                  placeholder="Select Dealer"
                  options={dealerList}
                  allowClear
                  disabled={!selectedSale}
                />
              </Form.Item>
            </Col>
            {/* Year filter */}
            <Col md={6}>
              <Form.Item label="Year" name="year_code">
                <Select
                  placeholder="Select Year"
                  options={years.map((y) => ({ value: y, label: y }))}
                  allowClear={false}
                  onChange={(value) => {
                    setTableParams((prev) => ({
                      ...prev,
                      filters: { ...prev.filters, year_code: value },
                    }));
                  }}
                />
              </Form.Item>

            </Col>

          </Row>

          <div className="flex justify-end gap-4 px-4 pt-5">
            <DynamicButton
              onClick={handleSearch}
              name="btn-search"
              text="Search"
              iconSrc="/img/icons/search.png"
              className="text-white px-4 py-3 rounded-[4px] bg-[#7DB41E]"
            />
            <DynamicButton
              onClick={handleClear}
              name="btn-clear"
              text="Clear"
              iconSrc="/img/icons/trash.png"
              className="text-white px-4 py-3 rounded-[4px] bg-[#B6AEAB]"
            />
            <ExportActivityExpenseExcelButton
              text="Export Excel"
              fileName={buildFileName()}
              getPayload={async () => {
                const f = tableParams?.filters || {};
                const v = form.getFieldsValue();
                return {
                  keyword: f.keyword || "",
                  year_code:
                    toText(f.year_code) ||
                    defaultYear ||
                    dayjs().tz("Asia/Bangkok").format("YYYY"),
                  area_id: v.area_id || null,
                  user_id: v.user_id || null,
                  dealer_id: v.dealer_id || null,
                };
              }}
              requestData={(payload) =>
                useServiceAPI.get(paths.pathReportActivityByMonth, payload)
              }
            />
          </div>
        </BoxPrimary>
      </Form>

      <BoxPrimary>
        <TableCustomComponent
          header={header}
          dataSource={dataSource}
          pagination={false}
          loading={tableLoading}
          onChange={handleTableChange}
          scrollY={false}
          footer={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-[#978B87]">
                <Table.Summary.Cell index={0}>Total (THB)</Table.Summary.Cell>
                {itemColumn.map((act) => (
                  <Table.Summary.Cell
                    key={`sum_${act.activity_type_id}`}
                    align="center"
                  >
                    <InputNumber
                      className="w-full"
                      disabled
                      value={footerTotals[act.activity_type_id] || 0}
                      formatter={(value) =>
                        `${Math.trunc(Number(value) || 0)}`.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )
                      }
                      style={{ backgroundColor: "white" }}
                    />
                  </Table.Summary.Cell>
                ))}
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
