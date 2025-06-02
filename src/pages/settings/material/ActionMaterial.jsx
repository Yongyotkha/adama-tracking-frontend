import React, { useEffect, useState, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import FormCustom from "../../../components/form_custom/FormMaterial";
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
  const [fileList, setFileList] = useState([]);

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
        const cropRes = await useServiceAPI.get(paths.pathMasterCrop, {});

        setCrops(cropRes.data.map(item => ({
          value: item.id,
          label: item.name,
        })));

        if (mode === "edit" || mode === "view") {
          const res = await useServiceAPI.get(paths.pathMaterialOne, {
            platform: "web",
            page: 1,
            page_size: 1,
            code,
            user_id: userInfo.id,
          });

          if (res.data) {
            const mat = res.data;
            const cropIds = mat.crops.map(Number);
            const productIds = mat.products.map(Number);

            // ดึง Product ทั้งหมดก่อน
            const productRes = await useServiceAPI.get(paths.pathMasterProductByCrop, {
              platform: "web",
              crop_list: cropIds,
            });

            const mappedProducts = productRes.data.map(item => ({
              value: item.id,
              label: item.product_name,
            }));

            setProducts(mappedProducts);

            // 🧠 สร้าง options พร้อม label
            const enrichedProductIds = productIds.map(id => {
              const match = mappedProducts.find(p => p.value === id);
              return match?.value ?? id;
            });

            const formattedFiles = (mat.images || "").split(',').map((url, index) => ({
              uid: `${Date.now()}-${index}`,
              name: url.trim().split("/").pop(),
              status: "done",
              url: url.trim(),
            })).filter(f => f.url);

            console.log('enrichedProductIds : ', enrichedProductIds)

            const setval = {
              material_code: mat.code,
              name: mat.name,
              crop: cropIds,
              product: enrichedProductIds,
              description: mat.description,
              type: mat.type,
              size: mat.size,
              qty: mat.qty,
              price: mat.unit_price,
              remark: mat.remark,
              photo: formattedFiles,
            }
            formCustom.setFieldsValue(setval);

            setFileList(formattedFiles);
          } else {
            showMsg("error", "ไม่พบข้อมูลที่ต้องการแก้ไข");
          }
        } else {
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
    const file = response?.data;
    if (!file?.file_url) return;

    const newFile = {
      uid: `${file.file_key}-${file.original_name}`,
      name: file.original_name,
      status: "done",
      url: file.file_url,
    };
    setFileList(prev => [...prev, newFile]);
  };

  const handleSubmit = async () => {
    try {
      const values = await formCustom.validateFields();
      const uploadedFiles = fileList.filter(f => f.status === "done" && f.url).map(f => f.url);

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
        images: uploadedFiles.join(","),
        platform: "web",
      };

      setLoading(true);
      const res = await useServiceAPI.post(
        mode === 'create' ? paths.pathMaterialCreate : paths.pathMaterialEdit,
        payload
      );

      if (res.status === 200) {
        showNotification("success", "บันทึกข้อมูลสำเร็จ", "");
        navigate("/setting/material");
      } else {
        showMsg("error", res.data.message || "ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (err) {
      showMsg("error", err.message || "กรุณากรอกข้อมูลให้ครบถ้วน");
    } finally {
      setLoading(false);
    }
  };

  const getProductsByCrops = async (selectedCropIds) => {
    if (!selectedCropIds.length) return;
    setLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathMasterProductByCrop, {
        platform: "web",
        crop_list: selectedCropIds,
      });
      setProducts(res.data.map(item => ({
        value: item.id,
        label: item.product_name,
      })));
    } catch (err) {
      showMsg("error", err.message || "ไม่สามารถโหลด products ได้");
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { label: "Photo", name: "photo", type: "photo", required: true, col: 24, value: fileList, multiple: true, accept: ".pdf,.png,.jpg,.jpeg" },
    { label: "Material Code", name: "material_code", type: "text", value: "Generate", col: 6, disabled: true },
    { label: "Material Name", name: "name", type: "text", required: true, col: 6, disabled: mode === "view" },
    {
      label: "Crop", name: "crop", type: "select", mode: "multiple", options: crops, required: true, col: 6,
      onBlur: (fieldName, value) => fieldName === "crop" && getProductsByCrops(value),
    },
    { label: "Product", name: "product", type: "select", mode: "multiple", options: products, required: true, col: 24 },
    { label: "Description", name: "description", type: "text-editor", col: 24, disabled: mode === "view" },
    { label: "Type", name: "type", type: "text", col: 6, disabled: mode === "view" },
    { label: "Size", name: "size", type: "text", col: 6, disabled: mode === "view" },
    { label: "QTY", name: "qty", type: "text", required: true, col: 6, disabled: mode === "view" },
    { label: "Unit Price", name: "price", type: "text", required: true, col: 6, disabled: mode === "view" },
    { label: "Remark", name: "remark", type: "text", col: 24, disabled: mode === "view" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">{renderTitle()}</div>
      <FormCustom
        fields={formFields}
        form={formCustom}
        onChange={(field, value) => field === "crop" && getProductsByCrops(value)}
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
