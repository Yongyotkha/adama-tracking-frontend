import React, { useEffect, useState, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormCustom from "../../../components/form_custom/FormCustom";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Form, Modal, Button, Input } from "antd";
import TableComponent from "../../../components/table/TableComponent";
import AddOrderModal from "../../../components/modal/AddOrderModal";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import dayjs from "dayjs";
import { AuthContext } from "../../../contexts/AuthContext";

export default function CreateClaimRequest() {
  const { showMsg, showNotification } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isAddOrderModalVisible, setIsAddOrderModalVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const navigate = useNavigate();
  const [formCustom] = Form.useForm();
  // State for Order List table data
  const [dataSource, setDataSource] = useState([]);
  const [dataClaim, setDataClaim] = useState([]);
  const [formValues, setFormValues] = useState({});

  const formFields = [
    { 
      label: "Sale", 
      name: "sale", 
      type: "select", 
      options: dataSale, 
      disabled: false, 
      required: false, 
      value: dataClaim?.sale ?? "",
    },
    { 
      label: "Dealer", 
      name: "dealer", 
      type: "select", 
      options: dataDealer, 
      disabled: false, 
      required: false, 
      value: dataClaim?.dealer ?? "" 
    },
    { label: "Claim No", name: "claim_no", type: "text", disabled: true, required: false, value: "Generate Auto" },
    { label: "Create Date", name: "create_date", type: "date", disabled: false, required: true, value: "" },
  ];

  // Get Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [sale] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown, {
            status: "",
          }),
        ]);

        setDataSale(sale.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  const handleChange = (filter, value) => {
    if (filter == 'sale') {
      dataClaim.sale = value;
      const getMasterDealer = async () => {
        setLoading(true);
        try {
          const [dealer] = await Promise.all([
            useServiceAPI.get(paths.pathMasterDealerDropdown, {
              user_id: value,
            }),
          ]);

          setDataDealer(dealer.data);
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาด");
        } finally {
          setLoading(false);
        }
      };

      getMasterDealer();
    }
  };

  const handleQuantityChange = (key, newQuantity) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === key) {
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 0 };
        }
        return item;
      })
    );
  };

  const handleViewClick = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent("");
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no", align: "center" },
    { title: "SKU", dataIndex: "sku", key: "sku", align: "center" },
    { title: "Product Name", dataIndex: "productName", key: "productName", align: "center" },
    { title: "Lot No", dataIndex: "lotNo", key: "lotNo", align: "center" },
    { title: "Reason", dataIndex: "reason", key: "reason", align: "center" },
    {
      title: <div className="text-center">QTY (ctn)</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <div className="quantity-control flex justify-between items-center">
          <img src="/img/icons/collapse.png" alt="+" className="cursor-pointer w-6 h-6" onClick={() => handleQuantityChange(record.key, record.quantity - 1)} />
          <Input
            inputMode="numeric"
            min={0}
            value={record.quantity}
            onChange={(e) => handleQuantityChange(record.key, parseInt(e.target.value) || 0)}
            id={`qty-${record.product.id}`} 
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 min-w-24"
          />
          <img src="/img/icons/expand.png" alt="+" className="cursor-pointer w-6 h-6" onClick={() => handleQuantityChange(record.key, record.quantity + 1)} />
        </div>
      ),
    },
    {
      title: <div className="text-center">Label</div>,
      key: "label",
      render: (_, record) => (
        record.url_label ?
        <button className="view-button flex justify-center mx-auto" onClick={() => handleViewClick(record.url_label)}>
          <img src="/img/icons/view-table.png" alt="view" className="w-6 h-6" />
        </button>
        : "-"
      ),
    },
    {
      title: <div className="text-center">Product</div>,
      key: "product",
      render: (_, record) => (
        record.url_product ?
        <button className="view-button flex justify-center mx-auto" onClick={() => handleViewClick(record.url_product)}>
          <img src="/img/icons/view-table.png" alt="view" className="w-6 h-6" />
        </button>
        : "-"
      ),
    },
    {
      title: <div className="text-center">Overall</div>,
      key: "overall",
      render: (_, record) => (
        record.url_overall ?
        <button className="view-button flex justify-center mx-auto" onClick={() => handleViewClick(record.url_overall)}>
          <img src="/img/icons/view-table.png" alt="view" className="w-6 h-6" />
        </button>
        : "-"
      ),
    },
    {
      title: <div className="text-center">Other</div>,
      key: "other",
      render: (_, record) => (
        record.url_other ?
        <button className="view-button flex justify-center mx-auto" onClick={() => handleViewClick(record.url_other)}>
          <img src="/img/icons/view-table.png" alt="view" className="w-6 h-6" />
        </button>
        : "-"
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
            onClick={() => setDataSource(dataSource.filter((item) => item.key !== record.key))}
          />
        </button>
      ),
    },
  ];

  const footerOrderList = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={11} className="text-right pr-2 text-white">
        Item: {dataSource.length} &nbsp; QTY (ctn): {dataSource.reduce((total, item) => total + item.quantity, 0)}
      </td>
    </tr>
  );

  const handleShowAddOrderModal = () => {
    setIsAddOrderModalVisible(true);
  };

  const handleCloseAddOrderModal = () => {
    setIsAddOrderModalVisible(false);
  };

  const handleAdd = (data) => {
    handleCloseAddOrderModal();
    const key = dataSource.length + 1;
    const newData = {
      key: key,
      no: key,
      sku: data.product.product_code,
      productName: data.product.product_name,
      product: data.product,
      lotNo: data.lotNo,
      reason: data.reason ?? "",
      url_label: data.files.labels[0],
      url_product: data.files.products[0],
      url_overall: data.files.overall[0],
      url_other: data.files.others[0],
      quantity: 0
    };
    setDataSource((prev) => [...prev, newData]);
  };

  const handleInputChange = (name, value) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value, // Dynamically update the corresponding field's value
    }));
  };

  const saveClaim = () => {
    let allValuesBasic = formCustom.getFieldsValue();
    allValuesBasic.create_date = dayjs(allValuesBasic.create_date).format('YYYY-MM-DD');

    let products = [];
    dataSource.forEach(element => {
      const data = {
        "product_id": element.product.id,
        "product_code": element.product.product_code,
        "product_name": element.product.product_name,
        "product_unit": element.product.packing_list,
        "product_unit_thb": element.product.bath_unit,
        "quantity": document.getElementById(`qty-${element.product.id}`).value,
        "lot_number": element.lotNo,
        "reason": element.reason,
        "label_list": element.url_label ? [element.url_label] : [],
        "product_list": element.url_product ? [element.url_product] : [],
        "overall_list": element.url_overall ? [element.url_overall] : [],
        "other_list": element.url_other ? [element.url_other] : []
      };
      products.push(data);
    });
    const body = {
      "document_date": allValuesBasic.create_date,
      "user_id": allValuesBasic.sale,
      "dealer_id": allValuesBasic.dealer,
      "remark": formValues["remark"],
      "products": products
    };

    useServiceAPI
    .post(paths.pathClaimCreate, body, setLoading)
    .then((response) => {
      const successCallback = () => {
        if(response.result){
          navigate("/expenses/product-claim-list");
        }
      };
      showNotification(
        "success",
        response.data.message,
        response.data.message_line
      ).then(successCallback);

      console.log(response);
      
    })
    .catch((error) => {
      showMsg("error", error.message || "เกิดข้อผิดพลาด");
    });
  }

  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between">
        <div className="title-page">Create Claim Request</div>
      </div>

      {/* Form Section */}
      <FormCustom fields={formFields} form={formCustom} onChange={handleChange} />

      {/* Order List Section */}
      <BoxPrimary>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-lg font-semibold">Order List</span>
          <ActionButton mode="add" text="Add" onClick={handleShowAddOrderModal} />
        </div>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pageSize={10}
          footer={footerOrderList}
        />

        <Modal
          title="Preview"
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={[
            <Button key="close" type="primary" onClick={handleCloseModal}>
              Close
            </Button>,
          ]}
        >
          <div>
            <img
              src={modalContent}
              className=""
            />
          </div>
        </Modal>
      </BoxPrimary>

      {/* Remark Section */}
      <BoxPrimary title="Remark">
        <div className="mb-3 flex justify-end">
          <Input.TextArea placeholder="Remark" rows={2} onChange={(e) => handleInputChange("remark", e.target.value)} value={formValues["remark"] || ""}/>
        </div>
      </BoxPrimary>

      <AddOrderModal
        title="Add Order"
        isVisible={isAddOrderModalVisible}
        onClose={handleCloseAddOrderModal}
        handleAdd={handleAdd}
        width="1200px" // Customize the width to make it extra-large.
      />

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/expenses/product-claim")} />
        <ActionButton mode="save" text="Save" onClick={saveClaim} />
      </div>
    </MainLayout>
  );
}
