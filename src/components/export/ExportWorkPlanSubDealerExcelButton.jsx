import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DynamicButton from "../../components/button/DynamicButton";

const GREEN_A = "#00783F";
const GREEN_B = "#009845";

const hexToARGB = (hex) => {
  const v = String(hex || "").replace("#", "").trim();
  if (v.length === 6) return `FF${v.toUpperCase()}`;
  if (v.length === 8) return v.toUpperCase();
  return "FFFFFFFF";
};

const fillSolid = (hex) => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: hexToARGB(hex) },
});

const setCellStyle = (cell, bgHex, { bold = true, whiteText = true, align = "center", wrapText = true } = {}) => {
  cell.fill = fillSolid(bgHex);
  cell.font = { bold, color: { argb: whiteText ? "FFFFFFFF" : "FF000000" } };
  cell.alignment = { vertical: "middle", horizontal: align, wrapText };
  cell.border = {
    top: { style: "thin", color: { argb: "FFCCCCCC" } },
    left: { style: "thin", color: { argb: "FFCCCCCC" } },
    right: { style: "thin", color: { argb: "FFCCCCCC" } },
    bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
  };
};

const setNum = (cell) => {
  cell.numFmt = "#,##0";
  cell.alignment = { vertical: "middle", horizontal: "right" };
};

const safeFile = (s) =>
  String(s || "WorkPlan_SubDealer").replace(/[\\/:*?"<>|]+/g, "-").trim();

export default function ExportWorkPlanSubDealerExcelButton({
  text = "Export",
  iconSrc = "/img/icons/excel.png",
  className,
  fileName = "WorkPlan_SubDealer",
  dataSource,
  subDealers,
  activeKey,
  localQtyState,
  totalValue,
}) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Work Plan");

      const r1 = ws.getRow(1);
      const r2 = ws.getRow(2);

      // ---- Left block (4 cols) ----
      r1.getCell(1).value = "Sub Dealer";
      setCellStyle(r1.getCell(1), GREEN_A);
      ws.mergeCells(1, 1, 1, 4);

      const leftHeaders = ["Product Name", "Pack Size", "Work Plan (KG)", "Value (THB)"];
      leftHeaders.forEach((h, i) => {
        const cell = r2.getCell(1 + i);
        cell.value = h;
        setCellStyle(cell, GREEN_A, { align: i === 0 ? "left" : "center" });
      });

      [28, 14, 16, 16].forEach((w, i) => (ws.getColumn(i + 1).width = w));

      // ---- Right blocks: each sub dealer = 2 cols ----
      let col = 5;
      (subDealers || []).forEach((sd, idx) => {
        const bg = idx % 2 === 0 ? GREEN_B : GREEN_A;

        r1.getCell(col).value = sd.sub_dealer_name || "";
        setCellStyle(r1.getCell(col), bg);
        setCellStyle(r1.getCell(col + 1), bg);
        ws.mergeCells(1, col, 1, col + 1);

        r2.getCell(col).value = "Qty (KG)";
        r2.getCell(col + 1).value = "Value (THB)";
        setCellStyle(r2.getCell(col), bg);
        setCellStyle(r2.getCell(col + 1), bg);

        ws.getColumn(col).width = 14;
        ws.getColumn(col + 1).width = 16;
        col += 2;
      });

      ws.views = [{ state: "frozen", xSplit: 4, ySplit: 2 }];

      // ---- Body ----
      let rowIdx = 3;
      (dataSource || []).forEach((p) => {
        const r = ws.getRow(rowIdx++);

        r.getCell(1).value = p.product_name || "";
        r.getCell(1).alignment = { vertical: "middle", horizontal: "left", wrapText: true };

        r.getCell(2).value = p.pack_size || "";
        r.getCell(2).alignment = { vertical: "middle", horizontal: "left", wrapText: true };

        r.getCell(3).value = Number(p.qty) || 0;
        setNum(r.getCell(3));

        r.getCell(4).value = Number(p.value) || 0;
        setNum(r.getCell(4));

        let c = 5;
        (subDealers || []).forEach((sd) => {
          const local = localQtyState?.[activeKey]?.[sd.sub_dealer_id]?.[p.product_id] || { qty: 0, value: 0 };

          r.getCell(c).value = Number(local.qty) || 0;
          setNum(r.getCell(c));

          r.getCell(c + 1).value = Number(local.value) || 0;
          setNum(r.getCell(c + 1));

          c += 2;
        });
      });

      // ---- Total row (สีสลับเหมือน header + ตัวหนังสือขาว) ----
      const sumRow = ws.getRow(rowIdx);

      sumRow.getCell(1).value = "Total (THB)";
      ws.mergeCells(rowIdx, 1, rowIdx, 3);
      setCellStyle(sumRow.getCell(1), GREEN_A, { align: "left" });

      sumRow.getCell(4).value = Number(totalValue) || 0;
      sumRow.getCell(4).numFmt = "#,##0";
      setCellStyle(sumRow.getCell(4), GREEN_A, { align: "right" });

      let cSum = 5;
      (subDealers || []).forEach((sd, idx) => {
        const bg = idx % 2 === 0 ? GREEN_B : GREEN_A;
        const total = localQtyState?.[activeKey]?.[sd.sub_dealer_id]?.totalAmountTarget || 0;

        sumRow.getCell(cSum).value = 0;
        sumRow.getCell(cSum).numFmt = "#,##0";
        setCellStyle(sumRow.getCell(cSum), bg, { align: "right" });

        sumRow.getCell(cSum + 1).value = Number(total) || 0;
        sumRow.getCell(cSum + 1).numFmt = "#,##0";
        setCellStyle(sumRow.getCell(cSum + 1), bg, { align: "right" });

        cSum += 2;
      });

      const buffer = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `${safeFile(fileName)}.xlsx`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DynamicButton
      onClick={handleExport}
      text={loading ? "Exporting..." : text}
      iconSrc={iconSrc}
      className={className || "text-white px-4 py-2 rounded-[4px] bg-[#009845]"}
      disabled={loading}
    />
  );
}
