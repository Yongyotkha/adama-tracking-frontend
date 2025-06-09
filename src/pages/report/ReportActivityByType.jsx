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

export default function ReportActivityByType() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState([]);
  const [years, setYears] = useState([]);
  const [sales, setSales] = useState([]);
  const [crops, setCrops] = useState([]);
  const [products, setProducts] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [itemColumn, setItemColumn] = useState([]);
  const [defaultOption, setDefaultOption] = useState();
  const [permission, setPermission] = useState([]);
  const [dataSource, setDataSource] = useState([]);
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
        const [years, sales, crops, products, dealers, activityType, resArea] =
          await Promise.all([
            useServiceAPI.get(paths.pathMasterYear),
            useServiceAPI.get(paths.pathMasterSaleDropdown),
            useServiceAPI.get(paths.pathMasterCrop),
            useServiceAPI.get(paths.pathMasterProducts),
            useServiceAPI.get(paths.pathMasterDealerAll),
            useServiceAPI.get(paths.pathMasterActivityType),
            useServiceAPI.get(paths.pathMasterAreas),
          ]);
        setYears(years.data);
        setSales(sales.data);
        setCrops(crops.data);
        setProducts(products.data);
        setDealers(dealers.data);

        setActivityList(activityType.data);


        const result = [["", ...activityType.data.map((col) => col.name)]];

        crops.data.forEach((row) => {
          const newRow = [row.name, ...activityType.data.map(() => null)];
          result.push(newRow);
        });


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
      const response = await useServiceAPI.get(paths.pathReportActivityType, requestData);

      if (response.status === 200) {
        const activityData = response.data;

        const formattedData = activityData.map((item, index) => ({
          key: item.activity_type_id,
          activity_type_name: item.activity_type_name,
          total_activity_plan: parseFloat(item.total_activity_plan),
          total_activity_list: parseInt(item.total_activity_list),
          total_activity_actual: parseInt(item.total_activity_actual),
        }));

        setDataSource(formattedData);
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
      title: "Activity Type",
      dataIndex: "activity_type_name",
      key: "activity_type_name",
      align: "left",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
    },
    {
      title: "Activity Plan",
      dataIndex: "total_activity_plan",
      key: "total_activity_plan",
      align: "right",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#009845",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      render: (value) => (
        <InputNumber
          className="w-full"
          disabled
          value={value}
          formatter={(val) => `${parseInt(val)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        />
      ),
    },
    {
      title: "Activity List",
      dataIndex: "total_activity_list",
      key: "total_activity_list",
      align: "right",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#7DB41E",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      render: (value) => (
        <InputNumber
          className="w-full"
          disabled
          value={value}
          formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        />
      ),
    },
    {
      title: "Activity Actual",
      dataIndex: "total_activity_actual",
      key: "total_activity_actual",
      align: "right",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#93CC23",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      render: (value) => (
        <InputNumber
          className="w-full"
          disabled
          value={value}
          formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        />
      ),
    },
  ];



  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Activity Report By Type" />

        <Filter
          onSearch={handleSearch}
          onClear={handleClear}
          filters={filters}
        />

        <BoxPrimary>
          <TableCustomComponent
            header={header}
            dataSource={dataSource}
            pagination={tableParams.pagination}
            loading={tableLoading}
            onChange={handleTableChange}
            footer={() => {
              const totalPlan = dataSource.reduce((sum, row) => sum + (parseFloat(row.total_activity_plan) || 0), 0);
              const totalList = dataSource.reduce((sum, row) => sum + (parseInt(row.total_activity_list) || 0), 0);
              const totalActual = dataSource.reduce((sum, row) => sum + (parseInt(row.total_activity_actual) || 0), 0);

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-[#978B87]">
                    <Table.Summary.Cell index={0}>
                      <b>Total</b>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      <InputNumber
                        className="w-full"
                        disabled
                        value={totalPlan}
                        formatter={(val) =>
                          `${parseInt(val)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        style={{ backgroundColor: "white" }}
                      />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      <InputNumber
                        className="w-full"
                        disabled
                        value={totalList}
                        formatter={(val) =>
                          `${parseInt(val)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        style={{ backgroundColor: "white" }}
                      />
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      <InputNumber
                        className="w-full"
                        disabled
                        value={totalActual}
                        formatter={(val) =>
                          `${parseInt(val)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        style={{ backgroundColor: "white" }}
                      />
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </BoxPrimary>

      </MainLayout>
    </>
  );
}
