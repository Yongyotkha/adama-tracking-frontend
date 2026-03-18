import React, { useState, useEffect, useContext } from "react";
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
import { AuthContext } from "../../../contexts/AuthContext";

// ถ้ามี helper พวกนี้ใช้อยู่ในโปรเจกต์ ให้ import เพิ่มตาม path จริง
// import { showNotification, showMsg } from "../../../utils/notification";
// import { getUserInfo } from "../../../utils/auth";

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
  const { showMsg, showNotification } = useContext(AuthContext);


  // สมมติว่ามี userInfo ใช้อยู่แล้วในโปรเจกต์
  // const userInfo = getUserInfo();

  const filters = [
    {
      key: "sale",
      type: "select",
      label: "Create By",
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
      options: cropList,
    },
    {
      key: "status_transaction_code",
      type: "select",
      label: "Status",
      placeholder: "All",
      options: statusOptions,
    },
    {
      key: "document_number",
      type: "text",
      label: "Code",
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
    fetchStatusOptions();
    fetchSales();
    fetchDealers();
    fetchSubDealers();
    fetchCrop();
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

  const handleDelete = (document_number) => {
    confirm({
      title: "Do you want to delete this sample expense?",
      icon: <ExclamationCircleFilled />,
      onOk: async () => {
        try {
          setLoading(true);

          const res = await useServiceAPI.put(
            paths.pathSampleDelete,
            {
              document_number,
              page_code: 'sample',
            }
          );

          if (res.status === 200) {
            showNotification("success", "ลบข้อมูลเรียบร้อยแล้ว");
            fetchData();
          } else {
            showMsg("error", res.data.message || "ไม่สามารถลบข้อมูลได้");
            console.error(res.data.message || "ไม่สามารถลบข้อมูลได้");
          }
        } catch (err) {
          showMsg("error", err.message || "เกิดข้อผิดพลาดในการลบ");
          console.error(err.message || "เกิดข้อผิดพลาดในการลบ");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      document_number: filters.document_number || "",
      document_date: filters.document_date || "",
      use_flag: "1",
      user_id: filters.sale || "",
      dealer_id: filters.dealer || "",
      sub_dealer_id: filters.sub_dealer || "",
      crop_id: filters.crop || "",
      status_transaction_code: filters.status_transaction_code || "",
      page: "all",
      page_length: current,
      page_size: pageSize,
    };

    if (filters.dealer || filters.sub_dealer) {
      requestData.dealer_id = filters.dealer || "";
      requestData.sub_dealer_id = filters.sub_dealer || "";
    }

    try {
      const response = await useServiceAPI.get(paths.pathSampleExpenseList, requestData);
      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = data.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,

          document_number: row.document_number || "-",
          document_type: row.document_type || "-",
          document_datetime: row.document_datetime || "-",
          document_date: row.document_date || "-",

          user_id: row.user_id || "-",
          user_name: row.user_name || "-",

          area_id: row.area_id || "-",

          dealer_id: row.dealer_id || "-",
          dealer_name: row.dealer_name || "-",
          sub_dealer_id: row.sub_dealer_id || "-",
          sub_dealer_name: row.sub_dealer_name || "-",

          crop_id: row.crop_id || "-",
          crop_name: row.crop_name || "-",

          quantity_product: row.quantity_product || "0.00",
          quantity_product_foc: row.quantity_product_foc || "0.00",
          quantity_other: row.quantity_other || "0.00",
          line_product: row.line_product || "0",
          line_other: row.line_other || "0",
          net_amount_product: row.net_amount_product || "0.00",
          net_amount_other: row.net_amount_other || "0.00",
          net_amount: row.net_amount || "0.00",
          net_amount_display: row.net_amount_display || "0",

          ref_remark: row.ref_remark || "-",
          use_flag: row.use_flag || "-",

          created_at: row.created_at || "-",
          created_by: row.created_by || "-",
          updated_at: row.updated_at || "-",
          updated_by: row.updated_by || "-",

          status_name: row.status_name || "-",
          status_transaction_name: row.status_transaction_name || "-",

          status: (
            <BadgeStatus
              text={row.status_transaction_name || "-"}
              bgColor={row.status_transaction_bg_color || "#d9d9d9"}
              textColor={row.status_transaction_color || "#000000"}
            />
          ),

          action: (
            <Dropdown
              menu={{
                items: (row.action || []).map((actionItem, actionIndex) => ({
                  key: actionIndex,
                  label: (
                    <ItemDropDown
                      mode={actionItem.action.toLowerCase()}
                      onClick={() => {
                        const action = actionItem.action.toLowerCase();

                        if (action === "delete") {
                          handleDelete(row.document_number);
                          return;
                        }

                        navigate(`/expenses/sample/${action}`, {
                          state: { document_number: row.document_number },
                        });
                      }}
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
        }));

        setDataSource(newDataSource);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: records_filtered,
          },
        }));
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

      if (response.status === 200 && Array.isArray(response.data)) {
        const options = response.data.map((statusItem) => ({
          id: statusItem.code,
          name: statusItem.name,
        }));

        setStatusOptions(options);
      } else {
        setStatusOptions([]);
      }
    } catch (error) {
      console.error("Failed to fetch status options:", error);
      setStatusOptions([]);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await useServiceAPI.get(paths.pathMasterSaleTeam);
      if (response.status === 200) {
        setSaleList(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    }
  };

  const fetchDealers = async () => {
    try {
      const response = await useServiceAPI.get(paths.pathMasterDealerAllTeam);
      if (response.status === 200) {
        setDealerList(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch dealers:", error);
    }
  };

  const fetchSubDealers = async () => {
    try {
      const response = await useServiceAPI.get(paths.pathMasterSubDealerAllTeam);
      if (response.status === 200) {
        const set_sub_dealer = response.data.map((item) => ({
          id: item.sub_dealer_id,
          name: item.sub_dealer_name,
        }));
        setSubDealerList(set_sub_dealer);
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
          name: crop.name,
        }));
        setCropList(options);
      }
    } catch (error) {
      console.error("Failed to fetch crops:", error);
    }
  };

  const handleSearch = (filters) => {
    setTableParams((prev) => ({
      ...prev,
      filters,
      pagination: {
        ...prev.pagination,
        current: 1,
      },
    }));
  };

  const handleClear = () => {
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: {
        ...prev.pagination,
        current: 1,
      },
    }));
  };

  const handleFilterChange = () => { };

  const header = [
    { title: "Code", dataIndex: "document_number", align: "left" },
    { title: "Date Time", dataIndex: "document_datetime", align: "left" },
    { title: "Create By", dataIndex: "created_by", align: "left" },
    { title: "Dealer", dataIndex: "dealer_name", align: "left" },
    { title: "Sub Dealer", dataIndex: "sub_dealer_name", align: "left" },
    { title: "Crop", dataIndex: "crop_name", align: "left" },
    { title: "Qty Product", dataIndex: "quantity_product", align: "right" },
    { title: "Net Amount", dataIndex: "net_amount_product", align: "right" },
    { title: "Remark", dataIndex: "ref_remark", align: "left" },
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