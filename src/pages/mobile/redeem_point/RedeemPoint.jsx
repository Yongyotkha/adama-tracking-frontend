import React, { useState, useEffect } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import BackButton from "../../../components/mobile/button/BackButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function RedeemPoint() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [rewards, setRewards] = useState([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathPointPublicCategory);
        if (response.status === 200 && response.result) {
          setCategories(response.data);
          setActiveTab(response.data[0]?.id);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch rewards
  useEffect(() => {
    if (!activeTab) return;
    const fetchRewards = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathPointPublicListByCategory, { category_id: activeTab });
        if (response.status === 200 && response.result) {
          setRewards(response.data);
        }
      } catch (error) {
        console.error("Error fetching rewards:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, [activeTab]);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        <HeadSectionUser user={{ name: "คุณ Krairoek Ruangkol", memberId: "123456", profileImage: "/img/icons/profile.png" }} />
        <UserPointsSection pointsData={{ currentPoints: 100, expiringPoints: 15, expiryDate: "31 ธ.ค. 67" }} />
        <SectionHeader title="แลกคะแนนสะสม" icon="/img/icons/trophy.png" />

        <div className="w-full max-w-md mt-4 flex space-x-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold sarabun-font ${activeTab === category.id ? "bg-[#FFB347] text-white" : "bg-gray-300 text-gray-700"}`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="w-full max-w-md mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-xl shadow-lg cursor-pointer" onClick={() => navigate("/mobile/redeem-point/detail/", { state: { id: reward.id } })}>
              <div className="relative rounded-xl overflow-hidden shadow">
                <img src={reward.image} alt={reward.title} className="w-full object-cover" />
              </div>
              <div className="mt-3 p-3">
                <p className="font-bold text-[#00783F] sarabun-font">{reward.title}</p>
                <p className="text-gray-500 text-sm sarabun-font">ใช้ {reward.points} คะแนน แลก {reward.title}</p>
              </div>
            </div>
          ))}
        </div>

        <BackButton url="/mobile/main" />
      </div>
    </MobileLayout>
  );
}