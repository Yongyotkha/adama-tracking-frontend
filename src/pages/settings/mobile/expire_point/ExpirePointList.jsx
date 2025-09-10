import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";

export default function ExpirePointList() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  // 🔹 Mock Data for Expire Points
  const mockData = [
    {
      id: 1,
      shop_name: "กัลยาการเกษตร",
      contact_name: "Firstname Lastname",
      phone_no: "055-769042",
      customer_type: "Dealer",
      point: 20,
      expire_date: "01/12/2025",
    },
    {
      id: 2,
      shop_name: "กำนันบงลักษณ์",
      contact_name: "Firstname Lastname",
      phone_no: "081-8879155",
      customer_type: "Sub Dealer",
      point: 20,
      expire_date: "01/12/2025",
    },
  ];

  useEffect(() => {
    setTableLoading(true);

    setTimeout(() => {
      const formattedData = mockData.map((data, index) => ({
        key: index + 1,
        shop_name: data.shop_name,
        contact_name: data.contact_name,
        phone_no: data.phone_no,
        customer_type: data.customer_type,
        point: data.point,
        expire_date: data.expire_date,
      }));

      setDataSource(formattedData);
      setTableLoading(false);
    }, 500); // Simulating API delay
  }, []);

  const handleTableChange = (pagination) => {
    setTableParams({ pagination });
  };

  // 🔹 Filters Configuration
  const filters = [
    { key: "shop_name", type: "text", label: "Customer Name" },
    { key: "contact_name", type: "text", label: "Contact Name" },
    { key: "date", type: "date", label: "Date" },
  ];

  // 🔹 Table Headers Configuration
  const header = [
    { title: "No", dataIndex: "key", align: "left", width: 50 },
    { title: "Customer Name", dataIndex: "shop_name", align: "left" },
    { title: "Contact Name", dataIndex: "contact_name", align: "left" },
    { title: "Phone No", dataIndex: "phone_no", align: "left" },
    { title: "Customer Type", dataIndex: "customer_type", align: "left" },
    { title: "Point", dataIndex: "point", align: "center" },
    { title: "Expire Date", dataIndex: "expire_date", align: "center" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Expire Point</div>
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
