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
import ExportMonthlyExcelButton from "../../components/export/ExportMonthlyExcelButton";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

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
          backgroundColor: index % 2 === 1 ? "#00783F" : "#009845",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      children: [
        // Work Plan (KG)
        {
          title: "Work Plan(KG)",
          key: `wkqty_${index}`,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: index % 2 === 1 ? "#00783F" : "#009845",
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.product.find(
                (p) => normalize(p.product_name) === normalize(record.productName)
              ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={
                  Number.isFinite(Number(itemData.workplan_qty))
                    ? Number(itemData.workplan_qty)
                    : 0
                }
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        // Rolling Forecast (KG)
        {
          title: "Rolling Forecast(KG)",
          key: `rlqty_${index}`,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#7DB41E",
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.product.find(
                (p) => normalize(p.product_name) === normalize(record.productName)
              ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={
                  Number.isFinite(Number(itemData.rolling_qty))
                    ? Number(itemData.rolling_qty)
                    : 0
                }
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        // Actual (KG)
        {
          title: "Actual(KG)",
          key: `actqty_${index}`,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#93CC23",
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.product.find(
                (p) => normalize(p.product_name) === normalize(record.productName)
              ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={
                  Number.isFinite(Number(itemData.actual_qty))
                    ? Number(itemData.actual_qty)
                    : 0
                }
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        // Work Plan (Value)
        {
          title: "Work Plan(Value)",
          key: `wkval_${index}`,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: index % 2 === 1 ? "#00783F" : "#009845",
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.product.find(
                (p) => normalize(p.product_name) === normalize(record.productName)
              ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={
                  Number.isFinite(Number(itemData.workplan_value))
                    ? Number(itemData.workplan_value)
                    : 0
                }
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        // Rolling Forecast (Value)
        {
          title: "Rolling Forecast(Value)",
          key: `rlval_${index}`,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#7DB41E",
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.product.find(
                (p) => normalize(p.product_name) === normalize(record.productName)
              ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={
                  Number.isFinite(Number(itemData.rolling_value))
                    ? Number(itemData.rolling_value)
                    : 0
                }
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        // Actual (Value)
        {
          title: "Actual(Value)",
          key: `actval_${index}`,
          width: 125,
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#93CC23",
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const itemData =
              month.product.find(
                (p) => normalize(p.product_name) === normalize(record.productName)
              ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={
                  Number.isFinite(Number(itemData.actual_value))
                    ? Number(itemData.actual_value)
                    : 0
                }
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
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

    const values = await formCustom.validateFields(); // รับค่าจาก form

    const payload = {
      area_id: values.area_id || null,
      sale_id: values.sale_id || null,
      product_name: values.product_name || null,
      dealer_id: values.dealer_id || null,
      year_code: tableParams.filters.year_code || null,
      page_length: 1,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathReportMonthly,
        payload
      );

      if (response.status === 200) {

        const { data_items, records_filtered, permission, items } = response.data;

        const newDataSource = data_items.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          productName: row.product_name,
          packSize: row.pack_size,
          productId: row.product_id,
        }));

        setItemColumn(items);
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

  const handleTableChange = (pagination, filters, sorter) => {
    console.log(pagination, filters, sorter);
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
    });
  };



  const calculateFooterSums = () => {
    return itemColumn.map((month) => {
      const sumReducer = (field) =>
        month.product.reduce((sum, product) => sum + (product[field] || 0), 0);

      return {
        id: month.id,
        workplan_qty: sumReducer("workplan_qty"),
        rolling_qty: sumReducer("rolling_qty"),
        actual_qty: sumReducer("actual_qty"),
        workplan_value: sumReducer("workplan_value"),
        rolling_value: sumReducer("rolling_value"),
        actual_value: sumReducer("actual_value"),
      };
    });
  };

  // แปลง object -> ข้อความสั้นๆ (รองรับ year_code ที่เป็น {id,name})
  const toText = (v) => {
    if (v == null) return "";
    if (typeof v === "string" || typeof v === "number") return String(v);
    return v.name ?? v.code ?? v.value ?? v.year ?? v.label ?? "";
  };

  // ทำให้ label เป็น slug สั้นๆอ่านง่าย
  const slug = (s) => String(s ?? "").trim().replace(/\s+/g, "_");

  // สร้างชื่อไฟล์ตามฟิลเตอร์ + เวลาปัจจุบัน
  const buildMonthlyReportFileName = () => {
    const vals = formCustom.getFieldsValue(); // {area_id, sale_id, dealer_id, product_name}

    // map value -> label
    const areaLabel =
      (areaList.find((o) => o.value === vals.area_id) || {}).label;
    const salesLabel =
      (sales.find((o) => o.value === vals.sale_id) || {}).label;
    const dealerLabel =
      (dealers.find((o) => o.value === vals.dealer_id) || {}).label;
    const productLabel =
      (products.find((o) => o.value === vals.product_name) || {}).label ||
      vals.product_name;

    // ปีจาก filter (รองรับกรณี year_code เป็น object) fallback ปีปัจจุบัน
    // const yearText =
    //   toText(tableParams?.filters?.year_code) ||
    //   dayjs().tz("Asia/Bangkok").format("YYYY");

    // const parts = [
    //   `Sales_Report_By_Month_${yearText}`,
    //   areaLabel ? `Area_${slug(areaLabel)}` : null,
    //   salesLabel ? `Sales_${slug(salesLabel)}` : null,
    //   dealerLabel ? `Dealer_${slug(dealerLabel)}` : null,
    //   productLabel ? `Product_${slug(productLabel)}` : null,
    // ].filter(Boolean);

    const parts = [
      `Sales_Report_By_Month`,
      areaLabel ? `${slug(areaLabel)}` : null,
      salesLabel ? `${slug(salesLabel)}` : null,
      dealerLabel ? `${slug(dealerLabel)}` : null,
      productLabel ? `${slug(productLabel)}` : null,
    ].filter(Boolean);

    const ts = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD_HHmm");
    return `${parts.join("_")}_${ts}`;
  };
  // ทำให้ชื่อสินค้าตรงกันแบบกันพลาดช่องว่าง/ตัวพิมพ์/อักขระผสม
  const normalize = (s) =>
    (s ?? "")
      .toString()
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Sales Report By Month" />

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
                  label="Dealers"
                  name="dealer_id"
                >
                  <Select
                    placeholder="Select Dealers"
                    options={dealers}
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

              <ExportMonthlyExcelButton
                text="Export Excel"
                fileName={buildMonthlyReportFileName()}
                getPayload={async () => {
                  const values = await formCustom.validateFields();
                  return {
                    area_id: values.area_id || null,
                    sale_id: values.sale_id || null,
                    product_name: values.product_name || null,
                    dealer_id: values.dealer_id || null,
                    // ส่งเป็น primitive กันกรณี year_code เป็น object
                    year_code:
                      toText(tableParams?.filters?.year_code) ||
                      dayjs().tz("Asia/Bangkok").format("YYYY"),
                  };
                }}
                requestData={(payload) =>
                  useServiceAPI.get(paths.pathReportMonthly, payload)
                }
              />

            </div>
          </BoxPrimary>


        </Form>



        <BoxPrimary>
          <TableCustomComponent
            header={header}
            dataSource={dataSource}
            // pagination={tableParams.pagination}
            pagination={false}
            loading={tableLoading}
            onChange={handleTableChange}

            footer={() => {
              const footerData = calculateFooterSums();
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-[#978B87]">
                    <Table.Summary.Cell index={0}>Total (THB)</Table.Summary.Cell>
                    {footerData.map((month, index) => (
                      <React.Fragment key={`${month.id}_${index}`}>
                        <Table.Summary.Cell align="center">
                          <InputNumber className="w-full" readOnly value={month.workplan_qty}
                            formatter={(value) => `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={month.rolling_qty}
                            formatter={(value) => `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={month.actual_qty}
                            formatter={(value) => `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={month.workplan_value}
                            formatter={(value) => `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={month.rolling_value}
                            formatter={(value) => `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
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
