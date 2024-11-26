import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import DynamicButton from "../../../components/button/DynamicButton";
import { Input, InputNumber, Table } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

export default function WorkPlanCreate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [permission, setPermission] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const { showMsg, showNotification } = useContext(AuthContext);

  useEffect(() => {
    const total = dataSource.reduce(
      (acc, item) => acc + parseFloat(item.value),
      0
    );
    setTotalValue(total);
  }, []);
  useEffect(() => {
    console.log(permission);
  }, [permission]);

  const handleQtyChange = (value, key) => {
    let total = 0; // Initialize as a number
    const newData = dataSource.map((item) => {
      if (item.key === key) {
        const newValue =
          parseFloat(value) * parseFloat(item.unit_convert_value);
        total += parseFloat(newValue); // Add the updated value to total
        return { ...item, qty: value, value: parseFloat(newValue.toFixed(2)) };
      }
      total += parseFloat(item.value);
      return item;
    });
    setTotalValue(total.toFixed(2));
    setDataSource(newData);
  };

  const header = [
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "productName",
    },
    {
      title: "Pack Size",
      dataIndex: "pack_size",
      key: "packSize",
    },
    {
      title: "Qty (KG)",
      dataIndex: "qty",
      key: "qty",

      render: (text, record) => (
        <InputNumber
          className="w-full"
          min={0}
          value={text}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(value) => handleQtyChange(value, record.key)}
          disabled={permission.view}
        />
      ),
    },
    {
      title: "Value (THB)",
      dataIndex: "value",
      key: "value",
      render: (text) => (
        <InputNumber
          className="w-full"
          value={text}
          formatter={(value) =>
            `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          disabled
        />
      ),
    },
  ];

  useEffect(() => {
    useServiceAPI
      .get(
        paths.pathWorkPlanStep1,
        { year_code: location?.state?.year_code },
        setLoading
      )
      .then((response) => {
        if (response.status == 200) {
          console.log(response.data.data_items);
          const newData = response.data.data_items.map((item) => ({
            key: item.product_id,
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            pack_size: item.pack_size,
            unit_convert_value: item.unit_convert_value,
            qty: item.qty,
            value: item.value,
          }));
          setDataSource(newData);
          setTotalValue(response.data.data_overall_target);
          setPermission(response.data.permission);
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.status == 422) {
          showNotification("error", error.message);
        } else {
          showNotification("error", "เกิดข้อผิดพลาด");
        }
      });
  }, []);

  const handleSave = (mode) => {
    console.log(dataSource, totalValue, mode);

    useServiceAPI
      .post(
        paths.pathWorkPlanStep1,
        {
          year_code: location?.state?.year_code,
          action_code: mode,
          data_overall_target: totalValue,
          data_items: dataSource,
        },
        setLoading
      )
      .then((response) => {
        if (response.status == 200) {
          console.log(response.data);

          if (mode == "draft") {
            showNotification(
              "success",
              response.data.message,
              response.data.message_line
            ).then(() => {
              navigate("/sale-plan/work-plan");
            });
          } else if (mode == "save_and_next") {
            showNotification(
              "success",
              response.data.message,
              response.data.message_line
            ).then(() => {
              navigate("/sale-plan/work-plan/create-2", {
                state: {
                  year_code: location?.state?.year_code,
                },
              });
            });
          }
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.status == 422) {
          showNotification("error", error.message);
        } else {
          showNotification("error", "เกิดข้อผิดพลาด");
        }
      });
  };

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <div className="title-page">Create Work Plan</div>
        <BoxPrimary>
          <div className="text-[#00783F] text-xl pb-5">Work Plan</div>
          <TableComponent
            header={header}
            dataSource={dataSource}
            pagination={false}
            footer={() => (
              <Table.Summary fixed>
                <Table.Summary.Row className="bg-[#978B87]">
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <span className="text-white">Total (THB)</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <InputNumber
                      className="w-full"
                      disabled
                      value={totalValue}
                      min={0}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      style={{ backgroundColor: "white" }}
                    />
                  </Table.Summary.Cell>
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
              navigate("/sale-plan/work-plan");
            }}
          />
          {permission.btn_draft && (
            <ActionButton
              text="Save Draft"
              mode="saveDraft"
              onClick={() => handleSave("draft")}
            />
          )}
          {permission.btn_draft && (
            <ActionButton
              text="Save and Next"
              mode="save"
              className="bg-[#00783F] min-w-[96px] text-[#ffff] rounded-sm p-2"
              onClick={() => handleSave("save_and_next")}
            />
          )}

          {permission.btn_next && (
            <ActionButton
              text="Next"
              mode="save"
              className="bg-[#00783F] min-w-[96px] text-[#ffff] rounded-sm p-2"
              onClick={() =>
                navigate("/sale-plan/work-plan/create-2", {
                  state: {
                    year_code: location?.state?.year_code,
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
