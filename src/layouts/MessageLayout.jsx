import React from "react";
import { Spin } from "antd";

export default function LoginLayout({ children, loading, childrenStyle }) {
  return (
    <>
      <Spin tip="Loading" size="large" fullscreen="true" spinning={loading} />
      <div
        className={`w-[100vw] h-screen bg-[url('/img/Bg-massage.png')] bg-no-repeat bg-center bg-fixed bg-[length:100%_100%]`}
      >
        <div className={` ${childrenStyle}`}>{children}</div>
      </div>
    </>
  );
}
