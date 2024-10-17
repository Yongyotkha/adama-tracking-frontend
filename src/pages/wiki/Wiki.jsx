import React, { useState } from "react";
import BadgeStatus from "../../components/badge/BadgeStatus"; // Import the new BadgeStatus component
import DropdownHover from "../../components/dropdown/DropdownHover";
import DynamicButton from "../../components/button/Button";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import Filter from "../../components/filter/Filter";
import { PlusOutlined } from "@ant-design/icons";
import MainLayout from "../../layouts/MainLayout";

const Wiki = () => {
  const [loading, setLoading] = useState(false);

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

  return (
    <MainLayout loading={loading}>
      {/* Filter Component */}
      <span>Filter</span>
      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        years={[2021, 2022, 2023]}
        statuses={["Active", "Inactive", "Pending"]}
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

      {/* Dynamic BadgeStatus component */}
      <span>BadgeStatus (Dynamic colors)</span>
      <BadgeStatus text="Active" bgColor="#00783F" textColor="#FFFFFF" />
      <BadgeStatus text="Inactive" bgColor="#FF0000" textColor="#FFFFFF" />
      <BadgeStatus text="Pending" bgColor="#FFA500" textColor="#FFFFFF" />
    </MainLayout>
  );
};

export default Wiki;
