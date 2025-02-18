import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Input, InputNumber, Table, Tabs, Typography, Modal } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import TableCustomComponent from "../../../components/table/TableCustomComponent";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import Title from "../../../components/title/Title";
import { ExclamationCircleFilled } from "@ant-design/icons";

export default function WorkPlanSaleBySubDealer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const { showNotification, formatNumber } = useContext(AuthContext);
  const [dealers, setDealers] = useState([]);
  const [activeKey, setActiveKey] = useState(0);
  const [subDealers, setSubDealers] = useState([]);
  const [permission, setPermission] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [mode, setMode] = useState(location?.state?.mode);
  const [localQtyState, setLocalQtyState] = useState({});
  const [yearName, setYearName] = useState([]);
  const totalDealers = subDealers.length;
  const [message, setMessage] = useState("");
  const { Text } = Typography;
  const [data, setData] = useState({});
  const { confirm } = Modal;

  useEffect(() => {
    getMasterDealer();
  }, []);
  useEffect(() => {
    if (activeKey) {
      getSubDealerList();
    }
  }, [activeKey]);

  const getMasterDealer = () => {
    useServiceAPI
      .get(paths.pathWorkPlanSaleSubDealerList, {
        year_code: location?.state?.year_code,
        user_id: location?.state?.user_id,
      })
      .then((response) => {
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

  const getSubDealerList = async () => {
    try {
      setTableLoading(true);

      await useServiceAPI
        .get(paths.pathWorkPlanSaleSubDealer, {
          year_code: location?.state?.year_code,
          user_id: location?.state?.user_id,
          dealer_id: activeKey,
        })
        .then((response) => {
          if (response.status === 200) {
            // const dealerData = response.data.dealer_items || [];
            const subDealerData = response.data.sub_dealer_items || [];
            const productData = response.data.data_items || [];

            // Initialize localQtyState based on API response
            const newLocalQtyState = {};

            // Loop through dealers
            const dealerId = activeKey;
            if (!newLocalQtyState[dealerId]) {
              newLocalQtyState[dealerId] = {};
            }

            // Loop through sub-dealers for the dealer
            subDealerData.forEach((subDealer) => {
              const subDealerId = subDealer.sub_dealer_id;
              if (!newLocalQtyState[dealerId][subDealerId]) {
                newLocalQtyState[dealerId][subDealerId] = {
                  totalAmountTarget: 0,
                };
              }

              // Loop through products for the sub-dealer
              productData.forEach((product) => {
                const productId = product.product_id;

                // Get quantity and value for this product under this sub-dealer
                const qty =
                  subDealer.data_items?.find((p) => p.product_id === productId)
                    ?.qty || 0;
                const value = qty * (product.unit_convert_value || 1);

                // Store product data in localQtyState
                newLocalQtyState[dealerId][subDealerId][productId] = {
                  qty,
                  value,
                };
              });

              // Calculate totalAmountTarget for the sub-dealer
              newLocalQtyState[dealerId][subDealerId].totalAmountTarget =
                Object.values(newLocalQtyState[dealerId][subDealerId])
                  .filter((product) => typeof product === "object")
                  .reduce((sum, product) => sum + (product.value || 0), 0);
            });

            setLocalQtyState(newLocalQtyState);
            setData(response.data);

            const newData = response.data.data_items.map((item, index) => ({
              key: index++,
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
            setSubDealers(response.data.sub_dealer_items);
            setTotalValue(response.data.amount_target);
            setPermission(response.data.permission);
            setMessage(response.data.dealer_items_message);
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
      title: "Sub Dealer", // Row 3
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
                `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
            />
          ),
        },
      ],
    },
    ...subDealers.map((dealerItem, index) => ({
      title: (
        <Text
          ellipsis={{ tooltip: dealerItem.sub_dealer_name }}
          className="text-white"
        >
          {dealerItem.sub_dealer_name}
        </Text>
      ),
      key: `dealer-${dealerItem.sub_dealer_id}-qty`,
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
          dataIndex: `qty-${dealerItem.sub_dealer_id}`,
          key: `qty-${dealerItem.sub_dealer_id}`,
          width: 150,
          onHeaderCell: () => ({
            style: {
              backgroundColor: index % 2 === 1 ? "#00783F" : "#009845",
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const localData = localQtyState[activeKey]?.[
              dealerItem.sub_dealer_id
            ]?.[record.product_id] || {
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
                    activeKey, // dealerId
                    dealerItem.sub_dealer_id,
                    record.product_id,
                    value,
                    record.unit_convert_value || 1
                  )
                }
                disabled={!permission.edit || dealerItem.sub_dealer_id == 0}
              />
            );
          },
        },
      ],
    })),
    ...subDealers.map((dealerItem, index) => ({
      // title: dealerItem.sub_dealer_name,
      title: (
        <Text
          ellipsis={{ tooltip: dealerItem.sub_dealer_name }}
          className="text-white"
        >
          {dealerItem.sub_dealer_name}
        </Text>
      ),
      key: `dealer-${dealerItem.sub_dealer_id}-value`,
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
          dataIndex: `value-${dealerItem.sub_dealer_id}`,
          key: `value-${dealerItem.sub_dealer_id}`,
          width: 150,
          onHeaderCell: () => ({
            style: {
              backgroundColor:
                (index + totalDealers) % 2 === 1 ? "#00783F" : "#009845",
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
          render: (_, record) => {
            const localData = localQtyState[activeKey]?.[
              dealerItem.sub_dealer_id
            ]?.[record.product_id] || {
              qty: 0,
              value: 0,
            };

            return (
              <InputNumber
                className="w-full"
                min={0}
                value={localData.value}
                formatter={(value) =>
                  `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled
              />
            );
          },
        },
      ],
    })),
  ];

  const handleQtyChange = (
    dealerId,
    subDealerId,
    productId,
    newQty,
    unitConvertValue = 1
  ) => {
    setLocalQtyState((prevState) => {
      const updatedState = { ...prevState };

      // Ensure the structure exists for dealer and subDealer
      if (!updatedState[dealerId]) {
        updatedState[dealerId] = {};
      }
      if (!updatedState[dealerId][subDealerId]) {
        updatedState[dealerId][subDealerId] = { totalAmountTarget: 0 };
      }

      // Get the original plan value from the data source
      const originalPlan =
        dataSource.find((item) => item.product_id === productId)?.qty || 0;

      // Calculate the total quantity of other sub-dealers for this product, including totalAmountTarget
      const totalOtherQty = Object.keys(updatedState[dealerId]).reduce(
        (sum, dealerKey) => {
          if (dealerKey !== "0" && dealerKey !== subDealerId.toString()) {
            return (
              sum +
              (Number(updatedState[dealerId][dealerKey][productId]?.qty) || 0)
            );
          }
          return sum;
        },
        0
      );

      // Including totalAmountTarget from the current subDealer
      const totalSubDealerQty =
        totalOtherQty +
        (updatedState[dealerId][subDealerId]?.totalAmountTarget || 0);

      // Calculate the remaining quantity that can be assigned to the current sub-dealer
      const remainingQty = originalPlan - totalSubDealerQty;

      // Update qty for the subDealer
      const finalQty = newQty; // Allowing newQty to go over the originalPlan

      if (!updatedState[dealerId][subDealerId][productId]) {
        updatedState[dealerId][subDealerId][productId] = {};
      }

      updatedState[dealerId][subDealerId][productId] = {
        qty: finalQty, // Update sub-dealer quantity to whatever is input
        value: finalQty * (Number(unitConvertValue) || 0),
      };

      updatedState[dealerId][subDealerId].totalAmountTarget = Object.values(
        updatedState[dealerId][subDealerId]
      )
        .filter((product) => typeof product === "object")
        .reduce((sum, product) => sum + (Number(product.value) || 0), 0);

      // Update the quantity for dealerId["0"], if it goes negative, set it to 0
      updatedState[dealerId]["0"] = updatedState[dealerId]["0"] || {};
      updatedState[dealerId]["0"][productId] = {
        qty: Math.max(0, originalPlan - totalOtherQty - finalQty), // Ensure it doesn't go below 0
        value: Math.max(
          0,
          (originalPlan - totalOtherQty - finalQty) *
            (Number(unitConvertValue) || 0)
        ),
      };

      updatedState[dealerId][0].totalAmountTarget = Object.values(
        updatedState[dealerId][0]
      )
        .filter((product) => typeof product === "object")
        .reduce((sum, product) => sum + (Number(product.value) || 0), 0);

      return updatedState;
    });
  };

  const handleSave = async (mode) => {
    // const totalAmountTarget = Object.values(localQtyState).reduce(
    //   (sum, obj) => {
    //     return (
    //       sum +
    //       Object.values(obj).reduce(
    //         (nestedSum, item) => nestedSum + (item.totalAmountTarget || 0),
    //         0
    //       )
    //     );
    //   },
    //   0
    // );

    // if (Number(totalValue) > Number(totalAmountTarget)) {
    //   confirm({
    //     title: "Do you want to save ?",
    //     icon: <ExclamationCircleFilled />,
    //     content: (
    //       <>
    //         <p>Work Plan is less than Original Plan</p>
    //         <p>Original Plan: {formatNumber(totalValue)}</p>
    //         <p>Current Total: {formatNumber(totalAmountTarget)}</p>
    //         <p>Difference: {formatNumber(totalValue - totalAmountTarget)}</p>
    //       </>
    //     ),
    //     centered: true,
    //     onOk() {
    //       createPlan(mode);
    //     },
    //   });
    // } else {
    //   createPlan(mode);
    // }
    createPlan(mode);
  };

  const createPlan = async (mode) => {
    try {
      setLoading(true); // เริ่มโหลดข้อมูล

      const updatedSubDealers = subDealers.map((subDealer) => {
        const localData =
          localQtyState[activeKey]?.[subDealer.sub_dealer_id] || {};

        // Update data_items with local state values
        const updatedDataItems = subDealer.data_items.map((item) => {
          const product = localData[item.product_id] || { qty: 0, value: 0 };
          return {
            ...item,
            qty: product.qty,
            value: product.value,
          };
        });

        // Calculate total amount target based on updated data_items
        const totalAmountTarget = updatedDataItems.reduce(
          (sum, item) => sum + (item.value || 0),
          0
        );

        return {
          ...subDealer,
          data_items: updatedDataItems,
          amount_target: totalAmountTarget, // Update total_amount_target
        };
      });

      await useServiceAPI
        .post(paths.pathWorkPlanSaleSubDealer, {
          year_code: location?.state?.year_code,
          user_id: location?.state?.user_id,
          dealer_id: activeKey,
          action_code: mode,
          sub_dealer_items: updatedSubDealers, // รวมข้อมูลตั้งต้นของ crop
        })
        .then((response) => {
          if (response.status === 200) {
            if (mode == "draft") {
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              ).then(() => {
                // navigate("/sale-plan/work-plan-sale");
                getSubDealerList();
              });
            } else {
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              ).then(() => {
                navigate("/sale-plan/work-plan-sale");
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

  const totalAmountTarget = Object.values(localQtyState).reduce((sum, obj) => {
    return (
      sum +
      Object.values(obj).reduce(
        (nestedSum, item) => nestedSum + (item.totalAmountTarget || 0),
        0
      )
    );
  }, 0);

  const dealerAmountTarget =
    dealers.find((dealer) => dealer.dealer_id === activeKey)?.amount_target ||
    0;

  const percent =
    dealerAmountTarget > 0 ? (totalAmountTarget * 100) / dealerAmountTarget : 0;

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Sub Dealer By Dealer" showYear={yearName} />

        <Tabs
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
            <div>
              <div>Dealer Plan</div>
              <div className="">
                <InputNumber
                  disabled
                  suffix="THB"
                  className="w-full"
                  min={0}
                  value={dealerAmountTarget}
                  formatter={(value) =>
                    `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </div>
            </div>
            <div>
              <div>Work Plan</div>
              <div className="">
                <InputNumber
                  disabled
                  suffix="THB"
                  className="w-full"
                  min={0}
                  value={totalAmountTarget}
                  formatter={(value) =>
                    `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </div>
            </div>
            <div>
              <div>Percent %</div>
              <div className="">
                <InputNumber
                  disabled
                  // suffix="THB"
                  className=""
                  min={0}
                  value={percent}
                  formatter={(value) =>
                    `${parseInt(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  addonAfter="%"
                />
              </div>
            </div>
            <div className="self-end">
              <div className="text-red-500 font-bold">{message}</div>
            </div>
          </div>
        </BoxPrimary>

        <BoxPrimary>
          <div className="text-[#00783F] text-xl pb-5">Sub Dealer Plan</div>

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

                  {subDealers.map((item, index) => (
                    <Table.Summary.Cell key={index} colSpan={1}>
                      <InputNumber
                        className="w-full"
                        disabled
                        value={
                          localQtyState[activeKey]?.[item.sub_dealer_id]
                            ?.totalAmountTarget || 0
                        }
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
                  ))}
                  {subDealers.map((item, index) => (
                    <Table.Summary.Cell key={index} colSpan={1}>
                      <InputNumber
                        className="w-full"
                        disabled
                        value={
                          localQtyState[activeKey]?.[item.sub_dealer_id]
                            ?.totalAmountTarget || 0
                        }
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
              navigate("/sale-plan/work-plan-sale/sale-by-dealer-month", {
                state: {
                  year_code: location?.state?.year_code,
                  user_id: location?.state?.user_id,
                  workplan_header_id: data?.workplan_header_id,
                  workplan_area_header_id: data?.workplan_area_header_id,
                  workplan_sale_header_id: data?.workplan_sale_header_id,
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
