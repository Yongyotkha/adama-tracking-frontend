import React, { useState, useEffect } from "react";
import { Modal, Input, Button, DatePicker, Select, Upload } from "antd";
import { UploadOutlined, EnvironmentOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const { Option } = Select;

const FormModal = ({
  isVisible,
  onClose,
  onChange,
  title = "Mapping",
  dataSource,
  perceptionData,
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
    photo: [],
  });

  // UseEffect เพื่ออัปเดต formData เมื่อ dataSource เปลี่ยน
  useEffect(() => {
    if (dataSource) {
      setFormData({
        documentNumber: dataSource.document_number || "",
        customerName: dataSource.customer_name || "",
        placeOfOwner: dataSource.customer_place_of_owner || "",
        phoneNumber: dataSource.customer_phone_number || "",
        address: dataSource.customer_address || "",
        longitude: dataSource.location_latitude || "",
        latitude: dataSource.location_longitude || "",
        perception: dataSource.perception || "",
        remark: dataSource.remark || "",
        date: dataSource.date ? dayjs(dataSource.date) : null,
        photo: dataSource.photo || [],
      });
    }
  }, [dataSource]);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = ({ fileList }) => {
    // setFormData((prev) => ({ ...prev, photo: fileList }));
    onChange(fileList);
  };

  const [locationCurrent, setLocationCurrent] = useState({
    latitude: "",
    longitude: "",
  });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationCurrent({ latitude, longitude });
          console.log("Current Location:", { latitude, longitude });
        },
        (error) => {
          console.error("Error fetching location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Get Current Location
  useEffect(() => {
    handleGetLocation();
  }, []);

  const submitForm = () => {
    console.log("Form Data:", formData);
    // Return
    onClose(formData);
  };

  // const handleLocation = () => {
  //   console.log('Location action triggered');
  //   // Implement location reloading or setting logic here
  // };

  return (
    <Modal
      title={title}
      visible={isVisible}
      onCancel={onClose}
      dataSource={dataSource}
      perceptionData={perceptionData}
      onOk={submitForm}
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
        <div className="col-span-4 md:col-span-1 hidden">
          <label className="block mb-2 font-medium text-gray-700">
            Document Number
          </label>
          <Input
            disabled
            value={formData.documentNumber || dataSource.document_number}
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
            onChange={(value) => handleInputChange("customerName", value)}
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
            value={formData.perception}
            onChange={(value) => handleInputChange("perception", value)}
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
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
        </div>
        <div className="col-span-4 hidden">
          <label className="block mb-2 font-medium text-gray-700">
            Longitude
          </label>
          <Input
            disabled
            value={formData.longitude || dataSource.location_longitude}
            onChange={(e) => handleInputChange("address", e.target.value)}
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
        <div className="col-span-4 md:col-span-4">
          <label className="block mb-2 font-medium text-gray-700">Photo</label>
          <Upload onChange={handleFileChange} listType="picture" maxCount={1}>
            <Button icon={<UploadOutlined />} className="w-full">
              Upload (Max: 1)
            </Button>
          </Upload>
        </div>

        <div className="col-span-4 md:col-span-4">
          <label className="block mb-2 font-medium text-gray-700">Remark</label>
          <Input.TextArea
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

export default FormModal;
