import React, { useState, useEffect, useContext } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Form, Input, Modal, Button } from "antd";
import TableComponent from "../../components/table/TableComponent";
import ActionButton from "../../components/button/ActionButton";
import { useNavigate, useLocation } from "react-router-dom";
import FormUser from "../../components/form_user/FormUser";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";

export default function ViewOrderWaiting() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { showMsg, showNotification } = useContext(AuthContext);

  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);
  const [documentNumber] = useState(location.state.document_number);
  const [dataOrderDetail, setDataOrderDetail] = useState([]);

  const [formCustom] = Form.useForm();

  // ✅ Popup Reject state
  const [rejectVisible, setRejectVisible] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");

  // Get Data
  useEffect(() => {
    const loadDataOrderDetail = async () => {
      setLoading(true);
      try {
        const orderDetail = await useServiceAPI.get(paths.pathGetOrderDetail, {
          document_number: documentNumber,
        });

        setDataOrderDetail(orderDetail.data);
        setDataSource(orderDetail.data.products || []);
        setDataSourceOther(orderDetail.data.others || []);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadDataOrderDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    { title: "THB/Unit", dataIndex: "product_unit_thb", key: "product_unit_thb" },
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
      render: (text) => <div className="text-center">{parseFloat(text || 0).toLocaleString("en-US")}</div>,
    },
    {
      title: <div className="text-end">Sub Total (THB)</div>,
      dataIndex: "net_amount",
      key: "net_amount",
      render: (text) => (
        <div className="text-end">
          {parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
          {parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
          Item: {dataSource.length} &nbsp; QTY (ctn): {totalQuantity}+{totalFOC} &nbsp; Total:{" "}
          {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    );
  };

  const footerOther = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={5} className="text-right pr-2 text-white">
        Item : {dataSourceOther.length} &nbsp;&nbsp; QTY :{" "}
        {dataSourceOther.reduce((total, item) => total + parseInt(item.quantity || 0), 0)}
        &nbsp;&nbsp; Total :{" "}
        {dataSourceOther
          .reduce((total, item) => total + parseFloat((item.net_amount || "0").toString().replace(/,/g, "")), 0)
          .toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );

  // ✅ เปิด popup แทนยิง API ทันที
  const handleReject = () => {
    setRejectRemark("");
    setRejectVisible(true);
  };

  // ✅ ยิง API เมื่อกดยืนยันใน popup
  const confirmReject = async () => {
    if (!rejectRemark.trim()) {
      showMsg("error", "กรุณากรอกเหตุผลในการ Reject");
      return;
    }

    const body = {
      document_number: documentNumber,
      status_code: "ODR",
      remark: rejectRemark.trim(),
    };

    setLoading(true);
    try {
      const response = await useServiceAPI.put(paths.pathGetOrderChangeStatus, body);

      setRejectVisible(false);

      showNotification("success", response.message, response.message_line).then(() => {
        navigate("/order-waiting/list");
      });
    } catch (error) {
      showMsg("error", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const body = {
      document_number: documentNumber,
      status_code: "ODC",
      remark: "Complete",
    };

    const updateStatus = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.put(paths.pathGetOrderChangeStatus, body);

        showNotification("success", response.message, response.message_line).then(() => {
          navigate("/order-waiting/list");
        });
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    updateStatus();
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">View Order Waiting</div>

      <FormUser fields={formFieldData} form={formCustom} />

      <BoxPrimary title="Order List">
        <TableComponent header={header} dataSource={dataSource} pageSize={10} footer={footerOrderList} pagination={false} />
      </BoxPrimary>

      <BoxPrimary title="Other">
        <TableComponent header={headerOther} dataSource={dataSourceOther} pageSize={10} footer={footerOther} pagination={false} />
      </BoxPrimary>

      <BoxPrimary title="Remark">
        <Input.TextArea placeholder="Remark" value={dataOrderDetail.ref_remark} disabled className="bg-gray-100" />
      </BoxPrimary>

      {/* ✅ POPUP Reject with remark */}
      <Modal open={rejectVisible} footer={null} centered closable={false}>
        <div className="flex flex-col justify-between items-center min-h-[150px]">

          <div className="text-[#978B87] text-sm text-start mb-4 sarabun-font w-full">
            <div className="font-semibold mb-2">Note</div>

            <Input.TextArea
              rows={3}
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              placeholder="Please enter a reason..."
              className="sarabun-font"
            />
          </div>

          <div className="flex w-full gap-2">
            <Button
              type="button"
              onClick={() => setRejectVisible(false)}
              className="flex-1 bg-gray-300 flex items-center justify-center py-5 rounded-md"
            >
              <span className="sarabun-font text-black">Cancel</span>
            </Button>

            <Button
              type="button"
              onClick={confirmReject}
              className="flex-1 bg-[#009845] flex items-center justify-center py-5 rounded-md"
            >
              <span className="sarabun-font text-white">Save</span>
            </Button>
          </div>
        </div>
      </Modal>

      <div className="flex justify-end space-x-4 mt-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/order-waiting/list")} />
        <ActionButton mode="reject" text="Reject" onClick={handleReject} />
        <ActionButton mode="save" text="Confirm" onClick={handleConfirm} />
      </div>
    </MainLayout>
  );
}
