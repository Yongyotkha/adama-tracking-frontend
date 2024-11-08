import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Input, DatePicker, Col, Row, Dropdown, Tabs } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import FormUser from "../../../components/form_user/FormUser";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import TableComponent from "../../../components/table/TableComponent";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";

export default function EditInformation() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState([]);
  const [activeTabKey, setActiveTabKey] = useState("profile");

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

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Code", width: 100, dataIndex: "code", align: "left" },
    { title: "Dealer Name", width: 200, dataIndex: "dealerName", align: "left" },
    { title: "Address", width: 300, dataIndex: "address", align: "left" },
    { title: "Contact Name", width: 200, dataIndex: "contactName", align: "left" },
    { title: "Mobile Phone", width: 150, dataIndex: "mobilePhone", align: "center" },
    { title: "Group Code", width: 150, dataIndex: "groupCode", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const actionItems = [
    { key: "1", label: <ItemDropDown mode="edit" link="/customer/dealer/edit-info" /> },
  ];

  useEffect(() => {
    const dataSource = [
      {
        key: 1,
        code: "365004",
        dealerName: "Monggutthong Ltd.",
        address: "89/1 หมู่ 4 ต.สพรรณบุรี-บางบัวทอง ต.สนามชัย อ.เมือง จ.สพรรณบุรี 72000",
        contactName: "Mr. Charuen Sinsuantang",
        mobilePhone: "-",
        groupCode: "FMK Customers",
        status: <BadgeStatus text="Active" bgColor="#009845" textColor="#FFFFFF" />,
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
            </a>
          </Dropdown>
        ),
      },
      {
        key: 2,
        code: "335001",
        dealerName: "Bangbuathong Panich Co.,Ltd.",
        address: "15/2-5 หมู่ 13 ถ.บางบัวทอง-สุพรรณบุรี ต.บางบัวทอง อ.บางบัวทอง จ.นนทบุรี",
        contactName: "Mr. Thanyanop Watthananit",
        mobilePhone: "081-852-1841",
        groupCode: "FMK Customers",
        status: <BadgeStatus text="Active" bgColor="#009845" textColor="#FFFFFF" />,
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
            </a>
          </Dropdown>
        ),
      },
      {
        key: 3,
        code: "321005",
        dealerName: "Agricare Co.,Ltd.",
        address: "88 หมู่ที่ 1 ต.หนองบัว อ.พัฒนานิคม จ.ลพบุรี",
        contactName: "Somsak Sumatechotimatha",
        mobilePhone: "081-994-4747",
        groupCode: "FMK Customers",
        status: <BadgeStatus text="Active" bgColor="#009845" textColor="#FFFFFF" />,
        action: (
          <Dropdown menu={{ items: actionItems }} placement="bottom">
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
            </a>
          </Dropdown>
        ),
      },
    ];

    setDataSource(dataSource);
  }, []);

  // Define the tab items
  const items = [
    {
      key: "profile",
      label: <span className="tab-title">Profile</span>,
      children: (
        <>
          {/* Profile : Tab (start)*/}
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
          {/* Profile : Tab (end)*/}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <ActionButton mode="back" text="Back" onClick={() => navigate("/customer/dealer")} />
            <ActionButton mode="update" text="Update" onClick={() => navigate("/customer/dealer")} />
          </div>
        </>
      ),
    },
    {
      key: "network",
      label: <span className="tab-title">Network</span>,
      children: (
        <>

          {/* Network : Tab (start)*/}
          <BoxPrimary>
            <TableComponent header={header} dataSource={dataSource} />
          </BoxPrimary>
          {/* Network : Tab (end)*/}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <ActionButton mode="back" text="Back" onClick={() => navigate("/customer/dealer")} />
            <ActionButton mode="update" text="Update" onClick={() => navigate("/customer/dealer")} />
          </div>
        </>
      ),
    },
  ];

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Information</div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTabKey}
        onChange={handleTabChange}
        className="custom-tabs"
        items={items}
      />

    </MainLayout>
  );
}
