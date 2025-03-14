import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { Dropdown, Select } from "antd";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import { useLocation, useNavigate } from "react-router-dom";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

export default function WorkPlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState([]);
  const [years, setYears] = useState([]);
  const [sale, setSale] = useState([]);
  const [defaultOption, setDefaultOption] = useState();
  const [pathName, setPathName] = useState([]);
  const [permission, setPermission] = useState([]);
  const [dataSource, setDataSource] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
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
    let page_code;
    if (location.pathname == "/sale-plan/work-plan") {
      page_code = "work-plan";
    } else if (location.pathname == "/sale-plan/work-plan-area") {
      page_code = "work-plan-area";
    } else if (location.pathname == "/sale-plan/work-plan-sale") {
      page_code = "work-plan-sale";
    }

    const getMaster = async () => {
      setLoading(true);
      try {
        const [years, status, user] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear),
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "work_plan",
          }),
          useServiceAPI.get(paths.pathMasterWorkPlan, {
            page_code,
          }),
        ]);

        if (user.data.length > 0) {
          const formattedOptions = user.data.map((item) => ({
            value: item.id,
            label: item.name,
          }));

          // if (formattedOptions.length > 0) {
          //   setDefaultOption("");
          // }
          setSale(formattedOptions);
        }
        setYears(years.data);
        setStatus(status.data);
      } catch (error) {
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();

    
  }, [location.pathname]);

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    console.log(filters, "filters");

    const requestData = {
      keyword: filters.keyword || "",
      year_code: filters.year || "",
      status_code: filters.status || "",
      permission_id: defaultOption || "",
      page_length: current,
      page_size: pageSize,
    };

    try {
      let path;
      let pathRole = "";
      if (location.pathname == "/sale-plan/work-plan") {
        path = paths.pathGetWorkPlanList;
        pathRole = "head";
        setPathName(pathRole);
      } else if (location.pathname == "/sale-plan/work-plan-area") {
        path = paths.pathGetWorkPlanAreaList;
        pathRole = "area";
        setPathName(pathRole);
      } else if (location.pathname == "/sale-plan/work-plan-sale") {
        path = paths.pathGetWorkPlanSaleList;
        pathRole = "sale";
        setPathName(pathRole);
      }

      const response = await useServiceAPI.get(path, requestData);

      if (response.status === 200) {
        const { data, records_filtered, permission } = response.data;

        const newDataSource = data.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          workPlan:
            pathRole == "area"
              ? formatNumber(row.amount_target)
              : formatNumber(row.overall_target),
          salePlan:
            pathRole == "area"
              ? formatNumber(row.sale_amount_target)
              : '',
          // workPlan: pathRole,
          name: pathRole == "area" ? row.sale_area_name : row.user_name,
          year: row.year_name,
          action: (
            <Dropdown
              menu={{
                items: row.action.map((actionItem, actionIndex) => {
                  // กำหนดค่า state ตาม pathRole
                  const state = {
                    year_code: row.year_code,
                    mode: actionItem.action.toLowerCase(),
                    ...(pathRole === "area" && {
                      sale_area_id: row.sale_area_id,
                    }),
                    ...(pathRole === "sale" && { user_id: row.user_id }),
                  };

                  return {
                    key: actionIndex,
                    label: (
                      <ItemDropDown
                        mode={actionItem.action.toLowerCase()}
                        text={actionItem.action}
                        onClick={() => {
                          if (pathRole === "sale") {
                            if(actionItem.action.toLowerCase() === "sub dealer by dealer"){
                              navigate("/sale-plan/work-plan-sale/sale-by-subdealer", {
                                state,
                              });
                            }else{
                              navigate("/sale-plan/work-plan-sale/sale-create", {
                                state,
                              });
                            }
                          } else if (pathRole === "area") {
                            navigate(
                              "/sale-plan/work-plan-area/sale-area-create",
                              {
                                state,
                              }
                            );
                          } else {
                            navigate(actionItem.action_url, { state });
                          }
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
        }));

        setPermission(permission);
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
    location.pathname,
  ]);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      // sortOrder: sorter.order === "descend" ? "desc" : "asc",
      // sortField: sorter.field,
    });
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
    setTableParams((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        permission_id: defaultOption,
      },
      pagination: {
        current: 1,
        pageSize: 10,
      },
    }));
  }, [defaultOption]);

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

  const header = [
    {
      title: "Years",
      width: "15%",
      dataIndex: "year",
      align: "left",
    },
    {
      title: "Work Plan (THB)",
      width: "20%",
      dataIndex: "workPlan",
      align: "left",
    },
    ...(pathName == "area"
      ? [
          {
            title: "Sale Plan(THB)",
            width: "20%",
            dataIndex: "salePlan",
            align: "left",
          },
        ]
      : []),
    ...(pathName !== "head"
      ? [
          {
            title: "Name",
            width: "20%",
            dataIndex: "name",
            align: "left",
          },
        ]
      : []),
    
    {
      title: "Last Modified",
      width: "20%",
      dataIndex: "lastModified",
      align: "left",
    },
    {
      title: "Status",
      width: "15%",
      dataIndex: "status",
      align: "center",
    },
    {
      title: "Action",
      width: "10%",
      dataIndex: "action",
      align: "center",
    },
  ];

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <div className="flex justify-between items-center">
          {pathName == "head" && (
            <div className="title-page">Work Plan (Head Of Sale)</div>
          )}
          {pathName == "area" && (
            <div className="title-page">Work Plan (Area)</div>
          )}
          {pathName == "sale" && (
            <div className="title-page">Work Plan (Sales)</div>
          )}

          {permission.btn_select && (
            <Select
              showSearch
              allowClear
              style={{
                width: 200,
              }}
              className="border-[#00783F] text-[#00783F]"
              placeholder="All"
              optionFilterProp="label"
              // filterSort={(optionA, optionB) =>
              //   (optionA?.label ?? "")
              //     .toLowerCase()
              //     .localeCompare((optionB?.label ?? "").toLowerCase())
              // }
              options={sale}
              value={defaultOption}
              onChange={(value) => setDefaultOption(value)}
            />
          )}
        </div>

        <Filter
          onSearch={handleSearch}
          onClear={handleClear}
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
    </>
  );
}
