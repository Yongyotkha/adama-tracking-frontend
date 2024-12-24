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
  const [month, setMonth] = useState({
    id: null,
    name: null,
  });
  const [name, setName] = useState([]);

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
                total_value: quarter.rollingforecast_amount_target,
                months: quarter.data_items.reduce((monthAcc, month) => {
                  monthAcc[month.month_id] = {
                    total_value: month.rollingforecast_amount_target,
                    products: month.rollingforecast_data_items.reduce(
                      (productAcc, product) => {
                        productAcc[product.product_id] = {
                          rolling_qty: Number(product.qty || 0),
                          rolling_value: Number(product.value || 0),
                        };
                        return productAcc;
                      },
                      {}
                    ),
                  };
                  return monthAcc;
                }, {}),
              };
              return acc;
            },
            {}
          );

          setLocalQtyState(initialQtyState);
          console.log(initialQtyState);
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
          setMonth({
            id: response.data.select_month_id,
            name: response.data.select_month_mane,
          });
          setName(response.data.user_name);
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
      // width: 150,
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
          title: "Work Plan (THB)",
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
                  title: "Work Plan (KG)",
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
                  onHeaderCell: defaultHeaderDarkGreen,
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
      // title: item.quarter_name,
      title: (
        <div className="flex items-center gap-2">
          <div className="w-[33%]">Workplan (Q{item.quarter_id})</div>
          <div className="w-[33%]">Rolling Forecast (Q{item.quarter_id})</div>
          <div className="w-[33%]">Actual (Q{item.quarter_id})</div>
        </div>
      ),
      onHeaderCell: () => getAlternatingHeaderStyle(index + 1),
      children: [
        {
          title: (
            <div className="flex items-center gap-2">
              <InputNumber
                disabled
                className="w-[33%]"
                style={{ backgroundColor: "white" }}
                value={item.amount_target}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
              />
              <InputNumber
                disabled
                className="w-[33%]"
                style={{ backgroundColor: "white" }}
                value={localQtyState[item.quarter_id]?.total_value || 0}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
              />
              <InputNumber
                disabled
                className="w-[33%]"
                style={{ backgroundColor: "white" }}
                value={item.actual_amount_target || 0}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
              />
            </div>
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
                  </div>
                ),
                onHeaderCell: () =>
                  defaultHeaderDynamic(
                    (index + 1) % 2 === 0 ? "#00783F" : "#009845"
                  ),
                dataIndex: `workplan_${month.month_id}`,
                key: `workplan_qty_${month.month_id}`,
                width: 150,

                render: (_, record) => {
                  const workplanData =
                    month.workplan_data_items.find(
                      (product) => product.product_id === record.product_id
                    ) || {};
                  return (
                    <InputNumber
                      className="w-full"
                      min={0}
                      value={workplanData.qty || 0}
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
              {
                title: "Rolling Forecast",
                onHeaderCell: () => defaultHeaderDynamic("#7DB41E"),
                dataIndex: `rollingforecast_${month.month_id}`,
                key: `rollingforecast_qty_${month.month_id}`,
                width: 150,

                render: (_, record) => {
                  const rollingData =
                    localQtyState[item.quarter_id]?.months?.[month.month_id]
                      ?.products?.[record.product_id] || {};
                  return (
                    <InputNumber
                      className="w-full"
                      min={0}
                      value={rollingData.rolling_qty || 0}
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
                          record.unit_convert_value || 1,
                          "rollingforecast"
                        )
                      }
                      disabled={!month.is_edit}
                    />
                  );
                },
              },
              {
                title: (
                  <div>
                    <p>Actual</p>
                  </div>
                ),
                onHeaderCell: () => defaultHeaderDynamic("#93CC23"),
                dataIndex: `actual_${month.month_id}`,
                key: `actual_qty_${month.month_id}`,
                width: 150,

                render: (_, record) => {
                  const actualData =
                    month.actual_data_items.find(
                      (product) => product.product_id === record.product_id
                    ) || {};
                  return (
                    <InputNumber
                      className="w-full"
                      min={0}
                      value={actualData.qty || 0}
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

  const handleQtyChange = (
    quarterId,
    monthId,
    productId,
    newQty,
    unitConvertValue
  ) => {
    setLocalQtyState((prevState) => {
      const updatedState = { ...prevState };

      // Ensure only rolling forecast is editable
      if (!updatedState[quarterId]?.months?.[monthId]?.products?.[productId]) {
        return prevState; // No changes if the product doesn't exist
      }

      const productData =
        updatedState[quarterId]?.months?.[monthId]?.products[productId] || {};
      productData.rolling_qty = newQty || 0;
      productData.rolling_value = Number(newQty) * Number(unitConvertValue);

      // Recalculate totals for the month
      const totalMonth = Object.values(
        updatedState[quarterId]?.months?.[monthId]?.products || {}
      ).reduce(
        (acc, product) => ({
          rolling_qty:
            Number(acc.rolling_qty) + Number(product.rolling_qty || 0),
          rolling_value:
            Number(acc.rolling_value) + Number(product.rolling_value || 0),
        }),
        { rolling_qty: 0, rolling_value: 0 }
      );

      updatedState[quarterId].months[monthId].total_value =
        totalMonth.rolling_value;

      // Recalculate totals for the quarter
      const totalQuarterValue = Object.values(
        updatedState[quarterId]?.months || {}
      ).reduce((sum, month) => Number(sum) + Number(month.total_value || 0), 0);

      updatedState[quarterId].total_value = totalQuarterValue;
      console.log(updatedState);
      return updatedState;
    });
  };



  const handleSave = async (mode) => {
    setLoading(true); // เริ่มโหลดข้อมูล

    // อัพเดตข้อมูล quarter ด้วยข้อมูลใน localQtyState
    try {
      const updatedQuarterData = quarter.map((item) => {
        const localQuarter = localQtyState[item.quarter_id] || {};
        const updatedMonths = item.data_items.map((month) => {
          const localMonth = localQuarter.months?.[month.month_id] || {};
          return {
            ...month,
            // total_qty: localMonth.total_qty || 0,
            rollingforecast_amount_target: localMonth.total_value || 0,

            rollingforecast_data_items: (
              month.rollingforecast_data_items || []
            ).map((originalItem) => {
              const updatedProduct =
                localMonth.products?.[originalItem.product_id] || {};

              return {
                ...originalItem,
                qty: updatedProduct.rolling_qty || originalItem.qty || 0,
                value: updatedProduct.rolling_value || originalItem.value || 0,
              };
            }),
          };
        });
        return { ...item, data_items: updatedMonths };
      });

      console.log(localQtyState);

      const found = updatedQuarterData.some((quarter) => {
        const matchingItem = quarter.data_items.find(
          (item) => item.month_id === month.id
        );

        if (matchingItem) {
          console.log("Matching item found:", matchingItem);

          if (
            Number(matchingItem.workplan_amount_target) >
            Number(matchingItem.rollingforecast_amount_target)
          ) {
            showNotification(
              "warning",
              "Rollingforecast is less than Original Plan",
              [
                `Original Plan: ฿ ${formatNumber(
                  matchingItem.workplan_amount_target
                )}`,
                `Current Total: ฿ ${formatNumber(
                  matchingItem.rollingforecast_amount_target
                )}`,
                `Difference: ฿ ${formatNumber(
                  matchingItem.workplan_amount_target -
                    matchingItem.rollingforecast_amount_target
                )}`,
              ],
              3
            );

            return false;
          } else {
            return true;
          }
        }

        return false; // ดำเนินการต่อหากไม่เจอ
      });

      if (found) {
        await useServiceAPI
          .post(paths.pathRollingForecastQuarter, {
            year_code: location?.state?.year_code,
            workplan_header_id: location?.state?.workplan_header_id,
            workplan_area_header_id: location?.state?.workplan_area_header_id,
            workplan_sale_header_id: location?.state?.workplan_sale_header_id,
            user_id: location?.state?.user_id,
            month_id: location?.state?.month_id,
            action_code: mode,
            quarter_items: updatedQuarterData,
          })
          .then((response) => {
            if (response.status === 200) {
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              ).then(() => {
                navigate(-1);
              });
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
      }
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
        <Title
          prefix="Rolling Forecast"
          showYear={yearName}
          showMonth={month.name}
        />

        <BoxPrimary>
          <div className="flex flex-col gap-2">
            <div className="flex gap-4">
              <div>
                <div>Work Plan</div>
                <InputNumber
                  disabled
                  suffix="THB"
                  className="w-[300px]"
                  min={0}
                  value={totalValue}
                  formatter={(value) =>
                    `${parseInt(value)}`.replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )
                  }
                />
              </div>
              <div>
                <div>Sale Territory</div>
                <InputNumber disabled className="w-[300px]" value={name} />
              </div>
            </div>
          </div>
        </BoxPrimary>

        <BoxPrimary>
          <div className="text-[#00783F] text-xl pb-5">
            Monthly Sale Forecast
          </div>

          <TableCustomComponent
            header={baseColumns}
            dataSource={dataSource}
            pagination={false}
            scroll={true}
            footer={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="custom-summary-row">
                  <Table.Summary.Cell index={0} colSpan={4}>
                    Total (THB)
                  </Table.Summary.Cell>
                  {quarter.flatMap((item) =>
                    item.data_items.flatMap((month, monthIndex) => [
                      // Workplan Amount Target
                      <Table.Summary.Cell
                        key={`workplan-${item.quarter_id}-${month.month_id}`}
                        index={5 + monthIndex * 3}
                      >
                        <InputNumber
                          className="w-full"
                          disabled
                          value={Number(month.workplan_amount_target || 0)}
                          formatter={(value) =>
                            `${parseInt(value)}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                          style={{ backgroundColor: "white" }}
                        />
                      </Table.Summary.Cell>,
                      // Rolling Forecast Amount Target (from localQtyState)
                      <Table.Summary.Cell
                        key={`rollingforecast-${item.quarter_id}-${month.month_id}`}
                        index={6 + monthIndex * 3}
                      >
                        <InputNumber
                          className="w-full"
                          disabled
                          value={Number(
                            localQtyState[item.quarter_id]?.months?.[
                              month.month_id
                            ]?.total_value || 0
                          )}
                          formatter={(value) =>
                            `${parseInt(value)}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                          style={{ backgroundColor: "white" }}
                        />
                      </Table.Summary.Cell>,
                      // Actual Amount Target
                      <Table.Summary.Cell
                        key={`actual-${item.quarter_id}-${month.month_id}`}
                        index={7 + monthIndex * 3}
                      >
                        <InputNumber
                          className="w-full"
                          disabled
                          value={Number(month.actual_amount_target || 0)}
                          formatter={(value) =>
                            `${parseInt(value)}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                          style={{ backgroundColor: "white" }}
                        />
                      </Table.Summary.Cell>,
                    ])
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
              navigate(-1);
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
          {permission.btn_save && (
            <ActionButton
              text="Save"
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
