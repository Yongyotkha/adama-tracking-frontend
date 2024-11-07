import React, { useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Input, DatePicker, Col, Row } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import FormUser from "../../../components/form_user/FormUser";

export default function ViewAdvanceExpense() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formFields = [
    { label: "Dealer Name (EN)", name: "dealer_name_en", type: "text", disabled: true, required: false, col: 6, value: "Somporn Panich Chemi Kaset Ltd.Part." },
    { label: "Dealer Name (TH)", name: "dealer_name_th", type: "text", disabled: true, required: false, col: 6, value: "ห้างหุ้นส่วนจำกัดสมพรพานิชเคมีเกษตร" },
    { label: "Dealer Code", name: "dealer_code", type: "text", disabled: true, required: false, col: 6, value: "321001" },
    { label: "Tax ID", name: "tax_id", type: "text", disabled: true, required: false, col: 6, value: "0163556000660" },
    { label: "Contact Number", name: "contact_number", type: "text", disabled: true, required: false, col: 6, value: "0163556000660" },
    { label: "Address", name: "address", type: "text", disabled: true, required: false, col: 12, value: "55 หมู่ 5 ต.โคกสำโรง อ.โคกสำโรง จ.ลพบุรี 15120" },
    { label: "Group Code", name: "group_code", type: "select", options: ["FMK Customers"], disabled: true, required: false, col: 6, value: "FMK Customers" },
    { label: "Date of Anniversary", name: "date_of_anniversary", type: "date", disabled: true, required: false, col: 6, value: "2024-01-01" },
    { label: "Date of Joining", name: "date_of_joining", type: "date", disabled: true, required: false, col: 6, value: "2024-01-01" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">View Advance Expense</div>

      {/* Company Info Section */}
      <FormUser profile="/img/profile.jpg" title="Company Info" fields={formFields} />

      {/* Bank Account Sections */}
      <BoxPrimary>
        <div className="text-[#00783F] text-md">Bank Account 1</div>
        <Row className="my-3" gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Account Title" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Account Number" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Bank Name" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Bank Branch" />
          </Col>
        </Row>

        <div className="text-[#00783F] text-md">Bank Account 2</div>
        <Row className="my-3" gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Account Title" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Account Number" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Bank Name" />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Bank Branch" />
          </Col>
        </Row>
      </BoxPrimary>

      {/* Contact Person Section */}
      <BoxPrimary>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-lg font-semibold">Contact Person</span>
          <ActionButton mode="add" text="Add" onClick={() => { }} />
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-md">Person 1</span>
        </div>
        <Row gutter={[16, 16]} className="mb-6">
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

        <hr />

        <div className="mt-4">
          <span className="text-[#00783F] text-md">Person 2</span>
        </div>
        <Row gutter={[16, 16]} className="mt-4">
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
      </BoxPrimary>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/expenses/advance")} />
        <ActionButton mode="update" text="Update" onClick={() => navigate("/expenses/advance")} />
      </div>
    </MainLayout>
  );
}
