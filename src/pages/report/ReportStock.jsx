// src/pages/report/ReportStock.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Form, Row, Col, Select, InputNumber, Table } from "antd";
import dayjs from "dayjs";
import MainLayout from "../../layouts/MainLayout";
import Title from "../../components/title/Title";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import DynamicButton from "../../components/button/DynamicButton";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import ExportStockExcelButton from "../../components/export/ExportStockExcelButton";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const toComma = (n) =>
  `${parseInt(Number(n) || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// --- helpers for export file name ---
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

// ดึง year_code เป็น string เสมอ (ใช้ร่วมกับ master year)
const getYearCodeFrom = (y) => {
  if (y == null) return "";
  if (typeof y === "string" || typeof y === "number") return String(y);
  return y.year_code ?? y.code ?? y.value ?? y.label ?? y.name ?? y.year ?? "";
};

// เลือก “ปีล่าสุด” จากลิสต์ปี
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

const buildStockReportFileName = (
  form,
  { areaList, salesList, dealerList, subDealerList }
) => {
  const v = form.getFieldsValue();
  const now = dayjs();
  const year = v.year || now.year();
  const month = v.month || now.month() + 1; // 1-12
  const monthText = `${year}-${String(month).padStart(2, "0")}`;

  const area = getLabelFrom(areaList, v.area_id);
  const sale = getLabelFrom(salesList, v.sale_id);
  const dealer = getLabelFrom(dealerList, v.dealer_id);
  const subDealer = getLabelFrom(subDealerList, v.sub_dealer_id);

  const parts = [
    "Stock_Report",
    monthText,
    area && `Area_${slug(area)}`,
    sale && `Sales_${slug(sale)}`,
    dealer && `Dealer_${slug(dealer)}`,
    subDealer && `Sub_${slug(subDealer)}`,
  ].filter(Boolean);

  const ts = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD_HHmm");
  return `${parts.join("_")}_${ts}`;
};

// สร้าง options เดือน
const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export default function ReportStock() {
  const { showNotification, userInfo } = useContext(AuthContext);
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // masters
  const [areaList, setAreaList] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);

  // watch
  const selectedArea = Form.useWatch("area_id", form);
  const selectedSale = Form.useWatch("sale_id", form);
  const selectedDealer = Form.useWatch("dealer_id", form);

  // data
  const [dataSource, setDataSource] = useState([]);
  const [isSaleLocked, setIsSaleLocked] = useState(false);

  const [summary, setSummary] = useState({
    total_current: 0,
    total_last: 0,
    total_in: 0,
    total_out: 0,
  });

  // ✅ เก็บ Area ที่ “ตรงกับ userInfo” เพื่อใช้ disable option
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

  const displayZero = (val, emptyText = "-") => {
    const n = Number(val);
    if (!Number.isFinite(n) || n === 0) return emptyText;
    return n;
  };

  const formatterZeroAsDash = (v) => {
    const n = Number(String(v ?? "").replace(/,/g, ""));
    if (!Number.isFinite(n) || n === 0) return "-";
    return `${parseInt(n, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // columns
  const header = useMemo(
    () => [
      {
        title: "Product List",
        dataIndex: "product_name",
        key: "product_name",
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#00783F",
            color: "white",
            fontWeight: "bold",
            textAlign: "left",
          },
        }),
        render: (v) => <span className="font-medium">{v}</span>,
      },
      {
        title: "Last Stock (ctn)",
        dataIndex: "last_stock",
        key: "last_stock",
        align: "right",
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#00783F",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          },
        }),
        render: (val) => (
          <InputNumber
            className="w-full"
            readOnly
            value={displayZero(val, null)}
            formatter={formatterZeroAsDash}
          />
        ),
      },
      {
        title: "Sell In (ctn)",
        dataIndex: "sell_in",
        key: "sell_in",
        align: "right",
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#00783F",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          },
        }),
        render: (val) => (
          <InputNumber
            className="w-full"
            readOnly
            value={displayZero(val, null)}
            formatter={formatterZeroAsDash}
          />
        ),
      },
      {
        title: "Current Stock (ctn)",
        dataIndex: "current_stock",
        key: "current_stock",
        align: "right",
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#00783F",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          },
        }),
        render: (val) => (
          <InputNumber
            className="w-full"
            readOnly
            value={displayZero(val, null)}
            formatter={formatterZeroAsDash}
          />
        ),
      },
      {
        title: "Sell Out (ctn)",
        dataIndex: "sell_out",
        key: "sell_out",
        align: "right",
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#00783F",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          },
        }),
        render: (val) => (
          <InputNumber
            className="w-full"
            readOnly
            value={displayZero(val, null)}
            formatter={formatterZeroAsDash}
          />
        ),
      },
    ],
    []
  );

  // Footer
  const footer = useMemo(() => {
    const totals = {
      last_stock: summary?.total_last ?? 0,
      sell_in: summary?.total_in ?? 0,
      current_stock: summary?.total_current ?? 0,
      sell_out: summary?.total_out ?? 0,
    };

    const keys = ["last_stock", "sell_in", "current_stock", "sell_out"];

    return () => (
      <Table.Summary fixed>
        <Table.Summary.Row className="bg-[#978B87]">
          <Table.Summary.Cell index={0}>
            <b>Total (THB)</b>
          </Table.Summary.Cell>
          {keys.map((k, i) => (
            <Table.Summary.Cell key={k} index={i + 1} align="right">
              <InputNumber
                className="w-full"
                readOnly
                value={displayZero(totals[k], null)}
                formatter={formatterZeroAsDash}
                style={{ backgroundColor: "white" }}
              />
            </Table.Summary.Cell>
          ))}
        </Table.Summary.Row>
      </Table.Summary>
    );
  }, [summary]);

  // ---------- Masters (Area + Master Year) ----------
  useEffect(() => {
    (async () => {
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

        // Year from master
        const yearRaw = Array.isArray(yearRes?.data) ? yearRes.data : [];
        const yearOpts = yearRaw.map((y) => {
          const yc = getYearCodeFrom(y);
          return { value: yc, label: yc };
        });
        setYearOptions(yearOpts);

        const now = dayjs();
        const defaultYear = pickLatestYearCode(yearOpts) ?? now.year();

        // เก็บ area จาก userInfo
        const uArea = getLoginAreaId(userInfo);
        setActiveAreaId(uArea != null ? String(uArea) : null);

        // ถ้ามี area เดียว → auto select, ถ้ามีหลาย area → ไม่เลือก
        const defaultAreaId =
          Array.isArray(areaOpts) && areaOpts.length === 1
            ? areaOpts[0]?.value
            : undefined;

        form.setFieldsValue({
          area_id: defaultAreaId,
          sale_id: undefined,
          dealer_id: undefined,
          sub_dealer_id: undefined,
          month: now.month() + 1,
          year: defaultYear,
        });

        await fetchStock();
      } catch {
        setAreaList([]);
        setYearOptions([]);
        showNotification?.("error", "โหลดข้อมูล Master ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cascade: Area → Sales
  useEffect(() => {
    const areaId = selectedArea;
    if (!areaId) {
      setSalesList([]);
      setDealerList([]);
      setSubDealerList([]);
      form.resetFields(["sale_id", "dealer_id", "sub_dealer_id"]);
      return;
    }

    (async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterUserByArea, {
          area_id: areaId,
        });
        const list = Array.isArray(res?.data) ? res.data : [];
        setSalesList(list.map((x) => ({ value: Number(x.id), label: x.name })));
        setDealerList([]);
        setSubDealerList([]);
        form.resetFields(["sale_id", "dealer_id", "sub_dealer_id"]);
      } catch {
        setSalesList([]);
        setDealerList([]);
        setSubDealerList([]);
        form.resetFields(["sale_id", "dealer_id", "sub_dealer_id"]);
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

    if (!Array.isArray(salesList) || salesList.length === 0) {
      setIsSaleLocked(false);
      return;
    }

    const foundSale = salesList.find(
      (s) => String(s.value) === String(loginSaleId)
    );

    if (foundSale) {
      if (loginAreaId != null && String(selectedArea) !== String(loginAreaId)) {
        form.setFieldsValue({ area_id: loginAreaId });
        return;
      }

      form.setFieldsValue({
        sale_id: foundSale.value,
        dealer_id: undefined,
        sub_dealer_id: undefined,
      });
      setIsSaleLocked(true);
      fetchStock();
    } else {
      setIsSaleLocked(false);
    }
  }, [selectedArea, salesList, userInfo, form, isSaleRoleLocked]);

  // Cascade: Sales → Dealer
  useEffect(() => {
    const saleId = selectedSale;
    if (!saleId) {
      setDealerList([]);
      setSubDealerList([]);
      form.resetFields(["dealer_id", "sub_dealer_id"]);
      return;
    }

    (async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
          user_id: saleId,
        });
        const list = Array.isArray(res?.data) ? res.data : [];
        setDealerList(
          list.map((x) => ({ value: Number(x.id), label: x.name }))
        );
        setSubDealerList([]);
        form.resetFields(["dealer_id", "sub_dealer_id"]);
      } catch {
        setDealerList([]);
        setSubDealerList([]);
        form.resetFields(["dealer_id", "sub_dealer_id"]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSale]);

  // Cascade: Dealer → SubDealer
  useEffect(() => {
    const saleId = selectedSale;
    const dealerId = selectedDealer;
    if (!saleId || !dealerId) {
      setSubDealerList([]);
      form.resetFields(["sub_dealer_id"]);
      return;
    }

    (async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
          user_id: saleId,
          dealer_id: dealerId,
        });
        const list = Array.isArray(res?.data) ? res.data : [];
        setSubDealerList(
          list.map((s) => ({
            value: s.sub_dealer_id,
            label: s.sub_dealer_name,
          }))
        );
        form.resetFields(["sub_dealer_id"]);
      } catch {
        setSubDealerList([]);
        form.resetFields(["sub_dealer_id"]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSale, selectedDealer]);

  // --------- API call ---------
  const buildPayload = () => {
    const v = form.getFieldsValue();
    const now = dayjs();
    const year = v.year || now.year();
    const month = v.month || now.month() + 1;

    return {
      date: `${year}-${String(month).padStart(2, "0")}`,
      area_id: v.area_id ?? "",
      user_id: v.sale_id || "",
      dealer_id: v.dealer_id || "",
      sub_dealer_id: v.sub_dealer_id || "",
    };
  };

  const fetchStock = async () => {
    setTableLoading(true);
    try {
      const payload = buildPayload();
      const res = await useServiceAPI.get(paths.pathReportStock, payload);

      const items = Array.isArray(res?.data) ? res.data : [];
      const apiSummary = res?.summary || res?.data?.summary || null;

      setSummary({
        total_current:
          Number(String(apiSummary?.total_current ?? 0).replace(/,/g, "")) || 0,
        total_last:
          Number(String(apiSummary?.total_last ?? 0).replace(/,/g, "")) || 0,
        total_in:
          Number(String(apiSummary?.total_in ?? 0).replace(/,/g, "")) || 0,
        total_out:
          Number(String(apiSummary?.total_out ?? 0).replace(/,/g, "")) || 0,
      });

      const rows = items.map((it, idx) => ({
        key: it.product_id ?? idx,
        product_name: `${it.product_name}${
          it.product_size ? ` (${it.product_size})` : ""
        }`,
        last_stock: Number(it.last) || 0,
        sell_in: Number(it.in) || 0,
        current_stock: Number(it.current) || 0,
        sell_out: Number(it.out) || 0,
        total_last: Number(String(it.total_last || 0).replace(/,/g, "")) || 0,
        total_in: Number(String(it.total_in || 0).replace(/,/g, "")) || 0,
        total_current:
          Number(String(it.total_current || 0).replace(/,/g, "")) || 0,
        total_out: Number(String(it.total_out || 0).replace(/,/g, "")) || 0,
        unit_convert_value: parseFloat(
          String(it.unit_convert_value || "0").replace(/,/g, "")
        ),
      }));

      setDataSource(rows);
    } catch (e) {
      console.error(e);
      setDataSource([]);
      setSummary({
        total_current: 0,
        total_last: 0,
        total_in: 0,
        total_out: 0,
      });
      showNotification?.("error", "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setTableLoading(false);
    }
  };

  const handleSearch = () => {
    const v = form.getFieldsValue();

    if (v.sale_id && !v.area_id) {
      showNotification?.("warning", "กรุณาเลือก Area ก่อนเลือก Sales");
      return;
    }
    if (v.dealer_id && !v.sale_id) {
      showNotification?.("warning", "กรุณาเลือก Sales ก่อนเลือก Dealer");
      return;
    }
    if (v.sub_dealer_id && !v.dealer_id) {
      showNotification?.("warning", "กรุณาเลือก Dealer ก่อนเลือก Sub Dealer");
      return;
    }

    fetchStock();
  };

  const handleClear = () => {
    const now = dayjs();
    const defaultYear = pickLatestYearCode(yearOptions);

    if (isSaleLocked) {
      form.resetFields(["dealer_id", "sub_dealer_id", "month", "year"]);

      setSubDealerList([]);

      form.setFieldsValue({
        dealer_id: undefined,
        sub_dealer_id: undefined,
        month: now.month() + 1,
        year: defaultYear || now.year(),
      });

      fetchStock();
      return;
    }

    form.resetFields([
      "area_id",
      "sale_id",
      "dealer_id",
      "sub_dealer_id",
      "month",
      "year",
    ]);

    setSalesList([]);
    setDealerList([]);
    setSubDealerList([]);

    form.setFieldsValue({
      month: now.month() + 1,
      year: defaultYear || now.year(),
    });

    fetchStock();
  };

  const onValuesChange = (changed) => {
    if (Object.prototype.hasOwnProperty.call(changed, "area_id")) {
      form.setFieldsValue({
        sale_id: undefined,
        dealer_id: undefined,
        sub_dealer_id: undefined,
      });
    }
    if (Object.prototype.hasOwnProperty.call(changed, "sale_id")) {
      form.setFieldsValue({ dealer_id: undefined, sub_dealer_id: undefined });
    }
    if (Object.prototype.hasOwnProperty.call(changed, "dealer_id")) {
      form.setFieldsValue({ sub_dealer_id: undefined });
    }
  };

  return (
    <MainLayout loading={loading}>
      <Title prefix="Stock Report" />

      <Form form={form} layout="vertical" onValuesChange={onValuesChange}>
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
                name="sale_id"
                tooltip="เลือก Sales หลังจากเลือก Area"
              >
                <Select
                  placeholder="Select Sales"
                  options={salesList}
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
                  options={dealerList}
                  allowClear
                  disabled={!selectedSale}
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item
                label="Sub Dealer"
                name="sub_dealer_id"
                tooltip="เลือก Sub Dealer หลังจากเลือก Dealer"
              >
                <Select
                  placeholder="Select Sub Dealer"
                  options={subDealerList}
                  allowClear
                  disabled={!selectedDealer}
                />
              </Form.Item>
            </Col>

            <Col md={3}>
              <Form.Item label="Month" name="month">
                <Select
                  placeholder="Select month"
                  options={monthOptions}
                  allowClear={false}
                />
              </Form.Item>
            </Col>

            <Col md={3}>
              <Form.Item label="Year" name="year">
                <Select
                  placeholder="Select year"
                  options={yearOptions}
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
            <ExportStockExcelButton
              text="Export Excel"
              fileName={buildStockReportFileName(form, {
                areaList,
                salesList,
                dealerList,
                subDealerList,
              })}
              getPayload={async () => {
                const payload = buildPayload();
                return payload;
              }}
              requestData={(payload) =>
                useServiceAPI.get(paths.pathReportStock, payload)
              }
            />
          </div>
        </BoxPrimary>
      </Form>

      <BoxPrimary>
        <TableCustomComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={false}
          onChange={undefined}
          footer={footer}
        />
      </BoxPrimary>
    </MainLayout>
  );
}