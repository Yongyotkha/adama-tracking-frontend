import React, { useContext, useEffect, useState } from "react";
import { Dropdown, Modal, Select, Card, Row, Col, Radio } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
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
import { loadListPageState, saveListPageState } from "../../../../utils/listPageState";

// ---------- Inline Export Button ----------
function ExportButton({ fetchExportRows, fileName = "PointCollection", onError }) {
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
    { header: "Farmer", width: 28, align: "left" },
    { header: "Value (THB)", width: 18, align: "right" },
    { header: "Order Date", width: 16, align: "center" },
    { header: "Points", width: 14, align: "right" },
    { header: "Status", width: 22, align: "left" },
  ];

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const rows = await fetchExportRows();
      if (!rows?.length) {
        onError?.("warning", "No data to export");
        return;
      }

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Farmer Point Collection");

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
        r.getCell(6).value = row.farmer || "";
        r.getCell(7).value = valueNum;
        r.getCell(8).value = row.orderDate || "";
        r.getCell(9).value = pointNum;
        r.getCell(10).value = row.statusText || "";
        columns.forEach((col, colIdx) => {
          const cell = r.getCell(colIdx + 1);
          cell.border = borderThin;
          cell.alignment = { vertical: "middle", horizontal: col.align };
          if (colIdx === 6 || colIdx === 8) {
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
      onError?.("error", e?.message || "Export failed");
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

export default function FarmerPointCollection() {
  const navigate = useNavigate();
  const { showMsg, showNotification } = useContext(AuthContext);
  const PAGE_STATE_KEY = "farmer-collect-points-list";
  const persistedState = loadListPageState(PAGE_STATE_KEY, {});

  const [loading, setLoading] = useState(false);

  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: persistedState.tableParams?.pagination?.current || 1,
      pageSize: persistedState.tableParams?.pagination?.pageSize || 50,
    },
    filters: persistedState.tableParams?.filters || {},
    sortOrder: persistedState.tableParams?.sortOrder || "desc",
    sortField: persistedState.tableParams?.sortField || "document_date",
  });
  const [orderByField, setOrderByField] = useState(() => {
    return persistedState.orderByField || "orderby_column";
  });

  const getOrderByPayload = () => {
    if (orderByField === "orderby_column") {
      return {
        orderby_column: tableParams.sortField || "document_date",
        area_id: "",
      };
    }
    if (orderByField.startsWith("area_id_")) {
      const selectedAreaId = orderByField.replace("area_id_", "");
      return {
        orderby_column: "area_id",
        area_id: selectedAreaId,
      };
    }
    return {
      orderby_column: tableParams.sortField || "document_date",
      area_id: "",
    };
  };

  const [saleList, setSaleList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [subDealerOptions, setSubDealerOptions] = useState([]);
  const [filterValues, setFilterValues] = useState(persistedState.filterValues || {});

  // Point Detail popup
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
        mode: "farmer",
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

  const filters = [
    { key: "area", type: "select", label: "Area", placeholder: "All", options: areaList },
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealer", type: "select", label: "Dealer", placeholder: "All", options: dataDealer, moderef: true },
    { key: "sub_dealer", type: "select", label: "Sub Dealer", placeholder: "All", options: subDealerOptions },
    { key: "order_no", type: "text", label: "Order No", placeholder: "Order No" },
    { key: "dater", type: "dater", label: "Date", placeholder: "Date" },
  ];

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

  const buildListPayload = ({ pageLength, pageSize } = {}) => {
    const f = tableParams.filters || {};
    const hasDateRange =
      Array.isArray(f.dater) &&
      f.dater.length === 2 &&
      f.dater[0] &&
      f.dater[1];
    const orderByPayload = getOrderByPayload();

    return {
      user_id: f.sale || "",
      dealer_id: f.dealer || "",
      sub_dealer_id: f.sub_dealer || "",
      area_id: orderByPayload.area_id || f.area || "",
      keyword: f.order_no || "",
      status_code: "ODC",
      page: "all",
      use_flag: 1,
      orderby_column: orderByPayload.orderby_column,
      orderby: "desc",
      platform: "web",
      page_length: pageLength,
      mode: "farmer",
      ...(pageSize !== undefined ? { page_size: pageSize } : {}),
      ...(hasDateRange ? { dater: f.dater } : {}),
    };
  };

  const mapOrderRows = (rows = [], startIndex = 0) =>
    rows.map((row, idx) => ({
      no: startIndex + idx + 1,
      orderNo: row.document_number,
      sale: row.sale_name,
      dealer: row.dealer_name,
      sub_dealer: row.sub_dealer_name,
      farmer: row.farmer_name || "-",
      value: row.net_amount_display,
      orderDate: row.document_date,
      pointRaw: row.point,
      statusText: row.status_transaction_name,
    }));

  const fetchExportRows = async () => {
    const payload = buildListPayload({ pageLength: "all" });
    const res = await useServiceAPI.get(paths.pathSalePointOrderList, payload);
    if (res.status !== 200) {
      throw new Error(res?.message || "Export failed");
    }
    return mapOrderRows(res.data?.data || []);
  };

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;

    const payload = buildListPayload({
      pageLength: current,
      pageSize,
    });

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
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <img src="/img/icons/info-blue.svg" alt="info" style={{ width: 18, height: 18 }} />
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
                items: [
                  {
                    key: "view",
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
                  },
                ],
              }}
              trigger={["click"]}
            >
              <button className="p-1 hover:bg-gray-100 rounded">...</button>
            </Dropdown>
          ),
        }));

        setDataSource(newRows);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: records_filtered || data.length },
        }));
      }
    } catch (e) {
      console.error("fetch Farmer Point Collection failed", e);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableParams.pagination.current, tableParams.pagination.pageSize, tableParams.filters, orderByField]);

  const handleSearch = () => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: filterValues,
    }));
  };

  const handleClear = () => {
    setFilterValues({});
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: {},
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableChange = (pagination) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: pagination.current, pageSize: pagination.pageSize },
    }));
  };

  const renderDetailContent = () => {
    if (detailLoading) {
      return <div className="text-center py-8 text-gray-500">กำลังโหลดข้อมูล...</div>;
    }
    if (!detailData) return null;

    const products = Array.isArray(detailData.products) ? detailData.products : [];
    const campaigns = Array.isArray(detailData.campaigns) ? detailData.campaigns : [];
    const totalPoint = products.reduce((sum, p) => sum + parseFloat(p.total_point || 0), 0);

    return (
      <div>
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
          <div><span className="font-medium text-gray-600">Document No: </span><span>{detailData.document_number || "-"}</span></div>
          <div><span className="font-medium text-gray-600">Date: </span><span>{detailData.document_date || "-"}</span></div>
          <div><span className="font-medium text-gray-600">Sales: </span><span>{detailData.user_name || detailData.sale_name || "-"}</span></div>
          <div><span className="font-medium text-gray-600">Dealer: </span><span>{detailData.dealer_name || "-"}</span></div>
        </div>

        <div className="mb-2 text-sm font-semibold text-[#00783F]">Products</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#00783F", color: "#fff" }}>
                <th style={thStyle}>No</th>
                <th style={{ ...thStyle, textAlign: "left" }}>Product Name</th>
                <th style={thStyle}>Unit</th>
                <th style={thStyle}>QTY (Pcs / Unit)</th>
                <th style={thStyle}>Farmer Price / Piece</th>
                <th style={thStyle}>Farmer Point / Piece</th>
                <th style={thStyle}>Total Farmer Point</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? "#f9f9f9" : "#fff" }}>
                  <td style={tdStyle}>{idx + 1}</td>
                  <td style={{ ...tdStyle, textAlign: "left" }}>{p.product_name || "-"}</td>
                  <td style={tdStyle}>{p.product_unit || "Piece"}</td>
                  <td style={tdStyle}>{parseFloat(p.quantity || 0).toLocaleString()}</td>
                  <td style={tdStyle}>{parseFloat(p.price_per_piece || p.price || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  <td style={tdStyle}>{parseFloat(p.point || 0).toLocaleString()}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: "#00783F" }}>
                    {Number(p.total_point || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#978B87", color: "#fff" }}>
                <td colSpan={6} style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>Total Farmer Point</td>
                <td style={{ ...tdStyle, fontWeight: 700, fontSize: 14 }}>{totalPoint.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Point Collection (Farmer)</div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleChange}
        filters={filters}
        values={filterValues}
      />

      <BoxPrimary>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Order By</span>
            <Radio.Group
              value={orderByField}
              onChange={(e) => {
                setOrderByField(e.target.value);
                setTableParams((prev) => ({
                  ...prev,
                  pagination: { ...prev.pagination, current: 1 },
                }));
              }}
            >
              <Radio value="orderby_column">Order Date</Radio>
            </Radio.Group>
          </div>
          <ExportButton
            fetchExportRows={fetchExportRows}
            fileName="FarmerPointCollection"
            onError={(type, message) => showMsg(type, message)}
          />
        </div>

        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
          onChange={handleTableChange}
        />
      </BoxPrimary>

      <Modal
        title={<span>Point Detail (Farmer)</span>}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={750}
        centered
        destroyOnClose
      >
        {renderDetailContent()}
      </Modal>
    </MainLayout>
  );
}
