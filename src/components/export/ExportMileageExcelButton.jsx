import React, { useMemo, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import DynamicButton from "../button/DynamicButton";

const GREEN = "#00783F";

const headerCells = [
  { title: "No", key: "no", width: 6, align: "left" },
  { title: "Date", key: "date", width: 14, align: "left" },
  { title: "Name", key: "name", width: 32, align: "left" },
  { title: "Mileage", key: "mileage", width: 16, align: "right" },
  { title: "Last Modified", key: "lastModified", width: 16, align: "left" },
];

const hexToARGB = (hex) => {
  const v = (hex || "#FFFFFF").replace("#", "").trim();
  return `FF${v.toUpperCase()}`;
};

const fillSolid = (hex) => ({
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: hexToARGB(hex) },
});

const borderThin = {
  top: { style: "thin", color: { argb: "FFCCCCCC" } },
  left: { style: "thin", color: { argb: "FFCCCCCC" } },
  right: { style: "thin", color: { argb: "FFCCCCCC" } },
  bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
};

const safeFile = (s) =>
  String(s || "Mileage_Report")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_");

const slug = (s) =>
  String(s ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_");

const toNumber = (v) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

export default function ExportMileageExcelButton({
  text = "Export Excel",
  iconSrc = "/img/icons/excel.png",
  className,
  filters = {},
  requestData, // (filters, page, pageSize) => Promise
  pageSize = 5000,
  freezeFirstColumn = false,
}) {
  const [loading, setLoading] = useState(false);

  const fileName = useMemo(() => {
    const dater = Array.isArray(filters?.dater) ? filters.dater : [];
    const start = dater?.[0] || "";
    const end = dater?.[1] || "";
    const datePart =
      start && end
        ? `${start}_to_${end}`
        : dayjs().format("YYYY-MM-DD_HHmm");

    const who = filters?.name ? `_${slug(filters.name)}` : "";
    return `Mileage_Report_${datePart}${who}`;
  }, [filters]);

  const fetchAllPages = async () => {
    let page = 1;
    let all = [];

    while (true) {
      const res = await requestData(filters, page, pageSize);
      const rows = Array.isArray(res?.data) ? res.data : [];

      all = all.concat(rows);

      if (rows.length < pageSize) break;
      page += 1;

      if (page > 5000) break;
    }

    return all;
  };

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const items = await fetchAllPages();

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Mileage");

      const hr = ws.getRow(1);
      hr.height = 22;

      headerCells.forEach((h, i) => {
        ws.getColumn(i + 1).width = h.width;

        const c = hr.getCell(i + 1);
        c.value = h.title;
        c.fill = fillSolid(GREEN);
        c.font = { color: { argb: "FFFFFFFF" }, bold: true };
        c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        c.border = borderThin;
      });

      let r = 2;
      items.forEach((it, idx) => {
        const row = ws.getRow(r);

        row.getCell(1).value = idx + 1;
        row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        row.getCell(1).border = borderThin;

        row.getCell(2).value = it?.date || "-";
        row.getCell(2).alignment = { vertical: "middle", horizontal: "left" };
        row.getCell(2).border = borderThin;

        row.getCell(3).value = it?.user_name_en || it?.user_name || "-";
        row.getCell(3).alignment = {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        };
        row.getCell(3).border = borderThin;

        const mileageNum = toNumber(it?.mileage);
        const mCell = row.getCell(4);
        mCell.value = mileageNum;
        mCell.numFmt = '#,##0.00;-#,##0.00;"-";@';
        mCell.alignment = { vertical: "middle", horizontal: "right" };
        mCell.border = borderThin;

        row.getCell(5).value = it?.last_modified || "-";
        row.getCell(5).alignment = { vertical: "middle", horizontal: "left" };
        row.getCell(5).border = borderThin;

        r++;
      });

      ws.views = [
        {
          state: "frozen",
          ySplit: 1,
          xSplit: freezeFirstColumn ? 1 : 0,
        },
      ];

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
      className={className || "text-white px-4 py-3 rounded-[4px] bg-[#009845]"}
      disabled={loading}
    />
  );
}