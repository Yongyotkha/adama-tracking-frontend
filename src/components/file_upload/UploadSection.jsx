import React from "react";
import BoxPrimary from "../box_primary/BoxPrimary";
import ActionButton from "../button/ActionButton";
import FileUploadComponent from "../file_upload/FileUploadComponent";

const UploadSection = ({
  title,
  fileUploadRef,
  fileList,
  handleUploadClick,
  handleUploadSuccess,
  handleFileRemove,
  modeUpload = "activity",
  disabled = false, // New prop to control view-only mode
}) => {
  return (
    <BoxPrimary>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#00783F] text-lg font-semibold">{title}</span>
        {!disabled && (
          <ActionButton mode="add" text="Upload File" onClick={handleUploadClick} />
        )}
      </div>
      <FileUploadComponent
        ref={fileUploadRef}
        dataFile={fileList}
        onUploadSuccess={handleUploadSuccess}
        onRemove={disabled ? () => {} : handleFileRemove} // Disable file removal in view mode
        mode={disabled ? "view" : "edit"} // Switch mode based on disabled prop
        modeUpload={modeUpload}
      />
    </BoxPrimary>
  );
};

export default UploadSection;