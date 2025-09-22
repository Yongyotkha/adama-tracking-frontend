import React, { useEffect, useState, useContext, useRef } from "react";
import { Form, Input } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../../contexts/AuthContext";
import dayjs from "dayjs";
import FormCustom from "../../../../components/form_custom/FormCustom";
import TableComponent from "../../../../components/table/TableComponent";
// ⬇️ เปลี่ยนมาใช้ UploadSection
import UploadSection from "../../../../components/file_upload/UploadSection";

export default function CollectPointsView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg, showNotification } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  // ตาราง
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);

  // master สำหรับแสดงชื่อใน select (readonly)
  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSubDealer, setSubDataDealer] = useState([]);

  // ฟอร์มส่วนบน
  const [getDocumentDate, setGetDocumentDate] = useState("");
  const [getUserId, setGetUserId] = useState("");
  const [getDealerId, setGetDealerId] = useState("");
  const [getSubDealerId, setGetSubDealerId] = useState("");
  const [getRemark, setGetRemark] = useState("");

  // อัปโหลดไฟล์ (view-only)
  const [fileListBill, setFileListBill] = useState([]);
  const [fileListPicture, setFileListPicture] = useState([]);
  const fileUploadRefBill = useRef(null);
  const fileUploadRefPicture = useRef(null);

  const [formCustom] = Form.useForm();
  const document_number = location.state?.document_number;

  const getNameFromUrl = (url) => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/");
      return parts[parts.length - 1] || "file";
    } catch {
      return "file";
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!document_number) return;

      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathSalePointOrderDetail, {
          document_number,
        });

        if (res?.status === 200 && res?.data) {
          const d = res.data;

          setGetDocumentDate(d.document_date || "");
          setGetUserId(d.user_id || "");
          setGetDealerId(d.dealer_id || "");
          setGetSubDealerId(d.sub_dealer_id || "");
          setGetRemark(d.ref_remark || "");

          const prod = Array.isArray(d.products) ? d.products : [];
          setDataSource(
            prod.map((p, idx) => ({
              key: idx + 1,
              no: idx + 1,
              product_code: p.product_code,
              product_name: p.product_name,
              product_unit: p.product_unit,
              product_unit_thb: p.product_unit_thb,
              quantity: p.quantity,
              point: p.point,
              foc: p.foc || 0,
              net_amount: p.net_amount,
            }))
          );

          const oth = Array.isArray(d.others) ? d.others : [];
          setDataSourceOther(
            oth.map((o, idx) => ({
              key: idx + 1,
              no: idx + 1,
              product_name: o.product_name,
              product_unit: o.product_unit,
              quantity: o.quantity,
              net_amount: o.net_amount,
            }))
          );

          const bill = Array.isArray(d.bill) ? d.bill : [];
          setFileListBill(
            bill.map((b) => ({
              uid: String(b.id ?? b.part),
              name: getNameFromUrl(b.part),
              status: "done",
              url: b.part,
            }))
          );

          const picture = Array.isArray(d.picture) ? d.picture : [];
          setFileListPicture(
            picture.map((p) => ({
              uid: String(p.id ?? p.part),
              name: getNameFromUrl(p.part),
              status: "done",
              url: p.part,
            }))
          );
        }
      } catch (err) {
        console.error(err);
        showMsg("error", err?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [document_number]);

  useEffect(() => {
    const getMaster = async () => {
      if (!getUserId || !getDealerId) return;
      setLoading(true);
      try {
        const [sale, dealer, sub_dealer] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown, { status: "" }),
          useServiceAPI.get(paths.pathUserLineDealer, { sale_id: getUserId }),
          useServiceAPI.get(paths.pathUserLineSubDealer, { dealer_id: getDealerId }),
        ]);
        setDataSale(sale.data || []);
        setDataDealer(dealer.data || []);
        setSubDataDealer(sub_dealer.data || []);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    getMaster();
  }, [getUserId, getDealerId]);

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 10 },
    { title: "SKU", dataIndex: "product_code", key: "product_code" },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
    { title: "THB/Unit", dataIndex: "product_unit_thb", key: "product_unit_thb" },
    {
      title: <div className="text-center">QTY (ctn)</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => (
        <div className="text-center">{parseFloat(text || 0).toLocaleString("en-US")}</div>
      ),
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
    {
      title: <div className="text-center">Point</div>,
      dataIndex: "point",
      key: "point",
      render: (text) => (
        <div className="text-center">{parseFloat(text || 0).toLocaleString("en-US")}</div>
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
          {parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>
      ),
    },
  ];

  const footerOrderList = () => {
    const totalQuantity = dataSource.reduce(
      (total, item) => total + parseFloat(item.quantity || 0),
      0
    );
    const totalAmount = dataSource.reduce(
      (total, item) => total + parseFloat(item.net_amount || 0),
      0
    );
    const totalPoint = dataSource.reduce(
      (total, item) =>
        total + (parseFloat(item.point || 0) * parseFloat(item.quantity || 0)),
      0
    );

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp;| QTY (ctn): {totalQuantity} &nbsp;| Total:{" "}
          {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} &nbsp;| Total Point:{" "}
          {totalPoint.toLocaleString("en-US")}
        </td>
      </tr>
    );
  };

  const footerOther = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={6} className="text-right pr-2 text-white">
        Item: {dataSourceOther.length} &nbsp; QTY:{" "}
        {dataSourceOther.reduce((t, i) => t + (parseFloat(i.quantity) || 0), 0)} &nbsp; Total:{" "}
        {dataSourceOther
          .reduce((t, i) => t + parseFloat(String(i.net_amount || "0").replace(/,/g, "")), 0)
          .toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );

  const formFields = [
    {
      key: "sale",
      label: "Sales",
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
      key: "sub_dealer",
      label: "Sub Dealer",
      name: "sub_dealer",
      type: "select",
      disabled: true,
      options: dataSubDealer,
      placeholder: "",
      value: getSubDealerId,
    },
    {
      key: "order_no",
      label: "Order No",
      name: "order_no",
      type: "text",
      disabled: true,
      placeholder: document_number || "Generate order no",
      value: "",
    },
    {
      key: "order_date",
      label: "Date",
      name: "order_date",
      type: "text",
      disabled: true,
      placeholder: getDocumentDate || dayjs().format("YYYY-MM-DD"),
      value: "",
    },
  ];

  // view-only: ไม่ให้อัปโหลด/ลบ — ส่ง noop handlers ไป
  const noop = () => {};

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Point Collection Detail</div>

      <FormCustom fields={formFields} form={formCustom} onChange="" />

      <BoxPrimary title="Order List">
        <TableComponent
          header={header}
          dataSource={dataSource}
          pageSize={10}
          footer={footerOrderList}
          pagination={false}
        />
      </BoxPrimary>

      {dataSourceOther?.length > 0 && (
        <BoxPrimary title="Other">
          <TableComponent
            header={headerOther}
            dataSource={dataSourceOther}
            pageSize={10}
            footer={footerOther}
            pagination={false}
          />
        </BoxPrimary>
      )}

      {/* ✅ ใช้ UploadSection แบบ view-only (disabled) */}
      <UploadSection
        title="Attached file/Picture"
        fileUploadRef={fileUploadRefBill}
        fileList={fileListBill}
        handleUploadClick={noop}
        handleUploadSuccess={noop}
        handleFileRemove={noop}
        modeUpload="activity"
        disabled={true}
      />

      <UploadSection
        title="Attached file/Picture"
        fileUploadRef={fileUploadRefPicture}
        fileList={fileListPicture}
        handleUploadClick={noop}
        handleUploadSuccess={noop}
        handleFileRemove={noop}
        modeUpload="activity"
        disabled={true}
      />

      <BoxPrimary title="Remark">
        <Input.TextArea placeholder="" value={getRemark} disabled className="bg-gray-100" />
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-4">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() =>
            navigate("/points/line/collect-points-list", {
              state: {},
            })
          }
        />
      </div>
    </MainLayout>
  );
}
