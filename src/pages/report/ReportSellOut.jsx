// src/pages/report/ReportSellOut.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Form, Row, Col, Select, DatePicker, InputNumber, Table } from "antd";
import MainLayout from "../../layouts/MainLayout";
import Title from "../../components/title/Title";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import DynamicButton from "../../components/button/DynamicButton";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import dayjs from "dayjs";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";

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

export default function ReportSellOut() {
  const [form] = Form.useForm();
  const [loading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Filter options (ใช้ mock ไปก่อน — ถ้าต้องดึงจาก API ค่อยต่อเพิ่ม)
  const areaOptions = [
    { value: 1, label: "Area 1" },
    { value: 2, label: "Area 2" },
  ];
  const salesOptions = [
    { value: 101, label: "Chainarong Jitsawaeng" },
    { value: 102, label: "Supakorn N." },
  ];
  const dealerOptions = [
    { value: 201, label: "Permudomphan Chemi Ltd. Part." },
    { value: 202, label: "V K Fertilizer Ltd. Part." },
  ];

  // Table data + page size (ใช้คุมความสูงของตาราง)
  const [data, setData] = useState([]); // จะมาจาก API
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
      const c = i % 2 === 0 ? GREEN_B : GREEN_A; // สลับสีตามภาพตัวอย่าง
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

  // ---------- helpers ----------
  const buildPayload = () => {
    const v = form.getFieldsValue();
    const year = v.month ? String(dayjs(v.month).year()) : String(dayjs().year());
    return {
      year,                         // "2025"
      area_id: v.area_id ?? "",     // อนุญาตส่ง "" ตามสเปค
      user_id: v.sales_id ?? "",
      dealer_id: v.dealer_id ?? "",
      sub_dealer_id: v.sub_dealer_id ?? "",
    };
  };

  const mapApiToRows = (apiData = []) => {
    // โครงสร้าง API: data = [{ group_id, group_name, months: { "1":{...}, ..., "12":{...} }, totals: {...} }]
    return apiData.map((g, idx) => {
      const row = {
        key: g.group_id || idx + 1,
        sub_dealer_name: g.group_name || "All",
      };
      // ใส่ค่า 12 เดือน
      for (let i = 1; i <= 12; i++) {
        const mObj = g.months?.[String(i)] || g.months?.[i] || {};
        const mName = monthsEN[i - 1]; // Jan..Dec
        row[`${mName}_last_stock`]   = Number(mObj.last)    || 0;
        row[`${mName}_sell_in`]      = Number(mObj.in)      || 0;
        row[`${mName}_current_stock`]= Number(mObj.current) || 0;
        row[`${mName}_sell_out`]     = Number(mObj.out)     || 0;
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
    } finally {
      setTableLoading(false);
    }
  };

  // ----- first load with defaults -----
  useEffect(() => {
    // ค่า default: ปี = ปีปัจจุบัน, ตัวกรองอื่นว่าง
    form.setFieldsValue({
      month: dayjs(), // ใช้สำหรับเลือกปี
      area_id: undefined,
      sales_id: undefined,
      dealer_id: undefined,
      sub_dealer_id: undefined,
    });
    fetchSellOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----- actions -----
  const handleSearch = async () => {
    await fetchSellOut();
  };

  const handleClear = () => {
    form.resetFields(["area_id", "sales_id", "dealer_id", "sub_dealer_id", "month"]);
    form.setFieldsValue({ month: dayjs() });
    fetchSellOut();
  };

  return (
    <MainLayout loading={loading}>
      <Title prefix="Sell Out Report" />

      <Form layout="vertical" form={form}>
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">
            <Col md={6}>
              <Form.Item label="Area" name="area_id">
                <Select placeholder="Select Area" options={areaOptions} allowClear />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item label="Sales" name="sales_id">
                <Select placeholder="Select Sales" options={salesOptions} allowClear />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item label="Dealer" name="dealer_id">
                <Select placeholder="Select Dealer" options={dealerOptions} allowClear />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item label="Month (for year)" name="month" initialValue={dayjs()}>
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
