import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Input, InputNumber, Table } from "antd";
import { useNavigate } from "react-router-dom";
import TableCustomComponent from "../../../components/table/TableCustomComponent";
import ActionButton from "../../../components/button/ActionButton";

export default function WorkPlanSaleCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const months = Array.from({ length: 12 });

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
                textAlign: "center",
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
            textAlign: "center",
          },
        }),
        ...(col.children
          ? { children: styleChildren(col.children, backgroundColor) }
          : {}),
      };
    });

  const baseColumns = [
    {
      title: "Month",
      children: [
        {
          title: "Product Name",
          dataIndex: "productName",
          key: "productName",
          fixed: "left",

          width: 150,
        },
        {
          title: "Pack Size",
          dataIndex: "packSize",
          key: "packSize",
          width: 150,
          fixed: "left",
        },
        {
          title: "Original Plan",
          dataIndex: "originalPlan",
          key: "originalPlan",
          width: 150,
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
          width: 150,
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
    {
      title: "Jan",
      children: [
        {
          title: "Qty (KG)",
          dataIndex: "valueTHB_Jan",
          key: "valueTHB_Jan",
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
        },
      ],
    },
    {
      title: "Feb",
      children: [
        {
          title: "Qty (KG)",
          dataIndex: "valueTHB_Feb",
          key: "valueTHB_Feb",
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
        },
      ],
    },
    {
      title: "Mar",
      children: [
        {
          title: "Qty (KG)",
          dataIndex: "valueTHB_Mar",
          key: "valueTHB_Mar",
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
        },
      ],
    },
    {
      title: "Apr",
      children: [
        {
          title: "Qty (KG)",
          dataIndex: "valueTHB_Apr",
          key: "valueTHB_Apr",
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
        },
      ],
    },
    {
      title: "May",
      children: [
        {
          title: "Qty (KG)",
          dataIndex: "valueTHB_May",
          key: "valueTHB_May",
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
        },
      ],
    },
    {
      title: "Jun",
      children: [
        {
          title: "Qty (KG)",
          dataIndex: "valueTHB_Jun",
          key: "valueTHB_Jun",
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
        },
      ],
    },
    {
      title: "Jul",
      children: [
        {
          title: "Qty (KG)",
          dataIndex: "valueTHB_Jul",
          key: "valueTHB_Jul",
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
        },
      ],
    },
    {
      title: "Aug",
      children: [
        {
          title: "Qty (KG)",
          dataIndex: "valueTHB_Aug",
          key: "valueTHB_Aug",
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
        },
      ],
    },
    {
      title: "Sep",
      children: [
        {
          title: "Qty (KG)",
          dataIndex: "valueTHB_Sep",
          key: "valueTHB_Sep",
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
        },
      ],
    },
    {
      title: "Oct",
      children: [
        {
          title: "Qty (KG)",
          dataIndex: "valueTHB_Oct",
          key: "valueTHB_Oct",
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
        },
      ],
    },
    {
      title: "Nov",
      children: [
        {
          title: "Qty (KG)",
          dataIndex: "valueTHB_Nov",
          key: "valueTHB_Nov",
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
        },
      ],
    },
    {
      title: "Dec",
      children: [
        {
          title: "Qty (KG)",
          dataIndex: "valueTHB_Dec",
          key: "valueTHB_Dec",
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
        },
      ],
    },
    {
      title: "Jan",
      children: [
        {
          title: "Value (THB)",
          dataIndex: "valueTHB_Jan",
          key: "valueTHB_Jan",
          width: 150,
          render: (text, record) => (
            <InputNumber
              className="w-full"
              min={0}
              value={text}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(value) => handleQtyChange(value, record.key)}
            />
          ),
        },
      ],
    },
    {
      title: "Feb",
      children: [
        {
          title: "Value (THB)",
          dataIndex: "valueTHB_Feb",
          key: "valueTHB_Feb",
          width: 150,
          render: (text, record) => (
            <InputNumber
              className="w-full"
              min={0}
              value={text}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(value) => handleQtyChange(value, record.key)}
            />
          ),
        },
      ],
    },
    {
      title: "Mar",
      children: [
        {
          title: "Value (THB)",
          dataIndex: "valueTHB_Mar",
          key: "valueTHB_Mar",
          width: 150,
          render: (text, record) => (
            <InputNumber
              className="w-full"
              min={0}
              value={text}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(value) => handleQtyChange(value, record.key)}
            />
          ),
        },
      ],
    },
    {
      title: "Apr",
      children: [
        {
          title: "Value (THB)",
          dataIndex: "valueTHB_Apr",
          key: "valueTHB_Apr",
          width: 150,
          render: (text, record) => (
            <InputNumber
              className="w-full"
              min={0}
              value={text}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(value) => handleQtyChange(value, record.key)}
            />
          ),
        },
      ],
    },
    {
      title: "May",
      children: [
        {
          title: "Value (THB)",
          dataIndex: "valueTHB_May",
          key: "valueTHB_May",
          width: 150,
          render: (text, record) => (
            <InputNumber
              className="w-full"
              min={0}
              value={text}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(value) => handleQtyChange(value, record.key)}
            />
          ),
        },
      ],
    },
    {
      title: "Jun",
      children: [
        {
          title: "Value (THB)",
          dataIndex: "valueTHB_Jun",
          key: "valueTHB_Jun",
          width: 150,
          render: (text, record) => (
            <InputNumber
              className="w-full"
              min={0}
              value={text}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(value) => handleQtyChange(value, record.key)}
            />
          ),
        },
      ],
    },
    {
      title: "Jul",
      children: [
        {
          title: "Value (THB)",
          dataIndex: "valueTHB_Jul",
          key: "valueTHB_Jul",
          width: 150,
          render: (text, record) => (
            <InputNumber
              className="w-full"
              min={0}
              value={text}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(value) => handleQtyChange(value, record.key)}
            />
          ),
        },
      ],
    },
    {
      title: "Aug",
      children: [
        {
          title: "Value (THB)",
          dataIndex: "valueTHB_Aug",
          key: "valueTHB_Aug",
          width: 150,
          render: (text, record) => (
            <InputNumber
              className="w-full"
              min={0}
              value={text}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(value) => handleQtyChange(value, record.key)}
            />
          ),
        },
      ],
    },
    {
      title: "Sep",
      children: [
        {
          title: "Value (THB)",
          dataIndex: "valueTHB_Sep",
          key: "valueTHB_Sep",
          width: 150,
          render: (text, record) => (
            <InputNumber
              className="w-full"
              min={0}
              value={text}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(value) => handleQtyChange(value, record.key)}
            />
          ),
        },
      ],
    },
    {
      title: "Oct",
      children: [
        {
          title: "Value (THB)",
          dataIndex: "valueTHB_Oct",
          key: "valueTHB_Oct",
          width: 150,
          render: (text, record) => (
            <InputNumber
              className="w-full"
              min={0}
              value={text}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(value) => handleQtyChange(value, record.key)}
            />
          ),
        },
      ],
    },
    {
      title: "Nov",
      children: [
        {
          title: "Value (THB)",
          dataIndex: "valueTHB_Nov",
          key: "valueTHB_Nov",
          width: 150,
          render: (text, record) => (
            <InputNumber
              className="w-full"
              min={0}
              value={text}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(value) => handleQtyChange(value, record.key)}
            />
          ),
        },
      ],
    },
    {
      title: "Dec",
      children: [
        {
          title: "Value (THB)",
          dataIndex: "valueTHB_Dec",
          key: "valueTHB_Dec",
          width: 150,
          render: (text, record) => (
            <InputNumber
              className="w-full"
              min={0}
              value={text}
              disabled
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              onChange={(value) => handleQtyChange(value, record.key)}
            />
          ),
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
            <div>Work Plan</div>
            <div className="w-[25%]">
              <Input suffix="THB" disabled value={"205,250,000"} />
            </div>
          </div>
        </BoxPrimary>

        <BoxPrimary>
          <div className="text-[#00783F] text-2xl pb-3">Monthly Sale Plan</div>

          <TableCustomComponent
            header={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={true}
            footer={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-[#978B87]">
                  <Table.Summary.Cell index={0} colSpan={4}>
                    Total (THB)
                  </Table.Summary.Cell>

                  {months.map((_, index) => (
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
                  {months.map((_, index) => (
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
              navigate("/sale-plan/work-plan/sale-");
            }}
          />
          <ActionButton
            text="Save and Next"
            mode="save"
            onClick={() => navigate("/sale-plan/work-plan/sale-by-crop")}
          />
        </div>
      </MainLayout>
    </>
  );
}
