import React, { useState } from "react";
import { Menu, Dropdown, Carousel } from "antd";
import "./Navbar.css";
import Logo from "../logo/Logo";
import { useNavigate } from "react-router-dom";
import {
  EditOutlined,
  EyeOutlined,
  LogoutOutlined,
  PlusOutlined,
  SmileOutlined,
} from "@ant-design/icons";
const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate(); // เริ่มต้นการนำทาง

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
          path: "sale-plan/work-plan",
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
    },
    {
      key: "4",
      label: "Logout",
      icon: <LogoutOutlined style={{ fontSize: "18px" }} />,
    },
  ];

  const handleDropdownOpenChange = (key, open) => {
    setOpenDropdown(open ? key : null);
  };

  const CustomDropdownMenu = ({ items }) => {
    return (
      <Menu
        onClick={({ key }) => {
          console.log(key);
          const item = items.find((item) => item.key === key);
          if (item.onClick) {
            item.onClick();
          } else {
            navigate(`/${item.path}`);
          }
        }}
        items={items.map((item) => ({
          key: item.key,
          label: <span style={{ color: "#978B87" }}>{item.label}</span>,
        }))}
        className="relative bg-white bg-right bg-no-repeat bg-contain p-4 rounded-md w-[300px] text-[#978B87]"
        style={{ backgroundImage: "url('/img/dropdown-bg.png')" }}
      />
    );
  };

  const CustomDropdownMenuProfile = ({ items }) => {
    const menuItems = items.map((item) => ({
      key: item.key,
      label: (
        <div
          className="flex items-center gap-[10px]"
          style={{ color: "#978B87" }}
        >
          {item.icon ? (
            item.icon
          ) : (
            <img
              src={item.src}
              alt={`${item.label} Icon`}
              className="w-5 h-5 mr-2"
            /> // Fallback to image if no icon
          )}
          <span style={{ color: "#978B87" }}>{item.label}</span>
        </div>
      ),
    }));

    return (
      <Menu
        items={menuItems}
        className="relative bg-white bg-right bg-no-repeat bg-contain p-4 rounded-md text-[#978B87]"
      />
    );
  };

  // Carousel Settings
  const carouselSettings = {
    dots: false,
    speed: 500,
    slidesToShow: 6,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <nav className="bg-[#009845] flex items-center justify-between px-4 relative w-full shadow-[0_4px_4px_0px_rgba(0,0,0,0.25)]">
      {/* Left Section with Logo */}
      <div className="flex items-center justify-start w-1/6">
        <Logo width="w-[150px]" />
      </div>

      {/* Middle Section with Menu inside Carousel */}
      <div className="relative px-5 w-4/6 max-w-3xl">
        <Carousel arrows infinite={false} {...carouselSettings}>
          {menuItems.map((item, index) => {
            if (item.dropdownMenu) {
              return (
                <Dropdown
                  key={index}
                  overlay={<CustomDropdownMenu items={item.dropdownItems} />}
                  onOpenChange={(open) =>
                    handleDropdownOpenChange(item.label, open)
                  }
                >
                  <div
                    className={`py-5 text-center text-white flex items-center justify-center h-full menu-item`}
                  >
                    <img
                      src={item.icon}
                      alt={`${item.label} Icon`}
                      className="mr-2 w-6 h-6"
                    />
                    {item.label}
                  </div>
                </Dropdown>
              );
            } else {
              return (
                <div
                  key={index}
                  className="py-5 text-center text-white flex items-center justify-center h-full menu-item"
                >
                  <img
                    src={item.icon}
                    alt={`${item.label} Icon`}
                    className="mr-2 w-6 h-6"
                  />
                  {item.label}
                </div>
              );
            }
          })}
        </Carousel>
      </div>

      <div className="flex items-center w-1/6 justify-end">
        <span className="text-white hidden md:block">Chayanon</span>

        <Dropdown
          overlay={<CustomDropdownMenuProfile items={userMenuItems} />}
          trigger={["click", "hover"]}
          placement="bottomRight"
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTSKbCFe_QYSVH-4FpaszXvakr2Eti9eAJpQ&s"
            alt="User Avatar"
            className="rounded-full h-10 w-10 mx-2 cursor-pointer"
          />
        </Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;
