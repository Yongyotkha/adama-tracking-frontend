import React, { useEffect, useState, useContext } from "react";
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
import { AuthContext } from "../../../contexts/AuthContext";

export default function DealerList() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const navigate = useNavigate();
  const [tableLoading, setTableLoading] = useState(false);
  const [Status, setStatus] = useState([]);
  const [Position, setPosition] = useState([]);
  const { showMsg, showNotification, userInfo } = useContext(AuthContext);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });


  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDataDealer] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [farmList, setFarmList] = useState([]);
  const [farmerList, setFarmerList] = useState([]);
  const [filterValues, setFilterValues] = useState({});

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [dataStatus, sales] = await Promise.all([
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "status",
          }),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
        ]);

        const Status = [];
        dataStatus.data.map((data, index) => {
          Status.push({
            id: data.code,
            name: data.name,
          });
        });

        setStatus(Status);
        setSaleList(sales.data);

        // setPosition(producttype.data);
        // setRoles(roles.data);
      } catch (error) {
        console.log(error);

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

  useEffect(() => {
    console.log('getDealersBySale');
    const sale = filterValues.sale;

    if (sale) {
      const userId = typeof sale === "object" && sale.value ? sale.value : sale;

      const getDealersBySale = async () => {
        try {
          const response = await useServiceAPI.get(
            paths.pathMasterDealerDropdown,
            { user_id: userId }
          );
          setDataDealer(response.data);
          setSubDealerList([]); // reset sub-dealer list
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาดในการโหลด Dealer");
        }
      };

      getDealersBySale();
    }
  }, [filterValues.sale]);

  useEffect(() => {
    console.log('getSubDealersBySale');
    const sale = filterValues.sale;
    const dealer = filterValues.dealers;

    if (dealer) {
      const userId =
        typeof sale === "object" && sale?.value ? sale.value : sale;
      const dealerId =
        typeof dealer === "object" && dealer.value ? dealer.value : dealer;

      const getSubDealersBySale = async () => {
        try {
          const response = await useServiceAPI.get(
            paths.pathMasterSubDealerAll,
            {
              user_id: userId,
              derler_id: dealerId,
            }
          );

          const formattedSubDealer = response.data.map((item) => ({
            name: item.sub_dealer_name,
            id: item.sub_dealer_id,
          }));

          setSubDealerList(formattedSubDealer);
        } catch (error) {
          showMsg(
            "error",
            error.message || "เกิดข้อผิดพลาดในการโหลด Sub-dealer"
          );
        }
      };

      getSubDealersBySale();
    }
  }, [filterValues.dealers]);

  useEffect(() => {
    const shop = filterValues.shop;

    if (shop) {
      console.log('getFarmerByShop');

      const getFarmerByShop = async () => {
        try {
          const response = await useServiceAPI.get(paths.pathMasterFarmer, {
            sub_dealer_id: shop,
          });

          const formattedFarmers = response.data.map((item) => ({
            name: item.farmer_name,
            id: item.farmer_id,
          }));

          setFarmList(formattedFarmers); // ✅ เซ็ตไปยังฟิลด์ Farm ไม่ใช่ SubDealer
        } catch (error) {
          showMsg(
            "error",
            error.message || "เกิดข้อผิดพลาดในการโหลด Farmers"
          );
        }
      };

      getFarmerByShop();
    }
  }, [filterValues.shop]);

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [dataStatus, sales] = await Promise.all([
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "status",
          }),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
        ]);

        const Status = [];
        dataStatus.data.map((data, index) => {
          Status.push({
            id: data.code,
            name: data.name,
          });
        });

        setStatus(Status);
        setSaleList(sales.data);

        // setPosition(producttype.data);
        // setRoles(roles.data);
      } catch (error) {
        console.log(error);

        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    getMaster();
  }, []);

  const fetchData = async () => {

    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    console.log('filterValues : ', filterValues)
    const requestData = {
      keyword: filters.keyword || "",
      province: filters.province || "",
      use_flag: filters.use_flag || "",
      sale_id: filterValues.sale || "",
      dealer_id: filterValues.dealers || "",
      sub_dealer_id: filterValues.shop || "",
      farmer_id: filterValues.farmers || "",
      page_length: current,
      page_size: pageSize,
      user_id: userInfo.id,
    };
    console.log('requestData : ', requestData)
    try {
      const response = await useServiceAPI.get(
        paths.pathCustomerFarmers,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;
        const newDataSource = data.map((data, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          code: data.dealer_code || "-",
          dealerName: data.dealer_name_en || "-",
          sub_dealer_name: data.sub_dealer_name || "-",
          Name: data.name || "-",
          address: data.address,
          contactName: data.contact_name,
          mobilePhone: data.mobile_phone || "-",
          groupCode: data.group_code,
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
                        if (actionItem.action.toLowerCase() === "edit") {
                          navigate("/customer/farmers/create", {
                            state: {
                              id: data.id,
                              mod: actionItem.action,
                            },
                          });
                        } else if (actionItem.action.toLowerCase() === "view") {
                          console.log(2222222222222222);

                          navigate("/customer/farmers/create", {
                            state: {
                              id: data.id,
                              mod: actionItem.action,
                            },
                          });
                        } else if (
                          actionItem.action.toLowerCase() === "delete"
                        ) {
                          handleDeleteItem(data.id);
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

  const filters = [
    {
      key: "sale",
      type: "select",
      label: "Sales",
      placeholder: "All",
      options: saleList,
      moderef: true,
    },
    {
      key: "dealers",
      type: "select",
      label: "Dealers",
      placeholder: "All",
      options: dealerList,
      moderef: true,
    },
    {
      key: "shop",
      type: "select",
      label: "Shops",
      placeholder: "All",
      options: subDealerList,
    },
    {
      key: "farmers",
      type: "select",
      label: "Farms",
      placeholder: "All",
      options: farmList,
    },
    // {
    //   key: "keyword",
    //   type: "text",
    //   label: "Keyword",
    // },
    // {
    //   key: "province",
    //   type: "text",
    //   label: "Province",
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
        current: 1,
        pageSize: 10,
      },
      filters: {
        ...filters,
        page_length: 1,
        page_size: 10,
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
    {
      title: "Dealer",
      width: 200,
      dataIndex: "dealerName",
      align: "left",
    },
    { title: "Code", width: 100, dataIndex: "code", align: "left" },
    { title: "Farmer Name", width: 200, dataIndex: "Name", align: "left" },
    { title: "Sub Dealer", width: 200, dataIndex: "sub_dealer_name", align: "left" },
    { title: "Address", width: 300, dataIndex: "address", align: "left" },
    {
      title: "Contact Name",
      width: 200,
      dataIndex: "contactName",
      align: "left",
    },
    {
      title: "Phone No.",
      width: 150,
      dataIndex: "mobilePhone",
      align: "center",
    },
    {
      title: "Group Code",
      width: 150,
      dataIndex: "groupCode",
      align: "center",
    },
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

  const handleDeleteItem = async (record) => {
    try {
      const requestData = {
        id: record, // ส่ง ID ที่ต้องการลบ
      };

      const response = await useServiceAPI.delete(
        paths.pathCustomerFarmersDelete,
        requestData
      );

      if (response.status === 200) {
        fetchData();
        // showMsg("success", "Record deleted successfully.");
        showNotification("success", response.message, response.message_line);
      } else {
        console.error("Failed to delete record:", response.message);
        showNotification("error", response.message, response.message_line);
      }
    } catch (error) {
      console.error("Error deleting record:", error);

      showNotification("error", error.message, error.message_line);
    }
  };

  const handleChange = (filter) => {
    console.log("filter : ", filter);
    setFilterValues(filter);
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Farmers</div>
        <ActionButton
          text="Create"
          mode="create"
          onClick={() =>
            navigate("/customer/farmers/create", {
              state: {
                mod: "create",
              },
            })
          }
        />
      </div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleChange}
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
