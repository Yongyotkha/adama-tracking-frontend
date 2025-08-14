import React, { useState, useEffect, useMemo } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import BackButton from "../../../components/mobile/button/BackButton";
import DynamicButton from "../../../components/button/DynamicButton";
import useServiceAPI from "../../../services/corsService";
import { paths } from "../../../services/CorsPath";


// ⚠️ ถ้าคุณมี hook/useServiceAPI และ paths อยู่แล้ว ให้ import ให้ถูกทางของโปรเจกต์คุณ
// ตัวอย่าง:
// import { useServiceAPI } from "@/hooks/useServiceAPI";
// import paths from "@/constants/paths";

export default function CollectPoints() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("in_progress");

  // เก็บข้อมูลที่มาจาก API แยกตามแท็บ
  const [dataByTab, setDataByTab] = useState({
    in_progress: [],
    pre_receive: [],
  });

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  // tab กำหนดเองให้ตรงกับ UI ที่ออกแบบไว้
  const tabs = [
    { id: "in_progress", label: "สินค้ารอยืนยันรับ", color: "border-orange-500" },
    { id: "pre_receive", label: "รับสินค้าล่วงหน้า", color: "border-green-500" },
  ];

  // เลือกข้อมูลตามแท็บที่กำลัง active


  // ✅ ดึงข้อมูลจริงจาก API (แทน mockData)

  const [orderData, setOrderData] = useState([]);
  const fetchData = async () => {
    setLoading(true);
    const { current, pageSize } = tableParams.pagination;
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
      page: "all",
      page_length: current,
      page_size: pageSize,
    };

    try {

      const res = await useServiceAPI.get(paths.pathSalePointList, requestData);
      const rows = res?.data?.data?.data ?? [];

      // แปลงข้อมูลจาก API -> รูปแบบที่ UI ใช้
      const mapped = rows.map((item) => ({
        document_number: item.document_number,
        date: item.updated_at || item.document_date,
        amount: Number(item.net_amount || 0),
        amount_display: item.net_amount_display ?? new Intl.NumberFormat("th-TH").format(Number(item.net_amount || 0)),
        line_total: 0, // API ไม่มี field นี้ในตัวอย่าง
        status_code: item.status_code,
        status_transaction_name: item.status_transaction_name,
        status_interface_name: item.status_interface_name,
        dealer_name: item.dealer_name,
        sub_dealer_name: item.sub_dealer_name,
        status_payment_name: item.status_payment_name,
      }));

      // กรองข้อมูลตามแท็บ active ปัจจุบัน
      if (activeTab === "in_progress") {
        setOrderData(
          mapped.filter(
            (x) => x.status_code === "ODW" || x.status_transaction_name === "Waiting for Approve"
          )
        );
      } else {
        setOrderData(mapped.filter((x) => x.status_interface_name === "Draft"));
      }
    } catch (error) {
      console.error("fetchData error:", error);
      setOrderData([]);
    } finally {
      setLoading(false);
    }
  };

  // ...
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        <HeadSectionUser />
        <UserPointsSection />

        <DynamicButton
          text="ถ่ายรูปสินค้ากรณีได้รับสินค้าล่วงหน้า"
          iconSrc="/img/icons/camera.png"
          className="text-white px-4 py-3 rounded-[4px] bg-[#752157] w-full max-w-md mt-6 sarabun-font"
          onClick={() => navigate("/mobile/collect-points/advance-notice")}
        />

        <SectionHeader title="รายการรับสินค้า" icon="/img/icons/bill.png" />

        {/* Tabs */}
        <div className="w-full max-w-md mt-4 flex space-x-3 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-semibold text-center sarabun-font ${activeTab === tab.id ? "border-b-2 text-green-600 border-green-500" : "text-gray-500"
                }`}
            >
              {tab.label}{" "}
              <span className="ml-1 text-pink-600">
                {dataByTab[tab.id]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="w-full max-w-md mt-4">
          <h5 className="sarabun-font text-gray-700">
            รายการทั้งหมด {orderData.length} รายการ
          </h5>
          <div className="mt-2 space-y-3">
            {orderData.length > 0 ? (
              orderData.map((order, index) => {
                if (activeTab === "in_progress") {
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-start p-4 bg-white rounded-lg shadow-md border-l-4 border-orange-500"
                      onClick={() =>
                        navigate("/mobile/order-history/detail", {
                          state: { document_number: order.document_number },
                        })
                      }
                    >
                      <div className="flex flex-col">
                        <p className="text-gray-500 sarabun-font text-sm">
                          {order.date}
                        </p>
                        <p className="text-gray-900 sarabun-font font-bold mt-1">
                          เลขที่ {order.document_number}
                        </p>
                        {(order.dealer_name || order.sub_dealer_name) && (
                          <p className="text-gray-600 sarabun-font text-xs mt-1">
                            {order.dealer_name ?? order.sub_dealer_name}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <p className="text-orange-600 sarabun-font text-sm font-semibold">
                          รอยืนยันรับ
                        </p>
                        <p className="text-gray-700 sarabun-font text-sm font-semibold mt-1">
                          รายการ {order.line_total} / {order.amount_display}
                        </p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={index}
                      className="p-4 bg-white rounded-lg shadow-md border-l-4 border-green-500"
                    >
                      <p className="text-gray-500 sarabun-font text-sm">
                        {order.date}
                      </p>
                      <p className="text-gray-900 sarabun-font font-bold mt-1">
                        {order.dealer_name ?? order.sub_dealer_name ?? `เลขที่ ${order.document_number}`}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex gap-2">
                          <button className="bg-green-600 text-white px-3 py-1 rounded-md text-sm">
                            ✎ แก้ไข
                          </button>
                          <button className="border border-gray-300 text-gray-600 px-3 py-1 rounded-md text-sm">
                            🗑 ลบ
                          </button>
                        </div>
                        <p className="text-orange-600 text-sm">
                          รับสินค้าล่วงหน้า ({order.amount_display})
                        </p>
                      </div>
                    </div>
                  );
                }
              })
            ) : (
              <p className="text-center text-gray-500 mt-4">ไม่มีข้อมูล</p>
            )}
          </div>
        </div>

        <BackButton url="/mobile/main" />
      </div>
    </MobileLayout>
  );
}
