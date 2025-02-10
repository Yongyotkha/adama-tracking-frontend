import React from "react";
import { Modal, Button } from "antd";

const DynamicPopUp = ({ visible, onConfirm, src, text, confirmText }) => {
  return (
    <Modal
      open={visible}
      footer={null}
      centered
      closable={false} // Remove close button (X)
    >
      <div className="flex flex-col justify-between items-center min-h-[250px]">
        {/* Dynamic Image */}
        {src && <img src={src} alt="popup" className="h-24 object-contain mb-4" />}

        {/* Dynamic HTML Content */}
        <div dangerouslySetInnerHTML={{ __html: text }} className="text-[#978B87] text-sm text-center mb-4 sarabun-font" />

        {/* Confirm Button - Full width */}
        <Button
          type="button"
          onClick={onConfirm}
          className="w-full bg-[#009845] flex items-center justify-center py-5 rounded-md"
        >
          <span className="sarabun-font text-white">{confirmText || "ตกลง"}</span>
        </Button>
      </div>
    </Modal>
  );
};

export default DynamicPopUp;
