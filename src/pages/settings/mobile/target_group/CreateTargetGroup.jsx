import React, { useEffect, useState } from "react";
import { Form, Select } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableCheckbox from "../../../../components/table/TableCheckbox";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";

export default function ActionModeTargetGroup() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [targetType, setTargetType] = useState("dealer");
  const [dataSource, setDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

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
          { title: "Code", dataIndex: "code" },
          { title: "Dealer Name", dataIndex: "dealer_name" },
          { title: "Address", dataIndex: "address" },
        ];
    }
  };

  const fetchData = async (type) => {
    setLoading(true);
    try {
      let apiPath = paths.pathMasterDealerAll;
      if (type === "sub_dealer") apiPath = paths.pathMasterSubDealerAll;
      else if (type === "farmer") apiPath = paths.pathMasterFarmer;

      const res = await useServiceAPI.get(apiPath);
      const raw = res?.data || [];

      let formatted = [];

      if (type === "dealer") {
        formatted = raw.map((item, index) => ({
          key: item.id,
          code: item.code,
          dealer_name: item.name,
          address: item.address,
        }));
      } else if (type === "sub_dealer") {
        formatted = raw.map((item, index) => ({
          key: item.sub_dealer_id,
          sub_dealer_name: item.sub_dealer_name?.trim(),
          dealer_name: item.dealer_name || "-", // <- ต้องรวม dealer_name มาด้วยจาก API
        }));
      } else if (type === "farmer") {
        formatted = raw.map((item, index) => ({
          key: item.farmer_id,
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(targetType);
  }, [targetType]);

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Target Group</div>

      <BoxPrimary>
        <Form layout="vertical" form={form}>
          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              label="Target Name"
              name="target_name"
              rules={[{ required: true, message: "Please select target" }]}
              initialValue="dealer"
            >
              <Select
                onChange={(value) => {
                  setTargetType(value);
                  form.setFieldValue("target_name", value);
                }}
              >
                <Select.Option value="dealer">Dealer</Select.Option>
                <Select.Option value="sub_dealer">Sub Dealer</Select.Option>
                <Select.Option value="farmer">Farmer</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Type Name"
              name="type_name"
              rules={[{ required: true, message: "Please input type name" }]}
            >
              <Select placeholder="Select type">
                <Select.Option value="star">Star</Select.Option>
                <Select.Option value="non_star">Non Star</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Status" name="status" initialValue="1">
              <Select>
                <Select.Option value="1">Active</Select.Option>
                <Select.Option value="0">Inactive</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </BoxPrimary>

      <BoxPrimary>
        <TableCheckbox
          header={getColumns()}
          dataSource={dataSource}
          rowSelection={rowSelection}
          pageSize={10}
        />
      </BoxPrimary>

      <div className="flex justify-end gap-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        <ActionButton
          mode="save"
          text="Create"
          onClick={() =>
            console.log("Selected:", selectedRowKeys, "Form:", form.getFieldsValue())
          }
        />
      </div>
    </MainLayout>
  );
}
