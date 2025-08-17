import React, { useEffect, useState, useContext } from "react";
import { Dropdown, Modal, Select, Tabs } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import { AuthContext } from "../../../../contexts/AuthContext";
import FilterByOrder from "../../../../components/filter/FilterByOrder";
const { TabPane } = Tabs;

export default function SalesPointsList() {
  const navigate = useNavigate();
  const { showMsg, showNotification } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataStatus, setDataStatus] = useState([]);
  const [permission, setPermission] = useState([]);
  const [defaultOption, setDefaultOption] = useState();
  const [tableLoading, setTableLoading] = useState(false);
  const [filterValues, setFilterValues] = useState({});
  const [activeTab, setActiveTab] = useState("list");
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 50,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });
  const { confirm } = Modal;

  const [saleList, setSaleList] = useState([]);

  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  useEffect(() => {
    const sale = filterValues.sale;

    if (sale) {
      const userId =
        typeof sale === "object" && sale.value ? sale.value : sale;

      const getDealersBySale = async () => {
        try {
          const response = await useServiceAPI.get(
            paths.pathMasterDealerDropdown,
            { user_id: userId }
          );
          setDataDealer(response.data);

        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาดในการโหลด Dealer");
        }
      };

      getDealersBySale();
    }
  }, [filterValues.sale]);

  // Get Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [sale, status] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "order",
          }),
        ]);


        setSaleList(sale.data);

        const dataStatus = [];
        status.data.map((data, index) => {
          dataStatus.push({
            id: data.code,
            name: data.name,
          });
        });
        setDataStatus(dataStatus);

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
      options: dataDealer,
      moderef: false,
    },
    {
      key: "order_no",
      type: "text",
      label: "Order No",
      placeholder: "Order No",
      moderef: false,
    },
    {
      key: "status",
      type: "select",
      label: "Status",
      placeholder: "All",
      options: dataStatus,
      moderef: false,
    },

    {
      key: "dater",
      type: "dater",
      label: "Date",
      placeholder: "Date",
      moderef: false,
    },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Order No", width: 150, dataIndex: "orderNo", align: "left" },
    { title: "Sales", width: 200, dataIndex: "sale", align: "left" },
    { title: "Dealer", width: 200, dataIndex: "dealer", align: "left" },
    { title: "Sub Dealer", width: 200, dataIndex: "sub_dealer", align: "left" },
    { title: "Value (THB)", width: 100, dataIndex: "value", align: "right" },
    {
      title: "Order Date",
      width: 150,
      dataIndex: "orderDate",
      align: "center",
    },
    { title: "Status", width: 150, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];


  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      // user_id: filters.sale || defaultOption,
      user_id: filters.sale || "",
      dealer_id: filters.dealer || "",
      keyword: filters.order_no || "",
      trasaction_status_code: filters.status || "",
      dater: filters.dater || "",
      page: "all",
      use_flag: filters.use_flag || "",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathSalePointOrderList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;
        setPermission(response.data.permission);

        const newDataSource = data.map((order, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          orderNo: order.document_number,
          sale: order.user_name,
          sub_dealer: order.sub_dealer_name,
          dealer: order.dealer_name,
          value: order.net_amount_display,
          orderDate: order.document_date,
          payOverdue: (
            <BadgeStatus
              text={order.status_payment_name}
              bgColor={order.status_payment_bg_color}
              textColor={order.status_payment_color}
            />
          ),
          status: (
            <BadgeStatus
              text={order.status_transaction_name}
              bgColor={order.status_transaction_bg_color}
              textColor={order.status_transaction_color}
            />
          ),
          sapStatus: (
            <BadgeStatus
              text={order.status_interface_name}
              bgColor={order.status_interface_bg_color}
              textColor={order.status_interface_color}
            />
          ),
          createdBy: order.created_by,
          action: (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 1,
                    label: (
                      <ItemDropDown
                        mode="view"
                        onClick={() => {
                          navigate("/order/view", {
                            state: {
                              document_number: order.document_number,
                            },
                          });
                        }}
                      />
                    ),
                  },
                  {
                    key: 2,
                    label: (
                      <ItemDropDown
                        mode="edit"
                        onClick={() => {
                          navigate("/order/edit", {
                            state: {
                              document_number: order.document_number,
                            },
                          });
                        }}
                      />
                    ),
                  },
                  {
                    key: 3,
                    label: (
                      <ItemDropDown
                        mode="delete"
                        onClick={() => {
                          handleDelete(order.document_number);
                        }}
                      />
                    ),
                  },
                ],
              }}
              placement="bottom"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img
                  src="/img/icons/action.png"
                  alt="button icon"
                  className="inline-block w-5 h-5 mr-2"
                />
              </a>
            </Dropdown>
          ),
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

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };

  const handleChange = (filters) => {
    setFilterValues(filters);
  };

  const handleDelete = async (documentNumber) => {
    confirm({
      title: "Do you want to delete ?",
      icon: <ExclamationCircleFilled />,
      content: [],
      centered: true, // ตัวเลือกนี้ช่วยจัดให้อยู่กลาง
      async onOk() {
        try {
          const response = await useServiceAPI.delete(paths.pathGetOrderDelete, {
            document_number: documentNumber,
          });

          if (response.status === 200) {
            // Show success notification
            showNotification("success",
              response.data.message || "Event deleted successfully!",
              response.data.message_line || ["The event has been removed."]
            ).then(() => {

            })
          } else {
            showNotification("warning",
              response.data.message || "Event deleted successfully!",
              response.data.message_line || ["The event has been removed."]
            )
          }

        } catch (error) {
          // Handle errors and show an error notification
          if (error.response.data.status === 400) {
            const message = error.response.data.data;
            showNotification("warning",
              message.Message.Message_Header,
              message.Message.Message_Line
            )
          }
        }
      },
    });
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between items-center">
        <div className="title-page">Order List</div>
        <div className="flex gap-2">
          {permission.btn_create && (
            <ActionButton
              mode="create"
              text="Create"
              onClick={(e) => navigate("/order/create")}
            />
          )}
        </div>
      </div>


      <Tabs activeKey={activeTab} onChange={setActiveTab} className="custom-tabs">
        <TabPane tab={<span className="tab-title">Sales Points List</span>} key="list">

          <FilterByOrder
            onSearch={handleSearch}
            onClear={handleClear}
            onChange={handleChange}
            filters={filters}
          />
          <br />
          <BoxPrimary>
            <TableComponent
              header={header}
              dataSource={dataSource}
              pagination={tableParams.pagination}
              loading={tableLoading}
              onChange={handleTableChange}
            />
          </BoxPrimary>
        </TabPane>

        <TabPane tab={<span className="tab-title">Sales Points Request</span>} key="request">
        </TabPane>
      </Tabs>





    </MainLayout>
  );
}
