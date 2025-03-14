import React, { useState } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import BackButton from "../../../components/mobile/button/BackButton";

export default function RedeemPoint() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  // User Data Object
  const userData = {
    name: "คุณ Krairoek Ruangkol",
    memberId: "123456",
    profileImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsynwv-5qtogtOwJbIjaPFJUmHpzhxgqIAug&s",
  };

  // Points Data Object
  const pointsData = {
    currentPoints: 100,
    expiringPoints: 15,
    expiryDate: "31 ธ.ค. 67",
  };

  const tabs = [
    { id: "all", label: "ทั้งหมด" },
    { id: "giftCard", label: "บัตรกำนัล" },
    { id: "coupon", label: "คูปองส่วนลด" },
  ];

  const rewards = [
    { id: 1, type: "giftCard", title: "Gift Card มูลค่า 1,000 บาท", points: 30, image: "/img/gift-card.png" },
    { id: 2, type: "giftCard", title: "Gift Card มูลค่า 500 บาท", points: 20, image: "/img/gift-card.png" },
    { id: 3, type: "coupon", title: "คูปองส่วนลด 100 บาท", points: 10, image: "/img/gift-card.png" },
    { id: 4, type: "coupon", title: "คูปองส่วนลด 50 บาท", points: 5, image: "/img/gift-card.png" },
  ];

  const filteredRewards =
    activeTab === "all" ? rewards : rewards.filter((item) => item.type === activeTab);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Head Section (Dynamic Component) */}
        <HeadSectionUser user={userData} />

        {/* Points Section (Dynamic Component) */}
        <UserPointsSection pointsData={pointsData} />

        {/* Head Content Section (Dynamic Component) */}
        <SectionHeader title="แลกคะแนนสะสม" icon="/img/icons/trophy.png" />

        {/* Tabs Section */}
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

        {/* Content Section - Responsive Grid */}
        <div className="w-full max-w-md mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredRewards.map((reward) => (
            <div
              key={reward.id}
              className="bg-white rounded-xl shadow-lg cursor-pointer"
              // onClick={() => navigate(`/mobile/redeem-point/detail/${reward.id}`)} 
              onClick={() => 
                navigate("/mobile/redeem-point/detail/", {
                  state: {
                    id: reward.id,
                  },
                })
              }

            >
              {/* Image Section */}
              <div className="relative rounded-xl overflow-hidden shadow">
                <img src={reward.image} alt={reward.title} className="w-full object-cover" />
              </div>

              {/* Description Section */}
              <div className="mt-3 p-3">
                <p className="font-bold text-[#00783F] sarabun-font">{reward.title}</p>
                <p className="text-gray-500 text-sm sarabun-font">
                  ใช้ {reward.points} คะแนน แลก {reward.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button at Bottom */}
        <BackButton url="/mobile/main" />
      </div>

    </MobileLayout>
  );
}
