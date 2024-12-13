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
} from "antd";
import { values } from "lodash";
import dayjs from "dayjs";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import TableComponent from "../../../components/table/TableComponent";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import DynamicModal from "../../../components/modal/DynamicModal"; 
import { GoogleMap, LoadScript, Marker} from "@react-google-maps/api";


const { Option } = Select;

export default function EditSubDealer() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [cropOptions, setCropOptions] = useState([]);
  const [defaultSelectedCrops, setDefaultSelectedCrops] = useState([]); 
  const [companyinfo, setcompanyinfo] = useState([]);
  const [form] = Form.useForm();
  const [contactItems, setContactItems] = useState([]); // State for contact items
  const { showMsg, showNotification } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [profileImage, setProfileImage] = useState("/img/profile.jpg"); // Default value
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataApiKey, setDataApiKay] = useState("AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik");
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({});
  const [dataMapZoom, setDataMapZoom] = useState(10);
  const mode = location.state.mode; 
  const isViewMode = mode === "View";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchPromotionDetails(location.state.id);
        const [crops] = await Promise.all([
          useServiceAPI.get(paths.pathMasterCrop, {}),
        ]);

        setCropOptions(crops.data);
        setDataLoaded(true);

      } catch (error) {
        console.log(error.message);
        showNotification("เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const fetchPromotionDetails = async (id) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(
        `${paths.pathSubDealerDetail}?id=${id}`
      );
      if (response.status === 200) {
        const { data } = response;
        console.log(data.location_latitude);
        console.log(data.location_longitude);
        const lat = parseFloat(data.location_latitude) || 13.9572612; 
        const lng = parseFloat(data.location_longitude) || 100.6222401;   
        setCurrentLocation({ lat, lng });

        setcompanyinfo(data);
        setProfileImage(data.photo_path); 
        setContactItems(data.contact_items);
        setCropOptions(data.crop_list || []);
        const cropNames = data.crop_list?.map((crop) => Number(crop.id)) || [];
        setDefaultSelectedCrops(cropNames);

      } else {
        console.error("Failed to fetch data:", response.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (companyinfo.remark) {
      form.setFieldsValue({
        remark: companyinfo.remark, // กำหนดค่าของ remark ในฟอร์ม
      });
    }
  }, [companyinfo, form]); // อัปเดตเมื่อ companyinfo เปลี่ยน
  

  let formFields = [
    {
      label: "",
      name: "profile", // ชื่อฟิลด์ในฟอร์ม
      type: "picture", // ประเภทฟิลด์
      required: false,
      col: 24,
      value: companyinfo.photo_path,

    },
    {
      label: "Shop Name",
      name: "shop_name",
      type: "text",
      required: false,
      col: 6,
      value: companyinfo.name 
    },
    {
      label: "Mobile Phone",
      name: "mobile_phone",
      type: "text",
      required: false,
      col: 6,
      value: companyinfo.mobile_phone
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      required: false,
      col: 12,
      value: companyinfo.address,
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
      value:companyinfo.day_of_week,
    },
    {
      label: "Start Time",
      name: "start_time",
      type: "time",
      required: false,
      col: 6,
      value: companyinfo.start_time
      ? dayjs(companyinfo.start_time, "HH:mm")
      : null,
      
    },
    {
      label: "End Time",
      name: "end_time",
      type: "time",
      required: false,
      col: 6,
      value: companyinfo.end_time
      ? dayjs(companyinfo.end_time, "HH:mm")
      : null,
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
      value: companyinfo.email
    },
    // {
    //   label: "T-Shirt Size",
    //   name: "tshirt_size",
    //   type: "text",
    //   required: false,
    //   col: 6,
    //   value: companyinfo.t_shirt_size,
    // },
    // {
    //   label: "Anniversary",
    //   name: "anniversary",
    //   type: "date",
    //   required: false,
    //   col: 6,
    //   value: companyinfo.anniversary,
    // },

    // {
    //   label: "Remark",
    //   name: "remark",
    //   type: "text",
    //   required: false,
    //   col: 12,
    //   value: companyinfo.remark
    // },
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
  ];

  if (isViewMode) {
    formFields = formFields.map(field => ({
      ...field,
      disabled: true
    }));
  }


  const transformedCropOptions = cropOptions.map((option) => ({
    label: option.name, 
    value: option.id, 
  }));

  useEffect(() => {
    // console.log(defaultSelectedCrops)
  }, [defaultSelectedCrops]);

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...contactItems];
    updatedContacts[index][field] = value;
    setContactItems(updatedContacts);
  };

  const handleRemoveContact = (index) => {
    setContactItems((prev) => prev.filter((_, i) => i !== index));
  };

  const renderContactItems = () =>
    contactItems.map((contact, index) => (
      <div key={index} className="mb-6">
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-md">{`Person ${index + 1}`}</span>
          {index > 0 && !isViewMode && (
          <ActionButton
            mode="delete"
            text="Delete"
            onClick={() => handleRemoveContact(index)}
            disabled={isViewMode}
          />
        )}
        </div>
        <Row gutter={[16, 16]} className="mt-3">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Name (EN)"
              value={contact.name_en || ""}
              onChange={(e) => handleContactChange(index, "name_en", e.target.value)}
              disabled={isViewMode}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Name (TH)"
              value={contact.name_th || ""}
              onChange={(e) => handleContactChange(index, "name_th", e.target.value)}
              disabled={isViewMode}

            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Nickname"
              value={contact.nickname || ""}
              onChange={(e) => handleContactChange(index, "nickname", e.target.value)}
              disabled={isViewMode}

            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <DatePicker
              className="w-full"
              placeholder="Date of Birth"
              value={contact.date_of_birth ? dayjs(contact.date_of_birth) : null}
              onChange={(date) => handleContactChange(index, "date_of_birth", date)}
              disabled={isViewMode}

            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="T-Shirt Size"
              value={contact.t_shirt_size || ""}
              onChange={(e) => handleContactChange(index, "t_shirt_size", e.target.value)}
              disabled={isViewMode}

            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Relationship"
              value={contact.relationship || ""}
              onChange={(e) => handleContactChange(index, "relationship", e.target.value)}
              disabled={isViewMode}

            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Duty"
              value={contact.duty || ""}
              onChange={(e) => handleContactChange(index, "duty", e.target.value)}
              disabled={isViewMode}

            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Tel 1"
              value={contact.tel1 || ""}
              onChange={(e) => handleContactChange(index, "tel1", e.target.value)}
              disabled={isViewMode}

            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Tel 2"
              value={contact.tel2 || ""}
              onChange={(e) => handleContactChange(index, "tel2", e.target.value)}
              disabled={isViewMode}

            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Contact Number"
              value={contact.contact_number || ""}
              onChange={(e) => handleContactChange(index, "contact_number", e.target.value)}
              disabled={isViewMode}

            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Email"
              value={contact.email || ""}
              onChange={(e) => handleContactChange(index, "email", e.target.value)}
              disabled={isViewMode}

            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Line ID"
              value={contact.line_id || ""}
              onChange={(e) => handleContactChange(index, "line_id", e.target.value)}
              disabled={isViewMode}

            />
          </Col>
        </Row>
        <hr className="my-4" />
      </div>
    ));



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
          form.setFieldsValue({ location_address: locationName });
          setcompanyinfo((prev) => ({
            ...prev,
            location_address: locationName,
          }));
    
          showNotification("success", `Location updated: ${locationName}`);
          // อัปเดตตำแหน่งปัจจุบันใน State
          setCurrentLocation({ lat, lng });
        } else {
          showNotification("error", "No address found for this location.");
        }
      } catch (error) {
        console.error("Geocoder failed due to:", error);
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
          const payload = {
            id: location.state.id,
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
            location_address: values.outlet_location || "",
            location_longitude: currentLocation.lng || "",
            location_latitude: currentLocation.lat  || "",
            t_shirt_size: values.tshirt_size || "",
            anniversary: values.anniversary
              ? dayjs(values.anniversary).format("YYYY-MM-DD")
              : null,
            remark: values.remark || "",
            photo_path: values.profile, 
            contact_items: contactItems.map((contact) => ({
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
            useServiceAPI
            .put(paths.pathSubDealerDetailUpdate, payload, setLoading)
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



  return (

    <Form form={form} layout="vertical">
    
    <MainLayout loading={loading}>
      <div className="title-page"></div>
      <div className="title-page">{isViewMode ? "View Sub Dealer" : "Edit Sub Dealer"}</div>


      {dataLoaded ? (
        <FormUser 
          profile={profileImage} 
          fields={formFields} 
          form={form} 
          initialValues={{
            remark: companyinfo.remark || "", // ค่าเริ่มต้นของ remark
          }}
        />
      ) : (
        <div></div>
      )}
      
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

    {/* <LoadScript googleMapsApiKey={dataApiKey}>
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
          onChange={(value) => setDefaultSelectedCrops(value)} // จัดการการเปลี่ยนแปลงค่า
          options={transformedCropOptions} 
          disabled={isViewMode}
        />
    </BoxPrimary>

    <BoxPrimary>
      <div className="flex justify-between mb-4">
        <span className="text-[#00783F] text-lg font-semibold">Contact Person</span>
        {!isViewMode && ( 
          <ActionButton
            mode="add"
            text="Add"
            onClick={() => {
              setContactItems([
                ...contactItems,
                {
                  name: "",
                  phone: "",
                  email: "",
                  position: ""
                }
              ]);
            }}
          />
        )}
      </div>
      {contactItems.length > 0 ? (
        renderContactItems()
      ) : (
        <div className="text-gray-500"></div>
      )}
    </BoxPrimary>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/customer/sub-dealer")} />
        {
        !isViewMode && (
          <ActionButton text="Update" mode="update" onClick={handleSave} />
          )
        }
      </div>
    </MainLayout>
    </Form>


  );
}
