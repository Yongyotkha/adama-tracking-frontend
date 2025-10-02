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

// ✅ ใช้ฟิลเตอร์เดียวกันกับ API ทั้ง dealer และ sub_dealer
// - customer_name (text)
// - contact_name (text)
// - created_at (date; YYYY-MM-DD)
// - status_code (select 1/0)
const COMMON_FILTERS = [
  { key: "customer_name", type: "text", label: "Customer Name" },
  { key: "contact_name", type: "text", label: "Contact Name" },
  { key: "created_at", type: "date", label: "Created Date" },
  {
    key: "status_code",
    type: "select",
    label: "Status",
    options: [
      { id: "0", name: "Inactive" },
      { id: "1", name: "Active" },
    ],
  },
];

const tabConfig = {
  dealer: {
    apiPath: paths.pathCustomerRegis,
    label: <span className="tab-title">Dealer</span>,
    filters: COMMON_FILTERS,
    shopType: "dealer",
  },
  sub_dealer: {
    apiPath: paths.pathCustomerRegis,
    label: <span className="tab-title">Sub Dealer</span>,
    filters: COMMON_FILTERS,
    shopType: "sub_dealer",
  },
  farmer: {
    apiPath: paths.pathCustomerRegis,
    label: <span className="tab-title">Farmer</span>,
    filters: COMMON_FILTERS,
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
    filters: {
      // ค่าเริ่มต้น status_code = All → ส่งค่าว่าง
      status_code: "",
    },
  });

  const currentTab = tabConfig[activeTab];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    // ✅ จัด payload ให้ตรงตามตัวอย่างที่ให้มา
    // {
    //   "shop_type": "sub_dealer",
    //   "customer_name": "การเกษตร",
    //   "contact_name": "พัฒนางกูร",
    //   "created_at": "2025-09-18",
    //   "status_code": 1
    // }
    const requestData = {
      shop_type: currentTab.shopType,
      customer_name: filters.customer_name || "",
      contact_name: filters.contact_name || "",
      created_at: filters.created_at || "", // Filter.jsx ส่ง YYYY-MM-DD มาให้แล้ว
      status_code: filters.status_code ?? "", // default All
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(currentTab.apiPath, requestData);
      if (response.status === 200) {
        const result = response.data || {};
        const customers = (result.data && result.data.data) || result.data || [];

        const newData = customers.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          id: row.id,
          dealer_id: row.shop_code,
          dealer_name: row.shop_name,
          contact_name: `${row.contact_first_name ?? ""} ${row.contact_last_name ?? ""}`.trim(),
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
                items: (row.action || []).map((item, idx) => ({
                  key: idx,
                  label: (
                    <ItemDropDown
                      mode={(item.action || "").toLowerCase()}
                      onClick={() => {
                        navigate(
                          "/points/line/register-customer-list/" + (item.action || "").toLowerCase(),
                          {
                            state: { id: row.id, pageCode: "customer_regis" },
                          }
                        );
                      }}
                    />
                  ),
                })),
              }}
              placement="bottomRight"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="action" className="w-5 h-5 inline-block" />
              </a>
            </Dropdown>
          ),
        }));

        setDataSource(newData);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total:
              (typeof result.data?.records_filtered === "number"
                ? result.data.records_filtered
                : result.records_filtered) || 0,
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
      filters: { status_code: "" }, // reset → All
    }));
  };

  const header = [
    // { title: "Image", dataIndex: "image", render: () => <img src="/img/default-avatar.png" className="w-8 h-8 rounded-full" /> },
    // { title: "Dealer ID", dataIndex: "dealer_id" },
    { title: "Customer Name", dataIndex: "dealer_name" },
    { title: "Contact Name", dataIndex: "contact_name" },
    { title: "Contact Number", dataIndex: "phone" },
    { title: "Subscribed", dataIndex: "subscribed" },
    { title: "Current points", dataIndex: "point" },
    { title: "Status", dataIndex: "status" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    JSON.stringify(tableParams.filters),
  ]);

  useEffect(() => {
    // รีเซ็ตฟิลเตอร์เมื่อเปลี่ยนแท็บ เพื่อไม่ให้เงื่อนไขจากแท็บก่อนหน้าติดมาด้วย
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: { status_code: "" }, // Default = All
    }));

  }, [activeTab]);

  // แยก effect สำหรับยิง API ตาม pagination/filters
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    JSON.stringify(tableParams.filters),
  ]);

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Registered Customer</div>

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

      <Filter filters={currentTab.filters} onSearch={handleSearch} onClear={handleClear} />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
          onChange={(pagination) => {
            setTableParams((prev) => ({ ...prev, pagination }));
          }}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
