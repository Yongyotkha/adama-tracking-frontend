// src/pages/report/ReportSaleByQuarter.jsx
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
import ExportPeriodExcelButton from "../../components/export/ExportPeriodExcelButton";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

// ---------- helpers ----------
const normalize = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const toNum = (v) => {
  if (v == null || v === "") return 0;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// ดึง year_code เป็น string เสมอ
const getYearCodeFrom = (y) => {
  if (y == null) return "";
  if (typeof y === "string" || typeof y === "number") return String(y);
  return y.year_code ?? y.code ?? y.value ?? y.label ?? y.name ?? y.year ?? "";
};

// เลือก “ปีล่าสุด” จากลิสต์ปี
const pickLatestYearCode = (yearsArr) => {
  if (!Array.isArray(yearsArr) || yearsArr.length === 0) {
    return dayjs().tz("Asia/Bangkok").format("YYYY");
  }
  let best = yearsArr[0];
  for (const cur of yearsArr) {
    const b = Number(getYearCodeFrom(best)) || 0;
    const c = Number(getYearCodeFrom(cur)) || 0;
    if (c > b) best = cur;
  }
  return getYearCodeFrom(best);
};

// --------------------------------

export default function ReportSaleByQuarter() {
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [sales, setSales] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);

  const [itemColumn, setItemColumn] = useState([]); // quarters
  const [dataSource, setDataSource] = useState(false); // rows
  const [tableLoading, setTableLoading] = useState(false);
  const { showNotification } = useContext(AuthContext);
  const [formCustom] = Form.useForm();

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  // header
  const header = [
    {
      title: "Quarter",
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
    ...itemColumn.map((q, index) => ({
      title: q.name,
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
        {
          title: "Work Plan(KG)",
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
              (q.workplan_data_items || []).find(
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
                  `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        {
          title: "Rolling Forecast(KG)",
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
              (q.workplan_data_items || []).find(
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
                  `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        {
          title: "Actual(KG)",
          key: `actqty_${index}`,
          width: 135,
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
              (q.workplan_data_items || []).find(
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
                  `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        {
          title: "Work Plan(Value)",
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
              (q.workplan_data_items || []).find(
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
                  `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        {
          title: "Rolling Forecast(Value)",
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
              (q.workplan_data_items || []).find(
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
                  `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
        {
          title: "Actual(Value)",
          key: `actval_${index}`,
          width: 150,
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
              (q.workplan_data_items || []).find(
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
                  `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
      ],
    })),
  ];

  // รวม footer “เฉพาะแถวที่แสดงจริง”
  const calculateFooterSums = () => {
    const rows = Array.isArray(dataSource) ? dataSource : [];

    return itemColumn.map((q) => {
      const list = Array.isArray(q?.workplan_data_items)
        ? q.workplan_data_items
        : [];

      const byProduct = new Map(
        list.map((p) => [normalize(p.product_name), p])
      );

      const sumField = (field) =>
        rows.reduce((acc, row) => {
          const item = byProduct.get(normalize(row.productName));
          return acc + toNum(item?.[field]);
        }, 0);

      return {
        id: q.id,
        workplan_qty: sumField("workplan_qty"),
        rolling_qty: sumField("rolling_qty"),
        actual_qty: sumField("actual_qty"),
        workplan_value: sumField("workplan_value"),
        rolling_value: sumField("rolling_value"),
        actual_value: sumField("actual_value"),
      };
    });
  };

  // ---------- init masters ----------
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [yearsRes, productsRes, areasRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear),
          useServiceAPI.get(paths.pathReportProducts),
          useServiceAPI.get(paths.pathMasterAreas),
        ]);

        const yearList = yearsRes.data || [];
        setYears(yearList);
        setProducts(
          (productsRes.data || []).map((x) => ({
            value: x.product_name,
            label: x.product_name,
          }))
        );
        setAreaList((areasRes.data || []).map((x) => ({ value: x.id, label: x.name })));

        // เริ่มจากปีล่าสุด เก็บเป็น string เลย
        if (yearList.length > 0) {
          const latestYear = pickLatestYearCode(yearList);
          setTableParams((prev) => ({
            ...prev,
            filters: { year_code: latestYear },
          }));
        }

        // ล้าง sales/dealers ตอนเริ่ม
        setSales([]);
        setDealers([]);
      } catch (error) {
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    getMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // เปลี่ยน Area → โหลด Sales
  useEffect(() => {
    const areaId = formCustom.getFieldValue("area_id");
    if (!areaId) {
      setSales([]);
      formCustom.resetFields(["sale_id", "dealer_id"]);
      setDealers([]);
      return;
    }
    (async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterSaleReport, { area_id: areaId });
        const list = Array.isArray(res?.data) ? res.data : [];
        const saleOptions = list.map((item) => ({
          value: Number(item.id),
          label: item.name,
        }));
        setSales(saleOptions);
        formCustom.resetFields(["sale_id", "dealer_id"]);
        setDealers([]);
      } catch {
        setSales([]);
        setDealers([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formCustom.getFieldValue("area_id")]);

  // เปลี่ยน Sale → โหลด Dealers
  useEffect(() => {
    const saleId = formCustom.getFieldValue("sale_id");
    if (!saleId) {
      setDealers([]);
      formCustom.resetFields(["dealer_id"]);
      return;
    }
    (async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, { user_id: saleId });
        const list = Array.isArray(res?.data) ? res.data : [];
        const dealerOptions = list.map((item) => ({
          value: Number(item.id),
          label: item.name,
        }));
        setDealers(dealerOptions);
        formCustom.resetFields(["dealer_id"]);
      } catch {
        setDealers([]);
        formCustom.resetFields(["dealer_id"]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formCustom.getFieldValue("sale_id")]);

  // โหลดข้อมูลเมื่อปี (filters) พร้อม
  useEffect(() => {
    if (getYearCodeFrom(tableParams?.filters?.year_code)) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tableParams.filters)]);

  const handleSearch = async () => {
    const values = await formCustom.validateFields().catch(() => ({}));
    const payload = {
      year_code:
        getYearCodeFrom(tableParams.filters?.year_code) ||
        dayjs().tz("Asia/Bangkok").format("YYYY"),
      user_id: values?.sale_id ?? "",
      dealer_id: values?.dealer_id ?? "",
      product_name: values?.product_name ?? "",
      platform: "web",
    };
    await fetchData(payload);
  };

  const fetchData = async (payloadFromCaller) => {
    setTableLoading(true);
    try {
      const values = (await formCustom.validateFields().catch(() => ({}))) || {};
      const fallbackPayload = {
        year_code:
          getYearCodeFrom(tableParams.filters?.year_code) ||
          dayjs().tz("Asia/Bangkok").format("YYYY"),
        user_id: values?.sale_id ?? "",
        dealer_id: values?.dealer_id ?? "",
        product_name: values?.product_name ?? "",
        platform: "web",
      };
      const payload = payloadFromCaller || fallbackPayload;

      const response = await useServiceAPI.get(
        paths.pathReportRollingWorkPlanQuarter,
        payload
      );

      if (response?.status === 200) {
        const root = response?.data?.data ?? response?.data ?? {};
        const { data_items = [], items = [] } = root;

        const rows = data_items.map((row, index) => ({
          key: index + 1,
          productName: row.product_name,
          packSize: row.pack_size,
          productId: row.product_id,
        }));

        setItemColumn(items);
        setDataSource(rows);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setTableParams({
      pagination,
      filters: tableParams.filters,
    });
  };

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Sales Report By Quarter" />

        <Form form={formCustom} layout="vertical">
          <BoxPrimary className="m-1 mb-4">
            <Row gutter={16} align="middle">
              <Col md={6}>
                <Form.Item label="Area" name="area_id">
                  <Select
                    placeholder="Select Area"
                    options={areaList}
                    onChange={() => {
                      formCustom.resetFields(["sale_id", "dealer_id"]);
                      setSales([]);
                      setDealers([]);
                    }}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col md={6}>
                <Form.Item label="Sales" name="sale_id">
                  <Select
                    placeholder="Select Sale"
                    options={sales}
                    disabled={!formCustom.getFieldValue("area_id")}
                    onChange={() => {
                      formCustom.resetFields(["dealer_id"]);
                      setDealers([]);
                    }}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col md={6}>
                <Form.Item label="Dealers" name="dealer_id">
                  <Select
                    placeholder="Select Dealers"
                    options={dealers}
                    disabled={!formCustom.getFieldValue("sale_id")}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col md={6} className="hidden">
                <Form.Item label="Product" name="product_name">
                  <Select
                    placeholder="Select Product"
                    options={products}
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end gap-4 px-4 pt-5">
              <DynamicButton
                onClick={handleSearch}
                name="btn-search"
                text="Search"
                iconSrc="/img/icons/search.png"
                className="text-white px-4 py-3 rounded-[4px] bg-[#7DB41E]"
              />
              <DynamicButton
                onClick={async () => {
                  formCustom.resetFields(["area_id", "sale_id", "product_name", "dealer_id"]);
                  setSales([]);
                  setDealers([]);
                  fetchData();
                }}
                name="btn-clear"
                text="Clear"
                iconSrc="/img/icons/trash.png"
                className="text-white px-4 py-3 rounded-[4px] bg-[#B6AEAB]"
              />

              <ExportPeriodExcelButton
                text="Export Excel"
                leftTopTitle="Quarter"
                fileName={`Sales_Report_By_Quarter`}
                getPayload={async () => {
                  const values = await formCustom.validateFields().catch(() => ({}));
                  return {
                    year_code:
                      getYearCodeFrom(tableParams.filters?.year_code) ||
                      dayjs().tz("Asia/Bangkok").format("YYYY"),
                    user_id: values?.sale_id ?? "",
                    dealer_id: values?.dealer_id ?? "",
                    product_name: values?.product_name ?? "",
                    platform: "web",
                  };
                }}
                requestData={(payload) =>
                  useServiceAPI.get(paths.pathReportRollingWorkPlanQuarter, payload)
                }
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
            scrollY={false}
            footer={() => {
              const footerData = calculateFooterSums();
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-[#978B87]">
                    <Table.Summary.Cell index={0}>Total (THB)</Table.Summary.Cell>
                    {footerData.map((q, index) => (
                      <React.Fragment key={`${q.id}_${index}`}>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={q.workplan_qty}
                            formatter={(value) =>
                              `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={q.rolling_qty}
                            formatter={(value) =>
                              `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={q.actual_qty}
                            formatter={(value) =>
                              `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={q.workplan_value}
                            formatter={(value) =>
                              `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={q.rolling_value}
                            formatter={(value) =>
                              `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                          />
                        </Table.Summary.Cell>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={q.actual_value}
                            formatter={(value) =>
                              `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
