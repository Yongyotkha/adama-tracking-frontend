import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../../components/table/TableComponent";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate, useLocation } from "react-router-dom";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";

export default function RewardProductUpdateStock() {
  const navigate = useNavigate();
  const { state } = useLocation(); // Expecting { id: <id>, value: <initial value> }
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);

  const subTotal = useMemo(() => (row?.cost || 0) * (row?.qty || 0), [row]);
  const formatMoney = (n) =>
    (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const dec = () => setRow((r) => ({ ...r, qty: Math.max(0, (r.qty || 0) - 1) }));
  const inc = () => setRow((r) => ({ ...r, qty: (r.qty || 0) + 1 }));
  const onChangeQty = (e) => {
    const v = e?.target?.value?.replace(/[^\d]/g, "");
    setRow((r) => ({ ...r, qty: v === "" ? 0 : Number(v) }));
  };

  const fetchDetail = async () => {
    setLoading(true);
    try {
      // console.log("Fetching detail for ID:", state?.id);
      const res = await useServiceAPI.get(`${paths.pathRequestPurchaseDetail}/${state?.id}`);
      // console.log("API Response:", res);
      if (res.status === 200) {
        const data = res.data|| {};
        console.log("ID Data:", data.id);
        setRow({
          id: data.id, // Using data.id from pathRequestPurchaseDetail
          reward_code: data.reward_code || "-",
          category_name: data.reward_category || "-",
          reward_name: data.reward_name || "-",
          cost: Number(data.reward_cost) || 0,
          qty: state?.value || 0, // Use initial value passed from the list
        });
      }
    } catch (error) {
      console.error("Failed to fetch detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    // console.log("Payload before update:", { id: row?.id, value: row?.qty });
    setLoading(true);
    try {
      const payload = { id: row.id, value: row.qty };
      const res = await useServiceAPI.post(paths.pathRequestPurchaseUpdateValue, payload);
      if (res.status === 200) {
        console.log("Update successful:", res.data);
        navigate(-1); // Navigate back to the list
      }
    } catch (error) {
      console.error("Failed to update stock:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const header = [
    { title: "Reward Code", dataIndex: "reward_code", align: "left" },
    { title: "Category Name", dataIndex: "category_name", align: "left" },
    { title: "Reward Name", dataIndex: "reward_name", align: "left" },
    { title: "Cost (THB)", dataIndex: "cost", align: "right", width: 140 },
    { title: "QTY (ctn)", dataIndex: "qty", align: "center", width: 180 },
    { title: "Sub Total (THB)", dataIndex: "sub_total", align: "right", width: 180 },
  ];

  const dataSource = row
    ? [
      {
        key: 1,
        reward_code: row.reward_code,
        category_name: row.category_name,
        reward_name: row.reward_name,
        cost: formatMoney(row.cost),
        qty: (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={dec}
              className="w-8 h-8 rounded-full border flex items-center justify-center"
              aria-label="decrease"
            >
              –
            </button>
            <input
              className="w-20 text-center border rounded-md h-8"
              value={row.qty}
              onChange={onChangeQty}
            />
            <button
              type="button"
              onClick={inc}
              className="w-8 h-8 rounded-full border flex items-center justify-center"
              aria-label="increase"
            >
              +
            </button>
          </div>
        ),
        sub_total: formatMoney(subTotal),
      },
    ]
    : [];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Update Stock</div>

      <BoxPrimary>
        <TableComponent header={header} dataSource={dataSource} pagination={false} />
      </BoxPrimary>

      <div className="flex justify-end gap-3 mt-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        <ActionButton mode="save" text="Update" onClick={handleUpdate} />
      </div>
    </MainLayout>
  );
}