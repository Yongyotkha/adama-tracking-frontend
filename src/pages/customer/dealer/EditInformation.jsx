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
import DynamicModal from "../../../components/modal/DynamicModal"; // Adjust path if needed

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
  const [userList, setUserList] = useState([]);
  const [personitem, setpersonitem] = useState([]);
  const [cropOptions, setCropOptions] = useState([]);
  const [defaultSelectedCrops, setDefaultSelectedCrops] = useState([]); // กำหนด state สำหรับ defaultSelectedCrops

  // const [tableParams, setTableParams] = useState({
  //   pagination: {
  //     current: 1,
  //     pageSize: 10,
  //   },
  //   filters: {},
  //   sortOrder: null,
  //   sortField: null,
  // });

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
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Sub Dealer Name", width: 100, dataIndex: "name", align: "left" },
    {
      title: "Contact Person",
      width: 200,
      dataIndex: "contactperson",
      align: "left",
    },
    {
      title: "Phone NO",
      width: 150,
      dataIndex: "mobilePhone",
      align: "center",
    },
    {
      title: "On Shop",
      width: 150,
      dataIndex: "onshop",
      align: "center",
      render: (isOnShop, record) => (
        <input
          type="checkbox"
          checked={isOnShop}
          onChange={() => handleCheckboxChange(record.key)} // เพิ่ม handler สำหรับเปลี่ยนสถานะ
        />
      ),
    },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const actionItems = [
    {
      key: "1",
      label: <ItemDropDown mode="edit" link="/customer/dealer/edit-info" />,
    },
  ];

  const fetchPromotionDetails = async (id) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(
        `${paths.pathCustomerDealerDetail}?id=${id}`
      );
      if (response.status === 200) {
        const { data } = response;
        setcompanyinfo(data);
        setContactItems(data.contact_items);

        setCropOptions(data.crop_list || []);
        const cropNames = data.crop_list?.map((crop) => Number(crop.id)) || [];
        setDefaultSelectedCrops(cropNames);
        console.log(cropNames);

        const newDataNetwork = data.network_list.map((item, index) => ({
          key: index + 1,
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
            <Dropdown menu={{ items: actionItems }} placement="bottom">
              <a onClick={(e) => e.preventDefault()}>
                <img
                  src="/img/icons/action.png"
                  alt="Actions icon"
                  className="inline-block w-5 h-5"
                />
              </a>
            </Dropdown>
          ),
        }));
        setNetworkList(newDataNetwork);
      } else {
        console.error("Failed to fetch data:", response.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderContactItems = () =>
    contactItems.map((contact, index) => (
      <div key={index} className="mb-6">
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-md">{`Person ${
            index + 1
          }`}</span>
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Name (EN)" value={contact.name_en || ""} />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Name (TH)" value={contact.name_th || ""} />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Nickname" value={contact.nickname || ""} />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <DatePicker
              className="w-full"
              placeholder="Date of Birth"
              value={
                contact.date_of_birth ? dayjs(contact.date_of_birth) : null
              }
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="T-Shirt Size"
              value={contact.t_shirt_size || ""}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Relationship"
              value={contact.relationship || ""}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Duty" value={contact.duty || ""} />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Tel 1" value={contact.tel1 || ""} />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Tel 2" value={contact.tel2 || ""} />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="Contact Number"
              value={contact.contact_number || ""}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Email" value={contact.email || ""} />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input placeholder="Line ID" value={contact.line_id || ""} />
          </Col>
        </Row>
        <hr className="my-4" />
      </div>
    ));

  // Handle tab change
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

  const handleAddSelectedRows = (selectedRows) => {
    const newRows = selectedRows.map((row, index) => ({
      key: networkList.length + index + 1, // กำหนด key ใหม่
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
        <Dropdown menu={{ items: actionItems }} placement="bottom">
          <a onClick={(e) => e.preventDefault()}>
            <img
              src="/img/icons/action.png"
              alt="Actions icon"
              className="inline-block w-5 h-5"
            />
          </a>
        </Dropdown>
      ),
    }));

    setNetworkList((prevList) => [...prevList, ...newRows]); // เพิ่มแถวใหม่ลงใน networkList
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
          key: index + 1,
          name: item.sub_dealer_name,
          territory: item.sub_dealer_contact_phone_number,
          position: item.sub_dealer_channel_type_name,
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
  };

  // const defaultSelectedCrops = ["Rice", "Corn", "Soybean"];

  // Mock crop data for the multi-select dropdown
  // const cropOptions = [
  //   "Rice", "Wheat", "Corn", "Soybean", "Cotton", "Barley", "Sugarcane", "Potato", "Tomato", "Lettuce"
  // ];

  const transformedCropOptions = cropOptions.map((option) => ({
    label: option.name, // เปลี่ยนจาก name เป็น label
    value: option.id, // คงค่า value เดิมไว้
  }));


  useEffect(() => {
    console.log(defaultSelectedCrops)
  }, [defaultSelectedCrops]);


  const items = [
    {
      key: "profile",
      label: <span className="tab-title">Profile</span>,
      children: (
        <>
          <FormUser
            profile="/img/profile.jpg"
            title="Company Info"
            fields={formFields}
            form={form}
          />
          <BoxPrimary>
            <div className="text-[#00783F] text-md">Bank Account 1</div>
            {companyinfo.bank_account_items &&
            companyinfo.bank_account_items.length > 0 ? (
              companyinfo.bank_account_items.map((account, index) => (
                <Row className="my-3" gutter={[16, 16]} key={index}>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Input
                      placeholder="Account Title"
                      value={account.account_title || ""}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Input
                      placeholder="Account Number"
                      value={account.account_number || ""}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Input
                      placeholder="Bank Name"
                      value={account.bank_name || ""}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Input
                      placeholder="Bank Branch"
                      value={account.bank_branch || ""}
                    />
                  </Col>
                </Row>
              ))
            ) : (
              <div className="text-gray-500">
                No bank account information available
              </div>
            )}

            <div className="text-[#00783F] text-md">Bank Account 2</div>
            {companyinfo.bank_account_items &&
            companyinfo.bank_account_items.length > 0 ? (
              companyinfo.bank_account_items.map((account, index) => (
                <Row className="my-3" gutter={[16, 16]} key={index}>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Input
                      placeholder="Account Title"
                      value={account.account_title || ""}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Input
                      placeholder="Account Number"
                      value={account.account_number || ""}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Input
                      placeholder="Bank Name"
                      value={account.bank_name || ""}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Input
                      placeholder="Bank Branch"
                      value={account.bank_branch || ""}
                    />
                  </Col>
                </Row>
              ))
            ) : (
              <div className="text-gray-500">
                No bank account information available
              </div>
            )}
          </BoxPrimary>

          <BoxPrimary>
                <Select
                  mode="multiple"
                  showSearch
                  placeholder="Select Crop(s)"
                  optionFilterProp="children"
                  className="w-full"
                  value={defaultSelectedCrops} // เอาตัวนี้ส่ง
                  onChange={(value) => setDefaultSelectedCrops(value)} // จัดการการเปลี่ยนแปลงค่า
                  options={transformedCropOptions} // ตัวเลือก
                />
          </BoxPrimary>
          <BoxPrimary>
            <div className="flex justify-between mb-4">
              <span className="text-[#00783F] text-lg font-semibold">
                Contact Person
              </span>
              <ActionButton mode="add" text="Add" onClick={() => {}} />
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
            <ActionButton
              mode="update"
              text="Update"
              onClick={() => navigate("/customer/dealer")}
            />
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
              <div className="flex space-x-2">
                <ActionButton
                  mode="add"
                  text="Add"
                  onClick={handleOpenTerritoryModal}
                />
              </div>
            </div>
            <TableComponent header={header} dataSource={networkList} />
          </BoxPrimary>
          <div className="flex justify-end space-x-4 mt-6">
            <ActionButton
              mode="back"
              text="Back"
              onClick={() => navigate("/customer/dealer")}
            />
            <ActionButton
              mode="update"
              text="Update"
              onClick={() => navigate("/customer/dealer")}
            />
          </div>
        </>
      ),
    },
  ];

 

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Information</div>
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
            title: "contact number",
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
    </MainLayout>
  );
}
