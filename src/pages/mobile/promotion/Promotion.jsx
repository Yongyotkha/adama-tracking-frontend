import React, { useState } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import BackButton from "../../../components/mobile/button/BackButton";

export default function Promotion() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("news");

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
    { id: "news", label: "ข่าวสาร" },
    { id: "promotion", label: "โปรโมชั่น" },
  ];

  // Mock Data
  const promotions = [
    {
      id: 1,
      category: "promotion",
      title: "ภารกิจพิเศษรางวัล 6 ฟรี 1",
      image: "/img/promotion-exam.png",
      description: "ซื้อสะสมไอศกรีมวอลล์ครบ 6 ชิ้น รับฟรีสติกเกอร์ 1 ชิ้น",
      validity: "24 ม.ค. - 23 ก.พ. 2568",
    },
    {
      id: 2,
      category: "promotion",
      title: "ภารกิจพิเศษรางวัล 6 ฟรี 1",
      image: "/img/promotion-exam.png",
      description: "ซื้อสะสมไอศกรีมวอลล์ครบ 6 ชิ้น รับฟรีสติกเกอร์ 1 ชิ้น",
      validity: "24 ม.ค. - 23 ก.พ. 2568",
    },
    {
      id: 3,
      category: "news",
      title: "ภารกิจพิเศษรางวัล 6 ฟรี 1",
      image: "/img/promotion-exam.png",
      description: "ซื้อสะสมไอศกรีมวอลล์ครบ 6 ชิ้น รับฟรีสติกเกอร์ 1 ชิ้น",
      validity: "24 ม.ค. - 23 ก.พ. 2568",
    },
  ];

  const filteredPromotions = promotions.filter((promo) => promo.category === activeTab);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <HeadSectionUser user={userData} />

        {/* Points Section */}
        <UserPointsSection pointsData={pointsData} />

        {/* Section Header */}
        <SectionHeader title="ข่าวสารและโปรโมชั่น" icon="/img/icons/news.png" />

        {/* Tabs */}
        <div className="w-full max-w-md mt-4 flex space-x-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold sarabun-font ${activeTab === tab.id
                ? "bg-[#FFB347] text-white"
                : "bg-gray-300 text-gray-700"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Promotions List */}
        <div className="w-full max-w-md mt-4 px-4">
          {filteredPromotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer mb-3"
              onClick={() => navigate(`/mobile/promotion/detail/${promo.id}`)}
            >
              <img src={promo.image} alt={promo.title} className="w-full object-cover" />
              {/* <div className="p-3">
                <p className="text-sm text-gray-500">{promo.validity}</p>
                <h3 className="font-semibold text-gray-800 sarabun-font">{promo.title}</h3>
              </div> */}
            </div>
          ))}
        </div>

        {/* Back Button at Bottom */}
        <BackButton url="/mobile/main" />
      </div>
    </MobileLayout>
  );
}
