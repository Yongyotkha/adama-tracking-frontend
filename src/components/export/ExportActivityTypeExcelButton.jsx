import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DynamicButton from "../../components/button/DynamicButton";

export default function ExportActivityTypeExcelButton({
  getPayload,
  requestData,
  fileName = "Activity_Report_By_Type",
  buttonProps,
  text = "Export Excel",
  iconSrc = "/img/icons/excel.png",
  className,
}) {
  const [loading, setLoading] = useState(false);

  // ===== Colors (ให้เหมือนหน้า report) =====
  const colorMainA = "#00783F"; // Activity Type
  const colorPlan = "#009845";  // Activity Plan
  const colorList = "#7DB41E";  // Activity List
  const colorActual = "#93CC23"; // Activity Actual
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

  const setHeaderStyle = (cell, bgHex, align = "center") => {
    cell.fill = fillSolid(bgHex);
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    cell.alignment = { vertical: "middle", horizontal: align, wrapText: true };
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

  // ===== Mapping API -> row (เหมือนหน้าเว็บ) =====
  const mapApiToRows = (apiRes) =>
    (apiRes?.data?.res || []).map((item) => ({
      activity_type_name: item.activity_type_name,
      unit_convert_value: parseFloat(item.unit_convert_value) || 0, // THB ต่อ 1 activity
      total_activity_plan: Number(item.total_activity_plan) || 0,
      total_activity_list: Number(item.total_activity_list) || 0,
      total_activity_actual: Number(item.total_activity_actual) || 0,
    }));

  const calcTotalsTHB = (rows) =>
    rows.reduce(
      (acc, r) => {
        const price = Number(r.unit_convert_value) || 0;
        acc.plan += (Number(r.total_activity_plan) || 0) * price;
        acc.list += (Number(r.total_activity_list) || 0) * price;
        acc.actual += (Number(r.total_activity_actual) || 0) * price;
        return acc;
      },
      { plan: 0, list: 0, actual: 0 }
    );

  const safeFileName = (v) =>
    (typeof v === "string" && v.trim() ? v.trim() : "Activity_Report_By_Type")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "_");

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // payload เดียวกับหน้าเว็บ (มาจาก getPayload ใน ReportActivityByType.jsx)
      const payload = await getPayload();

      // ===== 1) ดึง rows สำหรับ list (ใช้ territory ตามที่เลือก) =====
      const resList = await requestData({
        ...payload,
        page_length: 1,
        page_size: 100000,
      });
      if (resList?.status !== 200) throw new Error("Export failed (list)");

      const listRows = mapApiToRows(resList);

      // ===== 2) ดึง totals แบบ Sale Total (ไม่กรอง territory) =====
      const resSaleTotal = await requestData({
        ...payload,
        territory: null, // ❗ ตรงกับหน้าเว็บ: total ระดับ sale
        page_length: 1,
        page_size: 100000,
      });
      if (resSaleTotal?.status !== 200) throw new Error("Export failed (sale totals)");

      const saleRows = mapApiToRows(resSaleTotal);
      const totals = calcTotalsTHB(saleRows); // ✅ THB totals ตรง footer หน้าเว็บ

      // ===== Build Excel =====
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");

      // Column widths
      ws.getColumn(1).width = 34;
      ws.getColumn(2).width = 18;
      ws.getColumn(3).width = 18;
      ws.getColumn(4).width = 18;

      // Header row
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

      // Body
      let rowIdx = 2;
      listRows.forEach((r) => {
        const row = ws.getRow(rowIdx++);

        row.getCell(1).value = r.activity_type_name || "";
        setBodyText(row.getCell(1));

        // ✅ หน้าเว็บแสดง qty (ไม่ใช่ THB) ในแต่ละแถว
        row.getCell(2).value = Number(r.total_activity_plan) || 0;
        row.getCell(3).value = Number(r.total_activity_list) || 0;
        row.getCell(4).value = Number(r.total_activity_actual) || 0;
        setBodyNumber(row.getCell(2));
        setBodyNumber(row.getCell(3));
        setBodyNumber(row.getCell(4));
      });

      // Total row (THB) — ให้เหมือน footer หน้าเว็บ
      const totalRow = ws.getRow(rowIdx);
      totalRow.getCell(1).value = "Total (THB)";
      totalRow.getCell(1).fill = fillSolid(colorTotalRow);
      totalRow.getCell(1).font = { color: { argb: "FFFFFFFF" }, bold: true };
      totalRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
      totalRow.getCell(1).border = borderThin;

      const totalCells = [
        { cell: totalRow.getCell(2), val: totals.plan, color: colorTotalRow },
        { cell: totalRow.getCell(3), val: totals.list, color: colorTotalRow },
        { cell: totalRow.getCell(4), val: totals.actual, color: colorTotalRow },
      ];

      totalCells.forEach(({ cell, val, color }) => {
        cell.value = Number(val) || 0;
        cell.numFmt = "#,##0";
        cell.fill = fillSolid(color);
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: "right" };
        cell.border = borderThin;
      });

      // ✅ Freeze header + freeze first column (เหมือนตัวอย่างที่ดี)
      ws.views = [{ state: "frozen", xSplit: 1, ySplit: 1 }];

      const buf = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buf]), `${safeFileName(fileName)}.xlsx`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const baseClass = "text-white px-4 py-3 rounded-[4px] bg-[#009845]";
  const combinedClass = [baseClass, buttonProps?.className, className].filter(Boolean).join(" ");

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
