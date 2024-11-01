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
            headerColor: "#5F504D",
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
        }}
        // footer={footer ? () => footer : null}
        summary={footer}

      />
    </ConfigProvider>
  );
};

export default TableCustomComponent;
