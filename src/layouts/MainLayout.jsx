import React from "react";
import { Spin } from "antd";
import {
  EditOutlined,
  EyeOutlined,
  LogoutOutlined,
  PlusOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import Navbar from "../components/navbar/Navbar";
export default function MainLayout({ children, loading, childrenStyle }) {
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
        {
          key: "1",
          label: "Work Plan",
          onClick: () => navigate("/sale-plan/work-plan"),
        },
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
      <Spin tip="Loading" size="large" fullscreen="true" spinning={loading} />
      <div className="max-w-screen flex flex-col h-screen">
        <Navbar menuItems={menuItems} userMenuItems={userMenuItems} />
        <div className={`flex flex-col gap-3 p-3 ${childrenStyle}`}>
          {children}
        </div>
      </div>
    </>
  );
}
