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
    Other: [],
  });

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
    fileList: fileLists[key],
    multiple: true,
  });

  const formFields = [
    { label: "Product", name: "product", placeholder: "Search...", prefix: <SearchOutlined className="text-gray-500" />, onChange: handleSearch },
    { label: "Product Name", name: "productName", placeholder: "Enter Product Name", disabled: true },
    { label: "Lot No", name: "lotNo", placeholder: "Enter Lot No" },
    { label: "Reason", name: "reason", placeholder: "Enter Reason" },
  ];

  const [labelFiles, setLabelFiles] = useState([]);
  const [productFiles, setProductFiles] = useState([]);
  const [overallFiles, setOverallFiles] = useState([]);
  const [otherFiles, setOtherFiles] = useState([]);

  const UploadSection = ({ label, files, setFiles }) => {
    const handleFileChange = ({ fileList }) => {
      setFiles(fileList);
    };
  
    const handleRemoveFile = (file) => {
      setFiles((prev) => prev.filter((item) => item.uid !== file.uid));
    };
  
    return (
      <div className="upload-section">
        <label className="upload-label">{label}</label>
        <div className="upload-container">
          {!files.length ? (
            <Upload
              listType="picture"
              beforeUpload={() => false}
              onChange={handleFileChange}
              fileList={files}
              className="upload-dragger"
            >
              <p className="upload-text">Choose a file or drag & drop it here</p>
              <p className="upload-text">JPEG, PNG</p>
              <Button icon={<UploadOutlined />} className="upload-button">
                Browse File
              </Button>
            </Upload>
          ) : (
            files.map((file) => (
              <div key={file.uid} className="file-preview">
                <div className="file-thumbnail">
                  <img
                    src={file.thumbUrl || URL.createObjectURL(file.originFileObj)}
                    alt={file.name}
                    className="preview-image"
                  />
                </div>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveFile(file)}
                  className="delete-button"
                ></Button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

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

        <div className="file-upload-grid">
          <UploadSection label="Label" files={labelFiles} setFiles={setLabelFiles} />
          <UploadSection label="Product" files={productFiles} setFiles={setProductFiles} />
          <UploadSection label="Overall" files={overallFiles} setFiles={setOverallFiles} />
          <UploadSection label="Other" files={otherFiles} setFiles={setOtherFiles} />
        </div>
      </form>
    </Modal>
  );
};

export default AddOrderModal;
