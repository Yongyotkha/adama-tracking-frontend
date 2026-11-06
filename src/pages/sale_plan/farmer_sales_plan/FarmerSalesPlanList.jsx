import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Dropdown, Select } from "antd";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  STATUS_OPTIONS,
  apiError,
  asList,
  loadFarmerPlanMasters,
  money,
  pointText,
  text,
} from "./farmerSalesPlanMaster";

const emptyFilters = { keyword: "", dealer_id: "", sub_dealer_id: "", status: "" };
const currentYear = new Date().getFullYear();

export default function FarmerSalesPlanList() {
  const navigate = useNavigate();
  const { showMsg } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(currentYear);
  const [years, setYears] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [subDealers, setSubDealers] = useState([]);
  const [filterValues, setFilterValues] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadFarmerPlanMasters()
      .then((master) => {
        setYears(master.years);
        setDealers(master.dealers);
        setSubDealers(master.subDealers);
      })
      .catch((error) => showMsg("error", apiError(error, "โหลดตัวกรองไม่สำเร็จ")));
  }, [showMsg]);

  const yearOptions = useMemo(
    () =>
      years.some((item) => String(item.value) === String(year))
        ? years
        : [{ value: year, label: `Year ${year}` }, ...years],
    [year, years]
  );

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page_length: pagination.current,
        page_size: pagination.pageSize,
        year_code: year,
      };
      if (applied.keyword) params.keyword = applied.keyword.trim();
      if (applied.dealer_id) params.dealer_id = applied.dealer_id;
      if (applied.sub_dealer_id) params.sub_dealer_id = applied.sub_dealer_id;
      if (applied.status) params.status_code = applied.status;

      const response = await useServiceAPI.get(paths.pathFarmerSalesPlanList, params);
      const body = response?.data ?? {};
      setRows(asList(body).map((row, index) => ({ ...row, key: `${row.farmer_id}-${index}` })));
      setPagination((prev) => ({
        ...prev,
        total: Number(body.records_filtered ?? body.records_total ?? 0),
      }));
    } catch (error) {
      setRows([]);
      showMsg("error", apiError(error, "โหลดรายการไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  }, [applied, pagination.current, pagination.pageSize, year, showMsg]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const subDealerOptions = useMemo(() => {
    const source = filterValues.dealer_id
      ? subDealers.filter((item) => String(item.dealerId) === String(filterValues.dealer_id))
      : subDealers;
    return source.map((item) => ({ id: item.id, name: item.name }));
  }, [filterValues.dealer_id, subDealers]);

  const openPlan = (record, mode) => {
    navigate(`/sale-plan/farmer-sales-plan/${mode}`, {
      state: {
        mode,
        farmer_id: record.farmer_id,
        plan_id: record.plan_id,
        year_code: record.year_code ?? year,
        row: record,
      },
    });
  };

  const actionItems = (record) => {
    const permission = record.permission || {};
    const items = [];
    if (permission.btn_create === true) {
      items.push({
        key: "create",
        label: <ItemDropDown mode="create" text="Create" onClick={() => openPlan(record, "create")} />,
      });
    }
    if (permission.btn_edit === true) {
      items.push({
        key: "edit",
        label: <ItemDropDown mode="edit" onClick={() => openPlan(record, "edit")} />,
      });
    }
    if (permission.btn_view === true) {
      items.push({
        key: "view",
        label: <ItemDropDown mode="view" onClick={() => openPlan(record, "view")} />,
      });
    }
    return items;
  };

  const filters = [
    { key: "keyword", type: "text", label: "Keyword", placeholder: "Farmer / Document No." },
    { key: "dealer_id", type: "select", label: "Dealer", placeholder: "All", options: dealers },
    {
      key: "sub_dealer_id",
      type: "select",
      label: "Sub Dealer",
      placeholder: "All",
      options: subDealerOptions,
    },
    { key: "status", type: "select", label: "Status", placeholder: "All", options: STATUS_OPTIONS },
  ];

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 70, align: "center" },
    { title: "Farmer Name", dataIndex: "farmer_name", key: "farmer_name" },
    {
      title: "Dealer / Sub Dealer",
      key: "dealer",
      render: (_, record) => {
        const dealer = text(record.dealer_name);
        const sub = text(record.sub_dealer_name);
        if (!dealer && !sub) return "-";
        return (
          <div>
            <div>{dealer || "-"}</div>
            {sub && <div className="text-xs text-gray-500">{sub}</div>}
          </div>
        );
      },
    },
    { title: "Year", dataIndex: "year_code", key: "year_code", width: 90, align: "center" },
    {
      title: "Document Number",
      key: "document_no",
      width: 170,
      render: (_, record) => text(record.document_no ?? record.document_number ?? record.doc_no) || "-",
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      align: "right",
      width: 140,
      render: (value) => money(value),
    },
    {
      title: "Total Point",
      dataIndex: "total_point",
      key: "total_point",
      align: "right",
      width: 120,
      render: (value) => pointText(value),
    },
    {
      title: "Status",
      key: "status",
      width: 140,
      align: "center",
      render: (_, record) => (
        <BadgeStatus
          text={record.status_label || "-"}
          bgColor={record.status_bg_color || "#978B87"}
          textColor={record.status_color || "#FFFFFF"}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 90,
      align: "center",
      render: (_, record) => {
        const items = actionItems(record);
        if (!items.length) return null;
        return (
          <Dropdown menu={{ items }} placement="bottomRight">
            <a onClick={(event) => event.preventDefault()}>
              <img src="/img/icons/action.png" alt="action" className="inline-block h-5 w-5" />
            </a>
          </Dropdown>
        );
      },
    },
  ];

  const resetPage = () => setPagination((prev) => ({ ...prev, current: 1 }));

  return (
    <MainLayout>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="title-page">Farmer Sales Plan</div>
        <Select
          value={year}
          onChange={(value) => {
            setYear(value);
            resetPage();
          }}
          options={yearOptions}
          className="min-w-[140px] [&_.ant-select-selector]:border-[#00783F] [&_.ant-select-selection-item]:font-semibold [&_.ant-select-selection-item]:text-[#00783F]"
        />
      </div>

      <Filter
        filters={filters}
        values={filterValues}
        onChange={(values) =>
          setFilterValues((prev) => {
            const next = { ...emptyFilters, ...values };
            if (String(prev.dealer_id || "") !== String(next.dealer_id || "")) next.sub_dealer_id = "";
            return next;
          })
        }
        onSearch={(values) => {
          setApplied({ ...emptyFilters, ...values });
          resetPage();
        }}
        onClear={() => {
          setFilterValues(emptyFilters);
          setApplied(emptyFilters);
          resetPage();
        }}
      />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={rows}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          }}
          onChange={(next) =>
            setPagination((prev) => ({ ...prev, current: next.current, pageSize: next.pageSize }))
          }
        />
      </BoxPrimary>
    </MainLayout>
  );
}
