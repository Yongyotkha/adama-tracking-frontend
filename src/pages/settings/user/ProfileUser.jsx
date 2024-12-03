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
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formUserInfo, setFormUserInfo] = useState({});
  const [isEditingPassword, setIsEditingPassword] = useState(false); // State to manage password edit mode
  const [position, setPosition] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [territory, setTerritory] = useState([]);
  const [areas, setAreas] = useState([]);
  const [roles, setRoles] = useState([]);
  const { userInfo, showNotification } = useContext(AuthContext);

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

    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [positions, departments, territories, areas, roles] =
        await Promise.all([
          useServiceAPI.get(paths.pathMasterPosition, {}),
          useServiceAPI.get(paths.pathMasterDepartments, {}),
          useServiceAPI.get(paths.pathMasterTerritory, {}),
          useServiceAPI.get(paths.pathMasterAreas, {}),
          useServiceAPI.get(paths.pathMasterRoles, {}),
        ]);

      setPosition(positions.data);
      setDepartments(departments.data);
      setTerritory(territories.data);
      setAreas(areas.data);
      setRoles(roles.data);
    } catch (error) {
      showMsg("error", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

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
      value: formUserInfo.name_th,
    },
    {
      label: "Sales Employee Code",
      name: "employee_code",
      type: "text",
      required: true,
      col: 6,
      // disabled: true,
      value: formUserInfo.sales_emp_code,
    },
    {
      label: "Contact Number",
      name: "contact_number",
      type: "tel",
      required: true,
      col: 6,
      value: formUserInfo.phone_number,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
      col: 6,
      value: formUserInfo.email,
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      required: false,
      col: 12,
      value: formUserInfo.address,
    },
    {
      label: "Position",
      name: "position",
      type: "select",
      required: true,
      col: 6,
      options: position,
      value: formUserInfo.position_id,
    },
    {
      label: "Department",
      name: "department",
      type: "select",
      required: false,
      col: 6,
      options: departments,
      value: 1,
    },
    {
      label: "Territory",
      name: "territory",
      type: "text",
      required: false,
      col: 6,
      options: territory,

      value: "North",
    },
    {
      label: "Area",
      name: "area",
      type: "text",
      required: false,
      col: 6,
      options: areas,

      value: "Zone 1",
    },
    {
      label: "Role",
      name: "role",
      type: "select",
      required: true,
      col: 6,
      options: roles,
      value: 2,
    },
    // {
    //   label: "Permission",
    //   name: "permission",
    //   type: "select",
    //   required: false,
    //   col: 6,
    //   options: [
    //     { name: "Individual and BD/Assist", id: 1, selected: false },
    //     { name: "Admin", id: 2, selected: false },
    //     { name: "Viewer", id: 3, selected: false },
    //   ],
    // },
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

      <FormUser  fields={formFields} form={form} />

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
