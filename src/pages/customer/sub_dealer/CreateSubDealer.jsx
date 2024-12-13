import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import DynamicButton from "../../../components/button/DynamicButton";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
// import { Form } from "antd";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";
import { AuthContext } from "../../../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import {
  Input,
  DatePicker,
  Col,
  Row,
  Dropdown,
  Tabs,
  Form,
  Select,
  TimePicker,
} from "antd";
import { values } from "lodash";
import dayjs from "dayjs";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import TableComponent from "../../../components/table/TableComponent";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import DynamicModal from "../../../components/modal/DynamicModal"; // Adjust path if needed
import { GoogleMap, LoadScript, Marker} from "@react-google-maps/api";

const { Option } = Select;

export default function CreateSubDealer() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [cropOptions, setCropOptions] = useState([]);
  const [form] = Form.useForm();
  const [defaultSelectedCrops, setDefaultSelectedCrops] = useState([]); // กำหนด state สำหรับ defaultSelectedCrops
  const [personalInfoData, setPersonalInfoData] = useState({});
  // const [personalInfo, setPersonalInfo] = useState([]);
  const { showMsg, showNotification } = useContext(AuthContext);
  const [cropData, setCropData] = useState([]);
  const [contactsData, setContactsData] = useState([]);
  const [dataApiKey, setDataApiKay] = useState("AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik");
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [companyinfo, setcompanyinfo] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 13.9572612,
    lng: 100.6222401,
  });
  const [dataMapZoom, setDataMapZoom] = useState(15);
  const [contacts, setContacts] = useState([
    {
      name_en: "",
      name_th: "",
      nickname: "",
      date_of_birth: null,
      t_shirt_size: "",
      relationship: "",
      duty: "",
      tel1: "",
      tel2: "",
      contact_number: "",
      email: "",
      line_id: "",
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [crops] = await Promise.all([
          useServiceAPI.get(paths.pathMasterCrop, {}),
        ]);
        setCropOptions(crops.data);
      } catch (error) {
        console.log(error.message);
        showNotification("เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // const [formFields, setFormFields] = useState([
  //   {
  //     label: "",
  //     name: "profile",
  //     type: "picture", // เพิ่มรูปภาพในลูป
  //     required: false,
  //     col: 24,
  //   },
  //   {
  //     label: "Shop Name",
  //     name: "shop_name",
  //     type: "text",
  //     required: true,
  //     col: 6,
  //   },
  //   {
  //     label: "Mobile Phone",
  //     name: "mobile_phone",
  //     type: "text",
  //     required: false,
  //     col: 6,
  //   },
  //   {
  //     label: "Address",
  //     name: "address",
  //     type: "text",
  //     required: false,
  //     col: 12,
  //   },
  //   {
  //     label: "Office Hours",
  //     name: "day_of_week",
  //     type: "multiple",
  //     options: [
  //       { name: "Monday", id: "Monday", selected: true },
  //       { name: "Tuesday", id: "Tuesday", selected: false },
  //       { name: "Wednesday", id: "Wednesday", selected: false },
  //       { name: "Thursday", id: "Thursday", selected: false },
  //       { name: "Friday", id: "Friday", selected: false },
  //       { name: "Saturday", id: "Saturday", selected: false },
  //       { name: "Sunday", id: "Sunday", selected: false },
  //     ],
  //     required: false,
  //     col: 6,
  //     iconSrc: "/img/icons/calendar.png",
  //     iconPosition: "right",
  //   },
  //   {
  //     label: "Start Time",
  //     name: "start_time",
  //     type: "time",
  //     required: false,
  //     col: 6,
  //     value: null,
  //   },
  //   {
  //     label: "End Time",
  //     name: "end_time",
  //     type: "time",
  //     required: false,
  //     col: 6,
  //     value: "",
  //   },
  //   {
  //     label: "Business Size",
  //     name: "business_size",
  //     type: "select",
  //     required: true,
  //     col: 6,
  //     options: [
  //       { name: "Small", id: "Small", selected: true },
  //       { name: "Medium", id: "Medium", selected: false },
  //       { name: "Large", id: "Large", selected: false },
  //     ],
  //   },
  //   {
  //     label: "Email",
  //     name: "email",
  //     type: "email",
  //     required: false,
  //     col: 6,
  //     value: "",
  //   },
  //   {
  //     label: "Outlet Location",
  //     name: "outlet_location",
  //     type: "text",
  //     required: false,
  //     col: 6,
  //     value: "",
  //     iconSrc: "/img/icons/location.png",
  //     iconPosition: "right",
  //   },
  //   {
  //     label: "T-Shirt Size",
  //     name: "tshirt_size",
  //     type: "text",
  //     required: false,
  //     col: 6,
  //     value: "",
  //   },
  //   {
  //     label: "Anniversary",
  //     name: "anniversary",
  //     type: "date",
  //     required: false,
  //     col: 6,
  //     value: "",
  //   },
  //   {
  //     label: "Remark",
  //     name: "remark",
  //     type: "text",
  //     required: false,
  //     col: 24,
  //     value: "",
  //   },
  // ]);

  const [formFields, setFormFields] = useState([
    {
      label: "",
      name: "profile", 
      type: "picture", 
      required: false,
      col: 24,
    },
    {
      label: "Shop Name",
      name: "shop_name",
      type: "text",
      required: false,
      col: 6,
    },
    {
      label: "Mobile Phone",
      name: "mobile_phone",
      type: "text",
      required: false,
      col: 6,
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      required: false,
      col: 12,
    },
    {
      label: "Office Hours",
      name: "day_of_week",
      type: "multiple",
      options: [
        { name: "Monday", id: "Monday", selected: true },
        { name: "Tuesday", id: "Tuesday", selected: false },
        { name: "Wednesday", id: "Wednesday", selected: false },
        { name: "Thursday", id: "Thursday", selected: false },
        { name: "Friday", id: "Friday", selected: false },
        { name: "Saturday", id: "Saturday", selected: false },
        { name: "Sunday", id: "Sunday", selected: false },
      ],
      required: false,
      col: 6,
      iconSrc: "/img/icons/calendar.png",
      iconPosition: "right",
    },
    {
      label: "Start Time",
      name: "start_time",
      type: "time",
      required: false,
      col: 6,
    },
    {
      label: "End Time",
      name: "end_time",
      type: "time",
      required: false,
      col: 6,
    },
    // {
    //   label: "Business Size",
    //   name: "business_size",
    //   type: "select",
    //   options: [
    //     { name: "Small", id: 1, selected: true },
    //     { name: "Medium", id: 2, selected: false },
    //     { name: "Large", id: 3, selected: false },
    //   ],
    //   required: false,
    //   col: 6,
    //   value: companyinfo.business_size,
    // },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
      col: 6,
    },
    {
      label: "Fertilizer Business",
      name: "tshirt_size",
      type: "text",
      required: false,
      col: 6,
      value: companyinfo.t_shirt_size,
    },
    {
      label: "Seed Business",
      name: "seed_business",
      type: "text",
      required: false,
      col: 6,
      value: companyinfo.anniversary,
    },
    {
      label: "Pesticides Business",
      name: "pesticides_business",
      type: "text",
      required: false,
      col: 6,
      value: companyinfo.anniversary,
    },
    {
      label: "Outlet Location",
      name: "outlet_location",
      type: "text",
      required: false,
      col: 24,
      value: companyinfo.location_address,
      iconSrc: "/img/icons/location.png",
      iconPosition: "right",
    },
    // {
    //   label: "Remark",
    //   name: "remark",
    //   type: "text",
    //   required: false,
    //   col: 24,
    // },
  ]);


  const transformedCropOptions = cropOptions.map((option) => ({
    label: option.name, // เปลี่ยนจาก name เป็น label
    value: option.id, // คงค่า value เดิมไว้
  }));

  const [personalInfo, setPersonalInfo] = useState({
    shop_name: "",
    mobile_phone: "",
    address: "",
    email: "",
    office_hours: [],
    start_time: "",
    end_time: "",
    business_size: "",
    outlet_location: "",
    tshirt_size: "",
    anniversary: null,
    remark: "",
  });

  // const [contacts, setContacts] = useState([
  //   {
  //     name_en: "",
  //     name_th: "",
  //     nickname: "",
  //     date_of_birth: null,
  //     t_shirt_size: "",
  //     relationship: "",
  //     duty: "",
  //     tel1: "",
  //     tel2: "",
  //     contact_number: "",
  //     email: "",
  //     line_id: "",
  //   },
  // ]);

  const addContact = () => {
    setContacts((prevContacts) => [
      ...prevContacts,
      {
        name_en: "",
        name_th: "",
        nickname: "",
        date_of_birth: null,
        t_shirt_size: "",
        relationship: "",
        duty: "",
        tel1: "",
        tel2: "",
        contact_number: "",
        email: "",
        line_id: "",
      },
    ]);
  };
  
  const updateContact = (index, field, value) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    );
  };

  const handlePersonalInfoChange = (field, value) => {
    console.log(field,value);
    
    setPersonalInfo((prevInfo) => ({
      ...prevInfo,
      [field]: value, // อัปเดตค่าฟิลด์ที่กำหนด
    }));
  };
  
  const handleRemoveContact = (index) => {
    setContacts((prevContacts) => prevContacts.filter((_, i) => i !== index));
  };

  const mapContainerStyle = {
    width: "100%",
    height: "30vh",
  };


  const handleMarkerDragEnd = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };
    
    try {
      const response = await geocoder.geocode({ location: latlng });
      if (response.results && response.results.length > 0) {
        const locationName = response.results[0].formatted_address;
        // อัปเดต Outlet Location
        form.setFieldsValue({ outlet_location: locationName });
        setcompanyinfo((prev) => ({
          ...prev,
          outlet_location: locationName,
        }));
  
        showNotification("success", `Location updated: ${locationName}`);
        // อัปเดตตำแหน่งปัจจุบันใน State
        setCurrentLocation({ lat, lng });
        
      } else {
        showNotification("error", "No address found for this location.");
      }
    } catch (error) {
      console.error(error);
      showNotification("error", "Unable to fetch location name.");
    }
  
  };
  
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsGoogleLoaded(true);
      } else {
        const interval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(interval);
            setIsGoogleLoaded(true);
          }
        }, 500);
      }
    };
    checkGoogleMaps();
  }, []);


  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        // console.log(values);
        const payload = {
          name: values.shop_name || "",
          mobile_phone: values.mobile_phone || "",
          address: values.address || "",
          email: values.email || "",
          day_of_week: values.day_of_week ,
          start_time: values.start_time
          ? dayjs(values.start_time).format("HH:mm")
          : "",
          end_time: values.end_time
          ? dayjs(values.end_time).format("HH:mm")
          : "",
          business_size: values.business_size || "",
          // outlet_location: values.outlet_location || "",
          location_address: values.outlet_location || "",
          location_longitude: currentLocation.lng || "",
          location_latitude: currentLocation.lat  || "",
          t_shirt_size: values.tshirt_size || "",
          anniversary: values.anniversary
            ? dayjs(values.anniversary).format("YYYY-MM-DD")
            : null,
          remark: values.remark || "",
          photo_path: values.profile, // ตัวอย่าง placeholder
          
          contact_items: contacts.map((contact) => ({
            name_en: contact.name_en || "",
            contact_number: contact.contact_number || "",
            name_th: contact.name_th || "",
            nickname: contact.nickname || null,
            date_of_birth: contact.date_of_birth
              ? dayjs(contact.date_of_birth).format("YYYY-MM-DD")
              : null,
            t_shirt_size: contact.t_shirt_size || null,
            relationship: contact.relationship || null,
            duty: contact.duty || null,
            tel1: contact.tel1 || "",
            tel2: contact.tel2 || "",
            email: contact.email || null,
            line_id: contact.line_id || null,
          })),
          crop_list: defaultSelectedCrops || [],
        };
  
        console.log("Payload to be sent:", payload);
  
        // ส่งข้อมูลไปยัง API
        useServiceAPI
          .post(paths.pathCreateSubDealer, payload, setLoading)
          .then((response) => {
            if (response.status === 200) {
              showNotification("success", response.data.message).then(() => {
                navigate("/customer/sub-dealer");
              });
            }
          })
          .catch((error) => {
            console.error("API Error:", error);
            showNotification(
              "error",
              error.response?.data?.message || "An unexpected error occurred."
            );
          });
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
        showNotification("error", "Please complete all required fields.");
      });
  };
  
  useEffect(() => {
    // console.log(defaultSelectedCrops)
  }, [defaultSelectedCrops]);


  return (
    <Form form={form} layout="vertical">

    <MainLayout loading={loading}>
    <div className="title-page">Create Sub Dealer</div>
      <FormUser 
        title="Personal Info" 
        fields={formFields} 
        form={form}
      />

      <div className={`bg-white p-4`}
        style={{
          boxShadow: "rgba(0, 0, 0, 0.1)", // Optional for a subtle shadow
          marginTop: "-20px",
        }}
      >
      <div className="text-[#00783F] text-lg font-semibold mb-3">

        <LoadScript googleMapsApiKey={dataApiKey}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={currentLocation}
            zoom={dataMapZoom}
            onClick={(e) => {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              setCurrentLocation({ lat, lng });
            }}
          >
            {isGoogleLoaded && (
              <Marker 
                position={currentLocation}
                icon={{
                  // url: "https://adama-api.mtsc.co.th/images/activity-type-mark-location/DemoPlot.png",
                  scaledSize: { width: 30, height: 30 },
                }}
                draggable={true}
                onDragEnd={handleMarkerDragEnd} 
              />
            )}
          </GoogleMap>
        </LoadScript>


        <Form.Item 
          label="Remark" 
          name="remark"
          className="mt-3"
        >
          <Input placeholder="Enter Remark" />
        </Form.Item>

        </div>
      </div>


      {/* 
      <LoadScript googleMapsApiKey={dataApiKey}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentLocation}
          zoom={dataMapZoom}
          onClick={(e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setCurrentLocation({ lat, lng });
          }}
        >
          {isGoogleLoaded && (
            <Marker 
              position={currentLocation}
              icon={{
                url: "https://adama-api.mtsc.co.th/images/activity-type-mark-location/DemoPlot.png",
                scaledSize: { width: 30, height: 30 },
              }}
              draggable={true}
              onDragEnd={handleMarkerDragEnd} 
            />
          )}
        </GoogleMap>
      </LoadScript> */}

      <BoxPrimary title="Crop">
        <Select
          mode="multiple"
          showSearch
          placeholder="Select Crop(s)"
          optionFilterProp="children"
          className="w-full"
          value={defaultSelectedCrops} 
          onChange={(value) => setDefaultSelectedCrops(value)} 
          options={transformedCropOptions} 
        />
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-lg font-semibold">
            Contact Person
          </span>
          <ActionButton mode="add" text="Add" onClick={addContact} />
        </div>
        {contacts.map((contact, index) => (
          <div key={index}>
              <div className="flex justify-between mb-4">
                <span className="text-[#00783F] text-md">{`Person ${index + 1}`}</span>
                {index > 0 && (
                  <ActionButton
                    mode="delete"
                    text="Delete"
                    onClick={() => handleRemoveContact(index)}
                  />
                )}
              </div>
            <Row gutter={[16, 16]} className="mt-3">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Name (EN)"
                  value={contact.name_en}
                  onChange={(e) =>
                    updateContact(index, "name_en", e.target.value)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Name (TH)"
                  value={contact.name_th}
                  onChange={(e) =>
                    updateContact(index, "name_th", e.target.value)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Nickname"
                  value={contact.nickname}
                  onChange={(e) =>
                    updateContact(index, "nickname", e.target.value)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <DatePicker
                  className="w-full"
                  placeholder="Date of Birth"
                  value={
                    contact.date_of_birth ? dayjs(contact.date_of_birth) : null
                  }
                  onChange={(date) =>
                    updateContact(index, "date_of_birth", date)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="T-Shirt Size"
                  value={contact.t_shirt_size}
                  onChange={(e) =>
                    updateContact(index, "t_shirt_size", e.target.value)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Relationship"
                  value={contact.relationship}
                  onChange={(e) =>
                    updateContact(index, "relationship", e.target.value)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Duty"
                  value={contact.duty}
                  onChange={(e) => updateContact(index, "duty", e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Tel 1"
                  value={contact.tel1}
                  onChange={(e) => updateContact(index, "tel1", e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Tel 2"
                  value={contact.tel2}
                  onChange={(e) => updateContact(index, "tel2", e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Contact Number"
                  value={contact.contact_number}
                  onChange={(e) =>
                    updateContact(index, "contact_number", e.target.value)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Email"
                  value={contact.email}
                  onChange={(e) =>
                    updateContact(index, "email", e.target.value)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Line ID"
                  value={contact.line_id}
                  onChange={(e) =>
                    updateContact(index, "line_id", e.target.value)
                  }
                />
              </Col>
            </Row>
            {index < contacts.length - 1 && <hr className="my-4" />}
          </div>
        ))}
      </BoxPrimary>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/customer/sub-dealer")}
        />
        <ActionButton text="Save" mode="save" onClick={handleSave} />
      </div>
    </MainLayout>
    </Form>



  );
}
