// OrderList.jsx (complete - uses Filter.jsx, no step, search-only, clear fetch all)
// ✅ Master: SaleDropdown + DealerAll (+ Status)
// ✅ Search triggers fetch, onChange only updates UI (filterValues)
// ✅ Clear resets UI + fetches all (filters = {}) + resets page to 1

import React, { useEffect, useState, useContext } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown, Input, Modal } from "antd";
import Filter from "../../components/filter/Filter";
import ActionButton from "../../components/button/ActionButton";
import BadgeStatus from "../../components/badge/BadgeStatus";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";
import ItemDropDown from "../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import { ExclamationCircleFilled } from "@ant-design/icons";

export default function OrderList() {
  const navigate = useNavigate();
  const { showMsg, showNotification } = useContext(AuthContext);
  const { confirm } = Modal;

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [dataSource, setDataSource] = useState([]);
  const [permission, setPermission] = useState([]);

  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [statusList, setStatusList] = useState([]);

  // ✅ Filter UI state (draft)
  const [filterValues, setFilterValues] = useState({});

  // ✅ Table params state (only changes on Search / Clear / Pagination / Sort)
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  // ✅ Note Popup
  const [noteVisible, setNoteVisible] = useState(false);
  const [noteData, setNoteData] = useState({
    orderNo: "",
    status: "",
    reject_remark: "",
    ref_remark: "",
  });

  const openNotePopup = (order) => {
    setNoteData({
      orderNo: order.document_number,
      status: order.status_transaction_name,
      reject_remark: order.reject_remark || "",
      ref_remark: order.ref_remark || "",
    });
    setNoteVisible(true);
  };

  const closeNotePopup = () => setNoteVisible(false);

  // ✅ helper (supports moderef objects)
  const getId = (v) => {
    if (!v) return "";
    if (typeof v === "object") return v.value ?? v.id ?? "";
    return v;
  };

  // ✅ Get Master: Sale + DealerAll + Status
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [saleRes, dealerRes, statusRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
          useServiceAPI.get(paths.pathMasterDealerAll, {}),
          useServiceAPI.get(paths.pathMasterStatus, { status_type: "order" }),
        ]);

        setSaleList(saleRes?.data || []);

        setDealerList(
          (dealerRes?.data || []).map((d) => ({
            id: d.id ?? d.dealer_id ?? d.code,
            name: d.name ?? d.dealer_name ?? d.title,
          }))
        );

        setStatusList(
          (statusRes?.data || []).map((s) => ({
            id: s.code,
            name: s.name,
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

  // ✅ Filters for Filter.jsx (NO SubDealer)
  const filters = [
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealer", type: "select", label: "Dealer", placeholder: "All", options: dealerList },
    { key: "order_no", type: "text", label: "Order No", placeholder: "Order No" },
    { key: "status", type: "select", label: "Status", placeholder: "All", options: statusList },
    { key: "dater", type: "dater", label: "Date", placeholder: "Date" },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Order No", width: 150, dataIndex: "orderNo", align: "left" },
    { title: "Sales", width: 200, dataIndex: "sale", align: "left" },
    { title: "Dealer", width: 200, dataIndex: "dealer", align: "left" },
    { title: "Value (THB)", width: 100, dataIndex: "value", align: "right" },
    { title: "Order Date", width: 150, dataIndex: "orderDate", align: "center" },
    { title: "Pay Overdue", width: 150, dataIndex: "payOverdue", align: "center" },
    { title: "Status", width: 150, dataIndex: "status", align: "center" },
    { title: "SAP Status", width: 150, dataIndex: "sapStatus", align: "center" },
    { title: "Note", width: 120, dataIndex: "note", align: "center" },
    { title: "Create By", width: 150, dataIndex: "createdBy", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      user_id: getId(f.sale),
      dealer_id: getId(f.dealer),
      keyword: f.order_no || "",
      trasaction_status_code: getId(f.status),
      dater: f.dater || "",
      page: "all",
      use_flag: f.use_flag || "",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(paths.pathGetOrderList, requestData);

      if (response?.status === 200) {
        const { data, records_filtered, permission: perm } = response.data || {};
        setPermission(perm || []);

        const rows = (data || []).map((order, index) => ({
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
          sapStatus: (
            <BadgeStatus
              text={order.status_interface_name}
              bgColor={order.status_interface_bg_color}
              textColor={order.status_interface_color}
            />
          ),
          note:
            order.status_code === "ODW" ? null : (
              <BadgeStatus
                text="!"
                bgColor="#F89E18"
                textColor="#FFFFFF"
                className="sarabun-font fs-30 font-bold"
                onClick={() => openNotePopup(order)}
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
                          navigate("/order/view", { state: { document_number: order.document_number } });
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
                          navigate("/order/edit", { state: { document_number: order.document_number } });
                        }}
                      />
                    ),
                  },
                  {
                    key: 3,
                    label: <ItemDropDown mode="delete" onClick={() => handleDelete(order.document_number)} />,
                  },
                ],
              }}
              placement="bottom"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="button icon" className="inline-block w-5 h-5 mr-2" />
              </a>
            </Dropdown>
          ),
        }));

        setDataSource(rows);

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

  // ✅ fetch only when tableParams changed (Search/Clear/Pagination/Sort)
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

  // ✅ Search-only / Clear fetch all
  const handleFilterChange = (values) => setFilterValues(values);

  const handleSearch = (valuesFromUI) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1, pageSize: 10 },
      filters: { ...valuesFromUI },
    }));
  };

  const handleClear = () => {
    setFilterValues({});
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1, pageSize: 10 },
      filters: {},
    }));
  };

  const handleTableChange = (pagination, _filters, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      filters: prev.filters, // keep current filters
      sortOrder: sorter?.order === "ascend" ? "asc" : "desc",
      sortField: sorter?.field,
    }));
  };

  const handleDelete = async (documentNumber) => {
    confirm({
      title: "Do you want to delete ?",
      icon: <ExclamationCircleFilled />,
      content: [],
      centered: true,
      async onOk() {
        try {
          const response = await useServiceAPI.delete(paths.pathGetOrderDelete, {
            document_number: documentNumber,
          });

          if (response?.status === 200) {
            await showNotification(
              "success",
              response.data.message || "Deleted successfully!",
              response.data.message_line || ["The order has been removed."]
            );
            fetchData();
          } else {
            showNotification(
              "warning",
              response?.data?.message || "Cannot delete",
              response?.data?.message_line || ["Please try again later."]
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

  return (
    <MainLayout loading={loading}>
      <div className="flex justify-between items-center">
        <div className="title-page">Order List</div>
        <div className="flex gap-2">
          {permission?.btn_create && (
            <ActionButton mode="create" text="Create" onClick={() => navigate("/order/create")} />
          )}
        </div>
      </div>

      <Filter
        filters={filters}
        values={filterValues}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClear}
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

      <Modal open={noteVisible} footer={null} centered closable={false} onCancel={closeNotePopup}>
        <div className="flex flex-col justify-between items-center min-h-[150px]">
          <div className="text-[#978B87] text-sm text-center mb-4 sarabun-font w-full">
            <div className="font-semibold mb-2">Order: {noteData.orderNo}</div>
            <div className="mb-3">Status: {noteData.status || "-"}</div>
            <Input.TextArea rows={4} value={noteData.reject_remark || "-"} disabled className="sarabun-font bg-gray-100" />
          </div>

          <Button
            type="button"
            onClick={closeNotePopup}
            className="w-full bg-[#B6AEAB] flex items-center justify-center py-5 rounded-md"
          >
            <span className="sarabun-font text-white">Close</span>
          </Button>
        </div>
      </Modal>
    </MainLayout>
  );
}
