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

export default function ReportSaleByYear() {
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]); // [{ value, label }]
  const [defaultYear, setDefaultYear] = useState(null);

  const [areaList, setAreaList] = useState([]);
  const [sales, setSales] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);

  const [itemColumn, setItemColumn] = useState([]); // items (มี workplan_data_items ข้างใน)
  const [dataSource, setDataSource] = useState([]); // data_items → แถวสินค้า
  const [tableLoading, setTableLoading] = useState(false);

  const { showNotification, userInfo } = useContext(AuthContext);

  const [areaId, setAreaId] = useState();
  const [roleId, setRoleId] = useState();
  const isAdmin = Number(roleId) === 1;

  const [formCustom] = Form.useForm();
  const watchedAreaId = Form.useWatch("area_id", formCustom);
  const watchedSaleId = Form.useWatch("sale_id", formCustom);

  // ✅ All behavior
  const [hasOnlyAll, setHasOnlyAll] = useState(false);

  // ✅ lock sale for non-admin
  const [isSaleLocked, setIsSaleLocked] = useState(false);

  // ✅ wait user detail before initial master+fetch
  const [userLoaded, setUserLoaded] = useState(false);

  // ===== helpers (login) =====
  const getLoginSaleId = (u) => (u ? u.sale_id ?? u.user_id ?? u.id ?? null : null);
  const getLoginAreaId = (u) => (u ? u.area_id ?? u.areaId ?? u.area ?? null : null);

  //load user detail to get area_id and role_id
  useEffect(() => {
    (async () => {
      try {
        const response = await useServiceAPI.get(
          `${paths.pathMasterUsersDetail}/${userInfo.id}`,
          {},
          setLoading
        );

        if (response?.status === 200) {
          const aId = response.data.area_id;
          const rId = response.data.role_id;

          setAreaId(aId);
          setRoleId(rId);

          // ✅ non-admin: fix area ตาม user
          if (Number(rId) !== 1 && aId != null) {
            formCustom.setFieldsValue({ area_id: String(aId) });
          }
        }
      } catch (error) {
        console.log(error);
        if (error?.status === 422) showNotification("error", error.message);
        else showNotification("error", "เกิดข้อผิดพลาด");
      } finally {
        setUserLoaded(true); // ✅ สำคัญ
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                (p) => normalize(p.product_name) === normalize(record.productName)
              ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={Number.isFinite(Number(itemData.workplan_qty)) ? Number(itemData.workplan_qty) : 0}
                formatter={(value) =>
                  `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                (p) => normalize(p.product_name) === normalize(record.productName)
              ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={Number.isFinite(Number(itemData.rolling_qty)) ? Number(itemData.rolling_qty) : 0}
                formatter={(value) =>
                  `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                (p) => normalize(p.product_name) === normalize(record.productName)
              ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={Number.isFinite(Number(itemData.actual_qty)) ? Number(itemData.actual_qty) : 0}
                formatter={(value) =>
                  `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                (p) => normalize(p.product_name) === normalize(record.productName)
              ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={Number.isFinite(Number(itemData.workplan_value)) ? Number(itemData.workplan_value) : 0}
                formatter={(value) =>
                  `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                (p) => normalize(p.product_name) === normalize(record.productName)
              ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={Number.isFinite(Number(itemData.rolling_value)) ? Number(itemData.rolling_value) : 0}
                formatter={(value) =>
                  `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                (p) => normalize(p.product_name) === normalize(record.productName)
              ) || {};
            return (
              <InputNumber
                className="w-full"
                min={0}
                value={Number.isFinite(Number(itemData.actual_value)) ? Number(itemData.actual_value) : 0}
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

  // ---------------- Table footer totals (รวมเฉพาะแถวที่แสดงจริง)
  const calculateFooterSums = () => {
    const rows = Array.isArray(dataSource) ? dataSource : [];

    return itemColumn.map((period) => {
      const list = Array.isArray(period?.workplan_data_items) ? period.workplan_data_items : [];
      const byProduct = new Map(list.map((p) => [normalize(p.product_name), p]));

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

        // ✅ area ALL pattern
        const areaOptsRaw = (areasRes?.data || []).map((x) => ({
          value: String(x.id),
          label: x.name,
        }));
        setHasOnlyAll(areaOptsRaw.length === 0);

        const areaOpts =
          areaOptsRaw.length === 0
            ? [{ value: "__ALL__", label: "All", disabled: true }]
            : [{ value: "__ALL__", label: "All" }, ...areaOptsRaw];

        setAreaList(areaOpts);

        // default year
        const currentYear = dayjs().tz("Asia/Bangkok").format("YYYY");
        const matched =
          yearOptions.find((y) => getYearCodeFrom(y) === currentYear) || yearOptions[0];
        const initialYear = getYearCodeFrom(matched) || currentYear;

        setDefaultYear(initialYear);
        formCustom.setFieldsValue({ year_code: initialYear });

        // ✅ admin: default area = ALL ถ้ายังไม่เลือก
        const isAdminNow = Number(roleId) === 1;
        // if (isAdminNow) {
        const curArea = formCustom.getFieldValue("area_id");
        if (!curArea) {
          formCustom.setFieldsValue({ area_id: "__ALL__" });
        }
        // โหลด sales all ทันที เพื่อให้ dropdown Sales ใช้งานได้
        await loadSalesByArea(formCustom.getFieldValue("area_id") || "__ALL__");
        // }

        // ✅ initial fetch: admin เท่านั้น (เหมือนโค้ดเดิมของคุณ)
        // if (isAdminNow) {
        await fetchData({
          year_code: initialYear,
          user_id: "",
          dealer_id: "",
          product_name: "",
          platform: "web",
          // ✅ ALL -> ไม่ส่ง area_id
          ...(formCustom.getFieldValue("area_id") &&
            formCustom.getFieldValue("area_id") !== "__ALL__"
            ? { area_id: formCustom.getFieldValue("area_id") }
            : {}),
        });
        // }
      } catch (error) {
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoaded, roleId]);

  // ===== Load Sales by Area (รองรับ ALL) =====
  const loadSalesByArea = async (area_id) => {
    if (!area_id) {
      setSales([]);
      return [];
    }

    // ✅ ถ้าเลือก ALL -> ส่ง "all" ไปหา option sales
    const areaIdForSales = area_id === "__ALL__" ? "all" : area_id;

    try {
      const res = await useServiceAPI.get(paths.pathMasterUserByArea, { area_id: areaIdForSales });
      const raw = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(raw) ? raw : [];

      const options = list.map((item) => ({
        value: String(item.user_id ?? item.id),
        label: item.user_name ?? item.name,
      }));

      setSales(options);
      return options;
    } catch {
      setSales([]);
      showNotification?.("error", "โหลด Sales ไม่สำเร็จ");
      return [];
    }
  };

  // เปลี่ยน Area → โหลด Sales
  useEffect(() => {
    let alive = true;

    const loadSales = async () => {
      if (!watchedAreaId) {
        setSales([]);
        setDealers([]);
        formCustom.setFieldsValue({ sale_id: undefined, dealer_id: undefined });
        setIsSaleLocked(false);
        return;
      }

      try {
        // ✅ ใช้ function กลาง (รองรับ ALL)
        const options = await loadSalesByArea(watchedAreaId);
        if (!alive) return;

        // reset downstream (แต่ sale จะถูก auto lock ใน effect ถัดไป)
        setDealers([]);
        formCustom.setFieldsValue({ sale_id: undefined, dealer_id: undefined });

        // ถ้า ALL แล้ว admin อยากเลือก sales ได้ทันที (ไม่ reset sales ที่เพิ่ง set)
        // (sales ถูก set แล้วใน loadSalesByArea)
      } catch (e) {
        if (!alive) return;
        setSales([]);
        setDealers([]);
        formCustom.setFieldsValue({ sale_id: undefined, dealer_id: undefined });
        setIsSaleLocked(false);
      }
    };

    loadSales();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedAreaId]);

  // Auto select own sale (non-admin) + lock
  useEffect(() => {
    const loginSaleId = getLoginSaleId(userInfo);
    const loginAreaId = getLoginAreaId(userInfo);

    // admin ไม่ lock
    if (roleId != null && Number(roleId) === 1) {
      setIsSaleLocked(false);
      return;
    }

    // ✅ ถ้า area เป็น ALL: ไม่ auto lock / ไม่ auto fetch
    if (!watchedAreaId || watchedAreaId === "__ALL__") {
      setIsSaleLocked(false);
      return;
    }

    if (!Array.isArray(sales) || sales.length === 0) {
      setIsSaleLocked(false);
      return;
    }

    const foundSale = sales.find((s) => String(s.value) === String(loginSaleId));

    if (foundSale) {
      // ถ้า area ไม่ตรง -> บังคับให้ตรงก่อน (sales จะ reload)
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

  // เปลี่ยน Sale → โหลด Dealers
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

        setDealers(
          list.map((item) => ({
            value: Number(item.id),
            label: item.name,
          }))
        );
        formCustom.setFieldsValue({ dealer_id: undefined });
      } catch {
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

  // ---------------- Fetch data
  const buildPayload = async () => {
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

    // ✅ ALL -> ไม่ส่ง area_id
    if (values?.area_id && values.area_id !== "__ALL__") payload.area_id = values.area_id;

    return payload;
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

      const response = await useServiceAPI.get(paths.pathReportRollingWorkPlanYear, payload);

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

    const getLabel = (list, val) => (list.find((o) => o.value === val) || {}).label;

    const areaLabel = getLabel(areaList, vals.area_id);
    const salesLabel = getLabel(sales, vals.sale_id);
    const dealerLabel = getLabel(dealers, vals.dealer_id);
    const productLabel = getLabel(products, vals.product_name) || vals.product_name;

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
                  disabled={!isAdmin || isSaleLocked || hasOnlyAll}
                  allowClear={isAdmin && !isSaleLocked && !hasOnlyAll}
                  onChange={async () => {
                    if (!isAdmin) return;

                    formCustom.resetFields(["sale_id", "dealer_id"]);
                    setSales([]);
                    setDealers([]);

                    const newArea = formCustom.getFieldValue("area_id");
                    if (newArea) await loadSalesByArea(newArea);
                  }}
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item label="Sales" name="sale_id">
                <Select
                  placeholder="Select Sales"
                  options={sales}
                  allowClear={!isSaleLocked}
                  // disabled={!watchedAreaId || isSaleLocked}
                  disabled={!watchedAreaId}
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
                  placeholder="Select Dealer"
                  options={dealers}
                  disabled={!formCustom.getFieldValue("sale_id")}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item label="Year" name="year_code">
                <Select placeholder="Select Year" options={years} allowClear={false} />
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
                const yearToUse = defaultYear || dayjs().tz("Asia/Bangkok").format("YYYY");

                // ✅ ถ้า lock sale อยู่: ไม่แตะ area_id / sale_id
                if (isSaleLocked) {
                  formCustom.resetFields(["dealer_id", "product_name", "year_code"]);
                  setDealers([]);
                  formCustom.setFieldsValue({
                    dealer_id: undefined,
                    year_code: yearToUse,
                  });

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
                    ...(formCustom.getFieldValue("area_id") &&
                      formCustom.getFieldValue("area_id") !== "__ALL__"
                      ? { area_id: formCustom.getFieldValue("area_id") }
                      : {}),
                  };

                  await fetchData(payload);
                  return;
                }

                // ✅ ไม่ lock
                formCustom.resetFields([
                  "sale_id",
                  "dealer_id",
                  "product_name",
                  "year_code",
                  ...(isAdmin ? ["area_id"] : []), // non-admin ห้าม reset area
                ]);

                setDealers([]);
                formCustom.setFieldsValue({ year_code: yearToUse });

                // non-admin: คง area กลับเป็นของ user
                if (!isAdmin && areaId != null) {
                  formCustom.setFieldsValue({ area_id: String(areaId) });
                }

                // admin: reset sales list ได้ + default All
                if (isAdmin) {
                  setSales([]);
                  formCustom.setFieldsValue({ area_id: "__ALL__" });
                  await loadSalesByArea("__ALL__");
                }

                setTableParams((prev) => ({
                  ...prev,
                  pagination: { ...prev.pagination, current: 1 },
                }));

                const payload = {
                  year_code: yearToUse,
                  user_id: "",
                  dealer_id: "",
                  product_name: "",
                  platform: "web",
                  ...(formCustom.getFieldValue("area_id") &&
                    formCustom.getFieldValue("area_id") !== "__ALL__"
                    ? { area_id: formCustom.getFieldValue("area_id") }
                    : {}),
                };

                // admin เท่านั้นที่ fetch ตอน clear (ตาม logic เดิม)
                if (isAdmin) await fetchData(payload);
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
              requestData={(payload) => useServiceAPI.get(paths.pathReportRollingWorkPlanYear, payload)}
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
          onChange={() => { }}
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
                            `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                        />
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="center">
                        <InputNumber
                          className="w-full"
                          readOnly
                          value={period.rolling_qty}
                          formatter={(value) =>
                            `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                        />
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="center">
                        <InputNumber
                          className="w-full"
                          readOnly
                          value={period.actual_qty}
                          formatter={(value) =>
                            `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                        />
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="center">
                        <InputNumber
                          className="w-full"
                          readOnly
                          value={period.workplan_value}
                          formatter={(value) =>
                            `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                        />
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="center">
                        <InputNumber
                          className="w-full"
                          readOnly
                          value={period.rolling_value}
                          formatter={(value) =>
                            `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                        />
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="center">
                        <InputNumber
                          className="w-full"
                          readOnly
                          value={period.actual_value}
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