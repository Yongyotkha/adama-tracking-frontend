// src/components/export/ExportStockExcelButton.jsx
import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DynamicButton from "../../components/button/DynamicButton";

const GREEN = "#00783F";
const TOTAL_ROW = "#978B87";

const headerCells = [
  { title: "Product List", key: "product_name", width: 40, align: "left" },
  { title: "Last Stock (ctn)", key: "last", width: 18, align: "right" },
  { title: "Sell In (ctn)", key: "in", width: 18, align: "right" },
  { title: "Current Stock (ctn)", key: "current", width: 18, align: "right" },
  { title: "Sell Out (ctn)", key: "out", width: 18, align: "right" },
];

const hexToARGB = (hex) => {
  const v = (hex || "#FFFFFF").replace("#", "").trim();
  return `FF${v.toUpperCase()}`;
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

const safeFile = (s) =>
  String(s || "Stock_Report").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "_");

const numOrNullIfZero = (v) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  if (!Number.isFinite(n) || n === 0) return null; // ให้แสดงว่าง แล้วใส่ "-" ด้วย numFmt
  return n;
};

export default function ExportStockExcelButton({
  getPayload,
  requestData,
  fileName = "Stock_Report",
  text = "Export Excel",
  iconSrc = "/img/icons/excel.png",
  className,
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const payload = await getPayload();
      const res = await requestData(payload);
      const items = res?.data || [];

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Stock");

      // ===== Header (เขียวเหมือนเว็บ) =====
      const hr = ws.getRow(1);
      hr.height = 22;

      headerCells.forEach((h, i) => {
        const c = hr.getCell(i + 1);
        c.value = h.title;
        c.fill = fillSolid(GREEN);
        c.font = { color: { argb: "FFFFFFFF" }, bold: true };
        c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        c.border = borderThin;
        ws.getColumn(i + 1).width = h.width;
      });

      // ===== Body =====
      let r = 2;

      // รวม total THB จาก API fields: total_last/total_in/total_current/total_out
      const safeNum = (v) => Number(String(v ?? 0).replace(/,/g, "")) || 0;
      let tLast = 0, tIn = 0, tCurrent = 0, tOut = 0;

      items.forEach((it) => {
        const row = ws.getRow(r);

        const prod = `${it.product_name}${it.product_size ? ` (${it.product_size})` : ""}`;
        row.getCell(1).value = prod;
        row.getCell(1).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        row.getCell(1).border = borderThin;

        const qtyVals = [it.last, it.in, it.current, it.out].map(numOrNullIfZero);

        qtyVals.forEach((v, idx) => {
          const cell = row.getCell(idx + 2);
          cell.value = v;                 // null -> จะไม่โชว์ตัวเลข
          cell.numFmt = '#,##0;-#,##0;"-";@'; // ✅ 0/ว่าง = "-"
          cell.alignment = { vertical: "middle", horizontal: "right" };
          cell.border = borderThin;
        });

        // accumulate totals (THB)
        tLast += safeNum(it.total_last);
        tIn += safeNum(it.total_in);
        tCurrent += safeNum(it.total_current);
        tOut += safeNum(it.total_out);

        r++;
      });

      // ===== Footer Total (THB) — สีเทาเหมือนเว็บ + ช่องเลขพื้นขาว =====
      const tr = ws.getRow(r);
      tr.height = 20;

      const label = tr.getCell(1);
      label.value = "Total (THB)";
      label.fill = fillSolid(TOTAL_ROW);
      label.font = { bold: true, color: { argb: "FFFFFFFF" } };
      label.alignment = { vertical: "middle", horizontal: "left" };
      label.border = borderThin;

      const totals = [tLast, tIn, tCurrent, tOut];
      totals.forEach((v, idx) => {
        const cell = tr.getCell(idx + 2);

        cell.value = v === 0 ? null : v;               // 0 => "-"
        cell.numFmt = '#,##0;-#,##0;"-";@';

        // ✅ พื้น #978B87 + ตัวหนังสือขาว
        cell.fill = fillSolid(TOTAL_ROW);
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };

        cell.alignment = { vertical: "middle", horizontal: "right" };
        cell.border = borderThin;
      });


      // Freeze header + first column (เหมือนรายงานอื่น)
      ws.views = [{ state: "frozen", xSplit: 1, ySplit: 1 }];

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `${safeFile(fileName)}.xlsx`);
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
