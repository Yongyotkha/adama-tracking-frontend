import React, { useEffect, useState, useContext } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { Input, DatePicker, message } from "antd";
import DynamicButton from "../../../components/button/DynamicButton";
import BackButton from "../../../components/mobile/button/BackButton";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import CameraMobile from "../../../components/mobile/camera/CameraMobile";
import MobileCameraAuto from "../../../components/mobile/camera/MobileCameraAuto";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
export default function CollectPointsAdvance() {
  const [loading, setLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  console.log('userInfo : ', userInfo)
  const documentNumber = location.state?.document_number;
  const [historydetail, setHistorydetail] = useState(null);
  const [billPhotos, setBillPhotos] = useState([]);      // * หน้าบิล/ใบสั่งสินค้า
  const [productPhotos, setProductPhotos] = useState([]); // * สินค้าที่ได้รับ
  const [productBills, setProductBills] = useState([]); // * สินค้าที่ได้รับ
  const [user, setUser] = useState(null);
  const [receiveDate, setReceiveDate] = useState("");
  const [receiveShop, setReceiveShop] = useState("");
  const [isPointModalVisible, setIsPointModalVisible] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathProfileDetail, { id: userInfo.id });

        if (response.status === 200 && response.result) {


          setUser(response.data);
          console.log('response.data.dealer.dealer_name_th : ', response.data.dealer.dealer_name_th)
          if (response.data.dealer.dealer_name_th) {
            setReceiveShop(response.data.dealer.dealer_name_th)
          }


          console.log('user : ', user)
        } else {
          console.error("Failed to fetch user profile:", response);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    setLoading(false);
    return () => {
      productBills.forEach((f) => f.url && URL.revokeObjectURL(f.url));
      productPhotos.forEach((f) => f.url && URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (productBills.length === 0 || productPhotos.length === 0) {
      message.error("กรุณากรอกข้อมูลให้ครบในช่องที่มีเครื่องหมาย *");
      return;
    }
    console.log('productBills : ', productBills)
    console.log('productPhotos : ', productPhotos)

    // รวบรวมเฉพาะ URL จริง (ไม่เอา blob:)
    const productUrls = productPhotos
      .map((f) => f?.url)
      .filter((u) => typeof u === "string" && /^https?:\/\//i.test(u));

    if (productUrls.length === 0) {
      message.error("กรุณาถ่ายและอัปโหลดรูปสินค้าที่ได้รับอย่างน้อย 1 รูป");
      return;
    }

    const billUrls = productBills
      .map((f) => f?.url)
      .filter((u) => typeof u === "string" && /^https?:\/\//i.test(u));

    if (billUrls.length === 0) {
      message.error("กรุณาถ่ายและอัปโหลดรูปสินค้าที่ได้รับอย่างน้อย 1 รูป");
      return;
    }

    const payload = {
      product: productUrls,
      bill: billUrls,
      receive_date: receiveDate,   // มาจาก DatePicker
      receive_shop: receiveShop    // มาจาก Input
    };

    try {
      setLoading(true);
      const res = await useServiceAPI.post(paths.pathSalePointReceive, payload);
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

    setIsSuccessModalVisible(true);
  };

  return (
    <MobileLayout loading={loading}>
      <div className="w-full max-w-md mx-auto px-4 pb-8">
        <h2 className="text-green-700 text-lg font-bold mt-4 sarabun-font">
          แจ้งรับสินค้าล่วงหน้า
        </h2>

        {/* Form */}
        <div className="mt-4 space-y-4 sarabun-font">
          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              วันที่แจ้งรับสินค้าล่วงหน้า<span className="text-red-500">*</span>
            </label>
            <DatePicker
              required
              format="YYYY-MM-DD"     // ใช้ format ที่ backend ต้องการ
              className="w-full h-10 rounded-md text-gray-700 sarabun-font"
              placeholder="เลือกวันที่"
              onChange={(_, dateString) => setReceiveDate(dateString)}   // เก็บเป็น string
            />
          </div>

          {/* <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              ชื่อร้านยี่ปั๊ว
            </label>
            <Input
              disabled
              placeholder="ระบุชื่อร้าน"
              className="h-10 rounded-md sarabun-font"
              value={receiveShop}
              onChange={(e) => setReceiveShop(e.target.value)}   // เก็บชื่อร้าน
            />
          </div> */}

          <div>
           <label className="block text-sm text-gray-700 sarabun-font mb-1">
           ชื่อร้านยี่ปั๊ว<span className="text-red-500">*</span>
           </label>
           <Input
           value={user?.dealer.dealer_name_en ?? ""}
           disabled
           className="h-10 rounded-md sarabun-font bg-gray-100"
           />
          </div>

          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              ชื่อร้านค้า
            </label>
            <Input
              value={user?.shop_name ?? ""}      // ⬅️ ดึงจาก API
              disabled
              className="h-10 rounded-md sarabun-font bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 sarabun-font mb-1">
              เบอร์โทรศัพท์มือถือ
            </label>
            <Input
              value={user?.phone_number ?? ""}    // ⬅️ ดึงจาก API
              disabled
              className="h-10 rounded-md sarabun-font bg-gray-100"
            />
          </div>


          <div className="mt-3">
            <CameraMobile
              label="ถ่ายรูปบิลเงินสดหรือใบสั่งสินค้า"
              required
              value={productBills}
              onChange={setProductBills}
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

          <div className="mt-3">
            <CameraMobile
              label="ถ่ายรูปสินค้าที่ได้รับ"
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

          {/* ปุ่มบันทึก */}
          <DynamicButton
            text="บันทึก"
            className="w-full bg-green-700 text-white py-3 rounded-md mt-6 sarabun-font"
            onClick={handleSubmit}
          />
        </div>

        <BackButton url="/mobile/main" />

        {/* Success Modal */}
        <DynamicPopUp
          visible={isSuccessModalVisible}
          onConfirm={() => {
            setIsSuccessModalVisible(false);
            navigate(-1);
          }}
          src="/img/icons/check-circle.png"
          text={`<div class='text-center'>
              <p class='text-[#4A4A4A] text-[18px] mt-1 sarabun-font'>ส่งข้อมูลสำเร็จ</p>
              <p class='text-[#A1A1A1] text-[14px] mt-1 sarabun-font'>รอดำเนินการจากทางเจ้าหน้าที่</p>
            </div>`}
          cancelText="ยกเลิก"
          confirmText="ยืนยัน"
        />
      </div>
    </MobileLayout>
  );
}
