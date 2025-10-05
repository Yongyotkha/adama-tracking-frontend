// src\components\form_custom\FormCustom.jsx
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
  Switch,
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

dayjs.extend(customParseFormat);

const { MonthPicker } = DatePicker;
const { Option } = Select;
const { RangePicker } = DatePicker; // 🔹 เพิ่ม RangePicker

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

export default function FormCustom({ fields, form, title, onChange, mode }) {
  const [formValues, setFormValues] = useState({});
  const [location, setLocation] = useState({
    lat: null,
    long: null,
    address: "",
  });
  const isInitialSet = useRef(false);
  const [loading, setLoading] = useState(false);
  const dateFormat = "YYYY-MM-DD";
  const [selecteValue, setSelectedValue] = useState(false);

  useEffect(() => {
    const initialValues = fields.reduce((values, field) => {
      if (field.value !== undefined) {
        if (field.type === "date") {
          values[field.name] = field.value ? dayjs(field.value, "YYYY-MM-DD") : null;
        } else if (field.type === "date_range") { // 🔹 รองรับค่าเริ่มต้น date_range
          // รับได้ทั้ง ["2025-01-01","2025-01-31"] หรือ [dayjs(), dayjs()]
          const v = field.value;
          if (Array.isArray(v) && v.length === 2) {
            const [s, e] = v;
            values[field.name] = [
              dayjs.isDayjs(s) ? s : (s ? dayjs(s, "YYYY-MM-DD") : null),
              dayjs.isDayjs(e) ? e : (e ? dayjs(e, "YYYY-MM-DD") : null),
            ];
          } else {
            values[field.name] = null;
          }
        } else if (field.type === "month") {
          values[field.name] = field.value ? dayjs(field.value, "YYYY-MM") : null;
        } else if (field.type === "time") {
          values[field.name] = field.value ? dayjs(field.value, "HH:mm") : null;
        } else if (field.type === "location") {
          values["location_address"] = location.address;
          values["location_latitude"] = location.lat;
          values["location_longitude"] = location.long;
        } else {
          values[field.name] = field.value;
        }
      }
      return values;
    }, {});

    setFormValues(initialValues);

    if (!isInitialSet.current && form) {
      form.setFieldsValue(initialValues);
      isInitialSet.current = true;
    }
  }, [fields, form, location]);

  useEffect(() => {
    if (mode == "edit") {
      const initialValues = fields.reduce((acc, field) => {
        if (field.type === "date") {
          acc[field.name] = field.value ? dayjs(field.value, dateFormat) : null;
        } else if (field.type === "date_range") { // 🔹 รองรับโหมดแก้ไข date_range
          const v = field.value;
          if (Array.isArray(v) && v.length === 2) {
            const [s, e] = v;
            acc[field.name] = [
              dayjs.isDayjs(s) ? s : (s ? dayjs(s, dateFormat) : null),
              dayjs.isDayjs(e) ? e : (e ? dayjs(e, dateFormat) : null),
            ];
          } else {
            acc[field.name] = null;
          }
        } else {
          acc[field.name] = field.value || null;
        }
        return acc;
      }, {});

      form?.setFieldsValue(initialValues);
    }
  }, [fields, form]);

  useEffect(() => {
    fields.forEach((field) => {
      if (field.type === "location") {
        getLocation();
      } else if (field.type === "select") {
        if (formValues[field.name] != undefined && formValues[field.name].length > 0) {
          if (!selecteValue) {
            handleChange(field.name, formValues[field.name]);
            setSelectedValue(true);
          }
        }
      }
    });
  }, [fields]);

  useEffect(() => {
    if (location.lat !== null && location.long !== null) {
      form.setFieldsValue({
        location_address: location.address,
        location_latitude: location.lat,
        location_longitude: location.long,
      });
    }
  }, [location, form]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;
          getAddress(lat, long);
          setLocation((prev) => ({ ...prev, lat, long }));
        },
        () => { }
      );
    } else {
      console.error("Geolocation is not supported by your browser.");
    }
  };

  const getAddress = async (lat, long) => {
    const apiKey = "AIzaSyAF-YpYX1gu-kPeKxVdCTh9f_9nXXlZaPc";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK") {
        const fetchedAddress = data.results[0]?.formatted_address || "Address not found";
        setLocation((prev) => ({ ...prev, address: fetchedAddress }));
        setFormValues((prev) => ({
          ...prev,
          location_address: fetchedAddress,
          location_latitude: lat,
          location_longitude: long,
        }));
      }
    } catch { }
  };

  const handleChange = (attribute, value) => {
    setFormValues((prev) => ({
      ...prev,
      [attribute]: value,
    }));
    form?.setFieldsValue({ [attribute]: value });

    if (onChange) onChange(attribute, value);
  };

  const handlePhotoUpload = (info, name) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} uploaded successfully.`);
      const fileUrl = info.file.response?.url || URL.createObjectURL(info.file.originFileObj);
      handleChange(name, fileUrl);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} upload failed.`);
    }
  };

  const handleReload = () => {
    setLoading(true);
    setTimeout(() => {
      getLocation();
      setLoading(false);
    }, 2000);
  };

  // helper: decide id type by field.typeMode or options' first id
  const idIsNumber = (field) => {
    if (field.typeMode === "number") return true;
    if (field.typeMode === "string") return false;
    const first = field.options?.[0]?.id;
    return typeof first === "number";
  };


  // normalize the value that goes into antd <Select value>
  const normalizeSelectValue = (field, raw) => {
    const isMulti = field.mode === "multiple";
    const wantNumber = idIsNumber(field);
    const cast = (v) =>
      v === undefined || v === null || v === ""
        ? undefined
        : wantNumber
          ? Number(v)
          : String(v);


    if (isMulti) {
      const arr = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
      return arr.map(cast).filter((v) => v !== undefined);
    }
    return cast(raw);
  };

  return (
    <BoxPrimary>
      {title && (
        <div className="text-[#00783F] text-lg font-semibold mb-3">{title}</div>
      )}
      <Form layout="vertical" form={form} initialValues={{ formValues }}>
        <Row gutter={16} align="middle">
          {fields.map((field, index) =>
            field.type !== "hidden" ? (
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
                          form?.setFieldsValue({ [field.name]: response.data.file_url });
                          message.success(`${file.name} uploaded successfully.`);
                        } catch (error) {
                          console.error("Error uploading form data:", error);
                          message.error("เกิดข้อผิดพลาดในการอัปโหลด");
                        } finally {
                          setLoading(false);
                        }
                        return false;
                      }}
                      className="w-full"
                      listType="picture"
                      maxCount={1}
                      accept="image/jpeg,image/png"
                    >
                      <p className="text-[#978B87]">Choose a file or drag & drop it here</p>
                      <p className="text-[#978B87]">JPEG, PNG</p>
                      <DynamicButton
                        className="text-white mt-2 px-4 py-1 rounded-[4px] bg-[#009845]"
                        text={"Browse File"}
                        type={"button"}
                      />
                    </Upload.Dragger>
                  ) : field.type === "text" ||
                    field.type === "email" ||
                    field.type === "tel" ||
                    field.type === "number" ? (
                    <Input
                      type={field.type}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      value={formValues[field.name] || ""}
                      disabled={field.disabled}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                  ) : field.type === "search" ? (
                    <Search
                      placeholder="Search"
                      onSearch={(value) => handleChange(field.name, value)}
                    />
                  ) : field.type === "date" ? (
                    <DatePicker
                      style={{ width: "100%" }}
                      value={formValues[field.name] || null}
                      onChange={(date) => handleChange(field.name, date)}
                      format="YYYY-MM-DD"
                      disabled={field.disabled}
                    />
                  ) : field.type === "date_range" ? ( // 🔹 เรนเดอร์ RangePicker
                    <RangePicker
                      style={{ width: "100%" }}
                      value={formValues[field.name] || null}
                      onChange={(dates) => handleChange(field.name, dates)}
                      format="YYYY-MM-DD"
                      disabled={field.disabled}
                      allowEmpty={[false, false]}
                    />
                  ) : field.type === "month" ? (
                    <MonthPicker
                      style={{ width: "100%" }}
                      disabled={field.disabled}
                      value={formValues[field.name] || null}
                      onChange={(date) => handleChange(field.name, date)}
                      format="YYYY-MM"
                    />
                  ) : field.type === "time" ? (
                    <TimePicker
                      style={{ width: "100%" }}
                      disabled={field.disabled}
                      value={formValues[field.name] || null}
                      onChange={(time) => handleChange(field.name, time)}
                      format="HH:mm"
                    />
                  ) : field.type === "select" ? (
                    <Select
                      mode={field.mode === "multiple" ? "multiple" : undefined}
                      value={normalizeSelectValue(field, formValues[field.name])}
                      onChange={(value) => handleChange(field.name, value)}
                      placeholder={`Select ${field.label.toLowerCase()}`}
                      disabled={field.disabled}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={(field.options || []).map((option, idx) => ({
                        key: idx,
                        label: option.name,
                        value: idIsNumber(field) ? Number(option.id) : String(option.id),
                      }))}
                    />
                  ) : field.type === "textarea" ? (
                    <Input.TextArea
                      rows={4}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      value={formValues[field.name] || ""}
                      disabled={field.disabled}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                  ) : field.type === "switch" ? (
                    <Switch
                      checked={formValues[field.name]}
                      onChange={(checked) => handleChange(field.name, checked)}
                      className="custom-switch"
                    />
                  ) : field.type === "text-editor" ? (
                    <ReactQuill
                      theme="snow"
                      value={formValues[field.name] || ""}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      readOnly={field.disabled}
                      modules={{ toolbar: toolbarOptions }}
                      onChange={(value) => handleChange(field.name, value)}
                    />
                  ) : field.type === "location" ? (
                    <div>
                      <div style={{ position: "relative" }}>
                        <Form.Item
                          name="location_address"
                          rules={[{ required: false, message: "Please enter the address" }]}
                        >
                          <input
                            type="text"
                            placeholder="Address"
                            value={formValues["location_address"] || ""}
                            onChange={(e) => handleChange("location_address", e.target.value)}
                            disabled={field.disabled}
                            style={{
                              width: "100%",
                              paddingRight: "50px",
                              paddingLeft: "12px",
                              border: "1px solid #d9d9d9",
                              borderRadius: "4px",
                              padding: "8px 12px",
                              boxSizing: "border-box",
                            }}
                          />
                        </Form.Item>
                        <div
                          onClick={handleReload}
                          style={{
                            position: "absolute",
                            top: "57%",
                            right: "10px",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            fontSize: "16px",
                            color: "#d9d9d9",
                          }}
                        >
                          <ReloadOutlined
                            style={{
                              fontSize: "18px",
                              animation: loading ? "spin 1s linear infinite" : "none",
                            }}
                          />
                        </div>
                        <style>{`
                          @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                          }
                        `}</style>
                      </div>

                      <Form.Item name="location_latitude" hidden>
                        <Input type="hidden" placeholder="Latitude" value={formValues["location_latitude"] || ""} disabled />
                      </Form.Item>

                      <Form.Item name="location_longitude" hidden>
                        <Input type="hidden" placeholder="Longitude" value={formValues["location_longitude"] || ""} disabled />
                      </Form.Item>
                    </div>
                  ) : null}
                </Form.Item>
              </Col>
            ) : null
          )}
        </Row>
      </Form>
    </BoxPrimary>
  );
}
