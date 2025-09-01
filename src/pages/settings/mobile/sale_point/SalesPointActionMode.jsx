import React, { useEffect, useState, useRef, useContext } from "react";
import { Form, Input, Select } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { AuthContext } from "../../../../contexts/AuthContext";
import dayjs from "dayjs";
import FormCustom from "../../../../components/form_custom/FormCustom";
import TableComponent from "../../../../components/table/TableComponent";
import DynamicModal from "../../../../components/modal/DynamicModal";
import FileUploadComponent from "../../../../components/file_upload/FileUploadComponent";

export default function SalesPointActionMode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg, showNotification } = useContext(AuthContext);
  const { mode = "create" } = useParams();            // 'create' | 'edit' | 'view'
  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);
  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSubDealer, setSubDataDealer] = useState([]);

  const [dataSaleId, setDataSaleId] = useState("");
  const [dealerId, setDealerId] = useState("");
  const [subDealerId, setSubDealerId] = useState("");
  const [searchProductData, setSearchProductData] = useState([]);
  const [inputRemark, setInputRemark] = useState("");
  const [docNumber, setDocNumber] = useState("");      // ใช้ตอน edit

  const [fileList, setFileList] = useState([]);        // bill
  const [fileListReceive, setFileListReceive] = useState([]); // picture

  const fileUploadRef = useRef(null);
  const fileUploadRefReceive = useRef(null);
  const [formCustom] = Form.useForm();

  // ---------- helper ----------
  const asFileItems = (arr = []) =>
    arr.map((x) => ({
      uid: String(x.id ?? x.part ?? Math.random()),
      name: (x.part || "").split("/").pop() || "file",
      status: "done",
      url: x.part,
    }));
  const toNumber = (v) => Number(String(v || "0").replace(/,/g, "") || 0);

  // ---------- master ----------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const sale = await useServiceAPI.get(paths.pathMasterSaleDropdown, { status: "" });
        setDataSale(sale.data || []);
      } catch (e) {
        showMsg("error", e.message || "โหลดข้อมูล master ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadDealer = async (saleId) => {
    const res = await useServiceAPI.get(paths.pathUserLineDealer, { sale_id: saleId });
    setDataDealer(res.data || []);
  };
  const loadSubDealer = async (dId) => {
    const res = await useServiceAPI.get(paths.pathUserLineSubDealer, { dealer_id: dId });
    setSubDataDealer(res.data || []);
  };

  // ---------- prefill from state (create จากหน้าอื่น) ----------
  useEffect(() => {
    if (isCreate && location.state?.data) {
      const { user_id, dealer_id, sub_dealer_id, products = [], others = [], remark = "" } =
        location.state.data;
      setDataSaleId(Number(user_id) || "");
      setDealerId(dealer_id || "");
      setSubDealerId(sub_dealer_id || "");
      setDataSource(products);
      setDataSourceOther(others);
      setInputRemark(remark);
    }
  }, [isCreate, location.state]);

  // ---------- EDIT: load detail ----------
  useEffect(() => {
    (async () => {
      if (!isEdit && !isView) return;
      const document_number = location.state?.document_number;
      if (!document_number) return; // ควรส่งมาจากหน้า List

      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathSalePointOrderDetail, {
          document_number,
        });
        const d = res?.data;
        if (!d) return;

        setDocNumber(d.document_number || "");
        setDataSaleId(Number(d.user_id) || "");
        setDealerId(d.dealer_id || "");
        setSubDealerId(d.sub_dealer_id || "");
        setInputRemark(d.ref_remark || "");

        // products
        setDataSource(
          (d.products || []).map((p, idx) => ({
            key: idx + 1,
            no: idx + 1,
            product_id: Number(p.product_id),
            product_code: p.product_code,
            product_name: p.product_name,
            product_unit: p.product_unit,
            product_unit_thb: p.product_unit_thb, // เก็บเป็น string/numberได้ เดี๋ยวแปลงตอนส่ง
            product_campaign_order_min_foc: Number(p.product_campaign_order_min_foc || 0),
            product_campaign_foc: Number(p.product_campaign_foc || 0),
            quantity: toNumber(p.quantity),
            foc: toNumber(p.foc),
            net_amount: toNumber(p.net_amount),
          }))
        );

        // others (ถ้ามีใช้)
        setDataSourceOther(
          (d.others || []).map((o, idx) => ({
            key: idx + 1,
            no: idx + 1,
            product_name: o.product_name || o.name,
            product_unit: o.product_unit || o.unit,
            quantity: toNumber(o.quantity),
            net_amount: toNumber(o.net_amount),
          }))
        );

        // แนบไฟล์
        setFileList(asFileItems(d.bill || []));     // bill
        setFileListReceive(asFileItems(d.picture || [])); // picture

        // โหลด master ให้ select แสดงชื่อ
        if (d.user_id) {
          const dealer = await useServiceAPI.get(paths.pathUserLineDealer, { sale_id: d.user_id });
          setDataDealer(dealer.data || []);
        }
        if (d.dealer_id) {
          const sub = await useServiceAPI.get(paths.pathUserLineSubDealer, { dealer_id: d.dealer_id });
          setSubDataDealer(sub.data || []);
        }
      } catch (e) {
        showMsg("error", e.message || "โหลดรายละเอียดไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, isView]);


  // ---------- Form fields ----------
  const formFields = [
    {
      label: "Sales", name: "sale", type: "select", options: dataSale, moderef: true,
      disabled: isEdit || isView, value: dataSaleId ? Number(dataSaleId) : undefined
    },
    {
      label: "Dealer", name: "dealer", type: "select", options: dataDealer,
      disabled: isEdit || isView, value: dealerId || undefined
    },
    {
      label: "Sub Dealer", name: "sub_dealer", type: "select", options: dataSubDealer,
      disabled: isEdit || isView, value: subDealerId || undefined
    },
    { label: "Order No", name: "order_no", type: "text", disabled: true, value: docNumber || "" },
    { label: "Date", name: "order_date", type: "date", disabled: true, value: dayjs().format("YYYY-MM-DD") },
  ];

  const handleChange = (field, val) => {
    if (field === "sale") { setDataSaleId(val); loadDealer(val); }
    if (field === "dealer") { setDealerId(val); loadSubDealer(val); }
    if (field === "sub_dealer") setSubDealerId(val);
  };

  // ---------- ตาราง (render เดิม) ----------
  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "product_code", key: "product_code" },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
    {
      title: "THB/Unit", dataIndex: "product_unit_thb", key: "product_unit_thb",
      render: (t) => toNumber(t).toLocaleString("en-US", { minimumFractionDigits: 2 })
    },
    {
      title: <div className="text-center">QTY (ctn)</div>, dataIndex: "quantity", key: "quantity",
      render: (_, r) => (
        <div className="quantity-control flex justify-center items-center">
          <img src="/img/icons/collapse.png" className="w-6 h-6 cursor-pointer"
            onClick={() => handleQty(r.key, r.quantity - 1)} />
          <Input inputMode="numeric" min={0} value={r.quantity}
            onChange={(e) => handleQty(r.key, parseInt(e.target.value) || 0)}
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20" />
          <img src="/img/icons/expand.png" className="w-6 h-6 cursor-pointer"
            onClick={() => handleQty(r.key, r.quantity + 1)} />
        </div>
      ),
    },
    { title: "FOC (ctn)", dataIndex: "foc", key: "foc" },
    {
      title: "Sub Total (THB)", dataIndex: "net_amount", key: "net_amount",
      render: (t) => toNumber(t).toLocaleString("en-US", { minimumFractionDigits: 2 })
    },
  ];
  const handleQty = (key, q) => {
    setDataSource((prev) =>
      prev.map((it) => {
        if (it.key !== key) return it;
        const quantity = Math.max(0, q);
        const net = quantity * toNumber(it.product_unit_thb);
        const foc = it.product_campaign_order_min_foc ? Math.floor(quantity / it.product_campaign_order_min_foc) : 0;
        return { ...it, quantity, net_amount: net.toFixed(2), foc };
      })
    );
  };
  const footerOrderList = () => {
    const qty = dataSource.reduce((s, i) => s + toNumber(i.quantity), 0);
    const foc = dataSource.reduce((s, i) => s + toNumber(i.foc), 0);
    const total = dataSource.reduce((s, i) => s + toNumber(i.net_amount), 0);
    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp; QTY (ctn): {qty}+{foc} &nbsp; Total:{" "}
          {total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    );
  };

  // ---------- upload ----------
  const handleUploadSuccess = (resp) => {
    const d = resp.data;
    setFileList((prev) => [...prev, { uid: d.file_key, name: d.file_name, status: "done", url: d.file_url }]);
  };
  const handleUploadReceiveSuccess = (resp) => {
    const d = resp.data;
    setFileListReceive((prev) => [...prev, { uid: d.file_key, name: d.file_name, status: "done", url: d.file_url }]);
  };

  // ---------- submit ----------
  const buildPayload = () => ({
    document_number: docNumber,                               // สำคัญตอน edit
    document_date: dayjs().format("YYYY-MM-DD"),
    user_id: Number(dataSaleId || 0),
    dealer_id: Number(dealerId || 0),
    sub_dealer_id: Number(subDealerId || 0),
    farmer_id: 1,
    remark: inputRemark || "",
    picture: fileListReceive.map((f) => f.url),
    bill: fileList.map((f) => f.url),
    products: dataSource.map((p) => ({
      product_id: Number(p.product_id),
      product_code: p.product_code,
      product_name: p.product_name,
      product_unit: p.product_unit,
      product_unit_thb: toNumber(p.product_unit_thb),
      product_campaign_order_min_foc: Number(p.product_campaign_order_min_foc || 0),
      product_campaign_foc: Number(p.product_campaign_foc || 0),
      quantity: Number(p.quantity || 0),
      foc: Number(p.foc || 0),
      net_amount: toNumber(p.net_amount),
    })),
  });

  const handleConfirmCreate = () => {
    formCustom.validateFields().then((values) => {
      const body = {
        document_date: values.order_date,
        user_id: dataSaleId,
        dealer_id: dealerId,
        sub_dealer_id: subDealerId,
        remark: inputRemark,
        products: dataSource,
        others: dataSourceOther,
        fileList: fileList,
        fileListReceive: fileListReceive,
      };
      navigate("/points/line/sales-points-list/detail", { state: { data: body } });
    });
  };

  const handleUpdate = async () => {
    const payload = buildPayload();
    setLoading(true);
    try {
      const res = await useServiceAPI.put(paths.pathSalePointOrderUpdate, payload);
      if (res?.status === 200) {
        showNotification("success", "Updated", ["บันทึกสำเร็จ"]);
        navigate("/points/line/sales-points-list");
      } else {
        showNotification("error", "Update failed", [res?.data?.message || "Unknown error"]);
      }
    } catch (e) {
      showMsg("error", e.message || "Update ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">
        {isEdit ? "Edit Sale Point" : isView ? "View Sale Point" : "Create Sale Point"}
      </div>

      <FormCustom fields={formFields} form={formCustom} onChange={handleChange} />

      <BoxPrimary title="Product">
        {isView ? null : (
          <div className="mb-3 flex justify-end">
            <Select
              showSearch placeholder="Search Product" optionFilterProp="label" className="w-full"
              onChange={(v) => {/* ใส่ onChangeProduct ของคุณได้ตามเดิม */ }} onSearch={(v) => {/* onSearchProduct */ }}
              options={searchProductData} value="" />
          </div>
        )}
      </BoxPrimary>

      <BoxPrimary title="Order List">
        <TableComponent header={header} dataSource={dataSource} pageSize={10} footer={footerOrderList} />
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex items-center justify-between">
          <div className="text-[#00783F] text-lg font-semibold mb-3">Attachments (Bill)</div>
          {!isView && <ActionButton mode="add" text="Upload File" onClick={() => fileUploadRef.current?.triggerUpload()} />}
        </div>
        <FileUploadComponent
          ref={fileUploadRef}
          dataFile={fileList}
          onUploadSuccess={handleUploadSuccess}
          mode={isView ? "view" : "edit"}
        />
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex items-center justify-between">
          <div className="text-[#00783F] text-lg font-semibold mb-3">Picture of product receive</div>
          {!isView && <ActionButton mode="add" text="Upload File" onClick={() => fileUploadRefReceive.current?.triggerUpload()} />}
        </div>
        <FileUploadComponent
          ref={fileUploadRefReceive}
          dataFile={fileListReceive}
          onUploadSuccess={handleUploadReceiveSuccess}
          mode={isView ? "view" : "edit"}
        />
      </BoxPrimary>

      <BoxPrimary title="Remark">
        <Input.TextArea
          placeholder="Remark" rows={2} value={inputRemark}
          disabled={isView} onChange={(e) => setInputRemark(e.target.value)}
        />
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/points/line/sales-points-list")} />
        {isCreate && <ActionButton mode="save" text="Confirm" onClick={handleConfirmCreate} />}
        {isEdit && <ActionButton mode="save" text="Update" onClick={handleUpdate} />}
      </div>

      {/* ถ้าต้องใช้ DynamicModal ใน flow เดิม คงไว้ได้ */}
      <DynamicModal title="Add" isVisible={false} onClose={() => { }} header={[]} dataSource={[]} />
    </MainLayout>
  );
}
