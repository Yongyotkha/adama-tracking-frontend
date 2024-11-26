import { useEffect, useState, useRef } from "react";
import { DatePicker, Form, Input, Select, Col, Row, TimePicker } from "antd";
import BoxPrimary from "../box_primary/BoxPrimary";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

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

export default function FormCustom({ fields, form, title, onChange = {} }) {
  const [formValues, setFormValues] = useState({});
  const [location, setLocation] = useState({ lat: null, long: null, address: "" });
  const isInitialSet = useRef(false);

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
    fields.forEach((field) => {
      if (field.type === "location") {
        getLocation();
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
          console.error(err.message);
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
      console.error(err.message);
    }
  };

  const handleChange = (attribute, value) => {
    setFormValues((prev) => ({
      ...prev,
      [attribute]: value,
    }));
    form.setFieldsValue({ [attribute]: value });
    onChange(attribute, value);
  };

  return (
    <BoxPrimary>
      {title && <div className="text-[#00783F] text-lg font-semibold mb-3">{title}</div>}
      <Form layout="vertical" form={form}>
        <Row gutter={16} align="middle">
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
                field.type === "hidden" ||
                field.type === "number" ? (
                  <Input
                    type={field.type}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    value={formValues[field.name] || ""}
                    disabled={field.disabled}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                ) : field.type === "date" ? (
                  <DatePicker
                    style={{ width: "100%" }}
                    disabled={field.disabled}
                    value={formValues[field.name] || null}
                    onChange={(date) => handleChange(field.name, date)}
                    format="YYYY-MM-DD"
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
                    mode={field.mode === 'multiple' ? 'multiple' : undefined}
                    value={formValues[field.name] || []}
                    onChange={(value) => handleChange(field.name, value)}
                    placeholder={`Select ${field.label.toLowerCase()}`}
                    disabled={field.disabled}
                  >
                    {field.mode !== 'multiple' ? 
                    (
                      <Option key="" value="" disabled>
                        Please Select
                      </Option>
                    )
                    : undefined}
                    
                    {field.options.map((option) => (
                      <Option key={option.id} value={option.id}>
                        {option.name}
                      </Option>
                    ))}
                  </Select>
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
                    <Form.Item
                      label="Address"
                      name="location_address"
                      rules={[
                        {
                          required: false,
                          message: "Please enter the address",
                        },
                      ]}
                    >
                      <Input
                        type="text"
                        placeholder="Address"
                        value={formValues["location_address"] || ""}
                        onChange={(e) => handleChange("location_address", e.target.value)}
                      />
                    </Form.Item>
                
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
                    </Form.Item>
                  </div>
                ) : null}
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </BoxPrimary>
  );
}
