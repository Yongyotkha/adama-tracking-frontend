import { useContext, useEffect, useMemo, useState } from "react";
import { Dropdown, Select } from "antd";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import { AuthContext } from "../../../contexts/AuthContext";
import { FARMER_PLAN_ROWS, money } from "./farmerSalesPlanMock";
import { loadFarmerPlanMasters } from "./farmerSalesPlanMaster";

const emptyFilters = { dealer_id: "", sub_dealer_id: "", farmer_id: "" };

export default function FarmerSalesPlanList() {
  const navigate = useNavigate();
  const { showMsg } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(2026);
  const [years, setYears] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [subDealers, setSubDealers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [filterValues, setFilterValues] = useState(emptyFilters);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const master = await loadFarmerPlanMasters();
        if (cancelled) return;
        setYears(master.years);
        setDealers(master.dealers);
        setSubDealers(master.subDealers);
        setFarmers(master.farmers);
        const current = master.years.find((item) => String(item.value) === "2026") || master.years[0];
        if (current) setYear(current.value);
      } catch (error) {
        if (!cancelled) showMsg("error", error?.message || "โหลดตัวกรองไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [showMsg]);

  const dealerOptions = dealers;
  const subDealerOptions = useMemo(() => {
    const source = filterValues.dealer_id
      ? subDealers.filter((item) => String(item.dealerId) === String(filterValues.dealer_id))
      : subDealers;
    return source.map((item) => ({ id: item.id, name: item.name }));
  }, [filterValues.dealer_id, subDealers]);
  const farmerOptions = useMemo(() => {
    const source = farmers.filter((item) => {
      if (filterValues.sub_dealer_id) {
        return String(item.subDealerId) === String(filterValues.sub_dealer_id);
      }
      if (filterValues.dealer_id) {
        return String(item.dealerId) === String(filterValues.dealer_id);
      }
      return false;
    });
    return source.map((item) => ({ id: item.id, name: item.name }));
  }, [farmers, filterValues.dealer_id, filterValues.sub_dealer_id]);

  const openPlan = (record, mode) => {
    navigate("/sale-plan/farmer-sales-plan/create", {
      state: { mode, year, plan: record },
    });
  };

  const filters = [
    {
      key: "dealer_id",
      type: "select",
      label: "Dealer",
      placeholder: "All",
      options: dealerOptions,
      size: 8,
    },
    {
      key: "sub_dealer_id",
      type: "select",
      label: "Sub Dealer",
      placeholder: "All",
      options: subDealerOptions,
      size: 8,
    },
    {
      key: "farmer_id",
      type: "select",
      label: "Farmer",
      placeholder: "All",
      options: farmerOptions,
      size: 8,
    },
  ];

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 70, align: "center" },
    { title: "Dealer", dataIndex: "dealer", key: "dealer" },
    { title: "Sub Dealer", dataIndex: "subDealer", key: "sub_dealer" },
    { title: "Farmer", dataIndex: "farmer", key: "farmer" },
    {
      title: "Target Value",
      dataIndex: "targetValue",
      key: "target_value",
      align: "right",
      width: 140,
      render: (value) => money(value),
    },
    {
      title: "Target Point",
      dataIndex: "targetPoint",
      key: "target_point",
      align: "right",
      width: 130,
      render: (value) => Number(value || 0).toLocaleString("en-US"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center",
      render: (status) =>
        status === "Completed" ? (
          <BadgeStatus text="Completed" bgColor="#7DB41E" textColor="#FFFFFF" />
        ) : (
          <BadgeStatus text="Create Plan" bgColor="#978B87" textColor="#FFFFFF" />
        ),
    },
    {
      title: "Action",
      key: "action",
      width: 90,
      align: "center",
      render: (_, record) => {
        const completed = record.status === "Completed";
        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: completed ? "view" : "create",
                  label: (
                    <ItemDropDown
                      mode={completed ? "view" : "create"}
                      text={completed ? "View" : "Create"}
                      onClick={() => openPlan(record, completed ? "view" : "create")}
                    />
                  ),
                },
              ],
            }}
            placement="bottomRight"
          >
            <a onClick={(event) => event.preventDefault()}>
              <img src="/img/icons/action.png" alt="action" className="inline-block h-5 w-5" />
            </a>
          </Dropdown>
        );
      },
    },
  ];

  const { current = 1, pageSize = 10 } = tableParams.pagination;

  return (
    <MainLayout loading={loading}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="title-page">Farmer Sales Plan</div>
        <Select
          value={year}
          onChange={(value) => {
            setYear(value);
            setFilterValues(emptyFilters);
            setTableParams((prev) => ({
              ...prev,
              pagination: { ...prev.pagination, current: 1 },
            }));
          }}
          options={years}
          className="min-w-[140px] [&_.ant-select-selector]:border-[#00783F] [&_.ant-select-selection-item]:font-semibold [&_.ant-select-selection-item]:text-[#00783F]"
        />
      </div>

      <Filter
        filters={filters}
        values={filterValues}
        onChange={(values) => {
          setFilterValues((prev) => {
            const next = { ...emptyFilters, ...values };
            if (String(prev.dealer_id || "") !== String(next.dealer_id || "")) {
              next.sub_dealer_id = "";
              next.farmer_id = "";
            } else if (String(prev.sub_dealer_id || "") !== String(next.sub_dealer_id || "")) {
              next.farmer_id = "";
            }
            return next;
          });
        }}
        onSearch={() => {
          setTableParams((prev) => ({
            ...prev,
            pagination: { ...prev.pagination, current: 1 },
          }));
        }}
        onClear={() => {
          setFilterValues(emptyFilters);
          setTableParams((prev) => ({
            ...prev,
            pagination: { ...prev.pagination, current: 1 },
          }));
        }}
      />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={FARMER_PLAN_ROWS}
          rowKey="id"
          pagination={{
            current,
            pageSize,
            total: FARMER_PLAN_ROWS.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total, range) =>
              `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          }}
          onChange={(pagination) => {
            setTableParams({
              pagination: {
                current: pagination.current,
                pageSize: pagination.pageSize,
              },
            });
          }}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
