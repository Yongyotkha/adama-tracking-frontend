import React, { useContext, useEffect, useState } from "react";
import { Form } from "antd";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import ActionButton from "../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";
import dayjs from "dayjs";

export default function CreateUser() {
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [territory, setTerritory] = useState([]);
  const [areas, setAreas] = useState([]);
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { showMsg } = useContext(AuthContext);

  const handleBack = () => {
    navigate("/setting/user");
  };

  useEffect(() => {
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
        // setAreas(areas.data.map((a) => ({ ...a, name: a.area_name })));
        setAreas(areas.data);
        setRoles(roles.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        if (values.date_of_joining) {
          values.date_of_joining = dayjs(values.date_of_joining).format(
            "YYYY-MM-DD"
          );
        }

        useServiceAPI
          .post(paths.pathMasterUsersCreate, values, setLoading)
          .then((response) => {
            if (response.status == 201) {
              console.log(response.data.message);
              showMsg("success", response.data.message).then(() => {
                navigate("/setting/user"); // นำทางไปยังหน้าล็อกอิน
              });
            }
          })
          .catch((error) => {
            console.log(error);
            if (error.status == 422) {
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
    },
    {
      label: "Name (TH)",
      name: "name_th",
      type: "text",
      required: true,
      col: 6,
    },
    {
      label: "Sales Employee Code",
      name: "sales_emp_code",
      type: "text",
      required: true,
      col: 6,
      // disabled: true,
    },
    {
      label: "Contact Number",
      name: "contact_number",
      type: "tel",
      required: false,
      col: 6,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      required: false,
      col: 6,
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      required: false,
      col: 12,
    },
    {
      label: "Position",
      name: "position_id",
      type: "select",
      required: true,
      col: 6,
      options: position,
    },
    {
      label: "Department",
      name: "department_id",
      type: "select",
      required: false,
      col: 6,
      options: departments,
    },
    {
      label: "Territory",
      name: "territory_id",
      type: "select",
      required: false,
      col: 6,
      options: territory,
    },
    {
      label: "Area",
      name: "area_id",
      type: "select",
      required: false,
      col: 6,
      options: areas,
    },
    {
      label: "Role",
      name: "role_id",
      type: "select",
      required: true,
      col: 6,
      options: roles,
    },
    {
      label: "Date of Joining",
      name: "date_of_joining",
      type: "date",
      required: false,
      col: 6,
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
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create User</div>
      <FormUser fields={formFields} form={form} />
      <div className="flex justify-end space-x-4 mt-4">
        <ActionButton text="Back" mode="back" onClick={handleBack} />
        <ActionButton text="Save" mode="save" onClick={handleSave} />
      </div>
    </MainLayout>
  );
}
