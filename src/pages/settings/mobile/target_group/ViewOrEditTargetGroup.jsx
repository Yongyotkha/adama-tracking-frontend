import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableCheckbox from "../../../../components/table/TableCheckbox";
import ActionButton from "../../../../components/button/ActionButton";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import TableComponent from "../../../../components/table/TableComponent";
import Filter from "../../../../components/filter/Filter";

export default function ViewOrEditTargetGroup() {
  const { mode } = useParams(); // 'view' หรือ 'edit'
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [targetType, setTargetType] = useState("dealer");
  const [filterValues, setFilterValues] = useState({});

  // filter config
  const targetTypeOptions = [
    { id: "dealer", name: "Dealer" },
    { id: "sub_dealer", name: "Sub Dealer" },
    { id: "farmer", name: "Farmer" },
  ];

  const filters = [
    {
      key: "target_type",
      label: "Target Type",
      type: "select",
      options: targetTypeOptions,
      placeholder: "Select target type",
    },
  ];

  const getColumns = () => {
    switch (targetType) {
      case "sub_dealer":
        return [
          { title: "No", render: (_, __, index) => index + 1 },
          { title: "Sub Dealer Name", dataIndex: "sub_dealer_name" },
          { title: "Dealer Name", dataIndex: "dealer_name" },
        ];
      case "farmer":
        return [
          { title: "No", render: (_, __, index) => index + 1 },
          { title: "Farmer Name", dataIndex: "farmer_name" },
          { title: "Sub Dealer Name", dataIndex: "sub_dealer_name" },
          { title: "Dealer Name", dataIndex: "dealer_name" },
        ];
      default:
        return [
          { title: "No", render: (_, __, index) => index + 1 },
          { title: "Code", dataIndex: "code" },
          { title: "Dealer Name", dataIndex: "dealer_name" },
          { title: "Address", dataIndex: "address" },
        ];
    }
  };

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await useServiceAPI.post(paths.pathTargetGroupDetail, { id });

      const raw = res.data;

      // Set targetType for column rendering
      switch (raw.target_text?.toLowerCase()) {
        case "sub dealer":
          setTargetType("sub_dealer");
          break;
        case "farmer":
          setTargetType("farmer");
          break;
        default:
          setTargetType("dealer");
          break;
      }

      // Map API data into table format
      const mappedData = [
        {
          key: raw.id,
          code: raw.id,
          dealer_name: raw.target_text || "-",
          address: raw.status_mapping_name || "-",
          sub_dealer_name: raw.sub_dealer_name || "-",
          farmer_name: raw.farmer_name || "-",
        },
      ];

      setDataSource(mappedData);
    } catch (err) {
      console.error("Failed to fetch detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  // filter handlers
  const handleSearch = (values) => {
    if (values?.target_type) {
      setTargetType(values.target_type);
    }
  };

  const handleClear = () => {
    setTargetType("dealer");
    setFilterValues({});
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">{mode === "view" ? "View" : "Edit"} Target Group</div>

      {/* <Filter
        filters={filters}
        values={filterValues}
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={setFilterValues}
      /> */}

      <BoxPrimary>
        <TableComponent
          header={getColumns()}
          dataSource={dataSource}
          pageSize={10}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
          scroll={true}
        />
      </BoxPrimary>

      <div className="flex justify-end gap-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
      </div>
    </MainLayout>
  );
}
