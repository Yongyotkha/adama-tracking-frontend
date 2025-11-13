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

  // page states
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  // masters
  const [Status, setStatus] = useState([]);
  const [saleList, setSaleList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);

  // keep current filter values (for cascade)
  const [filterValues, setFilterValues] = useState({});

  // table params
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    filters: {},
  });

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
      options: dealerList,
      moderef: true,
    },
    {
      key: "shop",
      type: "select",
      label: "Sub Dealer",
      placeholder: "All",
      options: subDealerList,
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
    {
      key: "use_flag",
      type: "select",
      label: "Status",
      placeholder: "All",
      options: Status,
    },
    // ✅ เพิ่ม filter Create Date
    {
      key: "create_date",
      type: "date", // ให้ตรงกับที่ Filter รองรับ (เช่น range picker)
      label: "Create Date",
      placeholder: "Select date",
    },
  ];

  // ---------- Table header ----------
  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Dealer Name", width: 200, dataIndex: "dealerName", align: "left" },
    { title: "Sub Dealer Name", width: 200, dataIndex: "subDealerName", align: "left" },
    { title: "Contact Name", width: 200, dataIndex: "contactName", align: "left" },
    { title: "Contact Number", width: 150, dataIndex: "phone", align: "center" },
    { title: "Address", width: 300, dataIndex: "address", align: "left" },
    { title: "By Sales", width: 150, dataIndex: "sale", align: "center" },
    { title: "Status Type", width: 100, dataIndex: "channel_type", align: "center" },
    // ✅ คอลัมน์ Create Date
    {
      title: "Create Date",
      width: 140,
      dataIndex: "createDate",
      align: "center",
    },
    { title: "Status", width: 100, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  // ---------- Load master (status + sales) ----------
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

        const statusOpts = (dataStatus?.data || []).map((data) => ({
          id: data.code,
          name: data.name,
        }));

        setStatus(statusOpts);
        setSaleList(sale.data || []);
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    getMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Cascade: Sales -> Dealer ----------
  useEffect(() => {
    const sale = filterValues.sale;

    if (!sale) {
      setDealerList([]);
      setSubDealerList([]);
      return;
    }

    const userId = typeof sale === "object" && sale.value ? sale.value : sale;

    const getDealersBySale = async () => {
      try {
        const response = await useServiceAPI.get(
          paths.pathMasterDealerDropdown,
          { user_id: userId }
        );
        setDealerList(response.data || []);
        setSubDealerList([]); // reset sub-dealer list
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาดในการโหลด Dealer");
      }
    };

    getDealersBySale();
  }, [filterValues.sale]);

  // ---------- Cascade: Dealer -> SubDealer ----------
  useEffect(() => {
    const sale = filterValues.sale;
    const dealer = filterValues.dealers;

    if (!dealer) {
      setSubDealerList([]);
      return;
    }

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

        const formattedSubDealer = (response.data || []).map((item) => ({
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
  }, [filterValues.dealers, filterValues.sale]);

  // ---------- Delete handler (ใช้ popup component: Modal.confirm) ----------
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
          const response = await useServiceAPI.delete(
            paths.pathDeleteSubDealer,
            { id }
          );

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

  // ---------- Fetch data ----------
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
      user_id: filters.sale || "",
      dealer_id: filters.dealers || "",
      sub_dealer_id: filters.shop || "",
      province: filters.province || "",
      channel_type: filters.channel_type || "",
      // ✅ filter create date (สมมติเป็น array [start, end])
      create_date_start:
        filters.create_date && filters.create_date[0]
          ? filters.create_date[0]
          : "",
      create_date_end:
        filters.create_date && filters.create_date[1]
          ? filters.create_date[1]
          : "",
      // ✅ sort ตาม created_at ล่าสุดไปเก่า (ให้ backend ใช้ถ้ารองรับ)
      sort_field: "created_at",
      sort_order: "desc",
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathCustomerSubDealerList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = (data || []).map((item, index) => {
          const id = item.id;

          // build action items แบบ TargetGroupList
          const items =
            (item.action || []).map((actionItem, actionIndex) => {
              const action = actionItem.action;

              if (action === "Delete") {
                return {
                  key: `delete-${actionIndex}`,
                  label: (
                    <ItemDropDown
                      mode="delete"
                      onClick={() => handleDelete(id)}
                    />
                  ),
                };
              }

              const navTarget =
                action === "View"
                  ? "/customer/sub-dealer/view"
                  : "/customer/sub-dealer/edit";

              return {
                key: `${action.toLowerCase()}-${actionIndex}`,
                label: (
                  <ItemDropDown
                    mode={action.toLowerCase()}
                    onClick={() =>
                      navigate(navTarget, {
                        state: { id, mode: action },
                      })
                    }
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
            sale: item.sale_list_name,
            channel_type: item.channel_type,
            // ✅ แสดง created_at เฉพาะวันที่ (เหมือนตัวอย่าง)
            createDate: item.created_at ? item.created_at.split(" ")[0] : "",
            status: (
              <BadgeStatus
                text={item.status_name}
                bgColor={item.status_bg_color}
                textColor={item.status_color}
              />
            ),
            action: (
              <Dropdown
                menu={{ items }}
                placement="bottomRight"
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
          };
        });

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

  // ---------- Effects ----------
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    JSON.stringify(tableParams.filters),
  ]);

  // ---------- Filter handlers ----------
  const handleSearch = (filtersFromUI) => {
    // ถ้า sale/dealer เปลี่ยนจะจัดการ cascade ผ่าน useEffect จาก filterValues อยู่แล้ว
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
    setFilterValues({});
    setDealerList([]);
    setSubDealerList([]);
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  // ใช้ onChange เพื่ออัปเดตค่าฟิลเตอร์ (สำหรับ cascade)
  const handleFilterChange = (values) => {
    setFilterValues(values);
  };

  // ---------- Table change (pagination) ----------
  const handleTableChange = (pagination) => {
    setTableParams((prev) => ({
      ...prev,
      pagination,
    }));
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
