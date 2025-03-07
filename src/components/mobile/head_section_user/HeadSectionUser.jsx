import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const HeadSectionUser = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full rounded-[40px] flex items-center justify-between relative gap-3 p-1 bg-white max-w-md">
      <div className="flex gap-2 items-center">
        {/* Profile Image */}
        <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden shadow">
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-start flex-1 text-center">
          <h4 className="text-md font-semibold text-[#A19793] sarabun-font">
            {user.name}
          </h4>
          <p className="text-[#A19793] sarabun-font text-xs">
            รหัสสมาชิก : {user.memberId}
          </p>
        </div>
      </div>

      {/* Info Button */}
      <Button className="bg-[#FFB347] text-white rounded-full p-1 sarabun-font text-xs" type="button" onClick={() => navigate('/mobile/account')}>
        <span className="sarabun-font text-xs">ข้อมูลของฉัน</span>
      </Button>
    </div>
  );
};

export default HeadSectionUser;
