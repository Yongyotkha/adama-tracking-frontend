import React, { useEffect, useMemo, useState, useContext } from "react";
import { Form, Input, Modal } from "antd"; // ⬅️ เพิ่ม Modal
import dayjs from "dayjs";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import ActionButton from "../../../../components/button/ActionButton";

import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import { AuthContext } from "../../../../contexts/AuthContext";

export default function RedeemDetail() {
  const navigate = useNavigate();
  const { mode: urlMode } = useParams(); // (ยังไม่ใช้)
  const location = useLocation();
  const { showNotification } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form] = Form.useForm();

  // ตารางสินค้า/ของรางวัล
  const columns = useMemo(
    () => [
      { title: "Reward Code", dataIndex: "reward_code", align: "left" },
      { title: "Category", dataIndex: "category", align: "left" },
      { title: "Reward Name", dataIndex: "reward_name", align: "left" },
      { title: "QTY (Pcs)", dataIndex: "qty", align: "right", width: 100 },
      { title: "Cost (THB)", dataIndex: "cost", align: "right", width: 120 },
      { title: "Points Redeem", dataIndex: "point_redeem", align: "right", width: 140 },
    ],
    []
  );

  const fillForm = (d) => {
    form.setFieldsValue({
      shop_name: d.shop_name || "-",
      customer_name: d.customer_name || "-",
      contact_number: d.contact_number || "-",
      date: d.date ? dayjs(d.date).format("YYYY-MM-DD") : "-",
      stock: String(d.stock ?? "-"),
      status: d.status_name || "-",
      approve_by: d.approve_by || "-",
      reject_by: d.reject_by || "-",
    });
  };

  const loadDetail = async () => {
    try {
      setLoading(true);
      const id = location?.state?.id;
      if (!id) {
        showNotification("error", "Load failed", ["ไม่พบรหัสรายการจากหน้า List"]);
        navigate(-1);
        return;
      }

      // GET /redeem/detail/{id}
      const res = await useServiceAPI.get(`${paths.pathRedeemDetail}/${id}`);

      if (res?.status === 200) {
        // ✅ payload จริงอยู่ใต้ data.data
        const d = res.data;

        // map response -> view model
        const vm = {
          id: d.id,
          reward_id: d.reward_id,
          status_code: d.status, // RFA | RFR | RFW
          status_name:
            d.status === "RFA"
              ? "Approve"
              : d.status === "RFR"
                ? "Reject"
                : d.status === "RFW"
                  ? "Waiting for Approve"
                  : d.status || "-",
          status_bg_color: d.status === "RFA" ? "#009845" : d.status === "RFR" ? "#752157" : "#9CA3AF",
          status_color: "#FFFFFF",

          date: d.created_at?.split(" ")[0] || "-",
          shop_name: d.user?.shop_name || "-",
          customer_name: d.user?.name_en || d.user?.name_th || "-",
          contact_number: d.user?.phone_number || "-",
          stock: d.reward?.value ?? "-",
          approve_by: d.approve_by || "-",
          reject_by: d.reject_by || "-",

          items: [
            {
              reward_code: d.reward?.code || "-",
              category: d.reward?.category_name || "-", // ไม่มีใน payload -> "-"
              reward_name: d.reward?.name || "-",
              qty: 1, // ไม่มีใน payload -> สมมติ 1
              cost: Number(d.reward?.cost ?? 0),
              point_redeem: Number(d.point ?? 0),
            },
          ],

          permission: {
            can_approve: d.status === "RFW",
            // RFA/RFR ให้เห็นปุ่ม Send to Request (ตาม requirement)
            can_send_purchase: d.status === "RFA" || d.status === "RFR",
          },
        };

        setDetail(vm);
        fillForm(vm);
      } else {
        showNotification("error", "Load failed", [res?.data?.message || "ไม่สามารถโหลดรายละเอียดได้"]);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Load failed", ["เกิดข้อผิดพลาดระหว่างโหลดรายละเอียด"]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Modal helper: ถาม + รับ remark ----------
  const confirmWithRemark = ({ title, placeholder = "Enter", okText = "OK", okType, onOk }) => {
    let remarkValue = "";
    Modal.confirm({
      title,
      content: (
        <Input.TextArea
          autoSize={{ minRows: 3 }}
          placeholder={placeholder}
          onChange={(e) => (remarkValue = e.target.value)}
        />
      ),
      okText,
      okType,
      cancelText: "Cancel",
      onOk: async () => {
        await onOk?.(remarkValue?.trim() || "");
      },
    });
  };

  const confirmNoRemark = ({ title, okText = "OK", okType = "primary", onOk }) => {
    Modal.confirm({
      title,
      okText,
      okType,
      cancelText: "Cancel",
      onOk: async () => {
        await onOk?.();
      },
    });
  };

  // ---------- ยิง API เปลี่ยนสถานะ ----------
  const postStatus = async (status, remark) => {
    if (!detail?.id) return;
    try {
      setLoading(true);
      const body = { id: Number(detail.id), status, remark };
      const res = await useServiceAPI.post(paths.pathRedeemUpdateStatus, body);
      if (res?.status === 200) {
        showNotification("success", "Success", [`อัปเดตสถานะเป็น ${status} เรียบร้อย`]);
        // โหลดใหม่เพื่อให้ข้อมูลล่าสุด (หรือจะย้อนกลับ list ก็ได้)
        // await loadDetail();
        // ✅ อัปเดตเสร็จแล้ว redirect กลับหน้า List
        navigate("/points/line/redeem-reward-list");

      } else {
        showNotification("error", "Update failed", [res?.data?.message || "ไม่สามารถอัปเดตสถานะได้"]);
      }
    } catch (e) {
      console.error(e);
      showNotification("error", "Update failed", [e?.message || "เกิดข้อผิดพลาดระหว่างอัปเดต"]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Actions ----------
  const handleApprove = async () => {
    confirmWithRemark({
      title: "Do you want to approve ?",
      okText: "OK",
      okType: "primary",
      onOk: async (remark) => {
        await postStatus("RFA", remark); // ✅ Approve
      },
    });
  };

  const handleReject = async () => {
    confirmWithRemark({
      title: "Do you want to reject ?",
      okText: "OK",
      okType: "danger",
      onOk: async (remark) => {
        await postStatus("RFR", remark); // ✅ Reject
      },
    });
  };

  // “Send to Purchase” – ยังไม่ต่อ API จริง เก็บ remark ได้ตาม requirement
  // const handleSendToPurchase = async () => {
  //   confirmWithRemark({
  //     title: "Send to Purchase ?",
  //     okText: "OK",
  //     okType: "primary",
  //     onOk: async (remark) => {
  //       // วางไว้ก่อน – ยังไม่ยิง API
  //       showNotification("success", "Sent", ["ส่งกลับไปที่ Purchase แล้ว"]);
  //     },
  //   });
  // };

  // ✅ Send to Purchase: GET /redeem/purchase/{reward_id} (ไม่มี remark) แล้วกลับหน้า List
  const handleSendToPurchase = async () => {
    const id = location?.state?.id;
    console.log(detail.reward_id)
    console.log(id)
    return false;
    confirmNoRemark({
      title: "Send to Purchase ?",
      okText: "OK",
      okType: "primary",
      onOk: async (_remark) => {
        if (!detail?.reward_id) {
          showNotification("error", "Missing reward", ["ไม่พบ reward_id ในรายละเอียด"]);
          return;
        }
        try {
          setLoading(true);
          const res = await useServiceAPI.get(`${paths.pathRedeemToPurchase}/${detail.reward_id}/${id}`);
          if (res?.status === 200) {
            showNotification("success", "Transaction completed", ["ส่งไป Purchase เรียบร้อย"]);
            navigate("/points/line/redeem-reward-list");
          } else {
            showNotification("error", "Send failed", [res?.data?.message || "ไม่สามารถส่งไป Purchase ได้"]);
          }
        } catch (e) {
          console.error(e);
          showNotification("error", "Send failed", [e?.message || "เกิดข้อผิดพลาดระหว่างส่งไป Purchase"]);
        } finally {
          setLoading(false);
        }
      },
    });
  };
  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // โหมดจาก list (RFA/RFR/RFW) เพื่อคุมปุ่ม
  const currentMode = (location?.state?.mode || detail?.status_code || "").toUpperCase();
  const isRFA = currentMode === "RFA";
  const isRFR = currentMode === "RFR";
  const isRFW = currentMode === "RFW";

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Point Redeem Detail</div>

      <BoxPrimary>
        <Form form={form} layout="vertical" disabled>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Form.Item label="Customer Name" name="shop_name"><Input disabled /></Form.Item>
            <Form.Item label="Contact Name" name="customer_name"><Input disabled /></Form.Item>
            <Form.Item label="Contact Number" name="contact_number"><Input disabled /></Form.Item>
            <Form.Item label="Date" name="date"><Input disabled /></Form.Item>

            <Form.Item label="Stock (Pcs)" name="stock"><Input disabled /></Form.Item>
            <Form.Item label="Status" name="status"><Input disabled /></Form.Item>
            {/* <Form.Item label="Approve By" name="approve_by"><Input disabled /></Form.Item> */}
            {/* <Form.Item label="Reject By" name="reject_by"><Input disabled /></Form.Item> */}
          </div>
        </Form>
      </BoxPrimary>

      <BoxPrimary>
        <TableComponent header={columns} dataSource={detail?.items || []} pagination={false} />
      </BoxPrimary>

      <div className="flex justify-end gap-3 mt-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />

        {/* {(isRFA) && (
          <ActionButton
            mode="reject"
            text="Send to Purchase"
            onClick={handleSendToPurchase} // ⬅️ มี remark ผ่าน Modal แต่ยังไม่ยิง API
          />
        )} */}

        {isRFW && (
          <>
            {/* <ActionButton
              mode="reject"
              text="Reject"
              className="bg-[#752157]"
              onClick={handleReject} // ⬅️ Modal + post RFR
            /> */}
            <ActionButton
              mode="reject"
              text="Send to Purchase"
              onClick={handleSendToPurchase} // ⬅️ มี remark ผ่าน Modal แต่ยังไม่ยิง API
            />
            <ActionButton
              mode="custom"
              text="Approve"
              className="bg-[#00783F]"
              onClick={handleApprove} // ⬅️ Modal + post RFA
            />
          </>
        )}
      </div>
    </MainLayout>
  );
}
