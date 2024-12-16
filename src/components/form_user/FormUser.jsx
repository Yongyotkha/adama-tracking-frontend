import React, { useContext, useEffect, useState } from "react";
import { Form, Input, DatePicker, TimePicker, Select, Col, Row } from "antd";
import BoxPrimary from "../box_primary/BoxPrimary";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { AuthContext } from "../../contexts/AuthContext";
import { paths } from "../../services/CorsPath";
import useServiceAPI from "../../services/CorsService";
dayjs.extend(customParseFormat);

const { Option } = Select;

export default function FormUser({ fields, title, profile, form, onChange }) {
  const { showMsg } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({});
  const dateFormat = "YYYY-MM-DD";

  const [imagePreview, setImagePreview] = useState(
    profile || "/img/Image-not-found.png"

  );

  const handleFieldChange = (attribute, value) => {
    form.setFieldsValue({ [attribute]: value });
  };

  const [initialValues, setInitialValues] = useState(() =>
    fields.reduce(
      (values, field) => {
        if (field.type === "date") {
          values[field.name] = field.value
            ? dayjs(field.value, dateFormat)
            : null;
        } else if (field.type === "time" && field.value) {
          values[field.name] = dayjs(field.value, "HH:mm");
        } else {
          values[field.name] = field.value || null;
        }

        if (field.type === "select") {
          values[field.name] =
            field.options?.find((opt) => opt.selected)?.id || null;
        }
        return values;
      },
      { profile: profile || null }
    )
  );

  useEffect(() => {
    const initialValues = fields.reduce((acc, field) => {
      acc[field.name] =
        field.type === "date"
          ? field.value
            ? dayjs(field.value, dateFormat)
            : null
          : field.value || null;
      return acc;
    }, {});
    // console.log(initialValues);

    form?.setFieldsValue(initialValues);
  }, [fields]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImagePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "profile");

    try {
      const response = await useServiceAPI.post(
        paths.pathUpload,
        formData,
        setLoading
      );
      form?.setFieldsValue({
        profile: response.data.file_url,
      });
    } catch (error) {
      console.error("Error uploading form data:", error);
      showMsg("error", "เกิดข้อผิดพลาด");
    }
  };

  const handleChange = (attribute, value) => {
    form.setFieldsValue({ [attribute]: value });
    setFormValues((prev) => ({
      ...prev,
      [attribute]: value,
    }));
    if (onChange) {
      onChange(attribute, value);
    }
  };

  return (
    <BoxPrimary>
      {title && (
        <div className="text-[#00783F] text-lg font-semibold mb-3">{title}</div>
      )}
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Row gutter={[16, 16]} align="middle">
          {fields.map((field, index) => (
            <Col xs={24} sm={12} md={8} lg={field.col || 6} key={index}>
              <Form.Item
                // label={field.label}
                label={
                  <span style={{ color: field.labelColor || "inherit", fontWeight: "bold" }}>
                    {field.label}
                  </span>
                }
                name={field.name}
                rules={[
                  {
                    required: field.required,
                    message: `Please input ${field.label.toLowerCase()}`,
                  },
                ]}
                className="mb-3"
              >
                {field.type === "text" ||
                field.type === "email" ||
                field.type === "tel" ? (
                  <Input
                    type={field.type}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    disabled={field.disabled}
                  />
                ) : field.type === "date" ? (
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Select Date"
                    format={dateFormat}
                    disabled={field.disabled}
                  />
                ) : field.type === "time" ? (
                  <TimePicker
                    className="w-full"
                    format="HH:mm"
                    placeholder={`Select ${field.label}`}
                    onChange={(value) => handleFieldChange(field.name, value)}
                  />
                ) : field.type === "select" ? (
                  <Select
                    placeholder={`Select ${field.label.toLowerCase()}`}
                    allowClear
                    options={field.options.map((option) => ({
                      label: option.name,
                      value: option.id,
                    }))}
                    disabled={field.disabled}
                    onChange={(value) => handleChange(field.name, value)}
                  />
                ) : field.type === "picture" || field.type === "image" ? (
                  <div className="image-upload-container flex items-center gap-3">
                    <img
                      src={imagePreview}
                      // src={field.value || imagePreview}
                      alt="Profile"
                      onClick={() =>
                        document.getElementById(`imageUpload-${index}`).click()
                      }
                      className="w-24 h-24 rounded-full object-cover cursor-pointer shadow-lg"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                      id={`imageUpload-${index}`}
                      name={field.name}
                    />
                  </div>
                ) : field.type === "multiple" ? (
                  <Select
                    mode="multiple"
                    placeholder={`Select ${field.label}`}
                    allowClear
                    options={field.options.map((option) => ({
                      label: option.name,
                      value: option.id,
                    }))}
                    onChange={(value) => handleFieldChange(field.name, value)}
                  />
                ) : null}
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </BoxPrimary>
  );
}
