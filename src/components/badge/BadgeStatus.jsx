import React from "react";

const BadgeStatus = ({ text, bgColor, textColor }) => {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-3xl max-w-fit text-sm`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {text}
    </span>
  );
};

export default BadgeStatus;
