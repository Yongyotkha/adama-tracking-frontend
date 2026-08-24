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
  Image,
  Input,
  Row,
  Select,
  Tabs,
  Upload,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
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
const GALLERY_MAX_IMAGES_PER_YEAR = 10;
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
    if (acc[year].length >= GALLERY_MAX_IMAGES_PER_YEAR) return acc;
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
        (items || [])
          .slice(0, GALLERY_MAX_IMAGES_PER_YEAR)
          .map((item) => item.url)
          .filter(Boolean),
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

const getPreferredTextValue = (...values) =>
  values.find((value) => typeof value === "string" && value.trim() !== "") || "";

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
  const [editingCalendarCropId, setEditingCalendarCropId] = useState(null);
  const [editingCalendarCropRowKey, setEditingCalendarCropRowKey] = useState(null);
  const [editingCalendarCropValue, setEditingCalendarCropValue] = useState("");
  const [isHomeMapEnabled, setIsHomeMapEnabled] = useState(false);
  const [isFarmMapEnabled, setIsFarmMapEnabled] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [galleryByYear, setGalleryByYear] = useState({
    [String(dayjs().year())]: [],
  });
  const [galleryPreview, setGalleryPreview] = useState({
    open: false,
    src: "",
    title: "",
  });
  const [homeLocation, setHomeLocation] = useState(DEFAULT_LOCATION);
  const [farmLocation, setFarmLocation] = useState(DEFAULT_LOCATION);
  const [profileCropIds, setProfileCropIds] = useState([]);
  const [targetGroupOptions, setTargetGroupOptions] = useState([]);
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
  const getCalendarCropLabel = (item) =>
    getPreferredTextValue(item?.custom_name, item?.crop_detail, item?.crop_name);

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

  const updateMapAddressIfNeeded = async (type, locationData) => {
    if (!locationData?.lat || !locationData?.lng || locationData?.address) {
      return;
    }

    const address = await geocodeLatLng(locationData.lat, locationData.lng);
    if (!address) return;

    if (type === "home") {
      setHomeLocation((prev) => ({ ...prev, address }));
      return;
    }

    setFarmLocation((prev) => ({ ...prev, address }));
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
        crop_detail: getPreferredTextValue(
          matched?.crop_detail,
          item.crop_detail,
          matched?.crop_name,
          item.crop_name
        ),
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
    const farmSizeItems =
      (data.farmer_size || []).length > 0
        ? data.farmer_size.map((item, index) => ({
          key: index + 1,
          crop_id: Number(item.crop_id),
          size: item.size || "",
        }))
        : [{ ...EMPTY_FARM_SIZE }];
    const farmSizeCropIds = getUniqueFarmSizeCropIds(farmSizeItems);
    const mappedCalendarRows = (data.farmer_crop_calendar || []).map((item) => ({
      farmer_crop_id: Number(item.farmer_crop_id),
      farmer_crop_stage_id: Number(item.farmer_crop_stage_id),
      crop_detail: getPreferredTextValue(item.crop_detail, item.crop_name),
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
      address: data.location_address || "",
    });
    setFarmLocation({
      ...farmCoordinates,
      address: data.location_address_farm || "",
    });
    setProfileCropIds(cropIds);
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
    setFarmSizeRows(farmSizeItems);

    form.setFieldsValue({
      farm_name: data.farm_name || "",
      prefix: data.prefix ? Number(data.prefix) : undefined,
      name: data.name || "",
      nickname: data.nickname || "",
      est: data.est || "",
      address: data.address || "",
      date_of_birth: normalizeDate(data.date_of_birth),
      age: data.date_of_birth ? Math.max(0, dayjs().diff(dayjs(data.date_of_birth), "year")) : "",
      mobile_phone: data.mobile_phone || "",
      line_id: data.line_id || "",
      t_shirt_size: data.t_shirt_size || "",
      email: data.email || "",
      remark: data.remark || "",
      target_group_id: data.target_group_id ? Number(data.target_group_id) : undefined,
      equ_id: (data.equ_id || []).map((item) => Number(item)),
      equ_other: data.equ_other || "",
      profile_crop_id: cropIds,
    });

    await fetchCropCalendarTemplate(farmSizeCropIds, mappedCalendarRows);
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);

      try {
        const [prefixRes, equRes, cropRes, targetGroupRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterPrefix, {}),
          useServiceAPI.get(paths.pathMasterEquipment, {}),
          useServiceAPI.get(paths.pathMasterCrop, {}),
          useServiceAPI.get(paths.pathMasterTarget, { user_type: 3 }),
        ]);

        setPrefixOptions(prefixRes.data || []);
        setEquipmentOptions(equRes.data || []);
        setCropOptions(cropRes.data || []);

        const farmerGroups = (targetGroupRes?.data || []).map((x) => ({
          label: String(x.name || x.target_group_name || "-").trim(),
          value: Number(x.id ?? x.target_group_id),
        }));
        setTargetGroupOptions(farmerGroups);

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

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google?.maps) {
        setIsGoogleLoaded(true);
        return null;
      }

      const interval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(interval);
          setIsGoogleLoaded(true);
        }
      }, 500);

      return () => clearInterval(interval);
    };

    const cleanup = checkGoogleMaps();
    return () => cleanup?.();
  }, []);

  useEffect(() => {
    if (!isGoogleLoaded) return;
    updateMapAddressIfNeeded("home", homeLocation);
  }, [isGoogleLoaded, homeLocation.lat, homeLocation.lng]);

  useEffect(() => {
    if (!isGoogleLoaded) return;
    updateMapAddressIfNeeded("farm", farmLocation);
  }, [isGoogleLoaded, farmLocation.lat, farmLocation.lng]);

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
    fetchCropCalendarTemplate(cropIds);
  };

  const onProfileCropChange = (value) => {
    const normalized = (value || []).map(Number);
    setProfileCropIds(normalized);
    form.setFieldValue("profile_crop_id", normalized);
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

  const startCalendarCropEdit = (row) => {
    setEditingCalendarCropId(Number(row.farmer_crop_id));
    setEditingCalendarCropRowKey(getCalendarRowKey(row));
    setEditingCalendarCropValue(getCalendarCropLabel(row));
  };

  const cancelCalendarCropEdit = () => {
    setEditingCalendarCropId(null);
    setEditingCalendarCropRowKey(null);
    setEditingCalendarCropValue("");
  };

  const confirmCalendarCropEdit = () => {
    if (!editingCalendarCropId) return;

    const nextValue = editingCalendarCropValue;
    const targetRowKeys = cropCalendarRows
      .filter(
        (item) => Number(item.farmer_crop_id) === Number(editingCalendarCropId)
      )
      .map((item) => getCalendarRowKey(item));

    setCropCalendarRows((prev) =>
      prev.map((item) =>
        Number(item.farmer_crop_id) === Number(editingCalendarCropId)
          ? { ...item, custom_name: nextValue }
          : item
      )
    );
    setCropCalendarDrafts((prev) => {
      const nextDrafts = { ...prev };

      targetRowKeys.forEach((rowKey) => {
        nextDrafts[rowKey] = {
          ...(nextDrafts[rowKey] || {}),
          custom_name: nextValue,
        };
      });

      return nextDrafts;
    });

    cancelCalendarCropEdit();
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

  const handleUploadGallery = async ({ file, onSuccess, onError }, targetYear = latestGalleryYear) => {
    const year = String(targetYear || dayjs().year());
    const currentGallery = galleryByYear[year] || [];

    if (currentGallery.length >= GALLERY_MAX_IMAGES_PER_YEAR) {
      showMsg("warning", "Maximum 10 images per year.");
      onError?.(new Error("Maximum 10 images per year."));
      return;
    }

    try {
      setLoading(true);
      const fileUrl = await uploadFile(file, "profile");

      setGalleryByYear((prev) => ({
        ...prev,
        [year]: [
          ...(prev[year] || []),
          {
            uid: `${year}-${Date.now()}`,
            name: file.name,
            url: fileUrl,
            status: "done",
          },
        ],
      }));
      onSuccess?.({ url: fileUrl }, file);
    } catch (error) {
      showNotification("error", error.message || "Upload gallery failed");
      onError?.(error);
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

  const handleGalleryPreview = (file) => {
    setGalleryPreview({
      open: true,
      src: file.url || file.thumbUrl || "",
      title: file.name || "Preview",
    });
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
        target_group_id: values.target_group_id || null,
        equ_id: (values.equ_id || []).map(Number),
        equ_other: values.equ_other || "",
        location_latitude: homeCoordinates.latitude,
        location_longitude: homeCoordinates.longitude,
        location_latitude_farm: farmCoordinates.latitude,
        location_longitude_farm: farmCoordinates.longitude,
        crop_id: (values.profile_crop_id || []).map(Number),
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
          crop_detail: item.crop_detail || "",
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

          {/* Personal Info fields */}
          <Col xs={24} md={8}>
            <Form.Item
              label="Farm Name"
              name="farm_name"
              rules={[{ required: true, message: "Please enter Farm Name" }]}
            >
              <Input disabled={isViewMode} placeholder="Enter Farm Name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={4}>
            <Form.Item label="Pre Fix" name="prefix">
              <Select
                disabled={isViewMode}
                options={prefixSelectOptions}
                placeholder="select"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item label="Name - Surname (TH)" name="name">
              <Input disabled={isViewMode} placeholder="Enter Name - Surname (TH)" />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              label="Nickname"
              name="nickname"
              rules={[{ required: true, message: "Please enter Nickname" }]}
            >
              <Input disabled={isViewMode} placeholder="Enter Nickname" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item label="Est Pesticide Input (Baht / Year)" name="est">
              <Input disabled={isViewMode} placeholder="Enter Estimated Pesticide Input (Baht / Year)" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item label="Address" name="address">
              <Input disabled={isViewMode} placeholder="Enter Address" />
            </Form.Item>
          </Col>

          <Col xs={24} md={5}>
            <Form.Item label="Date of Birth" name="date_of_birth">
              <DatePicker
                className="w-full"
                disabled={isViewMode}
                placeholder="Select Date of Birth"
                onChange={(date) => {
                  if (date) {
                    const calculatedAge = dayjs().diff(dayjs(date), "year");
                    form.setFieldValue("age", calculatedAge >= 0 ? calculatedAge : 0);
                  } else {
                    form.setFieldValue("age", "");
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={3}>
            <Form.Item label="Age" name="age">
              <Input disabled placeholder="Age" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Mobile Phone"
              name="mobile_phone"
              rules={[{ required: true, message: "Please enter Mobile Phone" }]}
            >
              <Input disabled={isViewMode} placeholder="Enter Mobile Phone" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item label="Line ID" name="line_id">
              <Input disabled={isViewMode} placeholder="Enter Line ID" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item label="T-Shirt Size" name="t_shirt_size">
              <Input disabled={isViewMode} placeholder="Enter T-Shirt Size" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item label="Email" name="email">
              <Input disabled={isViewMode} placeholder="Enter Email" />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Customer Group"
              name="target_group_id"
              rules={[{ required: true, message: "Please select Customer Group" }]}
            >
              <Select
                disabled={isViewMode}
                options={targetGroupOptions}
                placeholder="Select Customer Group"
                allowClear
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item label="Remark" name="remark">
              <Input disabled={isViewMode} placeholder="Enter Remark" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Equipment On Hand" name="equ_id">
              <Checkbox.Group disabled={isViewMode}>
                <div className="flex flex-wrap items-center gap-4">
                  {equipmentSelectOptions.map((item) => {
                    const isOther = Number(item.value) === 5;

                    return (
                      <div
                        key={item.value}
                        className="flex items-center gap-2"
                      >
                        <Checkbox value={item.value}>
                          {item.label}
                        </Checkbox>

                        {isOther && showOtherEquipment && (
                          <Form.Item
                            name="equ_other"
                            noStyle
                          >
                            <Input
                              disabled={isViewMode}
                              placeholder="specify other equipment"
                              className="w-48"
                            />
                          </Form.Item>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Checkbox.Group>
            </Form.Item>
          </Col>
        </Row>
      </BoxPrimary>

      <BoxPrimary>
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <div className="mb-2 font-semibold text-[#00783F]">Home Location</div>
            <Input
              className="mb-3"
              value={homeLocation.address}
              disabled
              suffix={<EnvironmentOutlined />}
            />
            <div className="flex justify-end items-center gap-2 mb-2">
              <ActionButton
                text={isHomeMapEnabled ? "Close Google" : "Open Google"}
                mode="custom"
                onClick={() => setIsHomeMapEnabled((prev) => !prev)}
                className={`text-white ${
                  isHomeMapEnabled ? "bg-[#f11113]" : "bg-[#00783F]"
                }`}
              />
              <button
                type="button"
                className="w-8 h-8 bg-white rounded hover:shadow"
                onClick={() => openGoogleMap(homeLocation)}
                title="Open in Google Maps"
                disabled={!homeLocation.lat || !homeLocation.lng}
              >
                <img
                  src="/img/icons/google-map.png"
                  alt="Google Map"
                  className="w-full h-full object-contain"
                />
              </button>
            </div>
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={homeLocation}
                zoom={10}
                options={{ disableDefaultUI: !isHomeMapEnabled }}
                onClick={(event) => {
                  if (!canUpdate || !isHomeMapEnabled || !event.latLng) return;
                  updateMapLocation("home", event.latLng.lat(), event.latLng.lng());
                }}
              >
                <Marker
                  position={homeLocation}
                  draggable={canUpdate && isHomeMapEnabled}
                  onDragEnd={(event) => {
                    if (!isHomeMapEnabled || !event.latLng) return;
                    updateMapLocation("home", event.latLng.lat(), event.latLng.lng());
                  }}
                  options={{
                    draggable: canUpdate && isHomeMapEnabled,
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
            <div className="flex justify-end items-center gap-2 mb-2">
              <ActionButton
                text={isFarmMapEnabled ? "Close Google" : "Open Google"}
                mode="custom"
                onClick={() => setIsFarmMapEnabled((prev) => !prev)}
                className={`text-white ${
                  isFarmMapEnabled ? "bg-[#f11113]" : "bg-[#00783F]"
                }`}
              />
              <button
                type="button"
                className="w-8 h-8 bg-white rounded hover:shadow"
                onClick={() => openGoogleMap(farmLocation)}
                title="Open in Google Maps"
                disabled={!farmLocation.lat || !farmLocation.lng}
              >
                <img
                  src="/img/icons/google-map.png"
                  alt="Google Map"
                  className="w-full h-full object-contain"
                />
              </button>
            </div>
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={farmLocation}
                zoom={10}
                options={{ disableDefaultUI: !isFarmMapEnabled }}
                onClick={(event) => {
                  if (!canUpdate || !isFarmMapEnabled || !event.latLng) return;
                  updateMapLocation("farm", event.latLng.lat(), event.latLng.lng());
                }}
              >
                <Marker
                  position={farmLocation}
                  draggable={canUpdate && isFarmMapEnabled}
                  onDragEnd={(event) => {
                    if (!isFarmMapEnabled || !event.latLng) return;
                    updateMapLocation("farm", event.latLng.lat(), event.latLng.lng());
                  }}
                  options={{
                    draggable: canUpdate && isFarmMapEnabled,
                  }}
                />
              </GoogleMap>
            </LoadScript>
          </Col>
        </Row>
      </BoxPrimary>

      <BoxPrimary title="Crop">
        <Form.Item className="mb-0" name="profile_crop_id">
          <Select
            mode="multiple"
            showSearch
            disabled={isViewMode}
            placeholder="Select main crop"
            options={cropSelectOptions}
            value={profileCropIds}
            onChange={onProfileCropChange}
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
      <Collapse
        defaultActiveKey={[latestGalleryYear]}
        className="farmer-gallery-collapse"
        items={galleryYears.map((year) => ({
          key: year,
          label: (
            <div className="flex justify-between items-center pr-2">
              <span className="font-semibold text-base">{`Year ${year}`}</span>
              <span className="text-gray-400 text-sm">{`${
                (galleryByYear[year] || []).length
              }/${GALLERY_MAX_IMAGES_PER_YEAR}`}</span>
            </div>
          ),
          children: (
            <div className="flex flex-wrap gap-4 items-center">
              <Upload
                listType="picture-card"
                fileList={galleryByYear[year] || []}
                customRequest={(options) => handleUploadGallery(options, year)}
                onRemove={(file) => removeGalleryItem(year, file.uid)}
                onPreview={handleGalleryPreview}
                disabled={isViewMode}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: canUpdate,
                }}
              >
                {canUpdate &&
                  (galleryByYear[year] || []).length < GALLERY_MAX_IMAGES_PER_YEAR && (
                    <div className="flex flex-col items-center gap-2 text-[#00783F]">
                      <UploadOutlined />
                      <span>Upload</span>
                    </div>
                  )}
              </Upload>

              {(galleryByYear[year] || []).length === 0 && (
                <div className="text-gray-400">No gallery in this year</div>
              )}

              <Image
                className="hidden"
                src={galleryPreview.src}
                preview={{
                  open: galleryPreview.open,
                  visible: galleryPreview.open,
                  src: galleryPreview.src,
                  title: galleryPreview.title,
                  onOpenChange: (open) =>
                    setGalleryPreview((prev) => ({
                      ...prev,
                      open,
                    })),
                  onVisibleChange: (open) =>
                    setGalleryPreview((prev) => ({
                      ...prev,
                      open,
                    })),
                }}
              />
            </div>
          ),
        }))}
      />
    </BoxPrimary>
  );

  const totalFarmSize = useMemo(() => {
    return farmSizeRows.reduce((acc, item) => {
      const val = Number(String(item.size || "").replace(/,/g, "").trim());
      return acc + (Number.isFinite(val) ? val : 0);
    }, 0);
  }, [farmSizeRows]);

  const watchEst = Form.useWatch("est", form);
  const averageEstPerSize = useMemo(() => {
    const rawEst = watchEst !== undefined && watchEst !== null ? watchEst : form.getFieldValue("est");
    const estVal = Number(String(rawEst || "").replace(/,/g, "").trim());
    if (Number.isFinite(estVal) && estVal > 0 && totalFarmSize > 0) {
      return (estVal / totalFarmSize).toFixed(2);
    }
    return "0.00";
  }, [totalFarmSize, watchEst, form]);

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
                  {canUpdate && item.key !== 1 && (
                    <button
                      type="button"
                      onClick={() => removeFarmSizeRow(item.key)}
                      className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-50"
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
            Add Crop
          </Button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200">
          <div>
            <div className="text-[13px] font-semibold text-[#2f2522] mb-1.5">Total Size</div>
            <Input
              disabled
              value={totalFarmSize.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              className="w-full bg-[#f5f5f5]"
            />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[#2f2522] mb-1.5">Average Input (บาทต่อไร่ต่อปี)</div>
            <Input
              disabled
              value={Number(averageEstPerSize).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              className="w-full bg-[#f5f5f5]"
            />
          </div>
        </div>
      </BoxPrimary>

      <BoxPrimary title="Crop Calendar">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1500px] border-collapse">
            <thead>
              <tr className="bg-[#00783F] text-white">
                <th className="p-2 text-left">Crop</th>
                <th className="p-2 text-left">Stage</th>
                {MONTHS.map((month) => (
                  <th key={month.key} className="p-2 text-center">
                    {month.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cropCalendarRows.length > 0 ? (
                cropCalendarRows.map((row, index) => {
                  const rowKey = `${row.farmer_crop_id}-${row.farmer_crop_stage_id}`;
                  const isFirstCropRow =
                    index === 0 ||
                    Number(cropCalendarRows[index - 1]?.farmer_crop_id) !==
                    Number(row.farmer_crop_id);
                  const cropRowSpan = cropCalendarRows.filter(
                    (item) =>
                      Number(item.farmer_crop_id) === Number(row.farmer_crop_id)
                  ).length;
                  const isEditingCrop =
                    editingCalendarCropRowKey === rowKey &&
                    Number(editingCalendarCropId) === Number(row.farmer_crop_id);
                  return (
                    <tr key={rowKey} className="border-b border-gray-100">
                      {isFirstCropRow && (
                        <td
                          rowSpan={cropRowSpan}
                          className="p-2 min-w-[260px] align-top"
                        >
                          <div className="flex items-center gap-2">
                            {isEditingCrop ? (
                              <>
                                <Input
                                  value={editingCalendarCropValue}
                                  disabled={isViewMode}
                                  onChange={(event) =>
                                    setEditingCalendarCropValue(event.target.value)
                                  }
                                />
                                <Button
                                  type="text"
                                  className="text-red-500"
                                  icon={<CloseOutlined />}
                                  onClick={cancelCalendarCropEdit}
                                />
                                <Button
                                  type="text"
                                  className="text-green-600"
                                  icon={<CheckOutlined />}
                                  onClick={confirmCalendarCropEdit}
                                />
                              </>
                            ) : (
                              <>
                                <span>{getCalendarCropLabel(row)}</span>
                                {canUpdate && (
                                  <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => startCalendarCropEdit(row)}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="p-2">{row.stage_name}</td>
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
                  <td colSpan={14} className="text-center text-gray-400 py-8">
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
        <div className="farmer-form-page [&_.ant-form-item]:!mb-3.5 [&_.ant-form-item-row]:!flex-col [&_.ant-form-item-row]:!items-stretch [&_.ant-form-item-label]:!max-w-full [&_.ant-form-item-label]:!flex-none [&_.ant-form-item-label]:!pb-1.5 [&_.ant-form-item-label]:!text-left [&_.ant-form-item-label]:!whitespace-normal [&_.ant-form-item-label>label]:!h-auto [&_.ant-form-item-label>label]:!text-[13px] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label>label]:!leading-tight [&_.ant-form-item-label>label]:!text-[#2f2522] [&_.ant-form-item-control]:!max-w-full [&_.ant-form-item-control]:!w-full [&_.ant-form-item-control]:!flex-none [&_.ant-input]:!min-h-[38px] [&_.ant-input]:!rounded-md [&_.ant-picker]:!min-h-[38px] [&_.ant-picker]:!rounded-md [&_.ant-select-selector]:!min-h-[38px] [&_.ant-select-selector]:!rounded-md [&_.ant-select-single_.ant-select-selector]:!items-center [&_.ant-checkbox-group]:!w-full">
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
                key: "farm",
                label: <span className="tab-title">Crop Calendar</span>,
                children: farmSizeCalendarTab,
              },
              {
                key: "gallery",
                label: <span className="tab-title">Gallery</span>,
                children: galleryTab,
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
        </div>
      </MainLayout>
    </Form>
  );
}
