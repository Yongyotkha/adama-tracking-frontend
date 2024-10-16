import React from 'react';
import { Button as AntButton } from 'antd';

const DynamicButton = ({
  text = "Click Me",
  icon,
  iconSrc,
  onClick,
  className = '',
  type = 'default',
  disabled = false,
  style = {}, // New prop for inline styles
}) => {
  return (
    <AntButton
      className={`cursor-pointer my-3 ${className}`} // Apply Tailwind or other custom classes
      onClick={onClick}
      type={type} // Allows you to pass button types like 'primary', 'default', etc.
      disabled={disabled}
      icon={icon ? icon : null} // If an Ant Design icon is passed, it will be used
      style={style} // Apply dynamic inline styles
    >
      {/* Render image icon if iconSrc is provided */}
      {iconSrc && <img src={iconSrc} alt="button icon" className="inline-block w-5 h-5 mr-2" />}
      {text}
    </AntButton>
  );
};

export default DynamicButton;
