import React, { useState, useEffect, useContext } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButton from "../../components/button/ActionButton";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Form, Input, Select } from "antd";
import TableComponent from "../../components/table/TableComponent";
import FormUser from "../../components/form_user/FormUser";
import DynamicModal from "../../components/modal/DynamicModal";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";

export default function EditOrder() {
  const navigate = useNavigate();
  const location = useLocation();

  const { showMsg, showNotification, userInfo } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);

  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);
  const [searchProductData, setSearchProductData] = useState([]);
  const [getOtherProductData, setGetOtherProductData] = useState([]);

  const [documentNumber] = useState(location.state.document_number);
  const [dataOrderDetail, setDataOrderDetail] = useState([]);
  const [getUserId, setGetUserId] = useState("");
  const [getDealerId, setGetDealerId] = useState("");
  const [inputRemark, setInputRemark] = useState("");
  const [editingPriceKeys, setEditingPriceKeys] = useState({});
  const [formCustom] = Form.useForm();

  const canEditProduct = ["1", "7"].includes(String(userInfo?.role_id));

  const toNumber = (value, defaultValue = 0) => {
    const num = parseFloat(String(value ?? "").replace(/,/g, ""));
    return Number.isFinite(num) ? num : defaultValue;
  };

  const formatMoney = (value) =>
    toNumber(value, 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const isNumberOnly = (value) => /^\d+$/.test(String(value));

  const alertNumberOnly = () => {
    showMsg("warning", "กรุณากรอกตัวเลขเท่านั้น");
  };

  const handleNumberKeyDown = (e) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
      "Enter",
    ];

    if (allowedKeys.includes(e.key)) return;

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      alertNumberOnly();
    }
  };
  const isDecimalOnly = (value) => /^\d*\.?\d*$/.test(String(value));

  const handlePriceKeyDown = (e) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
      "Enter",
    ];

    if (allowedKeys.includes(e.key)) return;

    if (e.key === "." && !String(e.target.value).includes(".")) return;

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      alertNumberOnly();
    }
  };

  const handleUnitPriceInput = (key, value) => {
    if (value === "") {
      handleUnitPriceChange(key, "");
      return;
    }

    if (!isDecimalOnly(value)) {
      alertNumberOnly();
      return;
    }

    handleUnitPriceChange(key, value);
  };
  useEffect(() => {
    const loadDataOrderDetail = async () => {
      setLoading(true);

      try {
        const [orderDetail] = await Promise.all([
          useServiceAPI.get(paths.pathGetOrderDetail, {
            document_number: documentNumber,
          }),
        ]);

        const detail = orderDetail.data || {};

        setDataOrderDetail(detail);
        setGetUserId(detail.user_id);
        setGetDealerId(detail.dealer_id);
        setInputRemark(detail.ref_remark || "");

        setDataSource(
          (detail.products || []).map((item, index) => {
            const quantity = parseInt(item.quantity || 0, 10);
            const price = toNumber(item.product_unit_thb || item.bath_unit || 0);
            const netAmount = toNumber(item.net_amount, quantity * price);

            return {
              ...item,
              no: index + 1,
              key: index + 1,
              product_unit_thb: price,
              quantity,
              foc: parseInt(item.foc || 0, 10),
              net_amount: netAmount.toFixed(2),
              action: Array.isArray(item.action) ? item.action : [],
            };
          })
        );

        setDataSourceOther(
          (detail.others || []).map((item, index) => {
            const quantity = parseInt(item.quantity || 1, 10);
            const price = toNumber(item.product_unit_thb || item.value || 0);
            const netAmount = toNumber(item.net_amount, quantity * price);

            return {
              ...item,
              no: index + 1,
              key: index + 1,
              product_unit: item.product_unit,
              product_unit_thb: price,
              quantity,
              net_amount: netAmount.toFixed(2),
            };
          })
        );
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadDataOrderDetail();
  }, [documentNumber]);

  const handleEditPrice = (key) => {
    if (!canEditProduct) return;
    setEditingPriceKeys((prev) => ({ ...prev, [key]: true }));
  };

  const handleUnitPriceChange = (key, value) => {
    if (!canEditProduct) return;

    setDataSource((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        const quantity = toNumber(item.quantity, 0);
        const price = toNumber(value, 0);

        return {
          ...item,
          product_unit_thb: value,
          net_amount: (quantity * price).toFixed(2),
        };
      })
    );
  };

  const handleDeleteProductRow = (key) => {
    setDataSource((prev) =>
      prev
        .filter((item) => item.key !== key)
        .map((item, index) => ({ ...item, key: index + 1, no: index + 1 }))
    );
  };

  const handleQuantityChange = (key, newQuantity) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key !== key) return item;

        const quantity = Math.max(0, parseInt(newQuantity || 0, 10));
        const price = toNumber(item.product_unit_thb, 0);
        const minFoc = parseInt(item.product_campaign_order_min_foc || 0, 10);
        const foc = minFoc > 0 ? parseInt(quantity / minFoc, 10) : 0;

        return {
          ...item,
          quantity,
          net_amount: (quantity * price).toFixed(2),
          foc,
        };
      })
    );
  };

  const handleQuantityInput = (key, value, minValue = 0, type = "product") => {
    if (value === "") {
      if (type === "other") handleQuantityChangeOther(key, minValue);
      else handleQuantityChange(key, minValue);
      return;
    }

    if (!isNumberOnly(value)) {
      alertNumberOnly();
      return;
    }

    if (type === "other") handleQuantityChangeOther(key, parseInt(value, 10));
    else handleQuantityChange(key, parseInt(value, 10));
  };

  const handleQuantityChangeOther = (key, newQuantity) => {
    setDataSourceOther((prevData) =>
      prevData.map((item) => {
        if (item.key !== key) return item;

        const quantity = Math.max(1, parseInt(newQuantity || 1, 10));
        const price = toNumber(item.product_unit_thb, 0);

        return {
          ...item,
          quantity,
          net_amount: (quantity * price).toFixed(2),
        };
      })
    );
  };

  const handleDeleteOtherRow = (key) => {
    setDataSourceOther((prev) =>
      prev
        .filter((item) => item.key !== key)
        .map((item, index) => ({ ...item, no: index + 1, key: index + 1 }))
    );
  };

  const handleOpenTeamModal = () => {
    setGetOtherProductData([]);

    const loadProductDetail = async () => {
      setLoading(true);

      try {
        const [otherProduct] = await Promise.all([
          useServiceAPI.get(paths.pathMasterPromotionList, {
            page_size: 10,
            page_length: 1,
          }),
        ]);

        const productData = otherProduct.data.data.map((data, index) => ({
          key: data.id,
          no: index + 1,
          name: data.name,
          unit: data.unit,
          value: toNumber(data.value, 0),
        }));

        setGetOtherProductData(productData);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadProductDetail();
    setIsTeamModalVisible(true);
  };

  const handleCloseTeamModal = () => {
    setGetOtherProductData([]);
    setIsTeamModalVisible(false);
  };

  const handleAddSelectedRows = (selectedRows) => {
    selectedRows.forEach((data) => {
      const loadOtherProductDetail = async () => {
        setLoading(true);

        try {
          const [otherProduct] = await Promise.all([
            useServiceAPI.get(paths.pathMasterPromotionDetail, {
              promotion_id: data.key,
            }),
          ]);

          const productData = otherProduct.data;
          const price = toNumber(productData.value, 0);

          const isDuplicate = dataSourceOther.some(
            (item) => String(item.product_id) === String(productData.id)
          );

          if (isDuplicate) {
            showMsg("warning", `สินค้า ${productData.name} ซ้ำ ไม่สามารถเพิ่มได้`);
            return;
          }

          setDataSourceOther((prev) => [
            ...prev,
            {
              key: prev.length + 1,
              no: prev.length + 1,
              product_id: productData.id,
              product_code: "",
              product_name: productData.name,
              product_unit: productData.unit,
              product_unit_thb: price,
              quantity: 1,
              net_amount: price.toFixed(2),
            },
          ]);
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาด");
        } finally {
          setLoading(false);
        }
      };

      loadOtherProductDetail();
    });
  };

  const formFieldData = [
    {
      label: "Sales",
      name: "sale",
      type: "text",
      disabled: true,
      placeholder: dataOrderDetail.user_name,
      value: dataOrderDetail.user_name,
    },
    {
      label: "Dealer",
      name: "dealer",
      type: "text",
      disabled: true,
      placeholder: dataOrderDetail.dealer_name,
      value: dataOrderDetail.dealer_name,
    },
    {
      label: "Order No",
      name: "order_no",
      type: "text",
      disabled: true,
      placeholder: dataOrderDetail.document_number,
      value: dataOrderDetail.document_number,
    },
    {
      label: "Date",
      name: "order_date",
      type: "date",
      disabled: true,
      placeholder: "",
      value: dataOrderDetail.document_date,
    },
  ];

  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "product_code", key: "product_code" },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
    {
      title: "THB/Unit",
      dataIndex: "product_unit_thb",
      key: "product_unit_thb",
      render: (text, record) => {
        const isEditing = editingPriceKeys[record.key];

        if (canEditProduct && isEditing) {
          return (
            <Input
              inputMode="decimal"
              value={record.product_unit_thb}
              onKeyDown={handlePriceKeyDown}
              onChange={(e) => handleUnitPriceInput(record.key, e.target.value)}
              onPressEnter={(e) => {
                handleUnitPriceInput(record.key, e.target.value);
                setEditingPriceKeys((prev) => ({
                  ...prev,
                  [record.key]: false,
                }));
                e.target.blur();
              }}
              onBlur={() =>
                setEditingPriceKeys((prev) => ({
                  ...prev,
                  [record.key]: false,
                }))
              }
              className="border border-solid border-[#00783F] text-[#00783F] text-right w-28"
            />
          );
        }

        return formatMoney(text);
      },
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
            onClick={() => handleQuantityChange(record.key, record.quantity - 1)}
          />

          <Input
            inputMode="numeric"
            value={record.quantity}
            onKeyDown={handleNumberKeyDown}
            onChange={(e) => handleQuantityInput(record.key, e.target.value, 0, "product")}
            onPressEnter={(e) => {
              handleQuantityInput(record.key, e.target.value, 0, "product");
              e.target.blur();
            }}
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
    { title: "FOC (ctn)", dataIndex: "foc", key: "foc" },
    {
      title: "Sub Total (THB)",
      dataIndex: "net_amount",
      key: "net_amount",
      render: (text) => formatMoney(text),
    },
    {
      title: <div className="text-center">Action</div>,
      key: "action",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-3">
          <img
            src="/img/icons/delete.png"
            alt="delete"
            className="cursor-pointer w-6 h-6"
            onClick={() => handleDeleteProductRow(record.key)}
          />

          {canEditProduct && (
            <img
              src="/img/icons/edit.png"
              alt="edit"
              className="cursor-pointer w-6 h-6"
              onClick={() => handleEditPrice(record.key)}
            />
          )}
        </div>
      ),
    },
  ];

  const headerOther = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
    {
      title: <div className="text-center">QTY</div>,
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <div className="quantity-control flex justify-center items-center">
          <img
            src="/img/icons/collapse.png"
            alt="decrease"
            className="cursor-pointer w-6 h-6"
            onClick={() => handleQuantityChangeOther(record.key, record.quantity - 1)}
          />

          <Input
            inputMode="numeric"
            value={record.quantity}
            onKeyDown={handleNumberKeyDown}
            onChange={(e) => handleQuantityInput(record.key, e.target.value, 1, "other")}
            onPressEnter={(e) => {
              handleQuantityInput(record.key, e.target.value, 1, "other");
              e.target.blur();
            }}
            className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20"
          />

          <img
            src="/img/icons/expand.png"
            alt="increase"
            className="cursor-pointer w-6 h-6"
            onClick={() => handleQuantityChangeOther(record.key, record.quantity + 1)}
          />
        </div>
      ),
    },
    {
      title: "Value (THB)",
      dataIndex: "net_amount",
      key: "net_amount",
      render: (text) => formatMoney(text),
    },
    {
      title: <div className="text-center">Action</div>,
      key: "action",
      render: (_, record) => (
        <button onClick={() => handleDeleteOtherRow(record.key)} className="delete-button">
          <img src="/img/icons/delete.png" alt="delete" className="cursor-pointer w-6 h-6" />
        </button>
      ),
    },
  ];

  const footerOrderList = () => {
    const totalQuantity = dataSource.reduce((total, item) => total + toNumber(item.quantity, 0), 0);
    const totalFOC = dataSource.reduce((total, item) => total + toNumber(item.foc, 0), 0);
    const totalAmount = dataSource.reduce((total, item) => total + toNumber(item.net_amount, 0), 0);

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp; QTY (ctn): {totalQuantity}+{totalFOC}
          &nbsp; Total: {formatMoney(totalAmount)}
        </td>
      </tr>
    );
  };

  const footerOther = () => {
    const totalQuantity = dataSourceOther.reduce(
      (total, item) => total + toNumber(item.quantity, 0),
      0
    );
    const totalAmount = dataSourceOther.reduce(
      (total, item) => total + toNumber(item.net_amount, 0),
      0
    );

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={6} className="text-right pr-2 text-white">
          Item : {dataSourceOther.length} &nbsp;&nbsp; QTY : {totalQuantity}
          &nbsp;&nbsp; Total : {formatMoney(totalAmount)}
        </td>
      </tr>
    );
  };

  const onChangeProduct = (value) => {
    setSearchProductData([]);

    const isDuplicateById = dataSource.some((item) => String(item.product_id) === String(value));

    if (isDuplicateById) {
      showMsg("warning", "Product นี้มีอยู่ในรายการแล้ว ไม่สามารถเพิ่มซ้ำได้");
      return;
    }

    const loadProductDetail = async () => {
      setLoading(true);

      try {
        const [productDetail] = await Promise.all([
          useServiceAPI.get(paths.pathMasterProductDetail, {
            product_id: value,
          }),
        ]);

        const data = productDetail.data;

        const isDuplicate = dataSource.some(
          (item) =>
            String(item.product_id) === String(data.id) ||
            String(item.product_code) === String(data.product_code)
        );

        if (isDuplicate) {
          showMsg("warning", `Product ${data.product_name} มีอยู่ในรายการแล้ว ไม่สามารถเพิ่มซ้ำได้`);
          return;
        }

        const price = toNumber(data.bath_unit, 0);
        const minFoc = parseInt(data.product_campaign_order_min_foc || 0, 10);

        const newProductDataDetail = {
          key: dataSource.length + 1,
          no: dataSource.length + 1,
          product_id: data.id,
          product_code: data.product_code,
          product_name: data.product_name,
          product_unit: data.packing_list,
          product_unit_thb: price,
          product_campaign_order_min_foc: data.product_campaign_order_min_foc,
          product_campaign_foc: data.product_campaign_foc,
          quantity: 1,
          foc: minFoc > 0 ? parseInt(1 / minFoc, 10) : 0,
          net_amount: price.toFixed(2),
          action: [],
        };

        setDataSource((prev) =>
          [...prev, newProductDataDetail].map((item, index) => ({
            ...item,
            key: index + 1,
            no: index + 1,
          }))
        );
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadProductDetail();
  };

  const onSearchProduct = (value) => {
    if (value.length < 3) {
      setSearchProductData([]);
      return;
    }

    const loadProducts = async () => {
      setLoading(true);

      try {
        const [product] = await Promise.all([
          useServiceAPI.get(paths.pathMasterProducts, {
            keyword: value,
          }),
        ]);

        const newProductData = product.data.map((data) => ({
          value: data.id,
          productName: data.name,
          label: (
            <div className="flex justify-between items-center gap-2">
              <span>{data.name}</span>

              {canEditProduct && (
                <button
                  type="button"
                  className="text-[#00783F] border border-[#00783F] px-2 py-1 rounded text-xs hover:bg-[#00783F] hover:text-white"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/setting/product/edit/${data.id}`);
                  }}
                >
                  Edit
                </button>
              )}
            </div>
          ),
        }));

        setSearchProductData(newProductData);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  };

  const formatDate = (date) => {
    if (!date || !date.$d) return "";
    const d = new Date(date.$d);
    return d.toISOString().split("T")[0];
  };

  const handleSaveOrder = () => {
    formCustom
      .validateFields()
      .then((values) => {
        const formattedDate = formatDate(values.order_date);

        const body = {
          document_number: documentNumber,
          document_date: formattedDate,
          user_id: getUserId,
          dealer_id: getDealerId,
          remark: inputRemark,
          products: dataSource,
          others: dataSourceOther,
        };

        const saveOrder = async () => {
          setLoading(true);

          try {
            const [response] = await Promise.all([
              useServiceAPI.put(paths.pathGetOrderUpdate, body),
            ]);

            showNotification("success", response.data.message, response.data.message_line).then(
              () => {
                navigate("/order/list");
              }
            );
          } catch (error) {
            showMsg("error", error.message || "เกิดข้อผิดพลาด");
          } finally {
            setLoading(false);
          }
        };

        saveOrder();
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Order</div>

      <FormUser fields={formFieldData} form={formCustom} />

      <BoxPrimary title="Product">
        <div className="mb-3 flex justify-end">
          <Select
            showSearch
            placeholder="Search Product"
            optionFilterProp="productName"
            optionLabelProp="productName"
            className="w-full"
            value={undefined}
            onChange={onChangeProduct}
            onSearch={onSearchProduct}
            options={searchProductData}
          />
        </div>
      </BoxPrimary>

      <BoxPrimary title="Order List">
        <TableComponent
          header={header}
          dataSource={dataSource}
          pageSize={10}
          footer={footerOrderList}
        />
      </BoxPrimary>

      <BoxPrimary>
        <div className="flex justify-between space-x-4 mb-3">
          <span className="text-[#00783F] text-lg font-semibold">Other</span>

          <div className="flex space-x-2">
            <ActionButton mode="add" text="Add" onClick={handleOpenTeamModal} />
          </div>
        </div>

        <TableComponent
          header={headerOther}
          dataSource={dataSourceOther}
          pageSize={10}
          footer={footerOther}
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
        <ActionButton mode="back" text="Back" onClick={() => navigate("/order/list")} />
        <ActionButton mode="save" text="Confirm" onClick={handleSaveOrder} />
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