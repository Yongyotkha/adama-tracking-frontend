import React, { useState, useEffect, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import TableComponent from "../../../components/table/TableComponent";
import { Dropdown, Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import dayjs from "dayjs";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import DynamicModal from "../../../components/modal/DynamicModal";

export default function MaterialExpense() {
  const [isTerritoryModalVisible, setIsTerritoryModalVisible] = useState(false);
  const { confirm } = Modal;
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [materialList, setMaterialList] = useState([]);
  const [headerModal, setHeaderModal] = useState([]);
  const [bodyModal, setBodyModal] = useState([]);
  const [modalTitle, setModalTitle] = useState("Detail");
  const navigate = useNavigate();
  const { showMsg, showNotification, userInfo } = useContext(AuthContext);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });

  const filters = [
    {
      key: "code",
      type: "text",
      label: "Code",
      placeholder: "All",
      options: materialList,
    },
  ];

  const goToActionPage = (action, code) => {
    navigate(`/expenses/material/${action}`, {
      state: { documentNumber: code },
    });
  };

  const handleDelete = (code) => {
    confirm({
      title: "Do you want to delete this material?",
      icon: <ExclamationCircleFilled />,
      onOk: async () => {
        try {
          setLoading(true);

          const res = await useServiceAPI.delete(paths.pathExpenseMaterialDel, {
            code: code,
            user_id: userInfo.id,
          });

          if (res.status === 200) {
            showNotification("success", "ลบข้อมูลเรียบร้อยแล้ว");
            fetchData();
          } else {
            showMsg("error", res.data.message || "ไม่สามารถลบข้อมูลได้");
          }
        } catch (err) {
          showMsg("error", err.message || "เกิดข้อผิดพลาดในการลบ");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const header = [
    { title: "#", dataIndex: "index", align: "left" },
    { title: "Code", dataIndex: "code", align: "left" },
    { title: "Crop", dataIndex: "crop", align: "center" },
    { title: "Product", dataIndex: "product", align: "center" },
    { title: "Material Item", dataIndex: "material", align: "center" },
    { title: "Total Value Request", dataIndex: "request", align: "left" },
    { title: "Total Value Warehouse Send", dataIndex: "send", align: "left" },
    { title: "Total Value Receive", dataIndex: "receive", align: "left" },
    { title: "Date", dataIndex: "date", align: "center" },
    { title: "Create By", dataIndex: "create_by", align: "left" },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      render: (_, record) => {
        const actionItems = (record.action || [])
          .map((item, index) => {
            const actionName = item.action?.toLowerCase?.().trim();

            if (actionName === "view") {
              return {
                key: `view-${index}`,
                label: (
                  <ItemDropDown
                    mode="view"
                    onClick={() => goToActionPage("view", record.code)}
                  />
                ),
              };
            }

            if (actionName === "edit") {
              return {
                key: `edit-${index}`,
                label: (
                  <ItemDropDown
                    mode="edit"
                    onClick={() => goToActionPage("edit", record.code)}
                  />
                ),
              };
            }

            if (actionName === "delete") {
              return {
                key: `delete-${index}`,
                label: (
                  <ItemDropDown
                    mode="delete"
                    onClick={() => handleDelete(record.code)}
                  />
                ),
              };
            }

            if (actionName === "transaction") {
              return {
                key: `transaction-${index}`,
                label: (
                  <ItemDropDown
                    mode="approve"
                    text="Transaction"
                    onClick={() => goToActionPage("transaction", record.code)}
                  />
                ),
              };
            }

            return null;
          })
          .filter(Boolean);

        if (!actionItems.length) return "-";

        return (
          <Dropdown
            menu={{ items: actionItems }}
            // trigger={["click"]}
            placement="bottom"
          >
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="border-0 bg-transparent cursor-pointer p-0"
            >
              <img
                src="/img/icons/action.png"
                alt="Actions icon"
                className="inline-block w-5 h-5"
              />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  const fetchItemList = async (code, type) => {
    setLoading(true);

    try {
      if (type === "crop") {
        setModalTitle("Crop Detail");
        setHeaderModal([
          { title: "No", dataIndex: "key", key: "key", width: 100 },
          { title: "Name", dataIndex: "name", key: "name" },
        ]);
      } else if (type === "product") {
        setModalTitle("Product Detail");
        setHeaderModal([
          { title: "No", dataIndex: "key", key: "key", width: 100 },
          { title: "Name", dataIndex: "name", key: "name" },
        ]);
      } else if (type === "material") {
        setModalTitle("Materials Detail");
        setHeaderModal([
          { title: "No", dataIndex: "key", key: "key", width: 100 },
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Price", dataIndex: "unit_price", key: "unit_price" },
          { title: "Request Unit", dataIndex: "qty", key: "qty" },
        ]);
      } else {
        setModalTitle("Detail");
        setHeaderModal([
          { title: "No", dataIndex: "key", key: "key", width: 100 },
          { title: "Name", dataIndex: "name", key: "name" },
        ]);
      }

      const response = await useServiceAPI.get(paths.pathExpenseMaterialItem, {
        code: code,
        type: type,
      });

      if (response.status === 200) {
        let body = [];

        if (type === "crop") {
          body = (response.data.data || []).map((item, index) => ({
            key: index + 1,
            name: item.name,
          }));
        } else if (type === "product") {
          body = (response.data.data || []).map((item, index) => ({
            key: index + 1,
            name: `${(item.product_name || "").trim()} (${item.packing_list || "-"})`,
          }));
        } else if (type === "material") {
          body = (response.data.data || []).map((item, index) => ({
            key: index + 1,
            name: item.name,
            unit_price: new Intl.NumberFormat("th-TH").format(item.unit_price),
            qty: new Intl.NumberFormat("th-TH").format(item.request),
          }));
        }

        setBodyModal(body);
      }
    } catch (error) {
      console.error("Error fetching user list:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    try {
      const response = await useServiceAPI.get(paths.pathExpenseMaterialList, {
        platform: "web",
        page: "all",
        user_id: userInfo.id,
        page_length: current,
        page_size: pageSize,
        code: filters.code || "",
      });

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const formatted = data.map((item, index) => ({
          index: index + 1,
          code: item.code,
          action: item.action || [],
          crop: (
            <BadgeStatus
              text={item.crop}
              bgColor="#F89E18"
              textColor="#FFFFFF"
              onClick={() => {
                setIsTerritoryModalVisible(true);
                fetchItemList(item.code, "crop");
              }}
            />
          ),
          product: (
            <BadgeStatus
              text={item.product}
              bgColor="#F89E18"
              textColor="#FFFFFF"
              onClick={() => {
                setIsTerritoryModalVisible(true);
                fetchItemList(item.code, "product");
              }}
            />
          ),
          material: (
            <BadgeStatus
              text={item.material}
              bgColor="#F89E18"
              textColor="#FFFFFF"
              onClick={() => {
                setIsTerritoryModalVisible(true);
                fetchItemList(item.code, "material");
              }}
            />
          ),
          request: new Intl.NumberFormat("th-TH").format(item.request),
          receive: new Intl.NumberFormat("th-TH").format(item.receive),
          send: new Intl.NumberFormat("th-TH").format(item.send),
          date:
            item.updated_at || item.created_at
              ? dayjs(item.updated_at || item.created_at).format(
                "YYYY-MM-DD HH:mm:ss"
              )
              : "-",
          create_by: item.create_user_name,
          unit_price: item.unit_price || "-",
        }));

        setDataSource(formatted);
        setMaterialList(data.map((m) => ({ id: m.id, name: m.name })));
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: records_filtered,
          },
        }));
      }
    } catch (error) {
      console.error("Failed to fetch materials:", error);
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
    setTableParams((prev) => ({
      ...prev,
      pagination,
      filters: prev.filters,
      sortOrder: sorter?.order === "descend" ? "desc" : "asc",
      sortField: sorter?.field,
    }));
  };

  const handleSearch = (filters) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: 1,
        pageSize: 10,
      },
      filters: {
        ...filters,
        page_length: 1,
        page_size: 10,
      },
    }));
  };

  const handleClear = () => {
    setTableParams((prev) => ({
      ...prev,
      filters: {},
    }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Expense Materials</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() => navigate("/expenses/material/create")}
        />
      </div>

      <Filter onSearch={handleSearch} onClear={handleClear} filters={filters} />

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
        title={modalTitle}
        isVisible={isTerritoryModalVisible}
        onClose={() => setIsTerritoryModalVisible(false)}
        header={headerModal}
        dataSource={bodyModal}
        width="1200px"
      />
    </MainLayout>
  );
}