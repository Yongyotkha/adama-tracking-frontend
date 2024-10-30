import React from "react";

const ActionButton = ({ onClick, disabled, mode, text ,className = '' }) => {
  return (
    <>
      {mode == "create" && (

        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#7DB41E] gap-2 p-1 px-2 items-center`}
          onClick={onClick}
          disabled={disabled}
        >
          <div>
            <img
              src="/img/icons/plus.png"
              alt="button icon"
              className="inline-block h-4"
            />
          </div>
          <div>{text}</div>
        </button>
      )}

      {mode == "sync" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#F89E18] gap-2 p-1 px-2 items-center ${className}`}
          onClick={onClick}
          disabled={disabled}
        >
          <div>
            <img
              src="/img/icons/sync.png"
              alt="button icon"
              className="inline-block h-5"
            />
          </div>
          <div>{text}</div>
        </button>
      )}

      {mode == "add" && (
        <>
          <div></div>
        </>
      )}

    </>
  );
};

export default ActionButton;
