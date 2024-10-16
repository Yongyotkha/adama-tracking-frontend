import React, { useState } from "react";
import { Table } from "antd";

const TableComponent = ({columns = []}) => {
  // Define the table columns
 

  // Define the data source for the table
  const dataSource = Array.from({
    length: 46,
  }).map((_, i) => ({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  }));

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

  // Render the table
  return (
    <Table
      // rowSelection={rowSelection}
      columns={columns}
      dataSource={dataSource}
      pagination={{ pageSize: 10 }} // Pagination to handle large data
    />
  );
};

export default TableComponent;
