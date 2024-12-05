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

export default function ActivityPlanList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [defaultOption, setDefaultOption] = useState(null);
  const { showNotification,formatNumber } = useContext(AuthContext);
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
    fetchData();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
    location.pathname,
  ]);

  const filters = [
    {
      key: "dealer",
      type: "select",
      label: "Dealer",
      placeholder: "All",
      options: [{ value: "Dealer A", label: "Dealer A" }],
    },
    {
      key: "Date",
      type: "date",
      label: "Date",
    },
    {
      key: "status",
      type: "select",
      label: "Status",
      placeholder: "All",
      options: [
        { value: "Active", label: "Active" },
        { value: "InActive", label: "InActive" },
      ],
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

  const columns = [
    { title: "Dealer", width: 150, dataIndex: "name", align: "center" },
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

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      keyword: filters.keyword || "",
      year_code: filters.year || "",
      status_code: filters.status || "",
      user_id: defaultOption || 96,
      page_length: current,
      page_size: pageSize,
    };

    try {
      let path = paths.pathActivityPlan;
      const response = await useServiceAPI.get(path, requestData);
      console.log(response);
      if (response.status === 200) {
        const { data, records_filtered } = response.data;
        const newDataSource = data.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          workPlan: formatNumber(row.amount_target),
          name: row.user_name,
          action: (
            <Dropdown
              menu={{
                items: row.action.map((actionItem, actionIndex) => {
                  return {
                    key: actionIndex,
                    label: (
                      <ItemDropDown
                        mode={actionItem.action.toLowerCase()}
                        onClick={() => {
                          navigate("/sale-plan/rolling-forecast/month", {
                            state: {
                              year_code: row.year_code,
                              workplan_header_id: row.workplan_header_id,
                              workplan_area_header_id:
                                row.workplan_area_header_id,
                              workplan_sale_header_id:
                                row.workplan_sale_header_id,
                              user_id: row.user_id,
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
            name: dataItem.dealer_name,
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
                              navigate("/sale-plan/rolling-forecast/quarter", {
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
    { title: "No", width: 50, dataIndex: "no", align: "center" },
    { title: "Sub Dealer", width: 150, dataIndex: "name", align: "center" },
    { title: "Value (THB)", width: 150, dataIndex: "value", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  // Example events passed via props
  const events = {
    "2024-11-01": [
      {
        id: 1,
        title: "Meeting",
        color: "purple",
        icons: ["👩‍👩‍👧👩‍👩‍👧👩‍👩‍👧", "+3"],
        type: "ribbon",
      },
      {
        id: 2,
        title: "Meeting",
        color: "red",
        icons: ["👩‍👩‍👧", "+2"],
        type: "ribbon",
      },
      {
        id: 3,
        title: "Meeting",
        color: "green",
        icons: ["👩‍👩‍👧", "+1"],
        type: "ribbon",
      },
      {
        id: 4,
        title: "Meeting",
        color: "blue",
        icons: ["👩‍👩‍👧", "+3"],
        type: "ribbon",
      },
    ],
    "2024-11-07": [
      { id: 1, color: "red", icons: ["⭐"], type: "badge" },
      { id: 2, color: "blue", icons: ["📹"], type: "badge" },
      { id: 3, color: "green", icons: ["➕"], type: "badge" },
      { id: 4, color: "orange", icons: ["🍊"], type: "badge" },
      { id: 5, title: "Visit", color: "purple", icons: ["👨‍👩‍👦"], type: "ribbon" },
    ],
  };

  const handleTableChange = (pagination, filters, sorter) => {
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
        <div className="title-page">Rolling Forecast</div>
        <Select
          showSearch
          allowClear
          style={{
            width: 200,
          }}
          className="border-[#00783F] text-[#00783F]"
          placeholder="Search to Select"
          optionFilterProp="label"
          filterSort={(optionA, optionB) =>
            (optionA?.label ?? "")
              .toLowerCase()
              .localeCompare((optionB?.label ?? "").toLowerCase())
          }
          options={years}
          value={defaultOption}
          onChange={(value) => setDefaultOption(value)}
        />
      </div>

      <div style={{ padding: "0px" }}>
        <CalendarActivityApp events={events} />
      </div>

      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />

      <BoxPrimary>
        <TableExpand
          data={dataSource}
          columns={columns}
          nestedColumns={nestedColumns}
          onChange={handleTableChange}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
