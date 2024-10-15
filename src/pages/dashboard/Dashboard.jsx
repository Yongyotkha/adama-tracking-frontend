import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Logo from "../../components/logo/Logo";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <MainLayout
        loading={loading}
        childrenStyle="flex justify-center items-center  flex-col gap-3 h-full bg-green-200"
      >
        <Logo width="w-[20%]" />
      </MainLayout>
    </>
  );
}
