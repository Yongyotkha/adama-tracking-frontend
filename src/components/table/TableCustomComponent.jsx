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
}) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#009845",
        },
        components: {
          Table: {
            headerColor: "#5F504D",
            cellPaddingBlock:7,
            cellPaddingInline:7,
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
        className="custom-scrollbar"
        columns={header}
        dataSource={dataSource}
        pagination={
          pagination == false ? pagination : { pageSize: pageSize ?? 10 }
        }
        scroll={{
          x: scroll ? "max-content" : 1000,
          y: 70 * 7,
        }}
        // footer={footer ? () => footer : null}
        summary={footer}
        loading={loading}
      />
    </ConfigProvider>
  );
};

export default TableCustomComponent;
