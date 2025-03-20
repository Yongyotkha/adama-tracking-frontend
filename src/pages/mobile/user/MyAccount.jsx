import React, { useEffect, useState } from "react";
import { Modal, Button, Spin } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  FileTextOutlined,
  LockOutlined,
  QuestionCircleOutlined,
  PhoneOutlined,
  LogoutOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import BackButton from "../../../components/mobile/button/BackButton";
import MainButton from "../../../components/mobile/button/MainButton";
import LogOutPopUp from "../../../components/mobile/popup/LogOutPopUp";
import liff from "@line/liff";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function MyAccount() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await useServiceAPI.get(paths.pathProfileDetail, { id: 1 });

        if (response.status === 200 && response.result && response.data) {
          setUser(response.data); // Set user data
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

  const handleLogout = () => {
    setIsLogoutModalOpen(true); // Open the modal
  };

  const confirmLogout = async () => {
    setIsLogoutModalOpen(false);
    try {
      if (liff.isLoggedIn()) {
        await liff.logout();
        console.log("User logged out from LIFF");
      }
    } catch (error) {
      console.error("LIFF Logout Error:", error);
    }
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authSession");
    navigate("/mobile/login");
    window.location.reload();
  };

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {loading ? (
          <Spin tip="Loading" size="large" fullscreen spinning={loading} />
        ) : (
          <>
            <div className="w-full rounded-b-[40px] flex items-center relative gap-2 max-w-md">
              <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden shadow">
                <img
                  src={user?.profile_image || "/img/icons/profile.png"}
                  alt="Profile"
                  className="w-full h-full object-cover shadow"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold mt-3 text-[#A19793] sarabun-font">
                  {user?.name_th || user?.name_en}
                </h2>
                <p className="text-[#A19793] sarabun-font">
                  รหัสสมาชิก : {user?.id || "ไม่พบข้อมูล"}
                </p>
              </div>
            </div>

            <div className="w-full max-w-md mt-6 flex flex-col flex-grow">
              <div className="mt-4 space-y-2">
                <MainButton
                  type="link"
                  to="/mobile/main"
                  icon={<HomeOutlined className="text-lg text-gray-500" />}
                  label="หน้าหลัก"
                />
                <MainButton
                  type="button"
                  icon={<UserOutlined className="text-lg text-gray-500" />}
                  label="ข้อมูลส่วนตัว"
                  onClick={() => navigate("/mobile/user/detail", { state: { id: user?.id } })}
                />

                <div className="sarabun-font pt-2">การตั้งค่า</div>
                <MainButton type="link" to="/mobile/terms-conditions" icon={<FileTextOutlined className="text-lg text-gray-500" />} label="ข้อตกลงและเงื่อนไข" />
                <MainButton type="link" to="/mobile/privacy-policy" icon={<LockOutlined className="text-lg text-gray-500" />} label="นโยบายความเป็นส่วนตัว" />
                <MainButton type="link" to="/mobile/faq" icon={<QuestionCircleOutlined className="text-lg text-gray-500" />} label="คำถามที่พบบ่อย" />
                <MainButton type="link" to="/mobile/contact-us" icon={<PhoneOutlined className="text-lg text-gray-500" />} label="ติดต่อเรา" />

                <MainButton
                  type="button"
                  icon={<LogoutOutlined className="text-lg text-red-500" />}
                  label="ออกจากระบบ"
                  onClick={handleLogout}
                  className="text-red-500"
                />
              </div>
            </div>

            <LogOutPopUp
              isOpen={isLogoutModalOpen}
              onCancel={() => setIsLogoutModalOpen(false)}
              onConfirm={confirmLogout}
            />

            <BackButton />
          </>
        )}
      </div>
    </MobileLayout>
  );
}
