import React, { useContext, useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown, Modal } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import DynamicButton from "../../../components/button/DynamicButton";
import DynamicModal from "../../../components/modal/DynamicModal";
import useServiceAPI from "../../../services/corsService";
import { paths } from "../../../services/CorsPath";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";

export default function SettingProduct() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [roles, setRoles] = useState([]);
  const [Status, setStatus] = useState([]);
  const [producttype, setPosition] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const navigate = useNavigate();

  const { userInfo, showMsg, showNotification } = useContext(AuthContext);

  const [modalConfig, setModalConfig] = useState({
    title: "",
    isVisible: false,
    header: [],
    dataSource: [],
  });
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
        const [producttype, roles, dataStatus] = await Promise.all([
          useServiceAPI.get(paths.pathMasterProductCategorys, {}),
          useServiceAPI.get(paths.pathMasterProductGroups, {}),
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "status",
          }),
        ]);

        const Status = [];
        dataStatus.data.map((data, index) => {
          Status.push({
            id: data.code,
            name: data.name,
          });
        });

        setStatus(Status);

        setPosition(producttype.data);
        setRoles(roles.data);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
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

  const handleDeleteItem = (id, productName) => {
    Modal.confirm({
      title: "ลบสินค้า",
      content: `ต้องการลบสินค้า${productName ? ` "${productName}"` : ""} ใช่หรือไม่?`,
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        try {
          const response = await useServiceAPI.delete(
            paths.pathSaleManagementProductsDelete,
            { id }
          );

          if (response.status === 200) {
            showNotification(
              "success",
              response.message || "ลบสำเร็จ",
              response.message_line || response.data?.message_line
            );
            fetchData();
          } else {
            showNotification(
              "error",
              response.message || "ลบไม่สำเร็จ",
              response.message_line
            );
          }
        } catch (error) {
          showNotification(
            "error",
            error.message || "ลบไม่สำเร็จ",
            error.message_line
          );
        }
      },
    });
  };

  const ACTION_PATHS = {
    view: "/setting/product/view",
    edit: "/setting/product/edit",
  };

  const handleActionClick = (item, actionItem, event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const mode = String(actionItem?.action || "").toLowerCase();

    if (mode === "delete") {
      handleDeleteItem(item.id, item.product_name);
      return;
    }

    if (mode === "edit" || mode === "view") {
      const path = actionItem?.action_url || ACTION_PATHS[mode];
      navigate(path, {
        state: {
          id: item.id,
          mode,
        },
      });
    }
  };

  const formatPackingUnitSize = (value) => {
    if (!value) return "-";
    let number = parseFloat(value);
    // Use the logic for formatting
    number = (number === 0 ? 0 : number.toFixed(2).replace(/\.00$/, ""));
    return number;
  };


  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const requestData = {
      keyword: filters.keyword || "",
      category_id: filters.category_id || "",
      // role_id: filters.role || "",
      use_flag: filters.use_flag || "",
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathSaleManagementProductsList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;
        const newDataSource = data.map((item, index) => ({
          key: index + 1 + (current - 1) * pageSize,
          id: item.id,
          product_code: item.product_code,
          product_type: item.product_type,
          product_group: item.product_group,
          category: item.product_category,
          product_name: item.product_name,
          baht_per_lt_kg: item.bath_ltkg,
          baht_per_unit: item.bath_unit,
          sub_dealer: item.sub_dealer,
          farmer: item.farmer,
          pack_size: item.packing_list,

          crop: (
            <BadgeStatus
              text={item.crop_count}
              bgColor={item.status_bg_color}
              textColor={item.status_color}
              onClick={() =>
                showModal(
                  "Crop",
                  cropColumns,
                  (item.crop_list || []).map((crop, cropIndex) => ({
                    key: cropIndex + 1,
                    id: crop.id,
                    name: crop.name,
                  }))
                )
              }
            />
          ),
          status: (
            <BadgeStatus
              text={item.status_name}
              bgColor={item.status_bg_color}
              textColor={item.status_color}
            />
          ),
          action: (
            <Dropdown
              menu={{
                items: (item.action || []).map((actionItem, actionIndex) => {
                  const mode = String(actionItem.action || "").toLowerCase();
                  const actionPath = actionItem.action_url || ACTION_PATHS[mode];
                  return {
                    key: `${item.id}-${mode}-${actionIndex}`,
                    label: (
                      <ItemDropDown
                        mode={mode}
                        text={actionItem.action}
                        link={actionPath}
                        onClick={(event) => handleActionClick(item, actionItem, event)}
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


  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "left" },
    {
      title: "Keyword",
      width: 190,
      dataIndex: "product_code",
      align: "left",
    },
    {
      title: "Product Type",
      width: 150,
      dataIndex: "product_type",
      align: "left",
    },
    {
      title: "Product Group",
      width: 150,
      dataIndex: "product_group",
      align: "left",
    },
    { title: "Category", width: 100, dataIndex: "category", align: "left" },
    {
      title: "Product Name",
      width: 200,
      dataIndex: "product_name",
      align: "left",
    },
    {
      title: "Baht/lt,kg",
      width: 100,
      dataIndex: "baht_per_lt_kg",
      align: "right",
    },
    {
      title: "Baht/unit",
      width: 100,
      dataIndex: "baht_per_unit",
      align: "right",
    },
    {
      title: "Sub Dealer",
      width: 100,
      dataIndex: "sub_dealer",
      align: "right",
    },
    {
      title: "Farmer",
      width: 100,
      dataIndex: "farmer",
      align: "right",
    },
    { title: "Pack Size", width: 160, dataIndex: "pack_size", align: "center" },
    { title: "Crop", width: 100, dataIndex: "crop", align: "center" },
    {
      title: "Status",
      width: 100,
      dataIndex: "status",
      align: "left",
    },
    // { title: "Action", width: 100, dataIndex: "action", align: "center" },
    // 👇 Add this only if admin (role_id = 1)
    ...(parseInt(userInfo.role_id) === 1
      ? [
        {
          title: "Action",
          width: 100,
          dataIndex: "action",
          align: "center",
        },
      ]
      : []),
  ];

  const filters = [
    {
      key: "keyword",
      type: "text",
      label: "Product Code/Name",
      placeholder: "All",
    },
    {
      key: "category_id",
      type: "select",
      label: "Category",
      options: producttype,

    },
    // {
    //   key: "category_Group",
    //   type: "select",
    //   label: "Product Group",
    //   options: roles,
    // },
    {
      key: "use_flag",
      label: "Status",
      type: "select",
      options: Status,

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

  const showModal = (title, header, dataSource) => {
    setModalConfig({
      title,
      isVisible: true,
      header,
      dataSource,
    });
  };

  const handleCloseModal = () => {
    setModalConfig({ ...modalConfig, isVisible: false });
  };

  const cropColumns = [
    { title: "No", dataIndex: "key", key: "key", width: 50 },
    { title: "Name", dataIndex: "name", key: "name" },
  ];


  const actionItems = [
    {
      key: "1",
      label: (
        <a
          rel="noopener noreferrer"
          href="/setting/product/edit"
          className="flex gap-1"
        >
          <img
            src="/img/icons/edit.png"
            alt="Edit icon"
            className="inline-block h-4"
          />
          <span className="text-[#978B87]">Edit</span>
        </a>
      ),
    },
    {
      key: "2",
      label: (
        <a rel="noopener noreferrer" href="#" className="flex gap-1">
          <img
            src="/img/icons/delete.png"
            alt="Delete icon"
            className="inline-block h-4"
          />
          <span className="text-[#978B87]">Delete</span>
        </a>
      ),
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

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Product Management</div>
        <ActionButton
          mode="create"
          text="Create Product"
          onClick={() => navigate("/setting/product/create", { state: { mode: "create" } })}
          className="ms-auto me-2"
        />
      </div>

      <Filter
        onSearch={handleSearch}
        onClear={handleClear}
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

      <DynamicModal
        title={modalConfig.title}
        isVisible={modalConfig.isVisible}
        onClose={handleCloseModal}
        header={modalConfig.header}
        dataSource={modalConfig.dataSource}
      />

    </MainLayout>
  );
}
