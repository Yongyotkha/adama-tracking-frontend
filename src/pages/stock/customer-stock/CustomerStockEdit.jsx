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
import FormUser from "../../../components/form_user/FormUser";
dayjs.extend(customParseFormat);

export default function CustomerStockEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg, showNotification } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const [dealers, setDalers] = useState([]);
  const [searchProductData, setSearchProductData] = useState([]);
  const [formCustom] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const fileUploadRef = useRef(null); // Reference for FileUploadComponent

  const [documentNumber, setDocumentNumber] = useState(
    location.state.document_number
  );

  const [dataDetail, setDataDetail] = useState([]);
  const [getUserId, setGetUserId] = useState("");
  const [getDealerId, setGetDealerId] = useState("");
  const [inputRemark, setInputRemark] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);

  useEffect(() => {
    console.log("user effect : ", documentNumber);
    const loadDataStockDetail = async () => {
      console.log("---------loadDataStockDetail------------");
      setLoading(true);

      try {
        console.log("try");
        const [stockDetail] = await Promise.all([
          useServiceAPI.get(paths.pathStockDetail, {
            document_number: documentNumber,
          }),
        ]);

        let imageList = [];
        stockDetail.data.file_image_list.forEach((element, key) => {
          imageList.push({
            uid: key,
            name: getFileNameWithExtension(element),
            status: "done",
            url: element,
          });
        });

        setFileList(imageList);

        setDataDetail(stockDetail.data);
        setGetUserId(stockDetail.data.user_id);
        setGetDealerId(stockDetail.data.dealer_id);
        setInputRemark(stockDetail.data.ref_remark);

        // function mergeNewProducts(prev, newProducts) {

        //   const filteredProducts = newProducts.filter(
        //     (newItem) => !prev.some((prevItem) => prevItem.product_code === newItem.product_code)
        //   );

        //   return [
        //     ...prev,
        //     ...filteredProducts.map((item, index) => ({
        //       ...item,
        //       no: prev.length + index + 1,
        //       key: prev.length + index + 1,
        //       quantity: parseInt(item.quantity),
        //     })),
        //   ];
        // }

        // setDataSource((prev) => mergeNewProducts(prev, stockDetail.data.products));

        // console.log('dataSource : ',dataSource)

        setDataSource((prev) => {
          const newProducts = stockDetail.data.products.filter(
            (newItem) =>
              !prev.some(
                (prevItem) => prevItem.product_code === newItem.product_code
              )
          );

          return [
            ...prev,
            ...newProducts.map((item, index) => ({
              ...item,
              no: prev.length + index + 1,
              key: prev.length + index + 1,
              quantity: parseInt(item.quantity),
            })),
          ];
        });

        setDataSourceOther((prev) => {
          const newOthers = stockDetail.data.others.filter(
            (newItem) =>
              !prev.some(
                (prevItem) => prevItem.product_code === newItem.product_code
              )
          );

          return [
            ...prev,
            ...newOthers.map((item, index) => ({
              ...item,
              no: prev.length + index + 1,
              key: prev.length + index + 1,
              product_unit: item.product_unit,
              quantity: parseInt(item.quantity),
            })),
          ];
        });
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
      console.log("------exit loadDataStockDetail------------");
    };

    loadDataStockDetail();
  }, []);

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

  const getFileNameWithExtension = (url) => {
    const parts = url.split("/");
    return parts.pop(); // Get the last part of the URL
  };

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

  //console.log("dataDetail : ", dataDetail);
  const formFiieldData = [
    {
      label: "Dealer",
      name: "dealer",
      type: "text",
      disabled: true,
      placeholder: dataDetail.user_name,
      value: dataDetail.user_name,
    },
    {
      label: "Sub Dealer",
      name: "subDealer",
      type: "text",
      disabled: true,
      placeholder: dataDetail.sub_dealer_name,
      value: dataDetail.sub_dealer_name,
    },
    {
      label: "Date",
      name: "date",
      type: "text",
      disabled: true,
      placeholder: dataDetail.document_date,
      value: dataDetail.document_date,
    },
  ];

  const formFields = [
    {
      label: "Dealer",
      name: "dealer",
      type: "select",
      options: dealers,
      disabled: false,
      required: true,
      moderef: true,
      // value: dataSaleId,
    },
    {
      label: "Sub Dealer",
      name: "sub_dealer",
      type: "select",
      options: dealers,
      disabled: false,
      required: false,
      moderef: false,
      // value: dealerId,
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
    console.log(111111111);

    try {
      const values = await formCustom.validateFields();
      console.log(values);

      console.log(dataDetail);
      const payload = {
        platform: "web",
        document_number: documentNumber,
        document_date: dayjs().format("YYYY-MM-DD"),
        user_id: 88, // เปลี่ยนตามระบบ auth ถ้ามี
        dealer_id: dataDetail.dealer_id,
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
      //exit();

      const response = await useServiceAPI.put(paths.pathStockUpdate, payload);

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
      <div className="title-page">Edit Customer Stock</div>

      {/* <FormCustom
        fields={formFields}
        form={formCustom}
        onChange={handleChange}
      /> */}

      <FormUser
        fields={formFiieldData}
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
          // value={}
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
            value={inputRemark}
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
