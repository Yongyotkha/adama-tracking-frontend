import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import DynamicButton from "../../../components/button/DynamicButton";
import DynamicModal from "../../../components/modal/DynamicModal";
import useServiceAPI from "../../../services/corsService";
import { paths } from "../../../services/CorsPath";

export default function SettingProduct() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [roles, setRoles] = useState([]);
  const [position, setPosition] = useState([]);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    isVisible: false,
    header: [],
    dataSource: [],
  });
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [positions, roles] = await Promise.all([
          useServiceAPI.get(paths.pathMasterProductTypes, {}),
          useServiceAPI.get(paths.pathMasterProductGroups, {}),
        ]);

        setPosition(positions.data);
        setRoles(roles.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);


  const filters = [
    {
      key: "keyword",
      type: "text",
      label: "Product Code",
      placeholder: "All",
    },
    {
      key: "product_type",
      type: "select",
      label: "Product Type",
      options: position,

    },
    {
      key: "category_id",
      type: "select",
      label: "Product Group",
      options: roles,
    },
    {
      key: "product_name",
      type: "text",
      label: "Product Name",
      placeholder: "All",
    },
  ];

  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  const showModal = (title, header, dataSource) => {
    setModalConfig({
      title,
      isVisible: true,
      header,
      dataSource,
    });
  };

  const handleCloseModal = () => {
    setModalConfig({ ...modalConfig, isVisible: false });
  };

  const cropColumns = [
    { title: "No", dataIndex: "key", key: "key", width: 50 },
    { title: "Name", dataIndex: "name", key: "name" },
  ];

  const cropData = [
    { key: 1, name: "Rice" },
    { key: 2, name: "Wheat" },
    { key: 3, name: "Corn" },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "left" },
    {
      title: "Product Code",
      width: 150,
      dataIndex: "product_code",
      align: "left",
    },
    {
      title: "Product Type",
      width: 150,
      dataIndex: "product_type",
      align: "left",
    },
    {
      title: "Product Group",
      width: 150,
      dataIndex: "product_group",
      align: "left",
    },
    { title: "Category", width: 100, dataIndex: "category", align: "left" },
    {
      title: "Product Name",
      width: 200,
      dataIndex: "product_name",
      align: "left",
    },
    {
      title: "Baht/lt,kg",
      width: 100,
      dataIndex: "baht_per_lt_kg",
      align: "right",
    },
    {
      title: "Baht/unit",
      width: 100,
      dataIndex: "baht_per_unit",
      align: "right",
    },
    {
      title: "Sub Dealer",
      width: 100,
      dataIndex: "sub_dealer",
      align: "right",
    },
    { title: "Farmer", width: 100, dataIndex: "farmer", align: "right" },
    { title: "Crop", width: 100, dataIndex: "crop", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const actionItems = [
    {
      key: "1",
      label: (
        <a
          rel="noopener noreferrer"
          href="/setting/product/edit"
          className="flex gap-1"
        >
          <img
            src="/img/icons/edit.png"
            alt="Edit icon"
            className="inline-block h-4"
          />
          <span className="text-[#978B87]">Edit</span>
        </a>
      ),
    },
    {
      key: "2",
      label: (
        <a rel="noopener noreferrer" href="#" className="flex gap-1">
          <img
            src="/img/icons/delete.png"
            alt="Delete icon"
            className="inline-block h-4"
          />
          <span className="text-[#978B87]">Delete</span>
        </a>
      ),
    },
  ];

  // useEffect(() => {
  //   const dataSource = [
  //     {
  //       key: 1,
  //       product_code: "303710131300",
  //       product_type: "Special",
  //       product_group: "Gold",
  //       category: "FUN",
  //       product_name: "Apopo 20%SE",
  //       baht_per_lt_kg: "940.00",
  //       baht_per_unit: "470.00",
  //       sub_dealer: "450.00",
  //       farmer: "500.00",
  //       crop: (
  //         <BadgeStatus
  //           text="3"
  //           bgColor="#FFB020"
  //           textColor="#FFFFFF"
  //           onClick={() => showModal("Crop", cropColumns, cropData)}
  //         />
  //       ),
  //       action: (
  //         <Dropdown menu={{ items: actionItems }} placement="bottom">
  //           <a onClick={(e) => e.preventDefault()}>
  //             <img
  //               src="/img/icons/action.png"
  //               alt="Actions icon"
  //               className="inline-block w-5 h-5"
  //             />
  //           </a>
  //         </Dropdown>
  //       ),
  //     },
  //     // Add more rows as needed
  //   ];

  //   setDataSource(dataSource);
  // }, []);




  useEffect(() => {
    const body = { platform: "web" };
    console.log(body); 
    useServiceAPI
      .get(paths.pathMasterProduct, body)
      .then((response) => {
        if (response.status === 200) {
          const newDataSource = response.data.map((data, index) => ({
            key: index + 1,
            product_code: data.product_code,
            product_type: data.product_type,
            product_group: data.product_group,
            category: data.product_category,
            product_name: data.product_name,
            baht_per_lt_kg: data.bath_ltkg,
            baht_per_unit: data.net_price,
            sub_dealer: data.bath_unit,
            farmer: data.farmer,
            action: (
              <Dropdown menu={{ items: actionItems }} placement="bottom">
                <a onClick={(e) => e.preventDefault()}>
                  <img
                    src="/img/icons/action.png"
                    alt="Actions icon"
                    className="inline-block w-5 h-5"
                  />
                </a>
              </Dropdown>
            ),
            crop: (
              <BadgeStatus
                text="3"
                bgColor="#FFB020"
                textColor="#FFFFFF"
                onClick={() => showModal("Crop", cropColumns, cropData)}
              />
            ),

          }));
  
          setDataSource(newDataSource);
        }
      })
      .catch((error) => {
        console.log(error.message);
        setError(error.message);
        if (error.status === 422) {
          showMsg("error", error.message);
        } else {
          showMsg("error", "เกิดข้อผิดพลาด");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);




  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Product Management</div>
        <ActionButton
          mode="sync"
          text="Sync SAP"
          onClick={() => console.log("Sync SAP clicked")}
          className="ms-auto me-2"
        />
      </div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        filters={filters}
      />

      <BoxPrimary>
        <TableComponent header={header} dataSource={dataSource} />
      </BoxPrimary>

      <DynamicModal
        title={modalConfig.title}
        isVisible={modalConfig.isVisible}
        onClose={handleCloseModal}
        header={modalConfig.header}
        dataSource={modalConfig.dataSource}
      />
    </MainLayout>
  );
}
