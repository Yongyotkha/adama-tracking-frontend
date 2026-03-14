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

const getYearCodeFrom = (y) => {
  if (y == null) return "";
  if (typeof y === "string" || typeof y === "number") return String(y);
  return y.year_code ?? y.code ?? y.value ?? y.label ?? y.name ?? y.year ?? "";
};

const getLoginSaleId = (u) => (u ? u.sale_id ?? u.user_id ?? u.id ?? null : null);
const getLoginAreaId = (u) => (u ? u.area_id ?? u.areaId ?? u.area ?? null : null);

export default function ReportSaleByQuarter() {
  const { showNotification, userInfo } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  // masters
  const [years, setYears] = useState([]);
  const [defaultYear, setDefaultYear] = useState(null);
  const [areaList, setAreaList] = useState([]);
  const [sales, setSales] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);

  // table
  const [itemColumn, setItemColumn] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // user
  const [areaId, setAreaId] = useState();
  const [roleId, setRoleId] = useState();
  const isAdmin = Number(roleId) === 1;

  // lock sale
  const [isSaleLocked, setIsSaleLocked] = useState(false);
  const isSaleRoleLocked = [4, 5, 6].includes(Number(roleId));
  const [userLoaded, setUserLoaded] = useState(false);

  // form
  const [formCustom] = Form.useForm();
  const watchedAreaId = Form.useWatch("area_id", formCustom);
  const watchedSaleId = Form.useWatch("sale_id", formCustom);

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  // ===== load user detail =====
  useEffect(() => {
    (async () => {
      try {
        const res = await useServiceAPI.get(
          `${paths.pathMasterUsersDetail}/${userInfo.id}`,
          {},
          setLoading
        );

        if (res?.status === 200) {
          const aId = res.data.area_id;
          const rId = res.data.role_id;

          setAreaId(aId);
          setRoleId(rId);

          if (Number(rId) !== 1 && aId != null) {
            formCustom.setFieldsValue({ area_id: String(aId) });
          }
        }
      } catch (e) {
        console.log(e);
        showNotification?.("error", e?.message || "เกิดข้อผิดพลาด");
      } finally {
        setUserLoaded(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== helper: load sales by area =====
  const loadSalesByArea = async (area_id) => {
    if (!area_id) {
      setSales([]);
      return [];
    }

    try {
      const res = await useServiceAPI.get(paths.pathMasterSaleSingle, {
        area_id,
      });

      const raw = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(raw) ? raw : [];

      const options = list.map((it) => ({
        value: String(it.user_id ?? it.id),
        label: it.user_name ?? it.name,
      }));

      setSales(options);
      return options;
    } catch (e) {
      console.log(e);
      setSales([]);
      showNotification?.("error", "โหลด Sales ไม่สำเร็จ");
      return [];
    }
  };

  // ===== load masters + initial fetch =====
  useEffect(() => {
    if (!userLoaded) return;
    if (roleId == null) return;

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

        const areaOpts = (areasRes?.data || []).map((x) => ({
          value: String(x.id),
          label: x.name,
        }));
        setAreaList(areaOpts);

        const currentYear = dayjs().tz("Asia/Bangkok").format("YYYY");
        const matched =
          yearOptions.find((y) => getYearCodeFrom(y) === currentYear) ||
          yearOptions[0];

        const initialYear = getYearCodeFrom(matched) || currentYear;

        setDefaultYear(initialYear);
        formCustom.setFieldsValue({ year_code: initialYear });

        const curArea = formCustom.getFieldValue("area_id");

        if (isAdmin) {
          if (!curArea && areaOpts.length === 1) {
            formCustom.setFieldsValue({ area_id: areaOpts[0].value });
            await loadSalesByArea(areaOpts[0].value);
          } else if (curArea) {
            await loadSalesByArea(curArea);
          }
        } else if (curArea) {
          await loadSalesByArea(curArea);
        }

        await fetchData({
          year_code: initialYear,
          user_id: "",
          dealer_id: "",
          product_name: "",
          platform: "web",
          ...(formCustom.getFieldValue("area_id")
            ? { area_id: formCustom.getFieldValue("area_id") }
            : {}),
        });
      } catch (error) {
        showNotification("error", error?.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoaded, roleId]);

  // ===== Area -> load Sales =====
  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (!watchedAreaId) {
        setSales([]);
        setDealers([]);
        formCustom.setFieldsValue({ sale_id: undefined, dealer_id: undefined });
        setIsSaleLocked(false);
        return;
      }

      const salesOpts = await loadSalesByArea(watchedAreaId);
      if (!alive) return;

      setDealers([]);
      formCustom.setFieldsValue({ sale_id: undefined, dealer_id: undefined });

      if (!salesOpts || salesOpts.length === 0) {
        setIsSaleLocked(false);
      }
    };

    run().catch(() => {
      if (!alive) return;
      setSales([]);
      setDealers([]);
      formCustom.setFieldsValue({ sale_id: undefined, dealer_id: undefined });
      setIsSaleLocked(false);
    });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedAreaId]);

  // ===== Auto select own sale + lock เฉพาะ role 4,5,6 =====
  useEffect(() => {
    const loginSaleId = getLoginSaleId(userInfo);
    const loginAreaId = getLoginAreaId(userInfo);

    if (!isSaleRoleLocked) {
      setIsSaleLocked(false);
      return;
    }

    if (!watchedAreaId) {
      setIsSaleLocked(false);
      return;
    }

    if (!Array.isArray(sales) || sales.length === 0) {
      setIsSaleLocked(false);
      return;
    }

    const foundSale = sales.find((s) => String(s.value) === String(loginSaleId));

    if (foundSale) {
      if (loginAreaId != null && String(watchedAreaId) !== String(loginAreaId)) {
        formCustom.setFieldsValue({ area_id: String(loginAreaId) });
        return;
      }

      formCustom.setFieldsValue({
        sale_id: String(foundSale.value),
        dealer_id: undefined,
      });

      setIsSaleLocked(true);
      fetchData();
    } else {
      setIsSaleLocked(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedAreaId, sales, userInfo, roleId]);

  // ===== Sale -> load Dealers =====
  useEffect(() => {
    let alive = true;

    const loadDealers = async () => {
      if (!watchedSaleId) {
        setDealers([]);
        formCustom.setFieldsValue({ dealer_id: undefined });
        return;
      }

      try {
        const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
          user_id: watchedSaleId,
        });

        const raw = res?.data?.data ?? res?.data ?? [];
        const list = Array.isArray(raw) ? raw : [];

        if (!alive) return;

        setDealers(list.map((it) => ({ value: Number(it.id), label: it.name })));
        formCustom.setFieldsValue({ dealer_id: undefined });
      } catch (e) {
        console.log(e);
        if (!alive) return;
        setDealers([]);
        formCustom.setFieldsValue({ dealer_id: undefined });
      }
    };

    loadDealers();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedSaleId]);

  // ===== Table header =====
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
      key: `q_${index}`,
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

  // ===== footer sums =====
  const calculateFooterSums = () => {
    const rows = Array.isArray(dataSource) ? dataSource : [];

    return itemColumn.map((q) => {
      const list = Array.isArray(q?.workplan_data_items) ? q.workplan_data_items : [];
      const byProduct = new Map(list.map((p) => [normalize(p.product_name), p]));

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

  // ===== fetch =====
  const fetchData = async (payloadFromCaller) => {
    setTableLoading(true);
    try {
      const values = (await formCustom.validateFields().catch(() => ({}))) || {};
      const yearFromForm =
        getYearCodeFrom(values?.year_code) ||
        defaultYear ||
        dayjs().tz("Asia/Bangkok").format("YYYY");

      const fallbackPayload = {
        year_code: yearFromForm,
        user_id: values?.sale_id ?? "",
        dealer_id: values?.dealer_id ?? "",
        product_name: values?.product_name ?? "",
        platform: "web",
        ...(values?.area_id ? { area_id: values.area_id } : {}),
      };

      const payload = payloadFromCaller || fallbackPayload;

      const response = await useServiceAPI.get(
        paths.pathReportRollingWorkPlanQuarter,
        payload
      );

      if (response?.status === 200) {
        const root = response?.data?.data ?? response?.data ?? {};
        const { data_items = [], items = [] } = root;

        const rows = (data_items || []).map((row, index) => ({
          key: index + 1,
          productName: row.product_name,
          packSize: row.pack_size,
          productId: row.product_id,
        }));

        setItemColumn(items || []);
        setDataSource(rows);
      }
    } catch (error) {
      console.error(error);
      setItemColumn([]);
      setDataSource([]);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSearch = async () => {
    const values = await formCustom.validateFields().catch(() => ({}));
    const yearFromForm =
      getYearCodeFrom(values?.year_code) ||
      defaultYear ||
      dayjs().tz("Asia/Bangkok").format("YYYY");

    const payload = {
      year_code: yearFromForm,
      user_id: values?.sale_id ?? "",
      dealer_id: values?.dealer_id ?? "",
      product_name: values?.product_name ?? "",
      platform: "web",
      ...(values?.area_id ? { area_id: values.area_id } : {}),
    };

    await fetchData(payload);
  };

  const handleTableChange = (pagination) => {
    setTableParams((prev) => ({ ...prev, pagination }));
  };

  const slug = (s) => String(s ?? "").trim().replace(/\s+/g, "_");

  return (
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
                  disabled={!isAdmin || isSaleLocked}
                  allowClear={isAdmin && !isSaleLocked}
                  onChange={async (value) => {
                    if (!isAdmin) return;

                    formCustom.setFieldsValue({ sale_id: undefined, dealer_id: undefined });
                    setSales([]);
                    setDealers([]);
                    setIsSaleLocked(false);

                    if (value) await loadSalesByArea(value);
                  }}
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item label="Sales" name="sale_id">
                <Select
                  placeholder="Select Sale"
                  options={sales}
                  disabled={!watchedAreaId || isSaleRoleLocked}
                  allowClear={!isSaleRoleLocked}
                  onChange={() => {
                    formCustom.setFieldsValue({ dealer_id: undefined });
                    setDealers([]);
                  }}
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item label="Dealers" name="dealer_id">
                <Select
                  placeholder="Select Dealers"
                  options={dealers}
                  disabled={!watchedSaleId}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item label="Year" name="year_code">
                <Select placeholder="Select Year" options={years} allowClear={false} />
              </Form.Item>
            </Col>

            <Form.Item name="product_name" hidden>
              <Select options={products} />
            </Form.Item>
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
                const yearToUse =
                  defaultYear || dayjs().tz("Asia/Bangkok").format("YYYY");

                if (isSaleLocked) {
                  formCustom.resetFields(["dealer_id", "product_name", "year_code"]);
                  // setDealers([]);
                  formCustom.setFieldsValue({ year_code: yearToUse });

                  setTableParams((prev) => ({
                    ...prev,
                    pagination: { ...prev.pagination, current: 1 },
                  }));

                  const payload = {
                    year_code: yearToUse,
                    user_id: formCustom.getFieldValue("sale_id") ?? "",
                    dealer_id: "",
                    product_name: "",
                    platform: "web",
                    ...(formCustom.getFieldValue("area_id")
                      ? { area_id: formCustom.getFieldValue("area_id") }
                      : {}),
                  };

                  await fetchData(payload);
                  return;
                }

                formCustom.resetFields([
                  "sale_id",
                  "dealer_id",
                  "product_name",
                  "year_code",
                  ...(isAdmin ? ["area_id"] : []),
                ]);

                setDealers([]);
                setTableParams((prev) => ({
                  ...prev,
                  pagination: { ...prev.pagination, current: 1 },
                }));

                if (!isAdmin && areaId != null) {
                  formCustom.setFieldsValue({ area_id: String(areaId) });
                  await loadSalesByArea(String(areaId));
                } else {
                  setSales([]);
                }

                formCustom.setFieldsValue({ year_code: yearToUse });

                const payload = {
                  year_code: yearToUse,
                  user_id: "",
                  dealer_id: "",
                  product_name: "",
                  platform: "web",
                  ...(formCustom.getFieldValue("area_id")
                    ? { area_id: formCustom.getFieldValue("area_id") }
                    : {}),
                };

                await fetchData(payload);
              }}
              name="btn-clear"
              text="Clear"
              iconSrc="/img/icons/trash.png"
              className="text-white px-4 py-3 rounded-[4px] bg-[#B6AEAB]"
            />

            <ExportPeriodExcelButton
              text="Export Excel"
              leftTopTitle="Quarter"
              fileName={`Sales_Report_By_Quarter_${
                getYearCodeFrom(formCustom.getFieldValue("year_code")) ||
                defaultYear ||
                dayjs().tz("Asia/Bangkok").format("YYYY")
              }_${dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD_HHmm")}`}
              getPayload={async () => {
                const values = await formCustom.validateFields().catch(() => ({}));
                const yearFromForm =
                  getYearCodeFrom(values?.year_code) ||
                  defaultYear ||
                  dayjs().tz("Asia/Bangkok").format("YYYY");

                const payload = {
                  year_code: yearFromForm,
                  user_id: values?.sale_id ?? "",
                  dealer_id: values?.dealer_id ?? "",
                  product_name: values?.product_name ?? "",
                  platform: "web",
                };

                if (values?.area_id) payload.area_id = values.area_id;

                return payload;
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
          scrollY={true}
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
  );
}