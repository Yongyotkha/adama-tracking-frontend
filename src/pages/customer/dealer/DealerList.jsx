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

export default function DealerList() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const navigate = useNavigate();
  const [tableLoading, setTableLoading] = useState(false);
  const [Status, setStatus] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [dataStatus] = await Promise.all([
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "status",
          }),
        ]);
        
        const Status = [];
        dataStatus.data.map((data, index) => {
          Status.push({ 
            id: data.code, 
            name: data.name, 
          });
        });
        
        setStatus(Status);

        setPosition(producttype.data);
        setRoles(roles.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    getMaster();
  }, []);


  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);


  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      keyword: filters.keyword || "",
      use_flag: filters.use_flag || "",

      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathCustomerDealer,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;        
        const newDataSource = data.map((data, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          code: data.dealer_code,
          dealerName: data.dealer_name_en,
          address: data.address,
          contactName: data.contact_number,
          mobilePhone: data.contact_phone_number || "-",
          groupCode: data.group_code,
          status: <BadgeStatus text={data.status_name} bgColor={data.status_bg_color} textColor={data.status_color} />,
          action: (
            <Dropdown
              menu={{
                items: data.action.map((actionItem, actionIndex) => ({
                  key: actionIndex,
                  label: (
                    <ItemDropDown mode={actionItem.action.toLowerCase()} 
                    onClick={() => {
                      navigate("/customer/dealer/edit-info", {
                        state: {
                          id: data.id,
                        },
                      });
                    }}
                    />
                  ),
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


  const filters = [
    {
      key: "keyword",
      type: "text",
      label: "dealer",
    },
    // {
    //   key: "dealer",
    //   type: "select",
    //   label: "Dealer",
    //   placeholder: "All",
    //   options: [
    //     { value: 'Monggutthong Ltd.', label: 'Monggutthong Ltd.' },
    //     { value: 'Bangbuathong Panich Co.,Ltd.', label: 'Bangbuathong Panich Co.,Ltd.' },
    //   ],
    // },
    {
      key: "use_flag",
      label: "Status",
      type: "select",
      options: Status,
    },
  ];

  const handleSearch = (filters) => {
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1, // Reset current page to 1
        pageSize: 10, // Ensure the page size is set to 10
      },
      filters: {
        ...filters,
        page_length: 1, // Set default page_length
        page_size: 10,  // Set default page_size
      },
    });
  };

  const handleClear = () => {
    setTableParams({
      ...tableParams,
      filters: {},
    });
  };

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Code", width: 100, dataIndex: "code", align: "left" },
    { title: "Dealer Name", width: 200, dataIndex: "dealerName", align: "left" },
    { title: "Address", width: 300, dataIndex: "address", align: "left" },
    { title: "Contact Name", width: 200, dataIndex: "contactName", align: "left" },
    { title: "Mobile Phone", width: 150, dataIndex: "mobilePhone", align: "center" },
    { title: "Group Code", width: 150, dataIndex: "groupCode", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];


  const actionItems = [
    { key: "1", label: <ItemDropDown mode="edit" link="/customer/dealer/edit-info" /> },
  ];

  // useEffect(() => {
  //   const dataSource = [
  //     {
  //       key: 1,
  //       code: "365004",
  //       dealerName: "Monggutthong Ltd.",
  //       address: "89/1 หมู่ 4 ต.สพรรณบุรี-บางบัวทอง ต.สนามชัย อ.เมือง จ.สพรรณบุรี 72000",
  //       contactName: "Mr. Charuen Sinsuantang",
  //       mobilePhone: "-",
  //       groupCode: "FMK Customers",
  //       status: <BadgeStatus text="Active" bgColor="#009845" textColor="#FFFFFF" />,
  //       action: (
  //         <Dropdown menu={{ items: actionItems }} placement="bottom">
  //           <a onClick={(e) => e.preventDefault()}>
  //             <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
  //           </a>
  //         </Dropdown>
  //       ),
  //     },
  //     {
  //       key: 2,
  //       code: "335001",
  //       dealerName: "Bangbuathong Panich Co.,Ltd.",
  //       address: "15/2-5 หมู่ 13 ถ.บางบัวทอง-สุพรรณบุรี ต.บางบัวทอง อ.บางบัวทอง จ.นนทบุรี",
  //       contactName: "Mr. Thanyanop Watthananit",
  //       mobilePhone: "081-852-1841",
  //       groupCode: "FMK Customers",
  //       status: <BadgeStatus text="Active" bgColor="#009845" textColor="#FFFFFF" />,
  //       action: (
  //         <Dropdown menu={{ items: actionItems }} placement="bottom">
  //           <a onClick={(e) => e.preventDefault()}>
  //             <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
  //           </a>
  //         </Dropdown>
  //       ),
  //     },
  //     {
  //       key: 3,
  //       code: "321005",
  //       dealerName: "Agricare Co.,Ltd.",
  //       address: "88 หมู่ที่ 1 ต.หนองบัว อ.พัฒนานิคม จ.ลพบุรี",
  //       contactName: "Somsak Sumatechotimatha",
  //       mobilePhone: "081-994-4747",
  //       groupCode: "FMK Customers",
  //       status: <BadgeStatus text="Active" bgColor="#009845" textColor="#FFFFFF" />,
  //       action: (
  //         <Dropdown menu={{ items: actionItems }} placement="bottom">
  //           <a onClick={(e) => e.preventDefault()}>
  //             <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
  //           </a>
  //         </Dropdown>
  //       ),
  //     },
  //   ];

  //   setDataSource(dataSource);
  // }, []);


  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };
  

  return (
    <MainLayout loading={loading}>

      <div className="title-page">Dealer</div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        filters={filters}
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
