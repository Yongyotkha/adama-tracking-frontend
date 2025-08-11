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

export default function PointCampaignList() {
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
    { key: "name", type: "text", label: "Campaign Name" },
    {
      key: "customer_type",
      type: "select",
      label: "Target Group",
      options: [
        { id: "1", name: "Dealer" },
        { id: "2", name: "Sub Dealer" },
        { id: "3", name: "Farmer" },
      ],
    },
    { key: "type", type: "text", label: "Type Name" },
    { key: "product", type: "text", label: "Product" },
    {
      key: "use_flag",
      type: "select",
      label: "Status",
      options: [
        { id: "1", name: "Active" },
        { id: "0", name: "Inactive" },
      ],
    },
    { key: "date_start", type: "date", label: "Start Date" },
    { key: "date_end", type: "date", label: "End Date" },
  ];

  const header = [
    { title: "No", dataIndex: "key" },
    { title: "Campaign Name", dataIndex: "name" },
    { title: "Target Group", dataIndex: "customer_type_name" },
    { title: "Type Name", dataIndex: "type_name" },
    { title: "Product", dataIndex: "product_name" },
    { title: "Campaign", dataIndex: "campaign" },
    { title: "Period", dataIndex: "period" },
    { title: "Status", dataIndex: "status" },
    { title: "Action", dataIndex: "action" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters;

    const requestData = {
      ...filters,
      page_size: pageSize,
      page_length: current,
    };

    try {
      const res = await useServiceAPI.get(paths.pathPointCampaignList, requestData);

      const list = res?.data?.data || [];
      
      const formattedData = list.map((item, index) => ({
        key: index + 1 + (current - 1) * pageSize,
        name: item.name,
        customer_type_name: item.customer_type_name,
        type_name: item.type_name,
        product_name: item.product_name,
        campaign: item.type_name,
        period: `${formatDate(item.date_start)} - ${formatDate(item.date_end)}`,
        status: (
          <BadgeStatus
            text={item.status_mapping_name}
            bgColor={item.status_mapping_bg_color}
            textColor={item.status_mapping_color}
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
                      navigate(`/setting/line/point-campaign/${act.action.toLowerCase()}`, {
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

      setDataSource(formattedData);
      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: res.data.data.records_filtered,
        },
      }));
    } catch (error) {
      console.error("Failed to fetch:", error);
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
    dateStr ? dayjs(dateStr).format("DD/MM/YYYY") : "-";

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Point Campaign</div>
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
