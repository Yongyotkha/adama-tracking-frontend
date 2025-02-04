import React from "react";
import { Spin } from "antd";
import Logo from "../logo/Logo";

const NavbarMobile = () => {
  return (
    <nav className="bg-[#009845] flex items-center justify-center px-4 w-full h-16 fixed top-0 left-0 right-0 z-50">
      <Logo width="w-[150px]" />
    </nav>
  );
};

const MobileLayout = ({ children, loading, childrenStyle }) => {
  return (
    <>
      <Spin tip="Loading" size="large" fullscreen spinning={loading} />
      <div className="max-w-screen flex flex-col h-screen pt-16 bg-[#009845]">
        <NavbarMobile />
        <div className={`flex flex-col p-5 bg-white rounded-tr-[80px] h-full ${childrenStyle}`}>
          {children}
        </div>
      </div>
    </>
  );
};

export { NavbarMobile, MobileLayout };
