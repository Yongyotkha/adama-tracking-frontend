import { useContext, useEffect, useRef, useState } from "react";
import { Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import ActionButton from "../../../../components/button/ActionButton";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import { AuthContext } from "../../../../contexts/AuthContext";
import { loadListPageState, saveListPageState } from "../../../../utils/listPageState";
import {
  CUT_POINT_CREATE_PATH,
  apiErrorText,
  cutPointViewPath,
  formatDateTime,
  cutPointStatusColor,
  cutPointStatusText,
  cutPointTypeLabel,
  formatPoint,
  mapCutPointRow,
  openRefundModal,
  unwrapList,
} from "./cutPointShared";

const PAGE_STATE_KEY = "cut-point-list";

const TYPE_OPTIONS = [
  { id: "SD", name: "Sub Dealer" },
  { id: "FM", name: "Farmer" },
];

const STATUS_OPTIONS = [
  { id: "completed", name: "Completed" },
  { id: "refunded", name: "Refunded" },
];

export default function CutPointList() {
  const navigate = useNavigate();
  const { showMsg } = useContext(AuthContext);
  const persistedState = loadListPageState(PAGE_STATE_KEY, {});
  const missingApiWarned = useRef(false);

  const [saleList, setSaleList] = useState([]);
  const [permission, setPermission] = useState({});
  const [dataSource, setDataSource] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [filterValues, setFilterValues] = useState(persistedState.filterValues || {});
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: persistedState.tableParams?.pagination?.current || 1,
      pageSize: persistedState.tableParams?.pagination?.pageSize || 10,
    },
    filters: persistedState.tableParams?.filters || {},
  });

  const canCreate = permission?.btn_create !== false && permission?.btn_create !== 0;

  useEffect(() => {
    const loadSales = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterSaleDropdown, { status: "" });
        const list = Array.isArray(res?.data) ? res.data : [];
        setSaleList(
          list.map((item) => ({
            id: item.id,
            name: item.name || item.sale_name || String(item.id),
          }))
        );
      } catch (error) {
        showMsg?.("error", apiErrorText(error, "Unable to load sales"), 2);
      }
    };
    loadSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveListPageState(PAGE_STATE_KEY, {
      filterValues,
      tableParams: {
        pagination: {
          current: tableParams.pagination.current,
          pageSize: tableParams.pagination.pageSize,
        },
        filters: tableParams.filters,
      },
    });
  }, [filterValues, tableParams]);

  const openView = (record) => {
    navigate(cutPointViewPath(record), { state: { record } });
  };

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};
    const payload = {
      type: filters.type || "",
      user_id: filters.sale || "",
      keyword: filters.keyword || "",
      status: filters.status_code || "",
      orderby_column: "created_at",
      orderby: "desc",
      page_length: current,
      page_size: pageSize,
    };

    if (Array.isArray(filters.dater) && filters.dater[0] && filters.dater[1]) {
      payload.dater = filters.dater;
    }

    try {
      const response = await useServiceAPI.get(paths.pathCutPointList, payload);
      const { rows, total, permission: nextPermission } = unwrapList(response);
      setPermission(nextPermission || {});

      const mapped = rows.map((row, index) => {
        const record = mapCutPointRow(row);
        const statusColor = cutPointStatusColor(record);
        const menuActions = record.actions.length
          ? record.actions
          : [{ action: "View" }, ...(record.canRefund ? [{ action: "Refund" }] : [])];

        return {
          ...record,
          key: record.id || record.documentNumber || `${current}-${index}`,
          typeBadge: (
            <BadgeStatus
              className="!inline-flex !min-w-[100px] items-center justify-center text-center font-bold"
              text={cutPointTypeLabel(record.type)}
              bgColor={record.type === "FM" ? "#E3F2FD" : "#F3E5F5"}
              textColor={record.type === "FM" ? "#1565C0" : "#6A1B9A"}
            />
          ),
          cutPointText: formatPoint(record.cutPoint),
          createdAtText: formatDateTime(record.createdAt),
          statusBadge: (
            <BadgeStatus
              text={cutPointStatusText(record)}
              bgColor={statusColor.bgColor}
              textColor={statusColor.textColor}
            />
          ),
          action: (
            <Dropdown
              menu={{
                items: menuActions
                  .map((actionItem, actionIndex) => {
                    const actionName = String(actionItem.action || "").toLowerCase();
                    const disabled = actionItem.disabled === true || actionItem.disabled === 1;
                    if (actionName === "view") {
                      return {
                        key: `view-${actionIndex}`,
                        label: (
                          <ItemDropDown mode="view" text="View" onClick={() => openView(record)} />
                        ),
                      };
                    }
                    if (["refund", "refunded", "refund point"].includes(actionName)) {
                      return {
                        key: `refund-${actionIndex}`,
                        disabled: disabled || !record.canRefund,
                        label: (
                          <ItemDropDown
                            mode="refund_point"
                            text="Refund"
                            onClick={() => {
                              if (disabled || !record.canRefund) return;
                              openRefundModal({
                                record,
                                showMsg,
                                onDone: fetchData,
                              });
                            }}
                          />
                        ),
                      };
                    }
                    return null;
                  })
                  .filter(Boolean),
              }}
              placement="bottom"
            >
              <a onClick={(event) => event.preventDefault()}>
                <img src="/img/icons/action.png" alt="action" className="inline-block h-5 w-5" />
              </a>
            </Dropdown>
          ),
        };
      });

      setDataSource(mapped);
      setTableParams((prev) => ({
        ...prev,
        pagination: { ...prev.pagination, total: total || 0 },
      }));
    } catch (error) {
      setDataSource([]);
      if (error?.response?.status === 404) {
        if (!missingApiWarned.current) {
          missingApiWarned.current = true;
          showMsg?.("warning", "Cut point list API is not available", 3);
        }
      } else {
        showMsg?.("error", apiErrorText(error, "Unable to load the cut point list"), 2);
      }
    } finally {
      setTableLoading(false);
    }
  };

  const filterKey = JSON.stringify(tableParams.filters || {});
  const pageCurrent = tableParams.pagination.current;
  const pageSize = tableParams.pagination.pageSize;

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCurrent, pageSize, filterKey]);

  const filters = [
    { key: "type", type: "select", label: "Type", placeholder: "All", options: TYPE_OPTIONS },
    { key: "sale", type: "select", label: "Sale", placeholder: "All", options: saleList },
    { key: "keyword", type: "text", label: "Name", placeholder: "Sub dealer / Farmer" },
    { key: "status_code", type: "select", label: "Status", placeholder: "All", options: STATUS_OPTIONS },
    { key: "dater", type: "dater", label: "Create Date", size: 8 },
  ];

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 70, align: "center" },
    { title: "Type", dataIndex: "typeBadge", key: "type", width: 140, align: "center" },
    { title: "Sale", dataIndex: "saleName", key: "sale_name" },
    { title: "Sub Dealer Name", dataIndex: "subDealerName", key: "sub_dealer_name" },
    { title: "Farmer Name", dataIndex: "farmerName", key: "farmer_name" },
    { title: "Cut Point", dataIndex: "cutPointText", key: "cut_point", align: "right", width: 120 },
    { title: "Create Date", dataIndex: "createdAtText", key: "created_at", align: "center", width: 170 },
    { title: "Status", dataIndex: "statusBadge", key: "status", align: "center", width: 110 },
    { title: "Action", dataIndex: "action", key: "action", align: "center", width: 90 },
  ];

  return (
    <MainLayout>
      <div className="flex items-center justify-between">
        <div className="title-page">Cut Point List</div>
        {canCreate && (
          <ActionButton
            mode="create"
            text="Create"
            onClick={() => navigate(CUT_POINT_CREATE_PATH)}
          />
        )}
      </div>

      <Filter
        filters={filters}
        values={filterValues}
        onChange={setFilterValues}
        onSearch={(values) => {
          setFilterValues(values);
          setTableParams((prev) => ({
            ...prev,
            filters: values,
            pagination: { ...prev.pagination, current: 1 },
          }));
        }}
        onClear={() => {
          setFilterValues({});
          setTableParams((prev) => ({
            ...prev,
            filters: {},
            pagination: { ...prev.pagination, current: 1 },
          }));
        }}
      />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={tableParams.pagination}
          loading={tableLoading}
          onChange={(pagination) => {
            setTableParams((prev) => ({
              ...prev,
              pagination: { ...prev.pagination, ...pagination },
            }));
          }}
        />
      </BoxPrimary>
    </MainLayout>
  );
}
