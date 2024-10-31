import React from "react";
import { Modal } from "antd";
import TableComponent from "../table/TableComponent";
import DynamicButton from "../button/DynamicButton";

const DynamicModal = ({
  title,
  isVisible,
  onClose,
  header,
  dataSource,
  pageSize = 5, // default page size for table
  width = "1200px" // default width set to 80% of the viewport width for extra-large size
}) => {
  return (
    <Modal
      title={title}
      open={isVisible}
      onCancel={onClose}
      width={width} // Set the width of the modal here
      footer={[
        <DynamicButton
          key="close"
          text="Close"
          onClick={onClose}
          className="bg-[#B6AEAB] text-white rounded-sm p-2"
        />,
      ]}
    >
      <TableComponent header={header} dataSource={dataSource} pagination={{ pageSize }} />
    </Modal>
  );
};

export default DynamicModal;
