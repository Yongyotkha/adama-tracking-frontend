import React from "react";

export default function LogoGreen({ width, height,className }) {
  return (
    <img
      src="/logo/adama-smile-plus-2.png"
      alt="Adama-Smile" 
      className={`${className} ${width} ${height}`}
    />
  );
}
