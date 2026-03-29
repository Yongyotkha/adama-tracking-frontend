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

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sortOrder: "desc",
    sortField: "document_number",
  });
  const [filterValues, setFilterValues] = useState({});

  const [requestDataSource, setRequestDataSource] = useState([]);
  const [requestTableLoading, setRequestTableLoading] = useState(false);
  const [requestTableParams, setRequestTableParams] = useState({
    pagination: { current: 1, pageSize: 50 },
    filters: {},
    sortOrder: "desc",
    sortField: "document_date",
  });
  const [requestFiltersValues, setRequestFiltersValues] = useState({});

  const [saleList, setSaleList] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [subDealerOptions, setSubDealerOptions] = useState([]);
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

  const filters = [
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealer", type: "select", label: "Dealer", placeholder: "All", options: dataDealer, moderef: true },
    { key: "sub_dealer", type: "select", label: "Sub Dealer", placeholder: "All", options: subDealerOptions },
    { key: "order_no", type: "text", label: "Order No", placeholder: "Order No" },
    { key: "status_code", type: "select", label: "Status", placeholder: "All", options: STATUS_OPTIONS_LIST },
    { key: "dater", type: "dater", label: "Date", placeholder: "Date" },
  ];

  const requestFilters = [
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealer", type: "select", label: "Dealer", placeholder: "All", options: dataDealer, moderef: true },
    { key: "sub_dealer", type: "select", label: "Sub Dealer", placeholder: "All", options: subDealerOptions },
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

  const getActionForRequest = (record) => {
    const apiActions = Array.isArray(record.apiActions)
      ? record.apiActions.map((a) => (a?.action || "").toLowerCase())
      : [];
    const actions = apiActions.length ? apiActions : ["view"];

    const items = [];
    if (actions.includes("view")) {
      items.push({
        key: "view",
        label: (
          <ItemDropDown
            mode="view"
            onClick={() =>
              navigate("/points/line/sales-points-list/view", {
                state: { document_number: record.document_number },
              })
            }
          />
        ),
      });
    }
    items.push({
      key: "edit",
      label: (
        <ItemDropDown
          mode="edit"
          onClick={() =>
            navigate("/points/line/sales-points-list/edit", {
              state: { document_number: record.document_number },
            })
          }
        />
      ),
    });
    items.push({
      key: "delete",
      label: (
        <ItemDropDown
          mode="delete"
          onClick={() => handleDelete(record.document_number)}
        />
      ),
    });
    items.push({
      key: "refund",
      label: (
        <ItemDropDown
          mode="refund"
          onClick={() => handleRefund(record.document_number)}
        />
      ),
    });

    return (
      <Dropdown menu={{ items }} placement="bottom">
        <a onClick={(e) => e.preventDefault()}>
          <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5" />
        </a>
      </Dropdown>
    );
  };

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      user_id: filters.sale || "",
      dealer_id: filters.dealer || "",
      sub_dealer_id: filters.sub_dealer || "",
      keyword: filters.order_no || "",
      status_code: filters.status_code || " ",
      page: "all",
      use_flag: 1,
      orderby_column: sortField || "document_number",
      orderby: sortOrder || "desc",
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
                items: [
                  {
                    key: 1,
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
                  },
                  {
                    key: 2,
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
                  },
                  {
                    key: 3,
                    label: (
                      <ItemDropDown
                        mode="delete"
                        onClick={() => handleDelete(order.document_number)}
                      />
                    ),
                  },
                  {
                    key: 4,
                    label: (
                      <ItemDropDown
                        mode="refund"
                        onClick={() => handleRefund(order.document_number)}
                      />
                    ),
                  },
                ],
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
      keyword: "",
      status_code: "ODI",
      page: "all",
      use_flag: 1,
      orderby_column: sortField,
      orderby: sortOrder,
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
            sale: item.sale_name ?? "-",
            document_date: requestDate,
            status: (
              <BadgeStatus
                text={item.status_transaction_name}
                bgColor={item.status_transaction_bg_color}
                textColor={item.status_transaction_color}
              />
            ),
            apiActions: item.action,
          };
        });

        setRequestDataSource(mapped.map((row) => ({ ...row, action: getActionForRequest(row) })));

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
    setFilterValues(filters);

    const saleId = typeof filters.sale === "object" ? filters.sale.value : filters.sale;
    const dealerId = typeof filters.dealer === "object" ? filters.dealer.value : filters.dealer;

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
    setRequestFiltersValues(filters);

    const saleId = typeof filters.sale === "object" ? filters.sale.value : filters.sale;
    const dealerId = typeof filters.dealer === "object" ? filters.dealer.value : filters.dealer;

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