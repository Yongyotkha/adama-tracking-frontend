import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableExpand from "../../../components/table/TableExpand";
import { Dropdown, InputNumber, Select } from "antd";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

export default function RollingForecast() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [status, setStatus] = useState([]);
  const [years, setYears] = useState([]);
  const [sale, setSale] = useState([]);
  const [defaultOption, setDefaultOption] = useState(null);
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

  useEffect(() => {
    getMaster();
  }, []);
  useEffect(() => {
    if (defaultOption) {
      fetchData();
    }
  }, [defaultOption]);

  const getMaster = async () => {
    setLoading(true);
    try {
      const [years, status, sale] = await Promise.all([
        useServiceAPI.get(paths.pathMasterYear),
        useServiceAPI.get(paths.pathMasterStatus, {
          status_type: "rolling_forecast",
        }),
        useServiceAPI.get(paths.pathMasterSaleDropdown),
      ]);

      const formattedOptions = sale.data.map((item) => ({
        value: item.id,
        label: item.name,
      }));

      if (formattedOptions.length > 0) {
        setDefaultOption(formattedOptions[0].value);
      }

      setYears(years.data);
      setStatus(status.data);
      setSale(formattedOptions);
    } catch (error) {
      showNotification("error", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      keyword: filters.keyword || "",
      year_code: filters.year || "",
      status_code: filters.status || "",
      user_id: defaultOption,
      page_length: current,
      page_size: pageSize,
    };

    try {
      let path = paths.pathRollingForecast;
      const response = await useServiceAPI.get(path, requestData);
      console.log(response);
      if (response.status === 200) {
        const { data, records_filtered } = response.data;
        const newDataSource = data.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          workPlan: row.amount_target,
          year: row.year_name,
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
                          console.log();
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
            workPlan: dataItem.amount_target,
            forecast: dataItem.amount_rolling_plan,
            actual: dataItem.amount_actual,
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

  const filters = [
    {
      key: "year",
      type: "select",
      label: "Year",
      options: years,
    },
    {
      key: "status",
      type: "select",
      label: "Status",
      options: status,
    },
  ];

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

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };

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
    { title: "Year", dataIndex: "year", key: "year", width: 100 },
    {
      title: "Work Plan (THB)",
      dataIndex: "workPlan",
      key: "workPlan",
      width: 150,
      render: (text, record) => (
        <span>
          {Number(text)
            .toFixed(2) // แสดงทศนิยม 2 ตำแหน่ง
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: "Last Modified",
      dataIndex: "lastModified",
      key: "lastModified",
      width: 150,
    },
    { title: "Status", dataIndex: "status", key: "status", width: 150 },
    { title: "Action", dataIndex: "action", key: "action", width: 50 },
  ];

  const nestedColumns = [
    { title: "No", dataIndex: "no", key: "no", width: 50 },
    { title: "Month", dataIndex: "month", key: "month", width: 100 },
    {
      title: "Work Plan (THB)",
      dataIndex: "workPlan",
      key: "workPlan",
      width: 150,
      render: (text, record) => (
        <span>
          {Number(text)
            .toFixed(2) // แสดงทศนิยม 2 ตำแหน่ง
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: "Rolling Forecast (THB)",
      dataIndex: "forecast",
      key: "forecast",
      width: 150,
      render: (text, record) => (
        <span>
          {Number(text)
            .toFixed(2) // แสดงทศนิยม 2 ตำแหน่ง
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: "Actual (THB)",
      dataIndex: "actual",
      key: "actual",
      width: 150,
      render: (text, record) => (
        <span>
          {Number(text)
            .toFixed(2) // แสดงทศนิยม 2 ตำแหน่ง
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 50,
    },
  ];

  return (
    <MainLayout loading={loading} childrenStyle="">
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
          options={sale}
          value={defaultOption}
          onChange={(value) => setDefaultOption(value)}
        />
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
