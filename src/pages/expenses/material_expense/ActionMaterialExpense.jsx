import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Form,
  Input,
  Col,
  Row,
  Select,
  Modal,
  InputNumber
} from "antd";

import MainLayout from "../../../layouts/MainLayout";
import ActionButton from "../../../components/button/ActionButton";
import FormCustom from "../../../components/form_custom/FormMaterial";
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
  const [productSearchOptions, setProductSearchOptions] = useState([]);
  const [crops, setCrops] = useState([]);
  const [products, setProducts] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [dataSource, setDataSource] = useState([]);

  const [totalValueRequest, setTotalValueRequest] = useState(0);
  const [totalValueWareHoseSend, setToalValueWareHoseSend] = useState(0);
  const [totalValueReceive, setTotalValueReceive] = useState(0);

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
          const res = await useServiceAPI.get(paths.pathExpenseMaterialList, {
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

      console.log("values:", values);

      const images = fileList
        .filter(f => f.status === "done" && f.url)
        .map(f => f.url);

      // สร้าง payload หลัก
      const payload = {
        user_id: userInfo.id,
        code: values.material_code || "AUTO",
        name: values.name,
        crops: selectedCropIds,
        products: selectedProductIds,
        description: values.description || "",
        type: values.type || "",
        size: values.size || "",
        qty: values.qty || "",
        unit_price: values.price || "",
        remark: values.remark || "",
        images: images.join(","),
        platform: "web",
        totalValueRequest: totalValueRequest,
        totalValueWareHoseSend: totalValueWareHoseSend,
        totalValueReceive: totalValueReceive,
        material_list: dataSource.map(item => ({
          id: item.id,
          material_code: item.material_code,
          price: item.material_price,
          stock: item.material_stcok,
          request: item.material_request,
          value: item.material_value,
          warehouse_send: item.material_wherehouse_send,
          receive: item.material_receive,
        })),
      };

      console.log("Payload:", payload); // ตรวจสอบค่า

      //return false

      setLoading(true);
      const res = await useServiceAPI.post(
        mode === "create" ? paths.pathExpenseMaterialCreate : paths.pathExpenseMaterialEdit,
        payload
      );

      console.log('res : ', res)


      if (res.status === 200) {
        showNotification("success", "บันทึกข้อมูลสำเร็จ", "");
        navigate("/expenses/material");
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
      showMsg("error", err.message || "ไม่สามารถโหลด Crops ได้");
    } finally {
      setLoading(false);
    }
  };

  const getMaterialProduct = async (selectedProductsIds) => {
    if (!selectedProductsIds.length) return;
    setLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathMasterMaterialProduct, {
        platform: "web",
        products: selectedProductsIds,
      });

      // แสดงในตาราง
      setProductsSearch(res.data);

      // ใช้ใน select search
      setProductSearchOptions(
        res.data.map(item => ({
          value: item.id,
          label: item.code + ' : ' + item.name || item.product_name || `Material ${item.id}`
        }))
      );

    } catch (err) {
      showMsg("error", err.message || "ไม่สามารถโหลด Products ได้");
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


  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    {
      title: "Photo",
      dataIndex: "material_photo",
      key: "material_photo",
      render: (url) =>
        /\.(jpg|jpeg|png)$/i.test(url) ? (
          <img src={url} alt="material" style={{ width: 60, height: 60, objectFit: "cover" }} />
        ) : (
          "-"
        )
    },
    { title: "Code", dataIndex: "material_code", key: "material_code" },
    { title: "Name", dataIndex: "material_name", key: "material_name" },
    { title: "Price", dataIndex: "material_price", key: "material_price" },
    { title: "Stock", dataIndex: "material_stcok", key: "material_stcok" },
    {
      title: "Request",
      dataIndex: "material_request",
      key: "material_request",
      render: (_, record) => (
        <div className="quantity-control flex justify-center items-center">
          <img
            src="/img/icons/collapse.png"
            alt="decrease"
            className="cursor-pointer w-6 h-6"
            onClick={() =>
              handleQuantityChange(record.key, (record.material_request || 0) - 1)
            }
          />
          <Input
            inputMode="numeric"
            min={0}
            value={record.material_request || 0}
            onChange={(e) =>
              handleQuantityChange(record.key, parseInt(e.target.value) || 0)
            }
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20"
          />
          <img
            src="/img/icons/expand.png"
            alt="increase"
            className="cursor-pointer w-6 h-6"
            onClick={() =>
              handleQuantityChange(record.key, (record.material_request || 0) + 1)
            }
          />
        </div>
      ),
    },
    { title: "Value", dataIndex: "material_value", key: "material_value" },
    {
      title: "Warehouse Send", dataIndex: "material_wherehouse_send", key: "material_wherehouse_send",
      render: (_, record) => (
        <Input
          type="number"
          min={0}
          value={record.material_wherehouse_send}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            setDataSource(prev =>
              prev.map(item =>
                item.key === record.key
                  ? { ...item, material_wherehouse_send: val }
                  : item
              )
            );
          }}
        />
      )
    },
    {
      title: "Receive", dataIndex: "material_receive", key: "material_receive",
      render: (_, record) => (
        <Input
          type="number"
          min={0}
          value={record.material_receive}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            setDataSource(prev =>
              prev.map(item =>
                item.key === record.key
                  ? { ...item, material_receive: val }
                  : item
              )
            );
          }}
        />
      )
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

  const handleQuantityChange = (key, newValue) => {
    setDataSource(prev =>
      prev.map(item => {
        if (item.key === key) {
          const newRequest = Math.max(0, newValue);
          const newValueCalculated = newRequest * (item.material_price || 0);
          return {
            ...item,
            material_request: newRequest,
            material_value: newValueCalculated,
          };
        }
        return item;
      })
    );
  };


  useEffect(() => {
    let sumRequest = 0;
    let sumWarehouseSend = 0;
    let sumReceive = 0;

    dataSource.forEach(item => {
      const req = parseFloat(item.material_value || 0);
      const send = parseFloat(item.material_wherehouse_send || 0);
      const receive = parseFloat(item.material_receive || 0);

      sumRequest += req;
      sumWarehouseSend += send;
      sumReceive += receive;
    });

    setTotalValueRequest(sumRequest);
    setToalValueWareHoseSend(sumWarehouseSend);
    setTotalValueReceive(sumReceive);
  }, [dataSource]);

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
                  getMaterialProduct(selectedProductIds)
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </BoxPrimary>

      <BoxPrimary title="Material">
        <div className="mb-3 flex justify-end">
          <Select
            showSearch
            placeholder="Search Material"
            name="material_search"
            optionFilterProp="label"
            className="w-full"
            options={productSearchOptions}
            onChange={(selectedId) => {
              const selectedMaterial = productsSearch.find(item => item.id === selectedId);

              console.log('selectedMaterial : ', selectedMaterial)
              if (!selectedMaterial) {
                showMsg("error", "ไม่พบข้อมูล Material ที่เลือก");
                return;
              }

              // ป้องกันซ้ำ
              if (dataSource.some(item => item.id === selectedMaterial.id)) {
                showMsg("warning", "Material นี้ถูกเพิ่มในรายการแล้ว");
                return;
              }

              const newItem = {
                ...selectedMaterial,
                key: dataSource.length + 1,
                no: dataSource.length + 1,
                material_name: selectedMaterial.name,
                material_photo: (() => {
                  const imageList = (selectedMaterial.images || "").split(",").map(img => img.trim());
                  const imageFile = imageList.find(url => /\.(jpg|jpeg|png)$/i.test(url));
                  return imageFile || "-";
                })(),
                material_code: selectedMaterial.code || `M-${selectedMaterial.id}`,
                material_price: selectedMaterial.unit_price || 0,
                material_stcok: selectedMaterial.qty || 0,
                material_request: 1,
                material_value: (selectedMaterial.unit_price || 0) * 1, // คำนวณทันที
                material_wherehouse_send: 0,
                material_receive: 0,
              };

              setDataSource(prev => [...prev, newItem]);
            }}
          />
        </div>
      </BoxPrimary>

      <BoxPrimary title="Material List">
        <TableComponent
          header={header}
          dataSource={dataSource}
        />
      </BoxPrimary>


      <BoxPrimary className="flex flex-col items-end gap-2 text-right text-[14px]">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div>Total Value Request:</div>
          <InputNumber
            className="w-[200px]"
            min={0}
            disabled={true}
            value={totalValueRequest}
            formatter={(value) =>
              `${parseInt(value || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div>Total Value Warehouse Send:</div>
          <InputNumber
            className="w-[200px]"
            min={0}
            disabled={true}
            value={totalValueWareHoseSend}
            formatter={(value) =>
              `${parseInt(value || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div>Total Value Receive:</div>
          <InputNumber
            className="w-[200px]"
            min={0}
            disabled={true}
            value={totalValueReceive}
            formatter={(value) =>
              `${parseInt(value || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        </div>
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
