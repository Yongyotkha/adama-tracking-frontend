import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown, Select } from "antd";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import CalendarActivityApp from "../../../components/calendar/CalendarActivity";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import TableExpand from "../../../components/table/TableExpand";
import { AuthContext } from "../../../contexts/AuthContext";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import TableCustomComponent from "../../../components/table/TableCustomComponent";
import TableComponent from "../../../components/table/TableComponent";

export default function ActivityPlanList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceSumary, setDataSourceSummary] = useState([]);
  const [dataSumary, setDataSummary] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [status, setStatus] = useState([]);
  const [sale, setSale] = useState([]);
  const [dealer, setDealer] = useState([]);
  const [defaultOption, setDefaultOption] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const { showNotification, formatNumber } = useContext(AuthContext);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [years, status, sale, dealer] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear),
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "activity_plan",
          }),
          useServiceAPI.get(paths.pathMasterSaleDropdown),
          useServiceAPI.get(paths.pathMasterDealerAll),
        ]);

        if (sale.data.length > 0) {
          const formattedOptions = sale.data.map((item) => ({
            value: item.id,
            label: item.name,
          }));
          setSale(formattedOptions);
        }
        if (years.data.length > 0) {
          const formattedYearsOptions = years.data.map((item) => ({
            value: item.id,
            label: item.name,
          }));
          setYears(formattedYearsOptions);
          setSelectedYear(formattedYearsOptions[0].value);
        }
        setStatus(status.data);
        setDealer(dealer.data);
      } catch (error) {
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, [location.pathname]);

  useEffect(() => {
    if (selectedYear) {
      fetchActivitySummary();
      fetchData();
    }
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
    location.pathname,
    defaultOption,
    selectedYear,
  ]);

  const fetchActivitySummary = async () => {
    try {
      const response = await useServiceAPI.get(paths.pathActivitySummary, {
        year_code: selectedYear,
      });

      if (response.status === 200) {
        const { data } = response;

        // Prepare dataSourceSummary
        const newDataSource = data?.activity_type.map((activity, index) => {
          // Create a row object with type and qty for each month
          const monthData = activity.data_items.reduce((acc, item) => {
            acc[`month_${item.month_id}`] = item.qty || 0;
            return acc;
          }, {});
          return {
            key: index,
            type: activity.activity_type_name,
            ...monthData,
          };
        });

        setDataSourceSummary(newDataSource);
        setDataSummary(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };

  const filters = [
    {
      key: "dealer",
      type: "select",
      label: "Dealer",
      placeholder: "All",
      options: dealer,
    },
    {
      key: "status",
      type: "select",
      label: "Status",
      placeholder: "All",
      options: status,
    },
  ];

  const handleSearch = (filters) => {
    setTableParams({
      ...tableParams,
      filters,
      pagination: {
        current: 1,
        pageSize: 10,
      },
    });
  };

  const handleClear = () => {
    setTableParams({
      ...tableParams,
      filters: {},
    });
  };

  const columns = [
    { title: "Dealer", width: 150, dataIndex: "name", align: "start" },
    {
      title: "Work Plan (THB)",
      width: 150,
      dataIndex: "workPlan",
      align: "center",
    },
    {
      title: "Last Modifiled",
      width: 150,
      dataIndex: "lastModified",
      align: "center",
    },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const columnsSummary = [
    { title: "Type", width: 150, dataIndex: "type", align: "start" },

    ...(Array.isArray(dataSumary?.month_items)
      ? dataSumary.month_items.map((month_item) => ({
          title: month_item.month_name,
          dataIndex: `month_${month_item.month_id}`, // Dynamically map month data
          key: `month_${month_item.month_id}`,
          width: 100,
          align: "center",
        }))
      : []),
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      keyword: filters.keyword || "",
      year_code: selectedYear || "",
      status_code: filters.status || "",
      user_id: defaultOption,
      page_length: current,
      page_size: pageSize,
    };

    try {
      let path = paths.pathActivityPlan;
      const response = await useServiceAPI.get(path, requestData);
      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = data.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          workPlan: formatNumber(row.amount_target),
          name: row.dealer_name,
          action: (
            <Dropdown
              menu={{
                items: row.action.map((actionItem, actionIndex) => {
                  let path = "";
                  let mode = null;
                  let text = null;
                  if (
                    actionItem.action.toLowerCase() == "edit" ||
                    actionItem.action.toLowerCase() == "view"
                  ) {
                    path = "/activity/plan/dealer";
                    mode = actionItem.action.toLowerCase();
                  } else {
                    path = "/activity/plan/dealer/month/edit";
                    text = actionItem.action;
                  }

                  return {
                    key: actionIndex,
                    label: (
                      <ItemDropDown
                        mode={mode}
                        text={text}
                        onClick={() => {
                          navigate(path, {
                            state: {
                              year_code: row.year_code,
                              workplan_header_id: row.workplan_header_id,
                              workplan_area_header_id:
                                row.workplan_area_header_id,
                              workplan_sale_header_id:
                                row.workplan_sale_header_id,
                              user_id: row.user_id,
                              dealer_id: row.dealer_id,
                            },
                          });
                        }}
                      />
                    ),
                  };
                }),
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
          status: (
            <BadgeStatus
              text={row.status_name}
              bgColor={row.bg_color}
              textColor={row.color}
            />
          ),
          lastModified: row.updated_at,
          nestedData: row.data_items.map((dataItem, i) => ({
            key: `${index + 1}-${i + 1}`,
            no: i + 1,
            month: dataItem.month_name,
            value: formatNumber(dataItem.amount_target),
            name: dataItem.sub_dealer_name,
            status: (
              <BadgeStatus
                text={dataItem.status_name}
                bgColor={dataItem.bg_color}
                textColor={dataItem.color}
              />
            ),
            action: (
              <Dropdown
                menu={{
                  items: dataItem.action.map(
                    (actionDataItem, actionDataItemIndex) => {
                      return {
                        key: actionDataItemIndex,
                        label: (
                          <ItemDropDown
                            mode={actionDataItem.action.toLowerCase()}
                            onClick={() => {
                              navigate("/activity/plan/sub-dealer", {
                                state: {
                                  year_code: dataItem.year_code,
                                  workplan_header_id:
                                    dataItem.workplan_header_id,
                                  workplan_area_header_id:
                                    dataItem.workplan_area_header_id,
                                  workplan_sale_header_id:
                                    dataItem.workplan_sale_header_id,
                                  user_id: row.user_id,
                                  month_id: dataItem.month_id,
                                  dealer_id: dataItem.dealer_id,
                                  sub_dealer_id: dataItem.sub_dealer_id,
                                },
                              });
                            }}
                          />
                        ),
                      };
                    }
                  ),
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
          })),
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

  const nestedColumns = [
    { title: "No", width: 100, dataIndex: "no", align: "center" },
    { title: "Sub Dealer", width: 150, dataIndex: "name", align: "start" },
    { title: "Value (THB)", width: 150, dataIndex: "value", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    console.log(pagination);
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between items-center">
        <div className="title-page">Activity Plan</div>
        <div className="flex gap-3">
          <Select
            // showSearch
            allowClear
            style={{
              width: 200,
            }}
            className="border-[#00783F] text-[#00783F]"
            placeholder="All"
            // optionFilterProp="label"
            // filterSort={(optionA, optionB) =>
            //   (optionA?.label ?? "")
            //     .toLowerCase()
            //     .localeCompare((optionB?.label ?? "").toLowerCase())
            // }
            options={years}
            value={selectedYear}
            onChange={(value) => setSelectedYear(value)}
          />
          <Select
            showSearch
            allowClear
            style={{
              width: 200,
            }}
            className="border-[#00783F] text-[#00783F]"
            placeholder="All"
            optionFilterProp="label"
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            options={sale}
            value={defaultOption}
            onChange={(value) => setDefaultOption(value)}
          />
        </div>
      </div>

      {/* <div style={{ padding: "0px" }}>
        <CalendarActivityApp events={events} />
      </div> */}

      <TableComponent
        dataSource={dataSourceSumary}
        header={columnsSummary}
        pagination={false}
        loading={tableLoading}
      />

      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />

      <BoxPrimary>
        <TableExpand
          data={dataSource}
          columns={columns}
          pagination={tableParams.pagination}
          nestedColumns={nestedColumns}
          onChange={handleTableChange}
          loading={tableLoading}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
