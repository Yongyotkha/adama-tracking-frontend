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
import dayjs from "dayjs";

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
    },
    filters: {},
  });

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
              items: item.action.map((act, i) => ({
                key: i,
                label: (
                  <ItemDropDown
                    mode={act.action.toLowerCase()}
                    onClick={() =>
                      navigate(`/setting/line/reward-campaign/${act.action.toLowerCase()}`, {
                        state: { id: item.id },
                      })
                    }
                  />
                ),
              })),
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
        <div className="title-page">Reward Campaign</div>
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
