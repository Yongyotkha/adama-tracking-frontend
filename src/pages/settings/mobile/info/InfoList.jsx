// src/pages/settings/mobile/target_group/TargetGroupList.jsx
import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import { Dropdown } from "antd";
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

  // keep current filter values
  const [filterValues, setFilterValues] = useState({});

  // table params
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  // ---------- Filters UI ----------
  // NOTE: pathInfoList ตัวอย่างไม่ได้บังคับ filter อื่น ๆ
  // เลยทำ filter แบบเบา ๆ: keyword + type + status(use_flag)
  const filters = [
    {
      key: "keyword",
      type: "text",
      label: "Keyword",
      placeholder: "Search name...",
    },
    {
      key: "type",
      type: "select",
      label: "Type",
      options: [
        { id: "1", name: "File" },
        { id: "2", name: "Video" },
      ],
    },
    {
      key: "use_flag",
      type: "select",
      label: "Status",
      options: [
        { id: "1", name: "Active" },
        { id: "0", name: "Inactive" },
      ],
    },
  ];

  // ---------- Table header ----------
  const header = [
    { title: "No", dataIndex: "key", width: 70, align: "center" },
    { title: "Name", dataIndex: "name" },
    { title: "Type", dataIndex: "type", width: 90, align: "center" },
    { title: "File", dataIndex: "file", width: 120, align: "center" },
    {
      title: "Create Date",
      dataIndex: "created_at",
      width: 140,
      align: "center",
    },
    { title: "Status", dataIndex: "status", width: 120, align: "center" },
    { title: "Action", dataIndex: "action", width: 90, align: "center" },
  ];

  // ---------- Fetch data (pathInfoList) ----------
  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    // ✅ ให้ตรงตามตัวอย่าง API:
    // page_length = limit
    // page_size   = page
    const requestData = {
      platform: "web",
      orderby_column: "created_at",
      orderby: "desc",
      page_length: pageSize,
      page_size: current,

      // optional filters (ถ้า backend รองรับก็ใช้ได้)
      keyword: f.keyword ?? "",
      type: f.type ?? "",
      use_flag: f.use_flag ?? "",
    };

    try {
      const res = await useServiceAPI.get(paths.pathInfoList, requestData);
      if (res?.status === 200) {
        const result = res?.data || {};
        const list = result;

        const formatted = list.map((item, index) => {
          const id = item.id;

          const items = [
            {
              key: "view",
              label: (
                <ItemDropDown
                  mode="view"
                  onClick={() =>
                    navigate("/setting/info/view", { state: { id } })
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
                    navigate("/setting/info/edit", { state: { id } })
                  }
                />
              ),
            },
            // ถ้ามี api ลบจริงค่อยผูกเพิ่ม (ตอนนี้ไม่เดา path)
            // {
            //   key: "delete",
            //   label: <ItemDropDown mode="delete" onClick={() => handleDelete(id)} />,
            // },
          ];

          return {
            key: index + 1 + (current - 1) * pageSize,
            name: item.name ?? "-",
            type:
              String(item.type) === "1"
                ? "File"
                : String(item.type) === "2"
                ? "Video"
                : "-",
            file: item.file ? (
              <a href={item.file} target="_blank" rel="noreferrer">
                View
              </a>
            ) : (
              "-"
            ),
            created_at: item.created_at ? item.created_at.split(" ")[0] : "-",
            status: (
              <BadgeStatus
                text={String(item.use_flag) === "1" ? "Active" : "Inactive"}
              />
            ),
            action: (
              <Dropdown menu={{ items }} placement="bottomRight">
                <a onClick={(e) => e.preventDefault()}>
                  <img
                    src="/img/icons/action.png"
                    alt="action"
                    className="inline-block w-5 h-5"
                  />
                </a>
              </Dropdown>
            ),
          };
        });

        console.log("formatted : ", list);

        setDataSource(formatted);

        // ✅ total ต้องอิง recordsFiltered ที่ root
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: Number(result?.recordsFiltered ?? 0),
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
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: { ...filtersFromUI },
    }));
    setFilterValues({ ...filtersFromUI });
  };

  const handleClear = () => {
    setFilterValues({});
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  const handleFilterChange = (values) => {
    setFilterValues(values);
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Info List</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() => navigate("/setting/info/create")}
        />
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
