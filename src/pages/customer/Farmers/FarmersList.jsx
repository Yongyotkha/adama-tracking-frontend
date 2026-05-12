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
import { loadListPageState, saveListPageState } from "../../../utils/listPageState";

const PAGE_STATE_KEY = "customer-farmers-list";

export default function FarmerList() {
  const persistedState = loadListPageState(PAGE_STATE_KEY, {});
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const navigate = useNavigate();
  const [tableLoading, setTableLoading] = useState(false);
  const [Status, setStatus] = useState([]);
  const { showMsg, showNotification, userInfo } = useContext(AuthContext);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: persistedState.tableParams?.pagination?.current || 1,
      pageSize: persistedState.tableParams?.pagination?.pageSize || 10,
      total: 0,
    },
    filters: persistedState.tableParams?.filters || {},
    sortOrder: persistedState.tableParams?.sortOrder || null,
    sortField: persistedState.tableParams?.sortField || null,
  });

  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDataDealer] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [farmList, setFarmList] = useState([]);
  const [targetList, setTargetList] = useState([]); // ✅ NEW

  const [filterValues, setFilterValues] = useState(persistedState.filterValues || {});

  // ---------- Load masters ----------
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [dataStatus, sales, dealerRes, subDealerRes, farmerRes, targetRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterStatus, { status_type: "status" }),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
          useServiceAPI.get(paths.pathMasterDealerAll, {}),
          useServiceAPI.get(paths.pathMasterSubDealerAll, {}),
          useServiceAPI.get(paths.pathMasterFarmer, {}),
          useServiceAPI.get(paths.pathMasterTarget, { user_type: 3 }), // ✅ NEW
        ]);

        setStatus((dataStatus?.data || []).map((d) => ({ id: d.code, name: d.name })));
        setSaleList(sales?.data || []);
        setDataDealer(dealerRes?.data || []);

        setSubDealerList(
          (subDealerRes?.data || []).map((item) => ({
            name: item.sub_dealer_name,
            id: item.sub_dealer_id,
          }))
        );

        setFarmList(
          (farmerRes?.data || []).map((item) => ({
            id: item.farmer_id,
            name: item.farmer_name || item.farmer_id,
          }))
        );

        const targets = (targetRes?.data || []).map((x) => ({
          id: x.id ?? x.target_group_id ?? x.code,
          name: x.name ?? x.target_group_name ?? x.title,
        }));
        setTargetList(targets);
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

  useEffect(() => {
    saveListPageState(PAGE_STATE_KEY, {
      filterValues,
      tableParams: {
        pagination: {
          current: tableParams.pagination.current,
          pageSize: tableParams.pagination.pageSize,
        },
        filters: tableParams.filters,
        sortOrder: tableParams.sortOrder,
        sortField: tableParams.sortField,
      },
    });
  }, [filterValues, tableParams]);

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const sale = typeof filterValues.sale === "object" && filterValues.sale?.value ? filterValues.sale.value : filterValues.sale;
    const dealer = typeof filterValues.dealers === "object" && filterValues.dealers?.value ? filterValues.dealers.value : filterValues.dealers;
    const shop = typeof filterValues.shop === "object" && filterValues.shop?.value ? filterValues.shop.value : filterValues.shop;
    const farmer = typeof filterValues.farmers === "object" && filterValues.farmers?.value ? filterValues.farmers.value : filterValues.farmers;

    const requestData = {
      keyword: filters.keyword || "",
      province: filters.province || "",
      use_flag: filters.use_flag || "",
      sale_id: sale || "",
      dealer_id: dealer || "",
      sub_dealer_id: shop || "",
      farmer_id: farmer || "",
      target_group_id: filters.target_group_id || "", // ✅ NEW
      page_length: current,
      page_size: pageSize,
      user_id: userInfo.id,
    };

    try {
      const response = await useServiceAPI.get(paths.pathCustomerFarmers, requestData);

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = (data || []).map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          code: row.dealer_code || "-",
          dealerName: row.dealer_name_en || "-",
          sub_dealer_name: row.sub_dealer_name || "-",
          Name: row.name || "-",
          address: row.address,
          contactName: row.contact_name,
          mobilePhone: row.mobile_phone || "-",
          groupCode: row.group_code,
          targetGroupName: row.target_group_name || "-", // ✅ NEW
          status: (
            <BadgeStatus text={row.status_name} bgColor={row.status_bg_color} textColor={row.status_color} />
          ),
          action: (
            <Dropdown
              menu={{
                items: (row.action || []).map((actionItem, actionIndex) => ({
                  key: actionIndex,
                  label: (
                    <ItemDropDown
                      mode={actionItem.action.toLowerCase()}
                      onClick={() => {
                        const mode = actionItem.action.toLowerCase();
                        if (mode === "edit" || mode === "view") {
                          navigate("/customer/farmers/create", {
                            state: { id: row.id, mod: actionItem.action },
                          });
                        } else if (mode === "delete") {
                          handleDeleteItem(row.id);
                        }
                      }}
                    />
                  ),
                })),
              }}
              placement="bottom"
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="button icon" className="inline-block w-5 h-5 mr-2" />
              </a>
            </Dropdown>
          ),
        }));

        setDataSource(newDataSource);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total: records_filtered || 0 },
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };

  const filtersUI = [
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealers", type: "select", label: "Dealer", placeholder: "All", options: dealerList, moderef: true },
    { key: "shop", type: "select", label: "Sub Dealer", placeholder: "All", options: subDealerList },
    { key: "farmers", type: "select", label: "Farmer", placeholder: "All", options: farmList, moderef: true },
    {
      key: "target_group_id", // ✅ NEW
      type: "select",
      label: "Target",
      placeholder: "All",
      options: targetList,
    },
    { key: "use_flag", label: "Status", type: "select", placeholder: "All", options: Status },
  ];

  const handleSearch = (filtersFromUI) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1, pageSize: 10 },
      filters: { ...filtersFromUI, page_length: 1, page_size: 10 },
    }));
    setFilterValues(filtersFromUI);
  };

  const handleClear = () => {
    setFilterValues({});
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Dealer Name", width: 200, dataIndex: "dealerName", align: "left" },
    { title: "Sub Dealer Name", width: 200, dataIndex: "sub_dealer_name", align: "left" },
    { title: "Farmer Name", width: 200, dataIndex: "Name", align: "left" },
    { title: "Contact Name", width: 200, dataIndex: "contactName", align: "left" },
    { title: "Contact Number", width: 150, dataIndex: "mobilePhone", align: "center" },
    { title: "Address", width: 300, dataIndex: "address", align: "left" },
    { title: "Group Code", width: 150, dataIndex: "groupCode", align: "center" },
    { title: "Target Group", width: 180, dataIndex: "targetGroupName", align: "left" }, // ✅ NEW
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const handleTableChange = (pagination, _filters, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      filters: prev.filters,
      sortOrder: sorter?.order === "descend" ? "desc" : "asc",
      sortField: sorter?.field,
    }));
  };

  const handleDeleteItem = async (id) => {
    try {
      const response = await useServiceAPI.delete(paths.pathCustomerFarmersDelete, { id });

      if (response.status === 200) {
        fetchData();
        showNotification("success", response.message, response.message_line);
      } else {
        showNotification("error", response.message, response.message_line);
      }
    } catch (error) {
      showNotification("error", error.message, error.message_line);
    }
  };

  const handleChange = (vals) => {
    setFilterValues(vals);
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Farmer</div>
        <ActionButton
          text="Create"
          mode="create"
          onClick={() => navigate("/customer/farmers/create", { state: { mod: "create" } })}
        />
      </div>

      <Filter onSearch={handleSearch} onClear={handleClear} onChange={handleChange} filters={filtersUI} />

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
