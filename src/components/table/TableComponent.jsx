import React, { useState } from "react";
import { Table } from "antd";
import "./TableComponent.css";

const TableComponent = ({ columns, dataSource, pageSize, title, footer }) => {
  // Handle row selection
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // Row selection configuration
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

  // Render the table with dynamic title and footer
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={{ pageSize: pageSize ?? 10 }}
      scroll={{
        x: 1000,
      }}
      footer={footer ? () => footer : null} // Dynamic footer if provided
    />
  );
};

export default TableComponent;
