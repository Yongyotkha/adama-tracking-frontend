import React, { useState, useContext } from "react";
import { Form, Select, Input } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../contexts/AuthContext";

export default function CreateInfo() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { showNotification } = useContext(AuthContext);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        platform: "web",
        type: values.type,
        name: values.name,
        file: values.file,
        use_flag: values.use_flag,
      };

      setLoading(true);
      const res = await useServiceAPI.post(paths.pathInfoCreate, payload);

      if (res?.status === 200) {
        showNotification?.("success", "Save successfully");
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

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Info</div>
      <BoxPrimary>
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            type: 1,
            use_flag: "1",
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please input name" }]}
            >
              <Input placeholder="Input Name" />
            </Form.Item>

            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: "Please select type" }]}
            >
              <Select>
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
              <Input placeholder="https://..." />
            </Form.Item>

            <Form.Item label="Status" name="use_flag">
              <Select>
                <Select.Option value="1">Active</Select.Option>
                <Select.Option value="0">Inactive</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </BoxPrimary>
      <div className="flex justify-end gap-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        <ActionButton mode="save" text="Create" onClick={handleCreate} />
      </div>
    </MainLayout>
  );
}
