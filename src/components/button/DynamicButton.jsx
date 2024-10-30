import React from "react";
import { useNavigate } from "react-router-dom";

const DynamicButton = ({
  text,
  onClick,
  className,
  disabled,
  iconSrc,
  path,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (path) {
      navigate(path);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`cursor-pointer text-center font-light text-sm rounded-[5px] ${className}`}
      onClick={handleClick}
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
