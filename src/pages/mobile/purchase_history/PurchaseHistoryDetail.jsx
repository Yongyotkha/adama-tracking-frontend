import React, { useState , useEffect } from "react";
import { useParams, useNavigate, useLocation  } from "react-router-dom";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import SectionHeader from "../../../components/mobile/section_header/SectionHeader";
import BackButton from "../../../components/mobile/button/BackButton";
import HeadSectionUser from "../../../components/mobile/head_section_user/HeadSectionUser";
import UserPointsSection from "../../../components/mobile/user_points_section/UserPointsSection";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

// Mock Data for Orders
const orders = [
  {
    id: 1,
    date: "31 ธ.ค. 67 16:16",
    number: "20250000001",
    status: "processing",
    statusLabel: "กำลังดำเนินการ",
    statusColor: "text-orange-500",
    products: [
      { qty: 2, sku: "3027200112", name: "Bumper P 490 EC", price: 22509.20 },
      { qty: 1, sku: "30371013300", name: "Apopo", price: 9281.20 },
      { qty: 2, sku: "308420021510", name: "Hizamaru", price: 7606.40 },
    ],
  },
];

export default function PurchaseHistoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  console.log(location.state.document_number);
  const [historydetail, setHistorydetail] = useState(null);
  const [historydetailItem, setHistorydetailItem] = useState([]);
  const [error, setError] = useState(false);

  const [documentnumber, setDocumentnumber] = useState (location.state.document_number);

    useEffect(() => {
      const fetchPromotionDetail = async (document_number) => {
        setLoading(true);
        try {
          const response = await useServiceAPI.get(paths.pathhistoryShopDetail, {
            platform: "web",
            id: 139, // เปลี่ยนเป็น user id ที่เหมาะสม
            document_number: documentnumber, 

          });
  
          if (response.status === 200 ) {
            setHistorydetail(response.data.data);
            setHistorydetailItem(historydetail.items)
          } else {
            setError(true);
          }
        } catch (err) {
          console.error("Error fetching promotion details:", err);
          setError(true);
        } finally {
          setLoading(false);
        }
      };
  
      fetchPromotionDetail(location.state.document_number);
    }, [location.state.document_number]);


  // Find the order by ID
  // const order = orders.find((o) => o.id === parseInt(id));
  // if (!order) {
  //   return (
  //     <MobileLayout loading={loading}>
  //       <div className="flex flex-col items-center w-full h-full">
  //         <SectionHeader title="ไม่พบคำสั่งซื้อ" icon="/img/icons/trophy.png" />
  //         <p className="text-gray-500 sarabun-font mt-4">ขออภัย, ไม่พบคำสั่งซื้อนี้</p>
  //         <BackButton url="/mobile/history-purchase" />
  //       </div>
  //     </MobileLayout>
  //   );
  // }
  // // Calculate totals
  // const totalItems = order.products.reduce((sum, item) => sum + item.qty, 0);
  // const totalPrice = order.products.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  const totalItems = historydetail?.items?.reduce((sum, item) => sum + item.qty, 0) || 0;
  const totalPrice = historydetail?.items?.reduce((sum, item) => sum + item.totol, 0).toFixed(2) || "0.00";
  
  
  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <HeadSectionUser />

        {/* Points Section */}
        <UserPointsSection />

        {/* Order Detail Section */}
        <SectionHeader title="รายละเอียดการสั่งซื้อ" icon="/img/icons/bill.png" />

        {/* Order Summary */}
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4 mt-4">
          <div className="flex justify-between">
            {/* <p className="text-gray-500 sarabun-font">{historydetail.date}</p> */}
            {/* <p className={`sarabun-font font-semibold ${historydetail.color}`}>{historydetail.mode_name}</p> */}
          </div>

          <div className="flex justify-between mt-1">
            <p className="sarabun-font text-gray-600">เลขที่</p>
            <p className="sarabun-font text-gray-900 font-bold">{documentnumber}</p>
          </div>

          {/* Product Table */}
          <div className="mt-4">
            <h3 className="sarabun-font text-lg font-semibold text-gray-900">รายการสินค้า</h3>
            <div className="border-t mt-2"></div>

            <table className="w-full text-left mt-2 sarabun-font text-sm">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-2">QTY</th>
                  <th className="py-2">SKU</th>
                  <th className="py-2">Product Name</th>
                  <th className="py-2 text-right">Total (THB)</th>
                </tr>
              </thead>
              {/* <tbody>
                {order.products.map((product, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{product.qty}</td>
                    <td className="py-2">{product.sku}</td>
                    <td className="py-2">{product.name}</td>
                    <td className="py-2 text-right">{product.price.toLocaleString("en-US")}</td>
                  </tr>
                ))}
              </tbody> */}
              <tbody>
                {historydetail?.items && historydetail.items.length > 0 ? (
                  historydetail.items.map((product, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{product.qty}</td>
                      <td className="py-2">{product.product_code}</td>
                      <td className="py-2">{product.product_name}</td>
                      <td className="py-2 text-right">
                        {Number(product.totol).toLocaleString("en-US")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      ขออภัย, ไม่พบคำสั่งซื้อนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Order Summary Footer */}
          <div className="mt-4 border-t pt-3">
            <div className="flex justify-between">
              <p className="sarabun-font text-gray-600">จำนวนรายการ</p>
              <p className="sarabun-font font-bold">{totalItems}</p>
            </div>
            <div className="flex justify-between mt-1">
              <p className="sarabun-font text-gray-600">ยอดรวมสุทธิ (บาท)</p>
              <p className="sarabun-font font-bold text-green-700">{Number(totalPrice).toLocaleString("en-US")}
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <BackButton url="/mobile/history-purchase" />
      </div>
    </MobileLayout>
  );
}
