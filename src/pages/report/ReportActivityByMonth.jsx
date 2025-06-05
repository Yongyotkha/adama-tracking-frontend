import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Filter from "../../components/filter/Filter";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";
import { Dropdown, InputNumber, Select, Table } from "antd";
import BadgeStatus from "../../components/badge/BadgeStatus";
import ItemDropDown from "../../components/dropdown/ItemDropDown";
import { useLocation, useNavigate } from "react-router-dom";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import Title from "../../components/title/Title";
import TableCustomComponent from "../../components/table/TableCustomComponent";

export default function ReportActivityByMonth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [sales, setSales] = useState([]);
  const [itemColumn, setItemColumn] = useState([]);
  const [defaultOption, setDefaultOption] = useState();
  const [permission, setPermission] = useState([]);
  const [dataSource, setDataSource] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const { showNotification, formatNumber } = useContext(AuthContext);
  const [activityList, setActivityList] = useState([]);
  const [areaList, setAreaList] = useState([]);

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
        const [years, sales, resArea] =
          await Promise.all([
            useServiceAPI.get(paths.pathMasterYear),
            useServiceAPI.get(paths.pathMasterSaleDropdown),
            useServiceAPI.get(paths.pathMasterAreas),

          ]);

        setYears(years.data);
        setSales(sales.data);

        setAreaList(resArea.data);

        if (years.data.length > 0) {
          setTableParams({
            ...tableParams,
            filters: { year_code: years.data[0] },
          });
        }
      } catch (error) {
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
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

    const requestData = {
      keyword: filters.keyword || "",
      year_code: filters.year_code,
      user_id: filters.user_id,
      dealer_id: filters.dealer_id,
      crop_id: filters.crop_id,
      page_length: 1,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathReportActivityByMonth,
        requestData
      );

      if (response.status === 200) {
        const { item, records_filtered, permission, total } =
          response.data;

        const newDataSource = item.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          month_name: row.month_name,
          month_id: row.month_id,
          item: row.item,
        }));

        setPermission(permission);
        setDataSource(newDataSource);
        setItemColumn(total)
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
    if (years.length > 0) {
      fetchData();
    }
  }, [
    // tableParams.pagination.current,
    // tableParams.pagination.pageSize,
    // tableParams.sortOrder,
    // tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange = (pagination, filters, sorter) => {
    console.log(pagination, filters, sorter);
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      // sortOrder: sorter.order === "descend" ? "desc" : "asc",
      // sortField: sorter.field,
    });
  };

  const filters = [
    {
      key: "area_id",
      type: "select",
      label: "Area",
      options: areaList,
    },
    {
      key: "user_id",
      type: "select",
      label: "Sales",
      options: sales,
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
    console.log(filters);
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

  const columnColors = ["#009845", "#7DB41E", "#93CC23"];

  const header = [
    {
      title: "Month",
      dataIndex: "month_name",
      key: "month_name",
      fixed: "left",
      width: 125,
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
    },
    ...itemColumn.map((act, index) => {
      const bgColor = columnColors[index % columnColors.length];
      const activityId = act.activity_type_id;

      return {
        title: act.activity_type_name,
        key: `activity_${activityId}`,
        width: 125,
        onHeaderCell: () => ({
          style: {
            backgroundColor: bgColor,
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          },
        }),
        render: (_, record) => {
          const activityItem = record.item.find(
            (x) => x.activity_type_id === activityId
          );

          const set_value = activityItem ? parseInt(activityItem.total) : 0;

          return (
            <InputNumber
              className="w-full"
              min={0}
              value={set_value}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              disabled={true}
            />
          );
        },
      };
    }),
  ];


  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Activity Report By Month" />

        <Filter
          onSearch={handleSearch}
          onClear={handleClear}
          filters={filters}
        />

        <BoxPrimary>
          <TableCustomComponent
            header={header}
            dataSource={dataSource}
            pagination={false}
            loading={tableLoading}
            onChange={handleTableChange}
            footer={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-[#978B87]">
                  <Table.Summary.Cell
                    index={0}
                  >Total</Table.Summary.Cell>

                  {itemColumn.map((month, index) => {
                    return (
                      <React.Fragment key={`${month.activity_type_id}_${month.activity_type_id}`}>
                        <Table.Summary.Cell
                          key={`${month.id}_work_plan_kg`}
                          align="center"
                        >
                          <InputNumber
                            className="w-full"
                            disabled
                            value={month.total_value}
                            formatter={(value) =>
                              `${parseInt(value)}`.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ","
                              )
                            }
                            style={{ backgroundColor: "white" }}
                          />
                        </Table.Summary.Cell>
                      </React.Fragment>
                    );
                  })}
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </BoxPrimary>
      </MainLayout>
    </>
  );
}
