// src/pages/report/ReportStock.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Form, Row, Col, Select, DatePicker, InputNumber, Table } from "antd";
import dayjs from "dayjs";
import MainLayout from "../../layouts/MainLayout";
import Title from "../../components/title/Title";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import DynamicButton from "../../components/button/DynamicButton";
import TableComponent from "../../components/table/TableComponent";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";

const toComma = (n) =>
  `${parseInt(Number(n) || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export default function ReportStock() {
  const { showNotification } = useContext(AuthContext) || {};
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  //masters (ดึงจาก API)
  const [areaList, setAreaList] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);

  // watch สำหรับควบคุม disable แบบ step
  const selectedArea = Form.useWatch("area_id", form);
  const selectedSale = Form.useWatch("sale_id", form);
  const selectedDealer = Form.useWatch("dealer_id", form);

  // เก็บข้อมูลเต็มจาก API แล้วตัดหน้าเอง
  const [fullData, setFullData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  // pagination + page size
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);

  const pagination = useMemo(
    () => ({
      current,
      pageSize,
      total: totalRecords,
      showSizeChanger: false,
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
          <InputNumber className="w-full" readOnly value={Number(val) || 0} formatter={toComma} />
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
          <InputNumber className="w-full" readOnly value={Number(val) || 0} formatter={toComma} />
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
          <InputNumber className="w-full" readOnly value={Number(val) || 0} formatter={toComma} />
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
          <InputNumber className="w-full" readOnly value={Number(val) || 0} formatter={toComma} />
        ),
      },
    ],
    []
  );

  const footer = useMemo(() => {
    const sum = (k) =>
      (dataSource || []).reduce((acc, r) => acc + (Number(r[k]) || 0), 0);

    const keys = ["last_stock", "sell_in", "current_stock", "sell_out"];

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

  // ---------- Masters: โหลด Area ตอนเริ่ม ----------
  useEffect(() => {
    const loadAreas = async () => {
      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathMasterAreas);
        const list = Array.isArray(res?.data) ? res.data : [];
        setAreaList(list.map((x) => ({ value: x.id, label: x.name })));
      } catch (e) {
        setAreaList([]);
        showNotification?.("error", "โหลด Area ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    loadAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // set default filter & first fetch
  useEffect(() => {
    setLoading(true);
    form.setFieldsValue({
      area_id: undefined,          // เริ่มต้นว่าง เพื่อบังคับเลือกเป็น Step
      sale_id: undefined,          // ส่งไปเป็น user_id
      dealer_id: undefined,
      sub_dealer_id: undefined,
      month: dayjs("2025-10-01"),
    });
    setLoading(false);
    fetchStock(); // โหลดรวมทั้งหมด (ไม่มีตัวกรอง)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // เปลี่ยน Area → โหลด Sales
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
        const res = await useServiceAPI.get(paths.pathMasterSaleReport, { area_id: areaId });
        const list = Array.isArray(res?.data) ? res.data : [];
        setSalesList(list.map((x) => ({ value: Number(x.user_id), label: x.user_name })));
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

  // เปลี่ยน Sales → โหลด Dealer
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
        const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, { user_id: saleId });
        const list = Array.isArray(res?.data) ? res.data : [];
        setDealerList(list.map((x) => ({ value: Number(x.id), label: x.name })));
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

  // เปลี่ยน Dealer → โหลด Sub Dealer (paths.pathMasterSubDealerAll)
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
        setSubDealerList(list.map((s) => ({ value: s.sub_dealer_id, label: s.sub_dealer_name })));
        form.resetFields(["sub_dealer_id"]);
      } catch {
        setSubDealerList([]);
        form.resetFields(["sub_dealer_id"]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.getFieldValue("dealer_id")]);

  // page slice จาก fullData
  useEffect(() => {
    const start = (current - 1) * pageSize;
    setDataSource(fullData.slice(start, start + pageSize));
  }, [fullData, current, pageSize]);

  // --------- API call: pathReportStock ----------
  const buildPayload = () => {
    const v = form.getFieldsValue();
    return {
      date: v.month ? dayjs(v.month).format("YYYY-MM") : dayjs().format("YYYY-MM"),
      area_id: v.area_id ?? "",
      user_id: v.sale_id || "", // mapping sale_id -> user_id
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
        product_name: `${it.product_name}${it.product_size ? ` (${it.product_size})` : ""}`,
        last_stock: Number(it.last) || 0,
        sell_in: Number(it.in) || 0,
        current_stock: Number(it.current) || 0,
        sell_out: Number(it.out) || 0,
      }));

      setFullData(rows);
      setTotalRecords(rows.length);
      setCurrent(1); // กลับหน้า 1 เมื่อค้นหาใหม่
    } catch (e) {
      console.error(e);
      setFullData([]);
      setTotalRecords(0);
      showNotification?.("error", "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setTableLoading(false);
    }
  };

  const handleSearch = () => {
    // บังคับลำดับการเลือก: ห้ามเลือก Sales/Dealer/Sub Dealer ถ้ายังไม่ผ่าน step ก่อน
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
    setCurrent(1);
    fetchStock();
  };

  const handleClear = () => {
    form.resetFields(["area_id", "sale_id", "dealer_id", "sub_dealer_id", "month"]);
    setSalesList([]);
    setDealerList([]);
    setSubDealerList([]);
    form.setFieldsValue({ month: dayjs() });
    setCurrent(1);
    fetchStock();
  };

  const handleTableChange = (pg) => setCurrent(pg.current);

  // UI reset ฝั่งฟอร์ม (กันกรณีเซ็ตค่าเอง)
  const onValuesChange = (changed) => {
    if (Object.prototype.hasOwnProperty.call(changed, "area_id")) {
      form.setFieldsValue({ sale_id: undefined, dealer_id: undefined, sub_dealer_id: undefined });
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
                <Select placeholder="Select Area" options={areaList} allowClear />
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

      {/* Show X entries */}
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

      {/* Table */}
      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll
          footer={footer}
        />
        <div className="text-sm text-[#6b7280] mt-2">
          {totalRecords === 0
            ? "Showing 0 to 0 of 0 entries"
            : (() => {
                const start = (current - 1) * pageSize + 1;
                const end = Math.min(current * pageSize, totalRecords);
                return `Showing ${start} to ${end} of ${totalRecords} entries`;
              })()}
        </div>
      </BoxPrimary>
    </MainLayout>
  );
}
