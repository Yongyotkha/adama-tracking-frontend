// src/components/numeric_input/NumericInput.jsx
import React from "react";
import { Input } from "antd";

const NumericInput = ({ value, onChange, disabled = false, style, className }) => {
  const handleChange = (e) => {
    const inputValue = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(inputValue)) {
      onChange(inputValue);
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
