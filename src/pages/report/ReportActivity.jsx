import { useContext, useEffect, useState } from "react";
import { Form, Row, Col, Select, InputNumber, Table } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import Title from "../../components/title/Title";
import DynamicButton from "../../components/button/DynamicButton";
import ExportActivityExcelButton from "../../components/export/ExportActivityExcelButton";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";

dayjs.extend(utc);
dayjs.extend(timezone);

const toNumber = (value) => {
  if (value == null || value === "") return 0;
  const number = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(number) ? number : 0;
};

const mapPlanActualGroups = (apiRes, info) => {
  const payload = apiRes?.data || {};
  const types = [...(payload.activity_types || [])].sort(
    (a, b) => (Number(a.order_by) || 0) - (Number(b.order_by) || 0)
  );
  const groups = [];

  (payload.heads || []).forEach((head) => {
    (head.areas || []).forEach((area) => {
      (area.sales || []).forEach((sale) => {
        const byType = new Map(
          (sale.activities || []).map((item) => [String(item.activity_type_id), item])
        );
        groups.push({
          saleName: sale.sale_name || "",
          areaName: area.area_name || area.sale_area_name || "",
          headName: head.head_sale_name || "",
          info,
          rows: types.map((type) => {
            const hit = byType.get(String(type.id));
            return {
              key: type.id,
              activity_type_name: type.activity_type_name,
              icon: type.activity_image || "",
              plan_qty: toNumber(hit?.plan_count),
              plan_thb: toNumber(hit?.plan_value),
              actual_qty: toNumber(hit?.actual_count),
              actual_thb: toNumber(hit?.actual_value),
            };
          }),
        });
      });
    });
  });

  return groups;
};

const sumRows = (rows) =>
  rows.reduce(
    (acc, row) => ({
      plan_qty: acc.plan_qty + toNumber(row.plan_qty),
      plan_thb: acc.plan_thb + toNumber(row.plan_thb),
      actual_qty: acc.actual_qty + toNumber(row.actual_qty),
      actual_thb: acc.actual_thb + toNumber(row.actual_thb),
    }),
    { plan_qty: 0, plan_thb: 0, actual_qty: 0, actual_thb: 0 }
  );

const headerCell = (color) => () => ({
  style: {
    backgroundColor: color,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

const numberFormat = (digits) => (value) =>
  toNumber(value).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const METRICS = [
  { key: "plan_qty", title: "Plan (ครั้ง)", color: "#009845", digits: 0 },
  { key: "plan_thb", title: "Plan (THB)", color: "#00783F", digits: 2 },
  { key: "actual_qty", title: "Actual (ครั้ง)", color: "#7DB41E", digits: 0 },
  { key: "actual_thb", title: "Actual (THB)", color: "#93CC23", digits: 2 },
];

const pivotRows = (groups) => {
  const names = [];
  groups.forEach((group) => {
    (group.rows || []).forEach((row) => {
      const name = row.activity_type_name || "";
      if (name && !names.includes(name)) names.push(name);
    });
  });

  return names.map((name) => {
    const record = { key: name, activity_type_name: name, icon: "" };
    groups.forEach((group, index) => {
      const found = (group.rows || []).find((row) => row.activity_type_name === name);
      if (found?.icon) record.icon = found.icon;
      METRICS.forEach((metric) => {
        record[`g${index}_${metric.key}`] = toNumber(found?.[metric.key]);
      });
    });
    return record;
  });
};

export default function ReportActivity() {
  const { showNotification } = useContext(AuthContext);
  const [form] = Form.useForm();
  const selectedArea = Form.useWatch("area_id", form);
  const selectedSale = Form.useWatch("user_id", form);
  const selectedDealer = Form.useWatch("dealer_id", form);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [defaultYear, setDefaultYear] = useState(null);
  const [areas, setAreas] = useState([]);
  const [sales, setSales] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [subDealers, setSubDealers] = useState([]);
  const [rows, setRows] = useState([]);
  const [groups, setGroups] = useState([]);

  const buildRequest = (values) => {
    const yearName = labelOf(years, values.year_code) || values.year_code || defaultYear || "";
    return {
      year_code: String(yearName),
      month: values.month ? String(values.month) : "",
      area_id: values.area_id ? String(values.area_id) : "",
      user_id: values.user_id ? String(values.user_id) : "",
      dealer_id: values.dealer_id ? String(values.dealer_id) : "",
      sub_dealer_id: values.sub_dealer_id ? String(values.sub_dealer_id) : "",
    };
  };

  const loadSalesByArea = async (areaId) => {
    if (!areaId) {
      setSales([]);
      return [];
    }
    try {
      const response = await useServiceAPI.get(paths.pathMasterUserByArea, {
        area_id: areaId,
      });
      const raw = response?.data?.data ?? response?.data ?? [];
      const options = (Array.isArray(raw) ? raw : []).map((item) => ({
        value: String(item.user_id ?? item.id),
        label: item.user_name ?? item.name,
        headName:
          item.sale_head_name ||
          item.head_of_sale_name ||
          item.header_user_name ||
          item.head_name ||
          "",
      }));
      setSales(options);
      return options;
    } catch (error) {
      console.error(error);
      setSales([]);
      showNotification?.("error", "โหลด Sales ไม่สำเร็จ");
      return [];
    }
  };

  const loadDealersBySale = async (userId) => {
    if (!userId) {
      setDealers([]);
      return;
    }
    try {
      const response = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
        user_id: userId,
      });
      const raw = response?.data?.data ?? response?.data ?? [];
      setDealers(
        (Array.isArray(raw) ? raw : []).map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    } catch (error) {
      console.error(error);
      setDealers([]);
      showNotification?.("error", "โหลด Dealer ไม่สำเร็จ");
    }
  };

  const loadSubDealers = async (userId, dealerId) => {
    if (!userId || !dealerId) {
      setSubDealers([]);
      return;
    }
    try {
      const response = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
        user_id: userId,
        dealer_id: dealerId,
      });
      const raw = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setSubDealers(
        raw.map((item) => ({
          value: item.sub_dealer_id,
          label: item.sub_dealer_name,
        }))
      );
    } catch (error) {
      console.error(error);
      setSubDealers([]);
      showNotification?.("error", "โหลด Sub Dealer ไม่สำเร็จ");
    }
  };

  const applyGroups = (nextGroups) => {
    setGroups(nextGroups);
    setRows(pivotRows(nextGroups));
  };

  const search = async (values) => {
    setTableLoading(true);
    try {
      const response = await useServiceAPI.get(
        paths.pathReportActivityPlanActual,
        buildRequest(values || {})
      );
      const info = {
        areaName: labelOf(areas, values.area_id) || "All",
        saleName: labelOf(sales, values.user_id) || "All",
        dealerName: labelOf(dealers, values.dealer_id) || "All",
        subDealerName: labelOf(subDealers, values.sub_dealer_id) || "All",
        headName: "All",
        yearName: labelOf(years, values.year_code) || String(values.year_code || ""),
        monthName: labelOf(months, values.month) || "All",
      };
      applyGroups(mapPlanActualGroups(response, info));
    } catch (error) {
      console.error(error);
      applyGroups([]);
      showNotification?.("error", error?.message || "โหลดรายงานไม่สำเร็จ");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    const loadMaster = async () => {
      setLoading(true);
      try {
        const [yearRes, monthRes, areaRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear),
          useServiceAPI.get(paths.pathMasterMonths),
          useServiceAPI.get(paths.pathMasterAreas),
        ]);
        const yearOptions = (Array.isArray(yearRes?.data) ? yearRes.data : []).map((year) => {
          const name = String(year.name ?? year.year_code ?? year.id ?? "");
          return { value: name, label: name };
        });
        setYears(yearOptions);
        setMonths(
          (Array.isArray(monthRes?.data) ? monthRes.data : []).map((month) => ({
            value: String(month.id),
            label: month.name,
          }))
        );
        const currentYear = String(dayjs().year());
        const matched =
          yearOptions.find((year) => String(year.value) === currentYear) || yearOptions[0];
        const yearValue = matched?.value ?? null;
        setDefaultYear(yearValue);
        setAreas(
          (areaRes?.data || []).map((area) => ({
            value: String(area.id),
            label: area.name,
          }))
        );
        form.setFieldsValue({ year_code: yearValue });
        if (yearValue != null) await search({ year_code: yearValue });
      } catch (error) {
        console.error(error);
        showNotification?.("error", error?.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    loadMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    form.setFieldsValue({
      user_id: undefined,
      dealer_id: undefined,
      sub_dealer_id: undefined,
    });
    setDealers([]);
    setSubDealers([]);
    if (!selectedArea) {
      setSales([]);
      return;
    }
    loadSalesByArea(selectedArea);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArea]);

  useEffect(() => {
    form.setFieldsValue({ dealer_id: undefined, sub_dealer_id: undefined });
    setSubDealers([]);
    if (!selectedSale) {
      setDealers([]);
      return;
    }
    loadDealersBySale(selectedSale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSale]);

  useEffect(() => {
    form.setFieldsValue({ sub_dealer_id: undefined });
    if (!selectedSale || !selectedDealer) {
      setSubDealers([]);
      return;
    }
    loadSubDealers(selectedSale, selectedDealer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSale, selectedDealer]);

  const handleClear = async () => {
    form.setFieldsValue({
      area_id: undefined,
      user_id: undefined,
      dealer_id: undefined,
      sub_dealer_id: undefined,
      month: undefined,
      year_code: defaultYear,
    });
    setSales([]);
    setDealers([]);
    setSubDealers([]);
    await search({ year_code: defaultYear });
  };

  const labelOf = (list, value) =>
    (list.find((item) => String(item.value) === String(value)) || {}).label || "";

  const buildFileName = () => {
    const values = form.getFieldsValue();
    const yearText = labelOf(years, values.year_code) || values.year_code || dayjs().format("YYYY");
    return [
      "Activity_Report",
      yearText,
      labelOf(areas, values.area_id) && `Area_${labelOf(areas, values.area_id)}`,
      labelOf(sales, values.user_id) && `Sale_${labelOf(sales, values.user_id)}`,
      labelOf(dealers, values.dealer_id) && `Dealer_${labelOf(dealers, values.dealer_id)}`,
      labelOf(subDealers, values.sub_dealer_id) &&
        `SubDealer_${labelOf(subDealers, values.sub_dealer_id)}`,
      labelOf(months, values.month) && `Month_${labelOf(months, values.month)}`,
      dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD_HHmm"),
    ]
      .filter(Boolean)
      .join("_");
  };

  const getExportGroups = async () => groups;

  const metricColumn = (groupIndex, metric) => ({
    title: metric.title,
    dataIndex: `g${groupIndex}_${metric.key}`,
    width: 120,
    align: "right",
    onHeaderCell: headerCell(metric.color),
    render: (value) => (
      <InputNumber
        className="w-full"
        disabled
        value={toNumber(value)}
        formatter={numberFormat(metric.digits)}
      />
    ),
  });

  const header = [
    {
      title: "Type",
      dataIndex: "activity_type_name",
      width: 220,
      fixed: "left",
      onHeaderCell: headerCell("#00783F"),
      render: (value, record) => (
        <div className="flex items-center gap-2">
          {record.icon ? <img src={record.icon} alt="" className="h-6 w-6" /> : null}
          <span>{value}</span>
        </div>
      ),
    },
    ...groups.map((group, index) => ({
      title: (
        <div className="leading-tight text-white">
          <div>{group.saleName || "All"}</div>
          {group.areaName ? <div className="text-xs font-normal">{group.areaName}</div> : null}
          {group.headName ? (
            <div className="text-xs font-normal">Head of Sale: {group.headName}</div>
          ) : null}
        </div>
      ),
      onHeaderCell: headerCell(index % 2 === 0 ? "#00783F" : "#009845"),
      children: METRICS.map((metric) => metricColumn(index, metric)),
    })),
  ];

  const groupTotals = groups.map((group) => sumRows(group.rows || []));

  const footer = () => (
    <Table.Summary fixed>
      <Table.Summary.Row className="bg-[#978B87]">
        <Table.Summary.Cell index={0}>
          <b className="text-white">Total</b>
        </Table.Summary.Cell>
        {groupTotals.flatMap((total, groupIndex) =>
          METRICS.map((metric, metricIndex) => (
            <Table.Summary.Cell
              key={`${groupIndex}_${metric.key}`}
              index={1 + groupIndex * METRICS.length + metricIndex}
              align="right"
            >
              <InputNumber
                className="w-full"
                disabled
                value={total[metric.key] || 0}
                formatter={numberFormat(metric.digits)}
                style={{ backgroundColor: "white" }}
              />
            </Table.Summary.Cell>
          ))
        )}
      </Table.Summary.Row>
    </Table.Summary>
  );

  return (
    <MainLayout loading={loading}>
      <Title prefix="Activity Report" />
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          area_id: undefined,
          user_id: undefined,
          dealer_id: undefined,
          sub_dealer_id: undefined,
          month: undefined,
          year_code: undefined,
        }}
      >
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16}>
            <Col xs={24} md={4}>
              <Form.Item label="Area" name="area_id" tooltip="เลือก Area ก่อนเพื่อเปิด Sales">
                <Select
                  placeholder="Select Area"
                  options={areas}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label="Sale" name="user_id" tooltip="เลือก Sales หลังจากเลือก Area">
                <Select
                  placeholder="Select Sale"
                  options={sales}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  disabled={!selectedArea}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label="Dealer" name="dealer_id" tooltip="เลือก Dealer หลังจากเลือก Sales">
                <Select
                  placeholder="Select Dealer"
                  options={dealers}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  disabled={!selectedSale}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item
                label="Sub Dealer"
                name="sub_dealer_id"
                tooltip="เลือก Sub Dealer หลังจากเลือก Dealer"
              >
                <Select
                  placeholder="Select Sub Dealer"
                  options={subDealers}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  disabled={!selectedDealer}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label="Year" name="year_code">
                <Select placeholder="Select Year" options={years} allowClear={false} />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label="Month" name="month">
                <Select
                  placeholder="Select Month"
                  options={months}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-end gap-4 px-4 pt-2">
            <DynamicButton
              onClick={() => search(form.getFieldsValue())}
              text="Search"
              iconSrc="/img/icons/search.png"
              className="text-white px-4 py-3 rounded-[4px] bg-[#7DB41E]"
            />
            <DynamicButton
              onClick={handleClear}
              text="Clear"
              iconSrc="/img/icons/trash.png"
              className="text-white px-4 py-3 rounded-[4px] bg-[#B6AEAB]"
            />
            <ExportActivityExcelButton
              fileName={buildFileName()}
              getGroups={getExportGroups}
            />
          </div>
        </BoxPrimary>
      </Form>

      <BoxPrimary>
        <TableCustomComponent
          header={header}
          dataSource={rows}
          loading={tableLoading}
          scrollY={false}
          pagination={false}
          footer={footer}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
