import React from "react";

export default function LogoGray({ width, height,className }) {
  return (
    <img
      src="/logo/Logo-Adama-Smile-2-New 1.png"
      alt="Adama-Smile"
      className={`${className} ${width} ${height}`}
    />
  );
}
