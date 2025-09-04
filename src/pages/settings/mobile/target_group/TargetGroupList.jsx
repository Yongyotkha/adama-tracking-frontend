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
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 50, total: 0 },
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

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "ยืนยันการลบ?",
      content: "ลบข้อมูล Target Group นี้ถาวร",
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        try {
          setTableLoading(true);
          const res = await useServiceAPI.delete(paths.pathTargetGroupDelete, { id });
          if (res?.status === 200) {
            // รีโหลดตาราง
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

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
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

        const formattedData = list.map((item, index) => {
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
              <Dropdown menu={{ items }} placement="bottomRight">
                <a onClick={(e) => e.preventDefault()}>
                  <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5" />
                </a>
              </Dropdown>
            ),
          };
        });

        setDataSource(formattedData);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: result.data?.records_filtered ?? result.records_filtered ?? 0,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setTableParams((prev) => ({ ...prev, filters: {} }));
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
            setTableParams((prev) => ({ ...prev, pagination }));
          }}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
