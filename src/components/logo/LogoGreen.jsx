import React from "react";

export default function LogoGreen({ width, height,className }) {
  return (
    <img
      src="/logo/Final-Logo-Smile.png"
      alt="Adama-Smile"
      className={`${className} ${width} ${height}`}
    />
  );
}
