// src/components/export/ExportActivityTypeExcelButton.jsx
import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DynamicButton from "../../components/button/DynamicButton";

export default function ExportActivityTypeExcelButton({
  rows = [],
  totals = {},
  fileName = "Activity_Report_By_Type",
  buttonProps,
  text = "Export Excel",
  iconSrc = "/img/icons/excel.png",
  className,
}) {
  const [loading, setLoading] = useState(false);

  // ===== Colors (ตรงกับหน้า Report) =====
  const colorMainA = "#00783F";   // Activity Type
  const colorPlan = "#009845";    // Activity Plan
  const colorList = "#7DB41E";    // Activity List
  const colorActual = "#93CC23";  // Activity Actual
  const colorTotalRow = "#978B87";

  const hexToARGB = (hex) => {
    const v = (hex || "").replace("#", "").trim();
    if (v.length === 6) return `FF${v.toUpperCase()}`;
    if (v.length === 8) return v.toUpperCase();
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

  const setHeaderStyle = (cell, bgHex) => {
    cell.fill = fillSolid(bgHex);
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = borderThin;
  };

  const setBodyText = (cell) => {
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = borderThin;
  };

  const setBodyNumber = (cell) => {
    cell.numFmt = "#,##0";
    cell.alignment = { vertical: "middle", horizontal: "right" };
    cell.border = borderThin;
  };

  const safeFileName = (v) =>
    (typeof v === "string" && v.trim() ? v.trim() : "Activity_Report_By_Type")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "_");

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");

      // Column widths
      ws.getColumn(1).width = 34;
      ws.getColumn(2).width = 18;
      ws.getColumn(3).width = 18;
      ws.getColumn(4).width = 18;

      // ===== Header =====
      const headerRow = ws.getRow(1);
      headerRow.height = 22;

      headerRow.getCell(1).value = "Activity Type";
      headerRow.getCell(2).value = "Activity Plan";
      headerRow.getCell(3).value = "Activity List";
      headerRow.getCell(4).value = "Activity Actual";

      setHeaderStyle(headerRow.getCell(1), colorMainA);
      setHeaderStyle(headerRow.getCell(2), colorPlan);
      setHeaderStyle(headerRow.getCell(3), colorList);
      setHeaderStyle(headerRow.getCell(4), colorActual);

      // ===== Body (qty ตามหน้าเว็บ) =====
      let rowIdx = 2;
      rows.forEach((r) => {
        const row = ws.getRow(rowIdx++);

        row.getCell(1).value = r.activity_type_name || "";
        setBodyText(row.getCell(1));

        row.getCell(2).value = Number(r.total_activity_plan) || 0;
        row.getCell(3).value = Number(r.total_activity_list) || 0;
        row.getCell(4).value = Number(r.total_activity_actual) || 0;

        setBodyNumber(row.getCell(2));
        setBodyNumber(row.getCell(3));
        setBodyNumber(row.getCell(4));
      });

      // ===== Total Row (THB) =====
      const totalRow = ws.getRow(rowIdx);

      totalRow.getCell(1).value = "Total (THB)";
      totalRow.getCell(1).fill = fillSolid(colorTotalRow);
      totalRow.getCell(1).font = { color: { argb: "FFFFFFFF" }, bold: true };
      totalRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
      totalRow.getCell(1).border = borderThin;

      [
        { cell: totalRow.getCell(2), val: totals.total_activity_plan },
        { cell: totalRow.getCell(3), val: totals.total_activity_list },
        { cell: totalRow.getCell(4), val: totals.total_activity_actual },
      ].forEach(({ cell, val }) => {
        cell.value = Number(val) || 0;
        cell.numFmt = "#,##0";
        cell.fill = fillSolid(colorTotalRow);
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: "right" };
        cell.border = borderThin;
      });

      // ===== Freeze header + first column =====
      ws.views = [{ state: "frozen", xSplit: 1, ySplit: 1 }];

      const buf = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buf]), `${safeFileName(fileName)}.xlsx`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const baseClass = "text-white px-4 py-3 rounded-[4px] bg-[#009845]";
  const combinedClass = [baseClass, buttonProps?.className, className]
    .filter(Boolean)
    .join(" ");

  return (
    <DynamicButton
      type="button"
      onClick={handleExport}
      text={loading ? "Exporting..." : text}
      iconSrc={iconSrc}
      className={combinedClass}
      disabled={loading}
    />
  );
}
