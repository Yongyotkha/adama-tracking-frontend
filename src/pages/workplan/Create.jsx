import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";
import DynamicButton from "../../components/button/Button";

export default function WorkPlan() {
  const [loading, setLoading] = useState(false);

  // Define the custom columns for the table
  const columns = [
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Pack Size",
      dataIndex: "packSize",
      key: "packSize",
    },
    {
      title: "Original Plan",
      dataIndex: "originalPlan",
      key: "originalPlan",
    },
    {
      title: "Value (THB)",
      dataIndex: "valueTHB",
      key: "valueTHB",
    },
    {
      title: "Qty (KG)",
      dataIndex: "qtyKG1",
      key: "qtyKG1",
    },
    {
      title: "Value (THB)",
      dataIndex: "valueTHB1",
      key: "valueTHB1",
    },
    {
      title: "Qty (KG)",
      dataIndex: "qtyKG2",
      key: "qtyKG2",
    },
    {
      title: "Value (THB)",
      dataIndex: "valueTHB2",
      key: "valueTHB2",
    },
  ];

  // Define the data source for the table based on the image
  const dataSource = [
    {
      key: 1,
      productName: "Ossinate 15%SL",
      packSize: "1Kg.",
      originalPlan: 30000,
      valueTHB: "7,500,000",
      qtyKG1: 8000,
      valueTHB1: "30,000",
      qtyKG2: 7000,
      valueTHB2: "2,000,000",
    },
    {
      key: 2,
      productName: "Apopo 20%SE",
      packSize: "1Lt.",
      originalPlan: 80000,
      valueTHB: "28,000,000",
      qtyKG1: 20000,
      valueTHB1: "80,000",
      qtyKG2: 15000,
      valueTHB2: "5,250,000",
    },
    {
      key: 3,
      productName: "Atramex 90WG",
      packSize: "5Kg.",
      originalPlan: 170000,
      valueTHB: "76,500,000",
      qtyKG1: 30000,
      valueTHB1: "170,000",
      qtyKG2: 20000,
      valueTHB2: "22,500,000",
    },
    {
      key: 4,
      productName: "Baloirc 320EC",
      packSize: "0.5Lt.",
      originalPlan: 5000,
      valueTHB: "750,000",
      qtyKG1: 1000,
      valueTHB1: "5,000",
      qtyKG2: 0,
      valueTHB2: "0",
    },
    {
      key: 5,
      productName: "Bla-S",
      packSize: "0.25Lt.",
      originalPlan: 280000,
      valueTHB: "70,000,000",
      qtyKG1: 87000,
      valueTHB1: "280,000",
      qtyKG2: 20000,
      valueTHB2: "5,000,000",
    },
    {
      key: 6,
      productName: "Bumper P",
      packSize: "0.5Lt.",
      originalPlan: 2000,
      valueTHB: "500,000",
      qtyKG1: 400,
      valueTHB1: "2,000",
      qtyKG2: 100,
      valueTHB2: "50,000",
    },
    // Add more rows similarly based on your actual data
  ];

  // Calculate totals for the footer (replace with actual calculations)
  const totalValue1 = 50750000; // Example total value
  const totalValue2 = 63325000; // Example total value
  const totalValue3 = 26525000; // Example total value
  const totalValue4 = 64650000; // Example total value

  // Footer Table styling
  const footerTable = (
    <div className="flex flex-wrap justify-between items-center">
      <span className="font-bold">Total (THB)</span>
      <div className="flex flex-wrap gap-2 justify-end">
        <span className="flex justify-end items-center bg-white py-1 px-2 rounded w-36 text-right">
          {totalValue1.toLocaleString()}
        </span>
        <span className="flex justify-end items-center bg-white py-1 px-2 rounded w-36 text-right">
          {totalValue2.toLocaleString()}
        </span>
        <span className="flex justify-end items-center bg-white py-1 px-2 rounded w-36 text-right">
          {totalValue3.toLocaleString()}
        </span>
        <span className="flex justify-end items-center bg-white py-1 px-2 rounded w-36 text-right">
          {totalValue4.toLocaleString()}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <div className="title-page">Create Work Plan</div>

        <BoxPrimary>
          <div className="text-[#00783F] text-2xl pb-3">Work Plan</div>
          <TableComponent
            columns={columns}
            dataSource={dataSource}
            footer={footerTable}
          />
        </BoxPrimary>

        <div className="flex justify-end space-x-4">
          <DynamicButton
            text="Back"
            className="bg-green-500 text-white rounded-lg p-2"
            type="primary"
            onClick={() => alert("Image Icon Button Clicked!")}
            variant="solid"
            style={{ color: "#ffff", backgroundColor: "#B6AEAB" }}
          />
          <DynamicButton
            text="Save and Next"
            className="bg-green-500 text-white rounded-lg p-2"
            type="primary"
            onClick={() => alert("Image Icon Button Clicked!")}
            variant="solid"
            style={{ color: "#ffff", backgroundColor: "#00783F" }}
          />
        </div>
      </MainLayout>
    </>
  );
}
