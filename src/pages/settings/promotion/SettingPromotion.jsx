import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/corsService";
import { paths } from "../../../services/CorsPath";

export default function SettingPromotion() {
  const [loading, setLoading] = useState(false);
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

  const navigate = useNavigate();

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "left" },
    { title: "Name", width: 200, dataIndex: "name", align: "left" },
    { title: "Description", width: 300, dataIndex: "description", align: "left" },
    { title: "Value (THB)", width: 100, dataIndex: "value", align: "right" },
    { title: "unit", width: 100, dataIndex: "unit", align: "right" },

    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },

    
  ];

  const actionItems = [
    {
      key: "1",
      label: (
        <ItemDropDown
          mode="create"
          onClick={(e) => navigate("/setting/promotion/create")}
        />
      ),
    },
    {
      key: "2",
      label: (
        <ItemDropDown
          mode="edit"
          onClick={(e) => navigate("/setting/promotion/edit")}
        />
      ),
    },
    {
      key: "3",
      label: (
        <ItemDropDown mode="delete" />
      ),
    },
  ];

  // useEffect(() => {
  //   const dataSource = [
  //     {
  //       key: 1,
  //       name: "Cooler Box M11 - กระติกน้ำ คละสี",
  //       description: "Cooler Box M11 - กระติกน้ำ คละสี",
  //       value: "0",
  //       status: (
  //         <BadgeStatus
  //           text="Active"
  //           bgColor="#009845"
  //           textColor="#FFFFFF"
  //         />
  //       ),
  //       action: (
  //         <Dropdown menu={{ items: actionItems }} placement="bottom">
  //           <a onClick={(e) => e.preventDefault()}>
  //             <img
  //               src="/img/icons/action.png"
  //               alt="Actions icon"
  //               className="inline-block w-5 h-5"
  //             />
  //           </a>
  //         </Dropdown>
  //       ),
  //     },
  //     {
  //       key: 2,
  //       name: "Adama Bag (กระเป๋าผ้าสีเขียบนอมด์)",
  //       description: "Adama Bag (กระเป๋าผ้าสีเขียบนอมด์)",
  //       value: "0",
  //       status: (
  //         <BadgeStatus
  //           text="Active"
  //           bgColor="#009845"
  //           textColor="#FFFFFF"
  //         />
  //       ),
  //       action: (
  //         <Dropdown menu={{ items: actionItems }} placement="bottom">
  //           <a onClick={(e) => e.preventDefault()}>
  //             <img
  //               src="/img/icons/action.png"
  //               alt="Actions icon"
  //               className="inline-block w-5 h-5"
  //             />
  //           </a>
  //         </Dropdown>
  //       ),
  //     },
  //     {
  //       key: 3,
  //       name: "เสื้อยืดแขนยาว - นาโพลิค",
  //       description: "เสื้อยืดแขนยาว - นาโพลิค",
  //       value: "0",
  //       status: (
  //         <BadgeStatus
  //           text="Active"
  //           bgColor="#009845"
  //           textColor="#FFFFFF"
  //         />
  //       ),
  //       action: (
  //         <Dropdown menu={{ items: actionItems }} placement="bottom">
  //           <a onClick={(e) => e.preventDefault()}>
  //             <img
  //               src="/img/icons/action.png"
  //               alt="Actions icon"
  //               className="inline-block w-5 h-5"
  //             />
  //           </a>
  //         </Dropdown>
  //       ),
  //     },
  //     {
  //       key: 4,
  //       name: "เสื้อเชิ้ตยีนส์แขนยาว - อานา",
  //       description: "เสื้อเชิ้ตยีนส์แขนยาว - อานา",
  //       value: "0",
  //       status: (
  //         <BadgeStatus
  //           text="Active"
  //           bgColor="#009845"
  //           textColor="#FFFFFF"
  //         />
  //       ),
  //       action: (
  //         <Dropdown menu={{ items: actionItems }} placement="bottom">
  //           <a onClick={(e) => e.preventDefault()}>
  //             <img
  //               src="/img/icons/action.png"
  //               alt="Actions icon"
  //               className="inline-block w-5 h-5"
  //             />
  //           </a>
  //         </Dropdown>
  //       ),
  //     },
  //     {
  //       key: 5,
  //       name: "เสื้อยืดคอกลมแขนยาว - เมโซรี่",
  //       description: "เสื้อยืดคอกลมแขนยาว - เมโซรี่",
  //       value: "0",
  //       status: (
  //         <BadgeStatus
  //           text="Active"
  //           bgColor="#009845"
  //           textColor="#FFFFFF"
  //         />
  //       ),
  //       action: (
  //         <Dropdown menu={{ items: actionItems }} placement="bottom">
  //           <a onClick={(e) => e.preventDefault()}>
  //             <img
  //               src="/img/icons/action.png"
  //               alt="Actions icon"
  //               className="inline-block w-5 h-5"
  //             />
  //           </a>
  //         </Dropdown>
  //       ),
  //     },
  //     {
  //       key: 6,
  //       name: "เสื้อยืดคอกลมแขนยาว - โรยอน โกลด์ (สีเทา)",
  //       description: "เสื้อยืดคอกลมแขนยาว - โรยอน โกลด์ (สีเทา)",
  //       value: "0",
  //       status: (
  //         <BadgeStatus
  //           text="Active"
  //           bgColor="#009845"
  //           textColor="#FFFFFF"
  //         />
  //       ),
  //       action: (
  //         <Dropdown menu={{ items: actionItems }} placement="bottom">
  //           <a onClick={(e) => e.preventDefault()}>
  //             <img
  //               src="/img/icons/action.png"
  //               alt="Actions icon"
  //               className="inline-block w-5 h-5"
  //             />
  //           </a>
  //         </Dropdown>
  //       ),
  //     },
  //     {
  //       key: 7,
  //       name: "แก้วน้ำใส อานา",
  //       description: "แก้วน้ำใส อานา",
  //       value: "0",
  //       status: (
  //         <BadgeStatus
  //           text="Active"
  //           bgColor="#009845"
  //           textColor="#FFFFFF"
  //         />
  //       ),
  //       action: (
  //         <Dropdown menu={{ items: actionItems }} placement="bottom">
  //           <a onClick={(e) => e.preventDefault()}>
  //             <img
  //               src="/img/icons/action.png"
  //               alt="Actions icon"
  //               className="inline-block w-5 h-5"
  //             />
  //           </a>
  //         </Dropdown>
  //       ),
  //     },
  //     {
  //       key: 8,
  //       name: "หมวกนักเผด็จสายทหาร - พลักอำร่า",
  //       description: "หมวกนักเผด็จสายทหาร - พลักอำร่า",
  //       value: "0",
  //       status: (
  //         <BadgeStatus
  //           text="Active"
  //           bgColor="#009845"
  //           textColor="#FFFFFF"
  //         />
  //       ),
  //       action: (
  //         <Dropdown menu={{ items: actionItems }} placement="bottom">
  //           <a onClick={(e) => e.preventDefault()}>
  //             <img
  //               src="/img/icons/action.png"
  //               alt="Actions icon"
  //               className="inline-block w-5 h-5"
  //             />
  //           </a>
  //         </Dropdown>
  //       ),
  //     },
  //   ];

  //   setDataSource(dataSource);
  // }, []);


  // useEffect(() => {
  //   fetchData();
  //   const body = { platform: "web" };
  //   useServiceAPI
  //     .get(paths.pathMasterPromotion, body)
  //     .then((response) => {
  //       if (response.status === 200) {
  //         const newDataSource = response.data.map((data, index) => ({
  //           key: index + 1,
  //           name: data.name,
  //           description: data.description,
  //           value:data.value,
  //           status: (
  //             <BadgeStatus
  //               text="Active"
  //               bgColor="#009845"
  //               textColor="#FFFFFF"
  //             />
  //           ),
  //           action: (
  //             <Dropdown menu={{ items: actionItems }} placement="bottom">
  //               <a onClick={(e) => e.preventDefault()}>
  //                 <img
  //                   src="/img/icons/action.png"
  //                   alt="Actions icon"
  //                   className="inline-block w-5 h-5"
  //                 />
  //               </a>
  //             </Dropdown>
  //           ),

  //         }));
  
  //         setDataSource(newDataSource);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log(error.message);
  //       setError(error.message);
  //       if (error.status === 422) {
  //         showMsg("error", error.message);
  //       } else {
  //         showMsg("error", "เกิดข้อผิดพลาด");
  //       }
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // }, []);
  
  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "asc";
    const sortField = tableParams.sortField || "name";

    const requestData = {
      keyword: filters.keyword || "",
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathPromotionlist,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;                
        const newDataSource = data.map((promotion, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          action: (
            <Dropdown
              menu={{
                items: promotion.action.map((actionItem, actionIndex) => ({
                  key: actionIndex,
                  label: <ItemDropDown mode={actionItem.action.toLowerCase()} 
                  onClick={() => {
                    navigate("/setting/promotion/edit", {
                      state: {
                        id: promotion.id,
                      },
                    });
                  }}
                  />,
                })),
              }}
              placement="bottom"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img
                  src="/img/icons/action.png"
                  alt="button icon"
                  className="inline-block w-5 h-5 mr-2"
                  
                />
              </a>
            </Dropdown>
          ),
          name: promotion.name,
          description: promotion.description,
          unit: promotion.unit,
          // value: promotion.value,
          value: promotion.value === ".00" ? "0.00" : promotion.value,
          status: (
            <BadgeStatus
              text={promotion.status_name}
              bgColor={promotion.status_bg_color}
              textColor={promotion.status_color}
            />
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
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };

  const filters = [
    {
      key: "keyword",
      type: "text",
      label: "Name",
    },
  ];

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


  return (
    <MainLayout loading={loading}>

      <div className="flex items-center justify-between">
        <div className="title-page">Promotion Management</div>
        <ActionButton mode="create" text="Create" onClick={(e) => navigate("/setting/promotion/create")} />
      </div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        filters={filters}
        onChange={handleTableChange}
      />

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
