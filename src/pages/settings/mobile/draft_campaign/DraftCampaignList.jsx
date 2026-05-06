import React, { useMemo, useState } from "react";
import { Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import {
  draftCampaignCategoryOptions,
  draftCampaignDealerOptions,
  draftCampaignFarmerOptions,
  draftCampaignList,
  draftCampaignSalesOptions,
  draftCampaignStatusOptions,
  draftCampaignSubDealerOptions,
} from "./mockDraftCampaignData";

const statusColorMap = {
  draft: { bg: "#B6AEAB", color: "#FFFFFF", label: "Draft" },
  pending: { bg: "#F89E18", color: "#FFFFFF", label: "Pending" },
  active: { bg: "#00783F", color: "#FFFFFF", label: "Active" },
};

const findName = (options, id) =>
  options.find((option) => String(option.id) === String(id))?.name || "-";

const formatNumber = (value, digits = 0) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export default function DraftCampaignList() {
  const navigate = useNavigate();
  const [filtersValue, setFiltersValue] = useState({});
  const [tableParams, setTableParams] = useState({
    pagination: { current: 1, pageSize: 5 },
  });

  const filters = [
    {
      key: "rewardCode",
      type: "text",
      label: "Reward Code",
      placeholder: "Enter",
    },
    {
      key: "rewardName",
      type: "text",
      label: "Reward Name",
      placeholder: "Enter",
    },
    {
      key: "category",
      type: "select",
      label: "Category",
      placeholder: "Select",
      options: draftCampaignCategoryOptions,
    },
    {
      key: "status",
      type: "select",
      label: "Status",
      placeholder: "Select",
      options: draftCampaignStatusOptions,
    },
  ];

  const filteredRows = useMemo(() => {
    return draftCampaignList.filter((item) => {
      if (
        filtersValue.rewardCode &&
        !String(item.rewardCode || "")
          .toLowerCase()
          .includes(String(filtersValue.rewardCode).toLowerCase())
      ) {
        return false;
      }
      if (
        filtersValue.rewardName &&
        !String(item.rewardName || "")
          .toLowerCase()
          .includes(String(filtersValue.rewardName).toLowerCase())
      ) {
        return false;
      }
      if (
        filtersValue.category &&
        String(item.category).toLowerCase() !== String(filtersValue.category).toLowerCase()
      ) {
        return false;
      }
      if (
        filtersValue.status &&
        String(item.status).toLowerCase() !== String(filtersValue.status).toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [filtersValue]);

  const dataSource = filteredRows.map((item, index) => {
    const totalQty = item.products.reduce((sum, row) => sum + Number(row.qty || 0), 0);
    const totalPoint = item.products.reduce((sum, row) => sum + Number(row.point || 0), 0);
    const totalValue = item.products.reduce((sum, row) => sum + Number(row.subTotal || 0), 0);
    const statusMeta = statusColorMap[item.status] || statusColorMap.draft;

    return {
      key: item.id,
      no: index + 1,
      sales: findName(draftCampaignSalesOptions, item.sale),
      dealer: item.dealer,
      subDealer: findName(draftCampaignSubDealerOptions, item.subDealer),
      farmer: findName(draftCampaignFarmerOptions, item.farmer),
      qty: formatNumber(totalQty),
      point: formatNumber(totalPoint),
      value: formatNumber(totalValue, 2),
      draftDate: item.draftDate,
      createdBy: item.createdBy,
      status: (
        <BadgeStatus
          text={statusMeta.label}
          bgColor={statusMeta.bg}
          textColor={statusMeta.color}
        />
      ),
      action: (
        <Dropdown
          placement="bottom"
          menu={{
            items: [
              {
                key: "view",
                label: (
                  <ItemDropDown
                    mode="view"
                    onClick={() =>
                      navigate("/setting/line/draft-campaign/view", {
                        state: { id: item.id },
                      })
                    }
                  />
                ),
              },
              {
                key: "edit",
                label: (
                  <ItemDropDown
                    mode="edit"
                    onClick={() =>
                      navigate("/setting/line/draft-campaign/edit", {
                        state: { id: item.id },
                      })
                    }
                  />
                ),
              },
            ],
          }}
        >
          <a onClick={(event) => event.preventDefault()}>
            <img src="/img/icons/action.png" alt="action" className="w-5 h-5" />
          </a>
        </Dropdown>
      ),
    };
  });

  const header = [
    { title: "No", dataIndex: "no", width: 70, align: "center" },
    { title: "Sales", dataIndex: "sales" },
    { title: "Dealer", dataIndex: "dealer" },
    { title: "Sub Dealer", dataIndex: "subDealer" },
    { title: "Farmer", dataIndex: "farmer" },
    { title: "QTY", dataIndex: "qty", align: "right" },
    { title: "Point", dataIndex: "point", align: "right" },
    { title: "Value", dataIndex: "value", align: "right" },
    { title: "Draft Date", dataIndex: "draftDate", align: "center" },
    { title: "Create By", dataIndex: "createdBy" },
    { title: "Status", dataIndex: "status", align: "center" },
    { title: "Action", dataIndex: "action", align: "center", width: 90 },
  ];

  return (
    <MainLayout loading={false}>
      <div className="flex items-center justify-between">
        <div className="title-page">Draft Campaign</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() => navigate("/setting/line/draft-campaign/create")}
        />
      </div>

      <Filter
        filters={filters}
        values={filtersValue}
        onSearch={(values) => {
          setFiltersValue(values);
          setTableParams((prev) => ({
            ...prev,
            pagination: { ...prev.pagination, current: 1 },
          }));
        }}
        onClear={() => {
          setFiltersValue({});
          setTableParams((prev) => ({
            ...prev,
            pagination: { ...prev.pagination, current: 1 },
          }));
        }}
      />

      <BoxPrimary>
        <TableComponent
          header={header}
          dataSource={dataSource}
          pagination={{
            ...tableParams.pagination,
            total: dataSource.length,
          }}
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
