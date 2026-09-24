// src/pages/settings/mobile/reward_campaign/RewardCampaignList.jsx
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
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import dayjs from "dayjs";
import { AuthContext } from "../../../../contexts/AuthContext";
import DynamicModal from "../../../../components/modal/DynamicModal";

export default function RewardCampaignList() {
  const navigate = useNavigate();
  const { showNotification } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modal: Point By Customer Group
  const [isPointModalVisible, setIsPointModalVisible] = useState(false);
  const [pointRows, setPointRows] = useState([]);
  const [pointTitle, setPointTitle] = useState("Point By Customer Group");

  const defaultFilters = { status: "1" }; // Active

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50", "100"],
    },
    filters: defaultFilters,
  });

  const pointColumns = [
    { title: "No", dataIndex: "key", key: "key", width: 60, align: "center" },
    { title: "Customer Name", dataIndex: "customer_name", key: "customer_name" },
    { title: "Type Name", dataIndex: "type_name", key: "type_name" },
    { title: "Point", dataIndex: "point", key: "point", align: "right" },
    { title: "Value/Point (THB)", dataIndex: "value", key: "value", align: "right" },
  ];

  // ---------- Load Category Master ----------
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathPromotionCategory, {});
        const opts = (res?.data || []).map((x) => ({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Filters UI ----------
  const filters = [
    { key: "reward_code", type: "text", label: "Reward Code" },
    { key: "reward_name", type: "text", label: "Reward Name" },
    {
      key: "category_id",
      type: "select",
      label: "Category",
      options: categories,
    },
    { key: "dater", type: "dater", label: "Period" },
    {
      key: "status",
      type: "select",
      label: "Status",
      options: [
        { id: "0", code: "0", name: "Inactive" },
        { id: "1", code: "1", name: "Active" },
      ],
    },
  ];

  // ---------- Helpers ----------
  const formatDate = (dateStr) => (dateStr ? dayjs(dateStr).format("YYYY-MM-DD") : "-");

  const openPointModal = (rewardName, customerGroup = []) => {
    const rows = (Array.isArray(customerGroup) ? customerGroup : []).map((g, idx) => ({
      key: idx + 1,
      customer_name: g?.customer_type ?? "-",
      type_name: g?.name ?? "-",
      point: g?.point ?? "-",
      value: g?.value ?? "-",
    }));

    setPointTitle(`Point By Customer Group : ${rewardName || ""}`);
    setPointRows(rows);
    setIsPointModalVisible(true);
  };

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
    { title: "Reward Code", dataIndex: "code" },
    { title: "Category", dataIndex: "category_name" },
    { title: "Reward Name", dataIndex: "name" },

    // ✅ Column: Point (count) -> click to open modal
    { title: "Point", dataIndex: "point_count", align: "center", width: 90 },

    { title: "Stock", dataIndex: "value_display" },
    { title: "Period", dataIndex: "period" },
    { title: "Status", dataIndex: "status" },
    { title: "Action", dataIndex: "action", align: "center", width: 50 },
  ];

  // ---------- Fetch List ----------
  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    const requestData = {
      reward_code: f.reward_code ?? "",
      reward_name: f.reward_name ?? "",
      category_id: f.category_id ?? "",
      dater: Array.isArray(f.dater) ? f.dater : [],
      status: f.status ?? "",
      page_size: pageSize,
      page_length: current,
    };

    try {
      const res = await useServiceAPI.get(paths.pathPromotionManagementList, requestData);
      const payload = res?.data || {};
      const list = payload?.data || [];

      const formatted = list.map((item, index) => {
        const cg = Array.isArray(item.customer_group) ? item.customer_group : [];
        const count = cg.length;

        return {
          key: index + 1 + (current - 1) * pageSize,
          image: item.image,
          code: item.code,
          category_name: item.category_name,
          name: item.name,

          point_count: (
            <BadgeStatus
              text={count}
              bgColor={item.status_bg_color || "#00783F"}
              textColor={item.status_color || "#FFFFFF"}
              onClick={() => openPointModal(item.name, cg)}
            />
          ),

          value_display: item.value_display,
          period: `${formatDate(item.date_start)} - ${formatDate(item.date_end)}`,
          status: (
            <BadgeStatus
              text={item.status_name}
              bgColor={item.status_bg_color}
              textColor={item.status_color}
            />
          ),
          action: (
            <Dropdown
              menu={{
                items: (item.action || []).map((act, i) => {
                  const mode = String(act.action || "").toLowerCase();

                  if (mode === "view") {
                    return {
                      key: `view-${i}`,
                      label: (
                        <ItemDropDown
                          mode="view"
                          onClick={() =>
                            navigate(`/setting/line/reward-campaign/view`, {
                              state: { id: item.id },
                            })
                          }
                        />
                      ),
                    };
                  }

                  if (mode === "delete") {
                    return {
                      key: `delete-${i}`,
                      label: (
                        <Popconfirm
                          title="ยืนยันการลบ?"
                          description={`คุณต้องการลบรางวัล "${item.name}" หรือไม่`}
                          okText="ลบ"
                          cancelText="ยกเลิก"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => handleDeleteReward(item.id)}
                        >
                          <div>
                            <ItemDropDown mode="delete" />
                          </div>
                        </Popconfirm>
                      ),
                    };
                  }

                  return {
                    key: `${mode}-${i}`,
                    label: (
                      <ItemDropDown
                        mode={mode}
                        onClick={() =>
                          navigate(`/setting/line/reward-campaign/${mode}`, {
                            state: { id: item.id },
                          })
                        }
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
        };
      });

      setDataSource(formatted);
      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: payload?.records_filtered ?? payload?.records_total ?? formatted.length,
        },
      }));
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setTableLoading(false);
    }
  };

  // ---------- Delete ----------
  const handleDeleteReward = async (id) => {
    try {
      setTableLoading(true);
      const url = `${paths.pathPromotiondelete}?id=${encodeURIComponent(id)}`;
      const res = await useServiceAPI.delete(url);

      const ok = res?.status === 200;
      const title = res?.data?.message || (ok ? "Delete successful" : "Delete failed");
      const lines = res?.data?.message_line || [];
      showNotification(ok ? "success" : "error", title, lines);
      if (ok) fetchData();
    } catch (error) {
      console.error("Delete reward failed:", error);
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
      pagination: { ...prev.pagination, current: 1 },
      filters: defaultFilters,
    }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Reward List</div>
        <ActionButton mode="create" text="Create" onClick={() => navigate("create")} />
      </div>

      <Filter
        filters={filters}
        values={tableParams.filters}
        onSearch={handleSearch}
        onClear={handleClear}
      />

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

      {/* ✅ Modal: Point By Customer Group */}
      <DynamicModal
        title={pointTitle}
        isVisible={isPointModalVisible}
        onClose={() => setIsPointModalVisible(false)}
        header={pointColumns}
        dataSource={pointRows}
        width="1200px"
      />
    </MainLayout>
  );
}
