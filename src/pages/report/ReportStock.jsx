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
  const { showNotification } = useContext(AuthContext) || {};
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // masters
  const [areaList, setAreaList] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [yearOptions, setYearOptions] = useState([]); // << ใช้ master year

  // watch
  const selectedArea = Form.useWatch("area_id", form);
  const selectedSale = Form.useWatch("sale_id", form);
  const selectedDealer = Form.useWatch("dealer_id", form);

  // data
  const [dataSource, setDataSource] = useState([]);

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
            value={displayZero(val, null)}   // ส่ง null ให้ InputNumber ว่าง
            formatter={formatterZeroAsDash}  // หรืออยากให้เป็น "" ก็เปลี่ยนใน formatter
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
            value={displayZero(val, null)}   // ส่ง null ให้ InputNumber ว่าง
            formatter={formatterZeroAsDash}  // หรืออยากให้เป็น "" ก็เปลี่ยนใน formatter
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
            value={displayZero(val, null)}   // ส่ง null ให้ InputNumber ว่าง
            formatter={formatterZeroAsDash}  // หรืออยากให้เป็น "" ก็เปลี่ยนใน formatter
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
            value={displayZero(val, null)}   // ส่ง null ให้ InputNumber ว่าง
            formatter={formatterZeroAsDash}  // หรืออยากให้เป็น "" ก็เปลี่ยนใน formatter
          />
        ),
      },
    ],
    []
  );

  // ✅ Footer: ใช้ตัวแปร total_* จาก API โดยตรง (Total (THB))
  const footer = useMemo(() => {
    const safeNum = (v) => Number(String(v || 0).replace(/,/g, "")) || 0;

    // mapping: columnKey -> field total_* ใน data
    const totalKeyByColumn = {
      last_stock: "total_last",
      sell_in: "total_in",
      current_stock: "total_current",
      sell_out: "total_out",
    };

    const sumByTotalKey = (totalKey) =>
      (dataSource || []).reduce(
        (acc, r) => acc + safeNum(r[totalKey]),
        0
      );

    const totals = {
      last_stock: sumByTotalKey(totalKeyByColumn.last_stock),
      sell_in: sumByTotalKey(totalKeyByColumn.sell_in),
      current_stock: sumByTotalKey(totalKeyByColumn.current_stock),
      sell_out: sumByTotalKey(totalKeyByColumn.sell_out),
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
  }, [dataSource]);

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
        setAreaList(areaRaw.map((x) => ({ value: x.id, label: x.name })));

        // Year from master
        const yearRaw = Array.isArray(yearRes?.data) ? yearRes.data : [];
        const yearOpts = yearRaw.map((y) => {
          const yc = getYearCodeFrom(y);
          return { value: yc, label: yc };
        });
        setYearOptions(yearOpts);

        // set default filters
        const now = dayjs();
        const firstYear = yearOpts[0]?.value ?? now.year();
        form.setFieldsValue({
          area_id: undefined,
          sale_id: undefined,
          dealer_id: undefined,
          sub_dealer_id: undefined,
          month: now.month() + 1, // 1-12
          year: firstYear,
        });

        // first fetch
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
    const areaId = form.getFieldValue("area_id");
    if (!areaId) {
      setSalesList([]);
      setDealerList([]);
      setSubDealerList([]);
      form.resetFields(["sale_id", "dealer_id", "sub_dealer_id"]);
      return;
    }
    (async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterSaleReport, {
          area_id: areaId,
        });
        const list = Array.isArray(res?.data) ? res.data : [];
        setSalesList(
          list.map((x) => ({ value: Number(x.id), label: x.name }))
        );
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
  }, [form.getFieldValue("area_id")]);

  // Cascade: Sales → Dealer
  useEffect(() => {
    const saleId = form.getFieldValue("sale_id");
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
  }, [form.getFieldValue("sale_id")]);

  // Cascade: Dealer → SubDealer
  useEffect(() => {
    const saleId = form.getFieldValue("sale_id");
    const dealerId = form.getFieldValue("dealer_id");
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
  }, [form.getFieldValue("dealer_id")]);

  // --------- API call ---------
  const buildPayload = () => {
    const v = form.getFieldsValue();
    const now = dayjs();
    const year = v.year || now.year();
    const month = v.month || now.month() + 1;
    return {
      date: `${year}-${String(month).padStart(2, "0")}`, // YYYY-MM
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
      const items = res?.data || [];

      const rows = items.map((it, idx) => ({
        key: it.product_id ?? idx,
        product_name: `${it.product_name}${it.product_size ? ` (${it.product_size})` : ""
          }`,

        // qty (ctn)
        last_stock: Number(it.last) || 0,
        sell_in: Number(it.in) || 0,
        current_stock: Number(it.current) || 0,
        sell_out: Number(it.out) || 0,

        // ✅ total ใหม่ จาก backend (THB)
        total_last: Number(String(it.total_last || 0).replace(/,/g, "")) || 0,
        total_in: Number(String(it.total_in || 0).replace(/,/g, "")) || 0,
        total_current:
          Number(String(it.total_current || 0).replace(/,/g, "")) || 0,
        total_out: Number(String(it.total_out || 0).replace(/,/g, "")) || 0,

        // unit price (ถ้าจะใช้ต่อ)
        unit_convert_value: parseFloat(
          String(it.unit_convert_value || "0").replace(/,/g, "")
        ),
      }));

      setDataSource(rows);
    } catch (e) {
      console.error(e);
      setDataSource([]);
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

    const defaultYear = pickLatestYearCode(yearOptions);

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

  const displayZero = (val, emptyText = "-") => {
    const n = Number(val);
    if (!Number.isFinite(n) || n === 0) return emptyText; // 0 / null / undefined / NaN
    return n;
  };

  const formatterZeroAsDash = (v) => {
    const n = Number(String(v ?? "").replace(/,/g, ""));
    if (!Number.isFinite(n) || n === 0) return "-";
    return `${parseInt(n)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };


  return (
    <MainLayout loading={loading}>
      <Title prefix="Stock Report" />

      {/* Filters */}
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

            {/* แยก Month / Year */}
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
                  options={yearOptions} // << ใช้ master year
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

      {/* Table — ไม่มี pagination แล้ว */}
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
