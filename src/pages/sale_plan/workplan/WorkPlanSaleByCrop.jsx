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

export default function WorkPlanSaleByCrop() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const { showNotification, formatNumber } = useContext(AuthContext);

  const [crop, setCrop] = useState([]);
  const [permission, setPermission] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [localQtyState, setLocalQtyState] = useState({});
  const [yearName, setYearName] = useState([]);

  const columns = [
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "0",
      fixed: "left",
      width: 150,
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
          textAlign: "left",
        },
      }),
    },
    {
      title: "Pack Size",
      dataIndex: "pack_size",
      key: "1",
      width: 150,
      fixed: "left",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
          textAlign: "left",
        },
      }),
    },
    {
      title: "Qty (KG)",
      dataIndex: "qty",
      key: "2",
      width: 150,
      fixed: "left",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
          textAlign: "left",
        },
      }),
      render: (text, record) => (
        <InputNumber
          className="w-full"
          disabled
          min={0}
          value={text}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(value) => handleQtyChange(value, record.key)}
        />
      ),
    },
    {
      title: "Value (THB)",
      dataIndex: "value",
      key: "3",
      width: 150,
      fixed: "left",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
          textAlign: "left",
        },
      }),
      render: (text, record) => (
        <InputNumber
          disabled
          className="w-full"
          min={0}
          value={text}
          formatter={(value) =>
            `${Number(value).toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(value) => handleQtyChange(value, record.key)}
        />
      ),
    },

    ...crop.map((cropItem) => ({
      title: (
        <div className="flex flex-col gap-0 items-center">
          <span>{cropItem.crop_name}</span>
          <span>(%)</span>
        </div>
      ),
      dataIndex: cropItem.crop_id,
      key: `percentage_${cropItem.crop_id}`,
      width: 150,
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#009845",
          color: "white",
          fontWeight: "bold",
          textAlign: "left",
        },
      }),
      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          max={100}
          value={
            localQtyState[cropItem.crop_id]?.[record.product_id]?.percentage ||
            0
          }
          onChange={(value) =>
            handlePercentChange(value, cropItem.crop_id, record)
          }
          formatter={(value) =>
            `${Number(value)}%`
          }
          disabled={!permission.edit || cropItem.crop_id == 7}
        />
      ),
    })),
    ...crop.map((cropItem) => ({
      title: (
        <div className="flex flex-col gap-0 items-center">
          <span>{cropItem.crop_name}</span>
          <span>(Qty)</span>
        </div>
      ),
      dataIndex: cropItem.crop_id,
      key: `qty_${cropItem.crop_id}`,
      width: 150,

      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
          textAlign: "left",
        },
      }),
      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={localQtyState[cropItem.crop_id]?.[record.product_id]?.qty || 0}
          disabled
          formatter={(value) =>
            `${Number(value).toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      ),
    })),
    ...crop.map((cropItem) => ({
      title: (
        <div className="flex flex-col gap-0 items-center">
          <span>{cropItem.crop_name}</span>
          <span>(Value)</span>
        </div>
      ),
      dataIndex: cropItem.crop_id,
      key: `value_${cropItem.crop_id}`,
      width: 150,
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#009845",
          color: "white",
          fontWeight: "bold",
          textAlign: "left",
        },
      }),
      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={
            localQtyState[cropItem.crop_id]?.[record.product_id]?.value || 0
          }
          disabled
          formatter={(value) =>
            `${Number(value).toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      ),
    })),
  ];

  useEffect(() => {
    useServiceAPI
      .get(
        paths.pathWorkPlanSaleCrop,
        {
          year_code: location?.state?.year_code,
          user_id: location?.state?.user_id,
        },
        setLoading
      )
      .then((response) => {
        if (response.status === 200) {
          const newLocalState = response.data.crop_items.reduce((acc, crop) => {
            // Initialize crop_id object if it doesn't exist
            if (!acc[crop.crop_id]) {
              acc[crop.crop_id] = {};
            }

            // Process data_items
            crop.data_items.forEach((item) => {
              const productId = item.product_id;

              const percentage = parseFloat(item.percentage || 0);
              const qty = parseFloat(item.qty || 0);
              const value = parseFloat(item.value || 0);

              // Assign product data to the crop_id
              acc[crop.crop_id][productId] = {
                percentage,
                qty,
                value,
              };
            });

            // Assign amount_target to the crop_id
            acc[crop.crop_id].amount_target = parseFloat(
              crop.amount_target || 0
            );

            return acc;
          }, {});

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
          const newDataCrop = response.data.crop_items.map((item) => ({
            key: item.crop_id,
            crop_id: item.crop_id,
            crop_name: item.crop_name,
            amount_target: item.amount_target,
            workplan_area_header_id: item.workplan_area_header_id,
            workplan_header_id: item.workplan_header_id,
            workplan_sale_header_id: item.workplan_sale_header_id,
            data_items: item.data_items,
          }));

          setYearName(response.data.year_name);
          setDataSource(newData);
          setCrop(newDataCrop);
          setTotalValue(response.data.amount_target);
          setPermission(response.data.permission);
        }
      })
      .catch((error) => {
        console.error(error);
        showNotification("error", "เกิดข้อผิดพลาด");
      });
  }, []);

  const handlePercentChange = (value, cropId, record) => {
    const { product_id, qty: totalQty, unit_convert_value } = record;

    setLocalQtyState((prevState) => {
      // คำนวณ `qty` และ `value` สำหรับ cropId ที่เปลี่ยนแปลง
      const updatedQty = (value / 100) * totalQty;
      const updatedValue = updatedQty * (unit_convert_value || 1);

      // อัปเดตข้อมูล `cropId` ที่เปลี่ยนแปลงใน `localQtyState`
      const updatedCropProducts = {
        ...prevState[cropId],
        [product_id]: {
          percentage: value,
          qty: updatedQty,
          value: updatedValue,
        },
      };

      // คำนวณ `totalPercent` ของทุก `cropId` ยกเว้น `cropId = 7`
      const totalPercent = Object.keys(prevState).reduce(
        (sum, currentCropId) => {
          if (currentCropId === "7") return sum; // ไม่รวม `cropId = 7`
          const cropData =
            currentCropId === cropId
              ? updatedCropProducts[product_id] // ใช้ค่าที่อัปเดตใหม่
              : prevState[currentCropId]?.[product_id]; // ใช้ค่าจาก `prevState`
          return sum + (cropData?.percentage || 0);
        },
        0
      );

      // หาก `totalPercent` เกิน 100% ให้แจ้งเตือนและไม่อัปเดต state
      if (totalPercent > 100) {
        showNotification(
          "error",
          `Total percentage for Product ${product_id} across all crops (excluding CropId 7) cannot exceed 100%.`
        );
        return prevState;
      }

      // คำนวณ `remainingPercent`
      const remainingPercent = Math.max(100 - totalPercent, 0); // ไม่ให้ค่าเป็นลบ

      // อัปเดต `cropId = 7` สำหรับ `product_id`
      const updatedCrop7Products = {
        ...prevState["7"],
        [product_id]: {
          percentage: remainingPercent,
          qty: (remainingPercent / 100) * totalQty,
          value:
            (remainingPercent / 100) * totalQty * (unit_convert_value || 1),
        },
      };

      // คำนวณ `amount_target` ของ `cropId` ที่เปลี่ยนแปลง
      const amountTarget = Object.values(updatedCropProducts).reduce(
        (sum, product) => sum + (Number(product.value) || 0),
        0
      );

      // คำนวณ `amount_target` ของ `cropId = 7`
      const amountTargetCrop7 = Object.values(updatedCrop7Products).reduce(
        (sum, product) => sum + (Number(product.value) || 0),
        0
      );


      return {
        ...prevState,
        [cropId]: {
          ...updatedCropProducts,
          amount_target: amountTarget,
        },
        7: {
          ...updatedCrop7Products,
          amount_target: amountTargetCrop7,
        },
      };
    });
  };

  const handleSave = async (mode) => {
    setLoading(true); // เริ่มโหลดข้อมูล

    // อัพเดตข้อมูล quarter ด้วยข้อมูลใน localQtyState
    try {
      const updatedCropData = crop.map((cropItem) => {
        // ข้อมูลตั้งต้นของ cropItem
        const originalDataItems = cropItem.data_items;

        // อัปเดตข้อมูล `data_items` ด้วย `localQtyState`
        const updatedDataItems = originalDataItems.map((product) => {
          const localProductData =
            localQtyState[cropItem.crop_id]?.[product.product_id] || {};

          return {
            ...product, // ข้อมูลตั้งต้น
            percentage: localProductData.percentage || product.percentage || 0,
            qty: localProductData.qty || product.qty || 0,
            value: localProductData.value || product.value || 0,
          };
        });

        // คำนวณ `amount_target`
        const amountTarget = updatedDataItems.reduce(
          (sum, item) => sum + (Number(item.value) || 0),
          0
        );

        return {
          ...cropItem, // ข้อมูลตั้งต้น
          data_items: updatedDataItems,
          amount_target: amountTarget, // อัปเดต amount_target
        };
      });

      await useServiceAPI
        .post(paths.pathWorkPlanSaleCrop, {
          year_code: location?.state?.year_code,
          user_id: location?.state?.user_id,
          action_code: mode,
          crop_items: updatedCropData, // รวมข้อมูลตั้งต้นของ crop
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
                navigate("/sale-plan/work-plan-sale/sale-by-dealer", {
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
        <Title prefix="Create Plan" showYear={yearName} />

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
          <div className="text-[#00783F] text-xl pb-5">Crop List</div>

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
                      value={totalValue}
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
                  {crop.map((item, index) => (
                    <Table.Summary.Cell key={index} colSpan={1}>
                      <InputNumber
                        className="w-full"
                        disabled
                        value={localQtyState[item.crop_id]?.amount_target || 0}
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
                  {crop.map((item, index) => (
                    <Table.Summary.Cell key={index} colSpan={1}>
                      <InputNumber
                        className="w-full"
                        disabled
                        value={localQtyState[item.crop_id]?.amount_target || 0}
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
                  {crop.map((item, index) => (
                    <Table.Summary.Cell key={index} colSpan={1}>
                      <InputNumber
                        className="w-full"
                        disabled
                        value={localQtyState[item.crop_id]?.amount_target || 0}
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
            onClick={() => {
              navigate("/sale-plan/work-plan-sale/sale-create", {
                state: {
                  year_code: location?.state?.year_code,
                  user_id: location?.state?.user_id,
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
                navigate("/sale-plan/work-plan-sale/sale-by-dealer", {
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
