import React, { useContext } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";

const BackButton = ({ className, url, type = null }) => {
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  const handleClick = () => {
    if (url) {
      navigate(url);
    } else {
      navigate(-1);
    }

    if (type == 'account') {
      // Perform logout action here
      navigate("/mobile/account/", {
        state: {
          id: userInfo.id,
        },
      })

    }
  };

  return (
    <div className="w-full max-w-md mt-auto py-2">
      <button
        onClick={handleClick}
        className={`w-full py-3 bg-[#E0DCDB] rounded-lg text-[#A19793] sarabun-font flex items-center justify-center space-x-2 ${className}`}
      >

        <img src="/img/icons/back.png" className="w-6 h-6" alt="" />
        <span className="sarabun-font">ย้อนกลับ</span>
      </button>
    </div>
  );
};

export default BackButton;
