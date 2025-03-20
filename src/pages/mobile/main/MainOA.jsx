import React, { useEffect, useState } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate, useOutletContext } from "react-router-dom";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import MainMenu from "../../../components/mobile/main_menu/MainMenu";
import "@splidejs/splide/dist/css/splide.min.css";
import "./MainCSS.css";

export default function MainOA() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userProfile } = useOutletContext();

  useEffect(() => {
    console.log(userProfile);
  }, [userProfile]);

  // Mock User Data
  const userData = {
    name: "คุณ Krairoek Ruangkol",
    memberId: "123456",
    profileImage: "/img/icons/profile.png",
  };

  // Mock Points Data
  const pointsData = {
    currentPoints: 100,
    expiringPoints: 15,
    expiryDate: "31 ธ.ค. 67",
  };

  // Sample Promotion Data
  const promotions = [
    {
      id: 1,
      image: "/img/promotion-exam.png",
      type: "promotion",
      alt: "Promotion 1",
    },
    {
      id: 2,
      image: "/img/promotion-exam.png",
      type: "promotion",
      alt: "Promotion 2",
    },
    { id: 3, image: "/img/promotion-exam.png", type: "info" }, // No 'alt' provided
  ];

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
            <h3 className="text-[#00783F] text-lg font-semibold sarabun-font">
              ข่าวสารและโปรโมชั่น
            </h3>
            <button
              className="text-[#009845] sarabun-font text-sm"
              onClick={() => navigate("/mobile/promotion")}
            >
              ดูทั้งหมด
            </button>
          </div>

          {/* Splide.js Carousel */}
          <Splide
            options={{
              type: "loop",
              perPage: 1,
              perMove: 1,
              autoplay: true,
              interval: 5000,
              pagination: true,
              arrows: false,
              width: "100%",
            }}
            className="shadow-lg rounded-xl mb-5 mt-2"
          >
            {promotions.map((promo) => (
              <SplideSlide key={promo.id}>
                <div className="flex justify-center items-center">
                  <img
                    src={promo.image}
                    alt={promo.alt ? promo.alt : `${promo.type}${promo.id}`}
                    className="w-full max-w-full object-cover rounded-xl shadow-lg"
                  />
                </div>
              </SplideSlide>
            ))}
          </Splide>
        </div>

        {/* Menu Section */}
        <MainMenu />
      </div>
    </MobileLayout>
  );
}
