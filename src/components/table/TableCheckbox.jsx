import React from "react";
import { ConfigProvider, Table } from "antd";
import "./TableComponent.css";

const TableCheckbox = ({
  header,
  dataSource,
  pageSize,
  footer,
  pagination,
  scroll,
  rowSelection, // Add rowSelection prop here
}) => {
  const resolvedPagination =
    pagination === false ? pagination : { pageSize: pageSize ?? 10 };

  const resolvedColumns = (header || []).map((column) => {
    const isNoColumn =
      column?.title === "No" &&
      (column?.dataIndex === "no" || column?.dataIndex === "key");

    if (!isNoColumn) return column;

    return {
      ...column,
      render: (_, __, index) => index + 1,
    };
  });

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#009845",
          fontWeightStrong: 600,
        },
        components: {
          Table: {
            headerBg: "#00783F",
            headerColor: "white",
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
        columns={resolvedColumns}
        dataSource={dataSource}
        pagination={resolvedPagination}
        scroll={{
          x: scroll ? "max-content" : 1000,
        }}
        footer={footer ? () => footer : null}
        rowSelection={rowSelection} // Pass rowSelection to the Table component
      />
    </ConfigProvider>
  );
};

export default TableCheckbox;
