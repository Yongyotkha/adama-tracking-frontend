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

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Shop Name", width: 200, dataIndex: "shop_name", align: "left" },
    { title: "Customer Name", width: 200, dataIndex: "first_name", align: "left" },
    { title: "Contact Number", width: 200, dataIndex: "phone", align: "left" },
    { title: "Contact Type", width: 300, dataIndex: "contact_type_name", align: "left" },
    { title: "Contact Create", width: 300, dataIndex: "created_at", align: "center" },
    { title: "Status", width: 300, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];


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
      province: filters.province,
      channel_type: filters.channel_type
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathCustomerContactList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = data.map((data, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          shop_name: data.shop_name,
          first_name: data.first_name + ' ' + data.last_name,
          phone: data.phone,
          contact_type_name: data.contact_type_name,
          created_at: data.created_at,
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
                items: [
                  {
                    key: 1,
                    label: (
                      <ItemDropDown
                        mode="view"
                        onClick={() => {
                          navigate("/customer/contact/view", {
                            state: {
                              user_contact_id: data.id,
                            },
                          });
                        }}
                      />
                    ),
                  },
                  {
                    key: 2,
                    label: (
                      <ItemDropDown
                        mode="edit"
                        onClick={() => {
                          navigate("/customer/contact/edit", {
                            state: {
                              user_contact_id: data.id,
                            },
                          });
                        }}
                      />
                    ),
                  },
                  {
                    key: 3,
                    label: (
                      <ItemDropDown
                        mode="delete"
                        onClick={() => {
                          handleDelete(data.id);
                        }}
                      />
                    ),
                  },
                ],
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

        console.log('newDataSource : ', newDataSource)
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
              dealer_id: dealerId,
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
    // { key: "keyword", type: "text", label: "Sub Dealer", placeholder: "All" },
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
      key: "channel_type",
      type: "select",
      label: "Status Type",
      placeholder: "All",
      options: [
        {
          "id": "Old",
          "name": "Old"
        },
        {
          "id": "Existing ",
          "name": "Existing "
        },
        {
          "id": "New",
          "name": "New"
        },
      ],
    },
    // {
    //   key: "contact_name",
    //   type: "text",
    //   label: "Contact Name",
    //   placeholder: "All",
    // },
    // {
    //   key: "contact_phone_number",
    //   type: "text",
    //   label: "Phone",
    //   placeholder: "Phone",
    // },
    // {
    //   key: "province",
    //   type: "text",
    //   label: "Province",
    // },
    {
      key: "use_flag",
      type: "select",
      label: "Status",
      placeholder: "All",
      options: Status,
    },
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
        <div className="title-page">Customer Support</div>
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
