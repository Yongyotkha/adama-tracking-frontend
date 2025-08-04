import React, { useState, useEffect, useContext } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import { Form } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";
import FormUser from "../../../../components/form_user/FormUser";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import dayjs from "dayjs";
import { AuthContext } from "../../../../contexts/AuthContext";

export default function RegisteredCustomerDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useParams();
  const isViewMode = mode === "view";
  const id = location?.state?.id;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileImage] = useState("/img/profile.jpg");
  const { showNotification } = useContext(AuthContext);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathCustomerRegisDetail, { id });
      // console.log(res);
      if (res.status === 200 && res.data) {
        const d = res.data;
        // console.log(d);
        form.setFieldsValue({
          profile: d.photo_path || "/img/profile.jpg", // ใช้ default ถ้าไม่มี
          customer_id: d.user_code,
          shop_name: d.shop_name,
          customer_name: `${d.contact_first_name || ""} ${d.contact_last_name || ""}`,
          contact_number: d.phone_number,
          dob: d.contact_birth_date_year
            ? dayjs(`${d.contact_birth_date_year}-${d.contact_birth_date_month}-${d.contact_birth_date_day}`)
            : null,
          line_id: d.line_id || "-",
          address: "-", // ไม่มีใน payload
          register_date: d.line_join_last_datetime ? dayjs(d.line_join_last_datetime) : null,
          status: d.status_code === "1" ? "active" : "inactive"
        });

      }
    } catch (err) {
      showNotification("error", "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        id,
        status_code: values.status === "active" ? 1 : 0,
      };
      const res = await useServiceAPI.put(paths.pathCustomerRegisUpdate, payload);
      if (res.status === 200) {
        showNotification("success", res.data?.message || "บันทึกสำเร็จ");
        fetchDetail(); // Refresh
      }
    } catch (err) {
      showNotification("error", err?.response?.data?.message || "ไม่สามารถอัปเดตได้");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "", name: "profile", type: "picture", col: 24 },
    { name: "customer_id", label: "Customer ID", type: "text", col: 6, disabled: true },
    { name: "shop_name", label: "Shop Name", type: "text", col: 6, disabled: true },
    { name: "customer_name", label: "Customer Name", type: "text", col: 6, disabled: true },
    { name: "contact_number", label: "Contact Number", type: "text", col: 6, disabled: true },
    { name: "dob", label: "Date of birth", type: "date", col: 6, disabled: true },
    { name: "line_id", label: "Line ID", type: "text", col: 6, disabled: true },
    { name: "address", label: "Address", type: "text", col: 12, disabled: true },
    { name: "register_date", label: "Subscribed", type: "date", col: 6, disabled: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      col: 6,
      options: [
        { id: "active", name: "Active" },
        { id: "inactive", name: "Inactive" }
      ],
      disabled: isViewMode
    }
  ];


  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Customer Detail</div>
      </div>

      <FormUser
        profile={profileImage} // หรือใช้จาก `photo_path` ก็ได้
        fields={fields}
        form={form}
        onChange={() => { }}
        disableImageUpload={true}
      />

      <div className="flex justify-end gap-2 mt-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        {!isViewMode && (
          <ActionButton
            mode="save"
            text="Update"
            onClick={() => form.submit()}
          />
        )}
      </div>
    </MainLayout>
  );
}
