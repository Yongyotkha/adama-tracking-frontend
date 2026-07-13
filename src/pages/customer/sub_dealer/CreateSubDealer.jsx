import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import DynamicButton from "../../../components/button/DynamicButton";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";
import { AuthContext } from "../../../contexts/AuthContext";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import {
  Input,
  DatePicker,
  Col,
  Row,
  Tabs,
  Form,
  Select,
} from "antd";
import dayjs from "dayjs";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import TableComponent from "../../../components/table/TableComponent";
import DynamicModal from "../../../components/modal/DynamicModal";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import FormSubDealer from "../../../components/form_user/FormSubDealer";

const { Option } = Select;

export default function CreateSubDealer() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useContext(AuthContext);

  // ---------- State ----------
  const [cropOptions, setCropOptions] = useState([]);
  const [form] = Form.useForm();
  const [defaultSelectedCrops, setDefaultSelectedCrops] = useState([]);
  const [dataApiKey] = useState("AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik");
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [companyinfo, setcompanyinfo] = useState({});
  const [currentLocation, setCurrentLocation] = useState({
    lat: 13.9572612,
    lng: 100.6222401,
  });
  const [dataMapZoom] = useState(15);
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
      hobby: "",
      age: null,
    },
  ]);
  const location = useLocation();
  const mode = location.state?.mode || "Create";
  const isViewMode = mode === "View";
  const isEditMode = mode === "Edit";
  const [profileImage, setProfileImage] = useState("");
  const [isMapEnabled, setIsMapEnabled] = useState(false);

  // Network / Farmer tab
  const [networkList, setNetworkList] = useState([]);
  const [isTerritoryModalVisible, setIsTerritoryModalVisible] = useState(false);
  const [userList, setUserList] = useState([]);

  const renderNetworkAction = (farmerId) =>
    !isViewMode && (
      <DynamicButton
        iconSrc="/img/icons/delete.png"
        onClick={() => handleDeleteNetworkItem(farmerId)}
      />
    );

  const normalizeNetworkList = (items = []) =>
    items.map((item, index) => ({
      ...item,
      no: index + 1,
      action: renderNetworkAction(item.key),
    }));

  const networkHeader = [
    { title: "No", dataIndex: "no", key: "no", width: 50, align: "center" },
    { title: "Name", dataIndex: "name", key: "name", width: 150 },
    {
      title: "Contact Person",
      dataIndex: "contactperson",
      key: "contactperson",
      width: 150,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 100,
      align: "center",
    },
  ];

  // ---------- โหลดข้อมูลเริ่มต้น ----------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (mode === "Edit" || mode === "View") {
          await fetchSubDealerDetails(location.state.id);
        }

        const [crops] = await Promise.all([
          useServiceAPI.get(paths.pathMasterCrop, {}),
        ]);
        setCropOptions(crops.data || []);
      } catch (error) {
        console.log(error.message);
        showNotification("error", "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mode, location.state, showNotification]);

  const fetchSubDealerDetails = async (id) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(
        `${paths.pathSubDealerDetail}?id=${id}`
      );

      if (response.status === 200) {
        const { data } = response;

        setProfileImage(data.photo_path || "");

        const lat = parseFloat(data.location_latitude) || 13.9572612;
        const lng = parseFloat(data.location_longitude) || 100.6222401;
        setCurrentLocation({ lat, lng });

        setcompanyinfo(data);

        // set form
        form.setFieldsValue({
          shop_name: data.name,
          mobile_phone: data.mobile_phone,
          address: data.address,
          email: data.email,
          day_of_week: data.day_of_week || [],
          start_time: data.start_time ? dayjs(data.start_time, "HH:mm") : null,
          end_time: data.end_time ? dayjs(data.end_time, "HH:mm") : null,
          remark: data.remark,
          outlet_location: data.location_address || data.outlet_location,
          fertilizer_business: data.fertilizer_business,
          seed_business: data.seed_business,
          pesticides_business: data.pesticides_business,
          tshirt_size: data.t_shirt_size,
          target_group: data.target_group
            ? Number(data.target_group)
            : undefined,
          use_flag: data.use_flag ? Number(data.use_flag) : 1,
        });

        // crop list
        const cropIds =
          (data.crop_list || []).map((crop) => Number(crop.id)) || [];
        setDefaultSelectedCrops(cropIds);

        // farmer network
        const farmers =
          (data.network_farmer_list || []).map((farmer, index) => ({
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
            action: renderNetworkAction(farmer.farmer_id),
          })) || [];
        setNetworkList(normalizeNetworkList(farmers));

        // contact_items
        const contactList =
          (data.contact_items || []).map((item) => ({
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
            age: item.age || null,
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

  // ---------- Tabs ----------
  const [activeTabKey, setActiveTabKey] = useState("profile");
  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };

  // ---------- ฟิลด์ในฟอร์ม (ส่งเข้า FormSubDealer) ----------
  const formFields = [
    {
      label: "",
      name: "profile",
      type: "picture",
      required: false,
      col: 24,
      disabled: isViewMode,
    },
    {
      label: "Sub Dealer Name",
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
      col: 12,
      iconSrc: "/img/icons/calendar.png",
      iconPosition: "right",
      disabled: isViewMode,
    },
    {
      label: "Customer Group",
      name: "target_group",
      type: "select",
      options: [
        { name: "Push", id: 3, selected: false },
        { name: "Pull", id: 4, selected: false },
        { name: "หน้าร้าน", id: 5, selected: false },
      ],
      required: true,
      col: 6,
      iconSrc: "/img/icons/user.png",
      iconPosition: "right",
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
      label: "T-Shirt Size",
      name: "tshirt_size",
      type: "text",
      required: false,
      col: 6,
      value: companyinfo.t_shirt_size,
      disabled: isViewMode,
    },
    {
      label: "Fertilizer Business",
      name: "fertilizer_business",
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
      options: [{ name: "New", id: 1, selected: true }],
      value: companyinfo.use_flag || 1,
      disabled: isViewMode,
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
  ];

  // ---------- Farmer Modal ----------
  const fetchUserList = async () => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathMasterFarmer, {});
      if (response.status === 200) {
        const data = response.data || [];
        const userListData = data.map((item, index) => ({
          key: item.farmer_id,
          no: index + 1,
          farmer_name: item.farmer_name || "-",
          farm_name: item.farm_name || "-",
          nickname: item.nickname || "-",
          farmer_contact_phone_number: String(
            item.farmer_contact_phone_number || ""
          ),
          farmer_channel_type_name: item.farmer_channel_type_name,
          farmer_channel_type_bg_color: item.farmer_channel_type_bg_color,
          farmer_channel_type_color: item.farmer_channel_type_color,
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

  const handleAddSelectedRows = (selectedRows) => {
    if (!Array.isArray(selectedRows)) return;

    const newRows = selectedRows.map((row) => ({
      key: row.key,
      name: row.farmer_name || "-",
      contactperson: row.farmer_contact_phone_number || "-",
      status: row.status || "-",
      action: renderNetworkAction(row.key),
    }));

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
      return normalizeNetworkList([...prev, ...filteredNewRows]);
    });
  };

  const handleDeleteNetworkItem = async (record) => {
    setNetworkList((prev) =>
      normalizeNetworkList(prev.filter((item) => item.key !== record))
    );

    // Keep the old API delete flow below for reference only.
    // Farmer rows are now removed on the client and persisted
    // when the user clicks "Update Farmer".
    return;

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
        showNotification("error", response.message, response.message_line);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      showNotification("error", "เกิดข้อผิดพลาด");
    }
  };

  const handleOpenTerritoryModal = async () => {
    await fetchUserList();
    setIsTerritoryModalVisible(true);
  };

  const handleCloseTerritoryModal = () => {
    setIsTerritoryModalVisible(false);
  };

  // ---------- Contact Person ----------
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
        hobby: "",
        age: null,
      },
    ]);
  };

  const updateContact = (index, field, value) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact, i) => {
        if (i === index) {
          const updatedContact = { ...contact, [field]: value };
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

  // ---------- Crop options ----------
  const transformedCropOptions = cropOptions.map((option) => ({
    label: option.name,
    value: option.id,
  }));

  // ---------- Google Map ----------
  const mapContainerStyle = {
    width: "100%",
    height: "30vh",
  };

  const handleMarkerDragEnd = async (event) => {
    if (!event.latLng) return;
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };
    try {
      const response = await geocoder.geocode({ location: latlng });
      if (response.results && response.results.length > 0) {
        const locationName = response.results[0].formatted_address;
        form.setFieldsValue({ outlet_location: locationName });
        setcompanyinfo((prev) => ({
          ...prev,
          outlet_location: locationName,
        }));
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

  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      showNotification("error", "Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });

        try {
          const geocoder = new window.google.maps.Geocoder();
          const latlng = { lat: latitude, lng: longitude };
          const response = await geocoder.geocode({ location: latlng });
          if (response.results && response.results.length > 0) {
            const locationName = response.results[0].formatted_address;
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
      if (newState && mode === "Create") {
        getUserCurrentLocation();
      }
      return newState;
    });
  };

  const handleGetLocationToGoogleMap = () => {
    if (currentLocation.lat && currentLocation.lng) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLocation.lat},${currentLocation.lng}`;
      window.open(googleMapsUrl, "_blank");
    } else {
      showNotification("error", "No latitude and longitude data available.");
    }
  };

  // ---------- Save (Create) ----------
  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const payload = {
          name: values.shop_name || "",
          mobile_phone: values.mobile_phone || "",
          address: values.address || "",
          email: values.email || "",
          day_of_week: values.day_of_week || [],
          target_group: values.target_group || null,
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
          location_address: values.outlet_location || "",
          t_shirt_size: values.tshirt_size || "",
          anniversary: values.anniversary
            ? dayjs(values.anniversary).format("YYYY-MM-DD")
            : null,
          remark: values.remark || "",
          photo_path: values.profile || profileImage || "",
          use_flag: values.use_flag || 1,
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
          crop_list: defaultSelectedCrops || [],
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

  // ---------- Save (Edit) ----------
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
          day_of_week: values.day_of_week || [],
          target_group: values.target_group || null,
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
          location_address: values.outlet_location || "",
          t_shirt_size: values.tshirt_size || "",
          anniversary: values.anniversary
            ? dayjs(values.anniversary).format("YYYY-MM-DD")
            : null,
          remark: values.remark || "",
          photo_path: values.profile || profileImage || "",
          use_flag: values.use_flag || 1,
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
          crop_list: defaultSelectedCrops || [],
          network_list: networkList.map((item) => ({
            farmer_id: item.key,
            is_on_shop: true,
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

  // ---------- Save เฉพาะ Farmer (Network tab) ----------
  const FarmerhandleSave = () => {
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
          .put(paths.pathSubDealerDetailUpdateFarmer, formattedData)
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

  // ---------- Profile Tab ----------
  const profileTabContent = (
    <Form form={form} layout="vertical" component={false}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
      ) : (
        <FormSubDealer
          title="Personal Info"
          profile={profileImage}
          fields={formFields}
          form={form}
          disableImageUpload={isViewMode}
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
          <div className="flex justify-end space-x-2 mb-2">
            {!isViewMode && (
              <ActionButton
                text={isMapEnabled ? "Close Google" : "Open Google"}
                mode="custom"
                onClick={handleToggleMap}
                className={isMapEnabled ? "bg-[#f11113]" : "bg-[#00783F]"}
              />
            )}

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
                if (!e.latLng || !isMapEnabled) return;
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setCurrentLocation({ lat, lng });
              }}
            >
              {isGoogleLoaded && (
                <Marker
                  position={currentLocation}
                  draggable={isMapEnabled}
                  onDragEnd={handleMarkerDragEnd}
                />
              )}
            </GoogleMap>
          </LoadScript>

          <Form.Item label="Remark" name="remark" className="mt-3">
            <Input placeholder="Enter Remark" disabled={isViewMode} />
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
          {!isViewMode && (
            <ActionButton mode="add" text="Add" onClick={addContact} />
          )}
        </div>
        {contacts.map((contact, index) => (
          <div key={index}>
            <div className="flex justify-between mb-4">
              <span className="text-[#00783F] text-md">{`Person ${
                index + 1
              }`}</span>
              {index > 0 && !isViewMode && (
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
                  disabled
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
                  onChange={(e) =>
                    updateContact(index, "duty", e.target.value)
                  }
                  disabled={isViewMode}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Tel 1"
                  value={contact.tel1}
                  onChange={(e) =>
                    updateContact(index, "tel1", e.target.value)
                  }
                  disabled={isViewMode}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Tel 2"
                  value={contact.tel2}
                  onChange={(e) =>
                    updateContact(index, "tel2", e.target.value)
                  }
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
                  onChange={(e) =>
                    updateContact(index, "email", e.target.value)
                  }
                  disabled={isViewMode}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Line ID"
                  value={contact.line_id}
                  onChange={(e) =>
                    updateContact(index, "line_id", e.target.value)
                  }
                  disabled={isViewMode}
                />
              </Col>
              <Col xs={24} sm={18} md={18} lg={18}>
                <Input
                  placeholder="Hobby"
                  value={contact.hobby || ""}
                  onChange={(e) =>
                    updateContact(index, "hobby", e.target.value)
                  }
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

        {mode === "Edit" && (
          <ActionButton text="Update" mode="save" onClick={handleSaveEdit} />
        )}

        {mode === "Create" && (
          <ActionButton text="Save" mode="save" onClick={handleSave} />
        )}
      </div>
    </Form>
  );

  // ---------- Network Tab ----------
  const networkTabContent = (
    <>
      <BoxPrimary>
        <div className="flex justify-between space-x-4 mb-3">
          <span className="text-[#00783F] text-lg font-semibold">Farmer</span>
          {!isViewMode && (
            <ActionButton
              mode="add"
              text="Add"
              onClick={handleOpenTerritoryModal}
            />
          )}
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
          <ActionButton
            text="Update Farmer"
            mode="update"
            onClick={FarmerhandleSave}
          />
        )}
      </div>
    </>
  );

  return (
    <MainLayout loading={loading}>
      <div className="title-page">
        {isViewMode
          ? "View Sub Dealer"
          : isEditMode
          ? "Edit Sub Dealer"
          : "Create Sub Dealer"}
      </div>
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

      <DynamicModal
        title="Add Farmer"
        isVisible={isTerritoryModalVisible}
        onClose={handleCloseTerritoryModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          {
            title: "Farmer Name",
            dataIndex: "farmer_name",
            key: "farmer_name",
            width: 150,
          },
          {
            title: "Farm Name",
            dataIndex: "farm_name",
            key: "farm_name",
            width: 150,
          },
          {
            title: "Nick Name",
            dataIndex: "nickname",
            key: "nickname",
            width: 150,
          },
          {
            title: "Contact",
            dataIndex: "farmer_contact_phone_number",
            key: "farmer_contact_phone_number",
            width: 150,
          },
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
