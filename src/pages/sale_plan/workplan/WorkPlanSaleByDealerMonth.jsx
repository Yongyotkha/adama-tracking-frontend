import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Input, InputNumber, Table, Tabs, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import TableCustomComponent from "../../../components/table/TableCustomComponent";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import Title from "../../../components/title/Title";

export default function WorkPlanSaleByDealerMonth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const { showNotification } = useContext(AuthContext);
  const [dealers, setDealers] = useState([]);
  const [activeKey, setActiveKey] = useState(0);
  const [permission, setPermission] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [localQtyState, setLocalQtyState] = useState({});
  const [yearName, setYearName] = useState([]);
  const [message, setMessage] = useState("");
  const [months, setMonths] = useState([]);

  const { Text } = Typography;

  useEffect(() => {
    getMasterDealer();
  }, []);
  useEffect(() => {
    if (activeKey) {
      getMonthDetails();
    }
  }, [activeKey]); 
  useEffect(() => {
    console.log(localQtyState);
  }, [localQtyState]);

  const getMasterDealer = () => {
    useServiceAPI
      .get(
        paths.pathRollingForecastDealer,
        {
          year_code: location?.state?.year_code,
          user_id: location?.state?.user_id,
          workplan_header_id: location?.state?.workplan_header_id,
          workplan_area_header_id: location?.state?.workplan_area_header_id,
          workplan_sale_header_id: location?.state?.workplan_sale_header_id,
        },
        setLoading
      )
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          setDealers(response.data.dealer_items);

          if (response.data.dealer_items.length > 0) {
            setActiveKey(response.data.dealer_items[0].dealer_id);
          }
        }
      })
      .catch((error) => {
        console.error(error);
        showNotification("error", "เกิดข้อผิดพลาด");
      });
  };

  const getMonthDetails = async () => {
    try {
      setTableLoading(true);
      await useServiceAPI
        .get(paths.pathRollingForecastDealerMonth, {
          year_code: location?.state?.year_code,
          user_id: location?.state?.user_id,
          workplan_header_id: location?.state?.workplan_header_id,
          workplan_area_header_id: location?.state?.workplan_area_header_id,
          workplan_sale_header_id: location?.state?.workplan_sale_header_id,
          month_id: 1,
          dealer_id: activeKey,
        })
        .then((response) => {
          if (response.status === 200) {
            const newLocalState = response.data.month_items.reduce(
              (acc, month) => {
                // Initialize crop_id object if it doesn't exist
                if (!acc[month.month_id]) {
                  acc[month.month_id] = {};
                }

                // Process data_items
                month.data_items.forEach((item) => {
                  const productId = item.product_id;

                  const qty = parseFloat(item.qty || 0);
                  const value = parseFloat(item.value || 0);

                  acc[month.month_id][productId] = {
                    qty,
                    value,
                  };
                });

                // Assign amount_target to the month_id
                acc[month.month_id].actual_amount_target = parseFloat(
                  month.actual_amount_target || 0
                );

                return acc;
              },
              {}
            );

            console.log(response);
            console.log(newLocalState);

            // Update the state
            setLocalQtyState(newLocalState);

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
            setMonths(response.data.month_items);
            setTotalValue(response.data.amount_target);
            setPermission(response.data.permission);
          }
        })
        .catch((error) => {
          console.error(error);
          showNotification("error", "เกิดข้อผิดพลาด");
        });
    } catch (error) {
      console.error("Unexpected error:", error);
      showNotification("error", "เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setTableLoading(false);
    }
  };

  const columns = [
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
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#00783F", // สีเขียวเข้ม
              color: "white", // สีตัวอักษร
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
        },
        {
          title: "Pack Size",
          dataIndex: "pack_size",
          key: "packSize",
          width: 150,
          fixed: "left",
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#00783F", // สีเขียวเข้ม
              color: "white", // สีตัวอักษร
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
        },
        {
          title: "Work Plan (KG)",
          dataIndex: "qty",
          key: "originalPlan",
          width: 150,
          fixed: "left",
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#00783F", // สีเขียวเข้ม
              color: "white", // สีตัวอักษร
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (text) => (
            <InputNumber
              className="w-full"
              disabled
              value={text}
              formatter={(value) =>
                `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#00783F", // สีเขียวเข้ม
              color: "white", // สีตัวอักษร
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (text) => (
            <InputNumber
              className="w-full"
              disabled
              value={text}
              formatter={(value) =>
                `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          ),
        },
      ],
    },
    ...months.map((month, index) => ({
      title: month.month_name,
      key: `dealer-${month.month_id}-qty`,
      onHeaderCell: () => ({
        style: {
          backgroundColor: index % 2 === 1 ? "#00783F" : "#009845", // สีเขียวสลับ
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      children: [
        {
          title: "Qty (KG)",
          dataIndex: `qty-${month.month_id}`,
          key: `qty-${month.month_id}`,
          width: 150,

          onHeaderCell: () => ({
            style: {
              backgroundColor: index % 2 === 1 ? "#00783F" : "#009845", // สีเขียวสลับ
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const localData = localQtyState[month.month_id]?.[
              record.product_id
            ] || {
              qty: 0,
              value: 0,
            };

            return (
              <InputNumber
                className="w-full"
                min={0}
                value={localData.qty}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                onChange={(value) =>
                  handleQtyChange(
                    month.month_id,
                    record.product_id,
                    value,
                    record.unit_convert_value || 1
                  )
                }
                disabled={!permission.edit || !month.is_edit}
              />
            );
          },
        },
      ],
    })),

    // Loop สำหรับ Value (THB)
    ...months.map((month, index) => ({
      title: month.month_name,
      key: `dealer-${month.month_id}-value`,
      onHeaderCell: () => ({
        style: {
          backgroundColor: index % 2 === 1 ? "#00783F" : "#009845", // สลับต่อจาก loop แรก
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      children: [
        {
          title: "Value (THB)",
          dataIndex: `value-${month.month_id}`,
          key: `value-${month.month_id}`,
          width: 150,

          onHeaderCell: () => ({
            style: {
              backgroundColor: index % 2 === 1 ? "#00783F" : "#009845", // สลับต่อจาก loop แรก
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const localData = localQtyState[month.month_id]?.[
              record.product_id
            ] || {
              qty: 0,
              value: 0,
            };

            return (
              <InputNumber
                className="w-full"
                disabled
                value={localData.value}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            );
          },
        },
      ],
    })),
  ];

  const handleQtyChange = (month_id, productId, qty, unitConvertValue) => {
    setLocalQtyState((prevState) => {
      // Calculate the new value
      const value = parseFloat(qty || 0) * parseFloat(unitConvertValue || 0);
      // Update the dealer's product information
      const updatedDealerProducts = {
        ...prevState[month_id],
        [productId]: {
          qty: qty || 0,
          value,
        },
      };

      // Recalculate amount_target for the dealer
      const amountTarget = Object.values(updatedDealerProducts).reduce(
        (sum, product) => sum + (product.value || 0),
        0
      );

      return {
        ...prevState,
        [month_id]: {
          ...updatedDealerProducts,
          actual_amount_target: amountTarget,
        },
      };
    });
  };

  const handleSave = async (mode) => {
    setLoading(true);

    try {
      const mappedMonth = months.map((month) => {
        const initialDataItems = month.data_items || [];

        const dealerProducts = localQtyState[month.month_id] || {};
        const updatedDataItems = Object.keys(dealerProducts)
          .filter((key) => key !== "actual_amount_target")
          .map((productId) => ({
            product_id: productId,
            qty: dealerProducts[productId]?.qty || 0,
            value: dealerProducts[productId]?.value || 0,
          }));

        const mergedDataItems = initialDataItems.map((item) => {
          const updatedItem = updatedDataItems.find(
            (update) => update.product_id === item.product_id
          );
          return updatedItem ? { ...item, ...updatedItem } : item;
        });

        updatedDataItems.forEach((update) => {
          if (
            !mergedDataItems.some(
              (item) => item.product_id === update.product_id
            )
          ) {
            mergedDataItems.push(update);
          }
        });

        return {
          ...month,
          month_id: month.month_id,
          actual_amount_target:
            Number(dealerProducts.actual_amount_target || month.actual_amount_target || 0),
          data_items: mergedDataItems,
        };
      });
   


      await useServiceAPI
        .put(paths.pathRollingForecastDealerMonth, {
          action_code: mode,
          dealer_id: activeKey,
          year_code: location?.state?.year_code,
          user_id: location?.state?.user_id,
          workplan_header_id: location?.state?.workplan_header_id,
          workplan_area_header_id: location?.state?.workplan_area_header_id,
          workplan_sale_header_id: location?.state?.workplan_sale_header_id,
          month_items: mappedMonth, 
        })
        .then((response) => {
          console.log(response, mode);
          if (response.status === 200) {
            if (mode === "draft") {
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              ).then(() => {
                getMonthDetails();
              });
            } else {
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              ).then(() => {
                navigate("/sale-plan/work-plan-sale/sale-by-subdealer", {
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
  };

  const items = [
    ...dealers.map((dealer) => ({
      key: dealer.dealer_id,
      label: <span className="tab-title">{dealer.dealer_name}</span>,
    })),
  ];

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Work Plan (Dealer)" showYear={yearName} />

        <Tabs
          // activeKey={activeTabKey}
          onChange={handleTabChange}
          className="custom-tabs"
          items={items}
          defaultActiveKey={activeKey}
        />

        <BoxPrimary>
          <div className="flex gap-4">
            <div>
              <div>Dealer</div>
              <div className="">
                <Input
                  disabled
                  className="w-[300px]"
                  value={
                    dealers.find((dealer) => dealer.dealer_id === activeKey)
                      ?.dealer_name || ""
                  }
                />
              </div>
            </div>
            {/* <div>
              <div>Amount Target</div>
              <div className="">
                <InputNumber
                  disabled
                  suffix="THB"
                  className="w-full"
                  min={0}
                  value={
                    dealers.find((dealer) => dealer.dealer_id === activeKey)
                      ?.amount_target || 0
                  }
                  formatter={(value) =>
                    `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </div>
            </div> */}
            <div>
              <div>Work Plan</div>
              <div className="">
                <InputNumber
                  disabled
                  suffix="THB"
                  className="w-full"
                  min={0}
                  value={Object.values(localQtyState).reduce(
                    (sum, value) => sum + (value.actual_amount_target || 0),
                    0
                  )}
                  formatter={(value) =>
                    `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </div>
            </div>
            <div className="self-end">
              <div className="text-red-500 font-bold">{message}</div>
            </div>
          </div>
        </BoxPrimary>

        <BoxPrimary>
          <div className="text-[#00783F] text-xl pb-5">Monthly Sale Plan</div>

          <TableCustomComponent
            header={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={true}
            loading={tableLoading}
            footer={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-[#978B87]">
                  <Table.Summary.Cell index={0} colSpan={3}>
                    Total (THB)
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    <InputNumber
                      className="w-full"
                      disabled
                      min={0}
                      value={totalValue}
                      formatter={(value) =>
                        `${parseInt(value)}`.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )
                      }
                      style={{ backgroundColor: "white" }}
                    />
                  </Table.Summary.Cell>
                  {months.map((month) => {
                    const totalValue = Object.values(
                      localQtyState[month.month_id] || {}
                    ).reduce((sum, product) => sum + (product.value || 0), 0);

                    return (
                      <Table.Summary.Cell
                        key={`summary-value-${month.month_id}`}
                        align="center"
                      >
                        <InputNumber
                          className="w-full"
                          disabled
                          value={totalValue}
                          formatter={(value) =>
                            `${parseInt(value)}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                          style={{ backgroundColor: "white" }}
                        />
                      </Table.Summary.Cell>
                    );
                  })}
                  {months.map((month) => {
                    const totalValue = Object.values(
                      localQtyState[month.month_id] || {}
                    ).reduce((sum, product) => sum + (product.value || 0), 0);

                    return (
                      <Table.Summary.Cell
                        key={`summary-value-${month.month_id}`}
                        align="center"
                      >
                        <InputNumber
                          className="w-full"
                          disabled
                          value={totalValue}
                          formatter={(value) =>
                            `${parseInt(value)}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                          style={{ backgroundColor: "white" }}
                        />
                      </Table.Summary.Cell>
                    );
                  })}
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </BoxPrimary>

        <div className="flex justify-end space-x-4">
          <ActionButton text="Back" mode="back" onClick={() => navigate(-1)} />

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
                navigate("/sale-plan/work-plan-sale/sale-by-subdealer", {
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
