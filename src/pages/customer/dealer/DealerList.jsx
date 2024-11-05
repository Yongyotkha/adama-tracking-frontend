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

export default function DealerList() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const navigate = useNavigate();

  const filters = [
    {
      key: "dealer",
      type: "select",
      label: "Dealer",
      placeholder: "All",
      options: [
        { value: 'Monggutthong Ltd.', label: 'Monggutthong Ltd.' },
        { value: 'Bangbuathong Panich Co.,Ltd.', label: 'Bangbuathong Panich Co.,Ltd.' },
      ],
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
    { key: "1", label: <ItemDropDown mode="edit" link="/dealer/edit-info" /> },
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

  return (
    <MainLayout loading={loading}>

      <div className="title-page">Dealer</div>

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
