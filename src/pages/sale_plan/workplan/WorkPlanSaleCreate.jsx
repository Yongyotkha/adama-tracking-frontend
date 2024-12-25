import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Input, InputNumber, Table, Modal } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import TableCustomComponent from "../../../components/table/TableCustomComponent";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import Title from "../../../components/title/Title";
import { ExclamationCircleFilled } from "@ant-design/icons";

export default function WorkPlanSaleCreate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const { showNotification, formatNumber } = useContext(AuthContext);
  const { confirm } = Modal;
  const [quarter, setQuarter] = useState([]);
  const [permission, setPermission] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [localQtyState, setLocalQtyState] = useState({});
  const [yearName, setYearName] = useState([]);
  const [name, setName] = useState("");
  const [mode, setMode] = useState(location?.state?.mode);

  useEffect(() => {
    useServiceAPI
      .get(
        paths.pathWorkPlanSaleQuarter,
        {
          year_code: location?.state?.year_code,
          user_id: location?.state?.user_id,
        },
        setLoading
      )
      .then((response) => {
        if (response.status === 200) {
          const initialQtyState = response.data.quarter_items.reduce(
            (acc, quarter) => {
              acc[quarter.quarter_id] = {
                months: quarter.data_items.reduce((monthAcc, month) => {
                  monthAcc[month.month_id] = {
                    products: month.data_items.reduce((productAcc, product) => {
                      productAcc[product.product_id] = {
                        qty: parseFloat(product.qty || 0),
                        value: parseFloat(product.value || 0),
                      };
                      return productAcc;
                    }, {}),
                    total_qty: month.data_items.reduce(
                      (sum, product) => sum + parseFloat(product.qty || 0),
                      0
                    ),
                    total_value: month.data_items.reduce(
                      (sum, product) => sum + parseFloat(product.value || 0),
                      0
                    ),
                  };
                  return monthAcc;
                }, {}),
                total_value: quarter.data_items.reduce(
                  (sum, month) =>
                    sum +
                    month.data_items.reduce(
                      (monthSum, product) =>
                        monthSum + parseFloat(product.value || 0),
                      0
                    ),
                  0
                ),
              };
              return acc;
            },
            {}
          );

          setLocalQtyState(initialQtyState);

          const newData = response.data.data_items.map((item) => ({
            key: item.product_id,
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            pack_size: item.pack_size,
            unit_convert_value: item.unit_convert_value,
            qty: item.original_qty,
            value: item.original_value,
          }));
          const newDataQuarter = response.data.quarter_items.map((item) => ({
            key: item.quarter_id,
            quarter_id: item.quarter_id,
            quarter_name: item.quarter_name,
            amount_target: item.amount_target,
            workplan_area_header_id: item.workplan_area_header_id,
            workplan_header_id: item.workplan_header_id,
            workplan_sale_header_id: item.workplan_sale_header_id,
            data_items: item.data_items,
          }));

          setYearName(response.data.year_name);
          setDataSource(newData);
          setName(response.data.user_name);
          setQuarter(newDataQuarter);
          setTotalValue(response.data.amount_target);
          setPermission(response.data.permission);
        }
      })
      .catch((error) => {
        console.error(error);
        showNotification("error", "เกิดข้อผิดพลาด");
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
                  dataIndex: "product_name",
                  key: "productName",
                  fixed: "left",
                  width: 150,
                },
                {
                  title: "Pack Size",
                  dataIndex: "pack_size",
                  key: "packSize",
                  width: 150,
                  fixed: "left",
                },
                {
                  title: "Work Plan (KG)",
                  dataIndex: "qty",
                  key: "originalPlan",
                  width: 150,
                  fixed: "left",
                  render: (text) => (
                    <InputNumber
                      className="w-full"
                      disabled
                      value={text}
                      formatter={(value) =>
                        `${parseInt(value)}`.replace(
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
                  key: "valueTHB",
                  width: 150,
                  fixed: "left",
                  render: (text) => (
                    <InputNumber
                      className="w-full"
                      disabled
                      value={text}
                      formatter={(value) =>
                        `${parseInt(value)}`.replace(
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

    ...quarter.map((item, index) => ({
      title: item.quarter_name,
      children: [
        {
          title: (
            <InputNumber
              disabled
              className="w-full"
              value={localQtyState[item.quarter_id]?.total_value || 0}
              formatter={(value) =>
                `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          ),
          children: item.data_items.map((month) => ({
            title: month.month_name,
            dataIndex: `value_${month.month_id}_${item.quarter_id}`,
            key: `value_${month.month_id}_${item.quarter_id}`,

            children: [
              {
                title: "Qty (KG)",
                dataIndex: `qty_${month.month_id}`,
                key: `qty_${month.month_id}`,
                width: 150,
                render: (text, record) => {
                  const localData = localQtyState[item.quarter_id]?.months?.[
                    month.month_id
                  ]?.products?.[record.product_id] || { qty: 0, value: 0 };

                  return (
                    <InputNumber
                      className="w-full"
                      min={0}
                      value={localData.qty}
                      formatter={(value) =>
                        `${parseInt(value)}`.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )
                      }
                      onChange={(value) =>
                        handleQtyChange(
                          item.quarter_id,
                          month.month_id,
                          record.product_id,
                          value,
                          record
                        )
                      }
                      disabled={!permission.edit}
                    />
                  );
                },
              },
            ],
          })),
        },
      ],
    })),

    ...quarter.map((item, index) => ({
      title: item.quarter_name,
      children: [
        {
          title: (
            <InputNumber
              disabled
              className="w-full"
              value={localQtyState[item.quarter_id]?.total_value || 0}
              formatter={(value) =>
                `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          ),
          children: item.data_items.map((month) => ({
            title: month.month_name,
            dataIndex: `value_${month.month_id}_${item.quarter_id}`,
            key: `value_${month.month_id}_${item.quarter_id}`,
            children: [
              {
                title: "Value (THB)",
                dataIndex: `value_${month.month_id}`,
                key: `value_${month.month_id}`,
                width: 150,
                render: (text, record) => {
                  const localData = localQtyState[item.quarter_id]?.months?.[
                    month.month_id
                  ]?.products?.[record.product_id] || { qty: 0, value: 0 };
                  return (
                    <InputNumber
                      className="w-full"
                      min={0}
                      value={localData.value}
                      formatter={(value) =>
                        `${parseInt(value)}`.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )
                      }
                      disabled
                    />
                  );
                },
              },
            ],
          })),
        },
      ],
    })),
  ];

  const columns = applyTopLevelAndSpecificChildrenStyles(baseColumns);

  // const handleQtyChange = (
  //   quarterId,
  //   monthId,
  //   productId,
  //   newQty,
  //   record
  //   // unitConvertValue
  // ) => {
  //   setLocalQtyState((prevState) => {
  //     console.log(record);
  //     console.log(record.qty);
  //     const newValue = parseFloat(newQty || 0) * parseFloat(record.unit_convert_value || 0);

  //     const updatedState = {
  //       ...prevState,
  //       [quarterId]: {
  //         ...prevState[quarterId],
  //         months: {
  //           ...prevState[quarterId]?.months,
  //           [monthId]: {
  //             ...prevState[quarterId]?.months?.[monthId],
  //             products: {
  //               ...prevState[quarterId]?.months?.[monthId]?.products,
  //               [productId]: {
  //                 qty: newQty || 0,
  //                 value: newValue,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     };

  //     // คำนวณ total_qty และ total_value ของ month
  //     const totalMonth = Object.values(
  //       updatedState[quarterId]?.months?.[monthId]?.products || {}
  //     ).reduce(
  //       (acc, product) => ({
  //         qty: acc.qty + parseFloat(product.qty || 0),
  //         value: acc.value + parseFloat(product.value || 0),
  //       }),
  //       { qty: 0, value: 0 }
  //     );

  //     updatedState[quarterId].months[monthId].total_qty = totalMonth.qty;
  //     updatedState[quarterId].months[monthId].total_value = totalMonth.value;

  //     // คำนวณ total_value ของ quarter
  //     const totalQuarterValue = Object.values(
  //       updatedState[quarterId]?.months || {}
  //     ).reduce((sum, month) => sum + parseFloat(month.total_value || 0), 0);

  //     updatedState[quarterId].total_value = totalQuarterValue;

  //     console.log(updatedState);
  //     return updatedState;
  //   });
  // };

  const handleQtyChange = (quarterId, monthId, productId, newQty, record) => {
    setLocalQtyState((prevState) => {
      console.log(record);
      console.log(record.qty);

      const newValue =
        parseFloat(newQty || 0) * parseFloat(record.unit_convert_value || 0);

      // สร้าง state ชั่วคราวเพื่อคำนวณผลรวม
      const tempState = {
        ...prevState,
        [quarterId]: {
          ...prevState[quarterId],
          months: {
            ...prevState[quarterId]?.months,
            [monthId]: {
              ...prevState[quarterId]?.months?.[monthId],
              products: {
                ...prevState[quarterId]?.months?.[monthId]?.products,
                [productId]: {
                  qty: newQty || 0,
                  value: newValue,
                },
              },
            },
          },
        },
      };

      const totalProductsQty = Object.entries(tempState)
        .flatMap(([quarterKey, quarter]) => {
          return Object.entries(quarter?.months || {}).flatMap(
            ([monthKey, month]) => {
              return Object.entries(month?.products || {})
                .filter(([key]) => key === String(productId)) // ตรวจสอบ key ที่ตรงกับ productId
                .map(([key, product]) => {
                  return parseFloat(product?.qty || 0); // แปลง qty เป็น float
                });
            }
          );
        })
        .reduce((acc, qty) => {
          const parsedAcc = parseFloat(acc) || 0; // แปลง acc เป็น float
          const parsedQty = parseFloat(qty) || 0; // แปลง qty เป็น float
          console.log("Accumulated Qty:", parsedAcc, "Current Qty:", parsedQty);
          return parsedAcc + parsedQty; // บวกเลขที่ถูกแปลงแล้ว
        }, 0);

      // ตรวจสอบว่าผลรวมไม่เกิน record.qty
      if (totalProductsQty > parseFloat(record.qty || 0)) {
        showNotification(
          "warning",
          record.product_name,
          "value is greater than Work plan",
          2
        );
        return prevState; // ยกเลิกการเปลี่ยนแปลง
      }

      // คำนวณ total_qty และ total_value ของ month
      const totalMonth = Object.values(
        tempState[quarterId]?.months?.[monthId]?.products || {}
      ).reduce(
        (acc, product) => ({
          qty: acc.qty + parseFloat(product.qty || 0),
          value: acc.value + parseFloat(product.value || 0),
        }),
        { qty: 0, value: 0 }
      );

      tempState[quarterId].months[monthId].total_qty = totalMonth.qty;
      tempState[quarterId].months[monthId].total_value = totalMonth.value;

      // คำนวณ total_value ของ quarter
      const totalQuarterValue = Object.values(
        tempState[quarterId]?.months || {}
      ).reduce((sum, month) => sum + parseFloat(month.total_value || 0), 0);

      tempState[quarterId].total_value = totalQuarterValue;

      return tempState;
    });
  };

  const handleSave = async (mode) => {
    const calculatedTotalAmountTarget = quarter.reduce((sum, quarterItem) => {
      const localTotalValue =
        localQtyState[quarterItem.quarter_id]?.total_value || 0;
      return sum + localTotalValue;
    }, 0);

    if (Number(totalValue) > Number(calculatedTotalAmountTarget)) {
      confirm({
        title: "Do you want to save ?",
        icon: <ExclamationCircleFilled />,
        content: (
          <>
            <p>Work Plan is less than Original Plan</p>
            <p>Original Plan: {formatNumber(totalValue)}</p>
            <p>Current Total: {formatNumber(calculatedTotalAmountTarget)}</p>
            <p>
              Difference:{" "}
              {formatNumber(totalValue - calculatedTotalAmountTarget)}
            </p>
          </>
        ),
        centered: true, // ตัวเลือกนี้ช่วยจัดให้อยู่กลาง
        onOk() {
          createPlan(mode);
        },
      });
    } else {
      createPlan(mode);
    }
  };

  const createPlan = async (mode) => {
    setLoading(true); // เริ่มโหลดข้อมูล

    // อัพเดตข้อมูล quarter ด้วยข้อมูลใน localQtyState
    try {
      const updatedQuarterData = quarter.map((item) => {
        const localQuarter = localQtyState[item.quarter_id] || {};

        // อัพเดตข้อมูล months
        const updatedMonths = item.data_items.map((month) => {
          const localMonth = localQuarter.months?.[month.month_id] || {};
          return {
            ...month,
            total_qty: localMonth.total_qty || 0,
            total_value: localMonth.total_value || 0,
            amount_target: localMonth.total_value || 0,
            data_items: month.data_items.map((product) => {
              const localProduct =
                localMonth.products?.[product.product_id] || {};
              return {
                ...product,
                qty: localProduct.qty || product.qty || 0,
                value: localProduct.value || product.value || 0,
              };
            }),
          };
        });

        // คำนวณ total_value ของ quarter
        const totalQuarterValue = updatedMonths.reduce(
          (sum, month) => sum + (month.total_value || 0),
          0
        );

        return {
          ...item,
          amount_target: totalQuarterValue, // อัพเดต amount_target ด้วย total_value
          total_value: totalQuarterValue,
          data_items: updatedMonths,
        };
      });

      await useServiceAPI
        .post(paths.pathWorkPlanSaleQuarter, {
          year_code: location?.state?.year_code,
          user_id: location?.state?.user_id,
          action_code: mode,
          quarter_items: updatedQuarterData,
        })
        .then((response) => {
          if (response.status === 200) {
            if (mode == "draft") {
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              ).then(() => {
                navigate("/sale-plan/work-plan-sale");
              });
            } else {
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              ).then(() => {
                navigate("/sale-plan/work-plan-sale/sale-by-crop", {
                  state: {
                    year_code: location?.state?.year_code,
                    user_id: location?.state?.user_id,
                    mode: location?.state?.mode,
                  },
                });
              });
            }
          }
        })
        .catch((error) => {
          console.error(error);
          if (error.status === 422) {
            showNotification("error", error.message);
          } else {
            showNotification("error", "เกิดข้อผิดพลาด");
          }
        });
    } catch (error) {
      console.error("Unexpected error:", error);
      showNotification("error", "เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setLoading(false); // หยุดโหลดข้อมูลไม่ว่าจะสำเร็จหรือผิดพลาด
    }
  };


  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Work Plan" showYear={yearName} />

        <BoxPrimary>
          <div className="flex gap-5">
            <div>
              <div>Amount Target</div>
              <InputNumber
                disabled
                suffix="THB"
                className="w-full"
                min={0}
                value={totalValue}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </div>
            <div>
              <div>Work Plan</div>
              <InputNumber
                disabled
                suffix="THB"
                className="w-full"
                min={0}
                value={Object.values(localQtyState).reduce(
                  (sum, year) => sum + (year.total_value || 0),
                  0
                )}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }

              />
            </div>
            <div>
              <div>Sale</div>
              <InputNumber disabled className="w-[300px]" value={name} />
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

                  {quarter.map((item) =>
                    Object.entries(
                      localQtyState[item.quarter_id]?.months || {}
                    ).map(([monthId, monthData], index) => (
                      <Table.Summary.Cell
                        key={`${item.quarter_id}-${monthId}`}
                        colSpan={1}
                      >
                        <InputNumber
                          className="w-full"
                          disabled
                          value={monthData.total_value || 0}
                          min={0}
                          formatter={(value) =>
                            `${parseInt(value)}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                          style={{ backgroundColor: "white" }}
                        />
                      </Table.Summary.Cell>
                    ))
                  )}
                  {quarter.map((item) =>
                    Object.entries(
                      localQtyState[item.quarter_id]?.months || {}
                    ).map(([monthId, monthData], index) => (
                      <Table.Summary.Cell
                        key={`${item.quarter_id}-${monthId}`}
                        colSpan={1}
                      >
                        <InputNumber
                          className="w-full"
                          disabled
                          value={monthData.total_value || 0}
                          min={0}
                          formatter={(value) =>
                            `${parseInt(value)}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                          style={{ backgroundColor: "white" }}
                        />
                      </Table.Summary.Cell>
                    ))
                  )}
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
              navigate("/sale-plan/work-plan-sale");
            }}
          />
          {permission.btn_draft && (
            <ActionButton
              text="Save Draft"
              mode="saveDraft"
              onClick={() => handleSave("draft")}
            />
          )}
          {permission.btn_save_and_next && (
            <ActionButton
              text="Save and Next"
              mode="save"
              onClick={() => handleSave("save")}
            />
          )}
          {permission.btn_next && (
            <ActionButton
              text="Next"
              mode="save"
              onClick={() =>
                navigate("/sale-plan/work-plan-sale/sale-by-crop", {
                  state: {
                    year_code: location?.state?.year_code,
                    user_id: location?.state?.user_id,
                    mode: location?.state?.mode,
                  },
                })
              }
            />
          )}
        </div>
      </MainLayout>
    </>
  );
}
