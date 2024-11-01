import React from "react";

const BadgeStatus = ({ text, bgColor, textColor, onClick }) => {
  return (
    <span
      className={`inline-block px-3 py-1 h-[36px] flex items-center rounded-3xl max-w-fit text-sm ${onClick ? "cursor-pointer" : ""}`} // Conditionally add cursor-pointer class
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
      onClick={onClick} // Attach the onClick handler
    >
      {text}
    </span>
  );
};

export default BadgeStatus;
