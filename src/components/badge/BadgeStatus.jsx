import React from "react";

const BadgeStatus = ({ text, bgColor, textColor, onClick }) => {
  return (
    <span
      className={`px-2 py-1 min-h-[36px] rounded-3xl max-w-fit text-sm ${onClick ? "cursor-pointer" : ""}`} // Conditionally add cursor-pointer class
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
