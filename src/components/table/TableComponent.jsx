// TableComponent.js
import React from "react";
import { ConfigProvider, Table } from "antd";
import "./TableComponent.css";

const TableComponent = ({
  header,
  dataSource,
  pageSize,
  footer,
  pagination = true,
  scroll,
  loading,
  onChange
}) => {
  const scrollY = 22 * pageSize;

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
        // pagination={
        //   pagination
        // }
        pagination={false}
        
        // pagination={
        //   pagination
        //     ? {
        //         pageSize: pageSize,
        //         showSizeChanger: false, 
        //       }
        //     : false
        // }
        scroll={{
          y: scrollY, // เพิ่ม
          x: scroll ? "max-content" : 1000,
        }}
        summary={footer} 
        onChange={onChange}
      />
    </ConfigProvider>
  );
};

export default TableComponent;
