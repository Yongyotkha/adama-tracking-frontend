import React, { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import FormCustom from "../../../components/form_custom/FormCustom";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import FileUploadComponent from "../../../components/file_upload/FileUploadComponent";
import { Input, message, Select, Upload } from "antd";
import DynamicButton from "../../../components/button/DynamicButton";

export default function ActionMaterialExpense() {
  const { mode } = useParams(); // Get the mode from the URL
  const navigate = useNavigate();
  const isViewMode = mode === "view";
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleUploadChange = (info) => {
    const { file, fileList: updatedFileList } = info;

    if (file.status === "done") {
      message.success(`${file.name} file uploaded successfully.`);
      // Update state with new file list
      setFileList(updatedFileList.map((file) => ({
        uid: file.uid,
        name: file.name,
        status: file.status,
        url: file.response?.url || file.url,
      })));
    } else if (file.status === "error") {
      message.error(`${file.name} file upload failed.`);
    } else {
      setFileList(updatedFileList);
    }
  };

  const handleQuantityChange = (key, newQuantity) => {
    setDataSource((prev) =>
      prev.map((item) =>
        item.key === key
          ? { ...item, quantity: newQuantity, value: (newQuantity * 11500).toLocaleString() }
          : item
      )
    );
  };

  const listHeader = [
    { title: "No", dataIndex: "no", key: "no" },
    {
      title: "Photo",
      dataIndex: "photo",
      key: "photo",
      render: (_, record) => (
        <img
          src={record.photo || "/img/default-placeholder.png"}
          alt="product"
          className="w-10 h-10 object-cover rounded-full shadow-lg"
        />
      ),
    },
    { title: "Material Code", dataIndex: "materialCode", key: "materialCode" },
    { title: "Material Name", dataIndex: "materialName", key: "materialName" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
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
              onClick={() => handleQuantityChange(record.key, record.quantity - 1)}
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
              onClick={() => handleQuantityChange(record.key, record.quantity + 1)}
            />
          </div>
        ),
    },
    { title: "Value", dataIndex: "value", key: "value" },
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
              setDataSource((prev) =>
                prev.map((item) =>
                  item.key === record.key
                    ? { ...item, warehouseSend: e.target.value }
                    : item
                )
              )
            }
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
              setDataSource((prev) =>
                prev.map((item) =>
                  item.key === record.key
                    ? { ...item, receive: e.target.value }
                    : item
                )
              )
            }
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
              setDataSource((prev) => prev.filter((item) => item.key !== record.key))
            }
          />
        ),
    },
  ];

  const [dataSource, setDataSource] = useState([
    {
      key: 1,
      no: 1,
      photo: "/img/products/product1.png",
      materialCode: "M000001",
      materialName: "Name 1",
      price: "10,000",
      stock: 100,
      quantity: 10,
      value: "100,000.00",
      warehouseSend: "",
      receive: "",
    },
    {
      key: 2,
      no: 2,
      photo: "/img/products/product2.png",
      materialCode: "M000002",
      materialName: "Name 2",
      price: "10,000",
      stock: 100,
      quantity: 10,
      value: "100,000.00",
      warehouseSend: "",
      receive: "",
    },
  ]);

  const footerSummary = () => {
    const totalQty = dataSource.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = dataSource.reduce(
      (sum, item) => sum + parseFloat(item.value.replace(/,/g, "")),
      0
    );
    return (
      <tr className="bg-gray-200">
        <td colSpan={11} className="text-right font-semibold">
          Item: {dataSource.length} &nbsp; QTY: {totalQty} &nbsp; Total:{" "}
          {totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    );
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">
        {mode === "create"
          ? "Create Material Expense"
          : mode === "edit"
            ? "Edit Material Expense"
            : "View Material Expense"}
      </div>
      
      <BoxPrimary>
        <div className="grid gap-4 mb-4 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
          <div>
            <label className="block mb-1 text-sm">
              Material Code
            </label>
            <Input value={'123'} disabled className="w-full" />
          </div>

          <div>
            <label className="block mb-1 text-sm">
              Crop
            </label>
            <Input value={'123'} disabled className="w-full" />
          </div>

          <div>
            <label className="block mb-1 text-sm">Product</label>
            <Input value={'123'} disabled className="w-full" />
          </div>
        </div>
      </BoxPrimary>

      {!isViewMode &&
        <BoxPrimary title="Material">

          <div className="mb-3 flex justify-end">
            <Select
              showSearch
              placeholder="Search Product"
              optionFilterProp="label"
              className="w-full"
            // onChange={onChangeProduct}
            // onSearch={onSearchProduct}
            // options={searchProductData}
            />
          </div>
        </BoxPrimary>
      }

      <BoxPrimary title="List">
        <TableComponent
          header={listHeader}
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

      {!isViewMode && (
        <div className="flex justify-end space-x-4 mt-6">
          <ActionButton
            mode="back"
            text="Back"
            onClick={() => navigate("/expenses/material")}
          />
          <ActionButton
            mode="save"
            text={mode === "create" ? "Create" : "Save"}
          />
        </div>
      )}
    </MainLayout>
  );
}
