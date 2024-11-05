import React, { useState } from "react";
import { Form, Input, DatePicker, TimePicker, Select, Col, Row, Button } from "antd";
import BoxPrimary from "../box_primary/BoxPrimary";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';

export default function FormUser({ fields, title, profile }) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(profile || "/img/Image-not-found.png"); // Use profile image if provided

  const initialValues = fields.reduce((values, field) => {
    if (field.type === "date") {
      values[field.name] = field.value ? dayjs(field.value, dateFormat) : dayjs(); // Set today's date if no date provided
    } else if (field.type === "time" && field.value) {
      values[field.name] = dayjs(field.value, "HH:mm");
    } else {
      values[field.name] = field.value;
    }
    return values;
  }, {});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Update preview with selected image
    }
  };

  return (
    <BoxPrimary>
      {title && <div className="text-[#00783F] text-lg font-semibold mb-3">{title}</div>}
      <Form layout="vertical" initialValues={initialValues}>
        <div className="image-upload-container flex items-center gap-3 mb-4">
          <img
            src={imagePreview}
            alt="Profile"
            onClick={() => document.getElementById("imageUpload").click()}
            className="w-24 h-24 rounded-full object-cover mb-2 cursor-pointer shadow-lg"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="imageUpload"
          />
          <Button
            icon={imagePreview !== "/img/Image-not-found.png" ? <EditOutlined /> : <PlusOutlined />}
            onClick={() => document.getElementById("imageUpload").click()}
            className="text-[#00783F] border-[#00783F]"
          >
            {imagePreview !== "/img/Image-not-found.png" ? "Edit Photo" : "Add Photo"}
          </Button>
        </div>

        <Row gutter={[16, 16]} align="middle">
          {fields.map((field, index) => (
            <Col xs={24} sm={12} md={8} lg={field.col || 6} key={index}>
              <Form.Item
                label={field.label}
                name={field.name}
                rules={[{ required: field.required, message: `Please enter ${field.label.toLowerCase()}` }]}
                className="mb-3"
              >
                {field.type === "text" || field.type === "email" || field.type === "tel" || field.type === "number" ? (
                  <Input type={field.type} placeholder={`Enter ${field.label.toLowerCase()}`} disabled={field.disabled} />
                ) : field.type === "date" ? (
                  <DatePicker
                    style={{ width: "100%" }}
                    disabled={field.disabled}
                    placeholder="Select Date"
                    format={dateFormat}
                    defaultValue={dayjs(field.value, dateFormat)}
                  />
                ) : field.type === "time" ? (
                  <TimePicker format="HH:mm" style={{ width: "100%" }} disabled={field.disabled} />
                ) : field.type === "select" ? (
                  <Select placeholder={`Select ${field.label.toLowerCase()}`} disabled={field.disabled}>
                    {field.options.map((option, idx) => (
                      <Option key={idx} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                ) : null}
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </BoxPrimary>
  );
}
