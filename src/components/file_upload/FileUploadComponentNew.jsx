import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import { Image, Upload, message, App } from "antd";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// eslint-disable-next-line react/display-name
const FileUploadComponentNew = forwardRef((props, ref) => {
  const {
    dataFile = [],
    mode = "edit",
    modeUpload = "activity",
    onUploadSuccess,
    onRemove, // Callback to update parent state when a file is removed
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

  const triggerUpload = () => {
    if (hiddenFileInputRef.current) {
      hiddenFileInputRef.current.click();
    }
  };

  useImperativeHandle(ref, () => ({
    triggerUpload,
  }));

  return (
    <App>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        showUploadList={{
          showRemoveIcon: mode !== "view",
        }}
        onRemove={(file) => {
          // Remove file from local state
          setFileList((prev) => prev.filter((item) => item.uid !== file.uid));

          // Call parent callback to update parent state
          if (onRemove && typeof onRemove === "function") {
            onRemove(file);
          }

          return true; // Return true to remove the file from the UI
        }}
        openFileDialogOnClick={false}
      />
      <input
        type="file"
        ref={hiddenFileInputRef}
        style={{ display: "none" }}
        onChange={async (e) => {
          const files = e.target.files;
          if (files.length > 0) {
            const file = files[0];
            const newFile = {
              uid: new Date().toISOString(),
              name: file.name,
              status: "done",
              url: URL.createObjectURL(file),
            };

            setFileList((prev) => [...prev, newFile]);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("mode", modeUpload);

            try {
              const response = await useServiceAPI.post(paths.pathUpload, formData);

              if (onUploadSuccess && typeof onUploadSuccess === "function") {
                onUploadSuccess(response); // Pass the response to the parent component
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

export default FileUploadComponentNew;