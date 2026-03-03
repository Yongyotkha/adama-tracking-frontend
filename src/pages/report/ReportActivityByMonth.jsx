// src/pages/report/ReportActivityByMonth.jsx
import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { InputNumber, Select, Table, Form, Row, Col } from "antd";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import Title from "../../components/title/Title";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import DynamicButton from "../../components/button/DynamicButton";
import ExportActivityByMonthExcelButton from "../../components/export/ExportActivityByMonthExcelButton";
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

export default function ReportActivityByMonth() {
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]);        // year codes string[]
  const [defaultYear, setDefaultYear] = useState(null);

  const [sales, setSales] = useState([]);
  const [subDealers, setSubDealers] = useState([]);
  const [itemColumn, setItemColumn] = useState([]);
  const [dataSource, setDataSource] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const { showNotification, userInfo } = useContext(AuthContext);
  const [areaId, setAreaId] = useState();
  const [roleId, setRoleId] = useState();
  const [formCustom] = Form.useForm();
  const watchedAreaId = Form.useWatch("area_id", formCustom);
  const watchedSaleId = Form.useWatch("sale_id", formCustom);

  // watch สำหรับ disable ตามลำดับ step
  const selectedArea = Form.useWatch("area_id", formCustom);
  const selectedSale = Form.useWatch("sale_id", formCustom);


  const [areaList, setAreaList] = useState([]);

  const [isSaleLocked, setIsSaleLocked] = useState(false);

  const getLoginSaleId = (u) => {
    if (!u) return null;
    return u.sale_id ?? u.user_id ?? u.id ?? null;
  };

  const getLoginAreaId = (u) => {
    if (!u) return null;
    return u.area_id ?? u.areaId ?? u.area ?? null;
  };

  useEffect(() => {
    if (!roleId || !areaId) return;

    // ถ้าไม่ใช่ admin ให้ fix area ตาม user
    if (Number(roleId) !== 1) {
      formCustom.setFieldsValue({
        area_id: areaId,
        sale_id: undefined,
        sub_dealer_id: undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId, areaId]);

  // watch สำหรับ disable ตามลำดับ step

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

        }
      } catch (e) {
        showNotification("error", e?.message || "เกิดข้อผิดพลาด");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const header = [
    {
      title: "Month",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      children: [
        {
          title: "Activity Name",
          dataIndex: "productName",
          key: "productName",
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
      ],
    },
    ...itemColumn.map((month, index) => ({
      title: month.name,
      key: index,
      onHeaderCell: () => ({
        style: {
          backgroundColor: index % 2 === 1 ? "#7DB41E" : "#009845",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      children: [
        {
          title: "Plan (Value)",
          key: `plan_${index}`,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: index % 2 === 1 ? "#7DB41E" : "#009845",
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.product.find(
                (p) => p.product_name === record.productName
              ) || {};
            const val =
              isNaN(itemData.workplan_value) ||
                itemData.workplan_value == null
                ? 0
                : itemData.workplan_value;
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={val}
                formatter={(v) =>
                  `${parseInt(v || 0, 10)}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
                disabled
              />
            );
          },
        },
        {
          title: "Actual (Value)",
          key: `actual_${index}`,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: index % 2 === 1 ? "#7DB41E" : "#009845",
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.product.find(
                (p) => p.product_name === record.productName
              ) || {};
            const val =
              isNaN(itemData.actual_value) ||
                itemData.actual_value == null
                ? 0
                : itemData.actual_value;
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={val}
                formatter={(v) =>
                  `${parseInt(v || 0, 10)}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
                disabled
              />
            );
          },
        },
      ],
    })),
  ];

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  // ===== Masters =====
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [yearsRes, resArea] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear),
          useServiceAPI.get(paths.pathMasterAreas),
        ]);

        const yearRaw = yearsRes.data || [];
        const yearCodes = yearRaw
          .map((y) => getYearCodeFrom(y))
          .filter(Boolean);

        setYears(yearCodes);

        // ✅ default = option แรก
        const currentYear = dayjs().tz("Asia/Bangkok").format("YYYY");

        // ถ้ามีปีปัจจุบันใน master ให้ใช้ปีนั้น
        const yearToUse = yearCodes.includes(currentYear)
          ? currentYear
          : yearCodes[0];

        setDefaultYear(yearToUse);

        setTableParams((prev) => ({
          ...prev,
          filters: { ...prev.filters, year_code: yearToUse },
        }));

        formCustom.setFieldsValue({ year_code: yearToUse });
        console.log(resArea.data);
        const areaOpts = (resArea.data || []).map((x) => ({
          value: String(x.id),
          label: x.name,
        }));
        setAreaList(areaOpts);

        // ✅ ตามตัวอย่างที่คุณใช้
        const defaultAreaId =
          Array.isArray(areaOpts) && areaOpts.length === 1
            ? areaOpts[0]?.value
            : undefined;

        formCustom.setFieldsValue({
          area_id: defaultAreaId,
          sale_id: undefined,
          sub_dealer_id: undefined,
        });
      } catch (error) {
        showNotification?.("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    getMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Area → Sales
  useEffect(() => {
    const aId = watchedAreaId;

    if (!aId) {
      setSales([]);
      setSubDealers([]);
      formCustom.resetFields(["sale_id", "sub_dealer_id"]);
      return;
    }

    (async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterSaleReport, {
          area_id: aId,
        });

        const list = Array.isArray(res?.data) ? res.data : [];
        setSales(
          list.map((s) => ({
            value: Number(s.user_id ?? s.id),
            label: s.user_name ?? s.name,
          }))
        );

        // reset downstream
        setSubDealers([]);
        formCustom.resetFields(["sale_id", "sub_dealer_id"]);
      } catch {
        setSales([]);
        setSubDealers([]);
        formCustom.resetFields(["sale_id", "sub_dealer_id"]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedAreaId]);

  useEffect(() => {
    const loginSaleId = getLoginSaleId(userInfo);
    const loginAreaId = getLoginAreaId(userInfo);

    // ถ้า role เป็น admin (1) ให้ไม่ต้อง lock
    if (roleId != null && Number(roleId) === 1) {
      setIsSaleLocked(false);
      return;
    }

    if (!selectedArea) {
      setIsSaleLocked(false);
      return;
    }
    if (!Array.isArray(sales) || sales.length === 0) {
      setIsSaleLocked(false);
      return;
    }

    const foundSale = sales.find((s) => String(s.value) === String(loginSaleId));

    if (foundSale) {
      // ถ้า area ไม่ตรง user -> บังคับให้ตรงก่อน
      if (loginAreaId != null && String(selectedArea) !== String(loginAreaId)) {
        formCustom.setFieldsValue({ area_id: String(loginAreaId) });
        return; // รอ sales reload แล้วค่อย set sale รอบถัดไป
      }

      formCustom.setFieldsValue({
        sale_id: foundSale.value,
        sub_dealer_id: undefined,
      });

      setIsSaleLocked(true);
      fetchData();
    } else {
      setIsSaleLocked(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea, sales, userInfo, roleId, formCustom]);

  // Sales → Sub Dealer
  useEffect(() => {
    const sId = watchedSaleId;

    if (!sId) {
      setSubDealers([]);
      formCustom.resetFields(["sub_dealer_id"]);
      return;
    }

    (async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
          user_id: sId,
          dealer_id: "",
        });

        const list = Array.isArray(res?.data) ? res.data : [];
        setSubDealers(
          list.map((s) => ({
            value: s.sub_dealer_id,
            label: s.sub_dealer_name,
          }))
        );

        formCustom.resetFields(["sub_dealer_id"]);
      } catch {
        setSubDealers([]);
        formCustom.resetFields(["sub_dealer_id"]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedSaleId]);


  useEffect(() => {
    if (years.length > 0 && tableParams.filters.year_code) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tableParams.filters), years.length]);

  const handleSearch = () => fetchData();

  const fetchData = async () => {
    setTableLoading(true);
    try {
      const values = await formCustom.validateFields().catch(() => ({}));
      const yearCode =
        tableParams.filters.year_code ||
        defaultYear ||
        years[0] ||
        dayjs().tz("Asia/Bangkok").format("YYYY");

      const payload = {
        sale_id: values.sale_id || null,
        sub_dealer_id: values.sub_dealer_id || null, // ⬅️ ใช้ sub dealer
        area_id: values.area_id || null,
        year_code: yearCode,
      };

      const response = await useServiceAPI.get(
        paths.pathReportActivityExpense,
        payload
      );

      if (response.status === 200) {
        const { item: activityTypes, month: monthList } = response.data;

        // columns per month
        const itemColumnData = monthList.map((month) => {
          const monthId = month.id;
          const productData = activityTypes.map((activity) => {
            const matchingMonthItem = activity.item.find(
              (i) => i.month_id === monthId
            );
            return {
              product_name: activity.activity_type_name,
              workplan_qty:
                Number(
                  (matchingMonthItem?.total_activity_plan_count || "0")
                    .toString()
                    .replace(/,/g, "")
                ) || 0,
              rolling_qty: 0,
              actual_qty: 0,
              workplan_value:
                Number(
                  (matchingMonthItem?.total_activity_plan_value || "0")
                    .toString()
                    .replace(/,/g, "")
                ) || 0,
              rolling_value: 0,
              actual_value:
                Number(
                  (matchingMonthItem?.expense_actual || "0")
                    .toString()
                    .replace(/,/g, "")
                ) || 0,
            };
          });
          return { ...month, product: productData };
        });

        const dataSourceFormatted = activityTypes.map((activity, index) => ({
          key: index,
          productName: activity.activity_type_name,
        }));

        setItemColumn(itemColumnData);
        setDataSource(dataSourceFormatted);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: dataSourceFormatted.length,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      showNotification?.(
        "error",
        error.message || "ไม่สามารถโหลดข้อมูลรายงานได้"
      );
    } finally {
      setTableLoading(false);
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({ pagination, filters: tableParams.filters });
  };

  const calculateFooterSums = () =>
    itemColumn.map((month) => {
      const workplan_value = month.product.reduce(
        (sum, p) => sum + (Number(p.workplan_value) || 0),
        0
      );
      const actual_value = month.product.reduce(
        (sum, p) => sum + (Number(p.actual_value) || 0),
        0
      );
      return { id: month.id, workplan_value, actual_value };
    });

  const toText = (v) =>
    v == null
      ? ""
      : typeof v === "string" || typeof v === "number"
        ? String(v)
        : v.name ?? v.label ?? v.value ?? v.code ?? "";

  const buildFileName = () => {
    const ts = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD_HHmm");
    const yearText =
      toText(tableParams?.filters?.year_code) ||
      dayjs().tz("Asia/Bangkok").format("YYYY");
    const fVals = formCustom.getFieldsValue();
    const areaLabel = (areaList.find((x) => x.value === fVals.area_id) || {})
      .label;
    const salesLabel = (sales.find((x) => x.value === fVals.sale_id) || {})
      .label;
    const subDealerLabel = (
      subDealers.find((x) => x.value === fVals.sub_dealer_id) || {}
    ).label;
    return [
      `Activity_Expenses_By_Month_${yearText}`,
      areaLabel && `Area_${areaLabel}`,
      salesLabel && `Sales_${salesLabel}`,
      subDealerLabel && `SubDealer_${subDealerLabel}`,
      ts,
    ]
      .filter(Boolean)
      .join("_")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "_");
  };

  return (
    <MainLayout loading={loading} childrenStyle={""}>
      <Title prefix="Activity Report By Value" />

      <Form
        form={formCustom}
        layout="vertical"
        onValuesChange={(chg) => {
          if ("area_id" in chg)
            formCustom.setFieldsValue({
              sale_id: undefined,
              sub_dealer_id: undefined,
            });
          if ("sale_id" in chg)
            formCustom.setFieldsValue({ sub_dealer_id: undefined });
        }}
      >
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">

            <Col md={6}>
              <Form.Item label="Area" name="area_id" tooltip="เลือก Area ก่อนเพื่อเปิด Sales">
                <Select
                  placeholder="Select Area"
                  options={areaList}
                  allowClear={!isSaleLocked && Number(roleId) === 1}
                  disabled={isSaleLocked || (roleId != null && Number(roleId) !== 1)}
                />

              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item
                label="Sales"
                name="sale_id"
                tooltip="เลือก Sales หลังจากเลือก Area"
              >
                <Select
                  placeholder="Select Sales"
                  options={sales}
                  allowClear={!isSaleLocked}
                  disabled={!selectedArea || isSaleLocked}
                />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item
                label="Sub Dealer"
                name="sub_dealer_id"
                tooltip="เลือก Sub Dealer หลังจากเลือก Sales"
              >
                <Select
                  placeholder="Select Sub Dealer"
                  options={subDealers}
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
              onClick={() => {
                // ✅ เคลียร์ปี / subdealer เสมอ
                formCustom.resetFields(["sub_dealer_id", "year_code"]);
                setSubDealers([]);

                const yearToUse =
                  defaultYear || years[0] || dayjs().tz("Asia/Bangkok").format("YYYY");

                if (yearToUse) {
                  formCustom.setFieldsValue({ year_code: yearToUse });
                }

                setTableParams((prev) => ({
                  ...prev,
                  filters: { ...prev.filters, year_code: yearToUse },
                  pagination: { ...prev.pagination, current: 1 },
                }));

                if (isSaleLocked) {
                  // ✅ lock อยู่: ไม่แตะ area_id / sale_id
                  // แค่ ensure subDealer cleared แล้ว fetch
                  fetchData();
                  return;
                }

                // ✅ ไม่ lock: behavior เดิม (admin เคลียร์ area ได้, non-admin fix ตาม areaId)
                formCustom.resetFields(["sale_id"]);
                if (roleId != null && Number(roleId) !== 1) {
                  formCustom.setFieldsValue({ area_id: areaId });
                } else {
                  formCustom.resetFields(["area_id"]);
                }

                fetchData();
              }}

              name="btn-clear"
              text="Clear"
              iconSrc="/img/icons/trash.png"
              className="text-white px-4 py-3 rounded-[4px] bg-[#B6AEAB]"
            />

            <ExportActivityByMonthExcelButton
              text="Export Excel"
              fileName={buildFileName()}
              getPayload={async () => {
                const v = await formCustom.validateFields().catch(() => ({}));
                const yearCode =
                  toText(formCustom.getFieldValue("year_code")) ||
                  tableParams.filters.year_code ||
                  defaultYear ||
                  years[0] ||
                  dayjs().tz("Asia/Bangkok").format("YYYY");

                return {
                  sale_id: v.sale_id || null,
                  sub_dealer_id: v.sub_dealer_id || null,
                  area_id: v.area_id || null,
                  year_code: yearCode,
                  page_length: 1,
                  page_size: 100000,
                };
              }}
              requestData={(payload) =>
                useServiceAPI.get(
                  paths.pathReportActivityExpense,
                  payload
                )
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
          scrollY={true}
          footer={() => {
            const footerData = calculateFooterSums();
            return (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-[#978B87]">
                  <Table.Summary.Cell index={0}>
                    <b>Total (THB)</b>
                  </Table.Summary.Cell>
                  {footerData.map((month, index) => (
                    <React.Fragment key={`${month.id}_${index}`}>
                      <Table.Summary.Cell align="center">
                        <InputNumber
                          className="w-full"
                          readOnly
                          value={month.workplan_value}
                          formatter={(v) =>
                            `${parseInt(v || 0, 10)}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                        />
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="center">
                        <InputNumber
                          className="w-full"
                          readOnly
                          value={month.actual_value}
                          formatter={(v) =>
                            `${parseInt(v || 0, 10)}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                        />
                      </Table.Summary.Cell>
                    </React.Fragment>
                  ))}
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
