import React, { useContext, useEffect, useState } from "react";
import { Button, Spin } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";
import { AuthContext } from "../../../contexts/AuthContext";

const HeadSectionUser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useContext(AuthContext);
  const location = useLocation();

  console.log(" userInfo.id", userInfo.id);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathProfileDetail, { id: userInfo.id });

        if (response.status === 200 && response.result) {
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
  }, []);

  if (loading || !user) {
    return <Spin className="py-5" />;
  }


  return (
    <div className="w-full rounded-[40px] flex items-center justify-between relative gap-3 p-1 bg-white max-w-md">
      <div className="flex gap-2 items-center">
        {/* Profile Image */}
        <div className="w-16 h-16 rounded-full overflow-hidden shadow-md">
          <img
            src={user.profile_image || "/img/icons/profile.png"}
            alt="Profile"
            className="w-full h-full object-cover shadow-md"
            onError={(e) => {
              e.target.onerror = null; // prevent infinite loop if fallback fails
              e.target.src = "/img/icons/profile.png";
            }}
          />
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-start flex-1 text-center">
          <h4 className="text-md font-semibold text-[#A19793] sarabun-font">
            คุณ {user.name_th || user.name_en}
          </h4>
          <p className="text-[#A19793] sarabun-font">
            รหัสสมาชิก : {user?.id || "ไม่พบข้อมูล"}
          </p>
        </div>
      </div>

      {/* Info Button */}
      <Button
        className="bg-[#FFB347] text-white rounded-full p-1 sarabun-font text-xs"
        type="button"
        // onClick={() => navigate("/mobile/account")}

        onClick={() =>
          navigate("/mobile/account/", {
            state: {
              id: userInfo.id,
            },
          })
        }

      >
        <span className="sarabun-font text-xs">ข้อมูลของฉัน</span>
      </Button>
    </div>
  );
};

export default HeadSectionUser;
