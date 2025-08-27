import React, { useEffect, useMemo, useState, useContext } from "react";
import { Form, Input } from "antd";
import dayjs from "dayjs";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import ActionButton from "../../../../components/button/ActionButton";

import useServiceAPI from "../../../../services/corsService"; // ✅ พร้อมต่อ API
import { paths } from "../../../../services/CorsPath";        // ✅ พร้อมต่อ API
import { AuthContext } from "../../../../contexts/AuthContext";

// ---------------------- MOCK DATA (ใช้ชั่วคราว) ----------------------
const MOCK_DETAIL = {
  id: "REQ-20250526-0001",
  shop_name: "บ้านธาราเกษตร 11",
  customer_name: "Piyanuch Puttisukniran",
  contact_number: "081-9496301",
  date: "2025-05-26",
  stock: 10,
  status_code: "WAITING",
  status_name: "Waiting for Approve",
  approve_by: "-",
  reject_by: "-",
  items: [
    {
      reward_code: "RW00000001",
      category: "อิเล็กทรอนิกส์",
      reward_name: "พัดลม (14 นิ้ว)",
      qty: 1,
      cost: 790,
      point_redeem: 2000,
    },
  ],
  // สิทธิ์การทำงาน (mock)
  permission: {
    can_approve: true,
    can_send_purchase: true,
  },
};
// --------------------------------------------------------------------

export default function RedeemDetail() {
  const navigate = useNavigate();
  const { mode } = useParams(); // 'view' (กันอนาคต)
  const location = useLocation();
  const { showNotification } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(MOCK_DETAIL); // เริ่มด้วย mock
  const [form] = Form.useForm();

  const isView = String(mode || "view").toLowerCase() === "view";

  // ---------- Columns ของตารางรายการของรางวัล ----------
  const columns = useMemo(
    () => [
      { title: "Reward Code", dataIndex: "reward_code", align: "left" },
      { title: "Category", dataIndex: "category", align: "left" },
      { title: "Reward Name", dataIndex: "reward_name", align: "left" },
      { title: "QTY (Pcs)", dataIndex: "qty", align: "right", width: 100 },
      { title: "Cost (THB)", dataIndex: "cost", align: "right", width: 120 },
      {
        title: "Points Redeem",
        dataIndex: "point_redeem",
        align: "right",
        width: 140,
      },
    ],
    []
  );

  // ---------- แปลงสถานะเป็น Badge ----------
  const renderStatus = (name, bg = "gray", color = "white") => (
    <BadgeStatus text={name} bgColor={bg} textColor={color} />
  );

  // ---------- เติมค่าให้ฟอร์ม (read-only) ----------
  const fillForm = (data) => {
    form.setFieldsValue({
      shop_name: data.shop_name || "-",
      customer_name: data.customer_name || "-",
      contact_number: data.contact_number || "-",
      date: data.date ? dayjs(data.date).format("YYYY-MM-DD") : "-",
      stock: String(data.stock ?? "-"),
      status: data.status_name || "-",
      approve_by: data.approve_by || "-",
      reject_by: data.reject_by || "-",
    });
  };

  // ---------- โหลดรายละเอียด (พร้อมต่อ API) ----------
  const loadDetail = async () => {
    setLoading(true);

    // ถ้ามาจากหน้า List จะมี id ส่งผ่าน location.state.id
    const requestId = location?.state?.id || MOCK_DETAIL.id;

    // ----- ใช้ MOCK ก่อน -----
    setDetail(MOCK_DETAIL);
    fillForm(MOCK_DETAIL);
    setLoading(false);
    return;

    /* ⭐️ เมื่อมี API แล้ว: ลบโค้ด MOCK ข้างบน และใช้โค้ดด้านล่างแทน ⭐️

    try {
      const res = await useServiceAPI.get(paths.pathRedeemRequestDetail, { id: requestId });
      if (res?.status === 200) {
        // ปรับ mapping ให้ตรงกับ payload จริงของ backend
        const d = res.data?.data || {};
        const mapped = {
          id: d.id,
          shop_name: d.shop_name,
          customer_name: d.customer_name,
          contact_number: d.contact_number,
          date: d.request_date, // หรือ d.created_at
          stock: d.stock,
          status_code: d.status_code,
          status_name: d.status_name,
          approve_by: d.approve_by || "-",
          reject_by: d.reject_by || "-",
          items: (d.items || []).map((i) => ({
            reward_code: i.reward_code,
            category: i.category_name,
            reward_name: i.reward_name,
            qty: i.qty,
            cost: i.cost,
            point_redeem: i.point_redeem,
          })),
          permission: {
            can_approve: d.permission?.approve,
            can_send_purchase: d.permission?.send_purchase,
          },
        };

        setDetail(mapped);
        fillForm(mapped);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Load failed", "ไม่สามารถโหลดรายละเอียดได้");
    } finally {
      setLoading(false);
    }
    */
  };

  // ---------- Action Handlers (พร้อมต่อ API) ----------
  const handleApprove = async () => {
    // TODO: ต่อ API อนุมัติ
    // await useServiceAPI.post(paths.pathRedeemApprove, { id: detail.id })
    showNotification("success", "Approved", ["รายการถูกอนุมัติแล้ว"]);
  };

  const handleSendToPurchase = async () => {
    // TODO: ต่อ API ส่งข้อมูลไปฝ่ายจัดซื้อ
    // await useServiceAPI.post(paths.pathRedeemSendPurchase, { id: detail.id })
    showNotification("success", "Sent to Purchase", ["ส่งข้อมูลไปจัดซื้อเรียบร้อย"]);
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Redeem Reward Detail</div>

      {/* กล่องข้อมูลหัวข้อแรก */}
      <BoxPrimary>
        <Form form={form} layout="vertical" disabled>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Form.Item label="Shop Name" name="shop_name">
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

            <Form.Item label="Stock (Pcs)" name="stock">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Status" name="status">
              <Input
                disabled
                // addonAfter={renderStatus(detail.status_name)}
              />
            </Form.Item>
            <Form.Item label="Approve By" name="approve_by">
              <Input disabled />
            </Form.Item>
            <Form.Item label="Reject By" name="reject_by">
              <Input disabled />
            </Form.Item>
          </div>
        </Form>
      </BoxPrimary>

      {/* ตารางรายการของรางวัล */}
      <BoxPrimary>
        <TableComponent
          header={columns}
          dataSource={detail.items || []}
          pagination={false}
        />
      </BoxPrimary>

      {/* ปุ่มแอคชัน */}
      <div className="flex justify-end gap-3 mt-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        <ActionButton
          mode="warning"
          text="Send to Purchase"
          onClick={handleSendToPurchase}
          disabled={!detail.permission?.can_send_purchase}
        />
        <ActionButton
          mode="approve"
          text="Approve"
          onClick={handleApprove}
          disabled={!detail.permission?.can_approve}
        />
      </div>
    </MainLayout>
  );
}
