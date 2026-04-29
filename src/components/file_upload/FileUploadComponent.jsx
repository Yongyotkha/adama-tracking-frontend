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
const FileUploadComponent = forwardRef((props, ref) => {
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
        onPreview={mode === "view" ? handlePreview : handlePreview} // ถ้าจะปิด preview ทั้งหมด ดูข้อ (3)
        onChange={handleChange}
        showUploadList={{
          showRemoveIcon: mode !== "view",
          showPreviewIcon: true, // ถ้าจะปิด preview ทั้งหมด ดูข้อ (3)
        }}
        onRemove={(file) => {
          // ✅ ไม่ให้เด้ง preview ค้าง
          setPreviewOpen(false);
          setPreviewImage("");

          // ✅ revoke object url (ไฟล์ที่มาจาก URL.createObjectURL)
          if (file?.url?.startsWith("blob:")) {
            URL.revokeObjectURL(file.url);
          }

          // ✅ อัปเดต local
          setFileList((prev) => prev.filter((item) => item.uid !== file.uid));

          // ✅ อัปเดต parent (สำคัญที่สุด)
          if (typeof onRemove === "function") onRemove(file);

          // ✅ ไม่ต้อง post อะไรตอนลบ (ไม่มีอยู่แล้ว)
          return true;
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

export default FileUploadComponent;