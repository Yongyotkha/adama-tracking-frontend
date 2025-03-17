import React, { useContext, useEffect, useRef, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Form, Select } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ActionButton from "../../components/button/ActionButton";
import FormCustom from "../../components/form_custom/FormCustom";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;

export default function CreateActivityManyShop() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [activityList, setActivityList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [saleAllList, setSaleAllList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [cropList, setCropList] = useState([]);
  const [productList, setProductList] = useState([]);

  const [formCustom] = Form.useForm();

  const [activityDetail, setActivityDetail] = useState({
    product_list: [],
    crop_id_list: [],
    expense_product_data_list: [],
    assing_user_list: [],
  });
  const { showNotification, userInfo } = useContext(AuthContext);

  const formFields = [
    {
      label: "Activity No",
      name: "document_number",
      type: "text",
      disabled: true,
      required: false,
      col: 24,
      value: activityDetail.document_number ?? "",
      placeholder: "Generate",
    },
    {
      label: "Activity Type",
      name: "activity_type_id",
      type: "select",
      typeMode: "string",
      options: activityList,
      disabled: false,
      required: true,
      col: 8,
      value: activityDetail.activity_type_id ?? "",
    },
    {
      label: "Sales",
      name: "user_id",
      type: "select",
      // typeMode: "string",
      options: saleList,
      disabled: false,
      required: true,
      col: 8,
      value: activityDetail.user_id ?? "",
      moderef: true,
    },
    {
      label: "Shop",
      name: "dealer_id",
      type: "select",
      typeMode: "string",
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
      disabled: false,
      required: true,
      col: 6,
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
      disabled: false,
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
      disabled: false,
      required: true,
      col: 24,
      value: activityDetail.product_list,
    },
    {
      label: "Date",
      name: "document_date",
      type: "date",
      disabled: false,
      required: true,
      col: 8,
      value: activityDetail.document_date,
    },
    {
      label: "Location",
      name: "location_address",
      type: "text",
      disabled: false,
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
      disabled: false,
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
      disabled: false,
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

  const handleChange = (attribue, value) => {
    console.log(attribue, value);
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

  const handleSave = async (modeSave) => {
    try {
      await formCustom.validateFields();

      let allValuesBasic = formCustom.getFieldsValue();
      // allValuesBasic.document_date = dayjs(allValuesBasic.document_date).format(
      //   "YYYY-MM-DD"
      // );

      allValuesBasic.document_date = dayjs(allValuesBasic.document_date)
        .tz("Asia/Bangkok", true) // Convert to +7 timezone
        .format("YYYY-MM-DD HH:mm:ss.SSS"); // Format as required

      const imageLists = [];
      fileList.forEach((element) => {
        imageLists.push(element.url);
      });

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
        document_date: allValuesBasic.document_date, // ✅ Updated timezone +7 format
      };
      console.log(body);

      useServiceAPI
        .post(paths.pathActivityExpenseCreate, body, setLoading)
        .then((response) => {
          const successCallback = () => {
            if (response.result) {
              navigate("/activity/list");
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
    } catch (err) {
      console.error("Error fetching address:", err);
      console.log(activityDetail);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page capitalize">Create Activity</div>
      </div>
      <FormCustom
        fields={formFields}
        form={formCustom}
        onChange={handleChange}
        // mode={documentNumber ? "edit" : "create"}
      />

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />

        <ActionButton
          mode="save"
          text="Save"
          onClick={() => handleSave("save")}
        />
      </div>
    </MainLayout>
  );
}
