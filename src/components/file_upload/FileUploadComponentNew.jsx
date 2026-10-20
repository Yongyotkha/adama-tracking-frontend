import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import { Image, Upload, message } from "antd";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import PdfPreviewModal from "./PdfPreviewModal";
import { attachmentUrl, isImageAttachment, isPdfAttachment, openAttachmentInNewTab } from "./filePreview";

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
  const [pdfPreview, setPdfPreview] = useState({ open: false, url: "", title: "" });
  // const [fileList, setFileList] = useState(dataFile);
  // optional: ไม่ต้องมี state ภายใน ถ้าต้องการ controlled ทั้งหมดจาก parent
  const [fileList, setFileList] = useState([]);
  const hiddenFileInputRef = useRef(null);

  useEffect(() => {
    setFileList(dataFile);
  }, [dataFile]);

  const handlePreview = async (file) => {
    if (isPdfAttachment(file)) {
      const url = attachmentUrl(file);
      if (!url) {
        message.warning("ไม่พบไฟล์สำหรับเปิดดู");
        return;
      }
      setPdfPreview({ open: true, url, title: file.name || file.file_name || "PDF" });
      return;
    }

    if (!isImageAttachment(file)) {
      const url = attachmentUrl(file);
      if (!openAttachmentInNewTab(url)) {
        message.warning("ไม่พบไฟล์สำหรับเปิดดู");
      }
      return;
    }

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
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        // onChange={handleChange}
        onChange={() => { /* ปล่อยให้ parent คุม */ }}
        showUploadList={{
          showRemoveIcon: mode !== "view",
        }}
        onRemove={(file) => {
          // Remove file from local state
          // setFileList((prev) => prev.filter((item) => item.uid !== file.uid));

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
            // const newFile = {
            //   uid: new Date().toISOString(),
            //   name: file.name,
            //   status: "done",
            //   url: URL.createObjectURL(file),
            // };

            // setFileList((prev) => [...prev, newFile]);

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

      <PdfPreviewModal
        open={pdfPreview.open}
        url={pdfPreview.url}
        title={pdfPreview.title}
        onClose={() => setPdfPreview((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
});

export default FileUploadComponentNew;