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

const buildDateRangeFromMonth = (monthStr) => {
  const m = monthStr ? dayjs(monthStr, "YYYY-MM") : dayjs();
  return {
    start_date: m.startOf("month").format("YYYY-MM-DD"),
    end_date: m.endOf("month").format("YYYY-MM-DD"),
  };
};

const toNumber = (v) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

export default function ExportMileageExcelButton({
  text = "Export Excel",
  iconSrc = "/img/icons/excel.png",
  className,

  month,
  selectedUserId, // user_id จาก dropdown (ใส่ใน payload key name)
  nameOptions = [],

  userInfoId,
  requestData, // (payload) => useServiceAPI.get(paths.pathMileageList, payload)

  pageSize = 5000,
  freezeFirstColumn = false, // ถ้าต้องการ freeze คอลัมน์ No ด้วยให้ true
}) {
  const [loading, setLoading] = useState(false);

  const fileName = useMemo(() => {
    const monthText = month || dayjs().format("YYYY-MM");
    const picked = (nameOptions || []).find(
      (x) => String(x.id) === String(selectedUserId)
    );
    const who = picked?.name ? `_${slug(picked.name)}` : "";
    const ts = dayjs().format("YYYY-MM-DD_HHmm");
    return `Mileage_Report_${monthText}${who}_${ts}`;
  }, [month, selectedUserId, nameOptions]);

  const fetchAllPages = async () => {
    const { start_date, end_date } = buildDateRangeFromMonth(month);

    let page = 1;
    let all = [];

    while (true) {
      const payload = {
        user_id: userInfoId,
        start_date,
        end_date,
        name: selectedUserId ?? "",
        page_length: page,
        page_size: pageSize,
      };

      const res = await requestData(payload);
      const rows = Array.isArray(res?.data) ? res.data : [];

      all = all.concat(rows);

      if (rows.length < pageSize) break;
      page += 1;

      // safety
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

      // ===== Header row (เหมือนตาราง) =====
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

      // ===== Body =====
      let r = 2;
      items.forEach((it, idx) => {
        const row = ws.getRow(r);

        // No
        row.getCell(1).value = idx + 1;
        row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        row.getCell(1).border = borderThin;

        // Date
        row.getCell(2).value = it?.date || "-";
        row.getCell(2).alignment = { vertical: "middle", horizontal: "left" };
        row.getCell(2).border = borderThin;

        // Name
        row.getCell(3).value = it?.user_name_en || it?.user_name || "-";
        row.getCell(3).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
        row.getCell(3).border = borderThin;

        // Mileage
        const mileageNum = toNumber(it?.mileage);
        const mCell = row.getCell(4);
        mCell.value = mileageNum;                 // number
        mCell.numFmt = '#,##0.00;-#,##0.00;"-";@'; // ถ้า null = "-"
        mCell.alignment = { vertical: "middle", horizontal: "right" };
        mCell.border = borderThin;

        // Last Modified (ตอนนี้ใน UI เป็น "-")
        row.getCell(5).value = "-";
        row.getCell(5).alignment = { vertical: "middle", horizontal: "left" };
        row.getCell(5).border = borderThin;

        r++;
      });

      // ===== Freeze header (และ optionally freeze col No) =====
      ws.views = [
        {
          state: "frozen",
          ySplit: 1,
          xSplit: freezeFirstColumn ? 1 : 0,
        },
      ];

      // ===== export =====
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
