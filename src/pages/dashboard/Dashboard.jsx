import React, { useState } from "react";
import { Card, Row, Col, Select } from "antd";
import MainLayout from "../../layouts/MainLayout";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

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
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
            <h3 className="text-lg font-bold text-green-700">Dealer</h3>
            <div className="text-4xl font-bold">10</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
            <h3 className="text-lg font-bold text-green-700">Sub Dealer</h3>
            <div className="text-4xl font-bold">30</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
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
                <div className="text-2xl font-bold text-green-700">1,000,000</div>
                <div className="text-sm text-gray-500">Advance</div>
              </div>
              <div className="text-center py-2">
                <div className="text-2xl font-bold text-green-700">1,000,000</div>
                <div className="text-sm text-gray-500">Estimate</div>
              </div>
              <div className="text-center py-2">
                <div className="text-2xl font-bold text-green-700">1,000,000</div>
                <div className="text-sm text-gray-500">Actual</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
            <h3 className="text-lg font-bold text-green-700">Order</h3>
            <div className="text-4xl font-bold">30</div>
          </Card>
        </Col>
      </Row>


      {/* Row 2: Charts and Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={18}>
          <Row gutter={[16, 16]}>
            {/* Dealer Plan Chart */}
            <Col xs={24} lg={12}>
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <h3>Dealer Plan</h3>
                <Select className="mb-4" defaultValue="All Dealer">
                  <Select.Option value="All Dealer">All Dealer</Select.Option>
                </Select>
                {/* Placeholder for Chart */}
                <div className="h-48 bg-gray-200 rounded"></div>
              </Card>
            </Col>
            {/* Top 5 Activity */}
            <Col xs={24} lg={12}>
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <h3>Top 5 Activity</h3>
                {/* Placeholder for Bar Chart */}
                <div className="h-48 bg-gray-200 rounded"></div>
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            {/* Sale Dealer Plan */}
            <Col xs={24} lg={12}>
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <h3>Sub Dealer Plan</h3>
                {/* Placeholder for Pie Chart */}
                <div className="h-48 bg-gray-200 rounded"></div>
              </Card>
            </Col>
            {/* Sale By Crop */}
            <Col xs={24} lg={12}>
              <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
                <h3>Sale By Crop</h3>
                {/* Placeholder for Pie Chart */}
                <div className="h-48 bg-gray-200 rounded"></div>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Activity Section */}
        <Col xs={24} lg={6}>
          <Card className="bg-gray-100 shadow-md rounded-lg bg-white border-t-[10px] border-solid border-t-[#00783F]">
            <h3>Activity</h3>
            <ul className="list-disc ml-6">
              <li>Demo Plot: 20,000,000</li>
              <li>Field Day: 20,000,000</li>
              <li>Visit: 10,000,000</li>
              {/* Add more activities as needed */}
            </ul>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
}
