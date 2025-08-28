import React, { useContext, useEffect, useMemo, useState } from "react";
import { Form, Input, DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../../components/table/TableComponent";
import ActionButton from "../../../../components/button/ActionButton";

import useServiceAPI from "../../../../services/corsService"; // พร้อมต่อ API
import { paths } from "../../../../services/CorsPath";        // พร้อมต่อ API
import { AuthContext } from "../../../../contexts/AuthContext";

/* ---------------- MOCK DATA (ตามดีไซน์) ---------------- */
const MOCK_DETAIL = {
  id: "TP-20250526-0001",
  sub_dealer_name: "บ้านธาราเกษตร 11",
  customer_name: "Piyanuch Puttisukniran",
  contact_number: "081-9496301",
  date: "2025-05-26",
  status_code: "PREPARE",
  status_name: "Prepare",
  shipping_address:
    "เชียร์ รังสิต 99 หมู่ที่ 8 ถ. พหลโยธิน ตำบลคูคต อำเภอลำลูกกา ปทุมธานี 12130 ไทย",
  items: [
    {
      reward_code: "RW00000001",
      category: "อิเล็กทรอนิกส์",
      reward_name: "พัดลม (14 นิ้ว)",
      qty: 1,
      cost: 790,
    },
  ],
  // ค่าเริ่มต้นส่วนล่าง
  send_by: "mail", // mail | courier | pickup
  send_date: "2025-05-06",
  remark: "",
};
/* ------------------------------------------------------ */

const SEND_BY_OPTIONS = [
  { value: "mail", label: "Mail/Shipping" },
  { value: "courier", label: "Courier" },
  { value: "pickup", label: "Self Pickup" },
];

export default function TransportationDetail() {
  const { mode } = useParams(); // 'view' | 'prepare'
  const isView = String(mode || "view").toLowerCase() === "view";
  const isPrepare = String(mode || "view").toLowerCase() === "prepare";

  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(MOCK_DETAIL);
  const [formTop] = Form.useForm();     // ฟอร์มส่วนบน (อ่านอย่างเดียว)
  const [formBottom] = Form.useForm();  // ฟอร์มส่วนล่าง (แก้ไข/บันทึก)

  /* ------------ ตารางรายการของรางวัล ------------ */
  const columns = useMemo(
    () => [
      { title: "Reward Code", dataIndex: "reward_code", align: "left" },
      { title: "Category", dataIndex: "category", align: "left" },
      { title: "Reward Name", dataIndex: "reward_name", align: "left" },
      { title: "QTY (Pcs)", dataIndex: "qty", align: "right", width: 100 },
      { title: "Cost (THB)", dataIndex: "cost", align: "right", width: 120 },
    ],
    []
  );

  /* ------------ เติมค่าให้ฟอร์ม ------------ */
  const fillForms = (data) => {
    formTop.setFieldsValue({
      sub_dealer_name: data.sub_dealer_name || "-",
      customer_name: data.customer_name || "-",
      contact_number: data.contact_number || "-",
      date: data.date ? dayjs(data.date).format("YYYY-MM-DD") : "-",
      status_name: data.status_name || "-",
      shipping_address: data.shipping_address || "-",
    });

    formBottom.setFieldsValue({
      send_by: data.send_by ?? "mail",
      send_date: data.send_date ? dayjs(data.send_date) : null,
      remark: data.remark ?? "",
    });
  };

  /* ------------ โหลดรายละเอียด (พร้อมต่อ API) ------------ */
  const loadDetail = async () => {
    setLoading(true);
    const requestId = location?.state?.id || MOCK_DETAIL.id;

    // ใช้ MOCK ก่อน
    setDetail(MOCK_DETAIL);
    fillForms(MOCK_DETAIL);
    setLoading(false);
    return;

    /* เมื่อมี API: ลบ return ด้านบน แล้วใช้โค้ดนี้
    try {
      const res = await useServiceAPI.get(paths.pathTransportationDetail, { id: requestId });
      if (res?.status === 200) {
        const d = res.data?.data || {};
        const mapped = {
          id: d.id,
          sub_dealer_name: d.sub_dealer_name,
          customer_name: d.customer_name,
          contact_number: d.contact_number,
          date: d.request_date,
          status_code: d.status_code,
          status_name: d.status_name,
          shipping_address: d.shipping_address,
          items: (d.items || []).map((i) => ({
            reward_code: i.reward_code,
            category: i.category_name,
            reward_name: i.reward_name,
            qty: i.qty,
            cost: i.cost,
          })),
          send_by: d.send_by,      // mail | courier | pickup
          send_date: d.send_date,  // YYYY-MM-DD
          remark: d.remark || "",
        };
        setDetail(mapped);
        fillForms(mapped);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Load failed", ["ไม่สามารถโหลดรายละเอียดได้"]);
    } finally {
      setLoading(false);
    }
    */
  };

  /* ------------ บันทึก (พร้อมต่อ API) ------------ */
  const handleSave = async () => {
    try {
      const values = await formBottom.validateFields();
      const payload = {
        id: detail.id,
        send_by: values.send_by,
        send_date: values.send_date ? dayjs(values.send_date).format("YYYY-MM-DD") : null,
        remark: values.remark || "",
      };

      // ใช้ mock แสดงผลก่อน
      console.log("SAVE payload", payload);
      showNotification("success", "Saved", ["บันทึกข้อมูลการขนส่งเรียบร้อย"]);
      navigate(-1);
      return;

      /* ต่อ API จริง:
      const res = await useServiceAPI.post(paths.pathTransportationUpdate, payload);
      if (res?.status === 200) {
        showNotification("success", "Saved", ["บันทึกข้อมูลเรียบร้อย"]);
        navigate(-1);
      } else {
        showNotification("error", "Save failed", [res?.data?.message || "Unknown error"]);
      }
      */
    } catch (_) {
      // invalid form → antd แสดงข้อความให้แล้ว
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Transportation Detail</div>

      {/* กล่องข้อมูลส่วนหัว */}
      <BoxPrimary>
        <Form form={formTop} layout="vertical" disabled>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Form.Item label="Sub Dealer Name" name="sub_dealer_name">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Customer Name" name="customer_name">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Contact Number" name="contact_number">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Date" name="date">
              <Input disabled />
            </Form.Item>

            <Form.Item className="lg:col-span-3" label="Shipping Address" name="shipping_address">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Status" name="status_name">
              <Input disabled />
            </Form.Item>
          </div>
        </Form>
      </BoxPrimary>

      {/* ตารางรายละเอียดของรางวัล */}
      <BoxPrimary>
        <TableComponent header={columns} dataSource={detail.items || []} pagination={false} />
      </BoxPrimary>

      {/* ฟอร์มเตรียมส่ง (Send By / Send Date / Remark) */}
      <BoxPrimary>
        <Form form={formBottom} layout="vertical" disabled={isView}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Form.Item
              label="Send By"
              name="send_by"
              rules={[{ required: true, message: "Please select send by" }]}
            >
              <Select
                options={SEND_BY_OPTIONS}
                placeholder="Select"
                allowClear={false}
                disabled={isView}
              />
            </Form.Item>

            <Form.Item
              label="Send Date"
              name="send_date"
              rules={[{ required: true, message: "Please select send date" }]}
            >
              <DatePicker className="w-full" disabled={isView} />
            </Form.Item>

            <Form.Item label="Remark" name="remark">
              <Input placeholder="Enter" disabled={isView} />
            </Form.Item>
          </div>
        </Form>
      </BoxPrimary>

      {/* ปุ่ม */}
      <div className="flex justify-end gap-3 mt-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        {!isView && (
          <ActionButton mode="save" text="Save" onClick={handleSave} />
        )}
      </div>
    </MainLayout>
  );
}
