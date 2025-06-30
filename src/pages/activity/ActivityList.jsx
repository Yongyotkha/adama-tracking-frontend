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
import FormMappingModal from "../../components/modal/FormMappingModal";
import { ExclamationCircleFilled } from "@ant-design/icons";

export default function ActivityList() {
  const { confirm } = Modal;
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState(false);
  const [activityList, setActivityList] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
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

  const [userCreate, setUserCreate] = useState([]);
  const [mappingData, setMappingData] = useState({});
  const [perceptionData, setPerceptionData] = useState([]);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [isMappingModalVisible, setIsMappingModalVisible] = useState(false);
  const [isDealerDisabled, setIsDealerDisabled] = useState(true);
  const [isSubDealerDisabled, setIsSubDealerDisabled] = useState(true);

  const navigate = useNavigate();

  const handleBadgeClick = (rowData) => {
    setMappingData(rowData);
    console.log(rowData);
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
        setPerceptionData(perception.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);

  const handleOKMappingModal = (data) => {
    const body = {
      document_number: data.document_number,
      location_longitude: data.location_longitude,
      location_latitude: data.location_latitude,
      location_address: data.location_address,
      perception_id: data.perception_id,
      remark: data.remark,
      image_list: data.image_list || ["defaultImage"], // Set a default or retrieve it from data
    };

    const updateMappingDetail = async () => {
      try {
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

    setIsMappingModalVisible(false);
    updateMappingDetail();
  };

  const filters = [
    {
      key: "keyword",
      type: "text",
      label: "Activity No",
      placeholder: "Activity No",
    },
    {
      key: "activity_type",
      type: "select",
      label: "Activity Type",
      placeholder: "All",
      options: activityList,
    },
    {
      key: "sale",
      type: "select",
      label: "Sales",
      placeholder: "All",
      options: saleList,
      moderef: true,
    },
    {
      key: "dealer",
      type: "select",
      label: "Dealer",
      placeholder: "All",
      options: dealerList,  // ✅ ใช้ dealerList
      disabled: isDealerDisabled,  // ✅ เพิ่มตรงนี้
    },
    {
      key: "shop",
      type: "select",
      label: "Shop",
      placeholder: "All",
      options: subDealerList, // ✅ shop
      disabled: isSubDealerDisabled, // ✅ เพิ่มตรงนี้
    },
    {
      key: "Date",
      type: "date",
      label: "Date",
    },
    {
      key: "created_by",
      type: "select",
      label: "Create By",
      placeholder: "All",
      options: userCreate,
      moderef: true,
    },
  ];

  const handleSearch = (filters) => {
    setTableParams({
      ...tableParams,
      filters,
      pagination: {
        current: 1,
        pageSize: 10,
      },
    });
  };

  const handleClear = () => {
    setTableParams({
      ...tableParams,
      filters: {},
    });
  };

  const handleChange = (filter) => {
    if (filter && filter.sale) {

      console.log('filter : ',filter)
      const userId =
        typeof filter.sale === "object" && filter.sale.value
          ? filter.sale.value
          : filter.sale;

      const getDealersAndSubDealersBySale = async () => {
        try {
          // ดึง Dealer List
          const dealerResponse = await useServiceAPI.get(
            paths.pathMasterDealerAll,
            { user_id: userId }
          );

          const formattedDealer = dealerResponse.data.map((item) => ({
            name: item.name,
            id: item.id,
          }));

          setDealerList(formattedDealer);

          // ดึง Sub-Dealer List
          const subDealerResponse = await useServiceAPI.get(
            paths.pathActivitySubDealers,
            { dealer_id: filter.dealer }
          );

          // const formattedSubDealer = subDealerResponse.data.map((item) => ({
          //   name: item.sub_dealer_name,
          //   id: item.sub_dealer_id,
          // }));

          setSubDealerList(subDealerResponse.data);

          // ✅ เมื่อมี Sale ที่เลือกอยู่ -> Enable Dealer และ Shop
          setIsDealerDisabled(false);
          setIsSubDealerDisabled(false);

        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาดในการโหลด Dealer/Sub-dealer");
        }
      };

      getDealersAndSubDealersBySale();
    }

    // ✅ ถ้า Sale ถูก clear (null หรือ undefined หรือ '')
    if (!filter?.sale) {
      setDealerList([]);
      setSubDealerList([]);
      setIsDealerDisabled(true);
      setIsSubDealerDisabled(true);
    }
  };

  const handleDelete = async (documentNumber) => {
    confirm({
      title: "Do you want to delete ?",
      icon: <ExclamationCircleFilled />,
      content: [],
      centered: true,
      async onOk() {
        try {
          const response = await useServiceAPI.delete(
            `/activity/delete?document_number=${encodeURIComponent(
              documentNumber
            )}`
          );
          await fetchData();
          if (response.status === 200) {
            showNotification(
              "success",
              response.data.message || "Event deleted successfully!",
              response.data.message_line || ["The event has been removed."]
            );
          } else {
            console.error("Failed to delete event:", response.message);
            showNotification(
              "error",
              response.message || "Failed to delete event.",
              response.message_line || ["Please try again later."]
            );
          }
        } catch (error) {
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

  const header = [
    {
      title: "Activity No",
      width: 150,
      dataIndex: "activityNo",
      align: "start",
    },
    {
      title: "Activity Type",
      width: 150,
      dataIndex: "activityType",
      align: "start",
    },
    { title: "Sales", width: 150, dataIndex: "sale", align: "start" },
    { title: "Dealer", width: 150, dataIndex: "dealer_name", align: "start" }, // ✅ เพิ่มตรงนี้
    { title: "Shop", width: 150, dataIndex: "sub_dealer_name", align: "start" }, // ✅ เพิ่มตรงนี้
    //{ title: "Dealer", width: 150, dataIndex: "dealer", align: "start" },
    { title: "Date", width: 150, dataIndex: "date", align: "start" },
    {
      title: "Create By",
      width: 100,
      dataIndex: "createdBy",
      align: "start",
      className: "text-nowrap",
    },
    {
      title: "Create Date",
      width: 100,
      dataIndex: "createdAt",
      align: "start",
      className: "text-nowrap",
    },
    {
      title: "Mapping",
      width: 150,
      dataIndex: "mappingStatus",
      align: "start",
    },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "created_at";

    const requestData = {
      keyword: filters.keyword || "",
      activity_type_id: filters.activity_type || "",
      user_id: filters.sale || "",
      create_by: filters.created_by || "",
      sub_dealer_id: filters.shop || "", // ✅ ใส่ dealer_id ด้วย
      master_dealer_id: parseInt(filters.dealer) || "", // ✅ shop เป็น sub_dealer_id
      page: "all",
      page_mode: "list",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
      document_date: filters.Date ? dayjs(filters.Date).format('YYYY-MM-DD') : "",
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathActivityList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;
        // console.log(data);
        // console.log(records_filtered);
        const newDataSource = data.map((row, index) => {
          console.log(row.status_mapping_name);
          return {
            key: index + 1 + (current - 1) * pageSize,
            activityNo: row.document_number,
            activityType: row.activity_type_name,
            sale: row.user_name ?? "-",
            sub_dealer_name: row.sub_dealer_name ?? "-",
            dealer_name: row.dealer_name ?? "-",
            //dealer: row.dealer_name ?? "-",// ✅ Dealer Name
            date: row.document_date,
            time: row.time,
            createdBy: row.created_name,
            createdAt: dayjs(row.created_at).format("YYYY-MM-DD"),
            mappingStatus: (
              <BadgeStatus
                text={row.status_mapping_name}
                bgColor={row.status_mapping_bg_color}
                textColor={row.status_mapping_color}
                onClick={() => {
                  handleBadgeClick(row);
                }}
              />
            ),
            action: (
              // <Dropdown menu={{ items: actionItems }} placement="bottomRight">
              <Dropdown
                menu={{
                  items: row.action.map((actionItem, actionIndex) => {
                    let path = "";
                    let mode = actionItem.action.toLowerCase();
                    let onClickHandler = null;

                    if (
                      actionItem.action.toLowerCase() == "edit" ||
                      actionItem.action.toLowerCase() == "view"
                    ) {
                      path = `/activity/${actionItem.action.toLowerCase()}`;
                      onClickHandler = () => {
                        navigate(path, {
                          state: {
                            documentNumber: row.document_number,
                            pageCode: row.page_code,
                            page_mode: actionItem.action,
                          },
                        });
                      };
                    } else {
                      onClickHandler = () => handleDelete(row.document_number);
                    }
                    return {
                      key: actionIndex,
                      label: (
                        <ItemDropDown mode={mode} onClick={onClickHandler} />
                      ),
                    };
                  }),
                }}
                placement="bottomRight"
              >
                <a onClick={(e) => e.preventDefault()}>
                  <img
                    src="/img/icons/action.png"
                    alt="Actions icon"
                    className="inline-block w-5 h-5"
                  />
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
      filters: tableParams.filters,
      sortOrder: sorter.order === "descend" ? "desc" : "desc",
      sortField: sorter.field,
    });
  };

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [activityType, sale,userc] = await Promise.all([
          useServiceAPI.get(paths.pathMasterActivityType, {}),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
          useServiceAPI.get(paths.pathActivityListUser, { "platform": "web" }),
        ]);

        setActivityList(activityType.data);
        setSaleList(sale.data);
        setUserCreate(userc)
        // console.log(sale.data);

      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);


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
        <ActionButton
          mode="create"
          text="Create"
          onClick={(e) =>
            navigate("/activity/creates", {
              state: {
                pageCode: "activity_transaction",
              },
            })
          }
        />
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

      <FormMappingModal
        isVisible={isMappingModalVisible}
        onClose={() => setIsMappingModalVisible(false)}
        onOk={handleOKMappingModal}
        title="Mapping"
        dataSource={mappingData}
        perceptionData={perceptionData}
      />
    </MainLayout>
  );
}
