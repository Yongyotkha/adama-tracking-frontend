import React from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const BackButton = ({ className, url }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (url) {
      navigate(url); // Navigate to provided URL
    } else {
      navigate(-1); // Default: Go back to the previous page
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
