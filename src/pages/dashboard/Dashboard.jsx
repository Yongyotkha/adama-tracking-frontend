import React, { useState, useEffect } from "react";
import { Card, Row, Col, Select } from "antd";
import MainLayout from "../../layouts/MainLayout";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";

import { PieChart } from "@mui/x-charts";
import BoxPrimary from "../../components/box_primary/BoxPrimary";

import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { useNavigate } from "react-router-dom";
import PieChartComponent from "../../components/charts/PieChartComponent";
import DoughnutChartComponent from "../../components/charts/DoughnutChartComponent";
import formatNumber from "../../utils/number";
import convertNumber from "../../utils/convertNumber";
import percentage from "../../utils/percentage";

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
  const [totalSaleValue, setTotalSaleValue] = useState(0); // เก็บค่ารวมทั้งหมด
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSalesByDealer, setSelectedSalesByDealer] = useState(null);
  const [selectedMonthsSalesByDealer, setSelectedMonthsSalesByDealer] =
    useState(null);
  const [selectedMonthsExpense, setSelectedMonthsExpense] = useState(null);
  const [selectedMonthsDealerPlan, setSelectedMonthsDealerPlan] =
    useState(null);
  const [selectedMonthsTopActivity, setSelectedMonthsTopActivity] =
    useState(null);

  const [selectedMonthsSaleByCrop, setSelectedMonthsSaleByCrop] =
    useState(null);
  const [selectedMonthsActivity, setSelectedMonthsActivity] = useState(null);
  const [selectedSaleByCrop, setSelectedSaleByCrop] = useState(null);
  const [selectedSaleActivity, setSelectedSaleActivity] = useState(null);
  const [selectedDealerPlan, setSelectedDealerPlan] = useState(null);
  const [selectedDealerTopActivity, setSelectedDealerTopActivity] =
    useState(null);
  const [selectedSubdealerPlan, setSelectedSubdealerPlan] = useState(null);
  const [selectedSdByD, setSelectedSdByD] = useState(null);
  const [calPercentage, setCalPercentage] = useState({
    plan: "",
    actual: "",
  });

  const valueFormatterMB = (value) => {
    if (typeof value !== "number" || isNaN(value)) {
      return "0.0 M THB"; // ถ้าค่าไม่ถูกต้อง ให้ return ค่าปลอดภัย
    }
    return `${(value / 1_000_000).toFixed(1)} M THB`; // แปลงเป็น MB
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [years, months, subdealers, dealers, sales] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear),
          useServiceAPI.get(paths.pathMasterMonths),
          useServiceAPI.get(paths.pathMasterSubDealer),
          useServiceAPI.get(paths.pathMasterDealerAll),
          useServiceAPI.get(paths.pathMasterSaleDropdown),
        ]);

        if (years.data.length > 0) {
          setYears(years.data);
          setSelectedYear(years.data[0]?.id);
        }

        if (months.data.length > 0) {
          const formattedMonths = months.data.map((item) => ({
            value: item.id,
            label: item.name,
          }));
          setMonths(formattedMonths);
        }

        if (subdealers.data.length > 0) {
          const formattedSubdealers = subdealers.data.map((item) => ({
            value: item.sub_dealer_id,
            label: item.sub_dealer_name,
          }));
          setSubdealer(formattedSubdealers);
        }

        if (dealers.data.length > 0) {
          const formattedDealers = dealers.data.map((item) => ({
            value: item.id,
            label: item.name,
          }));

          setDealer(formattedDealers);
          setSelectedSdByD(formattedDealers[0].value);
        }
        if (sales.data.length > 0) {
          const formattedSales = sales.data.map((item) => ({
            value: item.id,
            label: item.name,
          }));

          console.log(formattedSales);
          setSales(formattedSales);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathDashBordCustomer, {
          year_code: selectedYear,
        });
        if (response.status === 200) {
          const data = response.data || {};
          const cleanedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key.trim(), value])
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
    if (selectedYear) {
      fetchDashboardData();
    }
  }, [selectedYear]);

  const fetchDashboardDataExpense = async () => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathDashBordExpense, {
        year_code: selectedYear,
        month_id: selectedMonthsExpense,
      });
      if (response.status === 200) {
        const data = response.data || {};
        setDashboardDataExpense(data);
      } else {
        console.error("Failed to fetch dashboard data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedYear) {
      fetchDashboardDataExpense();
    }
  }, [selectedYear, selectedMonthsExpense]);

  useEffect(() => {
    const fetchDashboardDataSalesByDealer = async () => {
      try {
        setLoading(true);
        const response = await useServiceAPI.get(
          paths.pathDashBordSaleByDealer,
          {
            year_code: selectedYear,
            dealer_id: selectedSalesByDealer,
            month_id: selectedMonthsSalesByDealer,
          }
        );
        if (response.status === 200) {
          const data = response.data || {};
          setDashboardDataOrder(data);
        } else {
          console.error("Failed to fetch dashboard data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (selectedYear) {
      fetchDashboardDataSalesByDealer();
    }
  }, [selectedYear, selectedSalesByDealer, selectedMonthsSalesByDealer]);

  useEffect(() => {
    if (
      selectedMonthsSalesByDealer &&
      selectedMonthsSalesByDealer === selectedMonthsExpense &&
      selectedSalesByDealer
    ) {
      const total_amount_target_plan = convertNumber(
        dashboardDataOrder.total_amount_target_plan
      );
      const total_amount_target_actual = convertNumber(
        dashboardDataOrder.total_amount_target_actual
      );
      const total_expense_activity_plan = convertNumber(
        dashboardDataExpense.total_expense_activity_plan
      );
      const total_expense_actual_exp = convertNumber(
        dashboardDataExpense.total_expense_actual_exp
      );

      const planPercentage = percentage(
        total_expense_activity_plan,
        total_amount_target_plan
      );
      const actualPercentage = percentage(
        total_expense_actual_exp,
        total_amount_target_actual
      );

      setCalPercentage({
        actual: `${formatNumber(actualPercentage)}%`,
        plan: `${formatNumber(planPercentage)}%`,
      });
    } else {
      setCalPercentage({
        actual: "",
        plan: "",
      });
    }
  }, [dashboardDataOrder, dashboardDataExpense]);

  useEffect(() => {
    const fetchDealerPlanData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathDashBordPlan, {
          year_code: selectedYear,
          dealer_id: selectedDealerPlan,
          month_id: selectedMonthsDealerPlan,
        });
        if (response.status === 200 && response.data) {
          const data = response.data.map((item) => ({
            month: item.name,
            plan:
              parseFloat(
                String(item.work_plan_value || "0").replace(/,/g, "")
              ) || 0,

            rolling:
              parseFloat(
                String(item.work_rolling_plan_value || "0").replace(/,/g, "")
              ) || 0,
            actual:
              parseFloat(
                String(item.work_actual_value || "0").replace(/,/g, "")
              ) || 0,
          }));

          console.log(data);
          setDealerPlanData(data); // อัปเดต State
        } else {
          console.error("Failed to fetch Dealer Plan data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching Dealer Plan data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (selectedYear) {
      fetchDealerPlanData();
    }
  }, [selectedYear, selectedDealerPlan, selectedMonthsDealerPlan]);

  useEffect(() => {
    const fetchTopActivityData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(
          paths.pathDashBordTopActivity,
          {
            year_code: selectedYear,
            dealer_id: selectedDealerTopActivity,
            month_id: selectedMonthsTopActivity,
          }
        );
        if (response.status === 200 && response.data) {
          console.log(response.data);

          const data = response.data.map((item) => ({
            activity: item.activity_type_name,
            total_activity_actual:
              parseFloat(
                String(item.total_activity_actual || "0").replace(/,/g, "")
              ) || 0,
            total_activity_list:
              parseFloat(
                String(item.total_activity_list || "0").replace(/,/g, "")
              ) || 0,
            total_activity_plan:
              parseFloat(
                String(item.total_activity_plan || "0").replace(/,/g, "")
              ) || 0,
            color: item.activity_color,
          }));

          setTopActivityData(data); // อัปเดต State
        } else {
          console.error("Failed to fetch Top Activity data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching Top Activity data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (selectedYear) {
      fetchTopActivityData();
    }
  }, [selectedYear, selectedDealerTopActivity, selectedMonthsTopActivity]);

  useEffect(() => {
    const fetchSubDealerPlanData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(
          paths.pathDashBordSubDealerPlan,
          {
            year_code: selectedYear,
            sub_dealer_id: selectedSubdealerPlan,
          }
        );
        if (response.status === 200 && response.data) {
          const data = response.data.map((item) => ({
            month: item.product_name,
            plan:
              parseFloat(
                String(item.work_plan_value || "0").replace(/,/g, "")
              ) || 0,
            actual:
              parseFloat(
                String(item.work_actual_value || "0").replace(/,/g, "")
              ) || 0,
          }));
          setSubDealerPlanData(data); // อัปเดต State
        } else {
          console.error(
            "Failed to fetch Sub Dealer Plan data:",
            response.message
          );
        }
      } catch (error) {
        console.error("Error fetching Sub Dealer Plan data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (selectedYear) {
      fetchSubDealerPlanData();
    }
  }, [selectedYear, selectedSubdealerPlan]);

  useEffect(() => {
    const fetchSubDealerByDealerData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(
          paths.pathDashBoardSubDealerByDealer,
          {
            year_code: selectedYear,
            dealer_id: selectedSdByD,
          }
        );
        if (response.status === 200 && response.data) {
          const data = response?.data?.items?.map((item) => ({
            value:
              parseFloat(
                String(item.total_amount_target || "0").replace(/,/g, "")
              ) || 0,
            label: item.sub_dealer_name,
            percentage: item.percentage,
          }));

          console.log(data);
          setSubdealerByDealerData(data); // อัปเดต State
        } else {
          console.error("Failed to fetch Sale By Crop data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching Sale By Crop data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear && selectedSdByD) {
      // if (selectedYear) {
      fetchSubDealerByDealerData();
    }
  }, [selectedYear, selectedSdByD]);

  useEffect(() => {
    const fetchSaleCropData = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathDashBordSaleCrop, {
          year_code: selectedYear,
          dealer_id: selectedSaleByCrop,
          month_id: selectedMonthsSaleByCrop,
        });
        if (response.status === 200 && response.data) {
          const data = response.data.map((item) => ({
            value: item.value,
            amount_target:
              parseFloat(String(item.amount_target || "0").replace(/,/g, "")) ||
              0,
            label: item.name,
            color: item.color.trim(),
            name: item.name,
          }));
          setSaleCropData(data); // อัปเดต State
          const totalValue = data.reduce((sum, crop) => sum + crop.value, 0);
          setTotalSaleValue(totalValue); // อัปเดตค่ารวม
        } else {
          console.error("Failed to fetch Sale By Crop data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching Sale By Crop data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear) {
      fetchSaleCropData();
    }
  }, [selectedYear, selectedSaleByCrop, selectedMonthsSaleByCrop]);

  useEffect(() => {
    const fetchListActivityData = async () => {
      setLoading(true);
      try {
        const payload = {
          year_code: selectedYear,
          sale_id: selectedSaleActivity,
          month_id: selectedMonthsActivity,
        };

        const response = await useServiceAPI.get(
          paths.pathDashBordListActivity,
          payload
        );
        if (response.status === 200 && response.data) {
          const data = response.data.map((item) => ({
            type: item.activity_type_name,
            plan:
              parseFloat(
                String(item.total_activity_plan_count || "0").replace(/,/g, "")
              ) || 0,
            actual:
              parseFloat(
                String(item.total_activity_actual_count || "0").replace(
                  /,/g,
                  ""
                )
              ) || 0,
            plan_value:
              parseFloat(
                String(item.total_activity_plan_value || "0").replace(/,/g, "")
              ) || 0,
            actual_value:
              parseFloat(
                String(item.total_activity_actual_value || "0").replace(
                  /,/g,
                  ""
                )
              ) || 0,
            icon: item.activity_image,
          }));
          setListActivityData(data); // อัปเดต State
        } else {
          console.error(
            "Failed to fetch List Activity data:",
            response.message
          );
        }
      } catch (error) {
        console.error("Error fetching List Activity data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear) {
      fetchListActivityData();
    }
  }, [selectedYear, selectedSaleActivity, selectedMonthsActivity]);

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Dashboard</div>
        <Select
          className="w-40"
          value={selectedYear}
          onChange={(value) => {
            setSelectedYear(value); // อัปเดต state สำหรับ Expense
          }}
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
                  className="w-[4.5rem] h-[4.5rem] cursor-pointer" // Add cursor-pointer for UX
                  onClick={() => navigate("/customer/dealer")} // Add navigation on click
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
                  className="w-[4.5rem] h-[4.5rem] cursor-pointer" // Add cursor-pointer for UX
                  onClick={() => navigate("/customer/sub-dealer")} // Add navigation on click
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
                  onChange={(value) => {
                    setSelectedMonthsExpense(value); // อัปเดต state สำหรับ Expense
                  }}
                  placeholder={loading ? "Loading..." : "Select Month"}
                  disabled={loading}
                  options={months}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                ></Select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-300">
              <div className="text-center py-4">
                <div className="text-md font-bold text-[#00783F]">
                  {dashboardDataExpense.total_expense_activity_plan}
                  <br />
                  {calPercentage.plan||dashboardDataExpense.total_expense_activity_plan_percentage}
                </div>
                <div className="text-sm text-gray-500">Activity Plan</div>
              </div>
              <div className="text-center py-4 flex flex-col justify-between">
                <div className="text-md font-bold text-[#00783F]">
                  {dashboardDataExpense.total_expense_advance}
                </div>
                <div className="text-sm text-gray-500">Advance</div>
              </div>
              <div className="text-center py-4">
                <div className="text-md font-bold text-[#00783F]">
                  {dashboardDataExpense.total_expense_actual_exp} <br />
                  {calPercentage.actual||dashboardDataExpense.total_expense_actual_exp_percentage}
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
              <h3 className="text-lg font-bold text-[#00783F]">
                Sales By Dealer
              </h3>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="w-36"
                  value={selectedSalesByDealer}
                  onChange={(value) => {
                    setSelectedSalesByDealer(value);
                  }}
                  placeholder={loading ? "Loading..." : "All Dealer"}
                  disabled={loading}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  options={dealer}
                ></Select>
                <Select
                  className="w-36"
                  value={selectedMonthsSalesByDealer}
                  onChange={(value) => {
                    setSelectedMonthsSalesByDealer(value); // อัปเดต state สำหรับ Order
                  }}
                  placeholder={loading ? "Loading..." : "Select Month"}
                  disabled={loading}
                  options={months}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                ></Select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300 w-full">
              <div className="text-center p-2">
                <div className="text-md font-bold text-[#00783F]">
                  {dashboardDataOrder.total_amount_target_plan}
                </div>
                <div className="text-sm text-gray-500">Plan</div>
              </div>
              <div className="text-center p-2">
                <div className="text-md font-bold text-[#00783F]">
                  {dashboardDataOrder.total_amount_target_actual}
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
                      onChange={(value) => {
                        setSelectedDealerPlan(value);
                      }}
                      placeholder={loading ? "Loading..." : "Select Dealer"}
                      disabled={loading}
                      showSearch
                      allowClear
                      optionFilterProp="label"
                      options={dealer}
                    ></Select>
                    <Select
                      className="w-36"
                      value={selectedMonthsDealerPlan}
                      onChange={(value) => {
                        setSelectedMonthsDealerPlan(value);
                      }}
                      placeholder={loading ? "Loading..." : "Select Month"}
                      disabled={loading}
                      options={months}
                      showSearch
                      allowClear
                      optionFilterProp="label"
                    ></Select>
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
                    // yAxis={[
                    //   {
                    //     id: "logAxis",
                    //     scaleType: "log",
                    //   },
                    // ]}
                    // leftAxis="logAxis"
                    series={[
                      {
                        // yAxisKey: "logAxis",
                        dataKey: "plan",
                        label: "Work Plan",
                        valueFormatter: valueFormatterMB,
                        color: "#10B981",
                      },
                      {
                        // yAxisKey: "logAxis",
                        dataKey: "rolling",
                        label: "Rolling Forecast",
                        valueFormatter: valueFormatterMB,
                        color: "#F59E0B",
                      },
                      {
                        // yAxisKey: "logAxis",
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
                    margin={{ left: 100 }} // Adjust for large numbers
                    sx={{
                      ".MuiChartsBar-label": {
                        fill: "#333", // Ensure text visibility
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
              <Card className=" shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <div className="flex flex-wrap justify-between">
                  <h3 className="text-[#00783F] text-lg font-semibold">
                    Top 5 Activity
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Select
                      className="mb-4 w-36"
                      value={selectedDealerTopActivity}
                      onChange={(value) => {
                        setSelectedDealerTopActivity(value); // อัปเดต state ของ Top 5 Activity
                      }}
                      placeholder={loading ? "Loading..." : "Select Dealer"}
                      disabled={loading}
                      showSearch
                      allowClear
                      optionFilterProp="label"
                      options={dealer}
                    ></Select>
                    <Select
                      className="w-36"
                      value={selectedMonthsTopActivity}
                      onChange={(value) => {
                        setSelectedMonthsTopActivity(value); // อัปเดต state สำหรับ Top 5 Activity
                      }}
                      placeholder={loading ? "Loading..." : "Select Month"}
                      disabled={loading}
                      options={months}
                      showSearch
                      allowClear
                      optionFilterProp="label"
                    ></Select>
                  </div>
                </div>
                <div className="h-full rounded">
                  {/* แสดง Bar Chart ด้วยข้อมูลจาก Top Activity */}
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
                      {
                        dataKey: "total_activity_plan",
                        label: "Activity Plan",
                      },
                      {
                        dataKey: "total_activity_list",
                        label: "Activity List",
                      },
                      {
                        dataKey: "total_activity_actual",
                        label: "Activity Actual",
                      },
                    ]}
                    yAxis={[
                      {
                        // label: "Count",
                        label: null,
                      },
                    ]}
                    height={400}
                    slotProps={{ legend: { hidden: true } }} // ซ่อน legend
                    sx={{
                      ".MuiBar-root": {
                        borderRadius: "4px",
                      },
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
                      onChange={(value) => {
                        setSelectedSubdealerPlan(value);
                      }}
                      placeholder={loading ? "Loading..." : "Select Dealer"}
                      disabled={loading}
                      showSearch
                      allowClear
                      optionFilterProp="label"
                      options={dealer}
                    ></Select>
                  </div>
                </div>
                {/* แสดง Bar Chart ด้วยข้อมูลจาก Sub Dealer Plan */}
                <div className="h-full rounded">
                  <BarChart
                    dataset={subDealerPlanData}
                    xAxis={[
                      {
                        scaleType: "band",
                        dataKey: "month",
                      },
                    ]}
                    yAxis={[
                      {
                        label: null,
                      },
                    ]}
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
                      ".MuiBar-root": {
                        borderRadius: "4px",
                      },
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
        <Col xs={24} lg={24} xl={7} className="">
          <BoxPrimary className="sticky top-1">
            <div className="flex flex-wrap justify-between mb-4">
              <h3 className="text-[#00783F] text-lg font-semibold">Activity</h3>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="mb-4 w-36"
                  value={selectedSaleActivity}
                  onChange={(value) => {
                    setSelectedSaleActivity(value);
                  }}
                  placeholder={loading ? "Loading..." : "Select Sale"}
                  disabled={loading}
                  options={sales}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                ></Select>
                <Select
                  className="w-36"
                  value={selectedMonthsActivity}
                  onChange={(value) => {
                    setSelectedMonthsActivity(value);
                  }}
                  placeholder={loading ? "Loading..." : "Select Month"}
                  disabled={loading}
                  options={months}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                ></Select>
              </div>
            </div>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 font-semibold">Type</th>
                  <th className="text-center py-2 font-semibold">Plan</th>
                  <th className="text-center py-2 font-semibold">Value</th>
                  <th className="text-left py-2 font-semibold">Actual</th>
                  <th className="text-center py-2 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {listActivityData.map((item, index) => {
                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-2 flex items-end gap-2">
                        <img
                          src={item.icon}
                          alt={item.type}
                          className="w-6 h-6"
                        />
                        <span>{item.type}</span>
                      </td>
                      <td className="text-center py-2 text-gray-700">
                        {item.plan.toLocaleString() || 0}
                      </td>
                      <td className="text-center py-2 text-gray-700">
                        {item.plan_value.toLocaleString() || 0}
                      </td>
                      <td className="text-center py-2 text-gray-700">
                        {item.actual.toLocaleString() || 0}
                      </td>
                      <td className="text-center py-2 text-gray-700">
                        {item.actual_value.toLocaleString() || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </BoxPrimary>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-4">
        {/* Sub Dealer by Dealer */}
        <Col xs={24} lg={24} xl={12}>
          <Card className=" shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F] h-full">
            <div className="flex flex-wrap items-center justify-between">
              <h3 className="text-[#00783F] text-lg font-semibold mb-3">
                Sub Dealer By Dealer
              </h3>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="mb-4 w-36"
                  value={selectedSdByD}
                  onChange={(value) => {
                    setSelectedSdByD(value);
                  }}
                  placeholder={loading ? "Loading..." : "Select Sub Dealer"}
                  disabled={loading}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  options={dealer}
                />
              </div>
            </div>
            <div className="flex justify-center items-center">
              {/* <PieChart
                series={[
                  {
                    innerRadius: 120,
                    outerRadius: 150,
                    // arcLabel: (item) => `${item.value}%`,
                    data: subdealerByDealerData.map((item, index) => ({
                      ...item,
                    })),
                    valueFormatter: (item) => (
                      <>
                        <div className="text-center">{item.label}</div>
                        <div>value : {item.value.toLocaleString()}</div>
                        <div>percentage : {item.percentage}%</div>
                      </>
                    ),
                  },
                ]}
                margin={{ top: 0, bottom: 100, left: 100, right: 100 }}
                slotProps={{
                  legend: {
                    direction: "row",
                    position: { vertical: "bottom", horizontal: "center" },
                    padding: 0,
                  },
                  popper: {
                    sx: {
                      ["& .MuiChartsTooltip-labelCell"]: {
                        display: "none",
                      },
                      ["& .MuiChartsTooltip-cell.MuiChartsTooltip-valueCell"]: {
                        paddingLeft: "15px",
                      },
                    },
                  },
                }}
                style={{ width: "100%", height: "auto", minHeight: 400 }}
              /> */}
              <DoughnutChartComponent data={subdealerByDealerData} />
            </div>
          </Card>
        </Col>

        {/* Sale By Crop */}
        <Col xs={24} lg={24} xl={12}>
          <Card className=" shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
            <div className="flex flex-wrap justify-between">
              <h3 className="text-[#00783F] text-lg font-semibold mb-3">
                Sale By Crop
              </h3>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="mb-4 w-36"
                  value={selectedSaleByCrop}
                  onChange={(value) => {
                    setSelectedSaleByCrop(value);
                  }}
                  placeholder={loading ? "Loading..." : "Select Sale"}
                  disabled={loading}
                  options={sales}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                />
                <Select
                  className="w-36 hidden"
                  value={selectedMonthsSaleByCrop}
                  onChange={(value) => {
                    setSelectedMonthsSaleByCrop(value);
                  }}
                  placeholder={loading ? "Loading..." : "Select Month"}
                  disabled={loading}
                  options={months}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                ></Select>
              </div>
            </div>
            <div className="flex justify-center items-center">
              {/* Pie Chart */}
              <div className="flex-grow flex justify-center items-center">
                <div className="relative"></div>
                {/* <PieChart
                  series={[
                    {
                      data: saleCropData
                        .filter((item) => item.value > 0)
                        .map((item) => ({
                          ...item,
                        })),
                      innerRadius: 120,
                      outerRadius: 150,
                      colorField: "color",
                      labelField: "name",
                      valueFormatter: (item) => (
                        <>
                          <div className="text-center">{item.label}</div>
                          <div>value : {item.amount_target.toLocaleString()}</div>
                          <div>percentage : {item.value.toFixed(2)}%</div>
                        </>
                      ),
                    },
                  ]}
                  margin={{ top: 0, bottom: 100, left: 100, right: 100 }}
                  slotProps={{
                    legend: {
                      direction: "row",
                      position: { vertical: "bottom", horizontal: "center" },
                      padding: 0,
                    },
                    popper: {
                      sx: {
                        ["& .MuiChartsTooltip-labelCell"]: {
                          display: "none",
                        },
                        ["& .MuiChartsTooltip-cell.MuiChartsTooltip-valueCell"]:
                        {
                          paddingLeft: "15px",
                        },
                      },
                    },
                  }}
                  style={{ width: "100%", height: "auto", minHeight: 400 }}
                /> */}
                <DoughnutChartComponent data={saleCropData} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
}
