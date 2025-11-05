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
import CameraMobile from "../../../components/mobile/camera/CameraMobile";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import { message } from "antd";

export default function CollectPointsDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [historydetail, setHistorydetail] = useState(null);

  // ถ่ายรูปสินค้าที่ได้รับ
  const [productPhotos, setProductPhotos] = useState([]);

  // popup คะแนน
  const [isPointModalVisible, setIsPointModalVisible] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const documentNumber = location.state?.document_number;

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathSalePointReceiveDetail, {
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

    // cleanup objectURL ตอนออกจากหน้า
    return () => {
      productPhotos.forEach((f) => f.url && f.url.startsWith("blob:") && URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentNumber, userInfo?.id]);

  // ---------------- ใช้ products จาก API โดยตรง ----------------
  const products = Array.isArray(historydetail?.products)
    ? historydetail.products.map((p) => ({
      qty: Number(p?.quantity ?? 0),
      product_name: p?.product_name ?? "-",
      product_code: p?.product_code ?? "-",
      packing_list: p?.packing_list ?? "-",
      points: p?.points ?? [],
      point: p?.point ?? "-",
      amount: Number(p?.net_amount ?? 0),
      point_x: Number(p?.point_x ?? 0),
      amount_display:
        typeof p?.net_amount === "string" || typeof p?.net_amount === "number"
          ? new Intl.NumberFormat("th-TH").format(Number(p?.net_amount ?? 0))
          : "0",
      image: p?.product_image || null,
    }))
    : [];


  const totalQtyPoint = products.reduce(
    (sum, item) => sum + item.points.check_point,
    0
  );

  const totalQty = products.reduce((sum, it) => sum + (Number.isFinite(it.qty) ? it.qty : 0), 0);

  const totalPrice = products.reduce(
    (sum, it) => sum + (Number.isFinite(it.amount) ? it.amount : 0),
    0
  );

  const totalPriceDisplay = new Intl.NumberFormat("th-TH").format(totalPrice);

  const displayDateTime =
    historydetail?.document_datetime ||
    (historydetail?.document_date ? `${historydetail.document_date}` : "-");

  let statusText = historydetail?.status_transaction_name;

  if (statusText == 'Waiting for Receive') {
    statusText = 'รอยืนยันรับ'
  } else if (statusText == 'Complete') {
    statusText = 'รับสินค้าสำเร็จ'
  } else if (statusText == 'Draft') {
    statusText = 'แบบร่างรายการ'
  } else if (statusText == 'Waiting for Create') {
    statusText = 'รอสร้างรายการ'
  } else if (statusText == 'Reject') {
    statusText = 'ยกเลิกรายการ'
  }

  const statusTextColor = historydetail?.status_transaction_color || "#0ea5a0";
  const statusBgColor = historydetail?.status_transaction_bg_color || "#e6fffa";

  // ส่งข้อมูลไป pathSalePointReceiveOrder
  const confirm = async () => {
    // รวบรวมเฉพาะ URL จริง (ไม่เอา blob:)
    const productUrls = productPhotos
      .map((f) => f?.url)
      .filter((u) => typeof u === "string" && /^https?:\/\//i.test(u));

    if (productUrls.length === 0) {
      message.error("กรุณาถ่ายและอัปโหลดรูปสินค้าที่ได้รับอย่างน้อย 1 รูป");
      return;
    }

    const payload = {
      product: productUrls,
      document_number: historydetail?.document_number ?? documentNumber ?? "",
    };

    try {
      setLoading(true);
      const res = await useServiceAPI.post(paths.pathSalePointReceiveUpdate, payload);
      console.log(res);
      if (res?.status === 200) {
        const pts = Number(res?.data?.point ?? 0);
        setEarnedPoints(pts);
        setIsPointModalVisible(true);
      } else {
        message.error(res?.data?.message || "บันทึกไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Submit error:", err);
      message.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
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
            <p className="text-sm font-semibold text-gray-900 sarabun-font">เลขที่ {historydetail?.document_number ?? documentNumber ?? "-"}</p>
          </div>

          {/* Status จาก API */}
          <div
            className="sarabun-font text-sm font-semibold mt-2 text-right inline-block px-2 py-1 rounded"
            style={{ color: statusTextColor, backgroundColor: statusBgColor }}
          >
            {statusText}
          </div>

          {/* รายการสินค้า */}
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
                        <p>{item.qty} x {item.product_name}</p>
                        <p className="text-xs text-gray-500">บรรจุ : {item.packing_list}</p>

                        {(item.points.standard_point) > 0 && (
                          <p className="text-xs text-gray-500">
                            คะแนน : {item.points.standard_point}
                          </p>
                        )}

                        {(item.points?.point_x?.length ?? 0) > 0 && (
                          <p className="text-xs text-gray-500">
                            คะแนนโบนัส : {(item.points?.point_x || []).reduce((a, b) => a + b, 0)}
                          </p>
                        )}

                        {(item.points?.point_extra_value?.length ?? 0) > 0 && (
                          <p className="text-xs text-gray-500">
                            Extra Value (สำหรับทดสอบ) : {(item.points?.point_extra_value || []).reduce((a, b) => a + b, 0)}
                          </p>
                        )}

                        {(item.points?.point_extra_point?.length ?? 0) > 0 && (
                          <p className="text-xs text-gray-500">
                            Extra Point (สำหรับทดสอบ): {(item.points?.point_extra_point || []).reduce((a, b) => a + b, 0)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="w-20 text-right">{item.amount_display}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">ไม่มีรายการสินค้า</p>
              )}
            </div>


            {/* --- กล่องพรีวิว: รูปหน้าบิล/ใบสั่งสินค้า จาก API --- */}
            <div className="mt-3">
              <label className="block text-sm text-gray-700 sarabun-font mb-1">
                บิลเงินสดหรือใบสั่งสินค้า
                <span className="text-red-500">*</span>
              </label>
              {historydetail?.bill && historydetail.bill.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {historydetail.bill.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.part}
                      alt={`bill-${idx}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm sarabun-font">ไม่มีรูปภาพ</p>
              )}
            </div>

            {/* --- กล้อง: ถ่ายรูปสินค้าที่ได้รับ* --- */}
            <div className="mt-3">
              <CameraMobile
                label="ถ่ายรูปบิลเงินสดและสินค้าที่ได้รับ (อย่างละ 1 รูป)"
                required
                value={productPhotos}
                onChange={setProductPhotos}
                maxCount={20}
                defaultFacing="environment"
                allowTorch={true}
                uploadOnCapture
                uploadMode="activity"
                uploadExtra={{ document_number: historydetail?.document_number ?? documentNumber }}
                onUploadSuccess={() => {
                  // ถ้าต้องทำอย่างอื่นหลังอัปโหลดสำเร็จ ใส่เพิ่มได้
                }}
              />
            </div>

            {/* Summary */}
            <div className="mt-4 border-t pt-2 text-sm text-gray-800">
              <div className="flex justify-between font-semibold mt-1">
                <p className="sarabun-font">จำนวนรวม (ลัง)</p>
                <p>{totalQty} </p>
              </div>

              <div className="flex justify-between font-semibold mt-1">
                <p className="sarabun-font">คะแนนได้รับ</p>
                <p>{Number(totalQtyPoint ?? 0).toLocaleString("th-TH")} / ปิดแคมเปญ {/*เพิ่มให้ดึงค่ารวม extra point ทั้งหมด*/}</p>
              </div>

              <div className="flex justify-between font-semibold text-lg text-green-700 mt-1">
                <p className="sarabun-font">ยอดรวมสุทธิ (บาท)</p>
                <p>{totalPriceDisplay}</p>
              </div>
            </div>

          </div>
        </div>
        <button
          onClick={confirm}
          className="mt-4 mb-3 w-full max-w-md bg-green-700 text-white py-3 rounded-md sarabun-font"
        >
          ยืนยัน
        </button>
        <BackButton url="/mobile/collect-points" />

        <DynamicPopUp
          visible={isPointModalVisible}
          onConfirm={() => {
            setIsPointModalVisible(false);
            navigate("/mobile/collect-points");
            // จะให้กลับหน้าก่อนหน้าก็ได้:
            // navigate(-1);
          }}
          src="/img/icons/check-circle.png"
          text={`<div class='text-center'>
            <p class='text-[#4A4A4A] text-[16px] mt-1 sarabun-font'>ยินดีด้วยคุณได้รับคะแนน</p>
            <p class='text-green-700 text-[24px] font-bold mt-1 sarabun-font'>${totalQtyPoint} คะแนน</p>
          </div>`}
          confirmText="ปิด"
        />
      </div>
    </MobileLayout>
  );
}
