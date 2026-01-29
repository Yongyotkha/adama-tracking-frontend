import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown, Modal } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../services/corsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

export default function SubDealerList() {
  const navigate = useNavigate();
  const { showNotification } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [Status, setStatus] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [targetList, setTargetList] = useState([]); // ✅ NEW

  const [filterValues, setFilterValues] = useState({});

  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  const filters = [
    { key: "sale", type: "select", label: "Sales", placeholder: "All", options: saleList, moderef: true },
    { key: "dealers", type: "select", label: "Dealer", placeholder: "All", options: dealerList, moderef: true },
    { key: "shop", type: "select", label: "Sub Dealer", placeholder: "All", options: subDealerList },
    {
      key: "target_group_id", // ✅ NEW
      type: "select",
      see: "",
      label: "Target",
      placeholder: "All",
      options: targetList,
    },
    {
      key: "channel_type",
      type: "select",
      label: "Status Type",
      placeholder: "All",
      options: [
        { id: "Old", name: "Old" },
        { id: "Existing ", name: "Existing " },
        { id: "New", name: "New" },
      ],
    },
    { key: "use_flag", type: "select", label: "Status", placeholder: "All", options: Status },
    { key: "create_date", type: "date", label: "Create Date", placeholder: "Select date" },
    { key: "name", type: "text", label: "Name", placeholder: "Enter name" },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Dealer Name", width: 200, dataIndex: "dealerName", align: "left" },
    { title: "Sub Dealer Name", width: 200, dataIndex: "subDealerName", align: "left" },
    { title: "Contact Name", width: 200, dataIndex: "contactName", align: "left" },
    { title: "Contact Number", width: 150, dataIndex: "phone", align: "center" },
    { title: "Address", width: 300, dataIndex: "address", align: "left" },
    { title: "Target Group", width: 180, dataIndex: "targetGroupName", align: "left" }, // ✅ NEW
    { title: "By Sales", width: 150, dataIndex: "sale", align: "center" },
    { title: "Status Type", width: 100, dataIndex: "channel_type", align: "center" },
    { title: "Create Date", width: 140, dataIndex: "createDate", align: "center" },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  useEffect(() => {
    const getMaster = async () => {
      setLoading(true);
      try {
        const [dataStatus, sale, dealerRes, subDealerRes, targetRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterStatus, { status_type: "status" }),
          useServiceAPI.get(paths.pathMasterSaleDropdown, {}),
          useServiceAPI.get(paths.pathMasterDealerAll, {}),
          useServiceAPI.get(paths.pathMasterSubDealerAll, {}),
          useServiceAPI.get(paths.pathMasterTarget, { user_type: 2 }), // ✅ NEW
        ]);

        setStatus((dataStatus?.data || []).map((d) => ({ id: d.code, name: d.name })));
        setSaleList(sale?.data || []);
        setDealerList(dealerRes?.data || []);

        setSubDealerList(
          (subDealerRes?.data || []).map((item) => ({
            name: item.sub_dealer_name,
            id: item.sub_dealer_id,
          }))
        );

        const targets = (targetRes?.data || []).map((x) => ({
          id: x.id ?? x.target_group_id ?? x.code,
          name: x.name ?? x.target_group_name ?? x.title,
        }));
        setTargetList(targets);
      } catch (error) {
        console.log(error?.message);
      } finally {
        setLoading(false);
      }
    };
    getMaster();
  }, []);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "ยืนยันการลบ?",
      content: "ลบข้อมูล Sub Dealer นี้ ?",
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        try {
          setTableLoading(true);
          const response = await useServiceAPI.delete(paths.pathDeleteSubDealer, { id });

          if (response?.status === 200) {
            showNotification(
              "success",
              response.data.message || "Event deleted successfully!",
              response.data.message_line || ["The event has been removed."]
            );
            await fetchData();
          } else {
            showNotification(
              "error",
              response.message || "Failed to delete event.",
              response.message_line || ["Please try again later."]
            );
          }
        } catch (error) {
          showNotification("error", error.message, error.message_line);
        } finally {
          setTableLoading(false);
        }
      },
    });
  };

  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    const requestData = {
      keyword: f.keyword || f.name || "",
      use_flag: f.use_flag || "",
      contact_phone_number: f.contact_phone_number || "",
      contact_name: f.contact_name || "",
      page_length: current,
      page_size: pageSize,

      user_id: f.sale || "",
      dealer_id: f.dealers || "",
      sub_dealer_id: f.shop || "",
      target_group_id: f.target_group_id || "", // ✅ NEW
      province: f.province || "",
      channel_type: f.channel_type || "",

      create_date_start: f.create_date && f.create_date[0] ? f.create_date[0] : "",
      create_date_end: f.create_date && f.create_date[1] ? f.create_date[1] : "",

      sort_field: "created_at",
      sort_order: "desc",
    };

    try {
      const response = await useServiceAPI.get(paths.pathCustomerSubDealerList, requestData);

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = (data || []).map((item, index) => {
          const id = item.id;

          const items =
            (item.action || []).map((actionItem, actionIndex) => {
              const action = actionItem.action;

              if (action === "Delete") {
                return {
                  key: `delete-${actionIndex}`,
                  label: <ItemDropDown mode="delete" onClick={() => handleDelete(id)} />,
                };
              }

              const navTarget = action === "View" ? "/customer/sub-dealer/view" : "/customer/sub-dealer/edit";

              return {
                key: `${action.toLowerCase()}-${actionIndex}`,
                label: (
                  <ItemDropDown
                    mode={action.toLowerCase()}
                    onClick={() => navigate(navTarget, { state: { id, mode: action } })}
                  />
                ),
              };
            }) || [];

          return {
            key: index + 1 + (current - 1) * pageSize,
            dealerName: item.dealer_name_en,
            subDealerName: item.name,
            contactName: item.contact_name,
            address: item.contact_address,
            phone: item.mobile_phone,
            targetGroupName: item.target_group_name || "-", // ✅ NEW
            sale: item.sale_list_name,
            channel_type: item.channel_type,
            createDate: item.created_at ? item.created_at.split(" ")[0] : "",
            status: (
              <BadgeStatus text={item.status_name} bgColor={item.status_bg_color} textColor={item.status_color} />
            ),
            action: (
              <Dropdown menu={{ items }} placement="bottomRight">
                <a onClick={(e) => e.preventDefault()}>
                  <img src="/img/icons/action.png" alt="button icon" className="inline-block w-5 h-5 mr-2" />
                </a>
              </Dropdown>
            ),
          };
        });

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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    JSON.stringify(tableParams.filters),
  ]);

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

  const handleFilterChange = (values) => {
    setFilterValues(values);
  };

  const handleTableChange = (pagination) => {
    setTableParams((prev) => ({ ...prev, pagination }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Sub Dealer</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() => navigate("/customer/sub-dealer/create", { state: { mode: "Create" } })}
        />
      </div>

      <Filter
        filters={filters}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onClear={handleClear}
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
