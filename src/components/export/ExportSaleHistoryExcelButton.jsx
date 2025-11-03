import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "antd";

export default function ExportSaleHistoryExcelButton({
  getExportData,  // async () => ({ months, quarters, valueRows, qtyQuarterRows, pointQuarterRows, campaignQuarterRows, fileName })
  text = "Export Excel",
  buttonProps,
}) {
  const [loading, setLoading] = useState(false);

  const numFmtTable = (ws, fromRow = 2, fromCol = 2) => {
    for (let r = fromRow; r <= ws.rowCount; r++) {
      for (let c = fromCol; c <= ws.columnCount; c++) {
        ws.getCell(r, c).numFmt = "#,##0";
        ws.getCell(r, c).alignment = { horizontal: "right" };
      }
    }
  };

  const buildSheetSimple = (wb, title, headers, rows, keyMap) => {
    const ws = wb.addWorksheet(title);
    ws.addRow(headers);
    ws.getRow(1).font = { bold: true };
    headers.forEach((_, i) => (ws.getColumn(i + 1).width = i === 0 ? 28 : 16));
    rows.forEach((r) => {
      const line = keyMap.map((k) => r[k] ?? "");
      ws.addRow(line);
    });
    numFmtTable(ws, 2, 2);
    return ws;
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const {
        months,
        quarters,
        valueRows,
        qtyQuarterRows,
        pointQuarterRows,
        campaignQuarterRows,
        fileName,
      } = await getExportData();

      const wb = new ExcelJS.Workbook();

      // Sheet 1: Value (Monthly)
      buildSheetSimple(
        wb,
        "Value (Monthly)",
        ["Product Name", "Pack Size", ...months],
        valueRows,
        ["productName", "packSize", ...months]
      );

      // Sheet 2: QTY (KG) by Quarter
      buildSheetSimple(
        wb,
        "QTY (KG) by Quarter",
        ["Product Name", "Pack Size", ...quarters],
        qtyQuarterRows,
        ["productName", "packSize", ...quarters]
      );

      // Sheet 3: Point by Quarter
      buildSheetSimple(
        wb,
        "Point by Quarter",
        ["Product Name", "Pack Size", ...quarters],
        pointQuarterRows,
        ["productName", "packSize", ...quarters]
      );

      // Sheet 4: Point Campaign by Quarter
      buildSheetSimple(
        wb,
        "Point Campaign by Quarter",
        ["Product Name", "Pack Size", ...quarters],
        campaignQuarterRows,
        ["productName", "packSize", ...quarters]
      );

      const buf = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buf]), `${fileName}.xlsx`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="primary"
      onClick={handleExport}
      loading={loading}
      {...buttonProps}
      style={{ backgroundColor: "#009845", borderColor: "#009845", ...buttonProps?.style }}
    >
      {text}
    </Button>
  );
}
