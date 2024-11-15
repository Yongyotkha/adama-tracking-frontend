import React, { useState, useRef, useEffect } from "react";
import { Modal, Input, Upload, Button } from "antd";
import { PlusOutlined, SearchOutlined, InboxOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import DynamicButton from "../button/DynamicButton";
import FileUploadComponent from "../file_upload/FileUploadComponent";

const { Dragger } = Upload;

const AddOrderModal = ({ isVisible, onClose, handleAdd, handleSearch }) => {
  const [fileLists, setFileLists] = useState({
    Label: [],
    Product: [],
    Overall: [],
  });

  // Initialize empty file list for Other section
  const [otherList, setOtherList] = useState([]);

  // Log fileList length every time it changes
  useEffect(() => {
    console.log("Current fileList length:", otherList);
  }, [otherList]);

  // Reference for FileUploadComponent
  const fileUploadRef = useRef(null);

  // Function to trigger upload in FileUploadComponent
  const handleUploadClick = () => {
    if (fileUploadRef.current) {
      fileUploadRef.current.triggerUpload();
    }
  };

  // Update fileList state when files are selected for Other section
  const handleOtherUploadChange = ({ fileList }) => {
    setOtherList(fileList);
  };

  const handleUploadChange = (key) => ({ fileList }) => {
    setFileLists((prev) => ({
      ...prev,
      [key]: fileList,
    }));
  };

  const handleRemove = (key, file) => {
    setFileLists((prev) => ({
      ...prev,
      [key]: prev[key].filter((item) => item.uid !== file.uid),
    }));
  };

  const draggerProps = (key) => ({
    name: "file",
    onChange: handleUploadChange(key),
    beforeUpload: () => false, // Prevent actual upload
    showUploadList: false, // Hide the default file list from Dragger
  });

  const formFields = [
    { label: "Product", name: "product", placeholder: "Search...", prefix: <SearchOutlined className="text-gray-500" />, onChange: handleSearch },
    { label: "Product Name", name: "productName", placeholder: "Enter Product Name", disabled: true },
    { label: "Lot No", name: "lotNo", placeholder: "Enter Lot No" },
    { label: "Reason", name: "reason", placeholder: "Enter Reason" },
  ];

  return (
    <Modal
      title={<span className="text-[#978B87] text-[16px] font-normal">Add Order</span>}
      open={isVisible} // Updated from `visible` to `open`
      onCancel={onClose}
      footer={[
        <DynamicButton
          key="close"
          text="Close"
          onClick={onClose}
          className="text-[#FFFFFF] text-sm rounded-sm bg-[#B6AEAB] p-2 min-w-[96px]"
        />,
        <DynamicButton
          key="add"
          text="Add"
          onClick={() => handleAdd(otherList)} // Send updated fileList on add
          className="text-[#FFFFFF] text-sm rounded-sm bg-[#00783F] p-2 min-w-[96px] ms-3"
        />,
      ]}
      width={800}
      className="dynamic-modal"
    >
      <form className="space-y-4">
        {formFields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">{field.label}</label>
            <Input
              className="border-[#CBC5C3] hover:border-[#009845] focus:border-[#009845] !hover:border-[#009845] !focus:border-[#009845]"
              placeholder={field.placeholder}
              required={field.required}
              disabled={field.disabled}
              prefix={field.prefix}
              onChange={field.onChange}
            />
          </div>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["Label", "Product", "Overall"].map((uploadLabel) => (
            <div key={uploadLabel} className="flex flex-col items-start w-full">
              <label className="text-sm text-gray-700 mb-2">{uploadLabel}</label>

              {/* Conditionally show Dragger or Preview */}
              {fileLists[uploadLabel].length === 0 ? (
                <Dragger {...draggerProps(uploadLabel)} fileList={fileLists[uploadLabel]} className="w-full bg-white">
                  <p className="text-center text-[16px] text-[#978B87] w-full">Choose a file or drag & Drop it here</p>
                  <p className="text-center text-[16px] text-[#978B87] w-full">JPEG, PNG</p>
                  <Button variant="filled" icon={<UploadOutlined />} className="my-2 mx-auto bg-[#009845] hover:bg-[#009845] text-white">
                    Upload Files
                  </Button>
                </Dragger>
              ) : (
                <div className="relative w-full border border-dashed p-2 rounded-lg">
                  <img
                    src={fileLists[uploadLabel][0].thumbUrl || URL.createObjectURL(fileLists[uploadLabel][0].originFileObj)}
                    alt="preview"
                    className="w-full h-auto"
                  />
                  <button
                    onClick={() => handleRemove(uploadLabel, fileLists[uploadLabel][0])}
                    className="absolute bottom-2 left-2"
                  >
                    <img
                      src="/img/icons/delete-file.png"
                      alt="Delete icon"
                      className="inline-block h-10 m-auto"
                    />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Other section using FileUploadComponent */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-2">Other</label>
            <div className="flex flex-col items-start w-full border border-dashed p-4 rounded-lg">
              <FileUploadComponent ref={fileUploadRef} dataFile={otherList} onChange={handleOtherUploadChange} />
              <p className="text-center text-[16px] mt-2 text-[#978B87] w-full min-h-[42px]">Choose a file JPEG, PNG</p>
              <Button variant="filled" icon={<UploadOutlined />} onClick={handleUploadClick} className="my-2 mx-auto bg-[#009845] hover:bg-[#009845] text-white">
                Upload Files
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddOrderModal;
