// src/pages/points/line/sales_points/SalesPointEdit.jsx
import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import { Form, Input, Select } from "antd";
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

export default function SalesPointEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const isFarmer = location.pathname.includes("farmer-points-list") || location.state?.is_farmer;
  const backPath = location.state?.back_path || (isFarmer ? "/points/line/farmer-points-list" : "/points/line/sales-points-list");

  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);

  const [docNo, setDocNo] = useState("");
  const [docDate, setDocDate] = useState("");

  const [userId, setUserId] = useState("");
  const [dealerId, setDealerId] = useState("");
  const [subDealerId, setSubDealerId] = useState("");

  const [saleName, setSaleName] = useState("");
  const [dealerName, setDealerName] = useState("");
  const [subDealerName, setSubDealerName] = useState("");
  const [farmerName, setFarmerName] = useState("");

  const [remark, setRemark] = useState("");
  const [permission, setPermission] = useState({});

  const [fileListBill, setFileListBill] = useState([]);
  const [fileListPicture, setFileListPicture] = useState([]);
  const fileUploadRefBill = useRef(null);
  const fileUploadRefPicture = useRef(null);

  const [searchProductData, setSearchProductData] = useState([]);

  const [formCustom] = Form.useForm();

  const document_number = location.state?.document_number;
  const statusFromList = location.state?.status_code;
  const [statusCode, setStatusCode] = useState(statusFromList || "");

  const canDeleteProducts = statusCode !== "ODC";

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

  const handleRemoveRow = (rowKey) => {
    setDataSource((prev) =>
      prev
        .filter((i) => i.key !== rowKey)
        .map((i, idx) => ({ ...i, key: idx + 1, no: idx + 1 }))
    );
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!document_number) return;

      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathSalePointOrderDetail, {
          document_number,
        });

        const d = res?.data;
        if (!d) throw new Error("Invalid detail response");

        setPermission(d.permission || {});

        setDocNo(d.document_number || "");
        setDocDate(d.document_date || "");
        setStatusCode(statusFromList || d.status_code || "");

        setUserId(String(d.user_id || ""));
        setDealerId(String(d.dealer_id || ""));
        setSubDealerId(String(d.sub_dealer_id || ""));

        setSaleName(d.user_name || d.sale_name || "");
        setDealerName(d.dealer_name || "");
        setSubDealerName(d.sub_dealer_name || "");
        setFarmerName(d.farmer_name || "");

        setRemark(d.ref_remark || "");

        const prod = Array.isArray(d.products) ? d.products : [];
        setDataSource(
          prod.map((p, idx) => ({
            key: idx + 1,
            no: idx + 1,
            product_id: Number(p.product_id),
            product_code: p.product_code,
            product_name: p.product_name,
            product_unit: p.product_unit,
            product_unit_thb: p.product_unit_thb,
            point: p.point,
            product_campaign_order_min_foc:
              Number(p.product_campaign_order_min_foc) || 0,
            product_campaign_foc: Number(p.product_campaign_foc) || 0,
            quantity: toNumber(p.quantity),
            foc: toNumber(p.foc),
            net_amount: toNumber(p.net_amount),
          }))
        );

        const oth = Array.isArray(d.others) ? d.others : [];
        setDataSourceOther(
          oth.map((o, idx) => ({
            key: idx + 1,
            no: idx + 1,
            product_name: o.product_name,
            product_unit: o.product_unit,
            point: o.point,
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

        formCustom.setFieldsValue({
          sale: String(d.sale_name || d.user_name || ""),
          dealer: String(d.dealer_name || ""),
          sub_dealer: String(d.sub_dealer_name || ""),
          farmer: String(d.farmer_name || ""),
          order_no: d.document_number || "",
          order_date: d.document_date || dayjs().format("YYYY-MM-DD"),
        });
      } catch (e) {
        console.error(e);
        showMsg("error", e?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document_number]);

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

  const onSearchProduct = async (value) => {
    if (!canDeleteProducts) return;
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
    if (!canDeleteProducts) return;

    setSearchProductData([]);
    setLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathMasterProductDetail, {
        product_id: productId,
      });

      const d = res?.data;
      if (!d) return;

      const i = dataSource.findIndex((x) => x.product_code === d.product_code);

      if (i !== -1) {
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
          point: d.point,
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

  const header = useMemo(() => {
    const base = [
      { title: "No", dataIndex: "no", key: "no", width: 50 },
      { title: "SKU", dataIndex: "product_code", key: "product_code" },
      { title: "Product Name", dataIndex: "product_name", key: "product_name" },
      { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
      {
        title: "THB/Unit",
        dataIndex: "product_unit_thb",
        key: "product_unit_thb",
        render: (t) =>
          toNumber(t).toLocaleString("en-US", { minimumFractionDigits: 2 }),
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
      {
        title: "Sub Total (THB)",
        dataIndex: "net_amount",
        key: "net_amount",
        render: (t) =>
          toNumber(t).toLocaleString("en-US", { minimumFractionDigits: 2 }),
      },
      {
        title: "Point",
        key: "total_point",
        dataIndex: "total_point",
        align: "right",
        width: 140,
        render: (_, record) =>
          (toNumber(record.point) * toNumber(record.quantity)).toLocaleString(
            "en-US",
            { minimumFractionDigits: 0 }
          ),
      },
    ];

    if (!canDeleteProducts) return base;

    return [
      ...base,
      {
        title: <div className="text-center">Action</div>,
        key: "action",
        width: 90,
        align: "center",
        render: (_, record) => (
          <button type="button" className="delete-button flex justify-center mx-auto">
            <img
              src="/img/icons/delete.png"
              alt="delete"
              className="cursor-pointer w-6 h-6"
              onClick={() => handleRemoveRow(record.key)}
            />
          </button>
        ),
      },
    ];
  }, [canDeleteProducts, dataSource]);

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
    const totalAmount = dataSource.reduce((sum, i) => sum + toNumber(i.net_amount), 0);
    const totalPoint = dataSource.reduce(
      (sum, i) => sum + toNumber(i.point) * toNumber(i.quantity),
      0
    );

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={canDeleteProducts ? 10 : 9} className="text-right pr-2 text-white">
          Item: {dataSource.length} | QTY (ctn): {totalQty}&nbsp;| Total:{" "}
          {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}&nbsp;|
          Total Point: {totalPoint.toLocaleString("en-US")}
        </td>
      </tr>
    );
  };

  const footerOther = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={6} className="text-right pr-2 text-white">
        Item: {dataSourceOther.length} &nbsp; QTY:{" "}
        {dataSourceOther.reduce((t, i) => t + (toNumber(i.quantity) || 0), 0)} &nbsp; Total:{" "}
        {dataSourceOther
          .reduce((t, i) => t + toNumber(i.net_amount), 0)
          .toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );

  const formFields = [
    {
      key: "sale",
      label: "Sales",
      name: "sale",
      type: "text",
      disabled: true,
      required: true,
      value: "",
      placeholder: saleName || "",
    },
    {
      key: "dealer",
      label: "Dealer",
      name: "dealer",
      type: "text",
      disabled: true,
      required: true,
      value: "",
      placeholder: dealerName || "",
    },
    {
      key: "sub_dealer",
      label: "Sub Dealer",
      name: "sub_dealer",
      type: "text",
      disabled: true,
      required: true,
      value: "",
      placeholder: subDealerName || "",
    },
    {
      key: "farmer",
      label: "Farmer",
      name: "farmer",
      type: "text",
      disabled: true,
      required: false,
      value: "",
      placeholder: farmerName || "",
    },
    {
      key: "order_no",
      label: "Order No",
      name: "order_no",
      type: "text",
      disabled: true,
      required: true,
      value: docNo || document_number || "",
    },
    {
      key: "order_date",
      label: "Date",
      name: "order_date",
      type: "text",
      disabled: true,
      required: true,
      value: docDate || dayjs().format("YYYY-MM-DD"),
    },
  ];

  const handleUploadClickBill = () => fileUploadRefBill.current?.triggerUpload();
  const handleUploadClickPicture = () => fileUploadRefPicture.current?.triggerUpload();

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

  const handleFileRemoveBill = (file) => {
    setFileListBill((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const handleFileRemovePicture = (file) => {
    setFileListPicture((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const buildProductsPayload = () =>
    dataSource.map((p) => ({
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
    }));

  const handleUpdate = async () => {
    formCustom
      .validateFields()
      .then(async (values) => {
        try {
          if (!docNo) {
            showMsg("error", "ไม่พบเลขที่เอกสาร");
            return;
          }

          if (!dataSource || dataSource.length === 0) {
            showMsg("error", "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ");
            return;
          }

          if (!fileListBill || fileListBill.length === 0) {
            showMsg("error", "กรุณาแนบไฟล์หรือรูปภาพอย่างน้อย 1 รายการ");
            return;
          }

          setLoading(true);

          const payload = {
            document_number: docNo,
            document_date: values.order_date || docDate || dayjs().format("YYYY-MM-DD"),
            user_id: Number(userId) || 0,
            dealer_id: Number(dealerId) || 0,
            sub_dealer_id: Number(subDealerId) || 0,
            farmer_id: 1,
            remark: remark || "",
            picture: fileListPicture.map((f) => f.url).filter(Boolean),
            bill: fileListBill.map((f) => f.url).filter(Boolean),
            products: buildProductsPayload(),
          };

          const res = await useServiceAPI.put(paths.pathSalePointOrderUpdate, payload);

          if (res?.status === 200) {
            showMsg(
              "success",
              res.data?.data?.message_line?.join("\n") || "Update successful"
            );
            navigate(backPath);
          } else {
            showMsg("warning", res?.data?.message || "อัปเดตไม่สำเร็จ");
          }
        } catch (e) {
          showMsg("error", e?.message || "อัปเดตไม่สำเร็จ");
        } finally {
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error("Validation Failed:", e);
      });
  };

  const handleReceive = async () => {
    try {
      if (!docNo) {
        showMsg("error", "ไม่พบเลขที่เอกสาร");
        return;
      }

      if (!dataSource || dataSource.length === 0) {
        showMsg("error", "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ");
        return;
      }

      setLoading(true);

      const payload = {
        document_number: docNo,
      };

      const res = await useServiceAPI.post(paths.pathSalePointOrderUpdateAdmin, payload);

      showMsg(
        "success",
        res?.data?.message_line?.join?.("\n") ||
          res?.data?.message ||
          "Receive successful"
      );

      navigate(backPath);
    } catch (e) {
      showMsg("error", e?.message || "Receive ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">
        {isFarmer ? "Edit Sales Point Order (Farmer)" : "Edit Sales Point Order"}
      </div>

      <FormCustom fields={formFields} form={formCustom} onChange="" />

      {canDeleteProducts && (
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
      )}

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
        handleUploadClick={handleUploadClickBill}
        handleUploadSuccess={handleUploadSuccessBill}
        handleFileRemove={handleFileRemoveBill}
        modeUpload="activity"
        disabled={false}
        required={true}
      />

      <UploadSection
        title="Attached file/Picture (Customer)"
        fileUploadRef={fileUploadRefPicture}
        fileList={fileListPicture}
        handleUploadClick={handleUploadClickPicture}
        handleUploadSuccess={handleUploadSuccessPicture}
        handleFileRemove={handleFileRemovePicture}
        modeUpload="receive"
        disabled={true}
      />

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
          onClick={() => navigate(backPath)}
        />

        {permission?.btn_receive && (
          <ActionButton
            mode="saveDraft"
            text="Receive"
            onClick={handleReceive}
          />
        )}

        <ActionButton mode="save" text="Update" onClick={handleUpdate} />
      </div>
    </MainLayout>
  );
}