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
  const [currentLocation, setCurrentLocation] = useState({});
  const [dataMapZoom, setDataMapZoom] = useState(15);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isMapEnabled, setIsMapEnabled] = useState(false);

  // อ่านสถานะ mod จาก state
  const mode = location.state?.mod;
  const isViewMode = mode === "View";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchDealerDetails(location.state.id);
        const [crops] = await Promise.all([
          useServiceAPI.get(paths.pathMasterCrop, {}),
        ]);
        setCropOptions(crops.data);
        setDataLoaded(true);

        // setCropList(crops.data || []);
      } catch (error) {
        console.log(error.message);
        showNotification("เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formFields = [
    {
      label: "",
      name: "profile", // ชื่อฟิลด์ในฟอร์ม
      type: "picture", // ประเภทฟิลด์
      required: false,
      col: 24,
      value: companyinfo.photo_path,
    },
    {
      label: "Dealer Name (EN)",
      name: "dealer_name_en",
      type: "text",
      disabled: true,
      required: false,
      col: 6,
      value: companyinfo.dealer_name_en,
    },
    {
      label: "Dealer Name (TH)",
      name: "dealer_name_th",
      type: "text",
      disabled: true,
      required: false,
      col: 6,
      value: companyinfo.dealer_name_th,
    },
    {
      label: "Dealer Code",
      name: "dealer_code",
      type: "text",
      disabled: true,
      required: false,
      col: 6,
      value: companyinfo.dealer_code,
    },
    {
      label: "Tax ID",
      name: "tax_id",
      type: "text",
      disabled: true,
      required: false,
      col: 6,
      value: companyinfo.tax_id,
    },
    {
      label: "Contact Number",
      name: "contact_number",
      type: "text",
      disabled: true,
      required: false,
      col: 6,
      value: companyinfo.contact_number,
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      disabled: true,
      required: false,
      col: 12,
      value: companyinfo.address,
    },
    {
      label: "Group Code",
      name: "group_code",
      type: "select",
      options: ["FMK Customers"],
      disabled: true,
      required: false,
      col: 6,
      value: "FMK Customers",
    },
    {
      label: "Date of Anniversary",
      name: "date_of_anniversary",
      type: "date",
      disabled: true,
      required: false,
      col: 6,
      value: companyinfo.date_of_anniversary,
    },
    {
      label: "Date of Joining",
      name: "date_of_joining",
      type: "date",
      disabled: true,
      required: false,
      col: 6,
      value: companyinfo.date_of_joining,
    },
    {
      label: "Status",
      name: "use_flag",
      type: "select",
      required: false,
      col: 6,
      disabled: { isViewMode },
      options: [
        { name: "Active", id: 1, selected: true },
        { name: "Inactive", id: 0, selected: false },
      ],
      value: parseInt(companyinfo.use_flag, 10) === 1 ? "Active" : "Inactive",
    },
    {
      label: "Outlet Location Please select a location on the map",
      labelColor: "red",
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

  const header = [
    { title: "No", width: 50, dataIndex: "no", align: "center" },
    { title: "Sub Dealer Name", width: 100, dataIndex: "name", align: "left" },
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
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const headerFarmer = [
    { title: "No", dataIndex: "no", align: "center" },
    { title: "Farmer Name", dataIndex: "name", align: "left" },
    { title: "Phone No.", dataIndex: "mobilePhone", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const actionItems = [
    {
      key: "1",
      label: <ItemDropDown mode="edit" link="/customer/dealer/edit-info" />,
    },
  ];

  const handleDeleteItem = async (record) => {
    console.log("id", location.state.id);
    console.log(record);

    try {
      const requestData = {
        dealer_id: location.state.id,
        sub_dealer_id: record,
      };

      const response = await useServiceAPI.delete(
        paths.pathCustomerNetworkDelete,
        requestData
      );

      if (response.status === 200) {
        // fetchData();
        await fetchDealerDetails(location.state.id);

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

  const handleDeleteFarmer = async (record) => {
    try {
      const requestData = {
        dealer_id: location.state.id,
        farmer_id: record,
      };

      const response = await useServiceAPI.delete(
        paths.pathFarmerNetworkDelete,
        requestData
      );

      if (response.status === 200) {
        await fetchDealerDetails(location.state.id);

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

  const fetchDealerDetails = async (id) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(
        `${paths.pathCustomerDealerDetail}?id=${id}`
      );
      if (response.status === 200) {
        const { data } = response;
        setcompanyinfo(data);
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
      territory: row.territory || "-", // Contact Number
      position: (
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
          territory: item.farmer_contact_phone_number,
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

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        console.log(values);

        let useFlagValue;
        if (values.use_flag === 1 || values.use_flag === 0) {
          useFlagValue = values.use_flag; // ถ้าค่าเป็น 1 หรือ 0 อยู่แล้ว ใช้ค่าเดิม
        } else {
          useFlagValue = values.use_flag === "Active" ? 1 : 0; // แปลงค่าจาก "Active" หรือ "Inactive"
        }
        const formattedData = {
          id: location.state.id,
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
              // console.log("Save successful:", response.data);
              // navigate("/customer/dealer");
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

  const networkhandleSave = () => {
    // Validate form fields if needed
    form
      .validateFields()
      .then(() => {
        const formattedData = {
          id: location.state.id,
          network_list: networkList.map((item) => ({
            sub_dealer_id: item.key,
            is_on_shop: item.onshop,
          })),
        };

        useServiceAPI
          .put(paths.pathCustomerSubDealerNetworkUpdate, formattedData) // paths.pathNetworkSave = URL API
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

  const handleGetLocationToGoogleMap = () => {
    if (currentLocation.lat && currentLocation.lng) {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLocation.lat},${currentLocation.lng}`;
      window.open(googleMapsUrl, "_blank");
    } else {
      console.error("No latitude and longitude data available.");
    }
  };


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
                  onClick={() => setIsMapEnabled((prev) => !prev)}
                  disabled={isViewMode}
                  className={isMapEnabled ? "bg-[#f11113]" : "bg-[#00783F]"} // สีแดง/เขียว
                />

                <button
                  className="w-8 h-8  bg-white rounded hover:shadow"
                  onClick={handleGetLocationToGoogleMap}
                  title="Open in Google Maps"
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
                        url: "https://adama-api.mtsc.co.th/images/activity-type-mark-location/DemoPlot.png",
                        scaledSize: { width: 30, height: 30 },
                      }}
                      draggable={true}
                      onDragEnd={handleMarkerDragEnd}
                      options={{
                        disableDefaultUI: !isMapEnabled,
                        draggable: isMapEnabled,
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
                          disabled={true}
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
              <ActionButton text="Update" mode="update" onClick={handleSave} />
            )}
          </div>
        </>
      ),
    },
    {
      key: "network",
      label: <span className="tab-title">Network</span>,
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
                    text="Add"
                    onClick={handleOpenTerritoryModal}
                  />
                </div>
              )}
            </div>
            <TableComponent header={header} dataSource={networkList} />
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

          {/* Farmer List */}

          <BoxPrimary className="hidden">
            <div className="flex justify-between space-x-4 mb-3">
              <span className="text-[#00783F] text-lg font-semibold">
                Farmer List
              </span>
              {!isViewMode && (
                <div className="flex space-x-2">
                  <ActionButton
                    mode="add"
                    text="Add Farmer"
                    onClick={handleOpenFarmerModal}
                  />
                </div>
              )}
            </div>
            <TableComponent header={headerFarmer} dataSource={farmerListItem} />
          </BoxPrimary>

          <div className="flex justify-end space-x-4 mt-6 hidden">
            <ActionButton
              mode="back"
              text="Back"
              onClick={() => navigate(-1)}
            />
            {!isViewMode && (
              <ActionButton
                text="Update Farmer"
                mode="update"
                onClick={FarmerhandleSave}
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
        {isViewMode ? "View Information" : "Edit Information"}
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
