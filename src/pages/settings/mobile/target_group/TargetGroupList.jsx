// src/pages/settings/mobile/target_group/TargetGroupList.jsx
import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import { Dropdown, Modal } from "antd";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";

export default function TargetGroupList() {
  const navigate = useNavigate();

  // page states
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  // masters for filters
  const [targetGroups, setTargetGroups] = useState([]); // /target-group/group
  const [typeGroups, setTypeGroups] = useState([]);     // /target-group/type (depends on target)

  // keep current filter values to do cascade
  const [filterValues, setFilterValues] = useState({});

  // table params
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 50, total: 0 },
    filters: {},
  });

  // ---------- Filters UI ----------
  const filters = [
    {
      key: "target_name",
      type: "select",
      label: "Customer Group",
      options: targetGroups, // [{id, name}]
    },
    {
      key: "type_name",
      type: "select",
      label: "Type Name",
      options: typeGroups, // [{id, name}] <- will change when target_name changes
      disabled: !filterValues?.target_name, // ปิดไว้จนกว่าจะเลือก target
    },
    {
      key: "status",
      type: "select",
      label: "Status",
      options: [
        { id: "0", name: "Inactive" },
        { id: "1", name: "Active" },
      ],
    },
  ];

  // ---------- Table header ----------
  const header = [
    { title: "No", dataIndex: "key", width: 70, align: "center" },
    { title: "Customer Group", dataIndex: "target_text" },
    { title: "Type Name", dataIndex: "type" },
    { title: "Create Date", dataIndex: "created_at", width: 140, align: "center" },
    { title: "Status", dataIndex: "status", width: 120, align: "center" },
    { title: "Action", dataIndex: "action", width: 90, align: "center" },
  ];

  // ---------- Load Target Group master (no body) ----------
  useEffect(() => {
    const loadTargetGroups = async () => {
      setLoading(true);
      try {
        const tgRes = await useServiceAPI.get(paths.pathTargetGroupMasterGroup, {});
        // res.data = [{ id: 1, name: "Dealer" }, ...]
        const opts = (tgRes?.data || []).map((x) => ({
          id: String(x.id),
          name: String(x.name ?? "-"),
        }));
        console.log(opts);
        setTargetGroups(opts);
      } catch (e) {
        console.error("Load target group master failed:", e);
      } finally {
        setLoading(false);
      }
    };
    loadTargetGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- When target changes -> load type master with body { target } ----------
  useEffect(() => {
    const t = filterValues?.target_name;
    if (!t) {
      setTypeGroups([]);
      return;
    }
    const targetId = typeof t === "object" && t.value ? t.value : t;
    const loadTypeByTarget = async () => {
      try {
        const tyRes = await useServiceAPI.get(paths.pathTargetGroupType, { target: String(targetId) });
        // res.data = [{ id: "1", name: "Star" }, ...]
        const tyOpts = (tyRes?.data || []).map((x) => ({
          id: String(x.id),
          name: String(x.name ?? "-"),
        }));
        setTypeGroups(tyOpts);
      } catch (e) {
        console.error("Load type master failed:", e);
        setTypeGroups([]);
      }
    };
    loadTypeByTarget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues?.target_name]);

  // ---------- Delete handler ----------
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "ยืนยันการลบ?",
      content: "ลบข้อมูล Customer Group นี้ถาวร",
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        try {
          setTableLoading(true);
          const res = await useServiceAPI.delete(paths.pathTargetGroupDelete, { id });
          if (res?.status === 200) {
            await fetchData();
          }
        } catch (e) {
          console.error("Delete failed", e);
        } finally {
          setTableLoading(false);
        }
      },
    });
  };

  // ---------- Fetch data ----------
  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    const requestData = {
      status: f.status ?? "",
      target_name: f.target_name ?? "", // id
      type_name: f.type_name ?? "",     // id
      page_size: pageSize,
      page_length: current,
    }; 

    console.log(requestData.status);

    try {
      const res = await useServiceAPI.get(paths.pathTargetGroupList, requestData);
      if (res.status === 200) {
        const result = res.data;
        const list = result?.data || [];

        const formatted = list.map((item, index) => {
          const id = item.id;
          const items = [
            {
              key: "view",
              label: (
                <ItemDropDown
                  mode="view"
                  onClick={() =>
                    navigate("/setting/line/target-group/view", { state: { id } })
                  }
                />
              ),
            },
            {
              key: "edit",
              label: (
                <ItemDropDown
                  mode="edit"
                  onClick={() =>
                    navigate("/setting/line/target-group/edit", { state: { id } })
                  }
                />
              ),
            },
            {
              key: "delete",
              label: (
                <ItemDropDown
                  mode="delete"
                  onClick={() => handleDelete(id)}
                />
              ),
            },
          ];

          return {
            key: index + 1 + (current - 1) * pageSize,
            target_text: item.target_text,
            type: item.type_name,
            created_at: item.created_at?.split(" ")[0],
            status: (
              <BadgeStatus
                text={item.status_mapping_name}
                bgColor={item.status_mapping_bg_color}
                textColor={item.status_mapping_color}
              />
            ),
            action: (
              <Dropdown menu={{ items }} placement="bottomRight">
                <a onClick={(e) => e.preventDefault()}>
                  <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5" />
                </a>
              </Dropdown>
            ),
          };
        });

        setDataSource(formatted);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total:
              result?.data?.records_filtered ??
              result?.records_filtered ??
              0,
          },
        }));
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setTableLoading(false);
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    JSON.stringify(tableParams.filters),
  ]);

  // ---------- Filter handlers ----------
  const handleSearch = (filtersFromUI) => {
    // ถ้าเปลี่ยน target ให้ clear type อัตโนมัติ (กันค่าค้าง)
    const nextFilters =
      filtersFromUI?.target_name !== filterValues?.target_name
        ? { ...filtersFromUI, type_name: "" }
        : { ...filtersFromUI };

    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: nextFilters, // { status, target_name, type_name }
    }));
    setFilterValues(nextFilters);
  };

  const handleClear = () => {
    setFilterValues({});
    setTypeGroups([]);
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  // ใช้ onChange เพื่อทำ cascade แบบ realtime (ไม่ต้องกด Search ก็โหลด type ให้เลย)
  const handleFilterChange = (values) => {
    // ถ้า target เปลี่ยน ให้ reset type ใน UI state ด้วย
    if (values?.target_name !== filterValues?.target_name) {
      values.type_name = "";
    }
    setFilterValues(values);
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Customer Group</div>
        <ActionButton mode="create" text="Create" onClick={() => navigate("create")} />
      </div>

      <Filter
        filters={filters}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClear}
        values={filterValues}
      />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={tableParams.pagination}
          onChange={(pagination) => {
            setTableParams((prev) => ({ ...prev, pagination }));
          }}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
