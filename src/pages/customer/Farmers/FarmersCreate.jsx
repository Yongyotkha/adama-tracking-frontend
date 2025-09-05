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
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const { Option } = Select;

export default function FarmersCreate() {
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
  const [currentLocation, setCurrentLocation] = useState({ lat: 13.9572612, lng: 100.6222401, });
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
  const location = useLocation();
  const [isMapEnabled, setIsMapEnabled] = useState(false);
  const [profileImage, setProfileImage] = useState("/img/profile.jpg"); // Default value

  const mode = location.state.mod;
  const isViewMode = mode === "View";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {

        if (mode === 'Edit' || mode === 'View') {
          await fetchFarmersDetails(location.state.id);
        }
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

  const fetchFarmersDetails = async (id) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(
        `${paths.pathCustomerFarmersDetail}?id=${id}`
      );
      if (response.status === 200) {
        const { data } = response;
        setProfileImage(data.photo_path)
        // ตั้งค่า Default Values
        form.setFieldsValue({
          name: data.name || "",
          mobile_phone: data.mobile_phone || "",
          address: data.address || "",
          email: data.email || "",
          day_of_week: data.day_of_week || [],
          start_time: data.start_time ? dayjs(data.start_time, "HH:mm") : null,
          end_time: data.end_time ? dayjs(data.end_time, "HH:mm") : null,
          remark: data.remark || "",
          outlet_location: data.location_address || "",
          use_flag: data.use_flag === "1" ? "Active" : "Inactive",
        });

        // ตั้งค่ารายละเอียดอื่น ๆ
        setCurrentLocation({
          lat: parseFloat(data.location_latitude) || 13.9572612,
          lng: parseFloat(data.location_longitude) || 100.6222401,
        });
        setDefaultSelectedCrops(
          data.crop_list?.map((crop) => Number(crop.id)) || []
        );
        setContacts(
          data.contact_items?.map((contact) => ({
            name_en: contact.name_en || "",
            name_th: contact.name_th || "",
            nickname: contact.nickname || "",
            date_of_birth: contact.date_of_birth
              ? dayjs(contact.date_of_birth, "YYYY-MM-DD")
              : null,
            t_shirt_size: contact.t_shirt_size || "",
            relationship: contact.relationship || "",
            duty: contact.duty || "",
            tel1: contact.tel1 || "",
            tel2: contact.tel2 || "",
            contact_number: contact.contact_number || "",
            email: contact.email || "",
            line_id: contact.line_id || "",
            hobby: contact.hobby || "",
            age: contact.age || "",
          })) || []
        );
      } else {
        console.error("Failed to fetch details:", response.message);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      showNotification("error", "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };




  const [formFields, setFormFields] = useState([
    {
      label: "",
      name: "profile", // ชื่อฟิลด์ในฟอร์ม
      type: "picture", // ประเภทฟิลด์
      required: false,
      col: 24,
    },
    {
      label: "Farmer Name",
      name: "name",
      type: "text",
      disabled: isViewMode,
      required: false,
      col: 6,
    },
    {
      label: "Mobile Phone",
      name: "mobile_phone",
      type: "text",
      disabled: isViewMode,
      required: false,
      col: 6,
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      disabled: isViewMode,
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
      disabled: isViewMode,
    },
    {
      label: "Start Time",
      name: "start_time",
      type: "time",
      required: false,
      col: 3,
      disabled: isViewMode,
    },
    {
      label: "End Time",
      name: "end_time",
      type: "time",
      required: false,
      col: 3,
      disabled: isViewMode,
    },
    {
      label: "Business Size",
      name: "business_size",
      type: "select",
      required: false,
      col: 6,
      options: [
        { name: "Small", id: 1, selected: true },
        { name: "Medium", id: 2, selected: false },
        { name: "Large", id: 3, selected: false },
      ],
      disabled: isViewMode,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
      col: 6,
      disabled: isViewMode,
    },
    {
      label: "Outlet Location",
      name: "outlet_location",
      type: "text",
      required: false,
      col: 6,
      value: companyinfo.location_address,
      iconSrc: "/img/icons/location.png",
      iconPosition: "right",
      disabled: true,
    },

    {
      label: "T-Shirt Size",
      name: "t_shirt_size",
      type: "text",
      required: false,
      col: 6,
      disabled: isViewMode,
    },
    {
      label: "Aniversary",
      name: "anniversary",
      type: "date",
      required: false,
      col: 6,
      disabled: isViewMode,
    },
    {
      label: "Status",
      name: "use_flag",
      type: "select",
      required: false,
      col: 6,
      // disabled: true,
      options: [
        { name: "Active", id: 1, selected: true },
        { name: "Inactive", id: 0, selected: false },
      ],
      disabled: isViewMode,
    },
    {
      label: "Remark",
      name: "remark",
      type: "text",
      required: false,
      col: 24,
      disabled: isViewMode,
    },
  ]);


  const transformedCropOptions = cropOptions.map((option) => ({
    label: option.name,
    value: option.id,
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
      prevContacts.map((contact, i) => {
        if (i === index) {
          const updatedContact = { ...contact, [field]: value };

          // หากฟิลด์ที่เปลี่ยนคือ date_of_birth ให้คำนวณอายุ
          if (field === "date_of_birth" && value) {
            const birthDate = dayjs(value);
            const currentYear = dayjs().year();
            const age = currentYear - birthDate.year(); // คำนวณอายุ
            updatedContact.age = age;
          }

          return updatedContact;
        }
        return contact;
      })
    );
  };

  const handlePersonalInfoChange = (field, value) => {
    console.log(field, value);

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

  //--- ฟังก์ชันดึงตำแหน่งปัจจุบัน ---//
  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      showNotification("error", "Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });

        // เรียกใช้ geocoder เพื่อแปลง lat,lng => ชื่อสถานที่
        try {
          const geocoder = new window.google.maps.Geocoder();
          const latlng = { lat: latitude, lng: longitude };
          const response = await geocoder.geocode({ location: latlng });
          if (response.results && response.results.length > 0) {
            const locationName = response.results[0].formatted_address;
            // เซ็ตค่าลงในฟอร์ม
            form.setFieldsValue({ outlet_location: locationName });
            showNotification("success", `Current location: ${locationName}`);
          }
        } catch (error) {
          console.error(error);
          showNotification("error", "Unable to fetch location name.");
        }
      },
      (error) => {
        console.error(error);
        showNotification("error", "Unable to retrieve your location");
      }
    );
  };


  const handleToggleMap = () => {
    setIsMapEnabled((prev) => {
      const newState = !prev;
      // หากกำลังจะเปิด Map แต่ไม่ใช่โหมด Edit => ดึงพิกัดปัจจุบัน
      if (newState === true && mode !== "Edit") {
        getUserCurrentLocation();
      }
      return newState;
    });
  };


  // ดึงที่อยู่จาก Google Maps Geocoding API
  const fetchAddress = async (lat, lng) => {
    const apiKey = "AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        // return data.results[0].formatted_address; // คืนค่าที่อยู่
        console.log(data.results[0].formatted_address);
        setFormData({ ...formData, gps: data.results[0].formatted_address })
      } else {
        console.error("Geocoding API error:", data.status);
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Error fetching address";
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchAddress(latitude, longitude);
        },
        (error) => {
          console.error("Error fetching location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {

        let useFlagValue;
        if (values.use_flag === 1 || values.use_flag === 0) {
          useFlagValue = values.use_flag; // ถ้าค่าเป็น 1 หรือ 0 อยู่แล้ว ใช้ค่าเดิม
        } else {
          useFlagValue = values.use_flag === "Active" ? 1 : 0; // แปลงค่าจาก "Active" หรือ "Inactive"
        }

        console.log(values);

        const formattedData = {
          id:location.state.id,
          photo_path: values.profile,
          name: values.name || "",
          mobile_phone: values.mobile_phone || "",
          address: values.address || "",
          email: values.email || "",
          day_of_week: values.day_of_week,
          start_time: values.start_time
            ? dayjs(values.start_time).format("HH:mm")
            : "",
          end_time: values.end_time
            ? dayjs(values.end_time).format("HH:mm")
            : "",
          business_size: values.business_size || "",
          outlet_location: values.location_address || "",
          t_shirt_size: values.t_shirt_size || "",
          anniversary: values.anniversary
            ? dayjs(values.anniversary).format("YYYY-MM-DD")
            : null,
          location_longitude: currentLocation.lng || "",
          location_latitude: currentLocation.lat || "",
          location_address: values.location_address || "",
          use_flag: useFlagValue,
          remark: values.remark,
          bank_account_items: companyinfo.bank_account_items || [],
          contact_items: contacts.map((item) => ({
            name_en: item.name_en || "",
            contact_number: item.contact_number || "",
            name_th: item.name_th || "",
            nickname: item.nickname || null,
            date_of_birth: item.date_of_birth || null,
            t_shirt_size: item.t_shirt_size || null,
            relationship: item.relationship || null,
            duty: item.duty || null,
            tel1: item.tel1 || "",
            tel2: item.tel2 || "",
            email: item.email || null,
            line_id: item.line_id || null,
            hobby: item.hobby || "",
            age: item.age || "",
          })),
          crop_list: defaultSelectedCrops || [],
        };

        console.log(formattedData);


        if (mode === "create") {
          useServiceAPI
            .post(paths.pathCustomerFarmersCreate, formattedData)
            .then((response) => {
              if (response.status === 200) {
                navigate("/customer/farmers");
                showNotification(
                  "success",
                  response.data.message,
                  response.data.message_line
                );
                // console.log("Save successful:", response.data);
                // navigate("/customer/farmers"); 
              }
            })
            .catch((error) => {
              console.error("Save failed:", error);
            });
        } else {
          useServiceAPI
            .put(paths.pathCustomerFarmersUpdate, formattedData)
            .then((response) => {
              if (response.status === 200) {
                navigate("/customer/farmers");
                console.log(response.data.message);

                showNotification(
                  "success",
                  response.data.message,
                  response.data.message_line
                );
                // console.log("Save successful:", response.data);
                // navigate("/customer/farmers"); 
              }
            })
            .catch((error) => {
              console.error("Save failed:", error);
            });
        }


      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };




  useEffect(() => {
    // console.log(defaultSelectedCrops)
  }, [defaultSelectedCrops]);

  const handleGetLocationToGoogleMap = () => {
    if (currentLocation.lat && currentLocation.lng) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLocation.lat},${currentLocation.lng}`;
      window.open(googleMapsUrl, "_blank");
    } else {
      showNotification("error", "No latitude and longitude data available.");
    }
  };


  return (
    <Form form={form} layout="vertical" component={false}>
      <MainLayout loading={loading}>
        <div className="title-page">Create Farmers</div>
        <FormUser
          title="Personal Info"
          profile={profileImage}
          fields={formFields}
          form={form}
          disableImageUpload={isViewMode}
        />

        <div className={`bg-white p-4`}
          style={{
            boxShadow: "rgba(0, 0, 0, 0.1)", // Optional for a subtle shadow
            marginTop: "-20px",
          }}
        >
          <div className="text-[#00783F] text-lg font-semibold mb-3">

            {/* <div className="flex justify-end space-x-4 mb-2">
              <ActionButton
                text={isMapEnabled ? "Close Google" : "Open Google"}
                mode="update"
                // onClick={() => setIsMapEnabled((prev) => !prev)} 
                onClick={handleToggleMap}
              />
            </div> */}

            <div className="flex justify-end space-x-2 mb-2">
              <ActionButton
                text={isMapEnabled ? "Close Google" : "Open Google"}
                mode="custom"
                onClick={() => setIsMapEnabled((prev) => !prev)}
                className={isMapEnabled ? "bg-[#f11113]" : "bg-[#00783F]"} // สีแดง/เขียว
                disabled={isViewMode}
              />
              <button
                className="w-8 h-8  bg-white rounded hover:shadow"
                onClick={handleGetLocationToGoogleMap}
                title="Open in Google Maps"
                disabled={!currentLocation.lat || !currentLocation.lng}
              >
                <img
                  src="/img/icons/google-map.png"
                  alt="Google Map"
                  className="w-full h-full object-contain"
                />
              </button>
            </div>


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
                    options={{ disableDefaultUI: !isMapEnabled, draggable: isMapEnabled }}

                  />
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>


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
            disabled={{ isViewMode }}
          />
        </BoxPrimary>

        <BoxPrimary>
          <div className="flex justify-between mb-4">
            <span className="text-[#00783F] text-lg font-semibold">
              Contact Person
            </span>
            {!isViewMode && (
              <ActionButton mode="add" text="Add" onClick={addContact} />
            )}
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
                    placeholder="Age"
                    value={contact.age || ""}
                    onChange={(e) => updateContact(index, "age", e.target.value)}
                    disabled={true}
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
                <Col xs={24} sm={18} md={18} lg={18}>
                  <Input
                    placeholder="hobby"
                    value={contact.hobby || ""}
                    onChange={(e) => updateContact(index, "hobby", e.target.value)}
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
            onClick={() => navigate("/customer/farmers")}
          />

          {!isViewMode && (
            <ActionButton text="Save" mode="save" onClick={handleSave} />
          )}
        </div>
      </MainLayout>
    </Form>



  );

}
