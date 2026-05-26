import React, { useState, useEffect, useContext } from "react";
import MainLayout from "../../layouts/MainLayout";
import FormCustom from "../../components/form_custom/FormCustom";
import { useNavigate, useLocation } from "react-router-dom";
import ActionButton from "../../components/button/ActionButton";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Form, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableComponent from "../../components/table/TableComponent";
import FormUser from "../../components/form_user/FormUser";
import DynamicModal from "../../components/modal/DynamicModal";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";

export default function EditOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
  const { showMsg, showNotification } = useContext(AuthContext);
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);
  const [searchProductData, setSearchProductData] = useState([]);
  const [getOtherProductData, setGetOtherProductData] = useState([]);

  const [documentNumber, setDocumentNumber] = useState(location.state.document_number);
  const [dataOrderDetail, setDataOrderDetail] = useState([]);
  const [getUserId, setGetUserId] = useState("");
  const [getDealerId, setGetDealerId] = useState("");
  const [inputRemark, setInputRemark] = useState("");
  const [editingPriceKeys, setEditingPriceKeys] = useState({});
  const [formCustom] = Form.useForm();

  // Get Data
  useEffect(() => {
    const loadDataOrderDetail = async () => {
      setLoading(true);
      try {
        const [orderDetail] = await Promise.all([
          useServiceAPI.get(paths.pathGetOrderDetail, {
            document_number: documentNumber,
          }),
        ]);

        // อัปเดต state พร้อมตรวจสอบข้อมูลซ้ำ
        setDataOrderDetail(orderDetail.data);
        setGetUserId(orderDetail.data.user_id);
        setGetDealerId(orderDetail.data.dealer_id);
        setInputRemark(orderDetail.data.ref_remark);
        setDataSource((prev) => {
          const newProducts = orderDetail.data.products.filter(
            (newItem) => !prev.some((prevItem) => prevItem.product_code === newItem.product_code)
          );

          return [
            ...prev,
            ...newProducts.map((item, index) => ({
              ...item,
              no: prev.length + index + 1,
              key: prev.length + index + 1,
              quantity: parseInt(item.quantity),
              action: Array.isArray(item.action) ? item.action : [], // ✅ เพิ่มบรรทัดนี้
            }))
          ];
        });

        setDataSourceOther((prev) => {
          const newOthers = orderDetail.data.others.filter(
            (newItem) => !prev.some((prevItem) => prevItem.product_code === newItem.product_code)
          );

          return [
            ...prev,
            ...newOthers.map((item, index) => ({
              ...item,
              no: prev.length + index + 1,
              key: prev.length + index + 1,
              product_unit: item.product_unit,
              quantity: parseInt(item.quantity),
            })),
          ];
        });

      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    loadDataOrderDetail();
  }, [])

  const hasAction = (record, actionName) => {
    return record?.action?.some(
      (item) =>
        String(item.action).toLowerCase() === actionName.toLowerCase()
    );
  };
  const handleEditPrice = (key) => {
    setEditingPriceKeys((prev) => ({
      ...prev,
      [key]: true,
    }));
  };

  const handleUnitPriceChange = (key, value) => {
    setDataSource((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          const quantity = item.quantity || 0;
          const net_amount = (
            quantity * parseFloat(value || 0)
          ).toFixed(2);

          return {
            ...item,
            product_unit_thb: value,
            net_amount,
          };
        }
        return item;
      })
    );
  };

  // Open Modal
  const handleOpenTeamModal = () => {
    // Set Empty
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

        // State for Order List table data
        const productData = [];
        otherProduct.data.data.map((data, index) => {
          productData.push({
            key: data.id,
            no: index + 1,
            name: data.name,
            unit: data.unit,
            value: data.value
          });
        })

        setGetOtherProductData(productData);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    // Set
    loadProductDetail();
    // Open Modal
    setIsTeamModalVisible(true);
  };

  // Close Modal
  const handleCloseTeamModal = () => {
    // Set Empty
    setGetOtherProductData([]);

    setIsTeamModalVisible(false);
  };

  const handleAddSelectedRows = (selectedRows) => {
    setGetOtherProductData((prev) => {
      const newRows = selectedRows.filter(
        (row) => !prev.some((getOtherProductData) => getOtherProductData.key === row.key)
      );

      return [...prev, ...newRows];
    });

    selectedRows.map((data, index) => {
      // State for Other table data
      const loadOtherProductDetail = async () => {
        setLoading(true);
        try {
          const [otherProduct] = await Promise.all([
            useServiceAPI.get(paths.pathMasterPromotionDetail, {
              promotion_id: data.key,
            }),
          ]);

          // อัปเดต state
          setDataSourceOther((prev) => [
            ...prev,
            {
              key: prev.length + 1, // สร้าง key ใหม่
              no: prev.length + 1, // สร้างเลขลำดับใหม่
              product_id: otherProduct.data.id,
              product_code: "",
              product_name: otherProduct.data.name,
              product_unit: otherProduct.data.unit,
              product_unit_thb: otherProduct.data.value,
              quantity: 1,
              net_amount: otherProduct.data.value,
            },
          ]);

        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาด");
        } finally {
          setLoading(false);
        }
      };
      // Get Data
      loadOtherProductDetail();
    });

  };

  const removeParticipant = (key) => {
    setGetOtherProductData(getOtherProductData.filter(item => item.key !== key));
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

  const handleQuantityChange = (key, newQuantity) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === key) {
          const quantity = Math.max(0, newQuantity); // Prevent negative quantities
          const net_amount = (quantity * parseFloat(item.product_unit_thb.replace(/,/g, ""))).toFixed(2); // Calculate new net_amount
          const foc = parseInt(quantity / item.product_campaign_order_min_foc);
          return { ...item, quantity, net_amount, foc };
        }
        return item;
      })
    );
  };

  const handleQuantityChangeOther = (key, newQuantity) => {
    setDataSourceOther((prevData) =>
      prevData.map((item) => {
        if (item.key === key) {
          const quantity = Math.max(1, newQuantity); // Prevent quantity less than 1
          const net_amount = (quantity * parseFloat(item.product_unit_thb.replace(/,/g, ""))).toFixed(2); // Calculate new value
          return { ...item, quantity, net_amount };
        }
        return item;
      })
    );
  };

  const handleDeleteOtherRow = (key) => {
    setDataSourceOther(dataSourceOther.filter(item => item.key !== key));
  };

  const handleOtherInputChange = (key, field, value) => {
    setDataSourceOther(dataSourceOther.map(item => item.key === key ? { ...item, [field]: value } : item));
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "product_code", key: "product_code" },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
    {
      title: "THB/Unit", dataIndex: "product_unit_thb", key: "product_unit_thb",
      // render: (text) => parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
      render: (text, record) => {
        const canEdit = hasAction(record, "Edit");
        const isEditing = editingPriceKeys[record.key];

        if (canEdit && isEditing) {
          return (
            <Input
              value={record.product_unit_thb}
              onChange={(e) =>
                handleUnitPriceChange(record.key, e.target.value)
              }
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

        return parseFloat(text || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        });
      }
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
            min={0}
            value={record.quantity}
            onChange={(e) => handleQuantityChange(record.key, parseInt(e.target.value) || 0)}
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
      render: (text) => parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
    },
    {
      title: <div className="text-center">Action</div>, key: "action",
      render: (_, record) => (
        <div className="flex justify-center items-center gap-3">
          {hasAction(record, "Delete") && (
            <img
              src="/img/icons/delete.png"
              alt="delete"
              className="cursor-pointer w-6 h-6"
              onClick={() =>
                setDataSource(dataSource.filter((item) => item.key !== record.key))
              }
            />
          )}

          {hasAction(record, "Edit") && (
            <img
              src="/img/icons/edit.png"
              alt="edit"
              className="cursor-pointer w-6 h-6"
              onClick={() => handleEditPrice(record.key)}
            />
          )}
        </div>
      )
    },
  ];

  const headerOther = [
    { title: "No", dataIndex: "no", key: "no" },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "Unit",
      dataIndex: "product_unit",
      key: "product_unit",
    },
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
            min={1}
            value={record.quantity}
            onChange={(e) => handleQuantityChangeOther(record.key, parseInt(e.target.value) || 1)}
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
      render: (text) => parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })
    },
    {
      title: <div className="text-center">Action</div>,
      key: "action",
      render: (_, record) => (
        <button onClick={() => handleDeleteOtherRow(record.key)} className="delete-button">
          <img src="/img/icons/delete.png" alt="delete" className="cursor-pointer w-6 h-6" />
        </button>
      )
    }
  ];

  const footerOrderList = () => {
    const totalQuantity = dataSource.reduce((total, item) => total + item.quantity, 0);
    const totalFOC = dataSource.reduce((total, item) => total + item.foc, 0);
    const totalAmount = dataSource.reduce((total, item) => total + parseFloat(item.net_amount || 0), 0);

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp; QTY (ctn): {parseInt(totalQuantity)}+{parseInt(totalFOC)} &nbsp;
          Total: {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    );
  };

  const footerOther = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={6} className="text-right pr-2 text-white">
        Item : {dataSourceOther.length} &nbsp;&nbsp; QTY :{" "}
        {dataSourceOther.reduce(
          (total, item) => parseInt(total) + parseInt(item.quantity || 0),
          0
        )}
        &nbsp;&nbsp; Total :{" "}
        {dataSourceOther
          .reduce(
            (total, item) =>
              total + parseFloat(item.net_amount.replace(/,/g, "")),
            0
          )
          .toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );

  const onChangeProduct = (value) => {
    // Set Empty
    setSearchProductData([]);

    const loadProductDetail = async () => {
      setLoading(true);
      try {
        const [productDetail] = await Promise.all([
          useServiceAPI.get(paths.pathMasterProductDetail, {
            product_id: value,
          }),
        ]);

        // State for Order List table data
        const data = productDetail.data
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
          quantity: 0,
          // foc: data.product_campaign_foc,
          foc: parseInt(1 / data.product_campaign_order_min_foc),
          net_amount: 0.00,
        };

        setDataSource([...dataSource, newProductDataDetail]);
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
          product.data.map((data, index) => {
            newProductData.push({
              value: data.id,
              label: data.name
            });
          })

          // Set Data
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

  // Utility function สำหรับแปลงวันที่
  const formatDate = (date) => {
    if (!date || !date.$d) return ""; // ตรวจสอบว่ามี $d หรือไม่
    const d = new Date(date.$d); // แปลง $d เป็น Date Object
    return d.toISOString().split("T")[0]; // แปลงเป็น YYYY-MM-DD
  };

  const handleSaveOrder = () => {
    // แปลงวันที่โดยใช้ฟังก์ชัน formatDate
    // const formattedDate = formatDate(getDocumentDate);
    // const body = {
    //   document_date: formattedDate,
    //   user_id: getUserId,
    //   dealer_id: getDealerId,
    //   remark: getRemark,
    //   products: dataSource,
    //   others: dataSourceOther,
    // };
    formCustom
      .validateFields()
      .then((values) => {
        // แปลงวันที่โดยใช้ฟังก์ชัน formatDate
        const formattedDate = formatDate(values.order_date);
        const body = {
          document_number: documentNumber,
          document_date: formattedDate,
          user_id: getUserId,
          dealer_id: getDealerId,
          remark: inputRemark,
          products: dataSource,
          others: dataSourceOther
        };
        // console.log(body);
        // return;
        const saveOrder = async () => {
          setLoading(true);
          try {
            const [response] = await Promise.all([
              useServiceAPI.put(paths.pathGetOrderUpdate, body),
            ]);

            showNotification(
              "success",
              response.data.message,
              response.data.message_line
            ).then(() => {
              navigate("/order/list");
            });
          } catch (error) {
            // showMsg("error", error.message || "เกิดข้อผิดพลาด");
            console.log(error);
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
            optionFilterProp="label"
            className="w-full"
            value=""
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

      <BoxPrimary title='Remark'>
        <div className="mb-3 flex justify-end">
          <Input.TextArea placeholder="Remark" value={inputRemark} rows={2} onChange={(e) => setInputRemark(e.target.value)} />
        </div>
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/order/list")} />
        <ActionButton mode="save" text="Confirm" onClick={() => handleSaveOrder()} />
      </div>

      {/* Modal for Add Participant */}
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
