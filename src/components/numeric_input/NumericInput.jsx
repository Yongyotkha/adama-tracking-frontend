// src/components/numeric_input/NumericInput.jsx
import React from "react";
import { Input } from "antd";

const NumericInput = ({ value, onChange, disabled = false, style, className }) => {
  const handleChange = (e) => {
    const rawValue = e.target.value;

    // ลบ comma ออกก่อน parse
    const numericValue = rawValue.replace(/,/g, "");

    // อนุญาตเฉพาะตัวเลขและจุดทศนิยม
    if (/^\d*\.?\d*$/.test(numericValue)) {
      onChange(numericValue);
    }
  };

  return (
    <Input
      className={className}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      placeholder="0"
      style={style}
    />
  );
};

export default NumericInput;
