import React, { useState } from "react";
import { Modal, Input } from "antd";
import TableComponent from "../table/TableComponent";
import DynamicButton from "../button/DynamicButton";

const DynamicModal = ({
  title,
  isVisible,
  onClose,
  header,
  dataSource,
  pageSize = 5,
  width = "1200px",
}) => {
  const [searchText, setSearchText] = useState("");

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = dataSource.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.territory.toLowerCase().includes(searchText.toLowerCase()) ||
      item.position.toLowerCase().includes(searchText.toLowerCase())
  );

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
      ]}
    >
      <Input
        placeholder="Search..."
        onChange={handleSearch}
        style={{
          marginBottom: 16,
          paddingRight: 30, // Add padding to the right to make space for the icon
        }}
        suffix={
          <img
            src="/img/icons/search-table.png"
            alt="Search icon"
            style={{
              width: 16, // Adjust the size as needed
              height: 16,
              position: "absolute",
              right: 10,
              pointerEvents: "none", // Makes the icon non-clickable
            }}
          />
        }
      />
      <TableComponent header={header} dataSource={filteredData} pagination={{ pageSize }} />
    </Modal>
  );
};

export default DynamicModal;
