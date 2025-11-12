import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DynamicButton from "../../components/button/DynamicButton";

const GREEN_MAIN = "#009845";   // เขียวหลัก
const GREEN_LIGHT = "#7DB41E";  // เขียวอ่อน

export default function ExportActivityByMonthExcelButton({
  getPayload,
  requestData,
  fileName = "Activity_Report_By_Month",
  buttonProps,
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
      const res = await requestData({ ...payload, page_length: 1, page_size: 100000 });
      if (res?.status !== 200) throw new Error("Export failed");

      const items = res.data?.item || [];
      const totalsMeta = res.data?.total || [];

      // ใช้ meta จาก total: id, name, unit price (อย่าใช้ total_value ที่ผิด)
      const activityHeaders = totalsMeta.map(t => ({
        id: String(t.activity_type_id),
        name: t.activity_type_name,
        price: Number(t.unit_convert_value) || 0,
      }));

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");

      // Freeze header + column A
      ws.views = [{ state: "frozen", xSplit: 1, ySplit: 1 }];

      // Header row
      ws.getRow(1).values = ["Month", ...activityHeaders.map(h => h.name)];
      ws.columns = [{ key: "m", width: 18 }, ...activityHeaders.map(() => ({ width: 16 }))];

      // สไตล์หัวตาราง: เขียวหลักคอลัมน์ "Month", ที่เหลือสลับ เขียวหลัก/เขียวอ่อน
      ws.getCell(1, 1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: GREEN_MAIN.replace("#", "") },
      };
      ws.getCell(1, 1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      ws.getCell(1, 1).alignment = { vertical: "middle", horizontal: "center" };

      activityHeaders.forEach((h, idx) => {
        const colIndex = idx + 2; // เริ่มที่คอลัมน์ B
        const color = idx % 2 === 0 ? GREEN_LIGHT : GREEN_MAIN;
        const cell = ws.getCell(1, colIndex);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: color.replace("#", "") },
        };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      // เขียนแถวรายเดือน
      items.forEach((row) => {
        const line = [row.month_name];
        activityHeaders.forEach((h) => {
          const hit = (row.item || []).find((x) => String(x.activity_type_id) === h.id);
          // ถ้ามี value เป็นเงินมาแล้ว ใช้เลย; ไม่งั้นคูณจาก qty * price
          const valFromAPI = Number(hit?.total_unit_convert_value);
          const qty = Number(hit?.total ?? 0);
          const value = !Number.isNaN(valFromAPI) && valFromAPI > 0 ? valFromAPI : qty * h.price;
          line.push(value);
        });
        ws.addRow(line);
      });

      // คำนวณรวมใหม่จากข้อมูลรายเดือนจริง
      const grandTotals = activityHeaders.map((h) => {
        let sum = 0;
        items.forEach((row) => {
          const hit = (row.item || []).find((x) => String(x.activity_type_id) === h.id);
          const valFromAPI = Number(hit?.total_unit_convert_value);
          const qty = Number(hit?.total ?? 0);
          sum += (!Number.isNaN(valFromAPI) && valFromAPI > 0) ? valFromAPI : qty * h.price;
        });
        return sum;
      });

      // แถว Total
      const tr = ws.addRow(["Total (THB)", ...grandTotals]);
      tr.font = { bold: true };
      tr.eachCell((cell, col) => {
        const idx = col - 2; // ตำแหน่งกิจกรรม (เริ่มจาก 0)
        if (col === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: GREEN_MAIN.replace("#", "") },
          };
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        } else if (col >= 2) {
          const color = idx % 2 === 0 ? GREEN_LIGHT : GREEN_MAIN;
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: color.replace("#", "") },
          };
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        }
      });

      // จัดรูปแบบตัวเลขให้ทุกคอลัมน์ B..สุดท้าย (ทั้งเนื้อและ total)
      for (let c = 2; c <= ws.columnCount; c++) {
        for (let r = 2; r <= ws.rowCount; r++) {
          ws.getCell(r, c).numFmt = '#,##0';
          ws.getCell(r, c).alignment = { horizontal: "right" };
        }
      }

      const buf = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buf]), `${fileName}.xlsx`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const baseClass = "text-white px-4 py-3 rounded-[4px] bg-[#009845]";
  const combinedClass = [baseClass, buttonProps?.className, className].filter(Boolean).join(" ");

  return (
    <DynamicButton
      type="button"
      onClick={handleExport}
      text={loading ? "Exporting..." : text}
      iconSrc={iconSrc}
      className={combinedClass}
      disabled={loading}
    />
  );
}
