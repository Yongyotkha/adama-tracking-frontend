import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DynamicButton from "../../components/button/DynamicButton";

const GREEN = "#00783F";
const TOTAL_ROW = "#978B87";

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

export default function ExportFarmerSalesExcelButton({
  rows = [],
  fileName = "Farmer_Sales_Report",
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
      const ws = wb.addWorksheet("Farmer Sales");

      const headers = ["Product Name", "Pack Size", "Actual (KG)", "Actual (Point)", "Actual (Baht)"];
      const header = ws.getRow(1);
      header.height = 22;

      headers.forEach((title, idx) => {
        const cell = header.getCell(idx + 1);
        cell.value = title;
        cell.fill = fillSolid(GREEN);
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = borderThin;
        ws.getColumn(idx + 1).width = idx === 0 ? 26 : 18;
      });

      rows.forEach((row, idx) => {
        const r = ws.getRow(idx + 2);
        r.getCell(1).value = row.product_name || "-";
        r.getCell(2).value = row.pack_size || "-";
        r.getCell(3).value = Number(row.actual_kg) || 0;
        r.getCell(4).value = Number(row.actual_point) || 0;
        r.getCell(5).value = Number(row.actual_bath) || 0;

        r.eachCell((cell, colNumber) => {
          cell.border = borderThin;
          cell.alignment = {
            vertical: "middle",
            horizontal: colNumber === 1 || colNumber === 2 ? "left" : "right",
          };
        });
      });

      const totalRow = ws.getRow(rows.length + 2);
      totalRow.getCell(1).value = "Total";
      totalRow.getCell(1).fill = fillSolid(TOTAL_ROW);
      totalRow.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      totalRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
      totalRow.getCell(1).border = borderThin;

      [3, 4, 5].forEach((col, index) => {
        const sum = rows.reduce((acc, row) => acc + (Number(row[["actual_kg", "actual_point", "actual_bath"][index]]) || 0), 0);
        const cell = totalRow.getCell(col);
        cell.value = sum;
        cell.fill = fillSolid(TOTAL_ROW);
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "right" };
        cell.border = borderThin;
      });

      ws.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `${String(fileName).replace(/[\\/:*?"<>|]+/g, "-")}.xlsx`);
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
