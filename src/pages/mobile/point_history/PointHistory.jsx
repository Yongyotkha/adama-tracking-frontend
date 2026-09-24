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
import BadgeStatus from "../../../components/badge/BadgeStatus";
import { Spin, Image, Modal, message } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function PointHistory() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("receive"); // Default
  const [transactionData, setTransactionData] = useState([]); // สำหรับ use/expire
  const [orderData, setOrderData] = useState([]); // สำหรับ receive (แบบ OrderHistory)
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const [poinrRegister, setPointRegister] = useState({});
  const [modalLoading, setModalLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Function to view pictures from transport detail API
  const handleViewPictures = async (item) => {
    // If item already contains pictures array
    if (Array.isArray(item.pictures) && item.pictures.length > 0) {
      const urls = item.pictures.map((p) => p.part || p.url).filter(Boolean);
      if (urls.length > 0) {
        setImageList(urls);
        setPreviewIndex(0);
        setModalVisible(true);
        return;
      }
    }

    const transportId = item.id;
    if (!transportId) {
      message.info("ไม่พบข้อมูลรูปภาพ");
      return;
    }

    try {
      setModalLoading(true);
      const isFarmer = item.shop_type === "farmer" || item.user_type === "farmer";
      const res = await useServiceAPI.get(
        `${paths.pathTransportDetail}/${transportId}`,
        isFarmer ? { mode: "farmer" } : {}
      );

      if (res.status === 200 && res.data) {
        const pics = Array.isArray(res.data.pictures) ? res.data.pictures : [];
        const urls = pics.map((p) => p.part || p.url).filter(Boolean);
        if (urls.length > 0) {
          setImageList(urls);
          setPreviewIndex(0);
          setModalVisible(true);
        } else {
          message.info("ไม่มีรูปภาพแนบในรายการนี้");
        }
      } else {
        message.info("ไม่มีรูปภาพแนบในรายการนี้");
      }
    } catch (err) {
      console.error("Error fetching transport detail:", err);
      message.error("ไม่สามารถโหลดรูปภาพได้");
    } finally {
      setModalLoading(false);
    }
  };

  // Tabs
  const tabs = [
    { id: "receive", label: "สะสมคะแนน", color: "border-green-500" },
    { id: "use", label: "แลกคะแนน", color: "border-red-500" },
    { id: "expire", label: "คะแนนใกล้หมดอายุ", color: "border-orange-500" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {

        const point_register = await useServiceAPI.get(paths.pathLogPointOne, {
          platform: "web",
        });

        if (point_register.status === 200) {
          setPointRegister(point_register.data);
        }

        if (activeTab === "receive") {
          // 🔹 ดึงแบบ OrderHistory
          setOrderData([]); // เคลียร์ก่อน
          const requestData = {
            platform: "web",
            keyword: "",
            use_flag: "1",
            user_id: "",
            dealer_id: "",
            sub_dealer_id: "",
            farmer_id: "",
            trasaction_status_code: "",
            payment_status_code: "",
            status_code: "ODC", // เหมือน OrderHistory แท็บสำเร็จ
            page: "all",
            page_length: 1,
            page_size: 10,
          };

          const response = await useServiceAPI.get(paths.pathSalePointCollectList, requestData);
          if (response.status === 200) {
            const rawData = response.data?.data ?? [];
            setOrderData(rawData);
          } else {
            setOrderData([]);
          }
        } else {
          // 🔸 ใช้ API เดิมของ PointHistory
          setTransactionData([]);
          const response = await useServiceAPI.get(paths.pathLogPoint, {
            platform: "web",
            type: activeTab, // "use" | "expire"
            page: "all",
          });

          if (response.status === 200 && response.data?.point) {
            setTransactionData(response.data.point);
          } else {
            setTransactionData([]);
          }
        }
      } catch (error) {
        console.error("Error fetching point history:", error);
        if (activeTab === "receive") setOrderData([]);
        else setTransactionData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const renderCampaignLabel = (item) => {
    if (item.campaign_type === "1" && item.campaign_type !== "") {
      return "EV";
    } else if (item.campaign_type === "2" && item.campaign_type !== "") {
      return "T";
    } else if (item.campaign_type === "3" && item.campaign_type !== "") {
      return "X";
    } else if (item.campaign_type === "4" && item.campaign_type !== "") {
      return "EV";
    } else {
      return "";
    }
  };

  const getStatusInfo = (code) => {
    switch (code) {
      case "RTP":
        return { text: "กำลังดำเนินการ", textColor: "#FFFFFF", bgColor: "#FBBF24" };
      case "RTD":
        return { text: "กำลังจัดส่ง", textColor: "#FFFFFF", bgColor: "#3B82F6" };
      case "RTV":
        return { text: "จัดส่งสำเร็จ", textColor: "#FFFFFF", bgColor: "#10B981" };
      default:
        return { text: code || "รอดำเนินการ", textColor: "#000000", bgColor: "#D1D5DB" };
    }
  };

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header */}
        <HeadSectionUser />

        {/* Points Section */}
        <UserPointsSection />

        {/* Section Header */}
        <SectionHeader title="ประวัติการทำรายการคะแนน" icon="/img/icons/trophy.png" />

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

        {/* Content */}
        <div className="w-full max-w-md mt-4">
          {loading ? (
            <div className="py-5 flex justify-center">
              <Spin />
            </div>
          ) : activeTab === "receive" ? (
            // ✅ แสดงเหมือน OrderHistory
            <>
              {/* <h5 className="sarabun-font text-gray-700 mb-2">รายการทั้งหมด {orderData.length} รายการ</h5> */}
              <div className="mt-2 space-y-3 min-h-[24px] flex flex-col justify-center items-center">

                {orderData.length > 0 ? (
                  orderData.map((order, index) => {
                    const statusColor = "text-green-600";
                    const borderColor = "border-green-500";
                    return (
                      <div
                        key={index + 1}
                        onClick={() =>
                          navigate("/mobile/point-history/detail", {
                            state: { document_number: order.document_number },
                          })
                        }
                        className={`flex justify-between items-start p-4 bg-white rounded-lg shadow-md border-l-4 ${borderColor} cursor-pointer w-full`}
                      >
                        <div className="flex flex-col">
                          <p className="text-gray-500 sarabun-font text-sm">{order.updated_at}</p>
                          <p className="text-gray-900 sarabun-font text-xs font-bold mt-1">
                            เลขที่ {order.document_number}
                          </p>
                        </div>

                        <div className="flex flex-col items-end text-right">
                          {/* <p className={`sarabun-font font-semibold ${statusColor}`}>รับสินค้าสำเร็จ</p> */}
                          <p className="text-green-700 sarabun-font text-sm font-semibold mt-1">
                            +{" "}
                            {Number(order.point ?? 0).toLocaleString()} คะแนน
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500">ไม่มีข้อมูล</p>
                )}


              </div>
            </>
          ) : (
            // 🔸 แท็บอื่น ใช้ layout เดิมของ PointHistory
            <>
              {transactionData.length > 0 ? (
                transactionData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-white p-3 rounded-lg shadow-md mb-2"
                  >
                    <div className="flex gap-2 flex-wrap ">
                      <img src="/img/icons/point.png" className="h-5 w-5" alt="point-icon" />
                      <div>
                        {/* use */}
                        {activeTab === "use" && (
                          <>
                            <p className="text-gray-500 text-sm sarabun-font">
                              {item.created_at.split(".")[0]} | {item.page}
                            </p>
                            <p className="text-gray-700 text-xs sarabun-font">
                              รหัสรางวัล : {item.reward_code}
                            </p>
                            <p className="text-gray-700 text-xs sarabun-font truncate mb-2">
                              ชื่อรางวัล : {item.reward_name}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {(() => {
                                const status = getStatusInfo(item.status_tran);
                                return (
                                  <BadgeStatus
                                    text={status.text}
                                    bgColor={status.bgColor}
                                    textColor={status.textColor}
                                  />
                                );
                              })()}

                              {/* ปุ่มดูรูปภาพเอกสารการจัดส่ง */}
                              {(item.status_tran === "RTV" || item.pictures?.length > 0) && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewPictures(item);
                                  }}
                                  disabled={modalLoading}
                                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#00783F] bg-green-50 hover:bg-green-100 border border-[#00783F] rounded-2xl transition cursor-pointer"
                                >
                                  <PictureOutlined />
                                  <span>รูปภาพ</span>
                                </button>
                              )}
                            </div>
                          </>
                        )}

                        {/* expire / อื่น ๆ */}
                        {activeTab !== "use" && activeTab !== "receive" && (
                          <>
                            <p className="text-gray-500 text-sm sarabun-font">
                              {item.created_at.split(".")[0]}
                            </p>
                            <p className="text-gray-700 text-sm sarabun-font">
                              {item.document_number
                                ? "Document No: " + item.document_number
                                : "Register Point"}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <p
                      className={`font-bold sarabun-font ${activeTab === "use" ? "text-red-600" : "text-green-600"
                        }`}
                    >
                      {renderCampaignLabel(item)} {activeTab === "use" ? `-${item.point}` : `+${item.point}`}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 mt-4">ไม่มีข้อมูล</p>
              )}
            </>
          )}
        </div>

        {/* Back Button */}
        <BackButton url="/mobile/main" />

        {/* Image Preview Group Modal */}
        {imageList.length > 0 && (
          <div style={{ display: "none" }}>
            <Image.PreviewGroup
              preview={{
                visible: modalVisible,
                current: previewIndex,
                onVisibleChange: (visible) => {
                  setModalVisible(visible);
                  if (!visible) {
                    setImageList([]);
                  }
                },
                onChange: (current) => setPreviewIndex(current),
              }}
            >
              {imageList.map((url, index) => (
                <Image key={`${url}-${index}`} src={url} />
              ))}
            </Image.PreviewGroup>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
