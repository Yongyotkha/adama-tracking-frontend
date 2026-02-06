// OrderWaitingList.jsx (complete - uses Filter.jsx, no step, search-only, clear fetch all)
// ✅ Master: SaleDropdown + DealerAll (+ Status)
// ✅ Search triggers fetch, onChange only updates UI (filterValues)
// ✅ Clear resets UI + fetches all (filters = {}) + resets page to 1
// ✅ No SubDealer filter

import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Filter from "../../components/filter/Filter";
import { Dropdown } from "antd";
import BadgeStatus from "../../components/badge/BadgeStatus";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";

export default function OrderWaitingList() {
  const navigate = useNavigate();
  const { showMsg } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [dataSource, setDataSource] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [statusListRaw, setStatusListRaw] = useState([]);

  // ✅ Filter UI state (draft)
  const [filterValues, setFilterValues] = useState({});

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  const getId = (v) => {
    if (!v) return "";
    if (typeof v === "object") return v.value ?? v.id ?? "";
    return v;
  };

  // ✅ Get Master: Sale + DealerAll + Status
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [saleRes, dealerRes, statusRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
          useServiceAPI.get(paths.pathMasterDealerAll, {}),
          useServiceAPI.get(paths.pathMasterStatus, { status_type: "order" }),
        ]);

        setSaleList(saleRes?.data || []);

        setDealerList(
          (dealerRes?.data || []).map((d) => ({
            id: d.id ?? d.dealer_id ?? d.code,
            name: d.name ?? d.dealer_name ?? d.title,
          }))
        );

        setStatusListRaw(statusRes?.data || []);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filters = [
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealer", type: "select", label: "Dealer", placeholder: "All", options: dealerList },
    { key: "order_no", type: "text", label: "Order No", placeholder: "Order No" },
    {
      key: "status",
      type: "select",
      label: "Status",
      placeholder: "All",
      options: (statusListRaw || []).map((s) => ({ id: s.code, name: s.name })),
    },
    { key: "dater", type: "dater", label: "Date", placeholder: "Date" },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Order No", width: 150, dataIndex: "orderNo", align: "left" },
    { title: "Sales", width: 200, dataIndex: "sale", align: "left" },
    { title: "Dealer", width: 200, dataIndex: "dealer", align: "left" },
    { title: "Value (THB)", width: 100, dataIndex: "value", align: "right" },
    { title: "Order Date", width: 150, dataIndex: "orderDate", align: "center" },
    { title: "Status", width: 150, dataIndex: "status", align: "center" },
    { title: "SAP Status", width: 150, dataIndex: "sapStatus", align: "center" },
    { title: "Create By", width: 150, dataIndex: "createdBy", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      user_id: getId(f.sale),
      dealer_id: getId(f.dealer),
      keyword: f.order_no || "",
      trasaction_status_code: getId(f.status) || "ODW",
      dater: f.dater || "",
      page: "wait_for_approval",
      use_flag: f.use_flag || "",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(paths.pathGetOrderWaitingList, requestData);

      if (response?.status === 200) {
        const { data, records_filtered } = response.data || {};

        const rows = (data || []).map((order, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          orderNo: order.document_number,
          sale: order.user_name,
          dealer: order.dealer_name,
          value: order.net_amount_display,
          orderDate: order.document_date,
          status: (
            <BadgeStatus
              text={order.status_transaction_name}
              bgColor={order.status_transaction_bg_color}
              textColor={order.status_transaction_color}
            />
          ),
          sapStatus: (
            <BadgeStatus
              text={order.status_interface_name}
              bgColor={order.status_interface_bg_color}
              textColor={order.status_interface_color}
            />
          ),
          createdBy: order.updated_by,
          action: (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 1,
                    label: (
                      <ItemDropDown
                        mode="view"
                        onClick={() => {
                          navigate("/order-waiting/view", { state: { document_number: order.document_number } });
                        }}
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

        setDataSource(rows);
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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  // ✅ Search-only / Clear fetch all
  const handleFilterChange = (values) => setFilterValues(values);

  const handleSearch = (valuesFromUI) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1, pageSize: 10 },
      filters: { ...valuesFromUI },
    }));
  };

  const handleClear = () => {
    setFilterValues({});
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1, pageSize: 10 },
      filters: {},
    }));
  };

  const handleTableChange = (pagination, _filters, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      filters: prev.filters,
      sortOrder: sorter?.order === "ascend" ? "asc" : "desc",
      sortField: sorter?.field,
    }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Order Waiting List</div>
      </div>

      <Filter
        filters={filters}
        values={filterValues}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
          onChange={handleTableChange}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
