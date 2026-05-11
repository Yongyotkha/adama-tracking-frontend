import React, { useContext, useEffect, useState } from "react";
import { Dropdown, Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";
import { AuthContext } from "../../../../contexts/AuthContext";
import { formatDate, formatNumber, getListPayload } from "./draftCampaignUtils";

export default function DraftCampaignList() {
  const navigate = useNavigate();
  const { showNotification, userInfo } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [canCreate, setCanCreate] = useState(true);
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 10, total: 0 },
    filters: {},
  });

  const filters = [
    { key: "document_number", type: "text", label: "Document No", placeholder: "Enter" },
    { key: "dealer_name", type: "text", label: "Dealer", placeholder: "Enter" },
    { key: "sub_dealer_name", type: "text", label: "Sub Dealer", placeholder: "Enter" },
    { key: "farmer_name", type: "text", label: "Farmer", placeholder: "Enter" },
    { key: "dater", type: "dater", label: "Draft Date" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const f = tableParams.filters || {};

    try {
      const res = await useServiceAPI.get(paths.pathDraftCampaignList, {
        user_id: f.user_id || userInfo?.id || "",
        dealer_name: f.dealer_name || "",
        sub_dealer_name: f.sub_dealer_name || "",
        farmer_name: f.farmer_name || "",
        document_number: f.document_number || "",
        dater:
          Array.isArray(f.dater) && f.dater[0] && f.dater[1]
            ? f.dater
            : [],
        orderby_column: "document_date",
        orderby: "desc",
        page_size: pageSize,
        page_length: current,
      });

      const payload = getListPayload(res);
      const list = Array.isArray(payload?.data) ? payload.data : [];

      setCanCreate(Boolean(payload?.permission?.btn_create ?? true));
      setDataSource(
        list.map((item, index) => ({
          key: item.document_number || `${current}-${index}`,
          no: index + 1 + (current - 1) * pageSize,
          document_number: item.document_number || "-",
          sales: item.name_en || "-",
          dealer: item.dealer_name || "-",
          sub_dealer: item.sub_dealer_name || "-",
          farmer: item.farm_name || "-",
          draft_date: formatDate(item.document_date),
          line_product: formatNumber(item.line_product),
          target_point: formatNumber(item.target_point),
          point: formatNumber(item.point),
          net_amount: formatNumber(item.net_amount, 2),
          action: (
            <Dropdown
              placement="bottom"
              menu={{
                items: (item.action || []).map((act, i) => {
                  const actionType = String(act.action || "").toLowerCase();
                  const documentNumber = item.document_number;
                  return {
                    key: `${documentNumber}-${actionType}-${i}`,
                    label: (
                      <ItemDropDown
                        mode={actionType}
                        text={act.action}
                        onClick={() => {
                          if (actionType === "delete") {
                            handleDelete(documentNumber);
                            return;
                          }
                          navigate(`/setting/line/draft-campaign/${actionType}`, {
                            state: { documentNumber },
                          });
                        }}
                      />
                    ),
                  };
                }),
              }}
            >
              <a onClick={(e) => e.preventDefault()}>
                <img src="/img/icons/action.png" alt="action" className="w-5 h-5" />
              </a>
            </Dropdown>
          ),
        }))
      );

      setTableParams((prev) => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: payload?.records_filtered ?? payload?.records_total ?? list.length,
        },
      }));
    } catch (error) {
      showNotification?.(
        "error",
        error?.response?.data?.message || "Load failed",
        error?.response?.data?.data?.message_line || [error?.message || "Unable to load draft campaigns"]
      );
    } finally {
      setTableLoading(false);
    }
  };

  const handleDelete = (documentNumber) => {
    Modal.confirm({
      title: "Delete Draft Campaign?",
      icon: <ExclamationCircleFilled />,
      centered: true,
      onOk: async () => {
        try {
          const res = await useServiceAPI.delete(paths.pathDraftCampaignDelete, {
            document_number: documentNumber,
          });
          await showNotification?.(
            res?.status === 200 ? "success" : "warning",
            res?.message || "Notification",
            res?.data?.message_line || [res?.data?.message || "Delete finished"]
          );
          fetchData();
        } catch (error) {
          await showNotification?.(
            "error",
            error?.response?.data?.message || "Delete failed",
            error?.response?.data?.data?.message_line || [error?.message || "Unable to delete draft campaign"]
          );
        }
      },
    });
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    JSON.stringify(tableParams.filters),
    userInfo?.id,
  ]);

  const header = [
    { title: "No", dataIndex: "no", width: 70, align: "center" },
    { title: "Document No", dataIndex: "document_number", width: 160 },
    { title: "Sales", dataIndex: "sales", width: 180 },
    { title: "Dealer", dataIndex: "dealer", width: 180 },
    { title: "Sub Dealer", dataIndex: "sub_dealer", width: 180 },
    { title: "Farmer", dataIndex: "farmer", width: 180 },
    { title: "Draft Date", dataIndex: "draft_date", width: 130, align: "center" },
    { title: "Line Product", dataIndex: "line_product", width: 110, align: "right" },
    { title: "Target Point", dataIndex: "target_point", width: 120, align: "right" },
    { title: "Point", dataIndex: "point", width: 120, align: "right" },
    { title: "Net Amount", dataIndex: "net_amount", width: 140, align: "right" },
    { title: "Action", dataIndex: "action", width: 90, align: "center" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Draft Campaign</div>
        {canCreate && (
          <ActionButton
            mode="create"
            text="Create"
            onClick={() => navigate("/setting/line/draft-campaign/create")}
          />
        )}
      </div>

      <Filter
        filters={filters}
        values={filterValues}
        onChange={setFilterValues}
        onSearch={(filtersFromUI) => {
          setFilterValues(filtersFromUI);
          setTableParams((prev) => ({
            ...prev,
            filters: filtersFromUI,
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
