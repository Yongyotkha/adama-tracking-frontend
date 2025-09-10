import React, { useEffect, useState, useContext } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import { Dropdown, Popconfirm } from "antd"; // ⬅️ เพิ่ม Popconfirm
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import dayjs from "dayjs";
import { AuthContext } from "../../../../contexts/AuthContext"; // ⬅️ ใช้ noti

export default function RewardCampaignList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
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

  const { showNotification } = useContext(AuthContext); // ⬅️ ดึง noti

  const filters = [
    { key: "keyword", type: "text", label: "Reward Code" },
    { key: "reward_name", type: "text", label: "Reward Name" },
    { key: "category_name", type: "text", label: "Category" },
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
    { title: "Stock", dataIndex: "value_display" },
    { title: "Period", dataIndex: "period" },
    { title: "Status", dataIndex: "status" },
    { title: "Action", dataIndex: "action", align: "center", width: 50 },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters;

    const requestData = {
      keyword: filters?.keyword || "",
      use_flag: filters?.use_flag || "",
      page_size: pageSize,
      page_length: current,
    };

    try {
      const res = await useServiceAPI.get(paths.pathPromotionManagementList, requestData);
      const list = res?.data?.data || [];

      const formatted = list.map((item, index) => ({
        key: index + 1 + (current - 1) * pageSize,
        image: item.image,
        code: item.code,
        category_name: item.category_name,
        name: item.name,
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
              items: item.action.map((act, i) => {
                const mode = act.action.toLowerCase();
                // ⬇️ แยก view / delete
                if (mode === "view") {
                  return {
                    key: `view-${i}`,
                    label: (
                      <ItemDropDown
                        mode="view"
                        onClick={() =>
                          navigate(`/setting/line/reward-campaign/${mode}`, {
                            state: { id: item.id }, // ส่ง id ไปหน้า view
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
                        onConfirm={() => handleDeleteReward(item.id)} // ⬅️ เรียกลบ
                      >
                        <div>
                          <ItemDropDown mode="delete" />
                        </div>
                      </Popconfirm>
                    ),
                  };
                }
                // อื่นๆ (เช่น edit) -> นำทางตามเดิม
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
      }));

      setDataSource(formatted);
      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: res.data.data.records_filtered,
        },
      }));
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setTableLoading(false);
    }
  };

  // ⬇️ ฟังก์ชันลบ + noti ตาม response API
  const handleDeleteReward = async (id) => {
    try {
      setTableLoading(true);

      // เลือกวิธีเรียก API แบบ query string (ตาม pattern ตัวอย่างของคุณ)
      const url = `${paths.pathPromotiondelete}?id=${encodeURIComponent(id)}`;
      const res = await useServiceAPI.delete(url);

      // รองรับทั้งกรณีมี res.data.result และ status 200
      const ok = (res?.status === 200);
      const title = res?.data?.message || (ok ? "Delete successful" : "Delete failed");
      const lines = res?.data?.message_line || []; // ถ้ามี

      showNotification(ok ? "success" : "error", title, lines);
      if (ok) {
        fetchData(); // รีเฟรชตาราง
      }
    } catch (error) {
      console.error("Delete reward failed:", error);
      showNotification("error", "Delete failed", [error?.message || "Unexpected error"]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    JSON.stringify(tableParams.filters),
  ]);

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

  const formatDate = (dateStr) =>
    dateStr ? dayjs(dateStr).format("YYYY-MM-DD") : "-";

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Reward List</div>
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
            }))}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
