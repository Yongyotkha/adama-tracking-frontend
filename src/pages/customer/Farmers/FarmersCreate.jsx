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
  Collapse,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Tabs,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import dayjs from "dayjs";

const MONTHS = [
  { key: "month01", label: "Jan." },
  { key: "month02", label: "Feb." },
  { key: "month03", label: "Mar." },
  { key: "month04", label: "Apr." },
  { key: "month05", label: "May" },
  { key: "month06", label: "Jun." },
  { key: "month07", label: "Jul." },
  { key: "month08", label: "Aug." },
  { key: "month09", label: "Sep." },
  { key: "month10", label: "Oct." },
  { key: "month11", label: "Nov." },
  { key: "month12", label: "Dec." },
];

const DEFAULT_LOCATION = {
  lat: 13.9572612,
  lng: 100.6222401,
  address: "",
};

const EMPTY_CONTACT = {
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
};

const EMPTY_FARM_SIZE = {
  key: 1,
  crop_id: undefined,
  size: "",
};

const GOOGLE_MAPS_API_KEY = "AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik";
const DEFAULT_PERMISSION = {
  view: true,
  edit: true,
  btn_Add_Contact_Person: true,
  btn_Update: true,
};

const getFileUrlFromUploadResponse = (response) =>
  response?.data?.file_url ||
  response?.data?.url ||
  response?.data?.path ||
  response?.file_url ||
  "";

const normalizeDate = (value) => {
  if (!value) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const normalizeCoordinatePair = (latitudeValue, longitudeValue) => {
  const first = Number(latitudeValue);
  const second = Number(longitudeValue);

  if (Number.isNaN(first) || Number.isNaN(second)) {
    return DEFAULT_LOCATION;
  }

  if (Math.abs(first) > 90 && Math.abs(second) <= 90) {
    return {
      lat: second,
      lng: first,
      address: "",
    };
  }

  return {
    lat: first,
    lng: second,
    address: "",
  };
};

const toApiCoordinatePayload = (locationData) => ({
  latitude: String(locationData?.lng ?? ""),
  longitude: String(locationData?.lat ?? ""),
});

const buildMonthPayload = (item) =>
  MONTHS.reduce((acc, month) => {
    acc[month.key] = !!item?.[month.key];
    return acc;
  }, {});

const groupGalleryByYear = (galleryItems = []) =>
  galleryItems.reduce((acc, item, index) => {
    const year = String(item.year || dayjs().year());
    if (!acc[year]) acc[year] = [];
    acc[year].push({
      uid: item.id ? String(item.id) : `${year}-${index}-${Date.now()}`,
      name: item.name || `gallery-${index + 1}`,
      url: item.img || item.url || item.path || "",
      status: "done",
    });
    return acc;
  }, {});

const galleryStateToPayload = (galleryByYear) =>
  Object.fromEntries(
    Object.entries(galleryByYear)
      .map(([year, items]) => [
        year,
        (items || []).map((item) => item.url).filter(Boolean),
      ])
      .filter(([, items]) => items.length > 0)
  );

const ensureAtLeastOneYear = (galleryByYear) => {
  if (Object.keys(galleryByYear).length > 0) return galleryByYear;
  return { [String(dayjs().year())]: [] };
};

const cropOptionsToSelectOptions = (items = []) =>
  items.map((item) => ({
    label: item.name,
    value: Number(item.id),
  }));

const masterOptionsToSelectOptions = (items = []) =>
  items.map((item) => ({
    label: item.name,
    value: Number(item.id),
  }));

const getCalendarRowKey = (item) =>
  `${Number(item.farmer_crop_id)}-${Number(item.farmer_crop_stage_id)}`;

export default function FarmersCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg, showNotification } = useContext(AuthContext);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileImage, setProfileImage] = useState("");
  const [prefixOptions, setPrefixOptions] = useState([]);
  const [equipmentOptions, setEquipmentOptions] = useState([]);
  const [cropOptions, setCropOptions] = useState([]);
  const [contacts, setContacts] = useState([{ ...EMPTY_CONTACT }]);
  const [farmSizeRows, setFarmSizeRows] = useState([{ ...EMPTY_FARM_SIZE }]);
  const [cropCalendarRows, setCropCalendarRows] = useState([]);
  const [cropCalendarDrafts, setCropCalendarDrafts] = useState({});
  const [galleryByYear, setGalleryByYear] = useState({
    [String(dayjs().year())]: [],
  });
  const [homeLocation, setHomeLocation] = useState(DEFAULT_LOCATION);
  const [farmLocation, setFarmLocation] = useState(DEFAULT_LOCATION);
  const [selectedCropIds, setSelectedCropIds] = useState([]);
  const [permission, setPermission] = useState(DEFAULT_PERMISSION);

  const mode = location.state?.mod || "create";
  const isViewMode = mode === "View";
  const isEditMode = mode === "Edit";
  const farmerId = location.state?.id;

  const selectedEquipment = Form.useWatch("equ_id", form) || [];
  const showOtherEquipment = selectedEquipment.some(
    (value) => Number(value) === 5
  );
  const canAddContact = !isViewMode && permission?.btn_Add_Contact_Person !== false;
  const canUpdate = !isViewMode && permission?.btn_Update !== false;

  const prefixSelectOptions = useMemo(
    () => masterOptionsToSelectOptions(prefixOptions),
    [prefixOptions]
  );
  const equipmentSelectOptions = useMemo(
    () => masterOptionsToSelectOptions(equipmentOptions),
    [equipmentOptions]
  );
  const cropSelectOptions = useMemo(
    () => cropOptionsToSelectOptions(cropOptions),
    [cropOptions]
  );
  const galleryYears = useMemo(
    () =>
      Object.keys(galleryByYear)
        .sort((a, b) => Number(b) - Number(a))
        .map(String),
    [galleryByYear]
  );
  const latestGalleryYear = useMemo(() => {
    if (galleryYears.length > 0) {
      return galleryYears[0];
    }

    return String(dayjs().year());
  }, [galleryYears]);

  const mapContainerStyle = {
    width: "100%",
    height: "180px",
  };

  const uploadFile = async (file, modeUpload = "profile") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", modeUpload);

    const response = await useServiceAPI.post(paths.pathUpload, formData);
    const fileUrl = getFileUrlFromUploadResponse(response);

    if (!fileUrl) {
      throw new Error("Upload file failed");
    }

    return fileUrl;
  };

  const getCropName = (cropId) =>
    cropOptions.find((item) => Number(item.id) === Number(cropId))?.name || "";
  const getUniqueFarmSizeCropIds = (rows) =>
    [...new Set((rows || []).map((item) => Number(item.crop_id)).filter(Boolean))];

  const geocodeLatLng = async (lat, lng) => {
    if (!window.google?.maps) return "";
    const geocoder = new window.google.maps.Geocoder();
    const response = await geocoder.geocode({ location: { lat, lng } });
    return response?.results?.[0]?.formatted_address || "";
  };

  const updateMapLocation = async (type, lat, lng) => {
    const address = await geocodeLatLng(lat, lng);
    const nextValue = { lat, lng, address };

    if (type === "home") {
      setHomeLocation(nextValue);
    } else {
      setFarmLocation(nextValue);
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

  const mergeCalendarRows = (templateRows = [], existingRows = []) =>
    templateRows.map((item) => {
      const matched = existingRows.find(
        (row) =>
          Number(row.farmer_crop_id) === Number(item.farmer_crop_id) &&
          Number(row.farmer_crop_stage_id) === Number(item.farmer_crop_stage_id)
      );

      return {
        farmer_crop_id: Number(item.farmer_crop_id),
        farmer_crop_stage_id: Number(item.farmer_crop_stage_id),
        crop_id: Number(item.crop_id),
        crop_name: item.crop_name,
        crop_detail: item.crop_detail,
        stage_name: item.stage_name,
        custom_name: matched?.custom_name || "",
        ...buildMonthPayload(matched),
      };
    });

  const fetchCropCalendarTemplate = async (cropIds, existingRows = null) => {
    if (!cropIds.length) {
      setCropCalendarRows([]);
      return;
    }

    const response = await useServiceAPI.get(paths.pathMasterCropCalendar, {
      crop_ids: cropIds,
    });

    const templates = (response.data || []).flatMap((crop) =>
      (crop.stage || []).map((stage) => ({
        farmer_crop_id: Number(crop.farmer_crop_id),
        crop_id: Number(crop.crop_id),
        crop_name: crop.crop_name,
        crop_detail: crop.crop_detail,
        farmer_crop_stage_id: Number(stage.farmer_crop_stage_id),
        stage_name: stage.stage_name,
      }))
    );

    const mergedRows = mergeCalendarRows(
      templates,
      existingRows || Object.values(cropCalendarDrafts)
    );

    setCropCalendarRows(mergedRows);
    setCropCalendarDrafts((prev) => {
      const nextDrafts = { ...prev };
      mergedRows.forEach((row) => {
        nextDrafts[getCalendarRowKey(row)] = {
          ...(nextDrafts[getCalendarRowKey(row)] || {}),
          ...row,
        };
      });
      return nextDrafts;
    });
  };

  const fetchFarmerDetail = async (id) => {
    const response = await useServiceAPI.get(paths.pathCustomerFarmersDetail, {
      id,
    });

    if (response.status !== 200) return;

    const data = response.data || {};
    const homeCoordinates = normalizeCoordinatePair(
      data.location_latitude,
      data.location_longitude
    );
    const farmCoordinates = normalizeCoordinatePair(
      data.location_latitude_farm,
      data.location_longitude_farm
    );
    const cropIds = (data.crop_list || []).map((item) => Number(item.id));
    const mappedCalendarRows = (data.farmer_crop_calendar || []).map((item) => ({
      farmer_crop_id: Number(item.farmer_crop_id),
      farmer_crop_stage_id: Number(item.farmer_crop_stage_id),
      custom_name: item.custom_name || "",
      ...MONTHS.reduce((acc, month) => {
        acc[month.key] = String(item[month.key]) === "1";
        return acc;
      }, {}),
    }));
    const mappedCalendarDrafts = mappedCalendarRows.reduce((acc, item) => {
      acc[getCalendarRowKey(item)] = item;
      return acc;
    }, {});

    setProfileImage(data.photo_path || "");
    setPermission(data.permission || DEFAULT_PERMISSION);
    setHomeLocation({
      ...homeCoordinates,
      address: data.location_address || data.contact_address || data.address || "",
    });
    setFarmLocation({
      ...farmCoordinates,
      address: data.location_address_farm || "",
    });
    setSelectedCropIds(cropIds);
    setCropCalendarDrafts(mappedCalendarDrafts);
    setContacts(
      (data.contact_items || []).length > 0
        ? data.contact_items.map((item) => ({
            ...EMPTY_CONTACT,
            ...item,
            date_of_birth: normalizeDate(item.date_of_birth),
          }))
        : [{ ...EMPTY_CONTACT }]
    );
    setGalleryByYear(
      ensureAtLeastOneYear(groupGalleryByYear(data.farmer_gallery || []))
    );
    setFarmSizeRows(
      (data.farmer_size || []).length > 0
        ? data.farmer_size.map((item, index) => ({
            key: index + 1,
            crop_id: Number(item.crop_id),
            size: item.size || "",
          }))
        : [{ ...EMPTY_FARM_SIZE }]
    );

    form.setFieldsValue({
      farm_name: data.farm_name || "",
      prefix: data.prefix ? Number(data.prefix) : undefined,
      name: data.name || "",
      nickname: data.nickname || "",
      est: data.est || "",
      address: data.address || "",
      date_of_birth: normalizeDate(data.date_of_birth),
      mobile_phone: data.mobile_phone || "",
      line_id: data.line_id || "",
      t_shirt_size: data.t_shirt_size || "",
      email: data.email || "",
      remark: data.remark || "",
      equ_id: (data.equ_id || []).map((item) => Number(item)),
      equ_other: data.equ_other || "",
      crop_id: cropIds,
    });

    await fetchCropCalendarTemplate(cropIds, mappedCalendarRows);
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);

      try {
        const [prefixRes, equRes, cropRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterPrefix, {}),
          useServiceAPI.get(paths.pathMasterEquipment, {}),
          useServiceAPI.get(paths.pathMasterCrop, {}),
        ]);

        setPrefixOptions(prefixRes.data || []);
        setEquipmentOptions(equRes.data || []);
        setCropOptions(cropRes.data || []);

        if ((isEditMode || isViewMode) && farmerId) {
          await fetchFarmerDetail(farmerId);
        }
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  useEffect(() => {
    if (!showOtherEquipment) {
      form.setFieldValue("equ_other", "");
    }
  }, [form, showOtherEquipment]);

  const addContact = () => {
    setContacts((prev) => [...prev, { ...EMPTY_CONTACT }]);
  };

  const updateContact = (index, field, value) => {
    setContacts((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeContact = (index) => {
    setContacts((prev) =>
      prev.length === 1 ? prev : prev.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const addFarmSizeRow = () => {
    setFarmSizeRows((prev) => [
      ...prev,
      {
        key: prev.length + 1,
        crop_id: undefined,
        size: "",
      },
    ]);
  };

  const updateFarmSizeRow = async (key, field, value) => {
    let nextRows = null;
    let isDuplicateCrop = false;

    setFarmSizeRows((prev) => {
      const updatedRows = prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      );

      if (field === "crop_id") {
        const duplicateCount = updatedRows.filter(
          (item) => Number(item.crop_id) === Number(value)
        ).length;

        if (value && duplicateCount > 1) {
          isDuplicateCrop = true;
          nextRows = prev;
          return prev;
        }
      }

      nextRows = updatedRows;
      return updatedRows;
    });

    if (field === "crop_id") {
      if (isDuplicateCrop) {
        await showNotification("warning", "Notification", [
          "Crop นี้ถูกเลือกแล้ว",
        ]);
        return;
      }

      const cropIds = getUniqueFarmSizeCropIds(nextRows || []);
      setSelectedCropIds(cropIds);
      form.setFieldValue("crop_id", cropIds);
      await fetchCropCalendarTemplate(cropIds);
    }
  };

  const removeFarmSizeRow = (key) => {
    if (farmSizeRows.length === 1) {
      return;
    }

    setFarmSizeRows((prev) => {
      const nextRows = prev
        .filter((item) => item.key !== key)
        .map((item, index) => ({
          ...item,
          key: index + 1,
        }));

      return nextRows.length > 0 ? nextRows : [{ ...EMPTY_FARM_SIZE }];
    });

    const nextRows = farmSizeRows
      .filter((item) => item.key !== key)
      .map((item, index) => ({
        ...item,
        key: index + 1,
      }));
    const cropIds = getUniqueFarmSizeCropIds(nextRows);
    setSelectedCropIds(cropIds);
    form.setFieldValue("crop_id", cropIds);
    fetchCropCalendarTemplate(cropIds);
  };

  const onCropChange = async (value) => {
    const normalized = (value || []).map(Number);
    setSelectedCropIds(normalized);
    form.setFieldValue("crop_id", normalized);
    await fetchCropCalendarTemplate(normalized);
  };

  const updateCalendarRow = (rowKey, field, value) => {
    setCropCalendarRows((prev) =>
      prev.map((item) =>
        `${item.farmer_crop_id}-${item.farmer_crop_stage_id}` === rowKey
          ? { ...item, [field]: value }
          : item
      )
    );
    setCropCalendarDrafts((prev) => ({
      ...prev,
      [rowKey]: {
        ...(prev[rowKey] || {}),
        [field]: value,
      },
    }));
  };

  const handleUploadProfile = async ({ file }) => {
    try {
      setLoading(true);
      const fileUrl = await uploadFile(file, "profile");
      setProfileImage(fileUrl);
    } catch (error) {
      showNotification("error", error.message || "Upload profile failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadGallery = async ({ file }) => {
    try {
      setLoading(true);
      const fileUrl = await uploadFile(file, "profile");
      const targetYear = latestGalleryYear || String(dayjs().year());

      setGalleryByYear((prev) => ({
        ...prev,
        [targetYear]: [
          ...(prev[targetYear] || []),
          {
            uid: `${targetYear}-${Date.now()}`,
            name: file.name,
            url: fileUrl,
            status: "done",
          },
        ],
      }));
    } catch (error) {
      showNotification("error", error.message || "Upload gallery failed");
    } finally {
      setLoading(false);
    }
  };

  const removeGalleryItem = (year, uid) => {
    setGalleryByYear((prev) => ({
      ...prev,
      [year]: (prev[year] || []).filter((item) => item.uid !== uid),
    }));
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const homeCoordinates = toApiCoordinatePayload(homeLocation);
      const farmCoordinates = toApiCoordinatePayload(farmLocation);

      const payload = {
        ...(isEditMode ? { id: farmerId } : {}),
        photo_path: profileImage || "",
        farm_name: values.farm_name || "",
        prefix: values.prefix || null,
        name: values.name || "",
        nickname: values.nickname || "",
        est: values.est || "",
        address: values.address || "",
        date_of_birth: values.date_of_birth
          ? dayjs(values.date_of_birth).format("YYYY-MM-DD")
          : null,
        mobile_phone: values.mobile_phone || "",
        line_id: values.line_id || "",
        t_shirt_size: values.t_shirt_size || "",
        email: values.email || "",
        remark: values.remark || "",
        equ_id: (values.equ_id || []).map(Number),
        equ_other: values.equ_other || "",
        location_latitude: homeCoordinates.latitude,
        location_longitude: homeCoordinates.longitude,
        location_latitude_farm: farmCoordinates.latitude,
        location_longitude_farm: farmCoordinates.longitude,
        crop_id: (values.crop_id || []).map(Number),
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
        gallery: galleryStateToPayload(galleryByYear),
        farm_size: farmSizeRows
          .filter((item) => item.crop_id || item.size)
          .map((item) => ({
            crop_id: Number(item.crop_id),
            size: item.size || "",
          })),
        crop_calendar: cropCalendarRows.map((item) => ({
          farmer_crop_id: Number(item.farmer_crop_id),
          farmer_crop_stage_id: Number(item.farmer_crop_stage_id),
          custom_name: item.custom_name || "",
          ...MONTHS.reduce((acc, month) => {
            acc[month.key] = !!item[month.key];
            return acc;
          }, {}),
        })),
      };

      setLoading(true);

      const response = isEditMode
        ? await useServiceAPI.put(paths.pathCustomerFarmersUpdate, payload)
        : await useServiceAPI.post(paths.pathCustomerFarmersCreate, payload);

      if (response.status === 200) {
        await showNotification(
          "success",
          response.message || response.data?.message || "Success",
          response.data?.message_line
        );
        navigate("/customer/farmers");
      }
    } catch (error) {
      if (error?.errorFields) return;
      showNotification(
        "error",
        error.response?.data?.message || error.message || "Save failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const profileTab = (
    <>
      <BoxPrimary title="Personal Info">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div className="flex items-center gap-4">
              <img
                src={profileImage || "/img/Image-not-found.png"}
                alt="profile"
                className="w-24 h-24 rounded-full object-cover shadow"
              />
              {canUpdate && (
                <Upload
                  showUploadList={false}
                  customRequest={handleUploadProfile}
                  accept="image/*"
                >
                  <Button icon={<EditOutlined />}>Change Photo</Button>
                </Upload>
              )}
            </div>
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Form.Item label="Farm Name" name="farm_name">
              <Input disabled={isViewMode} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={4}>
            <Form.Item label="Pre Fix" name="prefix">
              <Select
                disabled={isViewMode}
                options={prefixSelectOptions}
                placeholder="Select prefix"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Name (TH)" name="name">
              <Input disabled={isViewMode} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={6}>
            <Form.Item label="Nickname" name="nickname">
              <Input disabled={isViewMode} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Est Input (Baht / Year)" name="est">
              <Input disabled={isViewMode} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Address" name="address">
              <Input disabled={isViewMode} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Date of Birth" name="date_of_birth">
              <DatePicker className="w-full" disabled={isViewMode} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Mobile Phone" name="mobile_phone">
              <Input disabled={isViewMode} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Line ID" name="line_id">
              <Input disabled={isViewMode} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="T-Shirt Size" name="t_shirt_size">
              <Input disabled={isViewMode} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12} lg={8}>
            <Form.Item label="Email" name="email">
              <Input disabled={isViewMode} />
            </Form.Item>
          </Col>

          <Col xs={24} md={16}>
            <Form.Item label="Remark" name="remark">
              <Input disabled={isViewMode} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Equipment On Hand" name="equ_id">
              <Checkbox.Group disabled={isViewMode}>
                <Row gutter={[16, 8]}>
                  {equipmentSelectOptions.map((item) => (
                    <Col xs={12} md={8} lg={6} key={item.value}>
                      <Checkbox value={item.value}>{item.label}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Col>

          {showOtherEquipment && (
            <Col span={24}>
              <Form.Item label="Other Equipment" name="equ_other">
                <Input disabled={isViewMode} />
              </Form.Item>
            </Col>
          )}

          <Col xs={24} md={12}>
            <div className="mb-2 font-semibold text-[#00783F]">Home Location</div>
            <Input
              className="mb-3"
              value={homeLocation.address}
              disabled
              suffix={<EnvironmentOutlined />}
            />
            <div className="flex justify-end mb-2">
              <Button
                type="primary"
                className="bg-[#00783F]"
                onClick={() => openGoogleMap(homeLocation)}
              >
                Open Google
              </Button>
            </div>
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={homeLocation}
                zoom={10}
                onClick={(event) => {
                  if (!canUpdate || !event.latLng) return;
                  updateMapLocation("home", event.latLng.lat(), event.latLng.lng());
                }}
              >
                <Marker
                  position={homeLocation}
                  draggable={canUpdate}
                  onDragEnd={(event) => {
                    if (!event.latLng) return;
                    updateMapLocation("home", event.latLng.lat(), event.latLng.lng());
                  }}
                />
              </GoogleMap>
            </LoadScript>
          </Col>

          <Col xs={24} md={12}>
            <div className="mb-2 font-semibold text-[#00783F]">Farm Location</div>
            <Input
              className="mb-3"
              value={farmLocation.address}
              disabled
              suffix={<EnvironmentOutlined />}
            />
            <div className="flex justify-end mb-2">
              <Button
                type="primary"
                className="bg-[#00783F]"
                onClick={() => openGoogleMap(farmLocation)}
              >
                Open Google
              </Button>
            </div>
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={farmLocation}
                zoom={10}
                onClick={(event) => {
                  if (!canUpdate || !event.latLng) return;
                  updateMapLocation("farm", event.latLng.lat(), event.latLng.lng());
                }}
              >
                <Marker
                  position={farmLocation}
                  draggable={canUpdate}
                  onDragEnd={(event) => {
                    if (!event.latLng) return;
                    updateMapLocation("farm", event.latLng.lat(), event.latLng.lng());
                  }}
                />
              </GoogleMap>
            </LoadScript>
          </Col>
        </Row>
      </BoxPrimary>

      <BoxPrimary title="Crop">
        <Form.Item className="mb-0" name="crop_id">
          <Select
            mode="multiple"
            showSearch
            disabled={isViewMode}
            placeholder="Select main crop"
            options={cropSelectOptions}
            value={selectedCropIds}
            onChange={onCropChange}
          />
        </Form.Item>
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-lg font-semibold">
            Contact Person
          </span>
          {canAddContact && (
            <ActionButton mode="add" text="Add" onClick={addContact} />
          )}
        </div>

        {contacts.map((contact, index) => (
          <div key={`contact-${index}`} className="mb-6">
            <div className="flex justify-between mb-3">
              <span className="text-[#00783F]">{`Person ${index + 1}`}</span>
              {canAddContact && contacts.length > 1 && (
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
                  value={contact.name_th}
                  placeholder="Name (TH)"
                  disabled={isViewMode}
                  onChange={(event) =>
                    updateContact(index, "name_th", event.target.value)
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <Input
                  value={contact.nickname}
                  placeholder="Nickname"
                  disabled={isViewMode}
                  onChange={(event) =>
                    updateContact(index, "nickname", event.target.value)
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <Input
                  value={contact.name_en}
                  placeholder="Name (EN)"
                  disabled={isViewMode}
                  onChange={(event) =>
                    updateContact(index, "name_en", event.target.value)
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <DatePicker
                  className="w-full"
                  placeholder="Date of Birth"
                  value={contact.date_of_birth}
                  disabled={isViewMode}
                  onChange={(value) => updateContact(index, "date_of_birth", value)}
                />
              </Col>
              <Col xs={24} md={6}>
                <Input
                  value={contact.t_shirt_size}
                  placeholder="T-Shirt Size"
                  disabled={isViewMode}
                  onChange={(event) =>
                    updateContact(index, "t_shirt_size", event.target.value)
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <Input
                  value={contact.relationship}
                  placeholder="Relationship"
                  disabled={isViewMode}
                  onChange={(event) =>
                    updateContact(index, "relationship", event.target.value)
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <Input
                  value={contact.duty}
                  placeholder="Duty"
                  disabled={isViewMode}
                  onChange={(event) =>
                    updateContact(index, "duty", event.target.value)
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <Input
                  value={contact.tel1}
                  placeholder="Tel 1"
                  disabled={isViewMode}
                  onChange={(event) =>
                    updateContact(index, "tel1", event.target.value)
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <Input
                  value={contact.tel2}
                  placeholder="Tel 2"
                  disabled={isViewMode}
                  onChange={(event) =>
                    updateContact(index, "tel2", event.target.value)
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <Input
                  value={contact.contact_number}
                  placeholder="Contact Number"
                  disabled={isViewMode}
                  onChange={(event) =>
                    updateContact(index, "contact_number", event.target.value)
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <Input
                  value={contact.email}
                  placeholder="Email"
                  disabled={isViewMode}
                  onChange={(event) =>
                    updateContact(index, "email", event.target.value)
                  }
                />
              </Col>
              <Col xs={24} md={6}>
                <Input
                  value={contact.line_id}
                  placeholder="Line ID"
                  disabled={isViewMode}
                  onChange={(event) =>
                    updateContact(index, "line_id", event.target.value)
                  }
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
      <div className="flex justify-end mb-4">
        {canUpdate && (
          <Upload
            showUploadList={false}
            customRequest={handleUploadGallery}
            accept="image/*"
          >
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

      <Collapse
        defaultActiveKey={[latestGalleryYear]}
        items={galleryYears.map((year) => ({
          key: year,
          label: `Year ${year}`,
          children: (
            <div>
              <div className="flex flex-wrap gap-4">
                {(galleryByYear[year] || []).length > 0 ? (
                  (galleryByYear[year] || []).map((item) => (
                    <div key={item.uid} className="relative">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-32 h-24 object-cover rounded shadow"
                      />
                      {canUpdate && (
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                          onClick={() => removeGalleryItem(year, item.uid)}
                        >
                          <DeleteOutlined />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">No gallery in this year</div>
                )}
              </div>
            </div>
          ),
        }))}
      />
    </BoxPrimary>
  );

  const farmSizeCalendarTab = (
    <>
      <BoxPrimary title="Farm Size">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-12 bg-[#00783F] text-white px-3 py-2 rounded-t font-semibold">
              <div className="col-span-6">Crop</div>
              <div className="col-span-5">Farm Size</div>
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
                    onChange={(value) => updateFarmSizeRow(item.key, "crop_id", value)}
                  />
                </div>

                <div className="col-span-5">
                  <Input
                    className="w-full"
                    placeholder="Farm Size"
                    value={item.size}
                    disabled={isViewMode}
                    onChange={(event) =>
                      updateFarmSizeRow(item.key, "size", event.target.value)
                    }
                  />
                </div>

                <div className="col-span-1 flex justify-center">
                  {canUpdate && (
                    <button
                      type="button"
                      onClick={() => removeFarmSizeRow(item.key)}
                      disabled={farmSizeRows.length === 1}
                      className={`w-8 h-8 flex items-center justify-center rounded ${
                        farmSizeRows.length === 1
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-red-50"
                      }`}
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

        {canUpdate && (
          <Button className="mt-3" icon={<PlusOutlined />} onClick={addFarmSizeRow}>
            Add Farm Size
          </Button>
        )}
      </BoxPrimary>

      <BoxPrimary title="Crop Calendar">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1500px] border-collapse">
            <thead>
              <tr className="bg-[#00783F] text-white">
                <th className="p-2 text-left">Crop</th>
                <th className="p-2 text-left">Stage</th>
                <th className="p-2 text-left">Custom Name</th>
                {MONTHS.map((month) => (
                  <th key={month.key} className="p-2 text-center">
                    {month.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cropCalendarRows.length > 0 ? (
                cropCalendarRows.map((row) => {
                  const rowKey = `${row.farmer_crop_id}-${row.farmer_crop_stage_id}`;
                  return (
                    <tr key={rowKey} className="border-b border-gray-100">
                      <td className="p-2">{row.crop_detail || row.crop_name}</td>
                      <td className="p-2">{row.stage_name}</td>
                      <td className="p-2 min-w-[220px]">
                        <Input
                          value={row.custom_name}
                          disabled={isViewMode}
                          onChange={(event) =>
                            updateCalendarRow(rowKey, "custom_name", event.target.value)
                          }
                        />
                      </td>
                      {MONTHS.map((month) => (
                        <td key={month.key} className="p-2 text-center">
                          <Checkbox
                            checked={!!row[month.key]}
                            disabled={isViewMode}
                            onChange={(event) =>
                              updateCalendarRow(
                                rowKey,
                                month.key,
                                event.target.checked
                              )
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={15} className="text-center text-gray-400 py-8">
                    Please select crop first
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
          {isViewMode
            ? "View Farmer"
            : isEditMode
            ? "Edit Farmer"
            : "Create Farmer"}
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
          {canUpdate && (
            <ActionButton
              mode="save"
              text={isEditMode ? "Update" : "Save"}
              onClick={handleSave}
            />
          )}
        </div>
      </MainLayout>
    </Form>
  );
}
