import React, { useRef, useState, useEffect, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import TableComponent from "../../../components/table/TableComponent";
import { Dropdown, Menu, Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";


export default function Material() {
  const { confirm } = Modal;
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [materialList, setMaterialList] = useState([]);
  const navigate = useNavigate();
  const { showMsg, showNotification, userInfo } = useContext(AuthContext);
  const [filterValues, setFilterValues] = useState({});
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
      key: "name",
      type: "text",
      label: "Name",
      placeholder: "All",
      options: materialList,
    },
  ];

  const handleDelete = (code) => {
    console.log(code)
    confirm({
      title: "Do you want to delete this material?",
      icon: <ExclamationCircleFilled />,
      onOk: async () => {
        try {
          setLoading(true);

          const res = await useServiceAPI.delete(paths.pathMaterialDel, {
            code: code,
            user_id: userInfo.id,
          });

          if (res.status === 200) {
            showNotification("success", "ลบข้อมูลเรียบร้อยแล้ว");
            fetchData(); // โหลดข้อมูลใหม่หลังลบ
          } else {
            showMsg("error", res.data.message || "ไม่สามารถลบข้อมูลได้");
          }
        } catch (err) {
          showMsg("error", err.message || "เกิดข้อผิดพลาดในการลบ");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const header = [
    { title: "#", dataIndex: "index", align: "left" },
    { title: "Code", dataIndex: "code", align: "left" },
    { title: "Name", dataIndex: "name", align: "left" },
    { title: "Size", dataIndex: "size", align: "left" },
    { title: "Type", dataIndex: "type", align: "left" },
    { title: "QTY", dataIndex: "qty", align: "left" },
    { title: "Unit Price", dataIndex: "unit_price", align: "left" },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      render: (_, record) => {
        const actionItems = [
          {
            key: "1",
            label: (
              <ItemDropDown
                mode="edit"
                link={`/setting/material/edit?documentNumber=${encodeURIComponent(record.code)}`}
              />
            ),
          },
          {
            key: "2",
            label: (
              <ItemDropDown
                mode="view"
                link={`/setting/material/view?documentNumber=${encodeURIComponent(record.code)}`}
              />
            ),
          },
          {
            key: "3",
            label: (
              <ItemDropDown
                mode="approve"
                text="Transaction"
                link="material/transaction"
              />
            ),
          },
          {
            key: "4",
            label: (
              <ItemDropDown
                mode="delete"
                onClick={() => handleDelete(record.code)}
              />
            ),
          },
        ];

        return (
          <Dropdown
            overlay={<Menu items={actionItems} />}
            placement="bottom"
          >
            <a onClick={(e) => e.preventDefault()}>
              <img
                src="/img/icons/action.png"
                alt="Actions icon"
                className="inline-block w-5 h-5"
              />
            </a>
          </Dropdown>
        );
      },
    },
  ];

  const fetchData = async () => {
    setTableLoading(true);

    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";
    console.log("filters : ", filters);
    try {
      const response = await useServiceAPI.get(paths.pathMaterialList,
        {
          platform: "web",
          page: "all",
          user_id: userInfo.id,
          page_length: current,
          page_size: pageSize,
          name: filters.name || "",
        });
      if (response.status === 200) {

        const { data, records_filtered } = response.data;
        console.log('data : ', data)
        const formatted = data.map((item, index) => ({
          index: (current - 1) * pageSize + index + 1,
          code: item.code,
          name: item.name,
          size: item.size,
          type: item.type,
          qty: item.qty,
          unit_price: item.unit_price || "-",
        }));
        console.log('formatted : ', formatted)
        setDataSource(formatted);
        setMaterialList(data.map((m) => ({ id: m.id, name: m.name })));
        // setTableParams({
        //   ...tableParams,
        //   pagination: {
        //     ...tableParams.pagination,
        //     total: records_filtered,
        //   },
        // });
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
    setTableParams({
      pagination,
      filters: tableParams.filters, // รักษาค่าฟิลเตอร์เดิม
      sortOrder: sorter.order === "descend" ? "desc" : "asc",
      sortField: sorter.field,
    });
  };

  const handleSearch = (filters) => {
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1,
        pageSize: 10,
      },
      filters: {
        ...filters,
        page_length: 1,
        page_size: 10,
      },
    });
  };

  const handleClear = () => {
    setTableParams({
      ...tableParams,
      filters: {},
    });
  };

  const handleChange = (filter) => {
    console.log("filter : ", filter);
    setFilterValues(filter);
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Materials</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() => navigate("/setting/material/create")}
        />
      </div>
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
