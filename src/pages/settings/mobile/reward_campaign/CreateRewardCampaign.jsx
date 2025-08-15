import React, { useContext, useState, useEffect } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import FormCustom from "../../../../components/form_custom/FormCustom";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";
import { Form, Input, message } from "antd";
import { AuthContext } from "../../../../contexts/AuthContext";
import dayjs from "dayjs";
import TableComponent from "../../../../components/table/TableComponent";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";

export default function CreateRewardCampaign() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { showNotification } = useContext(AuthContext);

  const [targetData, setTargetData] = useState([]);

  // ✅ ดึงข้อมูล Target จาก API
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        setLoading(true);
        const res = await useServiceAPI.get(paths.pathPromotionTarget);
        if (res?.status === 200) {
          // Map ให้มีช่อง points และ value
          const mapped = res.data.map((t) => ({
            id: t.id,
            target_id: t.target, // เก็บไว้ใช้ตอนส่ง API
            type_name: t.type,
            target_name: t.target_text,
            points: "",
            value: "",
          }));
          setTargetData(mapped);
          console.log(mapped);
        } else {
          message.error("ไม่สามารถโหลดข้อมูล Target ได้");
        }
      } catch (err) {
        console.error("Error fetching targets:", err);
        message.error("เกิดข้อผิดพลาดในการโหลด Target");
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, []);

  const handleTargetChange = (value, index, field) => {
    const updated = [...targetData];
    updated[index][field] = value;
    setTargetData(updated);
  };

  const targetColumns = [
    { title: "No", dataIndex: "id", key: "id", render: (_, __, index) => index + 1 },
    { title: "Target Name", dataIndex: "target_name", key: "target_name" },
    { title: "Type Name", dataIndex: "type_name", key: "type_name" },
    {
      title: "Points",
      dataIndex: "points",
      key: "points",
      render: (_, __, index) => (
        <Input
          placeholder="Enter"
          value={targetData[index]?.points}
          onChange={(e) => handleTargetChange(e.target.value, index, "points")}
        />
      ),
    },
    {
      title: "Value (THB)",
      dataIndex: "value",
      key: "value",
      render: (_, __, index) => (
        <Input
          placeholder="Enter"
          value={targetData[index]?.value}
          onChange={(e) => handleTargetChange(e.target.value, index, "value")}
        />
      ),
    },
  ];

  const formFields = [
    { label: "Banner", name: "banner", type: "photo", required: true, col: 24, accept: "image/png, image/jpeg" },
    { label: "Reward Code", name: "code", type: "text", required: false, col: 12, placeholder: "Generate", disabled: true },
    { label: "Category", name: "category", type: "select", required: true, col: 12, options: [] },
    { label: "Reward Name", name: "name", type: "text", required: true, col: 24, placeholder: "Enter" },
    { label: "Detail", name: "description", type: "text", required: true, col: 24, placeholder: "Enter" },
    { label: "Condition", name: "condition", type: "text", required: true, col: 24, placeholder: "Enter" },
    { label: "Product Detail", name: "product_detail", type: "text", required: true, col: 24, placeholder: "Enter" },
    { label: "Stock (Pcs)", name: "stock", type: "text", required: true, col: 8, placeholder: "Enter" },
    { label: "Period Date", name: "date_range", type: "date", required: true, col: 8, placeholder: "Start date — End date" },
    { label: "Cost (THB)", name: "cost", type: "text", required: false, col: 4, placeholder: "Enter" },
    { label: "Campaign Publish", name: "use_flag", type: "switch", required: false, col: 4, value: true },
  ];

  const genCode = () => {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth()+1+"").padStart(2,"0")}${(now.getDate()+"").padStart(2,"0")}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const date_start = dayjs(values.date_range?.[0]).format("YYYY-MM-DD");
      const date_end   = dayjs(values.date_range?.[1]).format("YYYY-MM-DD");

      const target = targetData
        .filter(t => t.points || t.value)
        .map(t => ({
          point: Number(t.points ?? 0),
          value: Number(t.value ?? 0),
          target_id: Number(t.target_id),
          type_id: Number(t.id),
        }));

      const payload = {
        name: values.name,
        description: values.description,
        date_start,
        date_end,
        code: values.code || genCode(),
        category_id: Number(values.category),
        unit: "ชุด",
        value: values.value ? Number(values.value) : 0,
        remark: "",
        image: values.banner,
        use_flag: values.use_flag ? "1" : "0",
        detail: values.product_detail,
        condition: values.condition,
        product_detail: values.product_detail,
        public: 1,
        cost: values.cost ? Number(values.cost) : 0,
        target,
      };

      const res = await useServiceAPI.post(paths.pathPromotioncreate, payload);

      if (res?.status === 200 && res?.data?.result) {
        showNotification("success", "Reward Created", "Campaign has been saved.");
        navigate("/point/reward");
      } else {
        showNotification("error", "Save failed", res?.data?.message || "Unknown error");
      }
    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Reward Campaign</div>
      <FormCustom fields={formFields} form={form} />
      <div className="mt-8 font-semibold text-lg">Target</div>
      <TableComponent header={targetColumns} dataSource={targetData} pagination={false} scroll />
      <div className="flex justify-end gap-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        <ActionButton text="Save" mode="save" onClick={handleSave} />
      </div>
    </MainLayout>
  );
}
