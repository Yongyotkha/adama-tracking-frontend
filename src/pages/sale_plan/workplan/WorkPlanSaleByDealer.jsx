import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { InputNumber, Table, Modal } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import TableCustomComponent from "../../../components/table/TableCustomComponent";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import Title from "../../../components/title/Title";
import { ExclamationCircleFilled } from "@ant-design/icons";

export default function WorkPlanSaleByDealer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const { showNotification, formatNumber } = useContext(AuthContext);
  const [dealer, setDealer] = useState([]);
  const [permission, setPermission] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [localQtyState, setLocalQtyState] = useState({});
  const [yearName, setYearName] = useState([]);
  const totalDealers = dealer.length;
  const { confirm } = Modal;

  useEffect(() => {
    useServiceAPI
      .get(
        paths.pathWorkPlanSaleDealer,
        {
          year_code: location?.state?.year_code,
          user_id: location?.state?.user_id,
        },
        setLoading
      )
      .then((response) => {
        if (response.status === 200) {
          const newLocalState = response.data.dealer_items.reduce(
            (acc, dealer) => {
              // Initialize crop_id object if it doesn't exist
              if (!acc[dealer.dealer_id]) {
                acc[dealer.dealer_id] = {};
              }

              // Process data_items
              dealer.data_items.forEach((item) => {
                const productId = item.product_id;

                const qty = parseFloat(item.qty || 0);
                const value = parseFloat(item.value || 0);

                // Assign product data to the dealer_id
                acc[dealer.dealer_id][productId] = {
                  qty,
                  value,
                };
              });

              // Assign amount_target to the dealer_id
              acc[dealer.dealer_id].amount_target = parseFloat(
                dealer.amount_target || 0
              );

              return acc;
            },
            {}
          );

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
          setDealer(response.data.dealer_items);
          setTotalValue(response.data.amount_target);
          setPermission(response.data.permission);
        }
      })
      .catch((error) => {
        console.error(error);
        showNotification("error", "เกิดข้อผิดพลาด");
      });
  }, []);

  const columns = [
    {
      title: "Dealer", // Row 3
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
          title: "Original Plan (KG)",
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
                `${Number(value).toFixed(2)}`.replace(
                  /\B(?=(\d{3})+(?!\d))/g,
                  ","
                )
              }
            />
          ),
        },
      ],
    },
    ...dealer.map((dealerItem, index) => ({
      title: dealerItem.dealer_name,
      key: `dealer-${dealerItem.dealer_id}-qty`,
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
          dataIndex: `qty-${dealerItem.dealer_id}`,
          key: `qty-${dealerItem.dealer_id}`,
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
            const localData = localQtyState[dealerItem.dealer_id]?.[
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
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                onChange={(value) =>
                  handleQtyChange(
                    dealerItem.dealer_id,
                    record.product_id,
                    value,
                    record.unit_convert_value || 1
                  )
                }
                disabled={!permission.edit}
              />
            );
          },
        },
      ],
    })),

    // Loop สำหรับ Value (THB)
    ...dealer.map((dealerItem, index) => ({
      title: dealerItem.dealer_name,
      key: `dealer-${dealerItem.dealer_id}-value`,
      onHeaderCell: () => ({
        style: {
          backgroundColor:
            (index + totalDealers) % 2 === 1 ? "#00783F" : "#009845", // สลับต่อจาก loop แรก
          color: "white",
          fontWeight: "bold",
          textAlign: "center",
        },
      }),
      children: [
        {
          title: "Value (THB)",
          dataIndex: `value-${dealerItem.dealer_id}`,
          key: `value-${dealerItem.dealer_id}`,
          width: 150,
          onHeaderCell: () => ({
            style: {
              backgroundColor:
                (index + totalDealers) % 2 === 1 ? "#00783F" : "#009845", // สลับต่อจาก loop แรก
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const localData = localQtyState[dealerItem.dealer_id]?.[
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
                  `${Number(value).toFixed(2)}`.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ","
                  )
                }
              />
            );
          },
        },
      ],
    })),
  ];

  const handleQtyChange = (dealerId, productId, qty, unitConvertValue) => {
    setLocalQtyState((prevState) => {
      // Calculate the new value
      const value = qty * unitConvertValue;

      // Update the dealer's product information
      const updatedDealerProducts = {
        ...prevState[dealerId],
        [productId]: {
          qty,
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
        [dealerId]: {
          ...updatedDealerProducts,
          amount_target: amountTarget,
        },
      };
    });
  };

  const handleSave = async (mode) => {
    const totalAmountTarget = Object.values(localQtyState).reduce(
      (sum, item) => {
        return sum + (item.amount_target || 0);
      },
      0
    );

    if (Number(totalValue) > Number(totalAmountTarget)) {
      confirm({
        title: "Do you want to save ?",
        icon: <ExclamationCircleFilled />,
        content: (
          <>
            <p>Work Plan is less than Original Plan</p>
            <p>Original Plan: {formatNumber(totalValue)}</p>
            <p>Current Total: {formatNumber(totalAmountTarget)}</p>
            <p>Difference: {formatNumber(totalValue - totalAmountTarget)}</p>
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
    try {
      setLoading(true); // เริ่มโหลดข้อมูล

      const mappedDealers = dealer.map((dealerItem) => {
        // Get the initial data_items
        const initialDataItems = dealerItem.data_items || [];

        // Get the updated data from localQtyState
        const dealerProducts = localQtyState[dealerItem.dealer_id] || {};
        const updatedDataItems = Object.keys(dealerProducts)
          .filter((key) => key !== "amount_target") // Exclude amount_target
          .map((productId) => ({
            product_id: productId,
            qty: dealerProducts[productId]?.qty || 0,
            value: dealerProducts[productId]?.value || 0,
          }));

        // Merge initial and updated data_items
        const mergedDataItems = initialDataItems.map((item) => {
          const updatedItem = updatedDataItems.find(
            (update) => update.product_id === item.product_id
          );
          return updatedItem
            ? { ...item, ...updatedItem } // Overwrite with updated data if available
            : item; // Keep original data if no updates
        });

        // Include additional updated products that aren't in initial data_items
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
          ...dealerItem,
          dealer_id: dealerItem.dealer_id,
          amount_target:
            dealerProducts.amount_target || dealerItem.amount_target || 0,
          data_items: mergedDataItems,
        };
      });

      await useServiceAPI
        .post(paths.pathWorkPlanSaleDealer, {
          year_code: location?.state?.year_code,
          user_id: location?.state?.user_id,
          action_code: mode,
          dealer_items: mappedDealers, // รวมข้อมูลตั้งต้นของ crop
        })
        .then((response) => {
          if (response.status === 200) {
            if (mode == "draft") {
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              ).then(() => {
                navigate("/sale-plan/work-plan-sale", {
                  state: {
                    year_code: location?.state?.year_code,
                    user_id: location?.state?.user_id,
                  },
                });
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

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Sale By Dealer" showYear={yearName} />

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
          <div className="text-[#00783F] text-xl pb-5">Dealer Plan</div>

          <TableCustomComponent
            header={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={true}
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
                        `${Number(value).toFixed(2)}`.replace(
                          /\B(?=(\d{3})+(?!\d))/g,
                          ","
                        )
                      }
                      style={{ backgroundColor: "white" }}
                    />
                  </Table.Summary.Cell>

                  {dealer.map((item, index) => (
                    <Table.Summary.Cell key={index} colSpan={1}>
                      <InputNumber
                        className="w-full"
                        disabled
                        value={
                          localQtyState[item.dealer_id]?.amount_target || 0
                        }
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
                  ))}
                  {dealer.map((item, index) => (
                    <Table.Summary.Cell key={index} colSpan={1}>
                      <InputNumber
                        className="w-full"
                        disabled
                        value={
                          localQtyState[item.dealer_id]?.amount_target || 0
                        }
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
            onClick={() =>
              navigate("/sale-plan/work-plan-sale/sale-by-crop", {
                state: {
                  year_code: location?.state?.year_code,
                  user_id: location?.state?.user_id,
                },
              })
            }
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
