import React, { useContext, useEffect, useMemo, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { Input, InputNumber, Table } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import Title from "../../../components/title/Title";
import DynamicButton from "../../../components/button/DynamicButton";

export default function WorkPlanCreate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [permission, setPermission] = useState([]);
  const [yearName, setYearName] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const { showNotification } = useContext(AuthContext);
  const [mode, setMode] = useState(location?.state?.mode);

  useEffect(() => {
    useServiceAPI
      .get(
        paths.pathWorkPlanStep1,
        { year_code: location?.state?.year_code },
        setLoading
      )
      .then((response) => {
        if (response.status === 200) {
          const newData = response.data.data_items.map((item) => ({
            key: item.product_id,
            product_id: item.product_id,
            product_code: item.product_code,
            product_name: item.product_name,
            pack_size: item.pack_size,
            unit_convert_value: item.unit_convert_value,
            qty: item.qty || 0,
            value: parseFloat(item.value || 0).toFixed(2),
          }));
          setDataSource(newData);
          setYearName(response.data.year_name);
          setTotalValue(response.data.data_overall_target);
          setPermission(response.data.permission);
        }
      })
      .catch((error) => {
        if (error.status === 422) {
          showNotification("error", error.message);
        } else {
          showNotification("error", "เกิดข้อผิดพลาด");
        }
      });
  }, [location?.state?.year_code, showNotification]);

  const handleQtyChange = (value, key) => {
    console.log(value);
    // ค้นหารายการที่ต้องการเปลี่ยน
    const itemToUpdate = dataSource.find((item) => item.key === key);

    if (itemToUpdate) {
      // คำนวณ value ใหม่
      const newValue =
        parseFloat(value || 0) *
        parseFloat(itemToUpdate.unit_convert_value || 0);

      // อัปเดต item ที่เปลี่ยนแปลง
      const updatedItem = {
        ...itemToUpdate,
        qty: value || 0,
        value: parseFloat(newValue.toFixed(2)),
      };

      // อัปเดต dataSource
      const newDataSource = dataSource.map((item) =>
        item.key === key ? updatedItem : item
      );

      // คำนวณ total ใหม่
      const total = newDataSource.reduce(
        (acc, item) => acc + parseFloat(item.value || 0),
        0
      );

      // อัปเดต state
      setDataSource(newDataSource);
      setTotalValue(total.toFixed(2));
    }
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
          disabled={!permission.edit}
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
            `${Number(value).toFixed(2)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          disabled
        />
      ),
    },
  ];

  const handleSave = (mode) => {
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
        if (response.status === 200) {
          const successCallback = () => {
            if (mode === "draft") {
              navigate("/sale-plan/work-plan");
            } else if (mode === "save_and_next") {
              navigate("/sale-plan/work-plan/create-2", {
                state: { year_code: location?.state?.year_code, mode:location?.state?.mode },
              });
            }
          };
          showNotification(
            "success",
            response.data.message,
            response.data.message_line
          ).then(successCallback);
        }
      })
      .catch((error) => {
        if (error.status === 422) {
          showNotification("error", error.message);
        } else {
          showNotification("error", "เกิดข้อผิดพลาด");
        }
      });
  };

  return (
    <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Work Plan" showYear={yearName} />

     
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
                    formatter={(value) =>
                      `${Number(value).toFixed(2)}`.replace(
                        /\B(?=(\d{3})+(?!\d))/g,
                        ","
                      )
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
          onClick={() => navigate("/sale-plan/work-plan")}
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
            onClick={() => {
              navigate("/sale-plan/work-plan/create-2", {
                state: {
                  year_code: location.state.year_code,
                  mode: location.state.mode,
                },
              });
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
