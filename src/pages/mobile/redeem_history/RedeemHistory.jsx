import React, { useState } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import BackButton from "../../../components/mobile/button/BackButton";

export default function RedeemHistory() {
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("earned"); // Default tab
  const navigate = useNavigate();

  // User Data
  const userData = {
    name: "คุณ Krairoek Ruangkol",
    memberId: "123456",
    profileImage: "/img/icons/profile.png",
  };

  // Points Data
  const pointsData = {
    currentPoints: 100,
    expiringPoints: 15,
    expiryDate: "31 ธ.ค. 67",
  };

  // Tabs
  const tabs = [
    { id: "earned", label: "สะสมคะแนน", color: "border-green-500" },
    { id: "redeemed", label: "แลกคะแนน", color: "border-red-500" },
    { id: "expiring", label: "คะแนนใกล้หมดอายุ", color: "border-orange-500" },
  ];

  // Mock Transaction Data
  const transactions = {
    earned: [
      { id: 1, date: "3 พ.ย. 67 | 19:17:31", points: "+30 คะแนน" },
      { id: 2, date: "2 พ.ย. 67 | 19:17:31", points: "+30 คะแนน" },
      { id: 3, date: "1 พ.ย. 67 | 19:17:31", points: "+30 คะแนน" },
    ],
    redeemed: [
      { id: 4, date: "3 พ.ย. 67 | 19:17:31", item: "Gift Card 1,000 THB", points: "-30 คะแนน" },
      { id: 5, date: "2 พ.ย. 67 | 19:17:31", item: "Gift Card 1,000 THB", points: "-30 คะแนน" },
      { id: 6, date: "1 พ.ย. 67 | 19:17:31", item: "Gift Card 1,000 THB", points: "-30 คะแนน" },
    ],
    expiring: [{ id: 7, date: "3 พ.ย. 67", points: "15 คะแนน" }],
  };

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header */}
        <HeadSectionUser user={userData} />

        {/* Points Section */}
        <UserPointsSection pointsData={pointsData} />

        {/* Section Header */}
        <SectionHeader title="ประวัติการแลกคะแนน" icon="/img/icons/trophy.png" />

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

        {/* Transactions List */}
        <div className="w-full max-w-md mt-4 px-4">
          {transactions[activeTab].map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-md mb-2">
              <div className="flex gap-2 flex-wrap">
                <img src="/img/icons/point.png" className="h-5 w-5 my-auto" alt="point-icon" />
                <div>
                  {item.item && <p className="text-gray-700 font-medium text-sm sarabun-font">{item.item}</p>}
                  <p className="text-gray-500 text-sm sarabun-font">{item.date}</p>
                </div>
              </div>
              <p className={`font-bold sarabun-font ${activeTab === "redeemed" ? "text-red-500" : "text-green-600"}`}>{item.points}</p>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <BackButton url="/mobile/main" />
      </div>
    </MobileLayout >
  );
}
