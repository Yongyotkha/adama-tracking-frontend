import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import { Dropdown } from "antd";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import { AuthContext } from "../../../../contexts/AuthContext";

export default function CollectPointsList() {
  const navigate = useNavigate();
  const { showMsg } = useContext(AuthContext);

  // master & filter options
  const [loading, setLoading] = useState(false);
  const [saleList, setSaleList] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [subDealers, setSubDealers] = useState([]);
  const [trxStatusList, setTrxStatusList] = useState([]);
  const [paymentStatusList, setPaymentStatusList] = useState([]);
  const [filterValues, setFilterValues] = useState({});

  // table
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
    // ให้สอดคล้องกับหน้า SalesPointsList
    sortOrder: "desc",
    sortField: "document_number",
  });

  // ---------- Load Masters ----------
  useEffect(() => {
    const loadMasters = async () => {
      setLoading(true);
      try {
        const [sale, trxStatus, payStatus] = await Promise.all([
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
          // สถานะรายการ (transaction)
          useServiceAPI.get(paths.pathMasterStatus, { status_type: "transaction_status" }),
          // สถานะการชำระเงิน (payment)
          useServiceAPI.get(paths.pathMasterStatus, { status_type: "payment_status" }),
        ]);

        setSaleList(sale.data || []);

        const trx = (trxStatus.data || []).map((x) => ({ id: x.code, name: x.name }));
        const pay = (payStatus.data || []).map((x) => ({ id: x.code, name: x.name }));
        setTrxStatusList(trx);
        setPaymentStatusList(pay);
      } catch (e) {
        showMsg("error", e?.message || "โหลดข้อมูลตั้งต้นไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    loadMasters();
  }, []);

  // ---------- Cascade: Dealers by Sale ----------
  useEffect(() => {
    const sale = filterValues.user_id;
    if (!sale) {
      setDealers([]);
      setSubDealers([]);
      return;
    }
    const userId = typeof sale === "object" && sale.value ? sale.value : sale;
    const getDealersBySale = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, { user_id: userId });
        setDealers(res.data || []);
        setSubDealers([]);
      } catch (e) {
        showMsg("error", e?.message || "โหลด Dealer ไม่สำเร็จ");
      }
    };
    getDealersBySale();
  }, [filterValues.user_id]);

  // ---------- Cascade: SubDealers by Dealer ----------
  useEffect(() => {
    const dealer = filterValues.dealer_id;
    if (!dealer) {
      setSubDealers([]);
      return;
    }
    const dealerId = typeof dealer === "object" && dealer.value ? dealer.value : dealer;
    const getSubDealers = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterSubDealerDropdown, { dealer_id: dealerId });
        setSubDealers(res.data || []);
      } catch (e) {
        showMsg("error", e?.message || "โหลด Sub Dealer ไม่สำเร็จ");
      }
    };
    getSubDealers();
  }, [filterValues.dealer_id]);

  // ---------- Fetch List (ใช้ endpoint/พารามิเตอร์เดียวกับ SalesPointsList) ----------
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

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    // ให้สอดคล้องรูปแบบ payload ของหน้า SalesPointsList
    const requestData = {
      user_id: f.user_id || "",
      dealer_id: f.dealer_id || "",
      sub_dealer_id: f.sub_dealer_id || "",
      keyword: f.keyword || "", // document/order number
      trasaction_status_code: f.trasaction_status_code || "",
      payment_status_code: f.payment_status_code || "",
      use_flag: f.use_flag ?? "",
      dater: f.dater || "",
      page: "all",
      status_code: "ODC", // <-- ใช้สถานะตามที่ขอ
      orderby_column: tableParams.sortField || "document_number",
      orderby: tableParams.sortOrder || "desc",
      page_length: current,
      page_size: pageSize,
    };

    try {
      // เปลี่ยนเป็น order list เดียวกับ SalesPointsList
      const res = await useServiceAPI.get(paths.pathSalePointOrderList, requestData);
      if (res.status === 200) {
        const payload = res.data || {};
        const rows = payload.data || [];
        const newData = elementHtml(rows, current, pageSize);
        setDataSource(newData);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: payload.records_filtered ?? rows.length,
          },
        }));
      }
    } catch (e) {
      showMsg("error", e?.message || "ดึงรายการ Point Collection ไม่สำเร็จ");
    } finally {
      setTableLoading(false);
    }
  };

  // ---------- Table helpers ----------
  function elementHtml(list, current, pageSize) {
    return list.map((r, idx) => ({
      key: r.document_number || idx + 1 + (current - 1) * pageSize, // stable key
      documentNo: r.document_number,
      dealerName: r.dealer_name,
      subDealerName: r.sub_dealer_name,
      saleName: r.user_name || "-",
      valueTHB: r.net_amount_display,
      date: r.document_date,
      point: r.point,
      // ใช้ฟิลด์สถานะเดิม (transaction/payment/interface) ที่หน้า Collect ใช้อยู่
      trxStatus: (
        <BadgeStatus
          text={r.status_transaction_name}
          bgColor={r.status_transaction_bg_color}
          textColor={r.status_transaction_color}
        />
      ),
      payStatus: (
        <BadgeStatus
          text={r.status_payment_name}
          bgColor={r.status_payment_bg_color}
          textColor={r.status_payment_color}
        />
      ),
      interfaceStatus: (
        <BadgeStatus
          text={r.status_interface_name}
          bgColor={r.status_interface_bg_color}
          textColor={r.status_interface_color}
        />
      ),
      action: (
        <Dropdown
          menu={{
            items: (r.action || []).map((a, i) => ({
              key: i,
              label: (
                <ItemDropDown
                  mode={String(a.action || "View").toLowerCase()}
                  onClick={() =>
                    navigate("/points/line/collect-points-list/view", {
                      state: { document_number: r.document_number, mod: a.action || "View" },
                    })
                  }
                />
              ),
            })),
          }}
          placement="bottom"
        >
          <a onClick={(e) => e.preventDefault()}>
            <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5 mr-2" />
          </a>
        </Dropdown>
      ),
    }));
  }

  const handleSearch = (filters) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1, pageSize: 10 },
      filters: { ...filters, page_length: 1, page_size: 10 },
    }));
  };

  const handleClear = () => {
    setDealers([]);
    setSubDealers([]);
    setFilterValues({});
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1, pageSize: 10 },
    }));
  };

  const handleTableChange = (pagination, _filters, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      // เก็บฟิลเตอร์เดิมไว้
      filters: prev.filters,
      sortOrder: sorter?.order === "descend" ? "desc" : sorter?.order ? "asc" : prev.sortOrder,
      sortField: sorter?.field || prev.sortField,
    }));
  };

  const handleChange = (filters) => {
    // map filter keys to API keys up-front
    // - Sales select uses user_id
    // - Dealer select uses dealer_id
    // - Sub Dealer select uses sub_dealer_id
    setFilterValues(filters);
  };

  // ---------- Filters (Dealer-like UI) ----------
  const filters = [
    {
      key: "keyword",
      type: "text",
      label: "Document No",
      placeholder: "Enter",
    },
    {
      key: "user_id",
      type: "select",
      label: "Sales",
      placeholder: "All",
      options: saleList,
      moderef: true,
    },
    {
      key: "dealer_id",
      type: "select",
      label: "Dealer",
      placeholder: "All",
      options: dealers,
      moderef: true,
    },
    {
      key: "sub_dealer_id",
      type: "select",
      label: "Sub Dealer",
      placeholder: "All",
      options: subDealers,
      moderef: true,
    },
    {
      key: "trasaction_status_code",
      type: "select",
      label: "Status",
      placeholder: "All",
      options: trxStatusList,
    },
    {
      key: "payment_status_code",
      type: "select",
      label: "Payment",
      placeholder: "All",
      options: paymentStatusList,
    },
    {
      key: "use_flag",
      type: "select",
      label: "Use",
      placeholder: "All",
      options: [
        { id: "1", name: "Active" },
        { id: "0", name: "Inactive" },
      ],
    },
  ];

  // ---------- Table header (Dealer-like) ----------
  const header = [
    // { title: "No", width: 70, dataIndex: "key", align: "center" },
    { title: "Document No", width: 160, dataIndex: "documentNo", align: "left" },
    { title: "Dealer", width: 220, dataIndex: "dealerName", align: "left" },
    { title: "Sub Dealer", width: 240, dataIndex: "subDealerName", align: "left" },
    { title: "Sales", width: 180, dataIndex: "saleName", align: "left" },
    { title: "Value (THB)", width: 120, dataIndex: "valueTHB", align: "right" },
    { title: "Date", width: 120, dataIndex: "date", align: "center" },
    { title: "Point", width: 90, dataIndex: "point", align: "center" },
    // { title: "Transaction", width: 140, dataIndex: "trxStatus", align: "center" },
    // { title: "Payment", width: 120, dataIndex: "payStatus", align: "center" },
    // { title: "Interface", width: 120, dataIndex: "interfaceStatus", align: "center" },
    { title: "Action", width: 90, dataIndex: "action", align: "center" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Point Collection</div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleChange}
        filters={filters}
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
    </MainLayout>
  );
}
