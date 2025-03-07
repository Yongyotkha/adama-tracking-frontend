import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import BackButton from "../../../components/mobile/button/BackButton";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";

// Mock Data for Orders
const orders = [
  {
    id: 1,
    date: "31 ธ.ค. 67 16:16",
    number: "20250000001",
    status: "processing",
    statusLabel: "กำลังดำเนินการ",
    statusColor: "text-orange-500",
    products: [
      { qty: 2, sku: "3027200112", name: "Bumper P 490 EC", price: 22509.20 },
      { qty: 1, sku: "30371013300", name: "Apopo", price: 9281.20 },
      { qty: 2, sku: "308420021510", name: "Hizamaru", price: 7606.40 },
    ],
  },
];

export default function RedeemHistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Find the order by ID
  const order = orders.find((o) => o.id === parseInt(id));

  if (!order) {
    return (
      <MobileLayout loading={loading}>
        <div className="flex flex-col items-center w-full h-full">
          <SectionHeader title="ไม่พบคำสั่งซื้อ" icon="/img/icons/trophy.png" />
          <p className="text-gray-500 sarabun-font mt-4">ขออภัย, ไม่พบคำสั่งซื้อนี้</p>
          <BackButton url="/mobile/history-purchase" />
        </div>
      </MobileLayout>
    );
  }

  // Calculate totals
  const totalItems = order.products.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = order.products.reduce((sum, item) => sum + item.price, 0).toFixed(2);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <HeadSectionUser
          user={{
            name: "คุณ Krairoek Ruangkol",
            memberId: "123456",
            profileImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsynwv-5qtogtOwJbIjaPFJUmHpzhxgqIAug&s",
          }}
        />

        {/* Points Section */}
        <UserPointsSection
          pointsData={{
            currentPoints: 100,
            expiringPoints: 15,
            expiryDate: "31 ธ.ค. 67",
          }}
        />

        {/* Order Detail Section */}
        <SectionHeader title="ประวัติการแลกคะแนน" icon="/img/icons/trophy.png" />

        {/* Order Summary */}
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4 mt-4">
          <div className="flex justify-between">
            <p className="text-gray-500 sarabun-font">{order.date}</p>
            <p className={`sarabun-font font-semibold ${order.statusColor}`}>{order.statusLabel}</p>
          </div>

          <div className="flex justify-between mt-1">
            <p className="sarabun-font text-gray-600">เลขที่</p>
            <p className="sarabun-font text-gray-900 font-bold">{order.number}</p>
          </div>

          {/* Product Table */}
          <div className="mt-4">
            <h3 className="sarabun-font text-lg font-semibold text-gray-900">รายการสินค้า</h3>
            <div className="border-t mt-2"></div>

            <table className="w-full text-left mt-2 sarabun-font text-sm">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-2">QTY</th>
                  <th className="py-2">SKU</th>
                  <th className="py-2">Product Name</th>
                  <th className="py-2 text-right">Total (THB)</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((product, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{product.qty}</td>
                    <td className="py-2">{product.sku}</td>
                    <td className="py-2">{product.name}</td>
                    <td className="py-2 text-right">{product.price.toLocaleString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary Footer */}
          <div className="mt-4 border-t pt-3">
            <div className="flex justify-between">
              <p className="sarabun-font text-gray-600">จำนวนรายการ</p>
              <p className="sarabun-font font-bold">{totalItems}</p>
            </div>
            <div className="flex justify-between mt-1">
              <p className="sarabun-font text-gray-600">ยอดรวมสุทธิ (บาท)</p>
              <p className="sarabun-font font-bold text-green-700">{totalPrice}</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <BackButton url="/mobile/history-purchase" />
      </div>
    </MobileLayout>
  );
}
