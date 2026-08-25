import React, { useEffect, useState, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import FilterByOrder from "../../../components/filter/FilterByOrder";
import { Dropdown, Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate, useLocation } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

export default function Traveling() {
  const { confirm } = Modal;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [dataSale, setDataSale] = useState([]);
  const [dataYear, setDataYear] = useState([]);
  const [dataMonth, setDataMonth] = useState([]);
  const [dataStatus, setDataStatus] = useState([]);
  const { showMsg, showNotification, userInfo } = useContext(AuthContext);
  const isAdmin = Number(userInfo?.role_id) === 1;

  const [permission, setPermission] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: "desc",
    sortField: "document_date",
  });

  // Get Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const saleRes = await useServiceAPI.get(
          isAdmin ? paths.pathMasterUserAll : paths.pathMasterSaleExpense,
          isAdmin ? {} : { mode: "all" }
        );
        const [year, month, status] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear, {}),
          useServiceAPI.get(paths.pathMasterMonths, {}),
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "expense_traveling"
          }),
        ]);

        setDataSale(saleRes.data);
        setDataYear(year.data);
        setDataMonth(month.data);

        const dataStatus = [];
        status.data.map((data, index) => {
          dataStatus.push({
            id: data.code,
            name: data.name,
          });
        });
        setDataStatus(dataStatus);

      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, [isAdmin]);

  // Filter configuration
  const filters = [
    {
      key: "sale",
      label: "Sales",
      name: "sale",
      type: "select",
      options: dataSale,
      placeholder: "All",
      moderef: false,
    },
    {
      key: "year",
      label: "Year",
      name: "year",
      type: "select",
      options: dataYear,
      placeholder: "All",
      moderef: false,
    },
    {
      key: "month",
      label: "Month",
      name: "month",
      type: "select",
      options: dataMonth,
      placeholder: "All",
      moderef: false,
    },
    {
      key: "status",
      label: "Status",
      name: "status",
      type: "select",
      options: dataStatus,
      placeholder: "All",
      moderef: false,
    },
  ];

  // Dropdown actions
  // const actionItems = [
  //   {
  //     key: "1",
  //     label: <ItemDropDown mode="edit" link="/expenses/traveling/edit" />,
  //   },
  //   {
  //     key: "2",
  //     label: <ItemDropDown mode="view" link="/expenses/traveling/view" />,
  //   },
  //   { key: "3", label: <ItemDropDown mode="delete" /> },
  // ];

  // Table header configuration
  const header = [
    { title: "No", width: 40, dataIndex: "key", align: "center" },
    { title: "Year", width: 50, dataIndex: "year", align: "center" },
    { title: "Month", width: 150, dataIndex: "month", align: "left" },
    { title: "User", width: 150, dataIndex: "user_name", align: "left" },
    { title: "Date", width: 150, dataIndex: "date", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const handleDelete = (row) => {
    confirm({
      title: "Do you want to delete this traveling expense?",
      icon: <ExclamationCircleFilled />,
      centered: true,
      onOk: async () => {
        try {
          setLoading(true);

          const response = await useServiceAPI.delete(
            paths.pathGetExpenseTravelingDelete,
            {
              platform: "web",
              year: Number(row.year),
              month: Number(row.month),
              user_id: Number(row.user_id),
            }
          );

          if (response.status === 200) {
            const messageData = response.data?.Message || response.data?.message;
            showNotification(
              "success",
              messageData?.Message_Header || response.data?.message || "Notification",
              messageData?.Message_Line || response.data?.message_line || ["Delete successful"]
            );
            fetchData();
          } else {
            showNotification(
              "error",
              response.message || "Delete failed",
              response.message_line || ["Please try again later."]
            );
          }
        } catch (error) {
          showNotification("error", "Delete failed", [error.message || "Please try again later."]);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const buildActionMenuItems = (row) => {
    const apiActions = Array.isArray(row.action) && row.action.length > 0
      ? row.action
      : [{ action: "View" }, { action: "Edit" }];

    return apiActions
      .filter((actionItem) => {
        const action = String(actionItem.action || "").toLowerCase();
        return action !== "delete" || isAdmin;
      })
      .map((actionItem, actionIndex) => {
        const action = String(actionItem.action || "").toLowerCase();

        return {
          key: actionIndex,
          label: (
            <ItemDropDown
              mode={action}
              onClick={() => {
                if (action === "delete") {
                  handleDelete(row);
                  return;
                }

                if (action === "view" || action === "edit") {
                  navigate(`/expenses/traveling/${action}`, {
                    state: {
                      year_code: row.year,
                      month_code: row.month,
                      user_id: row.user_id,
                      action,
                    },
                  });
                }
              }}
            />
          ),
        };
      });
  };

  ////////////////////////////////////////////// table ///////////////////////////////////////////////
  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    const requestData = {
      user_id: filters.sale || "",
      year: filters.year || "",
      month: filters.month || "",
      status_code: filters.status || "",
      page: "all",
      use_flag: filters.use_flag || "",
      orderby_column: "document_date",
      orderby: "desc",
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathGetExpenseTravelingList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;
        setPermission(response.data.permission);

        const newDataSource = data.map((data, index) => ({
          key: index + 1,
          year: data.year,
          month: data.month_name,
          date: data.created_at
            ? String(data.created_at).replace(/\.\d+$/, "")
            : "-",
          user_name: data.user_name,
          status: (
            <BadgeStatus
              text={data.transaction_status_name}
              bgColor={data.transaction_status_bg_color}
              textColor={data.transaction_status_color}
            />
          ),
          // action: (
          //   <Dropdown menu={{ items: actionItems }} placement="bottomRight">
          //     <a onClick={(e) => e.preventDefault()}>
          //       <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
          //     </a>
          //   </Dropdown>
          // ),
          action: (
            <Dropdown
              menu={{
                items: buildActionMenuItems(data),
              }}
              placement="bottom"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img
                  src="/img/icons/action.png"
                  alt="button icon"
                  className="inline-block w-5 h-5 mr-2"
                />
              </a>
            </Dropdown>
          ),
        }));
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
    // if (filter.sale) {
    //   const getMasterDealer = async () => {
    //     setLoading(true);
    //     try {
    //       const [dealer] = await Promise.all([
    //         useServiceAPI.get(paths.pathMasterDealerDropdown, {
    //           user_id: filter,
    //         }),
    //       ]);

    //       setDataDealer(dealer.data);
    //     } catch (error) {
    //       showMsg("error", error.message || "เกิดข้อผิดพลาด");
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    //   getMasterDealer();
    // } else {
    //   handleClear();
    // }
  };
  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      sortOrder: sorter?.order === "descend" ? "desc" : tableParams.sortOrder || "desc",
      sortField: sorter?.field || tableParams.sortField || "document_date",
    });
  };
  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Traveling</div>
        {permission.btn_create && (
          <ActionButton
            mode="create"
            text="Create"
            onClick={() => navigate("/expenses/traveling/create")}
          />
        )}
      </div>

      <FilterByOrder
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
