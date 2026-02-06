import React, { useEffect, useState, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Dropdown, Modal } from "antd";
import Filter from "../../../components/filter/Filter";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import { ExclamationCircleFilled } from "@ant-design/icons";
import DynamicModal from "../../../components/modal/DynamicModal";

export default function CustomerStock() {
  const navigate = useNavigate();
  const { showMsg, showNotification, userInfo } = useContext(AuthContext);
  const { confirm } = Modal;

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [dataSource, setDataSource] = useState([]);
  const [permission, setPermission] = useState([]);

  const [userList, setUserList] = useState([]);
  const [isTerritoryModalVisible, setIsTerritoryModalVisible] = useState(false);

  // ✅ dropdown options
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [stockCreated, setStockCreated] = useState([]);
  const [dataStatus, setDataStatus] = useState([]); // (คุณใช้เป็น options ของ month เดิม)

  // ✅ UI filter draft (onChange)
  const [filterValues, setFilterValues] = useState({});

  // ✅ table state (Search/Clear จะมาเปลี่ยนตรงนี้)
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  const territoryColumns = [
    { title: "No", dataIndex: "key", key: "key", width: 50 },
    { title: "SKU", dataIndex: "code", key: "code" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    { title: "QTY (ctn)", dataIndex: "quantity", key: "quantity" },
  ];

  const header = [
    { title: "Date", width: 150, dataIndex: "document_date", align: "center" },
    { title: "Dealer", width: 200, dataIndex: "dealer", align: "left" },
    { title: "Sub Dealer", width: 200, dataIndex: "sub_dealer", align: "left" },
    { title: "Product", width: 150, dataIndex: "product", align: "center" },
    { title: "QTY", width: 150, dataIndex: "qty", align: "left" },
    { title: "Total Value", width: 150, dataIndex: "total_value", align: "left" },
    { title: "Create By", width: 150, dataIndex: "createdBy", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const getId = (v) => {
    if (!v) return "";
    if (typeof v === "object") return v.value ?? v.id ?? "";
    return v;
  };

  function formatNumber2(value) {
    if (!value || value === ".00") return "0";
    return parseInt(value, 10).toLocaleString("en-US");
  }

  // ✅ Filters (เหมือนเดิม แค่ options Dealer/SubDealer เป็น All)
  const filters = [
    { key: "dealer", type: "select", label: "Dealer", placeholder: "All", options: dealerList, moderef: true },
    { key: "sub_dealer", type: "select", label: "Sub Dealer", placeholder: "All", options: subDealerList },
    { key: "stock_created", type: "select", label: "Create By", placeholder: "All", options: stockCreated },
    { key: "document_date", type: "month", label: "Date", placeholder: "All", options: dataStatus },
  ];

  // ✅ Master (แก้แค่ส่วน dealer/subdealer ให้เป็น All)
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [statusRes, dealerRes, subDealerRes, stockCreatedRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterStatus, { status_type: "order" }),
          useServiceAPI.get(paths.pathMasterDealerAll, { user_id: userInfo?.id }),
          useServiceAPI.get(paths.pathMasterSubDealerAll, {}), // ✅ NEW: subdealer all
          useServiceAPI.get(paths.pathStockCreated, {}),
        ]);

        // ✅ Dealer options (map เผื่อรูปแบบไม่เหมือนกัน)
        setDealerList(
          (dealerRes?.data || []).map((d) => ({
            id: d.id ?? d.dealer_id ?? d.code,
            name: d.name ?? d.dealer_name ?? d.title,
          }))
        );

        // ✅ SubDealer options (all)
        setSubDealerList(
          (subDealerRes?.data || []).map((s) => ({
            id: s.sub_dealer_id ?? s.id ?? s.code,
            name: s.sub_dealer_name ?? s.name ?? s.title,
          }))
        );

        setStockCreated(stockCreatedRes?.data || []);

        // ✅ month options ของคุณ (เดิมคุณเอามาจาก status)
        setDataStatus(
          (statusRes?.data || []).map((x) => ({
            id: x.id ?? x.code,
            name: x.name,
          }))
        );
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserList = async (document_number) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathStockDetail, { document_number });
      if (response.status === 200) {
        const products = response.data.products || [];
        setUserList(
          products.map((item, index) => ({
            key: index + 1,
            code: item.product_code,
            name: item.product_name,
            unit: item.product_unit,
            quantity: item.quantity,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching stock detail:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ fetchData: ใช้ tableParams.filters (กด Search ถึงค่อยค้น)
  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      document_date_month: getId(f.document_date) || "",
      user_create: getId(f.stock_created) || "",
      dealer_id: getId(f.dealer) || "",
      sub_dealer_id: getId(f.sub_dealer) || "",

      page_length: current,
      page_size: pageSize,
      use_flag: "1",
      trasaction_status_code: "",
      payment_status_code: "",
      page: "all",

      orderby_column: sortField,
      orderby: sortOrder,
    };

    try {
      const response = await useServiceAPI.get(paths.pathStockList, requestData);

      if (response.status === 200) {
        const { data, records_filtered, permission: perm } = response.data;
        setPermission(perm || []);

        const btn_action = (docno) => [
          {
            key: 1,
            label: (
              <ItemDropDown
                mode="view"
                onClick={() => navigate("/customer-stock/view", { state: { document_number: docno } })}
              />
            ),
          },
          {
            key: 2,
            label: (
              <ItemDropDown
                mode="edit"
                onClick={() => navigate("/customer-stock/edit", { state: { document_number: docno } })}
              />
            ),
          },
          { key: 3, label: <ItemDropDown mode="delete" onClick={() => handleDelete(docno)} /> },
        ];

        setDataSource(
          (data || []).map((stock, index) => ({
            key: index + 1 + (current - 1) * pageSize,
            document_date: stock.document_date,
            dealer: stock.dealer_name,
            sub_dealer: stock.sub_dealer_name,
            product: (
              <BadgeStatus
                text={stock.line_product}
                bgColor="#F89E18"
                textColor="#FFFFFF"
                onClick={() => {
                  setIsTerritoryModalVisible(true);
                  fetchUserList(stock.document_number);
                }}
              />
            ),
            qty: parseInt(stock.quantity_product || 0, 10),
            total_value: formatNumber2(stock.net_amount),
            createdBy: stock.created_by,
            action: (
              <Dropdown menu={{ items: btn_action(stock.document_number) }} placement="bottom">
                <a onClick={(e) => e.preventDefault()}>
                  <img src="/img/icons/action.png" alt="button icon" className="inline-block w-5 h-5 mr-2" />
                </a>
              </Dropdown>
            ),
          }))
        );

        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: records_filtered || 0 },
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
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
          const response = await useServiceAPI.delete(paths.pathStockDelete, { document_number: documentNumber });

          if (response.status === 200) {
            await showNotification(
              "success",
              response.data.message || "Event deleted successfully!",
              response.data.message_line || ["The event has been removed."]
            );
            fetchData();
          } else {
            showNotification(
              "warning",
              response.data.message || "Delete failed",
              response.data.message_line || ["Please try again later."]
            );
          }
        } catch (error) {
          if (error?.response?.data?.status === 400) {
            const message = error.response.data.data;
            showNotification("warning", message.Message.Message_Header, message.Message.Message_Line);
          } else {
            showNotification("error", "Delete failed", ["Please try again later."]);
          }
        }
      },
    });
  };

  // ✅ auto fetch when tableParams.filters changes (Search/Clear) or pagination changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange = (pagination, _filters, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      filters: prev.filters,
      sortOrder: sorter?.order === "ascend" ? "asc" : "desc",
      sortField: sorter?.field,
    }));
  };

  // ✅ onChange = แค่เก็บค่าไว้เฉย ๆ (ห้ามค้น)
  const handleChange = (values) => {
    setFilterValues(values);
  };

  // ✅ Search = เอาค่าจาก UI ไปใส่ tableParams.filters -> fetchData ทำงาน
  const handleSearch = (valuesFromUI) => {
    setFilterValues(valuesFromUI);
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1, pageSize: 10 },
      filters: { ...valuesFromUI },
    }));
  };

  // ✅ Clear = ล้าง UI + fetch all
  const handleClear = () => {
    setFilterValues({});
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1, pageSize: 10 },
      filters: {},
    }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between items-center">
        <div className="title-page">Customer Stock List</div>
        <div className="flex gap-2">
          {permission?.btn_create && (
            <ActionButton mode="create" text="Create" onClick={() => navigate("/customer-stock/create")} />
          )}
        </div>
      </div>

      <Filter
        filters={filters}
        values={filterValues}     // ✅ ให้ UI จำค่าได้
        onChange={handleChange}   // ✅ ไม่ค้น
        onSearch={handleSearch}   // ✅ ค้นเมื่อกด Search
        onClear={handleClear}     // ✅ ล้างแล้ว fetch all
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
        title="Product Detail"
        isVisible={isTerritoryModalVisible}
        onClose={() => setIsTerritoryModalVisible(false)}
        header={territoryColumns}
        dataSource={userList}
        width="1200px"
      />
    </MainLayout>
  );
}
