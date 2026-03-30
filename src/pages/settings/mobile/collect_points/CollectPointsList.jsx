import React, { useContext, useEffect, useState } from "react";
import { Dropdown, Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import { AuthContext } from "../../../../contexts/AuthContext";

export default function CollectPointsList() {
  const navigate = useNavigate();
  const { showMsg, showNotification } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  // ---------- table ----------
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 50 },
    filters: {},
    sortOrder: "desc",
    sortField: "document_number",
  });

  // ---------- masters ----------
  const [saleList, setSaleList] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [subDealerOptions, setSubDealerOptions] = useState([]);
  const [filterValues, setFilterValues] = useState({});

  // ---------- Filters ----------
  const filters = [
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealer", type: "select", label: "Dealer", placeholder: "All", options: dataDealer, moderef: true },
    { key: "sub_dealer", type: "select", label: "Sub Dealer", placeholder: "All", options: subDealerOptions },
    { key: "order_no", type: "text", label: "Order No", placeholder: "Order No" },
    { key: "dater", type: "dater", label: "Date", placeholder: "Date" },
  ];

  // ---------- Table headers ----------
  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Document No", width: 150, dataIndex: "orderNo", align: "left" },
    { title: "Sales", width: 200, dataIndex: "sale", align: "left" },
    { title: "Dealer", width: 200, dataIndex: "dealer", align: "left" },
    { title: "Sub Dealer", width: 200, dataIndex: "sub_dealer", align: "left" },
    { title: "Value (THB)", width: 100, dataIndex: "value", align: "right" },
    { title: "Order Date", width: 150, dataIndex: "orderDate", align: "center" },
    { title: "Points", width: 150, dataIndex: "point", align: "center" },
    { title: "Status", width: 150, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const { confirm } = Modal;

  const handleRefund = (documentNumber) => {
    let remark = "";
    confirm({
      title: "Refund Order ?",
      icon: <ExclamationCircleFilled />,
      content: (
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium text-gray-700">หมายเหตุ <span className="text-red-500">*</span></div>
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="กรุณาใส่หมายเหตุ"
            onChange={(e) => {
              remark = e.target.value;
            }}
          />
        </div>
      ),
      centered: true,
      async onOk() {
        if (!remark || remark.trim() === "") {
          showMsg?.("warning", "กรุณาใส่หมายเหตุ");
          return Promise.reject();
        }
        try {
          const res = await useServiceAPI.put(paths.pathSalePointRefund, {
            document_number: documentNumber,
            remark: remark,
          });
          const ok = res?.status === 200 || res?.status === "200";
          const header =
            res?.data?.data?.Message?.Message_Header ||
            res?.data?.message ||
            (ok ? "Refund successful" : "Notification");
          const lines =
            res?.data?.data?.Message?.Message_Line ||
            res?.data?.message_line ||
            [ok ? "Refund successful" : "Please try again."];

          await showNotification(ok ? "success" : "warning", header, lines);

          fetchData();
        } catch (error) {
          const msg = error?.response?.data?.data?.Message;
          await showNotification(
            "warning",
            msg?.Message_Header || "Notification",
            msg?.Message_Line || ["Refund failed"]
          );

          fetchData();
        }
      },
    });
  };

  const handleDelete = (documentNumber) => {
    confirm({
      title: "Do you want to delete ?",
      icon: <ExclamationCircleFilled />,
      content: [],
      centered: true,
      async onOk() {
        try {
          const res = await useServiceAPI.delete(paths.pathSalePointOrderDelete, { document_number: documentNumber });
          const ok = res?.status === 200;
          const header =
            res?.data?.data?.Message?.Message_Header ||
            res?.data?.message ||
            (ok ? "Delete successful" : "Notification");
          const lines =
            res?.data?.data?.Message?.Message_Line ||
            res?.data?.message_line ||
            [ok ? "Delete successful" : "Please try again."];

          await showNotification(ok ? "success" : "warning", header, lines);
          fetchData();
        } catch (error) {
          const msg = error?.response?.data?.data?.Message;
          await showNotification("warning", msg?.Message_Header || "Notification", msg?.Message_Line || ["Data not found"]);
          fetchData();
        }
      },
    });
  };

  // ---------- fetch data ----------
  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    const hasDateRange =
      Array.isArray(f.dater) &&
      f.dater.length === 2 &&
      f.dater[0] &&
      f.dater[1];

    const payload = {
      user_id: f.sale || "",
      dealer_id: f.dealer || "",
      sub_dealer_id: f.sub_dealer || "",
      keyword: f.order_no || "",
      status_code: "ODC",
      page: "all",
      use_flag: 1,
      orderby_column: tableParams.sortField,
      orderby: tableParams.sortOrder,
      platform: "web",
      page_length: current,
      page_size: pageSize,
      ...(hasDateRange ? { dater: f.dater } : {}),
    };

    try {
      const res = await useServiceAPI.get(paths.pathSalePointOrderList, payload);
      if (res.status === 200) {
        const { data, records_filtered } = res.data;
        const newRows = (data || []).map((row, idx) => ({
          key: idx + 1 + (current - 1) * pageSize,
          orderNo: row.document_number,
          sale: row.sale_name,
          dealer: row.dealer_name,
          sub_dealer: row.sub_dealer_name,
          value: row.net_amount_display,
          orderDate: row.document_date,
          point: row.point,
          status: (
            <BadgeStatus
              text={row.status_transaction_name}
              bgColor={row.status_transaction_bg_color}
              textColor={row.status_transaction_color}
            />
          ),
          action: (
            <Dropdown
              menu={{
                items: (row.action || []).map((a, i) => {
                  const actionName = String(a.action).toLowerCase();
                  if (actionName === "view") {
                    return {
                      key: `view-${i}`,
                      label: (
                        <ItemDropDown
                          mode="view"
                          onClick={() =>
                            navigate("/points/line/collect-points-list/view", {
                              state: { document_number: row.document_number },
                            })
                          }
                        />
                      ),
                    };
                  }
                  if (actionName === "edit") {
                    return {
                      key: `edit-${i}`,
                      label: (
                        <ItemDropDown
                          mode="edit"
                          onClick={() =>
                            navigate("/points/line/collect-points-list/view", {
                              state: { document_number: row.document_number },
                            })
                          }
                        />
                      ),
                    };
                  }
                  if (actionName === "delete") {
                    return {
                      key: `delete-${i}`,
                      label: (
                        <ItemDropDown
                          mode="delete"
                          onClick={() => handleDelete(row.document_number)}
                        />
                      ),
                    };
                  }
                  if (["refund", "refund point"].includes(actionName)) {
                    return {
                      key: `refund_point-${i}`,
                      label: (
                        <ItemDropDown
                          mode="refund_point"
                          onClick={() => handleRefund(row.document_number)}
                        />
                      ),
                    };
                  }
                  return null;
                }).filter(Boolean),
              }}
              placement="bottom"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5" />
              </a>
            </Dropdown>
          ),
        }));
        setDataSource(newRows);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: records_filtered || newRows.length },
        }));
      }
    } catch (error) {
      showMsg("error", error?.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setTableLoading(false);
    }
  };

  // ---------- handlers ----------
  const handleSearch = (filters) => {
    setTableParams((prev) => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  const handleClear = () => {
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
    setDataDealer([]);
    setSubDealerOptions([]);
  };

  const handleTableChange = (pagination, _filters, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field || prev.sortField,
    }));
  };

  const handleChange = (filters) => {
    setFilterValues(filters);

    const saleId = typeof filters.sale === "object" ? filters.sale.value : filters.sale;
    const dealerId = typeof filters.dealer === "object" ? filters.dealer.value : filters.dealer;

    if (dealerId) {
      (async () => {
        try {
          const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
            user_id: saleId || "",
            dealer_id: dealerId,
          });
          const subs = (res?.data || []).map((item) => ({
            name: item.sub_dealer_name,
            id: item.sub_dealer_id,
          }));
          setSubDealerOptions(subs);
        } catch (e) {
          showMsg("error", e?.message || "โหลด Sub Dealer ไม่สำเร็จ");
        }
      })();
    } else if (saleId) {
      (async () => {
        try {
          const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
            user_id: saleId,
          });
          setDataDealer(res?.data || []);
          setSubDealerOptions([]);
        } catch (e) {
          showMsg("error", e?.message || "โหลด Dealer ไม่สำเร็จ");
        }
      })();
    } else {
      setDataDealer([]);
      setSubDealerOptions([]);
    }
  };

  // ---------- load sales master ----------
  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      try {
        // const sale = await useServiceAPI.get(paths.pathMasterSaleTeam, {});
        const sale = await useServiceAPI.get(paths.pathMasterSaleSingle, {});
        setSaleList(sale.data || []);
      } catch (e) {
        showMsg("error", e?.message || "โหลด Sales ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    loadSales();
  }, []);

  // ---------- auto fetch ----------
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

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Point Collection</div>

      <Filter onSearch={handleSearch} onClear={handleClear} onChange={handleChange} filters={filters} />

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
