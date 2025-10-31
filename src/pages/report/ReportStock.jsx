import React, { useContext, useEffect, useMemo, useState } from "react";
import { Form, Row, Col, Select, DatePicker, InputNumber, Table } from "antd";
import MainLayout from "../../layouts/MainLayout";
import Title from "../../components/title/Title";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import DynamicButton from "../../components/button/DynamicButton";
import TableComponent from "../../components/table/TableComponent"; // ✅ ใช้คอมโพเนนต์ที่ให้มา

// ถ้ามี AuthContext สำหรับ notify ก็ใช้ได้เลย (ไม่บังคับ)
import { AuthContext } from "../../contexts/AuthContext";

const toComma = (n) =>
  `${parseInt(Number(n) || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// -------------------- Mock helpers --------------------
const mockFetchStock = async ({ page, pageSize, filters }) => {
  // สร้าง mock 40 แถว เพื่อเดโมการแบ่งหน้า
  const base = [
    "Bumper P 490",
    "Super K 25-7-7",
    "Green X 16-16-8",
    "Ultra N 46-0-0",
    "Root Plus 15-15-15",
    "Max P 12-24-12",
    "Grow 13-13-21",
    "Power K 0-0-60",
    "Bio Shield",
    "CalMag Pro",
  ];
  const all = Array.from({ length: 40 }, (_, i) => {
    const name = base[i % base.length];
    const ls = (i % 7) + 3;
    const si = i % 5 === 0 ? 0 : (i % 5) + 1;
    const cs = Math.max(ls + si - ((i % 4) + 1), 0);
    const so = (ls + si) - cs;
    return {
      key: i + 1,
      product_name: name,
      last_stock: ls,
      sell_in: si,
      current_stock: cs,
      sell_out: so,
    };
  });

  // สมมติ filter ตัดให้ดูผล (เช่น มี dealer)
  const filtered = all.filter((r) => {
    let ok = true;
    if (filters?.dealer_id) ok = ok && r.product_name.toLowerCase().includes("p");
    if (filters?.sale_id) ok = ok && r.key % 2 === 0;
    return ok;
  });

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  // delay เล็กน้อย
  await new Promise((r) => setTimeout(r, 300));

  return { rows: pageRows, total };
};
// ------------------------------------------------------

export default function ReportStock() {
  const { showNotification } = useContext(AuthContext) || {};
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);      // page loading
  const [tableLoading, setTableLoading] = useState(false);

  // master dropdown (mock)
  const [areaList] = useState([
    { value: 1, label: "Area 1" },
    { value: 2, label: "Area 2" },
  ]);
  const [salesList] = useState([
    { value: 11, label: "Chainarong Jitsawaeng" },
    { value: 12, label: "Somchai Prasert" },
  ]);
  const [dealerList] = useState([
    { value: 21, label: "Kantar Co.,Ltd." },
    { value: 22, label: "Siam Agri" },
  ]);
  const [subDealerList, setSubDealerList] = useState([
    { value: 31, label: "กฤษณียมทรัพย์เกษตร" },
    { value: 32, label: "รุ่งเรืองการเกษตร" },
  ]);

  // table
  const [dataSource, setDataSource] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  // pagination + page size เหมือน "Show X entries"
  const [pageSize, setPageSize] = useState(5);
  const [current, setCurrent] = useState(1);

  const pagination = useMemo(
    () => ({
      current,
      pageSize,
      total: totalRecords,
      showSizeChanger: false, // เราคุมด้วย "Show X entries" ข้างบนแทน
    }),
    [current, pageSize, totalRecords]
  );

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
        title: "Last Stock",
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
          <InputNumber className="w-full" readOnly value={Number(val) || 0}
            formatter={(v) => toComma(v)} />
        ),
      },
      {
        title: "Sell In",
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
          <InputNumber className="w-full" readOnly value={Number(val) || 0}
            formatter={(v) => toComma(v)} />
        ),
      },
      {
        title: "Current Stock",
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
          <InputNumber className="w-full" readOnly value={Number(val) || 0}
            formatter={(v) => toComma(v)} />
        ),
      },
      {
        title: "Sell Out",
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
          <InputNumber className="w-full" readOnly value={Number(val) || 0}
            formatter={(v) => toComma(v)} />
        ),
      },
    ],
    []
  );

  const footer = useMemo(() => {
    const sum = (k) =>
      (dataSource || []).reduce((acc, r) => acc + (Number(r[k]) || 0), 0);

    const keys = ["last_stock", "sell_in", "current_stock", "sell_out"];

    // antd expects a function that returns <Table.Summary>*
    return () => (
      <Table.Summary fixed>
        <Table.Summary.Row className="bg-[#978B87]">
          <Table.Summary.Cell index={0}>
            <b>Total</b>
          </Table.Summary.Cell>

          {keys.map((k, i) => (
            <Table.Summary.Cell key={k} index={i + 1} align="right">
              <InputNumber
                className="w-full"
                readOnly
                value={sum(k)}
                formatter={(v) =>
                  `${parseInt(v || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                style={{ backgroundColor: "white" }}
              />
            </Table.Summary.Cell>
          ))}
        </Table.Summary.Row>
      </Table.Summary>
    );
  }, [dataSource]);


  // load mock ครั้งแรก
  useEffect(() => {
    setLoading(true);
    // เซ็ตค่าตั้งต้นตามรูป
    form.setFieldsValue({
      area_id: 1,
      sale_id: 11,
      dealer_id: 21,
      sub_dealer_id: 31,
    });
    setLoading(false);
  }, [form]);

  // fetch ตามหน้า/ขนาดหน้า
  const doFetch = async () => {
    setTableLoading(true);
    try {
      const f = form.getFieldsValue();
      const { rows, total } = await mockFetchStock({
        page: current,
        pageSize,
        filters: f,
      });
      setDataSource(rows);
      setTotalRecords(total);
    } catch (e) {
      console.error(e);
      showNotification?.("error", "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, pageSize]);

  const handleSearch = () => {
    setCurrent(1);
    doFetch();
  };

  const handleClear = () => {
    form.resetFields(["area_id", "sale_id", "dealer_id", "sub_dealer_id", "month"]);
    setCurrent(1);
    doFetch();
  };

  const handleTableChange = (pg) => {
    setCurrent(pg.current);
  };

  // dealer -> sub dealer (mock)
  const onValuesChange = (changed) => {
    if (Object.prototype.hasOwnProperty.call(changed, "dealer_id")) {
      const id = changed.dealer_id;
      if (!id) {
        setSubDealerList([]);
        form.setFieldsValue({ sub_dealer_id: undefined });
      } else {
        // mock filter
        setSubDealerList([
          { value: 31, label: "กฤษณียมทรัพย์เกษตร" },
          { value: 32, label: "สหกรณ์เกษตรรวมใจ" },
        ]);
      }
    }
  };

  return (
    <MainLayout loading={loading}>
      <Title prefix="Stock Report" />

      {/* ฟิลเตอร์ */}
      <Form form={form} layout="vertical" onValuesChange={onValuesChange}>
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">
            <Col md={6}>
              <Form.Item label="Area" name="area_id">
                <Select placeholder="Select Area" options={areaList} allowClear />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item label="Sales" name="sale_id">
                <Select placeholder="Select Sales" options={salesList} allowClear />
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
            <Col md={6}>
              <Form.Item label="Month" name="month">
                <DatePicker picker="month" style={{ width: "100%" }} placeholder="Select month" />
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

      {/* ส่วนควบคุม page size แบบ "Show X entries" */}
      <div className="flex items-center gap-2 mb-2">
        <span>Show</span>
        <Select
          value={pageSize}
          onChange={(v) => {
            setPageSize(v);
            setCurrent(1);
          }}
          options={[5, 10, 20, 50].map((n) => ({ value: n, label: n }))}
          style={{ width: 80 }}
        />
        <span>entries</span>
      </div>

      {/* ตาราง */}
      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll // เปิด scroll X อัตโนมัติ (component จะกำหนดเอง)
          footer={footer}
        />
        {/* ข้อความสรุป "Showing x to y of z entries" */}
        <div className="text-sm text-[#6b7280] mt-2">
          {(() => {
            if (totalRecords === 0) return "Showing 0 to 0 of 0 entries";
            const start = (current - 1) * pageSize + 1;
            const end = Math.min(current * pageSize, totalRecords);
            return `Showing ${start} to ${end} of ${totalRecords} entries`;
          })()}
        </div>
      </BoxPrimary>
    </MainLayout>
  );
}
