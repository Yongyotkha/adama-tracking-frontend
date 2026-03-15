// src/pages/report/ReportSellOut.jsx
import React, { useMemo, useState, useEffect, useContext } from "react";
import { Form, Row, Col, Select, InputNumber, Table } from "antd";
import MainLayout from "../../layouts/MainLayout";
import Title from "../../components/title/Title";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import DynamicButton from "../../components/button/DynamicButton";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import dayjs from "dayjs";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import ExportSellOutExcelButton from "../../components/export/ExportSellOutExcelButton";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const GREEN_A = "#00783F";
const GREEN_B = "#009845";

const monthsEN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const subCols = [
  { title: "Last Stock", key: "last_stock" },
  { title: "Sell In", key: "sell_in" },
  { title: "Current Stock", key: "current_stock" },
  { title: "Sell Out", key: "sell_out" },
];

const fmt = (n) =>
  `${parseInt(Number(n) || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const slug = (s) =>
  String(s ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_");

const getLabelFrom = (options, value) =>
  (Array.isArray(options) ? options.find((o) => o?.value === value) : null)
    ?.label || "";

const buildSellOutReportFileName = (form, { areaList, sales, dealers }) => {
  const v = form.getFieldsValue();
  const rawYear = v.year ?? dayjs().year();
  const year = String(rawYear);
  const area = getLabelFrom(areaList, v.area_id);
  const sale = getLabelFrom(sales, v.sales_id);
  const dealer = getLabelFrom(dealers, v.dealer_id);

  const parts = [
    "SellOut_Report",
    `Y${year}`,
    area && `Area_${slug(area)}`,
    sale && `Sales_${slug(sale)}`,
    dealer && `Dealer_${slug(dealer)}`,
  ].filter(Boolean);

  const ts = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD_HHmm");
  return `${parts.join("_")}_${ts}`;
};

export default function ReportSellOut() {
  const [form] = Form.useForm();
  const { showNotification } = useContext(AuthContext) || {};
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [areaList, setAreaList] = useState([]);
  const [sales, setSales] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [yearList, setYearList] = useState([]);
  const [defaultYear, setDefaultYear] = useState(null);

  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(5);

  const selectedArea = Form.useWatch("area_id", form);
  const selectedSales = Form.useWatch("sales_id", form);

  const header = useMemo(() => {
    const firstBlock = {
      title: "Month",
      onHeaderCell: () => ({
        style: {
          backgroundColor: GREEN_A,
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      children: [
        {
          title: "Sub Dealer / Group",
          dataIndex: "sub_dealer_name",
          fixed: "left",
          width: 300,
          onHeaderCell: () => ({
            style: {
              backgroundColor: GREEN_A,
              color: "white",
              fontWeight: "bold",
              textAlign: "left",
            },
          }),
        },
      ],
    };

    const monthBlocks = monthsEN.map((m, i) => {
      const c = i % 2 === 0 ? GREEN_B : GREEN_A;
      return {
        title: m,
        onHeaderCell: () => ({
          style: {
            backgroundColor: c,
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          },
        }),
        children: subCols.map((sc) => ({
          title: sc.title,
          dataIndex: `${m}_${sc.key}`,
          align: "right",
          width: 120,
          onHeaderCell: () => ({
            style: {
              backgroundColor: c,
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (val) => (
            <InputNumber
              className="w-full"
              readOnly
              value={Number(val) || 0}
              formatter={(v) => fmt(v)}
            />
          ),
        })),
      };
    });

    return [firstBlock, ...monthBlocks];
  }, []);

  const footer = useMemo(() => {
    const sum = (k) => (data || []).reduce((s, r) => s + (Number(r[k]) || 0), 0);

    return () => (
      <Table.Summary fixed>
        <Table.Summary.Row className="bg-[#978B87]">
          <Table.Summary.Cell index={0}>
            <b>Total</b>
          </Table.Summary.Cell>
          {monthsEN.flatMap((m, mi) =>
            subCols.map((sc, si) => {
              const k = `${m}_${sc.key}`;
              return (
                <Table.Summary.Cell
                  key={k}
                  index={mi * 10 + si + 1}
                  align="right"
                >
                  <InputNumber
                    className="w-full"
                    readOnly
                    value={sum(k)}
                    formatter={(v) => fmt(v)}
                    style={{ backgroundColor: "white" }}
                  />
                </Table.Summary.Cell>
              );
            })
          )}
        </Table.Summary.Row>
      </Table.Summary>
    );
  }, [data]);

  useEffect(() => {
    const loadMasters = async () => {
      setLoading(true);
      try {
        const [areaRes, yearRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterAreas),
          useServiceAPI.get(paths.pathMasterYear),
        ]);

        const areaRaw = Array.isArray(areaRes?.data) ? areaRes.data : [];
        const areaOpts = areaRaw.map((x) => ({ value: x.id, label: x.name }));
        setAreaList(areaOpts);

        const yearRaw = Array.isArray(yearRes?.data) ? yearRes.data : [];
        const yearOptions = yearRaw.map((y) => ({
          value: y.id,
          label: y.name,
        }));
        setYearList(yearOptions);

        let initYear = null;
        if (yearOptions.length > 0) {
          const currentYear = dayjs().year();
          const matched =
            yearOptions.find((y) => Number(y.value) === currentYear) ||
            yearOptions[0];
          initYear = matched.value;
          setDefaultYear(matched.value);
        }

        form.setFieldsValue({
          area_id: undefined,
          sales_id: undefined,
          dealer_id: undefined,
          sub_dealer_id: undefined,
          year: initYear,
        });

        await fetchSellOut();
      } catch (e) {
        console.error(e);
        setAreaList([]);
        setYearList([]);
        showNotification?.("error", "โหลดข้อมูลตัวกรองไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    loadMasters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Area -> Sales
  useEffect(() => {
    const areaId = selectedArea;

    if (!areaId) {
      setSales([]);
      setDealers([]);
      form.setFieldsValue({
        sales_id: undefined,
        dealer_id: undefined,
      });
      return;
    }

    (async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterUserByArea, {
          area_id: areaId,
        });

        const raw = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];

        setSales(
          raw.map((x) => ({
            value: Number(x.user_id ?? x.id),
            label: x.user_name ?? x.name,
          }))
        );

        setDealers([]);
        form.setFieldsValue({
          sales_id: undefined,
          dealer_id: undefined,
        });
      } catch (e) {
        console.error(e);
        setSales([]);
        setDealers([]);
        form.setFieldsValue({
          sales_id: undefined,
          dealer_id: undefined,
        });
      }
    })();
  }, [selectedArea, form]);

  // Sales -> Dealer
  useEffect(() => {
    const salesId = selectedSales;

    if (!salesId) {
      setDealers([]);
      form.setFieldsValue({ dealer_id: undefined });
      return;
    }

    (async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
          user_id: salesId,
        });

        const raw = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];

        setDealers(
          raw.map((x) => ({
            value: Number(x.id),
            label: x.name,
          }))
        );

        form.setFieldsValue({ dealer_id: undefined });
      } catch (e) {
        console.error(e);
        setDealers([]);
        form.setFieldsValue({ dealer_id: undefined });
      }
    })();
  }, [selectedSales, form]);

  const buildPayload = () => {
    const v = form.getFieldsValue();
    const rawYear = v.year ?? defaultYear ?? dayjs().year();
    const year = String(rawYear);

    return {
      year,
      area_id: v.area_id ?? "",
      user_id: v.sales_id ?? "",
      dealer_id: v.dealer_id ?? "",
      sub_dealer_id: v.sub_dealer_id ?? "",
    };
  };

  const mapApiToRows = (apiData = []) => {
    return apiData.map((g, idx) => {
      const row = {
        key: g.group_id || idx + 1,
        sub_dealer_name: g.group_name || "All",
      };

      for (let i = 1; i <= 12; i++) {
        const mObj = g.months?.[String(i)] || g.months?.[i] || {};
        const mName = monthsEN[i - 1];
        row[`${mName}_last_stock`] = Number(mObj.last) || 0;
        row[`${mName}_sell_in`] = Number(mObj.in) || 0;
        row[`${mName}_current_stock`] = Number(mObj.current) || 0;
        row[`${mName}_sell_out`] = Number(mObj.out) || 0;
      }

      return row;
    });
  };

  const fetchSellOut = async () => {
    setTableLoading(true);
    try {
      const payload = buildPayload();
      const res = await useServiceAPI.get(paths.pathReportSellOut, payload);
      const groups = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
      setData(mapApiToRows(groups));
    } catch (err) {
      console.error(err);
      setData([]);
      showNotification?.("error", "โหลดรายงาน Sell Out ไม่สำเร็จ");
    } finally {
      setTableLoading(false);
    }
  };

  const onValuesChange = (changed) => {
    if ("area_id" in changed) {
      form.setFieldsValue({
        sales_id: undefined,
        dealer_id: undefined,
      });
    }

    if ("sales_id" in changed) {
      form.setFieldsValue({
        dealer_id: undefined,
      });
    }
  };

  const handleSearch = async () => {
    await fetchSellOut();
  };

  const handleClear = () => {
    const rawYear = defaultYear ?? dayjs().year();

    form.setFieldsValue({
      area_id: undefined,
      sales_id: undefined,
      dealer_id: undefined,
      sub_dealer_id: undefined,
      year: rawYear,
    });

    setSales([]);
    setDealers([]);

    fetchSellOut();
  };

  return (
    <MainLayout loading={loading}>
      <Title prefix="Sell Out Report" />

      <Form layout="vertical" form={form} onValuesChange={onValuesChange}>
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">
            <Col md={6}>
              <Form.Item
                label="Area"
                name="area_id"
                tooltip="เลือก Area ก่อนเพื่อเปิด Sales"
              >
                <Select
                  placeholder="Select Area"
                  options={areaList}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item
                label="Sales"
                name="sales_id"
                tooltip="เลือก Sales หลังจากเลือก Area"
              >
                <Select
                  placeholder="Select Sales"
                  options={sales}
                  allowClear
                  disabled={!selectedArea}
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item
                label="Dealer"
                name="dealer_id"
                tooltip="เลือก Dealer หลังจากเลือก Sales"
              >
                <Select
                  placeholder="Select Dealer"
                  options={dealers}
                  allowClear
                  disabled={!selectedSales}
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item label="Year" name="year">
                <Select
                  placeholder="Select year"
                  options={yearList}
                  allowClear={false}
                />
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

            <ExportSellOutExcelButton
              text="Export Excel"
              fileName={buildSellOutReportFileName(form, {
                areaList,
                sales,
                dealers,
              })}
              getPayload={async () => {
                const v = form.getFieldsValue();
                const rawYear = v.year ?? defaultYear ?? dayjs().year();
                const year = String(rawYear);

                return {
                  year,
                  area_id: v.area_id ?? "",
                  user_id: v.sales_id ?? "",
                  dealer_id: v.dealer_id ?? "",
                  sub_dealer_id: v.sub_dealer_id ?? "",
                };
              }}
              requestData={(payload) =>
                useServiceAPI.get(paths.pathReportSellOut, payload)
              }
            />
          </div>
        </BoxPrimary>
      </Form>

      <div className="flex items-center gap-2 mb-2">
        <span>Show</span>
        <Select
          value={pageSize}
          onChange={(v) => setPageSize(v)}
          options={[5, 10, 15, 20].map((n) => ({ value: n, label: n }))}
          style={{ width: 80 }}
        />
        <span>entries</span>
      </div>

      <BoxPrimary>
        <TableCustomComponent
          header={header}
          dataSource={data}
          pagination={false}
          pageSize={pageSize}
          loading={tableLoading}
          scroll
          scrollX
          scrollY
          rowHeight={56}
          extraY={230}
          footer={footer}
        />
        <div className="text-sm text-[#6b7280] mt-2">
          Showing 1 to {Math.min(pageSize, data.length)} of {data.length} entries
        </div>
      </BoxPrimary>
    </MainLayout>
  );
}