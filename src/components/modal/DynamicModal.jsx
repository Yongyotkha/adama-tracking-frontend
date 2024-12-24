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
  type,
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  // const filteredData = dataSource.filter(
  //   (item) =>
  //     console.log(item) ||
  //     item?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
  //     item?.territory?.toLowerCase().includes(searchText.toLowerCase()) ||
  //     item?.position?.toLowerCase().includes(searchText.toLowerCase())
  // );

  const filteredData = dataSource.filter((item) => {
    // ล็อกแต่ละ item สำหรับการดีบัก (สามารถลบได้เมื่อไม่ต้องการ)  
    const search = searchText.toLowerCase();
    const nameMatches =
      typeof item.name === 'string' &&
      item.name.toLowerCase().includes(search);
    const territoryMatches =
      typeof item.territory === 'string' &&
      item.territory.toLowerCase().includes(search);
    const positionMatches =
      typeof item.positionText === 'string' &&
      item.positionText.toLowerCase().includes(search);
  
    return nameMatches || territoryMatches || positionMatches;
  });

  
  
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  const handleAdd = () => {
    setSelectedRowKeys([]);
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
          className="w-[200px]"
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
