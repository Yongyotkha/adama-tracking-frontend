// src/pages/points/line/sales_points/SalesPointView.jsx
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
import UploadSection from "../../../../components/file_upload/UploadSection";

export default function SalesPointView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  // ตาราง
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);

  // ฟอร์มส่วนบน (ใช้ชื่อจาก detail)
  const [getDocumentDate, setGetDocumentDate] = useState("");
  const [saleName, setSaleName] = useState("");              // ✅ ชื่อ Sales (จาก detail)
  const [dealerName, setDealerName] = useState("");          // ✅ ชื่อ Dealer (จาก detail)
  const [subDealerName, setSubDealerName] = useState("");    // ✅ ชื่อ Sub Dealer (จาก detail)
  const [getRemark, setGetRemark] = useState("");

  // สำหรับโหลด master เดิมไม่จำเป็นแล้ว จึงตัดทิ้ง (เหลือไว้หากจะนำกลับมาใช้)
  // const [dataSale, setDataSale] = useState([]);
  // const [dataDealer, setDataDealer] = useState([]);
  // const [dataSubDealer, setSubDataDealer] = useState([]);

  // อัปโหลดไฟล์
  const [fileListBill, setFileListBill] = useState([]);
  const [fileListPicture, setFileListPicture] = useState([]);
  const fileUploadRefBill = useRef(null);
  const fileUploadRefPicture = useRef(null);

  const [formCustom] = Form.useForm();
  const document_number = location.state?.document_number;

  // helper: แปลง URL ให้เป็นชื่อไฟล์สั้น ๆ
  const getNameFromUrl = (url) => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/");
      return parts[parts.length - 1] || "file";
    } catch {
      return "file";
    }
  };

  // 1) ดึงรายละเอียดใบสั่ง
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

          // set ส่วนหัวฟอร์ม (ใช้ "ชื่อ" จาก detail)
          setGetDocumentDate(d.document_date || "");
          setSaleName(d.user_name || d.sale_name || "");         // ถ้ามี user_name ใช้ก่อน
          setDealerName(d.dealer_name || "");
          setSubDealerName(d.sub_dealer_name || "");
          setGetRemark(d.ref_remark || "");

          // products
          const prod = Array.isArray(d.products) ? d.products : [];
          const mappedProducts = prod.map((p, idx) => ({
            key: idx + 1,
            no: idx + 1,
            product_code: p.product_code,
            product_name: p.product_name,
            point: p.point,
            product_unit: p.product_unit,
            product_unit_thb: p.product_unit_thb,
            quantity: p.quantity,
            foc: p.foc || 0,
            net_amount: p.net_amount,
          }));
          setDataSource(mappedProducts);

          // others
          const oth = Array.isArray(d.others) ? d.others : [];
          const mappedOthers = oth.map((o, idx) => ({
            key: idx + 1,
            no: idx + 1,
            product_name: o.product_name,
            point: o.point,
            product_unit: o.product_unit,
            quantity: o.quantity,
            net_amount: o.net_amount,
          }));
          setDataSourceOther(mappedOthers);

          // bill
          const bill = Array.isArray(d.bill) ? d.bill : [];
          setFileListBill(
            bill.map((b) => ({
              uid: String(b.id ?? b.part),
              name: getNameFromUrl(b.part),
              status: "done",
              url: b.part,
            }))
          );

          // picture
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

  // (ตัด useEffect โหลด master ออก เพราะเราแสดงชื่อจาก detail โดยตรง)

  // header ตาราง
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
      title: "Point",
      key: "point",
      dataIndex: "point",
      align: "right",
      width: 140,
      render: (_, record) =>
        (parseFloat(record.point || 0) * parseFloat(record.quantity || 0)).toLocaleString("en-US", {
          minimumFractionDigits: 0,
        }),
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

  // ✅ เพิ่ม Total Point ใน footer
  const footerOrderList = () => {
    const totalQuantity = dataSource.reduce(
      (total, item) => total + parseFloat(item.quantity || 0),
      0
    );
    const totalAmount = dataSource.reduce(
      (total, item) => total + parseFloat(item.net_amount || 0),
      0
    );
    const totalPoint = dataSource.reduce((sum, record) => {
      const point = parseFloat(record.point || 0);
      const quantity = parseFloat(record.quantity || 0);
      return sum + (point * quantity);
    }, 0);

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length}
          &nbsp;&nbsp; QTY (ctn): {totalQuantity.toLocaleString("en-US")}
          &nbsp;&nbsp; Total: {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          &nbsp;&nbsp; <strong>Total Point: {totalPoint.toLocaleString("en-US")}</strong>
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

  // ฟิลด์ฟอร์มแสดง readonly (ใช้ชื่อจาก detail)
  const formFields = [
    {
      key: "sale",
      label: "Sales",
      name: "sale",
      type: "text",                 // ✅ เปลี่ยนเป็น text
      disabled: true,
      placeholder: saleName || "",
      value: "",
    },
    {
      key: "dealer",
      label: "Dealer",
      name: "dealer",
      type: "text",                 // ✅ เปลี่ยนเป็น text
      disabled: true,
      placeholder: dealerName || "",
      value: "",
    },
    {
      key: "sub_dealer",
      label: "Sub Dealer",
      name: "sub_dealer",
      type: "text",                 // ✅ เปลี่ยนเป็น text
      disabled: true,
      placeholder: subDealerName || "",
      value: "",
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

  return (
    <MainLayout loading={loading}>
      <div className="title-page">View Sales Point Order</div>

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

      <UploadSection
        title="Attached file/Picture"
        fileUploadRef={fileUploadRefBill}
        fileList={fileListBill}
        handleUploadClick={() => {}}
        handleUploadSuccess={() => {}}
        handleFileRemove={() => {}}
        modeUpload="activity"
        disabled={true}
      />

      <UploadSection
        title="Attached file/Picture"
        fileUploadRef={fileUploadRefPicture}
        fileList={fileListPicture}
        handleUploadClick={() => {}}
        handleUploadSuccess={() => {}}
        handleFileRemove={() => {}}
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
            navigate("/points/line/sales-points-list", {
              state: {},
            })
          }
        />
      </div>
    </MainLayout>
  );
}
