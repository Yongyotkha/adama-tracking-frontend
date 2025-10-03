// src/pages/settings/mobile/point_campaign/PointCampaignList.jsx
import React, { useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import { Dropdown } from "antd";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";
import dayjs from "dayjs";

export default function PointCampaignList() {
  const navigate = useNavigate();

  // loading states
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // table
  const [dataSource, setDataSource] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  // masters for filters
  const [groupOptions, setGroupOptions] = useState([]); // /target-group/group
  const [typeOptions, setTypeOptions] = useState([]);   // /target-group/type (depends on group)
  const [filterValues, setFilterValues] = useState({});

  // ------- load target-group master (group) once -------
  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathTargetGroupMasterGroup, {});
        // [{ id, name }]
        const opts = (res?.data || []).map((x) => ({
          id: String(x.id),
          name: String(x.name ?? "-"),
        }));
        setGroupOptions(opts);
      } catch (e) {
        console.error("Load group master failed:", e);
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------- when group_id changes -> load type master with { target: group_id } -------
  useEffect(() => {
    const g = filterValues?.group_id;
    if (!g) {
      setTypeOptions([]);
      return;
    }
    const groupId = typeof g === "object" && g.value ? g.value : g;
    const loadTypes = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathTargetGroupMasterType, { target: String(groupId) });
        const opts = (res?.data || []).map((x) => ({
          id: String(x.id),
          name: String(x.name ?? "-"),
        }));
        setTypeOptions(opts);
      } catch (e) {
        console.error("Load type master failed:", e);
        setTypeOptions([]);
      }
    };
    loadTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues?.group_id]);

  // ------- filters config (new spec) -------
  const filters = [
    { key: "campaign_name", type: "text", label: "Campaign Name" },
    {
      key: "group_id",
      type: "select",
      label: "Customer Group",
      options: groupOptions, // from /target-group/group
    },
    {
      key: "type_id",
      type: "select",
      label: "Type",
      options: typeOptions,   // depends on group
      disabled: !filterValues?.group_id, // lock until group selected
    },
    {
      key: "campaign_product",
      type: "select",
      label: "Product Scope",
      options: [
        { id: "1", name: "All Product" },
        { id: "2", name: "Product Category" },
        { id: "3", name: "Specific Product" },
      ],
    },
    {
      key: "campaign_type",
      type: "select",
      label: "Campaign Type",
      options: [
        { id: "1", name: "Extra Point" },
        { id: "2", name: "Topup Point" },
        { id: "3", name: "X-Point" },
      ],
    },
    {
      key: "status",
      type: "select",
      label: "Status",
      options: [
        { id: "0", name: "Inactive" },
        { id: "1", name: "Active" },
      ],
    },
    { key: "dater", type: "dater", label: "Period" }, // will send ["YYYY-MM-DD","YYYY-MM-DD"]
  ];

  // ------- columns -------
  const header = [
    { title: "No", dataIndex: "key" },
    { title: "Campaign Name", dataIndex: "name" },
    { title: "Customer Group", dataIndex: "customer_type_name" },
    { title: "Type Name", dataIndex: "type_name" },
    { title: "Product", dataIndex: "product_name" },
    { title: "Campaign", dataIndex: "campaign" },
    { title: "Period", dataIndex: "period" },
    { title: "Status", dataIndex: "status" },
    { title: "Action", dataIndex: "action" },
  ];

  const buildCustomerTypeName = (item) => {
    const gp = item?.group;
    if (!gp || typeof gp !== "object") return item?.customer_type_name ?? "-";

    // เรียงตามคีย์ตัวเลข 1,2,3 แล้ว join เป็น string
    const names = Object.entries(gp)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, v]) => String(v).trim())
      .filter(Boolean);

    return names.length ? names.join(", ") : (item?.customer_type_name ?? "-");
  };

  const buildCustomerTypeSubName = (item) => {
    const gp = item?.group_sub;
    if (!gp || typeof gp !== "object") return item?.customer_type_name ?? "-";

    // เรียงตามคีย์ตัวเลข 1,2,3 แล้ว join เป็น string
    const names = Object.entries(gp)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, v]) => String(v).trim())
      .filter(Boolean);

    return names.length ? names.join(", ") : (item?.customer_type_name ?? "-");
  };

  // ------- fetch list with new filter spec -------
  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    const requestData = {
      status: f.status ?? "",                         // 1/0
      campaign_name: f.campaign_name ?? "",          // text like
      group_id: f.group_id ?? "",                    // id from /target-group/group
      type_id: f.type_id ?? "",                      // id from /target-group/type
      campaign_product: f.campaign_product ?? "",    // 1,2,3
      campaign_type: f.campaign_type ?? "",          // 1,2,3
      dater: Array.isArray(f.dater) ? f.dater : [],  // ["YYYY-MM-DD","YYYY-MM-DD"]
      page_size: pageSize,
      page_length: current,
    };

    try {
      const res = await useServiceAPI.get(paths.pathPointCampaignList, requestData);
      const payload = res?.data || {};
      const list = payload?.data || [];

      const formattedData = list.map((item, index) => ({
        key: index + 1 + (current - 1) * pageSize,
        name: item.name,
        customer_type_name: buildCustomerTypeName(item),
        type_name:  buildCustomerTypeSubName(item),
        product_name: item.product_name,
        campaign: item.type_name,
        period: `${formatDate(item.date_start)} - ${formatDate(item.date_end)}`,
        status: (
          <BadgeStatus
            text={item.status_mapping_name}
            bgColor={item.status_mapping_bg_color}
            textColor={item.status_mapping_color}
          />
        ),
        action: (
          <Dropdown
            menu={{
              items: (item.action || []).map((act, i) => ({
                key: i,
                label: (
                  <ItemDropDown
                    mode={String(act.action || "").toLowerCase()}
                    onClick={() =>
                      navigate(
                        `/setting/line/point-campaign/${String(act.action || "").toLowerCase()}`,
                        { state: { id: item.id } }
                      )
                    }
                  />
                ),
              })),
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <img src="/img/icons/action.png" alt="action" className="w-5 h-5" />
            </a>
          </Dropdown>
        ),
      }));

      setDataSource(formattedData);
      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total:
            payload?.records_filtered ??
            payload?.records_total ??
            formattedData.length,
        },
      }));
    } catch (error) {
      console.error("Failed to fetch:", error);
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

  // ------- filter handlers -------
  const handleSearch = (filtersFromUI) => {
    // ถ้า group เปลี่ยน ให้เคลียร์ type อัตโนมัติ กันค่าค้าง
    const nextFilters =
      filtersFromUI?.group_id !== filterValues?.group_id
        ? { ...filtersFromUI, type_id: "" }
        : { ...filtersFromUI };

    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: nextFilters,
    }));
    setFilterValues(nextFilters);
  };

  const handleClear = () => {
    setFilterValues({});
    setTypeOptions([]);
    setTableParams((prev) => ({
      ...prev,
      filters: {},
    }));
  };

  // ใช้ onChange เพื่อทำ cascade โหลด type แบบ realtime
  const handleChange = (values) => {
    if (values?.group_id !== filterValues?.group_id) {
      values.type_id = "";
    }
    setFilterValues(values);
  };

  const formatDate = (dateStr) =>
    dateStr ? dayjs(dateStr).format("DD/MM/YYYY") : "-";

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Point Campaign</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() =>
            navigate("/setting/line/point-campaign/create", {
              state: { mode: "create" },
            })
          }
        />
      </div>

      <Filter
        filters={filters}
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleChange}
        values={filterValues}
      />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          loading={tableLoading}
          pagination={tableParams.pagination}
          onChange={(pagination) =>
            setTableParams((prev) => ({
              ...prev,
              pagination,
            }))
          }
        />
      </BoxPrimary>
    </MainLayout>
  );
}
