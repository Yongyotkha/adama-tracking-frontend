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
import { values } from "lodash";
import { useLocation } from "react-router-dom";
import { ExclamationCircleFilled } from "@ant-design/icons";

export default function CreateClaimRequest() {
  const locationParam = useLocation();
  const searchParams = new URLSearchParams(locationParam.search);
  const pathSegments = location.pathname.split("/");
  const documentNumber = searchParams.get("documentNumber");
  const { confirm } = Modal;

  const { showMsg, showNotification, userInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isAddOrderModalVisible, setIsAddOrderModalVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataProductUnits, setDataProductUnits] = useState([]);
  const navigate = useNavigate();
  const [formCustom] = Form.useForm();
  // State for Order List table data
  const [dataSource, setDataSource] = useState([]);
  const [dataClaim, setDataClaim] = useState([]);
  const [formValues, setFormValues] = useState({});
  const mode = searchParams.get("mode");
  const valueFormCustom = formCustom.getFieldsValue();

  const formFields = [
    {
      label: "Sale",
      name: "sale",
      type: "select",
      options: dataSale,
      disabled: false,
      required: false,
      value: dataClaim?.user_id ?? "",
    },
    {
      label: "Dealer",
      name: "dealer",
      type: "select",
      options: dataDealer,
      disabled: false,
      required: false,
      value: dataClaim?.dealer_id ?? "",
    },
    {
      label: "Claim No",
      name: "claim_no",
      type: "text",
      disabled: true,
      required: false,
      value: dataClaim?.document_number ?? "Generate Auto",
    },
    {
      label: "Create Date",
      name: "create_date",
      type: "date",
      disabled: false,
      required: true,
      value: valueFormCustom?.create_date ?? dayjs().format("YYYY-MM-DD"),
    },
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

    //เชคว่าเป็น mode edit หรือป่าว
    if (documentNumber) {
      const getDetail = async () => {
        setLoading(true);
        try {
          const [claimDetail] = await Promise.all([
            useServiceAPI.get(paths.pathClaimDetail, {
              document_number: documentNumber,
            }),
          ]);

          setDataClaim(claimDetail.data);
          await setupData(claimDetail.data);
        } finally {
          setLoading(false);
        }
      };

      getDetail();
    }
  }, []);

  const setupData = async (data) => {
    const products = data.products;
    let newData = [];
    console.log(products);

    await products.forEach((element) => {
      const key = element.document_item;
      const item = {
        key: key,
        no: key,
        sku: element.product_code,
        productName: element.product_name,
        packsize: element.packing_list ?? "",
        product: element,
        lotNo: element.lot_number,
        reason: element.reason ?? "",
        url_label: element.label_List[0],
        url_product: element.product_list[0],
        url_overall: element.overall_list[0],
        url_other: element.other_list[0],
        quantity: element.quantity,
      };
      newData.push(item);
    });
    setDataSource(newData);
  };

  useEffect(() => {
    if (!documentNumber) {
      const exists = dataSale.some((item) => item.id === userInfo.id);
      if (exists) {
        handleChange("sale", userInfo.id);
        formCustom.setFieldsValue({
          ...values,
          sale: userInfo.id, 
        });
      }
    }
  }, [dataSale]);

  const handleChange = (filter, value) => {
    if (filter == "sale") {
      dataClaim.user_id = value;
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
    } else if (filter == "dealer") {
      dataClaim.dealer_id = value;
    } else if (filter == "create_date") {
      dataClaim.create_date = value;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [product_unit] = await Promise.all([
          useServiceAPI.get(paths.pathMasterProductUnit, {}),
        ]);
        setDataProductUnits(product_unit.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      align: "center",
    },
    {
      title: "Pack Size",
      dataIndex: "packsize",
      key: "packsize",
      align: "center",
    },
    { title: "Batch", dataIndex: "lotNo", key: "lotNo", align: "center" },
    { title: "Reason", dataIndex: "reason", key: "reason", align: "center" },
    {
      title: <div className="text-center">QTY (Unit)</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <div className="quantity-control flex justify-between items-center">
          <img
            src="/img/icons/collapse.png"
            alt="+"
            className="cursor-pointer w-6 h-6"
            onClick={() =>
              handleQuantityChange(record.key, record.quantity - 1)
            }
          />
          <Input
            inputMode="numeric"
            min={0}
            value={Math.floor(record.quantity)}
            onChange={(e) =>
              handleQuantityChange(record.key, parseInt(e.target.value) || 0)
            }
            id={`qty-${record.product.id}`}
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 min-w-24"
          />
          <img
            src="/img/icons/expand.png"
            alt="+"
            className="cursor-pointer w-6 h-6"
            onClick={() =>
              handleQuantityChange(record.key, record.quantity + 1)
            }
          />
        </div>
      ),
    },
    // {
    //   title: <div className="text-center">Product Unit</div>,
    //   dataIndex: "product_unit", // แทนที่ "name" ด้วย "dataIndex"
    //   key: "product_unit",
    //   render: (_, record) => (
    //     <select
    //       className="ant-input css-dev-only-do-not-override-5ck91v ant-input-outlined border border-solid border-[#00783F] text-[#00783F] text-center mx-2 min-w-24"
    //       value={record.product_unit}
    //       onChange={(e) => handleChangeDealer(record.key, e.target.value)}
    //     >
    //       {dataProductUnits.map((product_unit) => (
    //         <option key={product_unit.id} value={product_unit.id}>
    //           {product_unit.name}
    //         </option>
    //       ))}
    //     </select>
    //   ),
    // },
    {
      title: <div className="text-center">Label</div>,
      key: "label",
      render: (_, record) =>
        record.url_label ? (
          <button
            className="view-button flex justify-center mx-auto"
            onClick={() => handleViewClick(record.url_label)}
          >
            <img
              src="/img/icons/view-table.png"
              alt="view"
              className="w-6 h-6"
            />
          </button>
        ) : (
          "-"
        ),
    },
    {
      title: <div className="text-center">Product</div>,
      key: "product",
      render: (_, record) =>
        record.url_product ? (
          <button
            className="view-button flex justify-center mx-auto"
            onClick={() => handleViewClick(record.url_product)}
          >
            <img
              src="/img/icons/view-table.png"
              alt="view"
              className="w-6 h-6"
            />
          </button>
        ) : (
          "-"
        ),
    },
    {
      title: <div className="text-center">Overall</div>,
      key: "overall",
      render: (_, record) =>
        record.url_overall ? (
          <button
            className="view-button flex justify-center mx-auto"
            onClick={() => handleViewClick(record.url_overall)}
          >
            <img
              src="/img/icons/view-table.png"
              alt="view"
              className="w-6 h-6"
            />
          </button>
        ) : (
          "-"
        ),
    },
    {
      title: <div className="text-center">Other</div>,
      key: "other",
      render: (_, record) =>
        record.url_other ? (
          <button
            className="view-button flex justify-center mx-auto"
            onClick={() => handleViewClick(record.url_other)}
          >
            <img
              src="/img/icons/view-table.png"
              alt="view"
              className="w-6 h-6"
            />
          </button>
        ) : (
          "-"
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
            onClick={() =>
              setDataSource(
                dataSource.filter((item) => item.key !== record.key)
              )
            }
          />
        </button>
      ),
    },
  ];

  const footerOrderList = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={13} className="text-right pr-2 text-white">
        Item: {dataSource.length} &nbsp; QTY (Unit):{" "}
        {dataSource.reduce(
          (total, item) => total + Math.floor(item.quantity),
          0
        )}
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
    console.log(data);
    console.log(data.product.packing_list);

    handleCloseAddOrderModal();
    const key = dataSource.length + 1;
    const newData = {
      key: key,
      no: key,
      sku: data.product.product_code,
      productName: data.product.product_name,
      packsize: data.product.packing_list,
      product: data.product,
      lotNo: data.lotNo,
      reason: data.reason ?? "",
      url_label: data.files.labels[0],
      url_product: data.files.products[0],
      url_overall: data.files.overall[0],
      url_other: data.files.others[0],
      quantity: 0,
    };
    setDataSource((prev) => [...prev, newData]);
  };

  const handleInputChange = (name, value) => {
    dataClaim.ref_remark = value;
    setFormValues((prev) => ({
      ...prev,
      [name]: value, // Dynamically update the corresponding field's value
    }));
  };

  const handleApprove = async (documentNumber) => {
    confirm({
      title: "Do you want to approve ?",
      icon: <ExclamationCircleFilled />,
      content: [],
      centered: true, // ตัวเลือกนี้ช่วยจัดให้อยู่กลาง
      async onOk() {
        try {
          // Call API to delete the event
          const response = await useServiceAPI.put(
            `/claim/status?document_number=${encodeURIComponent(
              documentNumber
            )}&status_code=${encodeURIComponent(
              "ODC"
            )}&remark=${encodeURIComponent("อนุมัติ")}`
          );
          if (response.status === 200) {
            // Show success notification
            showNotification(
              "success",
              response.data.message || "Event deleted successfully!",
              response.data.message_line || ["The event has been removed."]
            ).then(() => {
              navigate("/expenses/product-claim-list"); // นำทางไปยังหน้าล็อกอิน
            });
          } else {
            // Show error notification if response is not 200
            console.error("Failed to approve event:", response.message);
            showNotification(
              "error",
              response.message || "Failed to approve event.",
              response.message_line || ["Please try again later."]
            );
          }
        } catch (error) {
          // Handle errors and show an error notification
          console.error("Error approved event:", error);
          showNotification(
            "error",
            "An error occurred while approved the event.",
            ["Please try again later."]
          );
        }
      },
    });
  };

  const saveClaim = () => {
    let allValuesBasic = formCustom.getFieldsValue();
    allValuesBasic.create_date = dayjs(allValuesBasic.create_date).format(
      "YYYY-MM-DD"
    );
    let products = [];

    dataSource.forEach((element) => {
      const selectedProductUnit =
        element.product_unit || dataProductUnits[0]?.id;
      const data = {
        product_id: element.product.product_id ?? element.product.id,
        product_code: element.product.product_code,
        product_name: element.product.product_name,
        product_unit: element.product.packing_list,
        packing_list: element.product.packing_list,
        product_unit_thb: element.product.bath_unit,
        quantity: document.getElementById(`qty-${element.product.id}`).value,
        unit: selectedProductUnit,
        lot_number: element.lotNo,
        reason: element.reason,
        label_list: element.url_label ? [element.url_label] : [],
        product_list: element.url_product ? [element.url_product] : [],
        overall_list: element.url_overall ? [element.url_overall] : [],
        other_list: element.url_other ? [element.url_other] : [],
      };
      products.push(data);
    });
    const body = {
      document_number: documentNumber ?? null,
      document_date: allValuesBasic.create_date,
      user_id: allValuesBasic.sale,
      dealer_id: allValuesBasic.dealer,
      remark: formValues["remark"],
      products: products,
    };
    if (documentNumber) {
      useServiceAPI
        .put(paths.pathClaimUpdate, body, setLoading)
        .then((response) => {
          const successCallback = () => {
            if (response.result) {
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
    } else {
      useServiceAPI
        .post(paths.pathClaimCreate, body, setLoading)
        .then((response) => {
          const successCallback = () => {
            if (response.result) {
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
  };

  const backClaim = () => {
    navigate("/expenses/product-claim-list");
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between">
        <div className="title-page">
          {mode === "approve"
            ? "Approve Claim Request"
            : "Create Claim Request"}
        </div>
      </div>

      {/* Form Section */}
      <FormCustom
        fields={formFields}
        form={formCustom}
        onChange={handleChange}
      />

      {/* Order List Section */}
      <BoxPrimary>
        <div className="flex justify-between mb-4">
          <span className="text-[#00783F] text-lg font-semibold">
            Order List
          </span>
          <ActionButton
            mode="add"
            text="Add"
            onClick={handleShowAddOrderModal}
          />
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
            <img src={modalContent} className="" />
          </div>
        </Modal>
      </BoxPrimary>

      {/* Remark Section */}
      <BoxPrimary title="Remark">
        <div className="mb-3 flex justify-end">
          <Input.TextArea
            placeholder="Remark"
            rows={2}
            onChange={(e) => handleInputChange("remark", e.target.value)}
            value={dataClaim?.ref_remark ?? (formValues["remark"] || "")}
          />
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
        <ActionButton mode="back" text="Back" onClick={backClaim} />
        {/* <ActionButton mode="save" text="Save" onClick={saveClaim} /> */}
        {mode === "approve" ? (
          <ActionButton
            mode="save"
            text="Approve"
            onClick={() => handleApprove(documentNumber)}
          />
        ) : (
          <ActionButton mode="save" text="Save" onClick={saveClaim} />
        )}
      </div>
    </MainLayout>
  );
}
