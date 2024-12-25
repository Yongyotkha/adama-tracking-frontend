import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import DynamicButton from "../../../components/button/DynamicButton";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";
import { AuthContext } from "../../../contexts/AuthContext";
import { useLocation } from "react-router-dom";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Col, Form, Input, Row } from "antd";
import dayjs from "dayjs";

export default function EditUser() {
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();
  const [position, setPosition] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [territory, setTerritory] = useState([]);
  const [areas, setAreas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form] = Form.useForm();
  const location = useLocation();
  const [profileImage, setProfileImage] = useState("/img/profile.jpg"); // Default value
  const [userinfo, setUserInfo] = useState([]);
  const { showNotification } = useContext(AuthContext);
  const [permission, setPermission] = useState([]);

  // อ่านสถานะ mod จาก state
  const mode = location.state?.mod; 
  const isViewMode = mode === "View";

            
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user 
        // console.log(location.state.id);
        // console.log(location.state.mod);
        await fetchPromotionDetails(location.state.id);
        // Fetch other necessary data in parallel
        const [positions, departments, territories, areas, roles, permissions] =
          await Promise.all([
            useServiceAPI.get(paths.pathMasterPosition, {}),
            useServiceAPI.get(paths.pathMasterDepartments, {}),
            useServiceAPI.get(paths.pathMasterTerritory, {}),
            useServiceAPI.get(paths.pathMasterAreas, {}),
            useServiceAPI.get(paths.pathMasterRoles, {}),
            useServiceAPI.get(paths.pathMasterPermission, {}),
          ]);

        setPosition(positions.data);
        setDepartments(departments.data);
        setTerritory(territories.data);
        setAreas(areas.data);
        setRoles(roles.data);
        setPermission(permissions.data);

        // Mark data as loaded
        setDataLoaded(true);
      } catch (error) {
        console.error(error.message);
        showNotification("error", "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state.id]);

  const fetchPromotionDetails = async (id) => {
    try {
      const response = await useServiceAPI.get(`${paths.pathMasterUsersDetail}/${id}`);
      if (response.status === 200) {
        const { data } = response;
        setProfileImage(data.profile_image); // Update profile image
        setUserInfo(data);
      } else {
        console.error(response.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  let  updatedFields = [
    {
      label: "Profile Image",
      name: "profile", // ชื่อฟิลด์ในฟอร์ม
      type: "picture", // ประเภทฟิลด์
      required: false,
      col: 24,
      value: userinfo.profile_image,

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
      name: "sales_emp_code",
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
      label: "Permission",
      name: "permission",
      type: "select",
      required: false,
      col: 6,
      options: permission ,
      // value: parseInt(userinfo.permission_id, 10),
    },
    {
      label: "Date of Joining",
      name: "date_of_joining",
      type: "date",
      required: false,
      col: 6,
      value: userinfo.date_of_joining,
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
      // value: userinfo.use_flag === 1 ? "Active" : "Inactive" 
      value: parseInt(userinfo.use_flag,10) === 1 ? "Active" : "Inactive"
    },
 
  ];

  if (isViewMode) {
    updatedFields = updatedFields.map(field => ({
      ...field,
      disabled: true
    }));
  }

  const handleBack = () => {
    navigate("/setting/user");
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        if (values.date_of_joining) {
          values.date_of_joining = dayjs(values.date_of_joining).format("YYYY-MM-DD");
        }
        
        let useFlagValue;
        if (values.use_flag === 1 || values.use_flag === 0) {
          useFlagValue = values.use_flag; // ถ้าค่าเป็น 1 หรือ 0 อยู่แล้ว ใช้ค่าเดิม
        } else {
          useFlagValue = values.use_flag === "Active" ? 1 : 0; // แปลงค่าจาก "Active" หรือ "Inactive"
        }

        const dataToSend = {
          ...values,
          user_id: location.state.id,
          use_flag: useFlagValue, // ส่งค่า use_flag เป็น 1 หรือ 0

        };

        useServiceAPI
          .put(paths.pathMasterUsersEdit, dataToSend, setLoading)
          .then((response) => {
            if (response.status === 200) {
              navigate("/setting/user");
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              );
            }
          })
          .catch((error) => {
            if (error.status == 422) {
              // showMsg("error", error.message);
              showNotification("error",error.response.data.data.message);
            } else if (error.status == 500) {
              showNotification("error",error.response.data.data.message);
            } else {
              showNotification("error", "เกิดข้อผิดพลาด");
            }
          });
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">{isViewMode ? "View User" : "Edit User"}</div>

      {dataLoaded ? (
        <FormUser profile={profileImage} fields={updatedFields} form={form} />
      ) : (
        <div></div>
      )}

      <div className="flex justify-end space-x-4">
        <ActionButton text="Back" mode="back" onClick={handleBack} />
        {
          // แก้ไข: หากอยู่ในโหมด View ไม่ต้องแสดงปุ่ม Update
          !isViewMode && (
            <ActionButton text="Update" mode="update" onClick={handleSave} />
          )
        }

        {/* <ActionButton text="Update" mode="update" onClick={handleSave} /> */}
      </div>
    </MainLayout>
  );
}
