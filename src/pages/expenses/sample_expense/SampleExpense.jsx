import React, { useState, useEffect } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import TableComponent from "../../../components/table/TableComponent";
import { Dropdown, Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";
import BadgeStatus from "../../../components/badge/BadgeStatus";

export default function SampleExpense() {
  const { confirm } = Modal;
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
  const [statusOptions, setStatusOptions] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [cropList, setCropList] = useState([]);
  const navigate = useNavigate();

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
      options: dealerList,
      moderef: true,
    },
    {
      key: "sub_dealer",
      type: "select",
      label: "Sub Dealer",
      placeholder: "All",
      options: subDealerList,
      moderef: true,
    },
    {
      key: "crop",
      type: "select",
      label: "Crop",
      placeholder: "All",
      options: cropList, // Added for Crop
    },
    {
      key: "status_transaction_code",
      type: "select",
      label: "Status",
      placeholder: "All",
      options: statusOptions, // Added for Status
    },
    {
      key: "document_number",
      type: "text",
      label: "Document Number",
      placeholder: "All",
    },
    {
      key: "document_date",
      type: "date",
      label: "Document Date",
      placeholder: "Select Date",
    },
  ];


  useEffect(() => {
    fetchData();
    fetchStatusOptions();
    fetchSales(); // Fetch sales data
    fetchCrop(); // Fetch crop data
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);


  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    // Prepare request data
    const requestData = {
      document_number: filters.document_number || "",
      document_date: filters.document_date || "",
      use_flag: "1",  // Not displayed on filter
      user_id: filters.sale || "",
      dealer_id: filters.dealer || "",  // Include dealer_id
      sub_dealer_id: filters.sub_dealer || "",  // Include sub_dealer_id if available
      crop_id: filters.crop || "", // Add crop_id
      status_transaction_code: filters.status_transaction_code || "", // Add status code
      page: "all",  // Fixed page value
      page_length: current,
      page_size: pageSize,
    };

    // If both dealer_id and sub_dealer_id exist, send them both in the body
    if (filters.dealer || filters.sub_dealer) {
      requestData.dealer_id = filters.dealer || "";
      requestData.sub_dealer_id = filters.sub_dealer || "";
    }

    try {
      // Call the API for sample expenses (include dealer_id and sub_dealer_id in the request)
      const response = await useServiceAPI.get(paths.pathSampleExpenseList, requestData);
      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = data.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          document_number: row.document_number,
          document_datetime: row.document_datetime,
          sub_dealer_name: row.sub_dealer_name,
          dealer_name: row.dealer_name,
          value: row.net_amount_display,
          crop_name: row.crop_name,
          action: (
            <Dropdown
              menu={{
                items: row.action.map((actionItem, actionIndex) => ({
                  key: actionIndex,
                  label: (
                    <ItemDropDown
                      mode={actionItem.action.toLowerCase()}
                      onClick={() =>
                        navigate(`/expenses/sample/${actionItem.action.toLowerCase()}`, {
                          state: { document_number: row.document_number },
                        })
                      }
                    />
                  ),
                })),
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
          status: (
            <BadgeStatus
              text={row.status_transaction_name}
              bgColor={row.status_transaction_bg_color}
              textColor={row.status_transaction_color}
            />
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

  const fetchStatusOptions = async () => {
    try {
      const response = await useServiceAPI.get(paths.pathSampleStatus);
      if (response.status === 200 && response.data) {
        const options = response.data.items.map((statusItem) => ({
          value: statusItem.status_transaction_code,
          label: statusItem.status_transaction_name,
        }));
        setStatusOptions(options);
      }
    } catch (error) {
      console.error("Failed to fetch status options:", error);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await useServiceAPI.get(paths.pathMasterSaleDropdown);
      if (response.status === 200) {
        setSaleList(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    }
  };

  const fetchDealers = async (saleId) => {
    try {
      const response = await useServiceAPI.get(paths.pathMasterDealerDropdown, { user_id: saleId });
      if (response.status === 200) {
        setDealerList(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch dealers:", error);
    }
  };

  const fetchSubDealers = async (dealerId) => {
    try {
      const response = await useServiceAPI.get(paths.pathMasterSubDealerAll, { dealer_id: dealerId });
      if (response.status === 200) {
        const set_sub_dealer = response.data.map((item) => ({
          name: item.sub_dealer_name,  // Use sub_dealer_name for label
          id: item.sub_dealer_id,    // Use sub_dealer_id for value
        }));
        setSubDealerList(set_sub_dealer);  // Now subDealerList will have the correct format
      }
    } catch (error) {
      console.error("Failed to fetch sub-dealers:", error);
    }
  };

  const fetchCrop = async () => {
    try {
      const response = await useServiceAPI.get(paths.pathMasterCrop);
      if (response.status === 200) {
        const options = response.data.map((crop) => ({
          id: crop.id,
          name: crop.name, // Display name of the crop
        }));
        setCropList(options); // Set crop options
      }
    } catch (error) {
      console.error("Failed to fetch crops:", error);
    }
  };

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

  const handleFilterChange = (filter) => {
    if (filter.sale) {
      fetchDealers(filter.sale); // Fetch dealers when sale is selected
    }
    if (filter.dealer) {
      fetchSubDealers(filter.dealer); // Fetch sub-dealers when dealer is selected
    }
  };

  const header = [
    { title: "Code", dataIndex: "document_number", align: "left" },
    { title: "Date", dataIndex: "document_datetime", align: "left" },
    { title: "Sub Dealer", dataIndex: "sub_dealer_name", align: "left" },
    { title: "Dealer", dataIndex: "dealer_name", align: "left" },
    { title: "Crop", dataIndex: "crop_name", align: "center" },
    { title: "Value", dataIndex: "value", align: "right" },
    { title: "Status", dataIndex: "status", align: "center" },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Sample Expense</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() => navigate("/expenses/sample/create")}
        />
      </div>
      <Filter
        filters={filters}
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleFilterChange}
      />
      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={{ pageSize: 10 }}
          scroll
        />
      </BoxPrimary>
    </MainLayout>
  );
}
