import React, { useState, useEffect } from "react";
import { Card, Row, Col, Select } from "antd";
import MainLayout from "../../layouts/MainLayout";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import { useDrawingArea } from "@mui/x-charts/hooks";
import { styled } from "@mui/material/styles";
import { PieChart } from "@mui/x-charts";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Hidden } from "@mui/material";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState({});
  const [months, setMonths] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState(null);
  const [subdealer, setSubdealer] = useState([]);
  const [selectedSubdealer, setSelectedSubdealer] = useState(null);
  const [dealer, setDealer] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    dealer_count: 0,
    sub_dealer_count: 0,
  });
  const [dashboardDataExpense, setDashboardDataExpense] = useState({
    total_expense_actual_sale: 0,
    total_expense_actual_exp: 0,
    total_expense_advance: 0,
  });
  const [dashboardDataOrder, setDashboardDataOrder] = useState({
    total_order: 0,
    total_order_amonth: 0,
  });
  const [dealerPlanData, setDealerPlanData] = useState([]);
  const [topActivityData, setTopActivityData] = useState([]);
  const [listActivityData, setListActivityData] = useState([]);
  const [subDealerPlanData, setSubDealerPlanData] = useState([]);
  const [saleCropData, setSaleCropData] = useState([]);
  const [totalSaleValue, setTotalSaleValue] = useState(0); // เก็บค่ารวมทั้งหมด
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSubdealerExpense, setSelectedSubdealerExpense] =
    useState(null);
  const [selectedSubdealerOrder, setSelectedSubdealerOrder] = useState(null);
  const [selectedMonthsExpense, setSelectedMonthsExpense] = useState(null);
  const [selectedMonthsOrder, setSelectedMonthsOrder] = useState(null);
  const [selectedMonthsDealerPlan, setSelectedMonthsDealerPlan] =
    useState(null);
  const [selectedMonthsTopActivity, setSelectedMonthsTopActivity] =
    useState(null);
  const [selectedMonthsSubDealerPlan, setSelectedMonthsSubDealerPlan] =
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
  const [selectedMonthSdByD, setSelectedMonthSdByD] = useState(null);
  const chartSetting = {
    yAxis: [
      {
        label: null,
        tickLabelStyle: {
          fontSize: 12,
          whiteSpace: "nowrap",
          overflow: "visible",
          textAlign: "right",
        },
      },
    ],
    xAxis: [
      {
        scaleType: "band",
        dataKey: "month",
        tickLabelStyle: { fontSize: 12 },
      },
    ],
    height: 300,
    margin: { left: 85 }, // Increase left margin for large numbers
    sx: {
      [`.${axisClasses.left} .${axisClasses.label}`]: {
        transform: "translate(-10px, 0)",
      },
    },
  };

  const navigate = useNavigate();

  const valueFormatterMB = (value) => {
    return `${(value / 1_000_000).toFixed(1)} M.B.`; // Convert to MB
  };

  // Pie Chart Data
  const pieData = [
    { value: 20000, label: "Rice", color: "#8B5CF6", name: "Rice" },
    { value: 10000, label: "Fruits", color: "#E11D48", name: "Fruits" },
    { value: 10000, label: "Sugarcane", color: "#3B82F6", name: "Sugarcane" },
    { value: 10000, label: "Vegetable", color: "#10B981", name: "Vegetable" },
    { value: 10000, label: "Corn", color: "#F59E0B", name: "Corn" },
    { value: 10000, label: "Pineapple", color: "#7C3AED", name: "Pineapple" },
    { value: 10000, label: "Other", color: "#A78BFA", name: "Other" },
  ];

  // Calculate Total Value
  const totalValue = pieData.reduce((sum, item) => sum + item.value, 0);

  // Styled Center Text
  const StyledText = styled("text")(({ theme }) => ({
    fill: theme.palette.text.primary,
    textAnchor: "middle",
    dominantBaseline: "central",
    fontSize: 20,
  }));

  // Custom Center Label
  function PieCenterLabel({ children }) {
    const { width, height, left, top } = useDrawingArea();
    return (
      <StyledText x={left + width / 2} y={top + height / 2}>
        {children}
      </StyledText>
    );
  }

  useEffect(() => {
    fetchYears(); // ดึงปี
    fetchMonth(); // ดึงเดือน
    fetchSubdealer();
    fetchDealers();
    fetchSalesDropdown();
    fetchDashboardData();
    fetchDashboardDataExpense();
    fetchDashboardDataOrder();
    fetchDealerPlanData();
    fetchTopActivityData();
    fetchListActivityData();
    fetchSubDealerPlanData();
    fetchSaleCropData();
  }, []);

  // เลือกปี
  const fetchYears = async () => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathMasterYear);
      if (response.status === 200) {
        const yearsData = response.data || []; // ตรวจสอบว่า data มีอยู่หรือไม่
        setYears(yearsData); // เก็บข้อมูลทั้งหมดลง state
        setSelectedYear(yearsData[0]?.id);
      }
    } catch (error) {
      console.error("Error fetching years:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (value) => {
    setSelectedYear(value); // อัปเดตค่า state
    fetchDashboardData(value);
    fetchDashboardDataExpense(value);
    fetchDashboardDataOrder(value);
    fetchDealerPlanData(value);
    fetchTopActivityData(value);
    fetchListActivityData(value);
    fetchSubDealerPlanData(value);
    fetchSaleCropData(value);
  };

  // เลือเดือน
  const fetchMonth = async () => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathMasterMonths);
      if (response.status === 200) {
        const monthsData = response.data || [];
        setMonths([{ id: "all", name: "All Month" }, ...monthsData]); // เพิ่ม "All Month"
        setSelectedMonths("all"); // ตั้งค่า default เป็น "All Month"
      }
    } catch (error) {
      console.error("Error fetching months:", error);
    } finally {
      setLoading(false);
    }
  };

  // เลือก subdealer
  const fetchSubdealer = async () => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathMasterSubDealer);
      if (response.status === 200) {
        const subDealerData = response.data || [];
        setSubdealer([
          { sub_dealer_id: "all", sub_dealer_name: "All Sub Dealer" },
          ...subDealerData,
        ]);
        setSelectedSubdealer("all"); // ตั้งค่า default เป็น "All Sub Dealer"
      }
    } catch (error) {
      console.error("Error fetching subdealers:", error);
    } finally {
      setLoading(false);
    }
  };

  // เลือก dealer
  const fetchDealers = async () => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathMasterDealerAll);
      if (response.status === 200) {
        const dealerData = response.data || [];
        setDealer([{ id: "all", name: "All Dealer" }, ...dealerData]);
        setSelectedDealer("all"); // ตั้งค่า default เป็น "All Dealer"
      }
    } catch (error) {
      console.error("Error fetching dealers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubdealerChangeExpense = (value) => {
    setSelectedSubdealer(value === "all" ? "" : value);
    fetchDashboardDataExpense(
      selectedYear,
      selectedMonths,
      value === "all" ? "" : value
    ); // ส่งค่า Sub Dealer ที่เลือก
  };

  const handleSubdealerChangePlan = (value) => {
    setSelectedSubdealerPlan(value === "all" ? "" : value);
    // fetchDashboardDataOrder(selectedYear, selectedMonths, value === "all" ? "" : value);
  };

  // ฟังก์ชันสำหรับดึงข้อมูล Sub Dealer
  const fetchDashboardData = async (year) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathDashBordCustomer, {
        year_code: year,
      });
      if (response.status === 200) {
        const data = response.data || {};
        setDashboardData({
          dealer_count: data["dealer_count "] || 0,
          sub_dealer_count: data["sub_dealer_count "] || 0,
        });
      } else {
        console.error("Failed to fetch dashboard data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับดึงข้อมูล Expense
  const fetchDashboardDataExpense = async (
    year = new Date().getFullYear(),
    month = selectedMonths,
    subDealerId = selectedSubdealer
  ) => {
    setLoading(true);
    try {
      const payload = {
        year_code: year,
        sub_dealer_id: subDealerId === "all" ? "" : subDealerId,
        month_id: month === "all" ? "" : month,
      };

      const response = await useServiceAPI.get(
        paths.pathDashBordExpense,
        payload
      );
      if (response.status === 200) {
        const data = response.data || {};
        setDashboardDataExpense({
          total_expense_advance: data["total_expense_advance "] || 0,
          total_expense_actual_exp: data["total_expense_actual_exp "] || 0,
          total_expense_actual_sale: data["total_expense_actual_sale"] || 0,
        });
      } else {
        console.error("Failed to fetch dashboard data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับดึงข้อมูล Order
  const fetchDashboardDataOrder = async (
    year = new Date().getFullYear(),
    month = selectedMonths,
    subDealerId = selectedSubdealer
  ) => {
    setLoading(true);
    try {
      const payload = {
        year_code: year,
        sub_dealer_id: subDealerId === "all" ? "" : subDealerId,
        month_id: month === "all" ? "" : month,
      };

      const response = await useServiceAPI.get(
        paths.pathDashBordOrder,
        payload
      );
      if (response.status === 200) {
        const data = response.data || {};
        setDashboardDataOrder({
          total_order: data["total_order "] || 0,
          total_order_amonth: data["total_order_amonth "] || 0,
        });
      } else {
        console.error("Failed to fetch dashboard data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };



  // ฟังก์ชันสำหรับดึงข้อมูล Dealer Plan
  const fetchDealerPlanData = async (
    year = new Date().getFullYear(),
    month = selectedMonths,
    dealerId = selectedDealer
  ) => {
    setLoading(true);
    try {
      const payload = {
        year_code: year,
        dealer_id: dealerId === "all" ? "" : dealerId,
        month_id: month === "all" ? "" : month,
      };
      const response = await useServiceAPI.get(paths.pathDashBordPlan, payload);
      if (response.status === 200 && response.data) {
        const data = response.data.map((item) => ({
          month: item.name,
          // plan: item.work_plan_value,
          // actual: item.work_actual_value,
          plan: parseFloat(item.work_plan_value),
          actual: parseFloat(item.work_actual_value),
        }));
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



  // ฟังก์ชันสำหรับดึงข้อมูล Top Activity
  const fetchTopActivityData = async (
    year = new Date().getFullYear(),
    dealerId = selectedDealer,
    monthId = selectedMonths
  ) => {
    setLoading(true);
    try {
      const payload = {
        year_code: year,
        dealer_id: dealerId === "all" ? "" : dealerId,
        month_id: monthId === "all" ? "" : monthId,
      };

      const response = await useServiceAPI.get(
        paths.pathDashBordTopActivity,
        payload
      );
      if (response.status === 200 && response.data) {
        const data = response.data.map((item) => ({
          activity: item.activity_type_name,
          total_activity_actual: parseInt(item.total_activity_actual, 10),
          total_activity_list: parseInt(item.total_activity_list, 10),
          total_activity_plan: parseInt(item.total_activity_plan, 10),
          color: item.activity_color,
        }));

        console.log(data);

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

  // ฟังก์ชันสำหรับดึงข้อมูล Activity
  const fetchListActivityData = async (
    year = new Date().getFullYear(),
    saleId = selectedSale,
    monthId = selectedMonths
  ) => {
    setLoading(true);
    try {
      const payload = {
        year_code: year,
        sale_id: saleId === "all" ? "" : saleId,
        month_id: monthId === "all" ? "" : monthId,
      };

      const response = await useServiceAPI.get(
        paths.pathDashBordListActivity,
        payload
      );
      if (response.status === 200 && response.data) {
        const data = response.data.map((item) => ({
          type: item.activity_type_name,
          plan: parseInt(item.total_activity_plan_count, 10),
          actual: parseInt(item.total_activity_actual_count, 10),
          icon: item.activity_image,
        }));
        setListActivityData(data); // อัปเดต State
      } else {
        console.error("Failed to fetch List Activity data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching List Activity data:", error);
    } finally {
      setLoading(false);
    }
  };



  // ฟังก์ชันสำหรับดึงข้อมูล Sub Dealer Plan
  const fetchSubDealerPlanData = async (
    year = new Date().getFullYear(),
    month = selectedMonths,
    subDealerId = selectedSubdealer
  ) => {
    setLoading(true);
    try {
      const payload = {
        year_code: year,
        sub_dealer_id: subDealerId === "all" ? "" : subDealerId,
        month_id: month === "all" ? "" : month,
      };

      const response = await useServiceAPI.get(
        paths.pathDashBordSubDealerList,
        payload
      );
      if (response.status === 200 && response.data) {
        const data = response.data.map((item) => ({
          month: item.product_name, // ใช้ product_name แทน month
          // plan: item.work_plan_value,
          // actual: item.work_actual_value,

          plan: parseFloat(item.work_plan_value),
          actual: parseFloat(item.amount_target),
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

  const handleSubdealerChangeSubDealerPlan = (value) => {
    setSelectedSubdealer(value === "all" ? "" : value);
    fetchSubDealerPlanData(
      selectedYear,
      selectedMonths,
      value === "all" ? "" : value
    );
  };


  // ฟังก์ชันสำหรับดึงข้อมูล Sale By Crop
  const fetchSaleCropData = async (
    year = new Date().getFullYear(),
    dealerId = selectedDealer,
    monthId = selectedMonths
  ) => {
    setLoading(true);
    try {
      const payload = {
        year_code: year,
        dealer_id: dealerId === "all" ? "" : dealerId,
        month_id: monthId === "all" ? "" : monthId,
      };

      const response = await useServiceAPI.get(
        paths.pathDashBordSaleCrop,
        payload
      );
      if (response.status === 200 && response.data) {
        const data = response.data.map((item) => ({
          value: item.value,
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

  const fetchSalesDropdown = async () => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathMasterSaleDropdown);
      if (response.status === 200) {
        const salesData = response.data || [];
        setSales([{ id: "all", name: "All Sales" }, ...salesData]); // เพิ่ม "All Sales"
        setSelectedSale("all"); // ตั้งค่า default เป็น "All Sales"
      }
    } catch (error) {
      console.error("Error fetching sales dropdown:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock Data
  const supdealerByDealerData = [
    { value: 25, label: "Thanathon", color: "#00A5CF" },
    { value: 25, label: "Sombat Chemitech", color: "#FFA726" },
    { value: 25, label: "Maeka Chimitech", color: "#29B6F6" },
    { value: 20, label: "Kantar Co.,Ltd.", color: "#AB47BC" },
    { value: 5, label: "On shop", color: "#EC407A" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Dashboard</div>
        <Select
          className="w-40"
          value={selectedYear}
          onChange={handleYearChange}
          placeholder={loading ? "Loading..." : "Select Year"}
          disabled={loading}
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
        <Col xs={12} sm={6} lg={6} xxl={5}>
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
        <Col xs={12} sm={6} lg={6} xxl={4}>
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
        <Col xs={24} sm={12} lg={12} xxl={5}>
          <BoxPrimary className="h-full">
            <div className="flex flex-wrap justify-between items-center">
              <h3 className="text-lg font-bold text-[#00783F]">Expense</h3>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="w-36 hidden"
                  value={selectedSubdealerExpense}
                  onChange={(value) => {
                    setSelectedSubdealerExpense(value === "all" ? "" : value);
                    fetchDashboardDataExpense(
                      selectedYear,
                      selectedMonths,
                      value === "all" ? "" : value
                    );
                  }}
                  placeholder={loading ? "Loading..." : "All sub dealer"}
                  disabled={loading}
                >
                  {subdealer.map((sudealer) => (
                    <Select.Option
                      key={sudealer.sub_dealer_id}
                      value={sudealer.sub_dealer_id}
                    >
                      {`${sudealer.sub_dealer_name}`}
                    </Select.Option>
                  ))}
                </Select>

                <Select
                  className="w-36"
                  value={selectedMonthsExpense}
                  onChange={(value) => {
                    setSelectedMonthsExpense(value === "all" ? "" : value); // อัปเดต state สำหรับ Expense
                    fetchDashboardDataExpense(
                      selectedYear,
                      value === "all" ? "" : value,
                      selectedSubdealerExpense
                    );
                  }}
                  placeholder={loading ? "Loading..." : "Select Month"}
                  disabled={loading}
                >
                  {months.map((month) => (
                    <Select.Option key={month.id} value={month.id}>
                      {month.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-300">
              <div className="text-center py-4">
                <div className="text-md font-bold text-[#00783F]">
                  {"รอข้อมูล"}
                  {/* {dashboardDataExpense.total_expense_advance}{" "} */}
                  <br />{"100%"}
                </div>
                <div className="text-sm text-gray-500">Activity Plan</div>
              </div>
              <div className="text-center py-4 flex flex-col justify-between">
                <div className="text-md font-bold text-[#00783F]">
                  {" "}
                  {dashboardDataExpense.total_expense_advance}{" "}
                </div>
                <div className="text-sm text-gray-500">Advance</div>
              </div>
              {/* <div className="text-center py-2">
                <div className="text-md font-bold text-[#00783F]">  {dashboardDataExpense.total_expense_actual_exp} </div>
                <div className="text-sm text-gray-500">Estimate</div>
              </div> */}
              <div className="text-center py-4">
                <div className="text-md font-bold text-[#00783F]">
                  {" "}
                  {dashboardDataExpense.total_expense_actual_exp}{" "}
                  <br />{"100%"}
                </div>
                <div className="text-sm text-gray-500">Actual</div>
              </div>
            </div>
          </BoxPrimary>
        </Col>

        {/* Sale By Dealer */}
        <Col xs={24} sm={12} lg={12} xxl={5}>
          <BoxPrimary className="h-full items-center flex flex-col">
            <div className="flex flex-wrap justify-between items-center w-full">
              <h3 className="text-lg font-bold text-[#00783F]">Sales By Dealer</h3>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="w-36"
                  value={selectedSubdealerOrder}
                  onChange={(value) => {
                    setSelectedSubdealerOrder(value === "all" ? "" : value);
                    fetchDashboardDataOrder(
                      selectedYear,
                      selectedMonths,
                      value === "all" ? "" : value
                    );
                  }}
                  placeholder={loading ? "Loading..." : "All Dealer"}
                  disabled={loading}
                >
                  {dealer.map((dealer) => (
                    <Select.Option key={dealer.id} value={dealer.id}>
                      {dealer.name}
                    </Select.Option>
                  ))}
                </Select>

                <Select
                  className="w-36"
                  value={selectedMonthsOrder}
                  onChange={(value) => {
                    setSelectedMonthsOrder(value === "all" ? "" : value); // อัปเดต state สำหรับ Order
                    fetchDashboardDataOrder(
                      selectedYear,
                      value === "all" ? "" : value,
                      selectedSubdealerOrder
                    );
                  }}
                  placeholder={loading ? "Loading..." : "Select Month"}
                  disabled={loading}
                >
                  {months.map((month) => (
                    <Select.Option key={month.id} value={month.id}>
                      {month.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300 w-full">
              <div className="text-center p-2">
                <div className="text-md font-bold text-[#00783F]">
                  {" "}
                  {dashboardDataOrder.total_order}{" "}
                </div>
                <div className="text-sm text-gray-500">Plan</div>
              </div>
              <div className="text-center p-2">
                <div className="text-md font-bold text-[#00783F]">
                  {" "}
                  {dashboardDataOrder.total_order_amonth}{" "}
                </div>
                <div className="text-sm text-gray-500">Actual</div>
              </div>
            </div>
          </BoxPrimary>
        </Col>

        {/* Sale */}
        <Col xs={24} sm={12} lg={12} xxl={5}>
          <BoxPrimary className="h-full items-center flex flex-col">
            <div className="flex flex-wrap justify-between items-center w-full">
              <h3 className="text-lg font-bold text-[#00783F]">Sale</h3>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="w-36"
                  value={selectedSubdealerOrder}
                  onChange={(value) => {
                    setSelectedSubdealerOrder(value === "all" ? "" : value);
                    fetchDashboardDataOrder(
                      selectedYear,
                      selectedMonths,
                      value === "all" ? "" : value
                    );
                  }}
                  placeholder={loading ? "Loading..." : "All Sub Dealer"}
                  disabled={loading}
                >
                  {subdealer.map((dealer) => (
                    <Select.Option
                      key={dealer.sub_dealer_id}
                      value={dealer.sub_dealer_id}
                    >
                      {dealer.sub_dealer_name}
                    </Select.Option>
                  ))}
                </Select>

                <Select
                  className="w-36"
                  value={selectedMonthsOrder}
                  onChange={(value) => {
                    setSelectedMonthsOrder(value === "all" ? "" : value); // อัปเดต state สำหรับ Order
                    fetchDashboardDataOrder(
                      selectedYear,
                      value === "all" ? "" : value,
                      selectedSubdealerOrder
                    );
                  }}
                  placeholder={loading ? "Loading..." : "Select Month"}
                  disabled={loading}
                >
                  {months.map((month) => (
                    <Select.Option key={month.id} value={month.id}>
                      {month.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300 w-full">
              <div className="text-center p-2">
                <div className="text-md font-bold text-[#00783F]">
                  {" "}
                  {dashboardDataOrder.total_order}{" "}
                </div>
                <div className="text-sm text-gray-500">Estimate</div>
              </div>
              <div className="text-center p-2">
                <div className="text-md font-bold text-[#00783F]">
                  {" "}
                  {dashboardDataOrder.total_order_amonth}{" "}
                </div>
                <div className="text-sm text-gray-500">Acual</div>
              </div>
            </div>
          </BoxPrimary>
        </Col>
      </Row>

      {/* Row 2: Charts and Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={24} xl={18}>
          <Row gutter={[16, 16]}>
            {/* Dealer Plan Chart */}
            <Col xs={24} lg={24} xl={24}>
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <div className="flex flex-wrap items-center justify-between">
                  <h3 className="text-[#00783F] text-lg font-semibold mb-3">
                    Dealer Plan
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Select
                      className="mb-4 w-36"
                      value={selectedDealerPlan} // ใช้ state แยก
                      onChange={(value) => {
                        setSelectedDealerPlan(value); // อัปเดต state ของ Dealer Plan
                        fetchDealerPlanData(
                          selectedYear,
                          selectedMonths,
                          value
                        ); // เรียก API สำหรับ Dealer Plan
                      }}
                      placeholder={loading ? "Loading..." : "Select Dealer"}
                      disabled={loading}
                    >
                      {dealer.map((dealer) => (
                        <Select.Option key={dealer.id} value={dealer.id}>
                          {dealer.name}
                        </Select.Option>
                      ))}
                    </Select>
                    <Select
                      className="w-36"
                      value={selectedMonthsDealerPlan} // ใช้ state ที่แยกออกมา
                      onChange={(value) => {
                        setSelectedMonthsDealerPlan(
                          value === "all" ? "" : value
                        ); // อัปเดต state สำหรับ Dealer Plan
                        fetchDealerPlanData(
                          selectedYear,
                          value === "all" ? "" : value,
                          selectedDealer
                        );
                      }}
                      placeholder={loading ? "Loading..." : "Select Month"}
                      disabled={loading}
                    >
                      {months.map((month) => (
                        <Select.Option key={month.id} value={month.id}>
                          {month.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
                {/* แสดง Bar Chart ด้วยข้อมูลจาก Dealer Plan */}

                <div className="h-full rounded">
                  <BarChart
                    dataset={dealerPlanData}
                    xAxis={[{ scaleType: "band", dataKey: "month" }]}
                    series={[
                      {
                        dataKey: "plan",
                        label: "Work Plan",
                        valueFormatter: valueFormatterMB,
                        color: "#10B981", // Orange
                      },
                      {
                        dataKey: "rolling_forecast",
                        label: "Rolling Forecast",
                        valueFormatter: valueFormatterMB,
                        color: "#F59E0B", // Orange
                      },
                      {
                        dataKey: "actual",
                        label: "Actual",
                        valueFormatter: valueFormatterMB,
                        color: "#3B82F6", // Orange
                      },
                    ]}
                    slotProps={{
                      legend: {
                        direction: "row",
                        position: { vertical: "bottom", horizontal: "middle" },
                        padding: 0,
                      },
                    }}
                    sx={{
                      ".MuiChartsBar-label": {
                        fill: "#333", // Ensure text is visible
                        fontSize: "12px",
                        fontWeight: "bold",
                      },
                    }}
                    barLabel={(item, context) => {
                      if ((item.value ?? 0) > 0) {
                        return valueFormatterMB(item.value); // Format as M.B.
                      }
                      return null; // Hide label if value is zero or undefined
                    }}
                    {...chartSetting}
                  />
                </div>
              </Card>
            </Col>

            {/* Top 5 Activity */}
            <Col xs={24} lg={24} xl={12}>
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <div className="flex flex-wrap items-center justify-between">
                  <h3 className="text-[#00783F] text-lg font-semibold">
                    Top 5 Activity
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Select
                      className="mb-4 w-36"
                      value={selectedDealerTopActivity} // ใช้ state แยก
                      onChange={(value) => {
                        setSelectedDealerTopActivity(value); // อัปเดต state ของ Top 5 Activity
                        fetchTopActivityData(
                          selectedYear,
                          value,
                          selectedMonths
                        ); // เรียก API สำหรับ Top 5 Activity
                      }}
                      placeholder={loading ? "Loading..." : "Select Dealer"}
                      disabled={loading}
                    >
                      {dealer.map((dealer) => (
                        <Select.Option key={dealer.id} value={dealer.id}>
                          {dealer.name}
                        </Select.Option>
                      ))}
                    </Select>
                    <Select
                      className="w-36"
                      value={selectedMonthsTopActivity} // ใช้ state ที่แยกออกมา
                      onChange={(value) => {
                        setSelectedMonthsTopActivity(
                          value === "all" ? "" : value
                        ); // อัปเดต state สำหรับ Top 5 Activity
                        fetchTopActivityData(
                          selectedYear,
                          selectedDealer,
                          value === "all" ? "" : value
                        );
                      }}
                      placeholder={loading ? "Loading..." : "Select Month"}
                      disabled={loading}
                    >
                      {months.map((month) => (
                        <Select.Option key={month.id} value={month.id}>
                          {month.name}
                        </Select.Option>
                      ))}
                    </Select>
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
                        // getColor: (data) => data.color,
                      },
                      {
                        dataKey: "total_activity_list",
                        label: "Activity List",
                        // getColor: (data) => data.color,
                      },
                      {
                        dataKey: "total_activity_actual",
                        label: "Activity Actual",
                        // getColor: (data) => data.color,
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

            {/* Sale Dealer Plan */}
            <Col xs={24} lg={24} xl={12}>
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <div className="flex flex-wrap items-center justify-between">
                  <h3 className="text-[#00783F] text-lg font-semibold mb-3">
                    Sub Dealer Plan
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Select
                      className="mb-4 w-36"
                      value={selectedSubdealer}
                      onChange={handleSubdealerChangeSubDealerPlan}
                      placeholder={loading ? "Loading..." : "Select Sub Dealer"}
                      disabled={loading}
                    >
                      {subdealer.map((dealer) => (
                        <Select.Option
                          key={dealer.sub_dealer_id}
                          value={dealer.sub_dealer_id}
                        >
                          {dealer.sub_dealer_name}
                        </Select.Option>
                      ))}
                    </Select>

                    <Select
                      className="w-36 hidden"
                      value={selectedMonthsSubDealerPlan} // ใช้ state ที่แยกออกมา
                      onChange={(value) => {
                        setSelectedMonthsSubDealerPlan(
                          value === "all" ? "" : value
                        ); // อัปเดต state สำหรับ Sub Dealer Plan
                        fetchSubDealerPlanData(
                          selectedYear,
                          value === "all" ? "" : value,
                          selectedSubdealer
                        );
                      }}
                      placeholder={loading ? "Loading..." : "Select Month"}
                      disabled={loading}
                    >
                      {months.map((month) => (
                        <Select.Option key={month.id} value={month.id}>
                          {month.name}
                        </Select.Option>
                      ))}
                    </Select>
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
                        label: "Month",
                      },
                    ]}
                    yAxis={[
                      {
                        // label: "Value (THB)",
                        label: null,
                      },
                    ]}
                    series={[
                      {
                        dataKey: "plan",
                        label: "Plan",
                        valueFormatter: valueFormatterMB,
                        color: "#3B82F6", // Blue
                      },
                      {
                        dataKey: "rolling_forecast",
                        label: "Rolling Forecast",
                        valueFormatter: valueFormatterMB,
                        color: "#F59E0B", // Orange
                      },
                      {
                        dataKey: "actual",
                        label: "Actual",
                        valueFormatter: valueFormatterMB,
                        color: "#10B981", // Green
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

            {/* Sub Dealer by Dealer */}
            <Col xs={24} lg={24} xl={12}>
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <div className="flex flex-wrap items-center justify-between">
                  <h3 className="text-[#00783F] text-lg font-semibold mb-3">
                    Sub Dealer By Dealer
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Select
                      className="mb-4 w-36"
                      value={selectedSdByD} // ใช้ state ที่แยกออกมา
                      onChange={(value) => {
                        setSelectedSdByD(value); // อัปเดต state สำหรับ Sale By Crop
                        // fetchSaleCropData(
                        //   selectedYear,
                        //   value,
                        //   selectedMonthsSaleByCrop
                        // );
                      }}
                      placeholder={loading ? "Loading..." : "Select Dealer"}
                      disabled={loading}
                    >
                      {dealer.map((dealer) => (
                        <Select.Option key={dealer.id} value={dealer.id}>
                          {dealer.name}
                        </Select.Option>
                      ))}
                    </Select>
                    <Select
                      className="w-36"
                      value={selectedMonthSdByD} // ใช้ state ที่แยกออกมา
                      onChange={(value) => {
                        setSelectedMonthSdByD(value === "all" ? "" : value); // อัปเดต state สำหรับ Sale By Crop
                        // fetchSaleCropData(
                        //   selectedYear,
                        //   selectedDealer,
                        //   value === "all" ? "" : value
                        // );
                      }}
                      placeholder={loading ? "Loading..." : "Select Month"}
                      disabled={loading}
                    >
                      {months.map((month) => (
                        <Select.Option key={month.id} value={month.id}>
                          {month.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex justify-center items-center">
                  <PieChart
                    series={[
                      {
                        outerRadius: 150,
                        data: supdealerByDealerData,
                        colorField: "color",
                      },
                    ]}
                    slotProps={{ legend: true }}
                    height={400}
                  />
                </div>
              </Card>
            </Col>

            {/* Sale By Crop */}
            <Col xs={24} lg={24} xl={12}>
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <div className="flex flex-wrap items-center justify-between">
                  <h3 className="text-[#00783F] text-lg font-semibold mb-3">
                    Sale By Crop
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Select
                      className="mb-4 w-36"
                      value={selectedSaleByCrop} // ใช้ state ที่แยกออกมา
                      onChange={(value) => {
                        setSelectedSaleByCrop(value); // อัปเดต state สำหรับ Sale By Crop
                        fetchSaleCropData(
                          selectedYear,
                          value,
                          selectedMonthsSaleByCrop
                        );
                      }}
                      placeholder={loading ? "Loading..." : "Select Sale"}
                      disabled={loading}
                    >
                      {sales.map((sale) => (
                        <Select.Option key={sale.id} value={sale.id}>
                          {sale.name}
                        </Select.Option>
                      ))}
                    </Select>
                    <Select
                      className="w-36 hidden"
                      value={selectedMonthsSaleByCrop} // ใช้ state ที่แยกออกมา
                      onChange={(value) => {
                        setSelectedMonthsSaleByCrop(
                          value === "all" ? "" : value
                        ); // อัปเดต state สำหรับ Sale By Crop
                        fetchSaleCropData(
                          selectedYear,
                          selectedDealer,
                          value === "all" ? "" : value
                        );
                      }}
                      placeholder={loading ? "Loading..." : "Select Month"}
                      disabled={loading}
                    >
                      {months.map((month) => (
                        <Select.Option key={month.id} value={month.id}>
                          {month.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex justify-center items-center">
                  {/* Pie Chart */}
                  <div className="flex-grow flex justify-center items-center">
                    <PieChart
                      series={[
                        {
                          data: saleCropData.map((item) => ({
                            ...item,
                            tooltip: `${item.name} (${(
                              (item.value / totalSaleValue) *
                              100
                            ).toFixed(1)}%)<br>${item.value.toLocaleString()}`,
                          })),
                          innerRadius: 120,
                          outerRadius: 150,
                          colorField: "color",
                          labelField: "name",
                          label: { formatter: (item) => item.name }, // Ensure labels are formatted correctly
                        },
                      ]}
                      height={400}
                    >
                      {/* แสดงค่ารวมตรงกลาง Pie Chart */}
                      {/* <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ fontSize: "20px", fill: "#333" }}
                    >
                      {totalSaleValue.toLocaleString()}
                    </text> */}
                    </PieChart>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Activity Section */}
        <Col xs={24} lg={24} xl={6}>
          <BoxPrimary className="h-full">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h3 className="text-[#00783F] text-lg font-semibold">Activity</h3>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="mb-4 w-36"
                  value={selectedSaleActivity} // ใช้ state ที่แยกออกมา
                  onChange={(value) => {
                    setSelectedSaleActivity(value); // อัปเดต state สำหรับ Activity
                    fetchListActivityData(
                      selectedYear,
                      value,
                      selectedMonthsActivity
                    );
                  }}
                  placeholder={loading ? "Loading..." : "Select Sale"}
                  disabled={loading}
                >
                  {sales.map((sale) => (
                    <Select.Option key={sale.id} value={sale.id}>
                      {sale.name}
                    </Select.Option>
                  ))}
                </Select>
                <Select
                  className="w-36"
                  value={selectedMonthsActivity} // ใช้ state ที่แยกออกมา
                  onChange={(value) => {
                    setSelectedMonthsActivity(value === "all" ? "" : value); // อัปเดต state สำหรับ Activity
                    fetchListActivityData(
                      selectedYear,
                      selectedSale,
                      value === "all" ? "" : value
                    );
                  }}
                  placeholder={loading ? "Loading..." : "Select Month"}
                  disabled={loading}
                >
                  {months.map((month) => (
                    <Select.Option key={month.id} value={month.id}>
                      {month.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 font-semibold">Type</th>
                  <th className="text-left py-2 font-semibold">Plan</th>
                  <th className="text-left py-2 font-semibold">Value</th>
                  <th className="text-left py-2 font-semibold">Actual</th>
                  <th className="text-left py-2 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {listActivityData.map((item, index) => {
                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-2 flex gap-2">
                        <img
                          src={item.icon}
                          alt={item.type}
                          className="w-6 h-6"
                        />
                        <span>{item.type}</span>
                      </td>
                      <td className="text-center py-2 text-gray-700">
                        {item.plan.toLocaleString()}
                      </td>
                      <td className="text-center py-2 text-gray-700">10</td>
                      <td className="text-center py-2 text-gray-700">
                        {item.actual.toLocaleString()}
                      </td>
                      <td className="text-center py-2 text-gray-700">10</td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </BoxPrimary>
        </Col>
      </Row>
    </MainLayout>
  );
}
