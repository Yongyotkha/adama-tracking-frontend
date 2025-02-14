import React, { useState, useEffect } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import TableComponent from "../../../components/table/TableComponent";
import { Dropdown, Menu, Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { paths } from "../../../services/CorsPath";
import useServiceAPI from "../../../services/CorsService";
import BadgeStatus from "../../../components/badge/BadgeStatus";

export default function SampleExpense() {
  const { confirm } = Modal;
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
  const navigate = useNavigate();

  const filters = [
    {
      key: "name",
      type: "select",
      label: "Name",
      placeholder: "All",
      options: [],
    },
  ];

  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

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

  const handleClear = () => {
    setTableParams({
      ...tableParams,
      filters: {},
    });
  };

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      keyword: filters.keyword || "",
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathSampleExpenseList,
        requestData
      );
      console.log(response);
      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = data.map((row, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          document_number: row.document_number,
          document_datetime: row.document_datetime,
          sub_dealer_name: row.sub_dealer_name,
          dealer_name: row.dealer_name,
          value: row.value,
          crop_name: row.crop_name,
          action: (
            <Dropdown
              menu={{
                items: row.action.map((actionItem, actionIndex) => {
                  return {
                    key: actionIndex,
                    label: (
                      <ItemDropDown
                        mode={actionItem.action.toLowerCase()}
                        onClick={() => {
                          navigate(
                            `/expenses/sample/${actionItem.action.toLowerCase()}`,
                            {
                              state: {
                                document_number: row.document_number,
                              },
                            }
                          );
                        }}
                      />
                    ),
                  };
                }),
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
          status: (
            <BadgeStatus
              text={row.transaction_status_name}
              bgColor={row.transaction_status_bg_color}
              textColor={row.transaction_status_color}
            />
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

  const handleDelete = (code) => {
    confirm({
      title: "Do you want to delete this material?",
      icon: <ExclamationCircleFilled />,
      onOk: () => {
        console.log(`Deleting material with code: ${code}`);
        setDataSource(dataSource.filter((item) => item.code !== code));
      },
    });
  };

  const header = [
    { title: "Code", dataIndex: "document_number", align: "left" },
    { title: "Date", dataIndex: "document_datetime", align: "left" },
    { title: "Sub Dealer", dataIndex: "sub_dealer_name", align: "left" },
    { title: "Dealer", dataIndex: "dealer_name", align: "left" },
    { title: "Crop", dataIndex: "crop_name", align: "center" },
    { title: "Value", dataIndex: "value", align: "right" },
    { title: "Status", dataIndex: "status", align: "center" },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Sample Expense</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() => navigate("/expenses/sample/create")}
        />
      </div>
      <Filter
        filters={filters}
        onSearch={(filters) => console.log("Search filters:", filters)}
        onClear={() => console.log("Clear filters")}
        onChange={() => {}}
      />
      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={{ pageSize: 10 }}
          scroll
        />
      </BoxPrimary>
    </MainLayout>
  );
}
