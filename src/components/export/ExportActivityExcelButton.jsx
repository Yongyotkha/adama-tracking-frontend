import { useState } from "react";
import PropTypes from "prop-types";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DynamicButton from "../button/DynamicButton";

const METRICS = [
  { key: "plan_qty", title: "Plan (ครั้ง)", color: "#009845" },
  { key: "plan_thb", title: "Plan (THB)", color: "#00783F", money: true },
  { key: "actual_qty", title: "Actual (ครั้ง)", color: "#7DB41E" },
  { key: "actual_thb", title: "Actual (THB)", color: "#93CC23", money: true },
];

const hexToARGB = (hex) => {
  const value = String(hex || "").replace("#", "").trim();
  if (value.length === 6) return `FF${value.toUpperCase()}`;
  if (value.length === 8) return value.toUpperCase();
  return "FFFFFFFF";
};

const fillSolid = (hex) => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: hexToARGB(hex) },
});

const borderThin = {
  top: { style: "thin", color: { argb: "FFCCCCCC" } },
  left: { style: "thin", color: { argb: "FFCCCCCC" } },
  right: { style: "thin", color: { argb: "FFCCCCCC" } },
  bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
};

const safeFileName = (value) =>
  (typeof value === "string" && value.trim() ? value.trim() : "Activity_Report")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_");

const styleCell = (cell, { value, fill, color = "FF333333", bold = false, align = "center", wrap = false }) => {
  if (value != null) cell.value = value;
  if (fill) cell.fill = fillSolid(fill);
  cell.font = { bold, color: { argb: color } };
  cell.alignment = { vertical: "middle", horizontal: align, wrapText: wrap };
  cell.border = borderThin;
};

const paintRange = (row, startCol, endCol, value, fill) => {
  if (endCol > startCol) row.worksheet.mergeCells(row.number, startCol, row.number, endCol);
  for (let col = startCol; col <= endCol; col += 1) {
    const cell = row.getCell(col);
    cell.fill = fillSolid(fill);
    cell.border = borderThin;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
  }
  row.getCell(startCol).value = value;
};

const spansOf = (groups, pick) => {
  const spans = [];
  groups.forEach((group, index) => {
    const label = pick(group) || "-";
    const last = spans[spans.length - 1];
    if (last && last.label === label) last.end = index;
    else spans.push({ label, start: index, end: index });
  });
  return spans;
};

export default function ExportActivityExcelButton({
  fileName = "Activity_Report",
  text = "Export Excel",
  iconSrc = "/img/icons/excel.png",
  className,
  getGroups,
  filterInfo,
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const groups = (await getGroups?.()) || [];
      const usable = groups.filter((group) => group);
      const typeNames = [];
      usable.forEach((group) => {
        (group.rows || []).forEach((row) => {
          const name = row.activity_type_name || "";
          if (name && !typeNames.includes(name)) typeNames.push(name);
        });
      });

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Activity");
      const groupCount = Math.max(usable.length, 1);
      const totalCols = 1 + groupCount * METRICS.length;

      ws.getColumn(1).width = 28;
      for (let col = 2; col <= totalCols; col += 1) ws.getColumn(col).width = 16;

      const info = filterInfo || usable[0]?.info || {};
      const infoRow = ws.getRow(1);
      infoRow.height = 22;
      const infoCells = [
        ["Head of Sale", info.headName || "All"],
        ["Area", info.areaName || "All"],
        ["Sale", info.saleName || "All"],
        ["Dealer", info.dealerName || "All"],
        ["Sub Dealer", info.subDealerName || "All"],
        ["Year", info.yearName || ""],
        ["Month", info.monthName || "All"],
      ];
      infoCells.forEach(([label, value], index) => {
        const labelCell = infoRow.getCell(index * 2 + 1);
        const valueCell = infoRow.getCell(index * 2 + 2);
        styleCell(labelCell, {
          value: label,
          fill: "#00783F",
          color: "FFFFFFFF",
          bold: true,
        });
        styleCell(valueCell, { value, align: "left" });
      });

      const areaRow = ws.getRow(2);
      const saleRow = ws.getRow(3);
      const metricRow = ws.getRow(4);
      areaRow.height = 22;
      saleRow.height = 48;
      metricRow.height = 22;

      ws.mergeCells(3, 1, 4, 1);
      styleCell(saleRow.getCell(1), {
        value: "Type",
        fill: "#00783F",
        color: "FFFFFFFF",
        bold: true,
      });
      styleCell(metricRow.getCell(1), { fill: "#00783F", color: "FFFFFFFF", bold: true });
      styleCell(areaRow.getCell(1), { fill: "#009845" });

      spansOf(usable, (group) => group.areaName).forEach((span) => {
        const startCol = 2 + span.start * METRICS.length;
        const endCol = 2 + span.end * METRICS.length + METRICS.length - 1;
        paintRange(areaRow, startCol, endCol, span.label, "#009845");
      });

      usable.forEach((group, groupIndex) => {
        const startCol = 2 + groupIndex * METRICS.length;
        const endCol = startCol + METRICS.length - 1;
        const headName = group.headName || "All";
        paintRange(
          saleRow,
          startCol,
          endCol,
          `${group.saleName || "All"}\nHead of Sale:\n${headName}`,
          groupIndex % 2 === 0 ? "#00783F" : "#009845"
        );

        METRICS.forEach((metric, metricIndex) => {
          styleCell(metricRow.getCell(startCol + metricIndex), {
            value: metric.title,
            fill: metric.color,
            color: "FFFFFFFF",
            bold: true,
            wrap: true,
          });
        });
      });

      const totals = usable.map(() => ({
        plan_qty: 0,
        plan_thb: 0,
        actual_qty: 0,
        actual_thb: 0,
      }));

      typeNames.forEach((typeName, rowIndex) => {
        const row = ws.getRow(5 + rowIndex);
        const typeCell = row.getCell(1);
        typeCell.value = typeName;
        typeCell.alignment = { vertical: "middle", horizontal: "left" };
        typeCell.border = borderThin;

        usable.forEach((group, groupIndex) => {
          const found = (group.rows || []).find((item) => item.activity_type_name === typeName);
          const startCol = 2 + groupIndex * METRICS.length;
          METRICS.forEach((metric, metricIndex) => {
            const amount = Number(found?.[metric.key]) || 0;
            totals[groupIndex][metric.key] += amount;
            const cell = row.getCell(startCol + metricIndex);
            cell.value = amount;
            cell.numFmt = metric.money ? "#,##0.00" : "#,##0";
            cell.alignment = { vertical: "middle", horizontal: "right" };
            cell.border = borderThin;
          });
        });
      });

      const totalRow = ws.getRow(5 + typeNames.length);
      const totalLabel = totalRow.getCell(1);
      totalLabel.value = "Total";
      totalLabel.font = { bold: true, color: { argb: "FFFFFFFF" } };
      totalLabel.fill = fillSolid("#978B87");
      totalLabel.border = borderThin;
      usable.forEach((_, groupIndex) => {
        const startCol = 2 + groupIndex * METRICS.length;
        METRICS.forEach((metric, metricIndex) => {
          const cell = totalRow.getCell(startCol + metricIndex);
          cell.value = totals[groupIndex][metric.key];
          cell.numFmt = metric.money ? "#,##0.00" : "#,##0";
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = fillSolid("#978B87");
          cell.alignment = { vertical: "middle", horizontal: "right" };
          cell.border = borderThin;
        });
      });

      ws.views = [{ state: "frozen", xSplit: 1, ySplit: 4 }];
      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `${safeFileName(fileName)}.xlsx`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DynamicButton
      type="button"
      onClick={handleExport}
      text={loading ? "Exporting..." : text}
      iconSrc={iconSrc}
      className={["text-white px-4 py-3 rounded-[4px] bg-[#009845]", className]
        .filter(Boolean)
        .join(" ")}
      disabled={loading}
    />
  );
}

ExportActivityExcelButton.propTypes = {
  fileName: PropTypes.string,
  text: PropTypes.string,
  iconSrc: PropTypes.string,
  className: PropTypes.string,
  getGroups: PropTypes.func,
  filterInfo: PropTypes.shape({
    areaName: PropTypes.string,
    saleName: PropTypes.string,
    dealerName: PropTypes.string,
    subDealerName: PropTypes.string,
    headName: PropTypes.string,
    yearName: PropTypes.string,
    monthName: PropTypes.string,
  }),
};
