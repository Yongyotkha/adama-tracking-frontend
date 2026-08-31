import React, { useContext, useEffect, useState } from "react";
import { Form, Input, DatePicker, TimePicker, Select, Col, Row, Button, Radio } from "antd";
import BoxPrimary from "../box_primary/BoxPrimary";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { AuthContext } from "../../contexts/AuthContext";
import { paths } from "../../services/CorsPath";
import useServiceAPI from "../../services/CorsService";
import { EditOutlined, EnvironmentOutlined, MailOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
dayjs.extend(customParseFormat);

const { Option } = Select;

const sanitizeDecimalInput = (value) => {
  if (value === null || value === undefined) return "";

  let next = String(value).replace(/[^\d.]/g, "");
  const firstDot = next.indexOf(".");

  if (firstDot !== -1) {
    next = `${next.slice(0, firstDot + 1)}${next.slice(firstDot + 1).replace(/\./g, "")}`;
  }

  return next;
};

export default function FormUser({ fields, title, profile, form, onChange, disableImageUpload = false }) {
  const { showMsg } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({});
  const dateFormat = "YYYY-MM-DD";

  const [imagePreview, setImagePreview] = useState(
    profile || "/img/Image-not-found.png"

  );

  useEffect(() => {
    setImagePreview(profile || "/img/Image-not-found.png");
  }, [profile]);

  console.log('componance : ', imagePreview)

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
          values[field.name] = field.value ?? null;
        }

        if (field.type === "select") {
          values[field.name] =
            field.value !== undefined && field.value !== null
              ? field.value
              : field.options?.find((opt) => opt.selected)?.id ?? null;
        }
        return values;
      },
      { profile: profile || null }
    )
  );

  useEffect(() => {
    const initialValues = fields.reduce((acc, field) => {
      if (field.value === undefined) {
        return acc;
      }

      acc[field.name] =
        field.type === "date"
          ? field.value
            ? dayjs(field.value, dateFormat)
            : null
          : field.value ?? null;
      return acc;
    }, {});

    if (Object.keys(initialValues).length === 0) {
      return;
    }

    const currentValues = form?.getFieldsValue(true) || {};
    const patch = {};

    Object.entries(initialValues).forEach(([key, nextValue]) => {
      const currentValue = currentValues[key];
      const isCurrentEmpty =
        currentValue === undefined ||
        currentValue === null ||
        currentValue === "";
      const hasNextValue =
        nextValue !== undefined && nextValue !== null && nextValue !== "";

      if (hasNextValue && isCurrentEmpty) {
        patch[key] = nextValue;
      } else if (!hasNextValue && isCurrentEmpty) {
        patch[key] = nextValue;
      }
    });

    if (Object.keys(patch).length > 0) {
      form?.setFieldsValue(patch);
    }
  }, [fields, form]);

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

  const iconMap = {
    "/img/icons/location.png": <EnvironmentOutlined style={{ color: "rgba(0,0,0,.45)" }} />,
    "/img/icons/email.png": <MailOutlined style={{ color: "rgba(0,0,0,.45)" }} />,
    "/img/icons/user.png": <UserOutlined style={{ color: "rgba(0,0,0,.45)" }} />,
    // เพิ่มไอคอนอื่นๆ ตามต้องการ
  };

  return (
    <BoxPrimary>
      {title && (
        <div className="text-[#00783F] text-lg font-semibold mb-3">{title}</div>
      )}
      <Form form={form} layout="vertical">
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
                  ...(field.rules || []),
                ]}
                className="mb-3"
              >
                {
                  field.type === "text" ||
                    field.type === "email" ||
                    field.type === "tel" ||
                    field.type === "number" ? (
                    <Input
                      type={field.type === "number" ? "text" : field.type}
                      inputMode={field.type === "number" ? "decimal" : undefined}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      disabled={field.disabled}
                      onChange={
                        field.type === "number"
                          ? (e) => {
                              const sanitized = sanitizeDecimalInput(e.target.value);
                              form?.setFieldsValue({ [field.name]: sanitized });
                              handleChange(field.name, sanitized);
                            }
                          : undefined
                      }
                      prefix={
                        field.iconPosition === "left" && field.iconSrc ? (
                          <img src={field.iconSrc} alt={`${field.label} Icon`} style={{ width: '20px', height: '20px' }} />
                        ) : null
                      }
                      suffix={
                        field.iconPosition === "right" && field.iconSrc ? (
                          <img src={field.iconSrc} alt={`${field.label} Icon`} style={{ width: '20px', height: '20px' }} />
                        ) : null
                      }
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
                      disabled={field.disabled}
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
                    // <div className="image-upload-container flex items-center gap-3">
                    //   <img
                    //     src={imagePreview}
                    //     // src={field.value || imagePreview}
                    //     alt="Profile"
                    //     onClick={() =>
                    //       document.getElementById(`imageUpload-${index}`).click()
                    //     }
                    //     className="w-24 h-24 rounded-full object-cover cursor-pointer shadow-lg"
                    //   />
                    //   <input
                    //     type="file"
                    //     accept="image/*"
                    //     onChange={handleImageChange}
                    //     style={{ display: "none" }}
                    //     id={`imageUpload-${index}`}
                    //     name={field.name}
                    //   />
                    // </div>

                    <div className="image-upload-container flex items-center gap-3 mb-4">
                      <img
                        src={imagePreview}
                        alt="Profile"
                        onClick={() => document.getElementById(`imageUpload-${index}`).click()}
                        className="w-24 h-24 rounded-full object-cover mb-2 cursor-pointer shadow-lg"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                        id={`imageUpload-${index}`}
                        name={field.name}
                        disabled={disableImageUpload} // ← ใช้ prop นี้
                      />
                      <Button
                        icon={imagePreview !== "/img/Image-not-found.png" ? <EditOutlined /> : <PlusOutlined />}
                        onClick={() => document.getElementById(`imageUpload-${index}`).click()}
                        className="text-[#00783F] border-[#00783F]"
                        disabled={disableImageUpload} // ← ใช้ prop นี้
                      >
                        {imagePreview !== "/img/Image-not-found.png" ? "Edit Photo" : "Add Photo"}
                      </Button>

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
                  ) : field.type === "radio" ? (
                    <Radio.Group
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      value={form.getFieldValue(field.name)}
                      disabled={field.disabled}
                    >
                      {field.options.map((option) => (
                        <Radio key={option.id} value={option.id}>
                          {option.name}
                        </Radio>
                      ))}
                    </Radio.Group>
                  ) : null}
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </BoxPrimary>
  );
}
