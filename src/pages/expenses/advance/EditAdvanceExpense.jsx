import React, { useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Form, Input, Col, Row, Select } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import FormCustom from "../../../components/form_custom/FormCustom";
import TableComponent from "../../../components/table/TableComponent";

const { Option } = Select;

export default function EditAdvanceExpense() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formCustom] = Form.useForm();
  const [customerForm] = Form.useForm();

  const handleUpdate = async () => {
    try {
      const formCustomData = await formCustom.validateFields();
      const customerData = await customerForm.validateFields();

      const combinedData = {
        ...formCustomData,
        ...customerData
      };

      console.log("Combined Form Data:", combinedData);
      navigate("/expenses/advance");
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const formFields = [
    { label: "Activity Reference", name: "activity_reference", type: "text", disabled: true, required: false, col: 24, value: "202400000000001" },
    { label: "Activity Type", name: "activity_type", type: "select", options: ["FMT"], disabled: false, required: true, col: 6, value: "FMT" },
    { label: "Shop", name: "shop", type: "select", options: ["Chaifar"], disabled: false, required: true, col: 6, value: "Chaifar" },
    { label: "Crop", name: "crop", type: "select", options: ["Rice"], disabled: false, required: true, col: 6, value: "Rice" },
    { label: "Date", name: "date", type: "date", disabled: false, required: true, col: 6, value: "2024-01-01" },
    { label: "Start Time", name: "start_time", type: "time", disabled: false, required: true, col: 6, value: "09:00" },
    { label: "End Time", name: "end_time", type: "time", disabled: false, required: true, col: 6, value: "11:00" },
    { label: "Location", name: "location", type: "text", disabled: true, required: false, col: 12, value: "2/80 ถนนพาดาวรี ต.ท่าอิฐ อ.เมืองอุดรธานี จ.อุดรธานี" },
    { label: "Description", name: "description", type: "text-editor", disabled: false, required: false, col: 24, placeholder: "Add description", value: "" }
  ];

  const dataSource = [
    {
      key: "1",
      no: "1",
      sku: "3027200113",
      productName: "Bumper P",
      unit: "0.5 ltX20",
      pricePerUnit: "575.00",
      quantity: 10,
      foc: 1,
      subTotal: "115,000.00",
    },
    {
      key: "2",
      no: "2",
      sku: "207920011520",
      productName: "Memory 300EC",
      unit: "1lt X20",
      pricePerUnit: "340.00",
      quantity: 10,
      foc: 1,
      subTotal: "68,000.00",
    },
  ];

  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Product Name", dataIndex: "productName", key: "productName" },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    { title: "THB/Unit", dataIndex: "pricePerUnit", key: "pricePerUnit" },
    { title: <div className="text-center">QTY (ctn)</div>, dataIndex: "quantity", key: "quantity" },
    { title: "FOC (ctn)", dataIndex: "foc", key: "foc" },
    { title: "Sub Total (THB)", dataIndex: "subTotal", key: "subTotal" },
  ];

  const footerOrderList = (currentData) => (
    <tr className="bg-[#978B87]">
      <td colSpan={8} className="text-right pr-2 text-white">
        Item : {dataSource.length} &nbsp; QTY (ctn): {dataSource.reduce((total, item) => total + item.quantity, 0)} &nbsp;
        Total : {dataSource.reduce((total, item) => total + parseFloat(item.subTotal.replace(/,/g, "")), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Advance Expense</div>

      <FormCustom fields={formFields} form={formCustom} />

      <BoxPrimary title="Sale Plan">
        <TableComponent
          header={header}
          dataSource={dataSource}
          pageSize={10}
          footer={footerOrderList}
          pagination={false}
        />
      </BoxPrimary>

      <BoxPrimary>
        <span className="text-[#00783F] text-lg font-semibold mb-3">Customer</span>
        <Form
          layout="vertical"
          form={customerForm}
          initialValues={{
            supportCustomerName: "Chaifar",
            address: "2/80 ถนนพาดาวรี ต.ท่าอิฐ อ.เมืองอุดรธานี จ.อุดรธานี",
            perception: "Good"
          }}
        >
          <Row gutter={[16, 16]} className="mt-3">
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item label="Support Customer Name" name="supportCustomerName">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item label="Place of Owner" name="placeOfOwner">
                <Input placeholder="-" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12}>
              <Form.Item label="Address" name="address">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item label="Phone Number" name="phoneNumber">
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item label="Place of GPS" name="placeOfGPS">
                <Input placeholder="Enter GPS location" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item label="Perception" name="perception">
                <Select>
                  <Option value="Good">Good</Option>
                  <Option value="Average">Average</Option>
                  <Option value="Poor">Poor</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/expenses/advance")} />
        <ActionButton mode="update" text="Update" onClick={handleUpdate} />
      </div>
    </MainLayout>
  );
}
