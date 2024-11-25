import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import FilterByOrder from "../../components/filter/FilterByOrder";
import ActionButton from "../../components/button/ActionButton";
import BadgeStatus from "../../components/badge/BadgeStatus";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";
import ItemDropDown from "../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";

export default function OrderList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [dataSale, setDataSale] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataStatus, setDataStatus] = useState([]);
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

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [sale] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown, {
            status: "all",
          }),
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

  const filters = [
    {
      key: "sale",
      type: "select",
      label: "Sale",
      placeholder: "All",
      options: dataSale,
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
      options: [
        { id: "Active", name: "Active" },
        { id: "Inactive", name: "Inactive" },
        { id: "Pending", name: "Pending" },
      ],
      moderef: false,
    },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Order No", width: 150, dataIndex: "orderNo", align: "left" },
    { title: "Sale", width: 200, dataIndex: "sale", align: "left" },
    { title: "Dealer", width: 200, dataIndex: "dealer", align: "left" },
    { title: "Value (THB)", width: 100, dataIndex: "value", align: "right" },
    {
      title: "Order Date",
      width: 150,
      dataIndex: "orderDate",
      align: "center",
    },
    {
      title: "Pay Overdue",
      width: 150,
      dataIndex: "payOverdue",
      align: "center",
    },
    { title: "Status", width: 150, dataIndex: "status", align: "center" },
    { title: "Create By", width: 150, dataIndex: "createdBy", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const actionItems = [
    { key: "1", label: <ItemDropDown mode="view" link="/order/view" /> },
  ];

  const actionItemsPending = [
    { key: "1", label: <ItemDropDown mode="edit" link="/order/edit" /> },
    { key: "2", label: <ItemDropDown mode="view" link="/order/detail" /> },
    {
      key: "3",
      label: (
        <ItemDropDown
          mode="delete"
          onClick={() => console.log("Delete clicked")}
        />
      ),
    },
  ];

  ////////////////////////////////////////////// table ///////////////////////////////////////////////
  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "asc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      // keyword: filters.keyword || "",
      // user_id: filters.user_id || "",
      // contact_number: filters.contact_number || "",
      // position_id: filters.position || "",
      page: "all",
      use_flag: filters.use_flag || "",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathGetOrderList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = data.map((order, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          orderNo: order.document_number,
          sale: order.user_name,
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
          createdBy: order.updated_by,
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

  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  const handleSearch = (filter) => {
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

  const handleChange = (filter) => {
    console.log(filter);
    
    if (filter.sale) {
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
    } else {
      handleClear();
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Order List</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={(e) => navigate("/order/create")}
        />
      </div>

      <FilterByOrder
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleChange}
        filters={filters}
      />

      <BoxPrimary>
        <TableComponent header={header} dataSource={dataSource} />
      </BoxPrimary>
    </MainLayout>
  );
}
