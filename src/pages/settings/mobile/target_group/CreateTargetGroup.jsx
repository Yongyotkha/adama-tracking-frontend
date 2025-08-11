import React, { useEffect, useState, useContext } from "react";
import { Form, Select } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableCheckbox from "../../../../components/table/TableCheckbox";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../contexts/AuthContext";

export default function CreateTargetGroup() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [targetType, setTargetType] = useState("dealer"); // dealer | sub_dealer | farmer
  const [dataSource, setDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { showNotification, showMsg } = useContext(AuthContext);

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
        formatted = raw.map((item) => ({
          key: item.id,
          code: item.code,
          dealer_name: item.name,
          address: item.address,
        }));
      } else if (type === "sub_dealer") {
        formatted = raw.map((item) => ({
          key: item.sub_dealer_id,
          sub_dealer_name: item.sub_dealer_name?.trim(),
          dealer_name: item.dealer_name || "-",
        }));
      } else if (type === "farmer") {
        formatted = raw.map((item) => ({
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
      showMsg?.("error", err?.message || "เกิดข้อผิดพลาดขณะดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(targetType);
  }, [targetType]);

  // map target_name -> target id สำหรับ payload
  const TARGET_MAP = {
    dealer: 1,
    sub_dealer: 2,
    farmer: 3,
  };

  const handleCreate = async () => {
    try {
      // ตรวจฟอร์มเบื้องต้น
      const values = await form.validateFields().catch(() => null);
      if (!values) {
        showNotification?.("error", "กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      if (!selectedRowKeys?.length) {
        showNotification?.("error", "กรุณาเลือกลูกค้าอย่างน้อย 1 รายการ");
        return;
      }

      const typeLabelMap = {
        star: "Star",
        non_star: "Non Star",
      };

      const payload = {
        target: TARGET_MAP[values.target_name || targetType],
        type: typeLabelMap[values.type_name] || values.type_name || "General",
        use_flag: Number(values.status ?? 1),
        customer_id: selectedRowKeys,
      };

      setLoading(true);
      const res = await useServiceAPI.post(paths.pathTargetGroupCreate, payload);

      if (res?.status === 200 ) {
        const msg = res?.data?.message || "บันทึกสำเร็จ";
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

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Target Group</div>

      <BoxPrimary>
        <Form layout="vertical" form={form} initialValues={{ target_name: "dealer", status: "1" }}>
          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              label="Target Name"
              name="target_name"
              rules={[{ required: true, message: "Please select target" }]}
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
        <ActionButton mode="save" text="Create" onClick={handleCreate} />
      </div>
    </MainLayout>
  );
}
