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
  const { userInfo, showNotification, showMsg } = useContext(AuthContext);
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

  const handleSave = () => {
    form
      .validateFields()
      .then(async (values) => {
        // if (!values.profile) {
        //   showNotification("error", "No data update!");
        //   return; // หยุดการทำงานหาก profile เป็น null
        // }

        const {
          current_password,
          new_password,
          new_confirm_password,
          profile,
        } = values;
        const dataToSend = {
          ...values,
          // token: userInfo?.token,
        };

        const updateimg = {
          user_id: userInfo.id,
          profile: profile,
        };

        // เริ่มสถานะ loading
        setLoading(true);

        try {
          const promises = [];

          // ตรวจสอบว่าต้องส่ง API สำหรับเปลี่ยนรหัสผ่านหรือไม่
          if (current_password && new_password && new_confirm_password) {
            const passwordPromise = useServiceAPI.post(
              paths.pathProfileChangePassword,
              dataToSend
            );
            promises.push(passwordPromise);
          }

          // ตรวจสอบว่าต้องส่ง API สำหรับอัปเดตรูปภาพหรือไม่
          if (profile) {
            const profileImgPromise = useServiceAPI.put(
              paths.pathProfileProfileimg,
              updateimg
            );
            promises.push(profileImgPromise);
          }

          // รอให้คำขอทั้งหมดเสร็จสิ้น
          const responses = await Promise.all(promises);

          // ตรวจสอบผลลัพธ์ของ API แต่ละตัว
          responses.forEach((response) => {
            console.log(response);
            if (response.status === 200 ) {
              if (profile) {
                console.log(updateimg?.profile);
                console.log(userInfo?.profile_image, "info");

                userInfo.profile_image = updateimg.profile;

                localStorage.setItem("users", JSON.stringify(userInfo));
              }

              showNotification(
                "success",
                response?.data?.message || "Update successful"
              );
            } else {
              showNotification(
                "error",
                response?.data?.message || "Error occurred"
              );
            }
          });
        } catch (error) {
          console.error("Error occurred:", error);
          if (error.response?.status === 422) {
            showNotification(
              "error",
              error.response?.data?.message || "Validation error"
            );
          } else {
            showNotification("error", "Unexpected error occurred");
          }
        } finally {
          // ปิดสถานะ loading
          setLoading(false);
        }
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
      value: parseInt(formUserInfo.use_flag, 10) === 1 ? "Active" : "Inactive",
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Profile</div>

      {dataLoaded ? (
        <FormUser profile={profileImage} fields={formFields} form={form} />
      ) : (
        <div></div>
      )}
      <BoxPrimary>
        <div className="flex items-center justify-between">
          <div className="text-[#00783F] text-lg font-semibold mb-3">
            Change Password
          </div>

          <Button type="primary" danger onClick={handleEditPassword}>
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
                  {
                    required: isEditingPassword,
                    message: "Please input your current password!",
                  },
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
                validateTrigger="onBlur"
                rules={[
                  {
                    required: isEditingPassword,
                    message: "Please input your new password!",
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const errors = [];
                      if (value.length < 8) errors.push("At least 8 characters");
                      if (!/[a-z]/.test(value)) errors.push("Contains a lowercase letter");
                      if (!/[A-Z]/.test(value)) errors.push("Contains an uppercase letter");
                      if (!/\d/.test(value)) errors.push("Contains a digit");
                      if (!/[@$!%*?&#^(){}[\]:;<>,.?~_+=|\\/-]/.test(value))
                        errors.push("Contains a symbol");

                      if (errors.length > 0) return Promise.reject(errors.join(", "));
                      return Promise.resolve();
                    },
                  },
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
                dependencies={["new_password"]}
                rules={[
                  {
                    required: isEditingPassword,
                    message: "Please confirm your password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("new_password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The two passwords that you entered do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password disabled={!isEditingPassword} />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton text="Update" mode="update" onClick={handleSave} />
      </div>
    </MainLayout>
  );
}
