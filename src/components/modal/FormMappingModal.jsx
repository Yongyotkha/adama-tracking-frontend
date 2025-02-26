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
    // document_number: "",
    // perception_id: "",
    // image_list: [],
    // location_latitude: "",
    // location_longitude: "",
    // location_address: "",
    // remark: "",
  });

  
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

    if (dataSource && Object.keys(dataSource).length > 0) {
      fetchActivityListDetails();
      console.log(dataSource);
    } else {
      console.log(dataSource);
    }

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
        setFormData(data)

        // setPerception(data.customer_perception_id_id);
        // setFormData((prevFormData) => ({
        //   ...prevFormData,
        //   customerName: data.customer_name || prevFormData.customerName,
        //   placeOfOwner:
        //     data.customer_place_of_owner || prevFormData.placeOfOwner,
        //   phoneNumber: data.customer_phone_number || prevFormData.phoneNumber,
        //   address: data.customer_address || prevFormData.address,
        //   Remark: data.remark || prevFormData.remark,
        // }));


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
    const apiKey = "AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik"; 
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {        
        setFormData({ ...formData, location_address: data.results[0].formatted_address , location_longitude: lng, location_latitude:lat });
      } else {
        console.error("Geocoding API error:", data.status);
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Error fetching address";
    }
  };



  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData({location_longitude: latitude, location_latitude:longitude});
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

  useEffect(() => {
    if (isVisible && !isReadOnly) {
      handleGetLocation();

    }
  }, [isVisible, isReadOnly]);

  // const captureImage = useCallback(() => {
  //   if (webcamRef.current) {
  //     const imageSrc = webcamRef.current.getScreenshot();
  //     setCapturedImage(imageSrc);
  //     // console.log(imageSrc);
  //     console.log(imageSrc);
  //     setFormData((prev) => ({
  //       ...prev,
  //       image_list: imageSrc,
  //     }));
      
  //     // if (formData) {
  //     //   formData.image_list = imageSrc;
  //     // }
  //     setPhotoError(""); 
  //   }
  // }, [webcamRef, formData]);


  // const handleImageChange = async (e) => {
  //   const file = e.target.files[0];
  //   setImagePreview(URL.createObjectURL(file));

  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("mode", "profile");

  //   try {
  //     const response = await useServiceAPI.post(
  //       paths.pathUpload,
  //       formData,
  //       setLoading
  //     );
  //     form?.setFieldsValue({
  //       profile: response.data.file_url,
  //     });
  //   } catch (error) {
  //     console.error("Error uploading form data:", error);
  //     showMsg("error", "เกิดข้อผิดพลาด");
  //   }
  // };


  const captureImage = useCallback(async () => {
    if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        console.log(imageSrc); // แสดงค่า imageSrc ใน console
        setCapturedImage(imageSrc);

        if (imageSrc) {
            try {
                // เรียก handleImageChange และรอค่ากลับมา
                const uploadedImageUrl = await handleImageChange(imageSrc);
                
                // นำค่าที่ได้จาก handleImageChange ไปอัปเดต state formData
                setFormData((prev) => ({
                    ...prev,
                    image_list: uploadedImageUrl, // ใช้ URL ที่อัปโหลดแทนค่า imageSrc เดิม
                }));
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
          const response = await useServiceAPI.post(paths.pathUpload, formData, setLoading);

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
    console.log(formData);
    // return;
    setPhotoError("");

    // if (!formData.perception_id) {
    //   setPerceptionError("Please select a perception_id.");
    //   return;
    // } 
    // if (!formData.photo) {
    //   setPhotoError("Please capture a photo.");
    //   return;
    // }

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
        <div className="col-span-4 md:col-span-1 hidden ">
          <label className="block mb-2 font-medium text-gray-700">
            Document Number
          </label>
          <Input
            disabled
            value={formData.document_number}
          />
        </div>
        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">
            Support Customer Name
          </label>
          <Input
            disabled
            value={formData.customer_name}
          />
        </div>
        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">
            Place of Owner
          </label>
          <Input
            disabled
            value={formData.customer_place_of_owner}
          />
        </div>
        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">
            Phone Number
          </label>
          <Input
            disabled
            value={formData.customer_phone_number}
          />
        </div>

        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">
            Perception
          </label>
          <Select
            className="w-full"
            value={formData.perception_id}
            onChange={(value) => setFormData({...formData, perception_id: value})}
            placeholder="Select"
          >
            {perceptionData.map((data, index) => (
              <Option key={index} value={data.id}>
                {data.name}
              </Option>
            ))}
          </Select>
        </div>


        <div className="col-span-4">
          <label className="block mb-2 font-medium text-gray-700">
            Address
          </label>
          <Input
            disabled
            value={formData.customer_address}
          />
        </div>
        <div className="col-span-4 hidden">
          <label className="block mb-2 font-medium text-gray-700">
            Latitude
          </label>
          <Input
            disabled
            value={formData.latitude}
          />
        </div>
        <div className="col-span-4 hidden">
          <label className="block mb-2 font-medium text-gray-700">
            Longitude
          </label>
          <Input
            disabled
            value={formData.longitude}
          />
        </div>
        <div className="col-span-4 md:col-span-4">
          <label className="block mb-2 font-medium text-gray-700">
            Place of GPS
          </label>
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
            value={formData.remark}
          />
        </div>
      </div>
    </Modal>
  );
};

export default FormMappingModal;
