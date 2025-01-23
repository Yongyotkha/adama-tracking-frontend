import { useEffect, useState, useRef } from "react";
import { ReloadOutlined } from "@ant-design/icons";
import { DatePicker, Form, Input, Select, Col, Row, TimePicker, Upload, message } from "antd";
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
  const [location, setLocation] = useState({ lat: null, long: null, address: "" });
  const isInitialSet = useRef(false);
  const [loading, setLoading] = useState(false); // เพิ่ม state สำหรับควบคุมการหมุน
  const dateFormat = "YYYY-MM-DD";
  const [selecteValue, setSelectedValue] = useState(false);

  useEffect(() => {
    const initialValues = fields.reduce((values, field) => {
      if (field.value !== undefined) {
        if (field.type === "date") {
          values[field.name] = field.value ? dayjs(field.value, "YYYY-MM-DD") : null;
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
    if (mode == 'edit') {
      const initialValues = fields.reduce((acc, field) => {
        acc[field.name] = field.type === "date"
          ? field.value ? dayjs(field.value, dateFormat) : null
          : field.value || null;
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
        (err) => {
          // console.error(err.message);
        }
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
      } else {
        console.error("Failed to fetch address");
      }
    } catch (err) {
      // console.error(err.message);
    }
  };

  const handleChange = (attribute, value) => {
    // อัปเดตค่าที่เลือกใหม่
    setFormValues((prev) => ({
      ...prev,
      [attribute]: value,
    }));

    form?.setFieldsValue({ [attribute]: value }); // อัปเดตค่าลงในฟอร์ม
    // console.log(onChange);

    if (onChange) {
      onChange(attribute, value); // เรียก callback ถ้ามี
    }
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
    }, 2000); // ตั้งค่าความล่าช้าตามที่ต้องการ

  };

  return (
    <BoxPrimary>
      {title && <div className="text-[#00783F] text-lg font-semibold mb-3">{title}</div>}
      <Form layout="vertical" form={form} initialValues={{ formValues }}>
        <Row gutter={16} align="middle">
          {fields.map((field, index) => (
            field.type !== "hidden" ?
              (<Col
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
                      name={field.name}
                      multiple={false}
                      action="/upload" // Replace with your upload endpoint
                      onChange={(info) => handlePhotoUpload(info, field.name)}
                      className="w-full"
                      listType="picture"
                      maxCount={1}
                      accept="image/jpeg,image/png"
                    >
                      <p className="text-[#978B87]">Choose a file or drag & drop it here</p>
                      <p className="text-[#978B87]">JPEG, PNG</p>
                      <DynamicButton
                        className="text-white mt-2 px-4 py-1 rounded-[4px] bg-[#009845]"
                        text={'Browse File'}
                        type={'button'}
                      />
                    </Upload.Dragger>
                  ) : field.type === "text" ||
                    field.type === "email" ||
                    field.type === "tel" ||
                    field.type === "number" ? (
                    <>
                      <Input
                        type={field.type}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        value={formValues[field.name] || ""}
                        disabled={field.disabled}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                      />
                      {" "}
                    </>
                  ) : field.type === "search" ? (
                    <>
                      <Search
                        placeholder="Search"
                        onSearch={(value) => handleChange(field.name, value)}
                      />
                      {" "}
                    </>
                  ) : field.type === "date" ? (
                    <>
                      <DatePicker
                        style={{ width: "100%" }}
                        value={formValues[field.name] || null}
                        onChange={(date) => handleChange(field.name, date)}
                        format="YYYY-MM-DD"
                        disabled={field.disabled}
                      />
                      {" "}
                    </>
                  ) : field.type === "month" ? (
                    <>
                      <MonthPicker
                        style={{ width: "100%" }}
                        disabled={field.disabled}
                        value={formValues[field.name] || null}
                        onChange={(date) => handleChange(field.name, date)}
                        format="YYYY-MM"
                      />
                      {" "}
                    </>
                  ) : field.type === "time" ? (
                    <>
                      <TimePicker
                        style={{ width: "100%" }}
                        disabled={field.disabled}
                        value={formValues[field.name] || null}
                        onChange={(time) => handleChange(field.name, time)}
                        format="HH:mm"
                      />
                      {" "}
                    </>
                  ) : field.type === "select" ? (
                    <>
                      <Select
                        mode={field.mode === "multiple" ? "multiple" : undefined}
                        value={formValues[field.name] || []} // ใช้ค่าจาก state
                        onChange={(value) => handleChange(field.name, value)} // เรียก handleChange
                        placeholder={`Select ${field.label.toLowerCase()}`}
                        disabled={field.disabled}
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        options={field.options.map((option, index) => ({
                          key: index,
                          label: option.name,
                          value: field.typeMode == 'string' ? option?.id?.toString() : parseInt(option.id, 10),
                        }))}
                      />
                      {" "}
                    </>
                  ) : field.type === "text-editor" ? (
                    <>
                      <ReactQuill
                        theme="snow"
                        value={formValues[field.name] || ""}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        readOnly={field.disabled}
                        modules={{ toolbar: toolbarOptions }}
                        onChange={(value) => handleChange(field.name, value)}
                      />
                      {" "}
                    </>
                  ) : field.type === "location" ? (
                    <div>
                      <div style={{ position: "relative" }}>
                        <Form.Item
                          name="location_address"
                          rules={[
                            {
                              required: false,
                              message: "Please enter the address",
                            },
                          ]}
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
                              boxSizing: "border-box"
                            }}
                          />
                          {" "}
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
                              animation: loading ? "spin 1s linear infinite" : "none", // เปิด/ปิดการหมุน
                            }}
                          />
                        </div>
                        {/* CSS Keyframes */}
                        <style>{`
                              @keyframes spin {
                                0% {
                                  transform: rotate(0deg);
                                }
                                100% {
                                  transform: rotate(360deg);
                                }
                              }
                            `}</style>
                      </div>

                      <Form.Item
                        name="location_latitude"
                        hidden
                      >
                        <Input
                          type="hidden"
                          placeholder="Latitude"
                          value={formValues["location_latitude"] || ""}
                          disabled
                        />
                        {" "}
                      </Form.Item>

                      <Form.Item
                        name="location_longitude"
                        hidden
                      >
                        <Input
                          type="hidden"
                          placeholder="Longitude"
                          value={formValues["location_longitude"] || ""}
                          disabled
                        />
                        {" "}
                      </Form.Item>
                    </div>
                  ) : null}
                </Form.Item>
              </Col>) : null
          ))}
        </Row>
      </Form>
    </BoxPrimary>
  );
}
