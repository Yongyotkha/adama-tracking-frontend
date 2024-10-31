import React, { useState } from "react";
import { Modal, Input } from "antd";
import DynamicButton from "../button/DynamicButton";
import TableComponent from "../table/TableComponent";
import TableCheckbox from "../table/TableCheckbox"; // Import TableCheckbox

const DynamicModal = ({
  title,
  isVisible,
  onClose,
  header,
  dataSource,
  pageSize = 5,
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
      title={title}
      open={isVisible}
      onCancel={onClose}
      width={width}
      footer={[
        <DynamicButton
          key="close"
          text="Close"
          onClick={onClose}
          className="bg-[#B6AEAB] text-white rounded-sm p-2"
        />,
        type === "add" && (
          <DynamicButton
            key="add"
            text="Add"
            onClick={handleAdd}
            className="bg-[#009845] text-white rounded-sm p-2 ms-3"
          />
        ),
      ]}
    >
      <Input
        placeholder="Search..."
        onChange={handleSearch}
        style={{ marginBottom: 16 }}
      />
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
