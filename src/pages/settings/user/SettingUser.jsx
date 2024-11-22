import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import TableComponent from "../../../components/table/TableComponent";
import { Dropdown } from "antd";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";

export default function SettingUser() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [position, setPosition] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [positions, roles] = await Promise.all([
          useServiceAPI.get(paths.pathMasterPosition, {}),
          useServiceAPI.get(paths.pathMasterRoles, {}),
        ]);

        setPosition(positions.data);
        setRoles(roles.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);


  ////////////////////////////////////////////// table ///////////////////////////////////////////////
  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "asc";
    const sortField = tableParams.sortField || "name_en";

    const requestData = {
      keyword: filters.keyword || "",
      user_id: filters.user_id || "",
      contact_number: filters.contact_number || "",
      position_id: filters.position || "",
      role_id: filters.role || "",
      use_flag: filters.use_flag || "",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathMasterUsers,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = data.map((user, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          action: (
            <Dropdown
              menu={{
                items: user.action.map((actionItem, actionIndex) => ({
                  key: actionIndex,
                  label: <ItemDropDown mode={actionItem.action.toLowerCase()} />,
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
          name: user.name_en,
          status: (
            <BadgeStatus
              text={user.status_name}
              bgColor={user.status_bg_color}
              textColor={user.status_color}
            />
          ),
          contact_number: user.username,
          email: user.email,
          position: user.position_name,
          role: user.role_name,
        }));

        setDataSource(newDataSource);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: records_filtered,
          },
        });
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

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };

  const filters = [
    {
      key: "keyword",
      type: "text",
      label: "Name",

    },
    {
      key: "contact_number",
      type: "text",
      label: "Contact Number",
      placeholder: "All",
    },
    {
      key: "position",
      type: "select",
      label: "Position",
      options: position,
    },
    {
      key: "role",
      type: "select",
      label: "Role",
      options: roles,
    },
  ];

  const handleSearch = (filters) => {
    setTableParams({
      ...tableParams,
      filters,
    });
  };

  const handleClear = () => {
    setTableParams({
      ...tableParams,
      filters: {},
    });
  };
  ///////////////////////////////////////////// table ///////////////////////////////////////////////
  const header = [
    {
      title: "No",
      width: 50,
      dataIndex: "key",
      align: "left",
    },
    {
      title: "Name(EN)",
      width: 100,
      dataIndex: "name",
      align: "left",
    },
    {
      title: "Contact Number",
      width: 100,
      dataIndex: "contact_number",
      align: "left",
    },
    {
      title: "Email",
      width: 100,
      dataIndex: "email",
      align: "left",
    },
    {
      title: "Position",
      width: 100,
      dataIndex: "position",
      align: "left",
    },
    {
      title: "Role",
      width: 100,
      dataIndex: "role",
      align: "left",
    },
    {
      title: "Status",
      width: 100,
      dataIndex: "status",
      align: "left",
    },
    {
      title: "Action",
      width: 100,
      dataIndex: "action",
      align: "left",
    },
  ];

  return (
    <>
      <MainLayout loading={loading}>
        <div className="flex items-center justify-between">
          <div className="title-page">Manage Users</div>
          <ActionButton
            mode="sync"
            text="Sync SAP"
            onClick=""
            className="ms-auto me-2"
          />
          <ActionButton
            mode="create"
            text="Create"
            onClick={(e) => navigate("/setting/user/create")}
          />
        </div>

        <Filter
          onSearch={handleSearch}
          onClear={handleClear}
          filters={filters}
        />

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
    </>
  );
}
