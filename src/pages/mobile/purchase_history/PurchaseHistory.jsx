import React, { useState } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import BackButton from "../../../components/mobile/button/BackButton";

export default function PurchaseHistory() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("processing");

  // User Data
  const userData = {
    name: "คุณ Krairoek Ruangkol",
    memberId: "123456",
    profileImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsynwv-5qtogtOwJbIjaPFJUmHpzhxgqIAug&s",
  };

  // Points Data
  const pointsData = {
    currentPoints: 100,
    expiringPoints: 15,
    expiryDate: "31 ธ.ค. 67",
  };

  const tabs = [
    { id: "processing", label: "กำลังดำเนินการ", color: "border-orange-500" },
    { id: "completed", label: "เสร็จสิ้น", color: "border-green-500" },
    { id: "canceled", label: "ยกเลิก", color: "border-red-500" },
  ];

  // Mock Order Data
  const orders = [
    { id: 1, status: "processing", date: "31 ธ.ค. 67 16:16", number: "20250000001", total: "฿10,000.00", items: 5 },
    { id: 2, status: "completed", date: "31 ธ.ค. 67 16:16", number: "20250000002", total: "฿8,000.00", items: 3 },
    { id: 3, status: "canceled", date: "31 ธ.ค. 67 16:16", number: "20250000003", total: "฿5,500.00", items: 2 },
  ];

  const filteredOrders = orders.filter((order) => order.status === activeTab);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header */}
        <HeadSectionUser user={userData} />

        {/* Points Section */}
        <UserPointsSection pointsData={pointsData} />

        {/* Section Header */}
        <SectionHeader title="รายละเอียดการสั่งซื้อ" icon="/img/icons/trophy.png" />

        {/* Tabs */}
        <div className="w-full max-w-md mt-4 flex space-x-3 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-semibold text-center sarabun-font ${
                activeTab === tab.id ? "border-b-2 text-green-600 border-green-500" : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="w-full max-w-md mt-4 px-4">
          <h5 className="sarabun-font text-gray-700">รายการทั้งหมด {filteredOrders.length} รายการ</h5>
          <div className="mt-2 space-y-3">
            {filteredOrders.map((order) => {
              const tabColor = tabs.find((tab) => tab.id === order.status)?.color || "border-gray-300";
              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/mobile/history-purchase/detail/${order.id}`)}
                  className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-md border-l-4 ${tabColor} cursor-pointer`}
                >
                  <div>
                    <p className="text-gray-500 sarabun-font text-sm">{order.date}</p>
                    <p className="text-gray-900 sarabun-font font-bold">เลขที่ {order.number}</p>
                    <p className="text-gray-500 sarabun-font text-sm">รายการ {order.items}</p>
                  </div>
                  <p className="text-green-700 sarabun-font font-bold">{order.total}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back Button */}
        <BackButton url="/mobile/main" />
      </div>
    </MobileLayout>
  );
}
