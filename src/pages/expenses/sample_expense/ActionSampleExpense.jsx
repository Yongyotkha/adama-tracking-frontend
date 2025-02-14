import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import {
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  message,
  Select,
  Upload,
} from "antd";
import DynamicButton from "../../../components/button/DynamicButton";
import { AuthContext } from "../../../contexts/AuthContext";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import dayjs from "dayjs";

export default function ActionSampleExpense() {
  const { mode } = useParams(); // Get the mode from the URL
  const navigate = useNavigate();
  const isViewMode = mode === "view";
  const [loading, setLoading] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [crop, setCrop] = useState([]);
  const [dealer, setDealer] = useState();
  const [subDealers, setSubDealers] = useState([]);
  const [subDealer, setSubDealer] = useState();
  const [fileList, setFileList] = useState([]);
  const [searchProductData, setSearchProductData] = useState([]);
  const { showNotification, userInfo } = useContext(AuthContext);
  const [isSubDealerDisabled, setIsSubDealerDisabled] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [data, setData] = useState({
    document_datetime: dayjs(),
    dealer_id: null,
    sub_dealer_id: null,
    crop_id: null,
    request_value: null,
    warehouse_value: null,
    receive_value: null,
    url_file_list: [],
    file_name_list: [],
    remark: null,
    products: [],
  });

  useEffect(() => {
    const getMasterDealer = async () => {
      try {
        const [dealer, subDealer] = await Promise.all([
          useServiceAPI.get(paths.pathMasterDealerAll),
          useServiceAPI.get(paths.pathMasterSubDealer),
        ]);

        const formattedDealers = dealer?.data.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        const formattedSubDealer = subDealer?.data.map((item) => ({
          value: item.sub_dealer_id,
          label: item.sub_dealer_name,
        }));

        setDealers(formattedDealers);
        setSubDealers(formattedSubDealer);
      } catch (error) {
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
      }
    };
    // console.log(userInfo);
    getMasterDealer();
  }, []);

  useEffect(() => {
    const getDealerId = () => {
      useServiceAPI
        .post(paths.pathSampleGetDealer, { sub_dealer_id: data?.sub_dealer_id })
        .then((response) => {
          if (response.status === 200) {
            console.log(response);
            setData({
              ...data,
              dealer_id: response.data.id,
            });
          }
        })
        .catch((error) => {
          if (error.status === 422) {
            showNotification("error", error.message);
          } else {
            showNotification("error", "เกิดข้อผิดพลาด");
          }
        });
    };

    if (data?.sub_dealer_id) {
      getDealerId();
    }
  }, [data?.sub_dealer_id]);

  useEffect(() => {
    const getMasterCrop = () => {
      useServiceAPI
        .get(paths.pathMasterCrop, { dealer_id: data?.dealer_id })
        .then((response) => {
          if (response.status === 200) {
            console.log(response);

            const formattedCrops = response?.data.map((item) => ({
              value: item.id,
              label: item.name,
            }));

            setData({
              ...data,
              crop_id: null,
            });
            setCrops(formattedCrops);
          }
        })
        .catch((error) => {
          if (error.status === 422) {
            showNotification("error", error.message);
          } else {
            showNotification("error", "เกิดข้อผิดพลาด");
          }
        });
    };

    if (data?.dealer_id) {
      getMasterCrop();
    }
  }, [data?.dealer_id]);

  const handleUploadChange = (info) => {
    const { file, fileList: updatedFileList } = info;

    if (file.status === "done") {
      message.success(`${file.name} file uploaded successfully.`);
      // Update state with new file list
      setFileList(
        updatedFileList.map((file) => ({
          uid: file.uid,
          name: file.name,
          status: file.status,
          url: file.response?.url || file.url,
        }))
      );
    } else if (file.status === "error") {
      message.error(`${file.name} file upload failed.`);
    } else {
      setFileList(updatedFileList);
    }
  };

  const productHeader = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Product Name", dataIndex: "productName", key: "productName" },
    { title: "Pack Size", dataIndex: "packSize", key: "packSize" },
    {
      title: <div className="text-center">QTY (unit)</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) =>
        isViewMode ? (
          record.quantity
        ) : (
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
              min={1}
              value={record.quantity}
              onChange={(e) =>
                handleQuantityChange(record.key, parseInt(e.target.value) || 1)
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
    { title: "Value (THB)", dataIndex: "value", key: "value" },
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
      title: "Warehouse Send",
      dataIndex: "warehouseSend",
      key: "warehouseSend",
      render: (_, record) =>
        isViewMode ? (
          record.warehouseSend
        ) : (
          <Input
            value={record.warehouseSend}
            onChange={(e) =>
              handleInputChange(record.key, "warehouseSend", e.target.value)
            }
            disabled={true}
          />
        ),
    },
    {
      title: "Receive",
      dataIndex: "receive",
      key: "receive",
      render: (_, record) =>
        isViewMode ? (
          record.receive
        ) : (
          <Input
            value={record.receive}
            onChange={(e) =>
              handleInputChange(record.key, "receive", e.target.value)
            }
            disabled={true}
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
            onClick={() =>
              setDataSource(
                dataSource.filter((item) => item.key !== record.key)
              )
            }
          />
        ),
    },
  ];

  const handleInputChange = (key, field, value) => {
    setDataSource((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const handleQuantityChange = (key, newQuantity) => {
    // ปรับ quantity และคำนวณ totalValue ใหม่
    if (newQuantity) {
      const updatedDataSource = dataSource.map((item) => {
        if (item.key === key) {
          const newTotalValue = newQuantity * item.value;
          return { ...item, quantity: newQuantity, totalValue: newTotalValue };
        }
        return item;
      });

      setDataSource(updatedDataSource); // อัปเดต dataSource

      // คำนวณยอดรวม request_value ใหม่
      const totalRequestValue = updatedDataSource.reduce(
        (acc, item) => acc + item.totalValue,
        0
      );
      setData((prevData) => ({
        ...prevData,
        request_value: totalRequestValue, // อัปเดตค่า request_value
      }));
    }
  };

  const footerSummary = () => {
    const totalQty = dataSource.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    const totalValue = dataSource.reduce((sum, item) => {
      const numericValue =
        typeof item.totalValue === "string"
          ? parseFloat(item.totalValue.replace(/,/g, ""))
          : parseFloat(item.totalValue) || 0; // แปลงค่าให้เป็นตัวเลข ถ้าไม่สามารถแปลงได้ให้เป็น 0
      return sum + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);

    return (
      <tr className="bg-gray-200">
        <td colSpan={10} className="text-right font-semibold">
          Item: {dataSource.length} &nbsp; QTY: {totalQty} &nbsp; Total:{" "}
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
        const [productDetail] = await Promise.all([
          useServiceAPI.get(paths.pathMasterProductDetail, {
            product_id: value,
          }),
        ]);

        const data = productDetail.data;

        console.log(data);

        // Check for duplicate product_code
        const existingProductIndex = dataSource.findIndex(
          (item) => item.sku === data.sku
        );

        if (existingProductIndex !== -1) {
          showNotification("error", "Existing Product", [], 2);
        } else {
          const newProductDataDetail = {
            key: dataSource.length + 1,
            no: dataSource.length + 1,
            sku: data.product_code,
            productId: data.id,
            productName: data.product_name,
            packSize: data.packing_list,
            quantity: 1, // ตั้งค่า quantity เป็น 1 เมื่อเพิ่มสินค้าใหม่
            value: data.unit_convert_value, // ราคาของสินค้า
            totalValue: 1 * data.unit_convert_value, // คำนวณ totalValue ตอนเพิ่ม
            remark: "",
            warehouseSend: "",
            receive: "",
          };

          const updatedDataSource = [...dataSource, newProductDataDetail];
          setDataSource(updatedDataSource); // Add new product data to dataSource

          // คำนวณยอดรวม request_value
          const totalRequestValue = updatedDataSource.reduce(
            (acc, item) => acc + item.totalValue,
            0
          );
          setData((prevData) => ({
            ...prevData,
            request_value: totalRequestValue, // อัปเดตค่า request_value
          }));
        }
      } catch (error) {
        console.error("Error loading product detail:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProductDetail();
  };

  const onSearchProduct = (value) => {
    if (value.length >= 3) {
      const loadProducts = async () => {
        // setLoading(true);
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
          showNotification("error", error.message || "เกิดข้อผิดพลาด");
        } finally {
          // setLoading(false);
        }
      };

      loadProducts();
    } else {
      setSearchProductData([]);
    }
  };

  const handleSave = () => {
    const formattedProduct = dataSource?.map((item) => ({
      product_id: item.productId,
      product_code: item.sku,
      product_name: item.productName,
      pack_size: item.packSize,
      qty: item.quantity,
      value: item.value,
      remark: item.remark,
      warehouse_send: item.warehouseSend,
      receive: item.receive,
    }));

    data.products = formattedProduct;

    console.log(data);

    useServiceAPI
      .post(paths.pathSampleExpenseDetails, data, setLoading)
      .then((response) => {
        if (response.status === 200) {
          const successCallback = () => {
            navigate("/expenses/sample");
          };
          showNotification(
            "success",
            response.data.message,
            response.data.message_line
          ).then(successCallback);
        }
      })
      .catch((error) => {
        if (error.status === 422) {
          showNotification("error", error.message);
        } else {
          showNotification("error", "เกิดข้อผิดพลาด");
        }
      });
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">
        {mode === "create"
          ? "Create Sample Expense"
          : mode === "edit"
          ? "Edit Sample Expense"
          : "View Sample Expense"}
      </div>

      <BoxPrimary>
        <div className="grid gap-4 mb-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
          {/* Date Field */}
          <div className="">
            <label className="block mb-1 text-sm">Date</label>
            <DatePicker
              disabled
              className="w-full border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
              value={data.document_datetime}
            />
          </div>

          {/* Sample Expense Code */}
          <div>
            <label className="block mb-1 text-sm">Sample Expense Code</label>
            <Input
              value="Generate"
              disabled
              className="w-full border-gray-300 bg-gray-100 text-gray-500 focus:ring-green-500 focus:border-green-500 rounded-md"
            />
          </div>

          {/* Sub Dealer Field with Checkbox */}
          <div className="flex items-center">
            <div className="flex-1">
              <label className="block mb-1 text-sm">Sub Dealer</label>
              <Select
                disabled={isViewMode || isSubDealerDisabled}
                placeholder="Select"
                className="w-full border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
                options={subDealers}
                showSearch
                optionFilterProp="label"
                onChange={(value) => {
                  // setSubDealer(value);
                  setData({
                    ...data,
                    sub_dealer_id: value,
                  });
                }}
                value={data?.sub_dealer_id}
              ></Select>
            </div>
          </div>

          <div className="grid items-end">
            <Checkbox
              onChange={(e) => {
                setIsSubDealerDisabled(e.target.checked);
                setData({
                  ...data,
                  crop_id: null,
                  sub_dealer_id: null,
                  dealer_id: null,
                });
                setCrops([]);
              }}
              disabled={isViewMode}
            >
              No Sub Dealer
            </Checkbox>
          </div>

          {/* Dealer Field */}
          <div>
            <label className="block mb-1 text-sm">Dealer</label>
            <Select
              disabled={!isSubDealerDisabled}
              placeholder="Dealer"
              className="w-full border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
              options={dealers}
              showSearch
              optionFilterProp="label"
              onChange={(value) => {
                setDealer(value);
                setData({
                  ...data,
                  dealer_id: value,
                });
              }}
              value={data?.dealer_id}
            ></Select>
          </div>

          {/* Crop Field */}
          <div>
            <label className="block mb-1 text-sm">Crop</label>
            <Select
              disabled={isViewMode}
              placeholder="Select"
              className="w-full border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
              showSearch
              optionFilterProp="label"
              options={crops}
              onChange={(value) => {
                // เช็คว่าค่าที่เลือกมีอยู่ใน crops หรือไม่
                const isValidCrop = crops.some((crop) => crop.value === value);
                if (isValidCrop) {
                  setData({
                    ...data,
                    crop_id: value,
                  });
                } else {
                  setData({
                    ...data,
                    crop_id: null,
                  });
                }
              }}
              value={data?.crop_id}
            />
          </div>
        </div>
      </BoxPrimary>

      <BoxPrimary title="Product Sample">
        {!isViewMode && (
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
        )}
      </BoxPrimary>

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
            <label className="text-sm font-medium text-gray-700">
              Total Value Request:
            </label>
            <InputNumber
              className="w-40 text-right border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
              min={0}
              value={data.request_value || 0}
              formatter={(value) =>
                `${parseFloat(value).toFixed(2)}`.replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  ","
                )
              }
              disabled={true}
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Total Value Warehouse Send:
            </label>
            <InputNumber
              className="w-40 text-right border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
              min={0}
              value={data.warehouse_value || 0}
              formatter={(value) =>
                `${parseFloat(value).toFixed(2)}`.replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  ","
                )
              }
              disabled={true}
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Total Value Receive:
            </label>
            <InputNumber
              className="w-40 text-right border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
              min={0}
              value={data.receive_value || 0}
              formatter={(value) =>
                `${parseFloat(value).toFixed(2)}`.replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  ","
                )
              }
              disabled={true}
            />
          </div>
        </div>
      </BoxPrimary>

      <BoxPrimary title="Attach File" className="pb-[56px] hidden">
        <Upload.Dragger
          name="file"
          multiple={false}
          action="/upload" // Replace with your actual upload endpoint
          onChange={handleUploadChange}
          className="w-full"
          listType="picture"
          maxCount={1}
          accept="application/pdf"
          disabled={isViewMode} // Disable upload in view mode
        >
          <p className="text-[#978B87]">Choose a file or drag & Drop it here</p>
          <p className="text-[#978B87]">PDF</p>
          <DynamicButton
            className="text-white mt-2 px-4 py-1 rounded-[4px] bg-[#009845]"
            text={"Browse File"}
            type={"button"}
          />
        </Upload.Dragger>
      </BoxPrimary>

      <BoxPrimary title="Remark">
        <Input.TextArea
          placeholder="Remark"
          rows={3}
          disabled={isViewMode}
          onChange={(e) =>
            setData({
              ...data,
              remark: e.target.value,
            })
          }
        />
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-6">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/expenses/sample")}
        />
        {!isViewMode && (
          <ActionButton
            mode="save"
            text={mode === "create" ? "Create" : "Save"}
            onClick={handleSave}
          />
        )}
      </div>
    </MainLayout>
  );
}
