import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";
import {
  DeleteOutlined,
  ExclamationCircleFilled,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import TableComponent from "../../../../components/table/TableComponent";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import { AuthContext } from "../../../../contexts/AuthContext";
import {
  buildDraftCampaignPayload,
  formatNumber,
  getDetailPayload,
  mapDraftCampaignDetail,
  mapDraftCampaignProduct,
  mapProductSearchOption,
  normalizeOption,
  recalculateProductRow,
  toNumber,
} from "../draft_campaign/draftCampaignUtils";

const emptyDetail = {
  document_number: "",
  document_date: "",
  user_id: undefined,
  dealer_id: undefined,
  sub_dealer_id: undefined,
  farmer_id: undefined,
  sale_name: "-",
  dealer_name: "-",
  sub_dealer_name: "-",
  farmer_name: "-",
  current_point: 0,
  target_point: 0,
  diff_form_target: 0,
  current_value: 0,
  target_value: 0,
  diff_value_form_target: 0,
  value_to_point: 0,
  total_point: 0,
  net_amount: 0,
  products: [],
  permission: {},
};

export default function FarmerDraftCampaignAction() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useParams();
  const [form] = Form.useForm();
  const { showMsg, showNotification } = useContext(AuthContext);

  const isView = String(mode).toLowerCase() === "view";
  const isEdit = String(mode).toLowerCase() === "edit";
  const isCreate = !isView && !isEdit;

  const pageTitle = isView
    ? "View Draft Campaign (Farmer)"
    : isEdit
      ? "Edit Draft Campaign (Farmer)"
      : "Create Draft Campaign (Farmer)";

  const documentNumber =
    location.state?.documentNumber ||
    new URLSearchParams(location.search).get("document_number") ||
    "";

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(emptyDetail);
  const [salesOptions, setSalesOptions] = useState([]);
  const [dealerOptions, setDealerOptions] = useState([]);
  const [subDealerOptions, setSubDealerOptions] = useState([]);
  const [farmerOptions, setFarmerOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [productSelection, setProductSelection] = useState(undefined);
  const [productSearchValue, setProductSearchValue] = useState("");

  const productSearchRef = useRef("");
  const currentPointRequestRef = useRef(0);
  const farmerRequestRef = useRef(0);

  const readOnly = isView;
  const canSubmit = isCreate || detail.permission?.update !== false;

  const watchSaleId = Form.useWatch("user_id", form);
  const watchDealerId = Form.useWatch("dealer_id", form);
  const watchSubDealerId = Form.useWatch("sub_dealer_id", form);
  const watchFarmerId = Form.useWatch("farmer_id", form);
  const watchCurrentPoint = Form.useWatch("current_point", form);
  const watchTargetPoint = Form.useWatch("target_point", form);
  const watchCurrentValue = Form.useWatch("current_value", form);
  const watchTargetValue = Form.useWatch("target_value", form);
  const watchValueToPoint = Form.useWatch("value_to_point", form);
  const isDealerOnly = !!watchDealerId && !watchSubDealerId && !watchFarmerId;

  const setCurrentPointValue = (value) => {
    const currentPoint = toNumber(value);

    form.setFieldsValue({
      current_point: currentPoint,
    });

    setDetail((prev) => ({
      ...prev,
      current_point: currentPoint,
    }));
  };

  const setCurrentValue = (value) => {
    const currentValue = toNumber(value);

    form.setFieldsValue({
      current_value: currentValue,
    });

    setDetail((prev) => ({
      ...prev,
      current_value: currentValue,
    }));
  };

  const numberInputFormatter = (value) => {
    if (value === null || value === undefined || value === "") return "";

    const [integer, decimal] = String(value).replace(/,/g, "").split(".");
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return decimal !== undefined
      ? `${formattedInteger}.${decimal}`
      : formattedInteger;
  };

  const numberInputParser = (value) => String(value || "").replace(/,/g, "");

  const resetCurrentPoint = () => {
    currentPointRequestRef.current += 1;
    setCurrentPointValue(0);
  };

  const getBalancePointFromResponse = (res) => {
    return (
      res?.data?.data?.users?.balance_point ??
      res?.data?.users?.balance_point ??
      res?.users?.balance_point ??
      res?.data?.data?.balance_point ??
      res?.data?.balance_point ??
      res?.balance_point ??
      0
    );
  };

  const fetchDraftUserInfo = async ({ shop_type, id }) => {
    if (!shop_type || !id) return null;

    const res = await useServiceAPI.get(paths.pathDraftCampaignUserInfo, {
      platform: "web",
      shop_type,
      id,
      mode: "farmer",
    });

    return res;
  };

  const loadCurrentPoint = async ({ shop_type, id }) => {
    const requestId = currentPointRequestRef.current + 1;
    currentPointRequestRef.current = requestId;

    if (!shop_type || !id) {
      setCurrentPointValue(0);
      return null;
    }

    try {
      const res = await fetchDraftUserInfo({ shop_type, id });

      if (requestId !== currentPointRequestRef.current) {
        return res;
      }

      const balancePoint = getBalancePointFromResponse(res);
      setCurrentPointValue(balancePoint);
      setCurrentValue(res?.data?.data?.value_of_year ?? res?.data?.value_of_year ?? 0);

      return res;
    } catch (_) {
      if (requestId === currentPointRequestRef.current) {
        setCurrentPointValue(0);
      }

      return null;
    }
  };

  const loadProductOptions = async (keyword) => {
    if (!keyword || keyword.trim().length < 3) {
      setProductOptions([]);
      return;
    }

    try {
      const res = await useServiceAPI.get(paths.pathMasterProducts, {
        keyword: keyword.trim(),
        mode: "farmer",
      });

      const list = Array.isArray(res?.data) ? res.data : [];
      setProductOptions(list.map(mapProductSearchOption));
    } catch (_) {
      setProductOptions([]);
    }
  };

  const loadDealers = async (saleId, selectedDealerId, selectedDealerName) => {
    if (!saleId) {
      setDealerOptions([]);
      return;
    }

    try {
      const res = await useServiceAPI.get(paths.pathMasterDealerAssistant, {
        user_id: saleId,
        mode: "farmer",
      });

      const list = Array.isArray(res?.data) ? res.data : [];

      const normalized = list.map((item) =>
        normalizeOption(item, {
          valueKey: "id",
          labelKey: "name",
        })
      );

      setDealerOptions(normalized);

      if (
        selectedDealerId &&
        !normalized.some((item) => String(item.id) === String(selectedDealerId))
      ) {
        const fallback = normalized.find(
          (item) => item.name === selectedDealerName || item.name === detail.dealer_name
        );

        if (fallback) {
          form.setFieldValue("dealer_id", fallback.id);
        }
      }
    } catch (_) {
      setDealerOptions([]);
    }
  };

  const loadSubDealers = async (
    saleId,
    dealerId,
    selectedSubDealerId,
    selectedSubDealerName
  ) => {
    if (!dealerId) {
      setSubDealerOptions([]);
      return;
    }

    try {
      const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
        dealer_id: dealerId,
        mode: "farmer",
      });

      const list = Array.isArray(res?.data) ? res.data : [];

      const normalized = list.map((item) =>
        normalizeOption(item, {
          valueKey: "sub_dealer_id",
          labelKey: "sub_dealer_name",
        })
      );

      setSubDealerOptions(normalized);

      if (
        selectedSubDealerId &&
        !normalized.some((item) => String(item.id) === String(selectedSubDealerId))
      ) {
        const fallback = normalized.find(
          (item) =>
            item.name === selectedSubDealerName ||
            item.name === detail.sub_dealer_name
        );

        if (fallback) {
          form.setFieldValue("sub_dealer_id", fallback.id);
        }
      }
    } catch (_) {
      setSubDealerOptions([]);
    }
  };

  const loadFarmerMaster = async (
    subDealerId,
    selectedFarmerId,
    selectedFarmerName
  ) => {
    const requestId = farmerRequestRef.current + 1;
    farmerRequestRef.current = requestId;

    if (!subDealerId) {
      setFarmerOptions([]);
      return [];
    }

    try {
      const res = await useServiceAPI.get(paths.pathMasterFarmer, {
        sub_dealer_id: subDealerId,
        mode: "farmer",
      });

      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];

      const normalized = list.map((item) => ({
        id: String(item?.farmer_id ?? item?.id ?? ""),
        name:
          String(item?.farmer_name || item?.name || "").trim() ||
          String(item?.farmer_id || item?.id || "-"),
        raw: item,
      }));

      const hasSelectedFarmer =
        selectedFarmerId &&
        normalized.some((item) => String(item.id) === String(selectedFarmerId));

      const finalOptions =
        selectedFarmerId && !hasSelectedFarmer
          ? [
            {
              id: String(selectedFarmerId),
              name: selectedFarmerName || String(selectedFarmerId),
              raw: {},
            },
            ...normalized,
          ]
          : normalized;

      if (requestId === farmerRequestRef.current) {
        setFarmerOptions(finalOptions);
      }

      return finalOptions;
    } catch (_) {
      if (requestId === farmerRequestRef.current) {
        setFarmerOptions([]);
      }

      return [];
    }
  };

  const loadDetail = async () => {
    if (!documentNumber || isCreate) {
      setDetail(emptyDetail);
      setRows([]);
      setFarmerOptions([]);

      form.setFieldsValue({
        document_number: "",
        document_date: dayjs(),
        user_id: undefined,
        dealer_id: undefined,
        sub_dealer_id: undefined,
        farmer_id: undefined,
        current_point: 0,
        target_point: 0,
        diff_form_target: 0,
        current_value: 0,
        target_value: 0,
        diff_value_form_target: 0,
        value_to_point: 0,
        point_your_get: 0,
      });

      return;
    }

    const detailRes = await useServiceAPI.get(paths.pathDraftCampaignDetail, {
      document_number: documentNumber,
      mode: "farmer",
    });

    const draft = getDetailPayload(detailRes);

    const currentPointPayload = draft?.farmer_id
      ? {
        shop_type: "farmer",
        id: draft.farmer_id,
      }
      : draft?.sub_dealer_id
        ? {
          shop_type: "sub_dealer",
          id: draft.sub_dealer_id,
        }
        : draft?.dealer_id
          ? {
            shop_type: "dealer",
            id: draft.dealer_id,
          }
          : null;

    const currentPointRes = currentPointPayload
      ? await fetchDraftUserInfo(currentPointPayload)
      : null;

    const mapped = mapDraftCampaignDetail(
      draft,
      getBalancePointFromResponse(currentPointRes)
    );

    setDetail(mapped);
    const detailItems = Array.isArray(draft?.items) ? draft.items : [];

    setRows(
      detailItems.map((item) =>
        calculateCampaignRow({
          ...item,

          quantity: toNumber(item.quantity),
          xpoint: toNumber(item.xpoint) || 1,

          unit_convert_order_value:
            item.unit_convert_order_value || item.master_price,

          bath_unit:
            item.unit_convert_order_value || item.master_price,

          master_price:
            item.master_price || item.unit_convert_order_value,

          master_point:
            item.master_point || item.point,

          point:
            item.master_point || item.point,
        })
      )
    );

    form.setFieldsValue({
      document_number: mapped.document_number,
      document_date: mapped.document_date ? dayjs(mapped.document_date) : dayjs(),
      user_id: mapped.user_id || undefined,
      dealer_id: mapped.dealer_id || undefined,
      sub_dealer_id: mapped.sub_dealer_id || undefined,
      farmer_id: mapped.farmer_id || undefined,
      current_point: mapped.current_point,
      target_point: mapped.target_point,
      diff_form_target: mapped.diff_form_target,
      current_value: mapped.current_value,
      target_value: mapped.target_value,
      diff_value_form_target: mapped.diff_value_form_target,
      value_to_point: mapped.value_to_point,
      point_your_get: toNumber(mapped.value_to_point) * toNumber(mapped.net_amount),
    });

    await loadDealers(mapped.user_id, mapped.dealer_id, mapped.dealer_name);

    await loadSubDealers(
      mapped.user_id,
      mapped.dealer_id,
      mapped.sub_dealer_id,
      mapped.sub_dealer_name
    );

    await loadFarmerMaster(
      mapped.sub_dealer_id,
      mapped.farmer_id,
      mapped.farmer_name
    );
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);

      try {
        const salesRes = await useServiceAPI.get(paths.pathMasterSaleSingle, { mode: "farmer" });
        const sales = Array.isArray(salesRes?.data) ? salesRes.data : [];

        setSalesOptions(
          sales.map((item) =>
            normalizeOption(item, {
              valueKey: "id",
              labelKey: "name",
            })
          )
        );

        await loadDetail();
      } catch (error) {
        showNotification?.(
          "error",
          error?.response?.data?.message || "Load failed",
          [error?.message || "Unable to load draft campaign"]
        );
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentNumber, isCreate]);

  useEffect(() => {
    if (!watchSaleId) {
      setDealerOptions([]);
      setSubDealerOptions([]);
      setFarmerOptions([]);
      return;
    }

    loadDealers(watchSaleId, form.getFieldValue("dealer_id"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchSaleId]);

  useEffect(() => {
    if (!watchDealerId) {
      setSubDealerOptions([]);
      setFarmerOptions([]);
      return;
    }

    loadSubDealers(
      watchSaleId,
      watchDealerId,
      form.getFieldValue("sub_dealer_id")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchDealerId]);

  useEffect(() => {
    if (!watchSubDealerId) {
      setFarmerOptions([]);
      return;
    }

    loadFarmerMaster(watchSubDealerId, form.getFieldValue("farmer_id"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchSubDealerId]);

  const updateRow = (index, key, value) => {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? calculateCampaignRow({
            ...row,
            [key]: Math.max(0, toNumber(value)),
          })
          : row
      )
    );
  };

  const addSelectedProduct = async (selectedProductId = productSelection) => {
    if (!selectedProductId) return;

    const duplicateProduct = rows.find(
      (item) => String(item.product_id) === String(selectedProductId)
    );

    if (duplicateProduct) {
      showMsg?.("warning", "This product has already been selected.");
      setProductSelection(undefined);
      setProductSearchValue("");
      productSearchRef.current = "";
      setProductOptions([]);
      return;
    }

    try {
      setLoading(true);
      setProductSelection(selectedProductId);

      const res = await useServiceAPI.get(paths.pathMasterProductDetail, {
        product_id: selectedProductId,
        mode: "farmer",
      });
      const productDetail = res?.data || {};

      const product = {
        ...mapDraftCampaignProduct(productDetail),
        unit_convert_order_value:
          productDetail.unit_convert_order_value,
        bath_unit:
          productDetail.bath_unit,
      };

      setRows((prev) => [
        ...prev,
        calculateCampaignRow({
          ...product,
          quantity: 1,
          xpoint: product.xpoint || 1,
        }),
      ]);

      setProductSelection(undefined);
      setProductSearchValue("");
      productSearchRef.current = "";
      setProductOptions([]);
    } catch (error) {
      showNotification?.(
        "error",
        error?.response?.data?.message || "Product not found",
        [error?.message || "Unable to load product detail"]
      );
      setProductSelection(undefined);
    } finally {
      setLoading(false);
    }
  };

  const calculateCampaignRow = (row) => {
    const quantity = toNumber(row.quantity);
    const xpoint = toNumber(row.xpoint) || 1;
    const masterPoint = toNumber(row.master_point || row.point);

    return {
      ...row,
      quantity,
      xpoint,
      master_point: masterPoint,
      point: quantity * masterPoint * xpoint,
    };
  };

  const renderStepperInput = (index, key, value) => (
    <div className="flex items-center justify-center gap-2">
      {!readOnly && (
        <button
          type="button"
          className="text-[#978B87] transition duration-150 ease-out hover:scale-110 hover:text-[#6F625E] active:scale-95"
          onClick={() => updateRow(index, key, toNumber(value) - 1)}
        >
          <MinusCircleOutlined className="text-[22px]" />
        </button>
      )}

      <Input
        value={numberInputFormatter(value)}
        disabled={readOnly}
        onChange={(event) => updateRow(index, key, event.target.value)}
        className="max-w-[90px] text-center"
      />

      {!readOnly && (
        <button
          type="button"
          className="text-[#009845] transition duration-150 ease-out hover:scale-110 hover:text-[#00B050] active:scale-95"
          onClick={() => updateRow(index, key, toNumber(value) + 1)}
        >
          <PlusCircleOutlined className="text-[22px]" />
        </button>
      )}
    </div>
  );

  const getOrderUnitPrice = (row) => {
    const orderValue = toNumber(row.unit_convert_order_value);

    if (orderValue > 0) return orderValue;

    const masterPrice = toNumber(row.master_price);

    if (masterPrice > 0) return masterPrice;

    const bathUnit = toNumber(row.bath_unit);

    if (bathUnit > 0) return bathUnit;

    return 0;
  };

  const totals = useMemo(
    () =>
      rows.reduce(
        (sum, row) => {
          const unitPrice = getOrderUnitPrice(row);
          const qty = toNumber(row.quantity);
          return {
            qty: sum.qty + qty,
            point: sum.point + toNumber(row.point),
            value: sum.value + qty * unitPrice,
          };
        },
        { qty: 0, point: 0, value: 0 }
      ),
    [rows]
  );

  const pointYourGet = useMemo(
    () => toNumber(watchValueToPoint) * toNumber(totals.value),
    [watchValueToPoint, totals.value]
  );

  useEffect(() => {
    form.setFieldsValue({
      diff_form_target:
        toNumber(watchCurrentPoint) - toNumber(watchTargetPoint),
    });
  }, [form, watchCurrentPoint, watchTargetPoint]);

  useEffect(() => {
    if (!isDealerOnly) return;

    form.setFieldsValue({
      diff_value_form_target:
        toNumber(watchCurrentValue) - toNumber(watchTargetValue),
      point_your_get: pointYourGet,
    });
  }, [form, isDealerOnly, pointYourGet, watchCurrentValue, watchTargetValue]);

  const productColumns = [
    {
      title: "No",
      dataIndex: "no",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    { title: "SKU", dataIndex: "product_code", width: 150 },
    { title: "Product Name", dataIndex: "product_name", width: 220 },
    { title: "Unit", dataIndex: "packing_list", width: 140 },

    {
      title: "THB / Unit",
      dataIndex: "unit_convert_order_value",
      width: 140,
      align: "right",
      render: (_, row) => formatNumber(getOrderUnitPrice(row), 2),
    },

    {
      title: "Point / ctn",
      dataIndex: "master_point",
      width: 130,
      align: "right",
      render: (value, row) =>
        formatNumber(toNumber(value || row.point)),
    },

    {
      title: "QTY (ctn)",
      dataIndex: "quantity",
      width: 170,
      align: "center",
      render: (value, _, index) =>
        renderStepperInput(index, "quantity", value),
    },

    {
      title: "xPoint",
      dataIndex: "xpoint",
      width: 170,
      align: "center",
      render: (value, _, index) =>
        renderStepperInput(index, "xpoint", value),
    },

    {
      title: "Point",
      dataIndex: "point",
      width: 130,
      align: "right",
      render: (value) => formatNumber(value),
    },

    {
      title: "Sub Total",
      dataIndex: "net_amount",
      width: 140,
      align: "right",
      render: (_, row) =>
        formatNumber(
          toNumber(row.quantity) * getOrderUnitPrice(row),
          2
        ),
    },

    {
      title: "Action",
      dataIndex: "action",
      width: 90,
      align: "center",
      render: (_, __, index) =>
        !readOnly ? (
          <button
            type="button"
            className="text-[#978B87] transition duration-150 ease-out hover:scale-110 hover:text-[#D4380D] active:scale-95"
            onClick={() =>
              setRows((prev) =>
                prev.filter((_, rowIndex) => rowIndex !== index)
              )
            }
          >
            <DeleteOutlined className="text-[20px]" />
          </button>
        ) : null,
    },
  ];

  const productFooter = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={11} className="text-right pr-4 py-3 text-white">
        Item : {rows.length} | QTY (ctn): {formatNumber(totals.qty)} | Total
        Point : {formatNumber(totals.point)} | Total:{" "}
        {formatNumber(totals.value, 2)}
        {isDealerOnly && (
          <> | Your Reward (Bath) : {formatNumber(pointYourGet, 2)}</>
        )}
      </td>
    </tr>
  );

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete Farmer Draft Campaign?",
      icon: <ExclamationCircleFilled />,
      centered: true,
      onOk: async () => {
        try {
          const res = await useServiceAPI.delete(paths.pathDraftCampaignDelete, {
            document_number: detail.document_number,
            mode: "farmer",
          });

          await showNotification?.(
            res?.status === 200 ? "success" : "warning",
            res?.message || "Notification",
            res?.data?.message_line || [res?.data?.message || "Delete finished"]
          );

          navigate("/setting/line/farmer-draft-campaign");
        } catch (error) {
          await showNotification?.(
            "error",
            error?.response?.data?.message || "Delete failed",
            error?.response?.data?.data?.message_line || [
              error?.message || "Unable to delete draft campaign",
            ]
          );
        }
      },
    });
  };

  const onSave = async () => {
    try {
      const values = await form.validateFields();

      if (!rows.length) {
        showNotification?.("warning", "Validation", [
          "Please add at least one product",
        ]);
        return;
      }

      setLoading(true);

      const payload = {
        ...buildDraftCampaignPayload({
          values: {
            ...values,
            document_date: values.document_date?.format("YYYY-MM-DD"),
          },
          rows,
          documentNumber: isEdit ? detail.document_number : undefined,
        }),
        mode: "farmer",
      };

      const res = isEdit
        ? await useServiceAPI.put(paths.pathDraftCampaignUpdate, payload)
        : await useServiceAPI.post(paths.pathDraftCampaignCreate, payload);

      const lines = res?.data?.message_line || [
        res?.message || "Save successful",
      ];

      await showNotification?.(
        res?.status === 200 ? "success" : "warning",
        res?.message || "Notification",
        lines
      );

      navigate("/setting/line/farmer-draft-campaign");
    } catch (error) {
      if (error?.errorFields) return;

      await showNotification?.(
        "error",
        error?.response?.data?.message || "Save failed",
        error?.response?.data?.data?.message_line || [
          error?.message || "Unable to save draft campaign",
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">{pageTitle}</div>

      <Form form={form} layout="vertical">
        <BoxPrimary>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
            {!isCreate && (
              <Form.Item label="Document No" name="document_number">
                <Input disabled />
              </Form.Item>
            )}

            <Form.Item
              label="Sale"
              name="user_id"
              rules={[{ required: true, message: "Please select sales" }]}
            >
              <Select
                options={salesOptions.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                disabled={readOnly}
                placeholder="Select"
                allowClear
                showSearch
                optionFilterProp="label"
                onChange={() => {
                  form.setFieldValue("dealer_id", undefined);
                  form.setFieldValue("sub_dealer_id", undefined);
                  form.setFieldValue("farmer_id", undefined);

                  setDealerOptions([]);
                  setSubDealerOptions([]);
                  setFarmerOptions([]);

                  resetCurrentPoint();
                }}
              />
            </Form.Item>

            <Form.Item
              label="Dealer"
              name="dealer_id"
              rules={[{ required: true, message: "Please select dealer" }]}
            >
              <Select
                options={dealerOptions.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                disabled={readOnly || !watchSaleId}
                placeholder="Select"
                allowClear
                showSearch
                optionFilterProp="label"
                onChange={(value) => {
                  form.setFieldValue("sub_dealer_id", undefined);
                  form.setFieldValue("farmer_id", undefined);

                  setSubDealerOptions([]);
                  setFarmerOptions([]);

                  loadCurrentPoint({
                    shop_type: "dealer",
                    id: value,
                  });
                }}
              />
            </Form.Item>

            <Form.Item
              label="Sub Dealer"
              name="sub_dealer_id"
            >
              <Select
                options={subDealerOptions.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                disabled={readOnly || !watchDealerId}
                placeholder="Select"
                allowClear
                showSearch
                optionFilterProp="label"
                onChange={(value) => {
                  form.setFieldValue("farmer_id", undefined);
                  setFarmerOptions([]);

                  loadFarmerMaster(value);

                  loadCurrentPoint({
                    shop_type: "sub_dealer",
                    id: value,
                  });
                }}
              />
            </Form.Item>

            <Form.Item
              label="Farmer"
              name="farmer_id"
            >
              <Select
                options={farmerOptions.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                disabled={readOnly || !watchSubDealerId}
                placeholder="Select"
                allowClear
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  String(option?.label || "")
                    .toLowerCase()
                    .includes(String(input || "").toLowerCase())
                }
                onChange={(value) => {
                  loadCurrentPoint({
                    shop_type: "farmer",
                    id: value,
                  });
                }}
              />
            </Form.Item>

            <Form.Item
              label="Draft Date"
              name="document_date"
              rules={[{ required: true, message: "Please select draft date" }]}
            >
              <DatePicker
                className="w-full"
                format="YYYY-MM-DD"
                disabled={readOnly}
              />
            </Form.Item>
          </div>
        </BoxPrimary>

        <BoxPrimary>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item label="Current Point" name="current_point">
              <InputNumber
                className="w-full"
                disabled
                formatter={numberInputFormatter}
                parser={numberInputParser}
              />
            </Form.Item>

            <Form.Item
              label="Target Point"
              name="target_point"
              rules={[{ required: true, message: "Please enter target point" }]}
            >
              <InputNumber
                className="w-full"
                disabled={readOnly}
                min={0}
                formatter={numberInputFormatter}
                parser={numberInputParser}
              />
            </Form.Item>

            <Form.Item label="Diff Form Target" name="diff_form_target">
              <InputNumber
                className="w-full"
                disabled
                formatter={numberInputFormatter}
                parser={numberInputParser}
              />
            </Form.Item>

            {isDealerOnly && (
              <>
                <Form.Item label="Current Value" name="current_value">
                  <InputNumber
                    className="w-full"
                    disabled
                    formatter={numberInputFormatter}
                    parser={numberInputParser}
                  />
                </Form.Item>

                <Form.Item
                  label="Target Value"
                  name="target_value"
                  rules={[
                    { required: true, message: "Please enter target value" },
                  ]}
                >
                  <InputNumber
                    className="w-full"
                    disabled={readOnly}
                    min={0}
                    formatter={numberInputFormatter}
                    parser={numberInputParser}
                  />
                </Form.Item>

                <Form.Item label="Diff Value Form Target" name="diff_value_form_target">
                  <InputNumber
                    className="w-full"
                    disabled
                    formatter={numberInputFormatter}
                    parser={numberInputParser}
                  />
                </Form.Item>

                <Form.Item
                  label="Bath Per Points"
                  name="value_to_point"
                  rules={[
                    { required: true, message: "Please enter value to point" },
                  ]}
                >
                  <InputNumber
                    className="w-full"
                    disabled={readOnly}
                    min={0}
                    step={0.01}
                    formatter={numberInputFormatter}
                    parser={numberInputParser}
                  />
                </Form.Item>

                <Form.Item label="Total Point" name="point_your_get">
                  <InputNumber
                    className="w-full"
                    disabled
                    formatter={numberInputFormatter}
                    parser={numberInputParser}
                  />
                </Form.Item>
              </>
            )}
          </div>
        </BoxPrimary>

        <BoxPrimary title="Product">
          <div className="flex flex-col md:flex-row gap-3">
            <Select
              className="flex-1"
              showSearch
              filterOption={false}
              placeholder="Search product by keyword"
              value={productSelection}
              searchValue={productSearchValue}
              onSearch={(keyword) => {
                productSearchRef.current = keyword;
                setProductSearchValue(keyword);
                loadProductOptions(keyword);
              }}
              onSelect={(value) => addSelectedProduct(value)}
              disabled={readOnly}
              allowClear
              options={productOptions}
              notFoundContent={
                productSearchRef.current?.length >= 3
                  ? null
                  : "Type at least 3 characters"
              }
            />
          </div>
        </BoxPrimary>

        <BoxPrimary title="Product List">
          <TableComponent
            header={productColumns}
            dataSource={rows.map((row, index) => ({
              key: `${row.product_id || row.product_code}-${index}`,
              ...row,
            }))}
            pagination={false}
            footer={productFooter}
            scroll
          />
        </BoxPrimary>

        <div className="flex justify-end gap-4 mt-4">
          <ActionButton
            mode="back"
            text="Back"
            onClick={() => navigate("/setting/line/farmer-draft-campaign")}
          />

          {!isCreate && detail.document_number && (
            <ActionButton
              mode="custom"
              text="Export PDF"
              className="bg-[#F89E18]"
              onClick={() =>
                window.open(
                  `/setting/line/farmer-draft-campaign/pdf?document_number=${encodeURIComponent(
                    detail.document_number
                  )}`,
                  "_blank"
                )
              }
            />
          )}

          {isEdit && !readOnly && (
            <ActionButton mode="delete" text="Delete" onClick={handleDelete} />
          )}

          {!isView && canSubmit && (
            <ActionButton
              mode={isEdit ? "update" : "save"}
              text={isEdit ? "Update" : "Save"}
              onClick={onSave}
            />
          )}
        </div>
      </Form>
    </MainLayout>
  );
}
