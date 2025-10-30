// src/pages/report/ReportSellOutByDealer.jsx
import React, { useMemo, useState } from "react";
import { Form, Row, Col, Select, DatePicker, InputNumber, Table } from "antd";
import MainLayout from "../../layouts/MainLayout";
import Title from "../../components/title/Title";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import DynamicButton from "../../components/button/DynamicButton";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import dayjs from "dayjs";

const GREEN_A = "#00783F";
const GREEN_B = "#009845";

const monthsEN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const subCols = [
  { title: "Last Stock", key: "last_stock" },
  { title: "Sell In", key: "sell_in" },
  { title: "Current Stock", key: "current_stock" },
  { title: "Sell Out", key: "sell_out" },
];

const fmt = (n) => `${parseInt(Number(n) || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** สร้าง mock ข้อมูลสำหรับ Dealer (ครบ 12 เดือน) */
const makeMockDealerRows = (n = 10, seed = 0) => {
  const dealers = [
    "Permudomphan Chemi Ltd. Part.",
    "V K Fertilizer Ltd. Part.",
    "Kaset Center Co., Ltd.",
    "Agro Siam Co., Ltd.",
    "Green Farm Supply",
  ];
  const rows = [];
  for (let i = 0; i < n; i++) {
    const name = dealers[i % dealers.length] + (i >= dealers.length ? ` #${Math.floor(i / dealers.length)}` : "");
    const row = { key: i + 1, dealer_name: name };

    monthsEN.forEach((m, idx) => {
      // สร้างค่าจำลองที่ดูสมจริงหน่อย
      const base = (i + idx + seed) % 7;
      const lastStock = 4 + ((base + 1) % 4);
      const sellIn = (base + idx) % 5;
      const current = Math.max(lastStock + sellIn - ((i + idx) % 4), 0);
      const sellOut = lastStock + sellIn - current;

      row[`${m}_last_stock`] = lastStock;
      row[`${m}_sell_in`] = sellIn;
      row[`${m}_current_stock`] = current;
      row[`${m}_sell_out`] = sellOut;
    });
    rows.push(row);
  }
  return rows;
};

export default function ReportSellOutByDealer() {
  const [form] = Form.useForm();
  const [loading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Filter options (mock)
  const areaOptions = [
    { value: 1, label: "Area 1" },
    { value: 2, label: "Area 2" },
  ];
  const salesOptions = [
    { value: 101, label: "Chainarong Jitsawaeng" },
    { value: 102, label: "Supakorn N." },
  ];

  // Table data
  const [data, setData] = useState(makeMockDealerRows(10, 0));
  // “Show X entries” -> ใช้กำหนดความสูงตาราง (TableCustomComponent จะคำนวณ scrollY ให้อัตโนมัติ)
  const [pageSize, setPageSize] = useState(5);

  // ----- columns -----
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
          title: "Dealer",
          dataIndex: "dealer_name",
          fixed: "left",
          width: 260,
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

  // ----- footer summary -----
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
                <Table.Summary.Cell key={k} index={mi * 10 + si + 1} align="right">
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

  // ----- actions (mock) -----
  const handleSearch = async () => {
    setTableLoading(true);
    try {
      const v = form.getFieldsValue();
      const y = v.month ? dayjs(v.month).year() : dayjs().year();
      // ให้ค่าขยับตาม filter เล็กน้อยเพื่อเห็นเอฟเฟ็กต์
      const seed = (y % 7) + (v.area_id ? v.area_id : 0) + (v.sales_id ? v.sales_id % 5 : 0);
      setData(makeMockDealerRows(10, seed));
    } finally {
      setTableLoading(false);
    }
  };

  const handleClear = () => {
    form.resetFields(["area_id", "sales_id", "month"]);
    setData(makeMockDealerRows(10, 0));
  };

  return (
    <MainLayout loading={loading}>
      <Title prefix="Sell Out Report By Dealer" />

      <Form layout="vertical" form={form}>
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">
            <Col md={8}>
              <Form.Item label="Area" name="area_id">
                <Select placeholder="Select Area" options={areaOptions} allowClear />
              </Form.Item>
            </Col>
            <Col md={8}>
              <Form.Item label="Sales" name="sales_id">
                <Select placeholder="Select Sales" options={salesOptions} allowClear />
              </Form.Item>
            </Col>
            <Col md={8}>
              <Form.Item label="Month" name="month" initialValue={dayjs()}>
                <DatePicker picker="month" style={{ width: "100%" }} />
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

      {/* Show X entries */}
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
          pagination={false}      // ใช้ scrollY ตามจำนวนแถว
          pageSize={pageSize}
          loading={tableLoading}
          scroll                 // เปิด scroll
          scrollX                // แนวนอน auto
          scrollY                // คำนวณ y อัตโนมัติจาก pageSize
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
