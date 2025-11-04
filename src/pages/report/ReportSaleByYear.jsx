// src/pages/report/ReportSaleByYear.jsx
import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { InputNumber, Select, Table, Form, Row, Col } from "antd";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import Title from "../../components/title/Title";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import DynamicButton from "../../components/button/DynamicButton";
import ExportMonthlyExcelButton from "../../components/export/ExportMonthlyExcelButton";

// ----- helper: ทำให้ชื่อสินค้าตรงกัน (กัน space/ตัวพิมพ์/อักขระผสม)
const normalize = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

// ----- ค่าปีที่ล็อคตามสเปก payload
const FIXED_YEAR_CODE = "2025";

export default function ReportSaleByYear() {
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [itemColumn, setItemColumn] = useState([]); // items (มี workplan_data_items ข้างใน)
  const [dataSource, setDataSource] = useState(false); // data_items → แถวสินค้า
  const [tableLoading, setTableLoading] = useState(false);
  const { showNotification } = useContext(AuthContext);
  const [formCustom] = Form.useForm();

  // ---------------- Header Columns (ใช้ items[].workplan_data_items)
  const header = [
    {
      title: "Year",
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
          width: 180,
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
    ...itemColumn.map((period, index) => ({
      title: period.name, // "Year"
      key: `period_${index}`,
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
          title: "Work Plan (KG)",
          key: `wkqty_${index}`,
          width: 135,
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
              (period.workplan_data_items || []).find(
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
                  `${parseInt(value || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        // Rolling Forecast (KG)
        {
          title: "Rolling Forecast (KG)",
          key: `rlqty_${index}`,
          width: 150,
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
              (period.workplan_data_items || []).find(
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
                  `${parseInt(value || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        // Actual (KG)
        {
          title: "Actual (KG)",
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
              (period.workplan_data_items || []).find(
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
                  `${parseInt(value || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        // Work Plan (Value)
        {
          title: "Work Plan (Value)",
          key: `wkval_${index}`,
          width: 150,
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
              (period.workplan_data_items || []).find(
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
                  `${parseInt(value || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        // Rolling Forecast (Value)
        {
          title: "Rolling Forecast (Value)",
          key: `rlval_${index}`,
          width: 170,
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
              (period.workplan_data_items || []).find(
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
                  `${parseInt(value || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        // Actual (Value)
        {
          title: "Actual (Value)",
          key: `actval_${index}`,
          width: 140,
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
              (period.workplan_data_items || []).find(
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
                  `${parseInt(value || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
      ],
    })),
  ];

  // ---------------- Table footer totals
  const calculateFooterSums = () => {
    return itemColumn.map((period) => {
      const list = period?.workplan_data_items || [];
      const sumReducer = (field) =>
        list.reduce((sum, product) => sum + (Number(product?.[field]) || 0), 0);

      return {
        id: period.id,
        workplan_qty: sumReducer("workplan_qty"),
        rolling_qty: sumReducer("rolling_qty"),
        actual_qty: sumReducer("actual_qty"),
        workplan_value: sumReducer("workplan_value"),
        rolling_value: sumReducer("rolling_value"),
        actual_value: sumReducer("actual_value"),
      };
    });
  };

  // ---------------- Load masters
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [salesRes, dealersRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown),
          useServiceAPI.get(paths.pathMasterDealerAll),
        ]);

        setSales(
          (salesRes?.data || []).map((x) => ({ value: x.id, label: x.name }))
        );
        setDealers(
          (dealersRes?.data || []).map((x) => ({ value: x.id, label: x.name }))
        );
      } catch (error) {
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    getMaster();
  }, []);

  // ---------------- Fetch data
  const fetchData = async () => {
    setTableLoading(true);

    try {
      const values = await formCustom.validateFields();
      // ✅ payload ต้องมีแค่ 3 คีย์ ตามสเปก
      const payloadClean = {
        year_code: FIXED_YEAR_CODE,
        user_id: values.sale_id || "",
        dealer_id: values.dealer_id || "",
      };

      const response = await useServiceAPI.get(
        paths.pathReportRollingWorkPlanYear,
        payloadClean
      );

      if (response?.status === 200) {
        const root = response?.data?.data ?? response?.data ?? {};
        const data_items = root.data_items ?? [];
        const items = root.items ?? [];

        const rows = (data_items || []).map((row, idx) => ({
          key: idx + 1,
          productName: row.product_name,
          packSize: row.pack_size,
          productId: row.product_id,
        }));

        setItemColumn(items || []);
        setDataSource(rows);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    // โหลดครั้งแรก
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- UI
  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        {/* <Title prefix={`Sales Report (Rolling Work Plan) – Year ${FIXED_YEAR_CODE}`} /> */}
        <Title prefix="Sales Report By Year" />

        <Form form={formCustom} layout="vertical">
          <BoxPrimary className="m-1 mb-4">
            <Row gutter={16} align="middle">
              <Col md={8}>
                <Form.Item label="Sales (User)" name="sale_id">
                  <Select placeholder="Select Sales" options={sales} allowClear />
                </Form.Item>
              </Col>

              <Col md={8}>
                <Form.Item label="Dealer" name="dealer_id">
                  <Select placeholder="Select Dealer" options={dealers} allowClear />
                </Form.Item>
              </Col>

              <Col md={8}>
                {/* ช่องว่างให้ปุ่มจัดตำแหน่งสวย */}
                <div className="flex justify-end gap-3 pt-7">
                  <DynamicButton
                    onClick={fetchData}
                    name="btn-search"
                    text="Search"
                    iconSrc="/img/icons/search.png"
                    className="text-white px-4 py-3 rounded-[4px] bg-[#7DB41E]"
                  />
                  <DynamicButton
                    onClick={() => {
                      formCustom.resetFields(["sale_id", "dealer_id"]);
                      fetchData();
                    }}
                    name="btn-clear"
                    text="Clear"
                    iconSrc="/img/icons/trash.png"
                    className="text-white px-4 py-3 rounded-[4px] bg-[#B6AEAB]"
                  />
                  {/* Export Excel */}
                  <ExportMonthlyExcelButton
                    text="Export Excel"
                    fileName={`Sales_Report_By_Year_${FIXED_YEAR_CODE}`}
                    getPayload={async () => {
                      const values = await formCustom.validateFields();
                      // ✅ ส่งให้ปุ่มด้วย 3 คีย์เท่านั้น
                      return {
                        year_code: FIXED_YEAR_CODE,
                        user_id: values.sale_id || "",
                        dealer_id: values.dealer_id || "",
                      };
                    }}
                    // ✅ ห่อ requestData เพื่อตัดคีย์ส่วนเกิน (เช่น page_length/page_size ที่ปุ่มอาจใส่เพิ่ม)
                    requestData={(payloadFromButton) => {
                      const clean = {
                        year_code: payloadFromButton.year_code,
                        user_id: payloadFromButton.user_id ?? "",
                        dealer_id: payloadFromButton.dealer_id ?? "",
                      };
                      return useServiceAPI.get(
                        paths.pathReportRollingWorkPlanYear,
                        clean
                      );
                    }}
                  />
                </div>
              </Col>
            </Row>
          </BoxPrimary>
        </Form>

        <BoxPrimary>
          <TableCustomComponent
            header={header}
            dataSource={dataSource}
            pagination={false}
            loading={tableLoading}
            onChange={() => {}}
            footer={() => {
              const footerData = calculateFooterSums();
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-[#978B87]">
                    <Table.Summary.Cell index={0}>Total (THB)</Table.Summary.Cell>
                    {footerData.map((period, index) => (
                      <React.Fragment key={`${period.id}_${index}`}>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={period.workplan_qty}
                            formatter={(value) =>
                              `${parseInt(value || 0)}`.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ","
                              )
                            }
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={period.rolling_qty}
                            formatter={(value) =>
                              `${parseInt(value || 0)}`.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ","
                              )
                            }
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={period.actual_qty}
                            formatter={(value) =>
                              `${parseInt(value || 0)}`.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ","
                              )
                            }
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={period.workplan_value}
                            formatter={(value) =>
                              `${parseInt(value || 0)}`.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ","
                              )
                            }
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={period.rolling_value}
                            formatter={(value) =>
                              `${parseInt(value || 0)}`.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ","
                              )
                            }
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={period.actual_value}
                            formatter={(value) =>
                              `${parseInt(value || 0)}`.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                ","
                              )
                            }
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
