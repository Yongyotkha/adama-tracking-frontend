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

export default function SalesPointDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg, showNotification } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);

  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSubDealer, setSubDataDealer] = useState([]);

  const [getDocumentDate, setGetDocumentDate] = useState(
    location.state?.data?.document_date
  );
  const [getUserId, setGetUserId] = useState(location.state?.data?.user_id);
  const [getDealerId, setGetDealerId] = useState(location.state?.data?.dealer_id);
  const [getSubDealerId, setGetSubDealerId] = useState(location.state?.data?.sub_dealer_id);
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
    const getMaster = async () => {
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

    if (getUserId && getDealerId) getMaster();
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
      title: <div className="text-center">FOC (ctn)</div>,
      dataIndex: "foc",
      key: "foc",
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

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp; QTY (ctn): {totalQuantity}+{totalFOC} &nbsp; Total:{" "}
          {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
  ];

  const formatDate = (date) => {
    if (!date || !date.$d) return "";
    const d = new Date(date.$d);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSaveOrder = () => {
    const formattedDate = formatDate(getDocumentDate);
    const body = {
      document_date: formattedDate,
      user_id: getUserId,
      status_code: "ODW",
      dealer_id: getDealerId,
      sub_dealer_id: getSubDealerId,
      remark: getRemark,
      products: dataSource,
      others: dataSourceOther,
      request_id,
      bill: fileList.map((f) => f.url), // ✅ URL รูปที่เลือก/อัปโหลด
      product: fileListReceive.map((f) => f.url), // ✅ URL รูปที่เลือก/อัปโหลด
    };

    if (dataSource.length > 0) {
      const saveOrder = async () => {
        setLoading(true);
        try {
          const [response] = await Promise.all([
            useServiceAPI.post(paths.pathSalePointOrderCreate, body),
          ]);

          showNotification("success", response.data.message, response.data.message_line).then(() => {
            navigate("/points/line/sales-points-list");
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

  const handleUploadClick = () => {
    if (fileUploadRef.current) fileUploadRef.current.triggerUpload();
  };

  // เมื่ออัปโหลดสำเร็จ ให้เพิ่มไฟล์เข้า list (เอา url จริงจาก API)
  const handleUploadSuccess = (response) => {
    const data = response.data;
    const uploaded = {
      uid: data.file_key,
      name: data.file_name,
      status: "done",
      url: data.file_url,
    };
    setFileList((prev) => [...prev, uploaded]);
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">View Detail</div>

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

      <BoxPrimary>


        {/* ✅ ส่งไฟล์เข้า FileUploadComponent โดยไม่แก้ FileUploadComponent */}
        <FileUploadComponent
          ref={fileUploadRef}
          dataFile={fileList}                 // child จะ sync เข้า state ภายในผ่าน useEffect
          onUploadSuccess={handleUploadSuccess}
          mode="edit"                         // ให้ลบได้
          modeUpload="activity"               // ตามที่ component ใช้ส่งไป API
        />
      </BoxPrimary>

      <BoxPrimary>


        {/* ✅ ส่งไฟล์เข้า FileUploadComponent โดยไม่แก้ FileUploadComponent */}
        <FileUploadComponent
          ref={fileUploadRefReceive}
          dataFile={fileListReceive}                 // child จะ sync เข้า state ภายในผ่าน useEffect
          onUploadSuccess={handleUploadSuccess}
          mode="edit"                         // ให้ลบได้
          modeUpload="activity"               // ตามที่ component ใช้ส่งไป API
        />
      </BoxPrimary>


      <BoxPrimary title="Remark">
        <Input.TextArea placeholder="" value={getRemark} disabled className="bg-gray-100" />
      </BoxPrimary>

      <div className="flex justify-end space-x-4 mt-4">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() =>
            navigate("/points/line/sales-points-list/create", {
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
