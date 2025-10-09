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
  { name: "Custodia 320 SC", pack: "20 x 0.5 Lt" },
  { name: "Custodia 320 SC", pack: "20 x 1 Lt" },
  { name: "Custodia 320 SC", pack: "40 x 0.25 Lt" },
  { name: "Damatin", pack: "1 Kg x 12" },
  { name: "Diazol 60% W/V EC", pack: "12 x 1 Lt" },
  { name: "Durivo", pack: "0.25 Lt x 40" },
  { name: "Fiesta 100 EC", pack: "0.25 Lt x 24" },
  { name: "Formass", pack: "1 Lt x 12" },
  { name: "Hamper 300 SC", pack: "0.25 Lt x 24" },
  { name: "Hamper 300 SC", pack: "1 Lt x 12" },
  { name: "Hamper 300 SC", pack: "20 Lt" },
];

const YEARS = ["2026", "2025", "2024"];
const yearOptions = YEARS.map((y) => ({ id: y, name: y }));
const productOptions = PRODUCTS.map((p) => ({ id: p.name, name: p.name }));

// ------------- make mock monthly qty/value -------------
const nf = (v) => `${parseInt(v || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const buildMockRows = () => {
  const rows = PRODUCTS.map((p, idx) => {
    // สร้าง qty/value รายเดือนให้มี pattern ใกล้ภาพตัวอย่าง
    const months = {};
    QUARTER_MONTHS.forEach((q, qi) =>
      q.months.forEach((m, mi) => {
        const baseQty = (idx % 5 === 0 ? 100 : 0) + (mi === 0 ? 100 : mi === 1 ? 500 : 300);
        const qty =
          qi === 0
            ? [100, 500, 300][mi] || 0
            : qi === 1
            ? [200, 100, 0][mi] || 0
            : qi === 2
            ? [0, 0, 0][mi] || 0
            : [0, 0, 0][mi] || 0;

        const value = qty * (2000 + (idx % 3) * 350); // mock value ตาม qty
        months[m] = { qty, value };
      })
    );

    // mock แถวซ้าย
    const workPlanKG = idx % 3 === 0 ? 2500 : idx % 3 === 1 ? 0 : 1000;
    const valueTHB = workPlanKG * (1540 + (idx % 4) * 320);

    return {
      key: idx + 1,
      productName: p.name,
      packSize: p.pack,
      workPlanKG,
      valueTHB,
      months,
    };
  });
  return rows;
};

export default function SaleHistoryReport() {
  const [loading, setLoading] = useState(false);

  // masters (ตามพฤติกรรม CollectPointsList)
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [filtersState, setFiltersState] = useState({});

  // table rows
  const [dataRows, setDataRows] = useState([]);

  // init rows
  useEffect(() => {
    setDataRows(buildMockRows());
  }, []);

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
    setFiltersState(f);

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
    setTimeout(() => setLoading(false), 350);
  };

  const handleClear = () => {
    setFiltersState({});
    setDealerList([]);
    setSubDealerList([]);
  };

  // ---------- Header style helper (ยกมาจาก WorkPlanSaleCreate) ----------
  const applyTopLevelAndSpecificChildrenStyles = (columns) =>
    columns.map((col, index) => {
      const backgroundColor = index % 2 === 0 ? "#00783F" : "#009845";
      const textColor = "white";

      const styleChildren = (children, parentBgColor) =>
        children.map((child) => {
          const isFirstLevelChild = child.key === "firstChilden";
          const isLastLevelChild = child.dataIndex;
          const isQtyChild = child.title === "Qty (KG)";

          if (!isFirstLevelChild && child.children && !isLastLevelChild) {
            return { ...child, children: styleChildren(child.children, parentBgColor) };
          }
          return {
            ...child,
            onHeaderCell: () => ({
              style: {
                backgroundColor: isFirstLevelChild
                  ? "#CBC5C3"
                  : isQtyChild
                  ? parentBgColor
                  : isLastLevelChild
                  ? parentBgColor
                  : null,
                color: isLastLevelChild || isQtyChild ? textColor : "black",
                fontWeight: "bold",
                textAlign: "center",
              },
            }),
            ...(child.children ? { children: styleChildren(child.children, parentBgColor) } : {}),
          };
        });

      return {
        ...col,
        onHeaderCell: () => ({
          style: { backgroundColor, color: textColor, fontWeight: "bold", textAlign: "center" },
        }),
        ...(col.children ? { children: styleChildren(col.children, backgroundColor) } : {}),
      };
    });

  // ---------- Columns (เลย์เอาต์เดียวกับ Monthly Work Plan) ----------
  const baseColumns = useMemo(() => {
    const left = {
      title: "Quarter", // row 1
      children: [
        {
          title: "Sale Plan (THB)", // row 2
          children: [
            {
              title: "Month", // row 3
              key: "firstChilden",
              onHeaderCell: () => ({
                style: {
                  backgroundColor: "#00783F",
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                },
              }),
              children: [
                { title: "Product Name", dataIndex: "productName", width: 180, fixed: "left" },
                { title: "Pack Size", dataIndex: "packSize", width: 130, fixed: "left" },
                {
                  title: "Work Plan (KG)",
                  dataIndex: "workPlanKG",
                  width: 140,
                  fixed: "left",
                  render: (v) => (
                    <InputNumber className="w-full" disabled value={v || 0} formatter={nf} />
                  ),
                },
                {
                  title: "Value (THB)",
                  dataIndex: "valueTHB",
                  width: 160,
                  fixed: "left",
                  render: (v) => (
                    <InputNumber className="w-full" disabled value={v || 0} formatter={nf} />
                  ),
                },
              ],
            },
          ],
        },
      ],
    };

    const quarters = QUARTER_MONTHS.map((q) => ({
      title: q.name,
      children: [
        {
          // บรรทัด input รวมทั้ง Quarter
          title: (
            <InputNumber
              disabled
              className="w-full"
              value={q.months.reduce(
                (sum, m) =>
                  sum +
                  dataRows.reduce((acc, r) => acc + (r.months?.[m]?.value || 0), 0),
                0
              )}
              formatter={nf}
            />
          ),
          children: q.months.map((m) => ({
            title: m,
            dataIndex: `col_${q.id}_${m}`,
            children: [
              {
                title: "Qty (KG)",
                width: 120,
                render: (_, record) => (
                  <InputNumber
                    className="w-full"
                    disabled
                    value={record.months?.[m]?.qty || 0}
                    formatter={nf}
                  />
                ),
              },
              {
                title: "Value (THB)",
                width: 150,
                render: (_, record) => (
                  <InputNumber
                    className="w-full"
                    disabled
                    value={record.months?.[m]?.value || 0}
                    formatter={nf}
                  />
                ),
              },
            ],
          })),
        },
      ],
    }));

    return [left, ...quarters];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataRows]);

  const columns = useMemo(
    () => applyTopLevelAndSpecificChildrenStyles(baseColumns),
    [baseColumns]
  );

  // ---------- Footer (Total THB ต่อเดือน) ----------
  const footer = useMemo(() => {
    // eslint-disable-next-line react/display-name
    return () => (
      <Table.Summary fixed>
        <Table.Summary.Row className="bg-[#978B87]">
          <Table.Summary.Cell index={0} colSpan={4}>
            Total (THB)
          </Table.Summary.Cell>
          {QUARTER_MONTHS.flatMap((q) =>
            q.months.map((m) => (
              <Table.Summary.Cell key={`${q.id}-${m}`} colSpan={2}>
                <InputNumber
                  className="w-full"
                  disabled
                  value={dataRows.reduce((acc, r) => acc + (r.months?.[m]?.value || 0), 0)}
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

      {/* Filter แบบเดียวกับ CollectPointsList */}
      <Filter
        filters={[
          ...filters,
        ]}
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleFilterChange}
      />

      <BoxPrimary>
        <div className="text-[#00783F] text-xl pb-5">History</div>

        <TableCustomComponent
          header={columns}
          dataSource={dataRows}
          pagination={false}
          loading={loading}
          scroll={true}          // ✅ ใช้สไตล์ TableCustom เหมือนหน้า WorkPlan
          footer={footer}
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
