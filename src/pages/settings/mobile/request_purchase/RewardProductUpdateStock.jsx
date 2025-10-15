// src/pages/rewards/RewardProductUpdateStock.jsx
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
  
  console.log('state : ',state)

  const subTotal = useMemo(() => (row?.cost || 0) * (row?.qty || 0), [row]);
  const formatMoney = (n) =>
    (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // === quantity handlers (เหมือน SalesPointEdit) ===
  const dec = () =>
    setRow((r) => {
      const next = Math.max(0, (r?.qty || 0) - 1);
      return { ...r, qty: next };
    });

  const inc = () =>
    setRow((r) => {
      const next = (r?.qty || 0) + 1; // บวกต่อจากค่าปัจจุบัน
      return { ...r, qty: next };
    });

  const onChangeQty = (e) => {
    const raw = e?.target?.value ?? "";
    const digits = String(raw).replace(/[^\d]/g, ""); // รับเฉพาะตัวเลข
    const n = digits === "" ? 0 : Number(digits);
    setRow((r) => ({ ...r, qty: Math.max(0, n) }));
  };

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await useServiceAPI.get(`${paths.pathRequestPurchaseDetail}/${state?.id}`);
      if (res.status === 200) {
        const data = res.data || {};
        setRow({
          id: data.id, // id จาก detail
          reward_code: data.reward_code || "-",
          category_name: data.reward_category || "-",
          reward_name: data.reward_name || "-",
          cost: Number(data.reward_cost) || 0,
          qty: 1 // ค่าเริ่มต้นจาก list และจะบวกต่อจากค่านี้
        });
      }
    } catch (error) {
      console.error("Failed to fetch detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!row?.id) return;
    setLoading(true);
    try {
      const payload = { id: row.id, value: row.qty };
      const res = await useServiceAPI.post(paths.pathRequestPurchaseUpdateValue, payload);
      if (res.status === 200) navigate(-1);
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
    { title: "Reward Name", dataIndex: "reward_name", align: "left" },
    { title: "Category Name", dataIndex: "category_name", align: "left" },
    { title: "Cost (THB)", dataIndex: "cost", align: "right", width: 140 },
    { title: "QTY", dataIndex: "qty", align: "center", width: 300 },
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
          // ✅ ใช้ control เดียวกับ SalesPointEdit
          qty: (
            <div className="quantity-control flex justify-center items-center">
              <img
                src="/img/icons/collapse.png"
                className="w-6 h-6 cursor-pointer"
                onClick={dec}
                alt="decrease"
              />
              <input
                inputMode="numeric"
                min={0}
                value={row.qty}
                onChange={onChangeQty}
                className="border border-solid border-[#00783F] text-[#00783F] text-center mx-2 w-20 h-8 rounded"
              />
              <img
                src="/img/icons/expand.png"
                className="w-6 h-6 cursor-pointer"
                onClick={inc}
                alt="increase"
              />
            </div>
          ),
          sub_total: formatMoney(subTotal),
        },
      ]
    : [];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Purchase Update</div>

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
