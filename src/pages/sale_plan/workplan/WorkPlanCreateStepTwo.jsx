import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import DynamicButton from "../../../components/button/DynamicButton";
import { Input, InputNumber, Table } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import TableCustomComponent from "../../../components/table/TableCustomComponent";

export default function WorkPlanCreateStepTwo() {
  const location = useLocation();

  useEffect(() => {
    console.log(location.state.data);
  }, []);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState(location.state.data.dataSource);
  const [overall, setOverall] = useState(location.state.data?.totalValue);

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
    // default column
    {
      title: "Sale Territory Name",
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
              key: "0",
              fixed: "left",
              width: 200,
            },
            {
              title: "Pack Size",
              dataIndex: "packSize",
              key: "1",
              width: 200,
              fixed: "left",
            },
            {
              title: "Original Plan",
              dataIndex: "qty",
              key: "2",
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
              dataIndex: "value",
              key: "3",
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

    // api
    {
      title: "Veerasak Likitmanchai (Area1)",
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
          children: [
            {
              title: "Qty (KG)",
              dataIndex: "qty_area1",
              key: "0",
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
              dataIndex: "value_area1",
              key: "1",
              width: 200,
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
    {
      title: "Cheerayut Inthong (Area2)",
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
          children: [
            {
              title: "Qty (KG)",
              dataIndex: "qty_area2",
              key: "0",
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
              dataIndex: "value_area2",
              key: "1",
              width: 200,
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
  ];

  const columns = applyTopLevelAndSpecificChildrenStyles(baseColumns);

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <div className="title-page">Create Work Plan</div>

        <BoxPrimary>
          <div className="flex flex-col gap-2">
            <div>Overall Target</div>
            <div className="w-[25%]">
              <InputNumber
                className="w-full"
                min={0}
                value={overall}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
                suffix="THB"
              />
            </div>
          </div>
        </BoxPrimary>

        <BoxPrimary>
          <div className="text-[#00783F] text-2xl pb-3">Work Plan</div>
          <TableCustomComponent
            header={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={true}
            footer={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-[#978B87]">
                  <Table.Summary.Cell index={0} colSpan={2}>
                    Total (THB)
                  </Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={2}>
                    <InputNumber
                      className="w-full"
                      disabled
                      value={overall}
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
                      // value={index}
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
                      // value={index}
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
            text="Save and Next"
            mode="save"
            onClick={() => navigate("/sale-plan/work-plan")}
          />
        </div>
      </MainLayout>
    </>
  );
}
