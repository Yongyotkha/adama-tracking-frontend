import React, { useState, useRef, useEffect, useContext } from "react";
import { Select, Modal, Input, Upload, Button, message } from "antd";
import { PlusOutlined, SearchOutlined, InboxOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import DynamicButton from "../button/DynamicButton";
import FileUploadComponent from "../file_upload/FileUploadComponent";
import { AuthContext } from "../../contexts/AuthContext";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { values } from "lodash";

const { Dragger } = Upload;

const AddOrderModal = ({ isVisible, onClose, handleAdd, handleSearch }) => {
  const [searchProductData, setSearchProductData] = useState([]);
  const { showMsg, showNotification } = useContext(AuthContext);
  const [dataSource, setDataSource] = useState({});
  const [labelFiles, setLabelFiles] = useState([]);
  const [productFiles, setProductFiles] = useState([]);
  const [overallFiles, setOverallFiles] = useState([]);
  const [otherFiles, setOtherFiles] = useState([]);

  const [labelList, setLabelList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [overallList, setOverallList] = useState([]);
  const [otherList, setOtherList] = useState([]);
  const [dataCallbackList, setDataCallbackList] = useState([]);

  const [loading, setLoading] = useState(false);

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
    { label: "Product Name", name: "productName", placeholder: "Enter Product Name", disabled: true, value: dataSource?.product_name ?? "" },
    { label: "Lot No", name: "lotNo", placeholder: "Enter Lot No" },
    { label: "Reason", name: "reason", placeholder: "Enter Reason" },
  ];

  const UploadSection = ({ label, files, setFiles }) => {
    const handleFileChange = async ({ fileList }) => {
      setFiles(fileList);
      const uploadedFile = fileList[fileList.length - 1]?.originFileObj;
      if (uploadedFile) {
        try {
          const stateSetterMap = {
            Label: setLabelList,
            Product: setProductList,
            Overall: setOverallList,
            Other: setOtherList,
          };

          const formData = new FormData();
          formData.append("file", uploadedFile);
          formData.append("mode", `claim-product-${label.toLowerCase()}`);
    
          const response = await useServiceAPI.post(paths.pathUpload, formData);
    
          if (response) {
            const file = response.data.file_url;
    
            if (stateSetterMap[label]) {
              stateSetterMap[label]([file]);
              console.log(`${label} List Updated:`, [file]);
            } else {
              console.error("Invalid label:", label);
            }
          }
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }
    };
  
    const handleRemoveFile = (file) => {
      setFiles((prev) => prev.filter((item) => item.uid !== file.uid)); // ลบไฟล์ออกจากสถานะ
    };

    return (
      <div className="upload-section">
        <label className="upload-label">{label}</label>
        <div className="upload-container">
          {!files.length ? (
            <Upload
              accept=".jpeg,.jpg,.png" // จำกัดเฉพาะไฟล์ JPEG และ PNG
              listType="picture"
              beforeUpload={() => false} // ปิดการอัปโหลดอัตโนมัติ
              onChange={handleFileChange} // เรียกเมื่อมีการเลือกไฟล์
              fileList={files} // รายการไฟล์ที่เลือก
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
                    src={file.thumbUrl || URL.createObjectURL(file.originFileObj)} // แสดงตัวอย่างภาพ
                    alt={file.name}
                    className="preview-image"
                  />
                </div>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveFile(file)} // เรียกเมื่อคลิกปุ่มลบ
                  className="delete-button"
                />
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const onChangeProduct = (value) => {
    // Set Empty
    setSearchProductData([]);

    const loadProductDetail = async () => {
        setLoading(true);
        try {
            const [productDetail] = await Promise.all([
                useServiceAPI.get(paths.pathMasterProductDetail, {
                    product_id: value,
                }),
            ]);

            const data = productDetail.data;
            setDataSource(data);
        } catch (error) {
          console.log(error);
            showNotification(
              "error",
              "Data Not Found."
            );
        } finally {
            setLoading(false);
        }
    };

    loadProductDetail();
  };

  const onSearchProduct = (value) => {
    if (value.length >= 3) {
      const loadProducts = async () => {
        setLoading(true);
        try {
          const [product] = await Promise.all([
            useServiceAPI.get(paths.pathMasterProducts, {
              keyword: value,
            }),
          ]);

          const newProductData = [];
          product.data.map((data, index) => {
            newProductData.push({
              value: data.id,
              label: data.name
            });
          })

          // Set Data
          setSearchProductData(newProductData);
        } catch (error) {
          console.log(error);
          showNotification(
            "error",
            "Data Not Found."
          );
        } finally {
          setLoading(false);
        }
      };
  
      loadProducts();
    }
  };

  const handleAddCallback = () => {
    const data = {
      files: {
        labels: labelList.length > 0 ? labelList : [],
        products: productList.length > 0 ? productList : [],
        overall: overallList.length > 0 ? overallList : [],
        others: otherList.length > 0 ? otherList : [],
      },
      productDetail: dataSource
    };

    console.log(data);
    
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
          onClick={handleAddCallback} // Send updated fileList on add
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
                {field.name == 'product' ?
                  <Select
                    showSearch
                    placeholder="Search Product"
                    optionFilterProp="label"
                    className="w-full"
                    onChange={onChangeProduct}
                    onSearch={onSearchProduct}
                    options={searchProductData}
                    value=""
                  />
                : 
                  <Input
                    className="border-[#CBC5C3] hover:border-[#009845] focus:border-[#009845] !hover:border-[#009845] !focus:border-[#009845]"
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={field.disabled}
                    prefix={field.prefix}
                    onChange={field.onChange}
                    value={field.value}
                  />
                }
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
