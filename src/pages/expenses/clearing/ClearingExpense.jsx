// src/pages/expenses/clearing/ClearingExpense.jsx
// ✅ Master: SaleDropdown + DealerAll + SubDealerAll (+ ActivityType)
// ✅ Add Dealer + SubDealer filters (3 dropdowns: sales, dealers, subdealer)
// ✅ No step (no onChange fetch master by sale)
// ✅ Search triggers fetch, onChange only updates UI (filterValues)
// ✅ Clear resets UI + fetches all + reset page to 1

import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown, Modal } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import { ExclamationCircleFilled } from "@ant-design/icons";

export default function ClearingExpense() {
  const { confirm } = Modal;
  const navigate = useNavigate();
  const { showNotification } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [activityList, setActivityList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);

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

  // ✅ 3 dropdowns + other fields
  const filters = [
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealer", type: "select", label: "Dealer", placeholder: "All", options: dealerList },
    { key: "sub_dealer", type: "select", label: "Sub Dealer", placeholder: "All", options: subDealerList },
    { key: "expense_no", type: "text", label: "Expense No", placeholder: "All" },
    { key: "activity_reference", type: "text", label: "Activity Reference", placeholder: "All" },
    { key: "type_of_meeting", type: "select", label: "Type of Meeting", placeholder: "All", options: activityList },
    { key: "date", type: "date", label: "Date", placeholder: "YYYY-MM-DD" },
  ];

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

  const handleDelete = async (documentNumber) => {
    confirm({
      title: "Do you want to delete ?",
      icon: <ExclamationCircleFilled />,
      content: [],
      centered: true,
      async onOk() {
        try {
          const response = await useServiceAPI.delete(
            `/activity-expense/delete?document_number=${encodeURIComponent(documentNumber)}&page_code=${encodeURIComponent(
              "expense_clearing"
            )}`
          );
          await fetchData();
          if (response.status === 200) {
            showNotification(
              "success",
              response.data.message || "Event deleted successfully!",
              response.data.message_line || ["The event has been removed."]
            );
          } else {
            showNotification(
              "error",
              response.message || "Failed to delete event.",
              response.message_line || ["Please try again later."]
            );
          }
        } catch (error) {
          showNotification("error", "An error occurred while deleting the event.", ["Please try again later."]);
        }
      },
    });
  };

  // ✅ Load Masters (Sale + DealerAll + SubDealerAll + ActivityType)
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [activityType, saleRes, dealerRes, subDealerRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterActivityType, {}),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
          useServiceAPI.get(paths.pathMasterDealerAll, {}),
          useServiceAPI.get(paths.pathMasterSubDealerAll, {}),
        ]);

        setActivityList(activityType?.data || []);
        setSaleList(saleRes?.data || []);

        setDealerList(
          (dealerRes?.data || []).map((d) => ({
            id: d.id ?? d.dealer_id ?? d.code,
            name: d.name ?? d.dealer_name ?? d.title,
          }))
        );

        setSubDealerList(
          (subDealerRes?.data || []).map((s) => ({
            id: s.sub_dealer_id ?? s.id ?? s.code,
            name: s.sub_dealer_name ?? s.name ?? s.title,
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  const header = [
    { title: "No", dataIndex: "key", align: "center" },
    { title: "Sub Dealer", dataIndex: "customer", align: "left" },
    { title: "Dealer", dataIndex: "dealer", align: "left" },
    { title: "Expense No", dataIndex: "expenseNo", align: "left" },
    { title: "Activity Reference", dataIndex: "activityReference", align: "left" },
    { title: "Type of Meeting", dataIndex: "typeOfMeeting", align: "center" },
    { title: "Date", dataIndex: "date", align: "center" },
    { title: "Status", dataIndex: "status", align: "center" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      page_code: "expense_clearing",
      keyword: f.expense_no || "",
      use_flag: "1",
      date: f.date || "",
      user_id: getId(f.sale),
      dealer_id: getId(f.dealer),
      sub_dealer_id: getId(f.sub_dealer), // ✅ NEW (เพิ่มเข้ามา)
      activity_type_id: getId(f.type_of_meeting),
      document_number_referrent: f.activity_reference || "",
      customer_name: "",
      page: "all",
      page_mode: "list",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(paths.pathActivityExpenseList, requestData);

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = (data || []).map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          customer: row.sub_dealer_name,
          dealer: row.dealer_name,
          expenseNo: row.document_number,
          activityReference: row.document_number_referrent,
          typeOfMeeting: row.activity_type_name,
          date: row.document_date,
          status: (
            <BadgeStatus
              text={row.transaction_status_name}
              bgColor={row.transaction_status_bg_color}
              textColor={row.transaction_status_color}
            />
          ),
          action: (
            <Dropdown
              menu={{
                items: (row.action || []).map((actionItem, actionIndex) => {
                  const mode = actionItem.action.toLowerCase();
                  let onClickHandler = null;

                  if (mode === "edit" || mode === "view") {
                    const path = `/activity/${mode}`;
                    onClickHandler = () =>
                      navigate(path, {
                        state: {
                          documentNumber: row.document_number,
                          pageCode: row.page_code,
                          page_mode: actionItem.action,
                        },
                      });
                  } else {
                    onClickHandler = () => handleDelete(row.document_number);
                  }

                  return {
                    key: actionIndex,
                    label: <ItemDropDown mode={mode} onClick={onClickHandler} />,
                  };
                }),
              }}
              placement="bottom"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
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

  const handleTableChange = (pagination, _filters, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      filters: prev.filters,
      // sortField: sorter?.field,
      // sortOrder: sorter?.order === "ascend" ? "asc" : "desc",
    }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Clearing Expense</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() =>
            navigate("/activity/create", {
              state: { pageCode: "expense_clearing" },
            })
          }
        />
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
