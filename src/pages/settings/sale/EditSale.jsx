import React, { useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import DynamicButton from "../../../components/button/DynamicButton";
import ActionButton from "../../../components/button/ActionButton";
import Filter from "../../../components/filter/Filter";

export default function EditSale() {
  const [loading, setLoading] = useState(false);


  const filters = [
    {
      key: "name",
      type: "select",
      label: "Name",
      options: [
        { value: "", label: "All" },
        { value: "John Doe", label: "John Doe" },
        { value: "Jane Smith", label: "Jane Smith" },
        // Add more names as options if needed
      ],
    },
    {
      key: "contact_number",
      type: "text",
      label: "Contact Number",
      placeholder: "All",
    },
    {
      key: "position",
      type: "select",
      label: "Position",
      options: [
        { value: "", label: "All" },
        { value: "Manager", label: "Manager" },
        { value: "Sales Assistant", label: "Sales Assistant" },
        { value: "Director", label: "Director" },
        // Add more positions as needed
      ],
    },
    {
      key: "role",
      type: "select",
      label: "Role",
      options: [
        { value: "", label: "All" },
        { value: "Admin", label: "Admin" },
        { value: "User", label: "User" },
        { value: "Viewer", label: "Viewer" },
        // Add more roles as needed
      ],
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
        <div className="title-page">Edit Sale Management</div>
        
        <Filter
          onSearch={handleSearch}
          onClear={handleClear}
          filters={filters}
        />

        <BoxPrimary>
          Sale Head
        </BoxPrimary>

        <BoxPrimary>
          <div className="flex justify-between space-x-4">
            Sale Team
            <ActionButton mode="add" text="Add" onClick={(e) => navigate("/setting/user/create")} />
          </div>
        </BoxPrimary>

        <div className="flex justify-end space-x-4">
          <DynamicButton
            text="Back"
            className="bg-[#B6AEAB] min-w-[96px] text-[#ffff] rounded-sm p-2"
            path='/setting/sale'
          />
          <DynamicButton
            text="Update"
            className="bg-[#00783F] min-w-[96px] text-[#ffff] rounded-sm p-2"
            path='/setting/sale'
          />
        </div>
      </MainLayout>

    </>
  );
}
