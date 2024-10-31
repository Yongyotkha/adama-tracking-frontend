import React, { useState } from "react";
import { ConfigProvider, Table } from "antd";
import "./TableComponent.css";

const TableCustomComponent = ({
  header,
  dataSource,
  pageSize,
  footer,
  pagination,
  scroll,
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
            // headerBg: "#00783F",
            // headerColor: "white",
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
        pagination={
          pagination == false ? pagination : { pageSize: pageSize ?? 10 }
        }
        scroll={{
          x: scroll ? "max-content" : 1000,
        }}
        footer={footer ? () => footer : null}
      />
    </ConfigProvider>
  );
};

export default TableCustomComponent;
