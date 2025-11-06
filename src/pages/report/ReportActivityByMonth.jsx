import React, { useContext, useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import { InputNumber, Table, Form, Row, Col, Select } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import Title from "../../components/title/Title";
import ExportActivityByMonthExcelButton from "../../components/export/ExportActivityByMonthExcelButton";
import DynamicButton from "../../components/button/DynamicButton";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc); dayjs.extend(timezone);

export default function ReportActivityByMonth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [sales, setSales] = useState([]);
  const [itemColumn, setItemColumn] = useState([]);
  const [permission, setPermission] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const { showNotification } = useContext(AuthContext);
  const [areaList, setAreaList] = useState([]);
  const [formCustom] = Form.useForm();

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10 },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  // ===== Master =====
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [yearsRes, salesRes, areaRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear),
          useServiceAPI.get(paths.pathMasterSaleDropdown),
          useServiceAPI.get(paths.pathMasterAreas),
        ]);

        setYears(yearsRes.data || []);
        setSales((salesRes.data || []).map(s => ({ value: s.id, label: s.name })));
        setAreaList((areaRes.data || []).map(a => ({ value: a.id, label: a.name })));

        if ((yearsRes.data || []).length > 0) {
          setTableParams(prev => ({ ...prev, filters: { year_code: yearsRes.data[0] } }));
        }
      } catch (error) {
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    getMaster();
  }, []);

  // ===== Fetch =====
  const fetchData = async (overrideFilters) => {
    setTableLoading(true);
    try {
      const { pageSize } = tableParams.pagination;
      // current filters = tableParams.filters + form values
      const formVals = await formCustom.validateFields().catch(() => ({}));
      const f = overrideFilters ?? tableParams.filters ?? {};

      const requestData = {
        keyword: f.keyword || "",
        year_code: f.year_code,
        user_id: formVals.user_id || null,
        dealer_id: formVals.dealer_id || null,
        crop_id: formVals.crop_id || null,
        area_id: formVals.area_id || null,
        page_length: 1,
        page_size: pageSize,
      };

      const response = await useServiceAPI.get(paths.pathReportActivityByMonth, requestData);
      if (response.status === 200) {
        const { item, records_filtered, permission, total } = response.data || {};
        const newDataSource = (item || []).map((row, index) => ({
          key: index + 1,
          month_name: row.month_name,
          month_id: row.month_id,
          item: row.item,
        }));
        setPermission(permission || []);
        setDataSource(newDataSource);
        setItemColumn(total || []);
        setTableParams(prev => ({
          ...prev,
          pagination: { ...prev.pagination, total: records_filtered || newDataSource.length },
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (years.length > 0) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tableParams.filters)]);

  const handleSearch = async () => {
    await fetchData();
  };

  const handleClear = async () => {
    // reset only form fields (area / sales / etc.)
    formCustom.resetFields(["area_id", "user_id", "dealer_id", "crop_id"]);
    // keep default year (if any)
    const defaultYear = years?.[0];
    setTableParams(prev => ({
      ...prev,
      filters: { year_code: defaultYear },
      pagination: { current: 1, pageSize: 10 },
    }));
    await fetchData({ year_code: defaultYear });
  };

  const handleTableChange = (pagination) => {
    setTableParams(prev => ({ ...prev, pagination }));
  };

  const columnColors = ["#009845", "#7DB41E", "#93CC23"];

  const header = [
    {
      title: "Month",
      dataIndex: "month_name",
      key: "month_name",
      fixed: "left",
      width: 125,
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
    },
    ...itemColumn.map((act, index) => {
      const bgColor = columnColors[index % columnColors.length];
      const activityId = act.activity_type_id;
      return {
        title: act.activity_type_name,
        key: `activity_${activityId}`,
        width: 125,
        onHeaderCell: () => ({
          style: { backgroundColor: bgColor, color: "white", fontWeight: "bold", textAlign: "center" },
        }),
        render: (_, record) => {
          const activityItem = (record.item || []).find(x => x.activity_type_id === activityId);
          const set_value = activityItem ? parseInt(activityItem.total) : 0;
          return (
            <InputNumber
              className="w-full"
              min={0}
              value={set_value}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              disabled
            />
          );
        },
      };
    }),
  ];

  // ===== helpers for Export =====
  const toText = (v) => (v == null ? "" : (typeof v === "string" || typeof v === "number") ? String(v) : (v.name ?? v.label ?? v.value ?? v.code ?? ""));
  const buildFileName = () => {
    const f = tableParams?.filters || {};
    const formVals = formCustom.getFieldsValue();
    const ts = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD_HHmm");
    const yearText = toText(f.year_code) || dayjs().tz("Asia/Bangkok").format("YYYY");
    const areaLabel = (areaList.find((x) => x.value === formVals.area_id) || {}).label;
    const salesLabel = (sales.find((x) => x.value === formVals.user_id) || {}).label;
    return [
      `Activity_Report_By_Month_${yearText}`,
      areaLabel && `Area_${areaLabel}`,
      salesLabel && `Sales_${salesLabel}`,
      ts,
    ].filter(Boolean).join("_").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "_");
  };

  const footerTotals = useMemo(() => {
    // สร้าง map: activity_type_id -> sum
    const sums = {};
    (itemColumn || []).forEach((act) => {

      console.log('act : ', act)
      const price = Number(act?.unit_convert_value) || 0;
      const sum = (dataSource || []).reduce((acc, row) => {
        const it = (row?.item || []).find(
          (x) => x?.activity_type_id === act?.activity_type_id
        );
        const qty = Number(it?.total) || 0; // ใช้ Number ปลอดภัยกับเลขทศนิยม/สตริง
        return acc + qty * price;
      }, 0);
      sums[act.activity_type_id] = sum;
    });
    return sums;
  }, [itemColumn, dataSource]);

  return (
    <MainLayout loading={loading}>
      <Title prefix="Activity Expenses Report" />

      {/* === Row/Col filter form inside BoxPrimary === */}
      <Form form={formCustom} layout="vertical">
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
            <ExportActivityByMonthExcelButton
              text="Export Excel"
              fileName={buildFileName()}
              getPayload={async () => {
                const f = tableParams?.filters || {};
                const v = formCustom.getFieldsValue();
                return {
                  keyword: f.keyword || "",
                  year_code: toText(f.year_code) || undefined,
                  user_id: v.user_id || null,
                  dealer_id: v.dealer_id || null,
                  crop_id: v.crop_id || null,
                  area_id: v.area_id || null,
                };
              }}
              requestData={(payload) => useServiceAPI.get(paths.pathReportActivityByMonth, payload)}
            />
          </div>
        </BoxPrimary>
      </Form>

      <BoxPrimary>
        <TableCustomComponent
          header={header}
          dataSource={dataSource}
          pagination={false}
          loading={tableLoading}
          onChange={handleTableChange}
          scrollY={false}
          footer={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-[#978B87]">
                <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                {itemColumn.map((act) => (
                  <Table.Summary.Cell
                    key={`sum_${act.activity_type_id}`}
                    align="center"
                  >
                    <InputNumber
                      className="w-full"
                      disabled
                      value={footerTotals[act.activity_type_id] || 0}
                      formatter={(value) =>
                        `${Math.trunc(Number(value) || 0)}`.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )
                      }
                      style={{ backgroundColor: "white" }}
                    />
                  </Table.Summary.Cell>
                ))}
              </Table.Summary.Row>
            </Table.Summary>
          )}

        />
      </BoxPrimary>
    </MainLayout>
  );
}
