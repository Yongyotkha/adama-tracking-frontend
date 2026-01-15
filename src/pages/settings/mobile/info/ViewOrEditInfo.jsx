import React, { useEffect, useState, useContext } from "react";
import { Form, Select, Input } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import ActionButton from "../../../../components/button/ActionButton";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../contexts/AuthContext";

export default function ViewOrEditInfo() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const id = state?.id;
  const isView = window.location.pathname.includes("view");

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { showNotification, showMsg } = useContext(AuthContext);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = `${paths.pathInfoDetail}/${id}`;
      const res = await useServiceAPI.post(url, { platform: "web" });
      if (res.status === 200 || res.data?.status === "success") {
        const data = res.data.data;
        form.setFieldsValue({
          name: data.name,
          type: Number(data.type),
          file: data.file,
          use_flag: String(data.use_flag),
        });
      }
    } catch (err) {
      showMsg?.("error", err?.message || "Failed to load detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      navigate(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        platform: "web",
        id: id,
        type: values.type,
        name: values.name,
        file: values.file,
        use_flag: values.use_flag,
      };

      setLoading(true);
      const res = await useServiceAPI.post(paths.pathInfoEdit, payload);

      if (res?.status === 200) {
        showNotification?.("success", "Update successful");
        navigate(-1);
      } else {
        showNotification?.("error", res?.data?.message || "Update failed");
      }
    } catch (error) {
      showNotification?.(
        "error",
        error?.response?.data?.message || error?.message || "Error"
      );
    } finally {
      setLoading(false);
    }
  };

  const title = isView ? "View Info" : "Edit Info";
  const disabled = isView;

  return (
    <MainLayout loading={loading}>
      <div className="title-page">{title}</div>
      <BoxPrimary>
        <Form layout="vertical" form={form}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please input name" }]}
            >
              <Input placeholder="Input Name" disabled={disabled} />
            </Form.Item>

            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: "Please select type" }]}
            >
              <Select disabled={disabled}>
                <Select.Option value={1}>File</Select.Option>
                <Select.Option value={2}>Video</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="File URL"
              name="file"
              rules={[{ required: true, message: "Please input file URL" }]}
              className="col-span-2"
            >
              <Input placeholder="https://..." disabled={disabled} />
            </Form.Item>

            <Form.Item label="Status" name="use_flag">
              <Select disabled={disabled}>
                <Select.Option value="1">Active</Select.Option>
                <Select.Option value="0">Inactive</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </BoxPrimary>
      <div className="flex justify-end gap-4">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/setting/info/list")}
        />
        {!isView && (
          <ActionButton mode="save" text="Save" onClick={handleSave} />
        )}
      </div>
    </MainLayout>
  );
}
