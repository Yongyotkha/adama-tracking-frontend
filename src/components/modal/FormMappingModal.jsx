import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Input, Button, DatePicker, Select } from "antd";
import { CameraOutlined, EnvironmentOutlined } from "@ant-design/icons";
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
  const [photoError, setPhotoError] = useState("");
  const [perceptionError, setPerceptionError] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(false);

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
    onClose();
  };

  useEffect(() => {
    if (isVisible) {
      setFormData({});
      setIsCameraOn(false);
      fetchActivityListDetails();
      setTimeout(() => setIsCameraOn(true), 300);
    } else {
      stopWebcam();
      setIsCameraOn(false);
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
        console.log(permission.edit);

        setPermission(permission);
        if (permission.edit) {
          setFormData((prev) => ({
            ...prev,
            ...data,
            image_list: [],
          }));
          handleGetLocation();
        } else {
          setFormData((prev) => ({
            ...prev,
            ...data,
            perception_id: data.customer_perception_id,
          }));
        }
      } else {
        console.error("Failed to fetch details:", response.message);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
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
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Error fetching address";
    }
  };

  const captureImage = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      // setCapturedImage(imageSrc);
      if (imageSrc) {
        try {
          // เรียก handleImageChange และรอค่ากลับมา
          const uploadedImageUrl = await handleImageChange(imageSrc);

          // นำค่าที่ได้จาก handleImageChange ไปอัปเดต state formData
          setFormData((prev) => ({
            ...prev,
            image_list: [uploadedImageUrl],
          }));
          setIsCameraOn(false);  // 👉 หลังถ่ายรูป ปิดกล้องไปเลย
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    }
  }, [webcamRef]);


  const handleImageChange = async (imageSrc) => {
    const blob = await fetch(imageSrc).then((res) => res.blob());
    const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "profile");

    try {
      const response = await useServiceAPI.post(paths.pathUpload, formData);

      if (response?.data?.file_url) {
        console.log("Uploaded Image URL:", response.data.file_url);
        return response.data.file_url; // ส่งค่า URL กลับไปใช้ใน captureImage
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSubmit = () => {
    setPerceptionError("");
    setPhotoError("");

    if (!formData.perception_id) {
      setPerceptionError("Please select a perception_id.");
      return;
    }
    if (formData.image_list.length <= 0) {
      setPhotoError("Please capture a photo.");
      return;
    }

    if (onOk) {
      onOk({ ...formData });
    }
    stopWebcam(); // Stop the webcam after saving
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
  console.log(formData);
  return (
    <Modal
      title={title}
      visible={isVisible}
      onCancel={handleClose}
      onOk={handleSubmit}
      width="1200px"
      className="ant-modal"
      okText="Complete"
      cancelText="Close"
      okButtonProps={{
        style: {
          backgroundColor: "#00783F",
          borderColor: "#00783F",
          color: "#ffffff",
          display: `${permission.edit ? "" : "none"}`,
        },
      }}
    >
      <div className="grid grid-cols-4 gap-4 py-4">
        <div className="col-span-4 md:col-span-1 hidden ">
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
            Perception
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
        <div className="col-span-4 hidden">
          <label className="block mb-2 font-medium text-gray-700">
            Latitude
          </label>
          <Input disabled value={formData.latitude} />
        </div>
        <div className="col-span-4 hidden">
          <label className="block mb-2 font-medium text-gray-700">
            Longitude
          </label>
          <Input disabled value={formData.longitude} />
        </div>
        <div className="col-span-4 md:col-span-4">
          <div className="flex justify-between">
            <label className="block mb-2 font-medium text-gray-700">
              Place of GPS
            </label>
            {dataSource?.status_mapping_name === "Complete" && (
              <button
                className="w-6 h-6"
                onClick={handleGetLocationToGoogleMap}
              >
                <img
                  src="/img/icons/google-map.png"
                  alt="Google Map"
                />
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
            }
          />
        </div>

        {/* Webcam Capture Section */}
        <div className="col-span-4 md:col-span-4 flex flex-col">
          <label className="block mb-2 font-medium text-gray-700">Photo</label>

          {permission.edit && (
            <>
              {isCameraOn && (
                <Webcam
                  key={isVisible} // Remount ใหม่ทุกครั้งที่ Modal เปิด
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

              {/* ปุ่มเปลี่ยนตามสถานะ */}
              {formData?.image_list?.length > 0 ? (
                <Button
                  onClick={() => {
                    // Reset รูปและเปิดกล้องใหม่
                    setFormData((prev) => ({ ...prev, image_list: [] }));
                    setIsCameraOn(true);
                  }}
                  className="w-[auto] mt-2 mx-auto flex items-center gap-2"
                  icon={
                    <img
                      src="/img/icons/reload.png"
                      alt="Reload"
                      style={{ width: 20, height: 20 }}
                    />
                  }
                >
                  Retake Photo
                </Button>
              ) : (
                <Button
                  onClick={captureImage}
                  className="w-[auto] mt-2 mx-auto flex items-center gap-2"
                  icon={<CameraOutlined style={{ fontSize: "20px" }} />}
                >
                  Capture Photo
                </Button>
              )}
            </>
          )}

          {/* แสดงภาพที่ถ่ายได้ */}
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
          <label className="block mb-2 font-medium text-gray-700">Remark</label>
          <Input.TextArea
            className="w-full"
            rows={4}
            value={formData.remark}
            disabled={!permission.edit}
            onChange={(e) =>
              setFormData({ ...formData, remark: e.target.value })
            }
          />
        </div>
      </div>
    </Modal>
  );
};

export default FormMappingModal;
