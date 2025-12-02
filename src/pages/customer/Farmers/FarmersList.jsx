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

export default function FarmerList() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const navigate = useNavigate();
  const [tableLoading, setTableLoading] = useState(false);
  const [Status, setStatus] = useState([]);
  const [Position, setPosition] = useState([]); // ยังไม่ใช้ แต่คงไว้ตามโค้ดเดิม
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
  const [filterValues, setFilterValues] = useState({});

  // ---------- Load masters: Status, Sales, DealerAll, SubDealerAll, FarmerAll ----------
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [
          dataStatus,
          sales,
          dealerRes,
          subDealerRes,
          farmerRes,
        ] = await Promise.all([
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "status",
          }),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
          useServiceAPI.get(paths.pathMasterDealerAll, {}),
          useServiceAPI.get(paths.pathMasterSubDealerAll, {}),
          useServiceAPI.get(paths.pathMasterFarmer, {}),
        ]);

        const StatusArr = (dataStatus.data || []).map((data) => ({
          id: data.code,
          name: data.name,
        }));

        setStatus(StatusArr);
        setSaleList(sales.data || []);
        setDataDealer(dealerRes.data || []);

        const formattedSubDealer = (subDealerRes.data || []).map((item) => ({
          name: item.sub_dealer_name,
          id: item.sub_dealer_id,
        }));
        setSubDealerList(formattedSubDealer);

        const formattedFarmers = (farmerRes.data || []).map((item) => ({
          name: item.farmer_name,
          id: item.farmer_id,
        }));
        setFarmList(formattedFarmers);
      } catch (error) {
        console.log(error);
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    getMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Fetch data ----------
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    console.log("filterValues : ", filterValues);

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
    console.log("requestData : ", requestData);

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
                        } else if (
                          actionItem.action.toLowerCase() === "view"
                        ) {
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
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: records_filtered,
          },
        }));
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
      label: "Dealer",
      placeholder: "All",
      options: dealerList,
      moderef: true,
    },
    {
      key: "shop",
      type: "select",
      label: "Sub Dealer",
      placeholder: "All",
      options: subDealerList,
    },
    {
      key: "farmers",
      type: "select",
      label: "Farmer",
      placeholder: "All",
      options: farmList,
    },
    {
      key: "use_flag",
      label: "Status",
      type: "select",
      options: Status,
    },
  ];

  const handleSearch = (filtersFromUI) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: 1,
        pageSize: 10,
      },
      filters: {
        ...filtersFromUI,
        page_length: 1,
        page_size: 10,
      },
    }));
    setFilterValues(filtersFromUI);
  };

  const handleClear = () => {
    setFilterValues({});
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: {
        ...prev.pagination,
        current: 1,
      },
    }));
  };

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    {
      title: "Dealer Name",
      width: 200,
      dataIndex: "dealerName",
      align: "left",
    },
    {
      title: "Sub Dealer Name",
      width: 200,
      dataIndex: "sub_dealer_name",
      align: "left",
    },
    { title: "Farmer Name", width: 200, dataIndex: "Name", align: "left" },
    {
      title: "Contact Name",
      width: 200,
      dataIndex: "contactName",
      align: "left",
    },
    {
      title: "Contact Number",
      width: 150,
      dataIndex: "mobilePhone",
      align: "center",
    },
    { title: "Address", width: 300, dataIndex: "address", align: "left" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      filters: prev.filters,
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    }));
  };

  const handleDeleteItem = async (record) => {
    try {
      const requestData = {
        id: record,
      };

      const response = await useServiceAPI.delete(
        paths.pathCustomerFarmersDelete,
        requestData
      );

      if (response.status === 200) {
        fetchData();
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
        <div className="title-page">Farmer</div>
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
