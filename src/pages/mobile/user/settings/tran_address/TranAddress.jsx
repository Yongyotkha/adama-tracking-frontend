import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MobileLayout } from "../../../../../components/navbar/NavbarMobile";
import BackButton from "../../../../../components/mobile/button/BackButton";
import useServiceAPI from "../../../../../services/CorsService";
import { paths } from "../../../../../services/CorsPath";
import { AuthContext } from "../../../../../contexts/AuthContext";

export default function TranAddress() {
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathTranAddress, {
          page: "all",
          user_id: userInfo?.id, // ✅ กำหนดค่า user_id จาก context
        });

        if (response.status === 200 && response.result) {
          setAddresses(response.data.data);
          console.log(response);
        } else {
          console.error("❌ Failed to fetch addresses", response);
        }
      } catch (error) {
        console.error("❌ API error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.id) {
      fetchAddresses();
    }
  }, [userInfo]);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Head Title */}
        <div className="w-full max-w-md py-4 flex justify-between items-center">
          <h2 className="text-[#009845] text-lg font-semibold sarabun-font">
            ที่อยู่สำหรับการจัดส่ง
          </h2>
        </div>

        {/* Address List */}
        <div className="w-full max-w-md space-y-3">
          {addresses.length > 0 ? (
            addresses.map((item) => (
              <div key={item.id} className="shadow-md rounded-lg p-4 bg-white">
                <h3 className="sarabun-font font-bold text-base text-[#333]">
                  {item.firstname} {item.lastname} | {item.phoneNumber}
                </h3>
                <p className="mt-1 sarabun-font text-sm text-[#666]">
                  {item.address}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-4 sarabun-font">
              ไม่พบที่อยู่
            </p>
          )}
        </div>

        {/* Add New Address Button */}
        <div className="w-full max-w-md mt-4">
          <button
            onClick={() => navigate("/mobile/tran-address/create")}
            className="w-full py-3 bg-[#009845] rounded-lg text-white sarabun-font flex items-center justify-center space-x-2"
          >
            <img src="/img/icons/expand.png" className="w-6 h-6" alt="" />
            <span className="sarabun-font">เพิ่มที่อยู่ใหม่</span>
          </button>
        </div>

        {/* Back Button */}
        {/* <BackButton url={'/mobile/account'} type={'account'} /> */}
        <BackButton/>
      </div>
    </MobileLayout>
  );
}
