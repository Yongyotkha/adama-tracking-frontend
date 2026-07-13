import React, { useContext, useEffect, useState } from "react";
import { Dropdown, Modal, Select, Card, Row, Col } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import DoughnutChartComponent from "../../../../components/charts/DoughnutChartComponent";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import { AuthContext } from "../../../../contexts/AuthContext";
import { loadListPageState, saveListPageState } from "../../../../utils/listPageState";

// ---------- Inline Export Button ----------
function ExportButton({ rows = [], fileName = "PointCollection" }) {
  const [loading, setLoading] = useState(false);

  const GREEN = "#00783F";
  const borderThin = {
    top: { style: "thin", color: { argb: "FFCCCCCC" } },
    left: { style: "thin", color: { argb: "FFCCCCCC" } },
    right: { style: "thin", color: { argb: "FFCCCCCC" } },
    bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
  };
  const fillSolid = (hex) => ({
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: `FF${hex.replace("#", "").toUpperCase()}` },
  });

  const columns = [
    { header: "No", width: 8, align: "center" },
    { header: "Document No", width: 22, align: "left" },
    { header: "Sales", width: 28, align: "left" },
    { header: "Dealer", width: 28, align: "left" },
    { header: "Sub Dealer", width: 28, align: "left" },
    { header: "Value (THB)", width: 18, align: "right" },
    { header: "Order Date", width: 16, align: "center" },
    { header: "Points", width: 14, align: "right" },
    { header: "Status", width: 22, align: "left" },
  ];

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Point Collection");

      const headerRow = ws.getRow(1);
      headerRow.height = 24;
      columns.forEach((col, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = col.header;
        cell.fill = fillSolid(GREEN);
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: col.align, wrapText: true };
        cell.border = borderThin;
        ws.getColumn(idx + 1).width = col.width;
      });

      rows.forEach((row, rowIdx) => {
        const r = ws.getRow(rowIdx + 2);
        const valueNum = parseFloat(String(row.value || "0").replace(/,/g, "")) || 0;
        const pointNum = parseFloat(row.pointRaw ?? row.point ?? 0) || 0;
        r.getCell(1).value = row.no ?? rowIdx + 1;
        r.getCell(2).value = row.orderNo || "";
        r.getCell(3).value = row.sale || "";
        r.getCell(4).value = row.dealer || "";
        r.getCell(5).value = row.sub_dealer || "";
        r.getCell(6).value = valueNum;
        r.getCell(7).value = row.orderDate || "";
        r.getCell(8).value = pointNum;
        r.getCell(9).value = row.statusText || "";
        columns.forEach((col, colIdx) => {
          const cell = r.getCell(colIdx + 1);
          cell.border = borderThin;
          cell.alignment = { vertical: "middle", horizontal: col.align };
          if (colIdx === 5 || colIdx === 7) {
            cell.numFmt = "#,##0.00";
          }
        });
      });

      ws.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
      const buffer = await wb.xlsx.writeBuffer();
      const safeName = String(fileName).replace(/[\\/:*?"<>|]+/g, "-");
      saveAs(new Blob([buffer]), `${safeName}.xlsx`);
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "#009845",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        padding: "8px 16px",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: 14,
        opacity: loading ? 0.7 : 1,
      }}
    >
      <img src="/img/icons/excel.png" alt="excel" style={{ width: 18, height: 18 }} />
      {loading ? "Exporting..." : "Export Excel"}
    </button>
  );
}

// ---------- Table cell style helpers ----------
const thStyle = {
  padding: "8px 10px",
  textAlign: "center",
  fontWeight: 600,
  whiteSpace: "nowrap",
  border: "1px solid #e5e7eb",
};

const tdStyle = {
  padding: "7px 10px",
  textAlign: "center",
  border: "1px solid #e5e7eb",
};

export default function CollectPointsList() {
  const navigate = useNavigate();
  const { showMsg, showNotification } = useContext(AuthContext);
  const PAGE_STATE_KEY = "collect-points-list";
  const persistedState = loadListPageState(PAGE_STATE_KEY, {});

  const [loading, setLoading] = useState(false);

  // ---------- table ----------
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: persistedState.tableParams?.pagination?.current || 1,
      pageSize: persistedState.tableParams?.pagination?.pageSize || 50,
    },
    filters: persistedState.tableParams?.filters || {},
    sortOrder: persistedState.tableParams?.sortOrder || "desc",
    sortField: persistedState.tableParams?.sortField || "document_number",
  });

  // ---------- masters ----------
  const [saleList, setSaleList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [subDealerOptions, setSubDealerOptions] = useState([]);
  const [filterValues, setFilterValues] = useState(persistedState.filterValues || {});

  // ---------- Point Detail popup ----------
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const handleOpenDetail = async (documentNumber) => {
    setDetailData(null);
    setDetailModalVisible(true);
    setDetailLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathSalePointOrderDetail, {
        document_number: documentNumber,
      });
      if (res?.status === 200 && res?.data) {
        setDetailData(res.data);
      }
    } catch (err) {
      showMsg("error", err?.message || "โหลดรายละเอียด Point ไม่สำเร็จ");
      setDetailModalVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ---------- Filters ----------
  const filters = [
    { key: "area", type: "select", label: "Area", placeholder: "All", options: areaList },
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
    {
      title: "Point Detail",
      width: 100,
      dataIndex: "pointDetail",
      align: "center",
    },
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

  // ---------- fetch table data ----------
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
      area_id: f.area || "",
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
          no: idx + 1 + (current - 1) * pageSize,
          orderNo: row.document_number,
          sale: row.sale_name,
          dealer: row.dealer_name,
          sub_dealer: row.sub_dealer_name,
          value: row.net_amount_display,
          orderDate: row.document_date,
          pointRaw: row.point,
          statusText: row.status_transaction_name,
          point: row.point,
          pointDetail: (
            <button
              onClick={() => handleOpenDetail(row.document_number)}
              title="Point Detail"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px 6px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#1677ff",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 13,
                  lineHeight: 1,
                  fontStyle: "italic",
                  fontFamily: "serif",
                }}
              >
                i
              </span>
            </button>
          ),
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
    setFilterValues(filters);
    setTableParams((prev) => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  const handleClear = () => {
    setFilterValues({});
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

  // ---------- load masters ----------
  useEffect(() => {
    const loadMasters = async () => {
      setLoading(true);
      try {
        const [saleRes, areaRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleSingle, {}),
          useServiceAPI.get(paths.pathMasterAreas, {}),
        ]);
        setSaleList(saleRes.data || []);
        setAreaList(
          (Array.isArray(areaRes?.data) ? areaRes.data : []).map((item) => ({
            id: item.id,
            name: item.name,
          }))
        );
      } catch (e) {
        showMsg("error", e?.message || "โหลด Master ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    loadMasters();
  }, []);

  // ---------- auto fetch table ----------
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

  useEffect(() => {
    saveListPageState(PAGE_STATE_KEY, {
      filterValues,
      tableParams: {
        pagination: {
          current: tableParams.pagination.current,
          pageSize: tableParams.pagination.pageSize,
        },
        filters: tableParams.filters,
        sortOrder: tableParams.sortOrder,
        sortField: tableParams.sortField,
      },
    });
  }, [filterValues, tableParams]);

  useEffect(() => {
    if (!saleList.length) return;

    const saleId = typeof filterValues.sale === "object" ? filterValues.sale.value : filterValues.sale;
    const dealerId = typeof filterValues.dealer === "object" ? filterValues.dealer.value : filterValues.dealer;

    if (saleId || dealerId) {
      handleChange(filterValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleList.length]);

  // ---------- Point Detail Modal content ----------
  const renderDetailContent = () => {
    if (detailLoading) {
      return (
        <div className="text-center py-8 text-gray-500">กำลังโหลดข้อมูล...</div>
      );
    }
    if (!detailData) return null;

    const products = Array.isArray(detailData.products) ? detailData.products : [];
    const totalPoint = products.reduce(
      (sum, p) => sum + parseFloat((p.quantity || 0) * (p.point || 0)),
      0
    );

    return (
      <div>
        {/* Order info summary */}
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="font-medium text-gray-600">Document No: </span>
            <span>{detailData.document_number || "-"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Date: </span>
            <span>{detailData.document_date || "-"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Sales: </span>
            <span>{detailData.user_name || detailData.sale_name || "-"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Dealer: </span>
            <span>{detailData.dealer_name || "-"}</span>
          </div>
        </div>

        {/* Products table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#00783F", color: "#fff" }}>
                <th style={thStyle}>No</th>
                <th style={{ ...thStyle, textAlign: "left" }}>Product Name</th>
                <th style={thStyle}>Unit</th>
                <th style={thStyle}>QTY (ctn)</th>
                <th style={thStyle}>Point/Unit</th>
                <th style={thStyle}>Total Point</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "12px", color: "#999" }}>
                    ไม่มีข้อมูลสินค้า
                  </td>
                </tr>
              ) : (
                products.map((p, idx) => {
                  const qty = parseFloat(p.quantity || 0);
                  const ptPerUnit = parseFloat(p.point || 0);
                  const totalPt = qty * ptPerUnit;
                  return (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                      <td style={tdStyle}>{idx + 1}</td>
                      <td style={{ ...tdStyle, textAlign: "left" }}>{p.product_name || "-"}</td>
                      <td style={tdStyle}>{p.product_unit || "-"}</td>
                      <td style={tdStyle}>{qty.toLocaleString("en-US")}</td>
                      <td style={tdStyle}>{ptPerUnit.toLocaleString("en-US")}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: "#00783F" }}>
                        {totalPt.toLocaleString("en-US")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: "#978B87", color: "#fff" }}>
                <td colSpan={5} style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>
                  Total Point
                </td>
                <td style={{ ...tdStyle, fontWeight: 700, fontSize: 14 }}>
                  {totalPoint.toLocaleString("en-US")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // ---------- Export rows (plain data, no JSX) ----------
  const exportRows = dataSource.map((row) => ({
    no: row.no ?? row.key,
    orderNo: row.orderNo,
    sale: row.sale,
    dealer: row.dealer,
    sub_dealer: row.sub_dealer,
    value: row.value,
    orderDate: row.orderDate,
    pointRaw: row.pointRaw ?? row.point,
    statusText: row.statusText,
  }));

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Point Collection</div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleChange}
        filters={filters}
        values={filterValues}
      />

      <BoxPrimary>
        {/* Export button row */}
        <div className="flex justify-end mb-3">
          <ExportButton rows={exportRows} fileName="PointCollection" />
        </div>

        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
          onChange={handleTableChange}
        />
      </BoxPrimary>

      {/* Point Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#1677ff",
                color: "#fff",
                fontWeight: "bold",
                fontSize: 13,
                fontStyle: "italic",
                fontFamily: "serif",
              }}
            >
              i
            </span>
            <span>Point Detail</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
        centered
        destroyOnClose
      >
        {renderDetailContent()}
      </Modal>
    </MainLayout>
  );
}
