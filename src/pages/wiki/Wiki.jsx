import React, { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import DropdownHover from "../../components/dropdown/DropdownHover";
import DynamicButton from "../../components/button/Button";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import Filter from "../../components/filter/Filter"; // Import the Filter component
import { EditOutlined, EyeOutlined, LogoutOutlined, PlusOutlined } from "@ant-design/icons";
import MainLayout from "../../layouts/MainLayout";
import TableComponent from "../../components/table/TableComponent";

const Wiki = () => {
  const [loading, setLoading] = useState(false);

  // Filter Handle Search
  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };
  // Filter Handle Clear
  const handleClear = () => {
    console.log("Filters cleared");
  };

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

  // Mock years and statuses for the filter component
  const years = [2021, 2022, 2023];
  const statuses = ["Active", "Inactive", "Pending"];



  return (
    <>
      <MainLayout
        loading={loading}
      >
        {/* Filter Component */}
        <span>Filter</span>
        <Filter
          onSearch={handleSearch}
          onClear={handleClear}
          years={years}
          statuses={statuses}
        />
        <hr className="my-5" />

        {/* Dynamic BoxPrimary component with custom content */}
        <span>BoxPrimary</span>
        <BoxPrimary />
        <hr className="my-5" />

        {/* Dynamic Button with Ant Design icon */}
        <span>DynamicButton 1</span>
        <DynamicButton
          text="Add New Item"
          icon={<PlusOutlined />} // Ant Design icon
          className="text-white rounded-lg p-2"
          type="primary"
          onClick={() => alert("Ant Design Icon Button Clicked!")}
          style={{
            backgroundColor: '#00783F', // Default background color
          }}
        />

        <hr className="my-5" />

        {/* Dynamic Button with image icon */}
        <span>DynamicButton 2 (Style + iconSrc)</span>
        <DynamicButton
          text="View Report"
          iconSrc="/img/icons/expenses.png" // Custom image icon
          className="bg-green-500 text-white rounded-lg p-2"
          type="primary"
          onClick={() => alert("Image Icon Button Clicked!")}
          variant="solid"
          style={{ color: '#000000', backgroundColor: '#00783F', }} // Correct style format
        />
        <hr className="my-5" />


        {/* Dynamic Dropdown Hover Component */}
        <span>Dynamic Dropdown Hover</span>
        <DropdownHover
          items={dropdownHoverItems}
          triggerText="Dynamic Hover Menu"
          className="bg-blue-500 text-white rounded-lg p-3"
        />
        {/* Ant Design Table Component */}
        <span>Table Component</span>
        <TableComponent />
      </MainLayout >

    </>
  );
};

export default Wiki;
