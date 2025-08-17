import React, { useEffect, useState } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate, useOutletContext } from "react-router-dom";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import MainMenu from "../../../components/mobile/main_menu/MainMenu";
import "./MainCSS.css";
import SplidePromotion from "../../../components/splide/SplidePromotion";

export default function MainOA() {
  const [loading, setLoading] = useState(false);
  const { lineProfile } = useOutletContext() || {};

  useEffect(() => {
    console.log('lineProfile', lineProfile);
  }, []);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <HeadSectionUser />

        {/* Points Section */}
        <UserPointsSection />


        <SplidePromotion />
        <MainMenu />
      </div>
    </MobileLayout>
  );
}
