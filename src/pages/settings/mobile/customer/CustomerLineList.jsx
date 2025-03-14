import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import { Dropdown } from "antd";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";

export default function CustomerLineList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Mock Data for API response
      const mockData = [
        {
          id: 1,
          shop_name: "ศิลาเกษตร",
          contact_name: "Firstname Lastname",
          phone: "055-769042",
          address: "91/7 ซ. นครปฐม",
          point: 10,
          register_date: "01/01/2025",
          status: "Active",
          image_profile: "/img/profile.jpg",
        },
        {
          id: 2,
          shop_name: "กำนันวงษ์สัักดิ์",
          contact_name: "Firstname Lastname",
          phone: "081-8879155",
          address: "99/11 บ้านไร่ อุทัยธานี",
          point: 10,
          register_date: "01/01/2025",
          status: "Active",
          image_profile: "/img/profile.jpg",
        },
      ];

      setDataSource(
        mockData.map((customer, index) => ({
          key: index + 1,
          image_profile: <img src={customer.image_profile} alt="Profile" className="w-10 h-10 rounded-full" />,
          shop_name: customer.shop_name,
          contact_name: customer.contact_name,
          phone: customer.phone,
          address: customer.address,
          point: customer.point,
          register_date: customer.register_date,
          status: <BadgeStatus text={customer.status} bgColor="green" textColor="white" />,
          action: (
            <Dropdown
              menu={{
                items: [
                  { key: "edit", label: <ItemDropDown mode="edit" onClick={() => navigate(`edit/${customer.id}`)} /> },
                  { key: "view", label: <ItemDropDown mode="view" onClick={() => navigate(`view/${customer.id}`)} /> },
                ],
              }}
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5" />
              </a>
            </Dropdown>
          ),
        }))
      );
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filters = [
    { key: "shop_name", type: "text", label: "Shop Name" },
    { key: "contact_name", type: "text", label: "Contact Name" },
    { key: "date", type: "date", label: "Register Date" },
  ];

  const handleSearch = (filters) => {
    setTableParams({ ...tableParams, pagination: { ...tableParams.pagination, current: 1 }, filters });
  };

  const handleClear = () => {
    setTableParams({ ...tableParams, filters: {} });
  };

  const header = [
    { title: "No", dataIndex: "key", align: "left" },
    { title: "Image", dataIndex: "image_profile", align: "center" },
    { title: "Shop Name", dataIndex: "shop_name", align: "left" },
    { title: "Contact Name", dataIndex: "contact_name", align: "left" },
    { title: "Phone No", dataIndex: "phone", align: "left" },
    { title: "Address", dataIndex: "address", align: "left" },
    { title: "Point", dataIndex: "point", align: "left" },
    { title: "Register Date", dataIndex: "register_date", align: "left" },
    { title: "Status", dataIndex: "status", align: "left" },
    { title: "Action", dataIndex: "action", align: "left" },
  ];
  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Customer List</div>
        <ActionButton mode="create" text="Create" onClick={() => navigate("create")} />
      </div>
      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />
      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
