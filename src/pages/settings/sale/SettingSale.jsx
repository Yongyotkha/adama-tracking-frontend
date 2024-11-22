import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import DynamicModal from "../../../components/modal/DynamicModal";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function SettingSale() {
  const [loading, setLoading] = useState(false);
  const [isTerritoryModalVisible, setIsTerritoryModalVisible] = useState(false);
  const [isBDModalVisible, setIsBDModalVisible] = useState(false);
  const [isSAModalVisible, setIsSAModalVisible] = useState(false);
  const navigate = useNavigate();

  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  const filters = [
    {
      key: "sale_head_name",
      type: "select",
      label: "Sale Head Name",
      options: [],
    },
    {
      key: "sale_area_name",
      type: "select",
      label: "Sale Area Name",
      options: [],
    },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    // const sortOrder = tableParams.sortOrder || "asc";
    // const sortField = tableParams.sortField || "name_en";

    const requestData = {
      keyword: filters.keyword || "",
      user_id: filters.user_id || "",
      contact_number: filters.contact_number || "",
      // orderby_column: sortField,
      // orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathMasterSale,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;
    
        const newDataSource = data.map((data, index) => ({
          key: index + 1,
          sale_head_name: data.sa_head_name,
          sale_area_name: data.sa_area_name,
          area: data.area_name,
          sale_assistant: (
            <BadgeStatus
              text="4"
              bgColor="#FFB020"
              textColor="#FFFFFF"
              onClick={() => setIsSAModalVisible(true)}
            />
          ),
          sale: (
            <BadgeStatus
              text="8"
              bgColor="#FFB020"
              textColor="#FFFFFF"
              onClick={() => setIsTerritoryModalVisible(true)}
            />
          ),
          business_dev: (
            <BadgeStatus
              text="4"
              bgColor="#FFB020"
              textColor="#FFFFFF"
              onClick={() => setIsBDModalVisible(true)}
            />
          ),
          action: (
            <Dropdown menu={{ items: actionItems }} placement="bottom">
              <a onClick={(e) => e.preventDefault()}>
                <img
                  src="/img/icons/action.png"
                  alt="Actions icon"
                  className="inline-block w-5 h-5"
                />
              </a>
            </Dropdown>
          ),
        }));

        setDataSource(newDataSource);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: records_filtered,
          },
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    // tableParams.sortOrder,
    // tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      // sortOrder: sorter.order === "descend" ? "desc" : "asc",
      // sortField: sorter.field,
    });
  };

  const handleSearch = (filters) => {
    setTableParams({
      ...tableParams,
      filters,
    });
  };

  const handleClear = () => {
    setTableParams({
      ...tableParams,
      filters: {},
    });
  };

  const territoryColumns = [
    { title: "No", dataIndex: "key", key: "key", width: 50 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Territory", dataIndex: "territory", key: "territory" },
    { title: "Position", dataIndex: "position", key: "position" },
  ];

  const territoryData = [
    {
      key: 1,
      name: "Kornkan Induang",
      territory: "Left North",
      position: "Sales Executive",
    },
    {
      key: 2,
      name: "Phaisan Jethuen",
      territory: "Left Lower North",
      position: "Sales Executive",
    },
    {
      key: 3,
      name: "Manupong Wongpuang",
      territory: "Lower North",
      position: "Sales Executive",
    },
    {
      key: 4,
      name: "Kriangkrai Kraikeaw",
      territory: "Central Left North",
      position: "Sales Executive",
    },
    {
      key: 5,
      name: "Charoenpong Khunawatcharakun",
      territory: "Central Right North",
      position: "Sales Executive",
    },
    {
      key: 6,
      name: "Amorn Sriworakul",
      territory: "Right Lower North",
      position: "Sales Executive",
    },
    {
      key: 7,
      name: "Nitchapan Akkaraketsawad",
      territory: "Upper Central",
      position: "Sales Executive",
    },
    {
      key: 8,
      name: "Manus Nakkhum",
      territory: "Central",
      position: "Sales Executive",
    },
  ];

  const saleTeamSA = [
    {
      key: 1,
      name: "Passakorn Kong-In",
      territory: "Right North",
      position: "Sales Assistant",
    },
    {
      key: 2,
      name: "Thanakit Kongkrapan",
      territory: "West",
      position: "Sales Assistant",
    },
    {
      key: 3,
      name: "Tanadol Kaewyai",
      territory: "Central",
      position: "Sales Assistant",
    },
    {
      key: 4,
      name: "Chinnawat Bunmakaew",
      territory: "South",
      position: "Sales Assistant",
    },
  ];

  const saleTeamBD = [
    {
      key: 1,
      name: "Tossaphon Suphaksitthikorn",
      territory: "Left North",
      position: "Business Development Executive",
    },
    {
      key: 2,
      name: "Panudech Srithong",
      territory: "Left Lower North",
      position: "Business Development Executive",
    },
    {
      key: 3,
      name: "Sarawut Nisap",
      territory: "Lower North",
      position: "Business Development Executive",
    },
    {
      key: 4,
      name: "Wisisak Prakobsin",
      territory: "Central Left North",
      position: "Business Development Executive",
    },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    {
      title: "Sale Head Name",
      width: 200,
      dataIndex: "sale_head_name",
      align: "left",
    },
    {
      title: "Sale Area Name",
      width: 200,
      dataIndex: "sale_area_name",
      align: "left",
    },
    { title: "Area", width: 100, dataIndex: "area", align: "left" },
    { title: "Sale", width: 100, dataIndex: "sale", align: "center" },
    {
      title: "Business Development",
      width: 150,
      dataIndex: "business_dev",
      align: "center",
    },
    {
      title: "Sale Assistant",
      width: 150,
      dataIndex: "sale_assistant",
      align: "center",
    },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

 

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Sale Management</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={(e) => navigate("/setting/sale/create")}
        />
      </div>

      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
          onChange={handleTableChange}
        />
      </BoxPrimary>

      {/* Dynamic Modal Instances */}
      <DynamicModal
        title="Sale Territory"
        isVisible={isTerritoryModalVisible}
        onClose={() => setIsTerritoryModalVisible(false)}
        header={territoryColumns}
        dataSource={territoryData}
        width="1200px"
      />

      <DynamicModal
        title="Sale Team"
        isVisible={isBDModalVisible}
        onClose={() => setIsBDModalVisible(false)}
        header={territoryColumns}
        dataSource={saleTeamBD}
        width="1200px"
      />

      <DynamicModal
        title="Sale Team"
        isVisible={isSAModalVisible}
        onClose={() => setIsSAModalVisible(false)}
        header={territoryColumns}
        dataSource={saleTeamSA}
        width="1200px"
      />
    </MainLayout>
  );
}
