import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import BackButton from "../../../components/mobile/button/BackButton";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import { Input, Upload, DatePicker } from "antd";
export default function OrderHistoryDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useContext(AuthContext);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historydetail, setHistorydetail] = useState(null);

  const documentNumber = location.state?.document_number;

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathSalePointDetail, {
          platform: "web",
          id: userInfo?.id,
          document_number: documentNumber,
        });


        if (response?.status === 200) {
          setHistorydetail(response.data ?? null);
        } else {
          setHistorydetail(null);
        }
      } catch (err) {
        console.error("Error loading order detail:", err);
        setHistorydetail(null);
      } finally {
        setLoading(false);
      }
    };

    if (documentNumber) fetchDetail();
  }, [documentNumber, userInfo?.id]);

  // ---------------- ใช้ products จาก API โดยตรง (ไม่มี useMemo) ----------------
  const products = Array.isArray(historydetail?.products)
    ? historydetail.products.map((p) => ({
      qty: Number(p?.quantity ?? 0),
      product_name: p?.product_name ?? "-",
      product_code: p?.product_code ?? "-",
      amount: Number(p?.net_amount ?? 0),
      point: Number(p?.point ?? 0),
      amount_display:
        typeof p?.net_amount === "string" || typeof p?.net_amount === "number"
          ? new Intl.NumberFormat("th-TH").format(Number(p?.net_amount ?? 0))
          : "0",
      image: p?.product_image || null,
    }))
    : [];


  const totalQty = products.reduce((sum, it) => sum + (Number.isFinite(it.qty) ? it.qty : 0), 0);
  const totalPrice = products.reduce(
    (sum, it) => sum + (Number.isFinite(it.amount) ? it.amount : 0),
    0
  );
  const totalPriceDisplay = new Intl.NumberFormat("th-TH").format(totalPrice);

  const displayDateTime =
    historydetail?.document_datetime ||
    (historydetail?.document_date ? `${historydetail.document_date}` : "-");

  const statusText =
    historydetail?.status_transaction_name ||
    historydetail?.status_payment_name ||
    historydetail?.status_name ||
    "-";

  const statusTextColor = historydetail?.status_transaction_color || "#0ea5a0";
  const statusBgColor = historydetail?.status_transaction_bg_color || "#e6fffa";

  const confirm = () => {
    console.log('btn confirm')
  };


  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full px-4">
        <HeadSectionUser />
        <UserPointsSection />
        <SectionHeader title="รายละเอียด" icon="/img/icons/bill.png" />

        {/* Order Card */}
        <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-md mt-4">
          <div className="text-sm text-gray-500 sarabun-font">{displayDateTime}</div>

          <div className="flex justify-between items-center mt-1">
            <p className="text-sm font-semibold text-gray-700 sarabun-font">เลขที่</p>
            <p className="font-bold text-gray-900">
              {historydetail?.document_number ?? documentNumber ?? "-"}
            </p>
          </div>

          {/* Status จาก API */}
          <div
            className="sarabun-font text-sm font-semibold mt-2 text-right inline-block px-2 py-1 rounded"
            style={{ color: statusTextColor, backgroundColor: statusBgColor }}
          >
            {statusText}
          </div>

          {/* Product List (เฉพาะ products) */}
          <div className="mt-3 border-t pt-2">
            <h3 className="text-green-600 sarabun-font font-semibold">รายการสินค้า</h3>

            <div className="mt-2 space-y-2">
              {products.length > 0 ? (
                products.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between text-sm text-gray-700 sarabun-font"
                  >
                    <div className="flex gap-3 flex-1">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.product_name}
                          className="w-12 h-12 rounded object-cover border"
                        />
                      ) : null}
                      <div className="flex-1">
                        <p>
                          {item.qty} x {item.product_name}
                        </p>
                        <p className="text-xs text-gray-500">{item.product_code}</p>
                        <p className="text-xs text-gray-500">คะแนน : {item.point}</p>
                      </div>
                    </div>
                    <p className="w-20 text-right">{item.amount_display}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">ไม่มีรายการสินค้า</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 sarabun-font mb-1">
                ถ่ายรูปหน้าบิลเงินสดหรือใบสั่งสินค้า
                <span className="text-red-500">*</span>
              </label>
              <Upload.Dragger
                multiple
                className="rounded-md"
                height={100}
                listType="picture"
                beforeUpload={() => false}
              >
                <p className="text-gray-500 sarabun-font">ลากหรือคลิกเพื่ออัปโหลด</p>
              </Upload.Dragger>
            </div>

            <div>
              <label className="block text-sm text-gray-700 sarabun-font mb-1">
                ถ่ายรูปสินค้าที่ได้รับ<span className="text-red-500">*</span>
              </label>
              <Upload.Dragger
                multiple
                className="rounded-md"
                height={100}
                listType="picture"
                beforeUpload={() => false}
              >
                <p className="text-gray-500 sarabun-font">ลากหรือคลิกเพื่ออัปโหลด</p>
              </Upload.Dragger>
            </div>

            {/* Summary */}
            <div className="mt-4 border-t pt-2 text-sm text-gray-800">
              <div className="flex justify-between font-semibold">
                <p className="sarabun-font">จำนวนรวม</p>
                <p>{totalQty}</p>
              </div>

              <div className="flex justify-between font-semibold text-lg text-green-700 mt-1">
                <p className="sarabun-font">ยอดรวมสุทธิ (บาท)</p>
                <p>{totalPriceDisplay}</p>
              </div>
            </div>


          </div>
        </div>



        <BackButton url="/mobile/collect-points" />
        <button onClick={confirm()}>confirm</button>
      </div>
    </MobileLayout>
  );
}
