import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import BackButton from "../../../components/mobile/button/BackButton";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

/* ============ Utilities ============ */
const sumArray = (arr) =>
  (Array.isArray(arr) ? arr : []).reduce((a, b) => a + Number(b ?? 0), 0);

const nf = (n) => new Intl.NumberFormat("th-TH").format(Number(n ?? 0));

const statusMapTH = (en) => {
  switch (en) {
    case "Waiting for Receive":
      return "รอรับพัสดุ";
    case "Complete":
      return "รับสินค้าสำเร็จ";
    case "Draft":
      return "แบบร่างรายการ";
    case "Waiting for Create":
      return "รอสร้างรายการ";
    case "Reject":
      return "ยกเลิกรายการ";
    default:
      return en || "-";
  }
};

const StatusBadge = ({ text, fg = "#0ea5a0", bg = "#e6fffa" }) => (
  <span
    className="px-2 py-0.5 rounded-full text-xs font-medium"
    style={{ color: fg, backgroundColor: bg }}
  >
    {text}
  </span>
);

/* ============ Page ============ */
export default function PointHistoryDetail() {
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
        const res = await useServiceAPI.get(paths.pathSalePointReceiveDetail, {
          platform: "web",
          id: userInfo?.id,
          document_number: documentNumber,
        });

        if (res?.status === 200) {
          setHistorydetail(res.data ?? null);
        } else {
          setHistorydetail(null);
        }
      } catch (e) {
        console.error("Error loading order detail:", e);
        setHistorydetail(null);
      } finally {
        setLoading(false);
      }
    };

    if (documentNumber) fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentNumber, userInfo?.id]);

  /* ---------- Derived data ---------- */
  const displayDateTime =
    historydetail?.document_datetime ||
    (historydetail?.document_date ?? "-");

  const statusTextRaw =
    historydetail?.status_transaction_name ||
    historydetail?.status_payment_name ||
    historydetail?.status_name ||
    "-";

  const statusText = statusMapTH(statusTextRaw);
  const statusTextColor = historydetail?.status_transaction_color || "#0ea5a0";
  const statusBgColor = historydetail?.status_transaction_bg_color || "#e6fffa";

  const products = useMemo(() => {
    if (!Array.isArray(historydetail?.products)) return [];
    return historydetail.products.map((p) => {
      const qty = Number(p?.quantity ?? 0);
      const amount = Number(p?.net_amount ?? 0);
      const pointXSum = sumArray(p?.points?.point_x);
      const extraPointSum = sumArray(p?.points?.point_extra_point);
      const extraValueSum = sumArray(p?.points?.point_extra_value);

      return {
        qty,
        product_name: p?.product_name ?? "-",
        product_code: p?.product_code ?? "-",
        packing_list: p?.packing_list ?? "-",
        amount,
        amount_display: nf(amount),
        points: p?.points ?? {},
        master_point: Number(p?.points?.standard_point ?? 0),
        x_point: pointXSum,
        extra_point: extraPointSum,
        extra_value: extraValueSum,
      };
    });
  }, [historydetail]);

  const summary = useMemo(() => {
    const totalQty = products.reduce((s, it) => s + (Number.isFinite(it.qty) ? it.qty : 0), 0);
    const totalAmount = products.reduce((s, it) => s + (Number.isFinite(it.amount) ? it.amount : 0), 0);

    // รวม check_point (คะแนนที่ใช้ตัดสินรวม)
    const totalCheckPoint = products.reduce(
      (s, it) => s + Number(it?.points?.check_point ?? 0),
      0
    );

    // รวม Extra (point + value) ของทั้งบิล
    const totalExtraAccum = products.reduce(
      (s, it) => s + (Number(it.extra_point) + Number(it.extra_value)),
      0
    );

    // รวม X Point (ถ้ามี)
    const totalXPoint = products.reduce((s, it) => s + Number(it.x_point ?? 0), 0);

    // รวม Master Point (standard_point)
    const totalMasterPoint = products.reduce(
      (s, it) => s + Number(it.master_point ?? 0),
      0
    );

    return {
      totalQty,
      totalAmount,
      totalAmountDisplay: nf(totalAmount),
      totalCheckPoint,
      totalExtraAccum,
      totalXPoint,
      totalMasterPoint,
    };
  }, [products]);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full min-h-full px-4 pb-20">
        {/* ส่วนหัวผู้ใช้ + คะแนน (ถ้าไม่ต้องการสามารถลบ 2 บรรทัดนี้ได้) */}
        <HeadSectionUser />
        <UserPointsSection />

        <SectionHeader title="รายละเอียดสะสมคะแนน" icon="/img/icons/bill.png" />

        {/* Order Card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 w-full max-w-md mt-4">
          {/* แถวบน: วันที่/เลขที่/สถานะ */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-xs text-gray-500 sarabun-font">{displayDateTime}</div>
              <p className="text-sm font-semibold text-gray-900 sarabun-font mt-1">
                เลขที่ {historydetail?.document_number ?? documentNumber ?? "-"}
              </p>
              {/* {(historydetail?.dealer_name || historydetail?.sub_dealer_name) && (
                <p className="text-xs text-gray-500 sarabun-font mt-1">
                  {historydetail?.dealer_name}
                  {historydetail?.sub_dealer_name ? ` • ${historydetail?.sub_dealer_name}` : ""}
                </p>
              )} */}
            </div>

          </div>

          {/* สินค้า */}
          <div className="mt-4 border-t pt-3">
            <h3 className="text-green-600 sarabun-font font-semibold">รายการสินค้า</h3>

            <div className="mt-2 space-y-3">
              {products.length > 0 ? (
                products.map((item, idx) => (
                  <div
                    key={`${item.product_code}-${idx}`}
                    className="rounded-xl border border-gray-100 p-3"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm sarabun-font text-gray-900">
                          {item.qty} × {item.product_name}
                        </p>
                        <p className="text-[11px] text-gray-500 sarabun-font mt-0.5">
                          บรรจุ: {item.packing_list}
                        </p>
                      </div>

                    </div>

                    {/* คะแนนต่อบรรทัด */}
                    {/* คะแนนต่อบรรทัด — UPDATED: ไม่แบ่งครึ่ง, ชิดซ้าย */}
                    <div className="mt-2 space-y-1 text-[12px] text-gray-600 sarabun-font">
                      <div className="flex justify-between">
                        <span>คะแนน</span>
                        <span className="font-medium">{nf(item.master_point)}</span>
                      </div>
                      {item.x_point > 0 && (
                        <div className="flex justify-between">
                          <span>คะแนนโบนัส</span>
                          <span className="font-medium">{nf(item.x_point)}</span>
                        </div>
                      )}
                      {item.extra_point > 0 && (
                        <div className="flex justify-between">
                          <span>Extra (Point)</span>
                          <span className="font-medium">{nf(item.extra_point)}</span>
                        </div>
                      )}
                      {item.extra_value > 0 && (
                        <div className="flex justify-between">
                          <span>Extra (Value)</span>
                          <span className="font-medium">{nf(item.extra_value)}</span>
                        </div>
                      )}
                      {/* {Number(item?.points?.check_point ?? 0) > 0 && (
                        <div className="flex justify-between">
                          <span>Check Point</span>
                          <span className="font-semibold text-green-700">
                            {nf(item?.points?.check_point)}
                          </span>
                        </div>
                      )} */}
                    </div>

                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm sarabun-font">ไม่มีรายการสินค้า</p>
              )}
            </div>

            {/* สรุปผลรวม */}

            <div className="mt-4 border-t pt-3">
              <div className="h-3" />
              <div className="grid grid-cols-1 gap-y-2 text-sm sarabun-font">
                <div className="flex justify-between text-gray-700">
                  <span>คะแนน</span> {/* คะแนน Master Point */}
                  <span className="font-medium text-right">{nf(summary.totalMasterPoint)}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>คะแนนโบนัส</span> {/* คะแนน X Point */}
                  <span className="font-medium text-right">{nf(summary.totalXPoint)}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>คะแนนสะสมพิเศษ</span> {/* รวมคะแนน Extra Point */}
                  <span className="font-medium text-right">{nf(summary.totalExtraAccum)}</span>
                </div>

                <div className="flex justify-between text-gray-900 font-semibold">
                  <span>คะแนนรวมได้รับ</span>
                  <span className="text-green-700 text-right">
                    {nf(summary.totalCheckPoint)} คะแนน
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ปุ่มกลับ */}
        <div className="w-full max-w-md mt-4">
          <BackButton />
        </div>
      </div>
    </MobileLayout>
  );
}
