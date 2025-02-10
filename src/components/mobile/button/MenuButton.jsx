import React from "react";
import { useNavigate } from "react-router-dom";

const MenuButton = ({ icon, text, url }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => url && navigate(url)}
      className="w-full flex items-center space-x-3 bg-white shadow-lg py-4 px-6 rounded-[100px]"
    >
      {/* Support both JSX <img> and string paths */}
      {typeof icon === "string" ? (
        <img src={icon} alt={text} className="w-12 h-12" />
      ) : (
        icon
      )}

      {/* Button Text */}
      <span className="text-[#00783F] sarabun-font text-lg">{text}</span>
    </button>
  );
};

export default MenuButton;
