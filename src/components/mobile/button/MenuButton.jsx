import React from "react";
import { useNavigate } from "react-router-dom";

const MenuButton = ({ icon, text, url, count = 0 }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => url && navigate(url)}
      className="relative w-full flex items-center space-x-3 bg-white shadow-lg py-4 px-6 rounded-[100px]"
    >
      {/* Support both JSX <img> and string paths */}
      {typeof icon === "string" ? (
        <img src={icon} alt={text} className="w-12 h-12" />
      ) : (
        icon
      )}

      {/* Button Text */}
      <span className="text-[#00783F] sarabun-font text-lg">{text}</span>

      {/* 🔴 Badge ตัวเลข */}
      {count > 0 && (
        <span
          className="absolute right-5
                     flex items-center justify-center 
                     w-6 h-6 rounded-full bg-red-500 
                     text-white text-sm font-semibold 
                     shadow-md"
        >
          {count}
        </span>
      )}
    </button>
  );
};

export default MenuButton;
