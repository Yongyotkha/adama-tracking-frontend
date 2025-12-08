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

export default function ReportSaleByYear() {
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]); // [{ value, label }]
  const [defaultYear, setDefaultYear] = useState(null);

  const [areaList, setAreaList] = useState([]);
  const [sales, setSales] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);

  const [itemColumn, setItemColumn] = useState([]); // items (มี workplan_data_items ข้างใน)
  const [dataSource, setDataSource] = useState(false); // data_items → แถวสินค้า
  const [tableLoading, setTableLoading] = useState(false);
  const { showNotification } = useContext(AuthContext);
  const [formCustom] = Form.useForm();

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  // ---------------- Header Columns
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
      title: period.name,
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
                (p) =>
                  normalize(p.product_name) === normalize(record.productName)
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
                  `${parseInt(value || 0, 10)}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
                disabled
              />
            );
          },
        },
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
                (p) =>
                  normalize(p.product_name) === normalize(record.productName)
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
                  `${parseInt(value || 0, 10)}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
                disabled
              />
            );
          },
        },
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
                (p) =>
                  normalize(p.product_name) === normalize(record.productName)
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
                  `${parseInt(value || 0, 10)}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
                disabled
              />
            );
          },
        },
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
                (p) =>
                  normalize(p.product_name) === normalize(record.productName)
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
                  `${parseInt(value || 0, 10)}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
                disabled
              />
            );
          },
        },
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
                (p) =>
                  normalize(p.product_name) === normalize(record.productName)
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
                  `${parseInt(value || 0, 10)}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
                disabled
              />
            );
          },
        },
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
                (p) =>
                  normalize(p.product_name) === normalize(record.productName)
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
                  `${parseInt(value || 0, 10)}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
                disabled
              />
            );
          },
        },
      ],
    })),
  ];

  // ---------------- Table footer totals (รวมเฉพาะแถวที่แสดงจริง)
  const calculateFooterSums = () => {
    const rows = Array.isArray(dataSource) ? dataSource : [];

    return itemColumn.map((period) => {
      const list = Array.isArray(period?.workplan_data_items)
        ? period.workplan_data_items
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
        id: period.id,
        workplan_qty: sumField("workplan_qty"),
        rolling_qty: sumField("rolling_qty"),
        actual_qty: sumField("actual_qty"),
        workplan_value: sumField("workplan_value"),
        rolling_value: sumField("rolling_value"),
        actual_value: sumField("actual_value"),
      };
    });
  };

  // ---------------- Load masters
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [yearsRes, productsRes, areasRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear),
          useServiceAPI.get(paths.pathReportProducts),
          useServiceAPI.get(paths.pathMasterAreas),
        ]);

        const yearRaw = Array.isArray(yearsRes?.data) ? yearsRes.data : [];
        const yearOptions = yearRaw.map((y) => {
          const yc = getYearCodeFrom(y);
          return { value: yc, label: yc };
        });
        setYears(yearOptions);

        setProducts(
          (productsRes?.data || []).map((x) => ({
            value: x.product_name,
            label: x.product_name,
          }))
        );
        setAreaList(
          (areasRes?.data || []).map((x) => ({ value: x.id, label: x.name }))
        );

        // default = last year
        if (yearOptions.length > 0) {
          const latestYear = pickLatestYearCode(yearOptions);
          setDefaultYear(latestYear);
          formCustom.setFieldsValue({ year_code: latestYear });

          await fetchData({
            year_code: latestYear,
            user_id: "",
            dealer_id: "",
            product_name: "",
            platform: "web",
          });
        }

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
        const res = await useServiceAPI.get(paths.pathMasterSaleReport, {
          area_id: areaId,
        });
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
        const res = await useServiceAPI.get(
          paths.pathMasterDealerDropdown,
          { user_id: saleId }
        );
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

  // ❌ ไม่ auto-fetch ตาม year อีกต่อไป

  // ---------------- Fetch data
  const buildPayload = async () => {
    const values = await formCustom.validateFields().catch(() => ({}));
    const yearFromForm =
      getYearCodeFrom(values?.year_code) ||
      defaultYear ||
      dayjs().tz("Asia/Bangkok").format("YYYY");

    return {
      year_code: yearFromForm,
      user_id: values?.sale_id ?? "",
      dealer_id: values?.dealer_id ?? "",
      product_name: values?.product_name ?? "",
      platform: "web",
    };
  };

  const handleSearch = async () => {
    const payload = await buildPayload();
    await fetchData(payload);
  };

  const fetchData = async (payloadFromCaller) => {
    setTableLoading(true);
    try {
      const fallbackPayload = await buildPayload();
      const payload = payloadFromCaller || fallbackPayload;

      const response = await useServiceAPI.get(
        paths.pathReportRollingWorkPlanYear,
        payload
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

  // ทำให้ label เป็น slug สั้นๆอ่านง่าย
  const slug = (s) => String(s ?? "").trim().replace(/\s+/g, "_");

  // สร้างชื่อไฟล์ตามฟิลเตอร์ + ปี + เวลาปัจจุบัน
  const buildYearlyReportFileName = () => {
    const vals = formCustom.getFieldsValue();
    const year =
      getYearCodeFrom(vals.year_code) ||
      defaultYear ||
      dayjs().tz("Asia/Bangkok").format("YYYY");

    const getLabel = (list, val) =>
      (list.find((o) => o.value === val) || {}).label;

    const areaLabel = getLabel(areaList, vals.area_id);
    const salesLabel = getLabel(sales, vals.sale_id);
    const dealerLabel = getLabel(dealers, vals.dealer_id);
    const productLabel =
      getLabel(products, vals.product_name) || vals.product_name;

    const parts = [
      "Sales_Report_By_Year",
      `Y${year}`,
      areaLabel ? `${slug(areaLabel)}` : null,
      salesLabel ? `${slug(salesLabel)}` : null,
      dealerLabel ? `${slug(dealerLabel)}` : null,
      productLabel ? `${slug(productLabel)}` : null,
    ].filter(Boolean);

    const ts = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD_HHmm");
    return `${parts.join("_")}_${ts}`;
  };

  // ---------------- UI
  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Sales Report By Year" />

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
                    placeholder="Select Sales"
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
                    placeholder="Select Dealer"
                    options={dealers}
                    disabled={!formCustom.getFieldValue("sale_id")}
                    allowClear
                  />
                </Form.Item>
              </Col>

              {/* Year filter (ใช้ตอน Search/Clear เท่านั้น) */}
              <Col md={6}>
                <Form.Item label="Year" name="year_code">
                  <Select
                    placeholder="Select Year"
                    options={years}
                    allowClear={false}
                  />
                </Form.Item>
              </Col>

              {/* product hidden */}
              <Form.Item name="product_name" hidden>
                <Select options={products} />
              </Form.Item>
            </Row>

            <div className="flex justify-end gap-3 px-4 pt-5">
              <DynamicButton
                onClick={handleSearch}
                name="btn-search"
                text="Search"
                iconSrc="/img/icons/search.png"
                className="text-white px-4 py-3 rounded-[4px] bg-[#7DB41E]"
              />
              <DynamicButton
                onClick={async () => {
                  // Clear filters + reset year to last year
                  formCustom.resetFields([
                    "area_id",
                    "sale_id",
                    "dealer_id",
                    "product_name",
                    "year_code",
                  ]);

                  setSales([]);
                  setDealers([]);

                  const yearToUse =
                    defaultYear ||
                    pickLatestYearCode(years) ||
                    dayjs().tz("Asia/Bangkok").format("YYYY");

                  if (yearToUse) {
                    formCustom.setFieldsValue({ year_code: yearToUse });
                  }

                  setTableParams((prev) => ({
                    ...prev,
                    pagination: { ...prev.pagination, current: 1 },
                  }));

                  await fetchData({
                    year_code: yearToUse,
                    user_id: "",
                    dealer_id: "",
                    product_name: "",
                    platform: "web",
                  });
                }}
                name="btn-clear"
                text="Clear"
                iconSrc="/img/icons/trash.png"
                className="text-white px-4 py-3 rounded-[4px] bg-[#B6AEAB]"
              />
              <ExportMonthlyExcelButton
                text="Export Excel"
                fileName={buildYearlyReportFileName()}
                getPayload={buildPayload}
                requestData={(payload) =>
                  useServiceAPI.get(
                    paths.pathReportRollingWorkPlanYear,
                    payload
                  )
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
            onChange={() => {}}
            footer={() => {
              const footerData = calculateFooterSums();
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-[#978B87]">
                    <Table.Summary.Cell index={0}>
                      Total (THB)
                    </Table.Summary.Cell>
                    {footerData.map((period, index) => (
                      <React.Fragment key={`${period.id}_${index}`}>
                        <Table.Summary.Cell align="center">
                          <InputNumber
                            className="w-full"
                            readOnly
                            value={period.workplan_qty}
                            formatter={(value) =>
                              `${parseInt(value || 0, 10)}`.replace(
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
                              `${parseInt(value || 0, 10)}`.replace(
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
                              `${parseInt(value || 0, 10)}`.replace(
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
                              `${parseInt(value || 0, 10)}`.replace(
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
                              `${parseInt(value || 0, 10)}`.replace(
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
                              `${parseInt(value || 0, 10)}`.replace(
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
