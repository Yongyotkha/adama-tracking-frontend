import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DynamicButton from "../../components/button/DynamicButton";

const GREEN_A = "#00783F";
const GREEN_B = "#009845";
const ROLLING = "#7DB41E";
const ACTUAL = "#93CC23";

const monthsEN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const subCols = [
  { title: "Last Stock", key: "last", colorType: "main" },
  { title: "Sell In", key: "in", colorType: "main" },
  { title: "Current Stock", key: "current", colorType: "main" },
  { title: "Sell Out", key: "out", colorType: "main" },
];

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
const setHeaderStyle = (cell, bgHex, align = "center") => {
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
const setNum = (cell) => { cell.numFmt = "#,##0"; cell.alignment = { horizontal: "right" }; };
const setText = (cell) => { cell.alignment = { horizontal: "left" }; };

export default function ExportSellOutExcelButton({
  getPayload,            // async () => payload { year, area_id, user_id, dealer_id, sub_dealer_id }
  requestData,           // (payload) => useServiceAPI.get(paths.pathReportSellOut, payload)
  fileName = "SellOut_Report",
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
      const groups = res?.data || [];

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");

      // Header rows
      const r1 = ws.getRow(1);
      const r2 = ws.getRow(2);
      r1.getCell(1).value = "Group / Sub Dealer";
      r2.getCell(1).value = "Name";
      setHeaderStyle(r1.getCell(1), GREEN_A, "left");
      setHeaderStyle(r2.getCell(1), GREEN_A, "left");
      ws.mergeCells(1, 1, 2, 1);
      ws.getColumn(1).width = 32;

      let col = 2;
      monthsEN.forEach((m, idx) => {
        const start = col;
        r1.getCell(col).value = m;
        setHeaderStyle(r1.getCell(col), idx % 2 === 0 ? GREEN_B : GREEN_A);
        subCols.forEach((sc, j) => {
          const c = ws.getCell(2, col + j);
          c.value = sc.title;
          const bg = (sc.colorType === "main")
            ? (idx % 2 === 0 ? GREEN_B : GREEN_A)
            : (sc.colorType === "rolling" ? ROLLING : ACTUAL);
          setHeaderStyle(c, bg);
          ws.getColumn(col + j).width = 16;
        });
        ws.mergeCells(1, start, 1, start + subCols.length - 1);
        col += subCols.length;
      });

      // Body
      let rowIdx = 3;
      groups.forEach((g, gi) => {
        const r = ws.getRow(rowIdx++);
        const name = g.group_name || "All";
        r.getCell(1).value = name;
        setText(r.getCell(1));

        let c = 2;
        for (let i = 1; i <= 12; i++) {
          const m = g.months?.[String(i)] || g.months?.[i] || {};
          const vals = [m.last, m.in, m.current, m.out];
          vals.forEach((v, j) => {
            const cell = r.getCell(c + j);
            cell.value = Number(v) || 0;
            setNum(cell);
          });
          c += subCols.length;
        }
      });

      // Summary row
      const sumRow = ws.addRow([]);
      sumRow.getCell(1).value = "Total";
      sumRow.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sumRow.getCell(1).fill = fillSolid("#978B87");
      sumRow.getCell(1).alignment = { horizontal: "left" };

      let c2 = 2;
      monthsEN.forEach((_, idx) => {
        // รวมตรง ๆ จาก groups
        const sums = subCols.map((sc) => {
          const monthIndex = idx + 1;
          return groups.reduce((acc, g) => {
            const m = g.months?.[String(monthIndex)] || g.months?.[monthIndex] || {};
            return acc + (Number(m[sc.key]) || 0);
          }, 0);
        });
        sums.forEach((v) => {
          const cell = sumRow.getCell(c2++);
          cell.value = v || 0;
          setNum(cell);
          cell.fill = fillSolid(idx % 2 === 0 ? GREEN_B : GREEN_A);
          cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        });
      });

      ws.views = [{ state: "frozen", xSplit: 1, ySplit: 2 }];

      const buffer = await wb.xlsx.writeBuffer();
      const safe = (s) => String(s || "SellOut_Report").replace(/[\\/:*?"<>|]+/g, "-");
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
