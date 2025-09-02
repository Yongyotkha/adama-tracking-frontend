import React, { useEffect, useState, useContext, useRef } from "react";
import { Form, Input, Select } from "antd"; // ⬅️ เพิ่ม Select
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
import FileUploadComponent from "../../../../components/file_upload/FileUploadComponent";

export default function SalesPointEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  // ตาราง
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);

  // master สำหรับแสดงชื่อใน select (readonly)
  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSubDealer, setSubDataDealer] = useState([]);

  // ฟอร์มส่วนบน
  const [docNo, setDocNo] = useState("");
  const [docDate, setDocDate] = useState("");
  const [userId, setUserId] = useState("");
  const [dealerId, setDealerId] = useState("");
  const [subDealerId, setSubDealerId] = useState("");
  const [remark, setRemark] = useState("");

  // อัปโหลดไฟล์
  const [fileListBill, setFileListBill] = useState([]);       // bill
  const [fileListPicture, setFileListPicture] = useState([]); // picture (product receive)
  const fileUploadRefBill = useRef(null);
  const fileUploadRefPicture = useRef(null);

  // ค้นหาสินค้า (เพิ่มใหม่)
  const [searchProductData, setSearchProductData] = useState([]);

  const [formCustom] = Form.useForm();
  const document_number = location.state?.document_number;

  // ---------- helpers ----------
  const toNumber = (v) => Number(String(v ?? "0").replace(/,/g, "")) || 0;

  const getNameFromUrl = (url) => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/");
      return decodeURIComponent(parts[parts.length - 1] || "file");
    } catch {
      return "file";
    }
  };

  // 1) ดึงรายละเอียดใบสั่งจาก pathSalePointOrderDetail
  useEffect(() => {
    const fetchDetail = async () => {
      if (!document_number) return;

      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathSalePointOrderDetail, {
          document_number,
        });

        // ✅ response จริง: { result, status, message, data:{...} }
        const d = res?.data; // ⬅️ ให้ตรงโครงที่คุณแนบมา
        if (!d) throw new Error("Invalid detail response");

        // set ส่วนหัวฟอร์ม
        setDocNo(d.document_number || "");
        setDocDate(d.document_date || "");
        setUserId(String(d.user_id || ""));
        setDealerId(String(d.dealer_id || ""));
        setSubDealerId(String(d.sub_dealer_id || ""));
        setRemark(d.ref_remark || "");

        // products
        const prod = Array.isArray(d.products) ? d.products : [];
        setDataSource(
          prod.map((p, idx) => ({
            key: idx + 1,
            no: idx + 1,
            product_id: Number(p.product_id),
            product_code: p.product_code,
            product_name: p.product_name,
            product_unit: p.product_unit,
            product_unit_thb: p.product_unit_thb, // อาจเป็น string มี comma
            product_campaign_order_min_foc: Number(p.product_campaign_order_min_foc) || 0,
            product_campaign_foc: Number(p.product_campaign_foc) || 0,
            quantity: toNumber(p.quantity),
            foc: toNumber(p.foc),
            net_amount: toNumber(p.net_amount),
          }))
        );

        // others (เก็บไว้แสดง)
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

        // bill -> fileListBill
        const bill = Array.isArray(d.bill) ? d.bill : [];
        setFileListBill(
          bill.map((b) => ({
            uid: String(b.id ?? b.part),
            name: getNameFromUrl(b.part),
            status: "done",
            url: b.part,
          }))
        );

        // picture -> fileListPicture
        const picture = Array.isArray(d.picture) ? d.picture : [];
        setFileListPicture(
          picture.map((p) => ({
            uid: String(p.id ?? p.part),
            name: getNameFromUrl(p.part),
            status: "done",
            url: p.part,
          }))
        );

        // set form values
        formCustom.setFieldsValue({
          sale: String(d.user_id || ""),
          dealer: String(d.dealer_id || ""),
          sub_dealer: String(d.sub_dealer_id || ""),
          order_no: d.document_number || "",
          order_date: d.document_date || dayjs().format("YYYY-MM-DD"),
        });

        // โหลด master เพื่อให้ select disabled โชว์ชื่อ
        const [sale, dealer, sub_dealer] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown, { status: "" }),
          useServiceAPI.get(paths.pathUserLineDealer, { sale_id: d.user_id }),
          useServiceAPI.get(paths.pathUserLineSubDealer, { dealer_id: d.dealer_id }),
        ]);
        setDataSale(sale.data || []);
        setDataDealer(dealer.data || []);
        setSubDataDealer(sub_dealer.data || []);
      } catch (err) {
        console.error(err);
        showMsg("error", err?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document_number]);

  // ---------- ตาราง (มี +/- และคำนวณอัตโนมัติ) ----------
  const handleQty = (key, nextQtyRaw) => {
    setDataSource((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        const quantity = Math.max(0, toNumber(nextQtyRaw));
        const unitTHB = toNumber(item.product_unit_thb);
        const net = quantity * unitTHB;
        const foc = item.product_campaign_order_min_foc
          ? Math.floor(quantity / toNumber(item.product_campaign_order_min_foc))
          : 0;
        return { ...item, quantity, foc, net_amount: Number(net.toFixed(2)) };
      })
    );
  };

  // ---------- เพิ่มส่วน Product input (ค้นหา/เลือก) ----------
  const onSearchProduct = async (value) => {
    if (!value || value.length < 3) return;
    setLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathMasterProducts, {
        keyword: value,
      });
      const options = (res?.data || []).map((p) => ({
        value: p.id,
        label: p.name,
      }));
      setSearchProductData(options);
    } catch (e) {
      showMsg("error", e?.message || "ค้นหาสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const onChangeProduct = async (productId) => {
    // เลือกแล้วเคลียร์ options เพื่อความลื่น
    setSearchProductData([]);
    setLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathMasterProductDetail, {
        product_id: productId,
      });
      const d = res?.data;
      if (!d) return;

      // เช็คซ้ำด้วย product_code
      const i = dataSource.findIndex((x) => x.product_code === d.product_code);
      if (i !== -1) {
        // เพิ่มจำนวนของรายการเดิม
        const next = dataSource.map((row, idx) => {
          if (idx !== i) return row;
          const quantity = toNumber(row.quantity) + 1;
          const unitTHB = toNumber(row.product_unit_thb);
          const net = quantity * unitTHB;
          const foc = row.product_campaign_order_min_foc
            ? Math.floor(quantity / toNumber(row.product_campaign_order_min_foc))
            : 0;
          return { ...row, quantity, foc, net_amount: Number(net.toFixed(2)) };
        });
        setDataSource(next);
      } else {
        // เติมรายการใหม่
        const quantity = 1;
        const unitTHB = toNumber(d.bath_unit);
        const net = quantity * unitTHB;
        const foc = d.product_campaign_order_min_foc
          ? Math.floor(quantity / toNumber(d.product_campaign_order_min_foc))
          : 0;

        const newRow = {
          key: dataSource.length + 1,
          no: dataSource.length + 1,
          product_id: d.id,
          product_code: d.product_code,
          product_name: d.product_name,
          product_unit: d.packing_list,
          product_unit_thb: d.bath_unit,
          product_campaign_order_min_foc: toNumber(d.product_campaign_order_min_foc),
          product_campaign_foc: toNumber(d.product_campaign_foc),
          quantity,
          foc,
          net_amount: Number(net.toFixed(2)),
        };

        const updated = [...dataSource, newRow].map((it, idx) => ({
          ...it,
          key: idx + 1,
          no: idx + 1,
        }));
        setDataSource(updated);
      }
    } catch (e) {
      showMsg("error", e?.message || "โหลดรายละเอียดสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 50 },
    { title: "SKU", dataIndex: "product_code", key: "product_code" },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
    {
      title: "THB/Unit",
      dataIndex: "product_unit_thb",
      key: "product_unit_thb",
      render: (t) => toNumber(t).toLocaleString("en-US", { minimumFractionDigits: 2 }),
    },
    {
      title: <div className="text-center">QTY (ctn)</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (_, r) => (
        <div className="quantity-control flex justify-center items-center">
          <img
            src="/img/icons/collapse.png"
            className="w-6 h-6 cursor-pointer"
            onClick={() => handleQty(r.key, r.quantity - 1)}
            alt="decrease"
          />
          <Input
            inputMode="numeric"
            min={0}
            value={r.quantity}
            onChange={(e) => handleQty(r.key, parseInt(e.target.value) || 0)}
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20"
          />
          <img
            src="/img/icons/expand.png"
            className="w-6 h-6 cursor-pointer"
            onClick={() => handleQty(r.key, r.quantity + 1)}
            alt="increase"
          />
        </div>
      ),
    },
    { title: "FOC (ctn)", dataIndex: "foc", key: "foc" },
    {
      title: "Sub Total (THB)",
      dataIndex: "net_amount",
      key: "net_amount",
      render: (t) => toNumber(t).toLocaleString("en-US", { minimumFractionDigits: 2 }),
    },
  ];

  const headerOther = [
    { title: "No", dataIndex: "no", key: "no", width: 50 },
    { title: "Name", dataIndex: "product_name", key: "product_name" },
    { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
    { title: "QTY", dataIndex: "quantity", key: "quantity" },
    {
      title: <div className="text-end">Value (THB)</div>,
      dataIndex: "net_amount",
      key: "net_amount",
      render: (t) => (
        <div className="text-end">
          {toNumber(t).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>
      ),
    },
  ];

  const footerOrderList = () => {
    const totalQty = dataSource.reduce((sum, i) => sum + toNumber(i.quantity), 0);
    const totalFOC = dataSource.reduce((sum, i) => sum + toNumber(i.foc), 0);
    const totalAmount = dataSource.reduce((sum, i) => sum + toNumber(i.net_amount), 0);

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp; QTY (ctn): {totalQty}+{totalFOC} &nbsp; Total:{" "}
          {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    );
  };

  const footerOther = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={6} className="text-right pr-2 text-white">
        Item: {dataSourceOther.length} &nbsp; QTY:{" "}
        {dataSourceOther.reduce((t, i) => t + (toNumber(i.quantity) || 0), 0)} &nbsp; Total:{" "}
        {dataSourceOther.reduce((t, i) => t + toNumber(i.net_amount), 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}
      </td>
    </tr>
  );

  // ฟิลด์ฟอร์มแสดง readonly
  const formFields = [
    {
      key: "sale",
      label: "Sales",
      name: "sale",
      type: "select",
      disabled: true,
      options: dataSale,
      value: userId,
    },
    {
      key: "dealer",
      label: "Dealer",
      name: "dealer",
      type: "select",
      disabled: true,
      options: dataDealer,
      value: dealerId,
    },
    {
      key: "sub_dealer",
      label: "Sub Dealer",
      name: "sub_dealer",
      type: "select",
      disabled: true,
      options: dataSubDealer,
      value: subDealerId,
    },
    {
      key: "order_no",
      label: "Order No",
      name: "order_no",
      type: "text",
      disabled: true,
      value: docNo || document_number || "",
    },
    {
      key: "order_date",
      label: "Date",
      name: "order_date",
      type: "text",
      disabled: true,
      value: docDate || dayjs().format("YYYY-MM-DD"),
    },
  ];

  const handleUploadClickBill = () => {
    if (fileUploadRefBill.current) fileUploadRefBill.current.triggerUpload();
  };
  const handleUploadClickPicture = () => {
    if (fileUploadRefPicture.current) fileUploadRefPicture.current.triggerUpload();
  };

  const handleUploadSuccessBill = (response) => {
    const data = response.data;
    const uploaded = {
      uid: data.file_key,
      name: data.file_name,
      status: "done",
      url: data.file_url,
    };
    setFileListBill((prev) => [...prev, uploaded]);
  };
  const handleUploadSuccessPicture = (response) => {
    const data = response.data;
    const uploaded = {
      uid: data.file_key,
      name: data.file_name,
      status: "done",
      url: data.file_url,
    };
    setFileListPicture((prev) => [...prev, uploaded]);
  };

  // 🔁 PUT Update
  const handleUpdate = async () => {
    try {
      if (!docNo) {
        showMsg("error", "ไม่พบเลขที่เอกสาร");
        return;
      }
      setLoading(true);

      const payload = {
        document_number: docNo,
        document_date: docDate || dayjs().format("YYYY-MM-DD"),
        user_id: Number(userId) || 0,
        dealer_id: Number(dealerId) || 0,
        sub_dealer_id: Number(subDealerId) || 0,
        farmer_id: 1,
        remark: remark || "",
        picture: fileListPicture.map((f) => f.url).filter(Boolean),
        bill: fileListBill.map((f) => f.url).filter(Boolean),
        products: dataSource.map((p) => ({
          product_id: Number(p.product_id),
          product_code: p.product_code,
          product_name: p.product_name,
          product_unit: p.product_unit,
          product_unit_thb: toNumber(p.product_unit_thb),
          product_campaign_order_min_foc: Number(p.product_campaign_order_min_foc) || 0,
          product_campaign_foc: Number(p.product_campaign_foc) || 0,
          quantity: toNumber(p.quantity),
          foc: toNumber(p.foc),
          net_amount: toNumber(p.net_amount),
        })),
      };

      const res = await useServiceAPI.put(paths.pathSalePointOrderUpdate, payload);

      if (res?.status === 200) {
        showMsg("success", res.data?.data?.message_line?.join("\n") || "Update successful");
        navigate("/points/line/sales-points-list");
      } else {
        showMsg("warning", res?.data?.message || "อัปเดตไม่สำเร็จ");
      }
    } catch (e) {
      showMsg("error", e?.message || "อัปเดตไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Sale Point</div>

      <FormCustom fields={formFields} form={formCustom} onChange="" />

      {/* ✅ Product input แบบหน้า Create */}
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

      <BoxPrimary>
        <div className="flex items-center justify-between">
          <div className="text-[#00783F] text-lg font-semibold mb-3">Bill</div>
          <ActionButton mode="add" text="Upload File" onClick={handleUploadClickBill} />
        </div>
        <FileUploadComponent
          ref={fileUploadRefBill}
          dataFile={fileListBill}
          onUploadSuccess={handleUploadSuccessBill}
          mode="edit"
          modeUpload="activity"
        />
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex items-center justify-between">
          <div className="text-[#00783F] text-lg font-semibold mb-3">Picture</div>
          {/* <ActionButton mode="add" text="Upload File" onClick={handleUploadClickPicture} /> */}
        </div>
        <FileUploadComponent
          ref={fileUploadRefPicture}
          dataFile={fileListPicture}
          onUploadSuccess={handleUploadSuccessPicture}
          mode="edit"
          modeUpload="activity"
        />
      </BoxPrimary>

      <BoxPrimary title="Remark">
        <Input.TextArea
          placeholder="Remark"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
      </BoxPrimary>

      <div className="flex justify-end space-x-2 mt-4">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/points/line/sales-points-list")}
        />
        <ActionButton mode="save" text="Update" onClick={handleUpdate} />
      </div>
    </MainLayout>
  );
}
