import React, { useRef, useState, useEffect, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate, useParams } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import FormCustom from "../../../components/form_custom/FormCustom";
import FileUploadComponent from "../../../components/file_upload/FileUploadComponent";
import { AuthContext } from "../../../contexts/AuthContext";
import { Form, Input, InputNumber, Select } from "antd";
const { Option } = Select;
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";
export default function ActionMaterial() {
  const renderTitle = () => {
    console.log('mode : ', mode)
    switch (mode) {
      case "create":
        return "Create Material";
      case "edit":
        return "Edit Material";
      case "view":
        return "View Material";
      default:
        return "Material";
    }
  };

  const { mode } = useParams(); // Get the mode (create, edit, view) from the URL
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fileUploadRef = useRef(null);
  const { showMsg, showNotification, userInfo } = useContext(AuthContext);
  const [crops, setCrops] = useState([]);
  const [products, setProducts] = useState([]);
  const [formCustom] = Form.useForm();
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    if (mode === "create") {
      formCustom.setFieldsValue({
        crop: [],
        product: [],
      });
    }
  }, [mode]);

  const handleUploadSuccess = (response) => {
    console.log("Upload finished:", response);
    const uploadedUrl = response?.data?.file_url;

    if (uploadedUrl) {
      setFileUrl(uploadedUrl); // ✅ เก็บใน state
      formCustom.setFieldsValue({ images: uploadedUrl }); // อัปเดตฟอร์มถ้าต้องการ
    }
  };

  useEffect(() => {
    console.log('useEffect')
    const getCrops = async () => {
      console.log('getCrops')
      setLoading(true);
      try {
        console.log('getCrops try : ', paths.pathMasterCrop)
        const [crops] = await Promise.all([
          useServiceAPI.get(paths.pathMasterCrop, {}),
        ]);
        console.log('crops : ', crops)
        console.log('getCrops end')
        setCrops(crops.data);

      } catch (error) {
        console.log('error: ', error)
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getCrops();
  }, []);

  const getProductsByCrops = async (selectedCropIds) => {
    if (!selectedCropIds || selectedCropIds.length === 0) return;
    console.log('selectedCropIds : ', selectedCropIds)
    setLoading(true);
    try {
      // สมมุติว่าใช้ path นี้: /api/products?crop_ids=[1,2]
      const response = await useServiceAPI.get(paths.pathMasterProductByCrop, {
        "platform": "web",
        "crop_list": selectedCropIds
      });

      let set_product = response.data.map((element, key) => ({
        name: element.product_name,
        id: element.id,
      }));


      setProducts(set_product);
    } catch (error) {
      showMsg("error", error.message || "ไม่สามารถโหลด products ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await formCustom.validateFields();
      console.log('values : ', values)
      const formattedData = {
        user_id: userInfo.id,
        material_code: values.material_code || "AUTO", // ใช้ Generate หรือส่ง "" แล้วให้หลังบ้านจัดการ
        name: values.material_name,
        crops: values.crop || "",
        products: values.product || "",
        description: values.description || "",
        type: values.type || "",
        size: values.size || "",
        qty: values.qty || "",
        unit_price: values.price || "",
        remark: values.remark || "",
        images: fileUrl || "",
        platform: "web",
      };

      console.log('formattedData : ', formattedData)

      setLoading(true);

      const response = await useServiceAPI.post(paths.pathMaterialCreate, formattedData);

      if (response.status === 200) {
        showNotification("success", "บันทึกข้อมูลสำเร็จ", "");
        navigate("/setting/material");
      } else {
        showMsg("error", response.data.message || "ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (error) {
      console.error("Validation or submission error:", error);
      showMsg("error", error.message || "กรุณากรอกข้อมูลให้ครบถ้วน");
    } finally {
      setLoading(false);
    }
  };


  const formFields = [
    {
      label: "Photo",
      name: "photo",
      type: "photo",
      required: true,
      col: 24,
    },
    {
      label: "Material Code",
      name: "material_code",
      type: "text",
      value: "Generate",
      col: 6,
      disabled: true,
    },
    {
      label: "Material Name",
      name: "material_name",
      type: "text",
      placeholder: "Material Name",
      required: true,
      col: 6,
      disabled: mode === "view",
    },
    {
      label: "Crop",
      name: "crop",
      type: "select",
      mode: "multiple",
      options: crops,
      required: true,
      col: 6,
    },
    {
      label: "Product",
      name: "product",
      type: "select",
      mode: "multiple",
      options: products,
      required: true,
      col: 6,
    },
    {
      label: "Description",
      name: "description",
      type: "text-editor",
      placeholder: "Add description",
      required: false,
      col: 24,
      disabled: mode === "view",
    },
    {
      label: "Type",
      name: "type",
      type: "text",
      placeholder: "PPB",
      col: 6,
      disabled: mode === "view",
    },
    {
      label: "Size",
      name: "size",
      type: "text",
      placeholder: "80x60",
      col: 6,
      disabled: mode === "view",
    },
    {
      label: "QTY",
      name: "qty",
      type: "text",
      placeholder: "10",
      col: 6,
      required: true,
      disabled: mode === "view",
    },
    {
      label: "Unit Price",
      name: "price",
      type: "text",
      placeholder: "Unit Price",
      col: 6,
      required: true,
      disabled: mode === "view",
    },
    {
      label: "Remark",
      name: "remark",
      type: "text",
      placeholder: "Remark",
      col: 24,
      disabled: mode === "view",
    },
  ];


  const handleChange = (fieldName, value) => {
    if (fieldName === "crop") {
      getProductsByCrops(value);
      formCustom.setFieldsValue({ product: [] }); // reset ค่า product
    }
  };


  return (
    <MainLayout loading={loading}>
      <div className="title-page">{renderTitle()}</div>

      <FormCustom
        fields={formFields}
        form={formCustom}
        onChange={handleChange}
        onUploadFinish={handleUploadSuccess} // ✅ เพิ่มตรงนี้
      />

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/setting/material")}
        />
        {mode !== "view" && (
          <ActionButton
            mode="update"
            text={mode === "create" ? "Create" : "Save"}
            onClick={handleSubmit}
          />
        )}
      </div>
    </MainLayout>
  );
}
