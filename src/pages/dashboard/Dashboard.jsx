import React, { useState, useEffect  } from "react";
import { Card, Row, Col, Select } from "antd";
import MainLayout from "../../layouts/MainLayout";
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import { PieChart } from "@mui/x-charts";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Hidden } from "@mui/material";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";

export default function Dashboard() {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState({});

  const [months, setMonths] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState(null);
  const [subdealer, setSubdealer] = useState([]);
  const [selectedSubdealer, setSelectedSubdealer] = useState(null);
  const [dashboardData, setDashboardData] = useState({ dealer_count: 0, sub_dealer_count: 0 });
  const [dashboardDataExpense, setDashboardDataExpense] = useState({total_expense_actual_sale: 0, total_expense_actual_exp: 0, total_expense_advance:0 });
  const [dashboardDataOrder, setDashboardDataOrder] = useState({ total_order: 0, total_order_amonth: 0 });
  const [dealerPlanData, setDealerPlanData] = useState([]);
  const [topActivityData, setTopActivityData] = useState([]);
  const [listActivityData, setListActivityData] = useState([]);
  const [subDealerPlanData, setSubDealerPlanData] = useState([]);
  const [saleCropData, setSaleCropData] = useState([]);
  const [totalSaleValue, setTotalSaleValue] = useState(0); // เก็บค่ารวมทั้งหมด

  const [loading, setLoading] = useState(false);
  const chartSetting = {
    yAxis: [
      {
        label: 'Million',
      },
    ],
    // width: 500,
    height: 300,
    sx: {
      [`.${axisClasses.left} .${axisClasses.label}`]: {
        transform: 'translate(-10px, 0)',
      },
    },
  };

  const chartSetting2 = {
    xAxis: [
      {
        label: 'rainfall (mm)',
      },
    ],
    // width: 500,
    height: 400,
  };

  const dataset = [
    {
      plan: 92,
      actual: 73,
      month: "Jan",
    },
    {
      plan: 92,
      actual: 73,
      month: "Feb",
    },
    {
      plan: 92,
      actual: 73,
      month: "Mar",
    },
    {
      plan: 92,
      actual: 73,
      month: "Apr",
    },
    {
      plan: 92,
      actual: 99,
      month: "May",
    },
    {
      plan: 103,
      actual: 144,
      month: "June",
    },
    {
      plan: 105,
      actual: 319,
      month: "July",
    },
    {
      plan: 106,
      actual: 249,
      month: "Aug",
    },
    {
      plan: 95,
      actual: 131,
      month: "Sept",
    },
    {
      plan: 97,
      actual: 55,
      month: "Oct",
    },
    {
      plan: 76,
      actual: 48,
      month: "Nov",
    },
    {
      plan: 103,
      actual: 25,
      month: "Dec",
    },
  ];

  const dataset2 = [
    {
      plan: 92,
      actual: 73,
      month: "Apopo 20%SE",
    },
    {
      plan: 92,
      actual: 73,
      month: "Atranex 90WG",
    },
    {
      plan: 92,
      actual: 73,
      month: "Baloric 320EC",
    },
    {
      plan: 92,
      actual: 73,
      month: "Bla-S",
    },
    {
      plan: 92,
      actual: 99,
      month: "Bumper P",
    },
    {
      plan: 103,
      actual: 144,
      month: "Custodia",
    },
    {
      plan: 105,
      actual: 319,
      month: "Fiesta",
    },
    {
      plan: 106,
      actual: 249,
      month: "Fiesta",
    },
    {
      plan: 95,
      actual: 131,
      month: "Formass 480SL",
    },
    {
      plan: 97,
      actual: 55,
      month: "Hamper 300SC",
    },
    {
      plan: 76,
      actual: 48,
      month: "Hexaron",
    },
  ];

  function valueFormatter(value) {
    return `${value} Million`;
  }

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
    fetchDashboardDataExpense(value)
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

  // เช็คค่าทีเลือก Expense mount
  const handleMonthChangeExpense = (value) => {
    setSelectedMonths(value === "all" ? "" : value); // ถ้าเลือก "All Month" ให้ส่งค่าเปล่า
    fetchDashboardDataExpense(selectedYear, value === "all" ? "" : value, selectedSubdealer); // ส่งค่า Month ที่เลือก
  };
  

  // เลือก subdealer
  const fetchSubdealer = async () => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathMasterSubDealer);
      if (response.status === 200) {
        const subDealerData = response.data || [];
        setSubdealer([{ sub_dealer_id: "all", sub_dealer_name: "All Sub Dealer" }, ...subDealerData]);
        setSelectedSubdealer("all"); // ตั้งค่า default เป็น "All Sub Dealer"

      }
    } catch (error) {
      console.error("Error fetching subdealers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubdealerChangeExpense = (value) => {
    setSelectedSubdealer(value === "all" ? "" : value);
    fetchDashboardDataExpense(selectedYear, selectedMonths, value === "all" ? "" : value); // ส่งค่า Sub Dealer ที่เลือก
  };

  // ฟังก์ชันสำหรับดึงข้อมูล Sub Dealer
  const fetchDashboardData = async (year) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathDashBordCustomer, { year_code: year });
      if (response.status === 200) {
        const data = response.data || {};
        setDashboardData({
          dealer_count: data["dealer_count "] || 0,
          sub_dealer_count:  data["sub_dealer_count "] || 0,
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
  const fetchDashboardDataExpense = async (year = new Date().getFullYear(), month = selectedMonths, subDealerId = selectedSubdealer ) => {
    setLoading(true);
    try {
      const payload = {
        year_code: year,
        sub_dealer_id: subDealerId === "all" ? "" : subDealerId,
        month_id: month === "all" ? "" : month,
      };

      const response = await useServiceAPI.get(paths.pathDashBordExpense,payload);
      if (response.status === 200) {
        const data = response.data || {};
        setDashboardDataExpense({
          total_expense_advance: data["total_expense_advance "] || 0,
          total_expense_actual_exp:  data["total_expense_actual_exp "] || 0,
          total_expense_actual_sale:  data["total_expense_actual_sale "] || 0,
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

      const response = await useServiceAPI.get(paths.pathDashBordOrder, payload);
      if (response.status === 200) {
        const data = response.data || {};
        setDashboardDataOrder({
          total_order: data["total_order "] || 0,
          total_order_amonth:  data["total_order_amonth "] || 0,
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

  const handleSubdealerChangeOrder = (value) => {
    setSelectedSubdealer(value === "all" ? "" : value);
    fetchDashboardDataOrder(selectedYear, selectedMonths, value === "all" ? "" : value);
  };
  
  const handleMonthChangeOrder = (value) => {
    setSelectedMonths(value === "all" ? "" : value);
    fetchDashboardDataOrder(selectedYear, value === "all" ? "" : value, selectedSubdealer);
  };

  

  // ฟังก์ชันสำหรับดึงข้อมูล Dealer Plan
  const fetchDealerPlanData = async (year = new Date().getFullYear()) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathDashBordPlan,{ year_code: year });
      if (response.status === 200 && response.data) {
        const data = response.data.map((item) => ({
          month: item.name,
          plan: item.work_plan_value,
          actual: item.work_actual_value,
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
  const fetchTopActivityData = async (year = new Date().getFullYear()) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathDashBordTopActivity,{ year_code: year });
      if (response.status === 200 && response.data) {
        const data = response.data.map((item) => ({
          activity: item.activity_type_name,
          value: parseInt(item.total_activity_count, 10),
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


  // ฟังก์ชันสำหรับดึงข้อมูล Activity
  const fetchListActivityData = async (year = new Date().getFullYear()) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathDashBordListActivity,{ year_code: year });
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

      const response = await useServiceAPI.get(paths.pathDashBordSubDealerList,payload);
      if (response.status === 200 && response.data) {
        const data = response.data.map((item) => ({
          month: item.product_name, // ใช้ product_name แทน month
          plan: item.work_plan_value,
          actual: item.work_actual_value,
        }));
        setSubDealerPlanData(data); // อัปเดต State
      } else {
        console.error("Failed to fetch Sub Dealer Plan data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching Sub Dealer Plan data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubdealerChangeSubDealerPlan = (value) => {
    setSelectedSubdealer(value === "all" ? "" : value);
    fetchSubDealerPlanData(selectedYear, selectedMonths, value === "all" ? "" : value);
  };
  
  const handleMonthChangeSubDealerPlan = (value) => {
    setSelectedMonths(value === "all" ? "" : value);
    fetchSubDealerPlanData(selectedYear, value === "all" ? "" : value, selectedSubdealer);
  };

  

  // ฟังก์ชันสำหรับดึงข้อมูล Sale By Crop
  const fetchSaleCropData = async (year = new Date().getFullYear()) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathDashBordSaleCrop,{ year_code: year });
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
      {/* Row 1: Dealer, Sub Dealer, Expense, Order */}
      <Row gutter={[16, 16]} className="mb-4">

        <Col xs={24} sm={12} lg={12} xxl={6}>
          <BoxPrimary className="h-full flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-lg font-bold text-[#00783F]">Dealer</h3>
                <div className="text-4xl font-bold text-[#00783F]">
                    {dashboardData.dealer_count}
                </div>
              </div>
              <div>
                <img src="/img/icons/dealer.png" alt="" className="w-[4.5rem] h-[4.5rem]" />
              </div>
            </div>
          </BoxPrimary>
        </Col>
        
        <Col xs={24} sm={12} lg={12} xxl={6}>
          <BoxPrimary className="h-full flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-lg font-bold text-[#00783F]">Sub Dealer</h3>
                <div className="text-4xl font-bold text-[#00783F]">
                    {dashboardData.sub_dealer_count}
                </div>
              </div>
              <div>
                <img src="/img/icons/sub-dealer.png" alt="" className="w-[4.5rem] h-[4.5rem]" />
              </div>
            </div>
          </BoxPrimary>
        </Col>
        <Col xs={24} sm={12} lg={12} xxl={6}>
          <BoxPrimary className="h-full">
            <div className="flex flex-wrap justify-between items-center">
              <h3 className="text-lg font-bold text-[#00783F]">Expense</h3>
              <div className="flex flex-wrap gap-2">
                <Select
                  className="w-36"
                  value={selectedSubdealer }
                  onChange={handleSubdealerChangeExpense}
                  placeholder={loading ? "Loading..." : "Select sub dealer"}
                  disabled={loading}
                >
                  {subdealer.map((sudealer) => (
                    <Select.Option key={sudealer.sub_dealer_id} value={sudealer.sub_dealer_id}>
                      {`${sudealer.sub_dealer_name}`}
                    </Select.Option>
                  ))}
                </Select>

                <Select
                  className="w-36"
                  value={selectedMonths}
                  onChange={handleMonthChangeExpense} // เรียกใช้ฟังก์ชันจัดการที่อัปเดต
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
              <div className="text-center py-2">
                <div className="text-md font-bold text-[#00783F]">  {dashboardDataExpense.total_expense_advance} </div>
                <div className="text-sm text-gray-500">Advance</div>
              </div>
              <div className="text-center py-2">
                <div className="text-md font-bold text-[#00783F]">  {dashboardDataExpense.total_expense_actual_exp} </div>
                <div className="text-sm text-gray-500">Estimate</div>
              </div>
              <div className="text-center py-2">
                <div className="text-md font-bold text-[#00783F]">  {dashboardDataExpense.total_expense_actual_sale} </div>
                <div className="text-sm text-gray-500">Actual</div>
              </div>
            </div>
          </BoxPrimary>
        </Col>
        <Col xs={24} sm={12} lg={12} xxl={6}>
          <BoxPrimary className="h-full items-center flex flex-col">
            <div className="flex flex-wrap justify-between items-center w-full">
              <h3 className="text-lg font-bold text-[#00783F]">Order</h3>
              <div className="flex flex-wrap gap-2">
              <Select
                className="w-36"
                value={selectedSubdealer}
                onChange={handleSubdealerChangeOrder}
                placeholder={loading ? "Loading..." : "Select Sub Dealer"}
                disabled={loading}
              >
                {subdealer.map((dealer) => (
                  <Select.Option key={dealer.sub_dealer_id} value={dealer.sub_dealer_id}>
                    {dealer.sub_dealer_name}
                  </Select.Option>
                ))}
              </Select>
              <Select
                className="w-36"
                value={selectedMonths}
                onChange={handleMonthChangeOrder}
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
                <div className="text-md font-bold text-[#00783F]"> {dashboardDataOrder.total_order} </div>
                <div className="text-sm text-gray-500">Order</div>
              </div>
              <div className="text-center p-2">
                <div className="text-md font-bold text-[#00783F]"> {dashboardDataOrder.total_order_amonth} </div>
                <div className="text-sm text-gray-500">Estimate</div>
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
            <Col xs={24} lg={24} xl={12}>
            <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <div className="flex flex-wrap items-center justify-between">
                  <h3 className="text-[#00783F] text-lg font-semibold mb-3">Dealer Plan</h3>
                  <div className="flex flex-wrap gap-2">
                    <Select className="mb-4" defaultValue="All Dealer">
                      <Select.Option value="All Dealer">All Dealer</Select.Option>
                    </Select>
                    <Select className="mb-4" defaultValue="All Month">
                      <Select.Option value="All Month">All Month</Select.Option>
                    </Select>
                  </div>
                </div>
                {/* แสดง Bar Chart ด้วยข้อมูลจาก Dealer Plan */}
                <div className="h-full rounded">
                  <BarChart
                    dataset={dealerPlanData}
                    xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                    series={[
                      { dataKey: 'plan', label: 'Plan', valueFormatter },
                      { dataKey: 'actual', label: 'Actual', valueFormatter },
                    ]}
                    slotProps={{
                      legend: {
                        direction: 'row',
                        position: { vertical: 'bottom', horizontal: 'middle' },
                        padding: 0,
                      },
                    }}
                    {...chartSetting}
                  />
                </div>
              </Card>
            </Col>

            {/* Top 5 Activity */}
            <Col xs={24} lg={24} xl={12}>
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <div className="flex flex-wrap items-center justify-between mb-3">
                  <h3 className="text-[#00783F] text-lg font-semibold">Top 5 Activity</h3>
                  <div className="flex flex-wrap gap-2">
                    <Select defaultValue="All Dealer" className="w-40">
                      <Select.Option value="All Dealer">All Dealer</Select.Option>
                    </Select>
                    <Select defaultValue="All Month" className="w-40">
                      <Select.Option value="All Month">All Month</Select.Option>
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
                        dataKey: "value",
                        label: "Activity Count",
                        color: "#8BC34A",
                      },
                    ]}
                    yAxis={[
                      {
                        label: "Count",
                      },
                    ]}
                    height={304}
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
          </Row>

          <Row gutter={[16, 16]}>

            {/* Sale Dealer Plan */}
            <Col xs={24} lg={24} xl={12}>
            <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
              <div className="flex flex-wrap items-center justify-between">
                <h3 className="text-[#00783F] text-lg font-semibold mb-3">Sub Dealer Plan</h3>
                <div className="flex flex-wrap gap-2">
                <Select
                  className="mb-4 w-36"
                  value={selectedSubdealer}
                  onChange={handleSubdealerChangeSubDealerPlan}
                  placeholder={loading ? "Loading..." : "Select Sub Dealer"}
                  disabled={loading}
                >
                  {subdealer.map((dealer) => (
                    <Select.Option key={dealer.sub_dealer_id} value={dealer.sub_dealer_id}>
                      {dealer.sub_dealer_name}
                    </Select.Option>
                  ))}
                </Select>

                <Select
                  className="mb-4 w-36"
                  value={selectedMonths}
                  onChange={handleMonthChangeSubDealerPlan}
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
                  yAxis={[
                    {
                      scaleType: "band",
                      dataKey: "month",
                      label: "Product",
                    },
                  ]}
                  xAxis={[
                    {
                      label: "Value",
                    },
                  ]}
                  series={[
                    {
                      dataKey: "plan",
                      label: "Plan",
                      color: "#3B82F6", // Blue for Plan
                      stack: "overlap", // Allows stacking
                    },
                    {
                      dataKey: "actual",
                      label: "Actual",
                      color: "#10B981", // Green for Actual
                      stack: "overlap", // Allows stacking
                    },
                  ]}
                  layout="horizontal"
                  height={400}
                  slotProps={{
                    legend: {
                      direction: "row",
                      position: { vertical: "top", horizontal: "right" },
                      padding: 0,
                    },
                  }}
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

            {/* Sale By Crop */}
            <Col xs={24} lg={24} xl={12}>
            <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
              <div className="flex flex-wrap items-center justify-between">
                <h3 className="text-[#00783F] text-lg font-semibold mb-3">Sale By Crop</h3>
                <div className="flex flex-wrap gap-2">
                  <Select className="mb-4" defaultValue="All Sales">
                    <Select.Option value="All Sales">All Sales</Select.Option>
                  </Select>
                  <Select className="mb-4" defaultValue="All Month">
                    <Select.Option value="All Month">All Month</Select.Option>
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
                          tooltip: `${item.name} (${((item.value / totalSaleValue) * 100).toFixed(1)}%)<br>${item.value.toLocaleString()}`,
                        })),
                        innerRadius: 120,
                        outerRadius: 150,
                        colorField: "color",
                        labelField: "name", // Legend shows only names
                        label: { formatter: (item) => item.name }, // Ensure labels are formatted correctly
                      },
                    ]}
                    height={400}
                  >
                    {/* แสดงค่ารวมตรงกลาง Pie Chart */}
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ fontSize: "20px", fill: "#333" }}
                    >
                      {totalSaleValue.toLocaleString()}
                    </text>
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
              <Select className="mb-4" defaultValue="All Sales">
                <Select.Option value="All Sales">All Sales</Select.Option>
              </Select>
              <Select className="mb-4" defaultValue="All Month">
                <Select.Option value="All Month">All Month</Select.Option>
              </Select>
            </div>
          </div>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 font-semibold">Type</th>
                <th className="text-left py-2 font-semibold">Plan</th>
                <th className="text-left py-2 font-semibold">Actual</th>
              </tr>
            </thead>
            <tbody>
              {listActivityData.map((item, index) => (
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
                  <td className="py-2 text-gray-700">
                    {item.plan.toLocaleString()}
                  </td>
                  <td className="py-2 text-gray-700">
                    {item.actual.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </BoxPrimary>
        </Col>



      </Row>
    </MainLayout>
  );
}
