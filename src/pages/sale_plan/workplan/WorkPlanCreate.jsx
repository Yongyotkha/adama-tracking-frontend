import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import DynamicButton from "../../../components/button/DynamicButton";
import { Input, InputNumber, Table } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function WorkPlanCreate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const total = dataSource.reduce((acc, item) => acc + parseFloat(item.value), 0);
    setTotalValue(total);
  }, []);

  const handleQtyChange = (value, key) => {
    let total = 0; // Initialize as a number
    const newData = dataSource.map((item) => {
      if (item.key === key) {
        const newValue = value * item.unitPrice;
        total += newValue; // Add the updated value to total
        return { ...item, qty: value, value: parseFloat(newValue.toFixed(2)) };
      }
      total += parseFloat(item.value);
      return item;
    });
    setTotalValue(total);
    setDataSource(newData);
  };

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

  useEffect(() => {
    useServiceAPI
      .get(
        paths.pathGetWorkPlanStep1,
        { year_code: location.state.year_code },
        setLoading
      )
      .then((response) => {
        if (response.status == 200) {
          console.log(response.data.data_items);
          const newData = response.data.data_items.map((item) => ({
            key: item.product_id,
            productName: item.product_name,
            packSize: item.pack_size,
            qty: item.qty,
            unitPrice: item.unit_convert_value,
            value: item.value,
          }));
          setDataSource(newData);
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.status == 422) {
          showMsg("error", error.message);
        } else {
          showMsg("error", "เกิดข้อผิดพลาด");
        }
      });
  }, []);

  const handleSave = () => {
    console.log(dataSource);
  };

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <div className="title-page">Create Work Plan</div>
        <BoxPrimary>
          <div className="text-[#00783F] text-xl pb-5">Work Plan</div>
          <TableComponent
            header={header}
            dataSource={dataSource}
            pagination={false}
            footer={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-[#978B87]">
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <span className="text-white">Total (THB)</span>
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
              navigate("/sale-plan/work-plan");
            }}
          />
          <ActionButton
            text="Save and Next"
            mode="save"
            className="bg-[#00783F] min-w-[96px] text-[#ffff] rounded-sm p-2"
            onClick={handleSave}
          />
        </div>
      </MainLayout>
    </>
  );
}
