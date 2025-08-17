import React, { useState } from "react";
import { Tabs, Dropdown } from "antd";
import MainLayout from "../../../../layouts/MainLayout";
import Filter from "../../../../components/filter/Filter";
import TableComponent from "../../../../components/table/TableComponent";
import BadgeStatus from "../../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ItemDropDown from "../../../../components/dropdown/ItemDropDown";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";

const { TabPane } = Tabs;

export default function TranspotationList() {
  const [activeTab, setActiveTab] = useState("list");
  const navigate = useNavigate();

  const handleNavigate = (document_number, mode) => {
    navigate(`/points/line/sales-points-list/${mode}`, {
      state: { document_number },
    });
  };

  const headerList = [
    { title: "Document No", dataIndex: "document_no" },
    { title: "Sales", dataIndex: "sales" },
    { title: "Dealer", dataIndex: "dealer" },
    { title: "Sub Dealer", dataIndex: "sub_dealer" },
    { title: "QTY (ctn)", dataIndex: "qty" },
    { title: "Value (THB)", dataIndex: "value" },
    { title: "Date", dataIndex: "date" },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <BadgeStatus text={text} bgColor="#00783F" textColor="#fff" />
      ),
    },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  const dataList = [
    {
      key: 1,
      document_no: "O2025040109",
      sales: "Amorn Sriworakul",
      dealer: "Somporn Panich Chemi Kaset Ltd.part.",
      sub_dealer: "นายกหน่อย",
      qty: "15+1",
      value: "173,300",
      date: "2025-05-27",
      status: "Waiting for Receive",
    },
    {
      key: 2,
      document_no: "O2025040108",
      sales: "Amorn Sriworakul",
      dealer: "Somporn Panich Chemi Kaset Ltd.part.",
      sub_dealer: "นายกหน่อย",
      qty: "15+1",
      value: "173,300",
      date: "2025-05-27",
      status: "Completed",
    },
  ];

  const headerRequest = [
    { title: "Dealer", dataIndex: "dealer" },
    { title: "Sub Dealer", dataIndex: "sub_dealer" },
    { title: "Sales", dataIndex: "sales" },
    { title: "Request Date", dataIndex: "request_date" },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <BadgeStatus text={text} bgColor="#FFAA00" textColor="#fff" />
      ),
    },
    { title: "Action", dataIndex: "action", align: "center" },
  ];

  const dataRequest = [
    {
      key: 1,
      dealer: "Somporn Panich Chemi Kaset Ltd.part.",
      sub_dealer: "นายกหน่อย",
      sales: "Amorn Sriworakul",
      request_date: "2025-05-27",
      status: "Waiting for Create",
    },
  ];

  const getAction = (record) => {
    const items = [
      {
        key: "view",
        label: (
          <ItemDropDown
            mode="view"
            onClick={() => handleNavigate(record.document_no, "view")}
          />
        ),
      },
    ];

    if (record.status === "Waiting for Receive") {
      items.unshift({
        key: "edit",
        label: (
          <ItemDropDown
            mode="edit"
            onClick={() => handleNavigate(record.document_no, "edit")}
          />
        ),
      });
      items.push({
        key: "delete",
        label: (
          <ItemDropDown
            mode="delete"
            onClick={() => console.log("Delete", record.document_no)}
          />
        ),
      });
    }

    return (
      <Dropdown menu={{ items }}>
        <a onClick={(e) => e.preventDefault()}>
          <img src="/img/icons/action.png" alt="action" className="w-5 h-5" />
        </a>
      </Dropdown>
    );
  };


  const listDataSource = dataList.map((item) => ({
    ...item,
    action: getAction(item, "view"),
  }));

  const requestDataSource = dataRequest.map((item) => ({
    ...item,
    action: getAction({ ...item, document_no: null }, "create"),
  }));

  return (
    <MainLayout loading={false}>
      <div className="flex items-center justify-between">
        <div className="title-page">Sales Points</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() =>
            handleNavigate(null, "create")
          }
        />
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="custom-tabs">
        <TabPane tab={<span className="tab-title">Sales Points List</span>} key="list">
          <Filter filters={[]} onSearch={() => { }} onClear={() => { }} />
          <br />
          <BoxPrimary>
            <TableComponent
              header={headerList}
              dataSource={listDataSource}
              pagination={false}
              loading={false}
            />
          </BoxPrimary>
        </TabPane>

        <TabPane tab={<span className="tab-title">Sales Points Request</span>} key="request">
          <Filter filters={[]} onSearch={() => { }} onClear={() => { }} />
          <br />
          <BoxPrimary>
            <TableComponent
              header={headerRequest}
              dataSource={requestDataSource}
              pagination={false}
              loading={false}
            />
          </BoxPrimary>
        </TabPane>
      </Tabs>
    </MainLayout>
  );
}
