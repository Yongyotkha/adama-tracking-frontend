import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import TableComponent from "../../../../components/table/TableComponent";
import { Dropdown, Image } from "antd";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";

export default function InfoList() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  const header = [
    { title: "No", dataIndex: "key", width: 70, align: "center" },
    { title: "Name", dataIndex: "name" },
    { title: "Type", dataIndex: "type" },
    { title: "Image", dataIndex: "file", align: "center" },
    {
      title: "Create Date",
      dataIndex: "created_at",
      width: 140,
      align: "center",
    },
    { title: "Status", dataIndex: "status", width: 120, align: "center" },
    { title: "Action", dataIndex: "action", width: 90, align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;

    const requestData = {
      platform: "web",
      orderby_column: "created_at",
      orderby: "desc",
      page_length: pageSize,
      page_size: current,
    };

    try {
      // Assuming POST for list based on complex params usually sent in body
      const res = await useServiceAPI.get(paths.pathInfoList, requestData);
      console.log("res : ", res);
      if (res.status === 200) {
        const result = res.data;
        // Adjust based on response structure
        // "data": [ ... ]
        // "recordsTotal": ...
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
          ];

          const isActive = item.use_flag === "1";

          return {
            key: index + 1 + (current - 1) * pageSize,
            name: item.name,
            type: item.type === "1" ? "Type 1" : item.type,
            file: item.file ? (
              <Image
                src={item.file}
                width={50}
                height={50}
                style={{ objectFit: "cover" }}
              />
            ) : (
              "-"
            ),
            created_at: item.created_at || "-",
            status: (
              <BadgeStatus
                text={isActive ? "Active" : "Inactive"}
                bgColor={isActive ? "#F6FFED" : "#F5F5F5"}
                textColor={isActive ? "#52C41A" : "#8C8C8C"}
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

        setDataSource(formatted);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: result?.recordsTotal ?? result?.data?.recordsTotal ?? 0,
          },
        }));
      }
    } catch (err) {
      console.error("Failed to fetch info list:", err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableParams.pagination.current, tableParams.pagination.pageSize]);

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
