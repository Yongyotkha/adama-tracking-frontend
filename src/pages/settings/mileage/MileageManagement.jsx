import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown } from "antd";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/corsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export default function MileageManagement() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
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

  const { userInfo } = useContext(AuthContext);

  const navigate = useNavigate();

  const header = [
    { title: "No", width: 50, dataIndex: "no", align: "left" },
    { title: "Date", width: 150, dataIndex: "date", align: "left" },
    { title: "Mileage", width: 150, dataIndex: "mileage", align: "right" },
    { title: "Name", width: 200, dataIndex: "name", align: "left" },
    { title: "Last Modified", width: 150, dataIndex: "lastModified", align: "left" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;

    const filters = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "asc";
    const sortField = tableParams.sortField || "name";

    const today = dayjs();
    const startOfMonth = today.startOf("month").format("YYYY-MM-DD");
    const endOfToday = today.format("YYYY-MM-DD");
    // console.log(userInfo);
    const requestData = {
      user_id: userInfo.id,
      start_date: startOfMonth,
      end_date: endOfToday,
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(paths.pathMileageList, requestData);

      // const formatNumber = (val) =>
      //   !isNaN(Number(val)) ? new Intl.NumberFormat().format(val) : "-";
      const formatNumber = (val) =>
        !isNaN(Number(val))
          ? Number(val).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          : "-";


      if (response.status === 200) {
        const result = response.data;
        console.log(result);
        const newDataSource = result.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          no: index + 1 + (current - 1) * pageSize,
          date: item.date || "-",
          mileage: formatNumber(item.mileage) || "-",
          name: item.user_name, // No name in API, fallback
          lastModified: "-", // No lastModified in API, fallback
          action: (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "edit",
                    label: (
                      <ItemDropDown
                        mode="edit"
                        onClick={() =>
                          navigate("/setting/mileage/edit", {
                            state: {
                              user_id: item.user_id,
                              date: item.date,
                              mode: "edit",
                            },
                          })
                        }
                      />
                    ),
                  },
                  // {
                  //   key: "delete",
                  //   label: (
                  //     <ItemDropDown
                  //       mode="delete"
                  //       // onClick={() => handleDelete(item.user_id)}
                  //     />
                  //   ),
                  // },
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

        setDataSource(newDataSource);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: result.length,  // <-- no records_filtered, use array length
          },
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }

  };

  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };

  const filters = [
    {
      key: "keyword",
      type: "text",
      label: "Name",
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


  return (
    <MainLayout loading={loading}>

      <div className="flex items-center justify-between">
        <div className="title-page">Mileage Management</div>
        {/* <ActionButton mode="create" text="Create" onClick={(e) => navigate("/setting/promotion/create")} /> */}
      </div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        filters={filters}
        onChange={handleTableChange}
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
