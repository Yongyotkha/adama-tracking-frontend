import React, { useState, useEffect, useContext } from "react";
import { Card, Row, Col, Select, Tooltip } from "antd";
import MainLayout from "../../layouts/MainLayout";
import { BarChart } from "@mui/x-charts/BarChart";

import BoxPrimary from "../../components/box_primary/BoxPrimary";

import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { useNavigate } from "react-router-dom";
import DoughnutChartComponent from "../../components/charts/DoughnutChartComponent";
import formatNumber from "../../utils/number";
import convertNumber from "../../utils/convertNumber";
import percentage from "../../utils/percentage";
import { AuthContext } from "../../contexts/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();

  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  const [months, setMonths] = useState([]);
  const [subdealer, setSubdealer] = useState([]);
  const [subdealerByDealerData, setSubdealerByDealerData] = useState([]);

  const [dealer, setDealer] = useState([]);

  const [dashboardData, setDashboardData] = useState({});
  const [dashboardDataExpense, setDashboardDataExpense] = useState({});
  const [dashboardDataOrder, setDashboardDataOrder] = useState({});

  const [dealerPlanData, setDealerPlanData] = useState([]);
  const [topActivityData, setTopActivityData] = useState([]);
  const [listActivityData, setListActivityData] = useState([]);
  const [subDealerPlanData, setSubDealerPlanData] = useState([]);

  const [saleCropData, setSaleCropData] = useState([]);
  const [totalSaleValue, setTotalSaleValue] = useState(0);

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ NEW: Area -> Sale Cascade
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [salesByArea, setSalesByArea] = useState([]);

  // selectedSale (จะได้จาก salesByArea)
  const [selectedSale, setSelectedSale] = useState(null);
  const { showNotification, userInfo } = useContext(AuthContext);

  const [selectedSalesByDealer, setSelectedSalesByDealer] = useState(null);
  const [selectedMonthsSalesByDealer, setSelectedMonthsSalesByDealer] =
    useState(null);

  const [selectedMonthsExpense, setSelectedMonthsExpense] = useState(null);
  const [selectedMonthsDealerPlan, setSelectedMonthsDealerPlan] = useState(null);
  const [selectedMonthsTopActivity, setSelectedMonthsTopActivity] =
    useState(null);

  const [selectedMonthsSaleByCrop, setSelectedMonthsSaleByCrop] = useState(null);
  const [selectedMonthsActivity, setSelectedMonthsActivity] = useState(null);

  const [selectedSaleByCrop, setSelectedSaleByCrop] = useState(null);
  const [selectedSaleActivity, setSelectedSaleActivity] = useState(null);

  const [selectedDealerPlan, setSelectedDealerPlan] = useState(null);
  const [selectedDealerActivity, setSelectedDealerActivity] = useState(null);

  const [selectedDealerTopActivity, setSelectedDealerTopActivity] =
    useState(null);

  const [selectedSubdealerPlan, setSelectedSubdealerPlan] = useState(null);
  const [selectedSdByD, setSelectedSdByD] = useState(null);

  const [calPercentage, setCalPercentage] = useState({
    plan: "",
    actual: "",
  });

  const [isSaleLocked, setIsSaleLocked] = useState(false);

  const valueFormatterMB = (value) => {
    if (typeof value !== "number" || isNaN(value)) return "0.0 M THB";
    return `${(value / 1_000_000).toFixed(1)} M THB`;
  };

  // ===============================
  // ✅ Load Masters (Year/Month/SubDealer/DealerAll/SalesAll/Areas)
  // ===============================
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [yearsRes, monthsRes, subdealersRes, dealersRes, salesRes, areasRes] =
          await Promise.all([
            useServiceAPI.get(paths.pathMasterYear),
            useServiceAPI.get(paths.pathMasterMonths),
            useServiceAPI.get(paths.pathMasterSubDealer),
            useServiceAPI.get(paths.pathMasterDealerAll),
            useServiceAPI.get(paths.pathMasterSaleDropdown),
            useServiceAPI.get(paths.pathMasterAreas), // ✅ NEW
          ]);

        // Years
        if (yearsRes?.data?.length > 0) {
          setYears(yearsRes.data);
          setSelectedYear(yearsRes.data[0]?.id);
        }

        // Months
        if (monthsRes?.data?.length > 0) {
          setMonths(
            monthsRes.data.map((item) => ({
              value: item.id,
              label: item.name,
            }))
          );
        }

        // Subdealers
        if (subdealersRes?.data?.length > 0) {
          setSubdealer(
            subdealersRes.data.map((item) => ({
              value: item.sub_dealer_id,
              label: item.sub_dealer_name,
            }))
          );
        }

        // Dealer All (ใช้ตอนยังไม่เลือก sale)
        if (dealersRes?.data?.length > 0) {
          const formattedDealers = dealersRes.data.map((item) => ({
            value: item.id,
            label: item.name,
          }));
          setDealer(formattedDealers);
          setSelectedSdByD(formattedDealers[0]?.value);
        }

        // Sales All (เก็บไว้เฉย ๆ ถ้าอยากใช้ที่อื่น)
        if (salesRes?.data?.length > 0) {
          setSales(
            salesRes.data.map((item) => ({
              value: item.id,
              label: item.name,
            }))
          );
        }

        // ✅ Areas
        const rawAreas = areasRes?.data?.data ?? areasRes?.data ?? [];
        if (Array.isArray(rawAreas) && rawAreas.length > 0) {
          const areaOptions = rawAreas.map((a) => ({
            value: String(a.id),
            label: a.name,
          }));

          setAreas(areaOptions);

          // ✅ ถ้ามี Area ค่าเดียว -> auto select
          if (areaOptions.length === 1) {
            setSelectedArea(areaOptions[0].value);
          }
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        // showNotification?.("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // ===============================
  // ✅ Cascade: Area -> Sales
  // ===============================
  useEffect(() => {
    let alive = true;

    const fetchSalesByArea = async () => {
      if (!selectedArea) {
        setSalesByArea([]);

        // reset sale + dependent
        setSelectedSale(null);
        setSelectedSaleByCrop(null);
        setSelectedSaleActivity(null);

        setDealer([]);
        setSelectedSdByD(null);
        setSelectedDealerPlan(null);
        setSelectedDealerTopActivity(null);
        setSelectedDealerActivity(null);
        setSelectedSalesByDealer(null);

        return;
      }

      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathMasterSaleReport, {
          area_id: selectedArea,
        });

        const raw = res?.data?.data ?? res?.data ?? [];
        const list = Array.isArray(raw) ? raw : [];

        const options = list.map((x) => ({
          value: Number(x.user_id ?? x.id),
          label: x.user_name ?? x.name,
        }));

        if (!alive) return;

        setSalesByArea(options);

        // reset sale + dependent when change area
        setSelectedSale(null);
        setSelectedSaleByCrop(null);
        setSelectedSaleActivity(null);

        setDealer([]);
        setSelectedSdByD(null);
        setSelectedDealerPlan(null);
        setSelectedDealerTopActivity(null);
        setSelectedDealerActivity(null);
        setSelectedSalesByDealer(null);
      } catch (error) {
        if (!alive) return;
        console.error("Error fetching sales by area:", error);
        setSalesByArea([]);
        setSelectedSale(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchSalesByArea();

    return () => {
      alive = false;
    };
  }, [selectedArea]);

  useEffect(() => {
    const loginSaleId = getLoginSaleId(userInfo);
    if (!selectedArea) {
      setIsSaleLocked(false);
      return;
    }

    // ต้องมี list sales ก่อน
    if (!Array.isArray(salesByArea) || salesByArea.length === 0) {
      setIsSaleLocked(false);
      return;
    }

    // หา sale ของคน login ว่ามีอยู่ใน options นี้ไหม
    const found = salesByArea.find(
      (s) => String(s.value) === String(loginSaleId)
    );

    if (found) {
      // ✅ ล็อคเป็นตัวเอง
      setSelectedSale(found.value);
      setSelectedSaleByCrop(found.value);
      setSelectedSaleActivity(found.value);

      setIsSaleLocked(true);
    } else {
      // ✅ ถ้าไม่เจอใน list ของ area นี้ ให้เลือกเองได้
      setIsSaleLocked(false);
    }
  }, [selectedArea, salesByArea, userInfo]);

  const getLoginSaleId = (u) => {
    if (!u) return null;

    // ✅ ใช้อันที่โปรเจคคุณมีจริง (เลือก 1)
    return (
      u.sale_id ??         // กรณีมี sale_id
      u.user_id ??         // กรณีใช้ user_id
      u.id ??              // ตอนอื่นคุณใช้ userInfo.id
      null
    );
  };

  // ===============================
  // ✅ Cascade: Sale -> Dealer (ใช้ของเดิม)
  // ===============================
  useEffect(() => {
    const fetchDealerBySale = async () => {
      if (!selectedSale) {
        setDealer([]);
        setSelectedSdByD(null);
        setSelectedDealerPlan(null);
        setSelectedDealerTopActivity(null);
        setSelectedDealerActivity(null);
        setSelectedSalesByDealer(null);
        return;
      }

      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
          user_id: selectedSale,
        });

        const raw = response?.data?.data ?? response?.data ?? [];
        const list = Array.isArray(raw) ? raw : [];

        if (response.status === 200 && list.length > 0) {
          const formattedDealers = list.map((item) => ({
            value: item.id,
            label: item.name,
          }));

          setDealer(formattedDealers);
          setSelectedSdByD(formattedDealers[0]?.value);
        } else {
          setDealer([]);
          setSelectedSdByD(null);
          setSelectedDealerPlan(null);
          setSelectedDealerTopActivity(null);
          setSelectedDealerActivity(null);
          setSelectedSalesByDealer(null);
        }
      } catch (error) {
        console.error("Error fetching dealers by sale:", error);
        // showNotification?.("error", error.message || "เกิดข้อผิดพลาดในการโหลด Dealer");
      } finally {
        setLoading(false);
      }
    };

    fetchDealerBySale();
  }, [selectedSale]);

  // ===============================
  // ✅ Dashboard Customer
  // ===============================
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathDashBordCustomer, {
          year_code: selectedYear,
          sale_id: selectedSale,
          area_id: selectedArea,          // ✅ ส่ง area_id ไปด้วย
        });

        if (response.status === 200) {
          const data = response.data || {};
          const cleanedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [String(key).trim(), value])
          );
          setDashboardData(cleanedData);
        } else {
          console.error("Failed to fetch dashboard data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear) fetchDashboardData();
  }, [selectedYear, selectedSale, selectedArea]);   // ✅ ให้ re-run ตอนเปลี่ยน Area ด้วย


  // ===============================
  // ✅ Expense
  // ===============================
  const fetchDashboardDataExpense = async () => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathDashBordExpense, {
        year_code: selectedYear,
        month_id: selectedMonthsExpense,
        sale_id: selectedSale,
        area_id: selectedArea,  // ✅ เพิ่ม area_id
      });

      if (response.status === 200) {
        const data = response.data || {};
        setDashboardDataExpense({
          ...data,
          total_expense_activity_plan: convertNumber(data.total_expense_activity_plan),
          total_expense_actual_exp: convertNumber(data.total_expense_actual_exp),
          total_expense_actual_sale: convertNumber(data.total_expense_actual_sale),
          total_expense_advance: convertNumber(data.total_expense_advance),
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data expense:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYear) fetchDashboardDataExpense();
  }, [selectedYear, selectedMonthsExpense, selectedSale, selectedArea]);  // ✅

  // ===============================
  // ✅ Sales by Dealer
  // ===============================
  useEffect(() => {
    const fetchDashboardDataSalesByDealer = async () => {
      try {
        setLoading(true);
        const response = await useServiceAPI.get(paths.pathDashBordSaleByDealer, {
          year_code: selectedYear,
          dealer_id: selectedSalesByDealer,
          month_id: selectedMonthsSalesByDealer,
          sale_id: selectedSale,
          area_id: selectedArea,    // ✅ เพิ่ม area_id
        });

        if (response.status === 200) {
          const data = response.data || {};
          setDashboardDataOrder({
            total_amount_target_actual: convertNumber(data.total_amount_target_actual),
            total_amount_target_plan: convertNumber(data.total_amount_target_plan),
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data order:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear) fetchDashboardDataSalesByDealer();
  }, [
    selectedYear,
    selectedSalesByDealer,
    selectedMonthsSalesByDealer,
    selectedSale,
    selectedArea,   // ✅ ให้ re-fetch เมื่อเปลี่ยน Area
  ]);


  // ===============================
  // ✅ Cal percentage
  // ===============================
  useEffect(() => {
    if (
      selectedMonthsSalesByDealer &&
      selectedMonthsSalesByDealer === selectedMonthsExpense &&
      selectedSalesByDealer
    ) {
      const total_amount_target_plan = convertNumber(dashboardDataOrder.total_amount_target_plan);
      const total_amount_target_actual = convertNumber(dashboardDataOrder.total_amount_target_actual);
      const total_expense_activity_plan = convertNumber(dashboardDataExpense.total_expense_activity_plan);
      const total_expense_actual_exp = convertNumber(dashboardDataExpense.total_expense_actual_exp);

      const planPercentage = percentage(total_expense_activity_plan, total_amount_target_plan);
      const actualPercentage = percentage(total_expense_actual_exp, total_amount_target_actual);

      setCalPercentage({
        actual: `${formatNumber(actualPercentage)}%`,
        plan: `${formatNumber(planPercentage)}%`,
      });
    } else {
      setCalPercentage({ actual: "", plan: "" });
    }
  }, [dashboardDataOrder, dashboardDataExpense, selectedMonthsSalesByDealer, selectedMonthsExpense, selectedSalesByDealer]);

  // ===============================
  // ✅ Dealer Plan
  // ===============================
  useEffect(() => {
    const fetchDealerPlanData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathDashBordPlan, {
          year_code: selectedYear,
          dealer_id: selectedDealerPlan,
          month_id: selectedMonthsDealerPlan,
          sale_id: selectedSale,
          area_id: selectedArea,   // ✅ เพิ่ม area_id
        });

        if (response.status === 200 && response.data) {
          const data = response.data.map((item) => ({
            month: item.name,
            plan: parseFloat(String(item.work_plan_value || "0").replace(/,/g, "")) || 0,
            rolling: parseFloat(String(item.work_rolling_plan_value || "0").replace(/,/g, "")) || 0,
            actual: parseFloat(String(item.work_actual_value || "0").replace(/,/g, "")) || 0,
          }));
          setDealerPlanData(data);
        }
      } catch (error) {
        console.error("Error fetching Dealer Plan data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear) fetchDealerPlanData();
  }, [selectedYear, selectedDealerPlan, selectedMonthsDealerPlan, selectedSale, selectedArea]);

  // ===============================
  // ✅ Top Activity
  // ===============================
  useEffect(() => {
    const fetchTopActivityData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathDashBordTopActivity, {
          year_code: selectedYear,
          dealer_id: selectedDealerTopActivity,
          month_id: selectedMonthsTopActivity,
          sale_id: selectedSale,
          area_id: selectedArea,   // ✅ เพิ่ม area_id
        });

        if (response.status === 200 && response.data) {
          const data = response.data.map((item) => ({
            activity: item.activity_type_name,
            total_activity_actual: parseFloat(String(item.total_activity_actual || "0").replace(/,/g, "")) || 0,
            total_activity_list: parseFloat(String(item.total_activity_list || "0").replace(/,/g, "")) || 0,
            total_activity_plan: parseFloat(String(item.total_activity_plan || "0").replace(/,/g, "")) || 0,
            color: item.activity_color,
          }));

          setTopActivityData(data);
        }
      } catch (error) {
        console.error("Error fetching Top Activity data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear) fetchTopActivityData();
  }, [selectedYear, selectedDealerTopActivity, selectedMonthsTopActivity, selectedSale, selectedArea]);

  // ===============================
  // ✅ Sub Dealer Plan
  // ===============================
  useEffect(() => {
    const fetchSubDealerPlanData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathDashBordSubDealerPlan, {
          year_code: selectedYear,
          sub_dealer_id: selectedSubdealerPlan,
          sale_id: selectedSale,
          area_id: selectedArea,   // ✅ เพิ่ม area_id
        });

        if (response.status === 200 && response.data) {
          const data = response.data.map((item) => ({
            month: item.product_name,
            plan: parseFloat(String(item.work_plan_value || "0").replace(/,/g, "")) || 0,
            actual: parseFloat(String(item.work_actual_value || "0").replace(/,/g, "")) || 0,
          }));
          setSubDealerPlanData(data);
        }
      } catch (error) {
        console.error("Error fetching Sub Dealer Plan data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear) fetchSubDealerPlanData();
  }, [selectedYear, selectedSubdealerPlan, selectedSale, selectedArea]);

  // ===============================
  // ✅ Sub Dealer by Dealer
  // ===============================
  useEffect(() => {
    const fetchSubDealerByDealerData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathDashBoardSubDealerByDealer, {
          year_code: selectedYear,
          dealer_id: selectedSdByD,
          sale_id: selectedSale,
          area_id: selectedArea,     // ✅ ส่ง area_id
        });

        if (response.status === 200 && response.data) {
          const data = response?.data?.items
            ?.sort((a, b) => {
              const aValue = parseFloat(String(a.total_amount_target || "0").replace(/,/g, "")) || 0;
              const bValue = parseFloat(String(b.total_amount_target || "0").replace(/,/g, "")) || 0;
              return bValue - aValue;
            })
            ?.map((item) => {
              const isOther = item.sub_dealer_name === "Other";
              return {
                value: parseFloat(String(item.total_amount_target || "0").replace(/,/g, "")) || 0,
                label: item.sub_dealer_name,
                percentage: item.percentage,
                color: isOther ? "#e61e1e" : "#009845",
              };
            });

          setSubdealerByDealerData(data || []);
        }
      } catch (error) {
        console.error("Error fetching Sub Dealer By Dealer data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear && selectedSdByD) fetchSubDealerByDealerData();
  }, [selectedYear, selectedSdByD, selectedSale, selectedArea]);   // ✅


  // ===============================
  // ✅ Sales by Crop
  // ===============================
  useEffect(() => {
    const fetchSaleCropData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathDashBordSaleCrop, {
          year_code: selectedYear,
          dealer_id: selectedSaleByCrop,
          month_id: selectedMonthsSaleByCrop,
          sale_id: selectedSale,
          area_id: selectedArea,   // ✅ เพิ่ม area_id
        });

        if (response.status === 200 && response.data) {
          const data = response.data
            .map((item) => {
              const rawAmount = parseFloat(String(item.amount_target || "0").replace(/,/g, ""));
              const cropName = item.name.split("(")[0];

              return {
                value: rawAmount || 0,
                amount_target: rawAmount || 0,
                label: cropName,
                color: item.color,
                name: item.name,
              };
            })
            .sort((a, b) => b.value - a.value);

          setSaleCropData(data);

          const totalValue = data.reduce((sum, crop) => sum + crop.value, 0);
          setTotalSaleValue(totalValue);
        }
      } catch (error) {
        console.error("Error fetching Sale By Crop data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear) fetchSaleCropData();
  }, [
    selectedYear,
    selectedSaleByCrop,
    selectedMonthsSaleByCrop,
    selectedSale,
    selectedArea,   // ✅ Trigger ใหม่ตอนเปลี่ยน Area
  ]);


  // ===============================
  // ✅ List Activity
  // ===============================
  useEffect(() => {
    const fetchListActivityData = async () => {
      setLoading(true);
      try {
        const payload = {
          year_code: selectedYear,
          sale_id: selectedSale,
          month_id: selectedMonthsActivity,
          dealer: selectedDealerActivity,
          area_id: selectedArea,   // ✅ เพิ่ม area_id
        };

        const response = await useServiceAPI.get(paths.pathDashBordListActivity, payload);

        if (response.status === 200 && response.data) {
          const data = response.data.map((item) => ({
            type: item.activity_type_name,
            actual: parseFloat(String(item.total_activity_count_actual || "0").replace(/,/g, "")) || 0,
            plan_value: parseFloat(String(item.total_activity_plan_value || "0").replace(/,/g, "")) || 0,
            actual_value: parseFloat(String(item.total_activity_actual_value || "0").replace(/,/g, "")) || 0,
            plan: parseFloat(String(item.total_activity_plan_count || "0").replace(/,/g, "")) || 0,
            icon: item.activity_image,
          }));

          setListActivityData(data);
        }
      } catch (error) {
        console.error("Error fetching List Activity data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear) fetchListActivityData();
  }, [selectedYear, selectedSale, selectedMonthsActivity, selectedDealerActivity, selectedArea]);

  return (
    <MainLayout loading={loading}>
      {/* ✅ HEADER: Area -> Sale -> Year */}
      <div className="flex items-center justify-between">
        <div className="title-page">Dashboard</div>

        <div className="flex gap-2 items-center flex-wrap">
          {/* <Tooltip title="เลือก Area ก่อนเพื่อเปิด Sales" placement="top"> */}
          <Select
            className="w-full md:w-48"
            value={selectedArea}
            onChange={(value) => setSelectedArea(value)}
            placeholder={loading ? "Loading..." : "Select Area"}
            disabled={loading || areas.length === 1}
            options={areas}
            showSearch
            allowClear
            optionFilterProp="label"
          />
          {/* </Tooltip> */}

          <Tooltip title="เลือก Sales หลังจากเลือก Area" placement="top">
            <Select
              className="w-full md:w-48"
              value={selectedSale}
              onChange={(value) => {
                setSelectedSale(value);
                setSelectedSaleByCrop(value);
                setSelectedSaleActivity(value);
              }}
              placeholder={
                loading ? "Loading..." : !selectedArea ? "Select Area first" : "Select Sale"
              }
              disabled={loading || !selectedArea || isSaleLocked}
              options={salesByArea}
              showSearch
              allowClear={!isSaleLocked}
              optionFilterProp="label"
            />
          </Tooltip>

          <Tooltip title="เลือก Year เพื่อดูข้อมูลตามปี" placement="top">
            <Select
              className="w-40"
              value={selectedYear}
              onChange={(value) => setSelectedYear(value)}
              placeholder={loading ? "Loading..." : "Select Year"}
              disabled={loading}
              allowClear
            >
              {years.map((year) => (
                <Select.Option key={year.id} value={year.id}>
                  {`Year ${year.name}`}
                </Select.Option>
              ))}
            </Select>
          </Tooltip>
        </div>
      </div>

      <Row gutter={[16, 16]} className="mb-4">
        {/* Dealer */}
        <Col xs={12} sm={12} lg={12} xxl={6}>
          <BoxPrimary className="h-full flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-lg font-bold text-[#00783F]">Dealer</h3>
                <div className="text-4xl font-bold text-[#00783F]">
                  {dashboardData.dealer_count}
                </div>
              </div>
              <div>
                <img
                  src="/img/icons/dealer.png"
                  alt="Dealer Icon"
                  className="w-[4.5rem] h-[4.5rem] cursor-pointer"
                  onClick={() => navigate("/customer/dealer")}
                />
              </div>
            </div>
          </BoxPrimary>
        </Col>

        {/* Sub Dealer */}
        <Col xs={12} sm={12} lg={12} xxl={6}>
          <BoxPrimary className="h-full flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-lg font-bold text-[#00783F]">Sub Dealer</h3>
                <div className="text-4xl font-bold text-[#00783F]">
                  {dashboardData.sub_dealer_count}
                </div>
              </div>
              <div>
                <img
                  src="/img/icons/sub-dealer.png"
                  alt="Sub Dealer"
                  className="w-[4.5rem] h-[4.5rem] cursor-pointer"
                  onClick={() => navigate("/customer/sub-dealer")}
                />
              </div>
            </div>
          </BoxPrimary>
        </Col>

        {/* Expense */}
        <Col xs={12} sm={12} lg={12} xxl={6}>
          <BoxPrimary className="h-full">
            <div className="flex flex-wrap justify-between items-center">
              <h3 className="text-lg font-bold text-[#00783F]">Expense</h3>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="w-36"
                  value={selectedMonthsExpense}
                  onChange={(value) => setSelectedMonthsExpense(value)}
                  placeholder={loading ? "Loading..." : "Select Month"}
                  disabled={loading}
                  options={months}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-300">
              <div className="text-center py-4">
                <div className="text-md font-bold text-[#00783F]">
                  {formatNumber(dashboardDataExpense.total_expense_activity_plan)}
                  <br />
                  {calPercentage.plan ||
                    dashboardDataExpense.total_expense_activity_plan_percentage}
                </div>
                <div className="text-sm text-gray-500">Activity Plan</div>
              </div>

              <div className="text-center py-4 flex flex-col justify-between">
                <div className="text-md font-bold text-[#00783F]">
                  {formatNumber(dashboardDataExpense.total_expense_advance)}
                </div>
                <div className="text-sm text-gray-500">Advance</div>
              </div>

              <div className="text-center py-4">
                <div className="text-md font-bold text-[#00783F]">
                  {formatNumber(dashboardDataExpense.total_expense_actual_exp)}
                  <br />
                  {calPercentage.actual ||
                    dashboardDataExpense.total_expense_actual_exp_percentage}
                </div>
                <div className="text-sm text-gray-500">Actual</div>
              </div>
            </div>
          </BoxPrimary>
        </Col>

        {/* Sale By Dealer */}
        <Col xs={12} sm={12} lg={12} xxl={6}>
          <BoxPrimary className="h-full items-center flex flex-col">
            <div className="flex flex-wrap justify-between items-center w-full">
              <h3 className="text-lg font-bold text-[#00783F]">Sales By Dealer</h3>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="w-36"
                  value={selectedSalesByDealer}
                  onChange={(value) => setSelectedSalesByDealer(value)}
                  placeholder={loading ? "Loading..." : "All Dealer"}
                  disabled={loading}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  options={dealer}
                />

                <Select
                  className="w-36"
                  value={selectedMonthsSalesByDealer}
                  onChange={(value) => setSelectedMonthsSalesByDealer(value)}
                  placeholder={loading ? "Loading..." : "Select Month"}
                  disabled={loading}
                  options={months}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                />
              </div>
            </div>

            <div className="my-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300 w-full">
              <div className="text-center p-2">
                <div className="text-md font-bold text-[#00783F]">
                  {formatNumber(dashboardDataOrder.total_amount_target_plan)}
                </div>
                <div className="text-sm text-gray-500">Plan</div>
              </div>

              <div className="text-center p-2">
                <div className="text-md font-bold text-[#00783F]">
                  {formatNumber(dashboardDataOrder.total_amount_target_actual)}
                </div>
                <div className="text-sm text-gray-500">Actual</div>
              </div>
            </div>
          </BoxPrimary>
        </Col>
      </Row>

      {/* Row 2: Charts and Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={24} xl={17}>
          <Row gutter={[16, 16]}>
            {/* Dealer Plan Chart */}
            <Col xs={24} lg={24} xl={24}>
              <Card className="shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <div className="flex flex-wrap justify-between">
                  <h3 className="text-[#00783F] text-lg font-semibold mb-3">
                    Dealer Plan
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Select
                      className="mb-4 w-36"
                      value={selectedDealerPlan}
                      onChange={(value) => setSelectedDealerPlan(value)}
                      placeholder={loading ? "Loading..." : "Select Dealer"}
                      disabled={loading}
                      showSearch
                      allowClear
                      optionFilterProp="label"
                      options={dealer}
                    />
                    <Select
                      className="w-36"
                      value={selectedMonthsDealerPlan}
                      onChange={(value) => setSelectedMonthsDealerPlan(value)}
                      placeholder={loading ? "Loading..." : "Select Month"}
                      disabled={loading}
                      options={months}
                      showSearch
                      allowClear
                      optionFilterProp="label"
                    />
                  </div>
                </div>

                <div className="h-full rounded">
                  <BarChart
                    dataset={dealerPlanData}
                    xAxis={[
                      {
                        dataKey: "month",
                        scaleType: "band",
                      },
                    ]}
                    series={[
                      {
                        dataKey: "plan",
                        label: "Work Plan",
                        valueFormatter: valueFormatterMB,
                        color: "#10B981",
                      },
                      {
                        dataKey: "rolling",
                        label: "Rolling Forecast",
                        valueFormatter: valueFormatterMB,
                        color: "#F59E0B",
                      },
                      {
                        dataKey: "actual",
                        label: "Actual",
                        valueFormatter: valueFormatterMB,
                        color: "#3B82F6",
                      },
                    ]}
                    slotProps={{
                      legend: {
                        direction: "row",
                        position: { vertical: "bottom", horizontal: "middle" },
                        padding: 0,
                      },
                    }}
                    height={400}
                    margin={{ left: 100 }}
                    sx={{
                      ".MuiChartsBar-label": {
                        fill: "#333",
                        fontSize: "12px",
                        fontWeight: "bold",
                      },
                    }}
                  />
                </div>
              </Card>
            </Col>

            {/* Top 5 Activity */}
            <Col xs={24} lg={24} xl={24}>
              <Card className="shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <div className="flex flex-wrap justify-between">
                  <h3 className="text-[#00783F] text-lg font-semibold">
                    Top 5 Activity
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Select
                      className="mb-4 w-36"
                      value={selectedDealerTopActivity}
                      onChange={(value) => setSelectedDealerTopActivity(value)}
                      placeholder={loading ? "Loading..." : "Select Dealer"}
                      disabled={loading}
                      showSearch
                      allowClear
                      optionFilterProp="label"
                      options={dealer}
                    />
                    <Select
                      className="w-36"
                      value={selectedMonthsTopActivity}
                      onChange={(value) => setSelectedMonthsTopActivity(value)}
                      placeholder={loading ? "Loading..." : "Select Month"}
                      disabled={loading}
                      options={months}
                      showSearch
                      allowClear
                      optionFilterProp="label"
                    />
                  </div>
                </div>

                <div className="h-full rounded">
                  <BarChart
                    dataset={topActivityData}
                    xAxis={[
                      {
                        dataKey: "activity",
                        scaleType: "band",
                        label: "Activity",
                      },
                    ]}
                    series={[
                      { dataKey: "total_activity_plan", label: "Activity Plan" },
                      { dataKey: "total_activity_list", label: "Activity List" },
                      { dataKey: "total_activity_actual", label: "Activity Actual" },
                    ]}
                    yAxis={[{ label: null }]}
                    height={400}
                    slotProps={{ legend: { hidden: true } }}
                    sx={{
                      ".MuiBar-root": { borderRadius: "4px" },
                      ".MuiAxis-left .MuiAxis-label": {
                        fontSize: "12px",
                        fill: "#6B7280",
                      },
                    }}
                  />
                </div>
              </Card>
            </Col>

            {/* Sub Dealer Plan */}
            <Col xs={24} lg={24} xl={24}>
              <Card className="shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <div className="flex flex-wrap items-center justify-between">
                  <h3 className="text-[#00783F] text-lg font-semibold mb-3">
                    Sub Dealer Plan
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Select
                      className="mb-4 w-36"
                      value={selectedSubdealerPlan}
                      onChange={(value) => setSelectedSubdealerPlan(value)}
                      placeholder={loading ? "Loading..." : "Select Dealer"}
                      disabled={loading}
                      showSearch
                      allowClear
                      optionFilterProp="label"
                      options={dealer}
                    />
                  </div>
                </div>

                <div className="h-full rounded">
                  <BarChart
                    dataset={subDealerPlanData}
                    xAxis={[
                      {
                        scaleType: "band",
                        dataKey: "month",
                      },
                    ]}
                    yAxis={[{ label: null }]}
                    series={[
                      {
                        dataKey: "plan",
                        label: "Plan",
                        valueFormatter: valueFormatterMB,
                        color: "#3B82F6",
                      },
                      {
                        dataKey: "actual",
                        label: "Actual",
                        valueFormatter: valueFormatterMB,
                        color: "#10B981",
                      },
                    ]}
                    height={400}
                    slotProps={{
                      legend: {
                        direction: "row",
                        position: { vertical: "top", horizontal: "right" },
                        padding: 0,
                      },
                    }}
                    margin={{ left: 85 }}
                    sx={{
                      ".MuiBar-root": { borderRadius: "4px" },
                      ".MuiAxis-left .MuiAxis-label": {
                        fontSize: "12px",
                        fill: "#6B7280",
                      },
                    }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Activity Section */}
        <Col xs={24} lg={24} xl={7}>
          <BoxPrimary className="sticky top-1">
            <div className="flex flex-wrap justify-between mb-4">
              <h3 className="text-[#00783F] text-lg font-semibold">Activity</h3>

              <div className="flex flex-wrap gap-2">
                <Select
                  className="mb-4 w-36"
                  value={selectedSale}
                  onChange={(value) => setSelectedSale(value)}
                  placeholder={loading ? "Loading..." : "Select Sale"}
                  disabled={true}
                  options={salesByArea}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                />

                <Select
                  className="w-36"
                  value={selectedMonthsActivity}
                  onChange={(value) => setSelectedMonthsActivity(value)}
                  placeholder={loading ? "Loading..." : "Select Month"}
                  disabled={loading}
                  options={months}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                />

                <Select
                  className="w-36"
                  value={selectedDealerActivity}
                  onChange={(value) => setSelectedDealerActivity(value)}
                  placeholder={loading ? "Loading..." : "Select Dealer"}
                  disabled={loading}
                  options={dealer}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                />
              </div>
            </div>

            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 font-semibold">Type</th>

                  <th className="text-center py-2 font-semibold whitespace-normal">
                    <span className="block leading-tight">Plan</span>
                    <span className="block text-xs text-gray-500">(qty)</span>
                  </th>

                  <th className="text-center py-2 font-semibold whitespace-normal">
                    <span className="block leading-tight">Plan</span>
                    <span className="block text-xs text-gray-500">(thb)</span>
                  </th>

                  <th className="text-center py-2 font-semibold whitespace-normal">
                    <span className="block leading-tight">Actual</span>
                    <span className="block text-xs text-gray-500">(qty)</span>
                  </th>

                  <th className="text-center py-2 font-semibold whitespace-normal">
                    <span className="block leading-tight">Actual</span>
                    <span className="block text-xs text-gray-500">(thb)</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {listActivityData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <img src={item.icon} alt={item.type} className="w-6 h-6" />
                        <span className="whitespace-normal break-words">{item.type}</span>
                      </div>
                    </td>

                    <td className="text-center py-2 text-gray-700">
                      {item.plan?.toLocaleString?.() ?? 0}
                    </td>
                    <td className="text-center py-2 text-gray-700">
                      {item.plan_value?.toLocaleString?.() ?? 0}
                    </td>
                    <td className="text-center py-2 text-gray-700">
                      {item.actual?.toLocaleString?.() ?? 0}
                    </td>
                    <td className="text-center py-2 text-gray-700">
                      {item.actual_value?.toLocaleString?.() ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </BoxPrimary>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-4">
        {/* Sub Dealer by Dealer */}
        <Col xs={24} lg={24} xl={12}>
          <Card className="shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F] h-full">
            <div className="flex flex-wrap items-center justify-between">
              <h3 className="text-[#00783F] text-lg font-semibold mb-3">
                Sub Dealer By Dealer
              </h3>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="mb-4 w-36"
                  value={selectedSdByD}
                  onChange={(value) => setSelectedSdByD(value)}
                  placeholder={loading ? "Loading..." : "Select by Dealer"}
                  disabled={loading}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  options={dealer}
                />
              </div>
            </div>

            <div className="flex justify-center items-center">
              <DoughnutChartComponent data={subdealerByDealerData} />
            </div>
          </Card>
        </Col>

        {/* Sale By Crop */}
        <Col xs={24} lg={24} xl={12}>
          <Card className="shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
            <div className="flex flex-wrap justify-between">
              <h3 className="text-[#00783F] text-lg font-semibold mb-3">
                Sales By Crop
              </h3>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="mb-4 w-48"
                  value={selectedSaleByCrop}
                  onChange={(value) => setSelectedSaleByCrop(value)}
                  placeholder={loading ? "Loading..." : "Select Sale (Top)"}
                  disabled={true}
                  options={salesByArea}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                />

                <Select
                  className="w-36 hidden"
                  value={selectedMonthsSaleByCrop}
                  onChange={(value) => setSelectedMonthsSaleByCrop(value)}
                  placeholder={loading ? "Loading..." : "Select Month"}
                  disabled={loading}
                  options={months}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                />
              </div>
            </div>

            <div className="flex justify-center items-center">
              <div className="flex-grow flex justify-center items-center">
                <div className="relative" />
                <DoughnutChartComponent data={saleCropData} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
}
