import React, { useState } from "react";
import { Card, Row, Col, Select } from "antd";
import MainLayout from "../../layouts/MainLayout";
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import { PieChart } from "@mui/x-charts";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Hidden } from "@mui/material";

export default function Dashboard() {
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


  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Dashboard</div>
        <Select defaultValue="2024">
          <Select.Option value="2024">Year 2024</Select.Option>
        </Select>
      </div>
      {/* Row 1: Dealer, Sub Dealer, Expense, Order */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} lg={12} xxl={6}>
          <BoxPrimary className="h-full flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-lg font-bold text-[#00783F]">Dealer</h3>
                <div className="text-4xl font-bold text-[#00783F]">10</div>
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
                <div className="text-4xl font-bold text-[#00783F]">10</div>
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
                <Select className="w-36" defaultValue="All Sub Dealer">
                  <Select.Option value="All Sub Dealer">All Sub Dealer</Select.Option>
                </Select>
                <Select className="w-36" defaultValue="All Month">
                  <Select.Option value="All Month">All Month</Select.Option>
                </Select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-300">
              <div className="text-center py-2">
                <div className="text-md font-bold text-[#00783F]">1,000,000</div>
                <div className="text-sm text-gray-500">Advance</div>
              </div>
              <div className="text-center py-2">
                <div className="text-md font-bold text-[#00783F]">1,000,000</div>
                <div className="text-sm text-gray-500">Estimate</div>
              </div>
              <div className="text-center py-2">
                <div className="text-md font-bold text-[#00783F]">1,000,000</div>
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
                <Select className="w-36" defaultValue="All Sub Dealer">
                  <Select.Option value="All Sub Dealer">All Sub Dealer</Select.Option>
                </Select>
                <Select className="w-36" defaultValue="All Month">
                  <Select.Option value="All Month">All Month</Select.Option>
                </Select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-300 w-full">
              <div className="text-center p-2">
                <div className="text-md font-bold text-[#00783F]">1,000,000</div>
                <div className="text-sm text-gray-500">Order</div>
              </div>
              <div className="text-center p-2">
                <div className="text-md font-bold text-[#00783F]">1,000,000</div>
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
                {/* Placeholder for Chart */}
                <div className="h-full rounded ">
                  <BarChart
                    dataset={dataset}
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
                  <BarChart
                    dataset={[
                      { activity: "Demo Plot", value: 90 },
                      { activity: "ADAMA Day", value: 80 },
                      { activity: "Field Day", value: 70 },
                      { activity: "Visit", value: 50 },
                      { activity: "Knock Door", value: 30 },
                    ]}
                    xAxis={[
                      {
                        dataKey: "activity",
                        scaleType: "band", // Set the type to 'band'
                        label: "Activity",
                      },
                    ]}
                    series={[
                      {
                        dataKey: "value",
                        label: "Million",
                        color: "#8BC34A",
                      },
                    ]}
                    yAxis={[
                      {
                        label: "Million",
                      },
                    ]}
                    height={304}
                    slotProps={{ legend: { hidden: true } }} // Hides the legend
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
                    <Select className="mb-4" defaultValue="All Sub Dealer">
                      <Select.Option value="All Sub Dealer">All Sub Dealer</Select.Option>
                    </Select>
                    <Select className="mb-4" defaultValue="All Month">
                      <Select.Option value="All Month">All Month</Select.Option>
                    </Select>
                  </div>
                </div>
                {/* Overlapping Horizontal Bar Chart */}
                <div className="h-full rounded">
                  <BarChart
                    dataset={[
                      { month: "Apopo 20%SE", plan: 92, actual: 73 },
                      { month: "Atranex 90WG", plan: 92, actual: 73 },
                      { month: "Baloric 320EC", plan: 92, actual: 73 },
                      { month: "Bla-S", plan: 92, actual: 73 },
                      { month: "Bumper P", plan: 92, actual: 99 },
                      { month: "Custodia", plan: 103, actual: 144 },
                      { month: "Fiesta", plan: 105, actual: 319 },
                      { month: "Formass 480SL", plan: 95, actual: 131 },
                      { month: "Hamper 300SC", plan: 97, actual: 55 },
                      { month: "Hexaron", plan: 76, actual: 48 },
                    ]}
                    yAxis={[
                      {
                        scaleType: "band",
                        dataKey: "month",
                        label: "Month",
                      },
                    ]}
                    xAxis={[
                      {
                        label: "Million",
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
                          data: pieData.map((item) => ({
                            ...item,
                            tooltip: `${item.name} (${((item.value / totalValue) * 100).toFixed(1)}%)<br>${item.value.toLocaleString()}`,
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
                      <PieCenterLabel>{totalValue.toLocaleString()}</PieCenterLabel>
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
                {[
                  { type: "Demo Plot", plan: 10000000, actual: 20000000, icon: "up" },
                  { type: "Field Day", plan: 10000000, actual: 20000000, icon: "up" },
                  { type: "Knock Door", plan: 10000000, actual: 5000000, icon: "down" },
                  { type: "Other", plan: 10000000, actual: 7000000, icon: "down" },
                  { type: "Visit", plan: 10000000, actual: 20000000, icon: "up" },
                ].map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-2 flex gap-2">
                      <img
                        src={`/img/icons/${item.type.toLowerCase().replace(" ", "-")}.png`}
                        alt=""
                        className="w-6 h-6"
                      />
                      <span>{item.type}</span>
                    </td>
                    <td className="py-2 text-gray-700">
                      {item.plan.toLocaleString()}
                    </td>
                    <td className="py-2 flex gap-1">
                      <img
                        src={`/img/icons/${item.icon}.png`}
                        alt={item.icon}
                        className="w-4 h-4"
                      />
                      <span
                        className={`${item.icon === "up" ? "text-green-500" : "text-[#752157]"
                          } font-semibold`}
                      >
                        {item.actual.toLocaleString()}
                      </span>
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
