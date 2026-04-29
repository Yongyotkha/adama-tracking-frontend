import React, { useState, useEffect, useRef, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Form, Input, InputNumber, Select } from "antd";
import TableComponent from "../../../components/table/TableComponent";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { AuthContext } from "../../../contexts/AuthContext";
import FileUploadComponent from "../../../components/file_upload/FileUploadComponent";
import FormUser from "../../../components/form_user/FormUser";

dayjs.extend(customParseFormat);

export default function CustomerStockEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const [searchProductData, setSearchProductData] = useState([]);
  const [formCustom] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const fileUploadRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [documentNumber] = useState(location.state.document_number);

  const [dataDetail, setDataDetail] = useState({});
  const [inputRemark, setInputRemark] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  // ✅ ปัดลงเป็น int ทุกกรณี (string / ",")
  const toIntFloor = (val) => {
    const n = Number(String(val ?? "0").replace(/,/g, ""));
    return Number.isFinite(n) ? Math.floor(n) : 0;
  };

  // ✅ Total Value (Edit) = SUM(unit_convert_order_value * quantity) (ปัดลงแบบ int)
  useEffect(() => {
    const total = dataSource.reduce((sum, item) => {
      const unitValue = toIntFloor(item.unit_convert_order_value);
      const qty = toIntFloor(item.quantity);
      return sum + unitValue * qty;
    }, 0);

    setTotalValue(total); // int ชัวร์
  }, [dataSource]);

  const getFileNameWithExtension = (url) => {
    const parts = String(url || "").split("/");
    return parts.pop();
  };

  // ✅ โหลดรายละเอียดเอกสาร + map ให้พร้อมสูตรใหม่ (เหมือน Create)
  useEffect(() => {
    const loadDataStockDetail = async () => {
      setLoading(true);
      try {
        const stockDetail = await useServiceAPI.get(paths.pathStockDetail, {
          document_number: documentNumber,
        });

        // file list
        const imageList = [];
        (stockDetail.data.file_image_list || []).forEach((element, key) => {
          imageList.push({
            uid: key,
            name: getFileNameWithExtension(element),
            status: "done",
            url: element,
          });
        });
        setFileList(imageList);

        setDataDetail(stockDetail.data || {});
        setInputRemark(stockDetail.data?.ref_remark || "");

        // ✅ IMPORTANT: ถึง API จะส่ง net_amount เดิมมา แต่เรา "ไม่ใช้"
        // เราจะใช้ unit_convert_order_value เป็นตัวคำนวณจริงเสมอ
        const mappedProducts = (stockDetail.data.products || []).map(
          (item, index) => {
            const qty = toIntFloor(item.quantity);

            const unitConvert = toIntFloor(item.unit_convert_order_value);
            // fallback กันพัง ถ้าบางตัวไม่มี unit_convert_order_value
            const fallbackUnit = toIntFloor(item.product_unit_thb);
            const unitValue = unitConvert > 0 ? unitConvert : fallbackUnit;

            const minFoc = Number(item.product_campaign_order_min_foc || 0);
            const foc = minFoc > 0 ? parseInt(qty / minFoc, 10) : 0;

            return {
              ...item,
              key: index + 1,
              no: index + 1,
              quantity: qty,
              foc,

              // ✅ เก็บราคาอ้างอิงไว้
              product_unit_thb: toIntFloor(item.product_unit_thb),

              // ✅ เก็บ unit_convert_order_value เป็น "unit price" ที่ใช้คำนวณจริง
              unit_convert_order_value: unitValue,

              // ❌ ไม่ต้องพึ่ง net_amount เดิมจาก API
              // net_amount จะคำนวณตอนส่ง PUT เสมอ
            };
          },
        );

        setDataSource(mappedProducts);

        // others
        const mappedOthers = (stockDetail.data.others || []).map(
          (item, index) => ({
            ...item,
            key: index + 1,
            no: index + 1,
            quantity: toIntFloor(item.quantity),
          }),
        );
        setDataSourceOther(mappedOthers);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadDataStockDetail();
  }, [documentNumber, showMsg]);

  const handleUploadClick = async () => {
    if (fileUploadRef.current) {
      fileUploadRef.current.triggerUpload();
    }
  };

  const handleUploadSuccess = (response) => {
    const data = response.data;
    const fileUpload = {
      uid: data.file_key,
      name: data.file_name,
      status: "done",
      url: data.file_url,
    };
    setFileList((prev) => [...prev, fileUpload]);
  };

  // ✅ เปลี่ยน QTY: ปรับ qty + foc (ไม่ต้องแตะ net_amount เพราะเราส่งคำนวณใหม่ตอน PUT)
  const handleQuantityChange = (key, newQuantity) => {
    setDataSource((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        const qty = Math.max(0, toIntFloor(newQuantity));
        const minFoc = Number(item.product_campaign_order_min_foc || 0);
        const foc = minFoc > 0 ? parseInt(qty / minFoc, 10) : 0;

        return { ...item, quantity: qty, foc };
      }),
    );
  };

  const formFiieldData = [
    {
      label: "Dealer",
      name: "dealer",
      type: "text",
      disabled: true,
      placeholder: dataDetail.dealer_name,
      value: dataDetail.dealer_name,
    },
    {
      label: "Sub Dealer",
      name: "subDealer",
      type: "text",
      disabled: true,
      placeholder: dataDetail.sub_dealer_name,
      value: dataDetail.sub_dealer_name,
    },
    {
      label: "Date",
      name: "date",
      type: "text",
      disabled: true,
      placeholder: dataDetail.document_date,
      value: dataDetail.document_date,
    },
  ];

  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "product_code", key: "product_code" },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
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
            onClick={() =>
              handleQuantityChange(record.key, record.quantity - 1)
            }
          />
          <Input
            inputMode="numeric"
            min={0}
            value={record.quantity}
            onChange={(e) =>
              handleQuantityChange(
                record.key,
                parseInt(e.target.value, 10) || 0,
              )
            }
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20"
          />
          <img
            src="/img/icons/expand.png"
            alt="increase"
            className="cursor-pointer w-6 h-6"
            onClick={() =>
              handleQuantityChange(record.key, record.quantity + 1)
            }
          />
        </div>
      ),
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
              const updated = dataSource.filter((x) => x.key !== record.key);
              const reset = updated.map((x, idx) => ({
                ...x,
                key: idx + 1,
                no: idx + 1,
              }));
              setDataSource(reset);
            }}
          />
        </button>
      ),
    },
  ];

  const footerOrderList = () => {
    const totalQuantity = dataSource.reduce(
      (total, item) => total + toIntFloor(item.quantity),
      0,
    );

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp; QTY: {totalQuantity}&nbsp;
        </td>
      </tr>
    );
  };

  // ✅ เพิ่มสินค้าใหม่: ต้องดึง unit_convert_order_value มาเก็บ และให้ qty=1
  const onChangeProduct = (value) => {
    setSearchProductData([]);

    const loadProductDetail = async () => {
      setLoading(true);
      try {
        const productDetail = await useServiceAPI.get(
          paths.pathMasterProductDetail,
          { product_id: value },
        );
        const data = productDetail.data;

        const existingIndex = dataSource.findIndex(
          (item) => item.product_code === data.product_code,
        );

        // ✅ unit_convert_order_value เป็นตัวจริง ถ้าไม่มีให้ fallback bath_unit
        const unitValue =
          toIntFloor(data.unit_convert_order_value) ||
          toIntFloor(data.net_amount) ||
          toIntFloor(data.bath_unit);

        if (existingIndex !== -1) {
          // เพิ่ม qty (และ foc) — unitValue ไม่เปลี่ยน
          const updated = dataSource.map((item, idx) => {
            if (idx !== existingIndex) return item;

            const newQty = toIntFloor(item.quantity) + 1;
            const minFoc = Number(item.product_campaign_order_min_foc || 0);
            const foc = minFoc > 0 ? parseInt(newQty / minFoc, 10) : 0;

            return { ...item, quantity: newQty, foc };
          });
          setDataSource(updated);
        } else {
          const qty = 1;
          const minFoc = Number(data.product_campaign_order_min_foc || 0);
          const foc = minFoc > 0 ? parseInt(qty / minFoc, 10) : 0;

          const newItem = {
            key: dataSource.length + 1,
            no: dataSource.length + 1,
            product_id: data.id,
            product_code: data.product_code,
            product_name: data.product_name,
            product_unit: data.packing_list,
            product_unit_thb: toIntFloor(data.bath_unit),
            product_campaign_order_min_foc: data.product_campaign_order_min_foc,
            product_campaign_foc: data.product_campaign_foc,
            quantity: qty,
            foc,

            // ✅ ใช้สูตรเดียวกับ Create
            unit_convert_order_value: unitValue,
          };

          const updated = [...dataSource, newItem].map((x, idx) => ({
            ...x,
            key: idx + 1,
            no: idx + 1,
          }));
          setDataSource(updated);
        }
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadProductDetail();
  };

  const onSearchProduct = (value) => {
    if (value.length >= 3) {
      const loadProducts = async () => {
        setLoading(true);
        try {
          const product = await useServiceAPI.get(paths.pathMasterProducts, {
            keyword: value,
          });
          const options = (product.data || []).map((d) => ({
            value: d.id,
            label: d.name,
          }));
          setSearchProductData(options);
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาด");
        } finally {
          setLoading(false);
        }
      };

      loadProducts();
    }
  };

  // ✅ PUT Update: คำนวณ net_amount ใหม่ทุกครั้ง = unit_convert_order_value * quantity (ปัดลงแล้วเป็น int)
  const handleNavigateToOrderView = async () => {
    if (submitting) return;
    try {
      setSubmitting(true); // 🔒 ล็อกปุ่มทันที

      await formCustom.validateFields();

      const payload = {
        platform: "web",
        document_number: documentNumber,
        document_date: dayjs().format("YYYY-MM-DD"),
        user_id: dataDetail.user_id,
        dealer_id: dataDetail.dealer_id,
        sub_dealer_id: dataDetail.sub_dealer_id,
        remark: inputRemark,
        file_list: fileList.map((f) => f.url),
        products: dataSource.map((item) => {
          const qty = toIntFloor(item.quantity);
          const unitValue = toIntFloor(item.unit_convert_order_value);

          // ✅ ยอดต่อบรรทัด "ต้องเท่ากับ preview"
          const lineNet = unitValue * qty;

          const minFoc = Number(item.product_campaign_order_min_foc || 0);
          const foc = minFoc > 0 ? parseInt(qty / minFoc, 10) : 0;

          return {
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            product_unit: item.product_unit,
            product_unit_thb: toIntFloor(item.product_unit_thb),
            unit_convert_order_value: unitValue, // ✅ ส่งไปด้วย (กันหลังบ้าน/flow อื่นใช้)
            product_campaign_order_min_foc: item.product_campaign_order_min_foc,
            product_campaign_foc: item.product_campaign_foc,
            quantity: qty,
            foc,
            net_amount: lineNet, // ✅ NEW ทุกครั้ง
          };
        }),
        others: [],
      };

      const response = await useServiceAPI.put(paths.pathStockUpdate, payload);

      if (response.message === "Update successful") {
        showMsg("success", "ส่งข้อมูลสำเร็จ");
        navigate("/customer-stock/list");
      } else {
        showMsg("error", response.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      showMsg("error", error.message || "กรุณากรอกข้อมูลให้ครบถ้วน");
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Customer Stock</div>

      <FormUser fields={formFiieldData} form={formCustom} onChange={() => {}} />

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

      <BoxPrimary title="List">
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={false}
          footer={footerOrderList}
        />
      </BoxPrimary>

      <BoxPrimary className="flex gap-2 justify-end items-center">
        <div>Total Value :</div>
        <InputNumber
          className="w-[200px]"
          min={0}
          disabled={true}
          value={totalValue}
          formatter={(value) =>
            `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex items-center justify-between">
          <div className="text-[#00783F] text-lg font-semibold mb-3">File</div>
          <ActionButton
            mode="add"
            text="Upload File"
            onClick={handleUploadClick}
          />
        </div>
        <FileUploadComponent
          mode="edit"
          ref={fileUploadRef}
          dataFile={fileList}
          onUploadSuccess={handleUploadSuccess}
        />
      </BoxPrimary>

      <BoxPrimary title="Remark">
        <div className="mb-3 flex justify-end">
          <Input.TextArea
            placeholder="Remark"
            value={inputRemark}
            rows={2}
            onChange={(e) => setInputRemark(e.target.value)}
          />
        </div>
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/customer-stock/list")}
        />
        <ActionButton
          mode="save"
          text={submitting ? "Processing..." : "Confirm"}
          disabled={submitting}
          onClick={handleNavigateToOrderView}
        />
      </div>
    </MainLayout>
  );
}
