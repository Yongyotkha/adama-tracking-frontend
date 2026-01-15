import React from "react";
import { useNavigate } from "react-router-dom";

const DynamicButton = ({
  text,
  onClick,
  className = "",
  disabled,
  iconSrc,
  path,
  type = "button",
  color,      // ยังรองรับส่ง color โดยตรงได้
  name,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) return;
    if (path) {
      navigate(path);
    } else if (onClick) {
      onClick();
    }
  };

  // ดึงสีจาก className: bg-[#7DB41E]
  const extractColorFromClassName = (cls) => {
    if (!cls) return null;
    const match = cls.match(/bg-\[(#[0-9A-Fa-f]{3,8})\]/);
    return match ? match[1] : null;
  };

  const baseColor =
    color || extractColorFromClassName(className) || ""; // default

  // ทำสี hover ให้สว่างขึ้นหน่อย
  const makeHoverColor = (c) => {
    try {
      if (c.startsWith("#") && c.length === 7) {
        const r = parseInt(c.slice(1, 3), 16);
        const g = parseInt(c.slice(3, 5), 16);
        const b = parseInt(c.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, 0.8)`;
      }
    } catch (e) {}
    return c;
  };

  const hoverColor = makeHoverColor(baseColor);

  const baseStyle = `
    inline-flex items-center justify-center
    text-center text-sm font-light
    rounded-[5px]
    transition-all duration-150
    shadow-sm
    hover:shadow-md
    active:shadow-lg
  `;

  return (
    <button
      name={name}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`${baseStyle} ${className}`}
      style={{
        backgroundColor: disabled ? "#D1D5DB" : baseColor,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = hoverColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = baseColor;
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "scale(0.96)";
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
    >
      {iconSrc && (
        <img
          src={iconSrc}
          alt=""
          className="inline-block w-5 h-5 mr-2"
        />
      )}
      {text}
    </button>
  );
};

export default DynamicButton;
