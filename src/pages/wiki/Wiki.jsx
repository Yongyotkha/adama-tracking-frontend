import React from "react";
import Navbar from "../../components/navbar/Navbar";
import DropdownHover from "../../components/dropdown/DropdownHover";
import DynamicButton from "../../components/button/Button";
import BoxPrimary from "../../components/box_primary/BoxPrimary"; // Import the BoxPrimary component
import { PlusOutlined } from "@ant-design/icons";

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
      icon: <PlusOutlined style={{ fontSize: "18px" }} />,
    },
    {
      key: "3",
      label: "View",
      icon: <PlusOutlined style={{ fontSize: "18px" }} />,
    },
    {
      key: "4",
      label: "Logout",
      icon: <PlusOutlined style={{ fontSize: "18px" }} />,
    },
  ];

  return (
    <>
      {/* Navbar Component with dynamic props */}
      <Navbar menuItems={menuItems} userMenuItems={userMenuItems} />

      <hr className="my-4" />

      {/* Dynamic BoxPrimary component with custom content */}
      <BoxPrimary>
        <h4>Overall Target</h4>
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
          <span>391,750,000</span>
          <span>THB</span>
        </div>
      </BoxPrimary>

      {/* Dynamic Button with Ant Design icon */}
      <DynamicButton
        text="Add New Item"
        icon={<PlusOutlined />}
        className="bg-blue-500 text-white rounded-lg p-2"
        type="primary"
        onClick={() => alert("Ant Design Icon Button Clicked!")}
      />

      {/* Dynamic Button with image icon */}
      <DynamicButton
        text="View Report"
        iconSrc="/img/icons/expenses.png"
        className="bg-green-500 text-white rounded-lg p-2"
        type="default"
        onClick={() => alert("Image Icon Button Clicked!")}
      />

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
