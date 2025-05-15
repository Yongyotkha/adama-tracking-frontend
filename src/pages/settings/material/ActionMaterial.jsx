import React, { useRef, useState, useEffect, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import FormCustom from "../../../components/form_custom/FormCustom";
import FileUploadComponent from "../../../components/file_upload/FileUploadComponent";
import { AuthContext } from "../../../contexts/AuthContext";
import { Form } from "antd";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";

export default function ActionMaterial() {
  const { mode } = useParams();
  const location = useLocation();

  const code = new URLSearchParams(location.search).get("documentNumber");

  const [loading, setLoading] = useState(false);
  const [crops, setCrops] = useState([]);
  const [products, setProducts] = useState([]);
  const [fileUrl, setFileUrl] = useState("");
  const fileList = fileUrl
    ? [{
      uid: '-1',
      name: 'uploaded_image.jpg',
      status: 'done',
      url: fileUrl,
    }]
    : [];
  const [formCustom] = Form.useForm();
  const { showMsg, showNotification, userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const renderTitle = () => {
    switch (mode) {
      case "create": return "Create Material";
      case "edit": return "Edit Material";
      case "view": return "View Material";
      default: return "Material";
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // โหลด crop ทั้งหมด
        const cropRes = await useServiceAPI.get(paths.pathMasterCrop, {});
        const cropList = cropRes.data.map((item) => ({
          id: item.id,
          name: item.crop_name || item.name, // ป้องกัน key ที่ต่างกัน
        }));
        setCrops(cropList);

        if (mode === "edit" || mode === "view") {
          const res = await useServiceAPI.get(paths.pathMaterialList, {
            platform: "web",
            page: 1,
            page_size: 1,
            code: code,
            user_id: userInfo.id,
          });

          if (res.status === 200) {
            const mat = res.data?.data?.find((item) => item.code === code);

            if (mat) {
              const cropIds = mat.crops?.split(',').map(id => Number(id)) || [];
              const productIds = mat.products?.split(',').map(id => Number(id)) || [];

              // โหลด product ตาม cropIds
              const productRes = await useServiceAPI.get(paths.pathMasterProductByCrop, {
                platform: "web",
                crop_list: cropIds,
              });

              const productList = productRes.data.map((item) => ({
                id: item.id,
                name: item.product_name || item.name,
              }));
              setProducts(productList);

              // set ค่าใน form เมื่อ options ทั้งคู่พร้อมแล้ว
              formCustom.setFieldsValue({
                material_code: mat.code,
                name: mat.name,
                crop: cropIds,
                product: productIds,
                description: mat.description,
                type: mat.type,
                size: mat.size,
                qty: mat.qty,
                price: mat.unit_price,
                remark: mat.remark,
                photo: mat.images,
              });

              setFileUrl(mat.images || "");
            } else {
              showMsg("error", "ไม่พบข้อมูลที่ต้องการแก้ไข");
            }
          }
        } else {
          // กรณี create
          formCustom.setFieldsValue({ crop: [], product: [] });
        }
      } catch (err) {
        showMsg("error", err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [mode, code, userInfo.id]);


  const handleUploadSuccess = (response) => {

    const uploadedUrl = response?.data?.file_url;

    if (uploadedUrl) {
      setFileUrl(uploadedUrl);
    }
  };

  const getProductsByCrops = async (selectedCropIds) => {
    if (!selectedCropIds.length) return;
    setLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathMasterProductByCrop, {
        platform: "web",
        crop_list: selectedCropIds
      });
      setProducts(res.data.map((item) => ({ id: item.id, name: item.product_name })));
    } catch (err) {
      showMsg("error", err.message || "ไม่สามารถโหลด products ได้");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await formCustom.validateFields();


      const payload = {
        user_id: userInfo.id,
        code: values.material_code || "AUTO",
        name: values.name,
        crops: values.crop || [],
        products: values.product || [],
        description: values.description || "",
        type: values.type || "",
        size: values.size || "",
        qty: values.qty || "",
        unit_price: values.price || "",
        remark: values.remark || "",
        images: fileUrl,
        platform: "web",
      };

      // console.log('payload : ', payload)
      // return false;

      setLoading(true);
      if (mode == 'create') {
        const res = await useServiceAPI.post(paths.pathMaterialCreate, payload);
        if (res.status === 200) {
          showNotification("success", "บันทึกข้อมูลสำเร็จ", "");
          navigate("/setting/material");
        } else {
          showMsg("error", res.data.message || "ไม่สามารถบันทึกข้อมูลได้");
        }
      } else if (mode == 'edit') {
        const res = await useServiceAPI.post(paths.pathMaterialEdit, payload);
        if (res.status === 200) {
          showNotification("success", "บันทึกข้อมูลสำเร็จ", "");
          //navigate("/setting/material");
        } else {
          showMsg("error", res.data.message || "ไม่สามารถบันทึกข้อมูลได้");
        }
      }

    } catch (err) {
      showMsg("error", err.message || "กรุณากรอกข้อมูลให้ครบถ้วน");
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { label: "Photo", name: "photo", type: "photo", required: true, col: 24, value: fileList },
    { label: "Material Code", name: "material_code", type: "text", value: "Generate", col: 6, disabled: true },
    { label: "Material Name", name: "name", type: "text", required: true, col: 6, disabled: mode === "view" },
    { label: "Crop", name: "crop", type: "select", mode: "multiple", options: crops, required: true, col: 6 },
    { label: "Product", name: "product", type: "select", mode: "multiple", options: products, required: true, col: 6 },
    { label: "Description", name: "description", type: "text-editor", required: false, col: 24, disabled: mode === "view" },
    { label: "Type", name: "type", type: "text", col: 6, disabled: mode === "view", placeholder: "PPB" },
    { label: "Size", name: "size", type: "text", col: 6, disabled: mode === "view", placeholder: "80x60" },
    { label: "QTY", name: "qty", type: "text", required: true, col: 6, disabled: mode === "view", placeholder: "10" },
    { label: "Unit Price", name: "price", type: "text", required: true, col: 6, disabled: mode === "view", placeholder: "100" },
    { label: "Remark", name: "remark", type: "text", col: 24, disabled: mode === "view" },
  ];


  const handleChange = (fieldName, value) => {
    if (fieldName === "crop") {
      getProductsByCrops(value);
      formCustom.setFieldsValue({ product: [] });
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">{renderTitle()}</div>
      <FormCustom
        fields={formFields}
        form={formCustom}
        onChange={handleChange}
        onUploadFinish={handleUploadSuccess}
      />
      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/setting/material")} />
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
