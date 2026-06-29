// src/pages/settings/mobile/news_promotion/CreateNewsPromotion.jsx
import React, { useContext, useState, useEffect, useMemo, useRef } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";
import { Checkbox, Col, DatePicker, Form, Input, message, Row, Switch } from "antd";
import { AuthContext } from "../../../../contexts/AuthContext";
import dayjs from "dayjs";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import FileUploadComponent from "../../../../components/file_upload/FileUploadComponent";

const { RangePicker } = DatePicker;

export default function CreateNewsPromotion() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { mode } = useParams(); // 'create' | 'view' | 'edit'
  const location = useLocation(); // state.id มาจาก List
  const [form] = Form.useForm();
  const { showNotification } = useContext(AuthContext);
  const fileUploadRefReceive = useRef(null);

  const isView = String(mode).toLowerCase() === "view";
  const isEdit = String(mode).toLowerCase() === "edit";
  const isCreate = String(mode).toLowerCase() === "create";

  const [fileListReceive, setFileListReceive] = useState([]); // picture
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [targetOptions, setTargetOptions] = useState({
    dealer: [],
    subDealer: [],
    farmer: [],
  });
  const [selectedTargetIds, setSelectedTargetIds] = useState([]);

  const toCheckboxOption = (target) => ({
    label: target.name || target.customer_type || "-",
    value: Number(target.id),
  });

  const normalizeTargetIds = (targets = []) => {
    let arr = targets;
    if (typeof targets === "string") {
      arr = targets.split(",");
    } else if (!Array.isArray(targets)) {
      arr = [];
    }
    return arr
      .map((target) =>
        typeof target === "object"
          ? target.id ?? target.target_id ?? target.type_id ?? target.target
          : target
      )
      .map(Number)
      .filter(Number.isFinite);
  };

  // ---------- โหลด Category (Promotion banner) ----------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await useServiceAPI.get(paths.pathPromotionBannerCategoryฺBanner);
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

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        setLoading(true);
        const res = await useServiceAPI.get(paths.pathPromotionTarget);
        if (res?.status === 200) {
          const list = Array.isArray(res?.data?.data) ? res.data.data : res.data;
          const dealer = [];
          const subDealer = [];
          const farmer = [];

          (list || []).forEach((target) => {
            const groupName = String(target.customer_type || target.type_name || "").toLowerCase();
            const option = toCheckboxOption(target);
            if (!option.value) return;

            if (groupName.includes("farmer")) {
              farmer.push(option);
            } else if (groupName.includes("sub")) {
              subDealer.push(option);
            } else if (groupName.includes("dealer")) {
              dealer.push(option);
            }
          });

          setTargetOptions({ dealer, subDealer, farmer });
        } else {
          message.error("Unable to load customer group");
        }
      } catch (err) {
        console.error("Error fetching targets:", err);
        message.error("Unable to load customer group");
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, []);

  // ---------- ถ้าเป็น VIEW/EDIT: โหลดรายละเอียด ----------
  useEffect(() => {
    const id = location?.state?.id;
    if ((!isView && !isEdit) || !id) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await useServiceAPI.get(`${paths.pathPromotionBannerDetail}/${id}`);
        const promotion = res?.data?.promotion ?? res?.data;

        if (!promotion) {
          message.error("ไม่พบรายละเอียดรายการ");
          return;
        }

        form.setFieldsValue({
          banner: promotion.image || "",
          code: promotion.code || "", // ✅ แสดง code กลับมา
          category: Number(promotion.category_id) || undefined,
          name: promotion.name || "",
          // description: promotion.description || "",
          // condition: promotion.condition || "",
          product_detail: promotion.product_detail || "",
          stock: promotion.stock ?? promotion.value ?? "",
          date_range: [
            promotion.date_start ? dayjs(promotion.date_start) : null,
            promotion.date_end ? dayjs(promotion.date_end) : null,
          ],
          cost: promotion.cost ?? "",
          use_flag: promotion.use_flag === "1" || promotion.use_flag === 1,
        });

        setSelectedTargetIds(
          normalizeTargetIds(
            promotion.targets || promotion.target || res?.data?.targets || res?.data?.target
          )
        );

        const images = Array.isArray(promotion.image)
          ? promotion.image
          : promotion.image
          ? [promotion.image]
          : [];
        setFileListReceive(
          images.map((u, idx) => ({
            uid: String(idx + 1),
            name: `image_${idx + 1}`,
            status: "done",
            url: u,
          }))
        );
      } catch (err) {
        console.error("Error fetching detail:", err);
        message.error("เกิดข้อผิดพลาดในการโหลดรายละเอียด");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isView, isEdit, location?.state?.id, form]);

  // ---------- ฟิลด์ฟอร์ม ----------
  const formFields = useMemo(
    () => [
      // ✅ นำช่อง Code กลับมา (อ่านอย่างเดียว)
      { label: "Reward Code", name: "code", type: "text", required: false, col: 12, placeholder: "Code", disabled: true },
      { label: "Category", name: "category", type: "select", required: true, col: 12, options: categoryOptions, disabled: isView },
      { label: "Name", name: "name", type: "text", required: true, col: 24, placeholder: "Enter", disabled: isView },
      // { label: "Detail", name: "description", type: "text", required: true, col: 24, placeholder: "Enter", disabled: isView },
      // { label: "Condition", name: "condition", type: "textarea", required: true, col: 24, placeholder: "Enter", disabled: isView },
      { label: "Detail", name: "product_detail", type: "textarea", required: true, col: 24, placeholder: "Enter", disabled: isView },
      // { label: "Stock (Pcs)", name: "stock", type: "text", required: !isView, col: 8, placeholder: "Enter", disabled: isView },
      { label: "Period Date", name: "date_range", type: "date_range", required: true, col: 8, placeholder: "Start date — End date", disabled: isView },
      // { label: "Cost (THB)", name: "cost", type: "text", required: false, col: 4, placeholder: "Enter", disabled: isView },
      { label: "Publish", name: "use_flag", type: "switch", required: false, col: 4, value: true, disabled: isView },
    ],
    [categoryOptions, isView]
  );

  const buildPayload = (values) => {
    const date_start = dayjs(values.date_range?.[0]).format("YYYY-MM-DD");
    const date_end = dayjs(values.date_range?.[1]).format("YYYY-MM-DD");

    // API ใหม่: image เป็น string เดียว (เอารูปแรก), use_flag เป็น "1"/"0"
    const imageStr =
      fileListReceive?.[0]?.url ??
      (typeof values.banner === "string" ? values.banner : "") ??
      "";

    // ✅ ไม่แนบ code ใน payload ตามสเปค body ใหม่
    return {
      name: values.name,
      description: values.description,
      date_start,
      date_end,
      category_id: Number(values.category || categoryOptions?.[0]?.id || 0),
      unit: "ชุด",
      value: 0,
      remark: "",
      image: imageStr,
      use_flag: values.use_flag ? "1" : "0",
      detail: values.product_detail,
      condition: values.condition,
      product_detail: values.product_detail,
      public: 1,
      cost: values.cost ? Number(values.cost) : 0,
      stock: values.stock ? Number(values.stock) : 0,
      targets: selectedTargetIds,
      platform: "web",
    };
  };

  const handleSave = async () => {
      try {
        setLoading(true);
        const values = await form.validateFields();
        if (!selectedTargetIds.length) {
          throw new Error("Please select customer group");
        }
        const payload = buildPayload(values);
        const res = await useServiceAPI.post(`${paths.pathPromotionBannerCreate}?platform=web`, payload);

      if (res?.status === 200) {
        showNotification("success", "Created", "Campaign has been saved.");
        navigate("/setting/line/news-promotion");
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
      if (!selectedTargetIds.length) {
        throw new Error("Please select customer group");
      }
      const payload = buildPayload(values);

      const id = Number(location?.state?.id);
      if (!id) throw new Error("ไม่พบรหัสรายการจากหน้า List");

      const res = await useServiceAPI.put(`${paths.pathPromotionBannerUpdate}/${id}`, payload);

      if (res?.status === 200) {
        showNotification("success", res?.message || "Updated", res?.message_line);
        navigate("/setting/line/news-promotion");
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
    setFileListReceive((prev) => [
      ...prev,
      { uid: d.file_key, name: d.file_name, status: "done", url: d.file_url },
    ]);
  };

  const handleTargetChange = (values, groupKey) => {
    const groupValues = targetOptions[groupKey].map((option) => option.value);
    setSelectedTargetIds((prev) => {
      const withoutCurrentGroup = (prev || []).filter(
        (id) => !groupValues.includes(Number(id))
      );
      return [...withoutCurrentGroup, ...values.map(Number)];
    });
  };

  const getSelectedTargetsByGroup = (groupKey) => {
    const selectedSet = new Set((selectedTargetIds || []).map(Number));
    return targetOptions[groupKey]
      .map((option) => option.value)
      .filter((value) => selectedSet.has(Number(value)));
  };

  // ---------- ป้องกัน refresh หน้า view/edit แล้ว state หาย ----------
  useEffect(() => {
    if ((isView || isEdit) && !location?.state?.id) {
      message.warning("ไม่พบรหัสรายการจากหน้า List");
    }
  }, [isView, isEdit, location?.state?.id]);

  return (
    <MainLayout loading={loading}>
      <div className="title-page">
        {isView ? "View News Promotion" : isEdit ? "Edit News Promotion" : "Create News Promotion"}
      </div>

      <BoxPrimary>
        <div className="flex items-center justify-between">
          <label htmlFor="Banner" title="Banner">Banner</label>
        {!isView && (
            <ActionButton
              mode="add"
              text="Upload File"
              onClick={() => fileUploadRefReceive.current?.triggerUpload()}
            />
          )}
        </div>

        <FileUploadComponent
          ref={fileUploadRefReceive}
          dataFile={fileListReceive}
          onUploadSuccess={handleUploadReceiveSuccess}
          mode={isView ? "view" : "edit"}
        />
      </BoxPrimary>

      <BoxPrimary>
        <Form layout="vertical" form={form} initialValues={{ use_flag: true }}>
          <Form.Item name="category" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="Reward Code" name="code">
            <Input placeholder="Code" disabled />
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input placeholder="Enter" disabled={isView} />
          </Form.Item>

          <Form.Item
            label="Detail"
            name="product_detail"
            rules={[{ required: true, message: "Please enter detail" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter" disabled={isView} />
          </Form.Item>

          <Row gutter={[24, 8]} align="bottom">
            <Col xs={24} lg={14}>
              <div className="font-semibold mb-1">
                Customer Group <span className="text-[#ff4d4f]">*</span>
              </div>
              <Row gutter={[24, 8]}>
                <Col xs={24} md={7}>
                  <div className="font-medium mb-1">Dealer</div>
                  <Checkbox.Group
                    options={targetOptions.dealer}
                    value={getSelectedTargetsByGroup("dealer")}
                    disabled={isView}
                    onChange={(values) => handleTargetChange(values, "dealer")}
                  />
                </Col>
                <Col xs={24} md={9}>
                  <div className="font-medium mb-1">Sub Dealer</div>
                  <Checkbox.Group
                    options={targetOptions.subDealer}
                    value={getSelectedTargetsByGroup("subDealer")}
                    disabled={isView}
                    onChange={(values) => handleTargetChange(values, "subDealer")}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <div className="font-medium mb-1">Farmer</div>
                  <Checkbox.Group
                    options={targetOptions.farmer}
                    value={getSelectedTargetsByGroup("farmer")}
                    disabled={isView}
                    onChange={(values) => handleTargetChange(values, "farmer")}
                  />
                </Col>
              </Row>
            </Col>

            <Col xs={24} lg={8}>
              <Form.Item
                label="Period Date"
                name="date_range"
                rules={[{ required: true, message: "Please select period date" }]}
              >
                <RangePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  disabled={isView}
                  placeholder={["Start date", "End date"]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} lg={2}>
              <Form.Item label="Publish" name="use_flag" valuePropName="checked">
                <Switch className="custom-switch" disabled={isView} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BoxPrimary>

      {/* ไม่มี Customer Group แล้ว */}

      <div className="flex justify-end gap-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        {isCreate && (
          <ActionButton text="Save" mode="save" onClick={handleSave} />
        )}
        {isEdit && (
          <ActionButton text="Update" mode="update" onClick={handleUpdate} />
        )}
      </div>
    </MainLayout>
  );
}
