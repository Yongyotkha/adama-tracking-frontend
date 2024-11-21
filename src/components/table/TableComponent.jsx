// TableComponent.js
import React from "react";
import { ConfigProvider, Table } from "antd";
import "./TableComponent.css";

const TableComponent = ({
  header,
  dataSource,
  pageSize,
  footer,
  pagination,
  scroll,
  loading,
  onChange
}) => {
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
        columns={header}
        dataSource={dataSource}
        loading={loading}
        pagination={
          pagination
        }
        scroll={{
          x: scroll ? "max-content" : 1000,
        }}
        summary={footer} 
        onChange={onChange}
      />
    </ConfigProvider>
  );
};

export default TableComponent;
