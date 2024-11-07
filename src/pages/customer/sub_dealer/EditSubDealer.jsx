import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Input, DatePicker, Col, Row, Select, Form } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import FormUser from "../../../components/form_user/FormUser";

const { Option } = Select;

export default function EditSubDealer() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formFields = [
    { label: "Shop Name", name: "shop_name", type: "text", required: false, col: 6, value: "เพื่อนชาวนา" },
    { label: "Mobile Phone", name: "mobile_phone", type: "text", required: false, col: 6, value: "036-442474" },
    { label: "Address", name: "address", type: "text", required: false, col: 12, value: "55 หมู่ 5 ต.โคกสำโรง อ.โคกสำโรง จ.ลพบุรี 15120" },
    { label: "Office Hours", name: "office_hours", type: "multiple", options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], required: false, col: 6, value: ['Monday'] , iconSrc: "/img/icons/calendar.png", iconPosition: "right" },
    { label: "Start Time", name: "start_time", type: "time", required: false, col: 3, value: "07:00" },
    { label: "End Time", name: "end_time", type: "time", required: false, col: 3, value: "18:00" },
    { label: "Business Size", name: "business_size", type: "select", options: ["Small", "Medium", "Large"], required: false, col: 6, value: "Business Size" },
    { label: "Email", name: "email", type: "email", required: false, col: 6, value: "" },
    { label: "Outlet Location", name: "outlet_location", type: "text", required: false, col: 12, value: "Location", iconSrc: "/img/icons/location.png", iconPosition: "right" },
    { label: "T-Shirt Size", name: "tshirt_size", type: "text", required: false, col: 6, value: "M" },
    { label: "Anniversary", name: "anniversary", type: "date", required: false, col: 6, value: "" },
    { label: "Remark", name: "remark", type: "text", required: false, col: 24, value: "" },
  ];

  // Mock crop data for the multi-select dropdown
  const cropOptions = [
    "Rice", "Wheat", "Corn", "Soybean", "Cotton", "Barley", "Sugarcane", "Potato", "Tomato", "Lettuce"
  ];

  // Default crops to be pre-selected
  const defaultSelectedCrops = ["Rice", "Corn", "Soybean"];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Sub Dealer</div>

      {/* Company Info Section */}
      <FormUser profile="/img/profile.jpg" title="Personal Info" fields={formFields} />

      <BoxPrimary>
        <Form layout="vertical">
          <Form.Item label="Crop" name="crop">
            <Select
              mode="multiple"
              showSearch
              placeholder="Select Crop(s)"
              optionFilterProp="children"
              className="w-full"
              defaultValue={defaultSelectedCrops}
            >
              {cropOptions.map((crop) => (
                <Option key={crop} value={crop}>
                  {crop}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </BoxPrimary>

      {/* Contact Person Section */}
      <BoxPrimary>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-lg font-semibold">Contact Person</span>
          <ActionButton mode="add" text="Add" onClick={() => { }} />
        </div>

        <span className="text-[#00783F] text-md">Person 1</span>
        <Row gutter={[16, 16]} className="mt-3">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Name (EN)" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Name (TH)" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Nickname" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <DatePicker className="w-full" placeholder="Date of Birth" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="T-Shirt Size" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Relationship" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Duty" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Tel 1" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Tel 2" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Contact Number" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Email" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Line ID" />
          </Col>
        </Row>
        <hr className="my-4" />

        <span className="text-[#00783F] text-md">Person 2</span>
        <Row gutter={[16, 16]} className="mt-3">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Name (EN)" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Name (TH)" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Nickname" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <DatePicker className="w-full" placeholder="Date of Birth" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="T-Shirt Size" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Relationship" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Duty" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Tel 1" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Tel 2" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Contact Number" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Email" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Line ID" />
          </Col>
        </Row>
        <hr className="my-4" />
      </BoxPrimary>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/customer/sub-dealer")} />
        <ActionButton htmlType="submit" mode="update" text="Update" onClick={() => navigate("/customer/sub-dealer")} />
        </div>
    </MainLayout>
  );
}
