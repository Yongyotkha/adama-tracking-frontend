import React from "react";
import Navbar from "../../components/navbar/Navbar";
import DropdownHover from "../../components/dropdown/DropdownHover";
import DynamicButton from "../../components/button/Button";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import Filter from "../../components/filter/Filter"; // Import the Filter component
import { EditOutlined, EyeOutlined, LogoutOutlined, PlusOutlined } from "@ant-design/icons";

const Wiki = () => {
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

  const menuItems = [
    { label: "Dashboard", icon: "/img/icons/dashboard.png", dropdownMenu: false },
    { label: "Customer", icon: "/img/icons/customer.png", dropdownMenu: false },
    {
      label: "Sale Plan",
      icon: "/img/icons/sale-plan.png",
      dropdownMenu: true,
      dropdownItems: [
        { key: "1", label: "Work Plan" },
        { key: "2", label: "Rolling Forecast" },
        { key: "3", label: "Quarter" },
      ],
    },
    { label: "Activity", icon: "/img/icons/activity.png", dropdownMenu: false },
    { label: "Expenses", icon: "/img/icons/expenses.png", dropdownMenu: false },
    {
      label: "Report",
      icon: "/img/icons/report.png",
      dropdownMenu: true,
      dropdownItems: [
        { key: "1", label: "Monthly Report" },
        { key: "2", label: "Quarterly Report" },
        { key: "3", label: "Yearly Report" },
      ],
    },
    { label: "Setting", icon: "/img/icons/setting.png", dropdownMenu: false },
  ];

  const userMenuItems = [
    {
      key: "1",
      label: "Create",
      icon: <PlusOutlined style={{ fontSize: "18px" }} />,
    },
    {
      key: "2",
      label: "Edit",
      icon: <EditOutlined style={{ fontSize: "18px" }} />,
    },
    {
      key: "3",
      label: "View",
      icon: <EyeOutlined style={{ fontSize: "18px" }} />,
    },
    {
      key: "4",
      label: "Logout",
      icon: <LogoutOutlined style={{ fontSize: "18px" }} />,
    },
  ];

  // Mock years and statuses for the filter component
  const years = [2021, 2022, 2023];
  const statuses = ["Active", "Inactive", "Pending"];

  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  return (
    <>
      {/* Navbar Component with dynamic props */}
      <span>NAVBAR</span>
      <Navbar menuItems={menuItems} userMenuItems={userMenuItems} />
      <hr className="my-5" />

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


      <span>Dynamic Dropdown Hover</span>
      {/* Dynamic Dropdown Hover Component */}
      <DropdownHover
        items={dropdownHoverItems}
        triggerText="Dynamic Hover Menu"
        className="bg-blue-500 text-white rounded-lg p-3"
      />

    </>
  );
};

export default Wiki;
