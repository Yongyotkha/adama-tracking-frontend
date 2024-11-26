import React, { useEffect, useRef, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Form, Input, Col, Row, Select } from "antd";
import ActionButton from "../../components/button/ActionButton";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import FormCustom from "../../components/form_custom/FormCustom";
import TableComponent from "../../components/table/TableComponent";
import FileUploadComponent from "../../components/file_upload/FileUploadComponent";
import DynamicButton from "../../components/button/DynamicButton";
import DynamicModal from "../../components/modal/DynamicModal";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";

const { Option } = Select;

export default function CreateActivity() {
  const [loading, setLoading] = useState(false);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
  const [activityList, setActivityList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [cropList, setCropList] = useState([]);
  const [timeList, setTimeList] = useState([]);
  const navigate = useNavigate();

  const [formCustom] = Form.useForm();
  const [customerForm] = Form.useForm();
  const [expenseForm] = Form.useForm();
  const [participantForm] = Form.useForm();
  const fileUploadRef = useRef(null); // Reference for FileUploadComponent

  const handleUploadClick = () => {
    // Call triggerUpload from FileUploadComponent
    if (fileUploadRef.current) {
      fileUploadRef.current.triggerUpload();
    }
  };

  // Example file list to be passed as dataFile
  const [fileList, setFileList] = useState([
    {
      uid: '-1',
      name: 'image.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },
    {
      uid: '-2',
      name: 'image.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },
    {
      uid: '-3',
      name: 'image.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },
    {
      uid: '-4',
      name: 'image.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },
  ]);

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
    { label: "Crop", name: "crop_id_list", type: "select", mode: "multiple", options: cropList, disabled: false, required: true, col: 6, value: [] },
    { label: "Date", name: "document_date", type: "date", disabled: false, required: true, col: 6, value: "2024-01-01" },
    { label: "Start Time", name: "time_start", type: "select", options:timeList, disabled: false, required: true, col: 6, value:""  },
    { label: "End Time", name: "time_end", type: "select", options:timeList, disabled: false, required: true, col: 6, value: "" },
    { label: "Location", name: "location_address", type: "location", disabled: true, required: false, col: 24, value: "", iconSrc: "/img/icons/location.png", iconPosition: "left" },
    { label: "Description", name: "description", type: "text-editor", disabled: false, required: false, col: 24, placeholder: "Add description", value: "" },
  ];

   // Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [activityType, sale, time] = await Promise.all([
          useServiceAPI.get(paths.pathMasterActivityType, {}),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {
            status: "all"
          }),
          useServiceAPI.get(paths.pathMasterTime, {}),
        ]);

        setActivityList(activityType.data);
        setSaleList(sale.data);
        setTimeList(time.data);
      } catch (error) {
        
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
          const [crop] = await Promise.all([
            useServiceAPI.get(paths.pathMasterCrop, {
              dealer_id: value
            }),
          ]);
          setCropList(crop.data);
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
        <Input placeholder="0" defaultValue={record.estimateSale} />
      )
    },
    {
      title: "Actual Sale (Kg/Lt)", dataIndex: "actualSale", key: "actualSale", align: "center", render: (_, record) => (
        <Input placeholder="0" defaultValue={record.actualSale} />
      )
    },
  ];

  const dataSource = [
    { key: "1", productName: "Ossinate 15%SL", packSize: "1Kg.", estimateSale: "0", actualSale: "0" },
    { key: "2", productName: "Apopo 20%SE", packSize: "1Lt.", estimateSale: "0", actualSale: "0" },
    { key: "3", productName: "Atranex 90WG", packSize: "5Kg.", estimateSale: "0", actualSale: "0" },
    { key: "4", productName: "Baloric 320EC", packSize: "0.5Lt.", estimateSale: "0", actualSale: "0" },
  ];

  const footerOrderList = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={2} className="text-left pr-2 text-white">Total (THB)</td>
      <td colSpan={1} className="text-center">
        <Input placeholder="0" />
      </td>
      <td colSpan={1} className="text-center">
        <Input placeholder="0" />
      </td>
    </tr>
  );

  const [participants, setParticipants] = useState([
    { key: '1', no: 1, name: 'Kornkan Induang', position: 'Sales Executive', department: 'Sales Team', territory: 'Left North', permission: 'Individual and BD/Assist' },
    { key: '2', no: 2, name: 'Phaisan Jethuen', position: 'Sales Executive', department: 'Sales Team', territory: 'Left Lower North', permission: 'Individual and BD/Assist' },
    { key: '3', no: 3, name: 'Manupong Wongpuang', position: 'Sales Executive', department: 'Sales Team', territory: 'Lower North', permission: 'Individual and BD/Assist' },
    { key: '4', no: 4, name: 'Kriangkrai Kraikaew', position: 'Sales Executive', department: 'Sales Team', territory: 'Central Left North', permission: 'Individual and BD/Assist' },
    { key: '5', no: 5, name: 'Charoenpong Khunawatcharakun', position: 'Sales Executive', department: 'Sales Team', territory: 'Central Right North', permission: 'Individual and BD/Assist' },
  ]);

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

  let counter = 1;
  const salesData = [
    { key: `sales-${counter++}`, no: 1, name: "Kornkan Induang", position: "Sales Executive", territory: "Left North" },
    { key: `sales-${counter++}`, no: 2, name: "Phaisan Jethuen", position: "Sales Executive", territory: "Left Lower North" },
    { key: `sales-${counter++}`, no: 3, name: "Manupong Wongpuang", position: "Sales Executive", territory: "Lower North" },
    { key: `sales-${counter++}`, no: 4, name: "Kriangkrai Kraikeaw", position: "Sales Executive", territory: "Central Left North" },
    { key: `sales-${counter++}`, no: 5, name: "Charoenpong Khunawatcharakun", position: "Sales Executive", territory: "Central Right North" },
    { key: `sales-${counter++}`, no: 6, name: "Amorn Sriworakul", position: "Sales Executive", territory: "Right Lower North" },
    { key: `sales-${counter++}`, no: 7, name: "Nitchapan Akkaraketsawad", position: "Sales Executive", territory: "Upper Central" },
    { key: `sales-${counter++}`, no: 8, name: "Manus Nakkhum", position: "Sales Executive", territory: "Central" },
  ];

  const handleOpenTeamModal = () => {
    setIsTeamModalVisible(true);
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
      return [...prev, ...newRows];
    });
  };

  const removeParticipant = (key) => {
    setParticipants(participants.filter(item => item.key !== key));
  };

  const handleSave = () => {
    formCustom
      .validateFields()
      .then((values) => {
        useServiceAPI
          .post(paths.pathActivatyCreate, values, setLoading)
          .then((response) => {
            navigate("/activity/list");
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Create Activity</div>
        <ActionButton mode="create" text="Add Advance Expense" onClick='' />
        {/* <ActionButton mode="hide" text="Add Advance Expense" onClick='' /> */}
      </div>

      <FormCustom fields={formFields} form={formCustom} onChange={handleChange}/>

      {/* TODO: ทำในส่วนของ Activity Infomation Basic ก่อน */}
      {/* <div className="flex items-center justify-between">
        <div className="title-page">Advance Expense</div>
        <ActionButton mode="hide" text="Hide Advance Expense" onClick='' />
      </div>
      <BoxPrimary title="Sale Plan">
        <TableComponent
          header={header}
          dataSource={dataSource}
          pageSize={10}
          footer={footerOrderList}
          pagination={false}
        />
      </BoxPrimary>

      <BoxPrimary>
        <span className="text-[#00783F] text-lg font-semibold mb-3">Customer</span>
        <Form
          layout="vertical"
          form={customerForm}
          initialValues={{
            supportCustomerName: "Chaifar",
            address: "2/80 ถนนพาดาวรี ต.ท่าอิฐ อ.เมืองอุดรธานี จ.อุดรธานี",
            perception: "Good"
          }}
        >
          <Row gutter={[16, 16]} className="mt-3">
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Support Customer Name" name="supportCustomerName">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Place of Owner" name="placeOfOwner">
                <Input placeholder="-" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12}>
              <Form.Item className="mb-3" label="Address" name="address">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Phone Number" name="phoneNumber">
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Place of GPS" name="placeOfGPS">
                <Input placeholder="Enter GPS location" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Perception" name="perception">
                <Select>
                  <Option value="Good">Good</Option>
                  <Option value="Average">Average</Option>
                  <Option value="Poor">Poor</Option>
                </Select>
              </Form.Item>
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
        <FileUploadComponent ref={fileUploadRef} dataFile={fileList} />
      </BoxPrimary> */}

      {/* Participant Section */}
      {/* <BoxPrimary>
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
      </BoxPrimary> */}

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
        dataSource={salesData}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />
    </MainLayout>
  );
}
