import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import { Image, Upload, message, App } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import ActionButton from "../button/ActionButton";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// eslint-disable-next-line react/display-name
const FileUploadComponent = forwardRef((props, ref) => {
  const {
    dataFile = [],
    mode = "edit",
    modeUpload = "activity",
    onUploadSuccess,
    title = "Upload Pictures", // Dynamic title
  } = props;

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState(dataFile);
  const hiddenFileInputRef = useRef(null);

  useEffect(() => {
    setFileList(dataFile);
  }, [dataFile]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", modeUpload);

    try {
      const response = await useServiceAPI.post(paths.pathUpload, formData);
      if (response.status === 200 && response.data) {
        const uploadedFile = {
          uid: new Date().toISOString(),
          name: file.name,
          status: "done",
          url: response.data.file_url, // Use actual file URL from response
        };

        setFileList((prev) => [...prev, uploadedFile]);
        message.success("File uploaded successfully!");

        if (onUploadSuccess && typeof onUploadSuccess === "function") {
          onUploadSuccess(uploadedFile); // Pass the uploaded file to the parent component
        }
      } else {
        message.error("Failed to upload file.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      message.error("Error uploading file.");
    }
  };

  const triggerUpload = () => {
    if (hiddenFileInputRef.current) {
      hiddenFileInputRef.current.click();
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <App>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#00783F] text-lg font-semibold">{title}</span>
        <ActionButton className="ms-auto" mode="add" text="Upload File" onClick={triggerUpload} />
      </div>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        showUploadList={{
          showRemoveIcon: mode !== "view",
        }}
        customRequest={({ file }) => handleUpload(file)} // Custom upload handler
      >
        {mode === "edit" && uploadButton}
      </Upload>
      <input
        type="file"
        ref={hiddenFileInputRef}
        style={{ display: "none" }}
        onChange={async (e) => {
          const files = e.target.files;
          if (files.length > 0) {
            const file = files[0];

            const formData = new FormData();
            formData.append("file", file);
            formData.append("mode", modeUpload);

            try {
              const response = await useServiceAPI.post(paths.pathUpload, formData);
              if (response.status === 200 && response.data) {
                const uploadedFile = {
                  uid: new Date().toISOString(),
                  name: file.name,
                  status: "done",
                  url: response.data.file_url, // Use actual file URL from response
                };

                setFileList((prev) => [...prev, uploadedFile]);
                if (onUploadSuccess && typeof onUploadSuccess === "function") {
                  onUploadSuccess(uploadedFile);
                }
              }
            } catch (error) {
              console.error("Error uploading form data:", error);
            }
            message.success(`${file.name} uploaded successfully.`);
          }
        }}
      />
      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </App>
  );
});

export default FileUploadComponent;