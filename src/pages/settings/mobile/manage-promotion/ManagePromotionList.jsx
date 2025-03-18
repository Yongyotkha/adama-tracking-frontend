import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import { Dropdown } from "antd";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";

export default function ManagePromotionList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  // 🔹 Mock Data
  const mockData = [
    {
      id: 1,
      promotion_code: "202500001",
      promotion_name: "Promotion Name 1",
      period: "01/01/2025 - 01/03/2025",
      type: "Double Point",
      target: "Crop",
      apply_to: "Select Product",
      point: 10,
      status: "Active",
      status_bg_color: "green",
      status_color: "white",
    },
    {
      id: 2,
      promotion_code: "202500002",
      promotion_name: "Promotion Name 2",
      period: "01/01/2025 - 01/03/2025",
      type: "Extra Point",
      target: "Dealer",
      apply_to: "All Product",
      point: 10,
      status: "Active",
      status_bg_color: "green",
      status_color: "white",
    },
  ];

  useEffect(() => {
    setTableLoading(true);
    
    // ตั้งค่าข้อมูลจาก mockData ลง dataSource
    setTimeout(() => {
      const formattedData = mockData.map((promo, index) => ({
        key: index + 1,
        action: (
          <Dropdown
            menu={{
              items: [
                { key: "edit", label: <ItemDropDown mode="edit" onClick={() => navigate(`edit/${promo.id}`)} /> },
                { key: "view", label: <ItemDropDown mode="view" onClick={() => navigate(`view/${promo.id}`)} /> },
              ],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="action" className="inline-block w-5 h-5" />
            </a>
          </Dropdown>
        ),
        promotion_code: promo.promotion_code,
        promotion_name: promo.promotion_name,
        period: promo.period,
        type: promo.type,
        target: promo.target,
        apply_to: promo.apply_to,
        point: promo.point,
        status: <BadgeStatus text={promo.status} bgColor={promo.status_bg_color} textColor={promo.status_color} />,
      }));

      setDataSource(formattedData);
      setTableLoading(false);
    }, 500); // Simulate API delay
  }, []);

  const handleTableChange = (pagination) => {
    setTableParams({ pagination });
  };

  const filters = [
    { key: "promotion_code", type: "text", label: "Promotion Code" },
    { key: "product_name", type: "text", label: "Product Name" },
    { key: "period", type: "date", label: "Period" },
  ];

  const header = [
    { title: "No", dataIndex: "key", align: "left" },
    { title: "Promotion Code", dataIndex: "promotion_code", align: "left" },
    { title: "Promotion Name", dataIndex: "promotion_name", align: "left" },
    { title: "Period", dataIndex: "period", align: "left" },
    { title: "Type", dataIndex: "type", align: "left" },
    { title: "Target", dataIndex: "target", align: "left" },
    { title: "Apply To", dataIndex: "apply_to", align: "left" },
    { title: "Point", dataIndex: "point", align: "left" },
    { title: "Status", dataIndex: "status", align: "left" },
    { title: "Action", dataIndex: "action", align: "left" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Promotion List</div>
        <ActionButton mode="create" text="Create" onClick={() => navigate("create")} />
      </div>
      <Filter filters={filters} />
      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
          onChange={handleTableChange}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
