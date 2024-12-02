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

export default function SubDealerList() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const navigate = useNavigate();
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
      key: "sub_dealer",
      type: "text",
      label: "Sub Dealer",
      placeholder: "All",
    },
    {
      key: "contact_name",
      type: "text",
      label: "Contact Name",
      placeholder: "All",
    },
    {
      key: "phone",
      type: "text",
      label: "Phone",
      placeholder: "Phone",
    },
    {
      key: "status",
      type: 'select',
      label: "Status",
      placeholder: "All",
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Pending', label: 'Pending' },
      ],
    },
  ];

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
        paths.pathCustomerSubDealerList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;
        const newDataSource = data.map((data, index) => ({
          key: index + 1 + (current - 1) * pageSize,
        subDealerName: data.name,
        contactName: data.contact_name,
        address: data.contact_address,
        phone: data.mobile_phone,
          status: (
            <BadgeStatus
              text={data.status_name}
              bgColor={data.status_bg_color}
              textColor={data.status_color}
            />
          ),
          action: (
            <Dropdown
              menu={{
                items: data.action.map((actionItem, actionIndex) => ({
                  key: actionIndex,
                  label: (
                    <ItemDropDown
                      mode={actionItem.action.toLowerCase()}
                      onClick={() => {
                        if (actionItem.action === "Edit") {
                          navigate("/customer/sub-dealer/edit", {
                            state: {
                              id: data.id,
                            },
                          });
                        } else if (actionItem.action === "Delete") {
                          // ฟังก์ชันลบ
                          handleDelete(data.id);
                        }
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

  const handleDelete = async (record) => {
    try {
      const requestData = {
        id: record, // ส่ง ID ที่ต้องการลบ
      };

      const response = await useServiceAPI.delete(
        paths.pathDeleteSubDealer,
        requestData
      );

      if (response.status === 200) {
        fetchData();
        showNotification(
          "success",
          response.data.message,
          response.data.message_line
        );
      } else {
        console.error("Failed to delete record:", response.message);
        showNotification("error", response.message, response.message_line);
      }
    } catch (error) {
      console.error("Error deleting record:", error);

      showNotification("error", error.message, error.message_line);
    }
  };



  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  const actionItems = [
    { key: "1", label: <ItemDropDown mode="edit" link="/customer/sub-dealer/edit" /> },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Sub Dealer Name", width: 200, dataIndex: "subDealerName", align: "left" },
    { title: "Contact Name", width: 200, dataIndex: "contactName", align: "left" },
    { title: "Address", width: 300, dataIndex: "address", align: "left" },
    { title: "Phone", width: 150, dataIndex: "phone", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];
  
  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };
  // useEffect(() => {
  //   const dataSource = [
  //     {
  //       key: 1,
  //       subDealerName: "เพื่อนชาวนา",
  //       contactName: "นางสาวกรกชสุดา นิตรสัมพันธ์",
  //       address: "เลขที่ 71 หมู่1 ต.สาลี อ.บางปลาม้า จ.สุพรรณบุรี",
  //       phone: "081-639 9745",
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
  //       subDealerName: "ดอนโพธิ์ทอง",
  //       contactName: "นางสาวประภาพรรณ ปลั่งพานิช",
  //       address: "เลขที่ 216 หมู่1 ต.ดอนโพธิ์ทอง อ.เมือง จ.สุพรรณบุรี",
  //       phone: "081-1922292",
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
  //       subDealerName: "จุ้ยพันธุ์ข้าว",
  //       contactName: "นางสาวนิตา นำประเสริฐสุข",
  //       address: "เลขที่ 17 หมู่2 ต.ตลิ่งชัน อ.เมือง จ.สุพรรณบุรี",
  //       phone: "080-9963214",
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



  return (
    <MainLayout loading={loading}>

      <div className="flex items-center justify-between">
        <div className="title-page">Sub Dealer</div>
        <ActionButton mode="create" text="Create" onClick={(e) => navigate("/customer/sub-dealer/create")} />
      </div>

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
