import React, { useState } from "react";
import { Input } from "antd"; // Import Ant Design's Input component
import Navbar from "../../components/navbar/Navbar";
import DropdownHover from "../../components/dropdown/DropdownHover";
import DynamicButton from "../../components/button/Button";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import Filter from "../../components/filter/Filter";
import { PlusOutlined } from "@ant-design/icons";
import MainLayout from "../../layouts/MainLayout";
import TableComponent from "../../components/table/TableComponent";

const Wiki = () => {
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Age",
      dataIndex: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
    },
  ];

  // Define the data source for the table
  const dataSource = Array.from({
    length: 46,
  }).map((_, i) => ({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  }));

  // Calculate totals for the footer
  const totalValue1 = dataSource.length * 1000; // Example calculation for the first total
  const totalValue2 = dataSource.length * 2000; // Example calculation for the second total
  const totalValue3 = dataSource.length * 3000; // Example calculation for the third total
  const totalValue4 = dataSource.length * 4000; // Example calculation for the fourth total

  const dropdownHoverItems = [
    {
      key: "1",
      label: (
        <a rel="noopener noreferrer" href="#">
          Dynamic menu item 1
        </a>
      ),
      icon: <PlusOutlined />,
    },
    {
      key: "2",
      danger: true,
      label: "Danger item",
    },
  ];

  // Filter Handle Search
  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  // Filter Handle Clear
  const handleClear = () => {
    console.log("Filters cleared");
  };

  // Mock years and statuses for the filter component
  const years = [2021, 2022, 2023];
  const statuses = ["Active", "Inactive", "Pending"];

  return (
    <MainLayout loading={loading}>
      {/* Filter Component */}
      <span>Filter</span>
      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        years={years}
        statuses={statuses}
      />
      <hr className="my-5" />

      {/* Dynamic Button with Ant Design icon */}
      <span>DynamicButton 1</span>
      <DynamicButton
        text="Add New Item"
        icon={<PlusOutlined />}
        className="text-white rounded-lg p-2"
        type="primary"
        onClick={() => alert("Ant Design Icon Button Clicked!")}
        style={{
          backgroundColor: "#00783F",
        }}
      />

      <hr className="my-5" />

      {/* Dynamic Button with image icon */}
      <span>DynamicButton 2 (Style + iconSrc)</span>
      <DynamicButton
        text="View Report"
        iconSrc="/img/icons/expenses.png"
        className="bg-green-500 text-white rounded-lg p-2"
        type="primary"
        onClick={() => alert("Image Icon Button Clicked!")}
        variant="solid"
        style={{ color: "#000000", backgroundColor: "#00783F" }}
      />
      <hr className="my-5" />

      {/* Dynamic Dropdown Hover Component */}
      <span>Dynamic Dropdown Hover</span>
      <DropdownHover
        items={dropdownHoverItems}
        triggerText="Dynamic Hover Menu"
        className="bg-blue-500 text-white rounded-lg p-3"
      />
      <hr className="my-5" />

      {/* Dynamic BoxPrimary component with custom content */}
      <span>BoxPrimary</span>
      <BoxPrimary></BoxPrimary>
      <hr className="my-5" />

      {/* Ant Design Table Component */}
      <span>Table Component + BoxPrimary</span>
      <BoxPrimary>
        <TableComponent
          columns={columns}
          dataSource={dataSource}
          title="List of Users"
          footer={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "bold" }}>Total (THB):</span>
              <div style={{ display: "flex", gap: "10px" }}>
                <Input
                  value={totalValue1.toLocaleString()}
                  disabled
                  style={{ width: 150, textAlign: "right" }}
                />
                <Input
                  value={totalValue2.toLocaleString()}
                  disabled
                  style={{ width: 150, textAlign: "right" }}
                />
                <Input
                  value={totalValue3.toLocaleString()}
                  disabled
                  style={{ width: 150, textAlign: "right" }}
                />
                <Input
                  value={totalValue4.toLocaleString()}
                  disabled
                  style={{ width: 150, textAlign: "right" }}
                />
              </div>
            </div>
          } // Dynamic footer with calculated totals and aligned inputs
        />
      </BoxPrimary>
    </MainLayout>
  );
};

export default Wiki;
