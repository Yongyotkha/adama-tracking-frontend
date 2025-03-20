import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import BackButton from "../../../components/mobile/button/BackButton";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function PromotionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("conditions");
  const [promotion, setPromotion] = useState(null);
  const [error, setError] = useState(false);
  const location = useLocation();

  console.log(location.state.id);

  // ✅ **Fix: Use GET instead of POST**
  useEffect(() => {

    const fetchPromotionDetail = async (id) => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathNewsPublicDetail, {
          id, // ✅ Send as a query parameter, NOT in request body
        });

        if (response.status === 200 && response.result) {
          setPromotion(response.data);
          console.log(response.data);

        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching promotion details:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionDetail(location.state.id);
  }, [location.state.id]);

  if (loading) {
    return (
      <MobileLayout loading={loading}>
        <div className="flex flex-col items-center w-full h-full">
          <SectionHeader title="กำลังโหลด..." icon="/img/icons/trophy.png" />
        </div>
      </MobileLayout>
    );
  }

  if (error || !promotion) {
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
        <HeadSectionUser />

        {/* Points Section */}
        <UserPointsSection />

        {/* Section Header */}
        <SectionHeader title={promotion.category_name} icon="/img/icons/trophy.png" />

        {/* Image Section */}
        <div className="w-full max-w-md rounded-lg overflow mt-4">
          <img src={promotion.logo} alt={promotion.name} className="w-full object-cover" />
        </div>

        {/* Title & Description */}
        <h3 className="text-green-700 font-bold text-xl sarabun-font mt-4">{promotion.name}</h3>
        <p className="text-gray-600 text-sm sarabun-font mt-2">{promotion.description_shot}</p>

        {/* Tab Header */}
        <div className="flex justify-between w-full max-w-md mt-6 gap-2 rounded-lg sarabun-font">
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
            <div className="sarabun-font" dangerouslySetInnerHTML={{ __html: promotion.condition }} />
          ) : (
            <div className="sarabun-font" dangerouslySetInnerHTML={{ __html: promotion.description }} />
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md flex justify-between mt-auto space-x-2">
          <BackButton url="/mobile/promotion" />

          <div className="w-full max-w-md mt-auto py-2">
            <button
              onClick={() => navigate("/mobile/scan-collect")}
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
