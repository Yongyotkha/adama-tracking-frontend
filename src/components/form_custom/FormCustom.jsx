import React from "react";
import { Form, Input, DatePicker, Select, Col, Row } from "antd";
import BoxPrimary from "../box_primary/BoxPrimary";
import moment from "moment";

const { Option } = Select;

export default function FormCustom({ fields }) {
  return (
    <BoxPrimary>
      <Form layout="vertical">
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
                initialValue={
                  field.type === "date" && field.value
                    ? moment(field.value, "YYYY-MM-DD") // Format date correctly for DatePicker
                    : field.value
                }
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
                    defaultValue={
                      field.value ? moment(field.value, "YYYY-MM-DD") : null
                    }
                  />
                ) : field.type === "select" ? (
                  <Select
                    placeholder={`Select ${field.label.toLowerCase()}`}
                    disabled={field.disabled}
                    defaultValue={field.value}
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
