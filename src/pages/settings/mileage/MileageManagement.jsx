import React, { useContext, useEffect, useMemo, useState } from "react";
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
import ExportMileageExcelButton from "../../../components/export/ExportMileageExcelButton";

dayjs.extend(customParseFormat);

export default function MileageManagement() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // ✅ options สำหรับ select name
  const [nameOptions, setNameOptions] = useState([]);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {
      name: undefined, // ✅ ให้เป็น user_id ที่เลือกจาก dropdown
      month: dayjs().format("YYYY-MM"), // ✅ default เดือนปัจจุบัน
    },
    sortOrder: null,
    sortField: null,
  });

  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const header = [
    { title: "No", width: 50, dataIndex: "no", align: "left" },
    { title: "Date", width: 150, dataIndex: "date", align: "left" },
    { title: "Name", width: 200, dataIndex: "name", align: "left" },
    { title: "Mileage", width: 150, dataIndex: "mileage", align: "right" },
    { title: "Last Modified", width: 150, dataIndex: "lastModified", align: "left" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const formatNumber = (val) =>
    !isNaN(Number(val))
      ? Number(val).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      : "-";

  // ✅ คำนวณช่วงวันจากเดือนที่เลือก
  const buildDateRangeFromMonth = (monthStr) => {
    const m = monthStr ? dayjs(monthStr, "YYYY-MM") : dayjs();
    return {
      start_date: m.startOf("month").format("YYYY-MM-DD"),
      end_date: m.endOf("month").format("YYYY-MM-DD"),
    };
  };

  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    const month = filters.month || dayjs().format("YYYY-MM");

    const { start_date, end_date } = buildDateRangeFromMonth(month);

    const requestData = {
      user_id: userInfo.id,
      start_date,
      end_date,
      // ✅ name ส่งเป็น user_id จาก dropdown (backend รับ key name เหมือนเดิม)
      name: filters.name ?? "",
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(paths.pathMileageList, requestData);

      if (response.status === 200) {
        const result = Array.isArray(response.data) ? response.data : [];

        // ✅ ทำ dropdown options (unique จาก result)
        const map = new Map();
        for (const r of result) {
          if (!r?.user_id) continue;
          if (!map.has(r.user_id)) {
            map.set(r.user_id, {
              id: r.user_id,
              name: r.user_name_en
                ? `${r.user_name_en}${r.user_name ? ` (${r.user_name})` : ""}`
                : r.user_name || String(r.user_id),
            });
          }
        }
        setNameOptions(Array.from(map.values()));

        const newDataSource = result.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          no: index + 1 + (current - 1) * pageSize,
          date: item.date || "-",
          mileage: formatNumber(item.mileage) || "-",
          name: item.user_name_en || item.user_name || "-",
          lastModified: "-",
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
            total: result.length, // ถ้า API มี total จริงให้เปลี่ยนเป็น field นั้น
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

  const handleTableChange = (pagination, _filters, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      filters: prev.filters, // ✅ อย่าทับ filter ที่เราเก็บเอง
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    }));
  };

  // ✅ Filter: name = select, month = month picker
  const filters = useMemo(
    () => [
      {
        key: "name",
        type: "select",
        label: "Name",
        placeholder: "All",
        options: nameOptions, // [{id,name}]
      },
      {
        key: "month",
        type: "month",
        label: "Month",
        placeholder: "Select month",
      },
    ],
    [nameOptions]
  );

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
        name: filtersValue.name ?? undefined,
        month: filtersValue.month || dayjs().format("YYYY-MM"),
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
      filters: {
        name: undefined,
        month: dayjs().format("YYYY-MM"),
      },
    }));
  };

  return (
    <MainLayout loading={loading}>
      {/* ✅ หัวข้อ + ปุ่ม export ด้านขวา */}
      <div className="flex items-center justify-between">
        <div className="title-page">Mileage Management</div>

        <ExportMileageExcelButton
          text="Export Excel"
          month={tableParams.filters?.month}
          selectedUserId={tableParams.filters?.name}
          nameOptions={nameOptions}
          userInfoId={userInfo.id}
          requestData={(payload) => useServiceAPI.get(paths.pathMileageList, payload)}
          pageSize={5000}
        />
      </div>

      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />

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
