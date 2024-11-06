import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";

export default function Traveling() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const navigate = useNavigate();

  const filters = [
    {
      key: "sub_dealer",
      type: "text",
      label: "Sub Dealer",
      placeholder: "All",
    },
    {
      key: "contact_name",
      type: "text",
      label: "Contact Name",
      placeholder: "All",
    },
    {
      key: "phone",
      type: "text",
      label: "Phone",
      placeholder: "Phone",
    },
    {
      key: "status",
      type: 'select',
      label: "Status",
      placeholder: "All",
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Pending', label: 'Pending' },
      ],
    },
  ];
  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  const actionItems = [
    { key: "1", label: <ItemDropDown mode="edit" link="/customer/sub-dealer/edit" /> },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Sub Dealer Name", width: 200, dataIndex: "subDealerName", align: "left" },
    { title: "Contact Name", width: 200, dataIndex: "contactName", align: "left" },
    { title: "Address", width: 300, dataIndex: "address", align: "left" },
    { title: "Phone", width: 150, dataIndex: "phone", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];
  
  useEffect(() => {
    const dataSource = [
      {
        key: 1,
        subDealerName: "เพื่อนชาวนา",
        contactName: "นางสาวกรกชสุดา นิตรสัมพันธ์",
        address: "เลขที่ 71 หมู่1 ต.สาลี อ.บางปลาม้า จ.สุพรรณบุรี",
        phone: "081-639 9745",
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
        subDealerName: "ดอนโพธิ์ทอง",
        contactName: "นางสาวประภาพรรณ ปลั่งพานิช",
        address: "เลขที่ 216 หมู่1 ต.ดอนโพธิ์ทอง อ.เมือง จ.สุพรรณบุรี",
        phone: "081-1922292",
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
        subDealerName: "จุ้ยพันธุ์ข้าว",
        contactName: "นางสาวนิตา นำประเสริฐสุข",
        address: "เลขที่ 17 หมู่2 ต.ตลิ่งชัน อ.เมือง จ.สุพรรณบุรี",
        phone: "080-9963214",
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

  return (
    <MainLayout loading={loading}>

      <div className="flex items-center justify-between">
        <div className="title-page">Traveling</div>
        <ActionButton mode="create" text="Create" onClick={(e) => navigate("/customer/sub-dealer/create")} />
      </div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        filters={filters}
      />

      <BoxPrimary>
        <TableComponent header={header} dataSource={dataSource} />
      </BoxPrimary>

    </MainLayout>
  );
}
