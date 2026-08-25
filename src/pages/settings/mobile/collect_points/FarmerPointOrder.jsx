import React, { useEffect, useState, useContext } from "react";
import { Dropdown, Modal, Tabs } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import { AuthContext } from "../../../../contexts/AuthContext";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { loadListPageState, saveListPageState } from "../../../../utils/listPageState";

const { TabPane } = Tabs;

const STATUS_OPTIONS_LIST = [
  { id: "ODC", name: "Complete" },
  { id: "ODW", name: "Waiting for Approve" },
  { id: "ODI", name: "Waiting for Create" },
  { id: "ODD", name: "Draft" },
  { id: "ODR", name: "Reject" },
];

export default function FarmerPointOrder() {
  const navigate = useNavigate();
  const { showMsg, showNotification } = useContext(AuthContext);
  const PAGE_STATE_KEY = "farmer-points-order-list";
  const persistedState = loadListPageState(PAGE_STATE_KEY, {});

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(persistedState.activeTab || "list");

  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: persistedState.tableParams?.pagination?.current || 1,
      pageSize: persistedState.tableParams?.pagination?.pageSize || 10,
    },
    filters: persistedState.tableParams?.filters || {},
    sortOrder: persistedState.tableParams?.sortOrder || "desc",
    sortField: persistedState.tableParams?.sortField || "document_date",
  });
  const [filterValues, setFilterValues] = useState(persistedState.filterValues || {});

  const [requestDataSource, setRequestDataSource] = useState([]);
  const [requestTableLoading, setRequestTableLoading] = useState(false);
  const [requestTableParams, setRequestTableParams] = useState({
    pagination: {
      current: persistedState.requestTableParams?.pagination?.current || 1,
      pageSize: persistedState.requestTableParams?.pagination?.pageSize || 50,
    },
    filters: persistedState.requestTableParams?.filters || {},
    sortOrder: persistedState.requestTableParams?.sortOrder || "desc",
    sortField: persistedState.requestTableParams?.sortField || "document_date",
  });
  const [requestFiltersValues, setRequestFiltersValues] = useState(persistedState.requestFiltersValues || {});

  const [saleList, setSaleList] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [subDealerOptions, setSubDealerOptions] = useState([]);
  const [farmerOptions, setFarmerOptions] = useState([]);
  const [permission, setPermission] = useState([]);

  const { confirm } = Modal;

  const normalizeFilters = (raw = {}) => {
    const next = { ...raw };
    if (
      !next.dater ||
      (Array.isArray(next.dater) && next.dater.length === 0) ||
      (Array.isArray(next.dater) && next.dater.every((v) => !v))
    ) {
      delete next.dater;
    }
    return next;
  };

  const hasValidDater = (dater) => {
    return (
      dater &&
      (!Array.isArray(dater) ||
        (Array.isArray(dater) && dater.length > 0 && dater.some((v) => v)))
    );
  };

  const hasSale = !!filterValues.sale;
  const hasDealer = !!filterValues.dealer;
  const hasSubDealer = !!filterValues.sub_dealer;

  const filters = [
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealer", type: "select", label: "Dealer", placeholder: "All", options: dataDealer, moderef: true, disabled: !hasSale },
    { key: "sub_dealer", type: "select", label: "Sub Dealer", placeholder: "All", options: subDealerOptions, disabled: !hasDealer },
    { key: "farmer", type: "select", label: "Farmer", placeholder: "All", options: farmerOptions, disabled: !hasSubDealer },
    { key: "order_no", type: "text", label: "Order No", placeholder: "Order No" },
    { key: "status_code", type: "select", label: "Status", placeholder: "All", options: STATUS_OPTIONS_LIST },
    { key: "dater", type: "dater", label: "Date", placeholder: "Date" },
  ];

  const reqHasSale = !!requestFiltersValues.sale;
  const reqHasDealer = !!requestFiltersValues.dealer;
  const reqHasSubDealer = !!requestFiltersValues.sub_dealer;

  const requestFilters = [
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealer", type: "select", label: "Dealer", placeholder: "All", options: dataDealer, moderef: true, disabled: !reqHasSale },
    { key: "sub_dealer", type: "select", label: "Sub Dealer", placeholder: "All", options: subDealerOptions, disabled: !reqHasDealer },
    { key: "farmer", type: "select", label: "Farmer", placeholder: "All", options: farmerOptions, disabled: !reqHasSubDealer },
    { key: "order_no", type: "text", label: "Order No", placeholder: "Order No" },
    { key: "status_code", type: "select", label: "Status", placeholder: "All", options: STATUS_OPTIONS_LIST },
    { key: "dater", type: "dater", label: "Date", placeholder: "Date" },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Order No", width: 150, dataIndex: "orderNo", align: "left" },
    { title: "Sales", width: 200, dataIndex: "sale", align: "left" },
    { title: "Dealer", width: 200, dataIndex: "dealer", align: "left" },
    { title: "Sub Dealer", width: 200, dataIndex: "sub_dealer", align: "left" },
    { title: "Farmer", width: 200, dataIndex: "farmer", align: "left" },
    { title: "Value (THB)", width: 100, dataIndex: "value", align: "right" },
    { title: "Order Date", width: 150, dataIndex: "orderDate", align: "center" },
    { title: "Points", width: 150, dataIndex: "point", align: "center" },
    { title: "Status", width: 150, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const headerRequest = [
    { title: "No", width: 60, dataIndex: "key", align: "center" },
    { title: "Order No", width: 150, dataIndex: "document_number", align: "left" },
    { title: "Sales", width: 200, dataIndex: "sale", align: "left" },
    { title: "Dealer", width: 220, dataIndex: "dealer", align: "left" },
    { title: "Sub Dealer", width: 200, dataIndex: "sub_dealer", align: "left" },
    { title: "Farmer", width: 200, dataIndex: "farmer", align: "left" },
    { title: "Request Date", width: 160, dataIndex: "document_date", align: "center" },
    { title: "Status", width: 160, dataIndex: "status", align: "center" },
    { title: "Action", width: 120, dataIndex: "action", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    const sortField = tableParams.sortField || "document_date";

    const requestData = {
      user_id: filters.sale || "",
      dealer_id: filters.dealer || "",
      sub_dealer_id: filters.sub_dealer || "",
      farmer_id: filters.farmer || "",
      keyword: filters.order_no || "",
      status_code: filters.status_code || " ",
      page: "all",
      use_flag: 1,
      orderby_column: sortField || "document_number",
      orderby: "desc",
      platform: "web",
      page_length: current,
      page_size: pageSize,
      mode: "farmer",
    };

    if (hasValidDater(filters.dater)) {
      requestData.dater = filters.dater;
    }

    try {
      const response = await useServiceAPI.get(paths.pathSalePointOrderList, requestData);
      if (response.status === 200) {
        const { data = [], records_filtered } = response.data || {};
        setPermission(response.data?.permission || {});

        const newDataSource = data.map((order, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          orderNo: order.document_number,
          sale: order.sale_name,
          sub_dealer: order.sub_dealer_name,
          dealer: order.dealer_name,
          farmer: order.farmer_name || "-",
          value: order.net_amount_display,
          point: order.point,
          orderDate: order.document_date,
          status: (
            <BadgeStatus
              text={order.status_transaction_name}
              bgColor={order.status_transaction_bg_color}
              textColor={order.status_transaction_color}
            />
          ),
          action: (
            <Dropdown
              menu={{
                items: (order.action || []).map((a, i) => {
                  const actionName = String(a.action).toLowerCase();
                  if (actionName === "view") {
                    return {
                      key: `view-${i}`,
                      label: (
                        <ItemDropDown
                          mode="view"
                          onClick={() =>
                            navigate("/points/line/farmer-points-list/view", {
                              state: { document_number: order.document_number, is_farmer: true, back_path: "/points/line/farmer-points-list" },
                            })
                          }
                        />
                      ),
                    };
                  }
                  if (actionName === "edit") {
                    return {
                      key: `edit-${i}`,
                      label: (
                        <ItemDropDown
                          mode="edit"
                          onClick={() =>
                            navigate("/points/line/farmer-points-list/edit", {
                              state: { document_number: order.document_number, is_farmer: true, back_path: "/points/line/farmer-points-list" },
                            })
                          }
                        />
                      ),
                    };
                  }
                  if (actionName === "delete") {
                    return {
                      key: `delete-${i}`,
                      label: (
                        <ItemDropDown
                          mode="delete"
                          onClick={() => handleDelete(order.document_number)}
                        />
                      ),
                    };
                  }
                  if (["refund", "refund point"].includes(actionName)) {
                    return {
                      key: `refund_point-${i}`,
                      label: (
                        <ItemDropDown
                          mode="refund_point"
                          onClick={() => handleRefund(order.document_number)}
                        />
                      ),
                    };
                  }
                  return null;
                }).filter(Boolean),
              }}
              placement="bottom"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="button icon" className="inline-block w-5 h-5 mr-2" />
              </a>
            </Dropdown>
          ),
        }));

        setDataSource(newDataSource);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: records_filtered || data.length },
        }));
      }
    } catch (e) {
      console.error("fetch Farmer Point Order failed", e);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchRequestData = async () => {
    setRequestTableLoading(true);
    const { current, pageSize } = requestTableParams.pagination;
    const filters = requestTableParams.filters || {};

    const requestData = {
      user_id: filters.sale || "",
      dealer_id: filters.dealer || "",
      sub_dealer_id: filters.sub_dealer || "",
      farmer_id: filters.farmer || "",
      keyword: filters.order_no || "",
      status_code: filters.status_code || "ODI",
      page: "all",
      use_flag: 1,
      orderby_column: "document_date",
      orderby: "desc",
      platform: "web",
      page_length: current,
      page_size: pageSize,
      mode: "farmer",
    };

    if (hasValidDater(filters.dater)) {
      requestData.dater = filters.dater;
    }

    try {
      const response = await useServiceAPI.get(paths.pathSalePointOrderList, requestData);
      if (response.status === 200) {
        const { data = [], records_filtered } = response.data || {};
        const rows = data.map((order, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          document_number: order.document_number,
          sale: order.sale_name,
          dealer: order.dealer_name,
          sub_dealer: order.sub_dealer_name,
          farmer: order.farmer_name || "-",
          document_date: order.document_date,
          status: (
            <BadgeStatus
              text={order.status_transaction_name}
              bgColor={order.status_transaction_bg_color}
              textColor={order.status_transaction_color}
            />
          ),
          action: (
            <Dropdown
              menu={{
                items: (order.action || []).map((a, i) => {
                  const actionName = String(a.action).toLowerCase();
                  if (actionName === "view") {
                    return {
                      key: `view-${i}`,
                      label: (
                        <ItemDropDown
                          mode="view"
                          onClick={() =>
                            navigate("/points/line/farmer-points-list/view", {
                              state: { document_number: order.document_number, is_farmer: true, back_path: "/points/line/farmer-points-list" },
                            })
                          }
                        />
                      ),
                    };
                  }
                  if (actionName === "edit") {
                    return {
                      key: `edit-${i}`,
                      label: (
                        <ItemDropDown
                          mode="edit"
                          onClick={() =>
                            navigate("/points/line/farmer-points-list/edit", {
                              state: { document_number: order.document_number, is_farmer: true, back_path: "/points/line/farmer-points-list" },
                            })
                          }
                        />
                      ),
                    };
                  }
                  if (actionName === "delete") {
                    return {
                      key: `delete-${i}`,
                      label: (
                        <ItemDropDown
                          mode="delete"
                          onClick={() => handleDelete(order.document_number)}
                        />
                      ),
                    };
                  }
                  return {
                    key: `act-${i}`,
                    label: (
                      <ItemDropDown
                        mode={actionName}
                        onClick={() =>
                          navigate(`/points/line/sales-points-request/${a.action}`, {
                            state: { document_number: order.document_number },
                          })
                        }
                      />
                    ),
                  };
                }),
              }}
              placement="bottom"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="button icon" className="inline-block w-5 h-5 mr-2" />
              </a>
            </Dropdown>
          ),
        }));

        setRequestDataSource(rows);
        setRequestTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: records_filtered || data.length },
        }));
      }
    } catch (e) {
      console.error("fetch request data failed", e);
    } finally {
      setRequestTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableParams.pagination.current, tableParams.pagination.pageSize, tableParams.filters]);

  useEffect(() => {
    if (activeTab === "request") {
      fetchRequestData();
    }
  }, [activeTab, requestTableParams.pagination.current, requestTableParams.pagination.pageSize, requestTableParams.filters]);

  const handleRefund = (documentNumber) => {
    let remark = "";
    confirm({
      title: "Refund Order ?",
      icon: <ExclamationCircleFilled />,
      content: (
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium text-gray-700">หมายเหตุ <span className="text-red-500">*</span></div>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="กรุณาใส่หมายเหตุ"
            onChange={(e) => { remark = e.target.value; }}
          />
        </div>
      ),
      centered: true,
      async onOk() {
        if (!remark || remark.trim() === "") {
          showMsg?.("warning", "กรุณาใส่หมายเหตุ");
          return Promise.reject();
        }
        try {
          const res = await useServiceAPI.put(paths.pathSalePointRefund, {
            document_number: documentNumber,
            remark: remark,
          });
          showNotification?.("success", res?.data?.message || "Refund successful");
          fetchData();
        } catch (error) {
          showNotification?.("warning", "Refund failed");
        }
      },
    });
  };

  const handleDelete = (documentNumber) => {
    confirm({
      title: "Do you want to delete ?",
      icon: <ExclamationCircleFilled />,
      centered: true,
      async onOk() {
        try {
          const res = await useServiceAPI.delete(paths.pathSalePointOrderDelete, { document_number: documentNumber });
          showNotification?.("success", res?.data?.message || "Delete successful");
          fetchData();
        } catch (error) {
          showNotification?.("warning", "Delete failed");
        }
      },
    });
  };

  const handleSearch = () => {
    if (activeTab === "list") {
      setTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, current: 1 },
        filters: filterValues,
      }));
    } else {
      setRequestTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, current: 1 },
        filters: requestFiltersValues,
      }));
    }
  };

  const handleClear = () => {
    if (activeTab === "list") {
      setFilterValues({});
      setTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, current: 1 },
        filters: {},
      }));
    } else {
      setRequestFiltersValues({});
      setRequestTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, current: 1 },
        filters: {},
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (activeTab === "list") {
      setFilterValues((prev) => ({ ...prev, [name]: value }));
    } else {
      setRequestFiltersValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTableChange = (pagination) => {
    if (activeTab === "list") {
      setTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, current: pagination.current, pageSize: pagination.pageSize },
      }));
    } else {
      setRequestTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, current: pagination.current, pageSize: pagination.pageSize },
      }));
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between items-center">
        <div className="title-page">Sales Point Order (Farmer)</div>
        <div className="flex gap-2">
          <ActionButton
            mode="create"
            text="Create"
            onClick={() => navigate("/points/line/farmer-points-list/create", { state: { is_farmer: true, back_path: "/points/line/farmer-points-list" } })}
          />
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="custom-tabs">
        <TabPane tab={<span className="tab-title">Sales Point Order List</span>} key="list" />
        <TabPane tab={<span className="tab-title">Sales Point Order Request</span>} key="request" />
      </Tabs>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleChange}
        filters={activeTab === "list" ? filters : requestFilters}
        values={activeTab === "list" ? filterValues : requestFiltersValues}
      />

      <BoxPrimary>
        <TableComponent
          header={activeTab === "list" ? header : headerRequest}
          dataSource={activeTab === "list" ? dataSource : requestDataSource}
          pagination={activeTab === "list" ? tableParams.pagination : requestTableParams.pagination}
          loading={activeTab === "list" ? tableLoading : requestTableLoading}
          onChange={handleTableChange}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
