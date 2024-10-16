import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Logo from "../../components/logo/Logo";
import Filter from "../../components/filter/Filter";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  // Mock years and statuses for the filter component
  const years = [2021, 2022, 2023];
  const statuses = ["Active", "Inactive", "Pending"];

  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  return (
    <>
      <MainLayout
        loading={loading}
        childrenStyle={'flex flex-col m-5'}
      >
        {/* <Logo width="w-[20%]" /> */}
        {/* Filter Component */}
        <Filter
          onSearch={handleSearch}
          onClear={handleClear}
          years={years}
          statuses={statuses}
        />
      </MainLayout>


    </>
  );
}
