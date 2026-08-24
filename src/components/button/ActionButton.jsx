import React from "react";
import { DeleteOutlined, ImportOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";

const ActionButton = ({
  onClick,
  disabled,
  mode,
  text,
  className = "",
  style,
  icon, // <- รับ ReactNode เข้ามา
}) => {
  // helper: แสดงไอคอนเริ่มต้นตาม mode ถ้าไม่มี icon ที่ส่งมาจากภายนอก
  const renderDefaultIcon = () => {
    if (icon) return icon; // ให้ icon จากภายนอกมี priority สูงสุด
    switch (mode) {
      case "create":
      case "add":
        return <PlusOutlined className="inline-block text-[16px]" />;
      case "hide":
        return <MinusOutlined className="inline-block text-[16px]" />;
      case "delete":
        return (
          <img src="/img/icons/trash.png" alt="button icon" className="inline-block h-5" />
        );
      case "edit":
        return (
          <img src="/img/icons/edit-btn.png" alt="button icon" className="inline-block h-5" />
        );
      case "sync":
        return (
          <img src="/img/icons/sync.png" alt="button icon" className="inline-block h-5" />
        );
      case "import":
        return <ImportOutlined className="inline-block text-[16px]" />;
      default:
        return null;
    }
  };

  return (
    <>
      {mode === "create" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#7DB41E] gap-2 p-1 px-2 items-center justify-center ${className}`}
          onClick={onClick}
          disabled={disabled}
          style={style}
        >
          {renderDefaultIcon()}
          <div>{text}</div>
        </button>
      )}

      {mode === "edit" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#F89E18] gap-2 p-1 px-2 items-center ${className}`}
          onClick={onClick}
          disabled={disabled}
        >
          {renderDefaultIcon()}
          <div>{text}</div>
        </button>
      )}

      {mode === "sync" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#F89E18] gap-2 p-1 px-2 items-center ${className}`}
          onClick={onClick}
          disabled={disabled}
        >
          {renderDefaultIcon()}
          <div>{text}</div>
        </button>
      )}

      {mode === "import" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#1677ff] gap-2 p-1 px-2 items-center justify-center ${className}`}
          onClick={onClick}
          disabled={disabled}
          style={style}
        >
          {renderDefaultIcon()}
          <div>{text}</div>
        </button>
      )}

      {mode === "add" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#009845] gap-2 p-2 py-1 items-center ${className} min-w-[80px] justify-center`}
          onClick={onClick}
          disabled={disabled}
          style={style}
        >
          {renderDefaultIcon()}
          <div>{text}</div>
        </button>
      )}

      {(mode === "back" || mode === "close") && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#B6AEAB] gap-2 p-1 px-2 items-center justify-center ${className}`}
          onClick={onClick}
          disabled={disabled}
          style={style}
        >
          {renderDefaultIcon()}
          <div>{text}</div>
        </button>
      )}

      {mode === "save" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-sm bg-[#00783F] gap-2 p-2 items-center ${className} min-w-[96px] justify-center`}
          onClick={onClick}
          disabled={disabled}
        >
          {renderDefaultIcon()}
          <div>{text}</div>
        </button>
      )}

      {mode === "update" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-sm bg-[#00783F] gap-2 p-2 items-center ${className} min-w-[96px] justify-center`}
          onClick={onClick}
          disabled={disabled}
        >
          {renderDefaultIcon()}
          <div>{text}</div>
        </button>
      )}

      {mode === "reject" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-sm bg-[#752157] gap-2 p-2 items-center ${className} min-w-[96px] justify-center`}
          onClick={onClick}
          disabled={disabled}
        >
          {renderDefaultIcon()}
          <div>{text}</div>
        </button>
      )}

      {mode === "delete" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#f11113] gap-2 p-2 py-1 items-center ${className} min-w-[80px] justify-center`}
          onClick={onClick}
          disabled={disabled}
        >
          {renderDefaultIcon()}
          <div>{text}</div>
        </button>
      )}

      {mode === "hide" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-[4px] bg-[#752157] gap-2 p-1 px-2 items-center ${className}`}
          onClick={onClick}
          disabled={disabled}
        >
          {renderDefaultIcon()}
          <div>{text}</div>
        </button>
      )}

      {mode === "saveDraft" && (
        <button
          className={`flex text-[#FFFFFF] text-sm rounded-sm bg-[#F89E18] gap-2 p-2 items-center ${className} min-w-[96px] justify-center`}
          onClick={onClick}
          disabled={disabled}
        >
          {renderDefaultIcon()}
          <div>{text}</div>
        </button>
      )}

      {mode === "custom" && (
        <button
          className={`flex text-white text-sm rounded-sm gap-2 p-2 items-center min-w-[96px] justify-center ${className}`}
          onClick={onClick}
          disabled={disabled}
        >
          {renderDefaultIcon()}
          <div>{text}</div>
        </button>
      )}
    </>
  );
};

export default ActionButton;
