import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Image, Upload, message } from 'antd';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// eslint-disable-next-line react/display-name
const FileUploadComponent = forwardRef(({ dataFile = [], mode = "edit" }, ref) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState(dataFile); // Initialize with dataFile prop
  const hiddenFileInputRef = useRef(null);

  // Update fileList whenever dataFile changes
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

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  // Method to trigger the hidden file input click
  const triggerUpload = () => {
    if (hiddenFileInputRef.current) {
      hiddenFileInputRef.current.click();
    }
  };

  // Expose triggerUpload to parent component using ref
  useImperativeHandle(ref, () => ({
    triggerUpload,
  }));

  return (
    <>
      <Upload
        action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        showUploadList={{
          showRemoveIcon: mode !== "view", // Disable delete button if mode is "view"
        }}
        openFileDialogOnClick={false} // Prevent default click behavior on upload area
      />

      {/* Hidden file input to manually trigger file selection */}
      <input
        type="file"
        ref={hiddenFileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = e.target.files;
          if (files.length > 0) {
            const file = files[0];
            setFileList((prev) => [
              ...prev,
              {
                uid: new Date().toISOString(),
                name: file.name,
                status: 'done',
                url: URL.createObjectURL(file),
              },
            ]);
            message.success(`${file.name} uploaded successfully.`);
          }
        }}
      />

      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </>
  );
});

export default FileUploadComponent;
