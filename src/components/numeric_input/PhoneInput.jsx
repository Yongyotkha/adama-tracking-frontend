import React from "react";
import { Input } from "antd";

const PhoneInput = ({ value, onChange, disabled = false, className, placeholder = "000 000 0000" }) => {
  const handleChange = (e) => {
    let inputValue = e.target.value.replace(/\D/g, ""); // Allow only numbers
    if (inputValue.length > 10) return; // Limit to 10 digits

    // Format as "000 000 0000"
    let formattedValue = inputValue.replace(/(\d{3})(\d{3})(\d{0,4})/, "$1 $2 $3").trim();
    onChange(formattedValue);
  };

  return (
    <Input
      className={className}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      maxLength={12} // Prevent input beyond expected length
    />
  );
};

export default PhoneInput;
