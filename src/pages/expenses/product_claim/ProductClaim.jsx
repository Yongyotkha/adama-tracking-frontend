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
import DynamicModal from "../../../components/modal/DynamicModal";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import { ExclamationCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";
export default function ProductClaim() {
  const { showMsg, showNotification } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const { confirm } = Modal;
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    // body ที่จะส่งเข้า API claim list
    filters: {
      keyword: "",                // order number / claim no
      use_flag: "1",              // สถานะการใช้งาน
      user_id: "",                // Sale ID (ยังไม่ได้ใช้ filter ในหน้าจอ)
      dealer_id: "",              // Dealer ID
      document_date: "",
      trasaction_status_code: "ODW", // ✅ FIX ODW ทุกครั้ง
      payment_status_code: "",    // การชำระเงิน
      page: "all",                // fixed
    },
    sortOrder: "desc",
    sortField: "document_number",
  });

  const navigate = useNavigate();

  // ----------------- Config Filter บนหน้า -----------------
  const filters = [
    {
      key: "claim_no",
      type: "text",
      label: "Claim No",
      placeholder: "Claim No",
    },
    {
      key: "claim_date",
      type: "date",
      label: "Claim Date",
      placeholder: "YYYY-MM-DD",
    },
    {
      key: "dealer_id", // จะได้ map ตรงกับ dealer_id ใน body เลย
      type: "select",
      label: "Dealer",
      placeholder: "All",
      options: dealerList, // ✅ ใช้ master dealer all
    },
    // {
    //   key: "status",
    //   type: "select",
    //   label: "Status",
    //   placeholder: "All",
    //   options: statusList,
    // },
  ];
  // กด Search
  const handleSearch = (values) => {
    // แปลง claim_date -> YYYY-MM-DD (รองรับทั้ง string และ dayjs)
    let docDate = "";
    if (values.claim_date) {
      if (dayjs.isDayjs(values.claim_date)) {
        docDate = values.claim_date.format("YYYY-MM-DD");
      } else {
        // เผื่อ Filter ส่งมาเป็น string อยู่แล้ว
        docDate = dayjs(values.claim_date).isValid()
          ? dayjs(values.claim_date).format("YYYY-MM-DD")
          : "";
      }
    }

    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: 1,
      },
      filters: {
        ...prev.filters,
        keyword: values.claim_no || "",
        dealer_id: values.dealer_id || "",
        document_date: docDate || "",
        trasaction_status_code: "ODW", // fix ODW
      },
    }));
  };

  // กด Clear
  const handleClear = () => {
    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: 1,
      },
      filters: {
        keyword: "",
        use_flag: "1",
        user_id: "",
        dealer_id: "",
        document_date: "",
        trasaction_status_code: "ODW",
        payment_status_code: "",
        page: "all",
      },
    }));
  };

  const handleShowProductModal = () => {
    setIsProductModalVisible(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalVisible(false);
  };

  const handleApprove = async (documentNumber) => {
    confirm({
      title: "Do you want to approve ?",
      icon: <ExclamationCircleFilled />,
      content: [],
      centered: true,
      async onOk() {
        try {
          const response = await useServiceAPI.put(
            `/claim/status?document_number=${encodeURIComponent(
              documentNumber
            )}&status_code=${encodeURIComponent(
              "ODC"
            )}&remark=${encodeURIComponent("อนุมัติ")}`
          );
          await fetchData();
          if (response.status === 200) {
            showNotification(
              "success",
              response.data.message || "Event deleted successfully!",
              response.data.message_line || ["The event has been removed."]
            );
          } else {
            console.error("Failed to approve event:", response.message);
            showNotification(
              "error",
              response.message || "Failed to approve event.",
              response.message_line || ["Please try again later."]
            );
          }
        } catch (error) {
          console.error("Error approved event:", error);
          showNotification(
            "error",
            "An error occurred while approved the event.",
            ["Please try again later."]
          );
        }
      },
    });
  };

  const productModalData = [
    {
      key: 1,
      name: "Tossaphon Suphaksitthikorn",
      territory: "Left North",
      position: "Business Development Executive",
    },
    {
      key: 2,
      name: "Panudech Srithong",
      territory: "Left Lower North",
      position: "Business Development Executive",
    },
  ];

  const productModalHeader = [
    { title: "No", dataIndex: "key", key: "key", width: 50 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Territory", dataIndex: "territory", key: "territory" },
    { title: "Position", dataIndex: "position", key: "position" },
  ];

  const header = [
    { title: "No", width: 50, dataIndex: "key", align: "center" },
    { title: "Claim No", width: 150, dataIndex: "claimNo", align: "center" },
    { title: "Claim Date", width: 150, dataIndex: "claimDate", align: "center" },
    { title: "Dealer Name", width: 200, dataIndex: "dealerName", align: "left" },
    { title: "Product", width: 100, dataIndex: "product", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  // ----------------- ดึงข้อมูลตาราง -----------------
  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      keyword: filters.keyword ?? "",
      use_flag: filters.use_flag ?? "1",
      user_id: filters.user_id ?? "",
      dealer_id: filters.dealer_id ?? "",
      trasaction_status_code: "ODW", // ✅ FIX ส่ง ODW ตลอดไม่ต้องพึ่ง filter
      document_date: filters.document_date ?? "", // ✅ ส่ง claim date เข้า API
      payment_status_code: filters.payment_status_code ?? "",
      page: filters.page ?? "all",
      orderby_column: sortField,
      orderby: sortOrder,
      page_length: current,
      page_size: pageSize,
    };

    try {
      const response = await useServiceAPI.get(
        paths.pathClaimList,
        requestData
      );

      if (response.status === 200) {
        const { data, records_filtered } = response.data;

        const newDataSource = data.map((row, index) => {
          const actionItems = [
            {
              key: "1",
              label: (
                <ItemDropDown
                  mode="edit"
                  link={`/expenses/product-claim/edit?documentNumber=${encodeURIComponent(
                    row.document_number
                  )}`}
                />
              ),
            },
            {
              key: "2",
              // ถ้าจะใช้ confirm approve:
              // label: (
              //   <ItemDropDown
              //     mode="approve"
              //     link="#"
              //     onClick={() => handleApprove(row.document_number)}
              //   />
              // ),
              label: (
                <ItemDropDown
                  mode="approve"
                  link={`/expenses/product-claim/edit?documentNumber=${encodeURIComponent(
                    row.document_number
                  )}&mode=approve`}
                />
              ),
            },
          ];

          return {
            key: index + 1 + (current - 1) * pageSize,
            claimNo: row.document_number,
            claimDate: row.document_date,
            dealerName: row.dealer_name,
            product: (
              <BadgeStatus
                text={row.product_count}
                bgColor="#F89E18"
                textColor="#FFFFFF"
              />
            ),
            action: (
              <Dropdown menu={{ items: actionItems }} placement="bottomRight">
                <a
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  <img
                    src="/img/icons/action.png"
                    alt="Actions icon"
                    className="inline-block w-5 h-5"
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
            total: records_filtered,
          },
        }));
      }
    } catch (error) {
      console.error(error);
      showMsg("error", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setTableLoading(false);
    }
  };

  // ----------------- โหลด master: status + dealer all -----------------
  useEffect(() => {
    const getMaster = async () => {
      try {
        const [statusRes, dealerAll] = await Promise.all([
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "claim",
          }),
          useServiceAPI.get(paths.pathMasterDealerAll, {}), // ✅ ใช้ master dealer all
        ]);

        setStatusList(statusRes.data || []);
        setDealerList(dealerAll.data || []); // ส่ง options ให้ Filter ตรง ๆ แบบ DealerList
      } catch (error) {
        console.error(error);
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      }
    };

    getMaster();
  }, []);

  // ----------------- Trigger fetch data เมื่อ param เปลี่ยน -----------------
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortOrder,
    tableParams.sortField,
    JSON.stringify(tableParams.filters),
  ]);

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Product Claim</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() => navigate("/expenses/product-claim/create")}
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
        />
      </BoxPrimary>

      <DynamicModal
        title="Sale Team"
        isVisible={isProductModalVisible}
        onClose={handleCloseProductModal}
        header={productModalHeader}
        dataSource={productModalData}
        width="1200px"
      />
    </MainLayout>
  );
}
