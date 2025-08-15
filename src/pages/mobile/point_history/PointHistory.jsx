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
  const [activeTab, setActiveTab] = useState("collect_points"); // Default tab
  const [transactionData, setTransactionData] = useState([]);

  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  // Tabs
  const tabs = [
    { id: "collect_points", label: "สะสมคะแนน", color: "border-green-500" },
    { id: "redeem_points", label: "แลกคะแนน", color: "border-red-500" },
    { id: "points_expire", label: "คะแนนใกล้หมดอายุ", color: "border-orange-500" },
  ];

  // Mock Transaction Data
  // const transactions = {
  //   collect_points: [
  //     { id: 1, date: "3 พ.ย. 67 | 19:17:31", points: "+30 คะแนน" },
  //     { id: 2, date: "2 พ.ย. 67 | 19:17:31", points: "+30 คะแนน" },
  //     { id: 3, date: "1 พ.ย. 67 | 19:17:31", points: "+30 คะแนน" },
  //   ],
  //   redeem_points: [
  //     { id: 4, date: "3 พ.ย. 67 | 19:17:31", item: "Gift Card 1,000 THB", points: "-30 คะแนน" },
  //     { id: 5, date: "2 พ.ย. 67 | 19:17:31", item: "Gift Card 1,000 THB", points: "-30 คะแนน" },
  //     { id: 6, date: "1 พ.ย. 67 | 19:17:31", item: "Gift Card 1,000 THB", points: "-30 คะแนน" },
  //   ],
  //   points_expire: [{ id: 7, date: "3 พ.ย. 67", points: "15 คะแนน" }],
  // };

  useEffect(() => {
    const fetchPointHistory = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathLogPoint, {
          platform: "web",
          "type": "receive",
          "page": "all"
        });

        if (response.status === 200) {
          // console.log(response);
          setTransactionData(response.data.data || []);
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
            transactionData.flat().map((month, monthIdx) => (
              <div key={monthIdx} className="mb-4">
                <p className="text-gray-700 font-bold sarabun-font mb-2">{month.month_name}</p>
                {month.items.map((item, itemIdx) => (
                  <div key={`${monthIdx}-${itemIdx}`} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-md mb-2">
                    <div className="flex gap-2 flex-wrap">
                      <img src="/img/icons/point.png" className="h-5 w-5 my-auto" alt="point-icon" />
                      <div>
                        <p className="text-gray-500 text-sm sarabun-font">{item.datetime}</p>
                      </div>
                    </div>
                    <p className={`font-bold sarabun-font ${item.color === "red" ? "text-red-500" : item.color === "orange" ? "text-orange-500" : "text-green-600"}`}>
                      {item.point}
                    </p>
                  </div>
                ))}
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
