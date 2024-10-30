import React from "react";

const DynamicButton = ({
  text,
  onClick,
  className,
  disabled,
  iconSrc,
}) => {
  return (
    <button
      className={`cursor-pointer text-center font-light text-sm rounded-[5px] ${className}`}
      onClick={onClick}
      disabled={disabled}
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
