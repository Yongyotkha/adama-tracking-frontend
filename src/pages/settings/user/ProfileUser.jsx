import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Col, Form, Input, Row } from "antd";
import useServiceAPI from "../../../services/CorsService";
import { AuthContext } from "../../../contexts/AuthContext";
import { paths } from "../../../services/CorsPath";

export default function ProfileUser() {
  const [loading, setLoading] = useState(false);
  const [formUserInfo, setFormUserInfo] = useState({});
  const [isEditingPassword, setIsEditingPassword] = useState(false); // State to manage password edit mode
  const navigate = useNavigate();
  const { userInfo, showNotification } = useContext(AuthContext);
  const [form] = Form.useForm();

  useEffect(() => {
    useServiceAPI
      .get(`${paths.pathMasterUsersDetail}/${userInfo.id}`, {}, setLoading)
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          setFormUserInfo(response.data);
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.status === 422) {
          showNotification("error", error.message);
        } else {
          showNotification("error", "เกิดข้อผิดพลาด");
        }
      });
  }, []);

  const handleBack = () => {
    navigate("/setting/user");
  };

  const handleSave = () => {
    // Perform save logic here
    navigate("/setting/user");
  };

  const handleEditPassword = () => {
    setIsEditingPassword((prev) => !prev); // Toggle edit mode
  };

  const formFields = [
    {
      label: "Name (EN)",
      name: "name_en",
      type: "text",
      required: true,
      col: 6,
      value: formUserInfo.name_en,
    },
    {
      label: "Name (TH)",
      name: "name_th",
      type: "text",
      required: true,
      col: 6,
      value: "จอห์น โด",
    },
    {
      label: "Sales Employee Code",
      name: "employee_code",
      type: "text",
      required: true,
      col: 6,
      disabled: true,
      value: "SM123",
    },
    {
      label: "Contact Number",
      name: "contact_number",
      type: "tel",
      required: true,
      col: 6,
      value: "0812345678",
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
      col: 6,
      value: "john.doe@example.com",
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      required: false,
      col: 12,
      value: "123 Main St, Bangkok",
    },
    {
      label: "Position",
      name: "position",
      type: "select",
      required: true,
      col: 6,
      options: [
        { name: "Sales Assistant", id: 1, selected: false },
        { name: "Manager", id: 2, selected: true },
        { name: "Team Lead", id: 3, selected: false },
      ],
      value: 2,
    },
    {
      label: "Department",
      name: "department",
      type: "select",
      required: false,
      col: 6,
      options: [
        { name: "Sales Team", id: 1, selected: true },
        { name: "Marketing Team", id: 2, selected: false },
        { name: "Support Team", id: 3, selected: false },
      ],
      value: 1,
    },
    {
      label: "Territory",
      name: "territory",
      type: "text",
      required: false,
      col: 6,
      value: "North",
    },
    {
      label: "Area",
      name: "area",
      type: "text",
      required: false,
      col: 6,
      value: "Zone 1",
    },
    {
      label: "Role",
      name: "role",
      type: "select",
      required: true,
      col: 6,
      options: [
        { name: "Individual Module", id: 1, selected: false },
        { name: "Admin Module", id: 2, selected: true },
        { name: "Viewer", id: 3, selected: false },
      ],
      value: 2,
    },
    {
      label: "Permission",
      name: "permission",
      type: "select",
      required: false,
      col: 6,
      options: [
        { name: "Individual and BD/Assist", id: 1, selected: false },
        { name: "Admin", id: 2, selected: false },
        { name: "Viewer", id: 3, selected: false },
      ],
    },
    {
      label: "Date of Joining",
      name: "date_of_joining",
      type: "date",
      required: false,
      col: 6,
      value: null,
    },
    {
      label: "Status",
      name: "status",
      type: "select",
      required: false,
      col: 6,
      options: [
        { name: "Active", id: 1, selected: true },
        { name: "Inactive", id: 0, selected: false },
      ],
      value: 1,
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Profile</div>

      <FormUser profile="/img/profile.jpg" fields={formFields} form={form} />

      <BoxPrimary>
        <div className="flex items-center justify-between">
          <div className="text-[#00783F] text-lg font-semibold mb-3">
            Change Password
          </div>
          <ActionButton
            mode="edit"
            text={isEditingPassword ? "Cancel" : "Edit"} // Toggle button text
            onClick={handleEditPassword}
          />
        </div>
        <Form layout="vertical">
          <Row gutter={[16, 16]} className="mt-3">
            <Col xs={24} sm={12} md={12} lg={8}>
              <Form.Item className="mb-3" label="Current password">
                <Input.Password disabled={!isEditingPassword} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={8}>
              <Form.Item className="mb-3" label="New password">
                <Input.Password disabled={!isEditingPassword} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={8}>
              <Form.Item className="mb-3" label="Confirm password">
                <Input.Password disabled={!isEditingPassword} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton text="Back" mode="back" onClick={handleBack} />
        <ActionButton text="Update" mode="update" onClick={handleSave} />
      </div>
    </MainLayout>
  );
}
