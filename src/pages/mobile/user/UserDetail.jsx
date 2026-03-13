import React, { useEffect, useState } from "react";
import { Card, Button, Spin } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate, useLocation } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import BackButton from "../../../components/mobile/button/BackButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function UserDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.id || 1; // Default to 1 if no ID is passed
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  console.log(userId);


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await useServiceAPI.get(paths.pathProfileDetail, { id: userId });

        if (response.status === 200 && response.result && response.data) {
          setUser(response.data);
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
  }, [userId]);

  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {loading ? (
          <Spin tip="Loading" size="large" fullscreen spinning={loading} />
        ) : (
          <>
            {/* Header Section */}
            <div className="w-full max-w-md py-4 flex justify-between items-center">
              <h2 className="text-[#009845] text-lg font-semibold sarabun-font">ข้อมูลสมาชิก</h2>
            </div>

            {/* Profile Info Section */}
            <div className="w-full max-w-md mt-4">
              <div className="flex justify-between items-center">
                <div className="w-24 h-24 rounded-full object-cover mb-2 ">
                  <img
                    src={user?.profile_image || "/img/icons/profile.png"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover mb-2 cursor-pointer shadow-lg"
                  />
                </div>
                <Button
                  type="primary"
                  className="bg-[#009845] rounded-lg sarabun-font flex items-center"
                  // onClick={() => navigate("/mobile/user/edit", { state: { user } })}
                  onClick={() =>
                    navigate("/mobile/user/edit", {
                      state: {
                        id: userId,
                        user: user
                      },
                    })
                  }

                >
                  <EditOutlined className="mr-1" />
                  <span className="sarabun-font">แก้ไขข้อมูลสมาชิก</span>
                </Button>
              </div>
            </div>

            {/* User Details Section */}
            <div className="w-full max-w-md mt-4">
              <Card className="rounded-xl shadow-md">
                <div className="space-y-4 text-gray-700">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 sarabun-font">รหัสสมาชิก</span>
                    <span className="sarabun-font">{user?.user_code || "-"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 sarabun-font">ชื่อร้าน</span>
                    <span className="sarabun-font">{user?.shop_name || "-"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 sarabun-font">ชื่อ-นามสกุล</span>
                    <span className="sarabun-font">{user?.name_th || "-"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 sarabun-font">วันเดือนปีเกิด</span>
                    <span className="sarabun-font">{user?.contact_birth_date_year || "-"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 sarabun-font">เบอร์โทรศัพท์</span>
                    <span className="sarabun-font">{user?.phone_number || "-"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 sarabun-font">ไลน์ไอดี</span>
                    <span className="sarabun-font">{user?.line_id ? user?.line_id : "-"}</span>
                  </div>
                  {/* <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 sarabun-font">อีเมล</span>
                    <span className="sarabun-font">{user?.email || "-"}</span>
                  </div> */}
                  <div className="flex justify-between">
                    <span className="text-gray-500 sarabun-font">ที่อยู่</span>
                    <span className="text-right sarabun-font">
                      {user?.address || "-"}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Back Button at Bottom */}
            <BackButton/>
          </>
        )}
      </div>
    </MobileLayout>
  );
}
