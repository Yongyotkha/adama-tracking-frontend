import { useEffect, useState, useRef } from "react";
import { ReloadOutlined } from "@ant-design/icons";
import {
  DatePicker,
  Form,
  Input,
  Select,
  Col,
  Row,
  TimePicker,
  Upload,
  message,
} from "antd";
import BoxPrimary from "../box_primary/BoxPrimary";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import DynamicButton from "../button/DynamicButton";
const { Search } = Input;
const { MonthPicker } = DatePicker;

dayjs.extend(customParseFormat);

const toolbarOptions = [
  [{ font: [] }, { size: [] }],
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike", { color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["link", "image"],
  ["clean"],
];

export default function FormCustom({ fields, form, title, onChange, mode, onUploadFinish }) {
  const [location, setLocation] = useState({
    lat: null,
    long: null,
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const isInitialSet = useRef(false);

  useEffect(() => {
    const initialValues = {};
    fields.forEach(field => {
      if (field.value !== undefined) {
        if (field.type === "date") {
          initialValues[field.name] = field.value ? dayjs(field.value, "YYYY-MM-DD") : null;
        } else if (field.type === "month") {
          initialValues[field.name] = field.value ? dayjs(field.value, "YYYY-MM") : null;
        } else if (field.type === "time") {
          initialValues[field.name] = field.value ? dayjs(field.value, "HH:mm") : null;
        } else {
          initialValues[field.name] = field.value;
        }
      }
    });

    if (!isInitialSet.current && form) {
      form.setFieldsValue(initialValues);
      isInitialSet.current = true;
    }
  }, [fields, form]);

  const handleChange = (fieldName, value) => {
    form?.setFieldsValue({ [fieldName]: value });
    if (onChange) onChange(fieldName, value);
  };

  return (
    <BoxPrimary>
      {title && (
        <div className="text-[#00783F] text-lg font-semibold mb-3">{title}</div>
      )}
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
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
              >
                {field.type === "photo" ? (
                  <Upload.Dragger
                    name="file"
                    multiple={false}
                    beforeUpload={async (file) => {
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("mode", "news");
                      try {
                        setLoading(true);
                        const response = await useServiceAPI.post(paths.pathUpload, formData);
                        if (onUploadFinish) onUploadFinish(response);
                        form.setFieldsValue({ [field.name]: response.data.file_url });
                        message.success(`${file.name} uploaded successfully.`);
                      } catch (err) {
                        message.error("อัปโหลดไฟล์ล้มเหลว");
                      } finally {
                        setLoading(false);
                      }
                      return false;
                    }}
                    listType="picture"
                    maxCount={1}
                  >
                    <p className="text-[#978B87]">Choose a file or drag & drop</p>
                    <DynamicButton
                      className="text-white mt-2 px-4 py-1 rounded-[4px] bg-[#009845]"
                      text={"Browse File"}
                      type={"button"}
                    />
                  </Upload.Dragger>
                ) : field.type === "text-editor" ? (
                  <ReactQuill
                    theme="snow"
                    modules={{ toolbar: toolbarOptions }}
                    readOnly={field.disabled}
                    onChange={(value) => handleChange(field.name, value)}
                  />
                ) : field.type === "textarea" ? (
                  <Input.TextArea
                    rows={4}
                    disabled={field.disabled}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                ) : field.type === "select" ? (
                  <Select
                    mode={field.mode === "multiple" ? "multiple" : undefined}
                    disabled={field.disabled}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    onChange={(value) => handleChange(field.name, value)}
                    options={field.options.map(opt => ({
                      value: opt.id,
                      label: opt.name
                    }))}
                  />
                ) : field.type === "date" ? (
                  <DatePicker
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    disabled={field.disabled}
                    onChange={(date) => handleChange(field.name, date)}
                  />
                ) : field.type === "month" ? (
                  <MonthPicker
                    style={{ width: "100%" }}
                    format="YYYY-MM"
                    disabled={field.disabled}
                    onChange={(date) => handleChange(field.name, date)}
                  />
                ) : field.type === "time" ? (
                  <TimePicker
                    style={{ width: "100%" }}
                    format="HH:mm"
                    disabled={field.disabled}
                    onChange={(time) => handleChange(field.name, time)}
                  />
                ) : (
                  <Input
                    type={field.type}
                    placeholder={field.placeholder || `Enter ${field.label}`}
                    disabled={field.disabled}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </BoxPrimary>
  );
}
