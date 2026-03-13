import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown, Modal, Input } from "antd";
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

export default function AdvanceExpense() {
  const { confirm } = Modal;
  const { TextArea } = Input;
  const navigate = useNavigate();
  const { showNotification, userInfo } = useContext(AuthContext);

  const saleAutoRoles = [5, 6];
  const isAutoSaleSelf = saleAutoRoles.includes(Number(userInfo?.role_id));
  const defaultSaleValue = isAutoSaleSelf ? userInfo?.id : undefined;

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagePermission, setPagePermission] = useState({});

  const [activityList, setActivityList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [statusList, setStatusList] = useState([]);

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

  const getStatusCode = (v) => {
    if (!v) return "";
    if (typeof v === "object") return v.code ?? v.value ?? v.id ?? "";
    return v;
  };

  const filters = [
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealer", type: "select", label: "Dealer", placeholder: "All", options: dealerList, moderef: false },
    { key: "customer", type: "select", label: "Sub Dealer", placeholder: "All", options: subDealerList },
    { key: "expense_no", type: "text", label: "Expense No", placeholder: "All" },
    { key: "activity_reference", type: "text", label: "Activity Reference", placeholder: "All" },
    { key: "type_of_meeting", type: "select", label: "Type of Meeting", placeholder: "All", options: activityList },
    { key: "status", type: "select", label: "Status", placeholder: "All", options: statusList },
    { key: "date", type: "date", label: "Date", placeholder: "YYYY-MM-DD" },
  ];

  const handleFilterChange = (values) => setFilterValues(values);

  const handleSearch = (valuesFromUI) => {
    setFilterValues(valuesFromUI);
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1, pageSize: 10 },
      filters: { ...valuesFromUI },
    }));
  };

  const handleClear = () => {
    const resetFilters = isAutoSaleSelf ? { sale: defaultSaleValue } : {};
    setFilterValues(resetFilters);
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1, pageSize: 10 },
      filters: resetFilters,
    }));
  };

  const getApproveRejectText = () => {
    let approveText = "Approve";
    let rejectText = "Reject";

    if (userInfo?.role_id == 8) {
      approveText = "Confirm";
      rejectText = "Cancel";
    }

    return { approveText, rejectText };
  };

  const handleOpenPage = (row, mode = "view") => {
    navigate(`/activity/${mode}`, {
      state: {
        documentNumber: row.document_number,
        pageCode: row.page_code,
        page_mode: mode,
      },
    });
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
              "expense_advance"
            )}`
          );

          await fetchData();

          if (response.status === 200) {
            showNotification(
              "success",
              response.data.message || "Deleted successfully!",
              response.data.message_line || ["The item has been removed."]
            );
          } else {
            showNotification(
              "error",
              response.message || "Failed to delete.",
              response.message_line || ["Please try again later."]
            );
          }
        } catch (error) {
          showNotification("error", "An error occurred while deleting.", ["Please try again later."]);
        }
      },
    });
  };

  const handleApprovalAction = async (row, action) => {
    let remark = "";
    const { approveText, rejectText } = getApproveRejectText();

    confirm({
      title: `Do you want to ${action === "approved" ? approveText : rejectText} ?`,
      icon: <ExclamationCircleFilled />,
      content:
        action === "reject" ? (
          <TextArea
            placeholder="Please enter remark"
            onChange={(e) => {
              remark = e.target.value;
            }}
          />
        ) : null,
      centered: true,
      async onOk() {
        try {
          const result = await useServiceAPI.put(paths.pathAdvanceApproval, {
            document_number: row.document_number,
            page_mode: "approve",
            remark,
            action_code: action,
          });

          await showNotification(
            "success",
            result?.data?.Message?.Message_Header || result?.data?.message || "Success",
            result?.data?.Message?.Message_Line || result?.data?.message_line || ["Transaction completed"],
            2
          );

          fetchData();
        } catch (error) {
          console.error(error);
          showNotification("error", "Transaction failed", ["Please try again later."]);
        }
      },
    });
  };

  const buildActionMenuItems = (row) => {
    return (row.action || []).map((actionItem, actionIndex) => {
      const rawMode = String(actionItem.action || "").toLowerCase().trim();

      let itemMode = rawMode;
      let itemText = actionItem.action;
      let onClickHandler = null;

      if (rawMode === "view") {
        itemMode = "view";
        onClickHandler = () => handleOpenPage(row, "view");
      } else if (rawMode === "edit") {
        itemMode = "edit";
        onClickHandler = () => handleOpenPage(row, "edit");
      } else if (rawMode === "delete") {
        itemMode = "delete";
        onClickHandler = () => handleDelete(row.document_number);
      } else if (rawMode === "approve") {
        itemMode = "approve";
        itemText = getApproveRejectText().approveText;
        onClickHandler = () => handleApprovalAction(row, "approved");
      } else if (rawMode === "reject") {
        itemMode = "delete";
        itemText = getApproveRejectText().rejectText;
        onClickHandler = () => handleApprovalAction(row, "reject");
      } else {
        itemMode = "view";
        onClickHandler = () => handleOpenPage(row, "view");
      }

      return {
        key: actionIndex,
        label: <ItemDropDown mode={itemMode} onClick={onClickHandler} text={itemText} />,
      };
    });
  };

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [activityType, saleRes, dealerRes, subDealerRes, statusRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterActivityType, {}),
          useServiceAPI.get(paths.pathMasterSaleDropdown, { mode: "all" }),
          useServiceAPI.get(paths.pathMasterDealerAll, {}),
          useServiceAPI.get(paths.pathMasterSubDealerAll, {}),
          useServiceAPI.get(paths.pathMasterStatus, { status_type: "expense_advance" }),
        ]);

        setActivityList(activityType?.data || []);
        setSaleList(saleRes?.data || []);

        setDealerList(
          (dealerRes?.data || []).map((d) => ({
            id: d.id ?? d.dealer_id ?? d.code,
            value: d.id ?? d.dealer_id ?? d.code,
            name: d.name ?? d.dealer_name ?? d.title,
          }))
        );

        setSubDealerList(
          (subDealerRes?.data || []).map((s) => ({
            id: s.sub_dealer_id ?? s.id ?? s.code,
            value: s.sub_dealer_id ?? s.id ?? s.code,
            name: s.sub_dealer_name ?? s.name ?? s.title,
          }))
        );

        setStatusList(
          (statusRes?.data || []).map((s) => ({
            id: s.code,
            value: s.code,
            code: s.code,
            name: s.name,
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
    { title: "Dealer", dataIndex: "dealersd", align: "left" },
    { title: "Expense No", dataIndex: "expenseNo", align: "left" },
    { title: "Advance Exp", dataIndex: "advanceExp", align: "right" },
    { title: "Activity Reference", dataIndex: "activityReference", align: "left" },
    { title: "Type of Meeting", dataIndex: "typeOfMeeting", align: "center" },
    { title: "Date", dataIndex: "date", align: "center" },
    { title: "Sale", dataIndex: "sale", align: "left" },
    { title: "Status", dataIndex: "status", align: "center" },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      render: (_, record) => (
        <Dropdown menu={{ items: buildActionMenuItems(record.raw) }} placement="bottom">
          <a onClick={(e) => e.preventDefault()}>
            <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
          </a>
        </Dropdown>
      ),
    },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      page_code: "expense_advance",
      keyword: f.expense_no || "",
      use_flag: "1",
      user_id: getId(f.sale),
      dealer_id: getId(f.dealer),
      sub_dealer_id: getId(f.customer),
      date: f.date || "",
      activity_type_id: getId(f.type_of_meeting),
      status_code: getStatusCode(f.status),
      document_number_referrent: f.activity_reference || "",
      customer_name: "",
      page: "all",
      page_mode: "list",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
      platform: "web",
    };

    try {
      const response = await useServiceAPI.get(paths.pathActivityExpenseList, requestData);

      if (response.status === 200) {
        const { data, records_filtered, permission } = response.data;

        setPagePermission(permission || {});

        const newDataSource = (data || []).map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          raw: row,
          customer: row.sub_dealer_name,
          dealersd: row.dealer_name,
          expenseNo: row.document_number,
          advanceExp: Number(row.expense_advance || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          activityReference: row.document_number_referrent,
          typeOfMeeting: row.activity_type_name,
          date: row.document_date,
          sale: row.user_name,
          status: (
            <BadgeStatus
              text={row.transaction_status_name}
              bgColor={row.transaction_status_bg_color}
              textColor={row.transaction_status_color}
            />
          ),
          action: row.action || [],
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

  const handleTableChange = (pagination) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      filters: prev.filters,
    }));
  };

  useEffect(() => {
    if (!defaultSaleValue) return;

    setFilterValues((prev) => ({
      ...prev,
      sale: defaultSaleValue,
    }));

    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: {
        ...prev.filters,
        sale: defaultSaleValue,
      },
    }));
  }, [defaultSaleValue]);

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Advance Expense</div>
        {pagePermission?.btn_create && (
          <ActionButton
            mode="create"
            text="Create"
            onClick={() =>
              navigate("/activity/create", {
                state: { pageCode: "expense_advance", page_mode: "create" },
              })
            }
          />
        )}
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