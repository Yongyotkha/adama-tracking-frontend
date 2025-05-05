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
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [dataStatus, sale] = await Promise.all([
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "status",
          }),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
        ]);

        const Status = dataStatus.data.map((data) => ({
          id: data.code,
          name: data.name,
        }));

        setStatus(Status);
        setSaleList(sale.data);
      } catch (error) {
        console.log(error.message);
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
      contact_phone_number: filters.contact_phone_number || "",
      contact_name: filters.contact_name || "",
      page_length: current,
      page_size: pageSize,
      user_id: filters.sale,
      dealer_id: filters.dealers,
      sub_dealer_id: filters.shop,
      province: filters.province
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
          dealerName: data.dealer_name,
          subDealerName: data.name,
          contactName: data.contact_name,
          address: data.contact_address,
          phone: data.mobile_phone,
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
                        const navTarget =
                          actionItem.action === "View"
                            ? "/customer/sub-dealer/view"
                            : "/customer/sub-dealer/edit";
                        navigate(navTarget, {
                          state: {
                            id: data.id,
                            mode: actionItem.action,
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

  const handleDelete = async (record) => {
    try {
      const response = await useServiceAPI.delete(
        paths.pathDeleteSubDealer,
        { id: record }
      );

      if (response.status === 200) {
        fetchData();
        showNotification(
          "success",
          response.data.message,
          response.data.message_line
        );
      } else {
        showNotification("error", response.message, response.message_line);
      }
    } catch (error) {
      showNotification("error", error.message, error.message_line);
    }
  };

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
    setFilterValues({});
    setTableParams({
      ...tableParams,
      filters: {},
    });
  };

  const handleChange = (filters) => {
    setFilterValues(filters);
  };

  useEffect(() => {
    const sale = filterValues.sale;

    if (sale) {
      const userId =
        typeof sale === "object" && sale.value ? sale.value : sale;

      const getDealersBySale = async () => {
        try {
          const response = await useServiceAPI.get(
            paths.pathMasterDealerDropdown,
            { user_id: userId }
          );
          setDealerList(response.data);
          setSubDealerList([]); // reset sub-dealer list
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาดในการโหลด Dealer");
        }
      };

      getDealersBySale();
    }
  }, [filterValues.sale]);

  useEffect(() => {
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

  const filters = [
    { key: "keyword", type: "text", label: "Sub Dealer", placeholder: "All" },
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
      label: "Shop",
      placeholder: "All",
      options: subDealerList,
    },
    {
      key: "contact_name",
      type: "text",
      label: "Contact Name",
      placeholder: "All",
    },
    {
      key: "contact_phone_number",
      type: "text",
      label: "Phone",
      placeholder: "Phone",
    },
    {
      key: "province",
      type: "text",
      label: "Province",
    },
    {
      key: "use_flag",
      type: "select",
      label: "Status",
      placeholder: "All",
      options: Status,
    },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Dealer Name", width: 200, dataIndex: "dealerName", align: "left" },
    { title: "Sub Dealer Name", width: 200, dataIndex: "subDealerName", align: "left" },
    { title: "Contact Name", width: 200, dataIndex: "contactName", align: "left" },
    { title: "Address", width: 300, dataIndex: "address", align: "left" },
    { title: "Phone", width: 150, dataIndex: "phone", align: "center" },
    { title: "By Sales", width: 150, dataIndex: "sale", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters,
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Sub Dealer</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() =>
            navigate("/customer/sub-dealer/create", {
              state: { mode: "Create" },
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
