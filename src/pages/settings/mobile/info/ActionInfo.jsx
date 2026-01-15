import React, { useContext, useEffect, useRef, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";
import { Form, Input, Row, Col, Select } from "antd";
import { AuthContext } from "../../../../contexts/AuthContext";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import FileUploadComponent from "../../../../components/file_upload/FileUploadComponent";

export default function ActionInfo() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { showNotification, showMsg } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  // ====== mode & id ======
  const { mode: modeFromParams } = useParams(); // 'create' | 'edit' | 'view'
  const location = useLocation();

  const modeFromState = location.state?.mode;
  const isEditPath = location.pathname.includes("/edit");
  const isViewPath = location.pathname.includes("/view");
  const mode =
    modeFromParams ??
    modeFromState ??
    (isEditPath ? "edit" : isViewPath ? "view" : "create");

  const idFromState = location.state?.id;
  const idFromQuery = new URLSearchParams(location.search).get("id");
  const recordId =
    idFromState ?? (idFromQuery ? String(idFromQuery) : undefined);

  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const pageTitle = isCreate
    ? "Create Info"
    : isEdit
    ? "Edit Info"
    : "View Info";
  const formDisabled = isView;

  // ====== Upload (file url -> form.file) ======
  const fileUploadRef = useRef(null);
  const [fileList, setFileList] = useState([]); // ใช้แค่เพื่อโชว์ preview/list

  const handleUploadSuccess = (resp) => {
    const d =
      resp?.data || resp?.data?.data || resp?.data?.result || resp?.data;
    const fileUrl = d?.file_url || d?.url;

    if (!fileUrl) {
      showNotification?.("error", "Upload สำเร็จแต่ไม่พบ file_url");
      return;
    }

    // ✅ อนุญาตได้ไฟล์เดียว: upload ใหม่ = replace ของเดิม
    const oneFile = {
      uid: d?.file_key || String(Date.now()),
      name: d?.file_name || "uploaded",
      status: "done",
      url: fileUrl,
    };

    setFileList([oneFile]);
    form.setFieldValue("file", fileUrl);
  };

  const typeOptions = [
    { label: "File", value: 1 },
    { label: "Video", value: 2 },
  ];

  const statusOptions = [
    { label: "Active", value: "1" },
    { label: "Inactive", value: "0" },
  ];

  // ===== helper: pathInfoDetail อาจเป็น function หรือ string base =====
  const getInfoDetailPath = (id) => {
    if (typeof paths.pathInfoDetail === "function")
      return paths.pathInfoDetail(id);
    return `${paths.pathInfoDetail}/${id}`;
  };

  // ====== fetch detail เมื่อ edit/view ======
  useEffect(() => {
    if (isCreate) {
      form.setFieldsValue({ use_flag: "1", type: 1, name: "", file: "" });
      setFileList([]);
      return;
    }

    if (!recordId) {
      showMsg?.("error", "ไม่พบ id");
      navigate(-1);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await useServiceAPI.get(getInfoDetailPath(recordId), {
          platform: "web",
        });

        // ex response: { status:"success", data:{...} }
        const data = res?.data;

        if (!data) {
          showNotification?.("error", "ไม่พบข้อมูล");
          return;
        }

        if (cancelled) return;

        form.setFieldsValue({
          name: data?.name ?? "",
          type: Number(data?.type ?? 1), // "1" -> 1
          use_flag: String(data?.use_flag ?? "1"),
          file: data?.file ?? "",
        });

        const url = data?.file;
        setFileList(
          url
            ? [
                {
                  uid: String(data?.id ?? Date.now()),
                  name: "file",
                  status: "done",
                  url,
                },
              ]
            : []
        );
      } catch (e) {
        showNotification?.(
          "error",
          "โหลดข้อมูลไม่สำเร็จ",
          e?.response?.data?.message || e?.message || ""
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreate, isEdit, isView, recordId]);

  // ====== Save (create/edit) ======
  const onSave = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        platform: "web",
        name: (values.name || "").trim(),
        type: Number(values.type), // 1/2
        use_flag: String(values.use_flag), // "1"/"0"
        file: fileList?.[0]?.url || values.file || "",
      };

      setLoading(true);

      let res;
      if (isEdit) {
        res = await useServiceAPI.put(paths.pathInfoEdit, {
          ...payload,
          id: String(recordId),
        });
      } else {
        res = await useServiceAPI.post(paths.pathInfoCreate, payload);
      }

      if (res?.status === 200) {
        showNotification?.(
          "success",
          res?.data?.message ||
            (isEdit ? "Update successful" : "Save successfully")
        );
        navigate(-1);
      } else {
        throw new Error(res?.data?.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ");
      }
    } catch (e) {
      showNotification?.(
        "error",
        "บันทึกไม่สำเร็จ",
        e?.response?.data?.message || e?.message || "กรุณาตรวจสอบข้อมูล"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">{pageTitle}</div>

      {/* Upload */}
      <BoxPrimary>
        <div className="flex items-center justify-between">
          <label title="Upload">Upload File / Video</label>

          {!isView && (
            <ActionButton
              mode="add"
              text="Upload File"
              onClick={() => {
                fileUploadRef.current?.triggerUpload();
              }}
            />
          )}
        </div>

        <FileUploadComponent
          ref={fileUploadRef}
          dataFile={fileList}
          onUploadSuccess={handleUploadSuccess}
          mode={isView ? "view" : "edit"}
        />
      </BoxPrimary>

      {/* Form */}
      <BoxPrimary>
        <Form
          layout="vertical"
          form={form}
          disabled={formDisabled}
          initialValues={{ use_flag: "1", type: 1 }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Info Name"
                name="name"
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input placeholder="Enter name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: "Please select type" }]}
              >
                <Select options={typeOptions} placeholder="Select type" />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                label="Status"
                name="use_flag"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select options={statusOptions} placeholder="Select status" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        {!isView && <ActionButton text="Save" mode="save" onClick={onSave} />}
      </div>
    </MainLayout>
  );
}
