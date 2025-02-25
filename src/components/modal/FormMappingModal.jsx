import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Input, Button, DatePicker, Select } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
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
  isReadOnly = false,
}) => {
  const [formData, setFormData] = useState({
    documentNumber: "",
    customerName: "",
    placeOfOwner: "",
    phoneNumber: "",
    address: "",
    longitude: "",
    latitude: "",
    perception: "",
    remark: "",
    date: null,
    photo: null,
    gps: "",
  });

  const [locationCurrent, setLocationCurrent] = useState({
    latitude: "",
    longitude: "",
  });
  const [perceptionError, setPerceptionError] = useState("");
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectPerception, setPerception] = useState({});

  const stopWebcam = () => {
    if (webcamRef.current && webcamRef.current.stream) {
      const tracks = webcamRef.current.stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const handleClose = () => {
    stopWebcam();
    onClose();
  };

  useEffect(() => {
    if (dataSource) {
      console.log(dataSource, 1111111);
      fetchActivityListDetails();
    } else {
      console.log(dataSource, 222222);
    }

    // if (dataSource) {
    //   setFormData({
    //     documentNumber: dataSource.document_number || "",
    //     customerName: dataSource.customer_name || "",
    //     placeOfOwner: dataSource.customer_place_of_owner || "",
    //     phoneNumber: dataSource.customer_phone_number || "",
    //     address: dataSource.customer_address || "",
    //     longitude: dataSource.location_latitude || "",
    //     latitude: dataSource.location_longitude || "",
    //     perception: dataSource.perception || "",
    //     remark: dataSource.remark || "",
    //     date: dataSource.date ? dayjs(dataSource.date) : null,
    //     photo: dataSource.photo || null,
    //     gps: dataSource.location_address,
    //   });
    //   fetchActivityListDetails(dataSource.document_number);
    // }
  }, [dataSource]);

  const fetchActivityListDetails = async () => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(
        paths.pathActivityMappingStatusDetail,
        { document_number: dataSource.document_number }
      );
      if (response.status === 200) {
        const { data } = response;
        console.log(data);

        setPerception(data.customer_perception_id);

        setFormData((prevFormData) => ({
          ...prevFormData,
          customerName: data.customer_name || prevFormData.customerName,
          placeOfOwner:
            data.customer_place_of_owner || prevFormData.placeOfOwner,
          phoneNumber: data.customer_phone_number || prevFormData.phoneNumber,
          address: data.customer_address || prevFormData.address,
          Remark: data.remark || prevFormData.remark,
        }));
      } else {
        console.error("Failed to fetch details:", response.message);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddress = async (lat, lng) => {
    const apiKey = "AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik"; // ใส่ Google Maps API Key ของคุณ
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        // return data.results[0].formatted_address; // คืนค่าที่อยู่
        console.log(data.results[0].formatted_address);
        setFormData({ ...formData, gps: data.results[0].formatted_address });
      } else {
        console.error("Geocoding API error:", data.status);
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Error fetching address";
    }
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (key === "perception" && dataSource) {
      dataSource.perception = value;
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchAddress(latitude, longitude);
        },
        (error) => {
          console.error("Error fetching location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Get Current Location on mount
  useEffect(() => {
    if (isVisible && !isReadOnly) {
      handleGetLocation();
    }
  }, [isVisible, isReadOnly]);

  const captureImage = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setFormData((prev) => ({
        ...prev,
        photo: imageSrc,
      }));
      // Update dataSource with the captured image
      if (dataSource) {
        dataSource.photo = imageSrc;
      }
      setPhotoError(""); // Clear error if an image is captured
    }
  }, [webcamRef, dataSource]);

  const handleSubmit = () => {
    setPerceptionError("");
    setPhotoError("");

    if (!formData.perception) {
      setPerceptionError("Please select a perception.");
      return;
    }

    if (!formData.photo) {
      setPhotoError("Please capture a photo.");
      return;
    }

    if (onOk) {
      onOk({ ...formData });
    }
    stopWebcam(); // Stop the webcam after saving
    onClose();
  };

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
        },
      }}
    >
      <div className="grid grid-cols-4 gap-4 py-4">
        <div className="col-span-4 md:col-span-1 ">
          <label className="block mb-2 font-medium text-gray-700">
            Document Number
          </label>
          <Input
            disabled
            value={formData.documentNumber || dataSource.document_number}
            // onChange={(e) => handleInputChange("documentNumber", e.target.value)}
            onChange={(value) => handleInputChange("documentNumber", value)}
          />
        </div>
        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">
            Support Customer Name
          </label>
          <Input
            disabled
            value={formData.customerName || dataSource.customer_name}
            onChange={(e) => handleInputChange("customerName", e.target.value)}
          />
        </div>
        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">
            Place of Owner
          </label>
          <Input
            disabled
            value={formData.placeOfOwner || dataSource.customer_place_of_owner}
            onChange={(e) => handleInputChange("placeOfOwner", e.target.value)}
          />
        </div>
        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">
            Phone Number
          </label>
          <Input
            disabled
            value={formData.phoneNumber || dataSource.customer_phone_number}
            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
          />
        </div>
        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">
            Perception
          </label>
          <Select
            className="w-full"
            value={selectPerception}
            onChange={(value) => handleInputChange("perception", value)}
            placeholder="Select"
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
          <Input
            disabled
            value={formData.address || dataSource.customer_address}
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
        </div>
        <div className="col-span-4 hidden">
          <label className="block mb-2 font-medium text-gray-700">
            Latitude
          </label>
          <Input
            disabled
            value={formData.latitude || dataSource.location_latitude}
            onChange={(e) => handleInputChange("latitude", e.target.value)}
          />
        </div>
        <div className="col-span-4 hidden">
          <label className="block mb-2 font-medium text-gray-700">
            Longitude
          </label>
          <Input
            disabled
            value={formData.longitude || dataSource.location_longitude}
            onChange={(e) => handleInputChange("longitude", e.target.value)}
          />
        </div>
        <div className="col-span-4 md:col-span-4">
          <label className="block mb-2 font-medium text-gray-700">
            Place of GPS
          </label>
          <Input
            disabled
            className="w-full"
            value={formData.gps}
            onChange={(e) => setFormData({ ...formData, gps: e.target.value })}
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
          
          {!isReadOnly && (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                style={{ width: "100%", maxHeight: "300px" }}
              />
              <Button
                onClick={captureImage}
                className="w-[auto] mt-2 mx-auto"
                disabled={isReadOnly}
              >
                Capture Photo
              </Button>
            </>
          )}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-fit max-h-[300px] mt-2 mx-auto"
            />
          )}
          {photoError && <div className="text-red-500 mt-1">{photoError}</div>}
        </div>

        <div className="col-span-4 md:col-span-4">
          <label className="block mb-2 font-medium text-gray-700">Remark</label>
          <Input.TextArea
            disabled={isReadOnly}
            className="w-full"
            rows={4}
            value={formData.remark || dataSource.remark}
            onChange={(e) => handleInputChange("remark", e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default FormMappingModal;
