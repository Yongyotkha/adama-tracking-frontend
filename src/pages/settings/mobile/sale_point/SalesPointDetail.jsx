import React, { useEffect, useState, useContext, useRef } from "react";
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
import DynamicModal from "../../../../components/modal/DynamicModal";
import FileUploadComponent from "../../../../components/file_upload/FileUploadComponent";
import UploadSection from "../../../../components/file_upload/UploadSection";

export default function SalesPointDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg, showNotification } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const isFarmer = location.pathname.includes("farmer-points-list") || location.state?.data?.is_farmer;
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);

  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSubDealer, setSubDataDealer] = useState([]);
  const [dataFarmer, setDataFarmer] = useState([]);

  const [getDocumentDate, setGetDocumentDate] = useState(
    location.state?.data?.document_date
  );
  const [getUserId, setGetUserId] = useState(location.state?.data?.user_id);
  const [getDealerId, setGetDealerId] = useState(location.state?.data?.dealer_id);
  const [getSubDealerId, setGetSubDealerId] = useState(location.state?.data?.sub_dealer_id);
  const [getFarmerId, setGetFarmerId] = useState(location.state?.data?.farmer_id);
  const [getRemark, setGetRemark] = useState(location.state?.data?.remark || "");
  const request_id = location.state?.data?.request_id;

  const [fileList, setFileList] = useState([]); // ✅ ไฟล์ที่จะแสดง/อัปโหลด


  const [fileListReceive, setFileListReceive] = useState([]);
  const fileUploadRef = useRef(null);
  const fileUploadRefReceive = useRef(null);
  const [formCustom] = Form.useForm();

  // 1) ✅ เซ็ตไฟล์เริ่มต้นจาก location.state.data.fileList
  useEffect(() => {
    const initialFiles = location?.state?.data?.fileList ?? [];
    if (!Array.isArray(initialFiles)) return;

    const normalized = initialFiles.map((f) => ({
      uid: f.uid || `${Date.now()}-${Math.random()}`,
      name: f.name || (f.url ? f.url.split("/").pop() : "file"),
      status: f.status || "done",
      url: f.url,
    }));

    setFileList(normalized);
  }, [location?.state?.data?.fileList]);

  useEffect(() => {
    const initialFiles = location?.state?.data?.fileListReceive ?? [];
    if (!Array.isArray(initialFiles)) return;

    const normalized = initialFiles.map((f) => ({
      uid: f.uid || `${Date.now()}-${Math.random()}`,
      name: f.name || (f.url ? f.url.split("/").pop() : "file"),
      status: f.status || "done",
      url: f.url,
    }));

    setFileListReceive(normalized);
  }, [location?.state?.data?.fileListReceive]);


  // 2) เซ็ตตารางรายการสินค้า/อื่น ๆ
  useEffect(() => {
    const data = location?.state?.data;
    if (data) {
      setDataSource(data.products || []);
      setDataSourceOther(data.others || []);
    }
  }, [location?.state?.data]);

  // 3) โหลด master (sale / dealer / sub-dealer) เพื่อแสดงชื่อใน FormCustom (readonly)
  useEffect(() => {
    const isFarmerMode = location.pathname.includes("farmer-points-list") || location?.state?.data?.is_farmer;
    const getMaster = async () => {
      setLoading(true);
      try {
        const [sale, dealer, sub_dealer, farmer] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown, { status: "" }),
          getUserId ? useServiceAPI.get(paths.pathMasterDealerDropdown, { user_id: getUserId }) : Promise.resolve({ data: [] }),
          getDealerId ? useServiceAPI.get(paths.pathUserLineSubDealer, { dealer_id: getDealerId }) : Promise.resolve({ data: [] }),
          getSubDealerId
            ? useServiceAPI.get(paths.pathUserLineFarmer, { sub_dealer_id: getSubDealerId, platform: "web" })
            : useServiceAPI.get(paths.pathUserLineFarmer, { platform: "web" }),
        ]);

        setDataSale(sale.data || []);
        setDataDealer(dealer.data || []);
        setSubDataDealer(sub_dealer.data || []);

        const list = Array.isArray(farmer?.data?.data) ? farmer.data.data : Array.isArray(farmer?.data) ? farmer.data : [];
        const normalized = list.map((item) => {
          const id = item.id || item.farmer_id;
          const name = item.name || item.farmer_name || String(id || "");
          return {
            id,
            name,
            value: id,
            label: name,
          };
        });
        setDataFarmer(normalized);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    if ((getUserId && getDealerId) || isFarmerMode) getMaster();
  }, [getUserId, getDealerId, getSubDealerId]);

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 10 },
    { title: "SKU", dataIndex: "product_code", key: "product_code" },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: isFarmerMode ? "Pack Size" : "Unit", dataIndex: "product_unit", key: "product_unit" },
    {
      title: isFarmerMode ? "THB/Pack Size" : "THB/Unit",
      dataIndex: "product_unit_thb",
      key: "product_unit_thb",
      render: (text) => parseFloat(String(text || 0).replace(/,/g, "")).toLocaleString("en-US", { minimumFractionDigits: 2 }),
    },
    {
      title: <div className="text-center">{isFarmerMode ? "No of Pack" : "QTY (ctn)"}</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => (
        <div className="text-center">{parseFloat(text || 0).toLocaleString("en-US")}</div>
      ),
    },
    // {
    //   title: <div className="text-center">Value (ctn)</div>,
    //   dataIndex: "foc",
    //   key: "foc",
    //   render: (text) => (
    //     <div className="text-center">{parseFloat(text || 0).toLocaleString("en-US")}</div>
    //   ),
    // },
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

  const footerOrderList = () => {
    const totalQuantity = dataSource.reduce(
      (total, item) => total + parseFloat(item.quantity || 0),
      0
    );
    const totalFOC = dataSource.reduce(
      (total, item) => total + parseFloat(item.foc || 0),
      0
    );
    const totalAmount = dataSource.reduce(
      (total, item) => total + parseFloat(item.net_amount || 0),
      0
    );
    const totalPoint = dataSource.reduce(
      (total, item) => total + parseFloat(item.point || 0) * parseFloat(item.quantity || 0),
      0
    );

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp;| QTY (ctn): {totalQuantity} &nbsp; | Total: 
          {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} |
          Total Point: {dataSource.reduce((total, item) => total + (parseFloat(item.point || 0) * parseFloat(item.quantity || 0)), 0).toLocaleString("en-US")}
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
    isFarmer && {
      key: "farmer",
      label: "Farmer",
      name: "farmer",
      type: "select",
      disabled: true,
      options: dataFarmer,
      placeholder: "",
      value: getFarmerId,
    },
    {
      key: "order_no",
      label: "Order No",
      name: "order_no",
      type: "text",
      disabled: true,
      placeholder: "Generate order no",
      value: "",
    },
    {
      key: "order_date",
      label: "Date",
      name: "order_date",
      type: "text",
      disabled: true,
      placeholder: dayjs().format("YYYY-MM-DD"),
      value: "",
    },
  ].filter(Boolean);

  const formatDate = (date) => {
    if (!date || !date.$d) return "";
    const d = new Date(date.$d);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSaveOrder = () => {
    const formattedDate = formatDate(getDocumentDate) || getDocumentDate;
    const isFarmer = location.state?.data?.is_farmer;
    const backPath = location.state?.data?.back_path || "/points/line/sales-points-list";

    const body = {
      document_date: formattedDate,
      user_id: getUserId,
      status_code: "ODW",
      dealer_id: getDealerId,
      sub_dealer_id: getSubDealerId,
      farmer_id: getFarmerId,
      remark: getRemark,
      products: dataSource,
      others: dataSourceOther,
      request_id,
      bill: fileList.map((f) => f.url), // ✅ URL รูปที่เลือก/อัปโหลด
      product: fileListReceive.map((f) => f.url), // ✅ URL รูปที่เลือก/อัปโหลด
      ...(isFarmer ? { mode: "farmer", type: "farmer" } : {}),
    };

    if (dataSource.length > 0) {
      const saveOrder = async () => {
        setLoading(true);
        try {
          const [response] = await Promise.all([
            useServiceAPI.post(paths.pathSalePointOrderCreate, body),
          ]);

          showNotification("success", response.data.message, response.data.message_line).then(() => {
            navigate(backPath);
          });
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาด");
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

      saveOrder();
    } else {
      showNotification("warning", "โปรดเลือกรายการ อย่างน้อย 1 รายการ", "");
    }
  };

  const handleSaveOrderComplete = () => {
    const formattedDate = formatDate(getDocumentDate);
    const isFarmer = location.state?.data?.is_farmer;
    const backPath = location.state?.data?.back_path || "/points/line/sales-points-list";

    const body = {
      document_date: formattedDate,
      user_id: getUserId,
      status_code: "ODC", // ✅ Receive ส่ง ODW
      dealer_id: getDealerId,
      sub_dealer_id: getSubDealerId,
      farmer_id: getFarmerId,
      remark: getRemark,
      products: dataSource,
      others: dataSourceOther,
      request_id,
      bill: fileList.map((f) => f.url),
      product: fileListReceive.map((f) => f.url),
      platform: "web",
      ...(isFarmer ? { mode: "farmer", type: "farmer" } : {}),
    };

    if (dataSource.length > 0) {
      const saveOrder = async () => {
        setLoading(true);
        try {
          const response = await useServiceAPI.post(
            paths.pathSalePointOrderCreate,
            body
          );

          showNotification(
            "success",
            response.data.message,
            response.data.message_line
          ).then(() => {
            navigate(backPath);
          });
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาด");
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

      saveOrder();
    } else {
      showNotification("warning", "โปรดเลือกรายการ อย่างน้อย 1 รายการ", "");
    }
  };

  const backCreatePath = isFarmer ? "/points/line/farmer-points-list/create" : "/points/line/sales-points-list/create";

  return (
    <MainLayout loading={loading}>
      <div className="title-page">
        {isFarmer ? "Sales Point Order Detail (Farmer)" : "Sales Point Order Detail"}
      </div>

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

      <UploadSection
        title="Attached file/Picture"
        fileUploadRef={fileUploadRef}
        fileList={fileList}
        handleUploadClick={() => { }}
        handleUploadSuccess={() => { }}
        handleFileRemove={() => { }}
        modeUpload="activity"
        disabled={true}  // view-only
      />

      <UploadSection
        title="Attached file/Picture (Customer)"
        fileUploadRef={fileUploadRefReceive}
        fileList={fileListReceive}
        handleUploadClick={() => { }}
        handleUploadSuccess={() => { }}
        handleFileRemove={() => { }}
        modeUpload="receive"  // ตั้งให้ต่างจาก bill เผื่อ BE ใช้แยกประเภท
        disabled={true}  // view-only
      />

      <BoxPrimary title="Remark">
        <Input.TextArea placeholder="" value={getRemark} disabled className="bg-gray-100" />
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-4">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() =>
            navigate(backCreatePath, {
              state: {
                data: location?.state?.data,
              },
            })
          }
        />
        <ActionButton mode="save" text="Order" onClick={handleSaveOrder} />
      </div>
    </MainLayout>
  );
}
