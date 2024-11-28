import React, {useContext, useEffect, useState } from "react";
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
import { AuthContext } from "../../../contexts/AuthContext";

export default function SettingSale() {
  const navigate = useNavigate();
  const { showMsg } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [position, setPosition] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTerritoryModalVisible, setIsTerritoryModalVisible] = useState(false);
  const [isBDModalVisible, setIsBDModalVisible] = useState(false);
  const [isSAModalVisible, setIsSAModalVisible] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [userList, setUserList] = useState([]);

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
      options: position,
    },
    {
      key: "sale_area_name",
      type: "select",
      label: "Sale Area Name",
      options: roles,
    },
  ];

  const actionItems = (id) => [
    {
      key: "1",
      label: (
        <ItemDropDown
          mode="create"
          onClick={() => navigate("/setting/sale/create", { state: { id } })} 
        />
      ),
    },
    {
      key: "2",
      label: (
        <ItemDropDown
          mode="edit"
          onClick={() => navigate(`/setting/sale/edit/${id}`)} 
        />
      ),
    },
    {
      key: "3",
      label: <ItemDropDown mode="delete" />,
    },
  ];
  

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
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
          sale_head_name: data.sale_head_name,
          sale_area_name: data.sale_area_name,
          area: data.area_name,
          sale_assistant: (
            <BadgeStatus
              text={data.sales_assistant_count}
              bgColor={data.status_bg_color}
              textColor={data.status_color}
              onClick={() => {
                setIsSAModalVisible(true);
                fetchUserList(data.area_id, data.sale_assistant_role_id); 
              }}
            />
          ),
          sale: (
            <BadgeStatus
              text={data.sale_count}
              bgColor={data.status_bg_color}
              textColor={data.status_color}
              onClick={() => {
                setIsTerritoryModalVisible(true);
                fetchUserList(data.area_id, data.sale_role_id); 
              }}
              // onClick={() => setIsTerritoryModalVisible(true)}
            />
          ),
          business_dev: (
            <BadgeStatus
              text={data.business_development_count} 
              bgColor={data.status_bg_color}
              textColor={data.status_color}
              onClick={() => {
                setIsBDModalVisible(true);
                fetchUserList(data.area_id, data.sale_business_development_id); 
              }}
              // onClick={() => setIsBDModalVisible(true)}
            />
          ),
          
          action: (
            <Dropdown menu={{ items: actionItems(data.id) }} placement="bottom">
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
    JSON.stringify(tableParams.filters),
  ]);

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [positions, roles] = await Promise.all([
          useServiceAPI.get(paths.pathMasterHeadofsale, {}),
          useServiceAPI.get(paths.pathMasterSalearea, {}),
        ]);

        setPosition(positions.data);
        setRoles(roles.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    getMaster();
  }, []);


  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
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

  // const saleTeamSA = [
  //   {
  //     key: 1,
  //     name: "Passakorn Kong-In",
  //     territory: "Right North",
  //     position: "Sales Assistant",
  //   },
  //   {
  //     key: 2,
  //     name: "Thanakit Kongkrapan",
  //     territory: "West",
  //     position: "Sales Assistant",
  //   },
  //   {
  //     key: 3,
  //     name: "Tanadol Kaewyai",
  //     territory: "Central",
  //     position: "Sales Assistant",
  //   },
  //   {
  //     key: 4,
  //     name: "Chinnawat Bunmakaew",
  //     territory: "South",
  //     position: "Sales Assistant",
  //   },
  // ];

  const fetchUserList = async (area_id, role_id, page_size = 20, page_length = 1) => {
    setLoading(true);
    const requestData = {
      platform: "web",
      area_id, 
      role_id: [role_id], 
      keyword: "", 
      page_size, 
      page_length,
    };
  
    try {
      const response = await useServiceAPI.get(
        paths.pathMasterUserlist, 
        requestData
      );
  
      if (response.status === 200) {
        const Test = response.data.data; 
        const territoryData = Test.map((item, index) => ({
            key: index +1,
            name: item.name,
            territory: item.territory_name,
            position: item.position_name,
        }));
        setUserList(territoryData); 
      }
      
    } catch (error) {
      console.error("Error fetching user list:", error);
    } finally {
      setLoading(false);
    }
  };
  

  
  // const saleTeamBD = [
  //   {
  //     key: 1,
  //     name: "Tossaphon Suphaksitthikorn",
  //     territory: "Left North",
  //     position: "Business Development Executive",
  //   },
  //   {
  //     key: 2,
  //     name: "Panudech Srithong",
  //     territory: "Left Lower North",
  //     position: "Business Development Executive",
  //   },
  //   {
  //     key: 3,
  //     name: "Sarawut Nisap",
  //     territory: "Lower North",
  //     position: "Business Development Executive",
  //   },
  //   {
  //     key: 4,
  //     name: "Wisisak Prakobsin",
  //     territory: "Central Left North",
  //     position: "Business Development Executive",
  //   },
  // ];

  const header = [
    { 
      title: "No", 
      width: 50, 
      dataIndex: "key", 
      align: "center" },
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
    { 
      title: "Action", 
      width: 100, 
      dataIndex: "action", 
      align: "center" 
    },
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
        dataSource={userList}
        width="1200px"
      />

      <DynamicModal
        title="Sale Team"
        isVisible={isBDModalVisible}
        onClose={() => setIsBDModalVisible(false)}
        header={territoryColumns}
        dataSource={userList}
        width="1200px"
      />

      <DynamicModal
        title="Sale Team"
        isVisible={isSAModalVisible}
        onClose={() => setIsSAModalVisible(false)}
        header={territoryColumns}
        dataSource={userList}
        width="1200px"
      />
    </MainLayout>
  );
}
