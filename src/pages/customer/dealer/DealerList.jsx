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

export default function DealerList() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [dealers, set_dealers] = useState([]);
  const navigate = useNavigate();
  const [tableLoading, setTableLoading] = useState(false);
  const [Status, setStatus] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [saleList, setSaleList] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  // ---------- Load master: Status, Sales, Dealer All ----------
  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [dataStatus, sale, dealerAll] = await Promise.all([
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "status",
          }),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
          useServiceAPI.get(paths.pathMasterDealerAll, {}),
        ]);

        const Status = (dataStatus.data || []).map((data) => ({
          id: data.code,
          name: data.name,
        }));

        setStatus(Status);
        setSaleList(sale.data || []);
        set_dealers(dealerAll.data || []);
      } catch (error) {
        console.error(error.message || "error");
        // ถ้ามี showMsg อยู่ในโปรเจกต์เดิม สามารถใช้ตรงนี้ได้
        // showMsg("error", error.message || "error");
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

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    console.log("----------fetch------------", filters);

    const requestData = {
      sale: filters.sale || "",
      dealers: filters.dealers || "",
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
        const newDataSource = elementHtml(data, current, pageSize);
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

  const handleSearch = (filters) => {
    const set = {
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
    };
    setTableParams(set);
  };

  function elementHtml(data, current, pageSize) {
    const element = data.map((data, index) => ({
      key: index + 1 + (current - 1) * pageSize,
      code: data.dealer_code,
      dealerName: data.dealer_name_en,
      address: data.address,
      contactName: data.contact_name,
      mobilePhone: data.contact_phone_number || "-",
      groupCode: data.group_code,
      sale: data.sale_list_name,
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
                      navigate("/customer/dealer/edit-info", {
                        state: {
                          id: data.id,
                          mod: actionItem.action,
                        },
                      });
                    } else if (actionItem.action.toLowerCase() === "view") {
                      navigate("/customer/dealer/view-info", {
                        state: {
                          id: data.id,
                          mod: actionItem.action,
                        },
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

    return element;
  }

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
      options: dealers, // ✅ ใช้ Dealer All
      moderef: false,
    },
    {
      key: "use_flag",
      label: "Status",
      type: "select",
      options: Status,
    },
  ];

  const handleClear = () => {
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: {
        ...prev.pagination,
        current: 1,
      },
    }));
    setFilterValues({});
  };

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
    { title: "By Sales", width: 150, dataIndex: "sale", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
      filters: prev.filters, // รักษาฟิลเตอร์เดิม
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    }));
  };

  const handleChange = (filters) => {
    setFilterValues(filters); // ตอนนี้ใช้เก็บเฉย ๆ เผื่ออนาคต
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Dealer</div>

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
