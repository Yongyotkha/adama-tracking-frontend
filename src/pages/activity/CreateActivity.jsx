import React, { useContext, useEffect, useRef, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  Col,
  Row,
  Select,
  InputNumber,
  Modal,
  DatePicker,
  TimePicker,
  Upload,
} from "antd";
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
import ReactQuill from "react-quill-new";

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
  const { MonthPicker } = DatePicker;
  const [isBtnExpenseActive, setIsBtnExpenseActive] = useState(false);
  const [formMulti] = Form.useForm();

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

  const [multiShop, setMultiShop] = useState([
    {
      document_number: "",
      document_date: "",
      dealer_id: "",
      crop_id_list: "",
      product_list: "",
      location_address: "",
      description: "",
      assing_user_list: "",
    },
  ]);

  const isViewMode = mode === "View";

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

  //console.log("multishop : ", multiShop);

  const handleRemoveContact = (index) => {
    setMultiShop((prev) => prev.filter((_, i) => i !== index));
  };

  const toolbarOptions = [
    [{ font: [] }, { size: [] }],
    [{ header: [1, 2, 3, false] }],
    [
      "bold",
      "italic",
      "underline",
      "strike",
      { color: [] },
      { background: [] },
    ],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ];

  const optionsShop = dealerList.map((item) => ({
    value: item.id,
    label: item.name.trim(), // ใช้ trim() เพื่อลบช่องว่างที่ไม่จำเป็น
  }));

  const optionsCropList = cropList.map((item) => ({
    value: item.id,
    label: item.name.trim(), // ใช้ trim() เพื่อลบช่องว่างที่ไม่จำเป็น
  }));

  const optionsSaleAllList = saleAllList.map((item) => ({
    value: item.id,
    label: item.name.trim(), // ใช้ trim() เพื่อลบช่องว่างที่ไม่จำเป็น
  }));

  const optionsProductList = productList.map((item) => ({
    value: item.id,
    label: item.name.trim(), // ใช้ trim() เพื่อลบช่องว่างที่ไม่จำเป็น
  }));

  const optionsActivityType = activityList.map((item) => ({
    value: item.id,
    label: item.name.trim(), // ใช้ trim() เพื่อลบช่องว่างที่ไม่จำเป็น
  }));

  const optionsSale = saleList.map((item) => ({
    value: item.id,
    label: item.name.trim(), // ใช้ trim() เพื่อลบช่องว่างที่ไม่จำเป็น
  }));

  const handleContactChange = (index, field, value) => {
    // console.log("index : ", index);
    // console.log("field : ", field);
    // console.log("value : ", value);
    // console.log("------------------");
    const updateShop = [...multiShop];

    if (field === "date_of_birth") {
      const birthDate = dayjs(value);
      const currentYear = dayjs().year();
      const age = currentYear - birthDate.year(); // คำนวณอายุ
      updateShop[index][field] = value; // อัปเดตวันเกิด
      updateShop[index]["age"] = age; // อัปเดตอายุ
    } else {
      updateShop[index][field] = value; // อัปเดตฟิลด์อื่นๆ
    }

    setMultiShop(updateShop); // อัปเดต state
  };

  const handleChangeDate = (index, field, value) => {
    const update = [...multiShop];
    update[index][field] = value; // อัปเดตฟิลด์อื่นๆ
    setMultiShop(update); // อัปเดต state
  };

  const handleChangeSelect = (index, field, value) => {
    if (field == "dealer_id") {
      setActivityDetail((prevState) => ({
        ...prevState,
        dealer_id: value,
      }));
    } else if (field == "crop_id_list") {
      setActivityDetail((prevState) => ({
        ...prevState,
        crop_id_list: value,
      }));
    } else if (field == "product_list") {
      setActivityDetail((prevState) => ({
        ...prevState,
        product_list: value,
      }));
    }

    const update = [...multiShop];
    update[index][field] = value;
    setMultiShop(update);
  };

  const renderMultiShop = () =>
    multiShop.map((item, index) => (
      //console.log('item : '+index+' > ',item.document_number)
      <div key={index} className="mb-6">
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-md">
            <b>{`Shop ${index + 1}`}</b>
          </span>
          {index > 0 && !isViewMode && (
            <ActionButton
              mode="delete"
              text="Delete"
              onClick={() => handleRemoveContact(index)}
              disabled={isViewMode}
            />
          )}
        </div>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={24} md={24} lg={24}>
            <Form.Item
              className="mb-3"
              label={menuTitle + " No"}
              name={["shops", index, "document_number"]}
            >
              <Input
                disabled="true"
                placeholder="Generate"
                value={item.document_number || ""}
                onChange={(e) =>
                  handleContactChange(index, "document_number", e.target.value)
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6}>
            <Form.Item
              key={index}
              label="Date"
              rules={[{ required: true, message: "กรุณาเลือก Date" }]}
              style={{ marginBottom: 12 }}
              name={["shops", index, "document_date"]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                defaultValue={
                  item.document_date ? dayjs(item.document_date) : null
                }
                onChange={(date) => {
                  const d = new Date(date).toLocaleDateString("fr-FR");
                  handleChangeDate(index, "document_date", d);
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6}>
            <Form.Item
              label="Shop"
              rules={[{ required: true, message: "กรุณาเลือก Shop" }]}
              style={{ marginBottom: 12 }}
              name={["shops", index, "dealer_id"]}
            >
              <Select
                placeholder="Select shop"
                options={optionsShop}
                onChange={handleChangeSelect.bind(null, index, "dealer_id")}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={6} lg={6}>
            <Form.Item
              label="Crop"
              rules={[{ required: true, message: "กรุณาเลือก Crop" }]}
              style={{ marginBottom: 12 }}
              name={["shops", index, "crop_id_list"]}
            >
              <Select
                placeholder="Select shop"
                options={optionsCropList}
                mode="multiple"
                onChange={handleChangeSelect.bind(null, index, "crop_id_list")}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24}>
            <Form.Item
              label="Product"
              rules={[{ required: true, message: "กรุณาเลือก Product" }]}
              style={{ marginBottom: 12 }}
              name={["shops", index, "product_list"]}
            >
              <Select
                placeholder="Select shop"
                options={optionsProductList}
                mode="multiple"
                onChange={handleChangeSelect.bind(null, index, "product_list")}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24}>
            <Form.Item
              className="mb-3"
              label="Location"
              name={["shops", index, "location_address"]}
            >
              <Input
                placeholder="Enter location"
                value={item.location_address || ""}
                onChange={(e) =>
                  handleContactChange(index, "location_address", e.target.value)
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24}>
            <Form.Item
              className="mb-3"
              label="Description"
              name={["shops", index, "description"]}
            >
              <ReactQuill
                theme="snow"
                placeholder="Enter Description"
                modules={{ toolbar: toolbarOptions }}
                onChange={handleChangeSelect.bind(null, index, "description")}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24}>
            <Form.Item
              className="mb-3"
              label="Assign"
              name={["shops", index, "assing_user_list"]}
            >
              <Select
                placeholder="Select Assign"
                options={optionsSaleAllList}
                mode="multiple"
                onChange={handleChangeSelect.bind(
                  null,
                  index,
                  "assing_user_list"
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={24}>
            <hr
              style={{
                border: "1px solid gray",
              }}
            ></hr>
          </Col>
        </Row>
      </div>
    ));

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
      // if (locationParam?.state?.fronCalendar) {
      handleChange(
        "document_date",
        locationParam?.state?.fronCalendar || dayjs()
      );
      formCustom.setFieldsValue({
        document_date: locationParam?.state?.fronCalendar || dayjs(),
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
            console.log("setActivityDetail");
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
      console.log("setActivityDetail");
      setActivityDetail((prevState) => ({
        ...prevState,
        expense_product_data_list: [],
        product_list: [],
      }));
      setProductList([]);
    }
  }, [activityDetail.crop_id_list]);

  useEffect(() => {
    console.log("setupCropAndDealerCustomer");
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
    console.log("load deader");
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
      console.log("setActivityDetail");
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
          disabled={
            pageCode != "expense_clearing"
              ? true
              : mode === "create"
              ? false
              : !activityDetail?.permission?.edit
          }
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
    console.log("setActivityDetail");
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
      // await formCustom.validateFields();

      // let allValuesBasic = formCustom.getFieldsValue();

      await formMulti.validateFields();

      let allValuesBasic = formMulti.getFieldsValue();

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

      const newSave = multiShop.map((item) => ({
        page_code: pageCode,
        action_code: modeSave,
        image_list: imageLists,
        is_expense: isExpense,
        expense_file_list: [],
        expense_particapant_user_list: expenseParticapantUserList,
        particapant_list: particapantList,
        ...activityDetail,
        document_date: item.document_date,
        dealer_id: item.dealer_id,
        crop_id_list: item.crop_id_list,
        product_list: item.product_list,
        location_address: item.location_address,
        description: item.description,
        assing_user_list: item.assing_user_list,
      }));

      //console.log("shops : ", newSave);
      console.log("body save : ", newSave);
      console.log("page code : ", pageCode);

      if (documentNumber) {
      } else {
        const resultStatus = []; // เก็บสถานะแต่ละรอบ
        const allDocNumbers = []; // เก็บเลขเอกสารถ้ามี
        for (const save of newSave) {
          console.log(save);

          try {
            const response = await useServiceAPI.post(
              paths.pathActivityExpenseCreate,
              save,
              setLoading
            );

            // เช็คว่าตอบกลับ success ตามเงื่อนไขที่ต้องการ
            const isSuccess = response.message === "Save successfully";

            console.log("message : ", response.message);
            console.log("message_line : ", response);
            console.log("isSuccess : ", isSuccess);

            resultStatus.push(isSuccess);

            const docNumberLine = response.data.message_line?.find((line) =>
              line.includes("Document Number")
            );
            if (docNumberLine) {
              allDocNumbers.push(docNumberLine);
            }

            console.log("ส่งสำเร็จ:", response);
          } catch (error) {
            console.error("เกิดข้อผิดพลาดในการส่ง:", error);
            resultStatus.push(false); // ล้มเหลว
          }
        }

        const allSuccess = resultStatus.every((s) => s === true);

        console.log("resultStatus : ", resultStatus);
        console.log("allDocNumbers : ", allDocNumbers);
        console.log("allSuccess : ", allSuccess);

        if (allSuccess) {
          showNotification(
            "success",
            "บันทึกข้อมูลสำเร็จทั้งหมด",
            allDocNumbers.join("\n"),
            1
          ).then(() => {
            if (pageCode === "expense_clearing") {
              navigate("/expenses/clearing");
            } else if (pageCode === "expense_advance") {
              navigate("/expenses/advance");
            } else {
              navigate("/activity/list");
            }
          });
        } else {
          showNotification(
            "error",
            "บางรายการบันทึกไม่สำเร็จ",
            "กรุณาตรวจสอบรายการที่ส่งไม่ผ่าน"
          );
        }
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

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page capitalize">
          {mode} {menuTitle}
        </div>
      </div>

      <Form layout="vertical" form={formMulti}>
        <BoxPrimary style={{ marginBottom: "20px" }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={24} md={6} lg={6}>
              <Form.Item
                label="Activity Type"
                name="activity_type_id"
                rules={[
                  { required: true, message: "กรุณาเลือก Activity Type" },
                ]}
                style={{ marginBottom: 12 }}
              >
                <Select
                  placeholder="Select activity type"
                  options={optionsActivityType}
                  onChange={(value) => handleChange("activity_type_id", value)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={6} lg={6}>
              <Form.Item
                label="Sales"
                name="user_id"
                rules={[{ required: true, message: "กรุณาเลือก Sales" }]}
                style={{ marginBottom: 12 }}
              >
                <Select
                  placeholder="Select Sales"
                  options={optionsSale}
                  onChange={(value) => handleChange("user_id", value)}
                />
              </Form.Item>
            </Col>
          </Row>
        </BoxPrimary>
        <BoxPrimary>
          {multiShop.length > 0 ? (
            renderMultiShop()
          ) : (
            <div className="text-gray-500">
              No contact person information available
            </div>
          )}

          <div className="flex justify-center">
            <div style={{ width: "200px" }}>
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#00783F",
                  color: "#fff",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setMultiShop([
                    ...multiShop,
                    {
                      document_number: "",
                      document_date: "",
                      dealer_id: "",
                      crop_id_list: "",
                      product_list: "",
                      location_address: "",
                      description: "",
                      assing_user_list: "",
                    },
                  ]);
                }}
              >
                Add Shop
              </button>
            </div>
          </div>
        </BoxPrimary>
      </Form>

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
                        mode === "create" && pageCode === "expense_clearing"
                          ? true
                          : pageCode !== "expense_clearing"
                          ? false
                          : pageCode === "expense_clearing"
                          ? true
                          : !activityDetail?.permission?.edit
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
        {(activityDetail?.permission?.btn_save || mode === "create") && (
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
            text="Reject"
            onClick={() => {
              handleApproval("reject");
            }}
          />
        )}

        {activityDetail?.permission?.btn_approved && (
          <ActionButton
            mode="save"
            text="Approve"
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
