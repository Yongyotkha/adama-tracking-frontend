import React, { useState, useEffect, useRef, useContext } from "react";
import { Menu, Dropdown, Carousel } from "antd";
import "./Navbar.css";
import Logo from "../logo/Logo";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import {
  EditOutlined,
  EyeOutlined,
  LogoutOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const Navbar = () => {
  const navigate = useNavigate(); // เริ่มต้นการนำทาง
  const location = useLocation();
  const carouselRef = useRef(null); // Create a reference for the carousel
  const [activeIndex, setActiveIndex] = useState(0); // Track active index

  const { userInfo, logout } = useContext(AuthContext);

  const menuItems = [
    {
      label: "Dashboard",
      icon: "/img/icons/dashboard.png",
      dropdownMenu: false,
      path: "/", // Navigates to Dashboard
    },
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
        {
          key: "2",
          label: "Rolling Forecast",
          path: "sale-plan/rolling-forecast",
        },
        {
          key: "3",
          label: "Quarter",
          path: "sale-plan/quarter",
        },
      ],
    },
    {
      label: "Activity",
      icon: "/img/icons/activity.png",
      path: "activity",
      dropdownMenu: true,
      dropdownItems: [
        {
          key: "1",
          label: "Activity Plan",
          path: "activity/plan",
        },
        {
          key: "2",
          label: "Calendar",
          path: "activity/calendar",
        },
        {
          key: "3",
          label: "Activity List",
          path: "activity/list",
        },
        {
          key: "4",
          label: "Mapping",
          path: "activity/mapping",
        },
      ],
    },
    {
      label: "Order",
      icon: "/img/icons/activity.png",
      path: "order",
      dropdownMenu: true,
      dropdownItems: [
        {
          key: "1",
          label: "Order List",
          path: "order/list",
        },
        {
          key: "2",
          label: "Order Waiting List",
          path: "order-waiting/list",
        },
      ],
    },
    {
      label: "Expenses",
      icon: "/img/icons/expenses.png",
      path: "expenses",
      dropdownMenu: true,
      dropdownItems: [
        {
          key: "1",
          label: "Advance",
          path: "expenses/advance",
        },
        {
          key: "2",
          label: "Clearing",
          path: "expenses/clearing",
        },
        {
          key: "3",
          label: "Traveling",
          path: "expenses/traveling",
        },
        {
          key: "4",
          label: "Material",
          path: "expenses/material",
        },
        {
          key: "5",
          label: "Simple",
          path: "expenses/simple",
        },
        {
          key: "6",
          label: "Product Claim",
          path: "expenses/product-claim",
        },
      ],
    },
    {
      label: "Customer",
      icon: "/img/icons/customer.png",
      dropdownMenu: true,
      dropdownItems: [
        {
          key: "1",
          label: "Dealer",
          path: "customer/dealer",
        },
        {
          key: "2",
          label: "Sub Dealer",
          path: "customer/sub-dealer",
        },
      ],
    },
    {
      label: "Report",
      icon: "/img/icons/report.png",
      dropdownMenu: true,
      dropdownItems: [
        { key: "1", label: "Monthly Report", path: "report/monthly" },
        { key: "2", label: "Quarterly Report", path: "report/quarterly" },
        { key: "3", label: "Yearly Report", path: "report/yearly" },
      ],
    },
    {
      label: "Setting",
      icon: "/img/icons/setting.png",
      dropdownMenu: true,
      dropdownItems: [
        { key: "1", label: "Manage Roles", path: "setting/role" },
        { key: "2", label: "Manage Users", path: "setting/user" },
        { key: "3", label: "Sale Management", path: "setting/sale" },
        { key: "4", label: "Product Management", path: "setting/product" },
        { key: "5", label: "Promotion Management", path: "setting/promotion" },
      ],
    },
  ];

  const CustomDropdownMenu = ({ items }) => {
    return (
      <Menu
        onClick={({ key }) => {
          const item = items.find((item) => item.key === key);
          if (item.onClick) {
            item.onClick();
          } else {
            navigate(`/${item.path}`);
          }
        }}
        items={items.map((item) => ({
          key: item.key,
          label: (
            <span
              className={`${
                location.pathname.startsWith(`/${item.path}`)
                  ? "pointer-events-none font-bold text-[#009845]"
                  : "text-[#978B87]"
              } py-1`} // add padding, rounded corners, and block display for consistent styling
            >
              {item.label}
            </span>
          ),
        }))}
        className="relative bg-white bg-right bg-no-repeat bg-contain p-4 rounded-md w-[300px] text-[#978B87]"
        style={{ backgroundImage: "url('/img/dropdown-bg.png')" }}
      />
    );
  };

  const userMenuItems = [
    {
      key: "1",
      label: "Create",
      icon: <PlusOutlined style={{ fontSize: "18px" }} />,
      path: "/setting/user/create", // Adjust this to the actual route you want
    },
    {
      key: "2",
      label: "Edit",
      icon: <EditOutlined style={{ fontSize: "18px" }} />,
      path: "/setting/user/edit", // Adjust this to the actual route you want
    },
    {
      key: "3",
      label: "View",
      icon: <EyeOutlined style={{ fontSize: "18px" }} />,
      path: "/setting/user", // Adjust this to the actual route you want
    },
    {
      key: "4",
      label: "Logout",
      icon: <LogoutOutlined style={{ fontSize: "18px" }} />,
      path: "logout", // Adjust this to the actual route or logout logic
    },
  ];

  const CustomDropdownMenuProfile = ({ items }) => {
    const navigate = useNavigate();

    const menuProfileItems = items.map((item) => ({
      key: item.key,
      label: (
        <div
          className="flex items-center gap-[10px] cursor-pointer text-[#978B87]"
          onClick={() => {
            if (item.path == "logout") {
              logout();
            } else {
              navigate(item.path);
            }
          }}
        >
          {item.icon ? (
            item.icon
          ) : (
            <img
              src={item.src}
              alt={`${item.label} Icon`}
              className="w-5 h-5 mr-2"
            />
          )}
          <span className="text-[#978B87]">{item.label}</span>
        </div>
      ),
    }));

    return (
      <Menu
        items={menuProfileItems}
        className="relative bg-white bg-right bg-no-repeat bg-contain p-4 rounded-md text-[#978B87]"
      />
    );
  };

  const isActivePath = (path, subPaths = []) => {
    return (
      location.pathname === path ||
      subPaths.some((subPath) => location.pathname.startsWith(`/${subPath}`))
    );
  };

  const handleNavigate = (path, index) => {
    setActiveIndex(index); // Set active index when navigating
    navigate(path);
  };

  useEffect(() => {
    // Update the active index based on the current path
    const currentIndex = menuItems.findIndex((item) =>
      item.dropdownMenu
        ? isActivePath(
            item.path,
            item.dropdownItems.map((subItem) => subItem.path)
          )
        : isActivePath(item.path)
    );
    setActiveIndex(currentIndex >= 0 ? currentIndex : 0);

    // Slide the carousel to the active menu item
    if (carouselRef.current && currentIndex >= 0) {
      carouselRef.current.goTo(currentIndex, false); // Slide to active index
    }
  }, [location.pathname]);

  const carouselSettings = {
    dots: false,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: Math.min(menuItems.length),
    ref: carouselRef,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <nav className="bg-[#009845] flex items-center justify-between px-4 relative w-full shadow-[0_4px_4px_0px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-start w-1/6">
        <Logo width="w-[150px]" />
      </div>

      <div className="relative px-5 w-4/6 max-w-3xl">
        <Carousel arrows infinite={false} {...carouselSettings}>
          {menuItems.map((item, index) => {
            const isActive = item.dropdownMenu
              ? isActivePath(
                  item.path,
                  item.dropdownItems.map((subItem) => subItem.path)
                )
              : isActivePath(item.path);

            if (item.dropdownMenu) {
              return (
                <Dropdown
                  key={index}
                  overlay={<CustomDropdownMenu items={item.dropdownItems} />}
                >
                  <div
                    className={`py-5 text-center text-white flex items-center justify-center h-full menu-item ${
                      isActive ? "bg-[#00783f]" : "hover:bg-[#00783f]"
                    }`}
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
                  className={`py-5 text-center text-white flex items-center justify-center h-full menu-item ${
                    isActive ? "bg-[#00783f]" : "hover:bg-[#00783f]"
                  } cursor-pointer`}
                  onClick={() => handleNavigate(item.path, index)}
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
        <span className="text-white hidden md:block">{userInfo?.name_th}</span>

        <Dropdown
          overlay={<CustomDropdownMenuProfile items={userMenuItems} />}
          trigger={["click", "hover"]}
          placement="bottomRight"
        >
          <img
            src="/img/profile.jpg"
            alt="User Avatar"
            className="rounded-full h-10 w-10 mx-2 cursor-pointer"
          />
        </Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;
