import React, { useEffect, useMemo, useState } from "react";
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

const COMMON_FILTERS_BASE = [
  {
    key: "sale_id",
    type: "select",
    label: "Sale Name",
    placeholder: "All",
    moderef: true,
  },
  {
    key: "dealer_id",
    type: "select",
    label: "Dealer Name",
    placeholder: "All",
    disabled: true,
    moderef: true,
  },
  {
    key: "sub_dealer_id",
    type: "select",
    label: "Sub Dealer Name",
    placeholder: "All",
    disabled: true,
    moderef: true,
  },
  { key: "contact_name", type: "text", label: "Contact Name" },
  { key: "created_at", type: "date", label: "Created Date" },
  {
    key: "status_code",
    type: "select",
    label: "Status",
    placeholder: "All",
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
    shopType: "dealer",
  },
  sub_dealer: {
    apiPath: paths.pathCustomerRegis,
    label: <span className="tab-title">Sub Dealer</span>,
    shopType: "sub_dealer",
  },
  farmer: {
    apiPath: paths.pathCustomerRegis,
    label: <span className="tab-title">Farmer</span>,
    shopType: "farmer",
  },
};

export default function RegisteredCustomerList() {
  const navigate = useNavigate();

  const [loading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("dealer");
  const [dataSource, setDataSource] = useState([]);

  const [filterValues, setFilterValues] = useState({
    status_code: "",
    sale_id: "",
    dealer_id: "",
    sub_dealer_id: "",
    contact_name: "",
    created_at: "",
  });

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {
      status_code: "",
      sale_id: "",
      dealer_id: "",
      sub_dealer_id: "",
    },
  });

  const [sales, setSales] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [subDealers, setSubDealers] = useState([]);

  const currentTab = tabConfig[activeTab];

  const fetchSales = async () => {
    try {
      // const res = await useServiceAPI.get(paths.pathMasterSaleTeam, {});
      const res = await useServiceAPI.get(paths.pathMasterSaleSingle, {});
      const list = Array.isArray(res?.data) ? res.data : [];
      setSales(list.map((x) => ({ id: Number(x.id), name: x.name })));
    } catch (e) {
      console.error("fetchSales failed", e);
      setSales([]);
    }
  };

  const fetchDealersBySale = async (saleId) => {
    if (!saleId) {
      setDealers([]);
      return;
    }
    try {
      const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
        user_id: saleId,
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      setDealers(
        list.map((x) => ({
          id: Number(x.id ?? x.dealer_id ?? x.code),
          name: x.name ?? x.dealer_name ?? x.title,
        }))
      );
    } catch (e) {
      console.error("fetchDealersBySale failed", e);
      setDealers([]);
    }
  };

  const fetchSubDealers = async () => {
    try {
      const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {});
      const list = Array.isArray(res?.data) ? res.data : [];
      setSubDealers(
        list.map((x) => ({
          id: Number(x.sub_dealer_id ?? x.id ?? x.code),
          name: x.sub_dealer_name ?? x.name ?? x.title,
        }))
      );
    } catch (e) {
      console.error("fetchSubDealers failed", e);
      setSubDealers([]);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchSubDealers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtersWithOptions = useMemo(() => {
    const saleSelected = !!filterValues.sale_id;
    const dealerSelected = !!filterValues.dealer_id;

    return COMMON_FILTERS_BASE.map((f) => {
      if (f.key === "sale_id") return { ...f, options: sales };
      if (f.key === "dealer_id") {
        return {
          ...f,
          options: dealers,
          disabled: !saleSelected,
        };
      }
      if (f.key === "sub_dealer_id") {
        return {
          ...f,
          options: subDealers,
          disabled: !dealerSelected && activeTab !== "farmer",
        };
      }
      return f;
    });
  }, [sales, dealers, subDealers, filterValues.sale_id, filterValues.dealer_id, activeTab]);

  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      shop_type: currentTab.shopType,
      sale_id: filters.sale_id || "",
      dealer_id: filters.dealer_id || "",
      sub_dealer_id: filters.sub_dealer_id || "",
      contact_name: filters.contact_name || "",
      created_at: filters.created_at || "",
      status_code: filters.status_code ?? "",
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(currentTab.apiPath, requestData);
      if (response.status === 200) {
        const result = response.data || {};
        const customers = (result.data && result.data.data) || result.data || [];

        let newData = [];
        if (currentTab.shopType === "dealer") {
          newData = customers.map((row, index) => ({
            key: index + 1 + (current - 1) * pageSize,
            id: row.id,
            dealer_id: row.shop_code,
            dealer_name: row.shop_name_custom,
            sale_name: row.sale_name,
            contact_name: row.name_th,
            phone: row.phone_number,
            subscribed: row.line_join_last_datetime?.split(" ")[0] || "-",
            point: row.balance_point,
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
                            "/points/line/register-customer-list/" +
                              (item.action || "").toLowerCase(),
                            { state: { id: row.id, pageCode: "customer_regis" } }
                          );
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
        } else if (currentTab.shopType === "sub_dealer") {
          newData = customers.map((row, index) => ({
            key: index + 1 + (current - 1) * pageSize,
            id: row.id,
            dealer_id: row.shop_code,
            dealer_name: row.dealer_name,
            sale_name: row.sale_name,
            shop_name: row.shop_name,
            contact_name: row.name_th,
            phone: row.phone_number,
            subscribed: row.line_join_last_datetime?.split(" ")[0] || "-",
            point: row.balance_point,
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
                            "/points/line/register-customer-list/" +
                              (item.action || "").toLowerCase(),
                            { state: { id: row.id, pageCode: "customer_regis" } }
                          );
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
        } else if (currentTab.shopType === "farmer") {
          newData = customers.map((row, index) => ({
            key: index + 1 + (current - 1) * pageSize,
            id: row.id,
            dealer_id: row.shop_code,
            sub_dealer_name: row.sub_dealer_name,
            dealer_name: row.dealer_name,
            sale_name: row.sale_name,
            shop_name_custom: row.shop_name_custom,
            contact_name: row.name_th,
            phone: row.phone_number,
            subscribed: row.line_join_last_datetime?.split(" ")[0] || "-",
            point: row.balance_point,
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
                            "/points/line/register-customer-list/" +
                              (item.action || "").toLowerCase(),
                            { state: { id: row.id, pageCode: "customer_regis" } }
                          );
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
        }

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

  const handleFilterChangeLive = (updatedValues) => {
    const nextValues = { ...(updatedValues || {}) };
    const saleId = nextValues?.sale_id || "";
    const prevSaleId = filterValues?.sale_id || "";

    if (String(saleId) !== String(prevSaleId)) {
      fetchDealersBySale(saleId);
      nextValues.dealer_id = "";
      nextValues.sub_dealer_id = "";
    }

    if (!saleId && prevSaleId) {
      setDealers([]);
      nextValues.dealer_id = "";
      nextValues.sub_dealer_id = "";
    }

    if (!nextValues.dealer_id) {
      nextValues.sub_dealer_id = "";
    }

    setFilterValues(nextValues);
  };

  const handleSearch = (filters) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: {
        status_code: "",
        sale_id: "",
        dealer_id: "",
        sub_dealer_id: "",
        ...filters,
      },
    }));
  };

  const handleClear = () => {
    setDealers([]);
    setFilterValues({
      status_code: "",
      sale_id: "",
      dealer_id: "",
      sub_dealer_id: "",
      contact_name: "",
      created_at: "",
    });

    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: {
        status_code: "",
        sale_id: "",
        dealer_id: "",
        sub_dealer_id: "",
      },
    }));
  };

  const header = useMemo(() => {
    if (currentTab.shopType === "dealer") {
      return [
        { title: "Sales Name", dataIndex: "sale_name" },
        { title: "Dealer Name", dataIndex: "dealer_name" },
        { title: "Contact Name", dataIndex: "contact_name" },
        { title: "Contact Number", dataIndex: "phone" },
        { title: "Subscribed", dataIndex: "subscribed" },
        { title: "Current Points", dataIndex: "point" },
        { title: "Status", dataIndex: "status" },
        { title: "Action", dataIndex: "action", align: "center" },
      ];
    }
    if (currentTab.shopType === "sub_dealer") {
      return [
        { title: "Sales Name", dataIndex: "sale_name" },
        { title: "Dealer Name", dataIndex: "dealer_name" },
        { title: "Sub Dealer Name", dataIndex: "shop_name" },
        { title: "Contact Name", dataIndex: "contact_name" },
        { title: "Contact Number", dataIndex: "phone" },
        { title: "Subscribed", dataIndex: "subscribed" },
        { title: "Current Points", dataIndex: "point" },
        { title: "Status", dataIndex: "status" },
        { title: "Action", dataIndex: "action", align: "center" },
      ];
    }
    return [
      { title: "Sales Name", dataIndex: "sale_name" },
      { title: "Dealer Name", dataIndex: "dealer_name" },
      { title: "Sub Dealer Name", dataIndex: "sub_dealer_name" },
      { title: "Farmer Name", dataIndex: "shop_name_custom" },
      { title: "Contact Name", dataIndex: "contact_name" },
      { title: "Contact Number", dataIndex: "phone" },
      { title: "Subscribed", dataIndex: "subscribed" },
      { title: "Current Points", dataIndex: "point" },
      { title: "Status", dataIndex: "status" },
      { title: "Action", dataIndex: "action", align: "center" },
    ];
  }, [currentTab.shopType]);

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
    setDealers([]);
    setFilterValues({
      status_code: "",
      sale_id: "",
      dealer_id: "",
      sub_dealer_id: "",
      contact_name: "",
      created_at: "",
    });

    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: {
        status_code: "",
        sale_id: "",
        dealer_id: "",
        sub_dealer_id: "",
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

      <Filter
        filters={filtersWithOptions}
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleFilterChangeLive}
        values={filterValues}
      />

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