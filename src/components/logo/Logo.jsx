import React from "react";

export default function Logo({ width, height }) {
  return (
    <img
      src="/logo/Logo-Adama-Smile-white-2.png"
      alt="Adama-Smile"
      className={` ${width} ${height}`}
    />
  );
}
