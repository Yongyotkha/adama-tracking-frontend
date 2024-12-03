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

export default function WorkPlanAreaCreate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [sale, setSale] = useState([]);
  const [permission, setPermission] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const { showNotification, formatNumber } = useContext(AuthContext);
  const [yearName, setYearName] = useState([]);
  const [localQtyState, setLocalQtyState] = useState({});
  const { confirm } = Modal;

  const handleQtyChange = (saleId, productId, newQty, unitConvertValue) => {
    setLocalQtyState((prevState) => {
      // คำนวณ value ใหม่ตาม qty และ unitConvertValue
      const newValue = (newQty * unitConvertValue).toFixed(2);

      // อัพเดตสถานะใน localQtyState
      const updatedQtyState = {
        ...prevState,
        [saleId]: {
          ...prevState[saleId],
          [productId]: {
            qty: newQty,
            value: newValue,
          },
        },
      };

      // คำนวณยอดรวมในระดับ saleId (amount_target)
      const updatedAmountTarget = Object.values(updatedQtyState[saleId]).reduce(
        (sum, { value }) => sum + parseFloat(value || 0),
        0
      );

      return {
        ...updatedQtyState,
        [`amount_target_${saleId}`]: updatedAmountTarget.toFixed(2),
      };
    });

    // console.log(localQtyState);
  };

  useEffect(() => {
    useServiceAPI
      .get(
        paths.pathWorkPlanAreaStep1,
        {
          year_code: location?.state?.year_code,
          sale_area_id: location?.state?.sale_area_id,
        },
        setLoading
      )
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
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
          const newDataSale = response.data.sale_items.map((item) => ({
            key: item.user_id,
            user_id: item.user_id,
            territory_id: item.territory_id,
            territory_name: item.territory_name,
            user_name: item.user_name,
            workplan_area_header_id: item.workplan_area_header_id,
            workplan_header_id: item.workplan_header_id,
            amount_target: item.amount_target,
            data_items: item.data_items,
          }));

          const initialQtyState = newDataSale.reduce((acc, saleItem) => {
            // Initialize saleId object with amount_target if available
            acc[saleItem.user_id] = saleItem.data_items.reduce(
              (itemAcc, item) => {
                itemAcc[item.product_id] = {
                  qty: parseFloat(item.qty || 0),
                  value: parseFloat(item.value || 0),
                };
                return itemAcc;
              },
              {}
            );

            // Add `amount_target` at the saleId level
            acc[`amount_target_${saleItem.user_id}`] = parseFloat(
              saleItem.amount_target || 0
            );

            return acc;
          }, {});

          setYearName(response.data.year_name);
          setLocalQtyState(initialQtyState);
          setDataSource(newData);
          setSale(newDataSale);
          setTotalValue(response.data.amount_target);
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
      title: "Sale By Territory",
      children: [
        {
          title: "Territory",
          key: "firstChilden",
          children: [
            {
              title: "Sale Plan (THB)",
              key: "secondChilden",
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
                  width: 150,
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
                    />
                  ),
                },
                {
                  title: "Value (THB)",
                  dataIndex: "value",
                  key: "value_thb",
                  width: 150,
                  fixed: "left",
                  render: (text, record) => (
                    <InputNumber
                      disabled
                      className="w-full"
                      min={0}
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
          ],
        },
      ],
    },

    ...sale.map((item, index) => ({
      title: item.user_name,
      children: [
        {
          title: item.territory_name,
          key: "firstChilden",
          children: [
            {
              title: (
                <InputNumber
                  className="w-full"
                  disabled
                  min={0}
                  value={
                    localQtyState[`amount_target_${item.user_id}`] ||
                    item.amount_target
                  }
                  formatter={(value) =>
                    `${Number(value).toFixed(2)}`.replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )
                  }
                />
              ),
              key: "secondChilden",
              children: [
                {
                  title: "Qty (KG)",
                  dataIndex: `qty_${item.user_id}`,
                  key: `qty_${item.user_id}`,
                  width: 150,
                  render: (_, record) => {
                    const localData = localQtyState[item.user_id]?.[
                      record.product_id
                    ] || { qty: 0, value: 0 };

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
                            item.user_id,
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
                {
                  title: "Value (THB)",
                  dataIndex: `value_${item.user_id}`,
                  key: `value_${item.user_id}`,
                  width: 150,
                  render: (_, record) => {
                    const localData = localQtyState[item.user_id]?.[
                      record.product_id
                    ] || { qty: 0, value: 0 };

                    return (
                      <InputNumber
                        disabled
                        className="w-full"
                        value={parseFloat(localData.value).toFixed(2)}
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
            },
          ],
        },
      ],
    })),
  ];

  const columns = applyTopLevelAndSpecificChildrenStyles(baseColumns);

  const handleSave = (mode) => {
    const calculatedTotalAmountTarget = Object.keys(localQtyState).reduce(
      (grandTotal, saleId) => {
        const saleTotal = Object.values(localQtyState[saleId]).reduce(
          (saleSum, { value }) => saleSum + parseFloat(value || 0),
          0
        );
        return grandTotal + saleTotal;
      },
      0
    );

    // เปรียบเทียบกับ totalValue
    if (Number(calculatedTotalAmountTarget) < Number(totalValue)) {
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

  const createPlan = (mode) => {
    const updatedSale = sale.map((item) => {
      const updatedItems = item.data_items.map((dataItem) => {
        const localData = localQtyState[item.user_id]?.[
          dataItem.product_id
        ] || {
          qty: dataItem.qty,
          value: dataItem.value,
        };

        return {
          ...dataItem,
          qty: localData.qty,
          value: localData.value,
        };
      });

      return {
        ...item,
        data_items: updatedItems,
        amount_target:
          localQtyState[`amount_target_${item.user_id}`] || item.amount_target,
      };
    });

    useServiceAPI
      .post(
        paths.pathWorkPlanAreaStep1,
        {
          year_code: location?.state?.year_code,
          sale_area_id: location?.state?.sale_area_id,
          action_code: mode,
          data_users: updatedSale,
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
            navigate("/sale-plan/work-plan-area");
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

    console.log("Updated Sale Data:", updatedSale);
  };

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Create Plan" showYear={yearName} />

        <BoxPrimary>
          <div className="flex flex-col gap-2">
            <div>Yearly Target</div>
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
          <div className="text-[#00783F] text-xl pb-5">Sale By Territory</div>

          <TableCustomComponent
            header={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={true}
            footer={() => (
              // วนลูปตาม array ที่ส่งชื่อ sale มา
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-[#978B87]">
                  <Table.Summary.Cell index={0} colSpan={4}>
                    Total (THB)
                  </Table.Summary.Cell>
                  {sale.map((item, index) => (
                    <Table.Summary.Cell colSpan={2} key={index}>
                      <InputNumber
                        className="w-full"
                        disabled
                        min={0}
                        value={
                          localQtyState[`amount_target_${item.user_id}`] ||
                          item.amount_target
                        }
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
              navigate("/sale-plan/work-plan-area");
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
