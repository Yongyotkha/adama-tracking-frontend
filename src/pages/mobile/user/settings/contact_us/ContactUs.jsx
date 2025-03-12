import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../../../../components/navbar/NavbarMobile";
import BackButton from "../../../../../components/mobile/button/BackButton";
import { FacebookOutlined, PhoneOutlined } from "@ant-design/icons";

export default function ContactUs() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleCall = () => {
    window.location.href = "tel:026811979"; // โทรออก
  };

  const handleFacebook = () => {
    window.open("https://www.facebook.com/", "_blank"); // เปิด Facebook
  };
  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Head Title */}
        <div className="w-full max-w-md py-4 flex justify-between items-center">
          <h2 className="text-[#009845] text-lg font-semibold sarabun-font">ติดต่อเรา</h2>
        </div>
        <div className="w-full max-w-md space-y-2">
          <div className="shadow-md rounded-lg p-5">
            <h3 className="sarabun-font font-bold text-lg">
              บริษัท อดามา (ประเทศไทย) จำกัด
            </h3>
            <p className="mt-2 sarabun-font">
              127/33 อาคารปัญจธานี ทาวเวอร์ ชั้น 28 ถนน นนทรี แขวงช่องนนทรี เขตยานนาวา กรุงเทพฯ 10120
            </p>
          </div>
          <div className="shadow-md rounded-lg p-5">
            <h3 className="sarabun-font font-bold text-lg">
              ADAMA (Thailand) Limited
            </h3>
            <p className="mt-2 sarabun-font">
              127/33 Panjathani Tower Building 28th foor,
              Nonsi Rd., Chongnonsi, Yannawa, Bangkok 10120 Thailand
            </p>
          </div>
        </div>


        {/* Contact Buttons */}
        <div className="w-full max-w-md mt-4 space-y-2">
          {/* Phone Button */}
          <button
            onClick={handleCall}
            className="w-full py-3 bg-[#009845] rounded-lg text-white sarabun-font flex items-center justify-center space-x-2"
          >
            <img src="/img/icons/tel.png" className="w-6 h-6" alt="" />
            <span className="sarabun-font">02-681-1979</span>
          </button>

          {/* Facebook Button */}
          <button
            onClick={handleFacebook}
            className="w-full py-3 bg-[#00A0DF] rounded-lg text-white sarabun-font flex items-center justify-center space-x-2"
          >
            <img src="/img/icons/facebook.png" className="w-6 h-6" alt="" />
            <span className="sarabun-font">Facebook</span>
          </button>
        </div>

        <BackButton />

      </div>
    </MobileLayout>
  );
}
