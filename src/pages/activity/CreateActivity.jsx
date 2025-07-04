import React, { useContext, useEffect, useRef, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate, useParams } from "react-router-dom";
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
import { useLocation } from "react-router-dom";
import { ExclamationCircleFilled, ReloadOutlined } from "@ant-design/icons";
import { AuthContext } from "../../contexts/AuthContext";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;

export default function CreateActivity() {
  const { confirm } = Modal;
  const { TextArea } = Input;

  const locationParam = useLocation();
  useEffect(() => {
    console.log(locationParam);
  }, [locationParam]);

  const { mode } = useParams();
  const [documentNumber, setDocumentNumber] = useState(
    locationParam?.state?.documentNumber
  );
  const [pageMode, setPageMode] = useState(locationParam?.state?.page_mode);
  const pageCode = locationParam?.state?.pageCode;
  const viewSegment = mode === "view";
  const isViewMode = mode === "view";
  const isCreate = mode === "create";
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
  const navigate = useNavigate();

  const [formCustom] = Form.useForm();
  const [customerForm] = Form.useForm();
  const [expenseForm] = Form.useForm();
  const [participantForm] = Form.useForm();
  const fileUploadRef = useRef(null); // Reference for FileUploadComponent
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

  const handleUploadClick = async () => {
    if (fileUploadRef.current) {
      fileUploadRef.current.triggerUpload();
    }
  };

  const handleUploadSuccess = (response) => {
    const data = response.data;
    const fileUpload = {
      uid: data.file_key,
      name: data.file_name,
      status: "done",
      url: data.file_url,
    };

    setFileList((prevFileList) => [...prevFileList, fileUpload]);
  };

  console.log('userInfo : ', userInfo.role_id)

  let btn_approve = 'Approve';

  let btn_reject = 'Reject';

  if (userInfo.role_id == 8) {

    btn_approve = 'Confirm';

    btn_reject = 'Cancel';

  }

  useEffect(() => {
    if (!documentNumber) {
      const exists = saleList.some((item) => item.id === userInfo.id);
      if (exists) {
        handleChange("user_id", userInfo.user_data_id);
        handleChange("assing_user_list", [userInfo.user_data_id]);
      }
    }
  }, [saleList]);

  useEffect(() => {
    if (
      documentNumber &&
      isBtnExpenseActive &&
      pageCode == "activity_transaction"
    ) {
      setupCrop();
    }
  }, [isBtnExpenseActive]);

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



  const SaleOptions = saleList.map((sale) => ({
    id: sale.id,
    name: sale.name,
    selected: false, // default value is false
  }));

  // console.log(SaleOptions);
  // console.log(userInfo);
  // console.log(activityDetail);
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
      type:
        pageCode != "activity_transaction"
          ? viewSegment
            ? "hidden"
            : "search"
          : "hidden",
      disabled: isViewMode || (isCreate ? false : !activityDetail?.permission?.edit),
      // disabled: mode === "create" ? false : !activityDetail?.permission?.edit,
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
      disabled: isViewMode || (isCreate ? false : !activityDetail?.permission?.edit),
      required: true,
      col: pageCode != "activity_transaction" ? 8 : 6,
      value: activityDetail.activity_type_id ?? "",
    },
    {
      label: "Sales",
      name: "user_id",
      type: "select",
      // typeMode: "string",
      // options: saleList,
      options: SaleOptions,
      disabled: isViewMode || (isCreate ? false : !activityDetail?.permission?.edit),
      required: true,
      col: pageCode != "activity_transaction" ? 8 : 6,
      // value: activityDetail.user_id ?? "",
      value: activityDetail.user_id ?? "",
      moderef: true,
    },
    {
      label: "Shop",
      name: "dealer_id",
      type: "select",
      typeMode: "string",
      // options: dealerList,
      options: dealerList.some(
        (dealer) => dealer.id === activityDetail.dealer_id
      )
        ? dealerList
        : activityDetail.dealer_id && activityDetail.dealer_name
          ? [
            ...dealerList,
            {
              id: activityDetail.dealer_id,
              name: activityDetail.dealer_name,
            },
          ]
          : dealerList,
      disabled: isViewMode || (isCreate ? false : !activityDetail?.permission?.edit),
      required: true,
      col: pageCode != "activity_transaction" ? 8 : 6,
      value: activityDetail.dealer_id ?? "",
      moderef: true,
    },
    {
      label: "Crop",
      name: "crop_id_list",
      type: "select",
      typeMode: "string",
      mode: "multiple",
      options: cropList,
      disabled: isViewMode || (isCreate ? false : !activityDetail?.permission?.edit),
      required: true,
      col: 6,
      value: activityDetail.crop_id_list,
      // moderef: true,
    },
    {
      label: "Product",
      name: "product_list",
      type: "select",
      typeMode: "string",
      mode: "multiple",
      options: productList,
      disabled: isViewMode || (isCreate ? false : !activityDetail?.permission?.edit),
      required: true,
      col: pageCode != "activity_transaction" ? 18 : 24,
      value: activityDetail.product_list,
    },
    {
      label: "Date",
      name: "document_date",
      type: "date",
      disabled: isViewMode || (isCreate ? false : !activityDetail?.permission?.edit),
      required: true,
      col: pageCode != "activity_transaction" ? 6 : 8,
      value: activityDetail.document_date,
    },
    {
      label: "Location",
      name: "location_address",
      type: "text",
      disabled: isViewMode || (isCreate ? false : !activityDetail?.permission?.edit),
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
      disabled: isViewMode || (isCreate ? false : !activityDetail?.permission?.edit),
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
      disabled: isViewMode || (isCreate ? false : !activityDetail?.permission?.edit),
      required: false,
      col: 24,
      value: activityDetail.assing_user_list,
    },
  ];

  // Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [activityType, sale, saleAll, perception] = await Promise.all([
          useServiceAPI.get(paths.pathMasterActivityType, {}),
          useServiceAPI.get(paths.pathMasterSaleDropdown, { mode: "all" }),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {
            status: "all",
            mode: "all",
          }),
          useServiceAPI.get(paths.pathMasterPerception, {}),
        ]);
        setActivityList(activityType.data);
        setSaleList(sale.data);

        setSaleAllList(saleAll.data);
        setPerceptionList(perception.data);
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  useEffect(() => {
    const getDetail = async () => {
      setLoading(true);
      try {
        const [activityDetail] = await Promise.all([
          useServiceAPI.get(paths.pathActivityExpenseDetail, {
            document_number: documentNumber,
            page_code: pageCode,
            page_mode: pageMode,
          }),
        ]);

        const activityDetailData = activityDetail.data;

        const productListIds = activityDetailData.product_list.map(
          (product) => product.id
        );
        const userListIds = activityDetailData.assing_user_list.map(
          (product) => product.id
        );
        const cropListIds = activityDetailData.crop_id_list.map(
          (product) => product.id
        );

        const expense_product_data_list =
          activityDetailData.expense_product_data_list.map((element, key) => ({
            key: key + 1,
            product_name: element.product_name,
            packing_list: element.packing_list,
            estimate_sale_qty: element.estimate_sale_qty,
            acutal_sale_qty: element.acutal_sale_qty,
            bath_ltkg: element.bath_ltkg,
            product_code: element.product_code,
            product_id: element.product_id,
            id: element.id,
          }));

        let participantData = [];
        let count = 0;
        activityDetailData?.particapant_list?.forEach((element, key) => {
          count++;
          const newKey = `sales-${key + 1}`;
          participantData.push({
            no: key + 1,
            id: key + 1,
            key: newKey,
            name: element.name,
            address: element.address,
            phone: element.phone,
          });
        });

        let imageList = [];
        activityDetailData?.image_list?.forEach((element, key) => {
          imageList.push({
            uid: key,
            name: getFileNameWithExtension(element),
            status: "done",
            url: element,
          });
        });
        setFileList(imageList);
        setParticipants(participantData);
        setIsBtnExpenseActive(activityDetailData.is_expense);
        setActivityDetail((prevState) => ({
          ...activityDetailData,
          crop_id_list: cropListIds,
          product_list: productListIds,
          assing_user_list: userListIds,
          expense_actual_exp: activityDetailData.expense_expense_actual_exp,
          expense_product_data_list: expense_product_data_list,
        }));
      } finally {
        setLoading(false);
      }
    };
    if (documentNumber) {
      getDetail();
    } else {
      // if (locationParam?.state?.dateCalendar) {
      handleChange(
        "document_date",
        locationParam?.state?.dateCalendar || dayjs()
      );
      formCustom.setFieldsValue({
        document_date: locationParam?.state?.dateCalendar || dayjs(),
      });
      // }
    }
  }, []);

  // Function to extract the full filename
  const getFileNameWithExtension = (url) => {
    const parts = url.split("/");
    return parts.pop(); // Get the last part of the URL
  };

  const handleChange = (attribue, value) => {
    const getMasterSelect = async () => {
      try {
        if (attribue === "user_id") {
          setActivityDetail((prevState) => ({ ...prevState, user_id: value }));
          await setupDealer(value);
        } else if (attribue === "dealer_id") {
          setActivityDetail((prevState) => ({
            ...prevState,
            dealer_id: value,
          }));
        } else if (attribue === "crop_id_list") {
          setActivityDetail((prevState) => ({
            ...prevState,
            crop_id_list: value,
          }));
        } else if (attribue === "activity_type_id") {
          setActivityDetail((prevState) => ({
            ...prevState,
            activity_type_id: value,
          }));
        } else if (attribue === "product_list") {
          setActivityDetail((prevState) => ({
            ...prevState,
            product_list: value,
          }));
        } else if (attribue === "assing_user_list") {
          setActivityDetail((prevState) => ({
            ...prevState,
            assing_user_list: value,
          }));
        } else if (attribue === "location_address") {
          setActivityDetail((prevState) => ({
            ...prevState,
            location_address: value,
          }));
        } else if (attribue === "description") {
          setActivityDetail((prevState) => ({
            ...prevState,
            description: value,
          }));
        } else if (attribue === "document_date") {
          setActivityDetail((prevState) => ({
            ...prevState,
            document_date: value,
          }));
        } else if (attribue === "activity_reference") {
          setLoading(true);

          try {
            const [response] = await Promise.all([
              useServiceAPI.get(paths.pathActivityDetail, {
                document_number: value,
              }),
            ]);
            const activityDetailData = response.data;

            // let productListIds = [];
            const productListIds = activityDetailData?.product_list?.map(
              (product) => product.id
            );
            const userListIds = activityDetailData.assing_user_list.map(
              (product) => product.id
            );
            const cropListIds = activityDetailData.crop_id_list.map(
              (product) => product.id
            );

            setIsBtnExpenseActive(activityDetailData.is_expense);
            setActivityDetail((prevState) => ({
              ...prevState,
              ...activityDetailData,
              crop_id_list: cropListIds,
              product_list: productListIds,
              assing_user_list: userListIds,
              document_number: "",
            }));
          } catch (error) {
            console.log(error);
          } finally {
            setLoading(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    getMasterSelect();
  };

  useEffect(() => {
    if (activityDetail.crop_id_list.length > 0) {
      setupCrop();
    } else {
      setActivityDetail((prevState) => ({
        ...prevState,
        expense_product_data_list: [],
        product_list: [],
      }));
      setProductList([]);
    }
  }, [activityDetail.crop_id_list]);

  useEffect(() => {
    const setupCropAndDealerCustomer = async () => {
      const [crop, dealerCustomerData] = await Promise.all([
        useServiceAPI.get(paths.pathMasterSubDealerCrop, {
          sub_dealer_id: activityDetail.dealer_id,
        }),
        useServiceAPI.get(paths.pathMasterSubDealerCustomer, {
          sub_delaer_id: activityDetail.dealer_id,
        }),
      ]);
      setCropList(crop.data);
      setDealerCustomer(dealerCustomerData.data);
    };

    if (activityDetail.dealer_id) {
      setupCropAndDealerCustomer();
    }
  }, [activityDetail.dealer_id]);

  //handleChangeFunction
  const setupDealer = async (value) => {
    const [dealer] = await Promise.all([
      useServiceAPI.get(paths.pathMasterUserGetSubDealer, {
        user_id: value,
      }),
    ]);

    if (dealer.data) {

      setDealerList(dealer.data);

    } else {
      setDealerList([]);
    }
  };

  const setupCrop = async () => {
    const [productCrop] = await Promise.all([
      useServiceAPI.get(paths.pathMasterProductByCrop, {
        crop_list: activityDetail.crop_id_list,
      }),
    ]);

    let productList = productCrop.data.map((element, key) => ({
      key: key + 1,
      name: `${element.product_name} (${element.packing_list})`,
      id: element.id,
    }));

    setProductList(productList);

    if (documentNumber && firstCallData) {
      setFirstCallData(!firstCallData);
    } else {
      let productCropList = productCrop.data.map((element, key) => ({
        key: key + 1,
        product_name: element.product_name,
        packing_list: element.packing_list,
        estimate_sale_qty: "0",
        acutal_sale_qty: "0",
        bath_ltkg: element.bath_ltkg,
        product_code: element.product_code,
        product_id: element.id,
        id: element.id,
      }));
      setActivityDetail((prevState) => ({
        ...prevState,
        expense_product_data_list: productCropList,
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

  console.log('pageCode : ', pageCode)
  console.log('mode : ', mode)
  console.log('activityDetail : ', activityDetail?.permission?.edit)

  let isDisabled = false;

  if (pageCode !== "expense_clearing") {
    isDisabled = true;
  } else {
    if (mode === "create") {
      isDisabled = false;
    } else {
      if (!activityDetail?.permission?.edit) {
        isDisabled = true;
      } else {
        isDisabled = false;
      }
    }
  }

  const header = [
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      align: "left",
    },
    {
      title: "Pack Size",
      dataIndex: "packing_list",
      key: "packing_list",
      align: "center",
    },
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
          disabled={
            pageCode == "expense_clearing"
              ? true
              : mode === "create"
                ? false
                : !activityDetail?.permission?.edit
          }
          onChange={(value) =>
            handleInputChange(
              value,
              record.key,
              "estimate_sale_qty",
              record.bath_ltkg,
              record
            )
          }
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
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
          disabled={isDisabled}
          onChange={(value) =>
            handleInputChange(
              value,
              record.key,
              "acutal_sale_qty",
              record.bath_ltkg,
              record
            )
          }
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      ),
    },
  ];


  const handleInputChange = (value, key, field, bath_ltkg, record) => {
    console.log(value, key, field, bath_ltkg, record);
    setActivityDetail((prevState) => {
      const updatedData = prevState.expense_product_data_list.map((item) => {
        if (item.key === key) {
          const numericValue = parseFloat(value) || 0;
          const newTotal = numericValue * bath_ltkg;
          return {
            ...item,
            [field]: numericValue,
            total: newTotal,
          };
        }
        return item;
      });

      // Calculate new totals
      const sumEstimateTotal = updatedData.reduce(
        (acc, item) => acc + (item.estimate_sale_qty || 0) * item.bath_ltkg,
        0
      );
      const sumActualTotal = updatedData.reduce(
        (acc, item) => acc + (item.acutal_sale_qty || 0) * item.bath_ltkg,
        0
      );

      return {
        ...prevState,
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
          formatter={
            (value) =>
              Number(value)
                .toFixed(2) // Round to 2 decimal places
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",") // Add thousand separator
          }
        />
      </td>
      <td colSpan={1} className="text-center">
        <InputNumber
          className="w-full"
          min={0}
          value={activityDetail?.expense_product_total_acutal_sale || 0}
          readOnly
          formatter={
            (value) =>
              Number(value)
                .toFixed(2) // Round to 2 decimal places
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",") // Add thousand separator
          }
        />
      </td>
    </tr>
  );

  const handleInputParticipantChange = (key, field, value) => {
    const updatedParticipants = participants.map((participant) =>
      participant.key === key ? { ...participant, [field]: value } : participant
    );
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
          onChange={(e) =>
            handleInputParticipantChange(record.key, "name", e.target.value)
          }
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
          onChange={(e) =>
            handleInputParticipantChange(record.key, "address", e.target.value)
          }
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
          onChange={(e) =>
            handleInputParticipantChange(record.key, "phone", e.target.value)
          }
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
        />
      ),
    },
  ];

  const getParticipant = async () => {
    const [participant] = await Promise.all([
      useServiceAPI.get(paths.pathMasterSaleAll, {
        page_size: 1,
        page_length: 1000,
      }),
    ]);

    let participantData = [];
    setParticipantList([]);
    let count = 0;
    participant.data.data.forEach((element, key) => {
      const id = element.id;
      // ตรวจสอบว่ามี key อยู่ใน participantList แล้วหรือยัง
      const isExisting = participants.some((item) => item.id === id);
      if (!isExisting) {
        count++;
        const newKey = `sales-${element.id}`;
        participantData.push({
          id: element.id,
          key: newKey,
          no: count,
          name: element.name,
          position: element.position_name,
          department: element.department_name,
          territory: element.territory_name,
          permission: element.permission_name,
        });
      }
    });

    // เพิ่มเฉพาะข้อมูลใหม่เข้าไปใน participantList
    setParticipantList((prevList) => [...prevList, ...participantData]);
  };

  const handleCloseTeamModal = () => {
    setIsTeamModalVisible(false);
  };

  const handleAddSelectedRows = () => {
    const lengthRows = parseInt(actualParticipantCount) + 1;
    setActualParticipantCount(lengthRows);

    let dataParticipant = [
      {
        address: "",
        phone: "",
        no: lengthRows,
        key: lengthRows,
      },
    ];
    setParticipants((prevList) => [...prevList, ...dataParticipant]);
  };

  const removeParticipant = (key) => {
    setParticipants((prevList) => {
      const updatedList = prevList.filter((item) => item.key !== key);

      return updatedList.map((item, index) => ({
        ...item,
        no: parseInt(index) + 1, // Reset the 'no' based on the new order
        key: parseInt(index) + 1, // Update key to maintain consistency
      }));
    });
    setActualParticipantCount(participants.length - 1);
  };

  //บันทึกข้อมูล
  const handleSave = async (modeSave) => {
    try {
      await formCustom.validateFields();

      let allValuesBasic = formCustom.getFieldsValue();
      // allValuesBasic.document_date = dayjs(allValuesBasic.document_date).format(
      //   "YYYY-MM-DD"
      // );

      // ✅ Convert `document_date` to Asia/Bangkok timezone and format it
      allValuesBasic.document_date = dayjs(allValuesBasic.document_date)
        .tz("Asia/Bangkok", true) // Convert to +7 timezone
        .format("YYYY-MM-DD HH:mm:ss.SSS"); // Format as required

      //File Upload
      const imageLists = [];
      fileList.forEach((element) => {
        imageLists.push(element.url);
      });
      //เปิด Expense หรือไม่?
      const isExpense =
        isBtnExpenseActive ||
        pageCode == "expense_advance" ||
        pageCode == "expense_clearing";

      let expenseParticapantUserList = [];
      let particapantList = [];
      participantUsers.forEach((element) => {
        expenseParticapantUserList.push(element.id);
      });
      participants.forEach((element) => {
        particapantList.push({
          name: element.name,
          address: element.address,
          phone: element.phone,
        });
      });

      console.log(activityDetail);

      const body = {
        ...activityDetail,
        page_code: pageCode,
        // document_number_referrent:
        //   activityDetail?.document_number_referrent ?? null,
        action_code: modeSave,
        image_list: imageLists,
        is_expense: isExpense,
        // expense_product_total_estimate_sale: expenseProductTotalEstimateSale,
        // expense_product_total_acutal_sale: expenseProductTotalAcutalSale,
        // expense_product_data_list: expenseProductDataList,

        // expense_actual_exp: activityDetail?.expense_actual_exp,
        // expense_actual_sale: activityDetail?.expense_actual_sale,
        // expense_advance: activityDetail?.expense_advance,
        // expense_actual: activityDetail?.expense_actual,
        expense_file_list: [],
        // expense_participant_estimate:
        //   activityDetail?.expense_participant_estimate,
        // expense_particapant_actual: activityDetail?.expense_particapant_actual,
        expense_particapant_user_list: expenseParticapantUserList,
        particapant_list: particapantList,
        document_date: allValuesBasic.document_date, // ✅ Updated timezone +7 format
      };
      console.log(body);
      // return;

      if (documentNumber) {
        useServiceAPI
          .put(paths.pathActivityExpenseDetail, body, setLoading)
          .then((response) => {
            const successCallback = () => {
              if (response.result) {
                if (pageCode == "expense_clearing") {
                  navigate("/expenses/clearing");
                } else if (pageCode == "expense_advance") {
                  if (modeSave == "convert_clearing") {
                    // navigate(`/activity/edit?documentNumber=${encodeURIComponent(row.document_number)}&pageCode=${encodeURIComponent(row.page_code)}`)
                    navigate("/expenses/clearing");
                  } else {
                    navigate("/expenses/advance");
                  }
                } else {
                  navigate("/activity/list");
                }
              }
            };
            showNotification(
              "success",
              response.data.message,
              response.data.message_line,
              2
            ).then(successCallback);
          })
          .catch((error) => { });
      } else {
        useServiceAPI
          .post(paths.pathActivityExpenseCreate, body, setLoading)
          .then((response) => {
            const successCallback = () => {
              if (response.result) {
                if (pageCode == "expense_clearing") {
                  navigate("/expenses/clearing");
                } else if (pageCode == "expense_advance") {
                  if (modeSave == "convert_clearing") {
                    navigate("/expenses/clearing");

                    // navigate(`/activity/edit?documentNumber=${encodeURIComponent(row.document_number)}&pageCode=${encodeURIComponent(row.page_code)}`)
                  } else {
                    navigate("/expenses/advance");
                  }
                } else {
                  navigate("/activity/list");
                }
              }
            };
            showNotification(
              "success",
              response.data.message,
              response.data.message_line,
              2
            ).then(successCallback);
          })
          .catch((error) => { });
      }
    } catch (err) {
      console.error("Error fetching address:", err);
      console.log(activityDetail);
    }
  };

  const handleApproval = (action) => {
    let remark = "";
    confirm({
      title: `Do you want to ${action} ?`,
      icon: <ExclamationCircleFilled />,
      content: action === "reject" && (
        <TextArea onChange={(e) => (remark = e.target.value)} />
      ),
      centered: true,
      onOk() {
        handleCallApprove(remark, action);
      },
    });
  };

  const handleCallApprove = async (remark, action) => {
    let path =
      pageCode === "expense_advance"
        ? paths.pathAdvanceApproval
        : paths.pathClearingApproval;
    try {
      const result = await useServiceAPI.put(path, {
        document_number: documentNumber,
        page_mode: pageMode,
        remark: remark,
        action_code: action,
      });
      showNotification(
        "success",
        result.data.Message.Message_Header,
        result.data.Message.Message_Line,
        2
      ).then(() => {
        navigate(-1);
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  let return_to_company = 0
  let return_to_staff = 0
  if (parseInt(activityDetail.expense_advance) > parseInt(activityDetail.expense_actual)) {
    return_to_company = activityDetail.expense_advance - activityDetail.expense_actual
  } else {
    return_to_staff = activityDetail.expense_actual - activityDetail.expense_advance
  }

  console.log('return to company : ' + return_to_company)
  console.log('return to staff : ' + return_to_staff)
  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page capitalize">
          {mode} {menuTitle}
        </div>
        {pageCode != "expense_advance" && pageCode != "expense_clearing" ? (
          !isBtnExpenseActive ? (
            <ActionButton
              mode="create"
              text="Add Advance Expense"
              onClick={() => setIsBtnExpenseActive(!isBtnExpenseActive)}
            />
          ) : (
            <ActionButton
              mode="hide"
              text="Hide Advance Expense"
              onClick={() => setIsBtnExpenseActive(!isBtnExpenseActive)}
            />
          )
        ) : null}

        {/* <ActionButton mode="hide" text="Add Advance Expense" onClick='' /> */}
      </div>

      <FormCustom
        fields={formFields}
        form={formCustom}
        onChange={handleChange}
        mode={documentNumber ? "edit" : "create"}
      />


      {isBtnExpenseActive ||
        pageCode == "expense_advance" ||
        pageCode == "expense_clearing" ? (
        <>
          <div className="flex items-center justify-between">
            <div className="title-page">Advance Expense</div>
          </div>
          <BoxPrimary title="Sale Plan">
            <TableComponent
              header={header}
              dataSource={activityDetail?.expense_product_data_list}
              pageSize={10}
              footer={
                activityDetail?.expense_product_data_list?.length > 0
                  ? footerOrderList
                  : null
              }
              pagination={false}
            />
          </BoxPrimary>

          <BoxPrimary className="hidden">
            <span className="text-[#00783F] text-lg font-semibold mb-3">
              Customer
            </span>
            <Form
              layout="vertical"
              form={customerForm}
              initialValues={{
                supportCustomerName:
                  activityDetail?.expense_customer_name ??
                  dealerCustomer.customer_name,
                address:
                  activityDetail?.expense_customer_address ??
                  dealerCustomer.customer_address,
                placeOfOwner:
                  activityDetail?.expense_customer_place_of_owner ??
                  dealerCustomer.customer_place_of_owner,
                phoneNumber:
                  activityDetail?.expense_customer_phone_number ??
                  dealerCustomer.customer_phone_number,
                perception:
                  activityDetail?.expense_customer_perception_name ?? "",
                location_customer_address:
                  activityDetail?.expense_customer_location_address ??
                  locationCustomer.address,
                location_customer_latitude:
                  activityDetail?.expense_customer_location_latitude ??
                  locationCustomer.lat,
                location_customer_longitude:
                  activityDetail?.expense_customer_location_longitude ??
                  locationCustomer.long,
              }}
            >
              <Row gutter={[16, 16]} className="mt-3">
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item
                    className="mb-3"
                    label="Support Customer Name"
                    name="supportCustomerName"
                  >
                    <Input
                      disabled={true}
                      placeholder={dealerCustomer.customer_name}
                      value={dealerCustomer.customer_name}
                    />{" "}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item
                    className="mb-3"
                    label="Place of Owner"
                    name="placeOfOwner"
                  >
                    <Input
                      disabled={true}
                      value={dealerCustomer.customer_place_of_owner}
                    />{" "}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item
                    className="mb-3"
                    label="Phone Number"
                    name="phoneNumber"
                  >
                    <Input
                      disabled={true}
                      value={dealerCustomer.customer_phone_number}
                    />{" "}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item
                    className="mb-3"
                    label="Perception"
                    name="perception"
                  >
                    <Select
                      placeholder="Select Perception"
                      disabled={false}
                      allowClear
                      options={perceptionList.map((option) => ({
                        label: option.name,
                        value: String(option.id),
                      }))}
                    />{" "}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24}>
                  <Form.Item className="mb-3" label="Address" name="address">
                    <Input
                      disabled={true}
                      value={dealerCustomer.customer_address}
                    />{" "}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24}>
                  <div>
                    <div style={{ position: "relative" }}>
                      <Form.Item
                        name="location_customer_address"
                        label="Place of GPS"
                      >
                        <Input
                          placeholder="Address"
                          value={locationCustomer.address || ""}
                          key={locationCustomer.address} // เพิ่ม key เพื่อบังคับให้รีเฟรช
                          disabled={true}
                          style={{
                            width: "100%",
                            paddingRight: "50px",
                            paddingLeft: "12px",
                            border: "1px solid #d9d9d9",
                            borderRadius: "4px",
                            padding: "8px 12px",
                            boxSizing: "border-box",
                          }}
                        />{" "}
                      </Form.Item>

                      <div
                        // onClick={handleReload}
                        style={{
                          position: "absolute",
                          top: "76%",
                          right: "10px",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          fontSize: "16px",
                          color: "#d9d9d9",
                        }}
                      >
                        <ReloadOutlined
                          style={{
                            fontSize: "18px",
                            animation: loading
                              ? "spin 1s linear infinite"
                              : "none", // เปิด/ปิดการหมุน
                          }}
                        />
                      </div>

                      <style>{`
                          @keyframes spin {
                            0% {
                              transform: rotate(0deg);
                            }
                            100% {
                              transform: rotate(360deg);
                            }
                          }
                        `}</style>
                    </div>

                    <Form.Item name="location_customer_latitude" hidden>
                      <Input
                        type="hidden"
                        placeholder="Latitude"
                        value={locationCustomer.lat || ""}
                        disabled={true}
                      />{" "}
                    </Form.Item>

                    <Form.Item name="location_customer_longitude" hidden>
                      <Input
                        type="hidden"
                        placeholder="Longitude"
                        value={locationCustomer.long || ""}
                        disabled={true}
                      />{" "}
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Form>
          </BoxPrimary>

          <BoxPrimary title="Expense">
            <Form
              layout="vertical"
              form={expenseForm} // Use the new expenseForm instance here
              initialValues={{
                actual_exp:
                  (calculateGrandTotal("estimateSale") > 0
                    ? calculateGrandTotal("estimateSale")
                    : activityDetail?.expense_expense_actual_exp) ?? "0",
                actual_sale:
                  (calculateGrandTotal("actualSale") > 0
                    ? calculateGrandTotal("actualSale")
                    : activityDetail?.expense_expense_actual_sale) ?? "0",
                advance_expense: activityDetail?.advance_expense ?? "",
              }}
            >
              <Row gutter={[16, 16]} className="mt-3">
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item
                    className="mb-3"
                    label="Advance expense"
                    name="advance_expense"
                  >
                    <InputNumber
                      placeholder="Advance expense"
                      className="w-full"
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      value={activityDetail.expense_advance}
                      onChange={(value) => {
                        setActivityDetail({
                          ...activityDetail,
                          expense_advance: value,
                        });
                      }}
                      disabled={
                        mode === "view" ||
                        (mode === "create" && pageCode === "expense_clearing") ||
                        (pageCode === "expense_clearing" && !activityDetail?.permission?.edit)
                      }
                    />{" "}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item
                    className="mb-3"
                    label="Actual Expense"
                    name="actual_expense"
                  >
                    <InputNumber
                      placeholder="Actual Expense"
                      className="w-full"
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      value={activityDetail.expense_actual}
                      onChange={(value) => {
                        setActivityDetail({
                          ...activityDetail,
                          expense_actual: value,
                        });
                      }}
                      disabled={
                        pageCode != "expense_clearing" || mode === "create"
                          ? pageCode !== "expense_clearing"
                          : !activityDetail?.permission?.edit
                      }
                    />{" "}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item
                    className="mb-3"
                    label="Estimate Sale"
                    name="actual_exp"
                  >
                    <InputNumber
                      className="w-full"
                      min={0}
                      placeholder="0"
                      value={
                        activityDetail?.expense_actual_exp ||
                        activityDetail?.expense_expense_actual_exp ||
                        0
                      }
                      disabled={true}
                      formatter={
                        (value) =>
                          Number(value)
                            .toFixed(2) // Round to 2 decimal places
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",") // Add thousand separator
                      }
                    />{" "}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item
                    className="mb-3"
                    label="Actual sale"
                    name="actual_sale"
                  >
                    <InputNumber
                      className="w-full"
                      min={0}
                      placeholder="0"
                      value={
                        activityDetail?.expense_actual_sale ||
                        activityDetail?.expense_expense_actual_sale ||
                        0
                      }
                      disabled={true}
                      formatter={
                        (value) =>
                          Number(value)
                            .toFixed(2) // Round to 2 decimal places
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",") // Add thousand separator
                      }
                    />{" "}
                  </Form.Item>
                </Col>
                {/* <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item
                    className="mb-3"
                    label="Return to Company"
                  >
                    <InputNumber
                      className="w-full"
                      min={0}
                      placeholder="0"
                      value={return_to_company}
                      disabled={true}
                      formatter={(value) =>
                        Number(value)
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item
                    className="mb-3"
                    label="Return to Staff"
                  >
                    <InputNumber
                      className="w-full"
                      min={0}
                      placeholder="0"
                      value={return_to_staff}
                      disabled={true}
                      formatter={(value) =>
                        Number(value)
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Form.Item>
                </Col> */}

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
                            Number(value)
                              .toFixed(2)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                            Number(value)
                              .toFixed(2)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
            <>
              <BoxPrimary>
                <div className="flex items-center justify-between">
                  <div className="text-[#00783F] text-lg font-semibold mb-3">
                    File
                  </div>
                  <ActionButton
                    mode="add"
                    text="Upload File"
                    onClick={handleUploadClick}
                    disabled={
                      mode === "create"
                        ? false
                        : !activityDetail?.permission?.edit
                    }
                  />
                </div>
                <FileUploadComponent
                  ref={fileUploadRef}
                  mode={
                    mode === "create"
                      ? false
                      : !activityDetail?.permission?.edit
                        ? "view"
                        : "edit"
                  }
                  dataFile={fileList}
                  modeUpload={pageCode}
                  onUploadSuccess={handleUploadSuccess}
                />
              </BoxPrimary>
            </>
          ) : undefined}

          {/* Participant Section */}
          <BoxPrimary>
            <div className="flex items-center justify-between">
              <div className="text-[#00783F] text-lg font-semibold mb-3">
                Participant
              </div>

              {(() => {
                if (pageCode === "expense_clearing") {
                  if (!viewSegment && userInfo.role_id != 2) {
                    return (
                      <ActionButton
                        mode="add"
                        text="Add"
                        onClick={handleAddSelectedRows}
                      />
                    );
                  } else {
                    return null;
                  }
                } else {
                  return null;
                }
              })()}
            </div>

            <Form
              layout="vertical"
              form={participantForm}
              initialValues={{
                estimate_participant:
                  activityDetail?.expense_participant_estimate ?? "0",
                actual_participant:
                  activityDetail?.expense_particapant_actual ??
                  actualParticipantCount ??
                  "0",
              }}
            >
              <Row gutter={[16, 16]} className="mt-3">
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item
                    className="mb-3"
                    label="Estimate Participant "
                    name="estimate_participant"
                  >
                    <InputNumber
                      className="w-full"
                      min={0}
                      placeholder="0"
                      disabled={
                        pageCode == "expense_clearing"
                          ? true
                          : mode === "create"
                            ? false
                            : !activityDetail?.permission?.edit
                      }
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      value={activityDetail?.expense_participant_estimate}
                      onChange={(value) => {
                        setActivityDetail({
                          ...activityDetail,
                          expense_participant_estimate: value,
                        });
                      }}
                    />{" "}
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={6}>
                  <Form.Item
                    className="mb-3"
                    label="Actual Participant"
                    name="actual_participant"
                  >
                    <InputNumber
                      className="w-full"
                      min={0}
                      placeholder="0"
                      disabled={mode === "approve" || mode === "view" || pageCode !== "expense_clearing"}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      value={activityDetail?.expense_particapant_actual}
                      onChange={(value) => {
                        setActivityDetail({
                          ...activityDetail,
                          expense_particapant_actual: value,
                        });
                      }}
                    />{" "}
                  </Form.Item>
                </Col>
              </Row>

              {pageCode == "expense_clearing" ? (
                <>
                  <TableComponent
                    header={participantColumns}
                    dataSource={participants}
                    pagination={false}
                  />
                </>
              ) : (
                <></>
              )}
            </Form>

          </BoxPrimary>
        </>
      ) : null}

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate(-1)}
        />

        {activityDetail?.permission?.btn_convert && (
          <ActionButton
            mode="saveDraft"
            text="Convert to Clearing"
            onClick={() => handleSave("convert_clearing")}
          />
        )}
        {(activityDetail?.permission?.btn_draft || mode === "create") && (
          <ActionButton
            mode="saveDraft"
            text="Draft"
            onClick={() => handleSave("draft")}
          />
        )}

        {(activityDetail?.permission?.btn_save || mode === "create") && mode !== "view" && (
          <ActionButton
            mode="save"
            text="Save"
            onClick={() => handleSave("save")}
          />
        )}

        {activityDetail?.permission?.btn_pdf && (
          <ActionButton
            mode="saveDraft"
            text="Export PDF"
            onClick={() => {
              const targetUrl = `/expenses/advance/pdf?document_number=${activityDetail.document_number}&page_code=${pageCode}`;
              window.open(targetUrl, "_blank"); // เปิดในแท็บใหม่
            }}
          />
        )}

        {activityDetail?.permission?.btn_reject && (
          <ActionButton
            mode="reject"
            text={btn_reject}
            onClick={() => {
              handleApproval("reject");
            }}
          />
        )}

        {activityDetail?.permission?.btn_approved && (
          <ActionButton
            mode="save"
            text={btn_approve}
            onClick={() => {
              handleApproval("approved");
            }}
          />
        )}
      </div>

      {/* Modal for Add Participant */}
      <DynamicModal
        title="Add Participant"
        isVisible={isTeamModalVisible}
        onClose={handleCloseTeamModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          { title: "Name", dataIndex: "name", key: "name", width: 150 },
          {
            title: "Territory",
            dataIndex: "territory",
            key: "territory",
            width: 150,
          },
          {
            title: "Position",
            dataIndex: "position",
            key: "position",
            width: 150,
          },
        ]}
        dataSource={participantList}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />
    </MainLayout>
  );
}
