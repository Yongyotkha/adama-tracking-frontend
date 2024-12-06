import React, { useState } from "react";
import { ConfigProvider, Table } from "antd";
import "./TableExpand.css";

const TableExpand = ({ data, columns, nestedColumns,pagination ,onChange,loading}) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const handleExpand = (record) => {
    setExpandedRowKeys((prev) =>
      prev.includes(record.key) ? prev.filter((key) => key !== record.key) : [...prev, record.key]
    );
  };

  const handleDelete = (key) => {
    // Implement delete functionality here
  };

  const expandedRowRender = (record) => (
    <div className="m-0 p-0"> {/* Set margin to 0 */}
      <Table
        columns={nestedColumns}
        dataSource={record.nestedData} // Use the nestedData field from the parent row
        pagination={false}
        rowKey="key"
        scroll={{ x: "max-content" }}
        className="nested-table"
      />
    </div>
  );

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
        columns={columns}
        dataSource={data}
        loading={loading}
        onChange={onChange}
        pagination={
          pagination
        }
        rowKey="key"
        scroll={{ x: "max-content" }}
        expandable={{
          expandedRowKeys,
          onExpand: (expanded, record) => handleExpand(record),
          expandedRowRender: (record) => expandedRowRender(record),
          expandIcon: ({ expanded, onExpand, record }) =>
            expanded ? (
              <img
                src="/img/icons/collapse.png"
                alt="collapse"
                className="cursor-pointer w-6 h-6" // Tailwind classes for 24px width and height
                onClick={(e) => onExpand(record, e)}
              />
            ) : (
              <img
                src="/img/icons/expand.png"
                alt="expand"
                className="cursor-pointer w-6 h-6" // Tailwind classes for 24px width and height
                onClick={(e) => onExpand(record, e)}
              />
            ),
        }}
      />
    </ConfigProvider>
  );
};

export default TableExpand;
