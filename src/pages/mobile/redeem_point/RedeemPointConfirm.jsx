import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import BackButton from "../../../components/mobile/button/BackButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import DynamicPopUpConfirm from "../../../components/mobile/popup/DynamicPopUpConfirm";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import { AuthContext } from "../../../contexts/AuthContext";

export default function RedeemPointConfirm() {
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
    console.log('location : ', location)
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const { userInfo } = useContext(AuthContext);
    useEffect(() => {
        const fetchAddresses = async () => {
            setLoading(true);
            try {
                const response = await useServiceAPI.get(paths.pathTranAddress, {
                    page: "all",
                    user_id: userInfo?.id, // ✅ กำหนดค่า user_id จาก context
                });

                if (response.status === 200 && response.result) {
                    if (response.status === 200 && response.result) {
                        setAddresses(response.data.data);
                        if (response.data.data?.length) {
                            setSelectedAddressId(response.data.data[0].id);
                        }
                    }
                } else {
                    console.error("❌ Failed to fetch addresses", response);
                }
            } catch (error) {
                console.error("❌ API error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userInfo?.id) {
            fetchAddresses();
        }
    }, [userInfo]);
    useEffect(() => {
        const fetchRewardDetail = async () => {
            try {
                const response = await useServiceAPI.get(
                    paths.pathPromotiondetail + "/" + location.state.id, { cal: true }
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

                if (res.data.status == false) {
                    setIsPointModalVisibleFalse(true)

                } else {
                    setEarnedPoints(res.data.targets.point);

                    setIsPointModalVisibleComfirm(true);
                }

            } else {
                setIsPointModalVisibleFalse(true)

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
                address_id: selectedAddressId
            };

            const res = await useServiceAPI.post(
                paths.pathSalePointReceiveRewardConfirm,
                body
            );

            // ปรับตามรูปแบบ response ของระบบคุณได้เลย
            if (res.status === 200 || res.result === true) {
                setEarnedPoints(res.point);
                setIsPointModalVisible(true);

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
                <SectionHeader title="ยืนยันการแลกของรางวัล" icon="/img/icons/trophy.png" />

                <div className="w-full max-w-md bg-white rounded-lg shadow-md mt-6 p-6">
                    {/* ชื่อรางวัล */}
                    <h2 className="text-green-700 font-bold text-lg sarabun-font mb-2">
                        {reward.name}
                    </h2>

                    {/* รายละเอียด */}
                    <p className="text-gray-600 text-sm sarabun-font mt-2 mb-4">
                        {reward?.description ?? "-"}
                    </p>
              
                    <p className="text-gray-600 text-sm sarabun-font mt-2 whitespace-pre-lin mb-4">
                        รายละเอียดสินค้า : <br></br>
                        <div
                            className="sarabun-font"
                            dangerouslySetInnerHTML={{
                            __html: reward.product_detail.replace(/\n/g, "<br/>"),
                            }}
                        />
                    </p>

                    {/* คะแนนที่ใช้ */}
                    <h2 className="text-gray-700 text-sm sarabun-font ">
                    ใช้ {Number(target?.[0]?.point ?? 0).toLocaleString()} คะแนน
                    </h2>
                    </div>


                <div className="w-full max-w-md space-y-3 mt-10">

                    <h2 className="text-green-700 font-bold text-xl sarabun-font mt-4">
                        เลือกที่อยู่ในการจัดส่ง
                    </h2>
                    {addresses.length > 0 ? (
                        addresses.map((item) => {
                            const checked = selectedAddressId === item.id;
                            return (
                                <label
                                    key={item.id}
                                    className={`shadow-md rounded-lg p-4 bg-white cursor-pointer flex gap-3 items-start border transition
            ${checked ? "border-[#009845] ring-2 ring-[#009845]/30" : "border-transparent"}`}
                                    onClick={() => setSelectedAddressId(item.id)}
                                >
                                    <input
                                        type="radio"
                                        name="address"
                                        value={item.id}
                                        checked={checked}
                                        onChange={() => setSelectedAddressId(item.id)}
                                        className="mt-1 h-5 w-5 accent-[#009845]"
                                    />
                                    <div className="flex-1">
                                        <h3 className="sarabun-font font-bold text-base text-[#333]">
                                            {item.firstname} {item.lastname} | {item.phoneNumber}
                                        </h3>
                                        <p className="mt-1 sarabun-font text-sm text-[#666]">{item.address}</p>
                                        {checked && (
                                            <p className="mt-2 text-xs text-[#009845] sarabun-font">ใช้ที่อยู่นี้</p>
                                        )}
                                    </div>
                                </label>
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-500 mt-4 sarabun-font">ไม่พบที่อยู่</p>
                    )}
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
                                {redeeming ? "Loading..." : "ยืนยัน"}
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
                src="/img/icons/warning-yellow.png"
                text={`<div class='text-center'>
                <p class='text-yellow-500 text-[20px] font-bold mt-1 sarabun-font mb-4'>คุณมีคะแนนไม่เพียงพอสำหรับรางวัลนี้</p>
                <p class='text-[#4A4A4A] text-[16px] mt-1 sarabun-font mb-4'>ต้องใช้ ${Number(target?.[0]?.point??0).toLocaleString()} คะแนนสำหรับแลกรางวัลนี้</p>
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
            <p class='text-green-700 text-[24px] font-bold mt-1 sarabun-font mb-4'>แลกของรางวัลสำเร็จ</p>
            <p class='text-[#4A4A4A] text-[16px] mt-1 sarabun-font'>คุณใช้ ${Number(target?.[0]?.point).toLocaleString("th-TH")} คะแนนเพื่อแลกของรางวัลนี้เรียบร้อยแล้ว</p>
            
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
                src="/img/icons/point.png"
                text={`<div class='text-center'>
                <p class='text-green-700 text-[24px] font-bold mt-1 sarabun-font mb-4'>แลกของรางวัล</p>
                <p class='text-[#4A4A4A] text-[16px] mt-1 sarabun-font'>ใช้ ${Number(target?.[0]?.point ?? 0).toLocaleString("th-TH")} คะแนนสำหรับแลกของรางวัลนี้</p>
                
                </div>`}
                confirmText="ยืนยัน"
                cancelText="ยกเลิก"
            />

        </MobileLayout>
    );
}
