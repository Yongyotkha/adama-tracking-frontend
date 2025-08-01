import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import { Dropdown } from "antd";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import dayjs from "dayjs";

export default function CustomerLineList() {
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
    filters: {
      status_code: "", // default: All
    },
    sortOrder: "desc",
    sortField: "created_at",
  });

  // แก้ filters ให้ตรงกับ status_code ใหม่
  const filters = [
    { key: "shop_name", type: "text", label: "Shop Name" },
    { key: "contact_name", type: "text", label: "Contact Name" },
    { key: "date", type: "date", label: "Register Date" },
    {
      key: "status_code",
      type: "select",
      label: "Status",
      options: [
        { id: "ODW", name: "Pending" },
        { id: "RFC", name: "Complete" },
        { id: "IPG", name: "In Progress" },
      ],
    },
  ];


  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      page_length: current,
      page_size: pageSize,
      status_code: filters.status_code ?? "",
      register_date: filters.date ? dayjs(filters.date).format("YYYY-MM-DD") : "",
    };

    try {
      const response = await useServiceAPI.get(paths.pathCustomerContact, requestData);

      if (response.status === 200) {
        const customers = response.data?.data || [];
        const recordsFiltered = response.data?.data?.records_filtered || 0;

        const newData = customers.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          id: row.id,
          shop_name: row.shop_name,
          contact_name: `${row.first_name} ${row.last_name}`,
          phone: row.phone,
          type: row.contact_type_name,
          line_name: row.line_name,
          status_name: row.status_name,
          status_bg_color: row.status_bg_color,
          status_color: row.status_color,
          action: row.action,
        }));

        setDataSource(newData);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: recordsFiltered,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching contact list:", error);
    } finally {
      setTableLoading(false);
    }
  };

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
      filters: { status_code: "" }, // reset status_code เป็น All
    }));
  };

  const handleTableChange = (pagination, _, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field || "created_at",
    }));
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

  const header = [
    { title: "No", dataIndex: "key", width: 60 },
    { title: "Shop Name", dataIndex: "shop_name" },
    { title: "Contact Name", dataIndex: "contact_name" },
    { title: "Phone No", dataIndex: "phone" },
    { title: "Contact Type", dataIndex: "type" },
    { title: "Line Name", dataIndex: "line_name" },
    {
      title: "Status",
      dataIndex: "status_name",
      render: (_, row) => (
        <BadgeStatus
          text={row.status_name}
          bgColor={row.status_bg_color}
          textColor={row.status_color}
        />
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      render: (_, row) => (
        <Dropdown
          menu={{
            items: row.action.map((item, idx) => ({
              key: idx,
              label: (
                <ItemDropDown
                  mode={item.action.toLowerCase()}
                  onClick={() => {
                    if (
                      item.action.toLowerCase() === "view" ||
                      item.action.toLowerCase() === "edit"
                    ) {
                      navigate('/points/line/customer-support-list/' + item.action.toLowerCase(), {
                        state: {
                          id: row.id,
                          pageCode: 'customer_support',
                        },
                      });
                    }
                  }}
                />
              ),
            })),
          }}
          placement="bottomRight"
        >
          <a onClick={(e) => e.preventDefault()}>
            <img
              src="/img/icons/action.png"
              alt="action"
              className="w-5 h-5 inline-block"
            />
          </a>
        </Dropdown>
      ),
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Customer Support List</div>
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
  );
}
