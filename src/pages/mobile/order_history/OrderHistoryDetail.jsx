import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import BackButton from "../../../components/mobile/button/BackButton";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

export default function OrderHistoryDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [historydetail, setHistorydetail] = useState(null);
  const documentNumber = location.state?.document_number;

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathhistoryShopDetail, {
          platform: "web",
          id: userInfo.id,
          document_number: documentNumber,
        });

        if (response.status === 200) {
          setHistorydetail(response.data.data);
        }
      } catch (err) {
        console.error("Error loading order detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (documentNumber) fetchDetail();
  }, [documentNumber]);

  const items = historydetail?.items || [];
  const totalQty = items.reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalPoints = items.reduce((sum, item) => sum + (item.point || 0), 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.totol || 0), 0);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full px-4">
        <HeadSectionUser />
        <UserPointsSection />
        <SectionHeader title="รายละเอียด" icon="/img/icons/bill.png" />

        {/* Order Card */}
        <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-md mt-4">
          <div className="text-sm text-gray-500 sarabun-font">31 ธ.ค. 67 16:16</div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm font-semibold text-gray-700 sarabun-font">เลขที่</p>
            <p className="font-bold text-gray-900">{documentNumber}</p>
          </div>

          {/* Status */}
          <div className="text-green-600 sarabun-font text-sm font-semibold mt-2 text-right">รับสินค้าสำเร็จ</div>

          {/* Product List */}
          <div className="mt-3 border-t pt-2">
            <h3 className="text-green-600 sarabun-font font-semibold">รายการสินค้า</h3>
            <div className="mt-2 space-y-1">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm text-gray-700 sarabun-font">
                  <div className="flex-1">
                    <p>{item.qty} x {item.product_name}</p>
                    <p className="text-xs text-gray-500 sarabun-font">{item.product_code}</p>
                  </div>
                  <p className="w-10 text-center">{item.point}</p>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 border-t pt-2 text-sm text-gray-800">
              <div className="flex justify-between font-semibold">
                <p className="sarabun-font">จำนวนรายการ</p>
                <p>
                  {totalQty} / {totalPoints} คะแนน
                </p>
              </div>
              <div className="flex justify-between font-semibold text-lg text-green-700 mt-1">
                <p className="sarabun-font">ยอดรวมสุทธิ (บาท)</p>
                <p>{totalPrice.toLocaleString("th-TH", { minimumFractionDigits: 1 })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-md mt-6">
          <p className="font-semibold text-gray-700 sarabun-font mb-2">ไฟล์แนบ</p>

          {/* Mock File Image */}
          <div className="border rounded-md p-2 mb-3">
            <img src="/img/mock/invoice-thumbnail.png" alt="Invoice" className="w-full rounded" />
          </div>

          {/* Upload Area */}
          <div className="border rounded-md p-2">
            <p className="text-sm font-semibold text-gray-700 sarabun-font mb-1">
              ถ่ายรูปเพื่อยืนยันการรับสินค้า <span className="text-red-500">*</span>
            </p>
            <img src="/img/mock/location-map.png" alt="Map" className="w-full rounded" />
          </div>
        </div>

        <BackButton url="/mobile/order-history" />
      </div>
    </MobileLayout>
  );
}
