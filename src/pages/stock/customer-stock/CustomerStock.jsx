import React, { useEffect, useState, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Dropdown, Modal, Select } from "antd";
import FilterByOrder from "../../../components/filter/FilterByOrder";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/CorsService";
import formatNumber from "../../../utils/number";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import { ExclamationCircleFilled } from "@ant-design/icons";

export default function CustomerStock() {
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
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });
  const { confirm } = Modal;

  // Get Master
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [sale, status] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown, {
            status: "",
          }),
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "order",
          }),
        ]);

        // setDataSale(sale.data);
        const formattedOptions = sale.data.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        // if (formattedOptions.length > 0) {
        //   setDefaultOption("");
        // }
        setDataSale(formattedOptions);

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
      key: "dealer",
      type: "select",
      label: "Dealer",
      placeholder: "All",
      options: dataDealer,
      moderef: false,
    },
    {
      key: "sub_dealer",
      type: "select",
      label: "Sub Dealer",
      placeholder: "All",
      options: dataDealer,
      moderef: false,
    },
    {
      key: "date",
      type: "date",
      label: "Date",
      placeholder: "All",
      options: dataStatus,
      moderef: false,
    },
  ];

  console.log("filters : ", filters);

  const header = [
    {
      title: "Date",
      width: 150,
      dataIndex: "document_date",
      align: "center",
    },
    { title: "Dealer", width: 200, dataIndex: "dealer", align: "left" },
    { title: "Sub Dealer", width: 200, dataIndex: "sub_dealer", align: "left" },
    {
      title: "Product",
      width: 150,
      dataIndex: "product",
      align: "center",
    },
    {
      title: "QTY",
      width: 150,
      dataIndex: "qty",
      align: "left",
    },
    {
      title: "Total Value",
      width: 150,
      dataIndex: "total_value",
      align: "left",
    },
    { title: "Create By", width: 150, dataIndex: "createdBy", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  function formatNumber(value) {
    if (!value) return "0";
    return parseFloat(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatNumber2(value) {
    //console.log("value : ", value);
    if (!value) {
      return "0";
    } else if (value == ".00") {
      return "0";
    } else {
      return parseInt(value).toLocaleString("en-US");
    }
  }

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      keyword: filters.order_no || "",
      use_flag: "1",
      user_id: defaultOption || "",
      dealer_id: filters.dealer || "",
      sub_dealer_id: "",
      trasaction_status_code: filters.status || "",
      page: "all",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathStockList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;
        setPermission(response.data.permission);

        console.log("response : ", response);

        const newDataSource = data.map((stock, index) => ({
          document_date: stock.document_date,
          dealer: stock.dealer_name,
          sub_dealer: stock.sub_dealer_name,
          quantity_product: stock.quantity_product,
          product: (
            <BadgeStatus
              text={parseInt(stock.quantity_product)}
              bgColor="#F89E18"
              textColor="#FFFFFF"
            />
          ),
          qty: parseInt(stock.quantity_product),
          total_value: formatNumber2(stock.net_amount),
          createdBy: stock.created_by,
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
                          navigate("/customer-stock/view", {
                            state: {
                              document_number: stock.document_number,
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
                          navigate("/customer-stock/edit", {
                            state: {
                              document_number: stock.document_number,
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
                          handleDelete(stock.document_number);
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
        console.log("newDataSource : ", newDataSource);
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

  const handleDelete = async (documentNumber) => {
    console.log("documentNumber : ", documentNumber);
    confirm({
      title: "Do you want to delete ?",
      icon: <ExclamationCircleFilled />,
      content: [],
      centered: true, // ตัวเลือกนี้ช่วยจัดให้อยู่กลาง
      async onOk() {
        try {
          const response = await useServiceAPI.delete(paths.pathStockDelete, {
            document_number: documentNumber,
          });

          console.log("response : ", response);

          if (response.status === 200) {
            // Show success notification
            showNotification(
              "success",
              response.data.message || "Event deleted successfully!",
              response.data.message_line || ["The event has been removed."]
            ).then(() => {});
            fetchData();
          } else {
            showNotification(
              "warning",
              response.data.message || "Event deleted successfully!",
              response.data.message_line || ["The event has been removed."]
            );
          }
        } catch (error) {
          // Handle errors and show an error notification
          if (error.response.data.status === 400) {
            const message = error.response.data.data;
            showNotification(
              "warning",
              message.Message.Message_Header,
              message.Message.Message_Line
            );
          }
        }
      },
    });
  };

  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

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

  const handleChange = (filter) => {
    setDefaultOption(filter);
    const getMasterDealer = async () => {
      setLoading(true);
      try {
        const [dealer] = await Promise.all([
          useServiceAPI.get(paths.pathMasterDealerDropdown, {
            user_id: filter,
          }),
        ]);

        console.log("dealer : ", dealer);

        setDataDealer(dealer.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMasterDealer();
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between items-center">
        <div className="title-page">Customer Stock List</div>
        <div className="flex gap-2">
          {permission.btn_create && (
            <ActionButton
              mode="create"
              text="Create"
              onClick={(e) => navigate("/customer-stock/create")}
            />
          )}
        </div>
      </div>

      <FilterByOrder
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
    </MainLayout>
  );
}
