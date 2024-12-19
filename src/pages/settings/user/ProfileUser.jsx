import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Button, Col, Form, Input, Row } from "antd";
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
  const { userInfo, showNotification , showMsg } = useContext(AuthContext);
  const [profileImage, setProfileImage] = useState("/img/profile.jpg"); // Default value
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    useServiceAPI
      .get(`${paths.pathMasterUsersDetail}/${userInfo.id}`, {}, setLoading)
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data.profile_image);
          setFormUserInfo(response.data);
          setProfileImage(response.data.profile_image);

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
      setDataLoaded(true);

    } catch (error) {
      showMsg("error", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/setting/user");
  };

  // const handleSave = () => {
  //   // Perform save logic here
  //   navigate("/setting/user");
  // };


  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        console.log(values);
        
        const dataToSend = {
          ...values,
          token: userInfo?.token 
        };
  
        useServiceAPI
          .post(paths.pathProfileChangePassword, dataToSend, setLoading)
          .then((response) => {
            // return;
            // console.log(response.status);
            // console.log(response.result);
            // console.log(response.message);

            if (response.status === 200) {
                if(response.data.Result === false){
                  showNotification(
                    "error",
                    response.data.Message.Message_Header,
                    response.data.Message.Message_Line
                  );
                }
                else if(response.result === true){
                  navigate("/setting/user");
                  showNotification(
                    "success",
                    response.message,
                    // response.data.Message.Message_Line
                  );
                };
            }
          })
          .catch((error) => {
            if (error.status == 422) {
              showNotification("error", error.response.data.data.message || error.response.data.message);              
            } else if (error.status == 500) {
              showNotification("error", error.response.data.data.message);
            } else {
              showNotification("error", "error");
            }
          });
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };
  

  const handleEditPassword = () => {
    setIsEditingPassword((prev) => !prev); // Toggle edit mode
  };

  const formFields = [
    {
      label: "",
      name: "profile",
      type: "picture", // เพิ่มรูปภาพในลูป
      required: false,
      col: 24,
    },
    {
      label: "Name (EN)",
      name: "name_en",
      type: "text",
      required: true,
      col: 6,
      value: formUserInfo.name_en,
      disabled: true,
    },
    {
      label: "Name (TH)",
      name: "name_th",
      type: "text",
      required: true,
      col: 6,
      value: formUserInfo.name_th,
      disabled: true,
    },
    {
      label: "Sales Employee Code",
      name: "employee_code",
      type: "text",
      required: false,
      col: 6,
      disabled: true,
      value: formUserInfo.sales_emp_code,
    },
    {
      label: "Contact Number",
      name: "contact_number",
      type: "tel",
      required: true,
      col: 6,
      value: formUserInfo.phone_number,
      disabled: true,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
      col: 6,
      value: formUserInfo.email,
      disabled: true,
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      required: false,
      col: 12,
      value: formUserInfo.address,
      disabled: true,
    },
    {
      label: "Position",
      name: "position",
      type: "select",
      required: true,
      col: 6,
      options: position,
      value: parseInt(formUserInfo.position_id, 10),
      disabled: true,
    },
    {
      label: "Department",
      name: "department",
      type: "select",
      required: false,
      col: 6,
      options: departments,
      value: parseInt(formUserInfo.department_id, 10),
      disabled: true,
    },
    {
      label: "Territory",
      name: "territory",
      type: "text",
      required: false,
      col: 6,
      options: territory,
      value: formUserInfo.territory_name,
      disabled: true,
    },
    {
      label: "Area",
      name: "area",
      type: "text",
      required: false,
      col: 6,
      options: areas,
      disabled: true,
      value: formUserInfo.area_name,
    },
    {
      label: "Role",
      name: "role",
      type: "select",
      required: true,
      col: 6,
      options: roles,
      value: parseInt(formUserInfo.role_id, 10),
      disabled: true,
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
      value: formUserInfo.date_of_joining,
      disabled: true,
    },
    {
      label: "Status",
      name: "use_flag",
      type: "select",
      required: false,
      col: 6,
      disabled: true,
      options: [
        { name: "Active", id: 1, selected: true },
        { name: "Inactive", id: 0, selected: false },
      ],
      value: parseInt(formUserInfo.use_flag,10) === 1 ? "Active" : "Inactive"
    },

  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Profile</div>


      {dataLoaded ? (
        <FormUser  
          profile={profileImage}  
          fields={formFields} 
          form={form} 
        />

      ) : (
        <div></div>
      )}
<BoxPrimary>
  <div className="flex items-center justify-between">
    <div className="text-[#00783F] text-lg font-semibold mb-3">
      Change Password
    </div>
    {/* <ActionButton
      mode="delete"
      text={isEditingPassword ? "Cancel" : "Edit"}
      onClick={handleEditPassword}
    /> */}
    <Button 
      type="primary" 
      danger 
      onClick={handleEditPassword}
    >
    <img
      src="/img/icons/edit-btn.png"
      alt="button icon"
      className="inline-block h-5"
    />
      {isEditingPassword ? "Cancel" : "Edit"} 
    </Button>

  </div>
  <Form layout="vertical" form={form}>
    <Row gutter={[16, 16]} className="mt-3">
      <Col xs={24} sm={12} md={12} lg={8}>
        <Form.Item
          className="mb-3"
          name="current_password"
          label="Current password"
          rules={[
            { required: isEditingPassword, message: "Please input your current password!" }
          ]}
        >
          <Input.Password disabled={!isEditingPassword} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={12} lg={8}>
        <Form.Item
          className="mb-3"
          name="new_password"
          label="New password"
          rules={[
            { required: isEditingPassword, message: "Please input your new password!" }
          ]}
        >
          <Input.Password disabled={!isEditingPassword} />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={12} lg={8}>
        <Form.Item
          className="mb-3"
          name="new_confirm_password"
          label="Confirm password"
          dependencies={['new_password']}
          rules={[
            { required: isEditingPassword, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('new_password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'));
              },
            }),
          ]}
        >
          <Input.Password disabled={!isEditingPassword} />
        </Form.Item>
      </Col>
    </Row>
  </Form>
  {/* <div className="flex justify-end space-x-4">
    <ActionButton text="Update Password" mode="update" onClick={handleSave} />
  </div> */}
</BoxPrimary>

      <div className="flex justify-end space-x-4">
        {/* <ActionButton text="Back" mode="back" onClick={handleBack} /> */}
        <ActionButton text="Update" mode="update" onClick={handleSave} />
      </div>
    </MainLayout>
  );
}
