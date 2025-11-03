import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import { paths } from "../../../services/CorsPath";
import { Form } from "antd";
import { AuthContext } from "../../../contexts/AuthContext";
import FormCustom from "../../../components/form_custom/FormCustom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

import useServiceAPI from "../../../services/CorsService";

export default function EditMileage() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { showNotification } = useContext(AuthContext);
  const { userInfo } = useContext(AuthContext);
  const mode = location.state?.mode || "edit";

  const [formFields, setFormFields] = useState([]);

  const fetchMileageDetails = async (userId, date) => {
    setLoading(true);
    try {
      const requestData = {
        user_id: userId,
        date: date,
      };

      const response = await useServiceAPI.get(paths.pathMileageView, requestData);

      if (response.status === 200) {
        const { data } = response;

        const initialValues = {
          date: data.date ? dayjs(data.date, "YYYY-MM-DD") : null, // ✅ ต้องเป็น dayjs
          name: userInfo.name || "",
          mileage: data.mileage ?? "",
        };

        setFormFields([
          // ❗ แนะนำ “ไม่ต้อง” ใช้ value ใน field สำหรับ DatePicker
          { label: "Date", name: "date", type: "date", required: true, col: 6, disabled: true },
          { label: "Name", name: "name", type: "text", required: true, col: 6, disabled: true },
          { label: "Mileage", name: "mileage", type: "text", required: true, col: 6, disabled: false },
        ]);

        form.setFieldsValue(initialValues);
      }


    } catch (error) {
      console.error("Error fetch mileage detail", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { user_id, date } = location.state || {};
    if (user_id && date) {
      fetchMileageDetails(user_id, date);
    }
  }, []);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const dataToSend = {
          user_id: userInfo.id,
          date: dayjs(values.date).format("YYYY-MM-DD"),
          mileage: values.mileage,
        };

        useServiceAPI
          .put(paths.pathMileageUpdate, dataToSend, setLoading)
          .then((response) => {
            // console.log("Response after update:", response);
            if (response.status === 200) {
              navigate("/setting/mileage");
              showNotification("success", response.message, response.message_line);
            } else if (response.status === 201) {
              //navigate("/setting/mileage");
              // console.log("Response for status 201:", response);

              showNotification("error", response.message, response.message_line);
            }
          })
          .catch((error) => {
            console.error(error);
            showNotification("error", error.message);
          });
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Mileage</div>

      <FormCustom fields={formFields} form={form} />

      <div className="flex justify-end space-x-4 mt-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/setting/mileage")} />
        <ActionButton text="Update" mode="update" onClick={handleSave} />
      </div>
    </MainLayout>
  );
}
