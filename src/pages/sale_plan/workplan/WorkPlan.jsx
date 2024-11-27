import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { Dropdown } from "antd";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function WorkPlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState([]);
  const [years, setYears] = useState([]);
  const [dataSource, setDataSource] = useState(false);
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

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [years, status] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear),
          useServiceAPI.get(paths.pathMasterStatus, { status_type: 'work_plan' }),
        ]);

        setYears(years.data);
        setStatus(status.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);


  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    console.log(filters,'filters');

    const requestData = {
      keyword: filters.keyword || "",
      year_code: filters.year || "",
      status_code: filters.status_code || "",
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathGetWorkPlanList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = data.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          workPlan: row.overall_target,
          year: row.year_name,
          action: (
            <Dropdown
              menu={{
                items: row.action.map((actionItem, actionIndex) => ({
                  key: actionIndex,
                  label: (
                    <ItemDropDown
                      mode={actionItem.action.toLowerCase()}
                      onClick={() =>
                        navigate(actionItem.action_url, {
                          state: {
                            year_code: row.year_code,
                          },
                        })
                      }
                    />
                  ),
                })),
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
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
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

  const header = [
    {
      title: "Years",
      width: 100,
      dataIndex: "year",
      align: "left",
    },
    {
      title: "Work Plan (THB)",
      width: 100,
      dataIndex: "workPlan",
      align: "left",
    },
    {
      title: "Last modified",
      width: 100,
      dataIndex: "lastModified",
      align: "left",
    },
    {
      title: "Status",
      width: 100,
      dataIndex: "status",
      align: "left",
    },
    {
      title: "Action",
      width: 100,
      dataIndex: "action",
      align: "left",
    },
  ];

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <div className="title-page">Work Plan</div>

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
