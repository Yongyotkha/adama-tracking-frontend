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


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log(location.state.id);
        await fetchPromotionDetails(location.state.id);
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


  const fetchPromotionDetails = async (id) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(
        `${paths.pathSubDealerDetail}?id=${id}`
      );
      if (response.status === 200) {
        const { data } = response;                
        setcompanyinfo(data);
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

  // const formFields = [
  //   { label: "Code SubDealer", name: "code_dealer", type: "text", required: false, col: 6, value:"" },
  //   { label: "Shop Name", name: "shop_name", type: "text", required: false, col: 6, value: companyinfo.name },
  //   { label: "Mobile Phone", name: "mobile_phone", type: "text", required: false, col: 6, value: companyinfo.mobile_phone },
  //   { label: "Address", name: "address", type: "text", required: false, col: 12, value: companyinfo.address },
  //   { label: "Email", name: "email", type: "email", required: false, col: 6, value: companyinfo.email },
  //   { label: "Start Time", name: "start_time", type: "time", required: false, col: 3, value: companyinfo.start_time },
  //   { label: "End Time", name: "end_time", type: "time", required: false, col: 3, value: companyinfo.end_time },
  //   { label: "Business Size", name: "business_size", type: "select", options: ["Small", "Medium", "Large"], required: false, col: 6, value: companyinfo.business_size },
  //   { label: "Remark", name: "remark", type: "text", required: false, col: 12, value: companyinfo.remark },
  // ];


  const formFields = [
    {
      label: "Code SubDealer",
      name: "code_dealer",
      type: "text",
      required: false,
      col: 6,
      value: "",
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
      label: "Office Hours",
      name: "office_hours",
      type: "multiple",
      options: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: false,
      col: 6,
      value: null,
      iconSrc: "/img/icons/calendar.png",
      iconPosition: "right",
    },
    {
      label: "Start Time",
      name: "start_time",
      type: "time",
      required: false,
      col: 6,
      value: companyinfo.start_time
    },
    {
      label: "End Time",
      name: "end_time",
      type: "time",
      required: false,
      col: 6,
      value: companyinfo.end_time
    },
    {
      label: "Business Size",
      name: "business_size",
      type: "select",
      options: [
        { name: "Small", id: 1, selected: true },
        { name: "Medium", id: 2, selected: false },
        { name: "Large", id: 3, selected: false },
      ],
      required: false,
      col: 6,
      value: companyinfo.business_size,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
      col: 6,
      value: companyinfo.email
    },
    {
      label: "Outlet Location",
      name: "outlet_location",
      type: "text",
      required: false,
      col: 6,
      value: companyinfo.outlet_location,
      iconSrc: "/img/icons/location.png",
      iconPosition: "right",
    },
    {
      label: "T-Shirt Size",
      name: "tshirt_size",
      type: "text",
      required: false,
      col: 6,
      value: companyinfo.t_shirt_size,
    },
    {
      label: "Anniversary",
      name: "anniversary",
      type: "date",
      required: false,
      col: 6,
      value: companyinfo.anniversary,
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
      label: "Remark",
      name: "remark",
      type: "text",
      required: false,
      col: 12,
      value: companyinfo.remark
    },
  ];





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


  const renderContactItems = () =>
    contactItems.map((contact, index) => (
      <div key={index} className="mb-6">
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-md">{`Person ${index + 1}`}</span>
        </div>
        <Row gutter={[16, 16]} className="mt-3">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Name (EN)"
                value={contact.name_en || ""}
                onChange={(e) => updateContact(index, "name_en", e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Name (TH)"
                value={contact.name_th || ""}
                onChange={(e) => updateContact(index, "name_th", e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Nickname"
                value={contact.nickname || ""}
                onChange={(e) => updateContact(index, "nickname", e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <DatePicker
                className="w-full"
                placeholder="Date of Birth"
                value={contact.date_of_birth ? dayjs(contact.date_of_birth) : null}
                onChange={(date) => updateContact(index, "date_of_birth", date)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="T-Shirt Size"
                value={contact.t_shirt_size || ""}
                onChange={(e) => updateContact(index, "t_shirt_size", e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Relationship"
                value={contact.relationship || ""}
                onChange={(e) => updateContact(index, "relationship", e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Duty"
                value={contact.duty || ""}
                onChange={(e) => updateContact(index, "duty", e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Tel 1"
                value={contact.tel1 || ""}
                onChange={(e) => updateContact(index, "tel1", e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Tel 2"
                value={contact.tel2 || ""}
                onChange={(e) => updateContact(index, "tel2", e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Contact Number"
                value={contact.contact_number || ""}
                onChange={(e) => updateContact(index, "contact_number", e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Email"
                value={contact.email || ""}
                onChange={(e) => updateContact(index, "email", e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Line ID"
                value={contact.line_id || ""}
                onChange={(e) => updateContact(index, "line_id", e.target.value)}
              />
            </Col>
          </Row>
        <hr className="my-4" />
      </div>
    ));



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
            day_of_week: "",
            start_time: values.start_time || "",
            end_time: values.end_time || "",
            business_size: values.business_size || "",
            outlet_location: values.outlet_location || "",
            t_shirt_size: values.tshirt_size || "",
            anniversary: values.anniversary
              ? dayjs(values.anniversary).format("YYYY-MM-DD")
              : null,
            remark: values.remark || "",
            photo_path: "photo_path", // ตัวอย่าง placeholder
            
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
    <MainLayout loading={loading}>
      <div className="title-page">Edit Sub Dealer</div>
      <FormUser profile="/img/profile.jpg" title="Personal Info" fields={formFields} form={form}/>
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
          />
      </BoxPrimary>
      <BoxPrimary>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-lg font-semibold">Contact Person</span>
          <ActionButton mode="add" text="Add" onClick={() => {
              setContactItems([
              ...contactItems,
              {
                name: "", // Default value for name field
                phone: "", // Default value for phone field
                email: "", // Default value for email field
                position: "" // Default value for position field
              }
            ]);

          }} />
        </div>
        {contactItems.length > 0 ? (
          renderContactItems()
        ) : (
          <div className="text-gray-500">No contact person information available</div>
        )}
      </BoxPrimary>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/customer/sub-dealer")} />
        {/* <ActionButton htmlType="submit" mode="update" text="Update" onClick={() => navigate("/customer/sub-dealer")} /> */}
        <ActionButton text="Save" mode="save" onClick={handleSave} />

      </div>
    </MainLayout>
  );
}
