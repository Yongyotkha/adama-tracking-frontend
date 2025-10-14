import React, { useState, useEffect } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import BackButton from "../../../components/mobile/button/BackButton";
import DynamicButton from "../../../components/button/DynamicButton";
import useServiceAPI from "../../../services/corsService";
import { paths } from "../../../services/CorsPath";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";

export default function CollectPoints() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("in_progress");

  // เก็บข้อมูลของแต่ละแท็บ (ใช้สำหรับแสดงจำนวนบนแท็บ)
  const [dataByTab, setDataByTab] = useState({
    in_progress: [],
    pre_receive: [],
  });

  // ข้อมูลที่แสดงจริงตามแท็บที่เลือก
  const [orderData, setOrderData] = useState([]);

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  const tabs = [
    { id: "in_progress", label: "สินค้ารอยืนยันรับ", color: "border-orange-500" },
    { id: "pre_receive", label: "รับสินค้าล่วงหน้า", color: "border-green-500" },
  ];

  // -------------------- Fetch: IN PROGRESS (API เดิม) --------------------
  const fetchInProgress = async (setAsActiveList = false) => {
    setLoading(true);
    const { current, pageSize } = tableParams.pagination;



    try {
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
        status_code: "ODW",
        page: "all",
        page_length: current,
        page_size: pageSize,
      };

      const res = await useServiceAPI.get(paths.pathSalePointCollectList, requestData);
      const rows = res?.data?.data?.data ?? res?.data?.data ?? [];
      const mapped = rows.map((item) => ({
        id: item.id,
        document_number: item.document_number,
        date: item.updated_at || item.document_date,
        amount: Number(item.net_amount || 0),
        amount_display:
          item.net_amount_display ??
          new Intl.NumberFormat("th-TH").format(Number(item.net_amount || 0)),
        line_total: Number(item.line_total || 0),
        line_product: Number(item.line_product || 0),
        status_code: item.status_code,
        status_transaction_name: item.status_transaction_name,
        status_interface_name: item.status_interface_name,
        dealer_name: item.dealer_name,
        sub_dealer_name: item.sub_dealer_name,
        status_payment_name: item.status_payment_name,
      }));

      // ตามโจทย์: in_progress ใส่ข้อมูลทั้งหมด ไม่ต้องกรอง status_code
      if (setAsActiveList) setOrderData(mapped);
      setDataByTab((prev) => ({ ...prev, in_progress: mapped }));
    } catch (error) {
      console.error("fetchInProgress error:", error);
      if (setAsActiveList) setOrderData([]);
      setDataByTab((prev) => ({ ...prev, in_progress: [] }));
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Fetch: PRE RECEIVE (เรียกตั้งแต่โหลดหน้า) --------------------
  const fetchPreReceive = async (setAsActiveList = false) => {
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
      status_code: "ODI",
      page: "all",
      page_length: current,
      page_size: pageSize,
    };

    try {
      const res = await useServiceAPI.get(paths.pathSalePointCollectList, requestData);
      const rows = res?.data?.data;
      console.log('rows : ', rows)
      const mapped = rows.map((item) => ({
        id: item.id,
        document_number: item.document_number ?? "-",
        date: item.receive_date,
        dealer_name: item.receive_shop, // ใช้เป็นชื่อแสดง
        amount: Number(item.point || 0),
        amount_display: new Intl.NumberFormat("th-TH").format(Number(item.point || 0)),
        line_total: 0,
        status_code: null,
        status_transaction_name: null,
        status_interface_name: null,
        status_payment_name: null,
      }));

      if (setAsActiveList) setOrderData(mapped);
      // อัปเดตจำนวนบนแท็บให้พร้อมใช้งานตั้งแต่หน้าโหลด
      setDataByTab((prev) => ({ ...prev, pre_receive: mapped }));
    } catch (error) {
      console.error("fetchPreReceive error:", error);
      if (setAsActiveList) setOrderData([]);
      setDataByTab((prev) => ({ ...prev, pre_receive: [] }));
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Effects --------------------
  // 1) โหลดครั้งแรก: ดึง pre_receive ทันที (เพื่อให้ตัวเลข/ข้อมูลพร้อม) + ดึง in_progress สำหรับแท็บเริ่มต้น
  useEffect(() => {
    fetchPreReceive(false);   // พรีโหลดข้อมูล "รับสินค้าล่วงหน้า" สำหรับ badge/จำนวน
    fetchInProgress(true);    // แสดงลิสต์ของ in_progress เป็นค่าเริ่มต้น
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) เมื่อผู้ใช้สลับแท็บ ให้โหลดข้อมูลของแท็บนั้น (และอัปเดตลิสต์แสดงผล)
  useEffect(() => {
    if (activeTab === "in_progress") {
      fetchInProgress(true);
    } else {
      fetchPreReceive(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // (ถ้าต้องการให้ pagination เปลี่ยนแล้วรีโหลดทั้งสองแท็บ แจ้งมาได้ เดี๋ยวผมเพิ่มให้ครับ)

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
              <span className="ml-1 text-red-600">
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
                      className="flex justify-between items-start p-4 bg-white rounded-lg shadow-md border-l-4 border-green-500"
                      onClick={() =>
                        navigate("/mobile/collect-points/detail", {
                          state: { document_number: order.document_number },
                        })
                      }
                    >
                      <div className="flex flex-col">
                        <p className="text-gray-500 sarabun-font text-sm">{order.date}</p>
                        <p className="text-gray-900 sarabun-font text-sm font-bold mt-1">
                          เลขที่ {order.document_number}
                        </p>
                        {/* {(order.dealer_name || order.sub_dealer_name) && (
                          <p className="text-gray-600 sarabun-font text-xs mt-1">
                            {order.dealer_name ?? order.sub_dealer_name}
                          </p>
                        )} */}
                      </div>
                      <div className="flex flex-col items-end text-right">
                        <p className="sarabun-font text-sm font-semibold" style={{ color: "rgb(117, 33, 87)" }}>
                          รอยืนยันรับ
                        </p>
                        <p className="text-gray-700 sarabun-font text-xs font-semibold mt-1">
                          {order.line_product} รายการ / รวม {order.amount_display}
                        </p>
                      </div>
                    </div>
                  );
                } else {
                  // pre_receive (point)
                  return (
                    <div
                      key={index}
                      className="p-4 bg-white rounded-lg shadow-md border-l-4 border-green-500"
                    >
                      <p className="text-gray-900 sarabun-font text-sm">{order.document_datetime}</p>
                      <p className="text-gray-900 sarabun-font text-sm font-bold mt-1">
                        {`เลขที่ ${order.document_number}`}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex gap-2">
                          <button className="bg-green-600 text-white px-3 py-1 rounded-md text-sm"
                            onClick={() =>
                              navigate("/mobile/collect-points/advance-notice-update", {
                                state: { receive_id: order.id },
                              })
                            }
                          >
                            ✎ แก้ไข
                          </button>
                          <button className="border border-gray-300 text-gray-600 px-3 py-1 rounded-md text-sm"
                            onClick={() =>
                              navigate("/mobile/collect-points/advance-notice-update", {
                                state: { receive_id: order.id },
                              })
                            }
                          >
                            🗑 ลบ
                          </button>
                        </div>
                        <p className="text-orange-600 sarabun-font text-sm font-semibold">
                          รอดำเนินการ
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
