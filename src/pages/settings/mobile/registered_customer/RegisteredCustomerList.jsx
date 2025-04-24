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

export default function RegisteredCustomerList() {
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
      const mockData = [
        {
          id: 1,
          shop_name: "จรุงรักษ์เกษตร",
          contact_name: "Krariroek Ruangkol",
          phone: "02-911-0653",
          address: "54 ซ.รัชประชา 5 ถ.รัชดาภิเษก เขตจตุจักร แขวงลาดยาว กทม.10150",
          point: 10,
          register_date: "01/01/2025",
          status: "Active",
          image_profile: "/img/profile.jpg",
        },
        {
          id: 2,
          shop_name: "กำนันบงลักษณ์",
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
          shop_name: (
            <div className="flex items-center gap-2">
              <img src={customer.image_profile} alt="avatar" className="w-8 h-8 rounded-full" />
              <span>{customer.shop_name}</span>
            </div>
          ),
          contact_name: customer.contact_name,
          phone: customer.phone,
          address: customer.address,
          point: customer.point,
          register_date: customer.register_date,
          status: (
            <BadgeStatus text={customer.status} bgColor="green" textColor="white" />
          ),
          action: (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "edit",
                    label: (
                      <ItemDropDown
                        mode="edit"
                        onClick={() => navigate(`detail?${customer.id}`)}
                      />
                    ),
                  },
                ],
              }}
              // trigger={["click"]}
            >
              <a onClick={(e) => e.preventDefault()}>
                <img
                  src="/img/icons/action.png"
                  alt="action"
                  className="inline-block w-5 h-5"
                />
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
    { key: "contact_name", type: "text", label: "Customer Name" },
    { key: "date", type: "date", label: "Date" },
  ];

  const handleSearch = (filters) => {
    setTableParams({
      ...tableParams,
      pagination: { ...tableParams.pagination, current: 1 },
      filters,
    });
  };

  const handleClear = () => {
    setTableParams({ ...tableParams, filters: {} });
  };

  const header = [
    { title: "No", dataIndex: "key", align: "left", width: 50 },
    { title: "Shop Name", dataIndex: "shop_name", align: "left" },
    { title: "Customer Name", dataIndex: "contact_name", align: "left" },
    { title: "Contact Number", dataIndex: "phone", align: "left" },
    { title: "Point", dataIndex: "point", align: "center" },
    { title: "Register Date", dataIndex: "register_date", align: "center" },
    { title: "Status", dataIndex: "status", align: "center" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Registered Customer</div>
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

