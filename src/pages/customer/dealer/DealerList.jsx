import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown } from "antd";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/corsService";
import { paths } from "../../../services/CorsPath";
import ActionButton from "../../../components/button/ActionButton";
import {
  loadListPageState,
  saveListPageState,
} from "../../../utils/listPageState";

const PAGE_STATE_KEY = "customer-dealer-list";

export default function DealerList() {
  const persistedState = loadListPageState(PAGE_STATE_KEY, {});
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [Status, setStatus] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [targetList, setTargetList] = useState([]); // ✅ NEW

  const [filterValues, setFilterValues] = useState(
    persistedState.filterValues || {},
  );
  const navigate = useNavigate();

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

  // ---------- Load master: Status, Sales, Dealer All, Target ----------
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [dataStatus, sale, dealerAll, targetRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterStatus, { status_type: "status" }),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
          useServiceAPI.get(paths.pathMasterDealerAll, {}),
          useServiceAPI.get(paths.pathMasterTarget, { user_type: 1 }), // ✅ NEW
        ]);

        const statusOpts = (dataStatus?.data || []).map((d) => ({
          id: d.code,
          name: d.name,
        }));

        setStatus(statusOpts);
        setSaleList(sale?.data || []);
        setDealers(dealerAll?.data || []);

        // ✅ map master target -> {id,name}
        const targets = (targetRes?.data || []).map((x) => ({
          id: x.id ?? x.target_group_id ?? x.code,
          name: x.name ?? x.target_group_name ?? x.title,
        }));
        setTargetList(targets);
      } catch (error) {
        console.error(error?.message || "error");
      } finally {
        setLoading(false);
      }
    };
    getMaster();
  }, []);

  // ---------- Fetch table data ----------
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

    const requestData = {
      sale: filters.sale || "",
      dealers: filters.dealers || "",
      use_flag: filters.use_flag || "",
      target_group_id: filters.target_group_id || "", // ✅ NEW
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathCustomerDealer,
        requestData,
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;
        const newDataSource = elementHtml(data || [], current, pageSize);

        setDataSource(newDataSource);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: records_filtered || 0,
          },
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSearch = (filtersFromUI) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1, pageSize: 10 },
      filters: {
        ...filtersFromUI,
        page_length: 1,
        page_size: 10,
      },
    }));
    setFilterValues(filtersFromUI);
  };

  const handleClear = () => {
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
    setFilterValues({});
  };

  function elementHtml(data, current, pageSize) {
    return (data || []).map((row, index) => ({
      key: index + 1 + (current - 1) * pageSize,
      code: row.dealer_code,
      dealerName: row.dealer_name_en,
      contactName: row.contact_name,
      mobilePhone: row.contact_phone_number || "-",
      address: row.address,
      groupCode: row.group_code,
      targetGroupName: row.target_group_name || "-", // ✅ NEW
      sale: row.sale_list_name,
      status: (
        <BadgeStatus
          text={row.status_name}
          bgColor={row.status_bg_color}
          textColor={row.status_color}
        />
      ),
      action: (
        <Dropdown
          menu={{
            items: (row.action || []).map((actionItem, actionIndex) => ({
              key: actionIndex,
              label: (
                <ItemDropDown
                  mode={(actionItem.action || "").toLowerCase()}
                  onClick={() => {
                    const mode = (actionItem.action || "").toLowerCase();
                    if (mode === "edit") {
                      navigate("/customer/dealer/edit-info", {
                        state: { id: row.id, mod: actionItem.action },
                      });
                    } else if (mode === "view") {
                      navigate("/customer/dealer/view-info", {
                        state: { id: row.id, mod: actionItem.action },
                      });
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
  }

  // ---------- Filters UI ----------
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
      options: dealers,
      moderef: false,
    },
    {
      key: "target_group_id", // ✅ NEW
      type: "select",
      label: "Target",
      placeholder: "All",
      options: targetList,
      moderef: false,
    },
    {
      key: "use_flag",
      label: "Status",
      type: "select",
      placeholder: "All",
      options: Status,
    },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Code", width: 100, dataIndex: "code", align: "left" },
    {
      title: "Dealer Name",
      width: 200,
      dataIndex: "dealerName",
      align: "left",
    },
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
    {
      title: "Group Code",
      width: 150,
      dataIndex: "groupCode",
      align: "center",
    },
    {
      title: "Target Group",
      width: 180,
      dataIndex: "targetGroupName",
      align: "left",
    }, // ✅ NEW
    { title: "By Sales", width: 150, dataIndex: "sale", align: "center" },
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

  const handleChange = (values) => {
    setFilterValues(values);
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Dealer</div>
        <ActionButton
          text="Create"
          mode="create"
          onClick={() =>
            navigate("/customer/dealer/create", { state: { mod: "create" } })
          }
        />
      </div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleChange}
        filters={filters}
        values={filterValues}
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
