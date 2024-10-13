import React from "react";
import { Spin } from "antd";

export default function MainLayout({ children, loading }) {
  return (
    <>
      <Spin tip="Loading" size="large" fullscreen="true" spinning={loading} />
      <div className="w-screen h-screen">

        
        {/* navbar */}


        <div>{children}</div>
      </div>
    </>
  );
}
