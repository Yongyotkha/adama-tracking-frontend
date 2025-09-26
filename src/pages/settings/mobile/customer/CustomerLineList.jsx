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

  // 🔹 เก็บ master contact types สำหรับ select
  const [contactTypes, setContactTypes] = useState([]);

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {
      status_code: "",       // default All
      contact_type_id: "",   // default All
    },
    sortOrder: "desc",
    sortField: "created_at",
  });

  // 🔹 ฟิลเตอร์หน้าจอ (เพิ่ม Contact Type แบบ select)
  const filters = [
    // { key: "shop_name", type: "text", label: "Customer Name" },
    // { key: "contact_name", type: "text", label: "Contact Name" },
    { key: "date", type: "dater", label: "Date" },
    {
      key: "contact_type_id",
      type: "select",
      label: "Contact Type",
      options: contactTypes, // [{id, name}] จาก master
    },
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
      contact_type_id: filters.contact_type_id ?? "", // ✅ ส่งค่า contact type ไปกรอง
      register_date: Array.isArray(filters.date) && filters.date.length === 2
        ? filters.date // ถ้าใช้ RangePicker จะได้ ["YYYY-MM-DD","YYYY-MM-DD"]
        : (filters.date ? dayjs(filters.date).format("YYYY-MM-DD") : ""),
      shop_name: filters.shop_name ?? "",
      contact_name: filters.contact_name ?? "",
      orderby_column: tableParams.sortField || "created_at",
      orderby: tableParams.sortOrder || "desc",
      platform: "web",
    };

    try {
      const response = await useServiceAPI.get(paths.pathCustomerContact, requestData);

      if (response.status === 200) {
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        const recordsFiltered =
          typeof response.data?.records_filtered === "number"
            ? response.data.records_filtered
            : rows.length;

        const newData = rows.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          id: row.id,
          shop_name: row.shop_name,
          contact_name: `${row.first_name} ${row.last_name}`,
          phone: row.phone,
          type: row.contact_type_name,
          line_name: row.line_name,
          created_at: row.created_at?.split(" ")[0] || "-",
          status_name: row.status_name,
          status_bg_color: row.status_bg_color,
          status_color: row.status_color,
          action: row.action || [],
        }));

        setDataSource(newData);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: recordsFiltered },
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
      filters: { status_code: "", contact_type_id: "" }, // ✅ reset เป็น All
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

  // 🔹 โหลด master contact types ครั้งเดียว
  useEffect(() => {
    const fetchContactTypes = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathMasterContactType);
        if (response.status === 200 && response.result) {
          // คาดว่า response.data = [{id,name},...]
          setContactTypes(response.data || []);
        } else {
          console.error("Failed to fetch contact types:", response);
        }
      } catch (error) {
        console.error("Error fetching contact types:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContactTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const header = [
    { title: "No", dataIndex: "key", width: 60, align: "center" },
    { title: "Customer Name", dataIndex: "shop_name" },
    { title: "Contact Name", dataIndex: "contact_name" },
    { title: "Contact Number", dataIndex: "phone" },
    { title: "Contact Type", dataIndex: "type" },
    { title: "Line Name", dataIndex: "line_name" },
    { title: "Date", dataIndex: "created_at", align: "center" },
    {
      title: "Status",
      dataIndex: "status_name",
      align: "center",
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
            items: (row.action || []).map((item, idx) => ({
              key: idx,
              label: (
                <ItemDropDown
                  mode={(item.action || "").toLowerCase()}
                  onClick={() => {
                    const act = (item.action || "").toLowerCase();
                    if (act === "view" || act === "edit") {
                      navigate("/points/line/customer-support-list/" + act, {
                        state: { id: row.id, pageCode: "customer_support" },
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
            <img src="/img/icons/action.png" alt="action" className="w-5 h-5 inline-block" />
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
