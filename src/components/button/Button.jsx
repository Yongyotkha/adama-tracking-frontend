import React from 'react';
import { Button as AntButton } from 'antd';

const DynamicButton = ({
  text = "Click Me",
  icon,
  onClick,
  className = '',
  type = 'default',
  disabled = false,
  iconSrc,
  style = {},
}) => {
  return (
    <AntButton
      className={`cursor-pointer text-center ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
      icon={icon}
      style={{ fontFamily: 'BrownLLHeb', ...style }}
    >
      {iconSrc && (
        <span>
          <img
            src={iconSrc}
            alt="button icon"
            className="inline-block w-5 h-5 mr-2"
          />
        </span>
      )}
      {text}
    </AntButton>
  );
};

export default DynamicButton;
