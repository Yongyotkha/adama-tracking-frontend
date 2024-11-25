import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import DynamicButton from "../../../components/button/DynamicButton";
import { Input, InputNumber, Table } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import TableCustomComponent from "../../../components/table/TableCustomComponent";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

export default function WorkPlanCreateStepTwo() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState(
    location?.state?.data?.dataSource
  );
  const [area, setArea] = useState([]);
  const [permission, setPermission] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const { showMsg, showNotification } = useContext(AuthContext);

  useEffect(() => {
    useServiceAPI
      .get(
        paths.pathWorkPlanStep2,
        { year_code: location?.state?.year_code },
        setLoading
      )
      .then((response) => {
        if (response.status == 200) {
          console.log(response.data);
          const newData = response.data.original_data_items.map((item) => ({
            key: item.product_id,
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            pack_size: item.pack_size,
            unit_convert_value: item.unit_convert_value,
            qty: item.qty,
            value: item.value,
          }));
          const newDataArea = response.data.data_areas.map((item) => ({
            key: item.product_id,
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            pack_size: item.pack_size,
            unit_convert_value: item.unit_convert_value,
            qty: item.qty,
            value: item.value,
          }));

          setDataSource(newData);
          setArea(newDataArea);
          setTotalValue(response.data.original_data_overall_target);
          setPermission(response.data.permission);
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.status == 422) {
          showNotification("error", error.message);
        } else {
          showNotification("error", "เกิดข้อผิดพลาด");
        }
      });
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
    // Default column
    {
      title: "Area Sale Manager Name",
      children: [
        {
          title: "Position",
          key: "defaultPosition",
          children: [
            {
              title: "Sale Plan (THB)",
              key: "defaultSalePlan",
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
                  dataIndex: "product_name",
                  key: "productName",
                  fixed: "left",
                  width: 200,
                },
                {
                  title: "Pack Size",
                  dataIndex: "pack_size",
                  key: "packSize",
                  width: 200,
                  fixed: "left",
                },
                {
                  title: "Original Plan",
                  dataIndex: "qty",
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
                  dataIndex: "value",
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
    // Dynamically mapped columns from `area`
    ...area.map((item, index) => ({
      title: item.sale_area_name, 
      children: [
        {
          title: item.area_name, 
          key: `region-${index}`,
          children: [
            {
              title: (
                <InputNumber
                  className="w-full"
                  disabled
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              ),
              key: `inputNumber-${index}`,
              children: [
                {
                  title: "Qty (KG)",
                  dataIndex: `originalPlan-${item.managerId}`, // Assuming `managerId` exists
                  key: `originalPlan-${item.managerId}`,
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
                  dataIndex: `valueTHB-${item.managerId}`,
                  key: `valueTHB-${item.managerId}`,
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
    })),
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
                value={totalValue}
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
          <div className="text-[#00783F] text-xl pb-5">Work Plan</div>
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
                      value={totalValue}
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
              navigate("/sale-plan/work-plan/create", {
                state: {
                  year_code: location.state.year_code,
                },
              });
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
