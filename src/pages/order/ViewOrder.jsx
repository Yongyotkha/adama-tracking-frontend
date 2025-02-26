import React, { useState, useEffect, useContext } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Form, Input } from "antd";
import TableComponent from "../../components/table/TableComponent";
import ActionButton from "../../components/button/ActionButton";
import { useNavigate, useLocation } from "react-router-dom";
import FormCustom from "../../components/form_custom/FormCustom";
import FormUser from "../../components/form_user/FormUser";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";

export default function ViewOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { showMsg, showNotification } = useContext(AuthContext);
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);
  const [getRemark, setGetRemark] = useState("");
  const [documentNumber, setDocumentNumber] = useState(location.state.document_number);
  const [dataOrderDetail, setDataOrderDetail] = useState([]);
  const [formFields, setFormFields] = useState([]);

  const [formCustom] = Form.useForm();

  // Get Data
  useEffect(() => {
    const loadDataOrderDetail = async () => {
      setLoading(true);
      try {
        const [orderDetail] = await Promise.all([
          useServiceAPI.get(paths.pathGetOrderDetail, {
            document_number: documentNumber,
          }),
        ]);

        setDataOrderDetail(orderDetail.data);
        setDataSource(orderDetail.data.products);
        
        // setDataSourceOther(orderDetail.data.others);
        const updatedData = orderDetail.data.others.map(item => ({
          ...item,
          product_unit: item.product_unit,
        }));
        setDataSourceOther(updatedData);
        
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadDataOrderDetail();
  }, [])
  
  const formFieldData = [
    {
      label: "Sales",
      name: "sale",
      type: "text",
      disabled: true,
      placeholder: dataOrderDetail.user_name,
      value: dataOrderDetail.user_name,
    },
    {
      label: "Dealer",
      name: "dealer",
      type: "text",
      disabled: true,
      placeholder: dataOrderDetail.dealer_name,
      value: dataOrderDetail.dealer_name,
    },
    {
      label: "Order No",
      name: "order_no",
      type: "text",
      disabled: true,
      placeholder: dataOrderDetail.document_number,
      value: dataOrderDetail.document_number,
    },
    {
      label: "Date",
      name: "order_date",
      type: "date",
      disabled: true,
      placeholder: "",
      value: dataOrderDetail.document_date,
    },
  ];

  const header = [
    { title: "No", dataIndex: "document_item", key: "document_item", width: 10 },
    { title: "SKU", dataIndex: "product_code", key: "product_code" },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
    {
      title: "THB/Unit",
      dataIndex: "product_unit_thb",
      key: "product_unit_thb",
    },
    {
      title: <div className="text-center">QTY (ctn)</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => (
        <div className="text-center">
          {parseFloat(text || 0).toLocaleString("en-US").replace(/,/g, "")}
        </div>
      ),
    },
    {
      title: <div className="text-center">FOC (ctn)</div>,
      dataIndex: "foc",
      key: "foc",
      render: (text) => (
        <div className="text-center">
          {parseFloat(text || 0).toLocaleString("en-US")}
        </div>
      ),
    },
    {
      title: <div className="text-end">Sub Total (THB)</div>,
      dataIndex: "net_amount",
      key: "net_amount",
      render: (text) => (
        <div className="text-end">
          {parseFloat(text || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </div>
      ),
    },
  ];

  const headerOther = [
    { title: "No", dataIndex: "document_item", key: "document_item", width: 10 },
    { title: "Name", dataIndex: "product_name", key: "product_name" },
    { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
    { title: "QTY", dataIndex: "quantity", key: "quantity" },
    {
      title: <div className="text-end">Value (THB)</div>,
      dataIndex: "net_amount",
      key: "net_amount",
      render: (text) => (
        <div className="text-end">
          {parseFloat(text || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </div>
      ),
    },
  ];

  const footerOrderList = () => {
    const totalQuantity = dataSource.reduce((total, item) => total + parseFloat(item.quantity), 0);
    const totalFOC = dataSource.reduce((total, item) => total + parseFloat(item.foc), 0);
    const totalAmount = dataSource.reduce((total, item) => total + parseFloat(item.net_amount || 0), 0);

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp; QTY (ctn): {totalQuantity}+{totalFOC} &nbsp;
          Total: {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    );
  };

  const footerOther = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={5} className="text-right pr-2 text-white">
        Item : {dataSourceOther.length} &nbsp;&nbsp; QTY :{" "}
        {dataSourceOther.reduce(
          (total, item) => total + parseInt(item.quantity || 0),
          0
        )}
        &nbsp;&nbsp; Total :{" "}
        {dataSourceOther
          .reduce(
            (total, item) =>
              total + parseFloat(item.net_amount.replace(/,/g, "")),
            0
          )
          .toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );
  
  return (
    <MainLayout loading={loading}>
      <div className="title-page">View Order</div>

      <FormUser fields={formFieldData} form={formCustom} />

      <BoxPrimary title="Order List">
        <TableComponent
          header={header}
          dataSource={dataSource}
          pageSize={10}
          footer={footerOrderList}
          pagination={false} // Disable pagination if the read-only view requires it
        />
      </BoxPrimary>

      <BoxPrimary title="Other">
        <TableComponent
          header={headerOther}
          dataSource={dataSourceOther}
          pageSize={10}
          footer={footerOther}
          pagination={false} // Disable pagination if the read-only view requires it
        />
      </BoxPrimary>

      <BoxPrimary title="Remark">
        <Input.TextArea
          placeholder=""
          value={dataOrderDetail.ref_remark}
          disabled
          className="bg-gray-100"
        />
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-4">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/order/list")}
        />
      </div>
    </MainLayout>
  );
}
