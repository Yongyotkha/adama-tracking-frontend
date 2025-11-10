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

const nf = (v) => `${parseInt(v || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// mock rows
const buildMockRows = () =>
  PRODUCTS.map((p, i) => {
    const row = { key: i + 1, productName: p.name, packSize: p.pack };
    const baseVal = {
      "Jan.": 1000, "Feb.": 1000, "Mar.": 1000,
      "Apr.": 1000, May: 500, "Jun.": 500,
      Jul: 500, "Aug.": 500, "Sept.": 500,
      "Oct.": 500, "Nov.": 500, "Dec.": 500,
    };
    const baseQty = 1000, basePoint = 500, baseCamp = 500;

    Object.entries(baseVal).forEach(([m, val]) => {
      const bump =
        p.name.startsWith("Apopo") && (m === "Aug." || m === "Sept.") ? 800 :
        p.name.startsWith("Atranex 90WG") ? 1500 : 0;
      row[`${m}|value`] = val + bump;
      row[`${m}|qty`] = baseQty;
      row[`${m}|point`] = basePoint;
      row[`${m}|camp`] = baseCamp;
    });

    if (p.name === "Bla-S") {
      [
        "Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul","Aug.","Sept.","Oct.","Nov.","Dec.",
      ].forEach((m) => {
        row[`${m}|value`] = 7250;
        row[`${m}|qty`] = baseQty;
        row[`${m}|point`] = basePoint;
        row[`${m}|camp`] = baseCamp;
      });
    }
    if (p.name === "Bumper P") { row["Jan.|value"] = 500; row["Feb.|value"] = 100; }
    if (p.name === "Hamper") {
      const set = (m, v) => (row[`${m}|value`] = v);
      set("Jan.", 2000); set("Feb.", 2000); set("Mar.", 2000);
      set("Apr.", 2000); set("May", 2000); set("Jun.", 2000);
      set("Jul", 1300); set("Aug.", 1000); set("Sept.", 1000);
      set("Oct.", 1000); set("Nov.", 1300); set("Dec.", 1400);
    }
    return row;
  });

export default function SaleHistoryReport() {
  const [loading, setLoading] = useState(false);
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => setDataRows(buildMockRows()), []);

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

  // cascade filter
  const handleFilterCascade = async (changedValues, allValues) => {
    if ("sale_id" in changedValues) {
      const saleId = changedValues.sale_id;
      form.setFieldsValue({ dealer_id: undefined, sub_dealer_id: undefined });
      setSubDealerList([]);
      if (saleId) {
        try {
          const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, { user_id: saleId });
          setDealerList((res?.data || []).map((d) => ({ value: d.id, label: d.name })));
        } catch { setDealerList([]); }
      } else setDealerList([]);
    }
    if ("dealer_id" in changedValues) {
      const saleId = allValues.sale_id || "";
      const dealerId = changedValues.dealer_id;
      form.setFieldsValue({ sub_dealer_id: undefined });
      if (dealerId) {
        try {
          const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
            user_id: saleId, dealer_id: dealerId,
          });
          setSubDealerList((res?.data || []).map((s) => ({
            value: s.sub_dealer_id, label: s.sub_dealer_name,
          })));
        } catch { setSubDealerList([]); }
      } else setSubDealerList([]);
    }
  };

  const handleSearch = () => { setLoading(true); setTimeout(() => setLoading(false), 300); };
  const handleClear = () => { form.resetFields(); setDealerList([]); setSubDealerList([]); };

  // ----- quarter totals (Value only) -----
  const quarterTotalsValueOnly = useMemo(() => {
    const monthSumValue = (m) => dataRows.reduce((s, r) => s + (r[`${m}|value`] || 0), 0);
    return QUARTER_MONTHS.map((q) => ({
      id: q.id,
      total: q.months.reduce((acc, m) => acc + monthSumValue(m), 0),
    }));
  }, [dataRows]);

  // header styling (make total-row white)
  const applyHeaderStyle = (cols) =>
    cols.map((col, idx) => {
      const bg = idx % 2 === 0 ? "#00783F" : "#009845";
      const styleKids = (kids, pbg) =>
        (kids || []).map((c) => {
          const isWhite = String(c.key || "").startsWith("totalRow");
          return {
            ...c,
            onHeaderCell: () => ({
              style: {
                backgroundColor: isWhite ? "#ffffff" : (c.key === "monthRoot" ? "#00783F" : pbg),
                color: isWhite ? "#333" : "white",
                fontWeight: "bold",
                textAlign: "center",
              },
            }),
            ...(c.children ? { children: styleKids(c.children, pbg) } : {}),
          };
        });
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

  // ----- columns: เพิ่ม white row ใต้ Quarter แล้วค่อยเป็น Month เหมือนเดิม -----
  const baseColumns = useMemo(() => {
    // ฝั่งซ้าย (Quarter -> Total row (white) -> Month -> 2 คอลัมน์ซ้าย)
    const left = {
      title: "Quarter",
      children: [
        {
          title: "Total (Value)",
          key: "totalRow-left", // จะถูกทำให้พื้นหลังขาว
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
        },
      ],
    };

    // ตัวช่วยสร้างคอลัมน์ Quarter สำหรับ metric
    const makeQuarter = (metricKey, metricLabel, withWhiteTotal) =>
      QUARTER_MONTHS.map((q, qi) => ({
        title: q.name,
        key: `${q.id}_${metricKey}`,
        children: [
          // แถวสีขาว (ถ้าเป็น metric 'value' จะโชว์ยอดรวม, metric อื่นทำแถวขาวว่างเพื่อจัดบรรทัดให้เท่ากัน)
          {
            title: withWhiteTotal ? (
              <InputNumber
                readOnly
                className="w-full"
                value={quarterTotalsValueOnly.find((t) => t.id === q.id)?.total || 0}
                formatter={nf}
              />
            ) : (
              <div style={{ height: 0 }} />
            ),
            key: `totalRow-${q.id}-${metricKey}`,
            children: q.months.map((m) => ({
              title: (
                <div className="flex flex-col items-center">
                  <div>{m}</div>
                  <small>{metricLabel}</small>
                </div>
              ),
              dataIndex: `${m}|${metricKey}`,
              width: 140,
              align: "right",
              render: (v) => <InputNumber className="w-full" readOnly value={v || 0} formatter={nf} />,
            })),
          },
        ],
      }));

    // เฉพาะ Value ให้มีแถวสีขาวพร้อมตัวเลข / ที่เหลือทำแถวขาวเปล่าเพื่อไม่เสีย layout
    const colsValue  = makeQuarter("value",  METRICS[0].label, true);
    const colsQty    = makeQuarter("qty",    METRICS[1].label, false);
    const colsPoint  = makeQuarter("point",  METRICS[2].label, false);
    const colsCamp   = makeQuarter("camp",   METRICS[3].label, false);

    return [left, ...colsValue, ...colsQty, ...colsPoint, ...colsCamp];
  }, [quarterTotalsValueOnly]);

  const columns = useMemo(() => applyHeaderStyle(baseColumns), [baseColumns]);

  // footer รวมทั้งหมด (เหมือนเดิม)
  const footer = useMemo(() => {
    const metricOrder = ["value", "qty", "point", "camp"];
    const allDataIndexes = metricOrder.flatMap((metric) =>
      QUARTER_MONTHS.flatMap((q) => q.months.map((m) => `${m}|${metric}`))
    );
    return () => (
      <Table.Summary fixed>
        <Table.Summary.Row className="bg-[#978B87]">
          <Table.Summary.Cell index={0}><b>Total</b></Table.Summary.Cell>
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

      <Form form={form} layout="vertical" onValuesChange={handleFilterCascade}>
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">
            <Col md={6}><Form.Item label="Sales" name="sale_id">
              <Select placeholder="Select Sales" options={saleList} allowClear />
            </Form.Item></Col>
            <Col md={6}><Form.Item label="Dealer" name="dealer_id">
              <Select placeholder="Select Dealer" options={dealerList} allowClear />
            </Form.Item></Col>
            <Col md={6}><Form.Item label="Sub Dealer" name="sub_dealer_id">
              <Select placeholder="Select Sub Dealer" options={subDealerList} allowClear />
            </Form.Item></Col>
            <Col md={3}><Form.Item label="Year" name="year_code" initialValue={YEARS[0]}>
              <Select placeholder="Select Year" options={yearOptions} allowClear />
            </Form.Item></Col>
            <Col md={3}><Form.Item label="Product" name="product_name">
              <Select placeholder="Select Product" options={productOptions} allowClear />
            </Form.Item></Col>
          </Row>

          <div className="flex justify-end gap-4 px-4 pt-5">
            <DynamicButton onClick={handleSearch} name="btn-search" text="Search"
              iconSrc="/img/icons/search.png" className="text-white px-4 py-3 rounded-[4px] bg-[#7DB41E]" />
            <DynamicButton onClick={handleClear} name="btn-clear" text="Clear"
              iconSrc="/img/icons/trash.png" className="text-white px-4 py-3 rounded-[4px] bg-[#B6AEAB]" />
          </div>
        </BoxPrimary>
      </Form>

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
          // ไม่ต้องใส่ title แล้ว เพราะทำแถวสีขาวไว้ใน header แล้ว
        />
      </BoxPrimary>
    </MainLayout>
  );
}
