// src/pages/report/ReportSellOut.jsx
import React, { useMemo, useState, useEffect, useContext } from "react";
import { Form, Row, Col, Select, InputNumber, Table } from "antd";
import MainLayout from "../../layouts/MainLayout";
import Title from "../../components/title/Title";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import DynamicButton from "../../components/button/DynamicButton";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import dayjs from "dayjs";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import ExportSellOutExcelButton from "../../components/export/ExportSellOutExcelButton";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const GREEN_A = "#00783F";
const GREEN_B = "#009845";

const monthsEN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const subCols = [
  { title: "Last Stock", key: "last_stock" },
  { title: "Sell In", key: "sell_in" },
  { title: "Current Stock", key: "current_stock" },
  { title: "Sell Out", key: "sell_out" },
];

const fmt = (n) =>
  `${parseInt(Number(n) || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// -------- helpers for export file name ----------
const slug = (s) =>
  String(s ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_");

const getLabelFrom = (options, value) =>
  (Array.isArray(options) ? options.find((o) => o?.value === value) : null)
    ?.label || "";

const buildSellOutReportFileName = (form, { areaList, sales, dealers }) => {
  const v = form.getFieldsValue();
  const rawYear = v.year ?? dayjs().year();
  const year = String(rawYear);
  const area = getLabelFrom(areaList, v.area_id);
  const sale = getLabelFrom(sales, v.sales_id);
  const dealer = getLabelFrom(dealers, v.dealer_id);

  const parts = [
    "SellOut_Report",
    `Y${year}`,
    area && `Area_${slug(area)}`,
    sale && `Sales_${slug(sale)}`,
    dealer && `Dealer_${slug(dealer)}`,
  ].filter(Boolean);

  const ts = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD_HHmm");
  return `${parts.join("_")}_${ts}`;
};

export default function ReportSellOut() {
  const [form] = Form.useForm();
  const { showNotification, userInfo } = useContext(AuthContext) || {};
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // masters from API
  const [areaList, setAreaList] = useState([]);
  const [sales, setSales] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [yearList, setYearList] = useState([]);
  const [defaultYear, setDefaultYear] = useState(null);

  // table data + page size
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(5);

  const [isSaleLocked, setIsSaleLocked] = useState(false);

  // (optional) เก็บไว้เผื่อใช้ต่อ เช่น disable option เฉพาะ area
  const [activeAreaId, setActiveAreaId] = useState(null);

  // ✅ disable Sales เฉพาะ role_id 4, 5, 6
  const isSaleRoleLocked = [4, 5, 6].includes(Number(userInfo?.role_id));

  const getLoginSaleId = (u) => {
    if (!u) return null;
    return u.sale_id ?? u.user_id ?? u.id ?? null;
  };

  const getLoginAreaId = (u) => {
    if (!u) return null;
    return u.area_id ?? u.areaId ?? u.area ?? null;
  };

  // watch step values -> disable next steps
  const selectedArea = Form.useWatch("area_id", form);
  const selectedSales = Form.useWatch("sales_id", form);

  // ---------- columns ----------
  const header = useMemo(() => {
    const firstBlock = {
      title: "Month",
      onHeaderCell: () => ({
        style: {
          backgroundColor: GREEN_A,
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      children: [
        {
          title: "Sub Dealer / Group",
          dataIndex: "sub_dealer_name",
          fixed: "left",
          width: 300,
          onHeaderCell: () => ({
            style: {
              backgroundColor: GREEN_A,
              color: "white",
              fontWeight: "bold",
              textAlign: "left",
            },
          }),
        },
      ],
    };

    const monthBlocks = monthsEN.map((m, i) => {
      const c = i % 2 === 0 ? GREEN_B : GREEN_A;
      return {
        title: m,
        onHeaderCell: () => ({
          style: {
            backgroundColor: c,
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          },
        }),
        children: subCols.map((sc) => ({
          title: sc.title,
          dataIndex: `${m}_${sc.key}`,
          align: "right",
          width: 120,
          onHeaderCell: () => ({
            style: {
              backgroundColor: c,
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (val) => (
            <InputNumber
              className="w-full"
              readOnly
              value={Number(val) || 0}
              formatter={(v) => fmt(v)}
            />
          ),
        })),
      };
    });

    return [firstBlock, ...monthBlocks];
  }, []);

  // ---------- footer ----------
  const footer = useMemo(() => {
    const sum = (k) => (data || []).reduce((s, r) => s + (Number(r[k]) || 0), 0);
    return () => (
      <Table.Summary fixed>
        <Table.Summary.Row className="bg-[#978B87]">
          <Table.Summary.Cell index={0}>
            <b>Total</b>
          </Table.Summary.Cell>
          {monthsEN.flatMap((m, mi) =>
            subCols.map((sc, si) => {
              const k = `${m}_${sc.key}`;
              return (
                <Table.Summary.Cell
                  key={k}
                  index={mi * 10 + si + 1}
                  align="right"
                >
                  <InputNumber
                    className="w-full"
                    readOnly
                    value={sum(k)}
                    formatter={(v) => fmt(v)}
                    style={{ backgroundColor: "white" }}
                  />
                </Table.Summary.Cell>
              );
            })
          )}
        </Table.Summary.Row>
      </Table.Summary>
    );
  }, [data]);

  // ---------- API: masters (Area + Year) ----------
  useEffect(() => {
    const loadMasters = async () => {
      setLoading(true);
      try {
        const [areaRes, yearRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterAreas),
          useServiceAPI.get(paths.pathMasterYear),
        ]);

        // Area
        const areaRaw = Array.isArray(areaRes?.data) ? areaRes.data : [];
        const areaOpts = areaRaw.map((x) => ({ value: x.id, label: x.name }));
        setAreaList(areaOpts);

        // เก็บ area จาก userInfo
        const uArea = getLoginAreaId(userInfo);
        setActiveAreaId(uArea != null ? String(uArea) : null);

        // default area:
        // - ถ้ามี area เดียว → auto select
        // - ถ้ามีหลาย area → ไม่เลือก
        const defaultAreaId =
          Array.isArray(areaOpts) && areaOpts.length === 1
            ? areaOpts[0]?.value
            : undefined;

        form.setFieldsValue({
          area_id: defaultAreaId,
          sales_id: undefined,
          dealer_id: undefined,
          sub_dealer_id: undefined,
        });

        // Year
        const yearRaw = Array.isArray(yearRes?.data) ? yearRes.data : [];
        const yearOptions = yearRaw.map((y) => ({
          value: y.id,
          label: y.name,
        }));
        setYearList(yearOptions);

        if (yearOptions.length > 0) {
          const currentYear = dayjs().year();
          const matched =
            yearOptions.find((y) => Number(y.value) === currentYear) ||
            yearOptions[0];

          setDefaultYear(matched.value);
          form.setFieldsValue({ year: matched.value });
        }
      } catch (e) {
        setAreaList([]);
        setYearList([]);
        showNotification?.("error", "โหลดข้อมูลตัวกรองไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    loadMasters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // เปลี่ยน Area → โหลด Sales
  useEffect(() => {
    const areaId = selectedArea;

    if (!areaId) {
      setSales([]);
      form.resetFields(["sales_id", "dealer_id"]);
      setDealers([]);
      return;
    }

    (async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterSaleSingle, {
          area_id: areaId,
        });
        const list = Array.isArray(res?.data) ? res.data : [];
        setSales(list.map((x) => ({ value: Number(x.id), label: x.name })));
        form.resetFields(["sales_id", "dealer_id"]);
        setDealers([]);
      } catch {
        setSales([]);
        setDealers([]);
        form.resetFields(["sales_id", "dealer_id"]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea]);

  // ✅ Lock logic: ทำเฉพาะ role 4,5,6 เท่านั้น
  useEffect(() => {
    const loginSaleId = getLoginSaleId(userInfo);
    const loginAreaId = getLoginAreaId(userInfo);

    if (!isSaleRoleLocked) {
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
      if (loginAreaId != null && String(selectedArea) !== String(loginAreaId)) {
        form.setFieldsValue({ area_id: loginAreaId });
        return;
      }

      form.setFieldsValue({
        sales_id: foundSale.value,
        dealer_id: undefined,
        sub_dealer_id: undefined,
      });

      setIsSaleLocked(true);
      fetchSellOut();
    } else {
      setIsSaleLocked(false);
    }
  }, [selectedArea, sales, userInfo, form, isSaleRoleLocked]); // eslint-disable-line react-hooks/exhaustive-deps

  // เปลี่ยน Sales → โหลด Dealer
  useEffect(() => {
    const salesId = selectedSales;

    if (!salesId) {
      setDealers([]);
      form.resetFields(["dealer_id"]);
      return;
    }

    (async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
          user_id: salesId,
        });
        const list = Array.isArray(res?.data) ? res.data : [];
        setDealers(list.map((x) => ({ value: Number(x.id), label: x.name })));
        form.resetFields(["dealer_id"]);
      } catch {
        setDealers([]);
        form.resetFields(["dealer_id"]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSales]);

  // ---------- helpers ----------
  const buildPayload = () => {
    const v = form.getFieldsValue();
    const rawYear = v.year ?? defaultYear ?? dayjs().year();
    const year = String(rawYear);

    return {
      year,
      area_id: v.area_id ?? "",
      user_id: v.sales_id ?? "",
      dealer_id: v.dealer_id ?? "",
      sub_dealer_id: v.sub_dealer_id ?? "",
    };
  };

  const mapApiToRows = (apiData = []) => {
    return apiData.map((g, idx) => {
      const row = {
        key: g.group_id || idx + 1,
        sub_dealer_name: g.group_name || "All",
      };

      for (let i = 1; i <= 12; i++) {
        const mObj = g.months?.[String(i)] || g.months?.[i] || {};
        const mName = monthsEN[i - 1];
        row[`${mName}_last_stock`] = Number(mObj.last) || 0;
        row[`${mName}_sell_in`] = Number(mObj.in) || 0;
        row[`${mName}_current_stock`] = Number(mObj.current) || 0;
        row[`${mName}_sell_out`] = Number(mObj.out) || 0;
      }

      return row;
    });
  };

  const fetchSellOut = async () => {
    setTableLoading(true);
    try {
      const payload = buildPayload();
      const res = await useServiceAPI.get(paths.pathReportSellOut, payload);
      const groups = res?.data || [];
      setData(mapApiToRows(groups));
    } catch (err) {
      console.error(err);
      setData([]);
      showNotification?.("error", "โหลดรายงาน Sell Out ไม่สำเร็จ");
    } finally {
      setTableLoading(false);
    }
  };

  // ---------- first load ----------
  useEffect(() => {
    form.setFieldsValue({
      area_id: undefined,
      sales_id: undefined,
      dealer_id: undefined,
      sub_dealer_id: undefined,
    });

    if (defaultYear) {
      form.setFieldsValue({ year: defaultYear });
    }

    if (!isSaleLocked) {
      fetchSellOut();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- cascade reset (UI only) ----------
  const onValuesChange = (changed) => {
    if (Object.prototype.hasOwnProperty.call(changed, "area_id")) {
      form.setFieldsValue({ sales_id: undefined, dealer_id: undefined });
    }
    if (Object.prototype.hasOwnProperty.call(changed, "sales_id")) {
      form.setFieldsValue({ dealer_id: undefined });
    }
  };

  // ---------- actions ----------
  const handleSearch = async () => {
    const v = form.getFieldsValue();

    if (v.sales_id && !v.area_id) {
      showNotification?.("warning", "กรุณาเลือก Area ก่อนเลือก Sales");
      return;
    }

    await fetchSellOut();
  };

  const handleClear = () => {
    const rawYear = defaultYear ?? dayjs().year();

    if (isSaleLocked) {
      form.resetFields(["dealer_id", "sub_dealer_id", "year"]);

      // setDealers([]);

      form.setFieldsValue({
        dealer_id: undefined,
        sub_dealer_id: undefined,
        year: rawYear,
      });

      fetchSellOut();
      return;
    }

    form.resetFields([
      "area_id",
      "sales_id",
      "dealer_id",
      "sub_dealer_id",
      "year",
    ]);
    form.setFieldsValue({ year: rawYear });

    setSales([]);
    setDealers([]);
    fetchSellOut();
  };

  // ---------- UI ----------
  return (
    <MainLayout loading={loading}>
      <Title prefix="Sell Out Report" />

      <Form layout="vertical" form={form} onValuesChange={onValuesChange}>
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
                  allowClear
                  disabled={isSaleLocked}
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item
                label="Sales"
                name="sales_id"
                tooltip="เลือก Sales หลังจากเลือก Area"
              >
                <Select
                  placeholder="Select Sales"
                  options={sales}
                  allowClear={!isSaleRoleLocked}
                  disabled={!selectedArea || isSaleRoleLocked}
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
                  options={dealers}
                  allowClear
                  disabled={!selectedSales}
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item label="Year" name="year">
                <Select
                  placeholder="Select year"
                  options={yearList}
                  allowClear={false}
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

            <ExportSellOutExcelButton
              text="Export Excel"
              fileName={buildSellOutReportFileName(form, {
                areaList,
                sales,
                dealers,
              })}
              getPayload={async () => {
                const v = form.getFieldsValue();
                const rawYear = v.year ?? defaultYear ?? dayjs().year();
                const year = String(rawYear);
                return {
                  year,
                  area_id: v.area_id ?? "",
                  user_id: v.sales_id ?? "",
                  dealer_id: v.dealer_id ?? "",
                  sub_dealer_id: v.sub_dealer_id ?? "",
                };
              }}
              requestData={(payload) =>
                useServiceAPI.get(paths.pathReportSellOut, payload)
              }
            />
          </div>
        </BoxPrimary>
      </Form>

      <div className="flex items-center gap-2 mb-2">
        <span>Show</span>
        <Select
          value={pageSize}
          onChange={(v) => setPageSize(v)}
          options={[5, 10, 15, 20].map((n) => ({ value: n, label: n }))}
          style={{ width: 80 }}
        />
        <span>entries</span>
      </div>

      <BoxPrimary>
        <TableCustomComponent
          header={header}
          dataSource={data}
          pagination={false}
          pageSize={pageSize}
          loading={tableLoading}
          scroll
          scrollX
          scrollY
          rowHeight={56}
          extraY={230}
          footer={footer}
        />
        <div className="text-sm text-[#6b7280] mt-2">
          Showing 1 to {Math.min(pageSize, data.length)} of {data.length} entries
        </div>
      </BoxPrimary>
    </MainLayout>
  );
}