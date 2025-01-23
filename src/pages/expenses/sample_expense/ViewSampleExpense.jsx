import React, { useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { Form, Input, Col, Row, Select } from "antd";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import FormCustom from "../../../components/form_custom/FormCustom";
import TableComponent from "../../../components/table/TableComponent";
import ActionButton from "../../../components/button/ActionButton";
import FileUploadComponent from "../../../components/file_upload/FileUploadComponent";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

export default function ViewSampleExpense() {
  const [loading] = useState(false);
  const navigate = useNavigate();

  const formFields = [
    { label: "Activity Reference", name: "activity_reference", type: "text", disabled: true, required: false, col: 24, value: "202400000000001" },
    { label: "Activity Type", name: "activity_type", type: "select", options: ["FMT"], disabled: true, required: true, col: 6, value: "FMT" },
    { label: "Shop", name: "shop", type: "select", options: ["Chaifar"], disabled: true, required: true, col: 6, value: "Chaifar" },
    { label: "Crop", name: "crop", type: "select", options: ["Rice"], disabled: true, required: true, col: 6, value: "Rice" },
    { label: "Date", name: "date", type: "date", disabled: true, required: true, col: 6, value: "2024-01-01" },
    { label: "Start Time", name: "start_time", type: "time", disabled: true, required: true, col: 6, value: "09:00" },
    { label: "End Time", name: "end_time", type: "time", disabled: true, required: true, col: 6, value: "11:00" },
    { label: "Location", name: "location", type: "text", disabled: false, required: false, col: 12, value: "2/80 ถนนพาดาวรี ต.ท่าอิฐ อ.เมืองอุดรธานี จ.อุดรธานี", iconSrc: "/img/icons/location.png", iconPosition: "left" },
    { label: "Description", name: "description", type: "text-editor", disabled: true, required: false, col: 24, placeholder: "Add description", value: "" }
  ];

  const header = [
    { title: "Product Name", dataIndex: "productName", key: "productName", align: "left" },
    { title: "Pack Size", dataIndex: "packSize", key: "packSize", align: "center" },
    { title: "Estimate Sale (Kg/Lt)", dataIndex: "estimateSale", key: "estimateSale", align: "center" },
    { title: "Actual Sale (Kg/Lt)", dataIndex: "actualSale", key: "actualSale", align: "center" },
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
        <Input placeholder="0" disabled />
      </td>
      <td colSpan={1} className="text-center">
        <Input placeholder="0" disabled />
      </td>
    </tr>
  );

  const participants = [
    { key: '1', no: 1, name: 'Kornkan Induang', position: 'Sales Executive', department: 'Sales Team', territory: 'Left North', permission: 'Individual and BD/Assist' },
    { key: '2', no: 2, name: 'Phaisan Jethuen', position: 'Sales Executive', department: 'Sales Team', territory: 'Left Lower North', permission: 'Individual and BD/Assist' },
    { key: '3', no: 3, name: 'Manupong Wongpuang', position: 'Sales Executive', department: 'Sales Team', territory: 'Lower North', permission: 'Individual and BD/Assist' },
    { key: '4', no: 4, name: 'Kriangkrai Kraikeaw', position: 'Sales Executive', department: 'Sales Team', territory: 'Central Left North', permission: 'Individual and BD/Assist' },
    { key: '5', no: 5, name: 'Charoenpong Khunawatcharakun', position: 'Sales Executive', department: 'Sales Team', territory: 'Central Right North', permission: 'Individual and BD/Assist' },
  ];

  const participantColumns = [
    { title: 'No', dataIndex: 'no', key: 'no', align: 'center' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Position', dataIndex: 'position', key: 'position' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Territory', dataIndex: 'territory', key: 'territory' },
    { title: 'Permission', dataIndex: 'permission', key: 'permission' },
  ];

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

  return (
    <MainLayout loading={loading}>
      <div className="title-page">View Advance Expense</div>

      <FormCustom fields={formFields} />

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
        <Form layout="vertical" initialValues={{
          supportCustomerName: "Chaifar",
          address: "2/80 ถนนพาดาวรี ต.ท่าอิฐ อ.เมืองอุดรธานี จ.อุดรธานี",
          perception: "Good"
        }}>
          <Row gutter={[16, 16]} className="mt-3">
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Support Customer Name">
                <Input value="Chaifar" disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Place of Owner">
                <Input value="-" disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={12}>
              <Form.Item className="mb-3" label="Address">
                <Input value="2/80 ถนนพาดาวรี ต.ท่าอิฐ อ.เมืองอุดรธานี จ.อุดรธานี" disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Phone Number">
                <Input value="-" disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Place of GPS">
                <Input value="-" disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Perception">
                <Select value="Good" disabled>
                  <Option value="Good">Good</Option>
                  <Option value="Average">Average</Option>
                  <Option value="Poor">Poor</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BoxPrimary>

      <BoxPrimary title="Expense">
        <Form layout="vertical">
          <Row gutter={[16, 16]} className="mt-3">
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Actual exp">
                <Input value="0" disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Actual sale">
                <Input value="0" disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BoxPrimary>

      <BoxPrimary title='File'>
        <FileUploadComponent dataFile={fileList} mode="view" />
      </BoxPrimary>

      <BoxPrimary title="Participant">
        <Form layout="vertical">
          <Row gutter={[16, 16]} className="mt-3">
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Estimate Participant ">
                <Input value="0" disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <Form.Item className="mb-3" label="Actual Participant">
                <Input value="0" disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <TableComponent
          header={participantColumns}
          dataSource={participants}
          pagination={false}
        />
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/expenses/advance")} />
      </div>

    </MainLayout>
  );
}
