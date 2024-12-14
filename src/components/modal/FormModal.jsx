import React, { useState } from "react";
import { Modal, Input, Button, DatePicker, Select, Upload } from "antd";
import { UploadOutlined, EnvironmentOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const { Option } = Select;

const FormModal = ({
  isVisible,
  onClose,
  title = "Mapping"
}) => {
  const [formData, setFormData] = useState({
    customerName: "",
    placeOfOwner: "",
    phoneNumber: "",
    address: "",
    perception: "",
    remark: "",
    date: null,
    photo: []
  });

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = ({ fileList }) => {
    setFormData(prev => ({ ...prev, photo: fileList }));
  };

  const submitForm = () => {
    console.log("Form Data:", formData);
    onClose();
  };

  const handleLocation = () => {
    console.log('Location action triggered');
    // Implement location reloading or setting logic here
  };

  return (
    <Modal
      title={title}
      visible={isVisible}
      onCancel={onClose}
      onOk={submitForm}
      width="1200px"
      className="ant-modal"
      okText="Complete"
      cancelText="Close"
      okButtonProps={{ style: { backgroundColor: '#00783F', borderColor: '#00783F', color: '#ffffff' } }}
    >
      <div className="grid grid-cols-4 gap-4 py-4">
        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">Support Customer Name</label>
          <Select
            className="w-full"
            value={formData.customerName}
            onChange={value => handleInputChange('customerName', value)}
            placeholder="Select a customer"
            disabled
          >
            <Option value="customer1">Customer 1</Option>
            <Option value="customer2">Customer 2</Option>
          </Select>
        </div>
        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">Place of Owner</label>
          <Input disabled value={formData.placeOfOwner} onChange={e => handleInputChange('placeOfOwner', e.target.value)} />
        </div>
        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">Phone Number</label>
          <Input disabled value={formData.phoneNumber} onChange={e => handleInputChange('phoneNumber', e.target.value)} />
        </div>
        <div className="col-span-4 md:col-span-1">
          <label className="block mb-2 font-medium text-gray-700">Perception</label>
          <Select
            className="w-full"
            value={formData.perception}
            onChange={value => handleInputChange('perception', value)}
            placeholder="Select"
          >
            <Option value="positive">Positive</Option>
            <Option value="negative">Negative</Option>
          </Select>
        </div>
        <div className="col-span-4">
          <label className="block mb-2 font-medium text-gray-700">Address</label>
          <Input disabled value={formData.address} onChange={e => handleInputChange('address', e.target.value)} />
        </div>
        <div className="col-span-4 md:col-span-4">
          <label className="block mb-2 font-medium text-gray-700">Place of GPS</label>
          <Input
            className="w-full"
            value={formData.gps}
            onChange={(e) => setFormData({ ...formData, gps: e.target.value })}
            placeholder="GPS Location"
            prefix={<EnvironmentOutlined />}
            suffix={
              <Button
                icon={<img src="/img/icons/reload.png" alt="Reload" style={{ width: 20, height: 20 }} />}
                onClick={handleLocation}
                style={{ border: 'none', background: 'transparent' }}
              />
            }
          />
        </div>
        <div className="col-span-4 md:col-span-4">
          <label className="block mb-2 font-medium text-gray-700">Photo</label>
          <Upload
            onChange={handleFileChange}
            listType="picture"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />} className="w-full">Upload (Max: 1)</Button>
          </Upload>
        </div>
        {/* <div className="col-span-4 md:col-span-2">
          <label className="block mb-2 font-medium text-gray-700">Date</label>
          <DatePicker className="w-full" onChange={date => handleInputChange('date', date ? date.format('YYYY-MM-DD') : null)} />
        </div> */}
        <div className="col-span-4 md:col-span-4">
          <label className="block mb-2 font-medium text-gray-700">Remark</label>
          <Input.TextArea className="w-full" rows={4} onChange={e => handleInputChange('remark', e.target.value)} />
        </div>


      </div>
    </Modal>
  );
};

export default FormModal;
