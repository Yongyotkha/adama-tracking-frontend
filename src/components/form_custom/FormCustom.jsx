import React from "react";
import { Form, Input, DatePicker, Select, Col, Row } from "antd";
import BoxPrimary from "../box_primary/BoxPrimary";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const { Option } = Select;

export default function FormCustom({ fields, title }) {
  // Prepare initial values for the form fields
  const initialValues = fields.reduce((values, field) => {
    values[field.name] = field.type === "date"
      ? field.value
        ? dayjs(field.value, "YYYY-MM-DD")
        : dayjs() // Default to today's date if no date provided
      : field.value;
    return values;
  }, {});

  return (
    <BoxPrimary>
      {title && <div className="text-[#00783F] text-lg font-semibold mb-3">{title}</div>}
      <Form layout="vertical" initialValues={initialValues}>
        <Row gutter={16} align="middle">
          {/* Render fields dynamically */}
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
                  />
                ) : field.type === "date" ? (
                  <DatePicker
                    style={{ width: "100%" }}
                    disabled={field.disabled}
                    format="YYYY-MM-DD"
                    defaultValue={field.value ? dayjs(field.value, "YYYY-MM-DD") : dayjs()}
                  />
                ) : field.type === "select" ? (
                  <Select
                    placeholder={`Select ${field.label.toLowerCase()}`}
                    disabled={field.disabled}
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
