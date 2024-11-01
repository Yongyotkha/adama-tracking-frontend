import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Input, InputNumber, Table } from "antd";
import { useNavigate } from "react-router-dom";
import TableCustomComponent from "../../../components/table/TableCustomComponent";
import ActionButton from "../../../components/button/ActionButton";

export default function WorkPlanAreaCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

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
    setDataSource(data);
  }, []);

  const applyTopLevelAndSpecificChildrenStyles = (columns) =>
    columns.map((col, index) => {
      const backgroundColor = index % 2 === 0 ? "#00783F" : "#009845"; // Alternating color for top-level columns
      const textColor = "white";

      const styleChildren = (children, parentBgColor) =>
        children.map((child) => {
          const isFirstLevelChild = child.key === "firstChilden";
          const isLastLevelChild = child.dataIndex;

          if (!isFirstLevelChild && child.children && !isLastLevelChild) {
            return {
              ...child,
              children: styleChildren(child.children, parentBgColor),
            };
          }

          return {
            ...child,
            onHeaderCell: () => ({
              style: {
                backgroundColor: isFirstLevelChild
                  ? "#CBC5C3"
                  : isLastLevelChild
                  ? parentBgColor
                  : null,
                color: isLastLevelChild ? textColor : "black",
                fontWeight: "bold",
                textAlign: "left",
              },
            }),
            ...(child.children
              ? { children: styleChildren(child.children, parentBgColor) }
              : {}),
          };
        });

      return {
        ...col,
        onHeaderCell: () => ({
          style: {
            backgroundColor,
            color: textColor,
            fontWeight: "bold",
            textAlign: "left",
          },
        }),
        ...(col.children
          ? { children: styleChildren(col.children, backgroundColor) }
          : {}),
      };
    });

  const baseColumns = [
    {
      title: "Sale Territory Name",
      children: [
        {
          title: "Territory",
          key: "firstChilden",
          children: [
            {
              title: "Sale Plan (THB)",
              key: "secondChilden",
              onHeaderCell: () => ({
                style: {
                  backgroundColor: "white",
                  fontWeight: "bold",
                  textAlign: "left",
                },
              }),
              children: [
                {
                  title: "Product Name",
                  dataIndex: "productName",
                  key: "productName",
                  fixed: "left",
                  width: 200,
                },
                {
                  title: "Pack Size",
                  dataIndex: "packSize",
                  key: "packSize",
                  width: 200,
                  fixed: "left",
                },
                {
                  title: "Original Plan",
                  dataIndex: "originalPlan",
                  key: "originalPlan",
                  width: 200,
                  fixed: "left",
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
                  dataIndex: "valueTHB",
                  key: "valueTHB",
                  width: 200,
                  fixed: "left",
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
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Manupong Wongpuang",
      children: [
        {
          title: "Lower North",
          key: "firstChilden",
          children: [
            {
              title: (
                <InputNumber
                  className="w-full"
                  disabled
                  min={0}
                  // value={text}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              ),
              key: "secondChilden",

              children: [
                {
                  title: "Qty (KG)",
                  dataIndex: "originalPlanManupong",
                  key: "originalPlanManupong",
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
                    />
                  ),
                },
                {
                  title: "Value (THB)",
                  dataIndex: "valueTHBManupong",
                  key: "valueTHBManupong",
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
                    />
                  ),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Phaisan Jethuen",
      children: [
        {
          title: "Left Lower North",
          key: "firstChilden",
          children: [
            {
              title: (
                <InputNumber
                  className="w-full"
                  disabled
                  min={0}
                  // value={text}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              ),
              key: "secondChilden",

              children: [
                {
                  title: "Qty (KG)",
                  dataIndex: "originalPlanManupong",
                  key: "originalPlanManupong",
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
                    />
                  ),
                },
                {
                  title: "Value (THB)",
                  dataIndex: "valueTHBManupong",
                  key: "valueTHBManupong",
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
                    />
                  ),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Kornkan Induang",
      children: [
        {
          title: "Left North",
          key: "firstChilden",
          children: [
            {
              title: (
                <InputNumber
                  className="w-full"
                  disabled
                  min={0}
                  // value={text}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              ),
              key: "secondChilden",

              children: [
                {
                  title: "Qty (KG)",
                  dataIndex: "originalPlanManupong",
                  key: "originalPlanManupong",
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
                    />
                  ),
                },
                {
                  title: "Value (THB)",
                  dataIndex: "valueTHBManupong",
                  key: "valueTHBManupong",
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
                    />
                  ),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Kriangkrai Kraikeaw",
      children: [
        {
          title: "Central Left North",
          key: "firstChilden",
          children: [
            {
              title: (
                <InputNumber
                  className="w-full"
                  disabled
                  min={0}
                  // value={text}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              ),
              key: "secondChilden",

              children: [
                {
                  title: "Qty (KG)",
                  dataIndex: "originalPlanManupong",
                  key: "originalPlanManupong",
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
                    />
                  ),
                },
                {
                  title: "Value (THB)",
                  dataIndex: "valueTHBManupong",
                  key: "valueTHBManupong",
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
                    />
                  ),
                },
              ],
            },
          ],
        },
      ],
    },
    
  ];

  const columns = applyTopLevelAndSpecificChildrenStyles(baseColumns);

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <div className="title-page">Create Work Plan</div>

        <BoxPrimary>
          <div className="flex flex-col gap-2">
            <div>Yearly Target</div>
            <div className="w-[25%]">
              <Input suffix="THB" disabled value={"205,250,000"} />
            </div>
          </div>
        </BoxPrimary>

        <BoxPrimary>
          <div className="text-[#00783F] text-2xl pb-3">
            Sale Territory Name
          </div>

          <TableCustomComponent
            header={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={true}
            footer={() => (
              // วนลูปตาม array ที่ส่งชื่อ sale มา
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-[#978B87]">
                  <Table.Summary.Cell index={0} colSpan={4}>
                    Total (THB)
                  </Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={2}>
                    <InputNumber
                      className="w-full"
                      disabled
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      style={{ backgroundColor: "white" }}
                    />
                  </Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={2}>
                    <InputNumber
                      className="w-full"
                      disabled
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      style={{ backgroundColor: "white" }}
                    />
                  </Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={2}>
                    <InputNumber
                      className="w-full"
                      disabled
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      style={{ backgroundColor: "white" }}
                    />
                  </Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={2}>
                    <InputNumber
                      className="w-full"
                      disabled
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
              navigate("/sale-plan/work-plan/create");
            }}
          />
          <ActionButton
            text="Save Draft"
            mode="saveDraft"
            onClick={() => navigate("/sale-plan/work-plan")}
          />

          <ActionButton
            text="Save"
            mode="save"
            onClick={() => navigate("/sale-plan/work-plan")}
          />
        </div>
      </MainLayout>
    </>
  );
}
