// src/components/export/ExportPeriodExcelButton.jsx
import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DynamicButton from "../../components/button/DynamicButton";

/** ปุ่ม Export Excel สำหรับรายงานที่มีหัวกลุ่ม (ไตรมาส/เดือน) + 6 sub-columns ต่อกลุ่ม */
export default function ExportPeriodExcelButton({
  getPayload,
  requestData,
  fileName = "Sales_Report_By_Quarter",
  leftTopTitle = "Quarter",
  text = "Export Excel",
  buttonProps,
  iconSrc = "/img/icons/excel.png",
  className,
}) {
  const [loading, setLoading] = useState(false);

  const COLOR_MAIN_A = "#00783F";
  const COLOR_MAIN_B = "#009845";
  const COLOR_ROLLING = "#7DB41E";
  const COLOR_ACTUAL = "#93CC23";
  const COLOR_SUM = "#978B87";

  // ----- helpers -----
  const hexToARGB = (hex) =>
    `FF${String(hex || "#FFFFFF").replace("#", "").slice(0, 6).toUpperCase()}`;
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
  const setBodyNumber = (cell) => {
    cell.numFmt = "#,##0";
    cell.alignment = { horizontal: "right" };
  };
  const setBodyText = (cell) => {
    cell.alignment = { horizontal: "left" };
  };
  const toNum = (v) => {
    if (v == null || v === "") return 0;
    const n = Number(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };
  const normalize = (s) =>
    (s ?? "")
      .toString()
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const safeName = (v) =>
    String(v || "Sales_Report").replace(/[\\/:*?"<>|]+/g, "-");

  const SUB_COLS = [
    { title: "Work Plan(KG)", field: "workplan_qty", color: "main" },
    { title: "Rolling Forecast(KG)", field: "rolling_qty", color: "rolling" },
    { title: "Actual(KG)", field: "actual_qty", color: "actual" },
    { title: "Work Plan(Value)", field: "workplan_value", color: "main" },
    { title: "Rolling Forecast(Value)", field: "rolling_value", color: "rolling" },
    { title: "Actual(Value)", field: "actual_value", color: "actual" },
  ];

  const getGroupItems = (grp) => {
    // << สำคัญ: API รายไตรมาสใช้ workplan_data_items >>
    if (Array.isArray(grp?.workplan_data_items)) return grp.workplan_data_items;
    if (Array.isArray(grp?.product)) return grp.product; // เผื่อรูปแบบอื่นในอนาคต
    return [];
  };

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const payload = await getPayload();
      const response = await requestData({ ...payload, page_length: 1, page_size: 100000 });
      if (response?.status !== 200) throw new Error("Export failed");

      // โครงสร้างจาก API รายไตรมาส:
      // { data: { items: [{ id,name,workplan_data_items:[{product_name,...}]}], data_items:[{product_name,...}]} }
      const root = response?.data?.data ?? response?.data ?? {};
      const items = Array.isArray(root.items) ? root.items : [];
      const data_items = Array.isArray(root.data_items) ? root.data_items : [];

      // เตรียม groups + map สำหรับ lookup ชื่อสินค้า
      const groups = items.map((grp) => {
        const rows = getGroupItems(grp);
        return {
          ...grp,
          rows,
          map: new Map(rows.map((r) => [normalize(r.product_name), r])),
        };
      });

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Quarter");

      // --- Column widths ---
      ws.getColumn(1).width = 28; // Product Name
      groups.forEach((_, gi) => {
        for (let i = 0; i < SUB_COLS.length; i++) {
          ws.getColumn(2 + gi * SUB_COLS.length + i).width = 16;
        }
      });

      // --- Header rows (2 แถว) ---
      const r1 = ws.getRow(1);
      const r2 = ws.getRow(2);

      r1.getCell(1).value = leftTopTitle;
      setHeaderStyle(r1.getCell(1), COLOR_MAIN_A);
      r2.getCell(1).value = "Product Name";
      setHeaderStyle(r2.getCell(1), COLOR_MAIN_A);
      ws.mergeCells(1, 1, 2, 1);

      let col = 2;
      groups.forEach((grp, idx) => {
        const start = col;
        r1.getCell(col).value = grp.name;
        setHeaderStyle(r1.getCell(col), idx % 2 === 1 ? COLOR_MAIN_A : COLOR_MAIN_B);

        for (let i = 0; i < SUB_COLS.length; i++) {
          const c = ws.getCell(2, col + i);
          const sc = SUB_COLS[i];
          c.value = sc.title;

          const bg =
            sc.color === "rolling"
              ? COLOR_ROLLING
              : sc.color === "actual"
                ? COLOR_ACTUAL
                : idx % 2 === 1
                  ? COLOR_MAIN_A
                  : COLOR_MAIN_B;

          setHeaderStyle(c, bg);
        }

        ws.mergeCells(1, start, 1, start + SUB_COLS.length - 1);
        for (let i = 0; i < SUB_COLS.length; i++) {
          setHeaderStyle(
            ws.getCell(1, start + i),
            idx % 2 === 1 ? COLOR_MAIN_A : COLOR_MAIN_B
          );
        }
        col += SUB_COLS.length;
      });
      // ✅ Freeze header 2 rows + first column (Fix head + Fix side)
      ws.views = [{ state: "frozen", xSplit: 1, ySplit: 2, topLeftCell: "B3" }];

      // --- Body rows ---
      let rowIdx = 3;
      data_items.forEach((row) => {
        const rw = ws.getRow(rowIdx);
        const name = row.product_name || row.productName || "";
        rw.getCell(1).value = name;
        setBodyText(rw.getCell(1));

        let c = 2;
        groups.forEach((grp) => {
          const item = grp.map.get(normalize(name)) || {};
          SUB_COLS.forEach((sc) => {
            const cell = rw.getCell(c++);
            cell.value = toNum(item[sc.field]);
            setBodyNumber(cell);
          });
        });

        rowIdx++;
      });

      // --- Summary row ---
      const sumRow = ws.getRow(rowIdx);
      sumRow.getCell(1).value = "Total (THB)";
      sumRow.getCell(1).fill = fillSolid(COLOR_SUM);
      sumRow.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      sumRow.getCell(1).alignment = { horizontal: "left" };

      let c2 = 2;
      groups.forEach((grp, idx) => {
        const rows = getGroupItems(grp);
        const sumField = (f) => rows.reduce((acc, p) => acc + toNum(p?.[f]), 0);
        SUB_COLS.forEach((sc) => {
          const cell = sumRow.getCell(c2++);
          cell.value = sumField(sc.field);
          setBodyNumber(cell);
          const bg =
            sc.color === "rolling"
              ? COLOR_ROLLING
              : sc.color === "actual"
                ? COLOR_ACTUAL
                : idx % 2 === 1
                  ? COLOR_MAIN_A
                  : COLOR_MAIN_B;
          cell.fill = fillSolid(bg);
          cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        });
      });

      // save
      const buffer = await wb.xlsx.writeBuffer();
      const ts = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .format(new Date())
        .replace(" ", "_")
        .replace(/:/g, "");
      saveAs(new Blob([buffer]), `${safeName(fileName)}_${ts}.xlsx`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const baseClass = "text-white px-4 py-3 rounded-[4px] bg-[#009845]";
  const combinedClass = [baseClass, buttonProps?.className, className]
    .filter(Boolean)
    .join(" ");

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
