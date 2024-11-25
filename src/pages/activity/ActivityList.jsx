import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Filter from "../../components/filter/Filter";
import { Dropdown } from "antd";
import ActionButton from "../../components/button/ActionButton";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../components/dropdown/ItemDropDown";
import DynamicModal from "../../components/modal/DynamicModal";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";

export default function ActivityList() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState(false);
  const [activityList, setActivityList] = useState([]);
  const [saleLists, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const navigate = useNavigate();

  const filters = [
    {
      key: "keyword",
      type: "text",
      label: "Activity No",
      placeholder: "Activity No",
    },
    {
      key: "activity_type",
      type: 'select',
      label: "Activity Type",
      placeholder: "All",
      options: activityList,
    },
    {
      key: "sale",
      type: 'select',
      label: "Sale",
      placeholder: "All",
      options: saleLists,
    },
    {
      key: "shop",
      type: 'select',
      label: "Shop",
      placeholder: "All",
      options: dealerList,
    },
    {
      key: "Date",
      type: 'date',
      label: "Date",
    },
  ];

  const handleSearch = (filters) => {
    setTableParams({
      ...tableParams,
      filters,
    });
  };

  const handleClear = () => {
    setTableParams({
      ...tableParams,
      filters: {},
    });
  };

  const handleShowProductModal = () => {
    setIsProductModalVisible(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalVisible(false);
  };

  const productModalData = [
    { key: 1, name: "Tossaphon Suphaksitthikorn", territory: "Left North", position: "Business Development Executive" },
    { key: 2, name: "Panudech Srithong", territory: "Left Lower North", position: "Business Development Executive" },
  ];

  const productModalHeader = [
    { title: "No", dataIndex: "key", key: "key", width: 50 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Territory", dataIndex: "territory", key: "territory" },
    { title: "Position", dataIndex: "position", key: "position" },
  ];

  const actionItems = [
    { key: "1", label: <ItemDropDown mode="edit" link="/activity/edit" /> },
    { key: "2", label: <ItemDropDown mode="delete" link="#" /> },
  ];

  const header = [
    { title: "Activity No", width: 150, dataIndex: "activityNo", align: "start" },
    { title: "Activity Type", width: 150, dataIndex: "activityType", align: "start" },
    { title: "Sale", width: 150, dataIndex: "sale", align: "start" },
    { title: "Shop", width: 150, dataIndex: "shop", align: "start" },
    { title: "Key Product", width: 100, dataIndex: "keyProduct", align: "start" },
    { title: "Date", width: 150, dataIndex: "date", align: "start" },
    { title: "Time", width: 100, dataIndex: "time", align: "start", className: "text-nowrap" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];


  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      keyword: filters.keyword || "",
      activity_type_id: filters.activity_type || "",
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathActivatyList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = data.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          activityNo: row.document_number,
          activityType: row.document_type,
          shop: row.dealer_name,
          sale: row.user_name ?? '-',
          keyProduct: row.key_product ?? '-',
          date: row.document_date,
          time: row.time,
          action: (
            <Dropdown menu={{ items: actionItems }} placement="bottomRight">
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
              </a>
            </Dropdown>
          )
        }));

        setDataSource(newDataSource);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: records_filtered,
          },
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };

  // Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [activityType, sale] = await Promise.all([
          useServiceAPI.get(paths.pathMasterActivityType, {}),
          useServiceAPI.get(paths.pathMasterSale, {}),
        ]);

        setActivityList(activityType.data);
        setSaleList(sale.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  // Table Activity
  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  return (
    <MainLayout loading={loading}>

      <div className="flex items-center justify-between">
        <div className="title-page">Activity List</div>
        <ActionButton mode="create" text="Create" onClick={(e) => navigate("/activity/create")} />
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
        title="Sale Team"
        isVisible={isProductModalVisible}
        onClose={handleCloseProductModal}
        header={productModalHeader}
        dataSource={productModalData}
        width="1200px" // Customize the width to make it extra-large
      />

    </MainLayout>
  );
}
