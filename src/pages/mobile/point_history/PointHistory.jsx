import React, { useState, useEffect, useContext } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import BackButton from "../../../components/mobile/button/BackButton";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";
import { AuthContext } from "../../../contexts/AuthContext";

export default function PointHistory() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("receive"); // Default
  const [transactionData, setTransactionData] = useState([]);

  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  // Tabs
  const tabs = [
    { id: "receive", label: "สะสมคะแนน", color: "border-green-500" },
    { id: "use", label: "แลกคะแนน", color: "border-red-500" },
    { id: "expire", label: "คะแนนใกล้หมดอายุ", color: "border-orange-500" },
  ];


  useEffect(() => {
    const fetchPointHistory = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathLogPoint, {
          platform: "web",
          type: activeTab,
          page: "all"
        });

        if (response.status === 200 && response.data?.point) {
          // ดึง array point จาก API มา set state
          setTransactionData(response.data.point);
        } else {
          setTransactionData([]);
        }
      } catch (error) {
        console.error("Error fetching point history:", error);
        setTransactionData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPointHistory();
  }, [activeTab]);


  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header */}
        <HeadSectionUser />

        {/* Points Section */}
        <UserPointsSection />

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
        <div className="w-full max-w-md mt-4">
          {transactionData.length > 0 ? (
            transactionData.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-white p-3 rounded-lg shadow-md mb-2"
              >
                <div className="flex gap-2 flex-wrap">
                  <img src="/img/icons/point.png" className="h-5 w-5 my-auto" alt="point-icon" />
                  <div>
                    <p className="text-gray-500 text-sm sarabun-font">
                      {item.created_at.split('.')[0]}
                    </p>
                    <p className="text-gray-700 text-sm sarabun-font">
                      หมดอายุ: {item.expire_at}
                    </p>
                  </div>
                </div>
                <p className="font-bold sarabun-font text-green-600">
                  +{item.point}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-4">ไม่มีข้อมูล</p>
          )}
        </div>


        {/* Back Button */}
        <BackButton url="/mobile/main" />
      </div>
    </MobileLayout >
  );
}
