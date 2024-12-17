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

export default function ActivityPlanSubDealer() {
  const location = useLocation();

  useEffect(() => {
    console.log(location?.state);
  }, [location]);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [data, setData] = useState([]);
  const { showNotification, formatNumber } = useContext(AuthContext);

  const [activity, setActivity] = useState([]);
  const [name, setName] = useState([]);
  const [permission, setPermission] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [estimate, setEstimate] = useState(0);
  const [expense, setExpense] = useState(0);
  const [localQtyState, setLocalQtyState] = useState({});
  const [yearName, setYearName] = useState([]);
  const { confirm } = Modal;

  useEffect(() => {
    console.log(location?.state);

    useServiceAPI
      .get(
        paths.pathActivitySubDealerDetail,
        {
          year_code: location?.state?.year_code,
          user_id: location?.state?.user_id,
          workplan_header_id: location?.state?.workplan_header_id,
          workplan_area_header_id: location?.state?.workplan_area_header_id,
          workplan_sale_header_id: location?.state?.workplan_sale_header_id,
          dealer_id: location?.state?.dealer_id,
          sub_dealer_id: location?.state?.sub_dealer_id,
        },
        setLoading
      )
      .then((response) => {
        if (response.status === 200) {
          const newLocalState = response.data.sub_dealer_items.reduce(
            (acc, month) => {
              if (!acc[month.month_id]) acc[month.month_id] = {};

              month.data_items.forEach((item) => {
                const activity_id = item.activity_type_id;
                const qty = parseFloat(item.qty || 0);
                const value = parseFloat(item.value || 0);
                acc[month.month_id][activity_id] = { qty, value };
              });

              acc[month.month_id].amount_target = parseFloat(
                month.amount_target || 0
              );

              return acc;
            },
            {}
          );

          setLocalQtyState(newLocalState);

          const newData = response.data.data_items.map((item) => ({
            key: item.activity_type_id,
            activity_type_id: item.activity_type_id,
            activity_type_name: item.activity_type_name,
            unit_convert_value: item.unit_convert_value,
          }));

          console.log(newLocalState);

          setExpense(response.data.expense);
          setEstimate(response.data.estimate_expense);

          setData(response.data);
          setName(response.data.user_name);
          setYearName(response.data.year_name);
          setDataSource(newData);
          setActivity(response.data.sub_dealer_items);
          setTotalValue(response.data.amount_target);
          setPermission(response.data.permission);
        }
      })
      .catch((error) => {
        let message = error.response.data.data.Message;
        console.error(error);
        showNotification(
          "error",
          message.Message_Header,
          message.Message_Line,
          2
        );
      });
  }, [location]);

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
          title: "Activity Type", // Row 4
          dataIndex: "activity_type_name",
          key: "type",
          fixed: "left",
          width: 200,
          onHeaderCell: () => ({
            style: {
              backgroundColor: "#00783F", // สีเขียวเข้ม
              color: "white", // สีตัวอักษร
              fontWeight: "bold",
              textAlign: "center",
            },
          }),
        },
      ],
    },
    ...activity.map((month, index) => ({
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
          title: "Qty",
          dataIndex: `qty-${month.month_id}`,
          key: `qty-${month.month_id}`,
          // width: 150,

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
              record.activity_type_id
            ] || { qty: 0 };

            return (
              <InputNumber
                value={localData.qty}
                className="w-full"
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                disabled={!permission.edit}
                onChange={(value) =>
                  handleQtyChange(
                    month.month_id,
                    record.activity_type_id,
                    value,
                    record.unit_convert_value || 1
                  )
                }
              />
            );
          },
        },
      ],
    })),

    // Loop สำหรับ Value (THB)
    // ...activity.map((month, index) => ({
    //   title: month.month_name,
    //   key: `dealer-${month.month_id}-value`,
    //   onHeaderCell: () => ({
    //     style: {
    //       backgroundColor: index % 2 === 1 ? "#00783F" : "#009845", // สลับต่อจาก loop แรก
    //       color: "white",
    //       fontWeight: "bold",
    //       textAlign: "center",
    //     },
    //   }),
    //   children: [
    //     {
    //       title: "Value (THB)",
    //       dataIndex: `value-${month.month_id}`,
    //       key: `value-${month.month_id}`,
    //       width: 150,

    //       onHeaderCell: () => ({
    //         style: {
    //           backgroundColor: index % 2 === 1 ? "#00783F" : "#009845", // สลับต่อจาก loop แรก
    //           color: "white",
    //           fontWeight: "bold",
    //           textAlign: "center",
    //         },
    //       }),
    //       render: (_, record) => {
    //         const localData = localQtyState[month.month_id]?.[
    //           record.activity_type_id
    //         ] || { value: 0 };

    //         return (
    //           <InputNumber
    //             className="w-full"
    //             disabled
    //             value={localData.value}
    //             formatter={(value) =>
    //               `${Number(value)}`.replace(
    //                 /\B(?=(\d{3})+(?!\d))/g,
    //                 ","
    //               )
    //             }
    //           />
    //         );
    //       },
    //     },
    //   ],
    // })),
  ];

  const handleQtyChange = (month_id, activity_id, qty, unitConvertValue) => {
    setLocalQtyState((prevState) => {
      const value = qty * unitConvertValue;

      // อัปเดตข้อมูลของเดือนและ activity
      const updatedMonth = {
        ...prevState[month_id],
        [activity_id]: { qty, value },
      };

      // คำนวณค่า amount_target สำหรับเดือนนั้น
      updatedMonth.amount_target = Object.values(updatedMonth)
        .filter((item) => typeof item === "object")
        .reduce((sum, item) => sum + (item.value || 0), 0);

      // คืนค่า state ที่อัปเดต
      const newState = { ...prevState, [month_id]: updatedMonth };

      // คำนวณผลรวมของ amount_target และเซ็ตค่าใน Expense
      const totalAmountTarget = Object.values(newState).reduce((sum, month) => {
        return sum + (month.amount_target || 0);
      }, 0);

      setExpense(
        ((Number(totalAmountTarget) / Number(totalValue)) * 100).toFixed(2)
      );
      console.log(totalAmountTarget, totalValue);
      setEstimate(totalAmountTarget);

      return newState;
    });
  };

  const handleSave = async (mode) => {
    setLoading(true);
    try {
      const updatedActivity = activity.map((month) => {
        const dealerProducts = localQtyState[month.month_id] || {};

        // อัปเดต data_items โดยเช็คจาก activity_type_id
        const updatedDataItems = month.data_items.map((item) => {
          if (dealerProducts[item.activity_type_id]) {
            return {
              ...item,
              qty: dealerProducts[item.activity_type_id]?.qty || item.qty,
              value: dealerProducts[item.activity_type_id]?.value || item.value,
            };
          }
          return item; // ไม่เปลี่ยนแปลงหากไม่มีข้อมูลที่ตรงกัน
        });

        // อัปเดต amount_target โดยใช้ dealerProducts
        const updatedAmountTarget =
          dealerProducts.amount_target || month.amount_target;

        // คืนค่า month พร้อม data_items และ amount_target ที่อัปเดต
        return {
          ...month,
          amount_target: updatedAmountTarget, // แปลงเป็น string หากจำเป็น
          data_items: updatedDataItems,
        };
      });

      console.log(updatedActivity);

      if (mode == "draft") {
        createPlan(mode, updatedActivity);
      } else {
        console.log(expense);
        if (Number(expense) <= 3) {
          confirm({
            title: "Unable to save",
            icon: <ExclamationCircleFilled />,
            content: (
              <>
                <p>Estimate must be greater than 3 %</p>
                <p>Estimate: {expense}%</p>
                <p>
                  <b>
                    Do you want to{" "}
                    <span className="text-[#F89E18]">save draft</span> instead?
                  </b>
                </p>
              </>
            ),
            centered: true, // ตัวเลือกนี้ช่วยจัดให้อยู่กลาง
            onOk() {
              createPlan("draft", updatedActivity);
            },
          });
        } else {
          createPlan(mode, updatedActivity);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      showNotification("error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (mode, updatedActivity) => {
    console.log();

    await useServiceAPI
      .post(paths.pathActivitySubDealerDetail, {
        action_code: mode,
        year_code: location?.state?.year_code,
        user_id: location?.state?.user_id,
        workplan_header_id: location?.state?.workplan_header_id,
        workplan_area_header_id: location?.state?.workplan_area_header_id,
        workplan_sale_header_id: location?.state?.workplan_sale_header_id,
        dealer_id: location?.state?.dealer_id,
        sub_dealer_id: location?.state?.sub_dealer_id,
        sub_dealer_items: updatedActivity,
        estimate_expense: estimate,
        expense: expense,
      })
      .then((response) => {
        if (response.status === 200) {
          showNotification("success", response.data.message).then(() => {
            navigate("/activity/plan");
          });
        }
      })
      .catch((error) => {
        console.error(error);
        showNotification("error", "An error occurred");
      });
  };

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Create Activity By Sub Dealer" showYear={yearName} />

        <BoxPrimary>
          <div className="flex flex-wrap items-center w-screen gap-4">
            <div className="w-1/4">
              <div>Sale Target</div>
              <InputNumber
                disabled
                suffix="THB"
                className="w-full"
                min={0}
                value={totalValue}
                formatter={(value) =>
                  `${Number(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </div>
            <div className="w-1/4">
              <div>Estimate Expense</div>
              <InputNumber
                disabled
                className="w-full"
                value={estimate}
                formatter={(value) =>
                  `${Number(value)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
            </div>
            <div className="w-1/4">
              <div>Expense (%)</div>
              <InputNumber
                disabled
                className="w-full"
                value={expense}
                formatter={(value) => `${Number(value)}%`}
              />
            </div>
            <div className="w-1/4">
              <div>Dealer</div>
              <InputNumber
                disabled
                className="w-full"
                value={data.dealer_name}
              />
            </div>
            <div className="w-1/4">
              <div>Sub Dealer</div>
              <InputNumber
                disabled
                className="w-full"
                value={data.sub_dealer_name}
              />
            </div>
            <div className="w-1/4">
              <div>Key Crop</div>
              <InputNumber
                disabled
                className="w-full"
                value={data.key_crop_name}
              />
            </div>
          </div>
        </BoxPrimary>

        <BoxPrimary>
          <div className="text-[#00783F] text-xl pb-5">Monthly Sale Plan</div>

          <TableCustomComponent
            header={columns}
            dataSource={dataSource}
            pagination={false}
            // scroll={true}
            footer={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>Total (THB)</Table.Summary.Cell>
                  {activity.map((month) => {
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
                            `${Number(value)}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                          style={{ backgroundColor: "white" }}
                        />
                      </Table.Summary.Cell>
                    );
                  })}
                  {/* {activity.map((month) => {
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
                            `${Number(value)}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            )
                          }
                          style={{ backgroundColor: "white" }}
                        />
                      </Table.Summary.Cell>
                    );
                  })} */}
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
        </div>
      </MainLayout>
    </>
  );
}
