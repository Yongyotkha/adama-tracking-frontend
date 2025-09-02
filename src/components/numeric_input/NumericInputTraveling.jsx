// src/components/numeric_input/NumericInput.jsx
import React from "react";
import { Input } from "antd";

const NumericInputTraveling = ({ value, onChange, disabled = false, style, className }) => {
  const handleChange = (e) => {
    const rawValue = e.target.value;

    // ลบ comma ออกก่อน parse
    const numericValue = rawValue.replace(/,/g, "");

    // อนุญาตเฉพาะตัวเลขและจุดทศนิยม
    if (/^\d*\.?\d*$/.test(numericValue)) {
      onChange(numericValue);
    }
  };

  // ถ้า value เป็น null, undefined, "", 0, "0", "0.00" → ให้แสดงว่าง
  const displayValue =
    value === null ||
    value === undefined ||
    value === "" ||
    value === 0 ||
    value === "0" ||
    value === "0.0" ||
    value === "0.00"
      ? ""
      : value;

  return (
    <Input
      className={className}
      value={displayValue}
      onChange={handleChange}
      disabled={disabled}
      placeholder=""   // <<-- เปลี่ยนเป็นว่าง ไม่ใช้ "0"
      style={style}
    />
  );
};

export default NumericInputTraveling;
