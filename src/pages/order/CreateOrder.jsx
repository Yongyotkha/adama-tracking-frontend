import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import FormCustom from "../../components/form_custom/FormCustom";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../components/button/ActionButton";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import TableComponent from "../../components/table/TableComponent";
import DynamicModal from "../../components/modal/DynamicModal";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";

export default function CreateOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);
  const [searchProductData, setSearchProductData] = useState([]);
  const [getOtherProductData, setGetOtherProductData] = useState([]);

  // const [participants, setParticipants] = useState([
  //   { key: '1', no: 1, name: 'Kornkan Induang', position: 'Sales Executive', department: 'Sales Team', territory: 'Left North', permission: 'Individual and BD/Assist' },
  //   { key: '2', no: 2, name: 'Phaisan Jethuen', position: 'Sales Executive', department: 'Sales Team', territory: 'Left Lower North', permission: 'Individual and BD/Assist' },
  //   { key: '3', no: 3, name: 'Manupong Wongpuang', position: 'Sales Executive', department: 'Sales Team', territory: 'Lower North', permission: 'Individual and BD/Assist' },
  //   { key: '4', no: 4, name: 'Kriangkrai Kraikaew', position: 'Sales Executive', department: 'Sales Team', territory: 'Central Left North', permission: 'Individual and BD/Assist' },
  //   { key: '5', no: 5, name: 'Charoenpong Khunawatcharakun', position: 'Sales Executive', department: 'Sales Team', territory: 'Central Right North', permission: 'Individual and BD/Assist' },
  // ]);

  // const productData = [
  //     { key: `product-1`, no: 1, name: "Cooler Box M11 - กระติกน้ำ คลาสสิค", unit: "ใบ", value: 200 },
  //     { key: `product-2`, no: 2, name: "Adama Bag (กระเป๋าผ้าสปันบอนด์)", unit: "ใบ", value: 200 },
  //     { key: `product-3`, no: 3, name: "เสื้อเชิ๊ตแขนยาว - นาโลริด", unit: "ตัว", value: 200 },
  //     { key: `product-4`, no: 4, name: "เสื้อเชิ๊ตยีนส์แขนยาว - อดามา", unit: "ตัว", value: 200 },
  //     { key: `product-5`, no: 5, name: "เสื้อยืดคอกลมแขนยาว - เมโนริ", unit: "ตัว", value: 200 },
  //     { key: `product-6`, no: 6, name: "เสื้อยืดคอกลมแขนยาว - โรบอน โกลด์ (สีเทา)", unit: "ตัว", value: 200 },
  //     { key: `product-7`, no: 7, name: "แก้วน้ำใส อดามา", unit: "ใบ", value: 200 },
  //     { key: `product-8`, no: 8, name: "หมวกกันกีดลายอาหาร - พัลโก้ร่า", unit: "ใบ", value: 200 },
  // ];
  // const getOtherProductData = [];

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [sale] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown, {
            status: "all",
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
            unit: "", 
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

  const handleCloseTeamModal = () => {
    setIsTeamModalVisible(false);
  };

  const handleAddSelectedRows = (selectedRows) => {
    // setGetOtherProductData((prev) => {
    //   // Filter out any selected rows that already exist in participants based on their key
    //   const newRows = selectedRows.filter(
    //     (row) => !prev.some((participant) => participant.key === row.key)
    //   );
      
    //   return [...prev, ...newRows];
    // });
    
    selectedRows.map((data, index) => {
      console.log(data.key);
    })
  };

  const removeParticipant = (key) => {
    setGetOtherProductData(getOtherProductData.filter(item => item.key !== key));
  };

  // State for Other table data
  // const [dataSourceOther, setDataSourceOther] = useState([
  //   { 
  //     key: "1", 
  //     no: "1", 
  //     productName: "เสื้อเชิ๊ตยีนส์แขนยาว - อดามา", 
  //     unit: 1, 
  //     quantity: 1, 
  //     value: '10000' 
  //   }
  // ]);

  const formFields = [
    { 
      label: "Sale", 
      name: "sale", 
      type: "select", 
      options: dataSale, 
      disabled: false, 
      required: false, 
      moderef: true,
      value: "Select",
    },
    { 
      label: "Dealer", 
      name: "dealer", 
      type: "select", 
      options: dataDealer, 
      disabled: false, 
      required: false, 
      moderef: false,
      value: "Select" 
    },
    { 
      label: "Order No", 
      name: "order_no", 
      type: "text", 
      disabled: true, 
      required: false, 
      moderef: false,
      value: "Generate Auto" 
    },
    { 
      label: "Date", 
      name: "order_date", 
      type: "date", 
      disabled: true, 
      required: false, 
      moderef: false,
      value: "" 
    },
  ];

  const handleSearch = (e) => {
    console.log("Search term:", e.target.value);
  };

  const handleChange = (filter) => {
    if (filter) {
      const getMasterDealer = async () => {
        setLoading(true);
        try {
          const [dealer] = await Promise.all([
            useServiceAPI.get(paths.pathMasterDealerDropdown, {
              user_id: filter,
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
          const quantity = Math.max(0, newQuantity); // Prevent negative quantities
          const subTotal = (quantity * parseFloat(item.pricePerUnit.replace(/,/g, ""))).toFixed(2); // Calculate new subTotal
          return { ...item, quantity, subTotal };
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
          const value = (quantity * 10000).toLocaleString("en-US", { minimumFractionDigits: 2 }); // Calculate new value
          return { ...item, quantity, value };
        }
        return item;
      })
    );
  };

  const handleAddOtherRow = () => {
    const newRow = {
      key: (dataSourceOther.length + 1).toString(),
      no: (dataSourceOther.length + 1).toString(),
      productName: "",
      unit: "",
      quantity: 1,
      value: '10000',
    };
    setDataSourceOther([...dataSourceOther, newRow]);
  };

  const handleDeleteOtherRow = (key) => {
    setDataSourceOther(dataSourceOther.filter(item => item.key !== key));
  };

  const handleOtherInputChange = (key, field, value) => {
    setDataSourceOther(dataSourceOther.map(item => item.key === key ? { ...item, [field]: value } : item));
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    { title: "Product Name", dataIndex: "productName", key: "productName" },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    {
      title: "THB/Unit", dataIndex: "pricePerUnit", key: "pricePerUnit",
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
      dataIndex: "subTotal",
      key: "subTotal",
      render: (text) => parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
    },
    {
      title: <div className="text-center">Action</div>, key: "action", render: (_, record) =>
        <button className="delete-button flex justify-center mx-auto">
          <img
            src="/img/icons/delete.png"
            alt="delete"
            className="cursor-pointer w-6 h-6"
            onClick={() => setDataSource(dataSource.filter((item) => item.key !== record.key))}
          />
        </button>
    },
  ];

  const headerOther = [
    { title: "No", dataIndex: "no", key: "no" },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
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
      dataIndex: "value",
      key: "value",
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
    const totalAmount = dataSource.reduce((total, item) => total + parseFloat(item.subTotal || 0), 0);

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp; QTY (ctn): {totalQuantity}+{totalFOC} &nbsp;
          Total: {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    );
  };

  const footerOther = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={6} className="text-right pr-2 text-white">
        Item: {dataSourceOther.length} &nbsp; QTY: {dataSourceOther.reduce((total, item) => total + item.quantity, 0)} &nbsp;
        Total: {dataSourceOther.reduce((total, item) => total + parseFloat(item.value.replace(/,/g, "")), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
          sku: data.product_code,
          productName: data.product_name,
          unit: data.packing_list,
          pricePerUnit: data.bath_unit,
          quantity: 0,
          foc: data.product_campaign_foc,
          subTotal: 0.00,
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

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Order</div>

      <FormCustom fields={formFields} onChange={handleChange} />

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
          <Input.TextArea placeholder="Remark" rows={2} />
        </div>
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/order/list")} />
        <ActionButton mode="save" text="Confirm" onClick={() => navigate("/order/view")} />
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
