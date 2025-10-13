import React, { useMemo, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../../components/table/TableComponent";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";

// ✅ mock รายการเดียวตามดีไซน์
const MOCK_ITEM = {
  id: 1,
  reward_code: "3027200113",
  category_name: "อิเล็กทรอนิกส์",
  reward_name: "พัดลม (14 นิ้ว)",
  cost: 790,
  qty: 100, // ค่าเริ่มต้นในภาพ
};

export default function RequestPurchaseDetail() {
  const navigate = useNavigate();
  const [row, setRow] = useState(MOCK_ITEM);
  const [loading, setLoading] = useState(false);

  const subTotal = useMemo(() => (row.cost || 0) * (row.qty || 0), [row]);
  const formatMoney = (n) =>
    (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const dec = () => setRow((r) => ({ ...r, qty: Math.max(0, (r.qty || 0) - 1) }));
  const inc = () => setRow((r) => ({ ...r, qty: (r.qty || 0) + 1 }));
  const onChangeQty = (e) => {
    const v = e?.target?.value?.replace(/[^\d]/g, "");
    setRow((r) => ({ ...r, qty: v === "" ? 0 : Number(v) }));
  };

  const header = [
    { title: "Reward Code", dataIndex: "reward_code", align: "left" },
    { title: "Category Name", dataIndex: "category_name", align: "left" },
    { title: "Reward Name", dataIndex: "reward_name", align: "left" },
    { title: "Cost (THB)", dataIndex: "cost", align: "right", width: 140 },
    { title: "QTY", dataIndex: "qty", align: "center", width: 180 },
    { title: "Sub Total (THB)", dataIndex: "sub_total", align: "right", width: 180 },
  ];

  const dataSource = [
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
  ];

  const handleUpdate = async () => {
    // TODO: call API update stock เช่น:
    // await useServiceAPI.post(paths.pathRequestPurchaseUpdate, { id: row.id, qty: row.qty })
    console.log("Update payload:", { id: row.id, qty: row.qty });
    navigate(-1);
  };

  return (
    <MainLayout  loading={loading}>
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
