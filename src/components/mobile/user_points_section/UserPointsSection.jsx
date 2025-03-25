import React, { useContext, useEffect, useState } from "react";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { Spin } from "antd";
import { AuthContext } from "../../../contexts/AuthContext";

const UserPointsSection = () => {
  const [pointsData, setPointsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathProfileDetail, { id: userInfo.id });

        if (response.status === 200 && response.result) {
          setPointsData({
            currentPoints: response.data.point,
            expiringPoints: response.data.point_expired,
            expiryDate: response.data.point_expired_date_distplay,
          });
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

  if (loading || !pointsData) {
    return <Spin className="py-5" />;
  }

  return (
    <div className="w-full max-w-xs flex flex-col items-center mt-4">
      <div
        className="bg-[url('/img/bg-point.png')] bg-[length:100%_100%] bg-center bg-no-repeat text-white rounded-full flex items-center justify-center aspect-[1573/256] w-full"
      >
        <span className="sarabun-font text-md">
          คุณมี {pointsData.currentPoints} คะแนน
        </span>
      </div>
      <p className="text-[#A19793] sarabun-font text-xs mt-1 text-center">
        {pointsData.expiringPoints > 0
          ? `คะแนนหมดอายุ : ${pointsData.expiringPoints} คะแนน | ${pointsData.expiryDate}`
          : "ไม่มีคะแนนหมดอายุ"}
      </p>
    </div>
  );
};

export default UserPointsSection;
