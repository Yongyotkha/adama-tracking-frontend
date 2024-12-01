import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Input, InputNumber, Table } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import TableCustomComponent from "../../../components/table/TableCustomComponent";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import Title from "../../../components/title/Title";

export default function RollingForecastQuarter() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const { showNotification, formatNumber } = useContext(AuthContext);

  const [quarter, setQuarter] = useState([]);
  const [permission, setPermission] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [localQtyState, setLocalQtyState] = useState({});
  const [yearName, setYearName] = useState([]);


  useEffect(() => {
    useServiceAPI
      .get(
        paths.pathRollingForecastQuarter,
        {
          year_code: location?.state?.year_code,
          workplan_header_id: location?.state?.workplan_header_id,
          workplan_area_header_id: location?.state?.workplan_area_header_id,
          workplan_sale_header_id: location?.state?.workplan_sale_header_id,
          user_id: location?.state?.user_id,
          month_id: location?.state?.month_id,
        },
        setLoading
      )
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          const initialQtyState = response.data.quarter_items.reduce(
            (acc, quarter) => {
              acc[quarter.quarter_id] = {
                months: quarter.data_items.reduce((monthAcc, month) => {
                  monthAcc[month.month_id] = {
                    products: month.workplan_data_items.reduce((productAcc, product) => {
                      productAcc[product.product_id] = {
                        qty: parseFloat(product.qty || 0),
                        value: parseFloat(product.value || 0),
                        rolling_qty: parseFloat(product.rolling_qty || 0),
                        rolling_value: parseFloat(product.rolling_value || 0),
                        actual_qty: parseFloat(product.actual_qty || 0),
                        actual_value: parseFloat(product.actual_value || 0),
                      };
                      return productAcc;
                    }, {}),
                  };
                  return monthAcc;
                }, {}),
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

          setYearName(response.data.year_name);
          setDataSource(newData);
          setQuarter(response.data.quarter_items);
          setTotalValue(response.data.amount_target);
          setPermission(response.data.permission);
        }
      })
      .catch((error) => {
        console.error(error);
        showNotification("error", "เกิดข้อผิดพลาด");
      });
  }, []);

  const defaultHeaderDynamic = (bgColor) => ({
    style: {
      backgroundColor: bgColor,
      color: "white", // สีตัวอักษร
      fontWeight: "bold",
      textAlign: "center",
      width: 150,
    },
  });
  const defaultHeaderDarkGreen = () => ({
    style: {
      backgroundColor: "#00783F", // สีเขียวเข้ม
      color: "white", // สีตัวอักษร
      fontWeight: "bold",
      textAlign: "center",
    },
  });

  const getAlternatingHeaderStyle = (index) => ({
    style: {
      backgroundColor: index % 2 === 0 ? "#00783F" : "#009845", // สีเขียวเข้ม / เขียวอ่อน
      color: "white", // สีตัวอักษร
      fontWeight: "bold",
      textAlign: "center",
    },
  });

  const baseColumns = [
    {
      title: "Quarter", // Row 1\
      onHeaderCell: defaultHeaderDarkGreen,
      children: [
        {
          title: "Sale Plan (THB)",
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
              title: "Month", // Row 3
              onHeaderCell: defaultHeaderDarkGreen,

              children: [
                {
                  title: "Product Name", // Row 4
                  dataIndex: "product_name",
                  key: "productName",
                  fixed: "left",
                  width: 150,
                  onHeaderCell: defaultHeaderDarkGreen,
                },
                {
                  title: "Pack Size",
                  dataIndex: "pack_size",
                  key: "packSize",
                  width: 150,
                  fixed: "left",
                  onHeaderCell: defaultHeaderDarkGreen,
                },
                {
                  title: "Original Plan (KG)",
                  dataIndex: "qty",
                  key: "originalPlan",
                  width: 150,
                  fixed: "left",
                  onHeaderCell: defaultHeaderDarkGreen,

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
                  dataIndex: "value",
                  key: "valueTHB",
                  width: 150,
                  fixed: "left",
                  onHeaderCell: defaultHeaderDarkGreen,

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

    ...quarter.map((item, index) => ({
      title: item.quarter_name,
      onHeaderCell: () => getAlternatingHeaderStyle(index + 1),
      children: [
        {
          title: (
            <InputNumber
              disabled
              className="w-[30%]"
              style={{ backgroundColor: "white" }}
              value={localQtyState[item.quarter_id]?.total_value || 0}
              formatter={(value) =>
                `${Number(value).toFixed(2)}`.replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  ","
                )
              }
            />
          ),
          onHeaderCell: () => getAlternatingHeaderStyle(index + 1),
          children: item.data_items.map((month) => ({
            title: month.month_name,
            dataIndex: `value_${month.month_id}_${item.quarter_id}`,
            key: `value_${month.month_id}_${item.quarter_id}`,

            onHeaderCell: () => getAlternatingHeaderStyle(index + 1),

            children: [
              {
                title: (
                  <div>
                    <p>Work Plan</p>
                    <p>(KG)</p>
                  </div>
                ),
                onHeaderCell: () => defaultHeaderDynamic((index+1) % 2 === 0 ? "#00783F" : "#009845"),

                dataIndex: `qty_${month.month_id}`,
                key: `qty_${month.month_id}`,
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
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      onChange={(value) =>
                        handleQtyChange(
                          item.quarter_id,
                          month.month_id,
                          record.product_id,
                          value,
                          record.unit_convert_value || 1,
                          "workplan"
                        )
                      }
                      disabled={!permission.edit}
                    />
                  );
                },
              },
              {
                title: (
                  <div>
                    <p>Rolling Forecast</p>
                    <p>(KG)</p>
                  </div>
                ),
                onHeaderCell: () => defaultHeaderDynamic("#7DB41E"),
                dataIndex: `qty_${month.month_id}`,
                key: `qty_${month.month_id}`,
                render: (text, record) => {
               
                  const localData = localQtyState[item.quarter_id]?.months?.[month.month_id]?.products?.[record.product_id] || { rolling_qty: 0 };
                  return (
                    <InputNumber
                      className="w-full"
                      min={0}
                      value={localData.rolling_qty}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      onChange={(value) =>
                        handleQtyChange(
                          item.quarter_id,
                          month.month_id,
                          record.product_id,
                          value,
                          record.unit_convert_value || 1,
                          "rollingforecast"
                        )
                      }
                      disabled={!permission.edit}
                    />
                  );
                },
              },
              {
                title: (
                  <div>
                    <p>Actual</p>
                    <p>(KG)</p>
                  </div>
                ),
                onHeaderCell: () => defaultHeaderDynamic("#93CC23"),

                dataIndex: `qty_${month.month_id}`,
                key: `qty_${month.month_id}`,
                render: (text, record) => {
                  const localData = localQtyState[item.quarter_id]?.months?.[month.month_id]?.products?.[record.product_id] || { actual_qty: 0 };

                  return (
                    <InputNumber
                      className="w-full"
                      min={0}
                      value={localData.actual_qty}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      onChange={(value) =>
                        handleQtyChange(
                          item.quarter_id,
                          month.month_id,
                          record.product_id,
                          value,
                          record.unit_convert_value || 1,
                          "actual"
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
  ];

  const handleQtyChange = (
    quarterId,
    monthId,
    productId,
    newQty,
    unitConvertValue,
    type
  ) => {
    setLocalQtyState((prevState) => {
      const updatedState = { ...prevState };
      const productData = updatedState[quarterId]?.months?.[monthId]?.products?.[productId] || {};
  
      if (type === "workplan") {
        productData.qty = newQty || 0;
        productData.value = parseFloat((newQty * unitConvertValue).toFixed(2));
      } else if (type === "rollingforecast") {
        productData.rolling_qty = newQty || 0;
        productData.rolling_value = parseFloat((newQty * unitConvertValue).toFixed(2));
      } else if (type === "actual") {
        productData.actual_qty = newQty || 0;
        productData.actual_value = parseFloat((newQty * unitConvertValue).toFixed(2));
      }
  
      // Recalculate totals for month and quarter
      const totalMonth = Object.values(updatedState[quarterId]?.months?.[monthId]?.products || {}).reduce(
        (acc, product) => ({
          qty: acc.qty + (product.qty || 0),
          value: acc.value + (product.value || 0),
        }),
        { qty: 0, value: 0 }
      );
  
      updatedState[quarterId].months[monthId].total_qty = totalMonth.qty;
      updatedState[quarterId].months[monthId].total_value = totalMonth.value;
  
      const totalQuarterValue = Object.values(updatedState[quarterId]?.months || {}).reduce(
        (sum, month) => sum + (month.total_value || 0),
        0
      );
  
      updatedState[quarterId].total_value = totalQuarterValue;
  
      return updatedState;
    });
  };
  

  const handleSave = async (mode) => {
    const calculatedTotalAmountTarget = quarter.reduce((sum, quarterItem) => {
      const localTotalValue =
        localQtyState[quarterItem.quarter_id]?.total_value || 0;
      return sum + localTotalValue;
    }, 0);

    // เปรียบเทียบ original plan (totalValue) กับ sum ของ amount_target
    if (calculatedTotalAmountTarget < totalValue) {
      showNotification(
        "warning",
        "Total Sale Value is less than the Original Plan",
        [
          `Original Plan: ฿ ${formatNumber(totalValue)}`,
          `Current Total: ฿ ${formatNumber(calculatedTotalAmountTarget)}`,
          `Difference: ฿ ${formatNumber(
            totalValue - calculatedTotalAmountTarget
          )}`,
        ],
        3
      );
    } else {
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
    }
  };

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Rolling Forecast" showYear={yearName} />

        <BoxPrimary>
          <div className="flex flex-col gap-2">
            <div>Work Plan</div>
            <div className="w-[25%]">
              <InputNumber
                disabled
                suffix="THB"
                className="w-full"
                min={0}
                value={totalValue}
                formatter={(value) =>
                  `${Number(value).toFixed(2)}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
              />
            </div>
          </div>
        </BoxPrimary>

        <BoxPrimary>
          <div className="text-[#00783F] text-xl pb-5">Monthly Sale Forecast</div>

          <TableCustomComponent
            header={baseColumns}
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
                            `${Number(value).toFixed(2)}`.replace(
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
                            `${Number(value).toFixed(2)}`.replace(
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
