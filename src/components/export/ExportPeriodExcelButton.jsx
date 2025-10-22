import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "antd";

/**
 * ปุ่ม Export Excel สำหรับรายงานที่มีหัวกลุ่ม (เดือน/ไตรมาส) + 6 sub-columns ต่อกลุ่ม
 * Props:
 * - getPayload: () => Promise<payload>        // คืน payload รวมฟิลเตอร์ล่าสุด
 * - requestData: (payload) => Promise<resp>   // ฟังก์ชันยิง API แล้วคืน { status, data }
 * - fileName?: string                         // ชื่อไฟล์ .xlsx (ไม่ต้องใส่นามสกุล)
 * - leftTopTitle?: string                     // หัวซ้ายบน เช่น "Month" / "Quarter"
 * - text?: string                             // ข้อความบนปุ่ม
 * - buttonProps?: any                         // antd Button props
 */
export default function ExportPeriodExcelButton({
  getPayload,
  requestData,
  fileName = "Sales_Report",
  leftTopTitle = "Month",
  text = "Export Excel",
  buttonProps,
}) {
  const [loading, setLoading] = useState(false);

  const colorMainA = "#00783F"; // เขียวเข้ม (สลับ)
  const colorMainB = "#009845"; // เขียวสด (สลับ)
  const colorRolling = "#7DB41E";
  const colorActual = "#93CC23";

  const fillSolid = (hex) => ({
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: hex.replace("#", "") },
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

  const setBodyNumber = (cell) => {
    cell.numFmt = "#,##0";
    cell.alignment = { horizontal: "right" };
  };
  const setBodyText = (cell) => (cell.alignment = { horizontal: "left" });

  const handleExport = async () => {
    setLoading(true);
    try {
      // 1) รวม payload ล่าสุดจากฟอร์ม/ฟิลเตอร์
      const payload = await getPayload();
      const exportPayload = {
        ...payload,
        page_length: 1,
        page_size: 100000, // เอาให้ครบ ไม่แบ่งหน้า
      };

      // 2) ดึงข้อมูลตามฟิลเตอร์ล่าสุด
      const response = await requestData(exportPayload);
      if (response?.status !== 200) throw new Error("Export failed");
      const { items = [], data_items = [] } = response.data || {};

      // 3) เริ่มสร้างไฟล์
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");

      const subCols = [
        { title: "Work Plan(KG)", type: "workplan_qty", colorType: "main" },
        { title: "Rolling Forecast(KG)", type: "rolling_qty", colorType: "rolling" },
        { title: "Actual(KG)", type: "actual_qty", colorType: "actual" },
        { title: "Work Plan(Value)", type: "workplan_value", colorType: "main" },
        { title: "Rolling Forecast(Value)", type: "rolling_value", colorType: "rolling" },
        { title: "Actual(Value)", type: "actual_value", colorType: "actual" },
      ];

      // แถวหัว 2 ชั้น
      const r1 = ws.getRow(1);
      const r2 = ws.getRow(2);

      r1.getCell(1).value = leftTopTitle; // เช่น Quarter
      r2.getCell(1).value = "Product Name";
      setHeaderStyle(r1.getCell(1), colorMainA);
      setHeaderStyle(r2.getCell(1), colorMainA);
      ws.mergeCells(1, 1, 2, 1);
      ws.getColumn(1).width = 28;

      let col = 2;
      items.forEach((grp, idx) => {
        const start = col;
        // ชั้นบน (ชื่อไตรมาส/เดือน) + merge 6 ช่อง
        r1.getCell(col).value = grp.name;
        setHeaderStyle(r1.getCell(col), idx % 2 === 1 ? colorMainA : colorMainB);

        // ชั้นล่าง (6 sub-columns)
        for (let i = 0; i < subCols.length; i++) {
          const c = ws.getCell(2, col + i);
          const sc = subCols[i];
          c.value = sc.title;
          if (sc.colorType === "main") {
            setHeaderStyle(c, idx % 2 === 1 ? colorMainA : colorMainB);
          } else if (sc.colorType === "rolling") {
            setHeaderStyle(c, colorRolling);
          } else {
            setHeaderStyle(c, colorActual);
          }
          ws.getColumn(col + i).width = 16;
        }
        ws.mergeCells(1, start, 1, start + subCols.length - 1);
        for (let i = 0; i < subCols.length; i++) {
          setHeaderStyle(ws.getCell(1, start + i), idx % 2 === 1 ? colorMainA : colorMainB);
        }
        col += subCols.length;
      });

      // เนื้อข้อมูล
      let rowIdx = 3;
      data_items.forEach((row) => {
        const rw = ws.getRow(rowIdx);
        const prodName = row.product_name || row.productName || "";
        rw.getCell(1).value = prodName;
        setBodyText(rw.getCell(1));

        let c = 2;
        items.forEach((grp) => {
          const item = (grp.product || []).find((p) => p.product_name === prodName) || {};
          const vals = [
            item.workplan_qty || 0,
            item.rolling_qty || 0,
            item.actual_qty || 0,
            item.workplan_value || 0,
            item.rolling_value || 0,
            item.actual_value || 0,
          ];
          vals.forEach((v) => {
            const cell = rw.getCell(c++);
            cell.value = Number(v) || 0;
            setBodyNumber(cell);
          });
        });
        rowIdx++;
      });

      // แถวสรุป Total
      const sumRow = ws.getRow(rowIdx);
      sumRow.getCell(1).value = "Total (THB)";
      sumRow.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sumRow.getCell(1).alignment = { horizontal: "left" };
      sumRow.getCell(1).fill = fillSolid("#978B87");

      let c = 2;
      items.forEach((grp, idx) => {
        const sumField = (f) => (grp.product || []).reduce((acc, p) => acc + (Number(p[f]) || 0), 0);
        const vals = [
          sumField("workplan_qty"),
          sumField("rolling_qty"),
          sumField("actual_qty"),
          sumField("workplan_value"),
          sumField("rolling_value"),
          sumField("actual_value"),
        ];
        vals.forEach((v, i) => {
          const cell = sumRow.getCell(c++);
          cell.value = Number(v) || 0;
          setBodyNumber(cell);
          const t = subCols[i].colorType;
          cell.fill =
            t === "rolling" ? fillSolid(colorRolling) : t === "actual" ? fillSolid(colorActual) : fillSolid(idx % 2 === 1 ? colorMainA : colorMainB);
          cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        });
      });

      // ดาวน์โหลด
      const buffer = await wb.xlsx.writeBuffer();
      // saveAs(new Blob([buffer]), `${fileName}.xlsx`);
      const safe = (v) =>
        (typeof v === "string" ? v : "Sales_Report")
          .replace(/[\\/:*?"<>|]+/g, "-");
      const ts = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date()).replace(" ", "_").replace(/:/g, "");
      saveAs(new Blob([buffer]), `${safe(fileName)}_${ts}.xlsx`);
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
