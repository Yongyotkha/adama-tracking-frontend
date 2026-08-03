// src/pages/points/line/sales_points/SalesPointsList.jsx
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

export default function SalesPointsList() {
  const navigate = useNavigate();
  const { showMsg, showNotification } = useContext(AuthContext);
  const PAGE_STATE_KEY = "sales-points-list";
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
    { key: "order_no", type: "text", label: "Order No", placeholder: "Order No" },
    { key: "status_code", type: "select", label: "Status", placeholder: "All", options: STATUS_OPTIONS_LIST },
    { key: "dater", type: "dater", label: "Date", placeholder: "Date" },
  ];

  const reqHasSale = !!requestFiltersValues.sale;
  const reqHasDealer = !!requestFiltersValues.dealer;

  const requestFilters = [
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealer", type: "select", label: "Dealer", placeholder: "All", options: dataDealer, moderef: true, disabled: !reqHasSale },
    { key: "sub_dealer", type: "select", label: "Sub Dealer", placeholder: "All", options: subDealerOptions, disabled: !reqHasDealer },
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
    { title: "Request Date", width: 160, dataIndex: "document_date", align: "center" },
    { title: "Status", width: 160, dataIndex: "status", align: "center" },
    { title: "Action", width: 120, dataIndex: "action", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "desc";
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
      orderby_column: sortField || "document_date",
      orderby: "desc",
      platform: "web",
      page_length: current,
      page_size: pageSize,
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
                            navigate("/points/line/sales-points-list/view", {
                              state: { document_number: order.document_number },
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
                            navigate("/points/line/sales-points-list/edit", {
                              state: { document_number: order.document_number },
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
          pagination: { ...prev.pagination, total: records_filtered || 0 },
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchRequests = async () => {
    setRequestTableLoading(true);
    const { current, pageSize } = requestTableParams.pagination;
    const filters = requestTableParams.filters || {};
    const sortOrder = requestTableParams.sortOrder || "desc";
    const sortField = requestTableParams.sortField || "document_date";

    const payload = {
      user_id: filters.sale || "",
      dealer_id: filters.dealer || "",
      sub_dealer_id: filters.sub_dealer || "",
      farmer_id: filters.farmer || "",
      keyword: filters.order_no || "",
      status_code: filters.status_code || "ODI",
      page: "all",
      use_flag: 1,
      orderby_column: sortField,
      orderby: "desc",
      platform: "web",
      page_length: current,
      page_size: pageSize,
    };

    if (hasValidDater(filters.dater)) {
      payload.dater = filters.dater;
    }

    try {
      const res = await useServiceAPI.get(paths.pathSalePointOrderList, payload);
      if (res.status === 200) {
        const rows = res.data?.data || [];

        const mapped = rows.map((item, idx) => {
          const requestDate =
            item.document_date ||
            (item.updated_at ? String(item.updated_at).split(" ")[0] : "") ||
            "-";

          return {
            key: idx + 1 + (current - 1) * pageSize,
            document_number: item.document_number,
            dealer: item.dealer_name ?? "-",
            sub_dealer: item.sub_dealer_name ?? "-",
            farmer: item.farmer_name ?? "-",
            sale: item.sale_name ?? "-",
            document_date: requestDate,
            status: (
              <BadgeStatus
                text={item.status_transaction_name}
                bgColor={item.status_transaction_bg_color}
                textColor={item.status_transaction_color}
              />
            ),
            status_code: item.status_code,
            action: (
              <Dropdown
                menu={{
                  items: (item.action || []).map((a, i) => {
                    const actionName = String(a.action).toLowerCase();
                    if (actionName === "view") {
                      return {
                        key: `view-${i}`,
                        label: (
                          <ItemDropDown
                            mode="view"
                            onClick={() =>
                              navigate("/points/line/sales-points-list/view", {
                                state: { document_number: item.document_number },
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
                              navigate("/points/line/sales-points-list/edit", {
                                state: { document_number: item.document_number },
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
                            onClick={() => handleDelete(item.document_number)}
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
                            onClick={() => handleRefund(item.document_number)}
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
                  <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5" />
                </a>
              </Dropdown>
            ),
          };
        });

        setRequestDataSource(mapped);

        setRequestTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: typeof res.data?.records_filtered === "number"
              ? res.data.records_filtered
              : rows.length,
          },
        }));
      }
    } catch (err) {
      console.error(err);
      setRequestDataSource([]);
    } finally {
      setRequestTableLoading(false);
    }
  };

  const handleSearch = (filters) => {
    const cleanedFilters = normalizeFilters(filters);

    setTableParams((prev) => ({
      ...prev,
      filters: cleanedFilters,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  const handleClear = () => {
    setFilterValues({});
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
    setDataDealer([]);
    setSubDealerOptions([]);
    setFarmerOptions([]);
  };

  const handleTableChange = (pagination, _filters, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      sortOrder: sorter?.order === "descend" ? "desc" : "asc",
      sortField: sorter?.field || prev.sortField,
    }));
  };

  const handleChange = (filters) => {
    let newFilters = { ...filters };

    const oldSale = typeof filterValues.sale === "object" ? filterValues.sale?.value : filterValues.sale;
    const newSale = typeof newFilters.sale === "object" ? newFilters.sale?.value : newFilters.sale;

    const oldDealer = typeof filterValues.dealer === "object" ? filterValues.dealer?.value : filterValues.dealer;
    const newDealer = typeof newFilters.dealer === "object" ? newFilters.dealer?.value : newFilters.dealer;

    const oldSubDealer = typeof filterValues.sub_dealer === "object" ? filterValues.sub_dealer?.value : filterValues.sub_dealer;
    const newSubDealer = typeof newFilters.sub_dealer === "object" ? newFilters.sub_dealer?.value : newFilters.sub_dealer;

    if (oldSale !== newSale) {
      newFilters.dealer = undefined;
      newFilters.sub_dealer = undefined;
      newFilters.farmer = undefined;
    } else if (oldDealer !== newDealer) {
      newFilters.sub_dealer = undefined;
      newFilters.farmer = undefined;
    } else if (oldSubDealer !== newSubDealer) {
      newFilters.farmer = undefined;
    }

    setFilterValues(newFilters);

    const saleId = typeof newFilters.sale === "object" ? newFilters.sale?.value : newFilters.sale;
    const dealerId = typeof newFilters.dealer === "object" ? newFilters.dealer?.value : newFilters.dealer;
    const subDealerId = typeof newFilters.sub_dealer === "object" ? newFilters.sub_dealer?.value : newFilters.sub_dealer;

    if (subDealerId) {
      (async () => {
        try {
          const res = await useServiceAPI.get(paths.pathUserLineFarmer, {
            sub_dealer_id: subDealerId,
          });
          const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
          const normalized = list.map(item => ({
            id: String(item.farmer_id || item.id),
            name: item.farmer_name || item.name || String(item.farmer_id || item.id)
          }));
          setFarmerOptions(normalized);
        } catch (error) {
          // no-op
        }
      })();
    } else {
      setFarmerOptions([]);
    }

    if (dealerId) {
      (async () => {
        try {
          const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
            user_id: saleId || "",
            dealer_id: dealerId,
          });
          const set_sub_dealer = (res?.data || []).map((item) => ({
            name: item.sub_dealer_name,
            id: item.sub_dealer_id,
          }));
          setSubDealerOptions(set_sub_dealer);
        } catch (error) {
          showMsg?.("error", error.message || "เกิดข้อผิดพลาดในการโหลด Sub Dealer");
        }
      })();
    } else if (saleId) {
      (async () => {
        try {
          const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
            user_id: saleId,
          });
          setDataDealer(res?.data || []);
          setSubDealerOptions([]);
        } catch (error) {
          showMsg?.("error", error.message || "เกิดข้อผิดพลาดในการโหลด Dealer");
        }
      })();
    } else {
      setDataDealer([]);
      setSubDealerOptions([]);
    }
  };

  const handleSearchRequest = (filters) => {
    const cleanedFilters = normalizeFilters(filters);

    setRequestTableParams((prev) => ({
      ...prev,
      filters: cleanedFilters,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  const handleClearRequest = () => {
    setRequestFiltersValues({});
    setRequestTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
    setDataDealer([]);
    setSubDealerOptions([]);
    setFarmerOptions([]);
  };

  const handleTableChangeRequest = (pagination, _filters, sorter) => {
    setRequestTableParams((prev) => ({
      ...prev,
      pagination,
      sortOrder: sorter?.order === "descend" ? "desc" : "asc",
      sortField: sorter?.field || prev.sortField,
    }));
  };

  const handleChangeRequestFilters = (filters) => {
    let newFilters = { ...filters };

    const oldSale = typeof requestFiltersValues.sale === "object" ? requestFiltersValues.sale?.value : requestFiltersValues.sale;
    const newSale = typeof newFilters.sale === "object" ? newFilters.sale?.value : newFilters.sale;

    const oldDealer = typeof requestFiltersValues.dealer === "object" ? requestFiltersValues.dealer?.value : requestFiltersValues.dealer;
    const newDealer = typeof newFilters.dealer === "object" ? newFilters.dealer?.value : newFilters.dealer;

    const oldSubDealer = typeof requestFiltersValues.sub_dealer === "object" ? requestFiltersValues.sub_dealer?.value : requestFiltersValues.sub_dealer;
    const newSubDealer = typeof newFilters.sub_dealer === "object" ? newFilters.sub_dealer?.value : newFilters.sub_dealer;

    if (oldSale !== newSale) {
      newFilters.dealer = undefined;
      newFilters.sub_dealer = undefined;
      newFilters.farmer = undefined;
    } else if (oldDealer !== newDealer) {
      newFilters.sub_dealer = undefined;
      newFilters.farmer = undefined;
    } else if (oldSubDealer !== newSubDealer) {
      newFilters.farmer = undefined;
    }

    setRequestFiltersValues(newFilters);

    const saleId = typeof newFilters.sale === "object" ? newFilters.sale?.value : newFilters.sale;
    const dealerId = typeof newFilters.dealer === "object" ? newFilters.dealer?.value : newFilters.dealer;
    const subDealerId = typeof newFilters.sub_dealer === "object" ? newFilters.sub_dealer?.value : newFilters.sub_dealer;

    if (subDealerId) {
      (async () => {
        try {
          const res = await useServiceAPI.get(paths.pathUserLineFarmer, {
            sub_dealer_id: subDealerId,
          });
          const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
          const normalized = list.map(item => ({
            id: String(item.farmer_id || item.id),
            name: item.farmer_name || item.name || String(item.farmer_id || item.id)
          }));
          setFarmerOptions(normalized);
        } catch (error) {
          // no-op
        }
      })();
    } else {
      setFarmerOptions([]);
    }

    if (dealerId) {
      (async () => {
        try {
          const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
            user_id: saleId || "",
            dealer_id: dealerId,
          });
          const set_sub_dealer = (res?.data || []).map((item) => ({
            name: item.sub_dealer_name,
            id: item.sub_dealer_id,
          }));
          setSubDealerOptions(set_sub_dealer);
        } catch (error) {
          showMsg?.("error", error.message || "เกิดข้อผิดพลาดในการโหลด Sub Dealer");
        }
      })();
    } else if (saleId) {
      (async () => {
        try {
          const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
            user_id: saleId,
          });
          setDataDealer(res?.data || []);
          setSubDealerOptions([]);
        } catch (error) {
          showMsg?.("error", error.message || "เกิดข้อผิดพลาดในการโหลด Dealer");
        }
      })();
    } else {
      setDataDealer([]);
      setSubDealerOptions([]);
    }
  };

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const sale = await useServiceAPI.get(paths.pathMasterSaleSingle, {});
        setSaleList(sale.data || []);
      } catch (error) {
        showMsg?.("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    getMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "request") fetchRequests();
    else fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "list") fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  useEffect(() => {
    if (activeTab === "request") fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    requestTableParams.pagination.current,
    requestTableParams.pagination.pageSize,
    requestTableParams.sortOrder,
    requestTableParams.sortField,
    JSON.stringify(requestTableParams.filters),
  ]);

  useEffect(() => {
    saveListPageState(PAGE_STATE_KEY, {
      activeTab,
      filterValues,
      tableParams: {
        pagination: {
          current: tableParams.pagination.current,
          pageSize: tableParams.pagination.pageSize,
        },
        filters: tableParams.filters,
        sortOrder: tableParams.sortOrder,
        sortField: tableParams.sortField,
      },
      requestFiltersValues,
      requestTableParams: {
        pagination: {
          current: requestTableParams.pagination.current,
          pageSize: requestTableParams.pagination.pageSize,
        },
        filters: requestTableParams.filters,
        sortOrder: requestTableParams.sortOrder,
        sortField: requestTableParams.sortField,
      },
    });
  }, [activeTab, filterValues, tableParams, requestFiltersValues, requestTableParams]);

  useEffect(() => {
    if (!saleList.length) return;

    const values = activeTab === "request" ? requestFiltersValues : filterValues;
    const saleId = typeof values.sale === "object" ? values.sale.value : values.sale;
    const dealerId = typeof values.dealer === "object" ? values.dealer.value : values.dealer;

    if (saleId || dealerId) {
      if (activeTab === "request") {
        handleChangeRequestFilters(values);
      } else {
        handleChange(values);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleList.length, activeTab]);

  const handleDelete = (documentNumber) => {
    confirm({
      title: "Do you want to delete ?",
      icon: <ExclamationCircleFilled />,
      content: [],
      centered: true,
      async onOk() {
        try {
          const res = await useServiceAPI.delete(paths.pathSalePointOrderDelete, { document_number: documentNumber });
          const ok = res?.status === 200;
          const header =
            res?.data?.data?.Message?.Message_Header ||
            res?.data?.message ||
            (ok ? "Delete successful" : "Notification");
          const lines =
            res?.data?.data?.Message?.Message_Line ||
            res?.data?.message_line ||
            [ok ? "Delete successful" : "Please try again."];

          await showNotification(ok ? "success" : "warning", header, lines);

          if (activeTab === "request") fetchRequests();
          else fetchData();
        } catch (error) {
          const msg = error?.response?.data?.data?.Message;
          await showNotification("warning", msg?.Message_Header || "Notification", msg?.Message_Line || ["Data not found"]);

          if (activeTab === "request") fetchRequests();
          else fetchData();
        }
      },
    });
  };
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
            onChange={(e) => {
              remark = e.target.value;
            }}
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
          const ok = res?.status === 200 || res?.status === "200";
          const header =
            res?.data?.data?.Message?.Message_Header ||
            res?.data?.message ||
            (ok ? "Refund successful" : "Notification");
          const lines =
            res?.data?.data?.Message?.Message_Line ||
            res?.data?.message_line ||
            [ok ? "Refund successful" : "Please try again."];

          await showNotification(ok ? "success" : "warning", header, lines);

          if (activeTab === "request") fetchRequests();
          else fetchData();
        } catch (error) {
          const msg = error?.response?.data?.data?.Message;
          await showNotification(
            "warning",
            msg?.Message_Header || "Notification",
            msg?.Message_Line || ["Refund failed"]
          );

          if (activeTab === "request") fetchRequests();
          else fetchData();
        }
      },
    });
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between items-center">
        <div className="title-page">Sales Point Order</div>
        <div className="flex gap-2">
          {permission.btn_create && (
            <ActionButton
              mode="create"
              text="Create"
              onClick={() => navigate("/points/line/sales-points-list/create")}
            />
          )}
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="custom-tabs">
        <TabPane tab={<span className="tab-title">Sales Point Order List</span>} key="list">
          <Filter
            onSearch={handleSearch}
            onClear={handleClear}
            onChange={handleChange}
            filters={filters}
            values={filterValues}
          />
          <br />
          <BoxPrimary>
            <TableComponent
              header={header}
              dataSource={dataSource}
              pagination={tableParams.pagination}
              loading={tableLoading}
              onChange={handleTableChange}
            />
          </BoxPrimary>
        </TabPane>

        <TabPane tab={<span className="tab-title">Sales Point Order Request</span>} key="request">
          <Filter
            onSearch={handleSearchRequest}
            onClear={handleClearRequest}
            onChange={handleChangeRequestFilters}
            filters={requestFilters}
            values={requestFiltersValues}
          />
          <br />
          <BoxPrimary>
            <TableComponent
              header={headerRequest}
              dataSource={requestDataSource}
              pagination={requestTableParams.pagination}
              loading={requestTableLoading}
              onChange={handleTableChangeRequest}
            />
          </BoxPrimary>
        </TabPane>
      </Tabs>
    </MainLayout>
  );
}
