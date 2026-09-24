import React, { useContext, useState, useEffect, useMemo, useRef } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import FormCustom from "../../../../components/form_custom/FormCustom";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";
import { Form, Input, message } from "antd";
import { AuthContext } from "../../../../contexts/AuthContext";
import dayjs from "dayjs";
import TableComponent from "../../../../components/table/TableComponent";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import FileUploadComponent from "../../../../components/file_upload/FileUploadComponent";
import { FastBackwardFilled } from "@ant-design/icons";

export default function CreateRewardCampaign() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { mode } = useParams();                  // 'create' | 'view' | 'edit'
  const location = useLocation();                // รับ state.id จาก List
  const [form] = Form.useForm();
  const { showNotification } = useContext(AuthContext);
  const fileUploadRefReceive = useRef(null);

  const isView = String(mode).toLowerCase() === "view";
  const isEdit = String(mode).toLowerCase() === "edit";
  const isCreate = String(mode).toLowerCase() === "create";

  const [fileListReceive, setFileListReceive] = useState([]); // picture
  const [targetData, setTargetData] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  // ---- watch cost for realtime recalculation
  const costWatch = Form.useWatch("cost", form);

  // ---------- utils ----------
  const toNum = (v) => {
    if (v === null || v === undefined) return 0;
    const n = parseFloat(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const format2 = (n) => {
    if (!Number.isFinite(n)) return "";
    // ปัด 2 ตำแหน่ง แล้วแปลงเป็น string สั้น ๆ เช่น 12.90 -> "12.9"
    return parseFloat((Math.round(n * 100) / 100).toFixed(2)).toString();
  };

  const calcValue = (cost, points) => {
    const c = toNum(cost);
    const p = toNum(points);
    if (!p) return ""; // ไม่มี/ศูนย์ points -> ไม่แสดง
    return format2(c / p);
  };

  // ---------- โหลด Target master ----------
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        setLoading(true);
        const res = await useServiceAPI.get(paths.pathPromotionTarget);
        if (res?.status === 200) {
          const list = Array.isArray(res?.data?.data) ? res.data.data : res.data;
          const mapped = (list || []).map((t) => ({
            id: t.id,                 // ใช้เป็น type_id ตอนส่ง
            name: t.customer_type,
            type: t.type,             // Customer Group id
            customer_type: t.name,
            points: "",
            value: "",
          }));
          setTargetData(mapped);
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

  // ---------- โหลด Category ----------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await useServiceAPI.get(paths.pathPromotionCategory);
        if (res?.status === 200) {
          const list = Array.isArray(res?.data?.data) ? res.data.data : res.data;
          const mapped = (list || []).map((c) => ({
            id: Number(c.id),
            name: String(c.name),
          }));
          setCategoryOptions(mapped);
        } else {
          message.error("ไม่สามารถโหลดหมวดหมู่ได้");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        message.error("เกิดข้อผิดพลาดในการโหลดหมวดหมู่");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ---------- ถ้าเป็นโหมด VIEW/EDIT: โหลดรายละเอียดแล้วเติมค่า ----------
  useEffect(() => {
    const id = location?.state?.id; // ได้จากหน้า List
    if ((!isView && !isEdit) || !id) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await useServiceAPI.get(`${paths.pathPromotiondetail}/${id}`);
        const promotion = res?.data?.promotion;
        const target = res?.data?.target;

        if (!promotion) {
          message.error("ไม่พบรายละเอียดรายการ");
          return;
        }

        // เติมค่าเข้า form
        form.setFieldsValue({
          banner: promotion.image || "",
          code: promotion.code || "",
          category: Number(promotion.category_id) || undefined,
          name: promotion.name || "",
          description: promotion.description || "",
          condition: promotion.condition || "",
          product_detail: promotion.product_detail || "",
          stock: promotion.value ?? "",
          date_range: [
            promotion.date_start ? dayjs(promotion.date_start) : null,
            promotion.date_end ? dayjs(promotion.date_end) : null,
          ],
          cost: promotion.cost ?? "",
          use_flag: promotion.use_flag === "1" || promotion.use_flag === 1,
        });

        // รูปเดิม
        const images = Array.isArray(promotion.image) ? promotion.image : (promotion.image ? [promotion.image] : []);
        setFileListReceive(
          images.map((u, idx) => ({ uid: String(idx + 1), name: `image_${idx + 1}`, status: "done", url: u }))
        );

        // เติม targetData (คำนวณ value ตาม cost ปัจจุบัน)
        if (Array.isArray(target) && target.length) {
          const costNow = promotion?.cost ?? form.getFieldValue("cost");
          const merged = target.map((t) => ({
            id: Number(t.id),
            type: Number(t.type),
            name: t.customer_type ?? "",
            points: t.point ?? "",
            value: calcValue(costNow, t.point ?? ""), // ยึด cost -> คำนวณใหม่
            customer_type: t.name ?? "",
          }));
          setTargetData(merged);
        }
      } catch (err) {
        console.error("Error fetching detail:", err);
        message.error("เกิดข้อผิดพลาดในการโหลดรายละเอียด");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isView, isEdit, location?.state?.id, form]);

  // ---------- เปลี่ยนค่าในตาราง ----------
  const handleTargetChange = (value, index, field) => {
    const updated = [...targetData];
    updated[index][field] = value;

    // ถ้าแก้ points -> คำนวณ value ใหม่ทันทีด้วย cost ปัจจุบัน
    if (field === "points") {
      const currentCost = form.getFieldValue("cost");
      updated[index].value = calcValue(currentCost, value);
    }
    setTargetData(updated);
  };

  // ---------- เมื่อค่า Cost (THB) เปลี่ยน ให้คำนวณ Value ใหม่ทุกแถว ----------
  useEffect(() => {
    setTargetData((prev) =>
      prev.map((row) => ({
        ...row,
        value: calcValue(costWatch, row.points),
      }))
    );
  }, [costWatch]);

  // ---------- คอลัมน์ Target ----------
  const targetColumns = useMemo(() => {
    if (isView) {
      return [
        { title: "No", dataIndex: "id", key: "id", render: (_, __, index) => index + 1 },
        { title: "Customer Name", dataIndex: "name", key: "name" },
        { title: "Type Name", dataIndex: "customer_type", key: "customer_type" },
        { title: "Points", dataIndex: "points", key: "points", render: (v) => String(v ?? "") },
        { title: "Value/Point (THB)", dataIndex: "value", key: "value", render: (v) => String(v ?? "") },
      ];
    }
    return [
      { title: "No", dataIndex: "id", key: "id", render: (_, __, index) => index + 1 },
      { title: "Customer Name", dataIndex: "name", key: "name" },
      { title: "Type Name", dataIndex: "customer_type", key: "customer_type" },
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
        title: "Value/Point (THB)",
        dataIndex: "value",
        key: "value",
        render: (_, __, index) => (
          <Input
            placeholder="Auto"
            value={targetData[index]?.value}
            disabled
            readOnly
          />
        ),
      },
    ];
  }, [isView, targetData]);

  // ---------- ฟิลด์ฟอร์ม (ถ้า View ให้ disabled) ----------
  const formFields = useMemo(() => [
    { label: "Reward Code", name: "code", type: "text", required: false, col: 12, placeholder: "Code", disabled: true },
    { label: "Category", name: "category", type: "select", required: true, col: 12, options: categoryOptions, disabled: isView },
    { label: "Reward Name", name: "name", type: "text", required: true, col: 24, placeholder: "Enter", disabled: isView },
    { label: "Detail", name: "description", type: "text", required: true, col: 24, placeholder: "Enter", disabled: isView },
    { label: "Condition", name: "condition", type: "textarea", required: true, col: 24, placeholder: "Enter", disabled: isView },
    { label: "Product Detail", name: "product_detail", type: "textarea", required: true, col: 24, placeholder: "Enter", disabled: isView },
    { label: "Stock (Pcs)", name: "stock", type: "text", required: !isView, col: 8, placeholder: "Enter", disabled: isView },
    { label: "Period Date", name: "date_range", type: "date_range", required: true, col: 8, placeholder: "Start date — End date", disabled: isView },
    { label: "Cost (THB)", name: "cost", type: "text", required: false, col: 4, placeholder: "Enter", disabled: isView },
    { label: "Campaign Publish", name: "use_flag", type: "switch", required: false, col: 4, value: true, disabled: isView },
  ], [categoryOptions, isView]);

  const genCode = () => {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1 + "").padStart(2, "0")}${(now.getDate() + "").padStart(2, "0")}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
  };

  const buildPayload = (values) => {
    const date_start = dayjs(values.date_range?.[0]).format("YYYY-MM-DD");
    const date_end = dayjs(values.date_range?.[1]).format("YYYY-MM-DD");

    const target = targetData
      .filter(t => t.points || t.value)
      .map(t => ({
        point: Number(t.points ?? 0),
        value: Number(t.value ?? 0),
        target_id: Number(t.id),
        type_id: Number(t.type),
      }));

    return {
      name: values.name,
      description: values.description,
      date_start,
      date_end,
      code: values.code || genCode(),
      category_id: Number(values.category),
      unit: "-",
      value: values.value ? Number(values.value) : 0,
      remark: "",
      image: fileListReceive.map((f) => f.url),
      use_flag: values.use_flag ? 1 : 0,
      detail: values.product_detail,
      condition: values.condition,
      product_detail: values.product_detail,
      public: 1,
      cost: values.cost ? Number(values.cost) : 0,
      stock: values.stock ? Number(values.stock) : 0,
      target,
    };
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const payload = buildPayload(values);
      const res = await useServiceAPI.post(paths.pathPromotioncreate, payload);

      if (res?.status === 200) {
        showNotification("success", "Reward Created", "Campaign has been saved.");
        navigate("/setting/line/reward-campaign");
      } else {
        showNotification("error", "Save failed", res?.data?.message || "Unknown error");
      }
    } catch (err) {
      console.error("Submit failed:", err);
      showNotification("error", "Submit failed", err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const payload = buildPayload(values);

      const id = Number(location?.state?.id);
      if (!id) throw new Error("ไม่พบรหัสรายการจากหน้า List");

      const res = await useServiceAPI.put(`${paths.pathPromotionupdate}/${id}`, payload);

      if (res?.status === 200) {
        showNotification("success", res?.message || "Updated", res?.message_line);
        navigate("/setting/line/reward-campaign");
      } else {
        showNotification("error", "Update failed", res?.data?.message || "Unknown error");
      }
    } catch (err) {
      console.error("Update failed:", err);
      showNotification("error", "Update failed", err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReceiveSuccess = (resp) => {
    const d = resp.data;
    setFileListReceive((prev) => [...prev, { uid: d.file_key, name: d.file_name, status: "done", url: d.file_url }]);
  };

  // ---------- ป้องกันกรณี refresh หน้า view แล้ว state หาย ----------
  useEffect(() => {
    if ((isView || isEdit) && !location?.state?.id) {
      message.warning("ไม่พบรหัสรายการจากหน้า List");
    }
  }, [isView, isEdit, location?.state?.id]);

  return (
    <MainLayout loading={loading}>
      <div className="title-page">
        {isView ? "View Reward" : isEdit ? "Edit Reward" : "Create Reward"}
      </div>

      <BoxPrimary>
        <div className="flex items-center justify-between">
          <label htmlFor="Banner" title="Banner">Banner</label>
          {!isView && (
            <ActionButton mode="add" text="Upload File" onClick={() => fileUploadRefReceive.current?.triggerUpload()} />
          )}
        </div>

        <FileUploadComponent
          ref={fileUploadRefReceive}
          dataFile={fileListReceive}
          onUploadSuccess={handleUploadReceiveSuccess}
          mode={isView ? "view" : "edit"}
        />
      </BoxPrimary>

      <FormCustom fields={formFields} form={form} />

      <div className="mt-8 font-semibold text-lg">Customer Group</div>
      <TableComponent
        header={targetColumns}
        dataSource={targetData}
        pagination={false}
        scroll
      />

      <div className="flex justify-end gap-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        {isCreate && <ActionButton text="Save" mode="save" onClick={handleSave} />}
        {isEdit && <ActionButton text="Update" mode="update" onClick={handleUpdate} />}
      </div>
    </MainLayout>
  );
}
