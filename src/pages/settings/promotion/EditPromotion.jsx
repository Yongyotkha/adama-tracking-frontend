import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import { useLocation, useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/corsService";
import { Form } from "antd";
import { AuthContext } from "../../../contexts/AuthContext";

export default function EditPromotion() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [position, setPosition] = useState([]);
  const { showMsg, showNotification } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchPromotionDetails(location.state.id);
        const [positions] = await Promise.all([
          // useServiceAPI.get(paths.pathMasterStatus, {}),
          useServiceAPI.get(`${paths.pathMasterStatus}?status_type=status`),
        ]);
        
        setPosition(positions.data);        
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      }
    };
  
    fetchData();
  }, []);
  

  

  const [formFields, setFormFields] = useState([]);

  // const formFields = [
  //   { label: "Name", name: "name", type: "text", required: false, col: 12,  value: "303710131300" },
  //   { label: "Description ", name: "description", type: "text", required: false, col: 12,  value: "Cooler Box M11 - กระติกน้ำ คละสี" },
  //   { label: "Value (THB)", name: "value_thb", type: "text", required: false, col: 6, options: ["Special", "Commodity", "3rd Party", "SAS"], value: "Special" },
  //   { label: "Status", name: "status", type: "select", required: false, col: 6, options: ["Active", "Inactive"], value: "Active" },
  // ];


  const fetchPromotionDetails = async (id) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(`${paths.pathPromotiondetail}/${id}`);
      if (response.status === 200) {
        const { data } = response;
  
        const updatedFields = [
          { 
            label: "Name", 
            name: "name", 
            type: "text", 
            required: true, 
            col: 12, 
            value: data.name || "" },
          { 
            label: "Description", 
            name: "description", 
            type: "text", 
            required: true, 
            col: 12, 
            value: data.description || "" },
            { 
              label: "Unit", 
              name: "unit", 
              type: "text", 
              required: true, 
              col: 4, 
            },
          { 
            label: "Value (THB)", 
            name: "value", 
            type: "text", 
            required: true, 
            col: 4, 
            value: data.value ===  ".00" ? "0.00" : data.value 
          },
          { 
            label: "Status", 
            name: "use_flag", 
            type: "select", 
            required: false, 
            col: 4, 
            options: [
              { name: "Active", id: 1, selected: true },
              { name: "Inactive", id: 0, selected: false },
            ],
            value: parseInt(data.use_flag, 10) === 1 ? "Active" : "Inactive",

          },
          { 
            label: "Remark", 
            name: "remark", 
            type: "text", 
            required: false, 
            col: 12, 
            value: 
            data.remark || "" 
          },
        ];
  
        setFormFields(updatedFields);
        const initialValues = updatedFields.reduce((acc, field) => {
          acc[field.name] = field.value;
          return acc;
        }, {});
        form.setFieldsValue(initialValues);
      } else {
        console.error("Failed to fetch promotion details:", response.message);
      }
    } catch (error) {
      console.error("Error fetching promotion details:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const useFlagValue = values.use_flag === "Active" ? 1 : 0;

        const dataToSend = {
          ...values,
          id: location.state.id, 
          use_flag: useFlagValue, // ส่งค่า use_flag เป็น 1 หรือ 0

        };
  
        useServiceAPI
          .put(paths.pathPromotionupdate, dataToSend, setLoading)
          .then((response) => {
            if (response.status === 200) {
              console.log(response.data.message);
              // showMsg("success", response.data.message).then(() => {
              //   navigate("/setting/promotion"); 
              // });
              navigate("/setting/promotion");
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              );

            }
          })
          .catch((error) => {
            console.error(error);
            if (error.status === 422) {
              // showMsg("error", error.message);
              showNotification("error", response.message, response.message_line);

            } else {
              // showMsg("error", "เกิดข้อผิดพลาด");
              showNotification("error", response.message, response.message_line);

            }
          });
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };
  


  return (

    <MainLayout loading={loading}>
      <div className="title-page">Edit Promotion</div>
      <FormUser profile="/img/profile.jpg" fields={formFields} form={form} />
      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/setting/promotion")} />
        {/* <ActionButton mode="update" text="Update" onClick={() => navigate("/setting/promotion")} /> */}
        <ActionButton text="update" mode="update" onClick={handleSave} />
      </div>

    </MainLayout>
  );
}
