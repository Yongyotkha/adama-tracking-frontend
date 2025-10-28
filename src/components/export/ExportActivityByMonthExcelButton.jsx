import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "antd";

export default function ExportActivityByMonthExcelButton({
  getPayload,
  requestData,
  fileName = "Activity_Report_By_Month",
  buttonProps,
  text = "Export Excel",
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const payload = await getPayload();
      const res = await requestData({ ...payload, page_length: 1, page_size: 100000 });
      if (res?.status !== 200) throw new Error("Export failed");

      // response.data: { item: [{month_name, item:[{activity_type_id,total}, ...]}], total: [{activity_type_id, activity_type_name, total_value}] }
      const items = res.data?.item || [];
      const totals = res.data?.total || [];

      const activityHeaders = totals.map((t) => ({
        id: t.activity_type_id,
        name: t.activity_type_name,
        total: Number(t.total_value) || 0,
      }));

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");

      ws.getRow(1).values = ["Month", ...activityHeaders.map((h) => h.name)];
      ws.columns = [{ key: "m", width: 18 }, ...activityHeaders.map(() => ({ width: 16 }))];

      items.forEach((row) => {
        const line = [row.month_name];
        activityHeaders.forEach((h) => {
          const hit = (row.item || []).find((x) => x.activity_type_id === h.id);
          line.push(Number(hit?.total ?? 0));
        });
        ws.addRow(line);
      });

      const tr = ws.addRow(["Total", ...activityHeaders.map((h) => h.total)]);
      tr.font = { bold: true };

      // number fmt
      for (let c = 2; c <= ws.columnCount; c++) {
        for (let r = 2; r <= ws.rowCount; r++) ws.getCell(r, c).numFmt = "#,##0";
      }

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
