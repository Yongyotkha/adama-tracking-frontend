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

  const [documentNumber] = useState(location.state.document_number);

  const [dataDetail, setDataDetail] = useState({});
  const [inputRemark, setInputRemark] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  // ✅ Total Value (Edit) = SUM(line net_amount) และปัดลง
  useEffect(() => {
    const total = dataSource.reduce((sum, item) => {
      const lineNet = Number(item.net_amount || 0); // ✅ line amount
      return sum + lineNet;
    }, 0);

    setTotalValue(Math.floor(total)); // ✅ ปัดลง
  }, [dataSource]);

  const getFileNameWithExtension = (url) => {
    const parts = String(url || "").split("/");
    return parts.pop();
  };

  // ✅ โหลดรายละเอียดเอกสาร
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

        // ✅ IMPORTANT: ใน Edit API ส่ง net_amount = "ยอดต่อบรรทัด" มาแล้ว
        const mappedProducts = (stockDetail.data.products || []).map(
          (item, index) => {
            console.log(item.net_amount);
            const qty =
              Number(String(item.quantity || "0").replace(/,/g, "")) || 0;

            const unitPrice =
              Number(String(item.product_unit_thb || "0").replace(/,/g, "")) ||
              0; // ✅ ราคา/ctn

            const lineNet =
              Number(String(item.net_amount || "0").replace(/,/g, "")) || 0; // ✅ ยอดต่อบรรทัด

            const minFoc = Number(item.product_campaign_order_min_foc || 0);
            const foc = minFoc > 0 ? parseInt(qty / minFoc, 10) : 0;

            return {
              ...item,
              key: index + 1,
              no: index + 1,
              quantity: qty,
              foc,

              // ✅ เก็บราคา/ctn ไว้ใช้ตอนเปลี่ยน qty
              product_unit_thb: unitPrice,

              // ✅ เก็บ net_amount เป็น "ยอดต่อบรรทัด" (ใช้รวม total)
              net_amount: lineNet,
            };
          }
        );

        setDataSource(mappedProducts);

        // others
        const mappedOthers = (stockDetail.data.others || []).map(
          (item, index) => ({
            ...item,
            key: index + 1,
            no: index + 1,
            quantity:
              Number(String(item.quantity || "0").replace(/,/g, "")) || 0,
          })
        );
        setDataSourceOther(mappedOthers);

        // ✅ ถ้าต้องการให้ Total ตรงกับหัวเอกสารแบบ 100% ตั้งต้นได้ (optional)
        // setTotalValue(
        //   Math.floor(
        //     Number(String(stockDetail.data.net_amount || "0").replace(/,/g, "")) || 0
        //   )
        // );
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

  // ✅ เปลี่ยน QTY แล้วต้องคำนวณ line net_amount ใหม่ = product_unit_thb * qty
  const handleQuantityChange = (key, newQuantity) => {
    setDataSource((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        const qty = Math.max(0, Number(newQuantity || 0));
        const minFoc = Number(item.product_campaign_order_min_foc || 0);
        const foc = minFoc > 0 ? parseInt(qty / minFoc, 10) : 0;

        const unitPrice = Number(item.product_unit_thb || 0); // ✅ ราคา/ctn
        const lineNet = unitPrice * qty; // ✅ line amount

        return { ...item, quantity: qty, foc, net_amount: lineNet };
      })
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
            onClick={() => handleQuantityChange(record.key, record.quantity - 1)}
          />
          <Input
            inputMode="numeric"
            min={0}
            value={record.quantity}
            onChange={(e) =>
              handleQuantityChange(record.key, parseInt(e.target.value, 10) || 0)
            }
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20"
          />
          <img
            src="/img/icons/expand.png"
            alt="increase"
            className="cursor-pointer w-6 h-6"
            onClick={() => handleQuantityChange(record.key, record.quantity + 1)}
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
      (total, item) => total + Number(item.quantity || 0),
      0
    );

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp; QTY: {totalQuantity}&nbsp;
        </td>
      </tr>
    );
  };

  // ✅ เพิ่มสินค้าใหม่: สร้าง line net_amount = product_unit_thb * qty(1)
  const onChangeProduct = (value) => {
    setSearchProductData([]);

    const loadProductDetail = async () => {
      setLoading(true);
      try {
        const productDetail = await useServiceAPI.get(
          paths.pathMasterProductDetail,
          { product_id: value }
        );
        const data = productDetail.data;

        const existingIndex = dataSource.findIndex(
          (item) => item.product_code === data.product_code
        );

        const unitPrice =
          Number(String(data.bath_unit || "0").replace(/,/g, "")) || 0;

        if (existingIndex !== -1) {
          // เพิ่ม qty แล้วคำนวณ line net ใหม่
          const updated = dataSource.map((item, idx) => {
            if (idx !== existingIndex) return item;
            const newQty = Number(item.quantity || 0) + 1;
            const lineNet = Number(item.product_unit_thb || 0) * newQty;
            return { ...item, quantity: newQty, net_amount: lineNet };
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
            product_unit_thb: unitPrice, // ✅ ราคา/ctn
            product_campaign_order_min_foc: data.product_campaign_order_min_foc,
            product_campaign_foc: data.product_campaign_foc,
            quantity: qty,
            foc,
            net_amount: unitPrice * qty, // ✅ line amount
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

  // ✅ PUT Update: ส่ง net_amount เป็น "ยอดต่อบรรทัด" (line amount) ตาม requirement ของ API
  const handleNavigateToOrderView = async () => {
    try {
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
          const qty = Number(item.quantity || 0);
          const unitPrice = Number(item.product_unit_thb || 0);
          const lineNet = Math.floor(unitPrice * qty); // ✅ ปัดลง

          const minFoc = Number(item.product_campaign_order_min_foc || 0);
          const foc = minFoc > 0 ? parseInt(qty / minFoc, 10) : 0;

          return {
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            product_unit: item.product_unit,
            product_unit_thb: unitPrice, // ✅ ราคา/ctn
            product_campaign_order_min_foc: item.product_campaign_order_min_foc,
            product_campaign_foc: item.product_campaign_foc,
            quantity: qty,
            foc,
            net_amount: lineNet, // ✅ line amount
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
          <ActionButton mode="add" text="Upload File" onClick={handleUploadClick} />
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
        <ActionButton mode="save" text="Confirm" onClick={handleNavigateToOrderView} />
      </div>
    </MainLayout>
  );
}
