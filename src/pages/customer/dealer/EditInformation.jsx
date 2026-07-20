import React, { useContext, useEffect, useMemo, useState } from "react";
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
  Checkbox,
} from "antd";
import { values } from "lodash";
import dayjs from "dayjs";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import TableComponent from "../../../components/table/TableComponent";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import DynamicModal from "../../../components/modal/DynamicModal";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const { Option } = Select;

const DEFAULT_MAP_CENTER = {
  lat: 13.9572612,
  lng: 100.6222401,
};

const getSaveErrorMessage = (error) => {
  const data = error?.response?.data;
  if (!data) {
    return {
      title: "เกิดข้อผิดพลาด",
      lines: [error?.message || "Unable to save data."],
    };
  }

  if (data.errors && typeof data.errors === "object") {
    const lines = Object.values(data.errors).flat().filter(Boolean);
    return {
      title: "เกิดข้อผิดพลาด",
      lines: lines.length ? lines : ["Please complete all required fields."],
    };
  }

  const messageLines = data.data?.message_line || data.message_line;
  if (messageLines) {
    return {
      title: data.message || data.data?.message || "เกิดข้อผิดพลาด",
      lines: Array.isArray(messageLines) ? messageLines : [messageLines],
    };
  }

  const fallbackMessage =
    data.data?.message || data.message || "Unable to save data.";
  return {
    title: "เกิดข้อผิดพลาด",
    lines: [fallbackMessage],
  };
};

export default function EditInformation() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState([]);
  const [activeTabKey, setActiveTabKey] = useState("profile");
  const [tableLoading, setTableLoading] = useState(false);
  const location = useLocation();
  const [networkList, setNetworkList] = useState([]); // Default state for network list
  const [companyinfo, setcompanyinfo] = useState([]);
  const [contactItems, setContactItems] = useState([]); // State for contact items
  const [form] = Form.useForm();
  const [isTerritoryModalVisible, setIsTerritoryModalVisible] = useState(false);
  const [isTerritoryModalFarmer, setIsTerritoryModalFarmer] = useState(false);

  const [userList, setUserList] = useState([]);
  const [farmerList, setFarmerList] = useState([]);
  const [farmerListItem, setFarmerListItem] = useState([]);

  const [personitem, setpersonitem] = useState([]);
  const [cropOptions, setCropOptions] = useState([]);
  const [defaultSelectedCrops, setDefaultSelectedCrops] = useState([]); // กำหนด state สำหรับ defaultSelectedCrops
  const [profileImage, setProfileImage] = useState("/img/profile.jpg"); // Default value
  const [dataLoaded, setDataLoaded] = useState(false);
  const { userInfo, showNotification } = useContext(AuthContext);
  const [dataApiKey, setDataApiKay] = useState(
    "AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik"
  );
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_MAP_CENTER);
  const [dataMapZoom, setDataMapZoom] = useState(15);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isMapEnabled, setIsMapEnabled] = useState(false);
  const [targetGroupOptions, setTargetGroupOptions] = useState([]);

  // อ่านสถานะ mod จาก state
  const mode = location.state?.mod || "";
  const isViewMode = mode === "View";
  const isCreateMode = mode === "create" || mode === "Create";

  useEffect(() => {
    const loadTargetGroups = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathTargetGroupList, {
          target_name: 1,
          type_name: "",
          status: 1,
          page_size: 100,
          page_length: 1,
        });
        const list = res?.data?.data || [];
        setTargetGroupOptions(
          list.map((item) => ({
            id: Number(item.type),
            name: item.type_name,
          }))
        );
      } catch (error) {
        console.error("Load target group failed:", error);
      }
    };

    loadTargetGroups();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isCreateMode) {
          setcompanyinfo({ use_flag: 1, group_code: "FMK Customers" });
          form.setFieldsValue({
            use_flag: 1,
            group_code: "FMK Customers",
          });
        } else if (location.state?.id) {
          await fetchDealerDetails(location.state.id);
        }
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

  const formFields = useMemo(
    () => [
    {
      label: "",
      name: "profile",
      type: "picture",
      required: false,
      col: 24,
    },
    {
      label: "Dealer Name (EN)",
      name: "dealer_name_en",
      type: "text",
      disabled: isViewMode,
      required: isCreateMode,
      col: 6,
    },
    {
      label: "Dealer Name (TH)",
      name: "dealer_name_th",
      type: "text",
      disabled: isViewMode,
      required: false,
      col: 6,
    },
    {
      label: "Dealer Code",
      name: "dealer_code",
      type: "text",
      disabled: isViewMode || !isCreateMode,
      required: isCreateMode,
      col: 6,
    },
    {
      label: "Tax ID",
      name: "tax_id",
      type: "text",
      disabled: isViewMode,
      required: false,
      col: 6,
    },
    {
      label: "Contact Number",
      name: "contact_number",
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
      label: "Group Code",
      name: "group_code",
      type: "select",
      options: ["FMK Customers"],
      disabled: false,
      required: false,
      col: 6,
      value: "FMK Customers",
    },
    {
      label: "Date of Anniversary",
      name: "date_of_anniversary",
      type: "date",
      disabled: isViewMode,
      required: false,
      col: 6,
    },
    {
      label: "Date of Joining",
      name: "date_of_joining",
      type: "date",
      disabled: isViewMode,
      required: false,
      col: 6,
    },
    {
      label: "Status",
      name: "use_flag",
      type: "select",
      required: false,
      col: 6,
      disabled: isViewMode,
      options: [
        { name: "Active", id: 1, selected: true },
        { name: "Inactive", id: 0, selected: false },
      ],
      value: 1,
    },
    {
      label: "Target Group",
      name: "target_group",
      type: "select",
      options: targetGroupOptions,
      required: true,
      col: 6,
      disabled: isViewMode,
    },
    {
      label: "Outlet Location Please select a location on the map",
      labelColor: "red",
      name: "outlet_location",
      type: "text",
      required: false,
      col: 24,
      iconSrc: "/img/icons/location.png",
      iconPosition: "right",
      disabled: isViewMode,
    },
  ],
    [isViewMode, isCreateMode, targetGroupOptions]
  );

  const header = [
    { title: "No", width: 50, dataIndex: "no", align: "center" },
    { title: "Sub Dealer Name", width: 160, dataIndex: "subDealerName", align: "left" },
    { title: "Farmer Name", width: 160, dataIndex: "farmerName", align: "left" },
    {
      title: "Contact Person",
      width: 200,
      dataIndex: "contactperson",
      align: "left",
    },
    {
      title: "Phone No.",
      width: 150,
      dataIndex: "mobilePhone",
      align: "center",
    },
    {
      title: "On Shop",
      width: 100,
      dataIndex: "onshop",
      align: "center",
      render: (_, record) => (
        <Checkbox
          checked={record.onshop}
          disabled={isViewMode}
          onChange={() => handleNetworkOnShopChange(record)}
        />
      ),
    },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    ...(!isViewMode
      ? [{ title: "Action", width: 100, dataIndex: "action", align: "center" }]
      : []),
  ];

  const actionItems = [
    {
      key: "1",
      label: <ItemDropDown mode="edit" link="/customer/dealer/edit-info" />,
    },
  ];

  const handleDeleteItem = async (record) => {
    setNetworkList((prevList) =>
      (prevList || []).filter((item) => item.key !== record)
    );
  };

  const handleDeleteFarmer = async (record) => {
    setFarmerListItem((prevList) =>
      (prevList || []).filter((item) => item.key !== record)
    );
  };

  const fetchDealerDetails = async (id) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(
        `${paths.pathCustomerDealerDetail}?id=${id}`
      );
      if (response.status === 200) {
        const { data } = response;
        setcompanyinfo(data);
        form.setFieldsValue({
          profile: data.photo_path,
          dealer_name_en: data.dealer_name_en,
          dealer_name_th: data.dealer_name_th,
          dealer_code: data.dealer_code,
          tax_id: data.tax_id,
          contact_number: data.contact_number,
          address: data.address,
          group_code: data.group_code || "FMK Customers",
          date_of_anniversary: data.date_of_anniversary
            ? dayjs(data.date_of_anniversary)
            : null,
          date_of_joining: data.date_of_joining
            ? dayjs(data.date_of_joining)
            : null,
          use_flag: parseInt(data.use_flag, 10) === 1 ? 1 : 0,
          target_group: data.target_group_id
            ? Number(data.target_group_id)
            : data.target_group
              ? Number(data.target_group)
              : undefined,
          outlet_location: data.location_address,
        });
        setContactItems(data.contact_items);
        setProfileImage(data.photo_path);
        setCropOptions(data.crop_list || []);
        const cropNames = data.crop_list?.map((crop) => Number(crop.id)) || [];
        setDefaultSelectedCrops(cropNames);
        const lat = parseFloat(data.location_latitude) || 13.9572612;
        const lng = parseFloat(data.location_longitude) || 100.6222401;
        setCurrentLocation({ lat, lng });
        const newDataNetwork = data.network_list?.map((item, index) => ({
          key: item.sub_dealer_id,
          no: index + 1,
          name: item.sub_dealer_name || "-",
          contactperson: item.sub_dealer_contact_name || "-",
          mobilePhone: item.sub_dealer_contact_phone_number || "-",
          onshop: item.is_on_shop || false,
          status: (
            <BadgeStatus
              text={item.sub_dealer_channel_type_name}
              bgColor={item.sub_dealer_channel_type_bg_color}
              textColor={item.sub_dealer_channel_type_color}
            />
          ),
          action: (
            <>
              <DynamicButton
                iconSrc="/img/icons/delete.png"
                onClick={() => handleDeleteItem(item.sub_dealer_id)}
              />
            </>
          ),
        }));
        setNetworkList(newDataNetwork);

        const FarmerDataNetwork = data.network_farmer_list?.map(
          (item, index) => ({
            key: item.farmer_id,
            no: index + 1,
            name: item.farmer_name || "-",
            contactperson: item.farmer_contact_name || "-",
            mobilePhone: item.farmer_contact_phone_number || "-",
            onshop: item.is_on_shop || false,
            status: (
              <BadgeStatus
                text={item.farmer_channel_type}
                bgColor={item.farmer_channel_type_bg_color}
                textColor={item.farmer_channel_type_color}
              />
            ),
            action: (
              <>
                <DynamicButton
                  iconSrc="/img/icons/delete.png"
                  onClick={() => handleDeleteFarmer(item.farmer_id)}
                />
              </>
            ),
          })
        );
        setFarmerListItem(FarmerDataNetwork);
      } else {
        console.error("Failed to fetch data:", response.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContact = (index) => {
    setContactItems((prev) => prev.filter((_, i) => i !== index));
  };

  const renderContactItems = () =>
    contactItems.map((contact, index) => (
      <div key={index} className="mb-6">
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-md">{`Person ${index + 1
            }`}</span>
          {index > 0 && !isViewMode && (
            <ActionButton
              mode="delete"
              text="Delete"
              onClick={() => handleRemoveContact(index)}
              disabled={isViewMode}
            />
          )}
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Name (EN)"
              value={contact.name_en || ""}
              onChange={(e) =>
                handleContactChange(index, "name_en", e.target.value)
              }
              disabled={isViewMode}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Name (TH)"
              value={contact.name_th || ""}
              onChange={(e) =>
                handleContactChange(index, "name_th", e.target.value)
              }
              disabled={isViewMode}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Nickname"
              value={contact.nickname || ""}
              onChange={(e) =>
                handleContactChange(index, "nickname", e.target.value)
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
              onChange={(date, dateString) =>
                handleContactChange(index, "date_of_birth", dateString)
              }
              disabled={isViewMode}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Age"
              value={contact.age || ""}
              onChange={(e) =>
                handleContactChange(index, "age", e.target.value)
              }
              disabled={true}
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="T-Shirt Size"
              value={contact.t_shirt_size || ""}
              onChange={(e) =>
                handleContactChange(index, "t_shirt_size", e.target.value)
              }
              disabled={isViewMode}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Relationship"
              value={contact.relationship || ""}
              onChange={(e) =>
                handleContactChange(index, "relationship", e.target.value)
              }
              disabled={isViewMode}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Duty"
              value={contact.duty || ""}
              onChange={(e) =>
                handleContactChange(index, "duty", e.target.value)
              }
              disabled={isViewMode}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Tel 1"
              value={contact.tel1 || ""}
              onChange={(e) =>
                handleContactChange(index, "tel1", e.target.value)
              }
              disabled={isViewMode}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Tel 2"
              value={contact.tel2 || ""}
              onChange={(e) =>
                handleContactChange(index, "tel2", e.target.value)
              }
              disabled={isViewMode}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Contact Number"
              value={contact.contact_number || ""}
              onChange={(e) =>
                handleContactChange(index, "contact_number", e.target.value)
              }
              disabled={isViewMode}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Email"
              value={contact.email || ""}
              onChange={(e) =>
                handleContactChange(index, "email", e.target.value)
              }
              disabled={isViewMode}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Line ID"
              value={contact.line_id || ""}
              onChange={(e) =>
                handleContactChange(index, "line_id", e.target.value)
              }
              disabled={isViewMode}
            />
          </Col>
          <Col xs={24} sm={18} md={18} lg={18}>
            <Input
              placeholder="hobby"
              value={contact.hobby || ""}
              onChange={(e) =>
                handleContactChange(index, "hobby", e.target.value)
              }
              disabled={isViewMode}
            />
          </Col>
        </Row>
        <hr className="my-4" />
      </div>
    ));

  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };

  const handleOpenTerritoryModal = async () => {
    await fetchUserList(); // ดึงข้อมูลผู้ใช้ก่อนเปิดโมดอล
    setIsTerritoryModalVisible(true); // แสดงโมดอลหลังข้อมูลพร้อม
  };

  const handleCloseTerritoryModal = () => {
    setIsTerritoryModalVisible(false);
  };

  const handleOpenFarmerModal = async () => {
    await fetchUserFamer();
    setIsTerritoryModalFarmer(true);
  };

  const handleCloseFarmerModal = () => {
    setIsTerritoryModalFarmer(false);
  };

  const handleAddSelectedRows = (selectedRows) => {
    if (!Array.isArray(selectedRows)) {
      console.error("selectedRows is not an array:", selectedRows);
      return;
    }

    const newRows = selectedRows.map((row, index) => ({
      key: row.key,
      no: (networkList?.length || 0) + index + 1,
      name: row.name || "-",
      contactperson: row.contactperson || "-",
      mobilePhone: row.territory || "-",
      onshop: row.onshop || false,
      status: (
        <BadgeStatus
          text={row.position || "-"}
          bgColor={row.statusBgColor || "#E0E0E0"}
          textColor={row.statusTextColor || "#000000"}
        />
      ),
      action: (
        <DynamicButton
          iconSrc="/img/icons/delete.png"
          onClick={() => handleDeleteItem(row.key)}
        />
      ),
    }));

    setNetworkList((prevList) => {
      const existingKeys = (prevList || []).map((item) => item.key); // ป้องกัน undefined
      const filteredNewRows = newRows.filter(
        (row) => !existingKeys.includes(row.key)
      );
      if (filteredNewRows.length === 0) {
        showNotification("error", "Sale Territory has already been added.");
        return prevList || [];
      } else {
        showNotification("success", "Add sale territory success.");
        return [...(prevList || []), ...filteredNewRows];
      }
    });
  };

  const handleAddSelectedRowsFarmer = (selectedRows) => {
    console.log(selectedRows);

    if (!Array.isArray(selectedRows)) {
      console.error("selectedRows is not an array:", selectedRows);
      return;
    }

    const newRows = selectedRows.map((row, index) => ({
      key: row.key, // Unique identifier
      no: (farmerListItem?.length || 0) + index + 1, // Row number
      name: row.name || "-", // Farmer Name
      mobilePhone: row.territory || "-", // Contact Number
      onshop: row.onshop || false,
      status: (
        <BadgeStatus
          text={row.farmer_channel_type_name || "-"} // Status text
          bgColor={row.farmer_channel_type_bg_color || "#E0E0E0"} // Background color
          textColor={row.farmer_channel_type_color || "#000000"} // Text color
        />
      ),
      action: (
        <DynamicButton
          iconSrc="/img/icons/delete.png"
          onClick={() => handleDeleteFarmer(row.key)} // Delete handler
        />
      ),
    }));

    setFarmerListItem((prevList) => {
      const existingKeys = (prevList || []).map((item) => item.key); // ป้องกัน undefined
      const filteredNewRows = newRows.filter(
        (row) => !existingKeys.includes(row.key)
      );
      console.log(filteredNewRows);

      if (filteredNewRows.length === 0) {
        showNotification("error", "Sale Territory has already been added.");
        return prevList || [];
      } else {
        showNotification("success", "Add sale territory success.");
        return [...(prevList || []), ...filteredNewRows];
      }
    });
  };

  const handleSubDealerOnShopChange = (key) => {
    setNetworkList((prevList) =>
      prevList.map((item) =>
        item.key === key ? { ...item, onshop: !item.onshop } : item
      )
    );
  };

  const handleFarmerOnShopChange = (key) => {
    setFarmerListItem((prevList) =>
      prevList.map((item) =>
        item.key === key ? { ...item, onshop: !item.onshop } : item
      )
    );
  };

  const handleNetworkOnShopChange = (record) => {
    if (record.networkType === "farmer") {
      handleFarmerOnShopChange(record.rawKey);
      return;
    }

    handleSubDealerOnShopChange(record.rawKey);
  };

  const fetchUserList = async (page_size = 20, page_length = 1) => {
    setLoading(true);
    const requestData = {
      platform: "web",
      page_size,
      page_length,
      mode: "mapping",
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathMasterSubDealer,
        requestData
      );
      if (response.status === 200) {
        const data = response.data;
        const territoryData = data.map((item, index) => ({
          key: item.sub_dealer_id,
          no: index + 1,
          name: item.sub_dealer_name,
          territory: item.sub_dealer_contact_phone_number,
          positionText: item.sub_dealer_channel_type_name,
          position: (
            <BadgeStatus
              text={item.sub_dealer_channel_type_name}
              bgColor={item.sub_dealer_channel_type_bg_color}
              textColor={item.sub_dealer_channel_type_color}
            />
          ),
        }));
        setUserList(territoryData);
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFamer = async (page_size = 20, page_length = 1) => {
    setLoading(true);
    const requestData = {
      platform: "web",
      page_size,
      page_length,
    };
    try {
      const response = await useServiceAPI.get(
        paths.pathMasterFarmer,
        requestData
      );

      if (response.status === 200) {
        const data = response.data;
        console.log(data);

        const territoryFarmerData = data.map((item, index) => ({
          key: item.farmer_id,
          no: index + 1,
          name: item.farmer_name,
          farm_name: item.farm_name,
          nickname: item.nickname,
          territory: item.farmer_contact_phone_number,
          farmer_channel_type_name: item.farmer_channel_type_name,
          farmer_channel_type_bg_color: item.farmer_channel_type_bg_color,
          farmer_channel_type_color: item.farmer_channel_type_color,
          position: (
            <BadgeStatus
              text={item.farmer_channel_type_name}
              bgColor={item.farmer_channel_type_bg_color}
              textColor={item.farmer_channel_type_color}
            />
          ),
        }));
        setFarmerList(territoryFarmerData);
      }
    } catch (error) {
      console.error("Error fetching Farmer list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = () => {
    // เพิ่ม object ใหม่ลงใน contactItems state
    setContactItems((prev) => [
      ...prev,
      { id: prev.length + 1, name: "", phone: "" },
    ]);
  };

  const transformedCropOptions = cropOptions.map((option) => ({
    label: option.name, // เปลี่ยนจาก name เป็น label
    value: option.id, // คงค่า value เดิมไว้
  }));

  useEffect(() => {
    // console.log(defaultSelectedCrops)
  }, [defaultSelectedCrops]);

  const combinedNetworkList = [
    ...(networkList || []).map((item) => ({
      ...item,
      key: `sub-dealer-${item.key}`,
      rawKey: item.key,
      networkType: "sub_dealer",
      subDealerName: item.name || "-",
      farmerName: "-",
      action: isViewMode ? "-" : (
        <DynamicButton
          iconSrc="/img/icons/delete.png"
          onClick={() => handleDeleteItem(item.key)}
        />
      ),
    })),
    ...(farmerListItem || []).map((item) => ({
      ...item,
      key: `farmer-${item.key}`,
      rawKey: item.key,
      networkType: "farmer",
      subDealerName: "-",
      farmerName: item.name || "-",
      action: isViewMode ? "-" : (
        <DynamicButton
          iconSrc="/img/icons/delete.png"
          onClick={() => handleDeleteFarmer(item.key)}
        />
      ),
    })),
  ].map((item, index) => ({
    ...item,
    no: index + 1,
  }));

  const buildProfilePayload = (values) => {
    let useFlagValue;
    if (values.use_flag === 1 || values.use_flag === 0) {
      useFlagValue = values.use_flag;
    } else if (values.use_flag === undefined || values.use_flag === null) {
      useFlagValue = Number(companyinfo.use_flag ?? 1);
    } else {
      useFlagValue = values.use_flag === "Active" ? 1 : 0;
    }

    return {
      ...(isCreateMode ? {} : { id: location.state.id }),
      dealer_name_en: values.dealer_name_en || "",
      dealer_name_th: values.dealer_name_th || "",
      dealer_code: values.dealer_code || "",
      tax_id: values.tax_id || "",
      contact_number: values.contact_number || "",
      address: values.address || "",
      group_code: values.group_code || "",
      date_of_anniversary: values.date_of_anniversary || "",
      date_of_joining: values.date_of_joining || "",
      photo_path: values.profile || "",
      location_address: values.outlet_location || "",
      location_longitude: currentLocation.lng || "",
      location_latitude: currentLocation.lat || "",
      use_flag: useFlagValue,
      target_group:
        values.target_group ??
        (companyinfo.target_group_id
          ? Number(companyinfo.target_group_id)
          : companyinfo.target_group
            ? Number(companyinfo.target_group)
            : null),
      bank_account_items: companyinfo.bank_account_items || [],
      contact_items: contactItems.map((item) => ({
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
        age: item.age || null,
        hobby: item.hobby || null,
      })),
      crop_list: defaultSelectedCrops || [],
      ...(isCreateMode
        ? {}
        : {
            network_list_sub_dealer: networkList.map((item) => ({
              sub_dealer_id: item.key,
              is_on_shop: item.onshop,
            })),
            network_list_farmer: farmerListItem.map((item) => ({
              farmer_id: item.key,
              is_on_shop: item.onshop,
            })),
          }),
      platform: "web",
    };
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const formattedData = buildProfilePayload(values);
        const saveRequest = isCreateMode
          ? useServiceAPI.post(paths.pathCustomerDealerCreate, formattedData, setLoading)
          : useServiceAPI.put(paths.pathCustomerSubDealerUpdate, formattedData);

        saveRequest
          .then((response) => {
            if (response.status === 200) {
              navigate("/customer/dealer");
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              );
            } else {
              const { title, lines } = getSaveErrorMessage({
                response: { data: response },
              });
              showNotification("error", title, lines);
            }
          })
          .catch((error) => {
            console.error("Save failed:", error);
            const { title, lines } = getSaveErrorMessage(error);
            showNotification("error", title, lines);
          });
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
        showNotification("error", "Please complete all required fields.");
      });
  };

  const networkhandleSave = () => {
    // Validate form fields if needed
    form
      .validateFields()
      .then((values) => {
        let useFlagValue;
        if (values.use_flag === 1 || values.use_flag === 0) {
          useFlagValue = values.use_flag;
        } else if (values.use_flag === undefined || values.use_flag === null) {
          useFlagValue = Number(companyinfo.use_flag || 0);
        } else {
          useFlagValue = values.use_flag === "Active" ? 1 : 0;
        }

        const formattedData = {
          id: location.state.id,
          dealer_name_en: values.dealer_name_en || companyinfo.dealer_name_en || "",
          dealer_name_th: values.dealer_name_th || companyinfo.dealer_name_th || "",
          dealer_code: values.dealer_code || companyinfo.dealer_code || "",
          tax_id: values.tax_id || companyinfo.tax_id || "",
          contact_number: values.contact_number || companyinfo.contact_number || "",
          address: values.address || companyinfo.address || "",
          group_code: values.group_code || companyinfo.group_code || "",
          date_of_anniversary:
            values.date_of_anniversary || companyinfo.date_of_anniversary || "",
          date_of_joining: values.date_of_joining || companyinfo.date_of_joining || "",
          photo_path: values.profile || companyinfo.photo_path || "",
          location_address: values.outlet_location || companyinfo.location_address || "",
          location_longitude: currentLocation.lng || "",
          location_latitude: currentLocation.lat || "",
          use_flag: useFlagValue,
          target_group:
            values.target_group ??
            (companyinfo.target_group_id
              ? Number(companyinfo.target_group_id)
              : companyinfo.target_group
                ? Number(companyinfo.target_group)
                : null),
          bank_account_items: companyinfo.bank_account_items || [],
          contact_items: contactItems.map((item) => ({
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
            age: item.age || null,
            hobby: item.hobby || null,
          })),
          crop_list: defaultSelectedCrops || [],
          network_list_sub_dealer: networkList.map((item) => ({
            sub_dealer_id: item.key,
            is_on_shop: item.onshop,
          })),
          network_list_farmer: farmerListItem.map((item) => ({
            farmer_id: item.key,
            is_on_shop: item.onshop,
          })),
          platform: "web",
        };

        useServiceAPI
          .put(paths.pathCustomerSubDealerUpdate, formattedData)
          .then((response) => {
            if (response.status === 200) {
              navigate("/customer/dealer");
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
        showNotification("error", "Please complete all required fields.");
      });
  };

  const FarmerhandleSave = () => {
    // Validate form fields if needed
    form
      .validateFields()
      .then(() => {
        const formattedData = {
          id: location.state.id,
          network_list: farmerListItem.map((item) => ({
            farmer_id: item.key,
            is_on_shop: true,
          })),
        };

        useServiceAPI
          .put(paths.pathCustomerSubDealerFarmerUpdate, formattedData) // paths.pathNetworkSave = URL API
          .then((response) => {
            if (response.status === 200) {
              navigate("/customer/dealer");
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
        showNotification("error", "Please complete all required fields.");
      });
  };

  const handleBankAccountChange = (index, field, value) => {
    const updatedAccounts = companyinfo.bank_account_items?.length
      ? [...companyinfo.bank_account_items]
      : Array(2).fill({
        account_title: "",
        account_number: "",
        bank_name: "",
        bank_branch: "",
      });

    // อัปเดตค่าของฟิลด์ที่เปลี่ยนแปลงในรายการที่เลือก
    updatedAccounts[index] = {
      ...updatedAccounts[index],
      [field]: value,
    };
    setcompanyinfo({ ...companyinfo, bank_account_items: updatedAccounts });
  };

  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...contactItems];

    if (field === "date_of_birth") {
      const birthDate = dayjs(value);
      const currentYear = dayjs().year();
      const age = currentYear - birthDate.year(); // คำนวณอายุ
      updatedContacts[index][field] = value; // อัปเดตวันเกิด
      updatedContacts[index]["age"] = age; // อัปเดตอายุ
    } else {
      updatedContacts[index][field] = value; // อัปเดตฟิลด์อื่นๆ
    }

    setContactItems(updatedContacts); // อัปเดต state
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

  const handleGetLocationToGoogleMap = () => {
    if (currentLocation.lat && currentLocation.lng) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLocation.lat},${currentLocation.lng}`;
      window.open(googleMapsUrl, "_blank");
    } else {
      showNotification("error", "No latitude and longitude data available.");
    }
  };

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
            setcompanyinfo((prev) => ({
              ...prev,
              location_address: locationName,
            }));
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
      if (newState && isCreateMode) {
        getUserCurrentLocation();
      }
      return newState;
    });
  };

  const hasValidMapLocation =
    Number.isFinite(currentLocation.lat) && Number.isFinite(currentLocation.lng);


  let items = [
    {
      key: "profile",
      label: <span className="tab-title">Profile</span>,
      children: (
        <>
          {dataLoaded ? (
            <FormUser profile={profileImage} fields={formFields} form={form} disableImageUpload={isViewMode} />
          ) : (
            <div></div>
          )}

          <div
            className={`bg-white p-4`}
            style={{
              boxShadow: "rgba(0, 0, 0, 0.1)", // Optional for a subtle shadow
              marginTop: "-20px",
            }}
          >
            <div className="text-[#00783F] text-lg font-semibold mb-3">
              <div className="flex justify-end space-x-4 mb-2">
                <ActionButton
                  text={isMapEnabled ? "Close Google" : "Open Google"}
                  mode="custom"
                  onClick={handleToggleMap}
                  disabled={isViewMode}
                  className={isMapEnabled ? "bg-[#f11113]" : "bg-[#00783F]"} // สีแดง/เขียว
                />

                <button
                  className="w-8 h-8  bg-white rounded hover:shadow"
                  onClick={handleGetLocationToGoogleMap}
                  title="Open in Google Maps"
                  disabled={!hasValidMapLocation}
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
                  center={hasValidMapLocation ? currentLocation : DEFAULT_MAP_CENTER}
                  zoom={dataMapZoom}
                  onClick={(e) => {
                    if (isViewMode || !isMapEnabled || !e.latLng) return;
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    setCurrentLocation({ lat, lng });
                  }}
                >
                  {isGoogleLoaded && hasValidMapLocation && (
                    <Marker
                      position={currentLocation}
                      icon={{
                        url: "https://adama-api.mtsc.co.th/images/activity-type-mark-location/DemoPlot.png",
                        scaledSize: { width: 30, height: 30 },
                      }}
                      draggable={!isViewMode && isMapEnabled}
                      onDragEnd={handleMarkerDragEnd}
                      options={{
                        disableDefaultUI: isViewMode || !isMapEnabled,
                        draggable: !isViewMode && isMapEnabled,
                      }}
                    />
                  )}
                </GoogleMap>
              </LoadScript>
            </div>
          </div>

          <BoxPrimary>
            {(companyinfo.bank_account_items?.length > 0
              ? companyinfo.bank_account_items
              : Array(2).fill({
                account_title: "",
                account_number: "",
                bank_name: "",
                bank_branch: "",
              })
            ) // Default 2 รายการ
              .map((account, index) => (
                <div key={index} className="my-6">
                  <div className="text-[#00783F] text-md">{`Bank Account ${index + 1
                    }`}</div>
                  <Row className="my-3" gutter={[16, 16]}>
                    {[
                      "account_title",
                      "account_number",
                      "bank_name",
                      "bank_branch",
                    ].map((field) => (
                      <Col xs={24} sm={12} md={8} lg={6} key={field}>
                        <Input
                          placeholder={field
                            .replace("_", " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())} // Capitalize placeholder
                          value={account[field] || ""}
                          onChange={(e) =>
                            handleBankAccountChange(
                              index,
                              field,
                              e.target.value
                            )
                          }
                          disabled={isViewMode}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
          </BoxPrimary>
          <BoxPrimary>
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
              <span className="text-[#00783F] text-lg font-semibold">
                Contact Person
              </span>
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
                        position: "",
                      },
                    ]);
                  }}
                />
              )}
            </div>
            {contactItems.length > 0 ? (
              renderContactItems()
            ) : (
              <div className="text-gray-500">
                No contact person information available
              </div>
            )}
          </BoxPrimary>
          <div className="flex justify-end space-x-4 mt-6">
            <ActionButton
              mode="back"
              text="Back"
              onClick={() => navigate("/customer/dealer")}
            />
            {/* <ActionButton
            mode="update"
            text="Update"
            onClick={handleSave} 
          /> */}
            {!isViewMode && (
              <ActionButton
                text={isCreateMode ? "Save" : "Update"}
                mode="save"
                onClick={handleSave}
              />
            )}
          </div>
        </>
      ),
    },
    {
      key: "network",
      label: <span className="tab-title">Network</span>,
      disabled: isCreateMode,
      children: (
        <>
          <BoxPrimary>
            <div className="flex justify-between space-x-4 mb-3">
              <span className="text-[#00783F] text-lg font-semibold">
                Network
              </span>
              {!isViewMode && (
                <div className="flex space-x-2">
                  <ActionButton
                    mode="add"
                    text="Add Sub Dealer"
                    onClick={handleOpenTerritoryModal}
                  />
                  <ActionButton
                    mode="add"
                    text="Add Farmer"
                    onClick={handleOpenFarmerModal}
                  />
                </div>
              )}
            </div>
            <TableComponent header={header} dataSource={combinedNetworkList} />
          </BoxPrimary>
          <div className="flex justify-end space-x-4 mt-6 mb-6">
            <ActionButton
              mode="back"
              text="Back"
              onClick={() => navigate(-1)}
            />
            {!isViewMode && (
              <ActionButton
                text="Update Network"
                mode="update"
                onClick={networkhandleSave}
              />
            )}
          </div>
        </>
      ),
    },
  ];

  if (isViewMode) {
    items = items.map((field) => {
      if (field.key === "network") {
        return field;
      } else if (field.key === "profile") {
        return field;
      }
      return {
        ...field,
        disabled: true,
      };
    });
  }

  return (
    <MainLayout loading={loading}>
      <div className="title-page">
        {isViewMode
          ? "View Information"
          : isCreateMode
            ? "Create Information"
            : "Edit Information"}
      </div>
      <Tabs
        activeKey={activeTabKey}
        onChange={handleTabChange}
        className="custom-tabs"
        items={items}
      />

      <DynamicModal
        title="Add Sale Territory"
        isVisible={isTerritoryModalVisible}
        onClose={handleCloseTerritoryModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          { title: "Name", dataIndex: "name", key: "name", width: 150 },
          {
            title: "Phone No",
            dataIndex: "territory",
            key: "territory",
            width: 150,
          },
          {
            title: "Status",
            dataIndex: "position",
            key: "position",
            width: 150,
          },
        ]}
        dataSource={userList}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />

      <DynamicModal
        title="Farmer List"
        isVisible={isTerritoryModalFarmer}
        onClose={handleCloseFarmerModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          { title: "Farmer Name", dataIndex: "name", key: "name", width: 150 },
          { title: "Farm Name", dataIndex: "farm_name", key: "farm_name", width: 150 },
          { title: "Nick Name", dataIndex: "nickname", key: "nickname", width: 150 },
          {
            title: "Phone No",
            dataIndex: "territory",
            key: "territory",
            width: 150,
          },
          {
            title: "Status",
            dataIndex: "position",
            key: "position",
            width: 150,
          },
        ]}
        dataSource={farmerList}
        width="1200px"
        onAddSelected={handleAddSelectedRowsFarmer}
        type="add"
      />
    </MainLayout>
  );
}
