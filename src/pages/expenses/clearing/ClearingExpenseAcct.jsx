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

export default function ClearingExpenseAcct() {
  const { confirm } = Modal;
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const { showNotification } = useContext(AuthContext);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  const navigate = useNavigate();

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

  const handleSearch = (filters) => {
    setTableParams({
      ...tableParams,
      filters,
    });
  };

  const handleClear = () => {
    setTableParams({
      ...tableParams,
      filters: {},
    });
  };

  const handleChange = (filter) => {
    if (filter) {
      const getMasterDealer = async () => {
        try {
          const [dealer] = await Promise.all([
            useServiceAPI.get(paths.pathMasterDealerDropdown, {
              user_id: filter.sale,
            }),
          ]);

          setDealerList(dealer.data);
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาด");
        }
      };

      getMasterDealer();
    } else {
      handleClear();
    }
  };

  const handleDelete = async (documentNumber) => {
    confirm({
      title: "Do you want to delete ?",
      icon: <ExclamationCircleFilled />,
      content: [],
      centered: true, // ตัวเลือกนี้ช่วยจัดให้อยู่กลาง
      async onOk() {
        try {
          // Call API to delete the event
          const response = await useServiceAPI.delete(
            `/activity-expense/delete?document_number=${encodeURIComponent(
              documentNumber
            )}&page_code=${encodeURIComponent("expense_clearing")}`
          );
          await fetchData();
          if (response.status === 200) {
            // Show success notification
            showNotification(
              "success",
              response.data.message || "Event deleted successfully!",
              response.data.message_line || ["The event has been removed."]
            );
          } else {
            // Show error notification if response is not 200
            console.error("Failed to delete event:", response.message);
            showNotification(
              "error",
              response.message || "Failed to delete event.",
              response.message_line || ["Please try again later."]
            );
          }
        } catch (error) {
          // Handle errors and show an error notification
          console.error("Error deleting event:", error);
          showNotification(
            "error",
            "An error occurred while deleting the event.",
            ["Please try again later."]
          );
        }
      },
    });
  };

  // Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [activityType, sale] = await Promise.all([
          useServiceAPI.get(paths.pathMasterActivityType, {}),
          useServiceAPI.get(paths.pathMasterDealerAll, {}),
        ]);

        setActivityList(activityType.data);
        setSaleList(sale.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  const header = [
    { title: "No", dataIndex: "key", align: "center" },
    { title: "Customer", dataIndex: "customer", align: "left" },
    { title: "Expense No", dataIndex: "expenseNo", align: "left" },
    {
      title: "Activity Reference",
      dataIndex: "activityReference",
      align: "left",
    },
    { title: "Type of Meeting", dataIndex: "typeOfMeeting", align: "center" },
    { title: "Date", dataIndex: "date", align: "center" },
    { title: "Status", dataIndex: "status", align: "center" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      page_code: "expense_clearing",
      keyword: filters.keyword || "",
      use_flag: "1",
      user_id: filters.sale,
      dealer_id: filters.customer,
      activity_type_id: filters.type_of_meeting,
      document_number_referrent: filters.activity_reference,
      customer_name: "",
      page: "all",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathActivityExpenseList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = data.map((row, index) => {
          const actionItems = [
            {
              key: "1",
              label: (
                <ItemDropDown
                  mode="edit"
                  link={`/activity/edit?documentNumber=${encodeURIComponent(
                    row.document_number
                  )}&pageCode=${encodeURIComponent(row.page_code)}`}
                />
              ),
            },
            {
              key: "3",
              label: (
                <ItemDropDown
                  mode="delete"
                  link="#"
                  onClick={() => handleDelete(row.document_number)}
                />
              ),
            },
          ];

          return {
            key: index + 1 + (current - 1) * pageSize,
            customer: row.customer_name,
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
              // <Dropdown menu={{ items: actionItems }} placement="bottom">
              <Dropdown
                menu={{
                  items: row.action.map((actionItem, actionIndex) => {
                    let path = "";
                    let mode = actionItem.action.toLowerCase();
                    let onClickHandler = null;

                    if (
                      actionItem.action.toLowerCase() == "edit" ||
                      actionItem.action.toLowerCase() == "view"
                    ) {
                      path = `/activity/${actionItem.action.toLowerCase()}`;
                      onClickHandler = () => {
                        navigate(path, {
                          state: {
                            documentNumber: row.document_number,
                            pageCode: row.page_code,
                          },
                        });
                      };
                    } else {
                      onClickHandler = () => handleDelete(row.document_number);
                    }
                    return {
                      key: actionIndex,
                      label: (
                        <ItemDropDown mode={mode} onClick={onClickHandler} />
                      ),
                    };
                  }),
                }}
                placement="bottom"
              >
                <a onClick={(e) => e.preventDefault()}>
                  <img
                    src="/img/icons/action.png"
                    alt="Actions icon"
                    className="inline-block w-5 h-5"
                  />
                </a>
              </Dropdown>
            ),
          };
        });

        setDataSource(newDataSource);

        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: records_filtered,
          },
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      // sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Clearing Expense</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={(e) =>
            // navigate("/activity/create?pageCode=expense_clearing")
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
