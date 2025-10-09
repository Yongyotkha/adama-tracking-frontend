import React, { useEffect, useMemo, useState } from "react";
import { Form, Row, Col, Select, InputNumber, Table } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Title from "../../../../components/title/Title";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import DynamicButton from "../../../../components/button/DynamicButton";
import TableCustomComponent from "../../../../components/table/TableCustomComponent";

// -------------------- MOCK MASTERS --------------------
const MOCK_SALES = [
  { value: "S001", label: "Amorn Sriworakul" },
  { value: "S002", label: "Warin Panjit" },
];

const MOCK_DEALERS_BY_SALE = {
  S001: [
    { value: "D001", label: "Adul Karn Kaset Co.,Ltd." },
    { value: "D002", label: "Green Farm Co.,Ltd." },
  ],
  S002: [{ value: "D003", label: "Agri Mart Co.,Ltd." }],
};

const MOCK_SUB_DEALERS_BY_DEALER = {
  D001: [
    { value: "SD001", label: "ศูนย์พันธุ์พืช 1" },
    { value: "SD002", label: "ศูนย์พันธุ์พืช 2" },
  ],
  D002: [{ value: "SD003", label: "โชคเกษตร" }],
  D003: [],
};

const MOCK_PRODUCTS = [
  { value: "Ossinate 15%SL", label: "Ossinate 15%SL" },
  { value: "Apopo 20%SE", label: "Apopo 20%SE" },
  { value: "Atraxen 90WG", label: "Atraxen 90WG" },
];

const YEARS = ["2026", "2025", "2024"];

// -------------------- MOCK TABLE (เดือนใน Quarter) --------------------
const MOCK_ITEMS = [
  {
    id: "Q1",
    name: "Quarter 1",
    product: [
      // ต่อ productName ใน dataSource
      {
        product_name: "Ossinate 15%SL",
        workplan_qty: 1000,
        rolling_qty: 900,
        actual_qty: 850,
        workplan_value: 1200000,
        rolling_value: 1080000,
        actual_value: 1020000,
      },
      {
        product_name: "Apopo 20%SE",
        workplan_qty: 2000,
        rolling_qty: 1800,
        actual_qty: 1750,
        workplan_value: 2400000,
        rolling_value: 2160000,
        actual_value: 2100000,
      },
      {
        product_name: "Atraxen 90WG",
        workplan_qty: 2500,
        rolling_qty: 2400,
        actual_qty: 2350,
        workplan_value: 3000000,
        rolling_value: 2880000,
        actual_value: 2820000,
      },
    ],
  },
  {
    id: "Q2",
    name: "Quarter 2",
    product: [
      {
        product_name: "Ossinate 15%SL",
        workplan_qty: 1100,
        rolling_qty: 1000,
        actual_qty: 950,
        workplan_value: 1320000,
        rolling_value: 1200000,
        actual_value: 1140000,
      },
      {
        product_name: "Apopo 20%SE",
        workplan_qty: 2100,
        rolling_qty: 1900,
        actual_qty: 1850,
        workplan_value: 2520000,
        rolling_value: 2280000,
        actual_value: 2220000,
      },
      {
        product_name: "Atraxen 90WG",
        workplan_qty: 2600,
        rolling_qty: 2450,
        actual_qty: 2400,
        workplan_value: 3120000,
        rolling_value: 2940000,
        actual_value: 2880000,
      },
    ],
  },
  {
    id: "Q3",
    name: "Quarter 3",
    product: [
      {
        product_name: "Ossinate 15%SL",
        workplan_qty: 900,
        rolling_qty: 880,
        actual_qty: 820,
        workplan_value: 1080000,
        rolling_value: 1056000,
        actual_value: 984000,
      },
      {
        product_name: "Apopo 20%SE",
        workplan_qty: 1500,
        rolling_qty: 1450,
        actual_qty: 1400,
        workplan_value: 1800000,
        rolling_value: 1740000,
        actual_value: 1680000,
      },
      {
        product_name: "Atraxen 90WG",
        workplan_qty: 2200,
        rolling_qty: 2150,
        actual_qty: 2100,
        workplan_value: 2640000,
        rolling_value: 2580000,
        actual_value: 2520000,
      },
    ],
  },
  {
    id: "Q4",
    name: "Quarter 4",
    product: [
      {
        product_name: "Ossinate 15%SL",
        workplan_qty: 1200,
        rolling_qty: 1100,
        actual_qty: 1000,
        workplan_value: 1440000,
        rolling_value: 1320000,
        actual_value: 1200000,
      },
      {
        product_name: "Apopo 20%SE",
        workplan_qty: 2300,
        rolling_qty: 2200,
        actual_qty: 2100,
        workplan_value: 2760000,
        rolling_value: 2640000,
        actual_value: 2520000,
      },
      {
        product_name: "Atraxen 90WG",
        workplan_qty: 2700,
        rolling_qty: 2600,
        actual_qty: 2550,
        workplan_value: 3240000,
        rolling_value: 3120000,
        actual_value: 3060000,
      },
    ],
  },
];

// -------------------- UTIL --------------------
const nf = (v) => `${parseInt(v || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export default function SaleHistoryReport() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // masters
  const [sales, setSales] = useState(MOCK_SALES);
  const [dealers, setDealers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [products] = useState(MOCK_PRODUCTS);
  const [years] = useState(YEARS);

  // data table
  const [itemColumn, setItemColumn] = useState(MOCK_ITEMS);
  const [dataSource, setDataSource] = useState([]);

  // initial
  useEffect(() => {
    // mock rows (จาก products)
    const rows = products.map((p, idx) => ({
      key: idx + 1,
      productName: p.value,
    }));
    setDataSource(rows);
    form.setFieldsValue({ year_code: years[0] });
  }, []);

  // filter dependencies
  const handleSaleChange = (saleId) => {
    form.setFieldsValue({ dealer_id: undefined, sub_dealer_id: undefined });
    setSubs([]);
    setDealers(MOCK_DEALERS_BY_SALE[saleId] || []);
  };

  const handleDealerChange = (dealerId) => {
    form.setFieldsValue({ sub_dealer_id: undefined });
    setSubs(MOCK_SUB_DEALERS_BY_DEALER[dealerId] || []);
  };

  const handleSearch = () => {
    // mock: ไม่เรียก API แค่ถือโอกาสรีเฟรชคอลัมน์/ข้อมูล
    setLoading(true);
    setTimeout(() => {
      setItemColumn(MOCK_ITEMS); // สมมติได้คอลัมน์ตามปี/ฟิลเตอร์
      setLoading(false);
    }, 400);
  };

  // -------------------- columns --------------------
  const header = useMemo(() => {
    return [
      {
        title: "Quarter",
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
            title: "Product Name",
            dataIndex: "productName",
            key: "productName",
            fixed: "left",
            width: 180,
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
      ...itemColumn.map((q, i) => ({
        title: q.name,
        key: q.id,
        onHeaderCell: () => ({
          style: {
            backgroundColor: i % 2 === 1 ? "#00783F" : "#009845",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          },
        }),
        children: [
          {
            title: "Work Plan (KG)",
            width: 140,
            onHeaderCell: () => ({
              style: {
                backgroundColor: i % 2 === 1 ? "#00783F" : "#009845",
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              },
            }),
            render: (_, record) => {
              const d =
                q.product.find((p) => p.product_name === record.productName) ||
                {};
              return <InputNumber className="w-full" value={d.workplan_qty || 0} readOnly formatter={nf} />;
            },
          },
          {
            title: "Rolling Forecast (KG)",
            width: 160,
            onHeaderCell: () => ({
              style: {
                backgroundColor: "#7DB41E",
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              },
            }),
            render: (_, record) => {
              const d =
                q.product.find((p) => p.product_name === record.productName) ||
                {};
              return <InputNumber className="w-full" value={d.rolling_qty || 0} readOnly formatter={nf} />;
            },
          },
          {
            title: "Actual (KG)",
            width: 130,
            onHeaderCell: () => ({
              style: {
                backgroundColor: "#93CC23",
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              },
            }),
            render: (_, record) => {
              const d =
                q.product.find((p) => p.product_name === record.productName) ||
                {};
              return <InputNumber className="w-full" value={d.actual_qty || 0} readOnly formatter={nf} />;
            },
          },
          {
            title: "Work Plan (Value)",
            width: 160,
            onHeaderCell: () => ({
              style: {
                backgroundColor: i % 2 === 1 ? "#00783F" : "#009845",
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              },
            }),
            render: (_, record) => {
              const d =
                q.product.find((p) => p.product_name === record.productName) ||
                {};
              return (
                <InputNumber className="w-full" value={d.workplan_value || 0} readOnly formatter={nf} />
              );
            },
          },
          {
            title: "Rolling Forecast (Value)",
            width: 190,
            onHeaderCell: () => ({
              style: {
                backgroundColor: "#7DB41E",
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              },
            }),
            render: (_, record) => {
              const d =
                q.product.find((p) => p.product_name === record.productName) ||
                {};
              return (
                <InputNumber className="w-full" value={d.rolling_value || 0} readOnly formatter={nf} />
              );
            },
          },
          {
            title: "Actual (Value)",
            width: 150,
            onHeaderCell: () => ({
              style: {
                backgroundColor: "#93CC23",
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
              },
            }),
            render: (_, record) => {
              const d =
                q.product.find((p) => p.product_name === record.productName) ||
                {};
              return (
                <InputNumber className="w-full" value={d.actual_value || 0} readOnly formatter={nf} />
              );
            },
          },
        ],
      })),
    ];
  }, [itemColumn]);

  // footer summary
  const footer = useMemo(() => {
    const sums = itemColumn.map((q) => {
      const sum = (f) => q.product.reduce((acc, p) => acc + (p[f] || 0), 0);
      return {
        id: q.id,
        workplan_qty: sum("workplan_qty"),
        rolling_qty: sum("rolling_qty"),
        actual_qty: sum("actual_qty"),
        workplan_value: sum("workplan_value"),
        rolling_value: sum("rolling_value"),
        actual_value: sum("actual_value"),
      };
    });

    // eslint-disable-next-line react/display-name
    return () => (
      <Table.Summary fixed>
        <Table.Summary.Row className="bg-[#978B87]">
          <Table.Summary.Cell index={0}>
            <b>Total (THB)</b>
          </Table.Summary.Cell>
          {sums.map((m) => (
            <React.Fragment key={m.id}>
              <Table.Summary.Cell>
                <InputNumber className="w-full" readOnly value={m.workplan_qty} formatter={nf} />
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <InputNumber className="w-full" readOnly value={m.rolling_qty} formatter={nf} />
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <InputNumber className="w-full" readOnly value={m.actual_qty} formatter={nf} />
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <InputNumber className="w-full" readOnly value={m.workplan_value} formatter={nf} />
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <InputNumber className="w-full" readOnly value={m.rolling_value} formatter={nf} />
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                <InputNumber className="w-full" readOnly value={m.actual_value} formatter={nf} />
              </Table.Summary.Cell>
            </React.Fragment>
          ))}
        </Table.Summary.Row>
      </Table.Summary>
    );
  }, [itemColumn]);

  return (
    <MainLayout loading={loading}>
      <Title prefix="Sales History Report" />

      <Form form={form} layout="vertical">
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">
            <Col md={6}>
              <Form.Item label="Sales" name="sale_id">
                <Select
                  placeholder="Select Sales"
                  options={sales}
                  onChange={handleSaleChange}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item label="Dealer" name="dealer_id">
                <Select
                  placeholder="Select Dealer"
                  options={dealers}
                  onChange={handleDealerChange}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item label="Sub Dealer" name="sub_dealer_id">
                <Select placeholder="Select Sub Dealer" options={subs} allowClear />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item label="Farmer" name="farmer_id">
                <Select placeholder="Select Farmer" disabled allowClear />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item label="Year" name="year_code">
                <Select options={years.map((y) => ({ value: y, label: y }))} />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item label="Product" name="product_name">
                <Select placeholder="Select Product" options={products} allowClear />
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
              onClick={() => form.resetFields()}
              name="btn-clear"
              text="Clear"
              iconSrc="/img/icons/trash.png"
              className="text-white px-4 py-3 rounded-[4px] bg-[#B6AEAB]"
            />
          </div>
        </BoxPrimary>
      </Form>

      <BoxPrimary>
        <TableCustomComponent
          header={header}
          dataSource={dataSource}
          pagination={false}
          loading={loading}
          onChange={() => {}}
          scrollY={false}            // ❌ ปิดแนวตั้ง
          scrollX="max-content"      // ✅ เปิดแนวนอน
          footer={footer}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
