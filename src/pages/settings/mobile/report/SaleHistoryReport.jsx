// src/pages/settings/mobile/report/SaleHistoryReport.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Form, Row, Col, Select, InputNumber, Table } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Title from "../../../../components/title/Title";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import DynamicButton from "../../../../components/button/DynamicButton";
import TableCustomComponent from "../../../../components/table/TableCustomComponent";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import ExportSaleHistoryExcelButton from "../../../../components/export/ExportSaleHistoryExcelButton";

// ---------------- Quarter / Months ----------------
const QUARTER_MONTHS = [
  { id: "Q1", name: "Quarter 1", months: ["Jan.", "Feb.", "Mar."] },
  { id: "Q2", name: "Quarter 2", months: ["Apr.", "May", "Jun."] },
  { id: "Q3", name: "Quarter 3", months: ["Jul", "Aug.", "Sept."] },
  { id: "Q4", name: "Quarter 4", months: ["Oct.", "Nov.", "Dec."] },
];

const MONTH_MAP = {
  M01: "Jan.",
  M02: "Feb.",
  M03: "Mar.",
  M04: "Apr.",
  M05: "May",
  M06: "Jun.",
  M07: "Jul",
  M08: "Aug.",
  M09: "Sept.",
  M10: "Oct.",
  M11: "Nov.",
  M12: "Dec.",
};

const YEARS = ["2026", "2025", "2024"];
const nf = (v) => `${parseInt(v || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export default function SaleHistoryReport() {
  const [loading, setLoading] = useState(false);

  // dropdown masters
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [productList, setProductList] = useState([]); // สำหรับ filter product

  // table rows
  const [dataRows, setDataRows] = useState([]);

  // filter form
  const [form] = Form.useForm();

  // ---- watch for step disable ----
  const selectedSales = Form.useWatch("user_id", form);
  const selectedDealer = Form.useWatch("dealer_id", form);

  // ---------- load masters ----------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const sale = await useServiceAPI.get(paths.pathMasterSaleDropdown, {});
        setSaleList((sale?.data || []).map((s) => ({ value: s.id, label: s.name })));
      } finally {
        setLoading(false);
      }
    })();

    // initial form values
    form.setFieldsValue({
      year: "2025",
      user_id: undefined,
      dealer_id: undefined,
      sub_dealer_id: undefined,
      product_id: undefined,
    });

    // first fetch (ทั้งหมด)
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- filter cascade ----------
  const handleFilterCascade = async (changedValues, allValues) => {
    // Step 1: Sales -> Dealer
    if ("user_id" in changedValues) {
      const saleId = changedValues.user_id;
      form.setFieldsValue({ dealer_id: undefined, sub_dealer_id: undefined });
      setDealerList([]);
      setSubDealerList([]);
      if (saleId) {
        try {
          const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, { user_id: saleId });
          setDealerList((res?.data || []).map((d) => ({ value: d.id, label: d.name })));
        } catch {
          setDealerList([]);
        }
      }
    }

    // Step 2: Dealer -> Sub Dealer
    if ("dealer_id" in changedValues) {
      const saleId = allValues.user_id || "";
      const dealerId = changedValues.dealer_id;
      form.setFieldsValue({ sub_dealer_id: undefined });
      setSubDealerList([]);
      if (dealerId) {
        try {
          const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
            user_id: saleId,
            dealer_id: dealerId,
          });
          setSubDealerList(
            (res?.data || []).map((s) => ({
              value: s.sub_dealer_id,
              label: s.sub_dealer_name,
            }))
          );
        } catch {
          setSubDealerList([]);
        }
      }
    }
  };

  // ---------- api fetch ----------
  const buildPayload = () => {
    const v = form.getFieldsValue();
    return {
      year: String(v.year || "2025"),
      user_id: v.user_id || "",
      dealer_id: v.dealer_id || "",
      sub_dealer_id: v.sub_dealer_id || "",
      product_id: v.product_id || "",
    };
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const payload = buildPayload();
      const res = await useServiceAPI.get(paths.pathReportSaleHistory, payload);
      const products = res?.data?.products || [];

      // เก็บ product list สำหรับ filter (ดึงมาจากผลลัพธ์)
      setProductList(
        products.map((p) => ({
          value: p.product_id,
          label: `${p.product_name} (${p.product_unit})`,
        }))
      );

      // map -> table rows (Value เฉพาะ)
      const rows = products.map((p, idx) => {
        const row = {
          key: `${p.product_id}-${idx}`,
          productName: p.product_name,
          packSize: p.product_unit,
        };
        Object.entries(MONTH_MAP).forEach(([k, monthLabel]) => {
          const val = parseFloat(p[k] || 0);
          row[`${monthLabel}|value`] = isNaN(val) ? 0 : val;
        });
        return row;
      });

      setDataRows(rows);
    } catch (e) {
      setDataRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchHistory();
  const handleClear = () => {
    form.resetFields();
    form.setFieldsValue({
      year: "2025",
      user_id: undefined,
      dealer_id: undefined,
      sub_dealer_id: undefined,
      product_id: undefined,
    });
    setDealerList([]);
    setSubDealerList([]);
    setProductList([]);
    fetchHistory();
  };

  // ---------- header style ----------
  const applyHeaderStyle = (cols) =>
    cols.map((col, idx) => {
      const bg = idx % 2 === 0 ? "#00783F" : "#009845";
      const styleKids = (kids, pbg) =>
        (kids || []).map((c) => {
          const isWhite = String(c.key || "").startsWith("totalRow");
          return {
            ...c,
            onHeaderCell: () => ({
              style: {
                backgroundColor: isWhite ? "#ffffff" : (c.key === "monthRoot" ? "#00783F" : pbg),
                color: isWhite ? "#333" : "white",
                fontWeight: "bold",
                textAlign: "center",
              },
            }),
            ...(c.children ? { children: styleKids(c.children, pbg) } : {}),
          };
        });
      return {
        ...col,
        onHeaderCell: () => ({
          style: {
            backgroundColor: bg,
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          },
        }),
        ...(col.children ? { children: styleKids(col.children, bg) } : {}),
      };
    });

  // ---------- quarter totals (เฉพาะ Value) ----------
  const quarterTotals = useMemo(() => {
    const monthSumValue = (m) =>
      dataRows.reduce((s, r) => s + (r[`${m}|value`] || 0), 0);
    return QUARTER_MONTHS.map((q) => ({
      id: q.id,
      total: q.months.reduce((acc, m) => acc + monthSumValue(m), 0),
    }));
  }, [dataRows]);

  // ---------- columns (White row ใต้ Quarter + Month เดิม) ----------
  const baseColumns = useMemo(() => {
    const left = {
      title: "Quarter",
      children: [
        {
          title: "Total (Value)",
          key: "totalRow-left",
          children: [
            {
              title: "Month",
              key: "monthRoot",
              children: [
                { title: "Product Name", dataIndex: "productName", width: 220, fixed: "left" },
                { title: "Pack Size", dataIndex: "packSize", width: 160, fixed: "left" },
              ],
            },
          ],
        },
      ],
    };

    const valueQuarterCols = QUARTER_MONTHS.map((q) => ({
      title: q.name,
      key: `${q.id}_value`,
      children: [
        {
          title: (
            <InputNumber
              readOnly
              className="w-full"
              value={quarterTotals.find((t) => t.id === q.id)?.total || 0}
              formatter={nf}
            />
          ),
          key: `totalRow-${q.id}-value`,
          children: q.months.map((m) => ({
            title: (
              <div className="flex flex-col items-center">
                <div>{m}</div>
                <small>Value (THB)</small>
              </div>
            ),
            dataIndex: `${m}|value`,
            width: 140,
            align: "right",
            render: (v) => <InputNumber className="w-full" readOnly value={v || 0} formatter={nf} />,
          })),
        },
      ],
    }));

    return [left, ...valueQuarterCols];
  }, [quarterTotals]);

  const columns = useMemo(() => applyHeaderStyle(baseColumns), [baseColumns]);

  // ---------- footer รวมทุกเดือน (Value) ----------
  const footer = useMemo(() => {
    const allMonthIdx = QUARTER_MONTHS.flatMap((q) => q.months.map((m) => `${m}|value`));
    return () => (
      <Table.Summary fixed>
        <Table.Summary.Row className="bg-[#978B87]">
          <Table.Summary.Cell index={0}>
            <b>Total</b>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={1} />
          {allMonthIdx.map((dx) => (
            <Table.Summary.Cell key={`sum-${dx}`}>
              <InputNumber
                className="w-full"
                readOnly
                value={dataRows.reduce((acc, r) => acc + (r[dx] || 0), 0)}
                formatter={nf}
              />
            </Table.Summary.Cell>
          ))}
        </Table.Summary.Row>
      </Table.Summary>
    );
  }, [dataRows]);

  return (
    <MainLayout loading={loading}>
      <Title prefix="Sales History Report" />

      {/* ===== Filters (Step Select) ===== */}
      <Form form={form} layout="vertical" onValuesChange={handleFilterCascade}>
        <BoxPrimary className="m-1 mb-4">
          <Row gutter={16} align="middle">
            <Col md={6}>
              <Form.Item label="Year" name="year" initialValue={YEARS[1]}>
                <Select options={YEARS.map((y) => ({ value: y, label: y }))} />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item
                label="Sales"
                name="user_id"
                tooltip="เลือก Sales ก่อนเพื่อเปิด Dealer"
              >
                <Select placeholder="Select Sales" options={saleList} allowClear />
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
                  options={dealerList}
                  allowClear
                  disabled={!selectedSales}
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item
                label="Sub Dealer"
                name="sub_dealer_id"
                tooltip="เลือก Sub Dealer หลังจากเลือก Dealer"
              >
                <Select
                  placeholder="Select Sub Dealer"
                  options={subDealerList}
                  allowClear
                  disabled={!selectedDealer}
                />
              </Form.Item>
            </Col>

            <Col md={6}>
              <Form.Item label="Product" name="product_id">
                <Select
                  placeholder="All Products"
                  options={productList}
                  allowClear
                  showSearch
                  optionFilterProp="label"
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
            <ExportSaleHistoryExcelButton
              text="Export Excel"
              fileName={`Sales_History_${form.getFieldValue('year') || '2025'}`}
              getPayload={async () => ({
                year: String(form.getFieldValue('year') || '2025'),
                user_id: form.getFieldValue('user_id') || "",
                dealer_id: form.getFieldValue('dealer_id') || "",
                sub_dealer_id: form.getFieldValue('sub_dealer_id') || "",
                product_id: form.getFieldValue('product_id') || "",
              })}
              requestData={(payload) => useServiceAPI.get(paths.pathReportSaleHistory, payload)}
            />


          </div>
        </BoxPrimary>
      </Form>

      {/* ===== Table ===== */}
      <BoxPrimary>
        <div className="mb-2 text-[#00783F] font-semibold">History</div>

        <TableCustomComponent
          header={columns}
          dataSource={dataRows}
          pagination={false}
          loading={loading}
          scrollX
          scrollY={false}
          footer={footer}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
