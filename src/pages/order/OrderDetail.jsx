import React, { useState, useEffect, useContext } from "react";
import MainLayout from "../../layouts/MainLayout";
import FormCustom from "../../components/form_custom/FormCustom";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Form, Input } from "antd";
import TableComponent from "../../components/table/TableComponent";
import ActionButton from "../../components/button/ActionButton";
import { useNavigate, useLocation } from "react-router-dom";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import dayjs from "dayjs";

export default function OrderDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { showMsg, showNotification } = useContext(AuthContext);
  const [getDocumentDate, setGetDocumentDate] = useState(
    location.state.data.document_date
  );
  const [getUserId, setGetUserId] = useState(location.state.data.user_id);
  const [getDealerId, setGetDealerId] = useState(location.state.data.dealer_id);
  const [getRemark, setGetRemark] = useState(location.state.data.remark);
  
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);
  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);

  const [formCustom] = Form.useForm();

  // Set Data
  useEffect(() => {
    setDataSource(location.state.data.products);
    setDataSourceOther(location.state.data.others);
  }, [dataSource, dataSourceOther])

  // Get Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [sale, dealer] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown, {
            status: "",
          }),
          useServiceAPI.get(paths.pathMasterDealerDropdown, {
            user_id: getUserId,
          }),
        ]);

        setDataSale(sale.data);
        setDataDealer(dealer.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);
  
  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 10 },
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
          {parseFloat(text || 0).toLocaleString("en-US")}
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
    { title: "No", dataIndex: "no", key: "no", width: 10 },
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
      <td colSpan={6} className="text-right pr-2 text-white">
        Item: {dataSourceOther.length} &nbsp; QTY: {dataSourceOther.reduce((total, item) => total + item.quantity, 0)} &nbsp;
        Total: {dataSourceOther.reduce((total, item) => total + parseFloat(item.net_amount.replace(/,/g, "")), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );

  const formFields = [
    {
      key: "sale",
      label: "Sale",
      name: "sale",
      type: "select",
      disabled: true,
      options: dataSale,
      placeholder: "",
      value: getUserId,
    },
    {
      key: "dealer",
      label: "Dealer",
      name: "dealer",
      type: "select",
      disabled: true,
      options: dataDealer,
      placeholder: "",
      value: getDealerId,
    },
    {
      key: "order_no",
      label: "Order No",
      name: "order_no",
      type: "text",
      disabled: true,
      placeholder: "Generate order no",
      value: "",
    },
    {
      key: "order_date",
      label: "Date",
      name: "order_date",
      type: "text",
      disabled: true,
      placeholder: dayjs().format("YYYY-MM-DD"),
      value: "",
    },
  ];

  // Utility function สำหรับแปลงวันที่
  const formatDate = (date) => {
    if (!date || !date.$d) return ""; // ตรวจสอบว่ามี $d หรือไม่
    const d = new Date(date.$d); // แปลง $d เป็น Date Object
    return d.toISOString().split("T")[0]; // แปลงเป็น YYYY-MM-DD
  };

  const handleSaveOrder = () => {
    // แปลงวันที่โดยใช้ฟังก์ชัน formatDate
    const formattedDate = formatDate(getDocumentDate);
    const body = {
      document_date: formattedDate,
      user_id: getUserId,
      dealer_id: getDealerId,
      remark: getRemark,
      products: dataSource,
      others: dataSourceOther,
    };
    console.log(body);

    const saveOrder = async () => {
      setLoading(true);
      try {
        const [response] = await Promise.all([
          useServiceAPI.post(paths.pathGetOrderCreate, body),
        ]);

        showNotification(
          "success",
          response.data.message,
          response.data.message_line
        ).then(() => {
          navigate("/order/list");
        });
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    saveOrder();
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">View Detail</div>

      <FormCustom fields={formFields} form={formCustom} onChange="" />

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
          value={getRemark}
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
        <ActionButton
          mode="save"
          text="Order"
          onClick={() => handleSaveOrder()}
        />
      </div>
    </MainLayout>
  );
}
