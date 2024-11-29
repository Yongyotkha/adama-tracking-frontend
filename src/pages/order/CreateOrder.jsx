import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import FormCustom from "../../components/form_custom/FormCustom";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../components/button/ActionButton";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { Form, Input, Select } from "antd";
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
  const [dataSourceOther, setDataSourceOther] = useState([]);
  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [searchProductData, setSearchProductData] = useState([]);
  const [getOtherProductData, setGetOtherProductData] = useState([]);
  const [inputRemark, setInputRemark] = useState("");

  const [formCustom] = Form.useForm();

  useEffect(() => {
    // Get Master
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

  // Close Modal
  const handleCloseTeamModal = () => {
    // Set Empty
    setGetOtherProductData([]);

    setIsTeamModalVisible(false);
  };

  // const handleAddSelectedRows = (selectedRows) => {
  //   setGetOtherProductData((prev) => {
  //     const newRows = selectedRows.filter(
  //       (row) => !prev.some((getOtherProductData) => getOtherProductData.key === row.key)
  //     );
      
  //     return [...prev, ...newRows];
  //   });
    
  //   selectedRows.map((data, index) => {
  //     // State for Other table data
  //     const loadOtherProductDetail = async () => {
  //       setLoading(true);
  //       try {
  //         const [otherProduct] = await Promise.all([
  //           useServiceAPI.get(paths.pathMasterPromotionDetail, {
  //             promotion_id: data.key,
  //           }),
  //         ]);

  //         // อัปเดต state
  //         setDataSourceOther((prev) => [
  //           ...prev,
  //           {
  //             key: otherProduct.length + 1, // สร้าง key ใหม่
  //             no: otherProduct.length + 1, // สร้างเลขลำดับใหม่
  //             product_id: otherProduct.data.id,
  //             product_code: "",
  //             product_name: otherProduct.data.name,
  //             product_unit: "",
  //             product_unit_thb: otherProduct.data.value,
  //             quantity: 1,
  //             net_amount: otherProduct.data.value,
  //           },
  //         ]);
          
  //       } catch (error) {
  //         showMsg("error", error.message || "เกิดข้อผิดพลาด");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     // Get Data
  //     loadOtherProductDetail();
  //   });

  // };

  const handleAddSelectedRows = (selectedRows) => {
    setGetOtherProductData((prev) => {
      const newRows = selectedRows.filter(
        (row) => !prev.some((getOtherProductData) => getOtherProductData.key === row.key)
      );
      return [...prev, ...newRows];
    });
  
    selectedRows.map((data) => {
      const loadOtherProductDetail = async () => {
        setLoading(true);
        try {
          const [otherProduct] = await Promise.all([
            useServiceAPI.get(paths.pathMasterPromotionDetail, {
              promotion_id: data.key,
            }),
          ]);
  
          const productData = otherProduct.data;
  
          // อัปเดต DataSourceOther
          setDataSourceOther((prev) => {
            // ตรวจสอบว่ามี product_code ซ้ำหรือไม่
            const existingIndex = prev.findIndex(
              (item) => item.product_id === productData.id
            );
  
            if (existingIndex !== -1) {
              // หากซ้ำ: เพิ่ม quantity
              const updatedDataSource = prev.map((item, index) => {
                if (index === existingIndex) {
                  return {
                    ...item,
                    quantity: item.quantity + 1,
                  };
                }
                return item;
              });
  
              // รีเซ็ต key และ no
              return updatedDataSource.map((item, index) => ({
                ...item,
                key: index + 1,
                no: index + 1,
              }));
            }
  
            // หากไม่ซ้ำ: เพิ่มรายการใหม่
            const newProduct = {
              key: prev.length + 1,
              no: prev.length + 1,
              product_id: productData.id,
              product_code: productData.code || "",
              product_name: productData.name,
              product_unit: "",
              product_unit_thb: productData.value,
              quantity: 1,
              net_amount: productData.value,
            };
  
            const updatedDataSource = [...prev, newProduct];
  
            // รีเซ็ต key และ no
            return updatedDataSource.map((item, index) => ({
              ...item,
              key: index + 1,
              no: index + 1,
            }));
          });
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาด");
        } finally {
          setLoading(false);
        }
      };
  
      // ดึงข้อมูล
      loadOtherProductDetail();
    });
  };
  
  const removeParticipant = (key) => {
    setGetOtherProductData(getOtherProductData.filter(item => item.key !== key));
  };

  const formFields = [
    { 
      label: "Sale", 
      name: "sale", 
      type: "select", 
      options: dataSale, 
      disabled: false, 
      required: false, 
      moderef: true,
      value: "",
    },
    { 
      label: "Dealer", 
      name: "dealer", 
      type: "select", 
      options: dataDealer, 
      disabled: false, 
      required: false, 
      moderef: false,
      value: "" 
    },
    { 
      label: "Order No", 
      name: "order_no", 
      type: "text", 
      disabled: true, 
      required: false, 
      moderef: false,
      value: "" 
    },
    { 
      label: "Date", 
      name: "order_date", 
      type: "date", 
      disabled: false, 
      required: false, 
      moderef: false,
      value: "" 
    },
  ];

  const handleChange = (filter, value) => {
    if (filter == 'sale') {
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
          const quantity = Math.max(0, newQuantity); // Prevent negative quantities
          const net_amount = (quantity * parseFloat(item.product_unit_thb.replace(/,/g, ""))).toFixed(2); // Calculate new net_amount
          return { ...item, quantity, net_amount };
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

  // const handleAddOtherRow = () => {
  //   const newRow = {
  //     key: (dataSourceOther.length + 1).toString(),
  //     no: (dataSourceOther.length + 1).toString(),
  //     productName: "",
  //     unit: "",
  //     quantity: 1,
  //     value: '10000',
  //   };
  //   setDataSourceOther([...dataSourceOther, newRow]);
  // };

  // const handleDeleteOtherRow = (key) => {
  //   setDataSourceOther(dataSourceOther.filter(item => item.key !== key));
  // };

  const handleDeleteOtherRow = (key) => {
    setDataSourceOther((prev) => {
      // ลบรายการที่มี key ตรงกับ key ที่รับมา
      const updatedDataSource = prev.filter((item) => item.key !== key);
  
      // รีเซ็ต key และ no
      const resetDataSource = updatedDataSource.map((item, index) => ({
        ...item,
        key: index + 1,
        no: index + 1,
      }));
  
      return resetDataSource;
    });
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
      dataIndex: "net_amount",
      key: "net_amount",
      render: (text) => parseFloat(text || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
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
              const updatedDataSource = dataSource.filter((item) => item.key !== record.key);
    
              // Reset keys and no after deletion
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
        Total: {dataSourceOther.reduce((total, item) => total + parseFloat(item.net_amount.replace(/,/g, "")), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  );

  // const onChangeProduct = (value) => {
  //   // Set Empty
  //   setSearchProductData([]);

  //   const loadProductDetail = async () => {
  //     setLoading(true);
  //     try {
  //       const [productDetail] = await Promise.all([
  //         useServiceAPI.get(paths.pathMasterProductDetail, {
  //           product_id: value,
  //         }),
  //       ]);

  //       // State for Order List table data
  //       const data = productDetail.data
  //       const newProductDataDetail = {
  //         key: dataSource.length + 1,
  //         no: dataSource.length + 1,
  //         product_id: data.id,
  //         product_code: data.product_code,
  //         product_name: data.product_name,
  //         product_unit: data.packing_list,
  //         product_unit_thb: data.bath_unit,
  //         product_campaign_order_min_foc: data.product_campaign_order_min_foc,
  //         product_campaign_foc: data.product_campaign_foc,
  //         quantity: 0,
  //         foc: data.product_campaign_foc,
  //         net_amount: 0.00,
  //       };

  //       // setDataSource([...dataSource, newProductDataDetail]);

  //       // Add new product data to the existing dataSource
  //       const updatedDataSource = [...dataSource, newProductDataDetail];

  //       // Reset the keys to ensure proper sequencing
  //       const resetDataSource = updatedDataSource.map((item, index) => ({
  //           ...item,
  //           key: index + 1,
  //           no: index + 1,
  //       }));

  //       setDataSource(resetDataSource);
  //     } catch (error) {
  //       showMsg("error", error.message || "เกิดข้อผิดพลาด");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadProductDetail();
  // };

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

            const data = productDetail.data;

            // Check for duplicate product_code
            const existingProductIndex = dataSource.findIndex(
                (item) => item.product_code === data.product_code
            );

            if (existingProductIndex !== -1) {
                // If product_code exists, update the quantity
                const updatedDataSource = dataSource.map((item, index) => {
                    if (index === existingProductIndex) {
                        return {
                            ...item,
                            quantity: item.quantity + 1, // Increment quantity
                        };
                    }
                    return item;
                });

                setDataSource(updatedDataSource);
            } else {
                // If product_code does not exist, add a new entry
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
                    quantity: 1, // Set initial quantity to 1
                    foc: data.product_campaign_foc,
                    net_amount: 0.0,
                };

                const updatedDataSource = [...dataSource, newProductDataDetail];

                // Reset the keys to ensure proper sequencing
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

  const handleNavigateToOrderView = () => {
    formCustom
      .validateFields()
      .then((values) => {
        const body = {
          document_date: values.order_date,
          user_id: values.sale,
          dealer_id: values.dealer,
          remark: inputRemark,
          products: dataSource,
          others: dataSourceOther
        };
        // console.log(body);
        navigate("/order/detail", {
          state: {
            data: body
          }
        })
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Order</div>

      <FormCustom fields={formFields} form={formCustom} onChange={handleChange} />

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
          <Input.TextArea placeholder="Remark" rows={2} onChange={(e) => setInputRemark(e.target.value)} />
        </div>
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/order/list")} />
        <ActionButton mode="save" text="Confirm" onClick={() => handleNavigateToOrderView()} />
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
