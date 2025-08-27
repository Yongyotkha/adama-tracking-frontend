import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import TableComponent from "../../../components/table/TableComponent";
import { Dropdown } from "antd";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import BadgeStatus from "../../../components/badge/BadgeStatus";

export default function LogUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 20, // default จากตัวอย่าง API
    },
    filters: {},
    sortOrder: "desc",
    sortField: "created_at",
  });

  // ----------------------------- FETCH TABLE (เปลี่ยนเป็น pathLogList + POST) -----------------------------
  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      // พารามิเตอร์ตามตัวอย่าง API ใหม่
      menu: "Login",            // เช่น "Login"
      user_id: filters.user_id || "",      // หากต้องการค้นหาเจาะ user
      channel_type: filters.channel_type || "", // Web / SAP / Mobile ...
      page_length: current,                // หน้าที่ต้องการ
      page_size: pageSize,                 // จำนวนต่อหน้า
    };

    try {
      // 🔁 เปลี่ยนเป็น POST + pathLogList
      const response = await useServiceAPI.get(paths.pathLogList, requestData);

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = (data || []).map((log, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          name: `${log.name_en}${log.name_th ? ` (${log.name_th})` : ""}`,
          phone_number: log.phone_number || "-",
          menu: log.menu || "-",
          description: log.description || "-",
          remark: log.remark || "-",
          channel_type: (
            <BadgeStatus
              text={log.channel_type || "-"}
              bgColor="#EEF2FF"
              textColor="#1D4ED8"
            />
          ),
          created_at: log.created_at?.replace("T", " ").slice(0, 19) || log.created_at || "-",
          action: (
            <Dropdown
              menu={{
                items: (log.action || []).map((it, i) => ({
                  key: i,
                  label: (
                    <ItemDropDown
                      mode={it.action?.toLowerCase()}
                      onClick={() => {
                        // ปรับไปหน้า view รายการ log ตามต้องการ
                        if ((it.action || "").toLowerCase() === "view") {
                          navigate("/setting/log/view", {
                            state: { id: log.id, mod: it.action },
                          });
                        }
                        // ถ้าต้องการให้แก้ไข/ลบ ทำที่นี่ตามสิทธิ์
                      }}
                    />
                  ),
                })),
              }}
              placement="bottom"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img
                  src="/img/icons/action.png"
                  alt="button icon"
                  className="inline-block w-5 h-5 mr-2"
                />
              </a>
            </Dropdown>
          ),
        }));

        setDataSource(newDataSource);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: records_filtered || 0,
          },
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange = (pagination, _filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters,
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };

  // ----------------------------- FILTERS (ปรับตามโครงสร้าง log) -----------------------------
  const filters = [
    {
      key: "menu",
      type: "text",
      label: "Menu",
      placeholder: "เช่น Login",
    },
    {
      key: "user_id",
      type: "text",
      label: "User ID",
      placeholder: "เช่น 109",
    },
    {
      key: "channel_type",
      type: "select",
      label: "Channel",
      options: [
        { value: "", label: "All" },
        { value: "Web", label: "Web" },
        { value: "SAP", label: "SAP" },
        { value: "Mobile", label: "Mobile" },
      ],
    },
  ];

  const handleSearch = (filters) => {
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1,
        pageSize: 20,
      },
      filters: {
        ...filters,
        page_length: 1,
        page_size: 20,
      },
    });
  };

  const handleClear = () => {
    setTableParams({
      ...tableParams,
      filters: {},
      pagination: { ...tableParams.pagination, current: 1 },
    });
  };

  // ----------------------------- HEADER (คอลัมน์ใหม่ตามข้อมูล log) -----------------------------
  const header = [
    { title: "No", width: 60, dataIndex: "key", align: "left" },
    { title: "Name", width: 180, dataIndex: "name", align: "left" },
    { title: "Phone", width: 140, dataIndex: "phone_number", align: "left" },
    { title: "Menu", width: 120, dataIndex: "menu", align: "left" },
    { title: "Description", width: 160, dataIndex: "description", align: "left" },
    { title: "Channel", width: 120, dataIndex: "channel_type", align: "left" },
    { title: "Created At", width: 180, dataIndex: "created_at", align: "left" },
    // { title: "Action", width: 100, dataIndex: "action", align: "left" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">User Log</div>
      </div>

      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />

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
