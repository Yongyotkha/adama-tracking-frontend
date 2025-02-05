import React from "react";
import { useNavigate } from "react-router-dom";

export default function BackTopLeftButton({ className, to }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Go back to the previous page
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`absolute top-4 left-4 flex items-center text-gray-500 hover:text-gray-700 ${className}`}
    >
      <img src="/img/icons/back.png" alt="Back" className="w-5 h-5 mr-2" />
      <span className="sarabun-font">Back</span>
    </button>
  );
}
