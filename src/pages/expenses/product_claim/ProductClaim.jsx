import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Filter from "../../../components/filter/Filter";
import { Dropdown } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import ItemDropDown from "../../../components/dropdown/ItemDropDown";
import DynamicModal from "../../../components/modal/DynamicModal";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function ProductClaim() {
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {},
    sortOrder: null,
    sortField: null,
  });
  const navigate = useNavigate();
  const pathSegments = location.pathname.split('/');
  const listSegment = pathSegments[2] === 'product-claim-list';
  
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
      key: "dealer_name",
      type: "select",
      label: "Dealer",
      placeholder: "All",
      options: dealerList
    },
    {
      key: "status",
      type: 'select',
      label: "Status",
      placeholder: "All",
      options: statusList,
    },
  ];
  
  const handleSearch = (filter) => {
    console.log("Search filters applied:", filter);
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  const handleShowProductModal = () => {
    setIsProductModalVisible(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalVisible(false);
  };

  const productModalData = [
    { key: 1, name: "Tossaphon Suphaksitthikorn", territory: "Left North", position: "Business Development Executive" },
    { key: 2, name: "Panudech Srithong", territory: "Left Lower North", position: "Business Development Executive" },
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
    { title: "Status", width: 150, dataIndex: "status", align: "center" },
    { title: "Action", width: 100, dataIndex: "action", align: "center" },
  ];

  const fetchData = async () => {
    setTableLoading(true);
    const { current, pageSize } = tableParams.pagination;
    const filters = tableParams.filters || {};

    const sortOrder = tableParams.sortOrder || "desc";
    const sortField = tableParams.sortField || "document_number";

    const requestData = {
      keyword: filters.keyword || "",
      trasaction_status_code : "ODW",
      page : listSegment ? "all" : "wait_for_approval",
      payment_status_code : "",
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
            { key: "1", label: <ItemDropDown mode="edit" link="/expenses/product-claim/edit" /> },
          ];
        
          return {
            key: index + 1 + (current - 1) * pageSize,
            claimNo: row.document_number,
            claimDate: row.document_date,
            dealerName: row.dealer_name,
            product: <BadgeStatus text={row.product_count} bgColor="#F89E18" textColor="#FFFFFF" />,
            status: <BadgeStatus text={row.status_transaction_name} bgColor={row.status_transaction_bg_color} textColor={row.status_transaction_color} />,
            action: (
              <Dropdown menu={{ items: actionItems }} placement="bottomRight">
                <a onClick={(e) => e.preventDefault()}>
                  <img src="/img/icons/action.png" alt="Actions icon" className="inline-block w-5 h-5" />
                </a>
              </Dropdown>
            ),
          };
        });

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
  useEffect(() => {
    const getMasterStatus = async () => {
      try {
        const [status, dealer] = await Promise.all([
          useServiceAPI.get(paths.pathMasterStatus, {
            status_type: "claim"
          }),
          useServiceAPI.get(paths.pathMasterSubDealer, {}),
        ]);

        setStatusList(status.data);

        let subDealerAll = [];
        await dealer.data.forEach(element => {
          subDealerAll.push({
            'id': element.sub_dealer_id,
            'name': element.sub_dealer_name,
          });
        });

        setDealerList((prevList) => [...prevList, ...subDealerAll]);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      }
    };

    getMasterStatus();
  }, [])
  
  useEffect(() => {
    fetchData();
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
        <ActionButton mode="create" text="Create" onClick={(e) => navigate("/expenses/product-claim/create")} />
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
        width="1200px" // Customize the width to make it extra-large
      />

    </MainLayout>
  );
}
