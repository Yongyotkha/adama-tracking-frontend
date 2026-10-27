import { useContext, useEffect, useMemo, useState } from "react";
import { Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import ActionButton from "../../../components/button/ActionButton";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

const asList = (body) => {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.data?.data)) return body.data.data;
  return [];
};

const firstText = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value != null && String(value).trim() !== "") return String(value);
  }
  return "";
};

export default function TerritoryList() {
  const navigate = useNavigate();
  const { showMsg } = useContext(AuthContext);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
  });

  useEffect(() => {
    const fetchData = async () => {
      setTableLoading(true);
      try {
        const [territoryRes, areaRes, optionRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterTerritory, {}).catch(() => null),
          useServiceAPI.get(paths.pathMasterAreas, {}).catch(() => null),
          useServiceAPI.get(paths.pathTerritoryTransferOptions, {}).catch(() => null),
        ]);

        if (!territoryRes && !optionRes) {
          showMsg("error", "โหลดรายการ Territory ไม่สำเร็จ");
          setDataSource([]);
          return;
        }

        const masterRows = asList(territoryRes?.data ?? territoryRes);
        const optionRows = Array.isArray(optionRes?.data?.territories)
          ? optionRes.data.territories
          : [];
        const areaRows = [
          ...asList(areaRes?.data ?? areaRes),
          ...(Array.isArray(optionRes?.data?.areas) ? optionRes.data.areas : []),
        ];
        const uniqueAreas = [];
        const seenAreaIds = new Set();
        areaRows.forEach((area) => {
          const id = area.id ?? area.area_id;
          const name = firstText(area, ["name", "area_name", "sale_area_name"]);
          if (id == null || !name || seenAreaIds.has(String(id))) return;
          seenAreaIds.add(String(id));
          uniqueAreas.push({ id, name });
        });
        setAreas(uniqueAreas);

        const areaNameById = new Map(
          uniqueAreas.map((area) => [String(area.id), area.name])
        );
        const optionById = new Map(optionRows.map((row) => [String(row.id), row]));
        const source = masterRows.length ? masterRows : optionRows;

        const rows = source
          .map((row, index) => {
            const merged = { ...(optionById.get(String(row.id)) || {}), ...row };
            const areaId = merged.area_id ?? merged.areaId ?? null;
            const areaName =
              firstText(merged, ["area_name", "area", "sale_area_name"]) ||
              areaNameById.get(String(areaId)) ||
              "";

            return {
              key: merged.id ?? `territory-${index}`,
              id: merged.id ?? null,
              territoryName: firstText(merged, ["name", "territory_name", "territory"]) || "-",
              province: firstText(merged, ["province_name", "province", "provinceName"]) || "-",
              area: areaName || "-",
              areaId,
              raw: merged,
            };
          })
          .sort((a, b) => a.territoryName.localeCompare(b.territoryName));

        setDataSource(rows);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, current: 1, total: rows.length },
        }));
      } catch (error) {
        setDataSource([]);
        showMsg("error", error?.message || "โหลดรายการ Territory ไม่สำเร็จ");
      } finally {
        setTableLoading(false);
      }
    };

    fetchData();
  }, [showMsg]);

  const openCreate = () => {
    navigate("/setting/territory/create", { state: { mode: "create" } });
  };

  const openEdit = (record) => {
    navigate("/setting/territory/edit", {
      state: { mode: "edit", id: record.id, record },
    });
  };

  const filteredRows = useMemo(() => {
    const keyword = String(filterValues.keyword || "").trim().toLowerCase();
    const areaId = filterValues.area_id;
    return dataSource.filter((row) => {
      const matchesKeyword =
        !keyword ||
        row.territoryName.toLowerCase().includes(keyword) ||
        String(row.province).toLowerCase().includes(keyword);
      const matchesArea = !areaId || String(row.areaId) === String(areaId);
      return matchesKeyword && matchesArea;
    });
  }, [dataSource, filterValues]);

  const filters = [
    {
      key: "keyword",
      type: "text",
      label: "Territory Name",
      placeholder: "Search territory",
    },
    {
      key: "area_id",
      type: "select",
      label: "Area",
      placeholder: "All",
      options: areas,
    },
  ];

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 80, align: "center" },
    { title: "Territory Name", dataIndex: "territoryName", key: "territory_name" },
    { title: "Province", dataIndex: "province", key: "province" },
    { title: "Area", dataIndex: "area", key: "area" },
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
              {
                key: "edit",
                label: <ItemDropDown mode="edit" onClick={() => openEdit(record)} />,
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
        <ActionButton mode="create" text="Create" onClick={openCreate} />
      </div>

      <Filter
        filters={filters}
        values={filterValues}
        onChange={setFilterValues}
        onSearch={(values) => {
          setFilterValues(values);
          setTableParams((prev) => ({
            ...prev,
            pagination: { ...prev.pagination, current: 1 },
          }));
        }}
        onClear={() => {
          setFilterValues({});
          setTableParams((prev) => ({
            ...prev,
            pagination: { ...prev.pagination, current: 1 },
          }));
        }}
      />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={filteredRows}
          pagination={{ ...tableParams.pagination, total: filteredRows.length }}
          loading={tableLoading}
          onChange={(pagination) => {
            setTableParams((prev) => ({
              ...prev,
              pagination: { ...prev.pagination, ...pagination },
            }));
          }}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
