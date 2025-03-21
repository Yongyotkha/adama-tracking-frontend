import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import BackButton from "../../../components/mobile/button/BackButton";

// Sample Reward Data (Mock API Simulation)
const rewards = [
  {
    id: 1,
    type: "giftCard",
    title: "Gift Card มูลค่า 1,000 บาท",
    points: 30,
    image: "/img/gift-card.png",
    description: "ใช้ 30 คะแนน แลก Gift Card มูลค่า 1,000 บาท",
    conditions: `
      <ul class="list-disc list-inside">
        <li>บัตรนี้ใช้ชำระค่าสินค้าภายในร้านค้าที่ร่วมรายการ</li>
        <li>มูลค่าคงเหลือในบัตรจะระบุในใบเสร็จที่ร้านค้าที่ร่วมรายการ</li>
        <li>บัตรนี้ไม่สามารถแลกเปลี่ยนหรือทอนเป็นเงินสดได้</li>
        <li>บริษัทฯ ขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</li>
      </ul>
    `,
    productDetails: `
      <p><strong>ชื่อสินค้า:</strong> Gift Card 1,000 THB</p>
      <p><strong>ประเภท:</strong> บัตรของขวัญ</p>
      <p><strong>ใช้ได้ที่:</strong> ร้านค้าที่ร่วมรายการทั่วประเทศ</p>
      <p><strong>วันหมดอายุ:</strong> 31 ธันวาคม 2567</p>
      <p><strong>หมายเหตุ:</strong> ไม่สามารถแลกเปลี่ยนเป็นเงินสดได้</p>
    `,
  },
  {
    id: 2,
    type: "giftCard",
    title: "Gift Card มูลค่า 500 บาท",
    points: 20,
    image: "/img/gift-card.png",
    description: "ใช้ 20 คะแนน แลก Gift Card มูลค่า 500 บาท",
    conditions: `
      <ul class="list-disc list-inside">
        <li>บัตรนี้ใช้ชำระค่าสินค้าภายในร้านค้าที่ร่วมรายการ</li>
        <li>มูลค่าคงเหลือในบัตรจะระบุในใบเสร็จที่ร้านค้าที่ร่วมรายการ</li>
        <li>บัตรนี้ไม่สามารถแลกเปลี่ยนหรือทอนเป็นเงินสดได้</li>
        <li>บริษัทฯ ขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</li>
      </ul>
    `,
    productDetails: `
      <p><strong>ชื่อสินค้า:</strong> Gift Card 500 THB</p>
      <p><strong>ประเภท:</strong> บัตรของขวัญ</p>
      <p><strong>ใช้ได้ที่:</strong> ร้านค้าที่ร่วมรายการทั่วประเทศ</p>
      <p><strong>วันหมดอายุ:</strong> 31 ธันวาคม 2567</p>
      <p><strong>หมายเหตุ:</strong> ไม่สามารถแลกเปลี่ยนเป็นเงินสดได้</p>
    `,
  },
];

export default function RedeemPointDetail() {
  const [loading, setLoading] = useState(false);
  const { id } = useParams(); // ✅ Get ID from URL
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("conditions"); // ✅ Default to 'conditions'
  const location = useLocation();
  console.log(location.state.id);

  // Find reward by ID
  const reward = rewards.find((item) => item.id === parseInt(id));

  if (!reward) {
    return (
      <MobileLayout loading={loading}>
        <div className="flex flex-col items-center w-full h-full">
          <SectionHeader
            title="ไม่พบข้อมูลรางวัล"
            icon="/img/icons/trophy.png"
          />
          <p className="text-gray-500 sarabun-font mt-4">
            ขออภัย, ไม่พบรางวัลที่คุณเลือก
          </p>
          <BackButton url="/mobile/redeem-point" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header */}
        <SectionHeader title="รายละเอียดรางวัล" icon="/img/icons/trophy.png" />

        {/* Reward Details */}
        <div className="w-full max-w-md bg-white rounded-lg mt-6">
          {/* Image Section */}
          <div className="relative bg-green-700 text-white rounded-lg overflow-hidden">
            <img
              src={reward.image}
              alt={reward.title}
              className="w-full object-cover rounded-lg"
            />
          </div>

          {/* Title & Description */}
          <h2 className="text-green-700 font-bold text-xl sarabun-font mt-4">
            {reward.title}
          </h2>
          <p className="text-gray-600 text-sm sarabun-font mt-2">
            {reward.description}
          </p>

          {/* Tab Header */}
          <div className="flex justify-around gap-2 mt-6 rounded-lg sarabun-font">
            <button
              className={`flex-1 text-center py-2 rounded-lg ${
                activeTab === "conditions"
                  ? "bg-green-700 text-white"
                  : "bg-white text-[#00783F]"
              }`}
              onClick={() => setActiveTab("conditions")}
            >
              เงื่อนไข
            </button>
            <button
              className={`flex-1 text-center py-2 rounded-lg ${
                activeTab === "details"
                  ? "bg-green-700 text-white"
                  : "bg-white text-[#00783F]"
              }`}
              onClick={() => setActiveTab("details")}
            >
              รายละเอียดสินค้า
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-3 rounded-b-lg sarabun-font text-sm text-gray-700 mt-2">
            {activeTab === "conditions" ? (
              <div
                className="sarabun-font"
                dangerouslySetInnerHTML={{ __html: reward.conditions }}
              />
            ) : (
              <div
                className="sarabun-font"
                dangerouslySetInnerHTML={{ __html: reward.productDetails }}
              />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md flex justify-between align-bottom mt-auto space-x-2">
          <BackButton />

          <div className="w-full max-w-md mt-auto py-2">
            <button
              onClick={() => {
                const isAndroid = /Android/i.test(navigator.userAgent);
                const url = "adama.mtsc.co.th/mobile/scan-collect"; // ❌ ไม่มี https://

                if (isAndroid) {
                  window.location.href = `intent://${url}#Intent;scheme=https;package=com.android.chrome;end;`;
                } else {
                  window.open(`https://${url}`, "_blank");
                }
              }}
              className="w-full py-3 bg-[#009845] rounded-lg text-white sarabun-font flex items-center justify-center space-x-2"
            >
              <span className="sarabun-font">แลกคะแนน</span>
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
