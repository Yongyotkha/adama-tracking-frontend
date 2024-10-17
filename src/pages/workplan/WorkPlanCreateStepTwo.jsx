import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";
import DynamicButton from "../../components/button/Button";
import { Input, InputNumber } from "antd";
import { useNavigate } from "react-router-dom";

export default function WorkPlanCreateStepTwo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [dataSource, setDataSource] = useState([]);
  const [dataSourceProduct, setDataSourceProduct] = useState([]);

  useEffect(() => {
    setDataSource(initialData);
  }, []);
  useEffect(() => {
    setDataSourceProduct(initialDataProduct);
  }, []);


  const initialData = [
    {
      key: "1",
      name: "Sale Plane(THB)",
      area1: 205250000,
      area2: 186500000,
    },
  ];

  const initialDataProduct = [
    {
      key: "1",
      name: "Sale Plane(THB)",
      area1: 205250000,
      area2: 186500000,
    },
    {
      key: "2",
      name: "Sale Plane(THB)",
      area1: 205250000,
      area2: 186500000,
    },
  ];



  const header = [
    {
      title: "Area Sale Manager Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Veerasak Likitmanchai (Area1)",
      dataIndex: "area1",
      key: "area1",
      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={text}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(value) => handleQtyChange(value, record.key)}
          disabled={true}
        />
      ),
    },
    {
      title: "Cheerayut Inthong (Area2)",
      dataIndex: "area2",
      key: "area2",
      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={text}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(value) => handleQtyChange(value, record.key)}
          disabled={true}
        />
      ),
    },
  ];
  const headerProduct = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Pack Size",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Original Plan",
      dataIndex: "area1",
      key: "area1",
      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={text}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(value) => handleQtyChange(value, record.key)}
          disabled={true}
        />
      ),
    },
    {
      title: "Value (ฺTHB)",
      dataIndex: "area2",
      key: "area2",
      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={text}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(value) => handleQtyChange(value, record.key)}
          disabled={true}
        />
      ),
    },
    {
      title: "Qty (KG)",
      dataIndex: "area2",
      key: "area2",
      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={text}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(value) => handleQtyChange(value, record.key)}
          disabled={true}
        />
      ),
    },
    {
      title: "Original Plan",
      dataIndex: "area1",
      key: "area1",
      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={text}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(value) => handleQtyChange(value, record.key)}
          disabled={true}
        />
      ),
    },
    {
      title: "Value (ฺTHB)",
      dataIndex: "area2",
      key: "area2",
      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={text}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(value) => handleQtyChange(value, record.key)}
          disabled={true}
        />
      ),
    },
    {
      title: "Qty (KG)",
      dataIndex: "area2",
      key: "area2",
      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={text}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(value) => handleQtyChange(value, record.key)}
          disabled={true}
        />
      ),
    },
   
  ];

  const handleQtyChange = (value, key) => {
    const newData = dataSource.map((item) => {
      if (item.key === key) {
        return { ...item, qty: value, value: value * item.unitPrice };
      }
      return item;
    });
    setDataSource(newData);
  };

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <div className="title-page">Create Work Plan</div>

        <BoxPrimary>
          <div className="text-[#00783F] text-2xl pb-3">Work Plan</div>
          <TableComponent
            header={header}
            dataSource={dataSource}
            pagination={false}
            // footer={footerTable}
          />

          <TableComponent
            header={headerProduct}
            dataSource={dataSourceProduct}
            pagination={false}
            // footer={footerTable}
          />
        </BoxPrimary>

        <div className="flex justify-end space-x-4">
          <DynamicButton
            text="Back"
            className="bg-[#B6AEAB] text-[#ffff] rounded-lg p-2"
            // onClick={() => alert("Image Icon Button Clicked!")}
          />
          <DynamicButton
            text="Back"
            className="bg-[#B6AEAB] text-[#ffff] rounded-lg p-2"
            // onClick={() => alert("Image Icon Button Clicked!")}
          />
          <DynamicButton
            text="Save and Next"
            className="bg-[#00783F] text-[#ffff] rounded-lg p-2"
            onClick={() => {
              navigate(link, { state: { data: option.editId } });
            }}
          />
        </div>
      </MainLayout>
    </>
  );
}
