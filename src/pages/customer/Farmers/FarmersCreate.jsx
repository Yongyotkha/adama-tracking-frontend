import React, { useContext, useEffect, useMemo, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Tabs,
  Upload,
  Collapse,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  EditOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import dayjs from "dayjs";

const { Panel } = Collapse;

const MONTHS = [
  { key: "jan", label: "Jan." },
  { key: "feb", label: "Feb." },
  { key: "mar", label: "Mar." },
  { key: "apr", label: "Apr." },
  { key: "may", label: "May" },
  { key: "jun", label: "Jun." },
  { key: "jul", label: "Jul" },
  { key: "aug", label: "Aug." },
  { key: "sept", label: "Sept." },
  { key: "oct", label: "Oct." },
  { key: "nov", label: "Nov." },
  { key: "dec", label: "Dec." },
];

const DEFAULT_CALENDAR = [
  { crop: "Rice (นาปรัง)", stage: "Sowing" },
  { crop: "Rice (นาปรัง)", stage: "Harvesting" },
  { crop: "Rice (นาปี)", stage: "Sowing" },
  { crop: "Rice (นาปี)", stage: "Harvesting" },
  { crop: "Fruit", stage: "Flowering" },
  { crop: "Fruit", stage: "Fruiting" },
  { crop: "Fruit", stage: "Harvesting" },
  { crop: "Sugarcane", stage: "Planting" },
  { crop: "Sugarcane", stage: "Harvesting" },
  { crop: "Pineapple", stage: "Planting" },
  { crop: "Pineapple", stage: "Harvesting" },
  { crop: "Vegetable", stage: "Planting" },
  { crop: "Vegetable", stage: "Harvesting" },
  { crop: "Corn", stage: "Planting" },
  { crop: "Corn", stage: "Harvesting" },
];

export default function FarmersCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg, showNotification } = useContext(AuthContext);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const mode = location.state?.mod || "create";
  const isViewMode = mode === "View";
  const farmerId = location.state?.id;

  const [cropOptions, setCropOptions] = useState([]);
  const [mainCrop, setMainCrop] = useState(undefined);
  const [farmSizeRows, setFarmSizeRows] = useState([
    { key: 1, crop_id: undefined, farm_size: "" },
  ]);

  const [profileImage, setProfileImage] = useState("/img/profile.jpg");
  const [galleryItems, setGalleryItems] = useState([]);
  const [contacts, setContacts] = useState([
    {
      name_th: "",
      nickname: "",
      name_en: "",
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

  const [cropCalendar, setCropCalendar] = useState(
    DEFAULT_CALENDAR.map((row, index) => ({
      id: index + 1,
      crop: row.crop,
      stage: row.stage,
      months: {},
    }))
  );

  const [homeLocation, setHomeLocation] = useState({
    lat: 13.9572612,
    lng: 100.6222401,
    address: "",
  });

  const [farmLocation, setFarmLocation] = useState({
    lat: 13.9572612,
    lng: 100.6222401,
    address: "",
  });

  const dataApiKey = "AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik";

  const cropSelectOptions = useMemo(
    () =>
      cropOptions.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    [cropOptions]
  );

  const mapContainerStyle = {
    width: "100%",
    height: "130px",
  };

  const normalizeDate = (value) => {
    if (!value) return null;
    return dayjs(value).isValid() ? dayjs(value) : null;
  };

  const getCropName = (cropId) => {
    const found = cropOptions.find((item) => String(item.id) === String(cropId));
    return found?.name || "";
  };
  const DEFAULT_STAGE_BY_CROP = {
    Rice: ["Sowing", "Harvesting"],
    Fruits: ["Flowering", "Fruiting", "Harvesting"],
    Fruit: ["Flowering", "Fruiting", "Harvesting"],
    Sugarcane: ["Planting", "Harvesting"],
    Vegetable: ["Planting", "Harvesting"],
    Pineapple: ["Planting", "Harvesting"],
    Corn: ["Planting", "Harvesting"],
    Other: ["Planting", "Harvesting"],
    Office: ["Activity"],
  };

  const getStagesByCropName = (cropName) => {
    return DEFAULT_STAGE_BY_CROP[cropName] || ["Planting", "Harvesting"];
  };

  const cropCalendarRows = useMemo(() => {
    const uniqueCropIds = [
      ...new Set(
        farmSizeRows
          .map((item) => item.crop_id)
          .filter((cropId) => cropId !== undefined && cropId !== null && cropId !== "")
      ),
    ];

    return uniqueCropIds.flatMap((cropId) => {
      const cropName = getCropName(cropId);
      const stages = getStagesByCropName(cropName);

      return stages.map((stage) => {
        const existing = cropCalendar.find(
          (item) =>
            String(item.crop_id) === String(cropId) &&
            String(item.stage) === String(stage)
        );

        return {
          id: `${cropId}-${stage}`,
          crop_id: cropId,
          crop: cropName,
          stage,
          months: existing?.months || {},
        };
      });
    });
  }, [farmSizeRows, cropOptions, cropCalendar]);

  const geocodeLatLng = async (lat, lng) => {
    if (!window.google?.maps) return "";
    const geocoder = new window.google.maps.Geocoder();
    const res = await geocoder.geocode({ location: { lat, lng } });
    return res?.results?.[0]?.formatted_address || "";
  };

  const updateMapLocation = async (type, lat, lng) => {
    try {
      const address = await geocodeLatLng(lat, lng);

      if (type === "home") {
        setHomeLocation({ lat, lng, address });
        form.setFieldsValue({ home_location: address });
      } else {
        setFarmLocation({ lat, lng, address });
        form.setFieldsValue({ farm_location: address });
      }
    } catch (error) {
      showNotification("error", "Unable to fetch location name.");
    }
  };

  const openGoogleMap = (locationData) => {
    if (!locationData?.lat || !locationData?.lng) {
      showNotification("error", "No latitude and longitude data available.");
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${locationData.lat},${locationData.lng}`,
      "_blank"
    );
  };

  const fetchFarmersDetails = async (id) => {
    try {
      const response = await useServiceAPI.get(
        `${paths.pathCustomerFarmersDetail}?id=${id}`
      );

      if (response.status !== 200) return;

      const data = response.data || {};

      setProfileImage(data.photo_path || "/img/profile.jpg");

      form.setFieldsValue({
        farm_name: data.name || "",
        prefix: data.prefix || undefined,
        name_th: data.name_th || "",
        nickname: data.nickname || "",
        est_input: data.est_input || "",
        address: data.address || "",
        date_of_birth: normalizeDate(data.date_of_birth),
        mobile_phone: data.mobile_phone || "",
        line_id: data.line_id || "",
        t_shirt_size: data.t_shirt_size || "",
        email: data.email || "",
        remark: data.remark || "",
        other_equipment: data.other_equipment || "",
        home_location: data.home_location_address || data.location_address || "",
        farm_location: data.farm_location_address || "",
      });

      setHomeLocation({
        lat: Number(data.home_location_latitude || data.location_latitude) || 13.9572612,
        lng: Number(data.home_location_longitude || data.location_longitude) || 100.6222401,
        address: data.home_location_address || data.location_address || "",
      });

      setFarmLocation({
        lat: Number(data.farm_location_latitude) || 13.9572612,
        lng: Number(data.farm_location_longitude) || 100.6222401,
        address: data.farm_location_address || "",
      });

      setMainCrop(data.main_crop_id || data.main_crop || undefined);

      setFarmSizeRows(
        Array.isArray(data.farm_size_items) && data.farm_size_items.length > 0
          ? data.farm_size_items.map((item, index) => ({
            key: index + 1,
            crop_id: item.crop_id,
            farm_size: item.farm_size,
          }))
          : [{ key: 1, crop_id: undefined, farm_size: "" }]
      );

      setContacts(
        Array.isArray(data.contact_items) && data.contact_items.length > 0
          ? data.contact_items.map((item) => ({
            name_th: item.name_th || "",
            nickname: item.nickname || "",
            name_en: item.name_en || "",
            date_of_birth: normalizeDate(item.date_of_birth),
            t_shirt_size: item.t_shirt_size || "",
            relationship: item.relationship || "",
            duty: item.duty || "",
            tel1: item.tel1 || "",
            tel2: item.tel2 || "",
            contact_number: item.contact_number || "",
            email: item.email || "",
            line_id: item.line_id || "",
          }))
          : contacts
      );

      setGalleryItems(Array.isArray(data.gallery_items) ? data.gallery_items : []);

      if (Array.isArray(data.crop_calendar_items) && data.crop_calendar_items.length > 0) {
        setCropCalendar(data.crop_calendar_items);
      }
    } catch (error) {
      showNotification("error", "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [crops] = await Promise.all([
          useServiceAPI.get(paths.pathMasterCrop, {}),
        ]);

        setCropOptions(Array.isArray(crops.data) ? crops.data : []);

        if ((mode === "Edit" || mode === "View") && farmerId) {
          await fetchFarmersDetails(farmerId);
        }
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addContact = () => {
    setContacts((prev) => [
      ...prev,
      {
        name_th: "",
        nickname: "",
        name_en: "",
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
    setContacts((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeContact = (index) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const addFarmSizeRow = () => {
    setFarmSizeRows((prev) => [
      ...prev,
      { key: prev.length + 1, crop_id: undefined, farm_size: "" },
    ]);
  };
  const removeFarmSizeRow = (key) => {
    const row = farmSizeRows.find((r) => r.key === key);

    setFarmSizeRows((prev) =>
      prev
        .filter((item) => item.key !== key)
        .map((item, index) => ({
          ...item,
          key: index + 1,
        }))
    );

    if (row?.crop_id) {
      setCropCalendar((prev) =>
        prev.filter((item) => String(item.crop_id) !== String(row.crop_id))
      );
    }
  };

  const updateFarmSizeRow = (key, field, value) => {
    setFarmSizeRows((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  };

  const toggleCalendarMonth = (rowId, monthKey, checked) => {
    setCropCalendar((prev) => {
      const exists = prev.some((item) => String(item.id) === String(rowId));

      if (exists) {
        return prev.map((item) =>
          String(item.id) === String(rowId)
            ? {
              ...item,
              months: {
                ...(item.months || {}),
                [monthKey]: checked,
              },
            }
            : item
        );
      }

      const row = cropCalendarRows.find((item) => String(item.id) === String(rowId));

      if (!row) return prev;

      return [
        ...prev,
        {
          ...row,
          months: {
            ...(row.months || {}),
            [monthKey]: checked,
          },
        },
      ];
    });
  };
  const beforeUploadGallery = (file) => {
    const preview = URL.createObjectURL(file);

    setGalleryItems((prev) => [
      ...prev,
      {
        year: dayjs().year(),
        file,
        url: preview,
        name: file.name,
      },
    ]);

    return false;
  };

  const handleSave = () => {
    form
      .validateFields()
      .then(async (values) => {
        const selectedEquipment = values.equipment_on_hand || [];

        const payload = {
          id: farmerId,
          photo_path: values.profile || profileImage,
          name: values.farm_name || "",
          farm_name: values.farm_name || "",
          prefix: values.prefix || "",
          name_th: values.name_th || "",
          nickname: values.nickname || "",
          est_input: values.est_input || "",
          address: values.address || "",
          date_of_birth: values.date_of_birth
            ? dayjs(values.date_of_birth).format("YYYY-MM-DD")
            : null,
          mobile_phone: values.mobile_phone || "",
          line_id: values.line_id || "",
          t_shirt_size: values.t_shirt_size || "",
          email: values.email || "",
          remark: values.remark || "",
          equipment_on_hand: selectedEquipment,
          other_equipment: values.other_equipment || "",

          home_location_address: values.home_location || homeLocation.address || "",
          home_location_latitude: homeLocation.lat || "",
          home_location_longitude: homeLocation.lng || "",

          farm_location_address: values.farm_location || farmLocation.address || "",
          farm_location_latitude: farmLocation.lat || "",
          farm_location_longitude: farmLocation.lng || "",

          main_crop_id: mainCrop || "",
          main_crop_name: getCropName(mainCrop),
          crop_list: mainCrop ? [mainCrop] : [],

          farm_size_items: farmSizeRows.map((item) => ({
            crop_id: item.crop_id || "",
            crop_name: getCropName(item.crop_id),
            farm_size: item.farm_size || "",
          })),

          contact_items: contacts.map((item) => ({
            name_th: item.name_th || "",
            nickname: item.nickname || "",
            name_en: item.name_en || "",
            date_of_birth: item.date_of_birth
              ? dayjs(item.date_of_birth).format("YYYY-MM-DD")
              : null,
            t_shirt_size: item.t_shirt_size || "",
            relationship: item.relationship || "",
            duty: item.duty || "",
            tel1: item.tel1 || "",
            tel2: item.tel2 || "",
            contact_number: item.contact_number || "",
            email: item.email || "",
            line_id: item.line_id || "",
          })),

          crop_calendar_items: cropCalendarRows,
          gallery_items: galleryItems.map((item) => ({
            year: item.year,
            name: item.name || "",
            url: item.url || item.path || "",
          })),
        };

        setLoading(true);

        const response =
          mode === "create"
            ? await useServiceAPI.post(paths.pathCustomerFarmersCreate, payload)
            : await useServiceAPI.put(paths.pathCustomerFarmersUpdate, payload);

        if (response.status === 200) {
          navigate("/customer/farmers");
          showNotification(
            "success",
            response.data.message,
            response.data.message_line
          );
        }
      })
      .catch((error) => {
        console.error("Validation Failed:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const profileTab = (
    <>
      <BoxPrimary title="Personal Info">
        <Row gutter={[16, 12]}>
          <Col span={24}>
            <div className="flex items-center gap-4">
              <img
                src={profileImage}
                alt="profile"
                className="w-16 h-16 rounded-full object-cover"
              />
              {!isViewMode && (
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const preview = URL.createObjectURL(file);
                    setProfileImage(preview);
                    form.setFieldsValue({ profile: preview });
                    return false;
                  }}
                >
                  <Button icon={<EditOutlined />}>Change Photo</Button>
                </Upload>
              )}
            </div>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Farm Name" name="farm_name">
              <Input disabled={isViewMode} placeholder="Farm Name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={4} >
            <Form.Item label="Pre Fix" name="prefix">
              <Select disabled={isViewMode} placeholder="select">
                <Select.Option value="Mr.">Mr.</Select.Option>
                <Select.Option value="Mrs.">Mrs.</Select.Option>
                <Select.Option value="Ms.">Ms.</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Form.Item label="Name (TH)" name="name_th">
              <Input disabled={isViewMode} placeholder="Name - Surname (TH)" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Form.Item label="Nickname" name="nickname">
              <Input disabled={isViewMode} placeholder="Nickname" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Est Input (Baht / Year)" name="est_input">
              <Input disabled={isViewMode} placeholder="Est Input (Baht / Year)" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Address" name="address">
              <Input disabled={isViewMode} placeholder="Address" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Date of Birth" name="date_of_birth">
              <DatePicker className="w-full" disabled={isViewMode} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Mobile Phone" name="mobile_phone">
              <Input disabled={isViewMode} placeholder="Mobile Phone" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Line ID" name="line_id">
              <Input disabled={isViewMode} placeholder="Line ID" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="T-Shirt Size" name="t_shirt_size">
              <Input disabled={isViewMode} placeholder="T-Shirt Size" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Email" name="email">
              <Input disabled={isViewMode} placeholder="Email" />
            </Form.Item>
          </Col>

          <Col xs={24} md={16}>
            <Form.Item label="Remark" name="remark">
              <Input disabled={isViewMode} placeholder="Remark" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Equipment On Hand" name="equipment_on_hand">
              <Checkbox.Group disabled={isViewMode}>
                <Checkbox value="Tractor">Tractor</Checkbox>
                <Checkbox value="Sprayer">Sprayer</Checkbox>
                <Checkbox value="Harvester">Harvester</Checkbox>
                <Checkbox value="Drone">Drone</Checkbox>
                <Checkbox value="Other">Other</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="other_equipment">
              <Input disabled={isViewMode} placeholder="Other Equipment" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Home Location" name="home_location">
              <Input
                disabled={isViewMode}
                placeholder="Location"
                suffix={<EnvironmentOutlined />}
              />
            </Form.Item>

            <div className="flex justify-end mb-2">
              <Button
                type="primary"
                className="bg-[#00783F]"
                onClick={() => openGoogleMap(homeLocation)}
              >
                Open Google
              </Button>
            </div>

            <LoadScript googleMapsApiKey={dataApiKey}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={homeLocation}
                zoom={8}
                onClick={(e) => {
                  if (isViewMode) return;
                  updateMapLocation("home", e.latLng.lat(), e.latLng.lng());
                }}
              >
                <Marker
                  position={homeLocation}
                  draggable={!isViewMode}
                  onDragEnd={(e) =>
                    updateMapLocation("home", e.latLng.lat(), e.latLng.lng())
                  }
                />
              </GoogleMap>
            </LoadScript>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Farm Location" name="farm_location">
              <Input
                disabled={isViewMode}
                placeholder="Location"
                suffix={<EnvironmentOutlined />}
              />
            </Form.Item>

            <div className="flex justify-end mb-2">
              <Button
                type="primary"
                className="bg-[#00783F]"
                onClick={() => openGoogleMap(farmLocation)}
              >
                Open Google
              </Button>
            </div>

            <LoadScript googleMapsApiKey={dataApiKey}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={farmLocation}
                zoom={8}
                onClick={(e) => {
                  if (isViewMode) return;
                  updateMapLocation("farm", e.latLng.lat(), e.latLng.lng());
                }}
              >
                <Marker
                  position={farmLocation}
                  draggable={!isViewMode}
                  onDragEnd={(e) =>
                    updateMapLocation("farm", e.latLng.lat(), e.latLng.lng())
                  }
                />
              </GoogleMap>
            </LoadScript>
          </Col>
        </Row>
      </BoxPrimary>

      <BoxPrimary title="Crop">
        <Select
          showSearch
          placeholder="Main Crop"
          className="w-full"
          value={mainCrop}
          onChange={setMainCrop}
          options={cropSelectOptions}
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
          <div key={index} className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-[#00783F] text-md">Person {index + 1}</span>
              {!isViewMode && index > 0 && (
                <ActionButton
                  mode="delete"
                  text="Delete"
                  onClick={() => removeContact(index)}
                />
              )}
            </div>

            <Row gutter={[16, 12]}>
              <Col xs={24} md={6}>
                <Input
                  placeholder="Name (TH)"
                  value={contact.name_th}
                  disabled={isViewMode}
                  onChange={(e) => updateContact(index, "name_th", e.target.value)}
                />
              </Col>

              <Col xs={24} md={6}>
                <Input
                  placeholder="Nickname"
                  value={contact.nickname}
                  disabled={isViewMode}
                  onChange={(e) =>
                    updateContact(index, "nickname", e.target.value)
                  }
                />
              </Col>

              <Col xs={24} md={6}>
                <Input
                  placeholder="Name (EN)"
                  value={contact.name_en}
                  disabled={isViewMode}
                  onChange={(e) => updateContact(index, "name_en", e.target.value)}
                />
              </Col>

              <Col xs={24} md={6}>
                <DatePicker
                  className="w-full"
                  placeholder="Date of Birth"
                  value={contact.date_of_birth}
                  disabled={isViewMode}
                  onChange={(date) =>
                    updateContact(index, "date_of_birth", date)
                  }
                />
              </Col>

              <Col xs={24} md={6}>
                <Input
                  placeholder="T-Shirt Size"
                  value={contact.t_shirt_size}
                  disabled={isViewMode}
                  onChange={(e) =>
                    updateContact(index, "t_shirt_size", e.target.value)
                  }
                />
              </Col>

              <Col xs={24} md={6}>
                <Input
                  placeholder="Relationship"
                  value={contact.relationship}
                  disabled={isViewMode}
                  onChange={(e) =>
                    updateContact(index, "relationship", e.target.value)
                  }
                />
              </Col>

              <Col xs={24} md={6}>
                <Input
                  placeholder="Duty"
                  value={contact.duty}
                  disabled={isViewMode}
                  onChange={(e) => updateContact(index, "duty", e.target.value)}
                />
              </Col>

              <Col xs={24} md={6}>
                <Input
                  placeholder="Tel 1"
                  value={contact.tel1}
                  disabled={isViewMode}
                  onChange={(e) => updateContact(index, "tel1", e.target.value)}
                />
              </Col>

              <Col xs={24} md={6}>
                <Input
                  placeholder="Tel 2"
                  value={contact.tel2}
                  disabled={isViewMode}
                  onChange={(e) => updateContact(index, "tel2", e.target.value)}
                />
              </Col>

              <Col xs={24} md={6}>
                <Input
                  placeholder="Contact Number"
                  value={contact.contact_number}
                  disabled={isViewMode}
                  onChange={(e) =>
                    updateContact(index, "contact_number", e.target.value)
                  }
                />
              </Col>

              <Col xs={24} md={6}>
                <Input
                  placeholder="Email"
                  value={contact.email}
                  disabled={isViewMode}
                  onChange={(e) => updateContact(index, "email", e.target.value)}
                />
              </Col>

              <Col xs={24} md={6}>
                <Input
                  placeholder="Line ID"
                  value={contact.line_id}
                  disabled={isViewMode}
                  onChange={(e) => updateContact(index, "line_id", e.target.value)}
                />
              </Col>
            </Row>
          </div>
        ))}
      </BoxPrimary>
    </>
  );

  const galleryTab = (
    <BoxPrimary title="Gallery">
      <div className="flex justify-end mb-3">
        {!isViewMode && (
          <Upload showUploadList={false} beforeUpload={beforeUploadGallery}>
            <Button
              type="primary"
              className="bg-[#00783F]"
              icon={<UploadOutlined />}
            >
              Upload File
            </Button>
          </Upload>
        )}
      </div>

      <Collapse defaultActiveKey={[String(dayjs().year())]}>
        {[2026, 2025, 2024].map((year) => {
          const images = galleryItems.filter(
            (item) => String(item.year) === String(year)
          );

          return (
            <Panel header={`Year ${year}`} key={String(year)}>
              <div className="text-[#00783F] text-lg mb-2">Picture</div>

              <div className="flex flex-wrap gap-3">
                {images.length > 0 ? (
                  images.map((item, index) => (
                    <img
                      key={`${year}-${index}`}
                      src={item.url || item.path}
                      alt={item.name || "gallery"}
                      className="w-32 h-24 object-cover rounded shadow"
                    />
                  ))
                ) : (
                  <div className="text-gray-400">No data</div>
                )}
              </div>
            </Panel>
          );
        })}
      </Collapse>
    </BoxPrimary>
  );

  const farmSizeCalendarTab = (
    <>
      <BoxPrimary title="Farm Size">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-12 bg-[#00783F] text-white px-3 py-2 rounded-t font-semibold">
              <div className="col-span-6">Crop</div>
              <div className="col-span-5">Farm Size (ไร่)</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {farmSizeRows.map((item) => (
              <div
                key={item.key}
                className="grid grid-cols-12 gap-3 py-2 items-center border-b border-gray-100"
              >
                <div className="col-span-6">
                  <Select
                    className="w-full"
                    placeholder="Crop"
                    value={item.crop_id}
                    options={cropSelectOptions}
                    disabled={isViewMode}
                    onChange={(value) =>
                      updateFarmSizeRow(item.key, "crop_id", value)
                    }
                  />
                </div>

                <div className="col-span-5">
                  <Input
                    className="w-full"
                    placeholder="Farm Size"
                    value={item.farm_size}
                    disabled={isViewMode}
                    onChange={(e) =>
                      updateFarmSizeRow(item.key, "farm_size", e.target.value)
                    }
                  />
                </div>

                <div className="col-span-1 flex justify-center items-center">
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={() => removeFarmSizeRow(item.key)}
                      className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 mr-6"
                    >
                      <img
                        src="/img/icons/delete-file.png"
                        alt="delete"
                        className="w-6 h-6"
                      />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isViewMode && (
          <Button
            className="mt-3"
            icon={<PlusOutlined />}
            onClick={addFarmSizeRow}
          >
            Add Farm Size
          </Button>
        )}
      </BoxPrimary>

      <BoxPrimary title="Crop Calendar">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-[#00783F] text-white">
                <th className="p-2 text-left w-[140px]">Crop</th>
                <th className="p-2 text-left w-[140px]">Stage</th>
                {MONTHS.map((m) => (
                  <th key={m.key} className="p-2 text-center w-[70px]">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {cropCalendarRows.length > 0 ? (
                cropCalendarRows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100">
                    <td className="p-2">{row.crop}</td>
                    <td className="p-2">{row.stage}</td>

                    {MONTHS.map((m) => (
                      <td key={m.key} className="p-2 text-center">
                        <Checkbox
                          checked={!!row.months?.[m.key]}
                          disabled={isViewMode}
                          onChange={(e) =>
                            toggleCalendarMonth(row.id, m.key, e.target.checked)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={14}
                    className="text-center text-gray-400 py-8"
                  >
                    Please select crop in Farm Size
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </BoxPrimary>
    </>
  );

  return (
    <Form form={form} layout="vertical" component={false}>
      <MainLayout loading={loading}>
        <div className="title-page">
          {mode === "Edit" ? "Edit Farmer" : mode === "View" ? "View Farmer" : "Create Farmer"}
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="custom-tabs"
          items={[
            {
              key: "profile",
              label: <span className="tab-title">Profile</span>,
              children: profileTab,
            },
            {
              key: "gallery",
              label: <span className="tab-title">Gallery</span>,
              children: galleryTab,
            },
            {
              key: "farm",
              label: <span className="tab-title">Farm Size & Crop Calendar</span>,
              children: farmSizeCalendarTab,
            },
          ]}
        />

        <div className="flex justify-end space-x-4 mt-6">
          <ActionButton
            mode="back"
            text="Back"
            onClick={() => navigate("/customer/farmers")}
          />

          {!isViewMode && (
            <ActionButton mode="save" text="Save" onClick={handleSave} />
          )}
        </div>
      </MainLayout>
    </Form>
  );
}