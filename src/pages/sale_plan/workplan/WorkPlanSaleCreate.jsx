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
  const months = Array.from({ length: 6 });

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

          // Check if the child has the specific title 'Qty (KG)'
          const isQtyChild = child.title === "Qty (KG)";

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
                  : isQtyChild
                    ? parentBgColor // Use the parent's background color for 'Qty (KG)'
                    : isLastLevelChild
                      ? parentBgColor
                      : null,
                color: isLastLevelChild || isQtyChild ? textColor : "black",
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
      title: "Quarter", // Row 1
      children: [
        {
          title: "Sale Plan (THB)", // Row 2
          children: [
            {
              title: "Month", // Row 3
              onHeaderCell: () => ({
                style: {
                  backgroundColor: "#00783F", // สีเขียวเข้ม
                  color: "white", // สีตัวอักษร
                  fontWeight: "bold",
                  textAlign: "center",
                },
              }),
              children: [
                {
                  title: "Product Name", // Row 4
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
                  title: "Original Plan (KG)",
                  dataIndex: "originalPlan",
                  key: "originalPlan",
                  width: 150,
                  fixed: "left",
                  render: (text) => (
                    <InputNumber
                      className="w-full"
                      disabled
                      value={text}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  ),
                },
                {
                  title: "Value (THB)",
                  dataIndex: "valueTHB",
                  key: "valueTHB",
                  width: 150,
                  fixed: "left",
                  render: (text) => (
                    <InputNumber
                      className="w-full"
                      disabled
                      value={text}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  ),
                },
              ],
            },
          ],
        },
      ],
    },
    ...[1, 2, 3, 4].map((quarter, index) => {
      const months = [
        ["Jan.", "Feb.", "Mar."],
        ["Apr.", "May.", "Jun."],
        ["Jul.", "Aug.", "Sep."],
        ["Oct.", "Nov.", "Dec."],
      ][index];

      return {
        title: `Quarter ${quarter}`,
        children: [
          {
            title: (
              <Input
                className="w-full text-end"
                disabled
                value={new Intl.NumberFormat("en-US").format(13862500)} // Format the number before passing to value
              />
            ),
            colSpan: 3,
            children: months.map((month, monthIndex) => ({
              title: month,
              dataIndex: `valueTHB_${month}_${quarter}`,
              key: `valueTHB_${month}_${quarter}`,
              width: 100,
              children: [
                {
                  title: "Qty (KG)",
                  dataIndex: `qtyKG_${month}_${quarter}`,
                  key: `qtyKG_${month}_${quarter}`,
                },
              ],
            })),
          },
        ],
      };
    }),
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
          <div className="text-[#00783F] text-xl pb-5">Monthly Work Plan</div>

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
