import React, { useState } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import MenuButton from "../../../components/mobile/button/MenuButton";
import MainMenu from "../../../components/mobile/main_menu/MainMenu";

export default function MainOA() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mock User Data
  const userData = {
    name: "คุณ Krairoek Ruangkol",
    memberId: "123456",
    profileImage:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsynwv-5qtogtOwJbIjaPFJUmHpzhxgqIAug&s",
  };

  // Mock Points Data
  const pointsData = {
    currentPoints: 100,
    expiringPoints: 15,
    expiryDate: "31 ธ.ค. 67",
  };

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Head Section (Dynamic Component) */}
        <HeadSectionUser user={userData} />

        {/* Points Section (Dynamic Component) */}
        <UserPointsSection pointsData={pointsData} />

        {/* News & Promotions Section */}
        <div className="w-full max-w-md mt-6">

          <div className="flex justify-between items-center">
            <h3 className="text-[#00783F] text-lg font-semibold sarabun-font">ข่าวสารและโปรโมชั่น</h3>
            <button className="text-[#009845] sarabun-font text-sm" onClick={()=> navigate('/mobile/promotion')}>ดูทั้งหมด</button>
          </div>

          <div className="w-full rounded-lg overflow-hidden mt-2 shadow-lg">
            <img
              src="https://source.unsplash.com/featured/?agriculture"
              alt="News Banner"
              className="w-full h-40 object-cover"
            />
          </div>
          {/* Indicator Dots */}
          <div className="flex justify-center mt-2 space-x-1">
            <span className="w-2 h-2 bg-[#009845] rounded-full"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
          </div>
        </div>

        {/* Menu Section */}
        <MainMenu />
      </div>
    </MobileLayout>
  );
}
