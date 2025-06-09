import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Filter from "../../components/filter/Filter";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";
import { Dropdown, InputNumber, Select, Table, Form, Row, Col } from "antd";
import BadgeStatus from "../../components/badge/BadgeStatus";
import ItemDropDown from "../../components/dropdown/ItemDropDown";
import { useLocation, useNavigate } from "react-router-dom";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import Title from "../../components/title/Title";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import DynamicButton from "../../components/button/DynamicButton";

export default function ReportSaleByMonth() {
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [itemColumn, setItemColumn] = useState([]);
  const [defaultOption, setDefaultOption] = useState();
  const [dataSource, setDataSource] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const { showNotification, formatNumber } = useContext(AuthContext);
  const [areaList, setAreaList] = useState([]);
  const [formCustom] = Form.useForm();

  const header = [
    {
      title: "Month",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      children: [
        {
          title: "Product Name",
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
      ],
    },
    ...itemColumn.map((month, index) => ({
      title: month.name,
      key: index,
      onHeaderCell: () => ({
        style: {
          backgroundColor: index % 2 === 1 ? "#7DB41E" : "#009845", // สีเขียวสลับ
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      children: [
        {
          title: "Plan (Value)",
          key: index,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: index % 2 === 1 ? "#7DB41E" : "#009845", // สีเขียวสลับ
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData = month.product.find(
              (product) => product.product_name === record.productName
            ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={
                  isNaN(itemData.workplan_value) || itemData.workplan_value == null
                    ? 0
                    : itemData.workplan_value
                }
                formatter={(value) => `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                disabled={true}
              />
            );
          },
        },
        {
          title: "Actual (Value)",
          key: index,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: index % 2 === 1 ? "#7DB41E" : "#009845", // สีเขียวสลับ
              //backgroundColor: "#7DB41E", // สีเขียวสลับ
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData = month.product.find(
              (product) => product.product_name === record.productName
            ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={
                  isNaN(itemData.actual_value) || itemData.actual_value == null
                    ? 0
                    : itemData.actual_value
                }
                formatter={(value) => `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                disabled={true}
              />
            );
          },
        },
      ],
    })),
  ];

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
        const [years, sales, products, dealers, resArea] =
          await Promise.all([
            useServiceAPI.get(paths.pathMasterYear),
            useServiceAPI.get(paths.pathMasterSaleDropdown),
            useServiceAPI.get(paths.pathReportProducts),
            useServiceAPI.get(paths.pathMasterDealerAll),
            useServiceAPI.get(paths.pathMasterAreas),
          ]);

        setYears(years.data);
        setSales(sales.data.map((item) => ({
          value: item.id,
          label: item.name
        })));
        setProducts(products.data.map((item) => ({
          value: item.product_name,
          label: item.product_name
        })));
        setDealers(dealers.data.map((item) => ({
          value: item.id,
          label: item.name
        })));
        setAreaList(resArea.data.map((item) => ({
          value: item.id,
          label: item.name
        })));
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

  const handleSearch = async () => {
    fetchData()
  };

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;

    const values = await formCustom.validateFields();

    const payload = {
      sale_id: values.sale_id || null,
      year_code: tableParams.filters.year_code || null,
    };

    try {
      const response = await useServiceAPI.get(paths.pathReportActivityExpense, payload);

      if (response.status === 200) {
        const { item: activityTypes, month: monthList } = response.data;

        // เตรียม columns สำหรับหัวตาราง
        const itemColumnData = monthList.map((month) => {
          const monthId = month.id;

          const productData = activityTypes.map((activity) => {
            const matchingMonthItem = activity.item.find((i) => i.month_id === monthId);

            return {
              product_name: activity.activity_type_name,
              workplan_qty: parseFloat((matchingMonthItem?.total_activity_plan_count || "0").replace(/,/g, "")),
              rolling_qty: 0, // ใช้ได้ถ้ามีค่าในอนาคต
              actual_qty: 0,
              workplan_value: parseFloat((matchingMonthItem?.total_activity_plan_value || "0").replace(/,/g, "")),
              rolling_value: 0,
              actual_value: parseFloat((matchingMonthItem?.expense_actual || "0").replace(/,/g, "")),
            };
          });

          return {
            ...month,
            product: productData,
          };
        });

        // เตรียม rows (ด้านซ้าย)
        const dataSourceFormatted = activityTypes.map((activity, index) => ({
          key: index,
          productName: activity.activity_type_name,
        }));

        setItemColumn(itemColumnData);
        setDataSource(dataSourceFormatted);

        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: dataSourceFormatted.length,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      showNotification("error", error.message || "ไม่สามารถโหลดข้อมูลรายงานได้");
    } finally {
      setTableLoading(false);
    }
  };


  const handleTableChange = (pagination, filters, sorter) => {
    console.log(pagination, filters, sorter);
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
    });
  };



  const calculateFooterSums = () => {
    return itemColumn.map((month) => {
      const workplan_value = month.product.reduce((sum, p) => {
        return sum + (parseFloat(p.workplan_value) || 0);
      }, 0);
      const actual_value = month.product.reduce((sum, p) => {
        return sum + (parseFloat(p.actual_value) || 0);
      }, 0);
      return {
        id: month.id,
        workplan_value,
        actual_value,
      };
    });
  };


  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Activity Expenses Report" />

        <Form form={formCustom} layout="vertical">
          <BoxPrimary className="m-1 mb-4">
            <Row gutter={16} align="middle">

              <Col md={6}>
                <Form.Item
                  label="Area"
                  name="area_id"
                >
                  <Select
                    placeholder="Select Area"
                    options={areaList}
                  />
                </Form.Item>
              </Col>
              <Col md={6}>
                <Form.Item
                  label="Sales"
                  name="sale_id"
                >
                  <Select
                    placeholder="Select Sale"
                    options={sales}
                  />
                </Form.Item>
              </Col>

              <Col md={6}>
                <Form.Item
                  label="Product"
                  name="product_name"
                >
                  <Select
                    placeholder="Select Product"
                    options={products}

                  />
                </Form.Item>
              </Col>
              <Col md={6}>
                <Form.Item
                  label="Dealers"
                  name="dealer_id"
                >
                  <Select
                    placeholder="Select Dealers"
                    options={dealers}
                  />
                </Form.Item>
              </Col>


            </Row>

            <div className="flex justify-end gap-4 px-4 pt-5">
              <DynamicButton
                onClick={handleSearch}
                name='btn-search'
                text="Search"
                iconSrc="/img/icons/search.png"
                className="text-white px-4 py-3 rounded-[4px] bg-[#7DB41E]"

              />
              <DynamicButton
                onClick={() => {
                  formCustom.resetFields(["area_id", "sale_id", "product_name", "dealer_id"]);
                }}
                name="btn-clear"
                text="Clear"
                iconSrc="/img/icons/trash.png"
                className="text-white px-4 py-3 rounded-[4px] bg-[#B6AEAB]"

              />
            </div>
          </BoxPrimary>


        </Form>

        <BoxPrimary>
          <TableCustomComponent
            header={header}
            dataSource={dataSource}
            pagination={false}
            loading={tableLoading}
            onChange={handleTableChange}
            footer={() => {
              const footerData = calculateFooterSums();
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-[#978B87]">
                    <Table.Summary.Cell index={0}><b>Total (THB)</b></Table.Summary.Cell>
                    {footerData.map((month, index) => (
                      <React.Fragment key={`${month.id}_${index}`}>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            disabled
                            value={month.workplan_value}
                            formatter={(value) => `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            disabled
                            value={month.actual_value}
                            formatter={(value) => `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          />
                        </Table.Summary.Cell>
                      </React.Fragment>
                    ))}
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
