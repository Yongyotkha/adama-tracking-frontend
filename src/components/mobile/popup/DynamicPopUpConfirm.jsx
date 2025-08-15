import React from "react";
import { Modal, Button } from "antd";

const DynamicPopUpConfirm = ({
  visible,
  onConfirm,
  onCancel,
  src,
  text,
  confirmText,
  cancelText
}) => {
  return (
    <Modal
      open={visible}
      footer={null}
      centered
      closable={false} // ไม่มีปุ่ม X
    >
      <div className="flex flex-col justify-between items-center min-h-[250px]">
        {/* Dynamic Image */}
        {src && (
          <img
            src={src}
            alt="popup"
            className="h-24 object-contain mb-4"
          />
        )}

        {/* Dynamic HTML Content */}
        <div
          dangerouslySetInnerHTML={{ __html: text }}
          className="text-[#978B87] text-sm text-center mb-4 sarabun-font"
        />

        {/* Buttons */}
        <div className="flex w-full gap-2">
          <Button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 flex items-center justify-center py-5 rounded-md"
          >
            <span className="sarabun-font text-black">
              {cancelText || "ยกเลิก"}
            </span>
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-[#009845] flex items-center justify-center py-5 rounded-md"
          >
            <span className="sarabun-font text-white">
              {confirmText || "ยืนยัน"}
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DynamicPopUpConfirm;
