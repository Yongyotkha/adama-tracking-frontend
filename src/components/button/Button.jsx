import React from "react";

const DynamicButton = ({
  text,
  icon,
  onClick,
  className,
  disabled,
  iconSrc,
  style,
}) => {
  return (
    <button
      className={`cursor-pointer text-center font-light text-sm rounded-[5px] ${className} max-w-fit`}
      onClick={onClick}
      disabled={disabled}
      icon={icon}
      style={{ ...style }}
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
    </button>
  );
};

export default DynamicButton;
