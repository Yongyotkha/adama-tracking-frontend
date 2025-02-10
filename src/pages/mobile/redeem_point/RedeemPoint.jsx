import React, { useState } from "react";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import MenuButton from "../../../components/mobile/button/MenuButton";

export default function RedeemPoint() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <div className="w-full rounded-[40px] flex items-center justify-between relative gap-3 p-1 bg-white max-w-md">
          <div className="flex gap-2 items-center">
            {/* Profile Image */}
            <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden shadow">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsynwv-5qtogtOwJbIjaPFJUmHpzhxgqIAug&s"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="flex flex-col items-start flex-1 text-center">
              <h4 className="text-md font-semibold text-[#A19793] sarabun-font">
                คุณ Krairoek Ruangkol
              </h4>
              <p className="text-[#A19793] sarabun-font text-xs">รหัสสมาชิก : 123456</p>
            </div>
          </div>
          {/* Info Button */}
          <Button className="bg-[#FFB347] text-white rounded-full p-1 sarabun-font text-xs" type="button">
            <span className="sarabun-font text-xs">ข้อมูลของฉัน</span>
          </Button>
        </div>


        {/* Points Section */}
        <div className="w-full max-w-xs flex flex-col items-center mt-4">
          <div
            className="bg-[url('/img/bg-point.png')] bg-[length:100%_100%] bg-center bg-no-repeat text-white rounded-full flex items-center justify-center aspect-[1573/256] w-full"
          >
            <span className="sarabun-font text-md">คุณมี 100 คะแนน</span>
          </div>
          <p className="text-[#A19793] sarabun-font text-xs mt-1">
            คะแนนหมดอายุ : 15 คะแนน | 31 ธ.ค. 67
          </p>
        </div>



        {/* News & Promotions Section */}
        <div className="w-full max-w-md mt-6 px-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[#00783F] text-lg font-semibold sarabun-font">ข่าวสารและโปรโมชั่น</h3>
            <button className="text-[#009845] sarabun-font text-sm">ดูทั้งหมด</button>
          </div>
          <div className="w-full rounded-lg overflow-hidden mt-2 shadow-lg">
            <img
              src="https://source.unsplash.com/featured/?agriculture"
              alt="News Banner"
              className="w-full h-40 object-cover"
            />
          </div>
          {/* Indicator Dots */}
          <div className="flex justify-center mt-2 space-x-1">
            <span className="w-2 h-2 bg-[#009845] rounded-full"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
          </div>
        </div>

        {/* Menu Section */}
        <div className="w-full max-w-md mt-6 px-4 flex flex-col space-y-3">
          <MenuButton
            icon="/img/icons/scan-collect-oa.png"
            text="สแกนเพื่อสะสมคะแนน"
            url="/mobile/scan-collect"
          />
          <MenuButton
            icon="/img/icons/redeem-oa.png"
            text="แลกคะแนนสะสม"
            url="/mobile/redeem"
          />
          <MenuButton
            icon="/img/icons/history-oa.png"
            text="ประวัติการซื้อสินค้า"
            url="/mobile/history-purchase"
          />
          <MenuButton
            icon="/img/icons/history-redeem-oa.png"
            text="ประวัติการแลกคะแนน"
            url="/mobile/history-redeem"
          />
        </div>

      </div>
    </MobileLayout>
  );
}

