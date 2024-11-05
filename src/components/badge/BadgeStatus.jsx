import React from "react";

const BadgeStatus = ({ text, bgColor, textColor, onClick }) => {
  return (
    <span
      className={`px-3 py-2 rounded-3xl inline-block min-w-[36px] max-w-fit text-nowrap text-sm ${onClick ? "cursor-pointer" : ""}`} // Conditionally add cursor-pointer class
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
