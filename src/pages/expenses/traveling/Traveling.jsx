import React, { useEffect, useState, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import FilterByOrder from "../../../components/filter/FilterByOrder";
import { Dropdown } from "antd";
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [dataSale, setDataSale] = useState([]);
  const [dataYear, setDataYear] = useState([]);
  const [dataMonth, setDataMonth] = useState([]);
  const [dataStatus, setDataStatus] = useState([]);
  const { showMsg, showNotification } = useContext(AuthContext);

  const [permission, setPermission] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  // Get Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [sale, year, month, status] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown, {
            status: "",
          }),
          useServiceAPI.get(paths.pathMasterYear, {}),
          useServiceAPI.get(paths.pathMasterMonths, {}),
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "expense_traveling"
          }),
        ]);

        setDataSale(sale.data);
        setDataYear(year.data);
        setDataMonth(month.data);
        setDataStatus(status.data)
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  // Filter configuration
  const filters = [
    {
      key: "sale",
      label: "Sale",
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
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Year", width: 100, dataIndex: "year", align: "center" },
    { title: "Month", width: 150, dataIndex: "month", align: "left" },
    { title: "Date", width: 150, dataIndex: "date", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  ////////////////////////////////////////////// table ///////////////////////////////////////////////
  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "year";

    const requestData = {
      user_id: filters.sale || "",
      year: filters.year || "",
      month: filters.month || "",
      status: filters.status || "",
      page: "all",
      use_flag: filters.use_flag || "",
      orderby_column: sortField,
      orderby: sortOrder,
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
          date: data.updated_at,
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
              // menu={{
              //   items: order.action.map((actionItem, actionIndex) => ({
              //     key: actionIndex,
              //     label: (
              //       <ItemDropDown mode={actionItem.action.toLowerCase()}
              //       onClick={() => {
              //         navigate("/order/view", {
              //           state: {
              //             document_number: order.document_number,
              //           },
              //         });
              //       }}

              //       />
              //     ),
              //   })),
              // }}

              menu={{
                items: [
                  {
                    key: 1,
                    label: (
                      <ItemDropDown
                        mode="view"
                        onClick={() => {
                          navigate("/expenses/traveling/view", {
                            state: {
                              year_code: data.year,
                              month_code: data.month,
                              user_id: data.user_id,
                            },
                          });
                        }}
                      />
                    ),
                  },
                  {
                    key: 2,
                    label: (
                      <ItemDropDown
                        mode="edit"
                        onClick={() => {
                          navigate("/expenses/traveling/edit", {
                            state: {
                              year_code: data.year,
                              month_code: data.month,
                              user_id: data.user_id,
                            },
                          });
                        }}
                      />
                    ),
                  },
                ],
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
        <TableComponent header={header} dataSource={dataSource} />
      </BoxPrimary>
    </MainLayout>
  );
}
