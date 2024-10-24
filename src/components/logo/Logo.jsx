import React from "react";

export default function Logo({ width, height,className }) {
  return (
    <img
      src="/logo/Logo-Adama-Smile-white-2.png"
      alt="Adama-Smile"
      className={`${className} ${width} ${height}`}
    />
  );
}
