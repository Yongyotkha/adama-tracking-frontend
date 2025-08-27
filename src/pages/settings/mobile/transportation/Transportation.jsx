import React, { useEffect, useState } from "react";
import { Dropdown, Tabs } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";

const { TabPane } = Tabs;

/** ---------------- MOCK DATA (ใช้ชั่วคราว) ---------------- */
const MOCK_TRANSPORT_LIST = [
  // ตัวอย่าง: แท็บ Transportation List (ว่างตามภาพแรก)
];

const MOCK_PREPARATION_LIST = [
  {
    id: "TP-20250526-0001",
    date: "2025-05-26",
    sub_dealer_name: "บ้านธาราเกษตร 11",
    reward_code: "RW00000001",
    reward_name: "พัดลม (14 นิ้ว)",
    qty: 1,
    cost: 790,
    send_by: "2025-05-26", // จากภาพคอลัมน์ "Send By" เป็นวันที่ (หากจริงเป็นคนส่ง ให้ปรับตอนต่อ API)
    send_date: "2025-05-26",
    status_name: "Prepare",
    status_bg_color: "#b5aca4",
    status_color: "#ffffff",
    actions: ["prepare", "view"],
  },
];
/** -------------------------------------------------------- */

export default function Transportation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("transport");

  // --- Transportation List state ---
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  // --- Preparation List state ---
  const [prepTableLoading, setPrepTableLoading] = useState(false);
  const [prepDataSource, setPrepDataSource] = useState([]);
  const [prepTableParams, setPrepTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  /** ---------------- Filters ---------------- */
  const statusOptions = [
    { id: "", name: "All" },
    { id: "PREPARE", name: "Prepare" },
    { id: "SENT", name: "Sent" },
    { id: "DELIVERED", name: "Delivered" },
    { id: "CANCELLED", name: "Cancelled" },
  ];
  const subDealerOptions = [
    { id: "", name: "All" },
    { id: "11", name: "บ้านธาราเกษตร 11" },
  ];

  const filtersTransportation = [
    { key: "sub_dealer_id", type: "select", label: "Sub Dealer Name", options: subDealerOptions },
    { key: "dater", type: "date", label: "Date" },
    { key: "status", type: "select", label: "Status", options: statusOptions },
  ];
  const filtersPreparation = filtersTransportation;

  /** ---------------- Columns ---------------- */
  const columns = [
    { title: "Date", dataIndex: "date", align: "left", width: 140 },
    { title: "Sub Dealer Name", dataIndex: "sub_dealer_name", align: "left" },
    { title: "Reward Code", dataIndex: "reward_code", align: "left", width: 160 },
    { title: "Reward Name", dataIndex: "reward_name", align: "left" },
    { title: "QTY (Pcs)", dataIndex: "qty", align: "right", width: 100 },
    { title: "Cost (THB)", dataIndex: "cost", align: "right", width: 120 },
    { title: "Send By", dataIndex: "send_by", align: "center", width: 140 },
    { title: "Send Date", dataIndex: "send_date", align: "center", width: 140 },
    { title: "Status", dataIndex: "status", align: "center", width: 140 },
    { title: "Action", dataIndex: "action", align: "center", width: 90 },
  ];

  /** ---------------- Fetch: Transportation List ---------------- */
  const fetchTransportation = async () => {
    setTableLoading(true);

    // ดึงค่าหน้า/ฟิลเตอร์
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    // ❗ ตอนนี้ใช้ MOCK ไปก่อน
    try {
      const rows = MOCK_TRANSPORT_LIST;

      // พร้อมต่อ API:
      // const res = await useServiceAPI.get(paths.pathTransportationList, {
      //   page: "all",
      //   page_length: current,
      //   page_size: pageSize,
      //   sub_dealer_id: filters.sub_dealer_id || "",
      //   dater: filters.dater || "",
      //   status: filters.status || "",
      // });
      // const rows = res.status === 200 ? (res.data?.data || []) : [];

      const mapped = rows.map((item, index) => ({
        key: index + 1 + (current - 1) * pageSize,
        date: item.date || "-",
        sub_dealer_name: item.sub_dealer_name || "-",
        reward_code: item.reward_code || "-",
        reward_name: item.reward_name || "-",
        qty: item.qty ?? "-",
        cost: item.cost ?? "-",
        send_by: item.send_by || "-",
        send_date: item.send_date || "-",
        status: (
          <BadgeStatus
            text={item.status_name || "-"}
            bgColor={item.status_bg_color || "gray"}
            textColor={item.status_color || "white"}
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
                        navigate("/points/line/transportation/view", {
                          state: { id: item.id },
                        })
                      }
                    />
                  ),
                },
              ],
            }}
            placement="bottomRight"
          >
            <a onClick={(e) => e.preventDefault()}>
              <img
                src="/img/icons/action.png"
                alt="action"
                className="inline-block w-5 h-5"
              />
            </a>
          </Dropdown>
        ),
      }));

      setDataSource(mapped);
      setTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, total: mapped.length }, // ← แทนด้วย res.data.records_filtered เมื่อต่อ API
      }));
    } finally {
      setTableLoading(false);
    }
  };

  /** ---------------- Fetch: Preparation List ---------------- */
  const fetchPreparation = async () => {
    setPrepTableLoading(true);

    const { current, pageSize } = prepTableParams.pagination;
    const filters = prepTableParams.filters || {};

    // ❗ ใช้ MOCK ไปก่อน
    try {
      const rows = MOCK_PREPARATION_LIST;

      // พร้อมต่อ API:
      // const res = await useServiceAPI.get(paths.pathTransportationPreparationList, {
      //   page: "all",
      //   page_length: current,
      //   page_size: pageSize,
      //   sub_dealer_id: filters.sub_dealer_id || "",
      //   dater: filters.dater || "",
      //   status: filters.status || "",
      // });
      // const rows = res.status === 200 ? (res.data?.data || []) : [];

      const mapped = rows.map((item, index) => ({
        key: index + 1 + (current - 1) * pageSize,
        date: item.date || "-",
        sub_dealer_name: item.sub_dealer_name || "-",
        reward_code: item.reward_code || "-",
        reward_name: item.reward_name || "-",
        qty: item.qty ?? "-",
        cost: item.cost ?? "-",
        send_by: item.send_by || "-",
        send_date: item.send_date || "-",
        status: (
          <BadgeStatus
            text={item.status_name || "Prepare"}
            bgColor={item.status_bg_color || "#b5aca4"}
            textColor={item.status_color || "#ffffff"}
          />
        ),
        action: (
          <Dropdown
            menu={{
              items: [
                {
                  key: "prepare",
                  label: (
                    <ItemDropDown
                      mode="edit" // ใช้ไอคอนดินสอ; ถ้ามีโหมด 'prepare' ให้เพิ่มในคอมโพเนนต์ ItemDropDown
                      onClick={() =>
                        navigate("/points/line/transportation/prepare", {
                          state: { id: item.id },
                        })
                      }
                    />
                  ),
                },
                {
                  key: "view",
                  label: (
                    <ItemDropDown
                      mode="view"
                      onClick={() =>
                        navigate("/points/line/transportation/view", {
                          state: { id: item.id },
                        })
                      }
                    />
                  ),
                },
              ],
            }}
            placement="bottomRight"
          >
            <a onClick={(e) => e.preventDefault()}>
              <img
                src="/img/icons/action.png"
                alt="action"
                className="inline-block w-5 h-5"
              />
            </a>
          </Dropdown>
        ),
      }));

      setPrepDataSource(mapped);
      setPrepTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, total: mapped.length }, // ← แทนด้วย res.data.records_filtered เมื่อต่อ API
      }));
    } finally {
      setPrepTableLoading(false);
    }
  };

  /** ---------------- Effects ---------------- */
  useEffect(() => {
    if (activeTab === "transport") {
      fetchTransportation();
    } else {
      fetchPreparation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tableParams.pagination.current, prepTableParams.pagination.current]);

  /** ---------------- Handlers ---------------- */
  const onSearchTransport = (filters) => {
    setTableParams((prev) => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, current: 1 },
    }));
    // fetchTransportation(); // จะถูก trigger โดย useEffect จาก current
  };
  const onClearTransport = () => {
    setTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  const onSearchPrep = (filters) => {
    setPrepTableParams((prev) => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };
  const onClearPrep = () => {
    setPrepTableParams((prev) => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Transportation</div>
      </div>

      <Tabs className="custom-tabs" activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span className="tab-title">Transportation List</span>} key="transport">
          <Filter
            filters={filtersTransportation}
            onSearch={onSearchTransport}
            onClear={onClearTransport}
          />
          <BoxPrimary className="mt-4">
            <TableComponent
              header={columns}
              dataSource={dataSource}
              loading={tableLoading}
              pagination={tableParams.pagination}
              onChange={(pagination) =>
                setTableParams((prev) => ({ ...prev, pagination }))
              }
            />
          </BoxPrimary>
        </TabPane>

        <TabPane tab={<span className="tab-title">Preparation List</span>} key="preparation">
          <Filter
            filters={filtersPreparation}
            onSearch={onSearchPrep}
            onClear={onClearPrep}
          />
          <BoxPrimary className="mt-4">
            <TableComponent
              header={columns}
              dataSource={prepDataSource}
              loading={prepTableLoading}
              pagination={prepTableParams.pagination}
              onChange={(pagination) =>
                setPrepTableParams((prev) => ({ ...prev, pagination }))
              }
            />
          </BoxPrimary>
        </TabPane>
      </Tabs>
    </MainLayout>
  );
}
