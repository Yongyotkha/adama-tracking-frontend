import React, { useEffect, useRef, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Form, Input, Col, Row, Select } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ActionButton from "../../components/button/ActionButton";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import FormCustom from "../../components/form_custom/FormCustom";
import TableComponent from "../../components/table/TableComponent";
import FileUploadComponent from "../../components/file_upload/FileUploadComponent";
import DynamicButton from "../../components/button/DynamicButton";
import DynamicModal from "../../components/modal/DynamicModal";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { useLocation } from "react-router-dom";
import { ReloadOutlined } from "@ant-design/icons";
import { convertLegacyProps } from "antd/es/button";

dayjs.extend(customParseFormat);

const { Option } = Select;

export default function CreateActivity() {
  const locationParam = useLocation();
  const searchParams = new URLSearchParams(locationParam.search);
  const mode = searchParams.get("mode");

  const [loading, setLoading] = useState(false);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
  const [activityList, setActivityList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [saleAllList, setSaleAllList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [cropList, setCropList] = useState([]);
  const [productCropList, setProductCropList] = useState([]);
  const [timeList, setTimeList] = useState([]);
  const [participantList, setParticipantList] = useState([]);
  const navigate = useNavigate();

  const [formCustom] = Form.useForm();
  const [customerForm] = Form.useForm();
  const [expenseForm] = Form.useForm();
  const [participantForm] = Form.useForm();
  const fileUploadRef = useRef(null); // Reference for FileUploadComponent
  const [locationCustomer, setLocationCustomer] = useState([]);
  const [dealerCustomer, setDealerCustomer] = useState([]);
  const [perceptionList, setPerceptionList] = useState([]);
  

  const [isBtnExpenseActive, setIsBtnExpenseActive] = useState(false);

  const handleUploadClick = async () => {    
    // Call triggerUpload from FileUploadComponent
    if (fileUploadRef.current) {
      fileUploadRef.current.triggerUpload();
    }
  };

  const handleUploadSuccess = (response) => {
    const data = response.data;
    const fileUpload = [{
      uid: data.file_key,
      name: data.file_name,
      status: 'done',
      url: data.file_url,
    }];
    setFileList(fileUpload);
  };

  // Example file list to be passed as dataFile
  const [fileList, setFileList] = useState([]);

  const handleUpdate = async () => {
    try {
      const formCustomData = await formCustom.validateFields();
      const customerData = await customerForm.validateFields();
      const expenseData = await expenseForm.validateFields();
      const participantData = await participantForm.validateFields();

      const combinedData = {
        ...formCustomData,
        ...customerData,
        ...expenseData,
        ...participantData
      };

      console.log("Combined Form Data:", combinedData);
      navigate("/expenses/advance");
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const formFields = [
    { label: "Activity Reference", name: "activity_reference", type: "text", disabled: true, required: false, col: 24, value: "202400000000001" },
    { label: "Activity Type", name: "activity_type_id", type: "select", options: activityList, disabled: false, required: true, col: 8, value: "" },
    { label: "Sale", name: "user_id", type: "select", options: saleList, disabled: false, required: true, col: 8, value: "", moderef: true },
    { label: "Shop", name: "dealer_id", type: "select", options: dealerList, disabled: false, required: true, col: 8, value: "", moderef: true },
    { label: "Crop", name: "crop_id_list", type: "select", mode: "multiple", options: cropList, disabled: false, required: true, col: 6, value: [], moderef: true },
    { label: "Date", name: "document_date", type: "date", disabled: false, required: true, col: 6, value: dayjs().format("YYYY-MM-DD") },
    { label: "Start Time", name: "time_start", type: "select", options:timeList, disabled: false, required: true, col: 6, value:""  },
    { label: "End Time", name: "time_end", type: "select", options:timeList, disabled: false, required: true, col: 6, value: "" },
    { label: "Location", name: "location_address", type: "location", disabled: true, required: false, col: 24, value: "", iconSrc: "/img/icons/location.png", iconPosition: "left" },
    { label: "Description", name: "description", type: "text-editor", disabled: false, required: false, col: 24, placeholder: "Add description", value: "" },
    { label: "Assign", name: "assing_user_list", type: "select", mode: "multiple", options: saleAllList, disabled: false, required: true, col: 24, value: [] },
  ];

   // Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [activityType, sale, saleAll, time, perception] = await Promise.all([
          useServiceAPI.get(paths.pathMasterActivityType, {}),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {
            'status': 'all'
          }),
          useServiceAPI.get(paths.pathMasterTime, {}),
          useServiceAPI.get(paths.pathMasterPerception, {}),
        ]);

        setActivityList(activityType.data);
        setSaleList(sale.data);
        setSaleAllList(saleAll.data);
        setTimeList(time.data);
        setPerceptionList(perception.data);
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  const handleChange = (attribue, value) => {
    const getMasterSelect = async () => {
      try {
        if(attribue == 'user_id'){
          const [dealer] = await Promise.all([
            useServiceAPI.get(paths.pathMasterDealerDropdown, {
              user_id: value
            }),
          ]);
          setDealerList(dealer.data);
        }else if(attribue == 'dealer_id'){
          const [crop, dealerCustomerData] = await Promise.all([
            useServiceAPI.get(paths.pathMasterCrop, {
              dealer_id: value
            }),
            useServiceAPI.get(paths.pathMasterDealerCustomer, {
              delaer_id: value
            }),
          ]);
          setCropList(crop.data);
          setDealerCustomer(dealerCustomerData.data);
        }else if(attribue == 'crop_id_list'){
          const [productCrop] = await Promise.all([
            useServiceAPI.get(paths.pathMasterProductByCrop, {
              crop_list: value
            }),
          ]);

          let productCropList = [];
          productCrop.data.forEach((element, key) => {
            productCropList.push({
              key: (key + 1), productName: element.product_name, packSize: element.packing_list, 
              estimateSale: "0", actualSale: "0", bath_ltkg: element.bath_ltkg, prodectCode: element.product_code,
              productId: element.id
            });
          });
          setProductCropList(productCropList);
        } 
      } catch (error) {
        console.log(error);
      }
    };

    getMasterSelect();
  };

  const header = [
    { title: "Product Name", dataIndex: "productName", key: "productName", align: "left" },
    { title: "Pack Size", dataIndex: "packSize", key: "packSize", align: "center" },
    {
      title: "Estimate Sale (Kg/Lt)", dataIndex: "estimateSale", key: "estimateSale", align: "center", render: (_, record) => (
        <Input placeholder="0" defaultValue={record.estimateSale} onChange={(e) => handleInputChange(e.target.value, record.key, "estimateSale", record.bath_ltkg)}/>
      )
    },
    {
      title: "Actual Sale (Kg/Lt)", dataIndex: "actualSale", key: "actualSale", align: "center", render: (_, record) => (
        <Input placeholder="0" defaultValue={record.actualSale} onChange={(e) => handleInputChange(e.target.value, record.key, "actualSale", record.bath_ltkg)}/>
      )
    },
  ];

  const handleInputChange = (value, key, field, bath_ltkg) => {
    const updatedData = productCropList.map((item) => {
      if (item.key === key) {
        const numericValue = parseFloat(value) || 0;
        const newTotal = numericValue * bath_ltkg;
        return { ...item, [field]: numericValue, total: newTotal };
      }
      return item;
    });

    setProductCropList(updatedData);
  };

  const calculateGrandTotal = (field) => {
    return productCropList.reduce((sum, item) => sum + (item[field] || 0) * item.bath_ltkg, 0).toFixed(2);
  };

  const footerOrderList = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={2} className="text-left pr-2 text-white">Total (THB)</td>
      <td colSpan={1} className="text-center">
        <Input placeholder="0" value={calculateGrandTotal("estimateSale")} readOnly id="totalEstimateSale"/>
      </td>
      <td colSpan={1} className="text-center">
        <Input placeholder="0" value={calculateGrandTotal("actualSale")} readOnly id="totalActualSale"/>
      </td>
    </tr>
  );

  const [participants, setParticipants] = useState([]);

  const participantColumns = [
    { title: 'No', dataIndex: 'no', key: 'no', align: 'center' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Position', dataIndex: 'position', key: 'position' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Territory', dataIndex: 'territory', key: 'territory' },
    { title: 'Permission', dataIndex: 'permission', key: 'permission' },
    {
      title: 'Action', key: 'action', align: 'center',
      render: (_, record) => (
        <DynamicButton iconSrc="/img/icons/delete.png" onClick={() => removeParticipant(record.key)} />
      ),
    },
  ];

  const handleOpenTeamModal = () => {
    setIsTeamModalVisible(true);
    getParticipant();
  };

  const getParticipant = async () => {
    const [participant] = await Promise.all([
      useServiceAPI.get(paths.pathMasterSaleAll, {
        'page_size': 1,
        'page_length': 10,
      }),
    ]);
  
    let participantData = [];
    setParticipantList([]);
    let count = 0;
    participant.data.data.forEach((element, key) => {
      const id = element.id;
      // ตรวจสอบว่ามี key อยู่ใน participantList แล้วหรือยัง
      const isExisting = participants.some((item) => item.id === id);
      if (!isExisting) {
        count++;
        const newKey = `sales-${count}`;
        participantData.push({
          id: element.id,
          key: newKey,
          no: count,
          name: element.name,
          position: element.position_name,
          department: element.department_name,
          territory: element.territory_name,
          permission: element.permission_name,
        });
      }
    });
  
    // เพิ่มเฉพาะข้อมูลใหม่เข้าไปใน participantList
    setParticipantList((prevList) => [...prevList, ...participantData]);
  };

  const handleCloseTeamModal = () => {
    setIsTeamModalVisible(false);
  };

  const handleAddSelectedRows = (selectedRows) => {
    setParticipants((prev) => {
      // Filter out any selected rows that already exist in participants based on their key
      const newRows = selectedRows.filter(
        (row) => !prev.some((participant) => participant.key === row.key)
      );
      
      // Merge existing participants with new rows
      const updatedParticipants = [...prev, ...newRows];
      
      // Reassign the "no" property to ensure it starts from 1 and increments
      return updatedParticipants.map((participant, index) => ({
        ...participant,
        no: index + 1, // Update "no" based on the new index
      }));
    });
  };

  const removeParticipant = (key) => {
    setParticipants(participants.filter(item => item.key !== key));
  };

  //บันทึกข้อมูล
  const handleSave = () => {
    formCustom.validateFields();
    //Form Basic Activity
    const allValuesBasic = formCustom.getFieldsValue();
    const pageCode = 'activity_transaction';
    //File Upload
    const imageLists = [];
    fileList.forEach(element => {
      imageLists.push(element.url);
    });
    //เปิด Expense หรือไม่?
    const isExpense = isBtnExpenseActive || (mode == 'advance');
    
    //ส่วนของ Sale Plan
    const expenseProductTotalEstimateSale = calculateGrandTotal("estimateSale");
    const expenseProductTotalAcutalSale = calculateGrandTotal("actualSale");
    let expenseProductDataList = [];
    productCropList.forEach(element => {
      expenseProductDataList.push({
        "product_id": element.productId,
        "product_code": element.prodectCode,
        "product_name": element.productName,
        "packing_list": element.packSize,
        "bath_ltkg": element.bath_ltkg,
        "estimate_sale_qty": element.estimateSale,
        "acutal_sale_qty": element.actualSale
      });
    });

    //ส่วนของ Customer
    const expenseCustomerDealerId = dealerCustomer.dealer_id;
    const expenseCustomerDealerCode = dealerCustomer.dealer_code;
    const expenseCustomerName = dealerCustomer.customer_name;
    const expenseCustomerPlaceOfOwner = dealerCustomer.customer_place_of_owner;
    const expenseCustomerPhoneNumber = dealerCustomer.customer_phone_number;
    const expenseCustomerAddress = dealerCustomer.customer_address;
    const expenseCustomerPerceptionId = customerForm.getFieldValue('perception') == 'Good' ? 1 : customerForm.getFieldValue('perception');
    let expenseCustomerPerceptionName = perceptionList.find(
      (option) => option.id === expenseCustomerPerceptionId
    );
    expenseCustomerPerceptionName = expenseCustomerPerceptionName ? expenseCustomerPerceptionName.name : 'Good'
    const expenseCustomerLocationLongitude = customerForm.getFieldValue('location_customer_longitude');
    const expenseCustomerLocationLatitude = customerForm.getFieldValue('location_customer_latitude');
    const expenseCustomerLocationAddress = customerForm.getFieldValue('location_customer_address');

    const expenseActualExp = expenseForm.getFieldValue('actual_exp');
    const expenseActualSale = expenseForm.getFieldValue('actual_sale');

    const expenseParticipantEstimate = participantForm.getFieldValue('actual_exp');
    const expenseParticapantActual = participantForm.getFieldValue('actual_sale');
    let expenseParticapantUserList = [];
    participants.forEach(element => {
      expenseParticapantUserList.push(element.id);
    });

    const body = {
        "page_code": pageCode,
        ...allValuesBasic,
        "image_list": imageLists,
        "is_expense": isExpense,
        "expense_product_total_estimate_sale": expenseProductTotalEstimateSale,
        "expense_product_total_acutal_sale": expenseProductTotalAcutalSale,
        "expense_product_data_list": expenseProductDataList,
        "expense_customer_dealer_id": expenseCustomerDealerId,
        "expense_customer_dealer_code": expenseCustomerDealerCode,
        "expense_customer_name": expenseCustomerName,
        "expense_customer_place_of_owner": expenseCustomerPlaceOfOwner,
        "expense_customer_phone_number": expenseCustomerPhoneNumber,
        "expense_customer_address": expenseCustomerAddress,
        "expense_customer_perception_id": expenseCustomerPerceptionId,
        "expense_customer_perception_name": expenseCustomerPerceptionName,
        "expense_customer_location_longitude": expenseCustomerLocationLongitude,
        "expense_customer_location_latitude": expenseCustomerLocationLatitude,
        "expense_customer_location_address": expenseCustomerLocationAddress,
        "expense_actual_exp": expenseActualExp,
        "expense_actual_sale": expenseActualSale,
        "expense_file_list":[],
        "expense_participant_estimate": expenseParticipantEstimate,
        "expense_particapant_actual": expenseParticapantActual,
        "expense_particapant_user_list": expenseParticapantUserList
    };
    
    useServiceAPI
    .post(paths.pathActivityCreate, body, setLoading)
    .then((response) => {
      // navigate("/activity/list");
    })
    .catch((error) => {
      console.log(error);
    });
  };

  const showLayoutExpense = () => {
    setIsBtnExpenseActive(isBtnExpenseActive ? false : true);
  }

  //Location Customer
  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (locationCustomer.lat && locationCustomer.long) {
      // เรียก getAddress เมื่อ lat และ long มีค่า
      getAddress(locationCustomer.lat, locationCustomer.long);
    }
  }, [locationCustomer.lat, locationCustomer.long]);

  const getLocation = () => {    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const long = position.coords.longitude;
          getAddress(lat, long);
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser.");
    }
  };

  const getAddress = async (lat, long) => {
    const apiKey = "AIzaSyAF-YpYX1gu-kPeKxVdCTh9f_9nXXlZaPc";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${apiKey}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === "OK") {
        const fetchedAddress = data.results[0]?.formatted_address || "Address not found";
        setLocationCustomer((prev) => ({
          ...prev,
          address: fetchedAddress,
          lat: lat,
          long: long,
        })); 
            
      } else {
        console.error("Failed to fetch address");
      }
    } catch (err) {
      console.error("Error fetching address:", err);
    }
  };

  const handleReload = () => {
    setLoading(true);
    setTimeout(() => {
      getLocation();
      setLoading(false);
    }, 2000); // ตั้งค่าความล่าช้าตามที่ต้องการ

  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Create Activity</div>
        {mode !== 'advance' ? (
          !isBtnExpenseActive ? 
          <ActionButton mode="create" text="Add Advance Expense" onClick={showLayoutExpense} />
          :
          <ActionButton mode="hide" text="Hide Advance Expense" onClick={showLayoutExpense} />
        ) : null}
        
        {/* <ActionButton mode="hide" text="Add Advance Expense" onClick='' /> */}
      </div>

      <FormCustom fields={formFields} form={formCustom} onChange={handleChange}/>

      {(isBtnExpenseActive || mode == 'advance') ? (
        <>
          <div className="flex items-center justify-between">
            <div className="title-page">Advance Expense</div>
          </div>
          <BoxPrimary title="Sale Plan">
            <TableComponent
              header={header}
              dataSource={productCropList}
              pageSize={10}
              footer={productCropList.length > 0 ? footerOrderList : null}
              pagination={false}
            />
          </BoxPrimary>

          <BoxPrimary>
            <span className="text-[#00783F] text-lg font-semibold mb-3">Customer</span>
            <Form
              layout="vertical"
              form={customerForm}
              initialValues={{
                supportCustomerName: dealerCustomer.customer_name,
                address: dealerCustomer.customer_address,
                placeOfOwner: dealerCustomer.customer_place_of_owner,
                phoneNumber: dealerCustomer.customer_phone_number,
                perception: "Good",
                location_customer_address: locationCustomer.address,
                location_customer_latitude: locationCustomer.lat,
                location_customer_longitude: locationCustomer.long
              }}
            >
              <Row gutter={[16, 16]} className="mt-3">
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Support Customer Name" name="supportCustomerName">
                    <Input disabled="true"/>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Place of Owner" name="placeOfOwner">
                    <Input placeholder="-" disabled="true"/>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Phone Number" name="phoneNumber">
                    <Input placeholder="Enter phone number" disabled="true"/>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Perception" name="perception">
                    <Select>
                      {perceptionList.map((option) => (
                        <Option key={option.id} value={option.id}>
                          {option.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24}>
                  <Form.Item className="mb-3" label="Address" name="address">
                    <Input disabled="true"/>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24}>
                  <div>
                      <div style={{ position: "relative" }}>
                      <Form.Item
                        name="location_customer_address"
                        label="Place of GPS"
                      >
                        <Input
                          placeholder="Address"
                          value={locationCustomer.address || ""}
                          key={locationCustomer.address} // เพิ่ม key เพื่อบังคับให้รีเฟรช
                          disabled="true"
                          style={{
                            width: "100%",
                            paddingRight: "50px",
                            paddingLeft: "12px",
                            border: "1px solid #d9d9d9",
                            borderRadius: "4px",
                            padding: "8px 12px",
                            boxSizing: "border-box",
                          }}
                        />
                      </Form.Item>


                        <div
                          onClick={handleReload}
                          style={{
                            position: "absolute",
                            top: "76%",
                            right: "10px",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            fontSize: "16px",
                            color: "#d9d9d9",
                          }}
                        >
                          <ReloadOutlined
                            style={{
                              fontSize: "18px",
                              animation: loading ? "spin 1s linear infinite" : "none", // เปิด/ปิดการหมุน
                            }}
                          />
                        </div>
                        {/* CSS Keyframes */}
                        <style>{`
                          @keyframes spin {
                            0% {
                              transform: rotate(0deg);
                            }
                            100% {
                              transform: rotate(360deg);
                            }
                          }
                        `}</style>
                      </div>

                      <Form.Item
                        name="location_customer_latitude"
                        hidden
                      >
                        <Input
                          type="hidden"
                          placeholder="Latitude"
                          value={locationCustomer.lat || ""}
                          disabled="true"
                        />
                      </Form.Item>
                  
                      <Form.Item
                        name="location_customer_longitude"
                        hidden
                      >
                        <Input
                          type="hidden"
                          placeholder="Longitude"
                          value={locationCustomer.long || ""}
                          disabled="true"
                        />
                      </Form.Item>
                    </div>
                  </Col>
              </Row>
            </Form>
          </BoxPrimary>

          <BoxPrimary title='Expense'>
            <Form
              layout="vertical"
              form={expenseForm} // Use the new expenseForm instance here
              initialValues={{
                actual_exp: "0",
                actual_sale: "0"
              }}
            >
              <Row gutter={[16, 16]} className="mt-3">
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Actual exp" name="actual_exp">
                    <Input placeholder="0" disabled />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Actual sale" name="actual_sale">
                    <Input placeholder="0" disabled />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </BoxPrimary>

          <BoxPrimary>
            <div className="flex items-center justify-between">
              <div className="text-[#00783F] text-lg font-semibold mb-3">File</div>
              <ActionButton mode="add" text="Upload File" onClick={handleUploadClick} />
            </div>
            <FileUploadComponent ref={fileUploadRef} mode="edit" dataFile={fileList} modeUpload={mode} onUploadSuccess={handleUploadSuccess}/>
          </BoxPrimary>

          {/* Participant Section */}
          <BoxPrimary>
            <div className="flex items-center justify-between">
              <div className="text-[#00783F] text-lg font-semibold mb-3">Participant</div>
              <ActionButton mode="add" text="Add" onClick={handleOpenTeamModal} />
            </div>

            <Form
              layout="vertical"
              form={participantForm}
              initialValues={{
                estimate_participant: "0",
                actual_participant: "0"
              }}
            >
              <Row gutter={[16, 16]} className="mt-3">
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Estimate Participant " name="actual_exp">
                    <Input placeholder="0" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Actual Participant" name="actual_sale">
                    <Input placeholder="0" />
                  </Form.Item>
                </Col>
              </Row>

              <TableComponent
                header={participantColumns}
                dataSource={participants}
                pagination={false}
              />
            </Form>
          </BoxPrimary>
        </>
      ) : null}

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/activity/list")} />
        <ActionButton mode="save" text="Save" onClick={handleSave} />
      </div>

      {/* Modal for Add Participant */}
      <DynamicModal
        title="Add Participant"
        isVisible={isTeamModalVisible}
        onClose={handleCloseTeamModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          { title: "Name", dataIndex: "name", key: "name", width: 150 },
          { title: "Territory", dataIndex: "territory", key: "territory", width: 150 },
          { title: "Position", dataIndex: "position", key: "position", width: 150 },
        ]}
        dataSource={participantList}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />
    </MainLayout>
  );
}
