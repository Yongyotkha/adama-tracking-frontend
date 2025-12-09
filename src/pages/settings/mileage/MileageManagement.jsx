import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown } from "antd";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/corsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export default function MileageManagement() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},        // <- ตรงนี้จะเก็บ name ด้วย
    sortOrder: null,
    sortField: null,
  });

  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const header = [
    { title: "No", width: 50, dataIndex: "no", align: "left" },
    { title: "Date", width: 150, dataIndex: "date", align: "left" },
    { title: "Mileage", width: 150, dataIndex: "mileage", align: "right" },
    { title: "Name", width: 200, dataIndex: "name", align: "left" },
    { title: "Last Modified", width: 150, dataIndex: "lastModified", align: "left" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;

    const filters = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "asc";
    const sortField = tableParams.sortField || "name";

    const today = dayjs();
    const startOfMonth = today.startOf("month").format("YYYY-MM-DD");
    const endOfToday = today.format("YYYY-MM-DD");

    const requestData = {
      user_id: userInfo.id,
      start_date: startOfMonth,
      end_date: endOfToday,
      // ✅ เพิ่ม name จาก filter เข้า payload
      name: filters.name || "",       // <--- ตรงนี้ตามที่ต้องการ
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathMileageList,
        requestData
      );

      const formatNumber = (val) =>
        !isNaN(Number(val))
          ? Number(val).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "-";

      if (response.status === 200) {
        const result = response.data;

        const newDataSource = result.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          no: index + 1 + (current - 1) * pageSize,
          date: item.date || "-",
          mileage: formatNumber(item.mileage) || "-",
          name: item.user_name || "-",     // แสดงชื่อจาก API
          lastModified: "-",               // ถ้ามี field ในอนาคตค่อยมาใส่
          action: (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "edit",
                    label: (
                      <ItemDropDown
                        mode="edit"
                        onClick={() =>
                          navigate("/setting/mileage/edit", {
                            state: {
                              user_id: item.user_id,
                              date: item.date,
                              mode: "edit",
                            },
                          })
                        }
                      />
                    ),
                  },
                ],
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
        }));

        setDataSource(newDataSource);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: result.length, // ถ้า API มี records_filtered ค่อยเปลี่ยนทีหลัง
          },
        }));
      }
    } catch (error) {
      console.error(error);
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
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      filters: prev.filters, // รักษาค่า filter name เดิมไว้
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    }));
  };

  // ✅ เปลี่ยน key เป็น name เพื่อ map กับ payload
  const filters = [
    {
      key: "name",
      type: "text",
      label: "Name",
      placeholder: "Search by name",
    },
  ];

  const handleSearch = (filtersValue) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: 1,
        pageSize: 10,
      },
      filters: {
        ...prev.filters,
        name: filtersValue.name || "", // เก็บ name ไว้ใน state
      },
    }));
  };

  const handleClear = () => {
    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: 1,
      },
      filters: {}, // เคลียร์ name ออก
    }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Mileage Management</div>
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
