import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Dropdown } from "antd";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import DynamicButton from "../../../../components/button/DynamicButton";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import { useNavigate } from "react-router-dom";

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

const COMMON_FILTERS_BASE = [
  {
    key: "sale_id",
    type: "select",
    label: "Sale Name",
    placeholder: "All",
    moderef: true,
  },
  {
    key: "dealer_id",
    type: "select",
    label: "Dealer Name",
    placeholder: "All",
    disabled: true,
    moderef: true,
  },
  {
    key: "sub_dealer_id",
    type: "select",
    label: "Sub Dealer Name",
    placeholder: "All",
    disabled: true,
    moderef: true,
  },
  // ใช้ใน dealer / sub dealer
  { key: "contact_name", type: "text", label: "Contact Name" },

  // ใช้เฉพาะ farmer
  {
    key: "farmer_id",
    type: "select",
    label: "Farmer Name",
    placeholder: "All",
    disabled: true,
    moderef: true,
  },

  { key: "created_at", type: "date", label: "Created Date" },
  {
    key: "status_code",
    type: "select",
    label: "Status",
    placeholder: "All",
    options: [
      { id: "0", name: "Inactive" },
      { id: "1", name: "Active" },
    ],
  },
];

const tabConfig = {
  dealer: {
    apiPath: paths.pathCustomerRegis,
    label: <span className="tab-title">Dealer</span>,
    shopType: "dealer",
  },
  sub_dealer: {
    apiPath: paths.pathCustomerRegis,
    label: <span className="tab-title">Sub Dealer</span>,
    shopType: "sub_dealer",
  },
  farmer: {
    apiPath: paths.pathCustomerRegis,
    label: <span className="tab-title">Farmer</span>,
    shopType: "farmer",
  },
};

export default function RegisteredCustomerList() {
  const navigate = useNavigate();

  const [loading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("dealer");
  const [dataSource, setDataSource] = useState([]);

  const [filterValues, setFilterValues] = useState({
    status_code: "",
    sale_id: "",
    dealer_id: "",
    sub_dealer_id: "",
    farmer_id: "",
    contact_name: "",
    created_at: "",
  });

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {
      status_code: "",
      sale_id: "",
      dealer_id: "",
      sub_dealer_id: "",
      farmer_id: "",
      contact_name: "",
      created_at: "",
    },
  });

  const [sales, setSales] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [subDealers, setSubDealers] = useState([]);
  const [farmers, setFarmers] = useState([]);

  const currentTab = tabConfig[activeTab];

  const fetchSales = async () => {
    try {
      const res = await useServiceAPI.get(paths.pathMasterSaleSingle, {});
      const list = Array.isArray(res?.data) ? res.data : [];
      setSales(list.map((x) => ({ id: Number(x.id), name: x.name })));
    } catch (e) {
      console.error("fetchSales failed", e);
      setSales([]);
    }
  };

  const fetchDealersBySale = async (saleId) => {
    if (!saleId) {
      setDealers([]);
      return;
    }
    try {
      const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
        user_id: saleId,
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      setDealers(
        list.map((x) => ({
          id: Number(x.id ?? x.dealer_id ?? x.code),
          name: x.name ?? x.dealer_name ?? x.title,
        }))
      );
    } catch (e) {
      console.error("fetchDealersBySale failed", e);
      setDealers([]);
    }
  };

  const fetchSubDealers = async () => {
    try {
      const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {});
      const list = Array.isArray(res?.data) ? res.data : [];
      setSubDealers(
        list.map((x) => ({
          id: Number(x.sub_dealer_id ?? x.id ?? x.code),
          name: x.sub_dealer_name ?? x.name ?? x.title,
          dealer_id: Number(x.dealer_id ?? 0),
        }))
      );
    } catch (e) {
      console.error("fetchSubDealers failed", e);
      setSubDealers([]);
    }
  };

  const fetchFarmers = async () => {
    try {
      const res = await useServiceAPI.get(paths.pathMasterFarmer, {});
      const list = Array.isArray(res?.data) ? res.data : [];
      setFarmers(
        list.map((x) => ({
          id: Number(x.farmer_id ?? x.id),
          name: x.farmer_name ?? "-",
          dealer_id: Number(x.dealer_id ?? 0),
          sub_dealer_id: Number(x.sub_dealer_id ?? 0),
          contact_name: x.farmer_contact_name,
          phone: x.farmer_contact_phone_number,
        }))
      );
    } catch (e) {
      console.error("fetchFarmers failed", e);
      setFarmers([]);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchSubDealers();
    fetchFarmers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtersWithOptions = useMemo(() => {
    const saleSelected = !!filterValues.sale_id;
    const dealerSelected = !!filterValues.dealer_id;
    const subDealerSelected = !!filterValues.sub_dealer_id;

    const filteredFarmers = farmers.filter((item) => {
      if (filterValues.sub_dealer_id) {
        return (
          String(item.sub_dealer_id) === String(filterValues.sub_dealer_id)
        );
      }
      if (filterValues.dealer_id) {
        return String(item.dealer_id) === String(filterValues.dealer_id);
      }
      return true;
    });

    let baseFilters = COMMON_FILTERS_BASE;

    if (activeTab === "dealer") {
      // dealer tab ซ่อน sub dealer และ farmer
      baseFilters = COMMON_FILTERS_BASE.filter(
        (f) => f.key !== "sub_dealer_id" && f.key !== "farmer_id"
      );
    } else if (activeTab === "sub_dealer") {
      // sub dealer tab ใช้ contact_name, ไม่ใช้ farmer
      baseFilters = COMMON_FILTERS_BASE.filter((f) => f.key !== "farmer_id");
    } else if (activeTab === "farmer") {
      // farmer tab ไม่ใช้ text contact_name filter แต่ใช้ farmer_id select แทน
      baseFilters = COMMON_FILTERS_BASE.filter((f) => f.key !== "contact_name");
    }

    return baseFilters.map((f) => {
      if (f.key === "sale_id") return { ...f, options: sales };

      if (f.key === "dealer_id") {
        return {
          ...f,
          options: dealers,
          disabled: !saleSelected,
        };
      }

      if (f.key === "sub_dealer_id") {
        const filteredSubDealers =
          filterValues.dealer_id
            ? subDealers.filter(
              (item) => String(item.dealer_id) === String(filterValues.dealer_id)
            )
            : [];

        return {
          ...f,
          options: activeTab === "farmer" ? filteredSubDealers : subDealers,
          disabled: !dealerSelected,
        };
      }
      
      if (f.key === "farmer_id") {
        return {
          ...f,
          options: filteredFarmers,
          disabled: !dealerSelected && !subDealerSelected,
        };
      }

      return f;
    });
  }, [
    sales,
    dealers,
    subDealers,
    farmers,
    filterValues.sale_id,
    filterValues.dealer_id,
    filterValues.sub_dealer_id,
    activeTab,
  ]);

  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      shop_type: currentTab.shopType,
      sale_id: filters.sale_id || "",
      dealer_id: filters.dealer_id || "",
      sub_dealer_id: filters.sub_dealer_id || "",
      farmer_id: filters.farmer_id || "",
      contact_name: currentTab.shopType === "farmer" ? "" : filters.contact_name || "",
      created_at: filters.created_at || "",
      status_code: filters.status_code ?? "",
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(currentTab.apiPath, requestData);
      if (response.status === 200) {
        const result = response.data || {};
        const customers = (result.data && result.data.data) || result.data || [];

        let newData = [];
        if (currentTab.shopType === "dealer") {
          newData = customers.map((row, index) => ({
            key: index + 1 + (current - 1) * pageSize,
            id: row.id,
            dealer_id: row.shop_code,
            dealer_name: row.shop_name_custom,
            sale_name: row.sale_name,
            contact_name: row.name_th,
            phone: row.phone_number,
            subscribed: row.line_join_last_datetime?.split(" ")[0] || "-",
            point: row.balance_point,
            status: (
              <BadgeStatus
                text={row.status_name}
                bgColor={row.status_bg_color}
                textColor={row.status_color}
              />
            ),
            action: (
              <Dropdown
                menu={{
                  items: (row.action || []).map((item, idx) => ({
                    key: idx,
                    label: (
                      <ItemDropDown
                        mode={(item.action || "").toLowerCase()}
                        onClick={() => {
                          navigate(
                            "/points/line/register-customer-list/" +
                            (item.action || "").toLowerCase(),
                            { state: { id: row.id, pageCode: "customer_regis" } }
                          );
                        }}
                      />
                    ),
                  })),
                }}
                placement="bottomRight"
              >
                <a onClick={(e) => e.preventDefault()}>
                  <img
                    src="/img/icons/action.png"
                    alt="action"
                    className="w-5 h-5 inline-block"
                  />
                </a>
              </Dropdown>
            ),
          }));
        } else if (currentTab.shopType === "sub_dealer") {
          newData = customers.map((row, index) => ({
            key: index + 1 + (current - 1) * pageSize,
            id: row.id,
            dealer_id: row.shop_code,
            dealer_name: row.dealer_name,
            sale_name: row.sale_name,
            shop_name: row.shop_name,
            contact_name: row.name_th,
            phone: row.phone_number,
            subscribed: row.line_join_last_datetime?.split(" ")[0] || "-",
            point: row.balance_point,
            status: (
              <BadgeStatus
                text={row.status_name}
                bgColor={row.status_bg_color}
                textColor={row.status_color}
              />
            ),
            action: (
              <Dropdown
                menu={{
                  items: (row.action || []).map((item, idx) => ({
                    key: idx,
                    label: (
                      <ItemDropDown
                        mode={(item.action || "").toLowerCase()}
                        onClick={() => {
                          navigate(
                            "/points/line/register-customer-list/" +
                            (item.action || "").toLowerCase(),
                            { state: { id: row.id, pageCode: "customer_regis" } }
                          );
                        }}
                      />
                    ),
                  })),
                }}
                placement="bottomRight"
              >
                <a onClick={(e) => e.preventDefault()}>
                  <img
                    src="/img/icons/action.png"
                    alt="action"
                    className="w-5 h-5 inline-block"
                  />
                </a>
              </Dropdown>
            ),
          }));
        } else if (currentTab.shopType === "farmer") {
          newData = customers.map((row, index) => ({
            key: index + 1 + (current - 1) * pageSize,
            id: row.id,
            dealer_id: row.shop_code,
            sub_dealer_name: row.sub_dealer_name,
            dealer_name: row.dealer_name,
            sale_name: row.sale_name,
            shop_name_custom: row.shop_name_custom,
            contact_name: row.name_th,
            phone: row.phone_number,
            subscribed: row.line_join_last_datetime?.split(" ")[0] || "-",
            point: row.balance_point,
            status: (
              <BadgeStatus
                text={row.status_name}
                bgColor={row.status_bg_color}
                textColor={row.status_color}
              />
            ),
            action: (
              <Dropdown
                menu={{
                  items: (row.action || []).map((item, idx) => ({
                    key: idx,
                    label: (
                      <ItemDropDown
                        mode={(item.action || "").toLowerCase()}
                        onClick={() => {
                          navigate(
                            "/points/line/register-customer-list/" +
                            (item.action || "").toLowerCase(),
                            { state: { id: row.id, pageCode: "customer_regis" } }
                          );
                        }}
                      />
                    ),
                  })),
                }}
                placement="bottomRight"
              >
                <a onClick={(e) => e.preventDefault()}>
                  <img
                    src="/img/icons/action.png"
                    alt="action"
                    className="w-5 h-5 inline-block"
                  />
                </a>
              </Dropdown>
            ),
          }));
        }

        setDataSource(newData);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total:
              (typeof result.data?.records_filtered === "number"
                ? result.data.records_filtered
                : result.records_filtered) || 0,
          },
        }));
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setTableLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (exportLoading) return;
    setExportLoading(true);

    const filters = tableParams.filters || {};
    const requestData = {
      all: 1,
      shop_type: currentTab.shopType,
      sale_id: filters.sale_id || "",
      dealer_id: filters.dealer_id || "",
      sub_dealer_id: filters.sub_dealer_id || "",
      farmer_id: filters.farmer_id || "",
      contact_name: currentTab.shopType === "farmer" ? "" : filters.contact_name || "",
      created_at: filters.created_at || "",
      status_code: filters.status_code ?? "",
      page_length: 1,
      page_size: 10,
    };

    try {
      const response = await useServiceAPI.get(currentTab.apiPath, requestData);
      if (response.status === 200) {
        const result = response.data || {};
        const rawList = (result.data && result.data.data) || result.data || [];

        const wb = new ExcelJS.Workbook();
        const sheetName =
          currentTab.shopType === "dealer"
            ? "Dealer"
            : currentTab.shopType === "sub_dealer"
            ? "Sub Dealer"
            : "Farmer";
        const ws = wb.addWorksheet(sheetName);

        let columns = [];
        if (currentTab.shopType === "dealer") {
          columns = [
            { header: "Sales Name", key: "sale_name", width: 25, align: "left" },
            { header: "Dealer Name", key: "dealer_name", width: 30, align: "left" },
            { header: "Contact Name", key: "contact_name", width: 25, align: "left" },
            { header: "Contact Number", key: "phone", width: 18, align: "center" },
            { header: "Subscribed", key: "subscribed", width: 16, align: "center" },
            { header: "Current Points", key: "point", width: 16, align: "right" },
            { header: "Status", key: "status", width: 15, align: "center" },
          ];
        } else if (currentTab.shopType === "sub_dealer") {
          columns = [
            { header: "Sales Name", key: "sale_name", width: 25, align: "left" },
            { header: "Dealer Name", key: "dealer_name", width: 30, align: "left" },
            { header: "Sub Dealer Name", key: "shop_name", width: 30, align: "left" },
            { header: "Contact Name", key: "contact_name", width: 25, align: "left" },
            { header: "Contact Number", key: "phone", width: 18, align: "center" },
            { header: "Subscribed", key: "subscribed", width: 16, align: "center" },
            { header: "Current Points", key: "point", width: 16, align: "right" },
            { header: "Status", key: "status", width: 15, align: "center" },
          ];
        } else {
          columns = [
            { header: "Sales Name", key: "sale_name", width: 25, align: "left" },
            { header: "Dealer Name", key: "dealer_name", width: 30, align: "left" },
            { header: "Sub Dealer Name", key: "sub_dealer_name", width: 30, align: "left" },
            { header: "Farmer Name", key: "shop_name_custom", width: 25, align: "left" },
            { header: "Contact Name", key: "contact_name", width: 25, align: "left" },
            { header: "Contact Number", key: "phone", width: 18, align: "center" },
            { header: "Subscribed", key: "subscribed", width: 16, align: "center" },
            { header: "Current Points", key: "point", width: 16, align: "right" },
            { header: "Status", key: "status", width: 15, align: "center" },
          ];
        }

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

        rawList.forEach((row, rowIdx) => {
          const r = ws.getRow(rowIdx + 2);
          const pointNum = parseFloat(row.balance_point || 0) || 0;
          const subscribedDate = row.line_join_last_datetime?.split(" ")[0] || "-";

          if (currentTab.shopType === "dealer") {
            r.getCell(1).value = row.sale_name || "-";
            r.getCell(2).value = row.shop_name_custom || "-";
            r.getCell(3).value = row.name_th || "-";
            r.getCell(4).value = row.phone_number || "-";
            r.getCell(5).value = subscribedDate;
            r.getCell(6).value = pointNum;
            r.getCell(7).value = row.status_name || "-";
          } else if (currentTab.shopType === "sub_dealer") {
            r.getCell(1).value = row.sale_name || "-";
            r.getCell(2).value = row.dealer_name || "-";
            r.getCell(3).value = row.shop_name || "-";
            r.getCell(4).value = row.name_th || "-";
            r.getCell(5).value = row.phone_number || "-";
            r.getCell(6).value = subscribedDate;
            r.getCell(7).value = pointNum;
            r.getCell(8).value = row.status_name || "-";
          } else {
            r.getCell(1).value = row.sale_name || "-";
            r.getCell(2).value = row.dealer_name || "-";
            r.getCell(3).value = row.sub_dealer_name || "-";
            r.getCell(4).value = row.shop_name_custom || "-";
            r.getCell(5).value = row.name_th || "-";
            r.getCell(6).value = row.phone_number || "-";
            r.getCell(7).value = subscribedDate;
            r.getCell(8).value = pointNum;
            r.getCell(9).value = row.status_name || "-";
          }

          columns.forEach((col, colIdx) => {
            const cell = r.getCell(colIdx + 1);
            cell.border = borderThin;
            cell.alignment = { vertical: "middle", horizontal: col.align };
            if (col.key === "point") {
              cell.numFmt = "#,##0";
            }
          });
        });

        ws.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
        const buffer = await wb.xlsx.writeBuffer();
        const fileName = `Registered_Customer_${sheetName}_Report`;
        const safeName = String(fileName).replace(/[\\/:*?"<>|]+/g, "-");
        saveAs(new Blob([buffer]), `${safeName}.xlsx`);
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleFilterChangeLive = (updatedValues) => {
    const nextValues = { ...(updatedValues || {}) };

    const saleId = nextValues?.sale_id || "";
    const prevSaleId = filterValues?.sale_id || "";
    const dealerId = nextValues?.dealer_id || "";
    const prevDealerId = filterValues?.dealer_id || "";
    const subDealerId = nextValues?.sub_dealer_id || "";
    const prevSubDealerId = filterValues?.sub_dealer_id || "";

    if (String(saleId) !== String(prevSaleId)) {
      fetchDealersBySale(saleId);
      nextValues.dealer_id = "";
      nextValues.sub_dealer_id = "";
      nextValues.farmer_id = "";
    }

    if (!saleId && prevSaleId) {
      setDealers([]);
      nextValues.dealer_id = "";
      nextValues.sub_dealer_id = "";
      nextValues.farmer_id = "";
    }

    if (String(dealerId) !== String(prevDealerId)) {
      nextValues.sub_dealer_id = "";
      nextValues.farmer_id = "";
    }

    if (String(subDealerId) !== String(prevSubDealerId)) {
      nextValues.farmer_id = "";
    }

    if (!nextValues.dealer_id) {
      nextValues.sub_dealer_id = "";
      nextValues.farmer_id = "";
    }

    setFilterValues(nextValues);
  };

  const handleSearch = (filters) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: {
        status_code: "",
        sale_id: "",
        dealer_id: "",
        sub_dealer_id: "",
        farmer_id: "",
        contact_name: "",
        created_at: "",
        ...filters,
      },
    }));
  };

  const handleClear = () => {
    setDealers([]);
    setFilterValues({
      status_code: "",
      sale_id: "",
      dealer_id: "",
      sub_dealer_id: "",
      farmer_id: "",
      contact_name: "",
      created_at: "",
    });

    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: {
        status_code: "",
        sale_id: "",
        dealer_id: "",
        sub_dealer_id: "",
        farmer_id: "",
        contact_name: "",
        created_at: "",
      },
    }));
  };

  const header = useMemo(() => {
    if (currentTab.shopType === "dealer") {
      return [
        { title: "Sales Name", dataIndex: "sale_name" },
        { title: "Dealer Name", dataIndex: "dealer_name" },
        { title: "Contact Name", dataIndex: "contact_name" },
        { title: "Contact Number", dataIndex: "phone" },
        { title: "Subscribed", dataIndex: "subscribed" },
        { title: "Current Points", dataIndex: "point" },
        { title: "Status", dataIndex: "status" },
        { title: "Action", dataIndex: "action", align: "center" },
      ];
    }
    if (currentTab.shopType === "sub_dealer") {
      return [
        { title: "Sales Name", dataIndex: "sale_name" },
        { title: "Dealer Name", dataIndex: "dealer_name" },
        { title: "Sub Dealer Name", dataIndex: "shop_name" },
        { title: "Contact Name", dataIndex: "contact_name" },
        { title: "Contact Number", dataIndex: "phone" },
        { title: "Subscribed", dataIndex: "subscribed" },
        { title: "Current Points", dataIndex: "point" },
        { title: "Status", dataIndex: "status" },
        { title: "Action", dataIndex: "action", align: "center" },
      ];
    }
    return [
      { title: "Sales Name", dataIndex: "sale_name" },
      { title: "Dealer Name", dataIndex: "dealer_name" },
      { title: "Sub Dealer Name", dataIndex: "sub_dealer_name" },
      { title: "Farmer Name", dataIndex: "shop_name_custom" },
      { title: "Contact Name", dataIndex: "contact_name" },
      { title: "Contact Number", dataIndex: "phone" },
      { title: "Subscribed", dataIndex: "subscribed" },
      { title: "Current Points", dataIndex: "point" },
      { title: "Status", dataIndex: "status" },
      { title: "Action", dataIndex: "action", align: "center" },
    ];
  }, [currentTab.shopType]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    JSON.stringify(tableParams.filters),
  ]);

  useEffect(() => {
    setDealers([]);
    setFilterValues({
      status_code: "",
      sale_id: "",
      dealer_id: "",
      sub_dealer_id: "",
      farmer_id: "",
      contact_name: "",
      created_at: "",
    });

    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: {
        status_code: "",
        sale_id: "",
        dealer_id: "",
        sub_dealer_id: "",
        farmer_id: "",
        contact_name: "",
        created_at: "",
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Registered Customer</div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="custom-tabs"
        items={Object.keys(tabConfig).map((key) => ({
          key,
          label: tabConfig[key].label,
          children: null,
        }))}
      />

      <Filter
        filters={filtersWithOptions}
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleFilterChangeLive}
        values={filterValues}
      />

      <BoxPrimary>
        <div className="flex justify-end mb-4">
          <DynamicButton
            onClick={handleExportExcel}
            text={exportLoading ? "Exporting..." : "Export Excel"}
            iconSrc="/img/icons/excel.png"
            className="text-white px-4 py-2 rounded-[4px] bg-[#009845]"
            disabled={exportLoading}
          />
        </div>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
          onChange={(pagination) => {
            setTableParams((prev) => ({ ...prev, pagination }));
          }}
        />
      </BoxPrimary>
    </MainLayout>
  );
}