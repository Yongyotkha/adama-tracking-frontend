import React, { useState } from "react";
import { Modal, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons"; // Import search icon
import DynamicButton from "../button/DynamicButton";
import TableComponent from "../table/TableComponent";
import TableCheckbox from "../table/TableCheckbox";

const DynamicModal = ({
  title,
  isVisible,
  onClose,
  header,
  dataSource,
  pageSize = 10,
  width = "1200px",
  onAddSelected,
  type, // New prop to control modal type
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = dataSource.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.territory.toLowerCase().includes(searchText.toLowerCase()) ||
      item.position.toLowerCase().includes(searchText.toLowerCase())
  );

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys); // Update selected row keys
    },
  };

  const handleAdd = () => {
    const selectedRows = dataSource.filter((item) => selectedRowKeys.includes(item.key));
    onAddSelected(selectedRows);
    onClose();
  };

  return (
    <Modal
      title={<div className="text-[#978B87] text-lg font-normal">{title}</div>}
      open={isVisible}
      onCancel={onClose}
      width={width}
      footer={[
        <DynamicButton
          key="close"
          text="Close"
          onClick={onClose}
          className="text-[#FFFFFF] text-sm rounded-sm bg-[#B6AEAB] p-2 min-w-[96px]"
        />,
        type === "add" && (
          <DynamicButton
            key="add"
            text="Add"
            onClick={handleAdd}
            className="text-[#FFFFFF] text-sm rounded-sm bg-[#00783F] p-2 min-w-[96px] ms-3"
          />
        ),
      ]}
    >
      <div className="mb-4 flex justify-end">
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined className="text-gray-500" />}
          onChange={handleSearch}
          className="w-[200px]" // Limit width to 200px with Tailwind
        />
      </div>

      {type === "add" ? (
        <TableCheckbox
          header={header}
          dataSource={filteredData}
          pageSize={pageSize}
          rowSelection={rowSelection}
          pagination
        />
      ) : (
        <TableComponent
          header={header}
          dataSource={filteredData}
          pageSize={pageSize}
          pagination
        />
      )}
    </Modal>
  );
};

export default DynamicModal;
