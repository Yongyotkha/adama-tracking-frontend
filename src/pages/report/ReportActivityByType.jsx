import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import { InputNumber, Table, Form, Row, Col, Select } from "antd";
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

dayjs.extend(utc);
dayjs.extend(timezone);

export default function ReportActivityByType() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useContext(AuthContext);

  const [formCustom] = Form.useForm();
  const selectedArea = Form.useWatch("area_id", formCustom);
  const selectedSale = Form.useWatch("user_id", formCustom);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [years, setYears] = useState([]);
  const [defaultYear, setDefaultYear] = useState(null);

  const [sales, setSales] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [territoryList, setTerritoryList] = useState([]);
  const [dataSource, setDataSource] = useState([]);

  const [tableTotals, setTableTotals] = useState({
    total_activity_plan: 0,
    total_activity_list: 0,
    total_activity_actual: 0,
  });

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  const mapSalesOptions = (salesList) =>
    (salesList || []).map((sale) => ({
      value: String(sale.user_id ?? sale.id),
      label: sale.user_name ?? sale.name,
    }));

  const mapApiToRows = (apiRes) =>
    (apiRes?.data?.res || []).map((item) => ({
      key: item.activity_type_id,
      activity_type_name: item.activity_type_name,
      unit_convert_value: parseFloat(item.unit_convert_value) || 0,
      total_activity_plan: Number(item.total_activity_plan) || 0,
      total_activity_list: Number(item.total_activity_list) || 0,
      total_activity_actual: Number(item.total_activity_actual) || 0,
    }));

  const calcTotals = (rows) => {
    return rows.reduce(
      (acc, r) => {
        const price = Number(r.unit_convert_value) || 0;
        const planQty = Number(r.total_activity_plan) || 0;
        const listQty = Number(r.total_activity_list) || 0;
        const actualQty = Number(r.total_activity_actual) || 0;

        return {
          total_activity_plan: acc.total_activity_plan + planQty * price,
          total_activity_list: acc.total_activity_list + listQty * price,
          total_activity_actual: acc.total_activity_actual + actualQty * price,
        };
      },
      {
        total_activity_plan: 0,
        total_activity_list: 0,
        total_activity_actual: 0,
      }
    );
  };

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [yearsRes, area] = await Promise.all([
        useServiceAPI.get(paths.pathMasterYear),
        useServiceAPI.get(paths.pathMasterAreas),
      ]);

      const yearRaw = Array.isArray(yearsRes?.data) ? yearsRes.data : [];
      const yearOptions = yearRaw.map((y) => ({ value: y.id, label: y.name }));
      setYears(yearOptions);

      let initialYearValue = null;
      if (yearOptions.length > 0) {
        const currentYear = dayjs().year();
        const matched =
          yearOptions.find((y) => Number(y.value) === currentYear) ||
          yearOptions[0];
        initialYearValue = matched.value;
        setDefaultYear(matched.value);
      }

      const areaOpts = (area.data || []).map((x) => ({
        value: String(x.id),
        label: x.name,
      }));
      setAreaList(areaOpts);

      formCustom.setFieldsValue({
        area_id: undefined,
        user_id: undefined,
        territory: undefined,
        month: undefined,
        year_code: initialYearValue,
      });

      if (initialYearValue != null) {
        const initialFilters = { year_code: initialYearValue };
        setTableParams((prev) => ({ ...prev, filters: initialFilters }));
        await fetchData(initialFilters);
      }
    } catch (error) {
      console.error(error);
      showNotification?.("error", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSalesByArea = async (area_id) => {
    if (!area_id) {
      setSales([]);
      return [];
    }

    try {
      const res = await useServiceAPI.get(paths.pathMasterUserByArea, {
        area_id,
      });

      if (res?.status === 200) {
        const raw = res?.data?.data ?? res?.data ?? [];
        const opts = mapSalesOptions(raw);
        setSales(opts);
        return opts;
      }

      setSales([]);
      return [];
    } catch {
      setSales([]);
      showNotification?.("error", "โหลด Sales ไม่สำเร็จ");
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      if (!selectedArea) {
        setSales([]);
        setTerritoryList([]);
        formCustom.setFieldsValue({ user_id: undefined, territory: undefined });
        return;
      }

      setTerritoryList([]);
      formCustom.setFieldsValue({ user_id: undefined, territory: undefined });
      await loadSalesByArea(selectedArea);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea]);

  useEffect(() => {
    (async () => {
      if (!selectedSale) {
        setTerritoryList([]);
        formCustom.setFieldsValue({ territory: undefined });
        return;
      }

      try {
        const res = await useServiceAPI.get(paths.pathMasterSalesByArea2, {
          user_id: selectedSale,
        });

        if (res?.status === 200) {
          const options = (res.data?.data || []).map((t) => ({
            value: String(t.id),
            label: t.name,
          }));
          setTerritoryList(options);
        } else {
          setTerritoryList([]);
        }
      } catch {
        setTerritoryList([]);
        showNotification?.("error", "โหลด Territory ไม่สำเร็จ");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSale]);

  const fetchData = async (filtersInput = tableParams.filters) => {
    setTableLoading(true);
    const f = filtersInput || {};
    const v = formCustom.getFieldsValue();

    const yearFromForm = v.year_code || f.year_code || defaultYear;
    let documentDate = null;

    if (v.month && yearFromForm) {
      documentDate = `${yearFromForm}-${v.month}-01`;
    }

    const requestData = {
      keyword: f.keyword || "",
      year_code: yearFromForm || null,
      user_id: v.user_id ? Number(v.user_id) : null,
      dealer_id: v.dealer_id || null,
      crop_id: v.crop_id || null,
      territory: v.territory ? Number(v.territory) : null,
      document_date: documentDate,
      page_length: 1,
      page_size: 100,
      ...(v.area_id ? { area_id: Number(v.area_id) } : {}),
    };

    try {
      const res = await useServiceAPI.get(paths.pathReportActivityType, requestData);
      const rows = mapApiToRows(res);
      setDataSource(rows);
      setTableTotals(calcTotals(rows));
    } catch (err) {
      console.error(err);
      setDataSource([]);
      setTableTotals({
        total_activity_plan: 0,
        total_activity_list: 0,
        total_activity_actual: 0,
      });
    } finally {
      setTableLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setTableParams((prev) => ({ ...prev, pagination }));
  };

  const handleSearch = async () => {
    await fetchData(tableParams.filters);
  };

  const handleClear = async () => {
    const defaultYearValue = defaultYear ?? years?.[0]?.value ?? null;

    formCustom.setFieldsValue({
      area_id: undefined,
      user_id: undefined,
      territory: undefined,
      month: undefined,
      year_code: defaultYearValue,
    });

    setSales([]);
    setTerritoryList([]);

    setTableParams((prev) => ({
      ...prev,
      filters: { year_code: defaultYearValue ?? prev.filters?.year_code },
      pagination: { current: 1, pageSize: 10 },
    }));

    await fetchData({ year_code: defaultYearValue ?? tableParams.filters?.year_code });
  };

  const onValuesChange = async (changed) => {
    if (Object.prototype.hasOwnProperty.call(changed, "area_id")) {
      const newAreaId = changed.area_id;

      setSales([]);
      setTerritoryList([]);
      formCustom.setFieldsValue({ user_id: undefined, territory: undefined });

      if (newAreaId) {
        await loadSalesByArea(newAreaId);
      }
    }

    if (Object.prototype.hasOwnProperty.call(changed, "user_id")) {
      setTerritoryList([]);
      formCustom.setFieldsValue({ territory: undefined });
    }

    if (Object.prototype.hasOwnProperty.call(changed, "year_code")) {
      const newYear = changed.year_code;
      setTableParams((prev) => ({
        ...prev,
        filters: { ...prev.filters, year_code: newYear },
      }));
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
          formatter={(val) =>
            `${parseInt(val || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      ),
    })),
  ];

  const footerSummary = () => (
    <Table.Summary fixed>
      <Table.Summary.Row className="bg-[#978B87]">
        <Table.Summary.Cell>
          <b>Total (THB)</b>
        </Table.Summary.Cell>
        {["total_activity_plan", "total_activity_list", "total_activity_actual"].map((key) => (
          <Table.Summary.Cell key={key} align="right">
            <InputNumber
              className="w-full"
              disabled
              value={tableTotals[key] || 0}
              formatter={(val) =>
                `${parseInt(val || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              style={{ backgroundColor: "white" }}
            />
          </Table.Summary.Cell>
        ))}
      </Table.Summary.Row>
    </Table.Summary>
  );

  const toText = (v) =>
    v == null
      ? ""
      : typeof v === "string" || typeof v === "number"
      ? String(v)
      : v.name ?? v.label ?? v.value ?? v.code ?? "";

  const buildFileName = () => {
    const f = tableParams?.filters || {};
    const v = formCustom.getFieldsValue();
    const ts = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD_HHmm");

    const yearText =
      toText(v.year_code) ||
      toText(f.year_code) ||
      dayjs().tz("Asia/Bangkok").format("YYYY");

    const areaLabel = (areaList.find((x) => x.value === String(v.area_id)) || {}).label;
    const salesLabel = (sales.find((x) => x.value === String(v.user_id)) || {}).label;
    const terrLabel = (territoryList.find((x) => x.value === String(v.territory)) || {}).label;

    const monthText = v.month ? String(v.month).padStart(2, "0") : "";
    const monthLabel = yearText && monthText ? `${yearText}-${monthText}` : "";

    return [
      `Activity_Report_By_Type_${yearText}`,
      areaLabel && `Area_${areaLabel}`,
      salesLabel && `Sales_${salesLabel}`,
      terrLabel && `Territory_${terrLabel}`,
      monthLabel && `Month_${monthLabel}`,
      ts,
    ]
      .filter(Boolean)
      .join("_")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "_");
  };

  const monthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  return (
    <MainLayout loading={loading}>
      <Title prefix="Activity Report By Type" />

      <Form
        form={formCustom}
        layout="vertical"
        onValuesChange={onValuesChange}
        initialValues={{
          area_id: undefined,
          user_id: undefined,
          territory: undefined,
          month: undefined,
          year_code: undefined,
        }}
      >
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">
            <Col md={6}>
              <Form.Item label="Area" name="area_id">
                <Select placeholder="Select Area" options={areaList} allowClear />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item label="Sales" name="user_id">
                <Select
                  placeholder="Select Sales"
                  options={sales}
                  allowClear
                  disabled={!selectedArea}
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item label="Territory" name="territory">
                <Select
                  placeholder="Select Territory"
                  options={territoryList}
                  allowClear
                  disabled={!selectedSale}
                />
              </Form.Item>
            </Col>

            <Col md={3}>
              <Form.Item label="Month" name="month">
                <Select placeholder="Select month" options={monthOptions} allowClear />
              </Form.Item>
            </Col>

            <Col md={3}>
              <Form.Item label="Year" name="year_code">
                <Select placeholder="Select year" options={years} allowClear={false} />
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
              rows={dataSource}
              totals={tableTotals}
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