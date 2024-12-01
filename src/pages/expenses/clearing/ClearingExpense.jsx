import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function ClearingExpense() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
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

  const navigate = useNavigate();

  const filters = [
    {
      key: "customer",
      type: "select",
      label: "Customer",
      placeholder: "All",
      options: [
        { value: 'Chaifar', label: 'Chaifar' },
        { value: 'OtherCustomer', label: 'OtherCustomer' },
      ],
    },
    {
      key: "expense_no",
      type: "text",
      label: "Expense No",
      placeholder: "All",
    },
    {
      key: "activity_reference",
      type: "text",
      label: "Activity Reference",
      placeholder: "All",
    },
    {
      key: "type_of_meeting",
      type: "text",
      label: "Type of Meeting",
      placeholder: "All",
    },
    {
      key: "date",
      type: "date",
      label: "Date",
      placeholder: "YYYY-MM-DD",
    },
  ];
  
  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  const header = [
    { title: "No", dataIndex: "key", align: "center" },
    { title: "Customer", dataIndex: "customer", align: "left" },
    { title: "Expense No", dataIndex: "expenseNo", align: "left" },
    { title: "Activity Reference", dataIndex: "activityReference", align: "left" },
    { title: "Type of Meeting", dataIndex: "typeOfMeeting", align: "center" },
    { title: "Date", dataIndex: "date", align: "center" },
    { title: "Status", dataIndex: "status", align: "center" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      page_code:"expense_clearing",
      keyword: filters.keyword || "",
      use_flag : "1",
      user_id : "",
      dealer_id : "",
      activity_type_id : "",
      document_number_referrent :"",
      customer_name :"",
      page: "all",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathActivityExpenseList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;
        
        const newDataSource = data.map((row, index) => {
          const actionItems = [
            { key: "1", label: <ItemDropDown mode="edit" link={`/activity/edit?documentNumber=${encodeURIComponent(row.document_number)}&pageCode=${encodeURIComponent(row.page_code)}`} /> },
            { key: "3", label: <ItemDropDown mode="delete" link="#" /> },
          ];
        
          return {
            key: index + 1 + (current - 1) * pageSize,
            customer: row.dealer_name,
            expenseNo: row.document_number,
            activityReference: row.document_number_referrent,
            typeOfMeeting: row.activity_type_name,
            date: row.document_date,
            status: <BadgeStatus text={row.status_name} bgColor={row.status_bg_color} textColor={row.status_color} />,
            action: (
              <Dropdown menu={{ items: actionItems }} placement="bottom">
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
        <div className="title-page">Clearing Expense</div>
        <ActionButton mode="create" text="Create" onClick={(e) => navigate("/activity/create?pageCode=expense_clearing")} />
      </div>
      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />
      <BoxPrimary>
        <TableComponent 
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
