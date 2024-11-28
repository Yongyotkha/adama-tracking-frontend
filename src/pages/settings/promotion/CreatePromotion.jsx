import React, { useContext,useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { Form } from "antd";
import { AuthContext } from "../../../contexts/AuthContext";

export default function CreatePromotion() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { showMsg } = useContext(AuthContext);

  useEffect(() => { }, []);

  const formFields = [
    { label: "Name", 
      name: "name", 
      type: "text", 
      required: true, 
      col: 12, 
    },
    { label: "Description ", 
      name: "description", 
      type: "text", 
      required: false, 
      col: 12, 
    },
    { label: "Value (THB)", 
      name: "value", 
      type: "text", 
      required: false, 
      col: 6, 
    },
    { label: "Status", 
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

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form Values:", values.description); // ตรวจสอบค่าที่ได้จากฟอร์มใน console
        useServiceAPI
          .post(paths.pathPromotioncreate, values, setLoading)
          .then((response) => {
            if (response.status === 201) {
              console.log(response.data.message);
              showMsg("success", response.data.message).then(() => {
                navigate("/setting/promotion");
              });
            }
          })
          .catch((error) => {
            console.log(error);
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
      <div className="title-page">Create Promotion</div>

      <FormUser fields={formFields} form={form}/>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/setting/promotion")} />
        {/* <ActionButton mode="save" text="Save" onClick={() => navigate("/setting/promotion")} /> */}
        <ActionButton text="Save" mode="save" onClick={handleSave} />

      </div>

    </MainLayout>
  );
}
