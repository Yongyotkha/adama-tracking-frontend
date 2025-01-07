import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Filter from "../../components/filter/Filter";
import { Dropdown, Modal } from "antd";
import ActionButton from "../../components/button/ActionButton";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";
import BadgeStatus from "../../components/badge/BadgeStatus";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../components/dropdown/ItemDropDown";
import DynamicModal from "../../components/modal/DynamicModal";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import dayjs from "dayjs";
import FormModal from "../../components/modal/FormModal";
import { ExclamationCircleFilled } from "@ant-design/icons";

export default function ActivityList() {
  const { confirm } = Modal;
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState(false);
  const [activityList, setActivityList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const { showMsg, showNotification } = useContext(AuthContext);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  const [mappingData, setMappingData] = useState({});
  const [mappingDataSave, setMappingDataSave] = useState({});
  const [mappingperception , setMappingmappingperception] = useState({});
  const [perceptionData, setPerceptionData] = useState([]);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [isMappingModalVisible, setIsMappingModalVisible] = useState(false);
  const navigate = useNavigate();
  const [isFormModalReadOnly, setIsFormModalReadOnly] = useState(false);


  const handleBadgeClick = (rowData) => {
    // เช็คสถานะ
    if (rowData.status_mapping_name === "Complete") {
      setIsFormModalReadOnly(true);
    } else {
      setIsFormModalReadOnly(false);
    }
    setMappingData(rowData);
    setIsMappingModalVisible(true);
  };

  // Get Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [perception] = await Promise.all([
          useServiceAPI.get(paths.pathMasterPerception, {}),
        ]);

        // Set State
        setPerceptionData(perception.data);

      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  // Handle Open Modal & Get Data
  const handleShowMappingModal = (data) => {
    setIsMappingModalVisible(true);
    // Fetch Data: Mapping Detail
    const getMappingData = async () => {
      try {
        const [mapping] = await Promise.all([
          useServiceAPI.get(paths.pathActivityMappingStatusDetail, {
            document_number: data.document_number
          }),
        ]);    

        setMappingmappingperception(mapping.data.customer_perception_id)
        setMappingData(mapping.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      }
    };

    getMappingData();
  };

  // Handle Close Modal & Save
  const handleOKMappingModal = (data) => {
    const dataInfo = data;
    setIsMappingModalVisible(false);
    console.log(dataInfo);
    
    // Mapping Save
    const updateMappingDetail = async () => {
      try {
        const body = {
          document_number: dataInfo.documentNumber,
          location_longitude: dataInfo.longitude,
          location_latitude: dataInfo.latitude,
          location_address: dataInfo.address,
          perception_id: dataInfo.perception,
          image_list: ["localhost"],
        };

        const [mapping] = await Promise.all([
          useServiceAPI.put(paths.pathActivityMappingStatusDetailUpdate, body),
        ]);

        showNotification(
          "success",
          mapping.data.message,
          mapping.data.message_line
        ).then(() => {
          fetchData();
        });

      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      }
    };

    updateMappingDetail();
  };

  // Handle Upload File Image
  const handleChangeFileUpload = (data) => {
    console.log(data);
    
  }

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
      options: saleList,
      moderef: true,
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
      pagination: {
        current: 1,
        pageSize: 10,
      }
    });
  };

  const handleClear = () => {
    setTableParams({
      ...tableParams,
      filters: {},
    });
  };

  const handleChange = (filter) => {
    if (filter) {
      const getMasterDealer = async () => {
        try {
          const [dealer] = await Promise.all([
            useServiceAPI.get(paths.pathMasterDealerDropdown, {
              user_id: filter.sale
            }),
          ]);

          setDealerList(dealer.data);
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาด");
        }
      };

      getMasterDealer();
    } else {
      handleClear();
    }
  };

  const handleDelete = async (documentNumber) => {
    confirm({
      title: "Do you want to delete ?",
      icon: <ExclamationCircleFilled />,
      content: [],
      centered: true, // ตัวเลือกนี้ช่วยจัดให้อยู่กลาง
      async onOk() {
        try {
          // Call API to delete the event
          const response = await useServiceAPI.delete(
            `/activity/delete?document_number=${encodeURIComponent(documentNumber)}`
          );
          await fetchData();
          if (response.status === 200) {
            // Show success notification
            showNotification(
              "success",
              response.data.message || "Event deleted successfully!",
              response.data.message_line || ["The event has been removed."]
            );
          } else {
            // Show error notification if response is not 200
            console.error("Failed to delete event:", response.message);
            showNotification(
              "error",
              response.message || "Failed to delete event.",
              response.message_line || ["Please try again later."]
            );
          }
        } catch (error) {
          // Handle errors and show an error notification
          console.error("Error deleting event:", error);
          showNotification(
            "error",
            "An error occurred while deleting the event.",
            ["Please try again later."]
          );
        }
      },
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

  const header = [
    { title: "Activity No", width: 150, dataIndex: "activityNo", align: "start" },
    { title: "Activity Type", width: 150, dataIndex: "activityType", align: "start" },
    { title: "Sale", width: 150, dataIndex: "sale", align: "start" },
    { title: "Shop", width: 150, dataIndex: "shop", align: "start" },
    { title: "Date", width: 150, dataIndex: "date", align: "start" },
    // { title: "Time", width: 100, dataIndex: "time", align: "start", className: "text-nowrap" },
    { title: "Create Date", width: 100, dataIndex: "createdAt", align: "start", className: "text-nowrap" },
    { title: "Mapping", width: 150, dataIndex: "mappingStatus", align: "start" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];


  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      keyword: filters.keyword || "",
      activity_type_id: filters.activity_type || "",
      user_id: filters.sale || "",
      dealer_id: filters.shop || "",
      page: "all",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathActivityList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = data.map((row, index) => {
          const actionItems = [
            {
              key: "1",
              label: (
                <ItemDropDown
                  mode="edit"
                  link={`/activity/edit?documentNumber=${encodeURIComponent(row.document_number)}&pageCode=${encodeURIComponent(row.page_code)}`}
                />
              )
            },
            {
              key: "2",
              label: (
                <ItemDropDown
                  mode="delete"
                  link={`#`}
                  onClick={() => handleDelete(row.document_number)}
                />
              )
            },
          ];

          // const handleBadgeClick = (data) => {
          //   if (row.status_mapping_name !== 'complete') {
          //     handleShowMappingModal(data);
          //   } else {
          //     console.log("Action not allowed for 'complete' status.");
          //   }
          // };

          return {
            key: index + 1 + (current - 1) * pageSize,
            activityNo: row.document_number,
            activityType: row.activity_type_name,
            shop: row.dealer_name ?? '-',
            sale: row.user_name ?? '-',
            date: row.document_date,
            time: row.time,
            createdAt: dayjs(row.created_at).format("YYYY-MM-DD"),
            mappingStatus: (
              <BadgeStatus
                text={row.status_mapping_name}
                bgColor={row.status_mapping_bg_color}
                textColor={row.status_mapping_color}
                onClick={() => {
                  handleBadgeClick(row);
                }}
              // style={{ cursor: row.status_mapping_name !== 'complete' ? 'pointer' : 'not-allowed' }}
              />
            ),
            action: (
              <Dropdown menu={{ items: actionItems }} placement="bottomRight">
                <a onClick={(e) => e.preventDefault()}>
                  <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
                </a>
              </Dropdown>
            ),
          };
        });

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

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };

  // Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [activityType, sale] = await Promise.all([
          useServiceAPI.get(paths.pathMasterActivityType, {}),
          useServiceAPI.get(paths.pathMasterDealerAll, {}),
        ]);

        setActivityList(activityType.data);
        setSaleList(sale.data);
      } catch (error) {

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
        <ActionButton mode="create" text="Create" onClick={(e) => navigate("/activity/create?pageCode=activity_transaction")} />
      </div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleChange}
        filters={filters}
      />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
          onChange={handleTableChange}
        />
      </BoxPrimary>

      <DynamicModal
        title="Sale Team"
        isVisible={isProductModalVisible}
        onClose={handleCloseProductModal}
        header={productModalHeader}
        dataSource={productModalData}
        width="1200px" // Customize the width to make it extra-large
      />

      {/* FormModal */}
      <FormModal
        isVisible={isMappingModalVisible}
        onClose={() => setIsMappingModalVisible(false)} // Handling closing of modal
        onOk={handleOKMappingModal} // Pass the function directly
        title="Mapping"
        dataSource={mappingData}
        perceptionData={perceptionData}
        isReadOnly={isFormModalReadOnly}

      />
    </MainLayout>
  );
}
