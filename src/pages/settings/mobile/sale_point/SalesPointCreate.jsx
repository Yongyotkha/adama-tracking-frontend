import React, { useEffect, useState, useContext, useRef } from "react";
import { Form, Input, Select } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableCheckbox from "../../../../components/table/TableCheckbox";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../../contexts/AuthContext";
import dayjs from "dayjs";
import FormCustom from "../../../../components/form_custom/FormCustom";
import TableComponent from "../../../../components/table/TableComponent";
import customParseFormat from "dayjs/plugin/customParseFormat";
import DynamicModal from "../../../../components/modal/DynamicModal";

import FileUploadComponent from "../../../../components/file_upload/FileUploadComponent";
import UploadSection from "../../../../components/file_upload/UploadSection";

dayjs.extend(customParseFormat);

export default function SalesPointCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fileList, setFileList] = useState([]);
  const [fileListReceive, setFileListReceive] = useState([]);
  const fileUploadRef = useRef(null); // Reference for FileUploadComponent
  const fileUploadRefReceive = useRef(null); // Reference for FileUploadComponent
  const [loading, setLoading] = useState(false);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [dataSourceOther, setDataSourceOther] = useState([]);
  const [dataSale, setDataSale] = useState([]);
  const [dataSaleId, setDataSaleId] = useState("");
  const [dealerId, setDealerId] = useState("");
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSubDealer, setSubDataDealer] = useState([]);
  const [subDealerId, setSubDealerId] = useState("");
  const [searchProductData, setSearchProductData] = useState([]);
  const [getOtherProductData, setGetOtherProductData] = useState([]);
  const [inputRemark, setInputRemark] = useState("");
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("users"))
  );

  const [formCustom] = Form.useForm();

  useEffect(() => {
    if (location.state?.data) {

      const { user_id, others, products, remark } = location.state?.data;
      setDataSaleId(parseInt(user_id));
      setDataSource(products);
      setDataSourceOther(others);
      setInputRemark(remark);
      console.log(remark);

    }
  }, [location.state]);

  useEffect(() => {
    if (dataSale.length > 0 && location.state?.data) {
      setDealerId(location.state?.data?.dealer_id);
    }
  }, [dataSale]);

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

        const checkSaleId = sale.data.find((item) => item.id === userInfo.id);
        if (checkSaleId) {
          setDataSaleId(parseInt(userInfo.id));
        }
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  const handleFileRemove = (file) => {
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  // ลบไฟล์ในส่วน Picture of product receive
  const handleFileReceiveRemove = (file) => {
    setFileListReceive((prev) => prev.filter((f) => f.uid !== file.uid));
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

  const handleUploadReceiveSuccess = (response) => {
    const data = response.data;
    const fileUpload = {
      uid: data.file_key,
      name: data.file_name,
      status: "done",
      url: data.file_url,
    };

    setFileListReceive((prevFileList) => [...prevFileList, fileUpload]);
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
        (row) =>
          !prev.some(
            (getOtherProductData) => getOtherProductData.key === row.key
          )
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
                  const updatedQuantity = item.quantity + 1; // Increment quantity
                  const updatedNetAmount = (
                    updatedQuantity *
                    parseFloat(item.product_unit_thb.replace(/,/g, ""))
                  ).toFixed(2); // Recalculate net_amount

                  return {
                    ...item,
                    product_unit: item.unit,
                    product_unit_value: item.unit_value,
                    // quantity: item.quantity + 1,
                    quantity: updatedQuantity,
                    net_amount: updatedNetAmount, // Update net_amount
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
              product_unit: productData.unit,
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
    setGetOtherProductData(
      getOtherProductData.filter((item) => item.key !== key)
    );
  };

  const formFields = [
    {
      label: "Sales",
      name: "sale",
      type: "select",
      options: dataSale,
      disabled: false,
      required: false,
      moderef: true,
      // value: parseInt(dataSaleId, 10),
      value: parseInt(dataSaleId),
    },
    {
      label: "Dealer",
      name: "dealer",
      type: "select",
      options: dataDealer,
      disabled: false,
      required: false,
      moderef: false,
      value: dealerId,
    },
    {
      label: "Sub Dealer",
      name: "sub_dealer",
      type: "select",
      options: dataSubDealer,
      disabled: false,
      required: false,
      moderef: false,
      value: subDealerId,
    },
    {
      label: "Order No",
      name: "order_no",
      type: "text",
      disabled: true,
      required: false,
      moderef: false,
      placeholder: "Generate order no",
      value: "",
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

  const getMasterDealer = async (value) => {
    // setLoading(true);
    try {
      const [dealer] = await Promise.all([
        useServiceAPI.get(paths.pathUserLineDealer, {
          sale_id: value,
        }),
      ]);

      setDataDealer(dealer.data);
    } catch (error) {
      // showMsg("error", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const getMasterSubDealer = async (value) => {
    try {
      const [res] = await Promise.all([
        useServiceAPI.get(paths.pathUserLineSubDealer, {
          dealer_id: value,
        }),
      ]);

      setSubDataDealer(res.data)

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };



  const handleChange = (filter, value) => {
    console.log('filter ', filter, value)
    if (filter == "sale") {
      setDataSaleId(value);
      getMasterDealer(value);
    } else if (filter == "dealer") {
      setDealerId(value);
      getMasterSubDealer(value)
    } else if (filter == "sub_dealer") {
      console.log('set')
      setSubDealerId(value)
    }
  };


  const handleQuantityChange = (key, newQuantity) => {
    setDataSource((prevData) =>
      prevData.map((item) => {
        if (item.key === key) {
          const quantity = Math.max(0, newQuantity); // Prevent negative quantities
          const net_amount = (
            quantity * parseFloat(item.product_unit_thb.replace(/,/g, ""))
          ).toFixed(2); // Calculate new net_amount
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
          const net_amount = (
            quantity * parseFloat(item.product_unit_thb.replace(/,/g, ""))
          ).toFixed(2); // Calculate new value
          return { ...item, quantity, net_amount };
        }
        return item;
      })
    );
  };

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
    setDataSourceOther(
      dataSourceOther.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no" },
    { title: "SKU", dataIndex: "product_code", key: "product_code" },
    { title: "Product Name", dataIndex: "product_name", key: "product_name" },
    { title: "Unit", dataIndex: "product_unit", key: "product_unit" },
    {
      title: "THB/Unit",
      dataIndex: "product_unit_thb",
      key: "product_unit_thb",
      render: (text) =>
        parseFloat(text || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        }),
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
            onClick={() =>
              handleQuantityChange(record.key, record.quantity - 1)
            }
          />
          <Input
            inputMode="numeric"
            min={0}
            value={record.quantity}
            onChange={(e) =>
              handleQuantityChange(record.key, parseInt(e.target.value) || 0)
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
    // { title: "FOC (ctn)", dataIndex: "foc", key: "foc" },
    { title: "Point", dataIndex: "point", key: "point" },
    {
      title: "Sub Total (THB)",
      dataIndex: "net_amount",
      key: "net_amount",
      render: (text) =>
        parseFloat(text || 0).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        }),
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
                (item) => item.key !== record.key
              );

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


  const footerOrderList = () => {
    const totalQuantity = dataSource.reduce(
      (total, item) => total + parseFloat(item.quantity),
      0
    );
    const totalFOC = dataSource.reduce(
      (total, item) => total + parseFloat(item.foc),
      0
    );
    const totalAmount = dataSource.reduce(
      (total, item) => total + parseFloat(item.net_amount || 0),
      0
    );

    return (
      <tr className="bg-[#978B87]">
        <td colSpan={9} className="text-right pr-2 text-white">
          Item: {dataSource.length} &nbsp; | QTY (ctn): {totalQuantity}
          &nbsp; | Total:{" "}
          {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} |
          Total Point: {dataSource.reduce((total, item) => total + (parseFloat(item.point || 0) * parseFloat(item.quantity || 0)), 0).toLocaleString("en-US")}
        </td>
      </tr>
    );
  };

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
              const updatedQuantity = item.quantity + 1; // Increment quantity
              const updatedNetAmount = (
                updatedQuantity *
                parseFloat(item.product_unit_thb.replace(/,/g, ""))
              ).toFixed(2); // Recalculate net_amount

              return {
                ...item,
                // quantity: item.quantity + 1, // Increment quantity
                quantity: updatedQuantity,
                net_amount: updatedNetAmount, // Update net_amount
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
            foc: parseInt(1 / data.product_campaign_order_min_foc),
            // foc: data.product_campaign_foc,
            // net_amount: data.bath_unit,
            net_amount: (
              1 * parseFloat(data.bath_unit.replace(/,/g, ""))
            ).toFixed(2), // Calculate net_amount based on quantity 1
            point: data.point,
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
              label: data.name,
            });
          });

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
          user_id: dataSaleId,
          dealer_id: dealerId,
          sub_dealer_id: subDealerId,
          remark: inputRemark,
          products: dataSource,
          others: dataSourceOther,
          fileList: fileList,
          fileListReceive: fileListReceive
        };
        // console.log(body);
        // return;
        navigate("/points/line/sales-points-list/detail", {
          state: {
            data: body,
          },
        });
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };

  const handleUploadClick = async () => {
    if (fileUploadRef.current) {
      fileUploadRef.current.triggerUpload();
    }
  };

  const handleUploadReceiveClick = async () => {
    if (fileUploadRefReceive.current) {
      fileUploadRefReceive.current.triggerUpload();
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Sales Point Order</div>

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

      <BoxPrimary title="Order List">
        <TableComponent
          header={header}
          dataSource={dataSource}
          pageSize={10}
          footer={footerOrderList}
        />
      </BoxPrimary>


      {/* Attachments Section */}
      <UploadSection
        title="Attached file/Picture"
        fileUploadRef={fileUploadRef}
        fileList={fileList}
        handleUploadClick={handleUploadClick}
        handleUploadSuccess={handleUploadSuccess}
        handleFileRemove={handleFileRemove}
      />

      {/* <BoxPrimary>
        <div className="flex items-center justify-between">
          <div className="text-[#00783F] text-lg font-semibold mb-3">Picture of product receive</div>
          <ActionButton
            mode="add"
            text="Upload File"
            onClick={handleUploadReceiveClick}
            className="hidden"
          />
        </div>
        <FileUploadComponent
          ref={fileUploadRefReceive}
          dataFile={fileListReceive}
          onUploadSuccess={handleUploadReceiveSuccess}
        />

      </BoxPrimary> */}
      <UploadSection
        title="Attached file/Picture"
        fileUploadRef={fileUploadRefReceive}
        fileList={fileListReceive}
        handleUploadClick={handleUploadReceiveClick}
        handleUploadSuccess={handleUploadReceiveSuccess}
        handleFileRemove={handleFileReceiveRemove}
        modeUpload="receive"
        disabled={true} // Enable view-only mode
      />

      <BoxPrimary title="Remark">
        <div className="mb-3 flex justify-end">
          <Input.TextArea
            placeholder="Remark"
            rows={2}
            value={inputRemark}
            onChange={(e) => setInputRemark(e.target.value)}
          />
        </div>
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton
          mode="back"
          text="Back"
          onClick={() => navigate("/points/line/sales-points-list")}
        />
        <ActionButton
          mode="save"
          text="Confirm"
          onClick={() => handleNavigateToOrderView()}
        />
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
          {
            title: "Value (THB)",
            dataIndex: "value",
            key: "value",
            width: 150,
          },
        ]}
        dataSource={getOtherProductData}
        width="1200px"
        onAddSelected={handleAddSelectedRows}
        type="add"
      />
    </MainLayout>
  );
}
