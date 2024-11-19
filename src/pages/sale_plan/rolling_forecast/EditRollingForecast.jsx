import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import DynamicButton from "../../../components/button/DynamicButton";
import { Input, InputNumber, Table } from "antd";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";

export default function EditRollingForecast() {
  const initialData = [
    {
      key: "1",
      productName: "Ossinate 15%SL",
      packSize: "1Kg.",
      qty: 50000,
      unitPrice: 250,
      value: 12500000,
    },
    {
      key: "2",
      productName: "Apopo 20%SE",
      packSize: "1Lt.",
      qty: 120000,
      unitPrice: 350,
      value: 42000000,
    },
    {
      key: "3",
      productName: "Atrannex 90WG",
      packSize: "5Kg.",
      qty: 320000,
      unitPrice: 450,
      value: 144000000,
    },
    {
      key: "4",
      productName: "Baloric 320EC",
      packSize: "0.5Lt.",
      qty: 12000,
      unitPrice: 150,
      value: 1800000,
    },
    {
      key: "5",
      productName: "Bla-S",
      packSize: "0.25Lt.",
      qty: 600000,
      unitPrice: 250,
      value: 150000000,
    },
    {
      key: "6",
      productName: "Bumper P",
      packSize: "0.5Lt.",
      qty: 4300,
      unitPrice: 250,
      value: 1075000,
    },
    {
      key: "7",
      productName: "Custodia",
      packSize: "1Lt.",
      qty: 43500,
      unitPrice: 250,
      value: 10875000,
    },
    {
      key: "8",
      productName: "Damatin 5%WG",
      packSize: "20Lt.",
      qty: 30000,
      unitPrice: 250,
      value: 7500000,
    },
    {
      key: "9",
      productName: "Durivo 63SC",
      packSize: "1Lt.",
      qty: 45000,
      unitPrice: 250,
      value: 11250000,
    },
    {
      key: "10",
      productName: "Hamper 300SC",
      packSize: "1Lt.",
      qty: 43000,
      unitPrice: 250,
      value: 10750000,
    },
  ];

  const header = [
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
      title: "Qty (KG)",
      dataIndex: "qty",
      key: "qty",

      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={text}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(value) => handleQtyChange(value, record.key)}
        />
      ),
    },
    {
      title: "Value (THB)",
      dataIndex: "value",
      key: "value",
      render: (text) => (
        <InputNumber
          className="w-full"
          value={text}
          formatter={(value) =>
            `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          disabled
        />
      ),
    },
  ];

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState(initialData);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const total = dataSource.reduce((acc, item) => acc + item.value, 0);
    setTotalValue(total);
  }, []);

  const handleQtyChange = (value, key) => {
    let total = 0;
    const newData = dataSource.map((item) => {
      if (item.key === key) {
        return { ...item, qty: value, value: value * item.unitPrice };
      }
      total += item.value;
      return item;
    });
    setTotalValue(total);
    setDataSource(newData);
  };

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <div className="title-page">Edit Rolling Forecast</div>
        <BoxPrimary>
          <div className="text-[#00783F] text-xl pb-5">Monthly Sale Forecast</div>
          <TableComponent
            header={header}
            dataSource={dataSource}
            pagination={false}
            footer={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-[#978B87]">
                  <Table.Summary.Cell index={0} colSpan={3}>
                    Total (THB)
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <InputNumber
                      className="w-full"
                      disabled
                      value={totalValue}
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      style={{ backgroundColor: "white" }}
                    />
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </BoxPrimary>

        <div className="flex justify-end space-x-4">
          <ActionButton
            text="Back"
            mode="back"
            onClick={() => {
              navigate("/sale-plan/rolling-forecast");
            }}
          />
          <ActionButton
            text="Save and Next"
            mode="save"
            className="bg-[#00783F] min-w-[96px] text-[#ffff] rounded-sm p-2"
            onClick={() => {
              navigate("/sale-plan/rolling-forecast", {
                state: {
                  data: {
                    totalValue,
                    dataSource,
                  },
                },
              });
            }}
          />
        </div>
      </MainLayout>
    </>
  );
}
