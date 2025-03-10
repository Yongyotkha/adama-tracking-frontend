import React from "react";
import { RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

export default function MainButton({ type = "link", to, icon, label, onClick, className = "" }) {
  const baseClasses = "flex items-center space-x-3 cursor-pointer p-4 rounded-[6px] w-full border";
  
  return type === "link" ? (
    <Link to={to} className={`${baseClasses} ${className}`}>
      {icon}
      <span className="flex-1 sarabun-font">{label}</span>
      <RightOutlined className="text-lg text-gray-500" />
    </Link>
  ) : (
    <button onClick={onClick} className={`${baseClasses} ${className}`}>
      {icon}
      <span className="flex-1 sarabun-font text-start">{label}</span>
      <RightOutlined className="text-lg text-gray-500" />
    </button>
  );
}
