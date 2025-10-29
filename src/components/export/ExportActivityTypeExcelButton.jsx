import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "antd";

export default function ExportActivityTypeExcelButton({
  getPayload,
  requestData,
  fileName = "Activity_Report_By_Type",
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

      // ตารางนี้ใช้ dataSource แบน: activity_type_name, total_activity_plan, total_activity_list, total_activity_actual
      const rows = (res.data?.res || []).map((x) => ({
        activity_type_name: x.activity_type_name,
        total_activity_plan: Number(x.total_activity_plan) || 0,
        total_activity_list: Number(x.total_activity_list) || 0,
        total_activity_actual: Number(x.total_activity_actual) || 0,
      }));

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");
      ws.columns = [
        { header: "Activity Type", key: "activity_type_name", width: 34 },
        { header: "Activity Plan", key: "total_activity_plan", width: 18 },
        { header: "Activity List", key: "total_activity_list", width: 18 },
        { header: "Activity Actual", key: "total_activity_actual", width: 18 },
      ];
      rows.forEach((r) => ws.addRow(r));

      const sum = (k) => rows.reduce((s, r) => s + (Number(r[k]) || 0), 0);
      const total = ws.addRow({
        activity_type_name: "Total",
        total_activity_plan: sum("total_activity_plan"),
        total_activity_list: sum("total_activity_list"),
        total_activity_actual: sum("total_activity_actual"),
      });
      total.font = { bold: true };

      // format number
      ["B", "C", "D"].forEach((col) => {
        for (let r = 2; r <= ws.rowCount; r++) ws.getCell(`${col}${r}`).numFmt = "#,##0";
      });

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
