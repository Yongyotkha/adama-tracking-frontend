import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import { InputNumber, Table, Form, Row, Col, Select, DatePicker } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import Title from "../../components/title/Title";
import ExportActivityTypeExcelButton from "../../components/export/ExportActivityTypeExcelButton";
import DynamicButton from "../../components/button/DynamicButton";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc); dayjs.extend(timezone);

export default function ReportActivityByType() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification, userInfo } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [years, setYears] = useState([]);
  const [sales, setSales] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [territoryList, setTerritoryList] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [defaultOption, setDefaultOption] = useState();

  const [formCustom] = Form.useForm();

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  const mapSalesOptions = (salesList) => (salesList || []).map((sale) => ({ value: String(sale.id), label: sale.name }));

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

      setYears(yearsRes.data || []);

      setAreaList((area.data || []).map(x => ({ value: String(x.id), label: x.name })));
      setActivityList(activityType.data || []);

      if ((yearsRes.data || []).length > 0) {
        const defaultYear = yearsRes.data[0];
        const initialFilters = { year_code: defaultYear };
        setTableParams((prev) => ({ ...prev, filters: initialFilters }));
        await fetchData(initialFilters);
      }
    } catch (error) {
      showNotification("error", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMasterData(); }, []);

  // set default area from user profile, then load sales for that area
  useEffect(() => {
    const fetchUserDetailAndSetArea = async () => {
      const areaOpts = areaList || [];
      if (!userInfo?.id || areaOpts.length === 0) return;
      try {
        const res = await useServiceAPI.get(`${paths.pathMasterUsersDetail}/${userInfo.id}`);
        if (res.status === 200 && res.data?.area_id) {
          const userAreaId = String(res.data.area_id);
          const isValidArea = areaOpts.some(a => a.value === userAreaId);
          if (isValidArea) {
            // set form area
            formCustom.setFieldsValue({ area_id: userAreaId });

            // load sales by area
            const salesRes = await useServiceAPI.get(paths.pathMasterSalesByArea, { area_id: userAreaId });
            if (salesRes.status === 200) {
              setSales(mapSalesOptions(salesRes.data));
            }

            // refresh data with this area
            await fetchData({ ...tableParams.filters });
          }
        }
      } catch {
        showNotification("error", "โหลดข้อมูลผู้ใช้ล้มเหลว");
      }
    };
    fetchUserDetailAndSetArea();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.id, areaList?.length]);

  const fetchData = async (filtersInput = tableParams.filters) => {
    setTableLoading(true);
    const { pageSize } = tableParams.pagination;
    const f = filtersInput || {};
    const v = formCustom.getFieldsValue();

    const requestData = {
      keyword: f.keyword || "",
      year_code: 2025, // ฝั่งเดิม fix 2025
      area_id: v.area_id ? Number(v.area_id) : null,
      user_id: v.user_id ? Number(v.user_id) : null,
      dealer_id: v.dealer_id || null,
      crop_id: v.crop_id || null,
      territory: v.territory ? Number(v.territory) : null,
      document_date: v.month || null,
      page_length: 1,
      page_size: pageSize,
    };

    try {
      const res = await useServiceAPI.get(paths.pathReportActivityType, requestData);
      if (res.status === 200) {
        const data = (res.data.res || []).map((item) => ({
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
    setTableParams((prev) => ({ ...prev, pagination }));
  };

  const handleSearch = async () => {
    await fetchData();
  };

  const handleClear = async () => {
    // เคลียร์เฉพาะฟิลด์ในฟอร์ม แล้วโหลดข้อมูลใหม่ (รักษา year_code เดิม)
    const defaultYear = years?.[0];
    formCustom.resetFields(["area_id", "user_id", "territory", "month", "dealer_id", "crop_id"]);
    setSales([]);
    setTerritoryList([]);
    setTableParams((prev) => ({
      ...prev,
      filters: { year_code: defaultYear ?? prev.filters?.year_code },
      pagination: { current: 1, pageSize: 10 },
    }));
    await fetchData({ year_code: defaultYear ?? tableParams.filters?.year_code });
  };

  // ===== Dependent selects via onValuesChange =====
  const onValuesChange = async (changed, all) => {
    // Area changed -> load sales of area
    if (Object.prototype.hasOwnProperty.call(changed, "area_id")) {
      const newAreaId = changed.area_id;
      setSales([]);
      setTerritoryList([]);
      formCustom.setFieldsValue({ user_id: undefined, territory: undefined });
      if (newAreaId) {
        try {
          const res = await useServiceAPI.get(paths.pathMasterSalesByArea, { area_id: newAreaId });
          if (res.status === 200) setSales(mapSalesOptions(res.data));
        } catch {
          showNotification("error", "โหลด Sales ไม่สำเร็จ");
        }
      }
    }

    // Sales changed -> load territory of user
    if (Object.prototype.hasOwnProperty.call(changed, "user_id")) {
      const newUserId = changed.user_id;
      setTerritoryList([]);
      formCustom.setFieldsValue({ territory: undefined });
      if (newUserId) {
        try {
          const res = await useServiceAPI.get(paths.pathMasterSalesByArea2, { user_id: newUserId });
          if (res.status === 200) {
            const options = (res.data.data || []).map(t => ({ value: t.id, label: t.name }));
            setTerritoryList(options);
          }
        } catch {
          showNotification("error", "โหลด Territory ไม่สำเร็จ");
        }
      }
    }
  };

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
        style: { backgroundColor: col.color, color: "white", fontWeight: "bold", textAlign: "center" },
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

  const toText = (v) => (v == null ? "" : (typeof v === "string" || typeof v === "number") ? String(v) : (v.name ?? v.label ?? v.value ?? v.code ?? ""));
  const buildFileName = () => {
    const f = tableParams?.filters || {};
    const v = formCustom.getFieldsValue();
    const ts = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD_HHmm");
    const yearText = toText(f.year_code) || dayjs().tz("Asia/Bangkok").format("YYYY");
    const areaLabel = (areaList.find((x) => x.value === String(v.area_id)) || {}).label;
    const salesLabel = (sales.find((x) => x.value === String(v.user_id)) || {}).label;
    const terrLabel = (territoryList.find((x) => x.value === String(v.territory)) || {}).label;
    const monthLabel = v.month ? dayjs(v.month).format("YYYY-MM") : "";
    return [
      `Activity_Report_By_Type_${yearText}`,
      areaLabel && `Area_${areaLabel}`,
      salesLabel && `Sales_${salesLabel}`,
      terrLabel && `Territory_${terrLabel}`,
      monthLabel && `Month_${monthLabel}`,
      ts,
    ].filter(Boolean).join("_").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "_");
  };

  return (
    <MainLayout loading={loading}>
      <Title prefix="Activity Report By Type" />

      {/* === Row/Col filter form inside BoxPrimary === */}
      <Form form={formCustom} layout="vertical" onValuesChange={onValuesChange}
        initialValues={{ area_id: undefined, user_id: undefined, territory: undefined, month: null }}>
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">
            <Col md={6}>
              <Form.Item label="Area" name="area_id">
                <Select placeholder="Select Area" options={areaList} allowClear />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item label="Sales" name="user_id">
                <Select placeholder="Select Sales" options={sales} allowClear />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item label="Territory" name="territory">
                <Select placeholder="Select Territory" options={territoryList} allowClear />
              </Form.Item>
            </Col>
            <Col md={6}>
              <Form.Item label="Month" name="month">
                <DatePicker picker="month" style={{ width: "100%" }} placeholder="Select month" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-4 px-4 pt-5">
            <DynamicButton
              onClick={handleSearch}
              name="btn-search"
              text="Search"
              iconSrc="/img/icons/search.png"
              className="text-white px-4 py-3 rounded-[4px] bg-[#7DB41E]"
            />
            <DynamicButton
              onClick={handleClear}
              name="btn-clear"
              text="Clear"
              iconSrc="/img/icons/trash.png"
              className="text-white px-4 py-3 rounded-[4px] bg-[#B6AEAB]"
            />
            <ExportActivityTypeExcelButton
              text="Export Excel"
              fileName={buildFileName()}
              getPayload={async () => {
                const f = tableParams?.filters || {};
                const v = formCustom.getFieldsValue();
                return {
                  keyword: f.keyword || "",
                  year_code: toText(f.year_code) || undefined,
                  area_id: v.area_id || null,
                  user_id: v.user_id || null,
                  dealer_id: v.dealer_id || null,
                  crop_id: v.crop_id || null,
                  territory: v.territory || null,
                  document_date: v.month || null,
                };
              }}
              requestData={(payload) => useServiceAPI.get(paths.pathReportActivityType, payload)}
            />
          </div>
        </BoxPrimary>
      </Form>

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
