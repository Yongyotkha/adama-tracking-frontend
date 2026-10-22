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
import { PictureOutlined, FilePdfOutlined, DownloadOutlined } from "@ant-design/icons";
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

  // ตรวจสอบนามสกุลว่าเป็นรูปภาพหรือไม่
  const isImageFile = (url = "") => {
    const cleanUrl = url.split("?")[0].toLowerCase();
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/.test(cleanUrl);
  };

  // ตรวจสอบว่าเป็นไฟล์ PDF หรือไม่
  const isPdfFile = (url = "") => {
    const cleanUrl = url.split("?")[0].toLowerCase();
    return /\.pdf$/.test(cleanUrl);
  };

  // ดึงรายการไฟล์ทั้งหมดจาก item (ทั้งจาก pictures หรือ API transport detail)
  const fetchItemFiles = async (item) => {
    if (Array.isArray(item.pictures) && item.pictures.length > 0) {
      const urls = item.pictures.map((p) => p.part || p.url).filter(Boolean);
      if (urls.length > 0) return urls;
    }

    const transportId = item.id;
    if (!transportId) return [];

    try {
      setModalLoading(true);
      const isFarmer = item.shop_type === "farmer" || item.user_type === "farmer";
      const res = await useServiceAPI.get(
        `${paths.pathTransportDetail}/${transportId}`,
        isFarmer ? { mode: "farmer" } : {}
      );

      if (res.status === 200 && res.data) {
        const pics = Array.isArray(res.data.pictures) ? res.data.pictures : [];
        return pics.map((p) => p.part || p.url).filter(Boolean);
      }
      return [];
    } catch (err) {
      console.error("Error fetching transport detail:", err);
      message.error("ไม่สามารถดึงข้อมูลไฟล์ได้");
      return [];
    } finally {
      setModalLoading(false);
    }
  };

  // ฟังก์ชันดาวน์โหลดไฟล์
  const handleDownloadFile = (url) => {
    const fileName = url.split("/").pop().split("?")[0] || "download";
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // จัดการเมื่อกดปุ่มดูเอกสาร/รูปภาพ/PDF
  const handleViewFiles = async (item, targetType = "all") => {
    const urls = await fetchItemFiles(item);
    if (!urls || urls.length === 0) {
      message.info("ไม่พบไฟล์แนบในรายการนี้");
      return;
    }

    const nonImages = urls.filter((url) => !isImageFile(url));
    const images = urls.filter((url) => isImageFile(url));

    if (targetType === "pdf") {
      const pdfs = urls.filter((url) => isPdfFile(url));
      if (pdfs.length > 0) {
        pdfs.forEach((url) => handleDownloadFile(url));
        return;
      }
      if (nonImages.length > 0) {
        nonImages.forEach((url) => handleDownloadFile(url));
        return;
      }
    }

    if (targetType === "image") {
      if (images.length > 0) {
        setImageList(images);
        setPreviewIndex(0);
        setModalVisible(true);
        return;
      }
    }

    // fallback
    if (nonImages.length > 0 && images.length === 0) {
      nonImages.forEach((url) => handleDownloadFile(url));
      return;
    }

    if (images.length > 0) {
      setImageList(images);
      setPreviewIndex(0);
      setModalVisible(true);
      if (nonImages.length > 0) {
        nonImages.forEach((url) => handleDownloadFile(url));
      }
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
            const points = response.data.point;
            setTransactionData(points);

            // ถ้าเป็นแท็บ use ให้ดึงข้อมูลไฟล์/รูปภาพสำหรับรายการที่ status_tran === "RTV" เพื่อตรวจจับปุ่ม PDF / รูปภาพ ได้ทันที
            if (activeTab === "use" && Array.isArray(points)) {
              const rtvItems = points.filter(
                (p) => p.status_tran === "RTV" && (!p.pictures || p.pictures.length === 0) && p.id
              );

              if (rtvItems.length > 0) {
                // ดึง detail แบบคู่ขนาน
                Promise.all(
                  rtvItems.map(async (item) => {
                    try {
                      const isFarmer = item.shop_type === "farmer" || item.user_type === "farmer";
                      const res = await useServiceAPI.get(
                        `${paths.pathTransportDetail}/${item.id}`,
                        isFarmer ? { mode: "farmer" } : {}
                      );
                      if (res.status === 200 && res.data?.pictures) {
                        return { id: item.id, pictures: res.data.pictures };
                      }
                    } catch (e) {
                      // ignore individual error
                    }
                    return null;
                  })
                ).then((results) => {
                  const updates = results.filter(Boolean);
                  if (updates.length > 0) {
                    setTransactionData((prev) =>
                      prev.map((item) => {
                        const found = updates.find((u) => u.id === item.id);
                        if (found) {
                          return { ...item, pictures: found.pictures };
                        }
                        return item;
                      })
                    );
                  }
                });
              }
            }
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
                transactionData.map((item, idx) => {
                  // เช็คประเภทไฟล์ถ้ามี item.pictures อยู่ใน object
                  const itemPictures = Array.isArray(item.pictures) ? item.pictures : [];
                  const sampleFile = itemPictures.length > 0 ? (itemPictures[0]?.part || itemPictures[0]?.url || "") : "";
                  const isPdf = sampleFile ? isPdfFile(sampleFile) : false;

                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-start bg-white p-3 rounded-lg shadow-md mb-2"
                    >
                      <div className="flex items-start gap-2 flex-1 min-w-0 mr-2">
                        <img
                          src="/img/icons/point.png"
                          className="h-5 w-5 shrink-0 mt-0.5"
                          alt="point-icon"
                        />
                        <div className="flex-1 min-w-0">
                          {/* use */}
                          {activeTab === "use" && (
                            <>
                              <p className="text-gray-500 text-sm sarabun-font break-words">
                                {item.created_at.split(".")[0]}
                                {["cut-point", "cut point"].includes(
                                  String(item.type || item.page || "")
                                    .toLowerCase()
                                    .trim()
                                )
                                  ? item.remark
                                    ? ` | ${item.remark}`
                                    : ""
                                  : item.page
                                    ? ` | ${item.page}`
                                    : ""}
                              </p>
                              <p className="text-gray-700 text-xs sarabun-font">
                                รหัสรางวัล : {item.reward_code}
                              </p>
                              <p className="text-gray-700 text-xs sarabun-font line-clamp-2 break-words mb-2 leading-relaxed">
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

                                {/* ปุ่มดูรูปภาพ / ดาวน์โหลด PDF */}
                                {(item.status_tran === "RTV" || itemPictures.length > 0) && (
                                  (() => {
                                    const hasPdf = itemPictures.some((p) => isPdfFile(p?.part || p?.url || ""));
                                    const hasImage = itemPictures.some((p) => isImageFile(p?.part || p?.url || ""));

                                    // ถ้ามีข้อมูลรูปหรือไฟล์แล้ว
                                    if (hasPdf && !hasImage) {
                                      return (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewFiles(item, "pdf");
                                          }}
                                          disabled={modalLoading}
                                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-500 rounded-2xl transition cursor-pointer"
                                        >
                                          <FilePdfOutlined />
                                          <span>PDF</span>
                                        </button>
                                      );
                                    }

                                    if (hasPdf && hasImage) {
                                      return (
                                        <>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleViewFiles(item, "image");
                                            }}
                                            disabled={modalLoading}
                                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#00783F] bg-green-50 hover:bg-green-100 border border-[#00783F] rounded-2xl transition cursor-pointer"
                                          >
                                            <PictureOutlined />
                                            <span>รูปภาพ</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleViewFiles(item, "pdf");
                                            }}
                                            disabled={modalLoading}
                                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-500 rounded-2xl transition cursor-pointer"
                                          >
                                            <FilePdfOutlined />
                                            <span>PDF</span>
                                          </button>
                                        </>
                                      );
                                    }

                                    // Default หรือเป็นรูปภาพ (หรือยังไม่ได้โหลด pictures)
                                    return (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewFiles(item, "all");
                                        }}
                                        disabled={modalLoading}
                                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#00783F] bg-green-50 hover:bg-green-100 border border-[#00783F] rounded-2xl transition cursor-pointer"
                                      >
                                        <PictureOutlined />
                                        <span>รูปภาพ</span>
                                      </button>
                                    );
                                  })()
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
                              <p className="text-gray-700 text-sm sarabun-font break-words">
                                {item.document_number
                                  ? "Document No: " + item.document_number
                                  : "Register Point"}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      <p
                        className={`font-bold sarabun-font text-right shrink-0 ${
                          activeTab === "use" ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {renderCampaignLabel(item)} {activeTab === "use" ? `-${item.point}` : `+${item.point}`}
                      </p>
                    </div>
                  );
                })
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
