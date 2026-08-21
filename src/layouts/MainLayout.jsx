import React from "react";
import { Spin } from "antd";

import Navbar from "../components/navbar/Navbar";
import { Navigate } from "react-router-dom";
export default function MainLayout({ children, loading, childrenStyle }) {
  return (
    <>
      <Spin tip="Loading" size="large" fullscreen spinning={!!loading} />
      <div className="max-w-screen flex flex-col h-screen bg-[#F5F3F3]">
        <Navbar />
        <div className={`flex flex-col gap-3 p-3 bg-[#F5F3F3] ${childrenStyle}`}>
          {children}
        </div>
      </div>
    </>
  );
}
