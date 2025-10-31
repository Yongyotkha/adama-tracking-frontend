// src/pages/report/ReportSellOutBySales.jsx
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

const makeMockRows = (n = 10, year = dayjs().year()) => {
  const names = [
    "Sales Pending (Central)",
    "Sales Pending (North)",
    "Sales Pending (East)",
    "Sales Pending (West)",
    "Sales Pending (Northeast)",
  ];
  const rows = [];
  for (let i = 0; i < n; i++) {
    const base = names[i % names.length] + (i >= names.length ? ` #${Math.floor(i / names.length)}` : "");
    const row = { key: i + 1, sales_name: base };
    monthsEN.forEach((m, mIdx) => {
      const a = ((i + 3) % 7) + 3 + (mIdx % 4);
      const b = (i + mIdx) % 5;
      const cs = Math.max(a + b - ((i + mIdx) % 4), 0);
      const so = a + b - cs;
      row[`${m}_last_stock`] = a;
      row[`${m}_sell_in`] = b;
      row[`${m}_current_stock`] = cs;
      row[`${m}_sell_out`] = so;
    });
    rows.push(row);
  }
  return rows;
};

export default function ReportSellOutBySales() {
  const [form] = Form.useForm();
  const [loading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const areaList = [
    { value: 1, label: "Area 1" },
    { value: 2, label: "Area 2" },
  ];

  const [data, setData] = useState(makeMockRows(10));
  const [pageSize, setPageSize] = useState(5); // ใช้คุมความสูงของตาราง (scrollY auto)

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
          title: "Sales",
          dataIndex: "sales_name",
          fixed: "left",
          width: 220,
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
            <InputNumber className="w-full" readOnly value={Number(val) || 0} formatter={fmt} />
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
          <Table.Summary.Cell index={0}><b>Total</b></Table.Summary.Cell>
          {monthsEN.flatMap((m, mi) =>
            subCols.map((sc, si) => {
              const k = `${m}_${sc.key}`;
              return (
                <Table.Summary.Cell key={k} index={mi * 10 + si + 1} align="right">
                  <InputNumber className="w-full" readOnly value={sum(k)} formatter={fmt} style={{ backgroundColor: "white" }} />
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
      const rows = makeMockRows(10, y).map((r) => ({
        ...r,
        ...(v.area_id ? { Jan_sell_in: r.Jan_sell_in + (v.area_id % 2) } : {}),
      }));
      setData(rows);
    } finally {
      setTableLoading(false);
    }
  };

  const handleClear = () => {
    form.resetFields(["area_id", "month"]);
    setData(makeMockRows(10));
  };

  return (
    <MainLayout loading={loading}>
      <Title prefix="Sell Out Report By Sales" />

      <Form layout="vertical" form={form}>
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">
            <Col md={6}>
              <Form.Item label="Area" name="area_id">
                <Select placeholder="Area 1" options={areaList} allowClear />
              </Form.Item>
            </Col>
            <Col md={6}>
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
          pagination={false}         // ใช้ scrollY จาก component
          pageSize={pageSize}        // จำนวนแถวที่อยากแสดงให้เห็นโดยไม่ต้องสกอร์
          loading={tableLoading}
          scroll                      // เปิด scroll
          scrollX                     // แนวนอน auto
          scrollY                     // ให้คำนวณอัตโนมัติจาก pageSize
          rowHeight={56}              // สูง/แถว
          extraY={230}                // buffer สำหรับหัว 2 ชั้น + summary
          footer={footer}
        />

        <div className="text-sm text-[#6b7280] mt-2">
          Showing 1 to {Math.min(pageSize, data.length)} of {data.length} entries
        </div>
      </BoxPrimary>
    </MainLayout>
  );
}
