import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import BackButton from "../../../components/mobile/button/BackButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import DynamicPopUpConfirm from "../../../components/mobile/popup/DynamicPopUpConfirm";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
export default function RedeemPointDetail() {
  const [loading, setLoading] = useState(true);        // โหลดรายละเอียดรางวัล
  const [redeeming, setRedeeming] = useState(false);   // สถานะกำลังแลกคะแนน
  const navigate = useNavigate();
  const [reward, setReward] = useState(null);
  const [target, setTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("conditions");
  const location = useLocation();
  const [isPointModalVisible, setIsPointModalVisible] = useState(false);
  const [isPointModalVisibleFalse, setIsPointModalVisibleFalse] = useState(false);
  const [isPointModalVisibleComfirm, setIsPointModalVisibleComfirm] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    const fetchRewardDetail = async () => {
      try {
        const response = await useServiceAPI.get(
          paths.pathPromotiondetail + "/" + location.state.id,{cal:true}
        );
        if (response.status === 200 && response.result) {
          setReward(response.data.promotion);
          setTarget(response.data.target);
        }
      } catch (error) {
        console.error("Error fetching reward details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRewardDetail();
  }, [location.state.id]);

  // 🔹 ฟังก์ชันกดปุ่ม “แลกคะแนน”
  const handleRedeem = async () => {
    if (!location?.state?.id) {
      alert("ไม่พบรหัสรางวัล");
      return;
    }
    try {
      setRedeeming(true);
      const body = {
        platform: "web",
        reward_id: location.state.id,
      };
      const res = await useServiceAPI.post(
        paths.pathSalePointReceiveReward,
        body
      );

      // ปรับตามรูปแบบ response ของระบบคุณได้เลย
      if (res.status === 200 || res.result === true) {
        //setEarnedPoints(res.targets.point);
        setEarnedPoints(5);
        if (res.data.status) {
          setIsPointModalVisibleComfirm(true);
        }else{
          setIsPointModalVisibleFalse(true)
        }


        // นำทางไปหน้า success หรือแสดงข้อความสำเร็จ
        // ส่งข้อมูลที่จำเป็นผ่าน state
        // navigate("/mobile/redeem-point/success", {
        //   state: {
        //     rewardId: location.state.id,
        //     message: res?.message || "แลกคะแนนสำเร็จ",
        //   },
        //   replace: true,
        // });
      } else {
        alert(res?.message || "ไม่สามารถแลกคะแนนได้ กรุณาลองใหม่");
      }
    } catch (err) {
      console.error("Redeem error:", err);
      alert("เกิดข้อผิดพลาดในการแลกคะแนน");
    } finally {
      setRedeeming(false);
    }
  };

  const handleRedeemConfirm = async () => {
    if (!location?.state?.id) {
      alert("ไม่พบรหัสรางวัล");
      return;
    }
    try {
      setRedeeming(true);
      const body = {
        platform: "web",
        reward_id: location.state.id,
      };

      const res = await useServiceAPI.post(
        paths.pathSalePointReceiveRewardConfirm,
        body
      );

      // ปรับตามรูปแบบ response ของระบบคุณได้เลย
      if (res.status === 200 || res.result === true) {
        setEarnedPoints(100);
        setIsPointModalVisible(true);
        // นำทางไปหน้า success หรือแสดงข้อความสำเร็จ
        // ส่งข้อมูลที่จำเป็นผ่าน state
        // navigate("/mobile/redeem-point/success", {
        //   state: {
        //     rewardId: location.state.id,
        //     message: res?.message || "แลกคะแนนสำเร็จ",
        //   },
        //   replace: true,
        // });
      } else {
        alert(res?.message || "ไม่สามารถแลกคะแนนได้ กรุณาลองใหม่");
      }
    } catch (err) {
      console.error("Redeem error:", err);
      alert("เกิดข้อผิดพลาดในการแลกคะแนน");
    } finally {
      setRedeeming(false);
    }
  };

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
          <SectionHeader title="ไม่พบข้อมูลรางวัล" icon="/img/icons/trophy.png" />
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
            <img
              src={reward.image}
              alt={reward.name}
              className="w-full object-cover rounded-lg"
            />
          </div>

          <h2 className="text-green-700 font-bold text-xl sarabun-font mt-4">
            {reward.name}
          </h2>
          <p className="text-gray-600 text-sm sarabun-font mt-2">
            ใช้ {target?.[0]?.point ?? "-"} คะแนน
          </p>

          <div className="flex justify-around gap-2 mt-6 rounded-lg sarabun-font">
            <button
              className={`flex-1 text-center py-2 rounded-lg ${activeTab === "conditions"
                ? "bg-green-700 text-white"
                : "bg-white text-[#00783F]"
                }`}
              onClick={() => setActiveTab("conditions")}
            >
              เงื่อนไข
            </button>
            <button
              className={`flex-1 text-center py-2 rounded-lg ${activeTab === "details"
                ? "bg-green-700 text-white"
                : "bg-white text-[#00783F]"
                }`}
              onClick={() => setActiveTab("details")}
            >
              รายละเอียดสินค้า
            </button>
          </div>

          <div className="p-3 rounded-b-lg sarabun-font text-sm text-gray-700 mt-2">
            {activeTab === "conditions" ? (
              <div
                className="sarabun-font"
                dangerouslySetInnerHTML={{ __html: reward.condition }}
              />
            ) : (
              <div
                className="sarabun-font"
                dangerouslySetInnerHTML={{ __html: reward.description }}
              />
            )}
          </div>
        </div>

        <div className="w-full max-w-md flex justify-between align-bottom mt-auto space-x-2">
          <BackButton />
          <div className="w-full max-w-md mt-auto py-2">
            <button
              onClick={handleRedeem}
              disabled={redeeming}
              className={`w-full py-3 rounded-lg text-white sarabun-font flex items-center justify-center space-x-2 ${redeeming ? "bg-gray-400" : "bg-[#009845]"
                }`}
            >
              <span className="sarabun-font">
                {redeeming ? "กำลังแลก..." : "แลกคะแนน"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <DynamicPopUp
        visible={isPointModalVisibleFalse}
        onConfirm={() => {
          setIsPointModalVisibleFalse(false);
          //navigate("/mobile/redeem-point");
        }}
        src="/img/icons/check-circle.png"
        text={`<div class='text-center'>
            <p class='text-[#4A4A4A] text-[16px] mt-1 sarabun-font'>ใช้ ${target?.[0]?.point} คะแนนสำหรับแลกคูปองนี้</p>
            <p class='text-green-700 text-[24px] font-bold mt-1 sarabun-font'>คุณมี Point ไม่เพียงพอสำหรับรางวัลนี้</p>
          </div>`}
        confirmText="ปิด"
      />

      <DynamicPopUp
        visible={isPointModalVisible}
        onConfirm={() => {
          setIsPointModalVisible(false);
          navigate("/mobile/redeem-point");
        }}
        src="/img/icons/check-circle.png"
        text={`<div class='text-center'>
            <p class='text-[#4A4A4A] text-[16px] mt-1 sarabun-font'>ใช้ ${target?.[0]?.point} คะแนนสำหรับแลกคูปองนี้</p>
            <p class='text-green-700 text-[24px] font-bold mt-1 sarabun-font'>คุณแลกคูปองสำเร็จ</p>
          </div>`}
        confirmText="ปิด"
      />

      <DynamicPopUpConfirm
        visible={isPointModalVisibleComfirm}
        onConfirm={async () => {
          await handleRedeemConfirm();          // ← เรียกใช้จริง
          setIsPointModalVisibleComfirm(false); // ปิดหลังยิง API สำเร็จ/ล้มเหลวก็ได้
        }}
        onCancel={() => {
          // กดปุ่ม "ยกเลิก"
          setIsPointModalVisibleComfirm(false);
        }}
        src="/img/icons/forgot-password.png"
        text={`<div class='text-center'>
      <p class='text-[#4A4A4A] text-[16px] mt-1 sarabun-font'>คุณต้องการแลกคะแนน</p>
      <p class='text-green-700 text-[24px] font-bold mt-1 sarabun-font'>ใช้ ${target?.[0]?.point} คะแนนสำหรับแลกคูปองนี้</p>
    </div>`}
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
      />

    </MobileLayout>
  );
}
