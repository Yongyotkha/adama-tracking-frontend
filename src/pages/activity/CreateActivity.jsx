import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Form, Input, Col, Row, Select, InputNumber, Modal } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ActionButton from "../../components/button/ActionButton";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import FormCustom from "../../components/form_custom/FormCustom";
import TableComponent from "../../components/table/TableComponent";
import FileUploadComponent from "../../components/file_upload/FileUploadComponent";
import DynamicButton from "../../components/button/DynamicButton";
import DynamicModal from "../../components/modal/DynamicModal";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { ExclamationCircleFilled, ReloadOutlined } from "@ant-design/icons";
import { AuthContext } from "../../contexts/AuthContext";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;

export default function CreateActivity() {
  const { confirm } = Modal;
  const { TextArea } = Input;

  const navigate = useNavigate();
  const locationParam = useLocation();
  const { mode } = useParams();

  // =========================================================
  // ✅ NEW: รองรับทั้ง state และ query string
  // =========================================================
  const qs = useMemo(() => new URLSearchParams(locationParam.search), [locationParam.search]);

  const documentNumberFromUrl = qs.get("documentNumber") || undefined;
  const pageCodeFromUrl = qs.get("pageCode") || undefined;
  const fromFromUrl = qs.get("from") || undefined;

  const documentNumberState = locationParam?.state?.documentNumber;
  const pageCodeState = locationParam?.state?.pageCode;
  const pageModeState = locationParam?.state?.page_mode;

  const [documentNumber, setDocumentNumber] = useState(documentNumberState || documentNumberFromUrl);
  const [pageMode, setPageMode] = useState(pageModeState);

  // ✅ เดิมเป็น const จาก state อย่างเดียว -> ต้อง fallback จาก URL
  const pageCode = pageCodeState || pageCodeFromUrl;
  console.log("pageCode:", pageCode);
  console.log("pageMode:", pageMode);

  // ✅ flag: เปิดมาจาก mapping?
  const fromMapping = locationParam?.state?.from === "mapping" || fromFromUrl === "mapping";
  // console.log("fromMapping:", fromMapping);
  const forceReadOnly = fromMapping; // ✅ ใช้บังคับ readonly ใน Advance Expense

  const pageModeLower = String(pageMode || "").toLowerCase();
  const isPageView = pageModeLower === "view";
  const isPageEdit = pageModeLower === "edit";
  const isPageCreate = pageModeLower === "create" || !pageModeLower;

  const canEdit = (isPageEdit || isPageCreate) && !forceReadOnly;
  // =========================================================

  const viewSegment = mode === "view";
  const isViewMode = mode === "view";
  const isCreate = mode === "create";
  const isApproveMode = mode === "approve";

  const [loading, setLoading] = useState(false);
  const [firstCallData, setFirstCallData] = useState(true);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);

  const [activityList, setActivityList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [saleAllList, setSaleAllList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [cropList, setCropList] = useState([]);
  const [productCropList, setProductCropList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [participantList, setParticipantList] = useState([]);

  const [formCustom] = Form.useForm();
  const [customerForm] = Form.useForm();
  const [expenseForm] = Form.useForm();
  const [participantForm] = Form.useForm();

  const fileUploadRef = useRef(null);
  const [locationCustomer, setLocationCustomer] = useState([]);
  const [dealerCustomer, setDealerCustomer] = useState([]);
  const [perceptionList, setPerceptionList] = useState([]);
  const [fileList, setFileList] = useState([]);

  const [isBtnExpenseActive, setIsBtnExpenseActive] = useState(false);

  const [activityDetail, setActivityDetail] = useState({
    product_list: [],
    crop_id_list: [],
    expense_product_data_list: [],
    assing_user_list: [],
  });

  const { showNotification, userInfo } = useContext(AuthContext);

  const [actualParticipantCount, setActualParticipantCount] = useState("0");
  const [participants, setParticipants] = useState([]);
  const [participantUsers, setParticipantUsers] = useState([]);

  const toNumber = (v, fallback = 0) => {
    if (v === null || v === undefined || v === "") return fallback;
    if (typeof v === "number") return Number.isFinite(v) ? v : fallback;

    // รองรับ ".00" -> "0.00"
    const s = String(v).trim();
    const normalized = s.startsWith(".") ? `0${s}` : s;

    const n = parseFloat(normalized);
    return Number.isFinite(n) ? n : fallback;
  };

  // ✅ หากเปิดด้วย URL แล้ว state ไม่มา
  useEffect(() => {
    if (!documentNumber && documentNumberFromUrl) {
      setDocumentNumber(documentNumberFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentNumberFromUrl]);

  const handleUploadClick = async () => {
    if (fileUploadRef.current) fileUploadRef.current.triggerUpload();
  };

  const handleUploadSuccess = (response) => {
    const data = response.data;
    const fileUpload = { uid: data.file_key, name: data.file_name, status: "done", url: data.file_url };
    setFileList((prev) => [...prev, fileUpload]);
  };

  let btn_approve = "Approve";
  let btn_reject = "Reject";
  if (userInfo.role_id == 8) {
    btn_approve = "Confirm";
    btn_reject = "Cancel";
  }

  useEffect(() => {
    if (!documentNumber) {
      const exists = saleList.some((item) => item.id === userInfo.id);
      if (exists) {
        handleChange("user_id", userInfo.user_data_id);
        handleChange("assing_user_list", [userInfo.user_data_id]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleList]);

  useEffect(() => {
    if (documentNumber && isBtnExpenseActive && pageCode == "activity_transaction") {
      setupCrop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBtnExpenseActive]);
  console.log(pageCode);

  const menuTitle =
    pageCode == "expense_advance"
      ? "Advance Expense"
      : pageCode == "expense_clearing"
        ? "Clearing Expense"
        : "Activity";

  const menuURL =
    pageCode == "expense_advance"
      ? "/expenses/advance"
      : pageCode == "expense_clearing"
        ? "/expenses/clearing"
        : "/activity/list";

  const SaleOptions = saleList.map((sale) => ({ id: sale.id, name: sale.name, selected: false }));

  // =========================================================
  // ✅ IMPORTANT: disabled ใน field เดิม (เพิ่ม forceReadOnly ได้ถ้าต้อง lock ทั้งหน้า)
  // =========================================================
  const formFields = [
    {
      label: menuTitle + " No",
      name: "document_number",
      type: "text",
      disabled: true,
      required: false,
      col: 24,
      value: activityDetail.document_number ?? "",
      placeholder: "Generate",
    },
    {
      label: "Activity Reference",
      name: "activity_reference",
      type: pageCode !== "activity_transaction" ? (viewSegment ? "hidden" : "search") : "hidden",
      disabled: isViewMode || isApproveMode || (!isCreate && !canEdit),
      required: false,
      col: 24,
      value: "",
    },
    {
      label: "Activity Type",
      name: "activity_type_id",
      type: "select",
      typeMode: "string",
      options: activityList,
      disabled: isViewMode || isApproveMode || (!isCreate && !canEdit),
      required: true,
      col: pageCode != "activity_transaction" ? 8 : 6,
      value: activityDetail.activity_type_id ?? "",
    },
    {
      label: "Sales",
      name: "user_id",
      type: "select",
      typeMode: "number",
      options: SaleOptions,
      disabled: isViewMode || isApproveMode || (!isCreate && !canEdit),
      required: true,
      col: pageCode != "activity_transaction" ? 8 : 6,
      value: activityDetail.user_id != null ? Number(activityDetail.user_id) : undefined,
      moderef: true,
    },
    {
      label: "Shop",
      name: "dealer_id",
      type: "select",
      typeMode: "number",
      options: (() => {
        const currentId = pageCode === "activity_transaction" ? Number(activityDetail.dealer_id) : Number(activityDetail.sub_dealer_id);
        const currentName = pageCode === "activity_transaction" ? activityDetail.dealer_name : activityDetail.sub_dealer_name;
        if (!currentId) return dealerList;
        const exists = dealerList.some((d) => Number(d.id) === currentId);
        return exists ? dealerList : [...dealerList, { id: currentId, name: currentName }];
      })(),
      disabled: isViewMode || isApproveMode || (!isCreate && !canEdit),
      required: true,
      col: pageCode !== "activity_transaction" ? 8 : 6,
      value:
        pageCode === "activity_transaction"
          ? activityDetail.dealer_id != null
            ? Number(activityDetail.dealer_id)
            : undefined
          : activityDetail.sub_dealer_id != null
            ? Number(activityDetail.sub_dealer_id)
            : undefined,
      moderef: true,
    },
    {
      label: "Crop",
      name: "crop_id_list",
      type: "select",
      typeMode: "string",
      mode: "multiple",
      options: cropList,
      disabled: isViewMode || isApproveMode || (!isCreate && !canEdit),
      required: true,
      col: 6,
      value: activityDetail.crop_id_list,
    },
    {
      label: "Product",
      name: "product_list",
      type: "select",
      typeMode: "string",
      mode: "multiple",
      options: productList,
      disabled: isViewMode || isApproveMode || (!isCreate && !canEdit),
      required: true,
      col: pageCode != "activity_transaction" ? 18 : 24,
      value: activityDetail.product_list,
    },
    {
      label: "Date",
      name: "document_date",
      type: "date",
      disabled: isViewMode || isApproveMode || (!isCreate && !canEdit),
      required: true,
      col: pageCode != "activity_transaction" ? 6 : 8,
      value: activityDetail.document_date,
    },
    {
      label: "Location",
      name: "location_address",
      type: "text",
      disabled: isViewMode || isApproveMode || (!isCreate && !canEdit),
      required: false,
      col: 24,
      value: activityDetail.location_address ?? "",
      iconSrc: "/img/icons/location.png",
      iconPosition: "left",
    },
    {
      label: "Description",
      name: "description",
      type: "text-editor",
      disabled: isViewMode || isApproveMode || (!isCreate && !canEdit),
      required: false,
      col: 24,
      placeholder: "Add description",
      value: activityDetail.description ?? "",
    },
    {
      label: "Assign",
      name: "assing_user_list",
      type: "select",
      typeMode: "string",
      mode: "multiple",
      options: saleAllList,
      disabled: isViewMode || isApproveMode || (!isCreate && !canEdit),
      required: false,
      col: 24,
      value: activityDetail.assing_user_list,
    },
  ];

  // =======================
  // Master
  // =======================
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [activityTypeRes, saleRes, saleAllRes, perceptionRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterActivityType, {}),
          useServiceAPI.get(paths.pathMasterSaleDropdown, { mode: "all" }),
          useServiceAPI.get(paths.pathMasterSaleDropdown, { status: "all", mode: "all" }),
          useServiceAPI.get(paths.pathMasterPerception, {}),
        ]);
        setActivityList(activityTypeRes.data);
        setSaleList(saleRes.data);
        setSaleAllList(saleAllRes.data);
        setPerceptionList(perceptionRes.data);
      } finally {
        setLoading(false);
      }
    };
    getMaster();
  }, []);

  // =======================
  // Detail
  // =======================
  useEffect(() => {
    const getDetail = async () => {
      setLoading(true);
      try {
        const [activityDetailRes] = await Promise.all([
          useServiceAPI.get(paths.pathActivityExpenseDetail, {
            document_number: documentNumber,
            page_code: pageCode,
            page_mode: pageMode,
          }),
        ]);

        const d = activityDetailRes.data;


        // ✅ normalize numeric fields
        const normalized = {
          ...d,
          expense_advance: toNumber(d.expense_advance, 0),
          expense_actual: toNumber(d.expense_actual, 0),
          expense_participant_estimate: toNumber(d.expense_participant_estimate, 0),
          expense_particapant_actual: toNumber(d.expense_particapant_actual, 0),

          expense_product_total_estimate_sale: toNumber(d.expense_product_total_estimate_sale, 0),
          expense_product_total_acutal_sale: toNumber(d.expense_product_total_acutal_sale, 0),

          // ที่คุณเอามา map ใส่ expense_actual_exp/expense_actual_sale
          expense_expense_actual_exp: toNumber(d.expense_expense_actual_exp, 0),
          expense_expense_actual_sale: toNumber(d.expense_expense_actual_sale, 0),
          expense_actual_exp: toNumber(d.expense_actual_exp ?? d.expense_expense_actual_exp, 0),
          expense_actual_sale: toNumber(d.expense_actual_sale ?? d.expense_expense_actual_sale, 0),

          // ✅ normalize list rows (สำคัญมากสำหรับ InputNumber ใน table)
          expense_product_data_list: (d.expense_product_data_list || []).map((el, idx) => ({
            key: idx + 1,
            product_name: el.product_name,
            packing_list: el.packing_list,
            estimate_sale_qty: toNumber(el.estimate_sale_qty, 0),
            acutal_sale_qty: toNumber(el.acutal_sale_qty, 0),
            bath_ltkg: toNumber(el.bath_ltkg, 0),
            product_code: el.product_code,
            product_id: el.product_id,
            id: el.id ?? el.product_id,
          })),
        };

        const productListIds = d.product_list.map((p) => p.id);
        const userListIds = d.assing_user_list.map((p) => p.id);
        const cropListIds = d.crop_id_list.map((p) => p.id);

        const expense_product_data_list = d.expense_product_data_list.map((el, key) => ({
          key: key + 1,
          product_name: el.product_name,
          packing_list: el.packing_list,
          estimate_sale_qty: el.estimate_sale_qty,
          acutal_sale_qty: el.acutal_sale_qty,
          bath_ltkg: el.bath_ltkg,
          product_code: el.product_code,
          product_id: el.product_id,
          id: el.id,
        }));

        // participant list
        let participantData = [];
        let count = 0;
        d?.particapant_list?.forEach((el, key) => {
          count++;
          participantData.push({
            no: key + 1,
            id: key + 1,
            key: `sales-${key + 1}`,
            name: el.name,
            address: el.address,
            phone: el.phone,
          });
        });

        // images
        let imageList = [];
        d?.image_list?.forEach((url, key) => {
          const parts = url.split("/");
          imageList.push({ uid: key, name: parts.pop(), status: "done", url });
        });

        setFileList(imageList);
        setParticipants(participantData);
        setIsBtnExpenseActive(normalized.is_expense);

        setActivityDetail((prev) => ({
          ...prev,
          ...normalized,
          crop_id_list: cropListIds,
          product_list: productListIds,
          assing_user_list: userListIds,
        }));

        expenseForm.setFieldsValue({
          advance_expense: normalized.expense_advance,
          actual_expense: normalized.expense_actual,
        });

        participantForm.setFieldsValue({
          estimate_participant: normalized.expense_participant_estimate,
          actual_participant: normalized.expense_particapant_actual,
        });

      } finally {
        setLoading(false);
      }
    };

    if (documentNumber) {
      getDetail();
    } else {
      handleChange("document_date", locationParam?.state?.dateCalendar || dayjs());
      formCustom.setFieldsValue({ document_date: locationParam?.state?.dateCalendar || dayjs() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =======================
  // handleChange
  // =======================
  const handleChange = (attribue, value) => {
    const run = async () => {
      try {
        if (attribue === "user_id") {
          setActivityDetail((prev) => ({ ...prev, user_id: value }));
          await setupDealer(value);
        } else if (attribue === "dealer_id") {
          if (pageCode === "activity_transaction") setActivityDetail((prev) => ({ ...prev, dealer_id: value }));
          else setActivityDetail((prev) => ({ ...prev, sub_dealer_id: value }));
        } else if (attribue === "crop_id_list") {
          setActivityDetail((prev) => ({ ...prev, crop_id_list: value }));
        } else if (attribue === "activity_type_id") {
          setActivityDetail((prev) => ({ ...prev, activity_type_id: value }));
        } else if (attribue === "product_list") {
          setActivityDetail((prev) => ({ ...prev, product_list: value }));
        } else if (attribue === "assing_user_list") {
          setActivityDetail((prev) => ({ ...prev, assing_user_list: value }));
        } else if (attribue === "location_address") {
          setActivityDetail((prev) => ({ ...prev, location_address: value }));
        } else if (attribue === "description") {
          setActivityDetail((prev) => ({ ...prev, description: value }));
        } else if (attribue === "document_date") {
          setActivityDetail((prev) => ({ ...prev, document_date: value }));
        } else if (attribue === "activity_reference") {
          setLoading(true);
          try {
            const response = await useServiceAPI.get(paths.pathActivityDetail, { document_number: value });
            const d = response.data;

            const productListIds = d?.product_list?.map((p) => p.id);
            const userListIds = d.assing_user_list.map((p) => p.id);
            const cropListIds = d.crop_id_list.map((p) => p.id);

            setIsBtnExpenseActive(d.is_expense);
            setActivityDetail((prev) => ({
              ...prev,
              ...d,
              crop_id_list: cropListIds,
              product_list: productListIds,
              assing_user_list: userListIds,
              document_number: "",
            }));
          } finally {
            setLoading(false);
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    run();
  };

  // =======================
  // Crop -> Product
  // =======================
  useEffect(() => {
    if (activityDetail.crop_id_list.length > 0) setupCrop();
    else {
      setActivityDetail((prev) => ({ ...prev, expense_product_data_list: [], product_list: [] }));
      setProductList([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityDetail.crop_id_list]);

  const effectiveDealerId = Number(pageCode === "activity_transaction" ? activityDetail?.dealer_id : activityDetail?.sub_dealer_id);

  useEffect(() => {
    const setupCropAndDealerCustomer = async (subDealerId) => {
      const [cropRes, dealerCustomerRes] = await Promise.all([
        useServiceAPI.get(paths.pathMasterSubDealerCrop, { sub_dealer_id: subDealerId }),
        useServiceAPI.get(paths.pathMasterSubDealerCustomer, { sub_delaer_id: subDealerId }),
      ]);
      setCropList(cropRes.data);
      setDealerCustomer(dealerCustomerRes.data);
    };

    if (effectiveDealerId) setupCropAndDealerCustomer(effectiveDealerId);
  }, [effectiveDealerId]);

  const setupDealer = async (value) => {
    const dealer = await useServiceAPI.get(paths.pathMasterUserGetSubDealer, { user_id: value });
    setDealerList(dealer.data ? dealer.data : []);
  };

  const setupCrop = async () => {
    const productCrop = await useServiceAPI.get(paths.pathMasterProductByCrop, { crop_list: activityDetail.crop_id_list });
    const productListNew = productCrop.data.map((el, key) => ({
      key: key + 1,
      name: `${el.product_name} (${el.packing_list})`,
      id: el.id,
    }));
    setProductList(productListNew);

    if (documentNumber && firstCallData) {
      setFirstCallData(false);
    } else {
      const productCropListNew = productCrop.data.map((el, key) => ({
        key: key + 1,
        product_name: el.product_name,
        packing_list: el.packing_list,
        estimate_sale_qty: "0",
        acutal_sale_qty: "0",
        bath_ltkg: el.bath_ltkg,
        product_code: el.product_code,
        product_id: el.id,
        id: el.id,
      }));
      setActivityDetail((prev) => ({
        ...prev,
        expense_product_data_list: productCropListNew,
        expense_product_total_acutal_sale: 0,
        expense_product_total_estimate_sale: 0,
        expense_expense_actual_exp: 0,
        expense_expense_actual_sale: 0,
        expense_actual_sale: 0,
        expense_actual_exp: 0,
      }));
    }
  };

  function NumberFormatter(number) {
    return number.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  // ✅ เดิมคำนวณ isDisabled สำหรับ clearing
  let isDisabled = false;
  if (pageCode !== "expense_clearing") isDisabled = true;
  else {
    if (mode === "create") isDisabled = false;
    // else isDisabled = !canEdit;
  }

  // =========================================================
  // ✅ Table columns (เพิ่ม forceReadOnly ใน disabled)
  // =========================================================
  const header = [
    { title: "Product Name", dataIndex: "product_name", key: "product_name", align: "left" },
    { title: "Pack Size", dataIndex: "packing_list", key: "packing_list", align: "center" },
    {
      title: "Estimate Sale (Kg/Lt)",
      dataIndex: "estimate_sale_qty",
      key: "estimate_sale_qty",
      align: "center",
      render: (_, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={record.estimate_sale_qty}
          disabled={!canEdit || pageCode === "expense_clearing"}
          onChange={(value) => handleInputChange(value, record.key, "estimate_sale_qty", record.bath_ltkg, record)}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        />
      ),
    },
    {
      title: "Actual Sale (Kg/Lt)",
      dataIndex: "acutal_sale_qty",
      key: "acutal_sale_qty",
      align: "center",
      render: (_, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={record.acutal_sale_qty}
          disabled={!canEdit || pageCode === "expense_advance"}
          onChange={(value) => handleInputChange(value, record.key, "acutal_sale_qty", record.bath_ltkg, record)}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        />
      ),
    },
  ];

  const handleInputChange = (value, key, field, bath_ltkg) => {
    setActivityDetail((prev) => {
      const updatedData = prev.expense_product_data_list.map((item) => {
        if (item.key === key) {
          const numericValue = parseFloat(value) || 0;
          return { ...item, [field]: numericValue, total: numericValue * bath_ltkg };
        }
        return item;
      });

      const sumEstimateTotal = updatedData.reduce((acc, item) => acc + (item.estimate_sale_qty || 0) * item.bath_ltkg, 0);
      const sumActualTotal = updatedData.reduce((acc, item) => acc + (item.acutal_sale_qty || 0) * item.bath_ltkg, 0);

      return {
        ...prev,
        expense_product_data_list: updatedData,
        expense_product_total_estimate_sale: sumEstimateTotal,
        expense_product_total_acutal_sale: sumActualTotal,
        expense_actual_exp: sumEstimateTotal,
        expense_actual_sale: sumActualTotal,
        expense_expense_actual_exp: sumEstimateTotal,
        expense_expense_actual_sale: sumActualTotal,
      };
    });
  };

  const calculateGrandTotal = (field) => {
    const number = productCropList
      .reduce((sum, item) => sum + (item[field] || 0) * item.bath_ltkg, 0)
      .toFixed(2);
    return NumberFormatter(number);
  };

  const footerOrderList = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={2} className="text-left pr-2 text-white">
        Total (THB)
      </td>
      <td colSpan={1} className="text-center">
        <InputNumber
          className="w-full"
          min={0}
          value={activityDetail?.expense_product_total_estimate_sale || 0}
          readOnly
          formatter={(value) =>
            Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </td>
      <td colSpan={1} className="text-center">
        <InputNumber
          className="w-full"
          min={0}
          value={activityDetail?.expense_product_total_acutal_sale || 0}
          readOnly
          formatter={(value) =>
            Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </td>
    </tr>
  );

  const handleInputParticipantChange = (key, field, value) => {
    const updatedParticipants = participants.map((p) => (p.key === key ? { ...p, [field]: value } : p));
    setParticipants(updatedParticipants);
  };

  const participantColumns = [
    { title: "No", dataIndex: "no", key: "no", align: "center" },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (_, record) => (
        <Input
          value={record.name}
          disabled={!canEdit}
          onChange={(e) => handleInputParticipantChange(record.key, "name", e.target.value)}
        />
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      align: "center",
      render: (_, record) => (
        <Input
          value={record.address}
          disabled={!canEdit}
          onChange={(e) => handleInputParticipantChange(record.key, "address", e.target.value)}
        />
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      align: "center",
      render: (_, record) => (
        <Input
          value={record.phone}
          disabled={!canEdit}
          onChange={(e) => handleInputParticipantChange(record.key, "phone", e.target.value)}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <DynamicButton
          iconSrc="/img/icons/delete.png"
          onClick={() => removeParticipant(record.key)}
          disabled={!canEdit}
        />
      ),
    },
  ];

  const getParticipant = async () => {
    const participant = await useServiceAPI.get(paths.pathMasterSaleAll, { page_size: 1, page_length: 1000 });
    let participantData = [];
    setParticipantList([]);
    let count = 0;

    participant.data.data.forEach((el) => {
      const id = el.id;
      const isExisting = participants.some((item) => item.id === id);
      if (!isExisting) {
        count++;
        participantData.push({
          id,
          key: `sales-${el.id}`,
          no: count,
          name: el.name,
          position: el.position_name,
          department: el.department_name,
          territory: el.territory_name,
          permission: el.permission_name,
        });
      }
    });

    setParticipantList((prev) => [...prev, ...participantData]);
  };

  const handleCloseTeamModal = () => setIsTeamModalVisible(false);

  const handleAddSelectedRows = () => {
    const lengthRows = parseInt(actualParticipantCount) + 1;
    setActualParticipantCount(lengthRows);

    setParticipants((prev) => [
      ...prev,
      { address: "", phone: "", no: lengthRows, key: lengthRows },
    ]);
  };

  const removeParticipant = (key) => {
    if (forceReadOnly) return;

    setParticipants((prev) => {
      const updatedList = prev.filter((item) => item.key !== key);
      return updatedList.map((item, index) => ({
        ...item,
        no: index + 1,
        key: index + 1,
      }));
    });
    setActualParticipantCount(participants.length - 1);
  };

  // =======================
  // Save / Approval (เดิม)
  // =======================
  const handleSave = async (modeSave) => {
    try {
      await formCustom.validateFields();

      let allValuesBasic = formCustom.getFieldsValue();
      allValuesBasic.document_date = dayjs(allValuesBasic.document_date)
        .tz("Asia/Bangkok", true)
        .format("YYYY-MM-DD HH:mm:ss.SSS");

      const imageLists = fileList.map((f) => f.url);

      const isExpense = isBtnExpenseActive || pageCode == "expense_advance" || pageCode == "expense_clearing";

      let expenseParticapantUserList = participantUsers.map((x) => x.id);
      let particapantList = participants.map((x) => ({ name: x.name, address: x.address, phone: x.phone }));

      const body = {
        ...activityDetail,
        page_code: pageCode,
        dealer_id: activityDetail.dealer_id,
        action_code: modeSave,
        image_list: imageLists,
        is_expense: isExpense,
        expense_file_list: [],
        expense_particapant_user_list: expenseParticapantUserList,
        particapant_list: particapantList,
        document_date: allValuesBasic.document_date,
      };

      if (documentNumber) {
        useServiceAPI
          .put(paths.pathActivityExpenseDetail, body, setLoading)
          .then((response) => {
            const successCallback = () => {
              if (response.result) {
                if (pageCode == "expense_clearing") navigate("/expenses/clearing");
                else if (pageCode == "expense_advance") {
                  if (modeSave == "convert_clearing") navigate("/expenses/clearing");
                  else navigate("/expenses/advance");
                } else {
                  navigate("/activity/list");
                }
              }
            };
            showNotification("success", response.data.message, response.data.message_line, 2).then(successCallback);
          })
          .catch(() => { });
      } else {
        useServiceAPI
          .post(paths.pathActivityExpenseCreate, body, setLoading)
          .then((response) => {
            const successCallback = () => {
              if (response.result) {
                if (pageCode == "expense_clearing") navigate("/expenses/clearing");
                else if (pageCode == "expense_advance") {
                  if (modeSave == "convert_clearing") navigate("/expenses/clearing");
                  else navigate("/expenses/advance");
                } else {
                  navigate("/activity/list");
                }
              }
            };
            showNotification("success", response.data.message, response.data.message_line, 2).then(successCallback);
          })
          .catch(() => { });
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleApproval = (action) => {
    let remark = "";
    confirm({
      title: `Do you want to ${action} ?`,
      icon: <ExclamationCircleFilled />,
      content: action === "reject" && <TextArea onChange={(e) => (remark = e.target.value)} />,
      centered: true,
      onOk() {
        handleCallApprove(remark, action);
      },
    });
  };

  const handleCallApprove = async (remark, action) => {
    let path = pageCode === "expense_advance" ? paths.pathAdvanceApproval : paths.pathClearingApproval;
    try {
      const result = await useServiceAPI.put(path, {
        document_number: documentNumber,
        page_mode: pageMode,
        remark,
        action_code: action,
      });
      showNotification("success", result.data.Message.Message_Header, result.data.Message.Message_Line, 2).then(() => {
        navigate(-1);
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const adv = toNumber(activityDetail.expense_advance, 0);
  const act = toNumber(activityDetail.expense_actual, 0);

  let return_to_company = 0;
  let return_to_staff = 0;
  if (adv > act) return_to_company = adv - act;
  else return_to_staff = act - adv;

  console.log(activityDetail.expense_advance);

  // =========================================================
  // ✅ Render
  // =========================================================
  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page capitalize">
          {mode} {menuTitle}
        </div>

        {mode !== "view" && pageCode !== "expense_advance" && pageCode !== "expense_clearing" ? (
          !isBtnExpenseActive ? (
            <ActionButton
              mode="create"
              text="Add Advance Expense"
              onClick={() => setIsBtnExpenseActive(!isBtnExpenseActive)}
              disabled={!canEdit}
            />
          ) : (
            <ActionButton
              mode="hide"
              text="Hide Advance Expense"
              onClick={() => setIsBtnExpenseActive(!isBtnExpenseActive)}
              disabled={!canEdit}
            />
          )
        ) : null}

      </div>

      <FormCustom fields={formFields} form={formCustom} onChange={handleChange} mode={documentNumber ? "edit" : "create"} />

      {isBtnExpenseActive || pageCode == "expense_advance" || pageCode == "expense_clearing" ? (
        <>
          <div className="flex items-center justify-between">
            <div className="title-page">Advance Expense</div>
          </div>

          <BoxPrimary title="Sale Plan">
            <TableComponent
              header={header}
              dataSource={activityDetail?.expense_product_data_list}
              pageSize={10}
              footer={activityDetail?.expense_product_data_list?.length > 0 ? footerOrderList : null}
              pagination={10}
            />
          </BoxPrimary>

          <BoxPrimary className="hidden">
            <span className="text-[#00783F] text-lg font-semibold mb-3">Customer</span>
            <Form layout="vertical" form={customerForm} initialValues={{}}>
              <Row gutter={[16, 16]} className="mt-3">
                {/* (คงเดิม) */}
              </Row>
            </Form>
          </BoxPrimary>

          <BoxPrimary title="Expense">
            <Form layout="vertical" form={expenseForm} initialValues={{}}>
              <Row gutter={[16, 16]} className="mt-3">
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Advance expense" name="advance_expense">
                    <InputNumber
                      placeholder="Advance expense"
                      className="w-full"
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      value={toNumber(activityDetail.expense_advance, 0)}
                      onChange={(value) => setActivityDetail({ ...activityDetail, expense_advance: toNumber(value, 0) })}
                      disabled={
                        !canEdit ||
                        mode === "view" ||
                        mode === "approve" ||
                        (mode === "create" && pageCode === "expense_clearing") ||
                        (pageCode === "expense_clearing" && pageCode !== "expense_advance")
                      }
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Actual Expense" name="actual_expense">
                    <InputNumber
                      placeholder="Actual Expense"
                      className="w-full"
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      value={toNumber(activityDetail.expense_actual, 0)}
                      onChange={(value) => setActivityDetail({ ...activityDetail, expense_actual: toNumber(value, 0) })}

                      disabled={
                        !canEdit ||
                        (pageCode != "expense_clearing" || mode === "create"
                          ? pageCode !== "expense_clearing"
                          : !canEdit)
                      }
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Estimate Sale">
                    <InputNumber
                      className="w-full"
                      min={0}
                      placeholder="0"
                      value={toNumber(activityDetail?.expense_actual_exp ?? activityDetail?.expense_product_total_estimate_sale, 0)}
                      disabled
                      formatter={(value) => Number(value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Actual sale">
                    <InputNumber
                      className="w-full"
                      min={0}
                      placeholder="0"
                      value={toNumber(activityDetail?.expense_actual_sale ?? activityDetail?.expense_product_total_acutal_sale, 0)}
                      disabled
                      formatter={(value) => Number(value || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    />
                  </Form.Item>
                </Col>


                {pageCode === "expense_clearing" && (
                  <>
                    <Col xs={24} sm={12} md={12} lg={6}>
                      <Form.Item className="mb-3" label="Return to Company">
                        <InputNumber
                          className="w-full"
                          min={0}
                          placeholder="0"
                          value={return_to_company}
                          disabled={true}
                          formatter={(value) =>
                            Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={6}>
                      <Form.Item className="mb-3" label="Return to Staff">
                        <InputNumber
                          className="w-full"
                          min={0}
                          placeholder="0"
                          value={return_to_staff}
                          disabled={true}
                          formatter={(value) =>
                            Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                        />
                      </Form.Item>
                    </Col>
                  </>
                )}
              </Row>
            </Form>
          </BoxPrimary>

          {pageCode == "expense_clearing" ? (
            <BoxPrimary>
              <div className="flex items-center justify-between">
                <div className="text-[#00783F] text-lg font-semibold mb-3">File</div>
                <ActionButton
                  mode="add"
                  text="Upload File"
                  onClick={handleUploadClick}
                  disabled={!canEdit || (mode === "create" ? false : !canEdit)}
                />
              </div>

              <FileUploadComponent
                ref={fileUploadRef}
                mode={mode === "create" ? false : (canEdit ? "edit" : "view")}
                dataFile={fileList}
                modeUpload={pageCode}
                onUploadSuccess={handleUploadSuccess}
              />
            </BoxPrimary>
          ) : null}

          {/* Participant */}
          <BoxPrimary>
            <div className="flex items-center justify-between">
              <div className="text-[#00783F] text-lg font-semibold mb-3">Participant</div>

              {pageCode === "expense_clearing" && !viewSegment && userInfo.role_id != 2 ? (
                <ActionButton mode="add" text="Add" onClick={handleAddSelectedRows} disabled={isApproveMode || isViewMode} />
              ) : null}
            </div>

            <Form layout="vertical" form={participantForm} initialValues={{}}>
              <Row gutter={[16, 16]} className="mt-3">
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Estimate Participant " name="estimate_participant">
                    <InputNumber
                      className="w-full"
                      min={0}
                      placeholder="0"
                      disabled={
                        !canEdit || mode === "view" ||
                        (pageCode == "expense_clearing"
                          ? true
                          : mode === "create"
                            ? false
                            : !canEdit)
                      }
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      value={toNumber(activityDetail?.expense_participant_estimate, 0)}
                      onChange={(value) => setActivityDetail({ ...activityDetail, expense_participant_estimate: toNumber(value, 0) })}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item className="mb-3" label="Actual Participant" name="actual_participant">
                    <InputNumber
                      className="w-full"
                      min={0}
                      placeholder="0"
                      disabled={!canEdit || mode === "approve" || mode === "view" || pageCode !== "expense_clearing"}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      value={activityDetail?.expense_particapant_actual}
                      onChange={(value) => setActivityDetail({ ...activityDetail, expense_particapant_actual: value })}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {pageCode == "expense_clearing" ? (
                <TableComponent header={participantColumns} dataSource={participants} pagination={false} />
              ) : null}
            </Form>
          </BoxPrimary>
        </>
      ) : null}

      {/* Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        {/* ✅ NEW: ถ้ามาจาก mapping -> Close + ปิดแท็บ */}
        <ActionButton
          mode="back"
          text={fromMapping ? "Close" : "Back"}
          onClick={() => {
            if (fromMapping) {
              window.close();
              return;
            }
            navigate(-1);
          }}
        />

        {activityDetail?.permission?.btn_convert && (
          <ActionButton mode="saveDraft" text="Convert to Clearing" onClick={() => handleSave("convert_clearing")}/>
        )}

        {(activityDetail?.permission?.btn_draft || mode === "create") && (
          <ActionButton mode="saveDraft" text="Draft" onClick={() => handleSave("draft")}/>
        )}

        {(activityDetail?.permission?.btn_save || mode === "create") && mode !== "view" && (
          <ActionButton mode="save" text="Save" onClick={() => handleSave("save")}/>
        )}

        {(activityDetail?.permission?.btn_export || activityDetail?.permission?.btn_pdf) && (
          <ActionButton
            mode="saveDraft"
            text="Export PDF"
            onClick={() => {
              const targetUrl = `/expenses/advance/pdf?document_number=${activityDetail.document_number}&page_code=${pageCode}`;
              window.open(targetUrl, "_blank");
            }}
          />
        )}

        {/* {activityDetail?.permission?.btn_reject && activityDetail?.transaction_status_name !== "Convert" && mode !== "approve" && ( */}
        {activityDetail?.permission?.btn_reject && activityDetail?.transaction_status_name !== "Convert" && (
          <ActionButton mode="reject" text={btn_reject} onClick={() => handleApproval("reject")}/>
        )}

        {/* {activityDetail?.permission?.btn_approved && activityDetail?.transaction_status_name !== "Convert" && mode !== "approve" && ( */}
        {activityDetail?.permission?.btn_approved && activityDetail?.transaction_status_name !== "Convert" && (
          <ActionButton mode="save" text={btn_approve} onClick={() => handleApproval("approved")}/>
        )}
      </div>

      {/* Modal */}
      <DynamicModal
        title="Add Participant"
        isVisible={isTeamModalVisible}
        onClose={handleCloseTeamModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          { title: "Name", dataIndex: "name", key: "name", width: 150 },
          { title: "Territory", dataIndex: "territory", key: "territory", width: 150 },
          { title: "Position", dataIndex: "position", key: "position", width: 150 },
        ]}
        dataSource={participantList}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />
    </MainLayout>
  );
}
