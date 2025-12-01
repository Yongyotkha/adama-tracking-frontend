// src/pages/settings/mobile/target_group/ViewOrEditTargetGroup.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import { Form, Select, Modal, Input } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableCheckbox from "../../../../components/table/TableCheckbox";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import ActionButton from "../../../../components/button/ActionButton";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../../../contexts/AuthContext";

export default function ViewOrEditTargetGroup() {
  const navigate = useNavigate();
  const { state } = useLocation(); // expect { id }
  const { mode } = useParams(); // "view" | "edit" | "upload"
  const id = state?.id;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [targetType, setTargetType] = useState("dealer"); // dealer | sub_dealer | farmer
  const [dataSource, setDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(mode === "upload");
  const { showNotification, showMsg } = useContext(AuthContext);
  // const [type_id, set_type_id] = useState(null);
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const lockTopInputs = isView || isEdit;   // ล็อกบนสุดทั้ง view + edit

  // ===== Row selection: ให้คงสถานะเลือกไว้ แม้ตารางรีเรนเดอร์ =====
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: (keys) => setSelectedRowKeys(keys),
      preserveSelectedRowKeys: true,                // <<< เพิ่มบรรทัดนี้
      ...(isView ? { getCheckboxProps: () => ({ disabled: true }) } : {}),
    }),
    [selectedRowKeys, isView]
  );


  const getColumns = () => {
    switch (targetType) {
      case "sub_dealer":
        return [
          { title: "No", render: (_, __, index) => index + 1 },
          { title: "Sub Dealer Name", dataIndex: "sub_dealer_name" },
          { title: "Dealer Name", dataIndex: "dealer_name" },
        ];
      case "farmer":
        return [
          { title: "No", render: (_, __, index) => index + 1 },
          { title: "Farmer Name", dataIndex: "farmer_name" },
          { title: "Sub Dealer Name", dataIndex: "sub_dealer_name" },
          { title: "Dealer Name", dataIndex: "dealer_name" },
        ];
      default:
        return [
          { title: "No", render: (_, __, index) => index + 1 },
          // { title: "Code", dataIndex: "code" },
          { title: "Dealer Name", dataIndex: "dealer_name" },
          // { title: "Address", dataIndex: "address" },
        ];
    }
  };

  // เหนือ fetchDetail()
  const TARGET_MAP = { dealer: 1, sub_dealer: 2, farmer: 3 };
  const REVERSE_TARGET_MAP = { 1: "dealer", 2: "sub_dealer", 3: "farmer" };
  const TARGET_BY_CUSTOMER_TYPE = { "1": "dealer", "2": "sub_dealer", "3": "farmer" };

  /**
   * รองรับได้ทั้ง:
   *  - { data: {header...}, customers: [...] }
   *  - { data: { header:..., customers:[...] } }  (เผื่อรูปแบบอื่น)
   *  - { data: [...customers] } / [...customers]
   */
  function extractDetail(res) {
    const header =
      (res?.data && !Array.isArray(res.data) && res.data) ||
      (res && !Array.isArray(res) && res); // fallback ถ้า API คืน object ตรง ๆ

    const customers =
      (Array.isArray(res?.customers) && res.customers) ||
      (Array.isArray(res?.data?.customers) && res.data.customers) ||
      (Array.isArray(res?.data) && res.data) ||
      (Array.isArray(res) && res) ||
      [];

    const selectedIds = customers
      .map(it => Number(it?.customer_id))
      .filter(n => !Number.isNaN(n));

    // ลำดับเดา target: ใช้ header.target ก่อน ถ้าไม่มีค่อยดู customer_type ตัวแรก
    let targetKey =
      header?.target ? REVERSE_TARGET_MAP[Number(header.target)] :
        (customers[0]?.customer_type ? TARGET_BY_CUSTOMER_TYPE[String(customers[0].customer_type)] : undefined);

    if (!targetKey) targetKey = "dealer";

    // คืน header (อาจมี type/use_flag) + customers ที่แปลงแล้ว
    return {
      header: header && header.id ? header : null,
      selectedIds,
      targetKey,
    };
  }

  const fetchTypeOptions = async (targetKey, { resetTypeField = true } = {}) => {
    try {
      const targetId = TARGET_MAP[targetKey];
      const res = await useServiceAPI.get(paths.pathTargetGroupType, { target: targetId });
      const raw = res?.data || [];
      const opts = raw.map((it) => ({
        label: it.name ?? String(it.id),
        value: String(it.id),
      }));
      setTypeOptions(opts);

      if (resetTypeField && !lockTopInputs) {
        form.setFieldValue("type_name", undefined);
      }

      return raw; // 👈 สำคัญ
    } catch (err) {
      console.error("Error fetching type options", err);
      showMsg?.("error", err?.message || "เกิดข้อผิดพลาดขณะดึงประเภท");
      setTypeOptions([]);
      return [];
    }
  };



  const fetchMasterRows = async (type, overrideTypeId) => {
    try {
      let apiPath = paths.pathMasterDealerAll;
      if (type === "sub_dealer") apiPath = paths.pathMasterSubDealerAll;
      else if (type === "farmer") apiPath = paths.pathMasterFarmer;

      const params = { target: true };

      // ใช้ overrideTypeId ก่อน ถ้าไม่มีค่อยดึงจาก form
      const rawTypeId = overrideTypeId ?? form.getFieldValue("type_name");

      // แปลงเป็นเลขอย่างปลอดภัย
      const numTypeId = rawTypeId != null && `${rawTypeId}` !== "" ? Number(rawTypeId) : null;

      if (Number.isFinite(numTypeId)) {
        params.type_id = numTypeId;
      }

      const res = await useServiceAPI.get(apiPath, params);
      const raw = res?.data || [];
      let formatted = [];

      if (type === "dealer") {
        formatted = raw.map((item) => ({
          key: Number(item.id),
          code: item.code,
          dealer_name: item.name,
          address: item.address,
        }));
      } else if (type === "sub_dealer") {
        formatted = raw.map((item) => ({
          key: Number(item.sub_dealer_id),
          sub_dealer_name: item.sub_dealer_name?.trim(),
          dealer_name: item.dealer_name || "-",
        }));
      } else if (type === "farmer") {
        formatted = raw.map((item) => ({
          key: Number(item.farmer_id),
          farmer_name:
            item.farmer_name && item.farmer_name.trim() !== ""
              ? item.farmer_name.trim()
              : "ไม่มีชื่อ",
          sub_dealer_name: item.sub_dealer_name || "-",
          dealer_name: item.dealer_name || "-",
        }));
      }

      setDataSource(formatted);
    } catch (err) {
      console.error("Error fetching data", err);
      showMsg?.("error", err?.message || "เกิดข้อผิดพลาดขณะดึงข้อมูล");
    }
  };

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await useServiceAPI.post(paths.pathTargetGroupDetail, { id });

      const { header, selectedIds, targetKey } = extractDetail(res);

      setTargetType(targetKey);
      setSelectedRowKeys(selectedIds);

      // 1) โหลด type list ตาม target และรับ raw กลับมา
      const rawTypes = await fetchTypeOptions(targetKey, { resetTypeField: false });

      // 2) หา type id จาก "ชื่อ" (เช่น "Pull")
      let selectedTypeId;
      if (header?.type) {
        const match = rawTypes.find((t) => t.name === header.type);
        if (match) {
          selectedTypeId = String(match.id); // เช่น "4"
        }
      }

      // 3) เซ็ตค่าฟอร์ม
      form.setFieldsValue({
        target_name: targetKey,                          // "sub_dealer"
        type_name: selectedTypeId,                      // "4" (id), ไม่ใช่ "Pull"
        status: String(header?.use_flag ?? 1),
      });

      // 4) โหลด rows ทั้งหมด โดยส่ง id จริงเข้าไป
      await fetchMasterRows(targetKey, selectedTypeId);
    } catch (e) {
      console.error("fetch detail error", e);
      showMsg?.("error", e?.message || "โหลดรายละเอียดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!id) {
      // ป้องกันผู้ใช้เข้าหน้านี้ตรงๆ
      navigate("/setting/line/target-group");
      return;
    }
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // เปลี่ยน target dropdown (เฉพาะโหมด edit/upload)
  const onChangeTarget = async (value) => {
    if (lockTopInputs) return; // บล็อกทุกกรณีที่ฟอร์มถูกล็อก
    setTargetType(value);
    form.setFieldValue("target_name", value);
    setSelectedRowKeys([]);
    await Promise.all([fetchTypeOptions(value), fetchMasterRows(value)]);
  };


  const handleSave = async () => {
    try {
      const values = await form.validateFields().catch(() => null);
      if (!values) {
        showNotification?.("error", "กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }
      // if (!selectedRowKeys?.length) {
      //   showNotification?.("error", "กรุณาเลือกลูกค้าอย่างน้อย 1 รายการ");
      //   return;
      // }

      const payload = {
        target: TARGET_MAP[values.target_name || targetType],
        type: values.type_name, // ใช้ id ของ type
        use_flag: Number(values.status ?? 1),
        customer_id: selectedRowKeys,
      };

      setLoading(true);
      // PUT: target-group/update/:id
      const url = `${paths.pathTargetGroupUpdate}/${id}`;
      const res = await useServiceAPI.put(url, payload);
      if (res?.status === 200) {
        const msg = res?.data?.message || "Update successful";
        showNotification?.("success", msg);
        navigate(-1);
      } else {
        showNotification?.("error", res?.data?.message || "บันทึกไม่สำเร็จ");
      }
    } catch (error) {
      showNotification?.(
        "error",
        error?.response?.data?.message || error?.message || "เกิดข้อผิดพลาด"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===== Upload (paste IDs) =====
  const [pasteIds, setPasteIds] = useState("");
  const applyPastedIds = () => {
    const tokens = pasteIds
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    const nums = Array.from(new Set(tokens.map((t) => Number(t)).filter((n) => !Number.isNaN(n))));
    const merged = Array.from(new Set([...(selectedRowKeys || []), ...nums]));
    setSelectedRowKeys(merged);
    setUploadOpen(false);
    setPasteIds("");
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">
        {isView ? "View Customer Group" : mode === "upload" ? "Edit (Upload) Customer Group" : "Edit Customer Group"}
      </div>

      <BoxPrimary>
        <Form
          layout="vertical"
          form={form}
          // อย่าใส่ disabled ที่ Form อีกต่อไป
          initialValues={{ target_name: "dealer", status: "1" }}
        >
          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              label="Customer Name"
              name="target_name"
              rules={[{ required: true, message: "Please select target" }]}
            >
              <Select
                disabled={lockTopInputs}     // ⬅️ ล็อกที่นี่
                onChange={onChangeTarget}
                allowClear={false}
              >
                <Select.Option value="dealer">Dealer</Select.Option>
                <Select.Option value="sub_dealer">Sub Dealer</Select.Option>
                <Select.Option value="farmer">Farmer</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Type Name"
              name="type_name"
              rules={[{ required: true, message: "Please select type name" }]}
            >
              <Select
                disabled={lockTopInputs}     // ⬅️ ล็อกที่นี่
                placeholder="Select type"
                options={typeOptions}
                loading={loading && !typeOptions.length}
                allowClear={false}
              />
            </Form.Item>

            <Form.Item label="Status" name="status" initialValue="1">
              <Select disabled={lockTopInputs} allowClear={false}>  {/* ⬅️ ล็อกที่นี่ */}
                <Select.Option value="1">Active</Select.Option>
                <Select.Option value="0">Inactive</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </BoxPrimary>


      <BoxPrimary>
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Customers</div>
          {!isView && (
            <div className="flex gap-2">
              <ActionButton mode="upload" text="Upload IDs" onClick={() => setUploadOpen(true)} />
              <ActionButton
                mode="clear"
                text="Clear Selected"
                onClick={() => setSelectedRowKeys([])}
              />
            </div>
          )}
        </div>
        <TableCheckbox
          header={getColumns()}
          dataSource={dataSource}
          rowSelection={rowSelection}
          pageSize={10}
        />
      </BoxPrimary>

      <div className="flex justify-end gap-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        {!isView && <ActionButton mode="save" text="Save" onClick={handleSave} />}
      </div>

      <Modal
        title="Upload / Paste Customer IDs"
        open={uploadOpen}
        onOk={applyPastedIds}
        onCancel={() => setUploadOpen(false)}
        okText="Apply"
      >
        <p className="mb-2">วางรหัสลูกค้า (คั่นด้วยคอมมา หรือเว้นบรรทัด)</p>
        <Input.TextArea
          rows={6}
          value={pasteIds}
          onChange={(e) => setPasteIds(e.target.value)}
          placeholder="เช่น 607, 608, 609"
        />
      </Modal>
    </MainLayout>
  );
}
