import React from "react";
import { DatePicker, Form, Input, Select, Col, Row, TimePicker } from "antd";
const { MonthPicker } = DatePicker;
import BoxPrimary from "../box_primary/BoxPrimary";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

dayjs.extend(customParseFormat);

const { Option } = Select;

const toolbarOptions = [
  [{ 'font': [] }, { 'size': [] }],
  [{ 'header': [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike', { 'color': [] }, { 'background': [] }],
  [{ 'script': 'sub' }, { 'script': 'super' }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'indent': '-1' }, { 'indent': '+1' }],
  [{ 'align': [] }],
  ['link', 'image'],
  ['clean']
];

export default function FormCustom({ fields, form, title }) {
  const initialValues = fields.reduce((values, field) => {
    if (field.value !== undefined) {
      if (field.type === "date") {
        values[field.name] = field.value ? dayjs(field.value, "YYYY-MM-DD") : null;
      } else if (field.type === "month") {
        values[field.name] = field.value ? dayjs(field.value, "YYYY-MM") : null;
      } else if (field.type === "time") {
        values[field.name] = field.value ? dayjs(field.value, "HH:mm") : null;
      } else {
        values[field.name] = field.value;
      }
    }
    return values;
  }, {});

  return (
    <BoxPrimary>
      {title && <div className="text-[#00783F] text-lg font-semibold mb-3">{title}</div>}
      <Form layout="vertical" form={form} initialValues={initialValues}>
        <Row gutter={16} align="middle">
          {fields
            .filter((field) => field.value !== undefined) // Only render fields with a defined value
            .map((field, index) => (
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
                      prefix={
                        field.iconPosition === "left" && field.iconSrc ? (
                          <img src={field.iconSrc} alt="icon" className="inline-block h-4" />
                        ) : null
                      }
                      suffix={
                        field.iconPosition === "right" && field.iconSrc ? (
                          <img src={field.iconSrc} alt="icon" className="inline-block h-4" />
                        ) : null
                      }
                    />
                  ) : field.type === "date" ? (
                    <DatePicker
                      style={{ width: "100%" }}
                      disabled={field.disabled}
                      format="YYYY-MM-DD"
                    />
                  ) : field.type === "month" ? (
                    <MonthPicker
                      style={{ width: "100%" }}
                      disabled={field.disabled}
                      format="YYYY-MM"
                    />
                  ) : field.type === "time" ? (
                    <TimePicker
                      format="HH:mm"
                      style={{ width: "100%" }}
                      disabled={field.disabled}
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
                  ) : field.type === "text-editor" ? (
                    <ReactQuill
                      theme="snow"
                      value={field.value}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      readOnly={field.disabled}
                      modules={{ toolbar: toolbarOptions }}
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
