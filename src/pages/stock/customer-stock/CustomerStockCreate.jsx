import React, { useState, useEffect, useRef, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormCustom from "../../../components/form_custom/FormCustom";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Form, Input, InputNumber, Select } from "antd";
import TableComponent from "../../../components/table/TableComponent";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import formatNumber from "../../../utils/number";
import { AuthContext } from "../../../contexts/AuthContext";
import FileUploadComponent from "../../../components/file_upload/FileUploadComponent";

dayjs.extend(customParseFormat);

export default function CustomerStockCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg, showNotification, userInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [searchProductData, setSearchProductData] = useState([]);
  const [formCustom] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const fileUploadRef = useRef(null); // Reference for FileUploadComponent
  const [inputRemark, setInputRemark] = useState("");
  const [totalValue, setTotalValue] = useState(0);

  const [subDealerDisabled, setSubDealerDisabled] = useState(true);

  const [dealers, setDalers] = useState([]);
  const [dealerId, setDealerId] = useState("");

  const [subDealers, setSubDalers] = useState([]);
  const [subDealerId, setSubDalersId] = useState("");

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [dealer] = await Promise.all([
          useServiceAPI.get(paths.pathMasterDealerAll),
        ]);

        setDalers(dealer.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  const formFields = [
    {
      label: "Dealer",
      name: "dealer",
      type: "select",
      options: dealers,
      disabled: false,
      required: true,
      moderef: true,
      value: dealerId,
      // value: dataSaleId,
    },
    {
      label: "Sub Dealer",
      name: "sub_dealer",
      type: "select",
      options: subDealers,
      disabled: subDealerDisabled,
      required: false,
      moderef: true,
      value: subDealerId,
    },
    {
      label: "Date",
      name: "order_date",
      type: "date",
      disabled: true,
      required: false,
      moderef: false,
      value: dayjs().format("YYYY-MM-DD"),
    },
  ];

  const handleChange = (filter, value) => {
    console.log("filter", filter, "value", value);
    if (filter == "dealer") {
      setDealerId(value);
    } else if (filter == "sub_dealer") {
      setSubDalersId(value);
    }
  };

  useEffect(() => {
    console.log("use effect dealerId : ", dealerId);
    if (dealerId) {
      getMasterSubDealer();
    }
  }, [dealerId]);

  const getMasterSubDealer = async () => {
    // setLoading(true);

    try {
      const response = await useServiceAPI.get(
        `${paths.pathCustomerDealerDetail}?id=${value}`
      );
      console.log("pathCustomerDealerDetail : ", response);

      //setSubDalers(dealer.data);
    } catch (error) {
      // showMsg("error", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getMasterSubDealer = async () => {
      try {
        const response = await useServiceAPI.get(
          `${paths.pathCustomerDealerDetail}?id=${dealerId}`
        );
        console.log("useEffect getMasterSubDealer : ", response);
        setSubDealerDisabled(false);
        if (response.status === 200) {
          const sub_dealer = response.data.network_list;
          const newSubDealers = [];

          console.log("sub_dealer : ", sub_dealer);

          if (sub_dealer.length > 0) {
            sub_dealer.map((value, index) => {
              newSubDealers.push({
                id: value.sub_dealer_id,
                name: value.sub_dealer_name,
              });
            });
            setSubDalers(newSubDealers);
          } else {
            setSubDalers([]);
            setSubDalersId("");
          }
        }
      } catch (error) {
        console.error(error);
        setSubDalers([]);
        setSubDalersId("");
      } finally {
        setLoading(false);
      }
    };

    if (dealerId) {
      getMasterSubDealer();
    } else {
      console.log("useEffect getMasterSubDealer id null");
      setSubDalers([]);
      setSubDalersId("");
    }
  }, [dealerId]);

  useEffect(() => {
    if (location.state?.data) {
      const { user_id } = location.state?.data;
      setDataSaleId(user_id);
    }
  }, [location.state]);

  useEffect(() => {
    const total = dataSource.reduce(
      (sum, item) => sum + parseFloat(item.net_amount || 0),
      0
    );
    setTotalValue(total);
  }, [dataSource]);

  //console.log("userInfo : ", userInfo);

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

  const handleQuantityChange = (key, newQuantity) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === key) {
          const quantity = Math.max(0, newQuantity); // Prevent negative quantities
          const net_amount = (
            quantity * parseFloat(item.product_unit_thb.replace(/,/g, ""))
          ).toFixed(2); // Calculate new net_amount
          const foc = parseInt(quantity / item.product_campaign_order_min_foc);
          //console.log('here : ',{ ...item, quantity, net_amount, foc })
          return { ...item, quantity, net_amount, foc };
        }
        return item;
      })
    );
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "product_code", key: "product_code" },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
    {
      title: <div className="text-center">QTY (ctn)</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <div className="quantity-control flex justify-center items-center">
          <img
            src="/img/icons/collapse.png"
            alt="decrease"
            className="cursor-pointer w-6 h-6"
            onClick={() =>
              handleQuantityChange(record.key, record.quantity - 1)
            }
          />
          <Input
            inputMode="numeric"
            min={0}
            value={record.quantity}
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
              handleQuantityChange(record.key, record.quantity + 1)
            }
          />
        </div>
      ),
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
              const updatedDataSource = dataSource.filter(
                (item) => item.key !== record.key
              );

              // Reset keys and no after deletion
              const resetDataSource = updatedDataSource.map((item, index) => ({
                ...item,
                key: index + 1,
                no: index + 1,
              }));

              setDataSource(resetDataSource);
            }}
          />
        </button>
      ),
    },
  ];

  const footerOrderList = () => {
    const totalQuantity = dataSource.reduce(
      (total, item) => total + parseFloat(item.quantity),
      0
    );

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp; QTY: {totalQuantity}&nbsp;
        </td>
      </tr>
    );
  };

  const onChangeProduct = (value) => {
    // Set Empty

    setSearchProductData([]);

    const loadProductDetail = async () => {
      setLoading(true);
      try {
        const [productDetail] = await Promise.all([
          useServiceAPI.get(paths.pathMasterProductDetail, {
            product_id: value,
          }),
        ]);

        const data = productDetail.data;

        // Check for duplicate product_code
        const existingProductIndex = dataSource.findIndex(
          (item) => item.product_code === data.product_code
        );

        if (existingProductIndex !== -1) {
          // If product_code exists, update the quantity
          const updatedDataSource = dataSource.map((item, index) => {
            if (index === existingProductIndex) {
              const updatedQuantity = item.quantity + 1; // Increment quantity
              const updatedNetAmount = (
                updatedQuantity *
                parseFloat(item.product_unit_thb.replace(/,/g, ""))
              ).toFixed(2); // Recalculate net_amount

              return {
                ...item,
                // quantity: item.quantity + 1, // Increment quantity
                quantity: updatedQuantity,
                net_amount: updatedNetAmount, // Update net_amount
              };
            }
            return item;
          });

          setDataSource(updatedDataSource);
        } else {
          // If product_code does not exist, add a new entry
          const newProductDataDetail = {
            key: dataSource.length + 1,
            no: dataSource.length + 1,
            product_id: data.id,
            product_code: data.product_code,
            product_name: data.product_name,
            product_unit: data.packing_list,
            product_unit_thb: data.bath_unit,
            product_campaign_order_min_foc: data.product_campaign_order_min_foc,
            product_campaign_foc: data.product_campaign_foc,
            quantity: 1, // Set initial quantity to 1
            foc: parseInt(1 / data.product_campaign_order_min_foc),
            // foc: data.product_campaign_foc,
            // net_amount: data.bath_unit,
            net_amount: (
              1 * parseFloat(data.bath_unit.replace(/,/g, ""))
            ).toFixed(2), // Calculate net_amount based on quantity 1
          };

          const updatedDataSource = [...dataSource, newProductDataDetail];

          // Reset the keys to ensure proper sequencing
          const resetDataSource = updatedDataSource.map((item, index) => ({
            ...item,
            key: index + 1,
            no: index + 1,
          }));

          setDataSource(resetDataSource);
        }
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadProductDetail();
  };

  const onSearchProduct = (value) => {
    if (value.length >= 3) {
      const loadProducts = async () => {
        setLoading(true);
        try {
          const [product] = await Promise.all([
            useServiceAPI.get(paths.pathMasterProducts, {
              keyword: value,
            }),
          ]);

          const newProductData = [];
          product.data.map((data, index) => {
            newProductData.push({
              value: data.id,
              label: data.name,
            });
          });

          // Set Data
          setSearchProductData(newProductData);
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาด");
        } finally {
          setLoading(false);
        }
      };

      loadProducts();
    }
  };

  const handleNavigateToOrderView = async () => {
    try {
      const values = await formCustom.validateFields();
      const payload = {
        document_date: dayjs().format("YYYY-MM-DD"),
        user_id: userInfo.id,
        dealer_id: values.dealer,
        sub_dealer_id: values.sub_dealer || null,
        remark: inputRemark,
        file_list: fileList.map((file) => file.url),
        products: dataSource.map((item) => ({
          product_id: item.product_id,
          product_code: item.product_code,
          product_name: item.product_name,
          product_unit: item.product_unit,
          product_unit_thb: parseFloat(item.product_unit_thb),
          product_campaign_order_min_foc: item.product_campaign_order_min_foc,
          product_campaign_foc: item.product_campaign_foc,
          quantity: item.quantity,
          foc: item.foc,
          net_amount: parseFloat(item.net_amount),
        })),
        others: [],
      };

      console.log("payload to submit:", payload);
      //exit()

      const response = await useServiceAPI.post(paths.pathStockCreate, payload);

      console.log("response", response);

      if (response.message == "Save successfully") {
        showMsg("success", "ส่งข้อมูลสำเร็จ");
        navigate("/customer-stock/list");
      } else {
        showMsg("error", response.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.log("Validation or submission error : ", error);

      showMsg("error", error.message || "กรุณากรอกข้อมูลให้ครบถ้วน");
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Customer Stock</div>

      <FormCustom
        fields={formFields}
        form={formCustom}
        onChange={handleChange}
      />

      <BoxPrimary title="Product">
        <div className="mb-3 flex justify-end">
          <Select
            showSearch
            placeholder="Search Product"
            optionFilterProp="label"
            className="w-full"
            onChange={onChangeProduct}
            onSearch={onSearchProduct}
            options={searchProductData}
            value=""
          />
        </div>
      </BoxPrimary>

      <BoxPrimary title="List">
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={false}
          // pageSize={10}
          footer={footerOrderList}
        />
      </BoxPrimary>

      <BoxPrimary className="flex gap-2 justify-end items-center">
        <div>Total Value :</div>
        <InputNumber
          className="w-[200px]"
          min={0}
          disabled={true}
          value={totalValue}
          formatter={(value) =>
            `${parseInt(value || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex items-center justify-between">
          <div className="text-[#00783F] text-lg font-semibold mb-3">File</div>
          <ActionButton
            mode="add"
            text="Upload File"
            onClick={handleUploadClick}
          />
        </div>
        <FileUploadComponent
          ref={fileUploadRef}
          dataFile={fileList}
          onUploadSuccess={handleUploadSuccess}
        />
      </BoxPrimary>

      <BoxPrimary title="Remark">
        <div className="mb-3 flex justify-end">
          <Input.TextArea
            placeholder="Remark"
            rows={2}
            onChange={(e) => setInputRemark(e.target.value)}
          />
        </div>
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/customer-stock/list")}
        />
        <ActionButton
          mode="save"
          text="Confirm"
          onClick={() => handleNavigateToOrderView()}
        />
      </div>
    </MainLayout>
  );
}
