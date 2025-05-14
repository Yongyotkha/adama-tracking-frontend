import React, { useState, useEffect, useContext } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import BackButton from "../../../components/mobile/button/BackButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

export default function OrderHistory() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("in_progress");
  const [orderData, setOrderData] = useState([]);
  const { userInfo } = useContext(AuthContext);

  const tabs = [
    { id: "in_progress", label: "กำลังดำเนินการ", color: "border-orange-500" },
    { id: "completed", label: "เสร็จสิ้น", color: "border-green-500" },
    { id: "cancle", label: "ยกเลิก", color: "border-red-500" },
  ];

  // Mock Order Data
  // const orders = [
  //   { id: 1, status: "in_progress", date: "31 ธ.ค. 67 16:16", number: "20250000001", total: "฿10,000.00", items: 5 },
  //   { id: 2, status: "completed", date: "31 ธ.ค. 67 16:16", number: "20250000002", total: "฿8,000.00", items: 3 },
  //   { id: 3, status: "cancle", date: "31 ธ.ค. 67 16:16", number: "20250000003", total: "฿5,500.00", items: 2 },
  // ];

  // const filteredOrders = orders.filter((order) => order.status === activeTab);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathhistoryShop, {
          platform: "web",
          id: userInfo.id, // เปลี่ยนเป็น user id ที่เหมาะสม
          mode: activeTab,
        });

        if (response.status === 200) {
          const rawData = response.data.data[0] ?? [];
          console.log(rawData);
          setOrderData(rawData);
        } else {
          setOrderData([]);
        }
      } catch (error) {
        console.error("Error fetching order history:", error);
        setOrderData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [activeTab]);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header */}
        <HeadSectionUser />

        {/* Points Section */}
        <UserPointsSection />

        {/* Section Header */}
        <SectionHeader title="ประวัติการสั่งซื้อ" icon="/img/icons/bill.png" />

        {/* Tabs */}
        <div className="w-full max-w-md mt-4 flex space-x-3 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-semibold text-center sarabun-font ${activeTab === tab.id ? "border-b-2 text-green-600 border-green-500" : "text-gray-500"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="w-full max-w-md mt-4">
          <h5 className="sarabun-font text-gray-700">รายการทั้งหมด {orderData.length} รายการ</h5>
          <div className="mt-2 space-y-3">
            {/* {filteredOrders.map((order) => {
              const tabColor = tabs.find((tab) => tab.id === order.status)?.color || "border-gray-300";
              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/mobile/order-history/detail/${order.id}`)}
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
            })} */}

            {orderData.length > 0 ? (
              orderData.map((order, index) => {
                const tabColor = tabs.find((tab) => tab.id === activeTab)?.color || "border-gray-300";
                return (
                  <div
                    key={index}
                    onClick={() =>
                      navigate("/mobile/order-history/detail", {
                        state: {
                          document_number: order.document_number,
                        },
                      })
                    }
                    className={`flex justify-between items-start p-4 bg-white rounded-lg shadow-md border-l-4 ${tabColor} cursor-pointer`}
                  >
                    {/* Left side: Date + Document number */}
                    <div className="flex flex-col">
                      <p className="text-gray-500 sarabun-font text-sm">{order.date}</p>
                      <p className="text-gray-900 sarabun-font font-bold mt-1">
                        เลขที่ {order.document_number}
                      </p>
                    </div>

                    {/* Right side: Price + Point + Quantity */}
                    <div className="flex flex-col items-end text-right">
                      <p className="text-green-700 sarabun-font font-bold">
                        ฿{new Intl.NumberFormat("th-TH").format(order.amount)}
                      </p>
                      <p className="text-green-500 sarabun-font text-sm font-semibold mt-1">
                        +{order.line_total} คะแนน
                      </p>
                      <p className="text-gray-700 sarabun-font text-sm font-semibold mt-1">
                        รายการ {order.line_total}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 mt-4">ไม่มีข้อมูล</p>
            )}

          </div>
        </div>

        {/* Back Button */}
        <BackButton url="/mobile/main" />
      </div>
    </MobileLayout>
  );
}
