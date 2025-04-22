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

export default function ReportActivity() {
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

        console.log("crops : ", crops.data);
        console.log("activity list : ", activityType.data);

        const result = [["", ...activityType.data.map((col) => col.name)]];

        crops.data.forEach((row) => {
          const newRow = [row.name, ...activityType.data.map(() => null)];
          result.push(newRow);
        });

        console.log("result : ", result);

        //setDataSource(result);

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
        paths.pathReportSaleByMonth,
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

        const updatedData = items.map((month) => {
          return {
            ...month,
            items: month.items.map((item) => ({
              product_id: item.product_id,
              product_name: item.product_name,
              pack_size: item.pack_size,
              work_plan_kg: item.work_plan_kg,
              workplan_value: item.workplan_value,
            })),
          };
        });

        // const newDataSource = [
        //   {
        //     crop: 12,
        //     productId: "Almagor MCW",
        //     productName: "Almagor MCW",
        //     packSize: "Almagor MCW",
        //     0: 123,
        //     1: 123,
        //     2: 123,
        //     3: 123,
        //     4: 123,
        //     5: 123,
        //     6: 123,
        //     7: 123,
        //     8: 123,
        //     9: 123,
        //     10: 123,
        //     11: 123,
        //     12: 123,
        //   },
        //   {
        //     crop: 12,
        //     productId: "Almagor MCW",
        //     productName: "Almagor MCW",
        //     packSize: "Almagor MCW",
        //     0: 123,
        //     1: 123,
        //     2: 123,
        //     3: 123,
        //     4: 123,
        //     5: 123,
        //     6: 123,
        //     7: 123,
        //     8: 123,
        //     9: 123,
        //     10: 123,
        //     11: 123,
        //     12: 123,
        //   },
        // ];

        setItemColumn(updatedData);
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
      key: "activity_type",
      type: "select",
      label: "Activity Type",
      options: activityList,
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

  const columnColors = ["#009845", "#7DB41E", "#93CC23"];

  const header = [
    {
      title: "Month", // Row 3
      dataIndex: "productName",
      key: "productName",
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
    ...itemColumn.map((month, index) => {
      const bgColor = columnColors[index % columnColors.length]; // หมุนลูปสี

      return {
        title: month.name,
        key: index,
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
      };
    }),
  ];

  console.log("header : ", header);

  console.log("dataSource : ", dataSource);

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Report Activity By Cop" />

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
                    colSpan={2}
                  ></Table.Summary.Cell>
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
