import React, { useState } from "react";
import { ConfigProvider, Table, Button } from "antd";
import "./TableExpand.css";
import DynamicButton from "../button/DynamicButton";

const TableExpand = ({ data }) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const handleExpand = (record) => {
    setExpandedRowKeys((prev) =>
      prev.includes(record.key) ? prev.filter((key) => key !== record.key) : [...prev, record.key]
    );
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      width: 200,
    },
    {
      title: "Territory",
      dataIndex: "territory",
      key: "territory",
      width: 150,
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <DynamicButton iconSrc="/img/icons/create.png" />
          <DynamicButton iconSrc="/img/icons/delete.png" />
        </div>
      ),
    },
  ];

  const handleDelete = (key) => {
    // Implement delete functionality here
  };

  const expandedRowRender = (record) => {
    const nestedColumns = [
      {
        title: "No",
        dataIndex: "no",
        key: "no",
        width: 50,
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 150,
      },
      {
        title: "Position",
        dataIndex: "position",
        key: "position",
        width: 200,
      },
      {
        title: "Territory",
        dataIndex: "territory",
        key: "territory",
        width: 150,
      },
      {
        title: "Action",
        key: "action",
        width: 100,
        render: (_, nestedRecord) => (
          <DynamicButton iconSrc="/img/icons/delete.png" onClick={() => handleDelete(nestedRecord.key)} />
        ),
      },
    ];

    return (
      <Table
        columns={nestedColumns}
        dataSource={record.nestedData} // Use the nestedData field from the parent row
        pagination={false}
        rowKey="key"
        scroll={{ x: "max-content" }}
        className="nested-table"
      />
    );
  };

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
