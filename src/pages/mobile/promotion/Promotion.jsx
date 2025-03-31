import React, { useState, useEffect } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate, useOutletContext } from "react-router-dom";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import BackButton from "../../../components/mobile/button/BackButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function Promotion() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [promotions, setPromotions] = useState([]);
  const { lineProfile } = useOutletContext() || {};
  useEffect(() => {
    console.log("lineProfile", lineProfile);
  }, []);

  // ✅ Fetch categories (Using GET instead of POST)
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathNewsPublicCategory);

        if (response.status === 200 && response.result) {
          console.log(response.data);

          setCategories(response.data);
          setActiveTab(response.data[0]?.id); // Default tab to first category
        } else {
          console.error("Failed to fetch categories:", response);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // if (!activeTab) return;
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(
          paths.pathNewsPublicListByCategory,
          {
            category_id: activeTab,
          }
        );

        if (response.status === 200 && response.result) {
          setPromotions(response.data);
        } else {
          console.error("Failed to fetch promotions:", response);
        }
      } catch (error) {
        console.error("Error fetching promotions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [activeTab]);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <HeadSectionUser />

        {/* Points Section */}
        <UserPointsSection />

        {/* Section Header */}
        <SectionHeader title="ข่าวสารและโปรโมชั่น" icon="/img/icons/news.png" />

        {/* Tabs */}
        <div className="w-full max-w-md mt-4 flex space-x-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold sarabun-font ${
                activeTab === category.id
                  ? "bg-[#FFB347] text-white"
                  : "bg-gray-300 text-gray-700"
              }`}
            >
              {category.id ? category.name : category.text}
            </button>
          ))}
        </div>

        {/* Promotions List */}
        <div className="w-full max-w-md mt-4">
          {promotions.length > 0 ? (
            promotions.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer mb-3"
                // onClick={() => navigate(`/mobile/promotion/detail/${promo.id}`)}
                onClick={() =>
                  navigate("/mobile/promotion/detail/", {
                    state: {
                      id: promo.id,
                    },
                  })
                }
              >
                <img
                  src={promo.logo}
                  alt={promo.name}
                  className="w-full object-cover"
                />
                {/* <div className="p-3">
                  <p className="text-sm text-gray-500">
                    {promo.description_shot}
                  </p>
                  <h3 className="font-semibold text-gray-800 sarabun-font">
                    {promo.name}
                  </h3>
                </div> */}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-4">
              ไม่มีโปรโมชั่นในขณะนี้
            </p>
          )}
        </div>

        {/* Back Button at Bottom */}
        <BackButton url="/mobile/main" />
      </div>
    </MobileLayout>
  );
}
