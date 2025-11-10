import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DynamicButton from "../../components/button/DynamicButton";

const GREEN = "#00783F";
const headerCells = [
  { title: "Product Name", key: "product_name" },
  { title: "Last Stock (ctn)", key: "last" },
  { title: "Sell In (ctn)", key: "in" },
  { title: "Current Stock (ctn)", key: "current" },
  { title: "Sell Out (ctn)", key: "out" },
];

const hexToARGB = (hex) => `FF${(hex || "#FFFFFF").replace("#","").toUpperCase()}`;
const fillSolid = (hex) => ({ type: "pattern", pattern: "solid", fgColor: { argb: hexToARGB(hex) } });

export default function ExportStockExcelButton({
  getPayload,            // async () => {date, area_id, user_id, dealer_id, sub_dealer_id}
  requestData,           // (payload)=> useServiceAPI.get(paths.pathReportStock, payload)
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

      // Header
      const row = ws.getRow(1);
      headerCells.forEach((h, i) => {
        const c = row.getCell(i + 1);
        c.value = h.title;
        c.fill = fillSolid(GREEN);
        c.font = { color: { argb: "FFFFFFFF" }, bold: true };
        c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        c.border = {
          top: { style: "thin", color: { argb: "FFCCCCCC" } },
          left: { style: "thin", color: { argb: "FFCCCCCC" } },
          right: { style: "thin", color: { argb: "FFCCCCCC" } },
          bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
        };
        ws.getColumn(i + 1).width = i === 0 ? 40 : 18;
      });

      // Body
      let r = 2;
      items.forEach((it) => {
        const prod = `${it.product_name}${it.product_size ? ` (${it.product_size})` : ""}`;
        const vals = [prod, it.last, it.in, it.current, it.out].map((v) => Number(v) || (typeof v === "string" ? v : 0));
        vals.forEach((v, i) => {
          const cell = ws.getRow(r).getCell(i + 1);
          cell.value = v;
          if (i > 0) { cell.numFmt = "#,##0"; cell.alignment = { horizontal: "right" }; }
        });
        r++;
      });

      // Footer total
      const t = ws.getRow(r);
      t.getCell(1).value = "Total";
      t.getCell(1).fill = fillSolid("#978B87");
      t.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      for (let i = 2; i <= headerCells.length; i++) {
        const col = String.fromCharCode(64 + i);
        const cell = t.getCell(i);
        cell.value = { formula: `SUM(${col}2:${col}${r-1})` };
        cell.numFmt = "#,##0";
      }

      const buffer = await wb.xlsx.writeBuffer();
      const safe = (s) => String(s || "Stock_Report").replace(/[\\/:*?"<>|]+/g, "-");
      saveAs(new Blob([buffer]), `${safe(fileName)}.xlsx`);
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
