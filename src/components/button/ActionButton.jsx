import React from "react";

const ActionButton = ({ onClick, disabled, mode, text }) => {
  return (
    <>
      {mode == "create" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[5px] bg-[#7DB41E] gap-2 p-1 px-2 items-center`}
          onClick={onClick}
          disabled={disabled}
        >
          <div>
            <img
              src="/img/icons/plus.png"
              alt="button icon"
              className="inline-block w-4 h-4"
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
