// src/pages/settings/mobile/news_promotion/NewsPromotionList.jsx
import React, { useEffect, useState, useContext } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import { Dropdown, Popconfirm } from "antd";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../../services/corsService"; // ✅ คงให้ตรงกับโปรเจกต์คุณ
import { paths } from "../../../../services/CorsPath";
import dayjs from "dayjs";
import { AuthContext } from "../../../../contexts/AuthContext";

export default function NewsPromotionList() {
  const navigate = useNavigate();
  const { showNotification } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [categories, setCategories] = useState([]);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50", "100"],
    },
    filters: {},
  });

  // ---------- Load Category Master (Promotion banner) ----------
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathPromotionBannerCategory, {});
        const raw = Array.isArray(res?.data?.data) ? res.data.data : res?.data || [];
        const opts = (raw || []).map((x) => ({
          id: String(x.id),
          name: String(x.name ?? "-"),
        }));
        setCategories(opts);
      } catch (e) {
        console.error("Load categories failed:", e);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // ---------- Filters UI ----------
  const filters = [
    { key: "name", type: "text", label: "Name" },
    { key: "code", type: "text", label: "Code" },
    {
      key: "category_id",
      type: "select",
      label: "Category",
      options: categories,
    },
    { key: "dater", type: "dater", label: "Period" }, // ["YYYY-MM-DD","YYYY-MM-DD"]
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

  // ---------- Table Header ----------
  const header = [
    { title: "No", dataIndex: "key", width: 60 },
    {
      title: "Banner",
      dataIndex: "image",
      render: (src) => (
        <img src={src} alt="banner" className="w-12 h-12 object-cover rounded" />
      ),
    },
    { title: "Code", dataIndex: "code" },
    { title: "Category", dataIndex: "category_name" },
    { title: "Name", dataIndex: "name" },
    // { title: "Stock", dataIndex: "value_display" },
    // { title: "Cost (THB)", dataIndex: "cost" },
    { title: "Period", dataIndex: "period" },
    { title: "Status", dataIndex: "status" },
    { title: "Action", dataIndex: "action", align: "center", width: 50 },
  ];

  const formatDate = (dateStr) =>
    dateStr ? dayjs(dateStr).format("YYYY-MM-DD") : "-";

  // ---------- Fetch List (Promotion banner) ----------
  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    const requestData = {
      name: f.name ?? "",
      code: f.code ?? "",
      category_id: f.category_id ?? "",
      dater: Array.isArray(f.dater) ? f.dater : [],
      status: f.status ?? "",
      page_size: pageSize,
      page_length: current,
    };

    try {
      const res = await useServiceAPI.get(paths.pathPromotionBannerList, requestData);
      const payload = res?.data || {};
      const list = payload?.data || [];

      const formatted = list.map((item, index) => ({
        key: index + 1 + (current - 1) * pageSize,
        image: Array.isArray(item.image) ? item.image?.[0] : item.image,
        code: item.code,
        category_name: item.category_name,
        name: item.name,
        value_display: item.value_display ?? item.value ?? "-",
        cost: item.cost ?? "-",
        period: `${formatDate(item.date_start)} - ${formatDate(item.date_end)}`,
        status: (
          <BadgeStatus
            text={item.status_name ?? (String(item.use_flag) === "1" ? "Active" : "Inactive")}
            bgColor={item.status_bg_color}
            textColor={item.status_color}
          />
        ),
        action: (
          <Dropdown
            menu={{
              items: (item.action || ["Edit", "Delete"]).map((act, i) => {
                const mode = String(act.action ?? act).toLowerCase();
                if (mode === "delete") {
                  return {
                    key: `delete-${i}`,
                    label: (
                      <Popconfirm
                        title="ยืนยันการลบ?"
                        description={`คุณต้องการลบ "${item.name}" หรือไม่`}
                        okText="ลบ"
                        cancelText="ยกเลิก"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(item.id)}
                      >
                        <div>
                          <ItemDropDown mode="delete" />
                        </div>
                      </Popconfirm>
                    ),
                  };
                }
                // view/edit/default → นำทางไปตาม mode
                return {
                  key: `${mode}-${i}`,
                  label: (
                    <ItemDropDown
                      mode={mode}
                      onClick={() => navigate(`${mode}`, { state: { id: item.id } })}
                    />
                  ),
                };
              }),
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="action" className="w-5 h-5" />
            </a>
          </Dropdown>
        ),
      }));

      setDataSource(formatted);
      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total:
            payload?.records_filtered ??
            payload?.records_total ??
            formatted.length,
        },
      }));
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setTableLoading(false);
    }
  };

  // ---------- Delete (Promotion banner) ----------
  const handleDelete = async (id) => {
    try {
      setTableLoading(true);
      const url = `${paths.pathPromotionBannerDelete}?id=${encodeURIComponent(id)}`;
      const res = await useServiceAPI.delete(url);

      const ok = res?.status === 200;
      const title = res?.data?.message || (ok ? "Delete successful" : "Delete failed");
      const lines = res?.data?.message_line || [];
      showNotification(ok ? "success" : "error", title, lines);
      if (ok) fetchData();
    } catch (error) {
      console.error("Delete failed:", error);
      showNotification("error", "Delete failed", [error?.message || "Unexpected error"]);
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
  const handleSearch = (filters) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters,
    }));
  };

  const handleClear = () => {
    setTableParams((prev) => ({
      ...prev,
      filters: {},
    }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">News Promotion List</div>
        <ActionButton mode="create" text="Create" onClick={() => navigate("create")} />
      </div>

      <Filter filters={filters} onSearch={handleSearch} onClear={handleClear} />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={tableParams.pagination}
          onChange={(pagination) =>
            setTableParams((prev) => ({
              ...prev,
              pagination,
            }))
          }
        />
      </BoxPrimary>
    </MainLayout>
  );
}
