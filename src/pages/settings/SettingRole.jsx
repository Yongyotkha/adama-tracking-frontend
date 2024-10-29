import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Logo from "../../components/logo/Logo";
import Filter from "../../components/filter/Filter";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  const filters = [
    {
      key: 'year',
      type: 'select',
      label: 'Year',
      options: [
        { value: 2021, label: '2021' },
        { value: 2022, label: '2022' },
        { value: 2023, label: '2023' },
      ],
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Pending', label: 'Pending' },
      ],
    },
    {
      key: 'productName',
      type: 'text',
      label: 'Product Name',
      placeholder: 'Enter product name',
    },
    {
      key: 'quantity',
      type: 'number',
      label: 'Quantity',
      placeholder: 'Enter quantity',
    },
  ];
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
      >
        <div className="title-page">Manage Roles</div>

        <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />

      </MainLayout>


    </>
  );
}
