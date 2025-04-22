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

export default function ReportSaleByQuarter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState([]);
  const [years, setYears] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [itemColumn, setItemColumn] = useState([]);
  const [defaultOption, setDefaultOption] = useState();
  const [permission, setPermission] = useState([]);
  const [dataSource, setDataSource] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const { showNotification, formatNumber } = useContext(AuthContext);
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
        const [years, sales, products, dealers,resArea] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear),
          useServiceAPI.get(paths.pathMasterSaleDropdown),
          useServiceAPI.get(paths.pathMasterProducts),
          useServiceAPI.get(paths.pathMasterDealerAll),
          useServiceAPI.get(paths.pathMasterAreas),
        ]);
        setYears(years.data);
        setSales(sales.data);
        setProducts(products.data);
        setDealers(dealers.data);
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
        paths.pathReportSaleByQuarter,
        requestData
      );

      if (response.status === 200) {
        const { data_items, records_filtered, permission, items } =
          response.data;

        const newDataSource = data_items.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          productName: row.product_name,
          packSize: row.pack_size,
          productId: row.product_id,
        }));
        setItemColumn(items);
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
    {
      key: "product_id",
      type: "select",
      label: "Product",
      options: products,
    },
    {
      key: "dealer_id",
      type: "select",
      label: "Dealer",
      options: dealers,
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

  const header = [
    {
      title: "Quarter", // Row 3
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F", // สีเขียวเข้ม
          color: "white", // สีตัวอักษร
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      children: [
        {
          title: "Product Name", // Row 4
          dataIndex: "productName",
          key: "productName ",
          fixed: "left",
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#00783F", // สีเขียวเข้ม
              color: "white", // สีตัวอักษร
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
        },
      ],
    },
    ...itemColumn.map((month, index) => ({
      title: month.name,
      key: index,
      onHeaderCell: () => ({
        style: {
          backgroundColor: index % 2 === 1 ? "#00783F" : "#009845", // สีเขียวสลับ
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      children: [
        {
          title: "Work Plan(KG)",
          key: index,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: index % 2 === 1 ? "#00783F" : "#009845", // สีเขียวสลับ
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.items.find(
                (product) => product.product_id == record.productId
              ) || {};

            return (
              <InputNumber
                className="w-full"
                min={0}
                value={itemData.work_plan_kg}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled={true}
              />
            );
          },
        },
        {
          title: "Rolling Forecast(KG)",
          key: index,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#7DB41E", // สีเขียวสลับ
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.items.find(
                (product) => product.product_id == record.productId
              ) || {};

            return (
              <InputNumber
                className="w-full"
                min={0}
                value={itemData.rolling_frecase_kg}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled={true}
              />
            );
          },
        },
        {
          title: "Actual(KG)",
          key: index,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#93CC23", // สีเขียวสลับ
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.items.find(
                (product) => product.product_id == record.productId
              ) || {};

            return (
              <InputNumber
                className="w-full"
                min={0}
                value={itemData.actual_kg}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled={true}
              />
            );
          },
        },
        {
          title: "Work Plan(Value)",
          key: index,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: index % 2 === 1 ? "#00783F" : "#009845", // สีเขียวสลับ
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.items.find(
                (product) => product.product_id == record.productId
              ) || {};

            return (
              <InputNumber
                className="w-full"
                min={0}
                value={itemData.workplan_value}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled={true}
              />
            );
          },
        },

        {
          title: "Rolling Forecast(Value)",
          key: index,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#7DB41E", // สีเขียวสลับ
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.items.find(
                (product) => product.product_id == record.productId
              ) || {};

            return (
              <InputNumber
                className="w-full"
                min={0}
                value={itemData.rolling_frecase_value}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled={true}
              />
            );
          },
        },

        {
          title: "Actual(Value)",
          key: index,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#93CC23", // สีเขียวสลับ
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.items.find(
                (product) => product.product_id == record.productId
              ) || {};

            return (
              <InputNumber
                className="w-full"
                min={0}
                value={itemData.actual_value}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled={true}
              />
            );
          },
        },
      ],
    })),
  ];
  console.log("header : ", header);

  console.log("dataSource : ", dataSource);
  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Sales Report By Quater " />

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
            footer={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-[#978B87]">
                  <Table.Summary.Cell
                    index={0}
                  >Total (THB)</Table.Summary.Cell>
                  {itemColumn.map((month, index) => {
                    return (
                      <React.Fragment key={`${month.id}_${index}`}>
                        <Table.Summary.Cell
                          key={`${month.id}_work_plan_kg`}
                          align="center"
                        >
                          <InputNumber
                            className="w-full"
                            disabled
                            value={month.work_plan_kg}
                            formatter={(value) =>
                              `${parseInt(value)}`.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ","
                              )
                            }
                            style={{ backgroundColor: "white" }}
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell
                          key={`${month.id}_workplan_value`}
                          align="center"
                        >
                          <InputNumber
                            className="w-full"
                            disabled
                            value={month.workplan_value}
                            formatter={(value) =>
                              `${parseInt(value)}`.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ","
                              )
                            }
                            style={{ backgroundColor: "white" }}
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell
                          key={`${month.id}_rolling_frecase_kg`}
                          align="center"
                        >
                          <InputNumber
                            className="w-full"
                            disabled
                            value={month.rolling_frecase_kg}
                            formatter={(value) =>
                              `${parseInt(value)}`.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ","
                              )
                            }
                            style={{ backgroundColor: "white" }}
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell
                          key={`${month.id}_rolling_frecase_value`}
                          align="center"
                        >
                          <InputNumber
                            className="w-full"
                            disabled
                            value={month.rolling_frecase_value}
                            formatter={(value) =>
                              `${parseInt(value)}`.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ","
                              )
                            }
                            style={{ backgroundColor: "white" }}
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell
                          key={`${month.id}_actual_kg`}
                          align="center"
                        >
                          <InputNumber
                            className="w-full"
                            disabled
                            value={month.actual_kg}
                            formatter={(value) =>
                              `${parseInt(value)}`.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ","
                              )
                            }
                            style={{ backgroundColor: "white" }}
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell
                          key={`${month.id}_actual_value`}
                          align="center"
                        >
                          <InputNumber
                            className="w-full"
                            disabled
                            value={month.actual_value}
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
