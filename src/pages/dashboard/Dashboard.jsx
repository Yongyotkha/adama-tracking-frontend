import React, { useState } from "react";
import { Card, Row, Col, Select } from "antd";
import MainLayout from "../../layouts/MainLayout";
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { dataset, valueFormatter } from './dataset/dealer_plan';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import { PieChart } from "@mui/x-charts";
import BoxPrimary from "../../components/box_primary/BoxPrimary";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const chartSetting = {
    yAxis: [
      {
        label: 'rainfall (mm)',
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

  // Pie Chart Data
  const pieData = [
    { value: 20000, label: "Rice (25%)", color: "#8B5CF6", name: "Rice" },
    { value: 10000, label: "Fruits (12.5%)", color: "#E11D48", name: "Fruits" },
    { value: 10000, label: "Sugarcane (12.5%)", color: "#3B82F6", name: "Sugarcane" },
    { value: 10000, label: "Vegetable (12.5%)", color: "#10B981", name: "Vegetable" },
    { value: 10000, label: "Corn (12.5%)", color: "#F59E0B", name: "Corn" },
    { value: 10000, label: "Pineapple (12.5%)", color: "#7C3AED", name: "Pineapple" },
    { value: 10000, label: "Other (12.5%)", color: "#A78BFA", name: "Other" },
  ];

  const pieSize = {
    // width: 400,
    height: 400,
  };

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
        <Select className="mb-4" defaultValue="2024">
          <Select.Option value="2024">Year 2024</Select.Option>
        </Select>
      </div>
      {/* Row 1: Dealer, Sub Dealer, Expense, Order */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} lg={12} xxl={6}>
          <BoxPrimary className="h-full flex items-center justify-between">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-lg font-bold text-green-700">Dealer</h3>
                <div className="text-4xl font-bold">10</div>
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
                <h3 className="text-lg font-bold text-green-700">Sub Dealer</h3>
                <div className="text-4xl font-bold">10</div>
              </div>
              <div>
                <img src="/img/icons/sub-dealer.png" alt="" className="w-[4.5rem] h-[4.5rem]" />
              </div>
            </div>
          </BoxPrimary>
        </Col>
        <Col xs={24} sm={12} lg={12} xxl={6}>
          <BoxPrimary className="h-full">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-green-700">Expense</h3>
              <div className="flex space-x-2">
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
                <div className="text-md font-bold text-green-700">1,000,000</div>
                <div className="text-sm text-gray-500">Advance</div>
              </div>
              <div className="text-center py-2">
                <div className="text-md font-bold text-green-700">1,000,000</div>
                <div className="text-sm text-gray-500">Estimate</div>
              </div>
              <div className="text-center py-2">
                <div className="text-md font-bold text-green-700">1,000,000</div>
                <div className="text-sm text-gray-500">Actual</div>
              </div>
            </div>
          </BoxPrimary>
        </Col>
        <Col xs={24} sm={12} lg={12} xxl={6}>
          <BoxPrimary className="h-full">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-green-700">Order</h3>
              <div className="flex space-x-2">
                <Select className="w-36" defaultValue="All Sub Dealer">
                  <Select.Option value="All Sub Dealer">All Sub Dealer</Select.Option>
                </Select>
                <Select className="w-36" defaultValue="All Month">
                  <Select.Option value="All Month">All Month</Select.Option>
                </Select>
              </div>
            </div>
            <div className="text-4xl font-bold">30</div>
          </BoxPrimary>
        </Col>
      </Row>

      {/* Row 2: Charts and Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={24} xl={18}>
          <Row gutter={[16, 16]}>
            {/* Dealer Plan Chart */}
            <Col xs={24} lg={24} xl={12}>
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F] mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#00783F] text-lg font-semibold mb-3">Dealer Plan</h3>
                  <div className="flex space-x-2">
                    <Select className="mb-4" defaultValue="All Dealer">
                      <Select.Option value="All Dealer">All Dealer</Select.Option>
                    </Select>
                    <Select className="mb-4" defaultValue="All Dealer">
                      <Select.Option value="All Dealer">All Dealer</Select.Option>
                    </Select>
                  </div>
                </div>
                {/* Placeholder for Chart */}
                <div className="h-full rounded ">
                  <BarChart
                    dataset={dataset}
                    xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                    series={[
                      { dataKey: 'london', label: 'London', valueFormatter },
                      { dataKey: 'paris', label: 'Paris', valueFormatter },
                      { dataKey: 'newYork', label: 'New York', valueFormatter },
                      { dataKey: 'seoul', label: 'Seoul', valueFormatter },
                    ]}
                    {...chartSetting}
                  />
                </div>
              </Card>
            </Col>

            {/* Top 5 Activity */}
            <Col xs={24} lg={24} xl={12} className="h-full">
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F] mb-3">
                <h3 className="text-[#00783F] text-lg font-semibold mb-3">Top 5 Activity</h3>
                {/* Placeholder for Bar Chart */}
                <div className="h-full rounded">
                  {/* Top 5 Activity Bar Chart */}
                  <BarChart
                    xAxis={[{ scaleType: 'band', data: ['group A', 'group B', 'group C'] }]}
                    series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
                    height={309}
                  />
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* Sale Dealer Plan */}
            <Col xs={24} lg={24} xl={12}>
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F] mb-3">
                <h3 className="text-[#00783F] text-lg font-semibold mb-3">Sub Dealer Plan</h3>
                {/* Placeholder for Bar Horizon Chart */}
                <div className="h-full rounded">
                  <BarChart
                    dataset={dataset}
                    yAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                    series={[{ dataKey: 'seoul', label: 'Seoul rainfall', valueFormatter }]}
                    layout="horizontal"
                    {...chartSetting2}
                  />
                </div>
              </Card>
            </Col>
            {/* Sale By Crop */}
            <Col xs={24} lg={24} xl={12}>
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F] mb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#00783F] text-lg font-semibold mb-3">Sale By Crop</h3>
                  <div>
                    <Select className="mr-2" defaultValue="All Sales">
                      <Select.Option value="All Sales">All Sales</Select.Option>
                    </Select>
                    <Select defaultValue="All Month">
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
                          data: pieData,
                          innerRadius: 120,
                          outerRadius: 150,
                          colorField: "color",
                          labelField: "label",
                        },
                      ]}
                      {...pieSize}
                      // Optionally disable legend directly (if supported)
                      showLegend={false}
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
        <Col xs={24} md={24} xl={6}>
          <BoxPrimary>
            <h3 className="text-[#00783F] text-lg font-semibold mb-3">Activity</h3>
            <ul className="list-disc ml-6">
              <li>Demo Plot: 20,000,000</li>
              <li>Field Day: 20,000,000</li>
              <li>Visit: 10,000,000</li>
              {/* Add more activities as needed */}
            </ul>
          </BoxPrimary>
        </Col>
      </Row>
    </MainLayout>
  );
}
