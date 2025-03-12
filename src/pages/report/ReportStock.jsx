import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Filter from "../../components/filter/Filter";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";
import Title from "../../components/title/Title";

import TableExpand from "../../components/table/TableExpand";

export default function ReportStock() {
  const [loading, setLoading] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [dataSource, setDataSource] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const { showNotification, formatNumber } = useContext(AuthContext);
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
        const [years, sales, activity, dealers] = await Promise.all([
          useServiceAPI.get(paths.pathMasterYear),
          useServiceAPI.get(paths.pathMasterSaleDropdown),
          useServiceAPI.get(paths.pathMasterActivityType),
          useServiceAPI.get(paths.pathMasterDealerAll),
        ]);
        setYears(years.data);
        setSales(sales.data);
        setActivity(activity.data);
        setDealers(dealers.data);

        if (years.data.length > 0) {
          setTableParams({
            ...tableParams,
            filters: { year_code: years.data[0] },
          });
        }
      } catch (error) {
        showNotification("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    // getMaster();
  }, []);

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      keyword: filters.keyword || "",
      year_code: filters.year_code,
      user_id: filters.user_id,
      dealer_id: filters.dealer_id,
      page_length: 1,
      page_size: pageSize,
    };

    console.log(requestData);

    try {
      const response = await useServiceAPI.get(
        paths.pathReportSaleByActivity,
        requestData
      );

      if (response.status === 200) {
        const { data_items, records_filtered, permission, items } =
          response.data;
        console.log(response.data);

        const newDataSource = items.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          activity_type: row.activity_type_name,
          activity_type_id: row.activity_type_id,

          nestedData: row.sub_items.map((subItem, index) => ({
            key: subItem.sale_management_item_id,
            no: index + 1,
            name: subItem.name,
            position: subItem.position_name,
            territory: subItem.territory_name,
            actionsubitem: (
              <>
                <DynamicButton
                  iconSrc="/img/icons/delete.png"
                  onClick={() =>
                    handleDeleteItem(subItem.sale_management_item_id)
                  }
                />
              </>
            ),
          })),
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

  // useEffect(() => {
  //   if (years.data.length > 0) {
  //     fetchData();
  //   }
  // }, [
  //   JSON.stringify(tableParams.filters),
  // ]);

  const handleTableChange = (pagination, filters, sorter) => {
    console.log(pagination, filters, sorter);
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      // sortOrder: sorter.order === "descend" ? "desc" : "asc",
      // sortField: sorter.field,
    });
  };

  const filters = [
    {
      key: "dealer",
      type: "select",
      label: "Dealer",
      options: [],
    },
    {
      key: "sub_dealer",
      type: "select",
      label: "Sub Dealer",
      options: [],
      size: 18,
    },

    {
      key: "start_date",
      type: "date",
      label: "Start Date",
      options: [],
    },
    {
      key: "end_date",
      type: "date",
      label: "End Date",
      options: [],
    },
  ];

  const handleSearch = (filters) => {
    setTableParams({
      ...tableParams,
      filters,
      pagination: {
        current: 1,
        pageSize: 10,
      },
    });
  };

  const handleClear = () => {ได
    setTableParams({
      ...tableParams,
      filters: {},
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      width: 200,
    },
    {
      title: "Territory",
      dataIndex: "territory",
      key: "territory",
      width: 150,
    },
    {
      title: "Action",
      dataIndex: "actionmain",
      key: "actionmain",
      width: 100,
    },
  ];

  // Define the nested table columns
  const nestedColumns = [
    { title: "No", dataIndex: "no", key: "no", width: 80 },
    { title: "Name", dataIndex: "name", key: "name", width: 150 },
    { title: "Position", dataIndex: "position", key: "position", width: 200 },
    {
      title: "Territory",
      dataIndex: "territory",
      key: "territory",
      width: 150,
    },
    { title: "Action", dataIndex: "actionsubitem", key: "action", width: 100 },
  ];

  return (
    <>
      <MainLayout loading={loading} childrenStyle={""}>
        <Title prefix="Stock Report" />

        <Filter
          onSearch={handleSearch}
          onClear={handleClear}
          filters={filters}
        />

        {dataSource.length > 0 && (
          <BoxPrimary>
            <TableExpand
              // pagination={tableParams.pagination}
              // onChange={handleTableChange}
              data={dataSource}
              columns={columns}
              nestedColumns={nestedColumns}
            />
          </BoxPrimary>
        )}
      </MainLayout>
    </>
  );
}
