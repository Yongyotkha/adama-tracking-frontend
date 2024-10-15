import React from "react";
import { Button } from "antd";
import Navbar from "../../components/navbar/Navbar";
import DropdownHover from "../../components/dropdown/DropdownHover";
import {
  EditOutlined,
  EyeOutlined,
  LogoutOutlined,
  PlusOutlined,
  SmileOutlined,
} from "@ant-design/icons";

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
    {
      label: "Dashboard",
      icon: "/img/icons/dashboard.png",
      dropdownMenu: false,
    },
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
      src: "/img/icons/view.png",
    }, // Fallback to image if needed
    {
      key: "4",
      label: "Logout",
      icon: <LogoutOutlined style={{ fontSize: "18px" }} />,
    },
  ];

  return (
    <>
      {/* Navbar Component with dynamic props */}
      <Navbar menuItems={menuItems} userMenuItems={userMenuItems} />

      <hr className="my-4" />

      {/* Button Component */}
      <Button>BTN</Button>


      {/* Dynamic Dropdown Hover Component */}
      <DropdownHover
        items={dropdownHoverItems}
        triggerText="Dynamic Hover Menu"
      />
    </>
  );
};

export default Wiki;
