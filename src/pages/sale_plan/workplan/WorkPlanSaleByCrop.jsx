import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Input, InputNumber, Table } from "antd";
import { useNavigate } from "react-router-dom";
import TableCustomComponent from "../../../components/table/TableCustomComponent";
import ActionButton from "../../../components/button/ActionButton";

export default function WorkPlanSaleByCrop() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [headerSource, setHeaderSource] = useState([]);
  const [headerList, setHeaderList] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const data = [
      {
        key: "1",
        productName: "Ossinate 15%SL",
        packSize: "1Kg.",
        originalPlan: "30000",
        valueTHB: "7500000",
        originalPlanManupong: "150",
        valueTHBManupong: "2500",
      },
      {
        key: "2",
        productName: "Apopo 20%SE",
        packSize: "1Lt.",
        originalPlan: "80000",
        valueTHB: "280000000",
        originalPlanManupong: "150",
        valueTHBManupong: "2500",
      },
    ];

    const apiDataHeader = [
      "Rice",
      "Fruits",
      "Sugarcane",
      "Vegetable",
      "Pineapple",
      "Corn",
      "Other",
    ];

    const columns = [
      {
        title: "Product Name",
        dataIndex: "productName",
        key: "0",
        fixed: "left",
        width: 150,
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#00783F",
            color: "white",
            fontWeight: "bold",
            textAlign: "left",
          },
        }),
      },
      {
        title: "Pack Size",
        dataIndex: "packSize",
        key: "1",
        width: 150,
        fixed: "left",
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#00783F",
            color: "white",
            fontWeight: "bold",
            textAlign: "left",
          },
        }),
      },
      {
        title: "Qty (KG)",
        dataIndex: "qty",
        key: "2",
        width: 150,
        fixed: "left",
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#00783F",
            color: "white",
            fontWeight: "bold",
            textAlign: "left",
          },
        }),
        render: (text, record) => (
          <InputNumber
            className="w-full"
            disabled
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
        key: "3",
        width: 150,
        fixed: "left",
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#00783F",
            color: "white",
            fontWeight: "bold",
            textAlign: "left",
          },
        }),
        render: (text, record) => (
          <InputNumber
            disabled
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

      ...apiDataHeader.map((header, index) => ({
        title: (
          <div className="flex flex-col gap-0 items-center">
            <span>{header}</span>
            <span>(%)</span>
          </div>
        ),
        dataIndex: `${header.toLowerCase()}Percentage`,
        key: `percentage_${index + 4}`,
        width: 150,
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#009845",
            color: "white",
            fontWeight: "bold",
            textAlign: "left",
          },
        }),
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
      })),
      ...apiDataHeader.map((header, index) => ({
        title: (
          <div className="flex flex-col gap-0 items-center">
            <span>{header}</span>
            <span>(KG)</span>
          </div>
        ),
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#00783F",
            color: "white",
            fontWeight: "bold",
            textAlign: "left",
          },
        }),
        dataIndex: `${header.toLowerCase()}qty`,
        key: `qty_${index + 4}`,
        width: 150,
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
      })),
      ...apiDataHeader.map((header, index) => ({
        title: (
          <div className="flex flex-col gap-0 items-center">
            <span>{header}</span>
            <span>(THB)</span>
          </div>
        ),
        onHeaderCell: () => ({
          style: {
            backgroundColor: "#00783F",
            color: "white",
            fontWeight: "bold",
            textAlign: "left",
          },
        }),
        dataIndex: `${header.toLowerCase()}qty`,
        key: `qty_${index + 4}`,
        width: 150,
        render: (text, record) => (
          <InputNumber
            className="w-full"
            disabled
            min={0}
            value={text}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            onChange={(value) => handleQtyChange(value, record.key)}
          />
        ),
      })),
    ];
    setHeaderSource(columns);
    setDataSource(data);
    setHeaderList(apiDataHeader);
  }, []);

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <div className="title-page">Sale By Crop</div>

        <BoxPrimary>
          <div className="flex flex-col gap-2">
            <div>Work Plan</div>
            <div className="w-[25%]">
              <Input suffix="THB" disabled value={"205,250,000"} />
            </div>
          </div>
        </BoxPrimary>

        <BoxPrimary>
          <div className="text-[#00783F] text-xl pb-5">Crop List</div>

          <TableCustomComponent
            header={headerSource}
            dataSource={dataSource}
            pagination={false}
            scroll={true}
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
                      // value={index}
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      style={{ backgroundColor: "white" }}
                    />
                  </Table.Summary.Cell>

                  {headerList?.map((_, index) => (
                    <Table.Summary.Cell
                      key={index}
                      colSpan={1}
                    ></Table.Summary.Cell>
                  ))}
                  {headerList?.map((_, index) => (
                    <Table.Summary.Cell key={index} colSpan={1}>
                      <InputNumber
                        className="w-full"
                        disabled
                        value={index}
                        min={0}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        style={{ backgroundColor: "white" }}
                      />
                    </Table.Summary.Cell>
                  ))}
                  {headerList?.map((_, index) => (
                    <Table.Summary.Cell key={index} colSpan={1}>
                      <InputNumber
                        className="w-full"
                        disabled
                        value={index}
                        min={0}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        style={{ backgroundColor: "white" }}
                      />
                    </Table.Summary.Cell>
                  ))}
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
              navigate("/sale-plan/work-plan/sale-create");
            }}
          />
          <ActionButton
            text="Save and Next"
            mode="save"
            onClick={() => navigate("/sale-plan/work-plan/sale-by-dealer")}
          />
        </div>
      </MainLayout>
    </>
  );
}
