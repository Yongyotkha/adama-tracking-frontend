import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import BackButton from "../../../components/mobile/button/BackButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function RedeemPointDetail() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [reward, setReward] = useState(null);
  const [activeTab, setActiveTab] = useState("conditions");
  const location = useLocation();

  useEffect(() => {
    const fetchRewardDetail = async () => {
      try {
        const response = await useServiceAPI.get(paths.pathPointPublicDetail, { id: location.state.id });
        if (response.status === 200 && response.result) {
          setReward(response.data);
        }
      } catch (error) {
        console.error("Error fetching reward details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRewardDetail();
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

  if (!reward) {
    return (
      <MobileLayout loading={loading}>
        <div className="flex flex-col items-center w-full h-full">
          <SectionHeader
            title="ไม่พบข้อมูลรางวัล"
            icon="/img/icons/trophy.png"
          />
          <p className="text-gray-500 sarabun-font mt-4">
            ขออภัย, ไม่พบรางวัลที่คุณเลือก
          </p>
          <BackButton url="/mobile/redeem-point" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        <SectionHeader title="รายละเอียดรางวัล" icon="/img/icons/trophy.png" />

        <div className="w-full max-w-md bg-white rounded-lg mt-6">
          <div className="relative rounded-lg overflow-hidden">
            <img src={reward.logo} alt={reward.name} className="w-full object-cover rounded-lg" />
          </div>

          <h2 className="text-green-700 font-bold text-xl sarabun-font mt-4">{reward.name}</h2>
          <p className="text-gray-600 text-sm sarabun-font mt-2">{reward.description_shot}</p>

          <div className="flex justify-around gap-2 mt-6 rounded-lg sarabun-font">
            <button
              className={`flex-1 text-center py-2 rounded-lg ${activeTab === "conditions" ? "bg-green-700 text-white" : "bg-white text-[#00783F]"}`}
              onClick={() => setActiveTab("conditions")}
            >
              เงื่อนไข
            </button>
            <button
              className={`flex-1 text-center py-2 rounded-lg ${activeTab === "details" ? "bg-green-700 text-white" : "bg-white text-[#00783F]"}`}
              onClick={() => setActiveTab("details")}
            >
              รายละเอียดสินค้า
            </button>
          </div>

          <div className="p-3 rounded-b-lg sarabun-font text-sm text-gray-700 mt-2">
            {activeTab === "conditions" ? (
              <div className="sarabun-font" dangerouslySetInnerHTML={{ __html: reward.condition }} />
            ) : (
              <div className="sarabun-font" dangerouslySetInnerHTML={{ __html: reward.description }} />
            )}
          </div>
        </div>

        <div className="w-full max-w-md flex justify-between align-bottom mt-auto space-x-2">
          <BackButton />
          <div className="w-full max-w-md mt-auto py-2">
            <button
              onClick={() => {
                const isAndroid = /Android/i.test(navigator.userAgent);
                const url = "adama.mtsc.co.th/mobile/collect-points"; // ❌ ไม่มี https://

                if (isAndroid) {
                  window.location.href = `intent://${url}#Intent;scheme=https;package=com.android.chrome;end;`;
                } else {
                  window.open(`https://${url}`, "_blank");
                }
              }}
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