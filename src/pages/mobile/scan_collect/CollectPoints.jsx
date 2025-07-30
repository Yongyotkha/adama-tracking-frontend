import React, { useState, useEffect } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import BackButton from "../../../components/mobile/button/BackButton";
import DynamicButton from "../../../components/button/DynamicButton";

export default function CollectPoints() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("in_progress");
  const [orderData, setOrderData] = useState([]);

  // tab กำหนดเองให้ตรงกับ UI ที่ออกแบบไว้
  const tabs = [
    { id: "in_progress", label: "สินค้ารอยืนยันรับ", color: "border-orange-500" },
    { id: "pre_receive", label: "รับสินค้าล่วงหน้า", color: "border-green-500" },
  ];

  // ✅ MOCK DATA
  const mockData = {
    in_progress: Array(5).fill({
      document_number: "202500000001",
      date: "31 ธ.ค. 67 16:16",
      amount: 39396.8,
      line_total: 5,
    }),
    pre_receive: [
      {
        shop_name: "ร้านยี่ปั๊ว",
        date: "4 ก.ค. 68 16:16",
        status: "รอดำเนินการ",
      },
    ],
  };

  useEffect(() => {
    setLoading(true);

    // เลียนแบบการเรียก API
    setTimeout(() => {
      setOrderData(mockData[activeTab] || []);
      setLoading(false);
    }, 300); // mock delay
  }, [activeTab]);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        <HeadSectionUser />
        <UserPointsSection />

        <DynamicButton
          text="ถ่ายรูปสินค้ากรณีได้รับสินค้าล่วงหน้า"
          iconSrc="/img/icons/camera.png"
          className="text-white px-4 py-3 rounded-[4px] bg-[#752157] w-full max-w-md mt-6 sarabun-font"
        />

        <SectionHeader title="รายการรับสินค้า" icon="/img/icons/bill.png" />

        {/* Tabs */}
        <div className="w-full max-w-md mt-4 flex space-x-3 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-semibold text-center sarabun-font ${
                activeTab === tab.id
                  ? "border-b-2 text-green-600 border-green-500"
                  : "text-gray-500"
              }`}
            >
              {tab.label}{" "}
              <span className="ml-1 text-pink-600">
                {mockData[tab.id]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="w-full max-w-md mt-4">
          <h5 className="sarabun-font text-gray-700">
            รายการทั้งหมด {orderData.length} รายการ
          </h5>
          <div className="mt-2 space-y-3">
            {orderData.length > 0 ? (
              orderData.map((order, index) => {
                if (activeTab === "in_progress") {
                  return (
                    <div
                      key={index}
                      className={`flex justify-between items-start p-4 bg-white rounded-lg shadow-md border-l-4 border-orange-500`}
                      onClick={() =>
                        navigate("/mobile/order-history/detail", {
                          state: {
                            document_number: order.document_number,
                          },
                        })
                      }
                    >
                      <div className="flex flex-col">
                        <p className="text-gray-500 sarabun-font text-sm">
                          {order.date}
                        </p>
                        <p className="text-gray-900 sarabun-font font-bold mt-1">
                          เลขที่ {order.document_number}
                        </p>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <p className="text-orange-600 sarabun-font text-sm font-semibold">
                          รอยืนยันรับ
                        </p>
                        <p className="text-gray-700 sarabun-font text-sm font-semibold mt-1">
                          รายการ {order.line_total} /{" "}
                          {new Intl.NumberFormat("th-TH").format(order.amount)}
                        </p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={index}
                      className={`p-4 bg-white rounded-lg shadow-md border-l-4 border-green-500`}
                    >
                      <p className="text-gray-500 sarabun-font text-sm">
                        {order.date}
                      </p>
                      <p className="text-gray-900 sarabun-font font-bold mt-1">
                        {order.shop_name}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex gap-2">
                          <button className="bg-green-600 text-white px-3 py-1 rounded-md text-sm">
                            ✎ แก้ไข
                          </button>
                          <button className="border border-gray-300 text-gray-600 px-3 py-1 rounded-md text-sm">
                            🗑 ลบ
                          </button>
                        </div>
                        <p className="text-orange-600 text-sm">
                          {order.status}
                        </p>
                      </div>
                    </div>
                  );
                }
              })
            ) : (
              <p className="text-center text-gray-500 mt-4">ไม่มีข้อมูล</p>
            )}
          </div>
        </div>

        <BackButton url="/mobile/main" />
      </div>
    </MobileLayout>
  );
}
