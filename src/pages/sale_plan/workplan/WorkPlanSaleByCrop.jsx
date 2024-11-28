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
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
      key: `percent_${cropItem.crop_id}`,
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#009845",
          color: "white",
          fontWeight: "bold",
          textAlign: "left",
          width: 150,
        },
      }),
      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          max={100}
          value={
            localQtyState[cropItem.crop_id]?.[record.product_id]?.percent || 0
          }
          onChange={(value) =>
            handlePercentChange(value, cropItem.crop_id, record)
          }
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
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#00783F",
          color: "white",
          fontWeight: "bold",
          width: 150,
          textAlign: "left",
        },
      }),
      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={localQtyState[cropItem.crop_id]?.[record.product_id]?.qty || 0}
          disabled
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
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#009845",
          color: "white",
          width: 150,
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
            crop.data_items.forEach((item) => {
              const productId = item.product_id;
              if (!acc[crop.crop_id]) {
                acc[crop.crop_id] = {};
              }
              acc[crop.crop_id][productId] = {
                percent: parseFloat(item.percent || 0),
                qty: parseFloat(item.qty || 0),
                value: parseFloat(item.value || 0),
              };
            });
            return acc;
          }, {});

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
      // คำนวณ `qty` และ `value`
      const updatedQty = (value / 100) * totalQty;
      const updatedValue = updatedQty * (unit_convert_value || 1);

      // อัปเดต `cropId` ใน `localQtyState`
      const updatedCropProducts = {
        ...prevState[cropId],
        [product_id]: {
          percent: value,
          qty: updatedQty,
          value: updatedValue,
        },
      };

      console.log(prevState[cropId][product_id]);

      // คำนวณ `amount_target` ของ `cropId`
      const amountTarget = Object.values(updatedCropProducts).reduce(
        (sum, product) => sum + (product.value || 0),
        0
      );

      return {
        ...prevState,
        [cropId]: {
          ...updatedCropProducts,
          amount_target: amountTarget,
        },
      };
    });

    // console.log(localQtyState);
  };

  const handleSave = (mode) => {
    const updatedCropData = crop.map((cropItem) => {
      // ข้อมูลตั้งต้นของ cropItem
      const originalDataItems = cropItem.data_items;

      // อัปเดตข้อมูล `data_items` ด้วย `localQtyState`
      const updatedDataItems = originalDataItems.map((product) => {
        const localProductData =
          localQtyState[cropItem.crop_id]?.[product.product_id] || {};

        return {
          ...product, // ข้อมูลตั้งต้น
          percent: localProductData.percent || product.percent || 0,
          qty: localProductData.qty || product.qty || 0,
          value: localProductData.value || product.value || 0,
        };
      });

      // คำนวณ `amount_target`
      const amountTarget = updatedDataItems.reduce(
        (sum, item) => sum + (item.value || 0),
        0
      );

      return {
        ...cropItem, // ข้อมูลตั้งต้น
        data_items: updatedDataItems,
        amount_target: amountTarget, // อัปเดต amount_target
      };
    });

    console.log(updatedCropData);

    // สร้าง payload
    // const payload = {
    //   year_code: location?.state?.year_code,
    //   user_id: location?.state?.user_id,
    //   action_code: mode,
    //   crop_items: updatedCropData, // รวมข้อมูลตั้งต้นของ crop
    // };

    // setLoading(true);

    // // เรียก API เพื่อบันทึกข้อมูล
    // useServiceAPI
    //   .post(paths.pathWorkPlanSaveCrop, payload, setLoading)
    //   .then((response) => {
    //     if (response.status === 200) {
    //       showNotification(
    //         "success",
    //         response.data.message,
    //         response.data.message_line
    //       ).then(() => {
    //         if (mode === "save") {
    //           navigate("/sale-plan/work-plan/sale-by-dealer", {
    //             state: {
    //               year_code: location?.state?.year_code,
    //               user_id: location?.state?.user_id,
    //             },
    //           });
    //         }
    //       });
    //     }
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     showNotification("error", "เกิดข้อผิดพลาด");
    //   })
    //   .finally(() => {
    //     setLoading(false);
    //   });
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
                  {crop?.map((_, index) => (
                    <Table.Summary.Cell
                      key={index}
                      colSpan={1}
                    ></Table.Summary.Cell>
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
              navigate("/sale-plan/work-plan/sale-create");
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
                navigate("/sale-plan/work-plan/sale-by-dealer", {
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
