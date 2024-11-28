import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Input, InputNumber, Table } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import TableCustomComponent from "../../../components/table/TableCustomComponent";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import Title from "../../../components/title/Title";

export default function WorkPlanCreateStepTwo() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [areas, setAreas] = useState([]);
  const [permission, setPermission] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const { showNotification } = useContext(AuthContext);
  const [localQtyState, setLocalQtyState] = useState({});
  const [yearName, setYearName] = useState([]);

  const handleQtyChange = (area_id, product_id, newQty, unitConvertValue) => {
    setLocalQtyState((prevState) => {
      const updatedState = {
        ...prevState,
        [area_id]: {
          ...(prevState[area_id] || {}),
          [product_id]: newQty,
        },
      };

      // ตรวจสอบว่า qty รวมของ product_id นี้ไม่เกิน dataSource.qty
      const totalQty = Object.keys(updatedState)
        .map((key) => updatedState[key][product_id] || 0)
        .reduce((sum, qty) => sum + qty, 0);

      const productData = dataSource.find(
        (data) => data.product_id === product_id
      );
      if (totalQty > (productData?.qty || 0)) {
        showNotification(
          "error",
          `Total quantity for ${productData.product_name} exceeds the limit.`
        );
        return prevState; // ไม่อัปเดต state ถ้าเกิน
      }

      // อัปเดต areas value (คำนวณ qty * unitConvertValue) และ sum value
      const updatedAreas = areas.map((area) => {
        if (area.area_id === area_id) {
          const updatedDataItems = area.data_items.map((item) => {
            if (item.product_id === product_id) {
              return {
                ...item,
                qty: newQty,
                value: (newQty * unitConvertValue).toFixed(2), // คำนวณ value
              };
            }
            return item;
          });

          const totalValue = updatedDataItems
            .reduce((sum, item) => sum + parseFloat(item.value || 0), 0)
            .toFixed(2);

          return {
            ...area,
            data_items: updatedDataItems,
            amount_target: totalValue, // อัปเดต amount_target
          };
        }
        return area;
      });

      setAreas(updatedAreas); // อัปเดต areas
      return updatedState; // อัปเดต localQtyState
    });
  };

  useEffect(() => {
    useServiceAPI
      .get(
        paths.pathWorkPlanStep2,
        { year_code: location?.state?.year_code },
        setLoading
      )
      .then((response) => {
        if (response.status === 200) {
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
            key: item.area_id,
            area_id: item.area_id,
            area_name: item.area_name,
            sale_area_id: item.sale_area_id,
            sale_area_name: item.sale_area_name,
            amount_target: item.amount_target,
            data_items: item.data_items,
          }));

          // สร้างค่าเริ่มต้นสำหรับ localQtyState
          const initialQtyState = newDataArea.reduce((acc, area) => {
            acc[area.area_id] = area.data_items.reduce((itemAcc, item) => {
              itemAcc[item.product_id] = parseFloat(item.qty || 0);
              return itemAcc;
            }, {});
            return acc;
          }, {});

          setYearName(response.data.year_name);
          setLocalQtyState(initialQtyState);
          setDataSource(newData);
          setAreas(newDataArea);
          setTotalValue(response.data.original_data_overall_target);
          setPermission(response.data.permission);
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.status === 422) {
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
    {
      title: "Area Sale Manager Name",
      children: [
        {
          title: "Position",
          key: "position",
          children: [
            {
              title: "Sale Plan (THB)",
              key: "sale_plan_thb",
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
                  key: "product_name",
                  fixed: "left",
                  width: 200,
                },
                {
                  title: "Pack Size",
                  dataIndex: "pack_size",
                  key: "pack_size",
                  width: 200,
                  fixed: "left",
                },
                {
                  title: "Original Plan",
                  dataIndex: "qty",
                  key: "original_plan_qty",
                  width: 200,
                  fixed: "left",
                  render: (text, record) => (
                    <InputNumber
                      className="w-full"
                      disabled
                      min={0}
                      value={text}
                      formatter={(value) =>
                        `฿ ${Number(value).toFixed(2)}`.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )
                      }
                    />
                  ),
                },
                {
                  title: "Value (THB)",
                  dataIndex: "value",
                  key: "value_thb",
                  width: 200,
                  fixed: "left",
                  render: (text, record) => (
                    <InputNumber
                      disabled
                      className="w-full"
                      min={0}
                      value={text}
                      formatter={(value) =>
                        `฿ ${Number(value).toFixed(2)}`.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )
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

    ...areas.map((item, index) => ({
      title: item.sale_area_name,
      children: [
        {
          title: item.area_name,
          key: `area_${item.area_id}`,
          children: [
            {
              title: (
                <InputNumber
                  className="w-full"
                  disabled
                  min={0}
                  value={item.amount_target}
                  formatter={(value) =>
                    `฿ ${Number(value).toFixed(2)}`.replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )
                  }
                />
              ),
              key: `input_area_${index}`,
              children: [
                {
                  title: "Qty (KG)",
                  dataIndex: `qty_${item.area_id}`,
                  key: `qty_${item.area_id}`,
                  width: 200,
                  render: (_, record) => {
                    const dataItem = item.data_items.find(
                      (i) => i.product_id === record.product_id
                    );
                    return (
                      <InputNumber
                        className="w-full"
                        min={0}
                        value={
                          localQtyState[item.area_id]?.[record.product_id] || 0
                        }
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        onChange={(value) =>
                          handleQtyChange(
                            item.area_id,
                            record.product_id,
                            value,
                            dataItem?.unit_convert_value || 1 // ส่ง unit_convert_value
                          )
                        }
                        disabled={!permission.edit}
                      />
                    );
                  },
                },
                {
                  title: "Value (THB)",
                  dataIndex: `value_${item.area_id}`,
                  key: `value_${item.area_id}`,
                  width: 200,
                  render: (text, record) => {
                    const dataItem = item.data_items.find(
                      (i) => i.product_id === record.product_id
                    );
                    return (
                      <InputNumber
                        disabled
                        className="w-full"
                        value={
                          dataItem ? parseFloat(dataItem.value).toFixed(2) : 0
                        }
                        formatter={(value) =>
                          `฿ ${Number(value).toFixed(2)}`.replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            ","
                          )
                        }
                      />
                    );
                  },
                },
              ],
            },
          ],
        },
      ],
    })),
  ];

  const columns = applyTopLevelAndSpecificChildrenStyles(baseColumns);

  const handleSave = (mode) => {
    useServiceAPI
      .post(
        paths.pathWorkPlanStep2,
        {
          year_code: location?.state?.year_code,
          action_code: mode,
          data_areas: areas,
        },
        setLoading
      )
      .then((response) => {
        if (response.status === 200) {
          showNotification(
            "success",
            response.data.message,
            response.data.message_line
          ).then(() => {
            navigate("/sale-plan/work-plan", {
              state: {
                year_code: location?.state?.year_code,
              },
            });
          });
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.status === 422) {
          showNotification("error", error.message);
        } else {
          showNotification("error", "เกิดข้อผิดพลาด");
        }
      });
  };

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Create Plan" showYear={yearName} />

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
                  <Table.Summary.Cell index={2} colSpan={2}>
                    <InputNumber
                      className="w-full"
                      disabled
                      value={totalValue}
                      min={0}
                      formatter={(value) =>
                        `฿ ${Number(value).toFixed(2)}`.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )
                      }
                      style={{ backgroundColor: "white" }}
                    />
                  </Table.Summary.Cell>

                  {areas.map((area, index) => (
                    <Table.Summary.Cell key={index} colSpan={2}>
                      <InputNumber
                        className="w-full"
                        disabled
                        value={parseFloat(area.amount_target || 0).toFixed(2)} // amount_target ของ area
                        formatter={(value) =>
                          `฿ ${Number(value).toFixed(2)}`.replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            ","
                          )
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
              navigate("/sale-plan/work-plan/create", {
                state: {
                  year_code: location.state.year_code,
                },
              });
            }}
          />

          {permission.btn_draft && (
            <ActionButton
              text="Save Draft"
              mode="saveDraft"
              onClick={() => handleSave("draft")}
            />
          )}

          {permission.btn_save && (
            <ActionButton
              text="Save"
              mode="save"
              onClick={() => handleSave("save")}
            />
          )}
        </div>
      </MainLayout>
    </>
  );
}
