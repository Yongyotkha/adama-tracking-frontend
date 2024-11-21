import React from "react";

const BadgeStatus = ({ text, bgColor, textColor, onClick }) => {
  return (
    <span
      className={`bg-[${bgColor}] text-[${textColor}] px-3 py-2 rounded-3xl inline-block min-w-[36px] max-w-fit text-nowrap text-sm ${onClick ? "cursor-pointer" : ""}`} // Conditionally add cursor-pointer class
      onClick={onClick} 
    >
      {text}
    </span>
  );
};

export default BadgeStatus;
