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
  TimePicker,
} from "antd";
import { values } from "lodash";
import dayjs from "dayjs";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import TableComponent from "../../../components/table/TableComponent";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import DynamicModal from "../../../components/modal/DynamicModal"; // Adjust path if needed

const { Option } = Select;

export default function CreateSubDealer() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [cropOptions, setCropOptions] = useState([]);
  const [form] = Form.useForm();

  const [defaultSelectedCrops, setDefaultSelectedCrops] = useState([]); // กำหนด state สำหรับ defaultSelectedCrops
  const [personalInfoData, setPersonalInfoData] = useState({});
  // const [personalInfo, setPersonalInfo] = useState([]);
  const { showMsg, showNotification } = useContext(AuthContext);

  const [cropData, setCropData] = useState([]);
  const [contactsData, setContactsData] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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

  const formFields = [
    {
      label: "Shop Name",
      name: "shop_name",
      type: "text",
      required: false,
      col: 6,
      // value: "",
    },
    {
      label: "Mobile Phone",
      name: "mobile_phone",
      type: "text",
      required: false,
      col: 6,
      // value: "4124214",
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      required: false,
      col: 12,
      // value: "",
    },
    {
      label: "Office Hours",
      name: "office_hours",
      type: "multiple",
      options: [
        { name: "Monday", id: 1, selected: true },
        { name: "Tuesday", id: 0, selected: false },
        { name: "Wednesday", id: 0, selected: false },
        { name: "Thursday", id: 0, selected: false },
        { name: "Friday", id: 0, selected: false },
        { name: "Saturday", id: 0, selected: false },
        { name: "Sunday", id: 0, selected: false },
      ],
      required: false,
      col: 6,
      iconSrc: "/img/icons/calendar.png",
      iconPosition: "right",
    },
    // {
    //   label: "Office Hours",
    //   name: "office_hours",
    //   type: "select",
    //   required: true,
    //   col: 6,
    //   iconSrc: "/img/icons/calendar.png",
    //   iconPosition: "right",
    //   options: [
    //     { name: "Monday", id: 1, selected: true },
    //     { name: "Tuesday", id: 0, selected: false },
    //     { name: "Wednesday", id: 0, selected: false },
    //     { name: "Thursday", id: 0, selected: false },
    //     { name: "Friday", id: 0, selected: false },
    //     { name: "Saturday", id: 0, selected: false },
    //     { name: "Sunday", id: 0, selected: false },
    //   ],
    // },
    {
      label: "Start Time",
      name: "start_time",
      type: "time", // ใช้ type "time"
      required: false,
      col: 6,
      value: null,
    },
    {
      label: "End Time",
      name: "end_time",
      type: "time",      
      required: false,
      col: 6,
      value: "",
    },
    {
      label: "Business Size",
      name: "business_size",
      type: "select",
      required: true,
      col: 6,
      options: [
        { name: "Small", id: "Small", selected: true },
        { name: "Medium", id: "Medium", selected: false },
        { name: "Large", id: "Large", selected: false },
      ],
    },

    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
      col: 6,
      value: "",
    },
    {
      label: "Outlet Location",
      name: "outlet_location",
      type: "text",
      required: false,
      col: 6,
      value: "",
      iconSrc: "/img/icons/location.png",
      iconPosition: "right",
    },
    {
      label: "T-Shirt Size",
      name: "tshirt_size",
      type: "text",
      required: false,
      col: 6,
      value: "",
    },
    {
      label: "Anniversary",
      name: "anniversary",
      type: "date",
      required: false,
      col: 6,
      value: "",
    },
    {
      label: "Remark",
      name: "remark",
      type: "text",
      required: false,
      col: 24,
      value: "",
    },
  ];

  // // Mock crop data for the multi-select dropdown
  // const cropOptions = [
  //   "Rice", "Wheat", "Corn", "Soybean", "Cotton", "Barley", "Sugarcane", "Potato", "Tomato", "Lettuce"
  // ];

  const transformedCropOptions = cropOptions.map((option) => ({
    label: option.name, // เปลี่ยนจาก name เป็น label
    value: option.id, // คงค่า value เดิมไว้
  }));

  const [personalInfo, setPersonalInfo] = useState({
    shop_name: "",
    mobile_phone: "",
    address: "",
    email: "",
    office_hours: [],
    start_time: "",
    end_time: "",
    business_size: "",
    outlet_location: "",
    tshirt_size: "",
    anniversary: null,
    remark: "",
  });

  // const [contacts, setContacts] = useState([
  //   {
  //     name_en: "",
  //     name_th: "",
  //     nickname: "",
  //     date_of_birth: null,
  //     t_shirt_size: "",
  //     relationship: "",
  //     duty: "",
  //     tel1: "",
  //     tel2: "",
  //     contact_number: "",
  //     email: "",
  //     line_id: "",
  //   },
  // ]);

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
      prevContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    );
  };
  
  const handlePersonalInfoChange = (field, value) => {
    console.log(field,value);
    
    setPersonalInfo((prevInfo) => ({
      ...prevInfo,
      [field]: value, // อัปเดตค่าฟิลด์ที่กำหนด
    }));
  };
  
  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const payload = {
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
          })),
          crop_list: defaultSelectedCrops || [],
        };
  
        console.log("Payload to be sent:", payload);
  
        // ส่งข้อมูลไปยัง API
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
  

  
  
  
  useEffect(() => {
    console.log(defaultSelectedCrops)
  }, [defaultSelectedCrops]);


  return (
    <MainLayout loading={loading}>
      
      <div className="title-page">Create Sub Dealer</div>
      <FormUser title="Personal Info" 
        fields={formFields} 
        form={form}
      />

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
        />
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-lg font-semibold">
            Contact Person
          </span>
          <ActionButton mode="add" text="Add" onClick={addContact} />
        </div>
        {contacts.map((contact, index) => (
          <div key={index}>
            <span className="text-[#00783F] text-md">{`Person ${
              index + 1
            }`}</span>
            <Row gutter={[16, 16]} className="mt-3">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Name (EN)"
                  value={contact.name_en}
                  onChange={(e) =>
                    updateContact(index, "name_en", e.target.value)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Name (TH)"
                  value={contact.name_th}
                  onChange={(e) =>
                    updateContact(index, "name_th", e.target.value)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Nickname"
                  value={contact.nickname}
                  onChange={(e) =>
                    updateContact(index, "nickname", e.target.value)
                  }
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
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="T-Shirt Size"
                  value={contact.t_shirt_size}
                  onChange={(e) =>
                    updateContact(index, "t_shirt_size", e.target.value)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Relationship"
                  value={contact.relationship}
                  onChange={(e) =>
                    updateContact(index, "relationship", e.target.value)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Duty"
                  value={contact.duty}
                  onChange={(e) => updateContact(index, "duty", e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Tel 1"
                  value={contact.tel1}
                  onChange={(e) => updateContact(index, "tel1", e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Tel 2"
                  value={contact.tel2}
                  onChange={(e) => updateContact(index, "tel2", e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Contact Number"
                  value={contact.contact_number}
                  onChange={(e) =>
                    updateContact(index, "contact_number", e.target.value)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Email"
                  value={contact.email}
                  onChange={(e) =>
                    updateContact(index, "email", e.target.value)
                  }
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Line ID"
                  value={contact.line_id}
                  onChange={(e) =>
                    updateContact(index, "line_id", e.target.value)
                  }
                />
              </Col>
            </Row>
            {index < contacts.length - 1 && <hr className="my-4" />}
          </div>
        ))}
      </BoxPrimary>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/customer/sub-dealer")}
        />
        <ActionButton text="Save" mode="save" onClick={handleSave} />

      </div>
    </MainLayout>
  );
}
