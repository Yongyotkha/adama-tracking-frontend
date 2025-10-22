import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "antd";

/**
 * Reusable: ปุ่ม Export Excel สำหรับรายงานแบบ "รายเดือนมี 6 sub-columns"
 * จะยิง API ใหม่ด้วย payload ฟิลเตอร์ล่าสุด (ไม่ใช้แคชจากตาราง)
 *
 * Required props:
 * - getPayload: () => Promise<payload>  // คืน payload ที่รวมค่าฟิลเตอร์ล่าสุด
 * - requestData: (payload) => Promise<{ status:number, data:any }> // ฟังก์ชันยิง API แล้วคืน response
 * - fileName?: string                   // ชื่อไฟล์
 */
export default function ExportMonthlyExcelButton({
  getPayload,
  requestData,
  fileName = "Sales_Report_By_Month",
  buttonProps,
  text = "Export Excel",
}) {
  const [loading, setLoading] = useState(false);

  const colorMainA = "#00783F"; // เขียวเข้ม (สลับ)
  const colorMainB = "#009845"; // เขียวสด (สลับ)
  const colorRolling = "#7DB41E";
  const colorActual = "#93CC23";
  const white = "FFFFFFFF";

  const fillSolid = (hex) => ({
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: hex.replace("#", "") + "" },
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

  const setBodyText = (cell) => {
    cell.alignment = { horizontal: "left" };
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      // 1) รวม payload จากฟอร์ม/ฟิลเตอร์ปัจจุบัน
      const payload = await getPayload();
      // สำหรับ export เอาทั้งหมด ไม่เอาแบ่งหน้า
      const exportPayload = {
        ...payload,
        page_length: 1,
        page_size: 100000, // กันเหนียว
      };

      // 2) เรียก API ดึงข้อมูลล่าสุดตามฟิลเตอร์
      const response = await requestData(exportPayload);
      if (response?.status !== 200) throw new Error("Export failed");

      const { items = [], data_items = [] } = response.data || {};

      // 3) สร้าง workbook / sheet
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");

      // คอลัมน์: col 1 = Product Name, ต่อด้วย (เดือน * 6 คอลัมน์)
      // แถวหัว 2 แถว:
      // Row1: [ "Month",  (merge A1:A2) และแต่ละเดือน merge ข้าม 6 คอลัมน์ ]
      // Row2: ชื่อ sub-columns: Work Plan(KG), Rolling Forecast(KG), Actual(KG), Work Plan(Value), Rolling Forecast(Value), Actual(Value)

      // 3.1 สร้างโครง cell เฉยๆก่อน
      const headerRow1 = ws.getRow(1);
      const headerRow2 = ws.getRow(2);

      // คอลัมน์แรก
      headerRow1.getCell(1).value = "Month"; // ให้เหมือนตาราง (หัวใหญ่ด้านซ้าย)
      headerRow2.getCell(1).value = "Product Name";
      setHeaderStyle(headerRow1.getCell(1), colorMainA);
      setHeaderStyle(headerRow2.getCell(1), colorMainA);
      ws.mergeCells(1, 1, 2, 1); // A1:A2

      // ความกว้างคอลัมน์แรก
      ws.getColumn(1).width = 28;

      // วนสร้างกลุ่มเดือน
      // สำหรับแต่ละเดือนจะมี 6 sub-columns
      const subCols = [
        { title: "Work Plan(KG)", type: "workplan_qty", colorType: "main" },
        { title: "Rolling Forecast(KG)", type: "rolling_qty", colorType: "rolling" },
        { title: "Actual(KG)", type: "actual_qty", colorType: "actual" },
        { title: "Work Plan(Value)", type: "workplan_value", colorType: "main" },
        { title: "Rolling Forecast(Value)", type: "rolling_value", colorType: "rolling" },
        { title: "Actual(Value)", type: "actual_value", colorType: "actual" },
      ];

      // เริ่มคอลัมน์ตั้งแต่ index=2
      let colIdx = 2;
      items.forEach((month, mIndex) => {
        const start = colIdx;
        // แถว 1: ใส่ชื่อเดือน + merge 6 คอลัมน์
        headerRow1.getCell(colIdx).value = month.name;
        setHeaderStyle(
          headerRow1.getCell(colIdx),
          mIndex % 2 === 1 ? colorMainA : colorMainB
        );
        // ทำให้ style ติดทั้ง 6 ช่องด้วย
        for (let i = 0; i < subCols.length; i++) {
          const c = ws.getCell(2, colIdx + i);
          const sc = subCols[i];
          if (sc.colorType === "main") {
            setHeaderStyle(c, mIndex % 2 === 1 ? colorMainA : colorMainB);
          } else if (sc.colorType === "rolling") {
            setHeaderStyle(c, colorRolling);
          } else {
            setHeaderStyle(c, colorActual);
          }
          c.value = sc.title;
          ws.getColumn(colIdx + i).width = 16; // ความกว้างคร่าวๆ
        }
        ws.mergeCells(1, start, 1, start + subCols.length - 1);
        // เติมสีในหัวเดือนแถว 1 ทั้งช่วง
        for (let i = 0; i < subCols.length; i++) {
          const topCell = ws.getCell(1, start + i);
          setHeaderStyle(
            topCell,
            mIndex % 2 === 1 ? colorMainA : colorMainB
          );
        }
        colIdx += subCols.length;
      });

      // 4) เติมข้อมูลบรรทัด (data_items)
      // data_items: [{product_name, ...}] + map cross กับ items[].product[].product_name
      let rowIdx = 3;
      data_items.forEach((row) => {
        const r = ws.getRow(rowIdx);
        // product name
        r.getCell(1).value = row.product_name || row.productName || "";
        setBodyText(r.getCell(1));

        let c = 2;
        items.forEach((month) => {
          const item = (month.product || []).find(
            (p) =>
              p.product_name === (row.product_name || row.productName)
          ) || {};
          // 6 ช่องตามลำดับ
          const vals = [
            item.workplan_qty || 0,
            item.rolling_qty || 0,
            item.actual_qty || 0,
            item.workplan_value || 0,
            item.rolling_value || 0,
            item.actual_value || 0,
          ];
          vals.forEach((v) => {
            const cell = r.getCell(c++);
            cell.value = Number(v) || 0;
            setBodyNumber(cell);
          });
        });

        rowIdx++;
      });

      // 5) สรุป Total แถวท้าย (เหมือน footer บนจอ)
      const sumRow = ws.getRow(rowIdx);
      sumRow.getCell(1).value = "Total (THB)";
      sumRow.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sumRow.getCell(1).alignment = { horizontal: "left" };
      sumRow.getCell(1).fill = fillSolid("978B87");
      sumRow.height = 20;

      let c = 2;
      items.forEach((month, mIndex) => {
        const sumField = (field) =>
          (month.product || []).reduce(
            (acc, p) => acc + (Number(p[field]) || 0),
            0
          );

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
          // ไล่เฉดสีตามหัว sub-column เพื่ออ่านง่าย
          const sc = subCols[i];
          if (sc.colorType === "main") {
            cell.fill = fillSolid(mIndex % 2 === 1 ? colorMainA : colorMainB);
          } else if (sc.colorType === "rolling") {
            cell.fill = fillSolid(colorRolling);
          } else {
            cell.fill = fillSolid(colorActual);
          }
          cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        });
      });

      // 6) ดาวน์โหลดไฟล์
      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `${fileName}.xlsx`);
    } catch (err) {
      console.error(err);
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
