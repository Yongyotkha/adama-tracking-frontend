import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Input, Button, Select, Upload, Image } from "antd";
import {
  CameraOutlined,
  EnvironmentOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Webcam from "react-webcam";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";

dayjs.extend(customParseFormat);

const { Option } = Select;

const FormMappingModal = ({
  isVisible,
  onClose,
  onOk,
  title = "Mapping",
  dataSource,
  perceptionData,
}) => {
  const [formData, setFormData] = useState({});
  const [permission, setPermission] = useState({});
  const webcamRef = useRef(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const [photoError, setPhotoError] = useState("");
  const [perceptionError, setPerceptionError] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [followFileList, setFollowFileList] = useState([]);

  const statusCode = String(
    formData?.status_code || dataSource?.status_code || ""
  ).toUpperCase();

  const statusName = String(
    formData?.status_mapping_name ||
      dataSource?.status_mapping_name ||
      dataSource?.status_mapping?.name ||
      ""
  ).toUpperCase();

  const isFollowUpMode = statusCode === "ODC" || statusName === "COMPLETE";
  const canShowSaveButton = Boolean(permission.edit || isFollowUpMode);

  const getFileUrl = (file) => {
    return (
      file?.url ||
      file?.thumbUrl ||
      file?.response?.url ||
      file?.response?.file_url ||
      file?.response?.fileUrl
    );
  };

  useEffect(() => {
    if (
      formData.location_latitude &&
      formData.location_longitude &&
      permission.edit
    ) {
      fetchAddress();
    }
  }, [formData.location_latitude, formData.location_longitude, permission]);

  const stopWebcam = () => {
    if (webcamRef.current?.video?.srcObject) {
      const stream = webcamRef.current.video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      webcamRef.current.video.srcObject = null;
    }
  };

  const handleClose = () => {
    stopWebcam();
    setIsCameraOn(false);
    setPreviewOpen(false);
    onClose();
  };

  useEffect(() => {
    if (isVisible) {
      setFormData({});
      setFollowFileList([]);
      setPhotoError("");
      setPerceptionError("");
      setPreviewOpen(false);
      setPreviewIndex(0);
      setIsCameraOn(false);
      fetchActivityListDetails();
      setTimeout(() => setIsCameraOn(true), 300);
    } else {
      stopWebcam();
      setIsCameraOn(false);
      setPreviewOpen(false);
    }
  }, [isVisible]);

  const fetchActivityListDetails = async () => {
    try {
      const response = await useServiceAPI.get(
        paths.pathActivityMappingStatusDetail,
        { document_number: dataSource.document_number }
      );

      if (response.status === 200) {
        const { data, permission } = response;

        setPermission(permission || {});

        const followImages =
          data.follow_image_list ||
          data.follow_images ||
          data.follow_image ||
          [];

        const normalizedFollowImages = Array.isArray(followImages)
          ? followImages
          : followImages
          ? [followImages]
          : [];

        setFollowFileList(
          normalizedFollowImages.map((url, index) => ({
            uid: `follow-${index}`,
            name: `follow-image-${index + 1}`,
            status: "done",
            url,
            thumbUrl: url,
          }))
        );

        if (permission?.edit) {
          setFormData((prev) => ({
            ...prev,
            ...data,
            id: data.id,
            status_code: data.status_code,
            perception_id: data.perception_id || data.customer_perception_id,
            image_list: [],
            follow_image_list: normalizedFollowImages,
            follow_remark: data.follow_remark || "",
          }));

          handleGetLocation();
        } else {
          setFormData((prev) => ({
            ...prev,
            ...data,
            id: data.id,
            status_code: data.status_code,
            perception_id: data.perception_id || data.customer_perception_id,
            follow_image_list: normalizedFollowImages,
            follow_remark: data.follow_remark || "",
          }));
        }
      } else {
        console.error("Failed to fetch details:", response.message);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const handleGetLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setFormData((prev) => ({
            ...prev,
            location_latitude: latitude,
            location_longitude: longitude,
          }));
        },
        (error) => {
          console.error("Error fetching location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const fetchAddress = async () => {
    const apiKey = "AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${formData.location_latitude},${formData.location_longitude}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        setFormData((prev) => ({
          ...prev,
          location_address: data.results[0].formatted_address,
        }));
      } else {
        console.error("Geocoding API error:", data.status);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const uploadFile = async (file) => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("mode", "profile");

    const response = await useServiceAPI.post(paths.pathUpload, uploadFormData);

    const fileUrl = response?.file_url || response?.data?.file_url;

    if (fileUrl) {
      return fileUrl;
    }

    throw new Error("Upload failed");
  };

  const handleImageChange = async (imageSrc) => {
    const blob = await fetch(imageSrc).then((res) => res.blob());
    const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
    return uploadFile(file);
  };

  const captureImage = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();

      if (imageSrc) {
        try {
          const uploadedImageUrl = await handleImageChange(imageSrc);

          setFormData((prev) => ({
            ...prev,
            image_list: [uploadedImageUrl],
          }));
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    }
  }, [webcamRef]);

  const handleFollowImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      const currentList = formData.follow_image_list || [];

      if (currentList.length >= 10) {
        throw new Error("Follow Up Photo limited to 10 images.");
      }

      const uploadedUrl = await uploadFile(file);
      const nextImageList = [...currentList, uploadedUrl].slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        follow_image_list: nextImageList,
      }));

      onSuccess({
        url: uploadedUrl,
        file_url: uploadedUrl,
      });
    } catch (error) {
      console.error("Follow image upload failed:", error);
      onError(error);
    }
  };

  const handleFollowFileChange = ({ fileList }) => {
    const limitedFileList = fileList.slice(0, 10).map((file) => {
      const url = getFileUrl(file);

      return {
        ...file,
        url,
        thumbUrl: url || file.thumbUrl,
      };
    });

    setFollowFileList(limitedFileList);

    const imageUrls = limitedFileList
      .map((file) => file.url || file.thumbUrl)
      .filter(Boolean);

    setFormData((prev) => ({
      ...prev,
      follow_image_list: imageUrls,
    }));
  };

  const handleFollowFileRemove = (file) => {
    const removeUrl = getFileUrl(file);

    setFormData((prev) => ({
      ...prev,
      follow_image_list: (prev.follow_image_list || []).filter(
        (url) => url !== removeUrl
      ),
    }));

    setFollowFileList((prev) =>
      prev.filter((item) => item.uid !== file.uid)
    );

    return true;
  };

  const beforeFollowUpload = (file) => {
    const isImage = ["image/jpeg", "image/png", "image/jpg"].includes(
      file.type
    );

    if (!isImage) {
      console.error("Only JPEG, JPG and PNG files are allowed.");
      return Upload.LIST_IGNORE;
    }

    if ((formData.follow_image_list || []).length >= 10) {
      console.error("Follow Up Photo limited to 10 images.");
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handlePreviewFollowImage = (file) => {
    const imageUrl = getFileUrl(file);

    if (!imageUrl) return;

    const imageList = followFileList
      .map((item) => getFileUrl(item))
      .filter(Boolean);

    const currentUrl = imageUrl;
    const index = imageList.findIndex((url) => url === currentUrl);

    setPreviewIndex(index >= 0 ? index : 0);
    setPreviewOpen(true);
  };

  const handleSubmit = () => {
    setPerceptionError("");
    setPhotoError("");

    if (permission.edit) {
      if (!formData.perception_id) {
        setPerceptionError("Please select a perception_id.");
        return;
      }

      if (!formData.image_list || formData.image_list.length <= 0) {
        setPhotoError("Please capture a photo.");
        return;
      }
    }

    const payload = {
      ...formData,
      id: formData.id,
      document_number: formData.document_number,
      location_longitude: formData.location_longitude,
      location_latitude: formData.location_latitude,
      location_address: formData.location_address,
      perception_id: formData.perception_id,
      remark: formData.remark || "",
      image_list: formData.image_list || [],
      follow_image_list: formData.follow_image_list || [],
      follow_remark: formData.follow_remark || "",
    };

    if (onOk) {
      onOk(payload);
    }

    stopWebcam();
    onClose();
  };

  const handleGetLocationToGoogleMap = () => {
    if (formData.location_latitude && formData.location_longitude) {
      const lat = formData.location_latitude;
      const lng = formData.location_longitude;
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(googleMapsUrl, "_blank");
    } else {
      console.error("No latitude and longitude data available.");
    }
  };

  const previewImages = followFileList
    .map((file) => getFileUrl(file))
    .filter(Boolean);

  return (
    <Modal
      title={title}
      visible={isVisible}
      onCancel={handleClose}
      onOk={handleSubmit}
      width="1200px"
      className="ant-modal"
      okText={isFollowUpMode ? "Save" : "Complete"}
      cancelText="Close"
      okButtonProps={{
        style: {
          backgroundColor: "#00783F",
          borderColor: "#00783F",
          color: "#ffffff",
          display: canShowSaveButton ? "" : "none",
        },
      }}
    >
      <div className="grid grid-cols-4 gap-4 py-4">
        <div className="col-span-4 md:col-span-1 hidden">
          <label className="block mb-2 font-medium text-gray-700">ID</label>
          <Input disabled value={formData.id} />
        </div>

        <div className="col-span-4 md:col-span-1 hidden">
          <label className="block mb-2 font-medium text-gray-700">
            Document Number
          </label>
          <Input disabled value={formData.document_number} />
        </div>

        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">
            Support Customer Name
          </label>
          <Input disabled value={formData.customer_name} />
        </div>

        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">
            Place of Owner
          </label>
          <Input disabled value={formData.customer_place_of_owner} />
        </div>

        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">
            Phone Number
          </label>
          <Input disabled value={formData.customer_phone_number} />
        </div>

        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">
            Perception<span className="text-red-500">*</span>
          </label>
          <Select
            className="w-full"
            value={formData.perception_id}
            onChange={(value) =>
              setFormData({ ...formData, perception_id: value })
            }
            placeholder="Select"
            disabled={!permission.edit}
          >
            {perceptionData.map((data, index) => (
              <Option key={index} value={data.id}>
                {data.name}
              </Option>
            ))}
          </Select>

          {perceptionError && (
            <div className="text-red-500 mt-1">{perceptionError}</div>
          )}
        </div>

        <div className="col-span-4">
          <label className="block mb-2 font-medium text-gray-700">
            Address
          </label>
          <Input disabled value={formData.customer_address} />
        </div>

        <div className="col-span-4 md:col-span-4">
          <div className="flex justify-between">
            <label className="block mb-2 font-medium text-gray-700">
              Place of GPS<span className="text-red-500">*</span>
            </label>

            {isFollowUpMode && (
              <button
                className="w-6 h-6"
                onClick={handleGetLocationToGoogleMap}
                title="Open in Google Maps"
                type="button"
              >
                <img src="/img/icons/google-map.png" alt="Google Map" />
              </button>
            )}
          </div>

          <Input
            disabled
            className="w-full"
            value={formData.location_address}
            placeholder="GPS Location"
            prefix={<EnvironmentOutlined />}
            suffix={
              permission.edit ? (
                <Button
                  icon={
                    <img
                      src="/img/icons/reload.png"
                      alt="Reload"
                      style={{ width: 20, height: 20 }}
                    />
                  }
                  onClick={handleGetLocation}
                  style={{ border: "none", background: "transparent" }}
                />
              ) : null
            }
          />
        </div>

        <div className="col-span-4 md:col-span-4 flex flex-col">
          <label className="block mb-2 font-medium text-gray-700">
            Photo<span className="text-red-500">*</span>
          </label>

          {permission.edit && (
            <>
              {isCameraOn && (
                <Webcam
                  key={isVisible}
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  style={{ width: "100%", maxHeight: "300px" }}
                />
              )}

              {photoError && (
                <div className="text-red-500 mt-1 text-center">
                  {photoError}
                </div>
              )}

              <Button
                onClick={captureImage}
                className="w-[auto] mt-2 mx-auto"
                icon={<CameraOutlined style={{ fontSize: "24px" }} />}
              >
                Capture Photo
              </Button>
            </>
          )}

          {formData?.image_list?.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center my-2">
              {formData.image_list.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Captured ${index + 1}`}
                  className="w-fit h-full max-h-[300px] rounded-lg shadow-lg"
                />
              ))}
            </div>
          )}
        </div>

        <div className="col-span-4 md:col-span-4">
          <label className="block mb-2 font-medium text-gray-700">
            Remark
          </label>
          <Input.TextArea
            className="w-full"
            rows={4}
            value={formData.remark}
            disabled={!permission.edit}
            placeholder="Free Text"
            onChange={(e) =>
              setFormData({ ...formData, remark: e.target.value })
            }
          />
        </div>

        {isFollowUpMode && (
          <>
            <div className="col-span-4 md:col-span-4">
              <label className="block mb-2 font-medium text-gray-700">
                Follow Up Photo
              </label>

              <Image.PreviewGroup
                preview={{
                  visible: previewOpen,
                  current: previewIndex,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  onChange: (current) => setPreviewIndex(current),
                }}
              >
                <Upload
                  multiple
                  accept=".jpg,.jpeg,.png"
                  maxCount={10}
                  disabled={!isFollowUpMode}
                  customRequest={handleFollowImageUpload}
                  beforeUpload={beforeFollowUpload}
                  fileList={followFileList}
                  onChange={handleFollowFileChange}
                  onRemove={handleFollowFileRemove}
                  onPreview={handlePreviewFollowImage}
                  listType="picture-card"
                >
                  {followFileList.length >= 10 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>

                <div style={{ display: "none" }}>
                  {previewImages.map((url, index) => (
                    <Image key={`${url}-${index}`} src={url} />
                  ))}
                </div>
              </Image.PreviewGroup>

              <div className="text-xs text-gray-400 mt-1">
                JPEG, PNG / Limited 10 images
              </div>
            </div>

            <div className="col-span-4 md:col-span-4">
              <label className="block mb-2 font-medium text-gray-700">
                Follow Up Remark
              </label>
              <Input.TextArea
                className="w-full"
                rows={4}
                value={formData.follow_remark}
                disabled={!isFollowUpMode}
                placeholder="Free Text"
                onChange={(e) =>
                  setFormData({ ...formData, follow_remark: e.target.value })
                }
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default FormMappingModal;