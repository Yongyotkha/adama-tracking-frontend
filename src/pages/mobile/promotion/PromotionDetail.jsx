import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import BackButton from "../../../components/mobile/button/BackButton";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";

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

// Mock Promotion Data
const promotions = [
  {
    id: 1,
    title: "ภารกิจพิเศษรางวัล 6 ฟรี 1",
    image: "/img/promotion-exam.png",
    description: "ใช้ 30 คะแนน แลก สติ๊กเกอร์ 1 ชิ้น",
    conditions: `
      <ul class="list-disc list-inside">
        <li>บัตรนี้ใช้ชำระค่าสินค้าภายในร้านค้าที่ร่วมรายการ</li>
        <li>มูลค่าคงเหลือในบัตรจะระบุในใบเสร็จที่ร้านค้าที่ร่วมรายการ</li>
        <li>บัตรนี้ไม่สามารถแลกเปลี่ยนหรือทอนเป็นเงินสดได้</li>
        <li>บริษัทฯ ขอสงวนสิทธิ์ในการเปลี่ยนแปลงเงื่อนไขโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</li>
      </ul>
    `,
    details: `
      <p><strong>ชื่อโปรโมชั่น:</strong> ซื้อสะสมไอศกรีมวอลล์ครบ 6 ชิ้น รับฟรีสติกเกอร์ 1 ชิ้น</p>
      <p><strong>ระยะเวลา:</strong> 24 ม.ค. - 23 ก.พ. 2568</p>
      <p><strong>ใช้ได้ที่:</strong> ร้านค้าที่ร่วมรายการ</p>
    `,
  },
];

export default function PromotionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("conditions");

  // Find Promotion
  const promotion = promotions.find((p) => p.id === parseInt(id));

  if (!promotion) {
    return (
      <MobileLayout loading={loading}>
        <div className="flex flex-col items-center w-full h-full">
          <SectionHeader title="ไม่พบโปรโมชั่น" icon="/img/icons/trophy.png" />
          <p className="text-gray-500 sarabun-font mt-4">ขออภัย, ไม่พบโปรโมชั่นนี้</p>
          <BackButton url="/mobile/promotion" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header */}
        <HeadSectionUser user={userData} />

        {/* Points Section */}
        <UserPointsSection pointsData={pointsData} />

        {/* Section Header */}
        <SectionHeader title="ข่าวสารและโปรโมชั่น" icon="/img/icons/trophy.png" />

        {/* Image Section */}
        <div className="w-full max-w-md rounded-lg overflow-hidden mt-4">
          <img src={promotion.image} alt={promotion.title} className="w-full object-cover" />
        </div>

        {/* Title & Description */}
        <h3 className="text-green-700 font-bold text-xl sarabun-font mt-4">{promotion.title}</h3>
        <p className="text-gray-600 text-sm sarabun-font mt-2">{promotion.description}</p>


        {/* Tab Header */}
        <div className="flex justify-between w-full max-w-md mt-6 gap-2 mt-6 rounded-lg sarabun-font">
          <button
            className={`flex-1 text-center py-2 rounded-lg ${activeTab === "conditions" ? "bg-green-700 text-white" : "bg-white text-[#00783F]"
              }`}
            onClick={() => setActiveTab("conditions")}
          >
            เงื่อนไข
          </button>
          <button
            className={`flex-1 text-center py-2 rounded-lg ${activeTab === "details" ? "bg-green-700 text-white" : "bg-white text-[#00783F]"
              }`}
            onClick={() => setActiveTab("details")}
          >
            รายละเอียดสินค้า
          </button>
        </div>

        {/* Tab Content */}
        <div className="w-full max-w-md p-4 text-sm text-gray-700 mt-2 bg-white rounded-lg shadow-md">
          {activeTab === "conditions" ? (
            <div className="sarabun-font" dangerouslySetInnerHTML={{ __html: promotion.conditions }} />
          ) : (
            <div className="sarabun-font" dangerouslySetInnerHTML={{ __html: promotion.details }} />
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md flex justify-between align-bottom mt-auto space-x-2">

          <BackButton url='/mobile/promotion' />

          <div className="w-full max-w-md mt-auto py-2">
            <button
              onClick={() => navigate('/mobile/scan-collect')}
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
