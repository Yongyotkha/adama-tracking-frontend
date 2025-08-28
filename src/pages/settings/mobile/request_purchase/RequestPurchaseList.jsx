import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import { Dropdown } from "antd";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import { useNavigate } from "react-router-dom";
// ใช้ ItemDropDown ได้ หรือจะทำ label เองก็ได้
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";

export default function RequestPurchaseList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    filters: {},
  });

  // ✅ Mock ตามดีไซน์
  const MOCK_ROWS = [
    {
      id: 1,
      reward_code: "RW00000001",
      reward_name: "พัดลม (14 นิ้ว)",
      stock: 1,
      input_qty: 1,
      update_date: "2025-05-26",
      status_name: "Waiting for update",
      status_bg_color: "#F59E0B",
      status_color: "#ffffff",
    },
  ];

  // โหลด mock เป็น dataSource (พร้อมเปลี่ยนเป็น API ทีหลัง)
  useEffect(() => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;

    const mapped = MOCK_ROWS.map((item, idx) => ({
      key: idx + 1 + (current - 1) * pageSize,
      reward_code: item.reward_code,
      reward_name: item.reward_name,
      stock: item.stock,
      input_qty: item.input_qty,
      update_date: item.update_date,
      status: (
        <BadgeStatus
          text={item.status_name}
          bgColor={item.status_bg_color}
          textColor={item.status_color}
        />
      ),
      action: (
        <Dropdown
          menu={{
            items: [
              {
                key: "update",
                // ถ้า ItemDropDown ของคุณรองรับ custom label ให้ใช้ text="Update"
                // ไม่รองรับก็แสดงเองด้วย <div> ได้
                label: (
                  <ItemDropDown
                    mode="edit"
                    text="Update"
                    onClick={() =>
                      navigate("/setting/line/request-purchase/update-stock", {
                        state: { id: item.id },
                      })
                    }
                  />
                ),
              },
            ],
          }}
          placement="bottomRight"
        >
          <a onClick={(e) => e.preventDefault()}>
            <img
              src="/img/icons/action.png"
              alt="action"
              className="inline-block w-5 h-5"
            />
          </a>
        </Dropdown>
      ),
    }));

    setDataSource(mapped);
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, total: mapped.length },
    }));
    setTableLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter (ดีไซน์มีแถบ Filter เฉย ๆ ไม่บังคับ field)
  const filters = [];

  const header = [
    { title: "Reward Code", dataIndex: "reward_code", align: "left" },
    { title: "Reward Name", dataIndex: "reward_name", align: "left" },
    { title: "Stock (Pcs)", dataIndex: "stock", align: "center", width: 120 },
    { title: "Input QTY (Pcs)", dataIndex: "input_qty", align: "center", width: 150 },
    { title: "Update Date", dataIndex: "update_date", align: "center", width: 160 },
    { title: "Status", dataIndex: "status", align: "center", width: 180 },
    { title: "Action", dataIndex: "action", align: "center", width: 90 },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Request Purchase</div>

      <Filter filters={filters} />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
