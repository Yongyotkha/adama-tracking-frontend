import React, { useState, useEffect, useRef, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormCustom from "../../../components/form_custom/FormCustom";
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

dayjs.extend(customParseFormat);

export default function CustomerStockCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg, showNotification, userInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [searchProductData, setSearchProductData] = useState([]);
  const [formCustom] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const fileUploadRef = useRef(null);
  const [inputRemark, setInputRemark] = useState("");
  const [totalValue, setTotalValue] = useState(0);

  const [subDealerDisabled, setSubDealerDisabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dealers, setDalers] = useState([]);
  const [dealerId, setDealerId] = useState("");

  const [subDealers, setSubDalers] = useState([]);
  const [subDealerId, setSubDalersId] = useState("");

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [dealer] = await Promise.all([
          useServiceAPI.get(paths.pathMasterDealerAll),
        ]);

        setDalers(dealer.data || []);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  const formFields = [
    {
      label: "Dealer",
      name: "dealer",
      type: "select",
      options: dealers,
      disabled: false,
      required: true,
      moderef: true,
      value: dealerId,
    },
    {
      label: "Sub Dealer",
      name: "sub_dealer",
      type: "select",
      options: subDealers,
      disabled: subDealerDisabled,
      required: false,
      moderef: true,
      value: subDealerId,
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

  const handleChange = (filter, value) => {
    if (filter === "dealer") {
      setDealerId(value);
    } else if (filter === "sub_dealer") {
      setSubDalersId(value);
    }
  };

  // โหลด Sub Dealer จาก Dealer
  useEffect(() => {
    const getMasterSubDealer = async () => {
      try {
        const response = await useServiceAPI.get(
          `${paths.pathCustomerDealerDetail}?id=${dealerId}`,
        );
        setSubDealerDisabled(false);
        if (response.status === 200) {
          const sub_dealer = response.data.network_list || [];
          const newSubDealers = sub_dealer.map((v) => ({
            id: v.sub_dealer_id,
            name: v.sub_dealer_name,
          }));
          setSubDalers(newSubDealers);
        } else {
          setSubDalers([]);
          setSubDalersId("");
        }
      } catch (error) {
        console.error(error);
        setSubDalers([]);
        setSubDalersId("");
      } finally {
        setLoading(false);
      }
    };

    if (dealerId) {
      setSubDalers([]);
      setSubDalersId("");
      getMasterSubDealer();
    } else {
      setSubDalers([]);
      setSubDalersId("");
      setSubDealerDisabled(true);
    }
  }, [dealerId]);

  // ✅ ดึง Product ชุดล่าสุดจาก dealer (และถ้ามี sub_dealer ให้ส่งไปด้วย)
  useEffect(() => {
    const fetchLastProducts = async () => {
      // ต้องมี dealer ก่อนอย่างน้อย
      if (!dealerId) {
        setDataSource([]);
        return;
      }

      try {
        setLoading(true);

        // ประกอบ params dynamic
        const params = { dealer_id: dealerId };
        if (subDealerId) {
          params.sub_dealer_id = subDealerId;
        }

        const res = await useServiceAPI.get(
          paths.pathStockCreateGetLastProduct,
          params,
        );

        if (res.status === 200 && Array.isArray(res.data)) {
          const list = res.data;
          const mapped = list.map((item, index) => {
            const qty = toIntFloor(item.quantity);
            const minFoc = Number(item.product_campaign_order_min_foc || 0);
            const foc = minFoc > 0 ? parseInt(qty / minFoc, 10) : 0;

            return {
              key: index + 1,
              no: index + 1,
              product_id: item.product_id,
              product_code: item.product_code,
              product_name: item.product_name,
              product_unit: item.product_unit,
              product_unit_thb: toIntFloor(item.product_unit_thb),
              product_campaign_order_min_foc:
                item.product_campaign_order_min_foc,
              product_campaign_foc: item.product_campaign_foc,
              quantity: qty,
              foc,

              // ✅ เอาตัวนี้ไปใช้คำนวณ/ส่ง net_amount
              unit_convert_order_value: toIntFloor(
                item.unit_convert_order_value,
              ),
            };
          });
          setDataSource(mapped);
        } else {
          setDataSource([]);
        }
      } catch (error) {
        console.error(error);
        showMsg("error", error.message || "ไม่สามารถโหลดรายการสินค้าได้");
        setDataSource([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLastProducts();
  }, [dealerId, subDealerId]);

  const toIntFloor = (val) => {
    const n = Number(String(val ?? "0").replace(/,/g, ""));
    return Number.isFinite(n) ? Math.floor(n) : 0;
  };

  useEffect(() => {
    const total = dataSource.reduce((sum, item) => {
      const unitValue = toIntFloor(item.unit_convert_order_value);
      const qty = toIntFloor(item.quantity);
      return sum + unitValue * qty;
    }, 0);

    setTotalValue(total);
  }, [dataSource]);

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

    setFileList((prevFileList) => [...prevFileList, fileUpload]);
  };

  const handleQuantityChange = (key, newQuantity) => {
    setDataSource((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        const quantity = Math.max(0, Number(newQuantity || 0));

        const minFoc = Number(item.product_campaign_order_min_foc || 0);
        const foc = minFoc > 0 ? parseInt(quantity / minFoc, 10) : 0;

        return { ...item, quantity, foc }; // ✅ ไม่แตะ net_amount (เพราะเป็นราคาต่อหน่วย)
      }),
    );
  };

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
              const updatedDataSource = dataSource.filter(
                (item) => item.key !== record.key,
              );
              const resetDataSource = updatedDataSource.map((item, index) => ({
                ...item,
                key: index + 1,
                no: index + 1,
              }));
              setDataSource(resetDataSource);
            }}
          />
        </button>
      ),
    },
  ];

  const footerOrderList = () => {
    const totalQuantity = dataSource.reduce(
      (total, item) => total + parseFloat(item.quantity || 0),
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

  const onChangeProduct = (value) => {
    setSearchProductData([]);

    const loadProductDetail = async () => {
      setLoading(true);
      try {
        const [productDetail] = await Promise.all([
          useServiceAPI.get(paths.pathMasterProductDetail, {
            product_id: value,
          }),
        ]);

        const data = productDetail.data;

        const existingProductIndex = dataSource.findIndex(
          (item) => item.product_code === data.product_code,
        );

        if (existingProductIndex !== -1) {
          const updatedDataSource = dataSource.map((item, index) => {
            if (index === existingProductIndex) {
              const updatedQuantity = item.quantity + 1;
              const unitPrice = parseFloat(
                String(item.product_unit_thb || "0").replace(/,/g, ""),
              );
              const updatedNetAmount = (
                updatedQuantity * (isNaN(unitPrice) ? 0 : unitPrice)
              ).toFixed(2);

              return {
                ...item,
                quantity: updatedQuantity,
                net_amount: updatedNetAmount,
              };
            }
            return item;
          });

          setDataSource(updatedDataSource);
        } else {
          const newProductDataDetail = {
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
            foc: parseInt(1 / data.product_campaign_order_min_foc, 10),

            // ✅ ต้องมีตัวนี้ ไม่งั้น Total จะผิด/เป็น 0
            unit_convert_order_value: toIntFloor(
              data.unit_convert_order_value ?? data.bath_unit ?? 0,
            ),

            net_amount: (
              1 * parseFloat(String(data.bath_unit || "0").replace(/,/g, ""))
            ).toFixed(2),
          };

          const updatedDataSource = [...dataSource, newProductDataDetail];
          const resetDataSource = updatedDataSource.map((item, index) => ({
            ...item,
            key: index + 1,
            no: index + 1,
          }));

          setDataSource(resetDataSource);
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
          const [product] = await Promise.all([
            useServiceAPI.get(paths.pathMasterProducts, {
              keyword: value,
            }),
          ]);

          const newProductData = [];
          product.data.map((data) => {
            newProductData.push({
              value: data.id,
              label: data.name,
            });
          });

          setSearchProductData(newProductData);
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาด");
        } finally {
          setLoading(false);
        }
      };

      loadProducts();
    }
  };

  const handleNavigateToOrderView = async () => {
    // 🛑 กันกดซ้ำ
    if (submitting) return;

    try {
      setSubmitting(true); // 🔒 ล็อกปุ่มทันที

      const values = await formCustom.validateFields();

      const payload = {
        document_date: dayjs().format("YYYY-MM-DD"),
        user_id: userInfo.id,
        dealer_id: values.dealer,
        sub_dealer_id: values.sub_dealer || null,
        remark: inputRemark,
        file_list: fileList.map((file) => file.url),
        products: dataSource.map((item) => {
          const qty = toIntFloor(item.quantity);
          const unitValue = toIntFloor(item.unit_convert_order_value);
          return {
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            quantity: qty,
            foc: toIntFloor(item.foc),
            net_amount: unitValue * qty,
          };
        }),
        others: [],
      };

      const response = await useServiceAPI.post(paths.pathStockCreate, payload);

      if (response.message === "Save successfully") {
        showMsg("success", "ส่งข้อมูลสำเร็จ");
        navigate("/customer-stock/list");
      } else {
        showMsg("error", response.message || "เกิดข้อผิดพลาด");
        setSubmitting(false); // ❗ ถ้า error ให้ปลดล็อก
      }
    } catch (error) {
      console.log("Validation or submission error : ", error);
      showMsg("error", error.message || "กรุณากรอกข้อมูลให้ครบถ้วน");
      setSubmitting(false); // ❗ validation fail ก็ปลด
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Customer Stock</div>

      <FormCustom
        fields={formFields}
        form={formCustom}
        onChange={handleChange}
      />

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
            `${parseInt(value || 0)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
          ref={fileUploadRef}
          dataFile={fileList}
          onUploadSuccess={handleUploadSuccess}
        />
      </BoxPrimary>

      <BoxPrimary title="Remark">
        <div className="mb-3 flex justify-end">
          <Input.TextArea
            placeholder="Remark"
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
