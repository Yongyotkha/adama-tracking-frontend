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
  const [territoryList, setTerritoryList] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [defaultOption, setDefaultOption] = useState();
  const [salesDisabled, setSalesDisabled] = useState(true);

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  const mapSalesOptions = (salesList) => (salesList || []).map((sale) => ({ id: sale.id, name: sale.name }));

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
        const defaultYear = yearsRes.data[0];
        const initialFilters = { year_code: defaultYear };

        setTableParams((prev) => ({
          ...prev,
          filters: initialFilters,
        }));

        fetchData(initialFilters);
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

  const fetchData = async (filtersInput = tableParams.filters) => {
    setTableLoading(true);
    const { pageSize } = tableParams.pagination;
    const filters = filtersInput || {};

    const requestData = {
      keyword: filters.keyword || "",
      year_code: 2025,
      area_id: filters.area_id,
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
    fetchData(filters);
  };

  const handleClear = () => {
    setTableParams((prev) => ({
      ...prev,
      filters: {},
    }));
    setSales([]);
    setSalesDisabled(true);
    setDataSource([]);
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
      placeholder: "All",
      options: sales,
    },
    {
      key: "territory",
      type: "select",
      label: "Territory",
      options: territoryList,
    },
    {
      key: "month",
      type: "month",
      label: "Month",
      placeholder: "Select month",
    },
  ];

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

    const newUserId = newFilters.user_id;
    const oldUserId = tableParams.filters?.user_id;
    const isUserChanged = newUserId !== oldUserId;

    // === Area Changed: โหลด Sales ใหม่ ===
    if (isAreaChanged && newAreaId) {
      setSales([]);
      setSalesDisabled(true);

      try {
        const res = await useServiceAPI.get(paths.pathMasterSalesByArea, { area_id: newAreaId });
        if (res.status === 200) {
          const salesOptions = mapSalesOptions(res.data);
          setSales(salesOptions);
          setSalesDisabled(false);
        }
      } catch {
        showNotification("error", "โหลด Sales ไม่สำเร็จ");
        setSalesDisabled(true);
      }
    }

    // === Clear Sales เมื่อ Area ว่าง ===
    if (!newAreaId) {
      setSales([]);
      setSalesDisabled(true);
    }

    // === User Changed: โหลด Territory จาก Sales ===
    if (isUserChanged && newUserId) {
      try {
        const res = await useServiceAPI.get(paths.pathMasterSalesByArea2, { user_id: newUserId });
        if (res.status === 200) {
          const territoryOptions = (res.data.data || []).map((t) => ({
            id: t.id,
            name: t.name,
          }));
          setTerritoryList(territoryOptions);
        }
      } catch {
        showNotification("error", "โหลด Territory ไม่สำเร็จ");
        setTerritoryList([]);
      }
    }

    // === Clear Territory เมื่อ user_id ว่าง ===
    if (!newUserId) {
      setTerritoryList([]);
    }
  };


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
