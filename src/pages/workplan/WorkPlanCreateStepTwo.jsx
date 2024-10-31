import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import TableComponent from "../../components/table/TableComponent";
import DynamicButton from "../../components/button/DynamicButton";
import { Input, InputNumber } from "antd";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../components/button/ActionButton";

export default function WorkPlanCreateStepTwo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [dataSource, setDataSource] = useState([]);
  const [dataSourceProduct, setDataSourceProduct] = useState([]);

  useEffect(() => {
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
        productName: "Ossinate 15%SL",
        packSize: "1Kg.",
        originalQty: 50000,
        value: 12500000,
        unitPrice: 250,
        qtyArea1: 50000,
        valueArea1: 12500000,
        qtyArea2: 50000,
        valueArea2: 12500000,
      },
      {
        key: "2",
        productName: "Apopo 20%SE",
        packSize: "1Lt.",
        originalQty: 120000,
        unitPrice: 350,
        value: 42000000,
        qtyArea1: 50000,
        valueArea1: 12500000,
        qtyArea2: 50000,
        valueArea2: 12500000,
      },
      {
        key: "3",
        productName: "Atrannex 90WG",
        packSize: "5Kg.",
        originalQty: 320000,
        unitPrice: 450,
        value: 144000000,
        qtyArea1: 50000,
        valueArea1: 12500000,
        qtyArea2: 50000,
        valueArea2: 12500000,
      },
      {
        key: "4",
        productName: "Baloric 320EC",
        packSize: "0.5Lt.",
        originalQty: 12000,
        unitPrice: 150,
        value: 1800000,
        qtyArea1: 50000,
        valueArea1: 12500000,
        qtyArea2: 50000,
        valueArea2: 12500000,
      },
      {
        key: "5",
        productName: "Bla-S",
        packSize: "0.25Lt.",
        originalQty: 600000,
        unitPrice: 250,
        value: 150000000,
        qtyArea1: 50000,
        valueArea1: 12500000,
        qtyArea2: 50000,
        valueArea2: 12500000,
      },
      {
        key: "6",
        productName: "Bumper P",
        packSize: "0.5Lt.",
        originalQty: 4300,
        unitPrice: 250,
        value: 1075000,
        qtyArea1: 50000,
        valueArea1: 12500000,
        qtyArea2: 50000,
        valueArea2: 12500000,
      },
      {
        key: "7",
        productName: "Custodia",
        packSize: "1Lt.",
        originalQty: 43500,
        unitPrice: 250,
        value: 10875000,
        qtyArea1: 50000,
        valueArea1: 12500000,
        qtyArea2: 50000,
        valueArea2: 12500000,
      },
      {
        key: "8",
        productName: "Damatin 5%WG",
        packSize: "20Lt.",
        originalQty: 30000,
        unitPrice: 250,
        value: 7500000,
        qtyArea1: 50000,
        valueArea1: 12500000,
        qtyArea2: 50000,
        valueArea2: 12500000,
      },
      {
        key: "9",
        productName: "Durivo 63SC",
        packSize: "1Lt.",
        originalQty: 45000,
        unitPrice: 250,
        value: 11250000,
        qtyArea1: 50000,
        valueArea1: 12500000,
        qtyArea2: 50000,
        valueArea2: 12500000,
      },
      {
        key: "10",
        productName: "Hamper 300SC",
        packSize: "1Lt.",
        originalQty: 43000,
        unitPrice: 250,
        value: 10750000,
        qtyArea1: 50000,
        valueArea1: 12500000,
        qtyArea2: 50000,
        valueArea2: 12500000,
      },
    ];

    setDataSource(initialData);
    setDataSourceProduct(initialDataProduct);
  }, []);

  const header = [
    {
      title: "Area Sale Manager Name",
      dataIndex: "name",
      key: "1",
    },
    {
      title: "Veerasak Likitmanchai (Area1)",
      dataIndex: "area1",
      key: "2",
      width: 400,
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
      key: "3",
      width: 400,
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
      dataIndex: "productName",
      key: "1",
    },
    {
      title: "Pack Size",
      dataIndex: "packSize",
      key: "2",
    },
    {
      title: "Original Plan",
      dataIndex: "originalQty",
      key: "3",
      width: 200,
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
      dataIndex: "value",
      key: "4",
      width: 200,
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
      dataIndex: "qtyArea1",
      key: "5",
      width: 200,
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
      dataIndex: "valueArea1",
      key: "6",
      width: 200,
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
      dataIndex: "qtyArea2",
      key: "7",
      width: 200,
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
      dataIndex: "valueArea2",
      key: "8",
      width: 200,
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
          <ActionButton
            text="Back"
            mode="back"
            onClick={() => {
              navigate("/sale-plan/work-plan/create");
            }}
          />
          <ActionButton
            text="Save Draft"
            mode="saveDraft"
            onClick={() => navigate("/sale-plan/work-plan")}
          />

          <ActionButton
            text="Save and Next"
            mode="save"
            onClick={() => navigate("/sale-plan/work-plan")}
          />
        </div>
      </MainLayout>
    </>
  );
}
