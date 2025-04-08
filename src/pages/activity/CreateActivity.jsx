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

  const [loading, setLoading] = useState(false);
  const [firstCallData, setFirstCallData] = useState(true);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
  const [activityList, setActivityList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [saleAllList, setSaleAllList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [cropList, setCropList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [participantList, setParticipantList] = useState([]);
  const [contactItems, setContactItems] = useState([
    {
      name: "",
      phone: "",
      email: "",
      position: "",
    },
  ]);

  const renderContactItems = () =>
    contactItems.map((contact, index) => (
      <FormCustom
        fields={formFields}
        form={formCustom}
        onChange={handleChange}
        mode={documentNumber ? "edit" : "create"}
      />

    )
  );

  const navigate = useNavigate();

  const [formCustom] = Form.useForm();

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
      disabled: mode === "create" ? false : !activityDetail?.permission?.edit,
      required: false,
      col: 24,
      value: "",
    },
    {
      label: "Date",
      name: "document_date",
      type: "date",
      disabled: mode === "create" ? false : !activityDetail?.permission?.edit,
      required: true,
      col: pageCode != "activity_transaction" ? 6 : 8,
      value: activityDetail.document_date,
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
      disabled: mode === "create" ? false : !activityDetail?.permission?.edit,
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
      disabled: mode === "create" ? false : !activityDetail?.permission?.edit,
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
      disabled: mode === "create" ? false : !activityDetail?.permission?.edit,
      required: true,
      col: pageCode != "activity_transaction" ? 18 : 24,
      value: activityDetail.product_list,
    },
    {
      label: "Location",
      name: "location_address",
      type: "text",
      disabled: mode === "create" ? false : !activityDetail?.permission?.edit,
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
      disabled: mode === "create" ? false : !activityDetail?.permission?.edit,
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
      disabled: mode === "create" ? false : !activityDetail?.permission?.edit,
      required: false,
      col: 24,
      value: activityDetail.assing_user_list,
    },
  ];

  const formFields2 = [
    {
      label: "Activity Type",
      name: "activity_type_id",
      type: "select",
      typeMode: "string",
      options: activityList,
      disabled: mode === "create" ? false : !activityDetail?.permission?.edit,
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
      disabled: mode === "create" ? false : !activityDetail?.permission?.edit,
      required: true,
      col: pageCode != "activity_transaction" ? 8 : 6,
      value: activityDetail.user_id ?? "",
      moderef: true,
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

  //บันทึกข้อมูล
  const handleSave = async (modeSave) => {
    try {
      await formCustom.validateFields();

      let allValuesBasic = formCustom.getFieldsValue();
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
        action_code: modeSave,
        image_list: imageLists,
        is_expense: isExpense,
        expense_file_list: [],
        expense_particapant_user_list: expenseParticapantUserList,
        particapant_list: particapantList,
        document_date: allValuesBasic.document_date, // ✅ Updated timezone +7 format
      };
      console.log('body save : ',body);
      exit();

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

      <FormCustom
        fields={formFields2}
        form={formCustom}
        onChange={handleChange}
        mode={documentNumber ? "edit" : "create"}
      />

      {contactItems.length > 0 ? (
        renderContactItems()
      ) : (
        <div className="text-gray-500">
          No contact person information available
        </div>
      )}

      <ActionButton
        mode="add"
        text="Add Shop"
        onClick={() => {
          setContactItems([
            ...contactItems,
            {
              name: "",
              phone: "",
              email: "",
              position: "",
            },
          ]);
        }}
      />

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
