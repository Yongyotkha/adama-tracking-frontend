import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Form,
  Input,
  Col,
  Row,
  Select,
  Modal,
} from "antd";

import MainLayout from "../../../layouts/MainLayout";
import ActionButton from "../../../components/button/ActionButton";
import FormCustom from "../../../components/form_custom/FormCustom";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { AuthContext } from "../../../contexts/AuthContext";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";

export default function ActionMaterial() {
  const { mode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showMsg, showNotification, userInfo } = useContext(AuthContext);
  const [formCustom] = Form.useForm();
  const [selectedCropIds, setSelectedCropIds] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const code = new URLSearchParams(location.search).get("documentNumber");
  const [loading, setLoading] = useState(false);
  const [productsSearch, setProductsSearch] = useState([]);
  const [crops, setCrops] = useState([]);
  const [products, setProducts] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [dataSource, setDataSource] = useState([]);

  const renderTitle = () => {
    switch (mode) {
      case "create": return "Create Material";
      case "edit": return "Edit Material";
      case "view": return "View Material";
      default: return "Material";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cropRes = await useServiceAPI.get(paths.pathMasterCrop, {});
        setCrops(cropRes.data.map(item => ({ id: item.id, name: item.crop_name || item.name })));

        if (["edit", "view"].includes(mode)) {
          const res = await useServiceAPI.get(paths.pathMaterialList, {
            platform: "web",
            page: 1,
            page_size: 1,
            code,
            user_id: userInfo.id,
          });

          const mat = res.data?.data?.find(item => item.code === code);
          if (!mat) return showMsg("error", "ไม่พบข้อมูลที่ต้องการแก้ไข");

          const cropIds = mat.crops?.split(",").map(Number) || [];
          const productIds = mat.products?.split(",").map(Number) || [];

          const productRes = await useServiceAPI.get(paths.pathMasterProductByCrop, {
            platform: "web",
            crop_list: cropIds,
          });
          setProducts(productRes.data.map(item => ({ id: item.id, name: item.product_name || item.name })));

          const formattedFiles = (mat.images || "").split(',').map((url, index) => ({
            uid: `${Date.now()}-${index}`,
            name: url.trim().split("/").pop(),
            status: "done",
            url: url.trim(),
          })).filter(f => f.url);

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
            photo: formattedFiles,
          });

          setFileList(formattedFiles);
        } else {
          formCustom.setFieldsValue({ crop: [], product: [] });
        }
      } catch (err) {
        showMsg("error", err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mode, code, userInfo.id]);

  const handleUploadSuccess = (response) => {
    const file = response?.data;
    if (!file?.file_url) return;

    setFileList(prev => [...prev, {
      uid: `${file.file_key}-${file.original_name}`,
      name: file.original_name,
      status: "done",
      url: file.file_url,
    }]);
  };

  const handleSubmit = async () => {
    try {
      const values = await formCustom.validateFields();
      const images = fileList.filter(f => f.status === "done" && f.url).map(f => f.url);

      const payload = {
        user_id: userInfo.id,
        code: values.material_code || "AUTO",
        name: values.name,
        crops: values.crop,
        products: values.product,
        description: values.description || "",
        type: values.type || "",
        size: values.size || "",
        qty: values.qty || "",
        unit_price: values.price || "",
        remark: values.remark || "",
        images: images.join(","),
        platform: "web",
      };

      setLoading(true);
      const res = await useServiceAPI.post(
        mode === "create" ? paths.pathMaterialCreate : paths.pathMaterialEdit,
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
      setProducts(res.data.map(item => ({ id: item.id, name: item.product_name })));
    } catch (err) {
      showMsg("error", err.message || "ไม่สามารถโหลด products ได้");
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
      value: fileList,
      multiple: true,
      accept: ".pdf,.png,.jpg,.jpeg"
    },
    {
      label: "Remark",
      name: "remark",
      type: "text",
      col: 24,
      disabled: mode === "view"
    },
  ];

  const footerOrderList = () => {
    const totalQuantity = productsSearch.reduce((total, item) => total + parseFloat(item.quantity), 0);
    const totalFOC = productsSearch.reduce((total, item) => total + parseFloat(item.foc), 0);
    const totalAmount = productsSearch.reduce((total, item) => total + parseFloat(item.net_amount || 0), 0);

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {productsSearch.length} &nbsp; QTY (ctn): {totalQuantity}+{totalFOC} &nbsp; Total:{" "}
          {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    );
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "FOC (ctn)", dataIndex: "foc", key: "foc" },
    {
      title: "Sub Total (THB)",
      dataIndex: "net_amount",
      key: "net_amount",
      render: text => parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
    },
    {
      title: <div className="text-center">Action</div>,
      key: "action",
      render: (_, record) => (
        <button className="delete-button flex justify-center mx-auto">
          <img
            src="/img/icons/delete.png"
            alt="delete"
            className="cursor-pointer w-6 h-6"
            onClick={() => {
              const updated = dataSource.filter(item => item.key !== record.key);
              const reset = updated.map((item, i) => ({ ...item, key: i + 1, no: i + 1 }));
              setDataSource(reset);
            }}
          />
        </button>
      ),
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">{renderTitle()}</div>

      <BoxPrimary>
        <Row gutter={16} align="middle">
          <Col md={6}>
            <Form.Item label="Material Expense Code" name="material_expnse_code">
              <Input placeholder="Generate" disabled />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item
              label="Crop"
              name="crop"
              rules={[{ required: true, message: "กรุณาเลือก Crop" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Crop"
                options={crops.map(crop => ({ label: crop.name, value: crop.id }))}
                onChange={(value) => setSelectedCropIds(value)}
                onBlur={() => {
                  console.log('onBlur - selectedCropIds:', selectedCropIds);
                  getProductsByCrops(selectedCropIds);
                }}
              />
            </Form.Item>
          </Col>
          <Col md={6}>
            <Form.Item
              label="Product"
              name="product"
              rules={[{ required: true, message: "กรุณาเลือก Product" }]}
            >
              <Select
                mode="multiple"
                placeholder="Select Product"
                options={products.map(p => ({ label: p.name, value: p.id }))}
                onChange={(value) => setSelectedProductIds(value)}
                onBlur={() => {
                  console.log('onBlur - selectedProductIds:', selectedProductIds);

                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </BoxPrimary>

      <BoxPrimary title="Product">
        <div className="mb-3 flex justify-end">
          <Select showSearch placeholder="Search Product" optionFilterProp="label" className="w-full" />
        </div>
      </BoxPrimary>

      <BoxPrimary title="Order List">
        <TableComponent
          header={header}
          dataSource={productsSearch}
          pageSize={10}
          footer={footerOrderList}
        />
      </BoxPrimary>

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
