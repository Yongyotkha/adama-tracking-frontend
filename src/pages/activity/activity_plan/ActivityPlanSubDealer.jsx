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

export default function ActivityPlanSubDealer() {
  const location = useLocation();

  useEffect(() => {
    console.log(location?.state);
  }, [location]);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const { showNotification, formatNumber } = useContext(AuthContext);

  const [months, setMonths] = useState([]);
  const [name, setName] = useState([]);
  const [permission, setPermission] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [localQtyState, setLocalQtyState] = useState({});
  const [yearName, setYearName] = useState([]);

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
                const productId = item.activity_type_id;
                const qty = parseFloat(item.qty || 0);
                const value = parseFloat(item.value || 0);
                acc[month.month_id][productId] = { qty, value };
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

          setName(response.data.user_name);
          setYearName(response.data.year_name);
          setDataSource(newData);
          setMonths(response.data.sub_dealer_items);
          setTotalValue(response.data.amount_target);
          setPermission(response.data.permission);
        }
      })
      .catch((error) => {
        console.error(error);
        showNotification("error", "An error occurred");
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
              record.activity_type_id
            ] || { value: 0 };

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

  const handleQtyChange = (month_id, productId, qty, unitConvertValue) => {
    setLocalQtyState((prevState) => {
      const value = qty * unitConvertValue;

      const updatedMonth = {
        ...prevState[month_id],
        [productId]: { qty, value },
      };

      updatedMonth.amount_target = Object.values(updatedMonth)
        .filter((item) => typeof item === "object")
        .reduce((sum, item) => sum + (item.value || 0), 0);

      return { ...prevState, [month_id]: updatedMonth };
    });
  };

  const handleSave = async (mode) => {
    setLoading(true);

    try {
      const mappedMonth = months.map((month) => {
        const dealerProducts = localQtyState[month.month_id] || {};
        const updatedDataItems = Object.keys(dealerProducts)
          .filter((key) => key !== "amount_target")
          .map((productId) => ({
            product_id: productId,
            qty: dealerProducts[productId]?.qty || 0,
            value: dealerProducts[productId]?.value || 0,
          }));

        return {
          ...month,
          amount_target: dealerProducts.amount_target || month.amount_target,
          data_items: updatedDataItems,
        };
      });

      console.log(mappedMonth);

      // await useServiceAPI
      //   .put(paths.pathRollingForecastMonth, {
      //     action_code: mode,
      //     year_code: location?.state?.year_code,
      //     user_id: location?.state?.user_id,
      //     workplan_header_id: location?.state?.workplan_header_id,
      //     workplan_area_header_id: location?.state?.workplan_area_header_id,
      //     workplan_sale_header_id: location?.state?.workplan_sale_header_id,
      //     month_items: mappedMonth,
      //   })
      //   .then((response) => {
      //     if (response.status === 200) {
      //       showNotification("success", response.data.message).then(() => {
      //         navigate("/sale-plan/rolling-forecast-sale");
      //       });
      //     }
      //   })
      //   .catch((error) => {
      //     console.error(error);
      //     showNotification("error", "An error occurred");
      //   });
    } catch (error) {
      console.error("Unexpected error:", error);
      showNotification("error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Create Activity By Sub Dealer" showYear={yearName} />

        <BoxPrimary>
          <div className="flex flex-wrap items-center w-screen gap-4">
            <div className="w-1/4">
              <div>Work Plan</div>
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
            <div className="w-1/4">
              <div>Sale Territory</div>
              <InputNumber disabled className="w-full" value={name} />
            </div>
            <div className="w-1/4">
              <div>Expense (%)</div>
              <InputNumber disabled className="w-full" value={name} />
            </div>
            <div className="w-1/4">
              <div>Dealer</div>
              <InputNumber disabled className="w-full" value={name} />
            </div>
            <div className="w-1/4">
              <div>Sub Dealer</div>
              <InputNumber disabled className="w-full" value={name} />
            </div>
            <div className="w-1/4">
              <div>Key Crop</div>
              <InputNumber disabled className="w-full" value={name} />
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
            footer={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>Total (THB)</Table.Summary.Cell>
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
                            `${Number(value).toFixed(2)}`.replace(
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
                            `${Number(value).toFixed(2)}`.replace(
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
