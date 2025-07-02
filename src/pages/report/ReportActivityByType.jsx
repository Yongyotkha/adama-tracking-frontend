import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Filter from "../../components/filter/Filter";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import { InputNumber, Table } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import Title from "../../components/title/Title";


export default function ReportActivityByType() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [years, setYears] = useState([]);
  const [sales, setSales] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [activityList, setActivityList] = useState([]);

  const [dataSource, setDataSource] = useState([]);
  const [defaultOption, setDefaultOption] = useState();
  const [salesDisabled, setSalesDisabled] = useState(true);

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  // 🎯 Helper: แปลง sale list เป็น select options
  const mapSalesOptions = (salesList) =>
    (salesList || []).map((sale) => ({
      id: sale.id,
      name: sale.name,
    }));

  // 🎯 Load Master Data
  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [yearsRes, crops, products, dealers, activityType, area] = await Promise.all([
        useServiceAPI.get(paths.pathMasterYear),
        useServiceAPI.get(paths.pathMasterCrop),
        useServiceAPI.get(paths.pathMasterProducts),
        useServiceAPI.get(paths.pathMasterDealerAll),
        useServiceAPI.get(paths.pathMasterActivityType),
        useServiceAPI.get(paths.pathMasterAreas),
      ]);

      setYears(yearsRes.data);
      setAreaList(area.data);
      setActivityList(activityType.data);

      if (yearsRes.data.length > 0) {
        setTableParams((prev) => ({
          ...prev,
          filters: { ...prev.filters, year_code: yearsRes.data[0] },
        }));
      }
    } catch (error) {
      showNotification("error", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  // 🎯 เมื่อเลือก Area → โหลด Sales ใหม่
  // useEffect(() => {
  //   const areaId = tableParams.filters?.area_id;

  //   if (areaId) {
  //     setSales([]);
  //     setSalesDisabled(true);

  //     // reset sales/territory เมื่อเปลี่ยน area
  //     setTableParams((prev) => ({
  //       ...prev,
  //       filters: {
  //         ...prev.filters,
  //         user_id: undefined,
  //         territory: undefined,
  //       },
  //     }));

  //     useServiceAPI
  //       .get(paths.pathMasterSalesByArea, { area_id: areaId })
  //       .then((res) => {
  //         if (res.status === 200) {
  //           setSales(mapSalesOptions(res.data));
  //           setSalesDisabled(false);
  //         }
  //       })
  //       .catch(() => {
  //         showNotification("error", "โหลด Sales ไม่สำเร็จ");
  //         setSalesDisabled(true);
  //       });
  //   } else {
  //     setSales([]);
  //     setSalesDisabled(true);
  //   }
  // }, [tableParams.filters?.area_id]);

  // 🎯 Load Table Data
  const fetchData = async () => {
    setTableLoading(true);
    const { pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      keyword: filters.keyword || "",
      year_code: filters.year_code,
      user_id: filters.user_id,
      dealer_id: filters.dealer_id,
      crop_id: filters.crop_id,
      territory: filters.territory,
      document_date: filters.month,
      page_length: 1,
      page_size: pageSize,
    };

    try {
      const res = await useServiceAPI.get(paths.pathReportActivityType, requestData);
      if (res.status === 200) {
        const data = res.data.map((item) => ({
          key: item.activity_type_id,
          activity_type_name: item.activity_type_name,
          total_activity_plan: parseFloat(item.total_activity_plan),
          total_activity_list: parseInt(item.total_activity_list),
          total_activity_actual: parseInt(item.total_activity_actual),
        }));
        setDataSource(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (years.length > 0) fetchData();
  }, [JSON.stringify(tableParams.filters)]);

  // 🎯 Table & Filter Handlers
  const handleTableChange = (pagination) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
    }));
  };

  const handleSearch = (filters) => {
    setTableParams({
      pagination: { current: 1, pageSize: 10 },
      filters,
    });
  };

  const handleClear = () => {
    setTableParams((prev) => ({
      ...prev,
      filters: {},
    }));
  };

  useEffect(() => {
    if (defaultOption !== undefined) {
      setTableParams((prev) => ({
        ...prev,
        filters: {
          ...prev.filters,
          permission_id: defaultOption,
        },
      }));
    }
  }, [defaultOption]);

  // 🎯 Filter Config
  const filters = [
    {
      key: "area_id",
      type: "select",
      label: "Area",
      options: areaList,
    },
    {
      key: "user_id",
      type: "select",
      label: "Sales",
      placeholder: "All",     // ✅ เพิ่ม placeholder ชัดเจน
      options: sales,
      disabled: salesDisabled,
    },
    {
      key: "territory",
      type: "select",
      label: "Territory",
      options: [
        { label: "North", name: "north" },
        { label: "South", name: "south" },
        { label: "Central", name: "central" },
      ],
      disabled: !tableParams.filters?.user_id,
    },
    {
      key: "month",
      type: "month",
      label: "Month",
      placeholder: "Select month",
    },
  ];

  // 🎯 Table Header
  const header = [
    {
      title: "Activity Type",
      dataIndex: "activity_type_name",
      align: "left",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
    },
    ...[
      { title: "Activity Plan", dataIndex: "total_activity_plan", color: "#009845" },
      { title: "Activity List", dataIndex: "total_activity_list", color: "#7DB41E" },
      { title: "Activity Actual", dataIndex: "total_activity_actual", color: "#93CC23" },
    ].map((col) => ({
      ...col,
      align: "right",
      onHeaderCell: () => ({
        style: {
          backgroundColor: col.color,
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      render: (value) => (
        <InputNumber
          className="w-full"
          disabled
          value={value}
          formatter={(val) => `${parseInt(val)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        />
      ),
    })),
  ];

  const handleFilterChange = async (newFilters) => {
    const newAreaId = newFilters.area_id;
    const oldAreaId = tableParams.filters?.area_id;

    const isAreaChanged = newAreaId !== oldAreaId;

    setTableParams((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters,
        user_id: isAreaChanged ? undefined : prev.filters.user_id,
        territory: isAreaChanged ? undefined : prev.filters.territory,
      },
    }));

    if (isAreaChanged && newAreaId) {
      setSales([]);
      setSalesDisabled(true);

      try {
        const res = await useServiceAPI.get(paths.pathMasterSalesByArea, { area_id: newAreaId });
        if (res.status === 200) {
          setSales(mapSalesOptions(res.data));
          setSalesDisabled(false);
        }
      } catch {
        showNotification("error", "โหลด Sales ไม่สำเร็จ");
        setSalesDisabled(true);
      }
    }

    // ✅ ถ้า area ถูกเคลียร์ (เลือกเป็น null/undefined/empty)
    if (!newAreaId) {
      setSales([]);
      setSalesDisabled(true);

      setTableParams((prev) => ({
        ...prev,
        filters: {
          ...prev.filters,
          user_id: undefined,       // clear ค่า user_id
          territory: undefined,
        },
      }));
    }
  };


  // 🎯 Table Footer Summary
  const footerSummary = () => {
    const total = (key) => dataSource.reduce((sum, row) => sum + (parseFloat(row[key]) || 0), 0);
    return (
      <Table.Summary fixed>
        <Table.Summary.Row className="bg-[#978B87]">
          <Table.Summary.Cell><b>Total</b></Table.Summary.Cell>
          {["total_activity_plan", "total_activity_list", "total_activity_actual"].map((key) => (
            <Table.Summary.Cell key={key} align="right">
              <InputNumber
                className="w-full"
                disabled
                value={total(key)}
                formatter={(val) => `${parseInt(val)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                style={{ backgroundColor: "white" }}
              />
            </Table.Summary.Cell>
          ))}
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  return (
    <MainLayout loading={loading}>
      <Title prefix="Activity Report By Type" />
      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} onChange={handleFilterChange} />
      <BoxPrimary>
        <TableCustomComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          onChange={handleTableChange}
          scrollY={false}
          pagination={false}
          footer={footerSummary}
        />
      </BoxPrimary>
    </MainLayout>
  );
}

