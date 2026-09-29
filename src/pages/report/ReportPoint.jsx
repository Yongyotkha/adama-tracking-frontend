import React, { useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import { InputNumber, Table } from "antd";
import Title from "../../components/title/Title";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import Filter from "../../components/filter/Filter";
import { markQuarterEdge } from "../../components/table/quarterDivider";
import "./ReportPoint.css";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const buildQuarters = (metric, metricLabel) =>
  [1, 2, 3, 4].map((quarter) => ({
    key: `${metric}_q${quarter}`,
    title: `Quarter ${quarter}`,
    metric,
    metricLabel,
    months: MONTHS.slice((quarter - 1) * 3, quarter * 3).map((name, monthIndex) => ({
      name,
      key: `${metric}_m${(quarter - 1) * 3 + monthIndex}`,
    })),
  }));

const QUARTERS = [
  ...buildQuarters("point", "Point"),
  ...buildQuarters("value", "Value (THB)"),
];

const AREA_OPTIONS = [
  { id: "north", name: "North" },
  { id: "central", name: "Central" },
  { id: "northeast", name: "Northeast" },
];

const SALES_OPTIONS = [
  { id: "somchai", name: "Somchai" },
  { id: "anan", name: "Anan" },
];

const DEALER_OPTIONS = [
  { id: "dealer-a", name: "Dealer A" },
  { id: "dealer-b", name: "Dealer B" },
];

const POINT_SCALES = [8500, 420, 45, 18500, 760, 28, 3400, 14200, 90, 2100];
const VALUE_SCALES = [250000, 480000, 125000, 625000, 175000, 85000, 1810000, 320000, 96000, 540000];
const POINT_SEASON = [0.2, 0.45, 0.8, 1, 0.9, 0.55, 0.3, 0.15, 0.4, 0.7, 1.05, 0.85];
const VALUE_SEASON = [1, 0.35, 0.7, 0.5, 1.1, 0.25, 0.9, 0.6, 0.15, 0.8, 0.45, 1.05];

const monthAmount = (scale, season, rowIndex, monthOfYear, step) => {
  const quietMonth = (rowIndex * 3 + monthOfYear + step) % 8 === 0;
  if (quietMonth) return 0;
  return Math.max(step, Math.round((scale * season) / step) * step);
};

const MOCK_ROWS = [
  { company: "Herbicide", product: "Caiman 150SL", sku: "201720001 SCS", area: "north", sale: "somchai", dealer: "dealer-a" },
  { company: "Fungicide", product: "Apron 2E 1L", sku: "303120981 512", area: "north", sale: "somchai", dealer: "dealer-b" },
  { company: "Herbicide", product: "Atarax 50WG", sku: "203420877 412", area: "central", sale: "anan", dealer: "dealer-a" },
  { company: "Herbicide", product: "Baccara 32WG", sku: "203120001 123", area: "central", sale: "somchai", dealer: "dealer-b" },
  { company: "Fungicide", product: "Blus S", sku: "308120002 120", area: "northeast", sale: "anan", dealer: "dealer-a" },
  { company: "Fungicide", product: "Bumper P", sku: "303720061 13", area: "north", sale: "anan", dealer: "dealer-b" },
  { company: "Fungicide", product: "Custodia", sku: "303820003 120", area: "central", sale: "somchai", dealer: "dealer-a" },
  { company: "Insecticide", product: "Demarin 5%WG", sku: "103420877 520", area: "northeast", sale: "somchai", dealer: "dealer-b" },
  { company: "Insecticide", product: "Duric 93SC", sku: "103220023 2", area: "north", sale: "anan", dealer: "dealer-a" },
  { company: "Insecticide", product: "Hamper", sku: "103320031 5", area: "central", sale: "anan", dealer: "dealer-b" },
].map((row, rowIndex) => {
  const months = {};
  QUARTERS.forEach((quarter) => {
    const scales = quarter.metric === "point" ? POINT_SCALES : VALUE_SCALES;
    const season = quarter.metric === "point" ? POINT_SEASON : VALUE_SEASON;
    const step = quarter.metric === "point" ? 10 : 500;
    quarter.months.forEach((month, monthIndex) => {
      const monthOfYear = Number(month.key.split("_m")[1]);
      months[month.key] = monthAmount(
        scales[rowIndex],
        season[(monthOfYear + monthIndex) % 12],
        rowIndex,
        monthOfYear,
        step
      );
    });
  });
  return { key: row.sku, ...row, months };
});

const amountFormatter = (value) =>
  `${parseInt(value || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function PointInput({ value, className = "" }) {
  return (
    <InputNumber
      disabled
      controls={false}
      className={`point-report-input ${className}`.trim()}
      value={Number(value) || 0}
      formatter={amountFormatter}
    />
  );
}

const greenHeader = (backgroundColor = "#00783F") => () => ({
  style: {
    backgroundColor,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

const totalValueHeader = () => ({
  className: "point-report-total-header",
  style: {
    backgroundColor: "#ffffff",
    color: "#5F504D",
    fontWeight: "normal",
    fontSize: 14,
    textAlign: "center",
  },
});

export default function ReportPoint() {
  const [filters, setFilters] = useState({});

  const dataSource = useMemo(
    () =>
      MOCK_ROWS.filter((row) => {
        const matchArea = !filters.area || row.area === filters.area;
        const matchSale = !filters.sale || row.sale === filters.sale;
        const matchDealer = !filters.dealer || row.dealer === filters.dealer;
        return matchArea && matchSale && matchDealer;
      }),
    [filters]
  );

  const monthTotals = useMemo(() => {
    const totals = {};
    QUARTERS.forEach((quarter) => {
      quarter.months.forEach((month) => {
        totals[month.key] = dataSource.reduce((sum, row) => sum + (row.months[month.key] || 0), 0);
      });
    });
    return totals;
  }, [dataSource]);

  const columns = [
    {
      title: "Quarter",
      onHeaderCell: greenHeader(),
      children: [
        {
          title: "Total",
          onHeaderCell: totalValueHeader,
          children: [
            {
              title: "Month",
              onHeaderCell: greenHeader(),
              children: [
                {
                  title: "Product Category",
                  dataIndex: "company",
                  key: "company",
                  fixed: "left",
                  width: 150,
                  onHeaderCell: greenHeader(),
                },
                {
                  title: "Product Name",
                  dataIndex: "product",
                  key: "product",
                  fixed: "left",
                  width: 150,
                  onHeaderCell: greenHeader(),
                },
                {
                  title: "SKU",
                  dataIndex: "sku",
                  key: "sku",
                  fixed: "left",
                  width: 140,
                  onHeaderCell: greenHeader(),
                },
              ],
            },
          ],
        },
      ],
    },
    ...QUARTERS.map((quarter, index) => {
      const quarterTotal = quarter.months.reduce((sum, month) => sum + (monthTotals[month.key] || 0), 0);
      const headerColor = index % 2 === 0 ? "#009845" : "#00783F";
      return markQuarterEdge({
        title: quarter.title,
        key: quarter.key,
        onHeaderCell: greenHeader(headerColor),
        children: [
          {
            title: <PointInput value={quarterTotal} className="point-report-quarter-input" />,
            key: `${quarter.key}_total`,
            onHeaderCell: totalValueHeader,
            children: quarter.months.map((month) => ({
              title: month.name,
              key: month.key,
              onHeaderCell: greenHeader(headerColor),
              children: [
                {
                  title: quarter.metricLabel,
                  dataIndex: ["months", month.key],
                  key: `${month.key}_${quarter.metric}`,
                  width: quarter.metric === "value" ? 118 : 96,
                  align: "center",
                  onHeaderCell: greenHeader(headerColor),
                  render: (value) => (
                    <PointInput
                      value={value}
                      className={quarter.metric === "value" ? "point-report-value-input" : ""}
                    />
                  ),
                },
              ],
            })),
          },
        ],
      });
    }),
  ];

  const filterFields = [
    { key: "area", label: "Area", type: "select", options: AREA_OPTIONS, placeholder: "All" },
    { key: "sale", label: "Sales", type: "select", options: SALES_OPTIONS, placeholder: "All" },
    { key: "dealer", label: "Dealer", type: "select", options: DEALER_OPTIONS, placeholder: "All" },
  ];

  return (
    <MainLayout loading={false} childrenStyle={""}>
      <Title prefix="Point Report" />

      <div className="mb-4">
        <Filter
          filters={filterFields}
          onSearch={(values) => setFilters(values || {})}
          onClear={() => setFilters({})}
        />
      </div>

      <BoxPrimary>
        <div className="text-[#00783F] text-xl pb-5">Monthly Work Plan</div>
        <div className="point-report-table">
        <TableCustomComponent
          header={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={true}
          footer={() => (
            <Table.Summary fixed>
              <Table.Summary.Row className="bg-[#978B87] font-semibold">
                <Table.Summary.Cell index={0} colSpan={3}>
                  Total
                </Table.Summary.Cell>
                {QUARTERS.flatMap((quarter) =>
                  quarter.months.map((month, monthIndex) => (
                    <Table.Summary.Cell
                      key={month.key}
                      align="center"
                      className={monthIndex === 0 ? "quarter-divider" : undefined}
                    >
                      <PointInput
                        value={monthTotals[month.key]}
                        className={
                          quarter.metric === "value"
                            ? "point-report-summary-input point-report-value-input"
                            : "point-report-summary-input"
                        }
                      />
                    </Table.Summary.Cell>
                  ))
                )}
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
        </div>
      </BoxPrimary>
    </MainLayout>
  );
}
