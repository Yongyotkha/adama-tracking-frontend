import React, { useContext, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Form, Table, Input, DatePicker, Upload, Select, Switch } from "antd";
import ActionButton from "../../../../components/button/ActionButton";
import { AuthContext } from "../../../../contexts/AuthContext";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import dayjs from "dayjs";
import { PlusOutlined } from "@ant-design/icons";
import TableComponent from "../../../../components/table/TableComponent";

export default function CreateRewardCampaign() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { showNotification } = useContext(AuthContext);

  const [targetData, setTargetData] = useState([
    { id: 1, target_name: "Dealer", type_name: "Star" },
    { id: 2, target_name: "Dealer", type_name: "Non Star" },
    { id: 3, target_name: "Sub Dealer", type_name: "Push" },
    { id: 4, target_name: "Sub Dealer", type_name: "Pull" },
    { id: 5, target_name: "Sub Dealer", type_name: "หน้าร้าน" },
    { id: 6, target_name: "Farmer", type_name: "KOL" },
    { id: 7, target_name: "Farmer", type_name: "Big Farmer" },
    { id: 8, target_name: "Farmer", type_name: "General" },
  ]);

  const handleTargetChange = (value, index, field) => {
    const updated = [...targetData];
    updated[index][field] = value;
    setTargetData(updated);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        date_start: dayjs(values.date_range[0]).format("YYYY-MM-DD"),
        date_end: dayjs(values.date_range[1]).format("YYYY-MM-DD"),
        use_flag: values.use_flag ? "1" : "0",
        targets: targetData.map((t) => ({
          target_name: t.target_name,
          type_name: t.type_name,
          points: t.points || "",
          value: t.value || "",
        })),
      };

      delete payload.date_range;

      console.log("Submit Payload:", payload);

      // const res = await useServiceAPI.post(paths.pathCreateRewardCampaign, payload);
      // if (res.status === 200) {
      //   showNotification("success", "Success", "Reward campaign created successfully.");
      //   navigate("/point/reward");
      // }

      showNotification("success", "Success", "Reward campaign created successfully.");
      navigate("/point/reward");
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  const columns = [
    { title: "No", dataIndex: "id", render: (_, __, i) => i + 1 },
    { title: "Target Name", dataIndex: "target_name" },
    { title: "Type Name", dataIndex: "type_name" },
    {
      title: "Points",
      dataIndex: "points",
      render: (_, __, i) => (
        <Input
          placeholder="Enter"
          value={targetData[i]?.points}
          onChange={(e) => handleTargetChange(e.target.value, i, "points")}
        />
      ),
    },
    {
      title: "Value (THB)",
      dataIndex: "value",
      render: (_, __, i) => (
        <Input
          placeholder="Enter"
          value={targetData[i]?.value}
          onChange={(e) => handleTargetChange(e.target.value, i, "value")}
        />
      ),
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Reward Campaign</div>

      <Form form={form} layout="vertical">
        <Form.Item name="image" label="Banner" valuePropName="fileList" getValueFromEvent={(e) => e.fileList}>
          <Upload name="file" listType="picture-card" maxCount={1}>
            <div>
              <PlusOutlined />
              <div>Upload</div>
            </div>
          </Upload>
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Form.Item name="code" label="Reward Code">
            <Input placeholder="Generate" disabled />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select placeholder="Select" />
          </Form.Item>
          <Form.Item name="name" label="Reward Name" rules={[{ required: true }]} className="md:col-span-2">
            <Input />
          </Form.Item>
        </div>

        <Form.Item name="description" label="Detail" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="condition" label="Condition" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="product_detail" label="Product Detail" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Form.Item name="stock" label="Stock (Pcs)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date_range" label="Period Date" rules={[{ required: true }]}>
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="cost" label="Cost (THB)">
            <Input />
          </Form.Item>
          <Form.Item name="use_flag" label="Campaign Publish" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
        </div>

        <div className="mt-8 font-semibold text-lg">Target</div>
        <TableComponent
          header={columns}
          dataSource={targetData}
          pagination={false}
          loading={false}
          scroll={false}
        />

        <div className="flex justify-end gap-4">
          <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
          <ActionButton text="Create" mode="save" onClick={handleSave} />
        </div>
      </Form>
    </MainLayout>
  );
}
