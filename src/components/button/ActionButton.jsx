import React from "react";
import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons"; // Import Ant Design icon

const ActionButton = ({ onClick, disabled, mode, text, className = "" }) => {
  return (
    <>
      {mode === "create" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#7DB41E] gap-2 p-1 px-2 items-center ${className}`}
          onClick={onClick}
          disabled={disabled}
        >
          <PlusOutlined className="inline-block text-[16px]" />
          <div>{text}</div>
        </button>
      )}

      {mode === "edit" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#F89E18] gap-2 p-1 px-2 items-center ${className}`}
          onClick={onClick}
          disabled={disabled}
        >
          <div>
            <img
              src="/img/icons/edit-btn.png"
              alt="button icon"
              className="inline-block h-5"
            />
          </div>
          <div>{text}</div>
        </button>
      )}

      {mode === "sync" && (
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

      {mode === "add" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#009845] gap-2 p-2 py-1 items-center ${className} min-w-[80px] justify-center`}
          onClick={onClick}
          disabled={disabled}
        >
          <PlusOutlined className="inline-block text-[16px]" />
          <div>{text}</div>
        </button>
      )}

      {mode === ("back" || "close") && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-sm bg-[#B6AEAB] gap-2 p-2 items-center ${className} min-w-[96px] justify-center`}
          onClick={onClick}
          disabled={disabled}
        >
          <div>{text}</div>
        </button>
      )}

      {mode === "save" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-sm bg-[#00783F] gap-2 p-2 items-center ${className} min-w-[96px] justify-center`}
          onClick={onClick}
          disabled={disabled}
        >
          <div>{text}</div>
        </button>
      )}

      {mode === "update" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-sm bg-[#00783F] gap-2 p-2 items-center ${className} min-w-[96px] justify-center`}
          onClick={onClick}
          disabled={disabled}
        >
          <div>{text}</div>
        </button>
      )}

      {mode === "reject" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-sm bg-[#752157] gap-2 p-2 items-center ${className} min-w-[96px] justify-center`}
          onClick={onClick}
          disabled={disabled}
        >
          <div>{text}</div>
        </button>
      )}

      {mode === "delete" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#f11113] gap-2 p-2 py-1 items-center ${className} min-w-[80px] justify-center`}
          onClick={onClick}
          disabled={disabled}
        >
          <div>
            <img
              src="/img/icons/trash.png"
              alt="button icon"
              className="inline-block h-5"
            />
          </div>
          <div>{text}</div>
        </button>
      )}

      {mode === "hide" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#752157] gap-2 p-1 px-2 items-center ${className}`}
          onClick={onClick}
          disabled={disabled}
        >
          <MinusOutlined className="inline-block text-[16px]" /> {/* Ant Design icon */}
          <div>{text}</div>
        </button>
      )}

      {mode === "saveDraft" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-sm bg-[#F89E18] gap-2 p-2 items-center ${className} min-w-[96px] justify-center`}
          onClick={onClick}
          disabled={disabled}
        >
          <div>{text}</div>
        </button>
      )}
    </>
  );
};

export default ActionButton;
