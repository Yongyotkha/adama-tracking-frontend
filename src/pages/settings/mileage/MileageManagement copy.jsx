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

  const [nameOptions, setNameOptions] = useState([]);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {
      name: undefined,
      month: undefined, // ✅ ไม่ fix เดือนปัจจุบัน
    },
    sortOrder: null,
    sortField: null,
  });

  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const header = [
    {
      title: "No",
      width: 50,
      key: "no",
      align: "left",
      render: (_, __, index) => {
        const current = tableParams?.pagination?.current || 1;
        const pageSize = tableParams?.pagination?.pageSize || 10;
        return (current - 1) * pageSize + index + 1;
      },
    },
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

  const buildDateRangeFromMonth = (monthStr) => {
    const m = dayjs(monthStr, "YYYY-MM");
    return {
      start_date: m.startOf("month").format("YYYY-MM-DD"),
      end_date: m.endOf("month").format("YYYY-MM-DD"),
    };
  };

  useEffect(() => {
    const getSaleMaster = async () => {
      try {
        const saleRes = await useServiceAPI.get(paths.pathMasterSaleDropdown, { mode: "all" });
        setNameOptions(saleRes?.data || []);
      } catch (e) {
        console.error(e);
        setNameOptions([]);
      }
    };

    getSaleMaster();
  }, []);

  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      user_id: userInfo.id,
      sale_id: filters.name ?? "",
      page_length: current,
      page_size: pageSize,
    };

    // ✅ ส่ง start_date / end_date เฉพาะตอนเลือก month
    if (filters.month) {
      const { start_date, end_date } = buildDateRangeFromMonth(filters.month);
      requestData.start_date = start_date;
      requestData.end_date = end_date;
    }

    try {
      const response = await useServiceAPI.get(paths.pathMileageList, requestData);

      if (response.status === 200) {
        const result = Array.isArray(response.data) ? response.data : [];

        const newDataSource = result.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
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
            total:
              response?.total ||
              response?.data?.total ||
              response?.data?.pagination?.total ||
              response?.pagination?.total ||
              result.length,
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
      filters: prev.filters,
      sortOrder: sorter?.order === "descend" ? "desc" : "asc",
      sortField: sorter?.field,
    }));
  };

  const filters = useMemo(
    () => [
      {
        key: "name",
        type: "select",
        label: "Name",
        placeholder: "All",
        options: nameOptions,
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
        month: filtersValue.month || undefined, // ✅ ไม่ default เดือนปัจจุบัน
      },
    }));
  };

  const handleClear = () => {
    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: 1,
        pageSize: 10,
      },
      filters: {
        name: undefined,
        month: undefined, // ✅ clear แล้วว่าง
      },
    }));
  };

  return (
    <MainLayout loading={loading}>
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