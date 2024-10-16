import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Logo from "../../components/logo/Logo";
import Filter from "../../components/filter/Filter";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";

export default function WorkPlan() {
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

  const columns = [
    {
      title: "Years",
      width: 100,
      dataIndex: "name",
      key: "name",
      fixed: "left",
    },
    {
      title: "Work Plan (THB)",
      width: 100,
      dataIndex: "name",
      key: "name",
      fixed: "left",
    },
    {
      title: "Last modified",
      width: 100,
      dataIndex: "name",
      key: "name",
      fixed: "left",
    },
    {
      title: "Status",
      width: 100,
      dataIndex: "name",
      key: "name",
      fixed: "left",
    },
    {
      title: "Action",
      width: 100,
      dataIndex: "name",
      key: "name",
      fixed: "left",
    },
  ];

  // Define the data source for the table
  const dataSource = Array.from({
    length: 46,
  }).map((_, i) => ({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  }));

  return (
    <>
      <MainLayout loading={loading} childrenStyle={"flex flex-col gap-3"}>
        <div>Work Plan</div>
        <Filter
          onSearch={handleSearch}
          onClear={handleClear}
          years={years}
          statuses={statuses}
        />
        <BoxPrimary>
          <TableComponent columns={columns} dataSource={dataSource} />
        </BoxPrimary>
      </MainLayout>
    </>
  );
}
