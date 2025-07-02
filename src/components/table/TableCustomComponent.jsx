import React, { useState } from "react";
import { ConfigProvider, Table } from "antd";
import "./TableCustomComponent.css";

const TableCustomComponent = ({
  header,
  dataSource,
  pageSize,
  footer,
  pagination,
  scroll,
  loading,
  className,
  onChange,
  scrollX = true,   // default เปิด scroll แนวนอน
  scrollY = true,   // default เปิด scroll แนวตั้ง
}
) => {
  const resolvedScroll =
    scroll === false
      ? undefined // ปิด scroll ทั้งหมด
      : {
        ...(scrollX && { x: scrollX === true ? "max-content" : scrollX }),
        ...(scrollY && { y: scrollY === true ? "60vh" : scrollY }),
      };
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#009845",
        },
        components: {
          Table: {
            headerColor: "#5F504D",
            cellPaddingBlock: 7,
            cellPaddingInline: 7,
          },
          Pagination: {
            itemActiveBg: "#009845",
            itemActiveColor: "#fff",
            itemActiveBorderColor: "#009845",
          },
        },
      }}
    >
      <Table
        onChange={onChange}
        className="custom-scrollbar"
        columns={header}
        dataSource={dataSource}
        pagination={pagination}
        scroll={resolvedScroll}
        summary={footer}
        loading={loading}
      />
    </ConfigProvider>
  );
};

export default TableCustomComponent;
