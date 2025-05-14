import React, { useState, useEffect } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import TableComponent from "../../../components/table/TableComponent";
import { Dropdown, Menu, Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";

export default function MaterialExpense() {
  const { confirm } = Modal;
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [materialList, setMaterialList] = useState([
    { id: "1", name: "All" },
    { id: "2", name: "Rice" },
    { id: "3", name: "Corn" },
  ]);
  const navigate = useNavigate();

  const filters = [
    {
      key: "name",
      type: "select",
      label: "Name",
      placeholder: "All",
      options: materialList,
    },
  ];

  const handleDelete = (code) => {
    confirm({
      title: "Do you want to delete this material?",
      icon: <ExclamationCircleFilled />,
      onOk: () => {
        console.log(`Deleting material with code: ${code}`);
        setDataSource(dataSource.filter((item) => item.code !== code));
      },
    });
  };

  const header = [
    { title: "Code", dataIndex: "code", align: "left", width: 120 },
    { title: "Date", dataIndex: "date", align: "left", width: 150 },
    { title: "Total Value", dataIndex: "totalValue", align: "right", width: 150 },
    { title: "Crop", dataIndex: "crop", align: "center", width: 150 },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      width: 120,
      render: (_, record) => {
        const actionItems = [
          {
            key: "1",
            label: (
              <ItemDropDown
                mode="edit"
                link={`/expenses/material/edit?documentNumber=${encodeURIComponent(
                  record.code
                )}`}
              />
            ),
          },
          {
            key: "2",
            label: (
              <ItemDropDown
                mode="view"
                link={`/expenses/material/view?documentNumber=${encodeURIComponent(
                  record.code
                )}`}
              />
            ),
          },
          {
            key: "3",
            label: (
              <ItemDropDown
                mode="delete"
                link="#"
                onClick={() => handleDelete(record.code)}
              />
            ),
          },
        ];

        return (
          <Dropdown
            overlay={
              <Menu
                items={actionItems.map((item) => ({
                  key: item.key,
                  label: item.label,
                }))}
              />
            }
            placement="bottom"
          >
            <a onClick={(e) => e.preventDefault()}>
              <img
                src="/img/icons/action.png"
                alt="Actions icon"
                className="inline-block w-5 h-5"
              />
            </a>
          </Dropdown>
        );
      },
    },
  ];

  const mockData = [
    {
      key: 1,
      code: "SE0003",
      date: "01/01/2025",
      totalValue: "30,000",
      crop: "Rice",
    },
    {
      key: 2,
      code: "SE0002",
      date: "01/01/2025",
      totalValue: "30,000",
      crop: "Rice",
    },
    {
      key: 3,
      code: "SE0001",
      date: "01/01/2025",
      totalValue: "30,000",
      crop: "Rice",
    },
  ];

  useEffect(() => {
    setDataSource(mockData);
  }, []);

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Material Expensessss</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() => navigate("/expenses/material/create")}
        />
      </div>
      <Filter
        filters={filters}
        onSearch={(filters) => console.log("Search filters:", filters)}
        onClear={() => console.log("Clear filters")}
        onChange={() => {}}
      />
      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={{ pageSize: 10 }}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
