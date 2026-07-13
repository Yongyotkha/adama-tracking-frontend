import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DynamicButton from "../../components/button/DynamicButton";

const GREEN = "#00783F";

const borderThin = {
  top: { style: "thin", color: { argb: "FFCCCCCC" } },
  left: { style: "thin", color: { argb: "FFCCCCCC" } },
  right: { style: "thin", color: { argb: "FFCCCCCC" } },
  bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
};

const fillSolid = (hex) => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: `FF${hex.replace("#", "").toUpperCase()}` },
});

export default function ExportCollectPointsExcelButton({
  rows = [],
  fileName = "PointCollection",
  text = "Export Excel",
  iconSrc = "/img/icons/excel.png",
  className,
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Point Collection");

      const columns = [
        { header: "No", key: "no", width: 8, align: "center" },
        { header: "Document No", key: "orderNo", width: 22, align: "left" },
        { header: "Sales", key: "sale", width: 28, align: "left" },
        { header: "Dealer", key: "dealer", width: 28, align: "left" },
        { header: "Sub Dealer", key: "sub_dealer", width: 28, align: "left" },
        { header: "Value (THB)", key: "value", width: 18, align: "right" },
        { header: "Order Date", key: "orderDate", width: 16, align: "center" },
        { header: "Points", key: "pointRaw", width: 14, align: "right" },
        { header: "Status", key: "statusText", width: 22, align: "left" },
      ];

      const headerRow = ws.getRow(1);
      headerRow.height = 24;
      columns.forEach((col, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = col.header;
        cell.fill = fillSolid(GREEN);
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: col.align, wrapText: true };
        cell.border = borderThin;
        ws.getColumn(idx + 1).width = col.width;
      });

      rows.forEach((row, rowIdx) => {
        const r = ws.getRow(rowIdx + 2);
        const valueNum = parseFloat(String(row.value || "0").replace(/,/g, "")) || 0;
        const pointNum = parseFloat(row.pointRaw ?? row.point ?? 0) || 0;
        r.getCell(1).value = row.no ?? rowIdx + 1;
        r.getCell(2).value = row.orderNo || "";
        r.getCell(3).value = row.sale || "";
        r.getCell(4).value = row.dealer || "";
        r.getCell(5).value = row.sub_dealer || "";
        r.getCell(6).value = valueNum;
        r.getCell(7).value = row.orderDate || "";
        r.getCell(8).value = pointNum;
        r.getCell(9).value = row.statusText || "";
        columns.forEach((col, colIdx) => {
          const cell = r.getCell(colIdx + 1);
          cell.border = borderThin;
          cell.alignment = { vertical: "middle", horizontal: col.align };
          if (colIdx === 5 || colIdx === 7) {
            cell.numFmt = "#,##0.00";
          }
        });
      });

      ws.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
      const buffer = await wb.xlsx.writeBuffer();
      const safeName = String(fileName).replace(/[\\/:*?"<>|]+/g, "-");
      saveAs(new Blob([buffer]), `${safeName}.xlsx`);
    } catch (e) {
      console.error("Export error:", e);
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
