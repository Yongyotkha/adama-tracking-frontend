import React, { useState,useEffect  } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import BackButton from "../../../components/mobile/button/BackButton";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";

export default function RedeemHistory() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("collect_points"); // Default tab
  const [transactionData, setTransactionData] = useState([]);

  const navigate = useNavigate();

  
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
          const response = await useServiceAPI.get(paths.pathpointhistory, {
            platform: "web",
            id: 139, // เปลี่ยนเป็น user id ที่เหมาะสม
            mode: activeTab, 
          });

          if (response.status === 200) {
            // setTransactionData(response.data.result || []);
            console.log(response);
            
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
        {/* <div className="w-full max-w-md mt-4 px-4">
          {transactions[activeTab].map((item) => (
            <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-md mb-2">
              <div className="flex gap-2 flex-wrap">
                <img src="/img/icons/point.png" className="h-5 w-5 my-auto" alt="point-icon" />
                <div>
                  {item.item && <p className="text-gray-700 font-medium text-sm sarabun-font">{item.item}</p>}
                  <p className="text-gray-500 text-sm sarabun-font">{item.date}</p>
                </div>
              </div>
              <p className={`font-bold sarabun-font ${activeTab === "redeem_points" ? "text-red-500" : "text-green-600"}`}>{item.points}</p>
            </div>
          ))}
        </div> */}

        <div className="w-full max-w-md mt-4">
          {transactionData.length > 0 ? (
            transactionData.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-md mb-2">
                <div className="flex gap-2 flex-wrap">
                  <img src="/img/icons/point.png" className="h-5 w-5 my-auto" alt="point-icon" />
                  <div>
                    {item.item && <p className="text-gray-700 font-medium text-sm sarabun-font">{item.item}</p>}
                    <p className="text-gray-500 text-sm sarabun-font">{item.date}</p>
                  </div>
                </div>
                <p className={`font-bold sarabun-font ${activeTab === "redeem_points" ? "text-red-500" : "text-green-600"}`}>
                  {item.points}
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
