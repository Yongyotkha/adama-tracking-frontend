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

        const Status = [];
        dataStatus.data.map((data, index) => {
          Status.push({
            id: data.code,
            name: data.name,
          });
        });

        // console.log('dealer : ', dealer)
        // set_dealers(dealer.data)
        setStatus(Status);
        setSaleList(sale.data);
        setPosition(producttype.data);
        setRoles(roles.data);
      } catch (error) {
        showMsg("error", error.message || "error");
      } finally {
        setLoading(false);
      }
    };
    getMaster();
  }, []);


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
          set_dealers(response.data);
        } catch (error) {
          showMsg("error", error.message || "เกิดข้อผิดพลาดในการโหลด Dealer");
        }
      };

      getDealersBySale();
    }
  }, [filterValues.sale]);

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
    console.log('----------fetch------------', filters)
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

  const handleSearch = (filters) => {
    const set = {
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1, // Reset current page to 1
        pageSize: 10, // Ensure the page size is set to 10
      },
      filters: {
        ...filters,
        page_length: 1, // Set default page_length
        page_size: 10, // Set default page_size
      },
    };
    console.log("set : ", set);
    console.log("dataSource : ", dataSource);
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
      label: "Dealers",
      placeholder: "All",
      options: dealers,
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
    setTableParams({
      ...tableParams,
      filters: {},
    });
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
    { title: "By Sales", width: 150, dataIndex: "sale", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const actionItems = [
    {
      key: "1",
      label: <ItemDropDown mode="edit" link="/customer/dealer/edit-info" />,
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };


  const handleChange = (filters) => {
    setFilterValues(filters);
  };




  return (
    <MainLayout loading={loading}>
      <div className="title-page">Dealer</div>
      {/* 
      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} /> */}

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
