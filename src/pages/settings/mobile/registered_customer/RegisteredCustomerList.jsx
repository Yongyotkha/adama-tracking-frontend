import React, { useEffect, useState } from "react";
import { Tabs, Dropdown } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import { useNavigate } from "react-router-dom";

const { TabPane } = Tabs;

const tabConfig = {
  dealer: {
    apiPath: paths.pathCustomerRegis,
    label: <span className="tab-title">Dealer</span>,
    filters: [
      { key: "shop_name_custom", type: "text", label: "Dealer Name" },
      { key: "contact_name", type: "text", label: "Customer Name" },
      {
        key: "status_code",
        type: "select",
        label: "Status",
        options: [
          { id: "1", name: "Active" },
          { id: "0", name: "Inactive" },
        ],
      },
    ],
    shopType: "dealer",
  },
  sub_dealer: {
    apiPath: paths.pathCustomerRegis,
    label: <span className="tab-title">Sub Dealer</span>,
    filters: [],
    shopType: "sub_dealer",
  },
  farmer: {
    apiPath: paths.pathCustomerRegis,
    label: <span className="tab-title">Farmer</span>,
    filters: [],
    shopType: "farmer",
  },
};

export default function RegisteredCustomerList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dealer");
  const [dataSource, setDataSource] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  const currentTab = tabConfig[activeTab];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      shop_type: currentTab.shopType,
      shop_name_custom: filters.shop_name_custom || "",
      contact_name: filters.contact_name || "",
      status_code: filters.status_code ?? "",
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(currentTab.apiPath, requestData);
      if (response.status === 200) {
        const result = response.data || {};
        const customers = result.data || [];

        const newData = customers.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          id: row.id,
          dealer_id: row.shop_code,
          dealer_name: row.shop_name,
          contact_name: `${row.contact_first_name} ${row.contact_last_name}`,
          phone: row.phone_number,
          subscribed: row.line_join_last_datetime?.split(" ")[0] || "-",
          point: "1,000",
          status: (
            <BadgeStatus
              text={row.status_name}
              bgColor={row.status_bg_color}
              textColor={row.status_color}
            />
          ),
          action: (
            <Dropdown
              menu={{
                items: row.action.map((item, idx) => ({
                  key: idx,
                  label: (
                    <ItemDropDown
                      mode={item.action.toLowerCase()}
                      onClick={() => {
                      navigate('/points/line/register-customer-list/' + item.action.toLowerCase(), {
                        state: {
                          id: row.id,
                          pageCode: 'customer_regis',
                        },
                      });
                      }}
                    />
                  ),
                })),
              }}
              placement="bottomRight"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img
                  src="/img/icons/action.png"
                  alt="action"
                  className="w-5 h-5 inline-block"
                />
              </a>
            </Dropdown>
          ),
        }));

        console.log(newData);
        setDataSource(newData);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: result.records_filtered || 0,
          },
        }));
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSearch = (filters) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters,
    }));
  };

  const handleClear = () => {
    setTableParams((prev) => ({
      ...prev,
      filters: {},
    }));
  };

  const header = [
    { title: "Image", dataIndex: "image", render: () => <img src="/img/default-avatar.png" className="w-8 h-8 rounded-full" /> },
    { title: "Dealer ID", dataIndex: "dealer_id" },
    { title: "Dealer Name", dataIndex: "dealer_name" },
    { title: "Customer Name", dataIndex: "contact_name" },
    { title: "Contact Number", dataIndex: "phone" },
    { title: "Subscribed", dataIndex: "subscribed" },
    { title: "Current points", dataIndex: "point" },
    { title: "Status", dataIndex: "status" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab, tableParams.pagination.current, tableParams.pagination.pageSize, JSON.stringify(tableParams.filters)]);

  return (
    <MainLayout loading={loading}>
      <div className="title-page mb-4">Registered Customer</div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="custom-tabs"
        items={Object.keys(tabConfig).map((key) => ({
          key,
          label: tabConfig[key].label,
          children: null,
        }))}
      />


      <Filter
        filters={currentTab.filters}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
          onChange={(pagination) => {
            setTableParams((prev) => ({
              ...prev,
              pagination,
            }));
          }}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
