import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../components/button/ActionButton";
import TableExpand from "../../../components/table/TableExpand";

export default function CreateSale() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const salesData = [
    {
      key: "1",
      no: 1,
      name: "Sarawut Nisap",
      position: "Business Development Executive",
      territory: "Central",
      nestedData: [
        {
          key: "1-1",
          no: 1,
          name: "Passakorn Kong-In",
          position: "Sales Assistant",
          territory: "Right North",
        },
      ],
    },
    {
      key: "2",
      no: 2,
      name: "Tanadol Kaewyai",
      position: "Sales Assistant",
      territory: "Central",
      nestedData: [
        {
          key: "2-1",
          no: 1,
          name: "Ratchada Saensuk",
          position: "Junior Sales Assistant",
          territory: "Left North",
        },
        {
          key: "2-2",
          no: 2,
          name: "Somchai Pracha",
          position: "Senior Sales Assistant",
          territory: "Left South",
        },
      ],
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Sale Management</div>

      <BoxPrimary>
        <div className="flex justify-between space-x-4 mb-3">
          <span className="text-[#00783F]">Sale Team</span>
          <ActionButton mode="add" text="Add" onClick={(e) => navigate("/setting/user/create")} />
        </div>
        <TableExpand data={salesData} />
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={(e) => navigate("/setting/sale")} />
        <ActionButton mode="update" text="Update" onClick={(e) => navigate("/setting/sale")} />
      </div>
    </MainLayout>
  );
}
