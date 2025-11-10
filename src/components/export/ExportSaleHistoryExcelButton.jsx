// src/components/export/ExportSaleHistoryExcelButton.jsx
import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DynamicButton from "../button/DynamicButton";

// ===== Theme =====
const GREEN_A = "#00783F";
const GREEN_B = "#009845";
const GRAY_SUM = "#978B87";

const MONTHS_FULL = [
  "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.",
  "Jul", "Aug.", "Sept.", "Oct.", "Nov.", "Dec.",
];
const MONTH_KEY_MAP = {
  "Jan.":"M01","Feb.":"M02","Mar.":"M03","Apr.":"M04","May":"M05","Jun.":"M06",
  "Jul":"M07","Aug.":"M08","Sept.":"M09","Oct.":"M10","Nov.":"M11","Dec.":"M12",
};
const QUARTERS = [
  { id: "Q1", title: "Quarter 1", months: ["Jan.","Feb.","Mar."] },
  { id: "Q2", title: "Quarter 2", months: ["Apr.","May","Jun."] },
  { id: "Q3", title: "Quarter 3", months: ["Jul","Aug.","Sept."] },
  { id: "Q4", title: "Quarter 4", months: ["Oct.","Nov.","Dec."] },
];

// ===== Helpers =====
const hexToARGB = (hex) => `FF${(hex || "#FFFFFF").replace("#","").slice(0,6).toUpperCase()}`;
const fillSolid = (hex) => ({ type: "pattern", pattern: "solid", fgColor: { argb: hexToARGB(hex) } });

const setHeaderCell = (cell, bgHex, align = "center") => {
  cell.fill = fillSolid(bgHex);
  cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
  cell.alignment = { vertical: "middle", horizontal: align, wrapText: true };
  cell.border = {
    top: { style: "thin", color: { argb: "FFCCCCCC" } },
    left: { style: "thin", color: { argb: "FFCCCCCC" } },
    right: { style: "thin", color: { argb: "FFCCCCCC" } },
    bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
  };
};
const setBodyNumber = (cell) => { cell.numFmt = "#,##0"; cell.alignment = { horizontal: "right" }; };
const setBodyText   = (cell) => { cell.alignment = { horizontal: "left" }; };
const safeFileName  = (s) => String(s || "Sales_History").replace(/[\\/:*?"<>|]+/g, "-");

// number -> Excel column letter (1=A, 27=AA)
const n2l = (n) => { let s=""; while(n>0){const m=(n-1)%26; s=String.fromCharCode(65+m)+s; n=Math.floor((n-1)/26);} return s; };

// ===== Component =====
/**
 * Export รายงาน History ให้หัวตารางเหมือน UI:
 * - แถว 1: "Quarter" (A:B merge) + Q1/Q2/Q3/Q4 (merge ทีละ 3 คอลัมน์)
 * - แถว 2: "Total (Value)" (A:B merge) + ค่า Total ต่อ Quarter (merge ทีละ 3 คอลัมน์)
 * - แถว 3-4: หัว "Month" 2 ชั้น + "Value (THB)" รายเดือน
 */
export default function ExportSaleHistoryExcelButton({
  getPayload,            // async () => payload
  requestData,           // (payload) => axios.get(...)
  fileName = "Sales_History",
  text = "Export Excel",
  iconSrc = "/img/icons/excel.png",
  className,
}) {
  const [loading, setLoading] = useState(false);

  // รวมค่า quarter จาก products
  const quarterTotal = (products, quarterMonths) =>
    quarterMonths.reduce((acc, m) => {
      const key = MONTH_KEY_MAP[m];
      const sumM = products.reduce((a, p) => a + (Number(p?.[key] ?? 0) || 0), 0);
      return acc + sumM;
    }, 0);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const payload = await getPayload();
      const res = await requestData(payload);
      const products = Array.isArray(res?.data?.products) ? res.data.products : [];

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Sales History");

      // ===== Column widths =====
      ws.getColumn(1).width = 28; // Product Name
      ws.getColumn(2).width = 16; // Pack Size
      MONTHS_FULL.forEach((_, i) => ws.getColumn(3 + i).width = 18);

      // ---- Row 1: Quarter band
      ws.mergeCells(1, 1, 1, 2); // A1:B1
      setHeaderCell(ws.getCell(1, 1), GREEN_A); ws.getCell(1, 1).value = "Quarter";

      QUARTERS.forEach((q, qi) => {
        const startCol = 3 + qi * 3;      // C,F,I,L
        const endCol   = startCol + 2;    // E,H,K,N
        ws.mergeCells(1, startCol, 1, endCol);
        setHeaderCell(ws.getCell(1, startCol), (qi % 2 === 0) ? GREEN_B : GREEN_A);
        ws.getCell(1, startCol).value = q.title;
      });

      // ---- Row 2: Quarter totals
      ws.mergeCells(2, 1, 2, 2); // A2:B2
      setHeaderCell(ws.getCell(2, 1), GREEN_A); ws.getCell(2, 1).value = "Total (Value)";

      QUARTERS.forEach((q, qi) => {
        const startCol = 3 + qi * 3;
        const endCol   = startCol + 2;
        ws.mergeCells(2, startCol, 2, endCol);
        const c = ws.getCell(2, startCol);
        c.value = quarterTotal(products, q.months);
        c.numFmt = "#,##0";
        c.alignment = { horizontal: "right", vertical: "middle" };
        c.fill = fillSolid("#FFFFFF");
        c.border = {
          top: { style: "thin", color: { argb: "FFCCCCCC" } },
          left: { style: "thin", color: { argb: "FFCCCCCC" } },
          right: { style: "thin", color: { argb: "FFCCCCCC" } },
          bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
        };
      });

      // ---- Row 3-4: Month header (2 ชั้น)
      // Row 3 group
      ws.mergeCells(3, 1, 3, 2);
      setHeaderCell(ws.getCell(3, 1), GREEN_A); ws.getCell(3, 1).value = "Month";

      MONTHS_FULL.forEach((m, idx) => {
        const col = 3 + idx;
        setHeaderCell(ws.getCell(3, col), (idx % 2 === 0) ? GREEN_B : GREEN_A);
        ws.getCell(3, col).value = m;
      });

      // Row 4 sub-header
      setHeaderCell(ws.getCell(4, 1), GREEN_A); ws.getCell(4, 1).value = "Product Name";
      setHeaderCell(ws.getCell(4, 2), GREEN_A); ws.getCell(4, 2).value = "Pack Size";
      MONTHS_FULL.forEach((_, idx) => {
        const col = 3 + idx;
        setHeaderCell(ws.getCell(4, col), (idx % 2 === 0) ? GREEN_B : GREEN_A);
        ws.getCell(4, col).value = "Value (THB)";
      });

      // Freeze จนถึงหัวแถว (Row 4)
      ws.views = [{ state: "frozen", ySplit: 4 }];

      // ---- Body rows
      let row = 5;
      products.forEach((p) => {
        const r = ws.getRow(row);
        r.getCell(1).value = p.product_name || "";
        r.getCell(2).value = p.product_unit || "";
        setBodyText(r.getCell(1));
        setBodyText(r.getCell(2));

        MONTHS_FULL.forEach((m, i) => {
          const key = MONTH_KEY_MAP[m];
          const c = r.getCell(3 + i);
          const v = Number(p?.[key] ?? 0);
          c.value = Number.isFinite(v) ? v : 0;
          setBodyNumber(c);
        });

        row += 1;
      });

      // ---- Footer total by month
      const totalRow = ws.getRow(row);
      totalRow.getCell(1).value = "Total";
      totalRow.getCell(1).fill = fillSolid(GRAY_SUM);
      totalRow.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      totalRow.getCell(1).alignment = { horizontal: "left" };

      MONTHS_FULL.forEach((_, i) => {
        const colIdx = 3 + i;
        const colL = n2l(colIdx);
        const c = totalRow.getCell(colIdx);
        c.value = { formula: `SUM(${colL}5:${colL}${row - 1})` };
        setBodyNumber(c);
      });

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `${safeFileName(fileName)}.xlsx`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DynamicButton
      onClick={handleExport}
      text={loading ? "Exporting..." : text}
      iconSrc={iconSrc}
      className={className || "text-white px-4 py-3 rounded-[4px] bg-[#009845]"}
      disabled={loading}
    />
  );
}
