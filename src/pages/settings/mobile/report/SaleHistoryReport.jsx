// src/pages/report/sales/SaleHistoryReport.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Form, Row, Col, Select, InputNumber, Table } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Title from "../../../../components/title/Title";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import DynamicButton from "../../../../components/button/DynamicButton";
import TableCustomComponent from "../../../../components/table/TableCustomComponent";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";

// ---------------- Quarter / Months ----------------
const QUARTER_MONTHS = [
  { id: "Q1", name: "Quarter 1", months: ["Jan.", "Feb.", "Mar."] },
  { id: "Q2", name: "Quarter 2", months: ["Apr.", "May", "Jun."] },
  { id: "Q3", name: "Quarter 3", months: ["Jul", "Aug.", "Sept."] },
  { id: "Q4", name: "Quarter 4", months: ["Oct.", "Nov.", "Dec."] },
];

// ---------------- 4 Metrics (เรียงตามที่ขอ) ----------------
const METRICS = [
  { key: "value", label: "Value (THB)" },
  { key: "qty", label: "QTY (KG)" },
  { key: "point", label: "Point" },
  { key: "camp", label: "Point Campaign" },
];

// ---------------- Mock masters (ตัวอย่างข้อมูล) ----------------
const PRODUCTS = [
  { name: "Ossinate 15%SL", pack: "1Kg." },
  { name: "Apopo 20%SE", pack: "1Lt." },
  { name: "Atranex 90WG", pack: "5Kg." },
  { name: "Baloric 320EC", pack: "0.5Lt." },
  { name: "Bla-S", pack: "0.25Lt." },
  { name: "Bumper P", pack: "0.5Lt." },
  { name: "Custodia", pack: "1Lt" },
  { name: "Damatin 5%WG", pack: "20Lt" },
  { name: "Durivo 63SC", pack: "1Lt" },
  { name: "Hamper", pack: "1Lt" },
];

const YEARS = ["2026", "2025", "2024"];
const yearOptions = YEARS.map((y) => ({ value: y, label: y }));
const productOptions = PRODUCTS.map((p) => ({ value: p.name, label: p.name }));

// ------------- helpers / mock -------------
const nf = (v) =>
  `${parseInt(v || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// ทำค่า “Value / QTY / Point / Campaign” ต่อเดือน (mock)
const buildMockRows = () =>
  PRODUCTS.map((p, i) => {
    const row = {
      key: i + 1,
      productName: p.name,
      packSize: p.pack,
    };

    const baseVal = {
      "Jan.": 1000,
      "Feb.": 1000,
      "Mar.": 1000,
      "Apr.": 1000,
      May: 500,
      "Jun.": 500,
      Jul: 500,
      "Aug.": 500,
      "Sept.": 500,
      "Oct.": 500,
      "Nov.": 500,
      "Dec.": 500,
    };

    const baseQty = 1000;
    const basePoint = 500;
    const baseCamp = 500;

    Object.entries(baseVal).forEach(([m, val]) => {
      const bump =
        p.name.startsWith("Apopo") && (m === "Aug." || m === "Sept.")
          ? 800
          : p.name.startsWith("Atranex 90WG")
          ? 1500
          : 0;

      row[`${m}|value`] = val + bump;
      row[`${m}|qty`] = baseQty;
      row[`${m}|point`] = basePoint;
      row[`${m}|camp`] = baseCamp;
    });

    if (p.name === "Bla-S") {
      [
        "Jan.",
        "Feb.",
        "Mar.",
        "Apr.",
        "May",
        "Jun.",
        "Jul",
        "Aug.",
        "Sept.",
        "Oct.",
        "Nov.",
        "Dec.",
      ].forEach((m) => {
        row[`${m}|value`] = 7250;
        row[`${m}|qty`] = baseQty;
        row[`${m}|point`] = basePoint;
        row[`${m}|camp`] = baseCamp;
      });
    }

    if (p.name === "Bumper P") {
      row["Jan.|value"] = 500;
      row["Feb.|value"] = 100;
    }

    if (p.name === "Hamper") {
      const set = (m, v) => (row[`${m}|value`] = v);
      set("Jan.", 2000);
      set("Feb.", 2000);
      set("Mar.", 2000);
      set("Apr.", 2000);
      set("May", 2000);
      set("Jun.", 2000);
      set("Jul", 1300);
      set("Aug.", 1000);
      set("Sept.", 1000);
      set("Oct.", 1000);
      set("Nov.", 1300);
      set("Dec.", 1400);
    }

    return row;
  });

export default function SaleHistoryReport() {
  const [loading, setLoading] = useState(false);

  // masters from API
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);

  // table rows
  const [dataRows, setDataRows] = useState([]);

  // filter form
  const [form] = Form.useForm();

  // init rows (mock)
  useEffect(() => setDataRows(buildMockRows()), []);

  // โหลด Sales master
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const sale = await useServiceAPI.get(paths.pathMasterSaleDropdown, {});
        setSaleList((sale?.data || []).map((s) => ({ value: s.id, label: s.name })));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------- Filter handlers ----------
  const handleFilterCascade = async (changedValues, allValues) => {
    // เมื่อเลือก Sale -> โหลด Dealer
    if ("sale_id" in changedValues) {
      const saleId = changedValues.sale_id;
      form.setFieldsValue({ dealer_id: undefined, sub_dealer_id: undefined });
      setSubDealerList([]);
      if (saleId) {
        try {
          const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
            user_id: saleId,
          });
          const dealers = (res?.data || []).map((d) => ({ value: d.id, label: d.name }));
          setDealerList(dealers);
        } catch {
          setDealerList([]);
        }
      } else {
        setDealerList([]);
      }
    }

    // เมื่อเลือก Dealer -> โหลด Sub-dealer
    if ("dealer_id" in changedValues) {
      const saleId = allValues.sale_id || "";
      const dealerId = changedValues.dealer_id;
      form.setFieldsValue({ sub_dealer_id: undefined });
      if (dealerId) {
        try {
          const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
            user_id: saleId,
            dealer_id: dealerId,
          });
          const subs = (res?.data || []).map((s) => ({
            value: s.sub_dealer_id,
            label: s.sub_dealer_name,
          }));
          setSubDealerList(subs);
        } catch {
          setSubDealerList([]);
        }
      } else {
        setSubDealerList([]);
      }
    }
  };

  const handleSearch = () => {
    // ตรงนี้ผูกกับ API จริงได้ตาม payload ที่ต้องการจาก form.getFieldsValue()
    setLoading(true);
    // demo: แค่หน่วง
    setTimeout(() => setLoading(false), 300);
  };

  const handleClear = () => {
    form.resetFields();
    setDealerList([]);
    setSubDealerList([]);
  };

  // ---------- header style ----------
  const applyHeaderStyle = (cols) =>
    cols.map((col, idx) => {
      const bg = idx % 2 === 0 ? "#00783F" : "#009845";
      const styleKids = (kids, pbg) =>
        (kids || []).map((c) => ({
          ...c,
          onHeaderCell: () => ({
            style: {
              backgroundColor: c.key === "monthRoot" ? "#00783F" : pbg,
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          ...(c.children ? { children: styleKids(c.children, pbg) } : {}),
        }));
      return {
        ...col,
        onHeaderCell: () => ({
          style: {
            backgroundColor: bg,
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          },
        }),
        ...(col.children ? { children: styleKids(col.children, bg) } : {}),
      };
    });

  // ---------- columns: (Q1..Q4) x 4 metrics ----------
  const baseColumns = useMemo(() => {
    const left = {
      title: "Quarter",
      children: [
        {
          title: "Month",
          key: "monthRoot",
          children: [
            { title: "Product Name", dataIndex: "productName", width: 180, fixed: "left" },
            { title: "Pack Size", dataIndex: "packSize", width: 120, fixed: "left" },
          ],
        },
      ],
    };

    const makeMetricQuarterColumns = (metric) =>
      QUARTER_MONTHS.map((q) => ({
        title: q.name,
        key: `${q.id}_${metric.key}`,
        children: q.months.map((m) => ({
          title: (
            <div className="flex flex-col items-center">
              <div>{m}</div>
              <small>{metric.label}</small>
            </div>
          ),
          dataIndex: `${m}|${metric.key}`,
          width: 140,
          align: "right",
          render: (v) => (
            <InputNumber className="w-full" readOnly value={v || 0} formatter={nf} />
          ),
        })),
      }));

    const metricColumns = [
      ...makeMetricQuarterColumns(METRICS[0]), // Value Q1-4
      ...makeMetricQuarterColumns(METRICS[1]), // QTY Q1-4
      ...makeMetricQuarterColumns(METRICS[2]), // Point Q1-4
      ...makeMetricQuarterColumns(METRICS[3]), // Campaign Q1-4
    ];

    return [left, ...metricColumns];
  }, []);

  const columns = useMemo(() => applyHeaderStyle(baseColumns), [baseColumns]);

  // ---------- Title: รวมเฉพาะ Value ----------
  const quarterTotalsValueOnly = useMemo(() => {
    const monthSumValue = (m) =>
      dataRows.reduce((s, r) => s + (r[`${m}|value`] || 0), 0);
    return QUARTER_MONTHS.map((q) => ({
      id: q.id,
      total: q.months.reduce((acc, m) => acc + monthSumValue(m), 0),
    }));
  }, [dataRows]);

  const tableTitle = useMemo(
    () => () => (
      <div className="w-full">
        <div className="grid" style={{ gridTemplateColumns: "300px repeat(4, 1fr)" }}>
          <div className="px-2 py-1 bg-[#00783F] text-white font-bold rounded-tl-md">
            Total (Value)
          </div>
          {quarterTotalsValueOnly.map((qt, i) => (
            <div
              key={qt.id}
              className="px-2 py-1 flex justify-end items-center"
              style={{
                background: i % 2 === 0 ? "#009845" : "#00783F",
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
              }}
            >
              <InputNumber readOnly value={qt.total} formatter={nf} className="!w-[180px]" />
            </div>
          ))}
        </div>
      </div>
    ),
    [quarterTotalsValueOnly]
  );

  // ---------- Footer: รวมทุกคอลัมน์ที่แสดง ----------
  const footer = useMemo(() => {
    const metricOrder = ["value", "qty", "point", "camp"];
    const allDataIndexes = metricOrder.flatMap((metric) =>
      QUARTER_MONTHS.flatMap((q) => q.months.map((m) => `${m}|${metric}`))
    );

    return () => (
      <Table.Summary fixed>
        <Table.Summary.Row className="bg-[#978B87]">
          <Table.Summary.Cell index={0}>
            <b>Total (THB)</b>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={1} />
          {allDataIndexes.map((dx) => (
            <Table.Summary.Cell key={`sum-${dx}`}>
              <InputNumber
                className="w-full"
                readOnly
                value={dataRows.reduce((acc, r) => acc + (r[dx] || 0), 0)}
                formatter={nf}
              />
            </Table.Summary.Cell>
          ))}
        </Table.Summary.Row>
      </Table.Summary>
    );
  }, [dataRows]);

  return (
    <MainLayout loading={loading}>
      <Title prefix="Sales History Report" />

      {/* ===== Filter แบบ Box + Row/Col (เหมือน ReportSaleByMonth) ===== */}
      <Form form={form} layout="vertical" onValuesChange={handleFilterCascade}>
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">
            <Col md={6}>
              <Form.Item label="Sales" name="sale_id">
                <Select placeholder="Select Sales" options={saleList} allowClear />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item label="Dealer" name="dealer_id">
                <Select placeholder="Select Dealer" options={dealerList} allowClear />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item label="Sub Dealer" name="sub_dealer_id">
                <Select placeholder="Select Sub Dealer" options={subDealerList} allowClear />
              </Form.Item>
            </Col>
            <Col md={3}>
              <Form.Item label="Year" name="year_code" initialValue={YEARS[0]}>
                <Select placeholder="Select Year" options={yearOptions} allowClear />
              </Form.Item>
            </Col>
            <Col md={3}>
              <Form.Item label="Product" name="product_name">
                <Select placeholder="Select Product" options={productOptions} allowClear />
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
          </div>
        </BoxPrimary>
      </Form>
      {/* ============================================================= */}

      <BoxPrimary>
        <div className="mb-2 text-[#00783F] font-semibold">History</div>

        <TableCustomComponent
          header={columns}
          dataSource={dataRows}
          pagination={false}
          loading={loading}
          scrollX
          scrollY={false}
          footer={footer}
          title={tableTitle}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
