import React, { useState, useEffect, useContext } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import BackButton from "../../../components/mobile/button/BackButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import { Spin } from "antd";

export default function OrderHistory() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");
  const [orderData, setOrderData] = useState([]);
  const { userInfo } = useContext(AuthContext);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });
  const tabs = [
    // { id: "1", label: "รับสินค้าสำเร็จ", color: "text-green-600", border: "border-green-500" },
    // { id: "2", label: "รับสินค้าไม่สำเร็จ", color: "text-red-600", border: "border-red-500" },
  ];

  useEffect(() => {
    const fetchOrderHistory = async () => {
      setLoading(true);
      setOrderData([]); // 💡 Clear old data before loading
      try {
        console.log(activeTab)

        let send_status_code = 'ODC'
        if (activeTab == 2) {
          send_status_code = 'ODW'
        }

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
          status_code: send_status_code,
          page: "all",
          page_length: current,
          page_size: pageSize,
        };

        const response = await useServiceAPI.get(paths.pathSalePointCollectList, requestData);

        if (response.status === 200) {
          const rawData = response.data.data ?? [];
          console.log('rawData : ', rawData)
          setOrderData(rawData);
        } else {
          setOrderData([]);
        }
      } catch (error) {
        console.error("Error fetching order history:", error);
        setOrderData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [activeTab]);

  return (
    <MobileLayout loading={false}>
      <div className="flex flex-col items-center w-full h-full">
        <HeadSectionUser />
        <UserPointsSection />
        <SectionHeader title="รายละเอียดการสั่งซื้อ" icon="/img/icons/bill.png" />


        <div className="w-full max-w-md mt-4">
          <h5 className="sarabun-font text-gray-700">รายการทั้งหมด {orderData.length} รายการ</h5>
          <div className="mt-2 space-y-3 min-h-[24px] flex flex-col justify-center items-center">
            {loading ? (
              <Spin className="py-5" />
            ) : orderData.length > 0 ? (
              orderData.map((order, index) => {
                const isComplete = activeTab == 1;
                console.log('activeTab : ',activeTab)
                const statusColor = isComplete ? "text-green-600" : "text-red-500";
                const borderColor = isComplete ? "border-green-500" : "border-red-500";

                return (
                  <div
                    key={index}
                    onClick={() =>
                      navigate("/mobile/order-history/detail", {
                        state: { document_number: order.document_number },
                      })
                    }
                    className={`flex justify-between items-start p-4 bg-white rounded-lg shadow-md border-l-4 ${borderColor} cursor-pointer w-full`}
                  >
                    <div className="flex flex-col">
                      <p className="text-gray-500 sarabun-font text-sm">{order.updated_at}</p>
                      <p className="text-gray-900 sarabun-font text-sm font-bold mt-1">
                        เลขที่ {order.document_number}
                      </p>
                    </div>

                    <div className="flex flex-col items-end text-right">
                      <p className={`sarabun-font font-semibold ${statusColor}`}>
                        {isComplete ? "รับสินค้าสำเร็จ" : "รับสินค้าไม่สำเร็จ"}
                      </p>
                      <p className="text-gray-700 sarabun-font text-xs font-semibold mt-1">
                        {order.line_product} รายการ/คะแนน {Number(order.point ?? 0).toLocaleString()}
                        {/* {order.line_product} รายการ/รวม{order.net_amount_display}/คะแนน {Number(order.point ?? 0).toLocaleString()} */}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500">ไม่มีข้อมูล</p>
            )}
          </div>
        </div>

        <BackButton url={"/mobile/main"} />
      </div>
    </MobileLayout>
  );
}
