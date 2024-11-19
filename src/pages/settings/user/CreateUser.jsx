import React, { useContext, useEffect, useState } from "react";
import { Form } from "antd";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import ActionButton from "../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

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
    masterPosition();
    masterDepartments();
    masterTerritory();
    masterAreas();
    masterRoles();
  }, []);

  const masterPosition = () => {
    useServiceAPI
      .get(paths.pathMasterPosition, {
        platform: "web",
      })
      .then((response) => {
        if (response.status == 200) {
          setPosition(response.data);
        }
      })
      .catch((error) => {
        if (error.status == 422) {
          showMsg("error", error.message);
        } else {
          showMsg("error", "เกิดข้อผิดพลาด");
        }
      });
  };

  const masterDepartments = () => {
    useServiceAPI
      .get(paths.pathMasterDepartments, {
        platform: "web",
      })
      .then((response) => {
        if (response.status == 200) {

          const updatedDepartments = response.data.map((department) => {
            const { department_name, ...rest } = department;
            return {
              ...rest,
              name: department_name,
            };
          });

          setDepartments(updatedDepartments);
        }
      })
      .catch((error) => {
        if (error.status == 422) {
          showMsg("error", error.message);
        } else {
          showMsg("error", "เกิดข้อผิดพลาด");
        }
      });
  };

  const masterTerritory = () => {
    useServiceAPI
      .get(paths.pathMasterTerritory, {
        platform: "web",
      })
      .then((response) => {
        if (response.status == 200) {
          const updatedTerritories = response.data.map((territory) => {
            const { territory_name, ...rest } = territory;
            return {
              ...rest,
              name: territory_name,
            };
          });

          setTerritory(updatedTerritories);
        }
      })
      .catch((error) => {
        if (error.status == 422) {
          showMsg("error", error.message);
        } else {
          showMsg("error", "เกิดข้อผิดพลาด");
        }
      });
  };

  const masterAreas = () => {
    useServiceAPI
      .get(paths.pathMasterAreas, {
        platform: "web",
      })
      .then((response) => {
        if (response.status == 200) {
          const updatedAreas = response.data.map((Areas) => {
            const { area_name, ...rest } = Areas;
            return {
              ...rest,
              name: area_name,
            };
          });

          setAreas(updatedAreas);
        }
      })
      .catch((error) => {
        if (error.status == 422) {
          showMsg("error", error.message);
        } else {
          showMsg("error", "เกิดข้อผิดพลาด");
        }
      });
  };
  
  const masterRoles = () => {
    useServiceAPI
      .get(paths.pathMasterRoles, {
        platform: "web",
      })
      .then((response) => {
        if (response.status == 200) {
       

          setRoles(response.data);
        }
      })
      .catch((error) => {
        if (error.status == 422) {
          showMsg("error", error.message);
        } else {
          showMsg("error", "เกิดข้อผิดพลาด");
        }
      });
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form Values:", values);
        // ส่งข้อมูลไปยัง API
        // Example: axios.post('/api/users', values)
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };
  
  const formFields = [
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
      name: "employee_code",
      type: "text",
      // required: true,
      col: 6,
      disabled: true,
    },
    {
      label: "Contact Number",
      name: "contact_number",
      type: "tel",
      required: true,
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
      name: "position",
      type: "select",
      required: true,
      col: 6,
      options: position,
    },
    {
      label: "Department",
      name: "department",
      type: "select",
      required: false,
      col: 6,
      options: departments,
    },
    {
      label: "Territory",
      name: "territory",
      type: "select",
      required: false,
      col: 6,
      options: territory,
    },
    {
      label: "Area",
      name: "area",
      type: "select",
      required: false,
      col: 6,
      options: areas,
    },
    {
      label: "Role",
      name: "role",
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
      name: "status",
      type: "select",
      required: false,
      col: 6,
      options: position,
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
