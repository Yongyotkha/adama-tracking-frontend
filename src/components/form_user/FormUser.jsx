import React, { useState } from "react";
import { Form, Input, DatePicker, Select, Col, Row, Button } from "antd";
import BoxPrimary from "../box_primary/BoxPrimary";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

export default function FormUser({ fields }) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("/img/Image-not-found.png"); // Default image when no image is selected

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Update preview with selected image
    }
  };

  return (
    <BoxPrimary>
      <Form layout="vertical">
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
            icon={image ? <EditOutlined /> : <PlusOutlined />}
            onClick={() => document.getElementById("imageUpload").click()}
            className="text-[#00783F] border-[#00783F]"
          >
            {image ? "Edit Photo" : "Add Photo"}
          </Button>
        </div>

        <Row gutter={16} align="middle">
          {/* Render other fields dynamically */}
          {fields.map((field, index) => (
            <Col
              xs={24}
              sm={field.col || 12}
              md={field.col || 8}
              lg={field.col || 6}
              key={index}
            >
              <Form.Item
                label={field.label}
                name={field.name}
                rules={[
                  {
                    required: field.required,
                    message: `Please enter ${field.label.toLowerCase()}`,
                  },
                ]}
                initialValue={field.value}
                className="mb-3"
              >
                {field.type === "text" ||
                field.type === "email" ||
                field.type === "tel" ||
                field.type === "number" ? (
                  <Input
                    type={field.type}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    disabled={field.disabled}
                    value={field.value}
                  />
                ) : field.type === "date" ? (
                  <DatePicker
                    style={{ width: "100%" }}
                    disabled={field.disabled}
                  />
                ) : field.type === "select" ? (
                  <Select
                    placeholder={`Select ${field.label.toLowerCase()}`}
                    disabled={field.disabled}
                    value={field.value}
                  >
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
