import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Form, Input, Col, Row, Select, InputNumber } from "antd";

import MainLayout from "../../../layouts/MainLayout";
import ActionButton from "../../../components/button/ActionButton";
import FormCustom from "../../../components/form_custom/FormMaterial";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableAction from "../../../components/table/TableAction";
import { AuthContext } from "../../../contexts/AuthContext";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";

export default function ActionMaterialExpense() {
  const { mode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showMsg, showNotification, userInfo } = useContext(AuthContext);

  const [formCustom] = Form.useForm();

  const code = location.state?.documentNumber || "";

  const [loading, setLoading] = useState(false);

  const [selectedCropIds, setSelectedCropIds] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);

  const [crops, setCrops] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsSearch, setProductsSearch] = useState([]);
  const [productSearchOptions, setProductSearchOptions] = useState([]);

  const [fileList, setFileList] = useState([]);
  const [dataSource, setDataSource] = useState([]);

  const [totalValueRequest, setTotalValueRequest] = useState(0);
  const [totalValueWarehouseSend, setTotalValueWarehouseSend] = useState(0);
  const [totalValueReceive, setTotalValueReceive] = useState(0);

  const [permission, setPermission] = useState({
    btn_create: false,
    btn_edit: false,
    btn_daft: false,
    btn_save: false,
    btn_pdf: false,
  });

  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";
  const isTransactionMode = mode === "transaction";
  const isReadOnly = isViewMode || isTransactionMode;

  const canSave = isCreateMode
    ? true
    : (permission?.btn_save ?? permission?.btn_edit ?? false);

  const canSaveDraft = isCreateMode ? true : (permission?.btn_daft ?? false);
  const canExportPdf = permission?.btn_pdf ?? !isCreateMode;

  const hasCropSelected = selectedCropIds.length > 0;
  const hasProductSelected = selectedProductIds.length > 0;

  const renderTitle = () => {
    switch (mode) {
      case "create":
        return "Create Material";
      case "edit":
        return "Edit Material";
      case "view":
        return "View Material";
      case "transaction":
        return "Transaction Material";
      default:
        return "Material";
    }
  };

  const normalizeNumber = (value, defaultValue = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  };

  const resetMaterialState = useCallback(({ clearTable = true } = {}) => {
    setProductsSearch([]);
    setProductSearchOptions([]);
    setSelectedMaterialId(null);

    if (clearTable) {
      setDataSource([]);
    }
  }, []);

  const resetProductAndMaterialState = useCallback(
    ({ clearTable = true } = {}) => {
      setProducts([]);
      setSelectedProductIds([]);
      formCustom.setFieldsValue({ product: [] });
      resetMaterialState({ clearTable });
    },
    [formCustom, resetMaterialState]
  );

  const loadProductsByCrop = useCallback(
    async (cropIds) => {
      if (!Array.isArray(cropIds) || !cropIds.length) {
        setProducts([]);
        return [];
      }

      setLoading(true);
      try {
        const productRes = await useServiceAPI.get(paths.pathMasterProductByCrop, {
          crop_list: cropIds,
        });

        const loadedOptions = (productRes.data || []).map((item) => ({
          value: item.id,
          label: `${(
            item.product_name ||
            item.name ||
            `Product ${item.id}`
          ).trim()} (${item.packing_list || "-"})`,
        }));

        setProducts(loadedOptions);
        return loadedOptions;
      } catch (err) {
        setProducts([]);
        showMsg("error", err.message || "ไม่สามารถโหลด products ได้");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [showMsg]
  );

  const loadMaterialsByProduct = useCallback(
    async (productIds, cropIds) => {
      const safeProductIds = Array.isArray(productIds) ? productIds : [];
      const safeCropIds = Array.isArray(cropIds) ? cropIds : [];

      if (!safeCropIds.length || !safeProductIds.length) {
        resetMaterialState({ clearTable: true });
        return [];
      }

      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathMasterMaterialProduct, {
          products: safeProductIds,
          crop_list: safeCropIds,
        });

        const materialData = Array.isArray(res.data) ? res.data : [];

        setProductsSearch(materialData);
        setProductSearchOptions(
          materialData.map((item) => ({
            value: item.id,
            label: `${item.code || "-"} : ${item.name || item.product_name || `Material ${item.id}`}`,
          }))
        );

        const validMaterialIds = materialData.map((item) => item.id);

        setDataSource((prev) =>
          prev
            .filter((item) => validMaterialIds.includes(item.id))
            .map((item, index) => ({
              ...item,
              key: index + 1,
              no: index + 1,
            }))
        );

        setSelectedMaterialId((prev) =>
          prev && validMaterialIds.includes(prev) ? prev : null
        );

        return materialData;
      } catch (err) {
        showMsg("error", err.message || "ไม่สามารถโหลด Material ได้");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [resetMaterialState, showMsg]
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const cropRes = await useServiceAPI.get(paths.pathMasterCrop, {});

        setCrops(
          (cropRes.data || []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        if (!["edit", "view", "transaction"].includes(mode)) {
          formCustom.setFieldsValue({ crop: [], product: [] });
          return;
        }

        if (!code) {
          showMsg("error", "ไม่พบ documentNumber");
          navigate("/expenses/material");
          return;
        }

        const res = await useServiceAPI.get(paths.pathExpenseMaterialOne, {
          code,
          user_id: userInfo.id,
        });

        if (!res.data) {
          showMsg("error", "ไม่พบข้อมูลที่ต้องการแก้ไข");
          return;
        }

        const mat = res.data;

        setPermission((prev) => ({
          ...prev,
          ...(mat.permission || {}),
        }));

        const cropIds = Array.isArray(mat.crops) ? mat.crops.map(Number) : [];
        const productIds = Array.isArray(mat.products) ? mat.products.map(Number) : [];

        setSelectedCropIds(cropIds);
        setSelectedProductIds(productIds);

        const loadedProductOptions = await loadProductsByCrop(cropIds);
        const validProductIds = productIds.filter((id) =>
          loadedProductOptions.some((opt) => opt.value === id)
        );

        const materialData = await loadMaterialsByProduct(validProductIds, cropIds);

        const validMaterialIds = materialData.map((item) => item.id);

        if (Array.isArray(mat.material_list)) {
          const mappedMaterialList = mat.material_list
            .map((item, index) => {
              const imageList = String(item.images || "")
                .split(",")
                .map((img) => img.trim())
                .filter(Boolean);

              const imageFile = imageList.find((url) =>
                /\.(jpg|jpeg|png)$/i.test(url)
              );

              const qty = normalizeNumber(item.qty);
              const price = normalizeNumber(item.unit_price);
              const request = normalizeNumber(item.request, 1);
              const warehouseSend = normalizeNumber(item.send);
              const receive = normalizeNumber(item.receive);

              return {
                id: item.id,
                key: index + 1,
                no: index + 1,
                material_name: item.name,
                material_photo: imageFile || "-",
                material_code: item.code || `M-${item.id}`,
                material_price: price,
                material_size: item.size || "-",
                material_stock: qty,
                material_request: request,
                material_value: price * request,
                material_warehouse_send: warehouseSend,
                material_receive: receive,
              };
            })
            .filter((item) => validMaterialIds.includes(item.id))
            .map((item, index) => ({
              ...item,
              key: index + 1,
              no: index + 1,
            }));

          setDataSource(mappedMaterialList);
        }

        const formattedFiles = String(mat.images || "")
          .split(",")
          .map((url, index) => ({
            uid: `${Date.now()}-${index}`,
            name: url.trim().split("/").pop(),
            status: "done",
            url: url.trim(),
          }))
          .filter((f) => f.url);

        formCustom.setFieldsValue({
          expense_material_code: mat.code,
          name: mat.name,
          crop: cropIds,
          product: validProductIds,
          description: mat.description,
          type: mat.type,
          size: mat.size,
          qty: mat.qty,
          price: mat.unit_price,
          remark: mat.remark,
          photo: formattedFiles,
        });

        setFileList(formattedFiles);
      } catch (err) {
        showMsg("error", err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [
    code,
    formCustom,
    loadMaterialsByProduct,
    loadProductsByCrop,
    mode,
    navigate,
    showMsg,
    userInfo.id,
  ]);

  useEffect(() => {
    let sumRequest = 0;
    let sumWarehouseSend = 0;
    let sumReceive = 0;

    dataSource.forEach((item) => {
      const unitPrice = normalizeNumber(item.material_price);
      const requestQty = normalizeNumber(item.material_request);
      const warehouseSendQty = normalizeNumber(item.material_warehouse_send);
      const receiveQty = normalizeNumber(item.material_receive);

      sumRequest += requestQty * unitPrice;
      sumWarehouseSend += warehouseSendQty * unitPrice;
      sumReceive += receiveQty * unitPrice;
    });

    setTotalValueRequest(sumRequest);
    setTotalValueWarehouseSend(sumWarehouseSend);
    setTotalValueReceive(sumReceive);
  }, [dataSource]);

  const handleUploadSuccess = (response) => {
    const file = response?.data;
    if (!file?.file_url) return;

    setFileList((prev) => [
      ...prev,
      {
        uid: `${file.file_key}-${file.original_name}`,
        name: file.original_name,
        status: "done",
        url: file.file_url,
      },
    ]);
  };

  const handleCropChange = async (value) => {
    const nextCropIds = Array.isArray(value) ? value : [];
    const currentSelectedProducts = formCustom.getFieldValue("product") || [];

    setSelectedCropIds(nextCropIds);

    if (!nextCropIds.length) {
      resetProductAndMaterialState({ clearTable: true });
      return;
    }

    const nextProductOptions = await loadProductsByCrop(nextCropIds);

    const validProducts = currentSelectedProducts.filter((id) =>
      nextProductOptions.some((opt) => opt.value === id)
    );

    formCustom.setFieldsValue({ product: validProducts });
    setSelectedProductIds(validProducts);

    await loadMaterialsByProduct(validProducts, nextCropIds);
  };

  const handleProductChange = async (value) => {
    const nextProductIds = Array.isArray(value) ? value : [];
    const currentCropIds = formCustom.getFieldValue("crop") || [];

    setSelectedProductIds(nextProductIds);
    await loadMaterialsByProduct(nextProductIds, currentCropIds);
  };

  const handleQuantityChange = (key, newValue) => {
    setDataSource((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        const requestQty = Math.max(0, normalizeNumber(newValue));
        return {
          ...item,
          material_request: requestQty,
          material_value: requestQty * normalizeNumber(item.material_price),
        };
      })
    );
  };

  const handleWarehouseSendChange = (key, value) => {
    setDataSource((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, material_warehouse_send: Math.max(0, normalizeNumber(value)) }
          : item
      )
    );
  };

  const handleReceiveChange = (key, value) => {
    setDataSource((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, material_receive: Math.max(0, normalizeNumber(value)) }
          : item
      )
    );
  };

  const handleDeleteRow = (key) => {
    const updated = dataSource
      .filter((item) => item.key !== key)
      .map((item, index) => ({
        ...item,
        key: index + 1,
        no: index + 1,
      }));

    setDataSource(updated);
  };

  const handleAddMaterial = (selectedId) => {
    setSelectedMaterialId(selectedId);

    const selectedMaterial = productsSearch.find((item) => item.id === selectedId);

    if (!selectedMaterial) {
      showMsg("error", "ไม่พบข้อมูล Material ที่เลือก");
      return;
    }

    if (dataSource.some((item) => item.id === selectedMaterial.id)) {
      showMsg("warning", "Material นี้ถูกเพิ่มในรายการแล้ว");
      setSelectedMaterialId(null);
      return;
    }

    const imageList = String(selectedMaterial.images || "")
      .split(",")
      .map((img) => img.trim())
      .filter(Boolean);

    const imageFile = imageList.find((url) => /\.(jpg|jpeg|png)$/i.test(url));

    const newItem = {
      ...selectedMaterial,
      key: dataSource.length + 1,
      no: dataSource.length + 1,
      material_name: selectedMaterial.name,
      material_photo: imageFile || "-",
      material_code: selectedMaterial.code || `M-${selectedMaterial.id}`,
      material_size: selectedMaterial.size || "-",
      material_price: normalizeNumber(selectedMaterial.unit_price),
      material_stock: normalizeNumber(selectedMaterial.qty),
      material_request: 1,
      material_value: normalizeNumber(selectedMaterial.unit_price) * 1,
      material_warehouse_send: 0,
      material_receive: 0,
    };

    setDataSource((prev) => [...prev, newItem]);
    setSelectedMaterialId(null);
  };

  const action = async (actionMode = "save") => {
    try {
      const values = await formCustom.validateFields();

      if (!values.crop?.length) {
        showMsg("error", "กรุณาเลือก Crop");
        return;
      }

      if (!values.product?.length) {
        showMsg("error", "กรุณาเลือก Product");
        return;
      }

      if (!dataSource.length) {
        showMsg("error", "กรุณาเลือก Material อย่างน้อย 1 รายการ");
        return;
      }

      const images = fileList
        .filter((f) => f.status === "done" && f.url)
        .map((f) => f.url);

      const payload = {
        user_id: userInfo.id,
        code: values.expense_material_code || "AUTO",
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
        totalValueRequest,
        totalValueWareHoseSend: totalValueWarehouseSend,
        totalValueReceive,
        action_mode: actionMode,
        material_list: dataSource.map((item) => ({
          id: item.id,
          material_code: item.material_code,
          price: item.material_price,
          stock: item.material_stock,
          request: item.material_request,
          value: item.material_value,
          warehouse_send: item.material_warehouse_send,
          receive: item.material_receive,
        })),
      };

      setLoading(true);

      const res = await useServiceAPI.post(
        mode === "create"
          ? paths.pathExpenseMaterialCreate
          : paths.pathExpenseMaterialEdit,
        payload
      );

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

  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    {
      title: "Photo",
      align: "center",
      dataIndex: "material_photo",
      key: "material_photo",
      render: (url) =>
        /\.(jpg|jpeg|png)$/i.test(url) ? (
          <img
            src={url}
            alt="material"
            style={{ width: 60, height: 60, objectFit: "cover" }}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Code",
      dataIndex: "material_code",
      key: "material_code",
      align: "center",
    },
    { title: "Name", dataIndex: "material_name", key: "material_name" },
    {
      title: "Size",
      dataIndex: "material_size",
      key: "material_size",
      align: "center",
      render: (value) => value || "-",
    },
    { title: "Price", dataIndex: "material_price", key: "material_price" },
    { title: "Stock", dataIndex: "material_stock", key: "material_stock", align: "center", },
    {
      title: "Request",
      align: "center",
      dataIndex: "material_request",
      key: "material_request",
      render: (_, record) => (
        <div className="quantity-control flex justify-center items-center">
          <img
            src="/img/icons/collapse.png"
            alt="decrease"
            className={`cursor-pointer w-6 h-6 ${isReadOnly ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() =>
              !isReadOnly &&
              handleQuantityChange(record.key, normalizeNumber(record.material_request) - 1)
            }
          />
          <Input
            inputMode="numeric"
            disabled={isReadOnly}
            value={record.material_request || 0}
            onChange={(e) =>
              handleQuantityChange(record.key, parseInt(e.target.value, 10) || 0)
            }
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20"
          />
          <img
            src="/img/icons/expand.png"
            alt="increase"
            className={`cursor-pointer w-6 h-6 ${isReadOnly ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() =>
              !isReadOnly &&
              handleQuantityChange(record.key, normalizeNumber(record.material_request) + 1)
            }
          />
        </div>
      ),
    },
    { title: "Value", dataIndex: "material_value", key: "material_value", align: "center", },
    {
      title: "Warehouse Send",
      dataIndex: "material_warehouse_send",
      key: "material_warehouse_send",
      align: "center",
      render: (_, record) => (
        <Input
          disabled
          type="number"
          min={0}
          value={record.material_warehouse_send}
          onChange={(e) => handleWarehouseSendChange(record.key, e.target.value)}
        />
      ),
    },
    {
      title: "Receive",
      dataIndex: "material_receive",
      key: "material_receive",
      align: "center",
      render: (_, record) => (
        <Input
          disabled
          type="number"
          min={0}
          value={record.material_receive}
          onChange={(e) => handleReceiveChange(record.key, e.target.value)}
        />
      ),
    },
    {
      title: <div className="text-center">Action</div>,
      key: "action",
      render: (_, record) => (
        <button className="delete-button flex justify-center mx-auto" type="button">
          <img
            src="/img/icons/delete.png"
            alt="delete"
            className={`w-6 h-6 ${isReadOnly ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
            onClick={() => !isReadOnly && handleDeleteRow(record.key)}
          />
        </button>
      ),
    },
  ];

  const formFields = [
    {
      label: "Photo",
      name: "photo",
      type: "photo",
      required: true,
      col: 24,
      value: fileList,
      multiple: true,
      accept: ".pdf,.png,.jpg,.jpeg",
      disabled: isReadOnly,
    },
    {
      label: "Remark",
      name: "remark",
      type: "text",
      col: 24,
      disabled: isReadOnly,
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">{renderTitle()}</div>

      <Form form={formCustom} layout="vertical">
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">
            <Col md={6}>
              <Form.Item label="Material Expense Code" name="expense_material_code">
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
                  disabled={isReadOnly}
                  mode="multiple"
                  placeholder="Select Crop"
                  options={crops}
                  onChange={handleCropChange}
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
                  disabled={isReadOnly || !hasCropSelected}
                  mode="multiple"
                  placeholder={hasCropSelected ? "Select Product" : "Please select crop first"}
                  options={products}
                  optionFilterProp="label"
                  onChange={handleProductChange}
                />
              </Form.Item>
            </Col>
          </Row>
        </BoxPrimary>

        <BoxPrimary title="Material" className="m-1 mb-4">
          <div className="mb-3 flex justify-end">
            <Select
              showSearch
              disabled={isReadOnly || !hasProductSelected}
              placeholder={hasProductSelected ? "Search Material" : "Please select product first"}
              name="material_search"
              optionFilterProp="label"
              className="w-full"
              options={productSearchOptions}
              value={selectedMaterialId}
              onChange={handleAddMaterial}
            />
          </div>
        </BoxPrimary>

        <BoxPrimary title="Material List" className="m-1 mb-4">
          <TableAction header={header} dataSource={dataSource} />
        </BoxPrimary>

        <BoxPrimary className="m-1 flex flex-col items-end gap-2 text-right text-[14px]">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div>Total Value Request:</div>
            <InputNumber
              className="w-[200px]"
              min={0}
              disabled
              value={totalValueRequest}
              formatter={(value) =>
                `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div>Total Value Warehouse Send:</div>
            <InputNumber
              className="w-[200px]"
              min={0}
              disabled
              value={totalValueWarehouseSend}
              formatter={(value) =>
                `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div>Total Value Receive:</div>
            <InputNumber
              className="w-[200px]"
              min={0}
              disabled
              value={totalValueReceive}
              formatter={(value) =>
                `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          </div>
        </BoxPrimary>
      </Form>

      <FormCustom
        fields={formFields}
        form={formCustom}
        onUploadFinish={handleUploadSuccess}
        mode={mode}
      />

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/expenses/material")}
        />

        {!isViewMode && (isCreateMode || canSaveDraft) && (
          <ActionButton
            mode="saveDraft"
            text="Save Draft"
            onClick={() => action("draft")}
          />
        )}

        {!isViewMode && canSave && (
          <ActionButton
            mode="update"
            text={isCreateMode ? "Create" : "Save"}
            onClick={() => action("save")}
          />
        )}

        {canExportPdf && formCustom.getFieldValue("expense_material_code") && (
          <ActionButton
            mode="saveDraft"
            text="Export PDF"
            onClick={() => {
              const targetUrl = `/expenses/material/pdf?material_number=${formCustom.getFieldValue("expense_material_code") || ""
                }`;
              window.open(targetUrl, "_blank");
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}