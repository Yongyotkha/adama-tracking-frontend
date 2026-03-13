import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown, Modal, Input } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import { ExclamationCircleFilled } from "@ant-design/icons";
import DynamicModal from "../../../components/modal/DynamicModal";

export default function ApprovalClearingExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useParams();
  const { confirm } = Modal;
  const { TextArea } = Input;

  const [isTerritoryModalVisible, setIsTerritoryModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const { showNotification, showMsg, userInfo } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [filterValues, setFilterValues] = useState({});

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  const filters = [
    {
      key: "sale",
      type: "select",
      label: "Sales",
      placeholder: "All",
      options: saleList,
      moderef: true,
    },
    {
      key: "customer",
      type: "select",
      label: "Customer",
      placeholder: "All",
      options: dealerList,
    },
    {
      key: "expense_no",
      type: "text",
      label: "Expense No",
      placeholder: "All",
    },
    {
      key: "document_number_advance_referrent",
      type: "text",
      label: "Advance Reference",
      placeholder: "All",
    },
    {
      key: "activity_reference",
      type: "text",
      label: "Activity Reference",
      placeholder: "All",
    },
    {
      key: "type_of_meeting",
      type: "select",
      label: "Type of Meeting",
      placeholder: "All",
      options: activityList,
    },
    {
      key: "date",
      type: "date",
      label: "Date",
      placeholder: "YYYY-MM-DD",
    },
  ];

  const getApproveRejectText = () => {
    let approveText = "Approve";
    let rejectText = "Reject";

    if (userInfo?.role_id == 8) {
      approveText = "Confirm";
      rejectText = "Cancel";
    }

    return { approveText, rejectText };
  };

  const getId = (v) => {
    if (!v) return "";
    if (typeof v === "object") return v.value ?? v.id ?? "";
    return v;
  };

  const handleSearch = (filters) => {
    setFilterValues(filters);
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters,
    }));
  };

  const handleClear = () => {
    setFilterValues({});
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: {},
    }));
  };

  const handleChange = (filter) => {
    setFilterValues(filter || {});

    if (filter?.sale) {
      const getMasterDealer = async () => {
        try {
          const [dealer] = await Promise.all([
            useServiceAPI.get(paths.pathMasterDealerDropdown, {
              user_id: filter.sale,
            }),
          ]);

          setDealerList(dealer.data || []);
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาด");
        }
      };

      getMasterDealer();
    } else {
      setDealerList([]);
    }
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
            `/activity-expense/delete?document_number=${encodeURIComponent(
              documentNumber
            )}&page_code=${encodeURIComponent("expense_clearing")}`
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
          showNotification(
            "error",
            "An error occurred while deleting.",
            ["Please try again later."]
          );
        }
      },
    });
  };

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [activityType, sale] = await Promise.all([
          useServiceAPI.get(paths.pathMasterActivityType, {}),
          // useServiceAPI.get(paths.pathMasterDealerAll, {}),
          useServiceAPI.get(paths.pathMasterSaleActivity, { status: "all", mode: "all" }),

        ]);

        setActivityList(activityType.data || []);
        setSaleList(sale.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  const handleOpenPage = (row, mode = "view") => {
    navigate("/activity/approve", {
      state: {
        documentNumber: row.document_number,
        pageCode: row.page_code,
        page_mode: mode,
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
          const result = await useServiceAPI.put(paths.pathClearingApproval, {
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
        itemMode = "reject";
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

  const header = [
    { title: "No", dataIndex: "key", align: "center" },
    { title: "Sub Dealer", dataIndex: "customer", align: "left" },
    { title: "Dealer", dataIndex: "dealer", align: "left" },
    { title: "Expense No", dataIndex: "expenseNo", align: "left" },
    {
      title: "Actual Exp",
      dataIndex: "actualExp",
      align: "right",
    },
    {
      title: "Activity Reference",
      dataIndex: "activityReference",
      align: "left",
    },
    {
      title: "Advance Reference",
      dataIndex: "advanceReference",
      align: "left",
    },
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
            <img
              src="/img/icons/action.png"
              alt="Actions icon"
              className="inline-block w-5 h-5"
            />
          </a>
        </Dropdown>
      ),
    },
  ];

  useEffect(() => {
    console.log("logs updated:", logs);
  }, [logs]);

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      page_code: "expense_clearing",
      document_number_advance_referrent: filters.document_number_advance_referrent || filters.document_number_advance_referrent || "",
      keyword: filters.expense_no || filters.keyword || "",
      use_flag: "1",
      user_id: getId(filters.sale),
      dealer_id: getId(filters.customer),
      activity_type_id: getId(filters.type_of_meeting),
      document_number_referrent: filters.activity_reference || "",
      customer_name: "",
      date: filters.date || "",
      page: "all",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
      page_mode: "waiting_" + role,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathActivityExpenseList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = (data || []).map((row, index) => {
          let bad_status = (
            <BadgeStatus
              text={row.transaction_status_name}
              bgColor={row.transaction_status_bg_color}
              textColor={row.transaction_status_color}
            />
          );

          if (row.transaction_status_name === "Reject") {
            bad_status = (
              <BadgeStatus
                text={row.transaction_status_name}
                bgColor={row.transaction_status_bg_color}
                textColor={row.transaction_status_color}
                onClick={async () => {
                  await fetchDialog(row.document_number);
                  setIsTerritoryModalVisible(true);
                }}
              />
            );
          }

          return {
            key: index + 1 + (current - 1) * pageSize,
            raw: row,
            customer: row.sub_dealer_name,
            dealer: row.dealer_name,
            expenseNo: row.document_number,
            actualExp: Number(row.expense_actual_exp || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            activityReference: row.document_number_referrent,
            advanceReference: row.advance_reference_no,
            typeOfMeeting: row.activity_type_name,
            date: row.document_date,
            sale: row.user_name,
            status: bad_status,
            action: row.action || [],
          };
        });

        setDataSource(newDataSource);

        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: records_filtered || 0,
          },
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
    location.pathname,
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      filters: prev.filters,
      sortField: sorter?.field,
    }));
  };

  const logsColumns = [
    {
      title: "วันที่",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "เหตุผล",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "ผู้ดำเนินการ",
      dataIndex: "update_by",
      key: "update_by",
    },
  ];

  const fetchDialog = async (document_number) => {
    setLoading(true);

    try {
      const response = await useServiceAPI.get(paths.pathActivityExpenseLog, {
        document_number: document_number,
      });

      const rawData = response?.data ?? [];
      if (Array.isArray(rawData) && rawData.length > 0) {
        const territoryData = rawData.map((item, index) => ({
          key: index + 1,
          date: item.updated_at,
          status: item.description,
          reason: item.remark,
          update_by: item.update_by,
        }));
        setLogs(territoryData);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
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
              state: {
                pageCode: "expense_clearing",
              },
            })
          }
        />
      </div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleChange}
        filters={filters}
        values={filterValues}
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

      <DynamicModal
        title="Log Detail"
        isVisible={isTerritoryModalVisible}
        onClose={() => setIsTerritoryModalVisible(false)}
        header={logsColumns}
        dataSource={logs}
        width="1200px"
      />
    </MainLayout>
  );
}