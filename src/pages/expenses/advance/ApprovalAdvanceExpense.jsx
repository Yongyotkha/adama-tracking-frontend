import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown, Modal, Input } from "antd";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import { ExclamationCircleFilled } from "@ant-design/icons";

export default function ApprovalAdvanceExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useParams();
  const { confirm } = Modal;
  const { TextArea } = Input;
  const { showNotification, userInfo } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [activityList, setActivityList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);

  const [filterValues, setFilterValues] = useState({});

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
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
      key: "dealer",
      type: "select",
      label: "Dealer",
      placeholder: "All",
      options: dealerList,
      moderef: true,
    },
    {
      key: "customer",
      type: "select",
      label: "Sub Dealer",
      placeholder: "All",
      options: subDealerList,
    },
    {
      key: "expense_no",
      type: "text",
      label: "Expense No",
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

  useEffect(() => {
    const loadMaster = async () => {
      setLoading(true);
      try {
        const [activityType, sale] = await Promise.all([
          useServiceAPI.get(paths.pathMasterActivityType, {}),
          // useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
          useServiceAPI.get(paths.pathMasterSaleActivity, { status: "all", mode: "all" }),

        ]);

        setActivityList(activityType.data || []);
        setSaleList(sale.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMaster();
  }, []);

  useEffect(() => {
    const sale = filterValues.sale;

    if (!sale) {
      setDealerList([]);
      setSubDealerList([]);
      return;
    }

    const getDealer = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
          user_id: sale,
        });
        setDealerList(res.data || []);
      } catch (err) {
        console.error("Error load dealer:", err);
      }
    };

    getDealer();
  }, [filterValues.sale]);

  useEffect(() => {
    const sale = filterValues.sale;
    const dealer = filterValues.dealer;

    if (!dealer || !sale) {
      setSubDealerList([]);
      return;
    }

    const getSubDealer = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
          user_id: sale,
          dealer_id: dealer,
        });

        const formatted = (res.data || []).map((d) => ({
          id: d.sub_dealer_id,
          name: d.sub_dealer_name,
        }));

        setSubDealerList(formatted);
      } catch (err) {
        console.error("Error load subdealer:", err);
      }
    };

    getSubDealer();
  }, [filterValues.dealer, filterValues.sale]);

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

  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters;

    const req = {
      page_code: "expense_advance",
      keyword: filters.expense_no || "",
      use_flag: "1",
      user_id: getId(filters.sale),
      dealer_id: getId(filters.dealer),
      sub_dealer_id: getId(filters.customer),
      activity_type_id: getId(filters.type_of_meeting),
      document_number_referrent: filters.activity_reference || "",
      date: filters.date || "",
      page: "all",
      page_mode: "waiting_" + role,
      orderby_column: "document_number",
      orderby: "desc",
      page_length: current,
      page_size: pageSize,
    };

    try {
      const res = await useServiceAPI.get(paths.pathActivityExpenseList, req);

      if (res.status === 200) {
        const { data, records_filtered } = res.data;

        const formatted = (data || []).map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          raw: row,
          customer: row.sub_dealer_name,
          dealer: row.dealer_name,
          expenseNo: row.document_number,
          advanceExp: Number(row.expense_advance || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          activityReference: row.document_number_referrent,
          typeOfMeeting: row.activity_type_name,
          sale: row.user_name,
          date: row.document_date,
          status: (
            <BadgeStatus
              text={row.transaction_status_name}
              bgColor={row.transaction_status_bg_color}
              textColor={row.transaction_status_color}
            />
          ),
          action: row.action || [],
        }));

        setDataSource(formatted);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: records_filtered },
        }));
      }
    } catch (err) {
      console.error(err);
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
    JSON.stringify(tableParams.filters),
  ]);

  const handleSearch = (values) => {
    setFilterValues(values);

    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: values,
    }));
  };

  const handleClear = () => {
    setFilterValues({});
    setDealerList([]);
    setSubDealerList([]);

    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Advance Expense</div>
      </div>

      <Filter
        filters={filters}
        values={filterValues}
        onChange={(v) => setFilterValues(v)}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      <BoxPrimary>
        <TableComponent
          header={[
            { title: "No", dataIndex: "key", align: "center" },
            { title: "Sub Dealer", dataIndex: "customer" },
            { title: "Dealer", dataIndex: "dealer" },
            { title: "Expense No", dataIndex: "expenseNo" },
            {
              title: "Advance Exp",
              dataIndex: "advanceExp",
              align: "right",
            },
            { title: "Activity Reference", dataIndex: "activityReference" },
            { title: "Type of Meeting", dataIndex: "typeOfMeeting" },
            { title: "Sales", dataIndex: "sale", width: "200px" },
            { title: "Date", dataIndex: "date" },
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
          ]}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
          onChange={(pagination) =>
            setTableParams((prev) => ({
              ...prev,
              pagination,
            }))
          }
        />
      </BoxPrimary>
    </MainLayout>
  );
}