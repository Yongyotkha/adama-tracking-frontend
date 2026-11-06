import { useCallback, useContext, useEffect, useState } from "react";
import { Dropdown, Modal } from "antd";
import { CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import ActionButton from "../../../components/button/ActionButton";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  apiError,
  asList,
  firstText,
  isActive,
  isSuccess,
  toNumberId,
  totalOf,
} from "./territoryShared";

const STATUS_OPTIONS = [
  { code: "1", name: "Active" },
  { code: "0", name: "Inactive" },
];

export default function TerritoryList() {
  const navigate = useNavigate();
  const { showMsg } = useContext(AuthContext);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [appliedFilter, setAppliedFilter] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    useServiceAPI
      .get(paths.pathMasterAreas, {})
      .then((res) => {
        setAreas(
          asList(res?.data ?? res)
            .map((area) => ({
              id: area.id ?? area.area_id,
              name: firstText(area, ["name", "area_name", "sale_area_name"]),
            }))
            .filter((area) => area.id != null && area.name)
        );
      })
      .catch(() => setAreas([]));
  }, []);

  const fetchList = useCallback(async () => {
    setTableLoading(true);
    try {
      const params = {
        page_length: pagination.current,
        page_size: pagination.pageSize,
        search: appliedFilter.keyword || "",
      };
      if (appliedFilter.area_id) params.area_id = appliedFilter.area_id;
      if (appliedFilter.status !== undefined && appliedFilter.status !== "") {
        params.use_flag = appliedFilter.status;
      }
      const response = await useServiceAPI.get(paths.pathTerritoryList, params);
      const rows = asList(response?.data ?? response).map((row, index) => ({
        key: row.id ?? `territory-${index}`,
        id: row.id,
        territoryName: firstText(row, ["name", "territory_name"]) || "-",
        areaName: firstText(row, ["area_name", "sale_area_name"]) || "-",
        description: firstText(row, ["description"]) || "-",
        dealerCount: Number(row.dealer_count ?? row.dealers_count ?? 0),
        active: isActive(row),
        raw: row,
      }));
      setDataSource(rows);
      setPagination((prev) => ({ ...prev, total: totalOf(response, rows.length) }));
    } catch (error) {
      setDataSource([]);
      showMsg("error", apiError(error, "โหลดรายการ Territory ไม่สำเร็จ"));
    } finally {
      setTableLoading(false);
    }
  }, [appliedFilter, pagination.current, pagination.pageSize, showMsg]);

  useEffect(() => {
    fetchList();
  }, [fetchList, reloadKey]);

  const goTo = (mode, record) =>
    navigate(`/setting/territory/${mode}`, { state: { mode, id: record?.id, record } });

  const confirmChangeStatus = (record) => {
    const nextFlag = record.active ? 0 : 1;
    const label = nextFlag ? "Active" : "Inactive";
    Modal.confirm({
      title: `Change status to ${label}?`,
      content: `Territory "${record.territoryName}" will be set to ${label}.`,
      okText: "Confirm",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          const response = await useServiceAPI.put(paths.pathTerritoryChangeStatus, {
            id: toNumberId(record.id),
            use_flag: nextFlag,
          });
          if (!isSuccess(response)) {
            showMsg("error", response?.message || "เปลี่ยนสถานะไม่สำเร็จ");
            return;
          }
          showMsg("success", response?.message || "เปลี่ยนสถานะสำเร็จ");
          setReloadKey((key) => key + 1);
        } catch (error) {
          // Status on screen stays unchanged until the backend succeeds.
          showMsg("error", apiError(error, "เปลี่ยนสถานะไม่สำเร็จ"));
        }
      },
    });
  };

  const filters = [
    { key: "keyword", type: "text", label: "Territory Name", placeholder: "Search territory" },
    { key: "area_id", type: "select", label: "Area", placeholder: "All", options: areas },
    { key: "status", type: "select", label: "Status", placeholder: "All", options: STATUS_OPTIONS },
  ];

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 70, align: "center" },
    { title: "Territory Name", dataIndex: "territoryName", key: "territory_name" },
    { title: "Area", dataIndex: "areaName", key: "area_name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Dealer", dataIndex: "dealerCount", key: "dealer_count", width: 100, align: "center" },
    {
      title: "Status",
      dataIndex: "active",
      key: "status",
      width: 120,
      align: "center",
      render: (active) => (
        <BadgeStatus
          text={active ? "Active" : "Inactive"}
          bgColor={active ? "#00783F" : "#978B87"}
          textColor="#FFFFFF"
        />
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: "view", label: <ItemDropDown mode="view" onClick={() => goTo("view", record)} /> },
              { key: "edit", label: <ItemDropDown mode="edit" onClick={() => goTo("edit", record)} /> },
              {
                key: "status",
                label: (
                  <a className="block gap-1" onClick={() => confirmChangeStatus(record)}>
                    {record.active ? (
                      <StopOutlined className="text-[16px] text-[#978B87]" />
                    ) : (
                      <CheckCircleOutlined className="text-[16px] text-[#978B87]" />
                    )}
                    <span className="text-[#978B87] ms-3">
                      {record.active ? "Set Inactive" : "Set Active"}
                    </span>
                  </a>
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
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="flex items-center justify-between">
        <div className="title-page">Territory List</div>
        <ActionButton mode="create" text="Create" onClick={() => goTo("create")} />
      </div>

      <Filter
        filters={filters}
        values={filterValues}
        onChange={setFilterValues}
        onSearch={(values) => {
          setFilterValues(values);
          setAppliedFilter(values);
          setPagination((prev) => ({ ...prev, current: 1 }));
        }}
        onClear={() => {
          setFilterValues({});
          setAppliedFilter({});
          setPagination((prev) => ({ ...prev, current: 1 }));
        }}
      />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ["10", "20", "50", "100"] }}
          onChange={(next) =>
            setPagination((prev) => ({ ...prev, current: next.current, pageSize: next.pageSize }))
          }
        />
      </BoxPrimary>
    </MainLayout>
  );
}
