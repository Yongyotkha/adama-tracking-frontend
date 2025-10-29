import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "antd";

export default function ExportActivityExpenseExcelButton({
  getPayload,
  requestData,
  fileName = "Activity_Expenses_By_Month",
  buttonProps,
  text = "Export Excel",
}) {
  const [loading, setLoading] = useState(false);

  const fill = (hex) => ({ type: "pattern", pattern: "solid", fgColor: { argb: hex.replace("#","") } });
  const head = (cell, hex) => {
    cell.fill = fill(hex);
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const payload = await getPayload();
      const res = await requestData(payload);
      if (res?.status !== 200) throw new Error("Export failed");

      // shape จากหน้า Expense:
      // res.data.item = [{ activity_type_name, item:[{ month_id, total_activity_plan_value, expense_actual, ... }] }, ...]
      // res.data.month = [{ id, name }, ...]
      const activityTypes = res.data?.item || [];
      const months = res.data?.month || [];

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");

      // header 2 ชั้น
      const top = ["Activity Name"];
      const sub = [""];
      months.forEach((m) => { top.push(m.name, m.name); sub.push("Plan (Value)", "Actual (Value)"); });
      ws.addRow(top);
      ws.addRow(sub);

      head(ws.getCell(1,1), "#00783F");
      head(ws.getCell(2,1), "#00783F");
      ws.mergeCells(1,1,2,1);
      ws.getColumn(1).width = 28;

      let col = 2;
      months.forEach((m, idx) => {
        const mainColor = idx % 2 === 1 ? "#7DB41E" : "#009845";
        ws.mergeCells(1, col, 1, col + 1);
        head(ws.getCell(1, col), mainColor);
        head(ws.getCell(1, col + 1), mainColor);
        head(ws.getCell(2, col), mainColor);
        head(ws.getCell(2, col + 1), mainColor);
        ws.getColumn(col).width = 16;
        ws.getColumn(col + 1).width = 16;
        col += 2;
      });

      // body
      activityTypes.forEach((act) => {
        const line = [act.activity_type_name];
        months.forEach((m) => {
          const hit = (act.item || []).find((i) => i.month_id === m.id) || {};
          const planVal = Number((hit.total_activity_plan_value || "0").toString().replace(/,/g,"")) || 0;
          const actualVal = Number((hit.expense_actual || "0").toString().replace(/,/g,"")) || 0;
          line.push(planVal, actualVal);
        });
        ws.addRow(line);
      });

      // total row
      const totals = ["Total (THB)"];
      months.forEach((m) => {
        const sumPlan = activityTypes.reduce((s, act) => {
          const hit = (act.item || []).find((i) => i.month_id === m.id);
          const v = Number((hit?.total_activity_plan_value || "0").toString().replace(/,/g,"")) || 0;
        return s + v;}, 0);
        const sumActual = activityTypes.reduce((s, act) => {
          const hit = (act.item || []).find((i) => i.month_id === m.id);
          const v = Number((hit?.expense_actual || "0").toString().replace(/,/g,"")) || 0;
        return s + v;}, 0);
        totals.push(sumPlan, sumActual);
      });
      const tr = ws.addRow(totals);
      tr.font = { bold: true };

      // number formats
      for (let c = 2; c <= ws.columnCount; c++) {
        for (let r = 3; r <= ws.rowCount; r++) ws.getCell(r, c).numFmt = "#,##0";
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
