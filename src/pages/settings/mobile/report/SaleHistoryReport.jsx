// src/pages/report/sales/SaleHistoryReport.jsx
import React, { useEffect, useMemo, useState } from "react";
import { InputNumber, Table } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Title from "../../../../components/title/Title";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import DynamicButton from "../../../../components/button/DynamicButton";
import TableCustomComponent from "../../../../components/table/TableCustomComponent";
import Filter from "../../../../components/filter/Filter";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";

// ---------------- Quarter / Months ----------------
const QUARTER_MONTHS = [
  { id: "Q1", name: "Quarter 1", months: ["Jan.", "Feb.", "Mar."] },
  { id: "Q2", name: "Quarter 2", months: ["Apr.", "May", "Jun."] },
  { id: "Q3", name: "Quarter 3", months: ["Jul", "Aug.", "Sept."] },
  { id: "Q4", name: "Quarter 4", months: ["Oct.", "Nov.", "Dec."] },
];

// ---------------- Mock masters ----------------
const PRODUCTS = [
  { name: "Ossinate 15%SL", pack: "1Kg." },
  { name: "Apopo 20%SE", pack: "1Lt." },
  { name: "Atranex 90WG", pack: "5Kg." },
  { name: "Baloric 320EC", pack: "0.5Lt." },
  { name: "Bla-S", pack: "0.25Lt." },
  { name: "Bumper P", pack: "0.5Lt." },
  { name: "Custodia", pack: "1Lt" },
  { name: "Damatin 5%WG", pack: "20Lt" },
  { name: "Durivo 63SC", pack: "1Lt" },
  { name: "Hamper", pack: "1Lt" },
];

const YEARS = ["2026", "2025", "2024"];
const yearOptions = YEARS.map((y) => ({ id: y, name: y }));
const productOptions = PRODUCTS.map((p) => ({ id: p.name, name: p.name }));

// ------------- helpers / mock -------------
const nf = (v) => `${parseInt(v || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// ทำค่า “Value(THB)” ต่อเดือนให้คล้ายภาพ
const buildMockRows = () =>
  PRODUCTS.map((p, i) => {
    const row = {
      key: i + 1,
      productName: p.name,
      packSize: p.pack,
    };
    // Q1: มีค่าสูง, Q2 ไล่ลง, Q3-Q4 ยังมีค่ากระจาย
    const pattern = {
      "Jan.": 1000, "Feb.": 1000, "Mar.": 1000,
      "Apr.": 1000, "May": 500, "Jun.": 500,
      "Jul": 500, "Aug.": 500, "Sept.": 500,
      "Oct.": 500, "Nov.": 500, "Dec.": 500,
    };
    Object.entries(pattern).forEach(([m, base]) => {
      // ทำ variance เล็กน้อยให้แต่ละแถวต่างกัน
      const bump =
        p.name.startsWith("Apopo") && (m === "Aug." || m === "Sept.")
          ? 800
          : p.name.startsWith("Atranex 90WG")
          ? 1500
          : 0;
      row[m] = base + bump;
    });
    // บางแถวให้มีค่าสูงเฉพาะบางเดือนตามภาพ
    if (p.name === "Bla-S") {
      ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."].forEach(
        (m) => (row[m] = 7250)
      );
    }
    if (p.name === "Bumper P") {
      row["Jan."] = 500;
      row["Feb."] = 100;
    }
    if (p.name === "Hamper") {
      row["Jan."] = 2000;
      row["Feb."] = 2000;
      row["Mar."] = 2000;
      row["Apr."] = 2000;
      row["May"] = 2000;
      row["Jun."] = 2000;
      row["Jul"] = 1300;
      row["Aug."] = 1000;
      row["Sept."] = 1000;
      row["Oct."] = 1000;
      row["Nov."] = 1300;
      row["Dec."] = 1400;
    }
    return row;
  });

export default function SaleHistoryReport() {
  const [loading, setLoading] = useState(false);

  // masters (พฤติกรรมแบบ CollectPointsList)
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);

  // table rows
  const [dataRows, setDataRows] = useState([]);

  // init rows
  useEffect(() => setDataRows(buildMockRows()), []);

  // โหลด Sales master
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const sale = await useServiceAPI.get(paths.pathMasterSaleDropdown, {});
        setSaleList(sale?.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------- Filters ----------
  const filters = [
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealer", type: "select", label: "Dealer", placeholder: "All", options: dealerList, moderef: true },
    { key: "sub_dealer", type: "select", label: "Sub Dealer", placeholder: "All", options: subDealerList },
    { key: "year_code", type: "select", label: "Year", placeholder: "All", options: yearOptions },
    { key: "product_name", type: "select", label: "Product", placeholder: "All", options: productOptions },
  ];

  const handleFilterChange = (f) => {
    const saleId = typeof f.sale === "object" ? f.sale?.value ?? f.sale?.id : f.sale;
    const dealerId = typeof f.dealer === "object" ? f.dealer?.value ?? f.dealer?.id : f.dealer;

    if (dealerId) {
      (async () => {
        try {
          const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
            user_id: saleId || "",
            dealer_id: dealerId,
          });
          const subs = (res?.data || []).map((item) => ({
            name: item.sub_dealer_name,
            id: item.sub_dealer_id,
          }));
          setSubDealerList(subs);
        } catch {
          setSubDealerList([]);
        }
      })();
    } else if (saleId) {
      (async () => {
        try {
          const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, { user_id: saleId });
          setDealerList(res?.data || []);
          setSubDealerList([]);
        } catch {
          setDealerList([]);
          setSubDealerList([]);
        }
      })();
    } else {
      setDealerList([]);
      setSubDealerList([]);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };
  const handleClear = () => {
    setDealerList([]);
    setSubDealerList([]);
  };

  // ---------- header style (เหมือนหน้า Monthly Work Plan) ----------
  const applyHeaderStyle = (cols) =>
    cols.map((col, idx) => {
      const bg = idx % 2 === 0 ? "#00783F" : "#009845";
      const color = "white";
      const styleKids = (kids, pbg) =>
        kids.map((c) => ({
          ...c,
          onHeaderCell: () => ({
            style: {
              backgroundColor: c.key === "monthRoot" ? "#00783F" : pbg,
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          ...(c.children ? { children: styleKids(c.children, pbg) } : {}),
        }));
      return {
        ...col,
        onHeaderCell: () => ({
          style: { backgroundColor: bg, color, fontWeight: "bold", textAlign: "center" },
        }),
        ...(col.children ? { children: styleKids(col.children, bg) } : {}),
      };
    });

  // ---------- columns (ตามภาพ: Value(THB) อย่างเดียว) ----------
  const baseColumns = useMemo(() => {
    const left = {
      title: "Quarter",
      children: [
        {
          title: "Month",
          key: "monthRoot",
          children: [
            { title: "Product Name", dataIndex: "productName", width: 180, fixed: "left" },
            { title: "Pack Size", dataIndex: "packSize", width: 120, fixed: "left" },
          ],
        },
      ],
    };

    const quarters = QUARTER_MONTHS.map((q) => ({
      title: q.name,
      children: q.months.map((m) => ({
        title: (
          <div className="flex flex-col items-center">
            <div>{m}</div>
            <small>Value (THB)</small>
          </div>
        ),
        dataIndex: m,
        width: 140,
        align: "right",
        render: (v) => <InputNumber className="w-full" readOnly value={v || 0} formatter={nf} />,
      })),
    }));

    return [left, ...quarters];
  }, []);

  const columns = useMemo(() => applyHeaderStyle(baseColumns), [baseColumns]);

  // ---------- แถว “Total” ใต้หัว Quarter (ให้เหมือนภาพ) ----------
  const quarterTotals = useMemo(() => {
    const monthSum = (m) => dataRows.reduce((s, r) => s + (r[m] || 0), 0);
    return QUARTER_MONTHS.map((q) => ({
      id: q.id,
      total: q.months.reduce((acc, m) => acc + monthSum(m), 0),
    }));
  }, [dataRows]);

  const tableTitle = useMemo(
    () => () => (
      <div className="w-full">
        <div className="grid" style={{ gridTemplateColumns: "300px repeat(4, 1fr)" }}>
          <div className="px-2 py-1 bg-[#00783F] text-white font-bold rounded-tl-md">Total</div>
          {quarterTotals.map((qt, i) => (
            <div
              key={qt.id}
              className="px-2 py-1 flex justify-end items-center"
              style={{
                background: i % 2 === 0 ? "#009845" : "#00783F",
                borderTopLeftRadius: 6,
                borderTopRightRadius: 6,
              }}
            >
              <InputNumber readOnly value={qt.total} formatter={nf} className="!w-[180px]" />
            </div>
          ))}
        </div>
      </div>
    ),
    [quarterTotals]
  );

  // ---------- footer: Total (THB) ต่อเดือน ----------
  const footer = useMemo(() => {
    // eslint-disable-next-line react/display-name
    return () => (
      <Table.Summary fixed>
        <Table.Summary.Row className="bg-[#978B87]">
          <Table.Summary.Cell index={0}>
            <b>Total (THB)</b>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={1} />
          {QUARTER_MONTHS.flatMap((q) =>
            q.months.map((m) => (
              <Table.Summary.Cell key={`${q.id}-${m}`}>
                <InputNumber
                  className="w-full"
                  readOnly
                  value={dataRows.reduce((acc, r) => acc + (r[m] || 0), 0)}
                  formatter={nf}
                />
              </Table.Summary.Cell>
            ))
          )}
        </Table.Summary.Row>
      </Table.Summary>
    );
  }, [dataRows]);

  return (
    <MainLayout loading={loading}>
      <Title prefix="Sales History Report" />

      <Filter
        filters={filters}
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleFilterChange}
      />

      <BoxPrimary>
        <div className="mb-2 text-[#00783F] font-semibold">History</div>

        <TableCustomComponent
          header={columns}
          dataSource={dataRows}
          pagination={false}
          loading={loading}
          scroll={true}
          footer={footer}
          title={tableTitle}
        />

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
        </div>
      </BoxPrimary>
    </MainLayout>
  );
}
