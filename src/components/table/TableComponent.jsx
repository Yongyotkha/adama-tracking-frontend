import React, { useState } from "react";
import { ConfigProvider, Table } from "antd";
import "./TableComponent.css";

const TableComponent = ({ columns, dataSource, pageSize, title, footer }) => {
  // Handle row selection
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: "odd",
        text: "Select Odd Row",
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            return index % 2 === 0; // Select odd rows (index starts at 0)
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
      {
        key: "even",
        text: "Select Even Row",
        onSelect: (changeableRowKeys) => {
          let newSelectedRowKeys = [];
          newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
            return index % 2 !== 0; // Select even rows
          });
          setSelectedRowKeys(newSelectedRowKeys);
        },
      },
    ],
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#009845',   
          fontWeightStrong: 600,    
        },
        components: {
          Table: {
            headerBg: "#00783F",
            headerColor: "white",
          },
          Pagination: {
            itemActiveBg: '#009845', 
            itemActiveColor: '#fff', 
            itemActiveBorderColor: '#009845', 
          },
        },
      }}
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: pageSize ?? 10 }}
        scroll={{
          x: 1000,
        }}
        footer={footer ? () => footer : null} 
      />
    </ConfigProvider>
  );
};

export default TableComponent;
