import React, { useContext, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import FormCustom from "../../../components/form_custom/FormCustom";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import FileUploadComponent from "../../../components/file_upload/FileUploadComponent";
import { Checkbox, DatePicker, Input, message, Select, Upload } from "antd";
import DynamicButton from "../../../components/button/DynamicButton";
import { AuthContext } from "../../../contexts/AuthContext";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function ActionSampleExpense() {
  const { mode } = useParams(); // Get the mode from the URL
  const navigate = useNavigate();
  const isViewMode = mode === "view";
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [searchProductData, setSearchProductData] = useState([]);
  const { showNotification } = useContext(AuthContext);
  const [isSubDealerDisabled, setIsSubDealerDisabled] = useState(false);

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

  const [dataSource, setDataSource] = useState([
    // {
    //   key: 1,
    //   no: 1,
    //   sku: "3027200113",
    //   productName: "Bumper P",
    //   packSize: "0.5 lt x20",
    //   quantity: 10,
    //   value: "115,000.00",
    //   remark: "",
    //   warehouseSend: "",
    //   receive: "",
    // },
    // {
    //   key: 2,
    //   no: 2,
    //   sku: "207920011520",
    //   productName: "Memory 300EC",
    //   packSize: "1lt x20",
    //   quantity: 10,
    //   value: "68,000.00",
    //   remark: "",
    //   warehouseSend: "",
    //   receive: "",
    // },
  ]);

  const handleQuantityChange = (key, newQuantity) => {
    setDataSource((prev) =>
      prev.map((item) =>
        item.key === key
          ? {
              ...item,
              quantity: newQuantity,
              value: (newQuantity * 11500).toLocaleString(),
            }
          : item
      )
    );
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
        isViewMode ? record.remark : <Input value={record.remark} />,
    },
    {
      title: "Warehouse Send",
      dataIndex: "warehouseSend",
      key: "warehouseSend",
      render: (_, record) =>
        isViewMode ? (
          record.warehouseSend
        ) : (
          <Input value={record.warehouseSend} />
        ),
    },
    {
      title: "Receive",
      dataIndex: "receive",
      key: "receive",
      render: (_, record) =>
        isViewMode ? record.receive : <Input value={record.receive} />,
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

  const footerSummary = () => {
    // const totalQty = dataSource.reduce((sum, item) => sum + item.quantity, 0);
    // const totalValue = dataSource.reduce(
    //   (sum, item) => sum + parseFloat(item.value.replace(/,/g, "")),
    //   0
    // );
    // return (
    //   <tr className="bg-gray-200">
    //     <td colSpan={10} className="text-right font-semibold">
    //       Item: {dataSource.length} &nbsp; QTY: {totalQty} &nbsp; Total:{" "}
    //       {totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
    //     </td>
    //   </tr>
    // );
  };

  
  const handleCheckboxChange = (e) => {
    setIsSubDealerDisabled(e.target.checked);
  };

  const onChangeProduct = (value) => {
    setSearchProductData([]);
  
    const loadProductDetail = async () => {
      setLoading(true);
      try {
        const [productDetail] = await Promise.all([
          useServiceAPI.get(paths.pathMasterProductDetail, { product_id: value }),
        ]);
  
        const data = productDetail.data;
  
        console.log(data);
  
        // Check for duplicate product_code
        const existingProductIndex = dataSource.findIndex(
          (item) => item.sku === data.sku
        );
  
        if (existingProductIndex !== -1) {
          // If product_code exists, update the quantity and value
          const updatedDataSource = dataSource.map((item, index) => {
            if (index === existingProductIndex) {
              const updatedQuantity = item.quantity + 1; // Increment quantity
  
              // Assuming you have product price in 'data' and format the value
              const updatedValue = (
                updatedQuantity * parseFloat(item.product_unit_thb.replace(/,/g, ""))
              ).toFixed(2);
  
              return {
                ...item,
                quantity: updatedQuantity,
                value: updatedValue, // Update value
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
            sku: data.sku, // SKU from the API response
            productName: data.product_name, // Product name from the API response
            packSize: data.pack_size, // Pack size from the API response
            quantity: 1, // Initial quantity
            value: data.product_unit_thb,
            remark: "", // Set default remark
            warehouseSend: "", // Set default warehouseSend
            receive: "", // Set default receive
          };
  
          setDataSource([...dataSource, newProductDataDetail]); // Add new product data to dataSource
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
          <div>
            <label className="block mb-1 text-sm">Date</label>
            <DatePicker
              disabled
              className="w-full border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
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
              >
                <Select.Option value="1">Sub Dealer 1</Select.Option>
                <Select.Option value="2">Sub Dealer 2</Select.Option>
              </Select>
            </div>
          </div>

          <div className="grid items-end">
            <Checkbox onChange={handleCheckboxChange} disabled={isViewMode}>
              No Sub Dealer
            </Checkbox>
          </div>

          {/* Dealer Field */}
          <div>
            <label className="block mb-1 text-sm">Dealer</label>
            <Select
              disabled
              placeholder="Dealer"
              className="w-full border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
            >
              <Select.Option value="1">Dealer 1</Select.Option>
              <Select.Option value="2">Dealer 2</Select.Option>
            </Select>
          </div>

          {/* Crop Field */}
          <div>
            <label className="block mb-1 text-sm">Crop</label>
            <Select
              disabled={isViewMode}
              placeholder="Select"
              className="w-full border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
            >
              <Select.Option value="1">Rice</Select.Option>
              <Select.Option value="2">Corn</Select.Option>
            </Select>
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
        />
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex flex-col items-end space-y-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Total Value Request:
            </label>
            <Input
              value="200.00" // Replace with dynamic data
              disabled
              className="w-40 text-right border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Total Value Warehouse Send:
            </label>
            <Input
              value="0.00" // Replace with dynamic data
              disabled
              className="w-40 text-right border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Total Value Receive:
            </label>
            <Input
              value="0.00" // Replace with dynamic data
              disabled
              className="w-40 text-right border-gray-300 focus:ring-green-500 focus:border-green-500 rounded-md"
            />
          </div>
        </div>
      </BoxPrimary>

      <BoxPrimary title="Attach File" className="pb-[56px]">
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
        <Input.TextArea placeholder="Remark" rows={3} disabled={isViewMode} />
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
          />
        )}
      </div>
    </MainLayout>
  );
}
