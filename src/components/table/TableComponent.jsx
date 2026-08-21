// src/components/table/TableComponent.jsx
import React from "react";
import { ConfigProvider, Table } from "antd";
import "./TableComponent.css";

const TableComponent = ({
  header,
  dataSource,
  pageSize,
  footer,
  pagination,
  scroll,        // เดิม: boolean
  loading,
  onChange,
  rowSelection,
  rowKey = "key",

  // ✅ เพิ่มใหม่ (optional) — ถ้าไม่ส่งมา จะทำงานเหมือนเดิม
  scrollX = true,
  scrollY = false,
  scrollYHeight = "60vh", // กันต้องส่ง string ทุกครั้ง
  className,
}) => {
  const resolvedColumns = (header || []).map((column) => {
    const isNoColumn =
      column?.title === "No" &&
      (column?.dataIndex === "no" || column?.dataIndex === "key");

    if (!isNoColumn) return column;

    const current =
      typeof pagination === "object" && pagination?.current
        ? Number(pagination.current)
        : 1;
    const size =
      typeof pagination === "object" && pagination?.pageSize
        ? Number(pagination.pageSize)
        : 0;
    const offset = size > 0 ? (current - 1) * size : 0;

    return {
      ...column,
      render: (_, __, index) => offset + index + 1,
    };
  });

  // ✅ ทำให้พฤติกรรมเดิมไม่เปลี่ยน:
  // - ถ้า scroll เป็น true/false แบบเดิม -> ทำงานเหมือนเดิม
  // - ถ้ามีการส่ง scrollY/scrollX -> เปิดตามที่กำหนด
  const resolvedScroll =
    scroll === false
      ? undefined
      : {
          ...(scrollX && { x: scrollX === true ? "max-content" : scrollX }),
          ...(scrollY && { y: scrollY === true ? scrollYHeight : scrollY }),
        };

  // ✅ ถ้าเดิมคุณใช้ scroll boolean เพื่อ set x เท่านั้น:
  // ให้ยังคง behavior เดิมเมื่อ scroll === true และ user ไม่ส่ง scrollX/scrollY
  const finalScroll =
    scroll === true && scrollX === true && scrollY === false
      ? { x: "max-content" }
      : resolvedScroll;

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#009845", fontWeightStrong: 600 },
        components: {
          Table: { headerBg: "#00783F", headerColor: "white" },
          Pagination: {
            itemActiveBg: "#009845",
            itemActiveColor: "#fff",
            itemActiveBorderColor: "#009845",
          },
        },
      }}
    >
      <Table
        className={className}
        columns={resolvedColumns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        scroll={finalScroll}
        summary={footer}
        onChange={onChange}
        rowSelection={rowSelection}
        rowKey={rowKey}
      />
    </ConfigProvider>
  );
};

export default TableComponent;
