import React, { useContext ,useEffect, useState } from "react";
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
import { Col, Form, Input, Row } from "antd";
import { values } from "lodash";

export default function EditUser() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [position, setPosition] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [territory, setTerritory] = useState([]);
  const [areas, setAreas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form] = Form.useForm();
  const { showMsg } = useContext(AuthContext);
  const location = useLocation();
  const [profileImage, setProfileImage] = useState("");
  const [userinfo, setUserInfo] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchPromotionDetails(location.state.id);

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
        // setAreas(areas.data.map((a) => ({ ...a, name: a.area_name })));
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

  }, []);

  const fetchPromotionDetails = async (id) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(`${paths.pathMasterUsersDetail}/${id}`);
      if (response.status === 200) {
        const { data } = response;
        setProfileImage(data.profile_image);
        setUserInfo(data);

      } else {
        console.error(response.message);
      }
    } 
    catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const updatedFields = [
    {
      label: "Profile Image",
      name: "profile", // ชื่อฟิลด์ในฟอร์ม
      type: "picture", // ประเภทฟิลด์
      required: false,
      col: 24,
      value: userinfo.profile_image, // ใช้ค่า profile_image จาก API
    },
    {
      label: "Name (EN)",
      name: "name_en",
      type: "text",
      required: true,
      col: 6,
      value: userinfo.name_en,
    },
    {
      label: "Name (TH)",
      name: "name_th",
      type: "text",
      required: true,
      col: 6,
      value: userinfo.name_th,
    },
    {
      label: "Sales Employee Code",
      name: "employee_code",
      type: "text",
      required: true,
      col: 6,
      disabled: true,
      value: userinfo.sales_emp_code
    },
    {
      label: "Contact Number",
      name: "contact_number",
      type: "tel",
      required: true,
      col: 6,
      value: userinfo.phone_number
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
      col: 6,
      value: userinfo.email
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      required: false,
      col: 12,
      value: userinfo.address
    },
    {
      label: "Position",
      name: "position_id",
      type: "select",
      required: true,
      col: 6,
      options: position,
      value: parseInt(userinfo.position_id, 10),

    },
    {
      label: "Department",
      name: "department_id",
      type: "select",
      required: false,
      col: 6,
      options: departments,
      value: parseInt(userinfo.department_id, 10),

    },
    {
      label: "Territory",
      name: "territory_id",
      type: "select",
      required: false,
      col: 6,
      options: territory,
      value: parseInt(userinfo.territory_id, 10),
    },
    {
      label: "Area",
      name: "area_id",
      type: "select",
      required: false,
      col: 6,
      options: areas,
      value: parseInt(userinfo.area_id, 10),
    },
    {
      label: "Role",
      name: "role_id",
      type: "select",
      required: true,
      col: 6,
      options: roles,
      value: parseInt(userinfo.role_id, 10),
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
      name: "use_flag",
      type: "select",
      required: false,
      col: 6,
      options: [
        { name: "Active", id: 1, selected: true },
        { name: "Inactive", id: 0, selected: false },
      ],
      value: userinfo.use_flag === 1 ? "Active" : "Inactive" 
    },
 
  ];

  const handleBack = () => {
    navigate("/setting/user");
  };

  // const handleSave = () => {
  //   navigate("/setting/user");
  // };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const dataToSend = {
          ...values,
          user_id: location.state.id, 
        };
  
        useServiceAPI
          .put(paths.pathMasterUsersEdit, dataToSend, setLoading)
          .then((response) => {
            if (response.status === 201) {
              console.log(response.data.message);
              showMsg("success", response.data.message).then(() => {
                navigate("/setting/user");
              });
            }
          })
          .catch((error) => {
            console.error(error);
            if (error.status === 422) {
              showMsg("error", error.message);
            } else {
              showMsg("error", "เกิดข้อผิดพลาด");
            }
          });
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };
  

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit User</div>

      <FormUser 
        profile={form.getFieldValue("profile")}
        // profile="/img/profile.jpg" 
        fields={updatedFields} 
        form={form}
      />

      <BoxPrimary>
        <div className="flex items-center justify-between">
          <div className="text-[#00783F] text-lg font-semibold mb-3">Change Password</div>
          {/* <ActionButton mode="edit" text="Edit" onClick='' /> */}
          <ActionButton mode="edit" text="Edit" onClick={() => console.log("Edit button clicked")} />

        </div>
        <Form layout="vertical">
          <Row gutter={[16, 16]} className="mt-3">
            <Col xs={24} sm={12} md={12} lg={8}>
              <Form.Item className="mb-3" label="Current password">
                <Input.Password disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={8}>
              <Form.Item className="mb-3" label="New password">
                <Input.Password disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12} lg={8}>
              <Form.Item className="mb-3" label="Confirm password">
                <Input.Password disabled />
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
