import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";

export default function FarmerPointOrder() {
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  const [filterValues, setFilterValues] = useState({});

  // Modal Detail state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const filters = [
    { key: "order_no", type: "text", label: "Order No", placeholder: "Order No" },
    { key: "dater", type: "dater", label: "Date Range" },
  ];

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
      console.error("Load point order detail failed", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Order No", width: 160, dataIndex: "orderNo", align: "left" },
    { title: "Farmer / Customer", width: 200, dataIndex: "customer", align: "left" },
    { title: "Value (THB)", width: 120, dataIndex: "value", align: "right" },
    { title: "Order Date", width: 150, dataIndex: "orderDate", align: "center" },
    { title: "Points", width: 120, dataIndex: "point", align: "center" },
    { title: "Order Detail", width: 120, dataIndex: "pointDetail", align: "center" },
    { title: "Status", width: 150, dataIndex: "status", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};
    const hasDateRange = Array.isArray(f.dater) && f.dater.length === 2 && f.dater[0] && f.dater[1];

    const payload = {
      keyword: f.order_no || "",
      status_code: "ODC",
      page: current,
      page_size: pageSize,
      platform: "web",
      ...(hasDateRange ? { dater: f.dater } : {}),
    };

    try {
      const res = await useServiceAPI.get(paths.pathSalePointOrderList, payload);
      if (res.status === 200) {
        const { data, records_filtered } = res.data || {};
        const rows = (data || []).map((row, idx) => ({
          key: idx + 1 + (current - 1) * pageSize,
          orderNo: row.document_number || "-",
          customer: row.sub_dealer_name || row.dealer_name || "-",
          value: row.net_amount_display || "0.00",
          orderDate: row.document_date || "-",
          point: (row.point || 0).toLocaleString(),
          pointDetail: (
            <button
              type="button"
              className="px-3 py-1 text-xs font-semibold text-white bg-[#00783F] rounded hover:bg-[#005c30] transition-colors"
              onClick={() => handleOpenDetail(row.document_number)}
            >
              View Order Detail
            </button>
          ),
          status: (
            <BadgeStatus
              text={row.status_transaction_name || "Active"}
              bgColor={row.status_bg_color || "#E6F4EA"}
              textColor={row.status_color || "#137333"}
            />
          ),
        }));
        setDataSource(rows);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: records_filtered || rows.length },
        }));
      }
    } catch (e) {
      console.error("fetch Farmer Point Order failed", e);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableParams.pagination.current, tableParams.pagination.pageSize, tableParams.filters]);

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
      return <div className="py-8 text-center text-gray-500">Loading order breakdown...</div>;
    }
    if (!detailData) {
      return <div className="py-8 text-center text-gray-500">No details found.</div>;
    }

    const items = detailData.order_items || detailData.items || [];
    const totalPoint = items.reduce((acc, curr) => acc + (Number(curr.point) || 0), 0);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded">
          <div><span className="font-semibold">Order No:</span> {detailData.document_number || "-"}</div>
          <div><span className="font-semibold">Order Date:</span> {detailData.document_date || "-"}</div>
          <div><span className="font-semibold">Farmer / Customer:</span> {detailData.sub_dealer_name || detailData.dealer_name || "-"}</div>
          <div><span className="font-semibold">Status:</span> {detailData.status_transaction_name || "-"}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-gray-200">
            <thead>
              <tr className="bg-[#00783F] text-white">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Product Code</th>
                <th className="p-2 border">Product Name</th>
                <th className="p-2 border text-right">Qty</th>
                <th className="p-2 border text-right">Price (THB)</th>
                <th className="p-2 border text-right">Total Price</th>
                <th className="p-2 border text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-400">No order items</td>
                </tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2 border text-center">{idx + 1}</td>
                    <td className="p-2 border">{it.product_code || "-"}</td>
                    <td className="p-2 border">{it.product_name || "-"}</td>
                    <td className="p-2 border text-right">{it.quantity || 1}</td>
                    <td className="p-2 border text-right">{Number(it.price || 0).toLocaleString()}</td>
                    <td className="p-2 border text-right">{Number(it.total_price || 0).toLocaleString()}</td>
                    <td className="p-2 border text-right font-semibold text-green-700">{Number(it.point || 0).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan={6} className="p-2 border text-right">Total Order Points</td>
                <td className="p-2 border text-right text-green-700">{totalPoint.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Farmer Point Order</div>
      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleChange}
        filters={filters}
        values={filterValues}
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

      <Modal
        title={<span className="font-bold text-lg text-gray-800">Order Detail Breakdown</span>}
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
