import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import DynamicButton from "../../../components/button/DynamicButton";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
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
  Tabs,
  Form,
  Select,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import TableComponent from "../../../components/table/TableComponent";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import DynamicModal from "../../../components/modal/DynamicModal";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import FormSubDealer from "../../../components/form_user/FormSubDealer";

const { Option } = Select;

export default function CreateSubDealer() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showMsg, showNotification } = useContext(AuthContext);
  // ---------- State สำหรับแท็บ Profile ----------
  const [cropOptions, setCropOptions] = useState([]);
  const [form] = Form.useForm();
  const [defaultSelectedCrops, setDefaultSelectedCrops] = useState([]);
  const [personalInfoData, setPersonalInfoData] = useState({});
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
  const location = useLocation();
  const mode = location.state.mode;
  console.log(mode);
  const isViewMode = mode === "View";
  const isEditMode = mode === "Edit";
  const [profileImage, setProfileImage] = useState(""); // State สำหรับเก็บ URL รูปภาพ
  const [isMapEnabled, setIsMapEnabled] = useState(false);

  console.log(mode);

  // ---------- State สำหรับแท็บ Network (ตัวอย่าง) ----------
  const [networkList, setNetworkList] = useState([]); // รายการ network
  const [isTerritoryModalVisible, setIsTerritoryModalVisible] = useState(false);
  const [userList, setUserList] = useState([]); // สำหรับ TableComponent ใน Modal

  // columns ของตาราง Network (ตัวอย่าง)
  const networkHeader = [
    { title: "No", dataIndex: "no", key: "no", width: 50, align: "center" },
    { title: "Name", dataIndex: "name", key: "name", width: 150 },
    { title: "Contact Person", dataIndex: "contactperson", key: "contactperson", width: 150 },
    { title: "Status", dataIndex: "status", key: "status", width: 120, align: "center" },
    { title: "Action", dataIndex: "action", key: "action", width: 100, align: "center" },
  ];


  // โหลดข้อมูลเบื้องต้น เช่น รายการพืช (crops)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {

        if (mode === 'Edit' || mode === 'View') {
          await fetchSubDealerDetails(location.state.id);

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

  const fetchSubDealerDetails = async (id) => {
    setLoading(true);
    try {

      const response = await useServiceAPI.get(
        `${paths.pathSubDealerDetail}?id=${id}`
      );

      if (response.status === 200) {
        const { data } = response;
        setProfileImage(data.photo_path || "");

        // ตั้งค่า location
        const lat = parseFloat(data.location_latitude) || 13.9572612;
        const lng = parseFloat(data.location_longitude) || 100.6222401;
        setCurrentLocation({ lat, lng });

        // อัปเดต state และ form
        setcompanyinfo(data);
        form.setFieldsValue({
          shop_name: data.name,
          mobile_phone: data.mobile_phone,
          address: data.address,
          email: data.email,
          day_of_week: data.day_of_week,
          start_time: data.start_time ? dayjs(data.start_time, "HH:mm") : null,
          end_time: data.end_time ? dayjs(data.end_time, "HH:mm") : null,
          remark: data.remark,
          outlet_location: data.location_address,
          fertilizer_business: data.fertilizer_business,
          seed_business: data.seed_business,
          pesticides_business: data.pesticides_business,
        });

        // ตั้งค่า Crop List
        const cropIds = data.crop_list?.map((crop) => Number(crop.id)) || [];
        setDefaultSelectedCrops(cropIds);
        // ตั้งค่า farmers
        const farmers = data.network_farmer_list?.map((farmer, index) => ({
          key: farmer.farmer_id,
          no: index + 1,
          name: farmer.farmer_name || "-",
          contactperson: farmer.farmer_contact_name || "-",
          status: (
            <BadgeStatus
              text={farmer.farmer_channel_type_name}
              bgColor={farmer.farmer_channel_type_bg_color}
              textColor={farmer.farmer_channel_type_color}
            />
          ),
          action: (
            <>
              <DynamicButton
                iconSrc="/img/icons/delete.png"
                onClick={() =>
                  handleDeleteNetworkItem(farmer.farmer_id)
                }
              />
            </>
          ),
        })) || [];
        setNetworkList(farmers); // อัปเดต state networkList

        // ตั้งค่า Contact Person จาก contact_items
        const contactList = data.contact_items?.map((item) => ({
          name_en: item.name_en || "",
          name_th: item.name_th || "",
          nickname: item.nickname || "",
          date_of_birth: item.date_of_birth
            ? dayjs(item.date_of_birth, "YYYY-MM-DD")
            : null,
          t_shirt_size: item.t_shirt_size || "",
          relationship: item.relationship || "",
          duty: item.duty || "",
          tel1: item.tel1 || "",
          tel2: item.tel2 || "",
          contact_number: item.contact_number || "",
          email: item.email || "",
          line_id: item.line_id || "",
          hobby: item.hobby || "",
          age: item.age || "",
        })) || [];
        setContacts(contactList);

      } else {
        console.error("Failed to fetch SubDealer details:", response.message);
      }
    } catch (error) {
      console.error("Error fetching SubDealer details:", error);
      showNotification("error", "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };


  // จัดการแท็บ
  const [activeTabKey, setActiveTabKey] = useState("profile");
  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };

  // แบ่งฟิลด์ในฟอร์ม
  const [formFields, setFormFields] = useState([
    {
      label: "",
      name: "profile",
      type: "picture",
      required: false,
      col: 24,
      disabled: isViewMode,
    },
    {
      label: "Shop Name",
      name: "shop_name",
      type: "text",
      required: false,
      col: 6,
      disabled: isViewMode,
    },
    {
      label: "Mobile Phone",
      name: "mobile_phone",
      type: "text",
      required: false,
      col: 6,
      disabled: isViewMode,
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      required: false,
      col: 12,
      disabled: isViewMode,
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
      col: 18,
      iconSrc: "/img/icons/calendar.png",
      iconPosition: "right",
    },
    // {
    //   label: "Start Time",
    //   name: "start_time",
    //   type: "time",
    //   required: false,
    //   col: 6,
    //   disabled: isViewMode,
    // },
    // {
    //   label: "End Time",
    //   name: "end_time",
    //   type: "time",
    //   required: false,
    //   col: 6,
    //   disabled: isViewMode,
    // },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
      col: 6,
      disabled: isViewMode,
    },
    {
      label: "Fertilizer Business",
      name: "tshirt_size",
      type: "text",
      required: false,
      col: 6,
      value: companyinfo.fertilizer_business,
      disabled: isViewMode,
    },
    {
      label: "Seed Business",
      name: "seed_business",
      type: "text",
      required: false,
      col: 6,
      value: companyinfo.seed_business,
      disabled: isViewMode,
    },
    {
      label: "Pesticides Business",
      name: "pesticides_business",
      type: "text",
      required: false,
      col: 6,
      value: companyinfo.pesticides_business,
      disabled: isViewMode,
    },
    {
      label: "Status",
      name: "use_flag",
      type: "select",
      required: true,
      col: 6,
      options: [
        { name: "New", id: 1, selected: true },
      ],
      value: companyinfo.status || 1,

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
      disabled: true,
    },
  ]);


  // ดึงข้อมูลใช้งานใน Modal (กรณีอยากให้มี Modal สำหรับเลือก Network)
  const fetchUserList = async () => {
    setLoading(true);
    try {
      // ตัวอย่างการดึงข้อมูล sub_dealer หรือ network ต่าง ๆ
      // สมมติเรียก API getUserList()
      const response = await useServiceAPI.get(paths.pathMasterFarmer, {});
      if (response.status === 200) {
        const data = response.data || [];
        // แปลง data เป็นรูปที่ใช้ในตาราง
        const userListData = data.map((item, index) => ({
          key: item.farmer_id,
          no: index + 1,
          name: item.farmer_name,
          contactperson: item.farmer_contact_phone_number,
          status: (
            <BadgeStatus
              text={item.farmer_channel_type_name}
              bgColor={item.farmer_channel_type_bg_color}
              textColor={item.farmer_channel_type_color}
            />
          ),


        }));
        setUserList(userListData);
      }
    } catch (error) {
      console.error("fetchUserList error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันเพิ่มรายการลงในตาราง Network
  const handleAddSelectedRows = (selectedRows) => {
    if (!Array.isArray(selectedRows)) {
      console.error("selectedRows is not an array:", selectedRows);
      return;
    }
    const newRows = selectedRows.map((row) => ({
      key: row.key,
      no: networkList.length + 1,
      name: row.name || "-",
      contactperson: row.contactperson || "-",
      status: row.status || "-",
      action: (
        <DynamicButton
          iconSrc="/img/icons/delete.png"
          onClick={() => handleDeleteNetworkItem(row.key)}
        />
      ),
    }));

    // เช็คว่าเคยถูกเพิ่มแล้วหรือยัง
    setNetworkList((prev) => {
      const existingKeys = prev.map((item) => item.key);
      const filteredNewRows = newRows.filter(
        (row) => !existingKeys.includes(row.key)
      );
      if (filteredNewRows.length === 0) {
        showNotification("error", "This record has already been added.");
        return prev;
      }
      showNotification("success", "Add network success.");
      return [...prev, ...filteredNewRows];
    });
  };

  // ฟังก์ชันลบรายการในตาราง
  const handleDeleteNetworkItem = async (record) => {
    try {
      const requestData = {
        sub_dealer_id: location.state.id,
        farmer_id: record,
      };

      const response = await useServiceAPI.delete(
        paths.pathSubDealerDetailDeleteFarmer,
        requestData
      );

      if (response.status === 200) {
        await fetchSubDealerDetails(location.state.id);

        showNotification(
          "success",
          response.data.message,
          response.data.message_line
        );
      } else {
        console.error("Failed to delete record:", response.message);
        showNotification("error", response.message, response.message_line);
      }
    } catch (error) {
      console.error("Error deleting record:", error);

      showNotification("error", error.message, error.message_line);
    }
  };

  // เปิด/ปิด Modal
  const handleOpenTerritoryModal = async () => {
    await fetchUserList();
    setIsTerritoryModalVisible(true);
  };

  const handleCloseTerritoryModal = () => {
    setIsTerritoryModalVisible(false);
  };

  // ฟังก์ชันจัดการ Contact Person
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
          // หากเป็น date_of_birth ให้คำนวณอายุ
          if (field === "date_of_birth" && value) {
            const birthDate = dayjs(value);
            const currentYear = dayjs().year();
            updatedContact.age = currentYear - birthDate.year();
          }
          return updatedContact;
        }
        return contact;
      })
    );
  };

  const handleRemoveContact = (index) => {
    setContacts((prevContacts) => prevContacts.filter((_, i) => i !== index));
  };

  // แปลงตัวเลือกพืช (crops)
  const transformedCropOptions = cropOptions.map((option) => ({
    label: option.name,
    value: option.id,
  }));

  // Google Map
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
        // อัปเดตฟอร์ม
        form.setFieldsValue({ outlet_location: locationName });
        // อัปเดต state
        setcompanyinfo((prev) => ({
          ...prev,
          outlet_location: locationName,
        }));
        // ตั้งค่าพิกัดใหม่
        setCurrentLocation({ lat, lng });
        showNotification("success", `Location updated: ${locationName}`);
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

  // ฟังก์ชันบันทึกข้อมูล
  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const payload = {
          name: values.shop_name || "",
          mobile_phone: values.mobile_phone || "",
          address: values.address || "",
          email: values.email || "",
          day_of_week: values.day_of_week || "",
          start_time: values.start_time
            ? dayjs(values.start_time).format("HH:mm")
            : "",
          end_time: values.end_time
            ? dayjs(values.end_time).format("HH:mm")
            : "",
          business_size: values.business_size || "",
          outlet_location: values.outlet_location || "",
          location_longitude: currentLocation.lng || "",
          location_latitude: currentLocation.lat || "",
          location_address: values.outlet_location || "", // หรือใช้ location_address
          t_shirt_size: values.tshirt_size || "",
          anniversary: values.anniversary
            ? dayjs(values.anniversary).format("YYYY-MM-DD")
            : null,
          remark: values.remark || "",
          photo_path: values.profile,
          use_flag: 1, // กำหนดค่าเริ่มต้น
          fertilizer_business: values.fertilizer_business || "",
          seed_business: values.seed_business || "",
          pesticides_business: values.pesticides_business || "",
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
            hobby: contact.hobby || null,
            age: contact.age || null,
          })),
          crop_list: defaultSelectedCrops || [], // ใช้ crop_list เป็น array ของ id
        };
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

  // Get Current Location on mount
  useEffect(() => {
    handleGetLocation();
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



  const handleSaveEdit = () => {
    form
      .validateFields()
      .then((values) => {

        const payload = {
          id: location.state.id,
          name: values.shop_name || "",
          mobile_phone: values.mobile_phone || "",
          address: values.address || "",
          email: values.email || "",
          day_of_week: values.day_of_week || "",
          start_time: values.start_time
            ? dayjs(values.start_time).format("HH:mm")
            : "",
          end_time: values.end_time
            ? dayjs(values.end_time).format("HH:mm")
            : "",
          business_size: values.business_size || "",
          outlet_location: values.outlet_location || "",
          location_longitude: currentLocation.lng || "",
          location_latitude: currentLocation.lat || "",
          location_address: values.outlet_location || "", // หรือใช้ location_address
          t_shirt_size: values.tshirt_size || "",
          anniversary: values.anniversary
            ? dayjs(values.anniversary).format("YYYY-MM-DD")
            : null,
          remark: values.remark || "",
          photo_path: values.profile,
          use_flag: 1, // กำหนดค่าเริ่มต้น
          fertilizer_business: values.fertilizer_business || "",
          seed_business: values.seed_business || "",
          pesticides_business: values.pesticides_business || "",
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
            hobby: contact.hobby || null,
            age: contact.age || null,
          })),
          crop_list: defaultSelectedCrops || [], // ใช้ crop_list เป็น array ของ id
          network_list: networkList.map((item) => ({
            farmer_id: item.key, // ใช้ `key` เป็น `farmer_id`
            is_on_shop: true, // กำหนดค่าตามที่ต้องการ
          })),

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

  // ---------- เนื้อหาในแท็บ “Profile” ----------
  const profileTabContent = (
    <Form form={form} layout="vertical" component={false}>

      {/* <FormUser title="Personal Info" profile={profileImage} fields={formFields} form={form} /> */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
      ) : (
        <FormSubDealer
          title="Personal Info"
          profile={profileImage}
          fields={formFields}
          form={form}
        />
      )}

      <div
        className="bg-white p-4"
        style={{
          boxShadow: "rgba(0, 0, 0, 0.1)",
          marginTop: "-20px",
        }}
      >
        <div className="text-[#00783F] text-lg font-semibold mb-3">
          <div className="flex justify-end space-x-4 mb-2">
            <ActionButton
              text={isMapEnabled ? "Close Google" : "Open Google"}
              mode="update"
              // onClick={() => setIsMapEnabled((prev) => !prev)} 
              onClick={handleToggleMap}
            />
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
                    scaledSize: { width: 30, height: 30 },
                  }}
                  draggable={true}
                  onDragEnd={handleMarkerDragEnd}
                  options={{ disableDefaultUI: !isMapEnabled, draggable: isMapEnabled }}

                />
              )}
            </GoogleMap>
          </LoadScript>

          <Form.Item label="Remark" name="remark" className="mt-3">
            <Input placeholder="Enter Remark" />
          </Form.Item>
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
          disabled={isViewMode}
        />
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-lg font-semibold">
            Contact Person
          </span>
          {/* <ActionButton mode="add" text="Add" onClick={addContact} /> */}
          {!isViewMode && (
            <ActionButton mode="add" text="Add" onClick={addContact} />
          )}

        </div>
        {contacts.map((contact, index) => (
          <div key={index}>
            <div className="flex justify-between mb-4">
              <span className="text-[#00783F] text-md">{`Person ${index + 1
                }`}</span>
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
                  disabled={isViewMode}

                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Name (TH)"
                  value={contact.name_th}
                  onChange={(e) =>
                    updateContact(index, "name_th", e.target.value)
                  }
                  disabled={isViewMode}

                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Nickname"
                  value={contact.nickname}
                  onChange={(e) =>
                    updateContact(index, "nickname", e.target.value)
                  }
                  disabled={isViewMode}

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
                  disabled={isViewMode}

                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Age"
                  value={contact.age || ""}
                  onChange={(e) =>
                    updateContact(index, "age", e.target.value)
                  }
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
                  disabled={isViewMode}

                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Relationship"
                  value={contact.relationship}
                  onChange={(e) =>
                    updateContact(index, "relationship", e.target.value)
                  }
                  disabled={isViewMode}

                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Duty"
                  value={contact.duty}
                  onChange={(e) => updateContact(index, "duty", e.target.value)}
                  disabled={isViewMode}

                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Tel 1"
                  value={contact.tel1}
                  onChange={(e) => updateContact(index, "tel1", e.target.value)}
                  disabled={isViewMode}

                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Tel 2"
                  value={contact.tel2}
                  onChange={(e) => updateContact(index, "tel2", e.target.value)}
                  disabled={isViewMode}

                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Contact Number"
                  value={contact.contact_number}
                  onChange={(e) =>
                    updateContact(index, "contact_number", e.target.value)
                  }
                  disabled={isViewMode}

                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Email"
                  value={contact.email}
                  onChange={(e) => updateContact(index, "email", e.target.value)}
                  disabled={isViewMode}

                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Line ID"
                  value={contact.line_id}
                  onChange={(e) => updateContact(index, "line_id", e.target.value)}
                  disabled={isViewMode}

                />
              </Col>
              <Col xs={24} sm={18} md={18} lg={18}>
                <Input
                  placeholder="hobby"
                  value={contact.hobby || ""}
                  onChange={(e) => updateContact(index, "hobby", e.target.value)}
                  disabled={isViewMode}

                />
              </Col>
            </Row>
            {index < contacts.length - 1 && <hr className="my-4" />}
          </div>
        ))}
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/customer/sub-dealer")}
        />
        {mode === "Edit" ? (
          <ActionButton text="Edit" mode="save" onClick={handleSaveEdit} />
        ) : (
          <ActionButton text="Save" mode="save" onClick={handleSave} />
        )}

        {/* <ActionButton text="Save" mode="save" onClick={handleSave} /> */}
      </div>
    </Form>
  );

  // ---------- เนื้อหาในแท็บ “Network” ----------
  const FarmerhandleSave = () => {
    // Validate form fields if needed
    form
      .validateFields()
      .then(() => {
        const formattedData = {
          id: location.state.id,
          network_list: networkList.map((item) => ({
            farmer_id: item.key,
            is_on_shop: true,
          })),
        };

        useServiceAPI
          .put(paths.pathSubDealerDetailUpdateFarmer, formattedData) // paths.pathNetworkSave = URL API
          .then((response) => {
            if (response.status === 200) {
              navigate("/customer/sub-dealer");
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              );

            }
          })
          .catch((error) => {
            console.error("Save failed:", error);
          });
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };

  const networkTabContent = (
    <>
      <BoxPrimary>
        <div className="flex justify-between space-x-4 mb-3">
          <span className="text-[#00783F] text-lg font-semibold">Farmer</span>
          <ActionButton mode="add" text="Add" onClick={handleOpenTerritoryModal} />
        </div>
        <TableComponent header={networkHeader} dataSource={networkList} />
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/customer/sub-dealer")}
        />
        {mode !== "Create" && !isViewMode && (
          <ActionButton text="Update Farmer" mode="update" onClick={FarmerhandleSave} />
        )}
      </div>

    </>
  );



  return (
    <MainLayout loading={loading}>
      <div className="title-page">{isViewMode ? "View Sub Dealer" : isEditMode ? "Edit Sub Dealer" : "Create Sub Dealer"}</div>
      <Tabs
        activeKey={activeTabKey}
        onChange={handleTabChange}
        className="custom-tabs"
        items={[
          {
            key: "profile",
            label: <span className="tab-title">Profile</span>,
            children: profileTabContent,
          },
          {
            key: "network",
            label: <span className="tab-title">Farmer</span>,
            children: networkTabContent,
          },
        ]}
      />

      {/* DynamicModal สำหรับเลือก network เพิ่มเติม */}
      <DynamicModal
        title="Add Farmer"
        isVisible={isTerritoryModalVisible}
        onClose={handleCloseTerritoryModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          { title: "Name", dataIndex: "name", key: "name", width: 150 },
          { title: "Contact", dataIndex: "contactperson", key: "contactperson", width: 150 },
          { title: "Status", dataIndex: "status", key: "status", width: 120 },
        ]}
        dataSource={userList}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />
    </MainLayout>
  );
}
