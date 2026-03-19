// src/pages/expenses/sample_expense/ActionSampleExpense.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { Checkbox, DatePicker, Input, InputNumber, Select } from "antd";
import DynamicButton from "../../../components/button/DynamicButton";
import { AuthContext } from "../../../contexts/AuthContext";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import dayjs from "dayjs";
// import UploadSection from "../../../components/file_upload/UploadSection";

export default function ActionSampleExpense() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const { showNotification, userInfo } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  const [dealers, setDealers] = useState([]);
  const [subDealers, setSubDealers] = useState([]);
  const [crops, setCrops] = useState([]);

  const [searchProductData, setSearchProductData] = useState([]);
  const [isSubDealerDisabled, setIsSubDealerDisabled] = useState(false);

  const [dataSource, setDataSource] = useState([]);

  const [fileList, setFileList] = useState([]);
  const fileUploadRef = useRef(null);

  const [permission, setPermission] = useState({
    btn_create: false,
    btn_edit: false,
    btn_daft: false,
    btn_save: false,
    btn_pdf: false,
  });

  const [data, setData] = useState({
    document_number: null,
    document_datetime: dayjs(),
    dealer_id: null,
    dealer_name: null,
    sub_dealer_id: null,
    sub_dealer_name: null,
    crop_id: null,
    crop_name: null,
    request_value: 0,
    warehouse_value: 0,
    receive_value: 0,
    remark: "",
  });

  const normalizeId = (value) => {
    if (value === undefined || value === null || value === "") return null;
    return String(value);
  };

  const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  // ใช้คำนวณ QTY KG/LT = packing_unit_size * quantity
  const calcSumUnitQty = (packingUnitSize, quantity) => {
    return toNumber(packingUnitSize) * toNumber(quantity);
  };

  const formatSelectOptions = (items = [], valueKeys = [], labelKeys = []) => {
    return items
      .map((item) => {
        const rawValue = valueKeys
          .map((k) => item?.[k])
          .find((v) => v !== undefined && v !== null && v !== "");
        const rawLabel = labelKeys
          .map((k) => item?.[k])
          .find((v) => v !== undefined && v !== null && v !== "");

        if (rawValue === undefined || rawValue === null || rawValue === "") return null;

        return {
          value: String(rawValue),
          label: String(rawLabel ?? rawValue),
        };
      })
      .filter(Boolean);
  };

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [dealerRes, subDealerRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterDealerAllTeam),
          useServiceAPI.get(paths.pathMasterSubDealerAllTeam),
        ]);

        setDealers(
          formatSelectOptions(
            dealerRes?.data || [],
            ["id", "dealer_id"],
            ["name", "dealer_name"]
          )
        );

        setSubDealers(
          formatSelectOptions(
            subDealerRes?.data || [],
            ["sub_dealer_id", "id"],
            ["sub_dealer_name", "name"]
          )
        );
      } catch (error) {
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
      }
    };

    loadMasters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadCrops = async () => {
      try {
        const path = isSubDealerDisabled
          ? paths.pathMasterCrop
          : paths.pathMasterSubDealerCrop;

        const res = await useServiceAPI.get(path);

        if (res.status === 200) {
          setCrops(
            formatSelectOptions(res?.data || [], ["id", "crop_id"], ["name", "crop_name"])
          );
        } else {
          setCrops([]);
        }
      } catch (error) {
        setCrops([]);
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
      }
    };

    loadCrops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubDealerDisabled]);

  useEffect(() => {
    const docNo = location?.state?.document_number;

    if (isCreateMode) {
      setPermission((prev) => ({
        ...prev,
        btn_create: true,
      }));
      return;
    }

    if (!docNo) return;

    const getDataSample = async () => {
      try {
        setLoading(true);

        const response = await useServiceAPI.get(paths.pathSampleExpenseDetailsAndCreate, {
          document_number: docNo,
        });

        if (response.status !== 200) {
          showNotification("error", "ไม่สามารถดึงข้อมูลได้");
          return;
        }

        const responseData = response.data?.header;
        const productData = response.data?.items || [];
        const responsePermission = response.data?.permission || {};

        setPermission((prev) => ({
          ...prev,
          ...responsePermission,
        }));

        if (!responseData) {
          showNotification("error", "ข้อมูลไม่ครบถ้วน");
          return;
        }

        const newProductDataDetails = productData.map((p, index) => {
          const qty = toNumber(p.quantity || 0);
          const value = toNumber(p.product_unit_thb ?? p.net_price ?? 0);
          const packingUnitSize = toNumber(
            p.packing_unit_size ?? p.product_packing_unit_size ?? 0
          );
          const unitSize = toNumber(p.unit_size ?? 0);
          const qtyUnitSize = toNumber(p.qty_unit_size ?? 0);
          const sumUnitQty = toNumber(
            p.sum_unit_qty ?? calcSumUnitQty(packingUnitSize, qty)
          );

          return {
            key: index + 1,
            no: index + 1,
            sku: p.product_code,
            productId: p.product_id,
            productName: p.product_name,
            packSize: p.product_unit,
            pricePerKgLt: toNumber(p.bath_ltkg || 0),
            quantity: qty,
            packing_unit_size: packingUnitSize,
            unit_size: unitSize,
            qty_unit_size: qtyUnitSize,
            sum_unit_qty: sumUnitQty,
            value,
            totalValue: qty * value,
            remark: p.ref_remark || "",
            warehouseSend: toNumber(p.warehouse_qty || p.warehouse_send || qty || 0),
            receive: toNumber(p.receive_qty || p.receive || qty || 0),
          };
        });

        setDataSource(newProductDataDetails);

        const fileFromApi =
          responseData?.file_list ||
          responseData?.url_file_list ||
          responseData?.file_image_list ||
          [];

        const mappedFiles = Array.isArray(fileFromApi)
          ? fileFromApi
            .map((f) => {
              if (!f) return null;
              if (typeof f === "string") {
                return {
                  uid: f,
                  name: f.split("/").pop() || "file",
                  status: "done",
                  url: f,
                };
              }
              return {
                uid: f.file_key || f.uid || f.file_url || f.url || `${Math.random()}`,
                name:
                  f.file_name ||
                  f.name ||
                  (f.file_url || f.url || "").split("/").pop() ||
                  "file",
                status: "done",
                url: f.file_url || f.url,
              };
            })
            .filter(Boolean)
          : [];

        setFileList(mappedFiles);

        const hasSubDealer = !!responseData.sub_dealer_id;
        setIsSubDealerDisabled(!hasSubDealer);

        setData({
          document_number: responseData.document_number || null,
          document_datetime: responseData.document_datetime
            ? dayjs(responseData.document_datetime)
            : dayjs(),
          dealer_id: normalizeId(responseData.dealer_id),
          dealer_name: responseData.dealer_name || null,
          sub_dealer_id: normalizeId(responseData.sub_dealer_id),
          sub_dealer_name: responseData.sub_dealer_name || null,
          crop_id: normalizeId(responseData.crop_id),
          crop_name: responseData.crop_name || null,
          request_value: toNumber(responseData.request_value || 0),
          warehouse_value: toNumber(responseData.warehouse_value || 0),
          receive_value: toNumber(responseData.receive_value || 0),
          remark: responseData.ref_remark || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.status === 422) {
          showNotification("error", error.message || "ข้อผิดพลาดในการดึงข้อมูล");
        } else {
          showNotification("error", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
        }
      } finally {
        setLoading(false);
      }
    };

    getDataSample();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateMode, location?.state?.document_number]);

  const handleUploadClick = () => fileUploadRef.current?.triggerUpload();

  const handleUploadSuccess = (response) => {
    const d = response?.data || response;
    const file = {
      uid: d.file_key || d.uid || `${Date.now()}`,
      name: d.file_name || d.name || "file",
      status: "done",
      url: d.file_url || d.url,
    };
    setFileList((prev) => [...prev, file]);
  };

  const handleFileRemove = (file) => {
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const handleInputChange = (key, field, value) => {
    setDataSource((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  };

  const handleNumberFieldChange = (key, field, value) => {
    setDataSource((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: Number(value || 0) } : item
      )
    );
  };

  const handleQuantityChange = (key, newQuantity) => {
    const qty = Math.max(1, Number(newQuantity) || 1);

    const updatedDataSource = dataSource.map((item) => {
      if (item.key !== key) return item;

      const sumUnitQty = calcSumUnitQty(item.packing_unit_size, qty);

      return {
        ...item,
        quantity: qty,
        sum_unit_qty: sumUnitQty,
        totalValue: qty * Number(item.value || 0),
      };
    });

    setDataSource(updatedDataSource);
  };

  const footerSummary = () => {
    const totalQty = dataSource.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const totalSumUnitQty = dataSource.reduce(
      (sum, item) => sum + Number(item.sum_unit_qty || 0),
      0
    );
    const totalValue = dataSource.reduce((sum, item) => sum + Number(item.totalValue || 0), 0);

    return (
      <tr className="bg-gray-200">
        <td colSpan={17} className="text-right font-semibold">
          Item: {dataSource.length} &nbsp; QTY: {totalQty} &nbsp; QTY KG/LT:{" "}
          {totalSumUnitQty.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          &nbsp; Total:{" "}
          {totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    );
  };

  const onChangeProduct = (value) => {
    setSearchProductData([]);

    const loadProductDetail = async () => {
      setLoading(true);
      try {
        const productDetail = await useServiceAPI.get(paths.pathMasterProductDetail, {
          product_id: value,
        });

        const p = productDetail?.data || {};

        const existingIndex = dataSource.findIndex(
          (item) => String(item.sku) === String(p.product_code)
        );

        if (existingIndex !== -1) {
          showNotification("error", "Existing Product", [], 2);
          return;
        }

        const packingUnitSize = toNumber(p.packing_unit_size ?? 0);
        const quantity = 1;
        const unitPrice = toNumber(p.net_price ?? 0); // Price / Unit
        const pricePerKgLt = toNumber(p.bath_ltkg ?? 0); // Price / Kg/Lt
        const sumUnitQty = calcSumUnitQty(packingUnitSize, quantity);

        const newRow = {
          key: dataSource.length + 1,
          no: dataSource.length + 1,
          sku: p.product_code || "",
          productId: p.id || null,
          productName: p.product_name || "",
          packSize: p.product_unit || p.packing_list || "",
          quantity,
          packing_unit_size: packingUnitSize,
          unit_size: toNumber(p.unit_size ?? 0),
          qty_unit_size: toNumber(p.qty_unit_size ?? 0),
          sum_unit_qty: sumUnitQty,
          value: unitPrice,
          pricePerKgLt,
          totalValue: quantity * unitPrice,
          remark: "",
          warehouseSend: 0,
          receive: 0,
        };

        const updated = [...dataSource, newRow].map((row, index) => ({
          ...row,
          key: index + 1,
          no: index + 1,
        }));

        setDataSource(updated);
      } catch (error) {
        console.error("Error loading product detail:", error);
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadProductDetail();
  };

  const onSearchProduct = (value) => {
    if (!value || value.length < 3) {
      setSearchProductData([]);
      return;
    }

    const loadProducts = async () => {
      try {
        const product = await useServiceAPI.get(paths.pathMasterProducts, { keyword: value });
        const options = (product?.data || []).map((d) => ({
          value: d.id,
          label: d.name,
        }));
        setSearchProductData(options);
      } catch (error) {
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
      }
    };

    loadProducts();
  };

  const totalRequestValue = dataSource.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.value || 0),
    0
  );

  const totalWarehouseValue = dataSource.reduce(
    (sum, item) => sum + Number(item.warehouseSend || 0) * Number(item.value || 0),
    0
  );

  const totalReceiveValue = dataSource.reduce(
    (sum, item) => sum + Number(item.receive || 0) * Number(item.value || 0),
    0
  );

  const canSave = isCreateMode
    ? (permission?.btn_create ?? true)
    : (permission?.btn_save ?? permission?.btn_edit ?? false);

  const canSaveDraft = permission?.btn_daft ?? false;

  const canExportPdf = permission?.btn_pdf ?? !isCreateMode;

  const handleSave = async (actionMode = "save") => {
    const documentDate = data?.document_datetime
      ? dayjs(data.document_datetime).format("YYYY-MM-DD")
      : null;

    const userId = userInfo?.id;

    if (!documentDate) {
      showNotification("error", "The document date field is required.");
      return;
    }

    if (!userId) {
      showNotification("error", "The user id field is required.");
      return;
    }

    if (!data?.crop_id) {
      showNotification("error", "กรุณาเลือก Crop");
      return;
    }

    if (!isSubDealerDisabled && !data?.sub_dealer_id) {
      showNotification("error", "กรุณาเลือก Sub Dealer หรือเลือก No Sub Dealer");
      return;
    }

    if (isSubDealerDisabled && !data?.dealer_id) {
      showNotification("error", "กรุณาเลือก Dealer");
      return;
    }

    if (!dataSource.length) {
      showNotification("error", "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ");
      return;
    }

    const doneFiles = fileList.filter((f) => f.status === "done");

    const file_list = doneFiles.map((f) => ({
      file_key: f.uid,
      file_name: f.name,
      file_url: f.url,
    }));

    const url_file_list = doneFiles.map((f) => f.url || "");
    const file_name_list = doneFiles.map((f) => f.name || "");

    const productsForCreate = dataSource.map((item) => {
      const quantity = Number(item.quantity || 0);
      const productUnitThb = Number(item.value || 0);
      const warehouseSendQty = Number(item.warehouseSend || 0);
      const receiveQty = Number(item.receive || 0);
      const packingUnitSize = Number(item.packing_unit_size || 0);
      const sumUnitQty = calcSumUnitQty(packingUnitSize, quantity);

      return {
        product_id: Number(item.productId || 0),
        product_code: item.sku || "",
        product_name: item.productName || "",
        product_unit: item.packSize || "",
        product_unit_thb: productUnitThb,
        quantity,
        packing_unit_size: packingUnitSize,
        unit_size: Number(item.unit_size || 0),
        qty_unit_size: Number(item.qty_unit_size || 0),
        sum_unit_qty: sumUnitQty,
        warehouse_qty: warehouseSendQty,
        receive_qty: receiveQty,
        foc: 0,
        net_amount: quantity * productUnitThb,
        ref_remark: item.remark || "",
        action_mode: actionMode,
      };
    });

    const productsForEdit = dataSource.map((item) => {
      const quantity = Number(item.quantity || 0);
      const productUnitThb = Number(item.value || 0);
      const packingUnitSize = Number(item.packing_unit_size || 0);
      const sumUnitQty = calcSumUnitQty(packingUnitSize, quantity);

      return {
        product_id: Number(item.productId || 0),
        product_code: item.sku || "",
        product_name: item.productName || "",
        product_unit: item.packSize || "",
        quantity,
        packing_unit_size: packingUnitSize,
        unit_size: Number(item.unit_size || 0),
        qty_unit_size: Number(item.qty_unit_size || 0),
        sum_unit_qty: sumUnitQty,
        warehouse_qty: Number(item.warehouseSend || 0),
        receive_qty: Number(item.receive || 0),
        net_amount: quantity * productUnitThb,
        product_unit_thb: productUnitThb,
        ref_remark: item.remark || "",
        action_mode: actionMode,
      };
    });

    try {
      setLoading(true);

      if (isEditMode) {
        const payload = {
          platform: "web",
          document_datetime: documentDate,
          document_date: documentDate,
          user_id: userId,
          document_number: data?.document_number,
          dealer_id: isSubDealerDisabled ? Number(data?.dealer_id) : null,
          sub_dealer_id: isSubDealerDisabled ? null : Number(data?.sub_dealer_id),
          crop_id: Number(data?.crop_id),
          request_value: totalRequestValue,
          warehouse_value: totalWarehouseValue,
          receive_value: totalReceiveValue,
          url_file_list,
          file_name_list,
          remark: data?.remark || "",
          action_mode: actionMode,
          products: productsForEdit,
        };

        const response = await useServiceAPI.put(
          paths.pathSampleExpenseUpdate,
          payload,
          setLoading
        );

        if (response.status === 200) {
          showNotification(
            "success",
            response.data.message,
            response.data.message_line
          ).then(() => navigate("/expenses/sample"));
        }
      } else {
        const payload = {
          platform: "web",
          document_datetime: documentDate,
          document_date: documentDate,
          user_id: userId,
          dealer_id: isSubDealerDisabled ? Number(data?.dealer_id) : null,
          sub_dealer_id: isSubDealerDisabled ? null : Number(data?.sub_dealer_id),
          crop_id: Number(data?.crop_id),
          request_value: totalRequestValue,
          warehouse_value: totalWarehouseValue,
          receive_value: totalReceiveValue,
          remark: data?.remark || "",
          file_list,
          action_mode: actionMode,
          products: productsForCreate,
        };

        const response = await useServiceAPI.post(
          paths.pathSampleExpenseDetailsAndCreate,
          payload,
          setLoading
        );

        if (response.status === 200) {
          showNotification(
            "success",
            response.data.message,
            response.data.message_line
          ).then(() => navigate("/expenses/sample"));
        }
      }
    } catch (error) {
      if (error.status === 422) {
        showNotification("error", error.message);
      } else {
        showNotification("error", "เกิดข้อผิดพลาด");
      }
    } finally {
      setLoading(false);
    }
  };

  const productHeader = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Product Name", dataIndex: "productName", key: "productName" },
    { title: "Pack Size", dataIndex: "packSize", key: "packSize" },
    {
      title: <div className="text-center">Request (unit)</div>,
      dataIndex: "quantity",
      align: "center",
      key: "quantity",
      render: (_, record) =>
        isViewMode ? (
          Number(record.quantity || 0)
        ) : (
          <div className="quantity-control flex justify-center items-center">
            <img
              src="/img/icons/collapse.png"
              alt="decrease"
              className="cursor-pointer w-6 h-6"
              onClick={() =>
                handleQuantityChange(
                  record.key,
                  Math.max(0, Number(record.quantity || 0) - 1)
                )
              }
            />
            <Input
              inputMode="numeric"
              value={record.quantity}
              onChange={(e) => {
                const raw = e.target.value;
                const cleaned = String(raw).replace(/[^\d]/g, "");
                handleQuantityChange(
                  record.key,
                  cleaned === "" ? 0 : Number(cleaned)
                );
              }}
              className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20"
            />
            <img
              src="/img/icons/expand.png"
              alt="increase"
              className="cursor-pointer w-6 h-6"
              onClick={() =>
                handleQuantityChange(record.key, Number(record.quantity || 0) + 1)
              }
            />
          </div>
        ),
    },
    {
      title: <div className="text-center">QTY KG/LT</div>,
      dataIndex: "sum_unit_qty",
      key: "sum_unit_qty",
      render: (_, record) =>
        Number(record.sum_unit_qty || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      title: <div className="text-center">Unit / CT</div>,
      dataIndex: "unit_size",
      key: "unit_size",
      render: (v) =>
        Number(v || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      title: <div className="text-center">QTY / CT</div>,
      dataIndex: "qty_unit_size",
      key: "qty_unit_size",
      render: (v) =>
        Number(v || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      title: <div className="text-center">QTY / Unit</div>,
      dataIndex: "packing_unit_size",
      key: "packing_unit_size",
      render: (v) =>
        Number(v || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      title: "Price / Unit",
      dataIndex: "value",
      key: "value",
      render: (v) =>
        Number(v || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      title: "Price / (Kg/Lt)",
      dataIndex: "pricePerKgLt",
      key: "pricePerKgLt",
      render: (v) =>
        Number(v || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      title: "Value",
      dataIndex: "totalValue",
      key: "totalValue",
      render: (_, record) =>
        Number(record.totalValue || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      title: "Warehouse Send",
      dataIndex: "warehouseSend",
      key: "warehouseSend",
      render: (_, record) =>
        isViewMode ? (
          Number(record.warehouseSend || 0)
        ) : (
          <InputNumber
            min={0}
            disabled={isCreateMode}
            value={record.warehouseSend}
            onChange={(value) =>
              handleNumberFieldChange(record.key, "warehouseSend", value)
            }
            className="w-full"
          />
        ),
    },
    {
      title: "Receive",
      dataIndex: "receive",
      key: "receive",
      render: (_, record) =>
        isViewMode ? (
          Number(record.receive || 0)
        ) : (
          <InputNumber
            min={0}
            disabled={isCreateMode}
            value={record.receive}
            onChange={(value) =>
              handleNumberFieldChange(record.key, "receive", value)
            }
            className="w-full"
          />
        ),
    },
    {
      title: "Remark",
      dataIndex: "remark",
      key: "remark",
      render: (_, record) =>
        isViewMode ? (
          record.remark
        ) : (
          <Input
            value={record.remark}
            onChange={(e) =>
              handleInputChange(record.key, "remark", e.target.value)
            }
          />
        ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_, record) =>
        isViewMode ? null : (
          <DynamicButton
            iconSrc="/img/icons/delete.png"
            onClick={() => {
              const updated = dataSource
                .filter((item) => item.key !== record.key)
                .map((row, index) => ({
                  ...row,
                  key: index + 1,
                  no: index + 1,
                }));
              setDataSource(updated);
            }}
          />
        ),
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">
        {isCreateMode
          ? "Create Sample Expense"
          : isEditMode
            ? "Edit Sample Expense"
            : "View Sample Expense"}
      </div>

      <BoxPrimary>
        <div className="grid gap-4 mb-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
          <div>
            <label className="block mb-1 text-sm">Date</label>
            <DatePicker
              disabled
              className="w-full border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
              value={data.document_datetime}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Sample Expense Code</label>
            <Input
              value={data.document_number || "-"}
              disabled
              className="w-full border-gray-300 bg-gray-100 text-gray-500 focus:ring-green-500 focus:border-green-500 rounded-md"
            />
          </div>

          <div className="flex items-center">
            <div className="flex-1">
              <label className="block mb-1 text-sm">Sub Dealer</label>
              <Select
                disabled={isViewMode || isSubDealerDisabled}
                placeholder="Select"
                className="w-full"
                options={subDealers}
                showSearch
                allowClear
                optionFilterProp="label"
                onChange={(value) => {
                  const selected = subDealers.find((x) => x.value === value);
                  setData((prev) => ({
                    ...prev,
                    sub_dealer_id: value,
                    sub_dealer_name: selected?.label || "",
                    crop_id: null,
                    crop_name: null,
                  }));
                }}
                value={data?.sub_dealer_id}
              />
            </div>
          </div>

          <div className="grid items-end">
            <Checkbox
              disabled={isViewMode}
              checked={isSubDealerDisabled}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsSubDealerDisabled(checked);

                setData((prev) => ({
                  ...prev,
                  crop_id: null,
                  crop_name: null,
                  sub_dealer_id: null,
                  sub_dealer_name: null,
                  dealer_id: null,
                  dealer_name: null,
                }));
              }}
            >
              No Sub Dealer
            </Checkbox>
          </div>

          <div>
            <label className="block mb-1 text-sm">Dealer</label>
            <Select
              disabled={isViewMode || !isSubDealerDisabled}
              placeholder="Dealer"
              className="w-full"
              options={dealers}
              showSearch
              allowClear
              optionFilterProp="label"
              onChange={(value) => {
                const selected = dealers.find((x) => x.value === value);
                setData((prev) => ({
                  ...prev,
                  dealer_id: value,
                  dealer_name: selected?.label || "",
                  crop_id: null,
                  crop_name: null,
                }));
              }}
              value={data?.dealer_id}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">
              Crop <span className="text-[#f11113]">*</span>
            </label>
            <Select
              disabled={isViewMode}
              placeholder="Select"
              className="w-full"
              allowClear
              showSearch
              optionFilterProp="label"
              options={crops}
              onChange={(value) => {
                const selected = crops.find((x) => x.value === value);
                setData((prev) => ({
                  ...prev,
                  crop_id: value,
                  crop_name: selected?.label || "",
                }));
              }}
              value={data?.crop_id}
            />
          </div>
        </div>
      </BoxPrimary>

      {!isViewMode && (
        <BoxPrimary title="Product Sample">
          <div className="mb-3 flex justify-end">
            <Select
              showSearch
              placeholder="Search Product"
              optionFilterProp="label"
              className="w-full"
              onChange={onChangeProduct}
              onSearch={onSearchProduct}
              options={searchProductData}
              value={undefined}
            />
          </div>
        </BoxPrimary>
      )}

      <BoxPrimary title="List">
        <TableComponent
          header={productHeader}
          dataSource={dataSource}
          footer={footerSummary}
          pagination={false}
        />
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex flex-col items-end space-y-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Total Value Request:</label>
            <InputNumber
              className="w-40 text-right rounded-md"
              min={0}
              value={totalRequestValue}
              formatter={(value) =>
                `${parseFloat(value || 0).toFixed(2)}`.replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  ","
                )
              }
              disabled
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Total Value Warehouse Send:
            </label>
            <InputNumber
              className="w-40 text-right rounded-md"
              min={0}
              value={totalWarehouseValue}
              formatter={(value) =>
                `${parseFloat(value || 0).toFixed(2)}`.replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  ","
                )
              }
              disabled
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Total Value Receive:</label>
            <InputNumber
              className="w-40 text-right rounded-md"
              min={0}
              value={totalReceiveValue}
              formatter={(value) =>
                `${parseFloat(value || 0).toFixed(2)}`.replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  ","
                )
              }
              disabled
            />
          </div>
        </div>
      </BoxPrimary>

      {/* <UploadSection
        title="Attach File"
        fileUploadRef={fileUploadRef}
        fileList={fileList}
        handleUploadClick={handleUploadClick}
        handleUploadSuccess={handleUploadSuccess}
        handleFileRemove={handleFileRemove}
        disabled={isViewMode}
      /> */}

      <BoxPrimary title="Remark">
        <Input.TextArea
          placeholder="Remark"
          rows={3}
          disabled={isViewMode}
          onChange={(e) => setData((prev) => ({ ...prev, remark: e.target.value }))}
          value={data?.remark || ""}
        />
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/expenses/sample")}
        />

        {!isViewMode && (isCreateMode || canSaveDraft) && (
          <ActionButton
            mode="saveDraft"
            text="Save Draft"
            onClick={() => handleSave("daft")}
          />
        )}

        {!isViewMode && canSave && (
          <ActionButton
            mode="save"
            text={isCreateMode ? "Create" : "Save"}
            onClick={() => handleSave("save")}
          />
        )}

        {canExportPdf && data?.document_number && (
          <ActionButton
            mode="saveDraft"
            text="Export PDF"
            onClick={() => {
              const targetUrl = `/expenses/sample/pdf?sample_number=${data?.document_number}`;
              window.open(targetUrl, "_blank");
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}