// src/pages/points/line/sales_points/SalesPointCreate.jsx
import React, { useEffect, useState, useContext, useRef } from "react";
import { Form, Input, Select } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableCheckbox from "../../../../components/table/TableCheckbox";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../../contexts/AuthContext";
import dayjs from "dayjs";
import FormCustom from "../../../../components/form_custom/FormCustom";
import TableComponent from "../../../../components/table/TableComponent";
import customParseFormat from "dayjs/plugin/customParseFormat";
import DynamicModal from "../../../../components/modal/DynamicModal";
import UploadSection from "../../../../components/file_upload/UploadSection";

dayjs.extend(customParseFormat);

export default function SalesPointCreate() {
  const { showMsg } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [fileList, setFileList] = useState([]);
  const [fileListReceive, setFileListReceive] = useState([]);
  const fileUploadRef = useRef(null);
  const fileUploadRefReceive = useRef(null);

  const [loading, setLoading] = useState(false);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);

  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);

  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSubDealer, setSubDataDealer] = useState([]);

  // ค่าที่เลือก (ใช้ undefined เมื่อยังไม่เลือก เพื่อกัน NaN/0)
  const [dataSaleId, setDataSaleId] = useState(undefined);
  const [dealerId, setDealerId] = useState(undefined);
  const [subDealerId, setSubDealerId] = useState(undefined);

  const [searchProductData, setSearchProductData] = useState([]);
  const [getOtherProductData, setGetOtherProductData] = useState([]);
  const [inputRemark, setInputRemark] = useState("");

  const [userInfo] = useState(JSON.parse(localStorage.getItem("users")));
  const [formCustom] = Form.useForm();

  // ===== โหลดค่าจาก state กรณีมาจากหน้า previous =====
  useEffect(() => {
    if (location.state?.data) {
      const { user_id, dealer_id, sub_dealer_id, others, products, remark } =
        location.state?.data;

      setDataSaleId(user_id ? Number(user_id) : undefined);
      setDealerId(dealer_id ? Number(dealer_id) : undefined);
      setSubDealerId(sub_dealer_id ? Number(sub_dealer_id) : undefined);
      setDataSource(products || []);
      setDataSourceOther(others || []);
      setInputRemark(remark || "");
    }
  }, [location.state]);

  // ===== โหลด master sales =====
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathMasterSaleDropdown, { status: "" });
        const sales = res?.data || [];
        setDataSale(sales);

        // ตั้งต้นจาก user login ถ้ายังไม่ได้มาจาก state
        if (!location.state?.data) {
          const existing = sales.find((s) => String(s.id) === String(userInfo?.id));
          if (existing) setDataSaleId(Number(userInfo.id));
        }
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    getMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== โหลด dealer เมื่อเลือก sale =====
  useEffect(() => {
    const fetchDealer = async () => {
      if (!dataSaleId) {
        setDataDealer([]);
        return;
      }
      setLoading(true);
      try {
        const dealer = await useServiceAPI.get(paths.pathMasterDealerDropdown, { user_id: dataSaleId });
        setDataDealer(dealer?.data || []);
      } catch (e) {
        // no-op
      } finally {
        setLoading(false);
      }
    };
    fetchDealer();
  }, [dataSaleId]);

  // ===== โหลด sub dealer เมื่อเลือก dealer =====
  useEffect(() => {
    const fetchSubDealer = async () => {
      if (!dealerId) {
        setSubDataDealer([]);
        return;
      }
      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathUserLineSubDealer, { dealer_id: dealerId });
        setSubDataDealer(res?.data || []);
      } catch (e) {
        // no-op
      } finally {
        setLoading(false);
      }
    };
    fetchSubDealer();
  }, [dealerId]);

  // ===== Upload handlers =====
  const handleFileRemove = (file) =>
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  const handleFileReceiveRemove = (file) =>
    setFileListReceive((prev) => prev.filter((f) => f.uid !== file.uid));

  const handleUploadSuccess = (response) => {
    const d = response.data;
    setFileList((prev) => [...prev, { uid: d.file_key, name: d.file_name, status: "done", url: d.file_url }]);
  };
  const handleUploadReceiveSuccess = (response) => {
    const d = response.data;
    setFileListReceive((prev) => [...prev, { uid: d.file_key, name: d.file_name, status: "done", url: d.file_url }]);
  };

  // ===== Modal handlers =====
  const handleCloseTeamModal = () => {
    setGetOtherProductData([]);
    setIsTeamModalVisible(false);
  };

  const handleAddSelectedRows = (selectedRows) => {
    setGetOtherProductData((prev) => {
      const newRows = selectedRows.filter((row) => !prev.some((r) => r.key === row.key));
      return [...prev, ...newRows];
    });

    selectedRows.forEach((data) => {
      const loadOtherProductDetail = async () => {
        setLoading(true);
        try {
          const { data: productData } = await useServiceAPI.get(paths.pathMasterPromotionDetail, {
            promotion_id: data.key,
          });

          setDataSourceOther((prev) => {
            const idx = prev.findIndex((i) => i.product_id === productData.id);
            if (idx !== -1) {
              const updated = prev.map((i, index) => {
                if (index !== idx) return i;
                const quantity = i.quantity + 1;
                const net_amount = (quantity * parseFloat(i.product_unit_thb.replace(/,/g, ""))).toFixed(2);
                return { ...i, product_unit: i.unit, product_unit_value: i.unit_value, quantity, net_amount };
              });
              return updated.map((i, index) => ({ ...i, key: index + 1, no: index + 1 }));
            }
            const next = [
              ...prev,
              {
                key: prev.length + 1,
                no: prev.length + 1,
                product_id: productData.id,
                product_code: productData.code || "",
                product_name: productData.name,
                product_unit: productData.unit,
                product_unit_thb: productData.value,
                quantity: 1,
                net_amount: productData.value,
              },
            ];
            return next.map((i, index) => ({ ...i, key: index + 1, no: index + 1 }));
          });
        } catch (e) {
          showMsg("error", e.message || "เกิดข้อผิดพลาด");
        } finally {
          setLoading(false);
        }
      };
      loadOtherProductDetail();
    });
  };

  // ===== Cascading onChange =====
  const handleChange = (field, value) => {
    if (field === "sale") {
      // เลือก sale ใหม่ -> ล้าง dealer/subDealer & options ถัดไป
      setDataSaleId(value || undefined);
      setDealerId(undefined);
      setSubDealerId(undefined);
      setDataDealer([]);
      setSubDataDealer([]);
    } else if (field === "dealer") {
      setDealerId(value || undefined);
      setSubDealerId(undefined);
      setSubDataDealer([]);
    } else if (field === "sub_dealer") {
      setSubDealerId(value || undefined);
    }
  };

  // ===== ตารางสินค้า (ย่อ) =====
  const handleQuantityChange = (key, newQty) => {
    setDataSource((prev) =>
      prev.map((it) => {
        if (it.key !== key) return it;
        const quantity = Math.max(0, Number(newQty) || 0);
        const net = (quantity * parseFloat(String(it.product_unit_thb).replace(/,/g, ""))).toFixed(2);
        const foc = parseInt(quantity / (Number(it.product_campaign_order_min_foc) || 0)) || 0;
        return { ...it, quantity, net_amount: net, foc };
      })
    );
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "product_code", key: "product_code" },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
    {
      title: "THB/Unit",
      dataIndex: "product_unit_thb",
      key: "product_unit_thb",
      render: (text) => parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
    },
    {
      title: <div className="text-center">QTY (ctn)</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <div className="quantity-control flex justify-center items-center">
          <img
            src="/img/icons/collapse.png"
            alt="decrease"
            className="cursor-pointer w-6 h-6"
            onClick={() => handleQuantityChange(record.key, (record.quantity || 0) - 1)}
          />
          <Input
            inputMode="numeric"
            min={0}
            value={record.quantity}
            onChange={(e) => handleQuantityChange(record.key, parseInt(e.target.value) || 0)}
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20"
          />
          <img
            src="/img/icons/expand.png"
            alt="increase"
            className="cursor-pointer w-6 h-6"
            onClick={() => handleQuantityChange(record.key, (record.quantity || 0) + 1)}
          />
        </div>
      ),
    },
    {
      title: "Sub Total (THB)",
      dataIndex: "net_amount",
      key: "net_amount",
      render: (text) => parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
    },
    {
      title: "Point",
      key: "point",
      dataIndex: "point",
      align: "right",
      width: 140,
      render: (_, r) =>
        (parseFloat(r.point || 0) * parseFloat(r.quantity || 0)).toLocaleString("en-US", {
          minimumFractionDigits: 0,
        }),
    },
    {
      title: <div className="text-center">Action</div>,
      key: "action",
      render: (_, record) => (
        <button className="delete-button flex justify-center mx-auto">
          <img
            src="/img/icons/delete.png"
            alt="delete"
            className="cursor-pointer w-6 h-6"
            onClick={() => {
              const updated = dataSource.filter((i) => i.key !== record.key).map((i, idx) => ({
                ...i,
                key: idx + 1,
                no: idx + 1,
              }));
              setDataSource(updated);
            }}
          />
        </button>
      ),
    },
  ];

  const footerOrderList = () => {
    const totalQty = dataSource.reduce((t, i) => t + (Number(i.quantity) || 0), 0);
    const totalAmount = dataSource.reduce((t, i) => t + (Number(String(i.net_amount).replace(/,/g, "")) || 0), 0);
    const totalPoint = dataSource.reduce((t, i) => t + (Number(i.point) || 0) * (Number(i.quantity) || 0), 0);
    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp; | QTY (ctn): {totalQty}
          &nbsp; | Total: {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} |
          &nbsp; Total Point: {totalPoint.toLocaleString("en-US")}
        </td>
      </tr>
    );
  };

  // ===== ค้นหา/เพิ่มสินค้า (คงของเดิม) =====
  const onChangeProduct = async (value) => {
    setSearchProductData([]);
    setLoading(true);
    try {
      const productDetail = await useServiceAPI.get(paths.pathMasterProductDetail, { product_id: value });
      const data = productDetail.data;

      const i = dataSource.findIndex((it) => it.product_code === data.product_code);
      if (i !== -1) {
        const updated = dataSource.map((it, idx) => {
          if (idx !== i) return it;
          const quantity = (it.quantity || 0) + 1;
          const net_amount = (quantity * parseFloat(String(it.product_unit_thb).replace(/,/g, ""))).toFixed(2);
          return { ...it, quantity, net_amount };
        });
        setDataSource(updated);
      } else {
        const newRow = {
          key: dataSource.length + 1,
          no: dataSource.length + 1,
          product_id: data.id,
          product_code: data.product_code,
          product_name: data.product_name,
          product_unit: data.packing_list,
          product_unit_thb: data.bath_unit,
          product_campaign_order_min_foc: data.product_campaign_order_min_foc,
          product_campaign_foc: data.product_campaign_foc,
          quantity: 1,
          foc: parseInt(1 / data.product_campaign_order_min_foc),
          net_amount: (1 * parseFloat(String(data.bath_unit).replace(/,/g, ""))).toFixed(2),
          point: data.point,
        };
        const next = [...dataSource, newRow].map((i, idx) => ({ ...i, key: idx + 1, no: idx + 1 }));
        setDataSource(next);
      }
    } catch (e) {
      showMsg("error", e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const onSearchProduct = async (value) => {
    if (!value || value.length < 3) return;
    setLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathMasterProducts, { keyword: value });
      const options = (res?.data || []).map((d) => ({ value: d.id, label: d.name }));
      setSearchProductData(options);
    } catch (e) {
      showMsg("error", e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

const handleNavigateToOrderView = () => {
  formCustom
    .validateFields()
    .then((values) => {
      if (!fileList || fileList.length === 0) {
        showMsg("error", "กรุณาแนบไฟล์หรือรูปภาพอย่างน้อย 1 รายการ");
        return;
      }

      const body = {
        document_date: values.order_date,
        user_id: dataSaleId,
        dealer_id: dealerId,
        sub_dealer_id: subDealerId,
        remark: inputRemark,
        products: dataSource,
        others: dataSourceOther,
        fileList,
        fileListReceive,
      };

      navigate("/points/line/sales-points-list/detail", {
        state: { data: body },
      });
    })
    .catch((e) => console.error("Validation Failed:", e));
};

  const handleUploadClick = () => fileUploadRef.current?.triggerUpload();
  const handleUploadReceiveClick = () => fileUploadRefReceive.current?.triggerUpload();

  // ===== ฟิลด์ฟอร์ม (คุม disabled + placeholder ป้องกัน NaN) =====
  const formFields = [
    {
      label: "Sales",
      name: "sale",
      type: "select",
      options: dataSale,
      disabled: false,
      placeholder: "Select sales",
      moderef: true,
      value: dataSaleId ?? undefined, // ใช้ undefined ถ้ายังไม่เลือก (กัน NaN)
    },
    {
      label: "Dealer",
      name: "dealer",
      type: "select",
      options: dataDealer,
      disabled: !dataSaleId, // ต้องเลือก Sales ก่อน
      placeholder: "Select dealer",
      moderef: false,
      value: dealerId ?? undefined,
    },
    {
      label: "Sub Dealer",
      name: "sub_dealer",
      type: "select",
      options: dataSubDealer,
      disabled: !dealerId, // ต้องเลือก Dealer ก่อน
      placeholder: "Select sub dealer",
      moderef: false,
      value: subDealerId ?? undefined,
    },
    {
      label: "Order No",
      name: "order_no",
      type: "text",
      disabled: true,
      required: false,
      moderef: false,
      placeholder: "Generate order no",
      value: "",
    },
    {
      label: "Date",
      name: "order_date",
      type: "date",
      disabled: true,
      required: false,
      moderef: false,
      value: dayjs().format("YYYY-MM-DD"),
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Sales Point Order</div>

      <FormCustom fields={formFields} form={formCustom} onChange={handleChange} />

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
        <TableComponent header={header} dataSource={dataSource} pageSize={10} footer={footerOrderList} />
      </BoxPrimary>

      {/* Attachments Section */}
      <UploadSection
        title="Attached file/Picture"
        fileUploadRef={fileUploadRef}
        fileList={fileList}
        handleUploadClick={handleUploadClick}
        handleUploadSuccess={handleUploadSuccess}
        handleFileRemove={handleFileRemove}
        required={true}
      />

      <UploadSection
        title="Attached file/Picture (Customer)"
        fileUploadRef={fileUploadRefReceive}
        fileList={fileListReceive}
        handleUploadClick={handleUploadReceiveClick}
        handleUploadSuccess={handleUploadReceiveSuccess}
        handleFileRemove={handleFileReceiveRemove}
        modeUpload="receive"
        disabled={true}
      />

      <BoxPrimary title="Remark">
        <div className="mb-3 flex justify-end">
          <Input.TextArea
            placeholder="Remark"
            rows={2}
            value={inputRemark}
            onChange={(e) => setInputRemark(e.target.value)}
          />
        </div>
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/points/line/sales-points-list")} />
        <ActionButton mode="save" text="Confirm" onClick={handleNavigateToOrderView} />
      </div>

      <DynamicModal
        title="Add"
        isVisible={isTeamModalVisible}
        onClose={handleCloseTeamModal}
        header={[
          { title: "No", dataIndex: "no", key: "no", width: 50 },
          { title: "Name", dataIndex: "name", key: "name", width: 150 },
          { title: "Unit", dataIndex: "unit", key: "unit", width: 150 },
          { title: "Value (THB)", dataIndex: "value", key: "value", width: 150 },
        ]}
        dataSource={getOtherProductData}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />
    </MainLayout>
  );
}
