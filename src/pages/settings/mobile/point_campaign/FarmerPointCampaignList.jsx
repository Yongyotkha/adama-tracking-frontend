import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import { Dropdown, Modal, notification } from "antd";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import { AuthContext } from "../../../../contexts/AuthContext";

export default function FarmerPointCampaignList() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [dataSource, setDataSource] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  const [groupOptions, setGroupOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const { showNotification } = useContext(AuthContext);

  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathTargetGroupMasterGroup, {});
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
  }, []);

  useEffect(() => {
    const g = filterValues?.group_id;
    if (!g) {
      setTypeOptions([]);
      return;
    }
    const groupId = typeof g === "object" && g.value ? g.value : g;
    const loadTypes = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathTargetGroupMasterType, {
          target: String(groupId),
        });
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
  }, [filterValues?.group_id]);

  const filters = [
    { key: "campaign_name", type: "text", label: "Campaign Name" },
    { key: "document_number", type: "text", label: "Campaign Code" },
    {
      key: "group_id",
      type: "select",
      label: "Customer Group",
      options: groupOptions,
    },
    {
      key: "type_id",
      type: "select",
      label: "Type",
      options: typeOptions,
      disabled: !filterValues?.group_id,
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
    { key: "dater", type: "dater", label: "Period" },
  ];

  const header = [
    { title: "No", dataIndex: "key" },
    { title: "ID", dataIndex: "id" },
    { title: "Code", dataIndex: "document_number" },
    { title: "Campaign Name", dataIndex: "name" },
    { title: "Customer Group", dataIndex: "customer_type_name" },
    { title: "Type Name", dataIndex: "type_name" },
    { title: "Product", dataIndex: "product_name" },
    { title: "Campaign", dataIndex: "campaign" },
    { title: "Created At", dataIndex: "created_at" },
    { title: "Period", dataIndex: "period" },
    { title: "Status", dataIndex: "status" },
    { title: "Action", dataIndex: "action" },
  ];

  const buildCustomerTypeName = (item) => {
    const gp = item?.group;
    if (!gp || typeof gp !== "object") return item?.customer_type_name ?? "-";
    const names = Object.entries(gp)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, v]) => String(v).trim())
      .filter(Boolean);
    return names.length ? names.join(", ") : (item?.customer_type_name ?? "-");
  };

  const buildCustomerTypeSubName = (item) => {
    const gp = item?.group_sub;
    if (!gp || typeof gp !== "object") return item?.customer_type_name ?? "-";
    const names = Object.entries(gp)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, v]) => String(v).trim())
      .filter(Boolean);
    return names.length ? names.join(", ") : (item?.customer_type_name ?? "-");
  };

  const handleDelete = async (documentNumber) => {
    try {
      const response = await useServiceAPI.delete(paths.pathPointCampaignDelete, {
        document_number: documentNumber,
        mode: "farmer",
      });
      if (response.status === 200) {
        notification.success({ message: "ลบข้อมูลสำเร็จ" });
        fetchData();
      }
    } catch (error) {
      showNotification?.("แจ้งเตือน", "เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    const requestData = {
      status: f.status ?? "",
      campaign_name: f.campaign_name ?? "",
      document_number: f.document_number ?? "",
      group_id: f.group_id ?? "",
      type_id: f.type_id ?? "",
      campaign_product: f.campaign_product ?? "",
      campaign_type: f.campaign_type ?? "",
      dater: Array.isArray(f.dater) ? f.dater : [],
      page_size: pageSize,
      page_length: current,
      mode: "farmer",
    };

    try {
      const res = await useServiceAPI.get(paths.pathPointCampaignList, requestData);
      if (res?.status === 200) {
        const list = res.data?.data || res.data || [];
        const total = res.data?.records_filtered || list.length;

        const rows = list.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          id: item.id,
          document_number: item.document_number,
          name: item.name,
          customer_type_name: buildCustomerTypeName(item),
          type_name: buildCustomerTypeSubName(item),
          product_name: item.product_name,
          campaign: item.campaign,
          created_at: item.created_at,
          period: item.period,
          status: (
            <BadgeStatus
              text={item.status_name || (item.status === 1 ? "Active" : "Inactive")}
              bgColor={item.status === 1 ? "#E6F4EA" : "#FEE2E2"}
              textColor={item.status === 1 ? "#137333" : "#DC2626"}
            />
          ),
          action: (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "view",
                    label: (
                      <ItemDropDown
                        mode="view"
                        onClick={() =>
                          navigate("/setting/line/farmer-point-campaign/view", {
                            state: { id: item.id },
                          })
                        }
                      />
                    ),
                  },
                  {
                    key: "delete",
                    label: (
                      <ItemDropDown
                        mode="delete"
                        onClick={() => handleDelete(item.document_number)}
                      />
                    ),
                  },
                ],
              }}
              trigger={["click"]}
            >
              <button className="p-1 hover:bg-gray-100 rounded">...</button>
            </Dropdown>
          ),
        }));

        setDataSource(rows);
        setTableParams((prev) => ({
          ...prev,
          pagination: { ...prev.pagination, total },
        }));
      }
    } catch (e) {
      console.error("fetch Farmer Point Campaign failed", e);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tableParams.pagination.current, tableParams.pagination.pageSize, tableParams.filters]);

  const handleSearch = () => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: filterValues,
    }));
  };

  const handleClear = () => {
    setFilterValues({});
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
      filters: {},
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilterValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableChange = (pagination) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: pagination.current, pageSize: pagination.pageSize },
    }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Point Campaign (Farmer)</div>
      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
        onChange={handleChange}
        filters={filters}
        values={filterValues}
      />
      <BoxPrimary>
        <div className="flex justify-end mb-3">
          <ActionButton
            text="Create"
            icon="/img/icon-plus.png"
            onClick={() => navigate("/setting/line/farmer-point-campaign/create")}
          />
        </div>
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
