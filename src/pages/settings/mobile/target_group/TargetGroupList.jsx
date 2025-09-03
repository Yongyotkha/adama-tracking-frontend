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
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 50,
      total: 0,
    },
    filters: {},
  });

  const filters = [
    { key: "target", type: "text", label: "Target Name" },
    { key: "type", type: "text", label: "Type Name" },
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
    { title: "No", dataIndex: "key" },
    { title: "Target Name", dataIndex: "target_text" },
    { title: "Type Name", dataIndex: "type" },
    { title: "Create Date", dataIndex: "created_at" },
    { title: "Status", dataIndex: "status" },
    { title: "Action", dataIndex: "action" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    console.log(tableParams);
    const filterValues = tableParams.filters;

    const requestData = {
      use_flag: filterValues?.use_flag ?? "",
      page_size: pageSize,
      page_length: current,
    };

    try {
      const res = await useServiceAPI.get(paths.pathTargetGroupList, requestData);
      if (res.status === 200) {
        const result = res.data;
        const list = result?.data || [];

        const formattedData = list.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          target_text: item.target_text,
          type: item.type,
          created_at: item.created_at?.split(" ")[0],
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
                items: item.action?.map((act, i) => ({
                  key: i,
                  label: (
                    <ItemDropDown
                      mode={act.action.toLowerCase()}
                      onClick={() =>
                        navigate(`/setting/line/target-group/${act.action.toLowerCase()}`, {
                          state: { id: item.id },
                        })
                      }
                    />
                  ),
                })),
              }}
              placement="bottomRight"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5" />
              </a>
            </Dropdown>
          ),
        }));

        setDataSource(formattedData);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: result.data.records_filtered,
          },
        }));
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
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

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Target Group</div>
        <ActionButton mode="create" text="Create" onClick={() => navigate("create")} />
      </div>
      <Filter filters={filters} onSearch={handleSearch} onClear={handleClear} />
      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={tableParams.pagination}
          onChange={(pagination) => {
            setTableParams((prev) => ({
              ...prev,
              pagination,
            }));
          }}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
