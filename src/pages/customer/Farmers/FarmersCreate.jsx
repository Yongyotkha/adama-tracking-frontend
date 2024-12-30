import React, { useContext, useEffect, useMemo, useState } from "react";
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
  const [networkList, setNetworkList] = useState([]); 
  const [companyinfo, setcompanyinfo] = useState([]);
  const [contactItems, setContactItems] = useState([]); 
  const [form] = Form.useForm();
  const [isTerritoryModalVisible, setIsTerritoryModalVisible] = useState(false);
  const [userList, setUserList] = useState([]);
  const [personitem, setpersonitem] = useState([]);
  const [cropOptions, setCropOptions] = useState([]);
  const [defaultSelectedCrops, setDefaultSelectedCrops] = useState([]); 
  const [profileImage, setProfileImage] = useState("/img/profile.jpg"); 
  const [dataLoaded, setDataLoaded] = useState(false);
  const { userInfo, showNotification } = useContext(AuthContext);
  const [dataApiKey, setDataApiKay] = useState("AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik");
  const [currentLocation, setCurrentLocation] = useState({
    lat: 13.9572612,
    lng: 100.6222401,
  });
  const [dataMapZoom, setDataMapZoom] = useState(15);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [defaultIdFarmers, setDefaultFarmers] = useState([]); 
  const [isMapEnabled, setIsMapEnabled] = useState(true);

    // อ่านสถานะ mod จาก state
    const mode = location.state?.mod; 
    const isViewMode = mode === "View";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log(location.state.mod);
        console.log(location.state.id);
        setDefaultFarmers(location.state.id)
        // await fetchFarnersDetails(location.state.id);
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

  // const fetchFarnersDetails = async (id) => {
  //   setLoading(true);
  //   try {
  //     const response = await useServiceAPI.get(
  //       `${paths.pathCustomerFarmersDetail}?id=${id}`
  //     );
  //     if (response.status === 200) {
  //       const { data } = response;
        
  //       form.setFieldsValue({
  //         name: data.name || "",
  //         mobile_phone: data.mobile_phone || "",
  //         address: data.address || "",
  //         email: data.email || "",
  //         day_of_week: data.day_of_week || [],
  //         start_time: data.start_time ? dayjs(data.start_time, "HH:mm") : null,
  //         end_time: data.end_time ? dayjs(data.end_time, "HH:mm") : null,
  //         business_size: data.business_size || "",
  //         outlet_location: data.outlet_location || "",
  //         t_shirt_size: data.t_shirt_size || "",
  //         anniversary: data.anniversary
  //           ? dayjs(data.anniversary, "YYYY-MM-DD")
  //           : null,
  //         location_address: data.location_address || "",
  //         use_flag: parseInt(data.use_flag, 10) === 1 ? "Active" : "Inactive",
  //         remark: data.remark || "",
  //       });

  //       setcompanyinfo(data);
  //       setContactItems(data.contact_items);
  //       setProfileImage(data.photo_path)
  //       setCropOptions(data.crop_list || []);
  //       const cropNames = data.crop_list?.map((crop) => Number(crop.id)) || [];
  //       setDefaultSelectedCrops(cropNames);
  //       const lat = parseFloat(data.location_latitude) || 13.9572612; 
  //       const lng = parseFloat(data.location_longitude) || 100.6222401;   
  //       setCurrentLocation({ lat, lng });


  //       // const newDataNetwork = data.network_list.map((item, index) => ({
  //       //   key: item.sub_dealer_id,
  //       //   no: index + 1,
  //       //   name: item.sub_dealer_name || "-",
  //       //   contactperson: item.sub_dealer_contact_name || "-",
  //       //   mobilePhone: item.sub_dealer_contact_phone_number || "-",
  //       //   onshop: item.is_on_shop || false,
  //       //   status: (
  //       //     <BadgeStatus
  //       //       text={item.sub_dealer_channel_type_name}
  //       //       bgColor={item.sub_dealer_channel_type_bg_color}
  //       //       textColor={item.sub_dealer_channel_type_color}
  //       //     />
  //       //   ),
  //       //   action: (
  //       //     <>
  //       //       <DynamicButton
  //       //         iconSrc="/img/icons/delete.png"
  //       //         onClick={() =>
  //       //           handleDeleteItem(item.sub_dealer_id)
  //       //         }
  //       //       />
  //       //     </>
  //       //   ),
  //       // }));
  //       // setNetworkList(newDataNetwork);
  //     } else {
  //       console.error("Failed to fetch data:", response.message);
  //     }
  //   } catch (error) {
  //     console.error("Error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    const fetchData = async () => {

      if (mode === "create") {
        form.resetFields(); // ล้างฟอร์มสำหรับโหมดสร้างใหม่
        setDataLoaded(true); // ตั้งค่าข้อมูลว่าโหลดเสร็จแล้ว
        return;
      }

      setLoading(true);
      try {
        // ดึงข้อมูล Farmers Details
        const farmerResponse = await useServiceAPI.get(
          `${paths.pathCustomerFarmersDetail}?id=${location.state.id}`
        );
  
        // ตรวจสอบว่า API ส่งข้อมูลกลับมาสำเร็จหรือไม่
        if (farmerResponse.status === 200) {
          const farmerData = farmerResponse.data;
  
          // ตั้งค่า default values ลงในฟอร์ม
          form.setFieldsValue({

            name: farmerData.name || "",
            mobile_phone: farmerData.mobile_phone || "",
            profile: farmerData.photo_path || "",
            address: farmerData.address || "",
            email: farmerData.email || "",
            day_of_week: farmerData.day_of_week || [],
            start_time: farmerData.start_time
              ? dayjs(farmerData.start_time, "HH:mm")
              : null,
            end_time: farmerData.end_time
              ? dayjs(farmerData.end_time, "HH:mm")
              : null,
            // business_size: farmerData.business_size || "",
            business_size: parseInt(farmerData.business_size, 10),
            outlet_location: farmerData.outlet_location || "",
            t_shirt_size: farmerData.t_shirt_size || "",
            anniversary: farmerData.anniversary
              ? dayjs(farmerData.anniversary, "YYYY-MM-DD")
              : null,
            location_address: farmerData.location_address || "",
            use_flag:
              parseInt(farmerData.use_flag, 10) === 1 ? "Active" : "Inactive",
            remark: farmerData.remark || "",
          });
  
          // ตั้งค่า state ของข้อมูลอื่น ๆ
          setcompanyinfo(farmerData);
          setContactItems(farmerData.contact_items || []);
          setDefaultSelectedCrops(
            farmerData.crop_list?.map((crop) => Number(crop.id)) || []
          );
          setProfileImage(farmerData.photo_path);
          setCurrentLocation({
            lat: parseFloat(farmerData.location_latitude) || 13.9572612,
            lng: parseFloat(farmerData.location_longitude) || 100.6222401,
          });
        } else {
          console.error("Failed to fetch farmer data:", farmerResponse.message);
          showNotification("error", "Failed to load farmer details");
        }
  
        // ดึงข้อมูล Crop Options
        const cropResponse = await useServiceAPI.get(paths.pathMasterCrop, {});
        if (cropResponse.status === 200) {
          setCropOptions(cropResponse.data || []);
        } else {
          console.error("Failed to fetch crop data:", cropResponse.message);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        showNotification("error", "Error occurred while loading data");
      } finally {
        setLoading(false);
        setDataLoaded(true); // ตั้งค่าเพื่อบอกว่าโหลดข้อมูลเสร็จแล้ว
      }
    };
  
    fetchData();
  }, [location.state.id]);
  
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
    },
    {
      label: "Start Time",
      name: "start_time",
      type: "time",
      required: false,
      col: 3,
    },
    {
      label: "End Time",
      name: "end_time",
      type: "time",
      required: false,
      col: 3,
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
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
      col: 6,
    },
    {
      label: "Outlet Location Please select a location on the map" ,
      // labelColor: "red",
      name: "location_address",
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
    },
    {
      label: "Aniversary",
      name: "anniversary",
      type: "date",
      required: false,
      col: 6,
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
    },
    {
      label: "Remark",
      name: "remark",
      type: "text",
      required: false,
      col: 24,
    },

])


  const header = [
    // { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "No", width: 50, dataIndex: "no", align: "center" },
    { title: "Farmer Name", width: 100, dataIndex: "name", align: "left" },
    { title: "Contact Person", width: 200,  dataIndex: "contactperson", align: "left",},
    { title: "Phone No",  width: 150, dataIndex: "mobilePhone", align: "center",},
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const sub_dealer = [
    { title: "No", width: 50, dataIndex: "no", align: "center" },
    { title: "Sub Dealer List", width: 100, dataIndex: "name", align: "left" },
    { title: "Contact Person", width: 200,  dataIndex: "contactperson", align: "left",},
    { title: "Phone No",  width: 150, dataIndex: "mobilePhone", align: "center",},
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];


  const handleDeleteItem = async (record) => {
    console.log("id", location.state.id);
    console.log(record);
    
    try {
      const requestData = {
        dealer_id:location.state.id,
        sub_dealer_id: record, // ส่ง ID ที่ต้องการลบ
      };

      const response = await useServiceAPI.delete(
        paths.pathCustomerNetworkDelete,
        requestData
      );

      if (response.status === 200) {
        // fetchData();
        await fetchFarnersDetails(location.state.id);

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
        <Row gutter={[16, 16]}>
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
              onChange={(date, dateString) =>
                handleContactChange(index, "date_of_birth", dateString)
              }
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
  

  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };

  const handleOpenTerritoryModal = async () => {
    await fetchUserList(); 
    setIsTerritoryModalVisible(true); 
  };

  const handleCloseTerritoryModal = () => {
    setIsTerritoryModalVisible(false);
  };

  const handleAddSelectedRows = (selectedRows) => {
    const newRows = selectedRows.map((row, index) => ({
      // key: networkList.length + index + 1, 
      key: row.key,
      no: networkList.length + index + 1, 
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
        <>
          <DynamicButton
            iconSrc="/img/icons/delete.png"
            onClick={() =>
              handleDeleteItem(row.sub_dealer_id)
            }
          />
        </>
      ),
    }));

    setNetworkList((prevList) => {
      const existingKeys = prevList.map((item) => item.key); // ดึง key ของรายการที่มีอยู่
      const filteredNewRows = newRows.filter((row) => !existingKeys.includes(row.key)); // กรองเฉพาะ key ที่ยังไม่มีใน list
      if (filteredNewRows.length === 0) {
        showNotification("error", "Sale Territory has already been added.");
        return [...prevList, ...filteredNewRows]; 
      }else{
        showNotification("success", "Add sale territory success.");
        return [...prevList, ...filteredNewRows]; 
      }
    });
  };

  const fetchUserList = async (page_size = 20, page_length = 1) => {
    setLoading(true);
    const requestData = {
      platform: "web",
      page_size,
      page_length,
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
          // position: item.sub_dealer_channel_type_name,
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

  const handleAddContact = () => {
    // เพิ่ม object ใหม่ลงใน contactItems state
    setContactItems((prev) => [
      ...prev,
      { id: prev.length + 1, name: "", phone: "" },
    ]);
  };

  const handleCheckboxChange = (key) => {
    setNetworkList((prevList) =>
      prevList.map((item) =>
        item.key === key ? { ...item, onshop: !item.onshop } : item
      )
    );
    showNotification("success", "Add on shop success");
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

        let useFlagValue;
        if (values.use_flag === 1 || values.use_flag === 0) {
          useFlagValue = values.use_flag; // ถ้าค่าเป็น 1 หรือ 0 อยู่แล้ว ใช้ค่าเดิม
        } else {
          useFlagValue = values.use_flag === "Active" ? 1 : 0; // แปลงค่าจาก "Active" หรือ "Inactive"
        }

        console.log(values);
        const formattedData = {
          id: location.state.id, 
          photo_path: values.profile,
          name: values.name || "",
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
          outlet_location: values.location_address || "",
          t_shirt_size: values.t_shirt_size || "",
          anniversary: values.anniversary
            ? dayjs(values.anniversary).format("YYYY-MM-DD")
            : null,
          location_longitude: currentLocation.lng || "",
          location_latitude: currentLocation.lat  || "",
          location_address: values.location_address || "",
          use_flag: useFlagValue,
          remark: values.remark,
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
          })),
          crop_list: defaultSelectedCrops || [],
        };

        console.log(formattedData);
        

        if (location.state.mod === "create") {
            useServiceAPI
            .post(paths.pathCustomerFarmersCreate, formattedData)
            .then((response) => {
              if (response.status === 200) {
                navigate("/customer/farners");
                showNotification(
                  "success",
                  response.data.message,
                  response.data.message_line
                );
                // console.log("Save successful:", response.data);
                // navigate("/customer/farners"); 
              }
            })
            .catch((error) => {
              console.error("Save failed:", error);
            });

            
        }else{
          useServiceAPI
          .put(paths.pathCustomerFarmersUpdate, formattedData)
          .then((response) => {
            if (response.status === 200) {
              navigate("/customer/farners");
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              );
              // console.log("Save successful:", response.data);
              // navigate("/customer/farners"); 
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
              navigate("/customer/farners");
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

  
  // const handleBankAccountChange = (index, field, value) => {
  //   const updatedAccounts = [...companyinfo.bank_account_items];
  //   updatedAccounts[index][field] = value;
  //   setcompanyinfo({ ...companyinfo, bank_account_items: updatedAccounts });
  // };

  const handleBankAccountChange = (index, field, value) => {
    const updatedAccounts = companyinfo.bank_account_items?.length
      ? [...companyinfo.bank_account_items]
      : Array(2).fill({ account_title: "", account_number: "", bank_name: "", bank_branch: "" });
  
    // อัปเดตค่าของฟิลด์ที่เปลี่ยนแปลงในรายการที่เลือก
    updatedAccounts[index] = {
      ...updatedAccounts[index],
      [field]: value,
    };
      setcompanyinfo({ ...companyinfo, bank_account_items: updatedAccounts });
  };
  
  const handleContactChange = (index, field, value) => {
    const updatedContacts = [...contactItems];
    updatedContacts[index][field] = value;
    setContactItems(updatedContacts);
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
    
  let items = [
    {
      key: "profile",
      label: <span className="tab-title">Profile</span>,
      children: (
      <>
      {dataLoaded ? (
        <FormUser profile={profileImage} fields={formFields} form={form} />
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
        {/* <div className="flex justify-end space-x-4 mb-2">
            <ActionButton
              text={isMapEnabled ? "Close Google" : "Open Google"}
              mode="update" 
              onClick={() => setIsMapEnabled((prev) => !prev)} />
          </div> */}

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
                // options={{ disableDefaultUI: !isMapEnabled, draggable: isMapEnabled }}
              />
            )}
          </GoogleMap>
        </LoadScript>
        </div>
      </div>


      <BoxPrimary>
        <span className="text-[#00783F] text-lg font-semibold">Crop</span>

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
          <div className="text-gray-500">No contact person information available</div>
        )}
      </BoxPrimary>
        <div className="flex justify-end space-x-4 mt-6">
          <ActionButton
            mode="back"
            text="Back"
            onClick={() => navigate("/customer/farners")}
          />
          {/* <ActionButton
            mode="update"
            text="Update"
            onClick={handleSave} 
          /> */}
        {
        !isViewMode && (
          <ActionButton text="Update" mode="update" onClick={handleSave} />
          )
        }
        </div>
        </>
      ),
    },
    {
      key: "seb_dealer_list",
      label: <span className="tab-title">Farmer List</span>,
      children: (
        <>
          <BoxPrimary>
            <div className="flex justify-between space-x-4 mb-3">
              <span className="text-[#00783F] text-lg font-semibold">
                Sub Dealer List
              </span>
              {
                !isViewMode && (
                  <div className="flex space-x-2">
                  <ActionButton
                    mode="add"
                    text="Add Sub Dealer"
                    onClick={handleOpenTerritoryModal}
                  />
                </div>
                )
              }
            </div>
            <TableComponent 
              header={sub_dealer} 
              dataSource={networkList} 
            />
          </BoxPrimary>


          <BoxPrimary>
            <div className="flex justify-between space-x-4 mb-3">
              <span className="text-[#00783F] text-lg font-semibold">
                Farmer List
              </span>
              {
                !isViewMode && (
                  <div className="flex space-x-2">
                  <ActionButton
                    mode="add"
                    text="Add Farmer"
                    onClick={handleOpenTerritoryModal}
                  />
                </div>
                )
              }
            </div>
            <TableComponent 
              header={header} 
              dataSource={networkList} 
            />
          </BoxPrimary>
          <div className="flex justify-end space-x-4 mt-6">
            <ActionButton
              mode="back"
              text="Back"
              onClick={() => navigate("/customer/farners")}
            />
          {
          !isViewMode && (
            <ActionButton text="Update" mode="update" onClick={networkhandleSave} />
            )
          }
          </div>
        </>
      ),
    },

  ];

  if (isViewMode) {
    items = items.map(field => {
      if (field.key === 'network' || field.key === 'profile') {
        return field; 
      }
      return {
        ...field,
        disabled: true
      };
    });
  } else {
    items = items.map(field => ({
      ...field,
      disabled: false 
    }));
  }
  

  
  
  return (
    <MainLayout loading={loading}>
      {/* <div className="title-page">{isViewMode ? "Create Farmers" : "Edit Farmers"}</div> */}
      <div className="title-page">
        {mode === "create"
          ? "Create Farmers"
          : mode === "edit"
          ? "Edit Farmers"
          : "View Farmers"}
      </div>

      <Tabs
        activeKey={activeTabKey}
        onChange={handleTabChange}
        className="custom-tabs"
        items={items}
      />
      <DynamicModal
        title="Farmer List"
        isVisible={isTerritoryModalVisible}
        onClose={handleCloseTerritoryModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          { title: "Name", dataIndex: "name", key: "name", width: 150 },
          { title: "contact number",  dataIndex: "territory", key: "territory", width: 150,},
          { title: "Status",  dataIndex: "position",  key: "position",  width: 150,},
        ]}
        dataSource={userList}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />
    </MainLayout>
  );
}
