import React, { useContext, useEffect, useRef, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Form, Input, Col, Row, Select, InputNumber } from "antd";
import dayjs from "dayjs";
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
import { ReloadOutlined } from "@ant-design/icons";
import { convertLegacyProps } from "antd/es/button";
import { AuthContext } from "../../contexts/AuthContext";

dayjs.extend(customParseFormat);

const { Option } = Select;

export default function CreateActivity() {
  const locationParam = useLocation();
  const searchParams = new URLSearchParams(locationParam.search);
  const documentNumber = searchParams.get("documentNumber");
  const pageCode = searchParams.get("pageCode");
  const pathSegments = location.pathname.split("/");
  const viewSegment = pathSegments[2] === "view";

  const [loading, setLoading] = useState(false);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
  const [activityList, setActivityList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [saleAllList, setSaleAllList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [cropList, setCropList] = useState([]);
  const [productCropList, setProductCropList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [timeList, setTimeList] = useState([]);
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

  const [activityDetail, setActivityDetail] = useState([]);
  const [cropDetailList, setCropDetailList] = useState([]);
  const [productDetailList, setProductDetailList] = useState([]);
  const [assignList, setAssignList] = useState([]);
  const [isSalePlanEdit, setIsSalePlanEdit] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const { showNotification, userInfo } = useContext(AuthContext);
  const [actualParticipantCount, setActualParticipantCount] = useState("0");
  const [timeselect, setTimeSelect] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [participantUsers, setParticipantUsers] = useState([]);

  const handleUploadClick = async () => {
    // Call triggerUpload from FileUploadComponent
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

  useEffect(() => {
    const urlDate = searchParams.get("date");

    if (urlDate) {
      setActivityDetail((prevDetail) => ({
        ...prevDetail,
        document_date: urlDate, // Set the date from URL
      }));
      formCustom.setFieldsValue({
        document_date: dayjs(urlDate).format("YYYY-MM-DD"),
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!documentNumber) {
      const exists = saleList.some((item) => item.id === userInfo.id);
      if (exists) {
        console.log(123123);
        handleChange("user_id", userInfo.user_data_id);
        formCustom.setFieldsValue({
          ...formCustom,
          sale: userInfo.user_data_id,
        });
      }
    }
  }, [saleList]);

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
      disabled: viewSegment ?? false,
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
      disabled: viewSegment ?? false,
      required: true,
      col: pageCode != "activity_transaction" ? 8 : 6,
      value: activityDetail.activity_type_id ?? "",
    },
    {
      label: "Sales",
      name: "user_id",
      type: "select",
      // typeMode: "string",
      options: saleList,
      disabled: viewSegment ?? false,
      required: true,
      col: pageCode != "activity_transaction" ? 8 : 6,
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
      disabled: viewSegment ?? false,
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
      disabled: viewSegment ?? false,
      required: true,
      col: 6,
      value: cropDetailList,
      moderef: true,
    },
    {
      label: "Product",
      name: "product_list",
      type: "select",
      typeMode: "string",
      mode: "multiple",
      options: productList,
      disabled: viewSegment ?? false,
      required: true,
      col: pageCode != "activity_transaction" ? 18 : 24,
      value: productDetailList,
    },
    {
      label: "Date",
      name: "document_date",
      type: "date",
      disabled: viewSegment ?? false,
      required: true,
      col: pageCode != "activity_transaction" ? 6 : 8,
      value: activityDetail.document_date ?? dayjs().format("YYYY-MM-DD"),
    },
    {
      label: "Location",
      name: "location_address",
      type: "text",
      disabled: viewSegment ?? false,
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
      disabled: viewSegment ?? false,
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
      disabled: viewSegment ?? false,
      required: false,
      col: 24,
      value: assignList,
    },
  ];

  // Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [activityType, sale, saleAll, time, perception] =
          await Promise.all([
            useServiceAPI.get(paths.pathMasterActivityType, {}),
            useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
            useServiceAPI.get(paths.pathMasterSaleDropdown, {
              status: "all",
            }),
            useServiceAPI.get(paths.pathMasterTime, {}),
            useServiceAPI.get(paths.pathMasterPerception, {}),
          ]);
        setActivityList(activityType.data);
        setSaleList(sale.data);

        setSaleAllList(saleAll.data);
        setTimeList(time.data);
        setPerceptionList(perception.data);
      } finally {
        setLoading(false);
      }
    };

    getMaster();

    //เชคว่าเป็น mode edit หรือป่าว
    if (documentNumber) {
      const getDetail = async () => {
        setLoading(true);
        try {
          const [activityDetail] = await Promise.all([
            useServiceAPI.get(paths.pathActivityExpenseDetail, {
              document_number: documentNumber,
              page_code: pageCode,
            }),
          ]);

          const activityDetailData = activityDetail.data;
          console.log(activityDetailData);

          setIsBtnExpenseActive(activityDetailData.is_expense);
          setActivityDetail(activityDetailData);
          await setupData(activityDetailData);
        } finally {
          setLoading(false);
          setIsSalePlanEdit(true);
        }
      };

      getDetail();
    }
  }, []);

  const setupData = async (activityDetailData) => {
    //set crop list
    console.log(activityDetailData);

    let cropData = [];
    await activityDetailData?.crop_id_list?.forEach((element) => {
      cropData.push(element.id);
    });
    setCropDetailList(cropData);

    //set assign list
    let assignData = [];
    await activityDetailData?.assing_user_list?.forEach((element) => {
      assignData.push(element.id);
    });
    setAssignList(assignData);

    //set images list
    let imageList = [];
    await activityDetailData?.image_list?.forEach((element, key) => {
      imageList.push({
        uid: key,
        name: getFileNameWithExtension(element),
        status: "done",
        url: element,
      });
    });
    setFileList(imageList);

    let productDetails = [];
    await activityDetailData?.product_list?.forEach((element) => {
      // productDetails.push(element.name);
      productDetails.push(element.id);
    });
    setProductDetailList(productDetails);
    console.log(productDetails);

    let participantData = [];
    let count = 0;
    await activityDetailData?.particapant_list?.forEach((element, key) => {
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

    // เพิ่มเฉพาะข้อมูลใหม่เข้าไปใน participantList
    setParticipants(participantData);

    let productCropLists = [];
    let productLists = [];
    await activityDetailData?.expense_product_data_list?.forEach(
      (element, key) => {
        productCropLists.push({
          key: key + 1,
          productName: element.product_name,
          packSize: element.packing_list,
          estimateSale: element.estimate_sale_qty,
          actualSale: element.acutal_sale_qty,
          bath_ltkg: element.bath_ltkg,
          prodectCode: element.product_code,
          productId: element.product_id,
        });
        productLists.push({
          key: key + 1,
          name: element.product_name + " (" + element.packing_list + ")",
          id: element.product_id,
        });
      }
    );
    setProductCropList(productCropLists);
    setProductList(productLists);
  };

  // Function to extract the full filename
  const getFileNameWithExtension = (url) => {
    const parts = url.split("/");
    return parts.pop(); // Get the last part of the URL
  };

  const handleChange = (attribue, value) => {
    console.log(attribue, value);
    const getMasterSelect = async () => {
      try {
        if (attribue === "user_id") {
          activityDetail.user_id = value;
          await setupDealer(value);
        } else if (attribue === "dealer_id") {
          activityDetail.dealer_id = value;
          if (value) {
            await setupCropAndDealerCustomer(value);
          }
        } else if (attribue === "crop_id_list") {
          if (value.length > 0) {
            // ตั้งค่า CropDetailList
            await setupCrop(value);
          }
        } else if (attribue === "activity_type_id") {
          activityDetail.activity_type_id = value;
        } else if (attribue === "product_list") {
          activityDetail.product_list.push(value);
        } else if (attribue === "activity_reference") {
          setLoading(true);

          try {
            const [response] = await Promise.all([
              useServiceAPI.get(paths.pathActivityDetail, {
                document_number: value,
              }),
            ]);
            const activityDetailData = response.data;
            setActivityDetail(activityDetailData);

            // ตั้งค่า Crop list
            let cropData = [];
            await activityDetailData.crop_id_list.forEach((element) => {
              cropData.push(element.id);
            });
            setCropDetailList(cropData);

            // เรียกข้อมูล Dealer และ Crop
            await setupDealer(activityDetailData.user_id);
            await setupCropAndDealerCustomer(activityDetailData.dealer_id);
            await setupCrop(cropData);

            // ตั้งค่า Assign list
            let assignData = [];
            await activityDetailData.assing_user_list.forEach((element) => {
              assignData.push(element.id);
            });
            setAssignList(assignData);
          } catch (error) {
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

  //handleChangeFunction
  const setupDealer = async (value) => {
    const [dealer] = await Promise.all([
      useServiceAPI.get(paths.pathMasterSubDealerAll, {
        user_id: value,
      }),
    ]);
    let subDealerAll = [];
    await dealer.data.forEach((element) => {
      subDealerAll.push({
        id: element.sub_dealer_id,
        name: element.sub_dealer_name,
      });
    });

    if (subDealerAll && value) {
      setDealerList(subDealerAll);
    } else {
      setDealerList([]);
    }
  };

  const setupCropAndDealerCustomer = async (value) => {
    const [crop, dealerCustomerData] = await Promise.all([
      useServiceAPI.get(paths.pathMasterSubDealerCrop, {
        sub_dealer_id: value,
      }),
      useServiceAPI.get(paths.pathMasterSubDealerCustomer, {
        sub_delaer_id: value,
      }),
    ]);
    setCropList(crop.data);
    setDealerCustomer(dealerCustomerData.data);
  };

  const setupCrop = async (value) => {
    setCropDetailList(value);
    const [productCrop] = await Promise.all([
      useServiceAPI.get(paths.pathMasterProductByCrop, {
        crop_list: value,
      }),
    ]);

    let productCropList = [];
    let productList = [];
    productCrop.data.forEach((element, key) => {
      productCropList.push({
        key: key + 1,
        productName: element.product_name,
        packSize: element.packing_list,
        estimateSale: "0",
        actualSale: "0",
        bath_ltkg: element.bath_ltkg,
        prodectCode: element.product_code,
        productId: element.id,
      });
      productList.push({
        key: key + 1,
        name: `${element.product_name} (${element.packing_list})`,
        id: element.id,
      });
    });
    setProductCropList(productCropList);
    setProductList(productList);
  };

  function NumberFormatter(number) {
    return number.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  const header = [
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      align: "left",
    },
    {
      title: "Pack Size",
      dataIndex: "packSize",
      key: "packSize",
      align: "center",
    },
    {
      title: "Estimate Sale (Kg/Lt)",
      dataIndex: "estimateSale",
      key: "estimateSale",
      align: "center",
      render: (_, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={record.estimateSale}
          disabled={
            pageCode == "expense_clearing" ? true : viewSegment ?? false
          }
          onChange={(value) =>
            handleInputChange(
              value,
              record.key,
              "estimateSale",
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
      dataIndex: "actualSale",
      key: "actualSale",
      align: "center",
      render: (_, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={record.actualSale}
          disabled={
            pageCode != "expense_clearing" ? true : viewSegment ?? false
          }
          onChange={(value) =>
            handleInputChange(
              value,
              record.key,
              "actualSale",
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
    const updatedData = productCropList.map((item) => {
      if (item.key === key) {
        const numericValue = parseFloat(value) || 0;
        const newTotal = numericValue * bath_ltkg;
        return { ...item, [field]: numericValue, total: newTotal };
      }
      return item;
    });

    record.field = value;

    const sumTotal = updatedData.reduce(
      (acc, item) => acc + (item.total || 0),
      0
    );

    if (field === "estimateSale") {
      setActivityDetail({
        ...activityDetail,
        expense_product_total_estimate_sale: sumTotal,
        expense_actual_exp: sumTotal,
      });
    } else {
      setActivityDetail({
        ...activityDetail,
        expense_product_total_acutal_sale: sumTotal,
        expense_actual_sale: sumTotal,
      });
    }

    console.log(productCropList, "ProductCropList");

    setProductCropList(updatedData);
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
          value={activityDetail?.expense_product_total_estimate_sale}
          readOnly
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </td>
      <td colSpan={1} className="text-center">
        <InputNumber
          className="w-full"
          min={0}
          value={activityDetail?.expense_product_total_acutal_sale}
          readOnly
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
    setTableLoading(true);
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
      // Filter out the removed participant
      const updatedList = prevList.filter((item) => item.key !== key);

      // Reassign 'no' to ensure the indices are sequential
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
      allValuesBasic.document_date = dayjs(allValuesBasic.document_date).format(
        "YYYY-MM-DD"
      );

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

      //ส่วนของ Sale Plan
      const expenseProductTotalEstimateSale =
        calculateGrandTotal("estimateSale");
      const expenseProductTotalAcutalSale = calculateGrandTotal("actualSale");
      let expenseProductDataList = [];
      productCropList.forEach((element) => {
        expenseProductDataList.push({
          product_id: element.productId,
          product_code: element.prodectCode,
          product_name: element.productName,
          packing_list: element.packSize,
          bath_ltkg: element.bath_ltkg,
          estimate_sale_qty: element.estimateSale,
          acutal_sale_qty: element.actualSale,
        });
      });

      //ส่วนของ Customer
      const expenseCustomerDealerId = dealerCustomer.dealer_id;
      const expenseCustomerDealerCode = dealerCustomer.dealer_code;
      const expenseCustomerName = dealerCustomer.customer_name;
      const expenseCustomerPlaceOfOwner =
        dealerCustomer.customer_place_of_owner;
      const expenseCustomerPhoneNumber = dealerCustomer.customer_phone_number;
      const expenseCustomerAddress = dealerCustomer.customer_address;
      const expenseCustomerPerceptionId =
        customerForm.getFieldValue("perception") == "Good"
          ? 1
          : customerForm.getFieldValue("perception");
      let expenseCustomerPerceptionName = perceptionList.find(
        (option) => option.id === expenseCustomerPerceptionId
      );
      expenseCustomerPerceptionName = expenseCustomerPerceptionName
        ? expenseCustomerPerceptionName.name
        : "Good";
      const expenseCustomerLocationLongitude = customerForm.getFieldValue(
        "location_customer_longitude"
      );
      const expenseCustomerLocationLatitude = customerForm.getFieldValue(
        "location_customer_latitude"
      );
      const expenseCustomerLocationAddress = customerForm.getFieldValue(
        "location_customer_address"
      );
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
      // console.log(advance_expense);
      const body = {
        page_code: pageCode,
        document_number_referrent:
          activityDetail?.document_number_referrent ?? null,
        action_code: modeSave,
        ...allValuesBasic,
        image_list: imageLists,
        is_expense: isExpense,
        expense_product_total_estimate_sale: expenseProductTotalEstimateSale,
        expense_product_total_acutal_sale: expenseProductTotalAcutalSale,
        expense_product_data_list: expenseProductDataList,
        expense_customer_dealer_id: expenseCustomerDealerId,
        expense_customer_dealer_code: expenseCustomerDealerCode,
        expense_customer_name: expenseCustomerName,
        expense_customer_place_of_owner: expenseCustomerPlaceOfOwner,
        expense_customer_phone_number: expenseCustomerPhoneNumber,
        expense_customer_address: expenseCustomerAddress,
        expense_customer_perception_id: expenseCustomerPerceptionId,
        expense_customer_perception_name: expenseCustomerPerceptionName,
        expense_customer_location_longitude: expenseCustomerLocationLongitude,
        expense_customer_location_latitude: expenseCustomerLocationLatitude,
        expense_customer_location_address: expenseCustomerLocationAddress,
        expense_actual_exp: activityDetail?.expense_actual_exp,
        expense_actual_sale: activityDetail?.expense_actual_sale,
        expense_advance: activityDetail?.expense_advance,
        expense_actual: activityDetail?.expense_actual,
        expense_file_list: [],
        expense_participant_estimate:
          activityDetail?.expense_participant_estimate,
        expense_particapant_actual: activityDetail?.expense_particapant_actual,
        expense_particapant_user_list: expenseParticapantUserList,
        particapant_list: particapantList,
      };
      console.log(body);
      return;
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
          .catch((error) => {});
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
          .catch((error) => {});
      }
    } catch (err) {
      console.error("Error fetching address:", err);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">
          {documentNumber
            ? "Edit" + " " + menuTitle
            : "Create" + " " + menuTitle}
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
              dataSource={productCropList}
              pageSize={10}
              footer={productCropList.length > 0 ? footerOrderList : null}
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
                      disabled={pageCode == "expense_clearing"}
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
                      disabled={pageCode != "expense_clearing"}
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
                      value={activityDetail?.expense_actual_exp || 0}
                      disabled={true}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                      value={activityDetail?.expense_actual_sale || 0}
                      disabled={true}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />{" "}
                  </Form.Item>
                </Col>
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
                  {viewSegment ? null : (
                    <ActionButton
                      mode="add"
                      text="Upload File"
                      onClick={handleUploadClick}
                    />
                  )}
                </div>
                <FileUploadComponent
                  ref={fileUploadRef}
                  mode={viewSegment ? "view" : "edit"}
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
              {pageCode == "expense_clearing" ? (
                viewSegment ? null : (
                  <ActionButton
                    mode="add"
                    text="Add"
                    onClick={handleAddSelectedRows}
                  />
                )
              ) : undefined}
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
                        pageCode == "expense_clearing" ? true : viewSegment
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
                      disabled={pageCode != "expense_clearing"}
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
          onClick={() => navigate(menuURL)}
        />
        {viewSegment ? null : pageCode == "expense_advance" ? (
          <ActionButton
            mode="saveDraft"
            text="Convert to Clearing"
            onClick={() => handleSave("convert_clearing")}
          />
        ) : null}
        {viewSegment ? null : (
          <ActionButton
            mode="save"
            text="Save"
            onClick={() => handleSave("save")}
          />
        )}
        <ActionButton
          mode="saveDraft"
          text="Export PDF"
          className={
            pageCode === "expense_advance" || pageCode === "expense_clearing"
              ? ""
              : "hidden"
          }
          onClick={() => {
            const targetUrl = "/expenses/advance/pdf";
            navigate(targetUrl, {
              state: {
                // year_code: 1111,
                // month_code: 1111,
                // user_id: 111,
                document_number: activityDetail.document_number,
                page_code: pageCode,
              },
            });
          }}
        />
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
