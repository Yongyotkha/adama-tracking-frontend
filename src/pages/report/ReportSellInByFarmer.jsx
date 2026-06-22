import React, { useEffect, useMemo, useState, useContext } from "react";
import { Form, Row, Col, Select, InputNumber } from "antd";
import dayjs from "dayjs";
import MainLayout from "../../layouts/MainLayout";
import Title from "../../components/title/Title";
import BoxPrimary from "../../components/box_primary/BoxPrimary";
import DynamicButton from "../../components/button/DynamicButton";
import TableCustomComponent from "../../components/table/TableCustomComponent";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { AuthContext } from "../../contexts/AuthContext";

const fmt = (value) =>
  `${parseInt(Number(value) || 0, 10)}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const GREEN = "#00783F";

const mockRows = [
  { key: 1, farmer_name: "???? ?????", target: 18000, actual_point: 300, actual_value: 15000, achievement: 83.3 },
  { key: 2, farmer_name: "???? ?????????", target: 36000, actual_point: 300, actual_value: 40000, achievement: 111.1 },
  { key: 3, farmer_name: "????? ???????", target: 27000, actual_point: 300, actual_value: 25000, achievement: 92.6 },
  { key: 4, farmer_name: "????? ???????", target: 45000, actual_point: 300, actual_value: 45000, achievement: 100.0 },
  { key: 5, farmer_name: "??????? ????", target: 54000, actual_point: 300, actual_value: 50000, achievement: 92.5 },
];

export default function ReportSellInByFarmer() {
  const [form] = Form.useForm();
  const { showNotification } = useContext(AuthContext) || {};
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [areaList, setAreaList] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [yearList, setYearList] = useState([]);
  const [data, setData] = useState(mockRows);

  const selectedSales = Form.useWatch("sales_id", form);
  const selectedDealer = Form.useWatch("dealer_id", form);

  useEffect(() => {
    const loadMasters = async () => {
      setLoading(true);
      try {
        const [areaRes, salesRes, yearRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterAreas),
          useServiceAPI.get(paths.pathMasterSaleDropdown),
          useServiceAPI.get(paths.pathMasterYear),
        ]);

        setAreaList((Array.isArray(areaRes?.data) ? areaRes.data : []).map((item) => ({ value: item.id, label: item.name })));
        setSalesList((Array.isArray(salesRes?.data) ? salesRes.data : []).map((item) => ({ value: item.id, label: item.name })));
        setYearList((Array.isArray(yearRes?.data) ? yearRes.data : []).map((item) => ({ value: item.id, label: item.name })));
        form.setFieldsValue({ year: yearRes?.data?.[0]?.id ?? dayjs().year() });
      } catch (error) {
        showNotification?.("error", error?.message || "Load master failed");
      } finally {
        setLoading(false);
      }
    };

    loadMasters();
  }, [form, showNotification]);

  useEffect(() => {
    const loadDealers = async () => {
      if (!selectedSales) return setDealerList([]);
      try {
        const res = await useServiceAPI.get(paths.pathMasterDealerDropdown, { user_id: selectedSales });
        const list = Array.isArray(res?.data) ? res.data : [];
        setDealerList(list.map((item) => ({ value: item.id, label: item.name })));
      } catch {
        setDealerList([]);
      }
    };
    loadDealers();
  }, [selectedSales]);

  useEffect(() => {
    const loadSubDealers = async () => {
      if (!selectedSales || !selectedDealer) return setSubDealerList([]);
      try {
        const res = await useServiceAPI.get(paths.pathMasterSubDealerAll, { user_id: selectedSales, dealer_id: selectedDealer });
        const list = Array.isArray(res?.data) ? res.data : [];
        setSubDealerList(list.map((item) => ({ value: item.sub_dealer_id ?? item.id, label: item.sub_dealer_name ?? item.name })));
      } catch {
        setSubDealerList([]);
      }
    };
    loadSubDealers();
  }, [selectedSales, selectedDealer]);

  const columns = [
    { title: "Farmer Name", dataIndex: "farmer_name", width: 220, onHeaderCell: () => ({ style: { backgroundColor: GREEN, color: "white", textAlign: "center" } }) },
    { title: "Target", dataIndex: "target", align: "right", width: 150, onHeaderCell: () => ({ style: { backgroundColor: GREEN, color: "white", textAlign: "center" } }), render: (v) => <InputNumber readOnly value={v} formatter={fmt} className="w-full" /> },
    { title: "Actual (Point)", dataIndex: "actual_point", align: "right", width: 150, onHeaderCell: () => ({ style: { backgroundColor: GREEN, color: "white", textAlign: "center" } }), render: (v) => <InputNumber readOnly value={v} formatter={fmt} className="w-full" /> },
    { title: "Actual (Value)", dataIndex: "actual_value", align: "right", width: 150, onHeaderCell: () => ({ style: { backgroundColor: GREEN, color: "white", textAlign: "center" } }), render: (v) => <InputNumber readOnly value={v} formatter={fmt} className="w-full" /> },
    { title: "% Achievement", dataIndex: "achievement", align: "right", width: 150, onHeaderCell: () => ({ style: { backgroundColor: GREEN, color: "white", textAlign: "center" } }), render: (v) => <InputNumber readOnly value={v} formatter={(x) => `${Number(x || 0).toFixed(1)}%`} className="w-full" /> },
  ];

  const totals = {
    target: data.reduce((sum, row) => sum + row.target, 0),
    actual_point: data.reduce((sum, row) => sum + row.actual_point, 0),
    actual_value: data.reduce((sum, row) => sum + row.actual_value, 0),
    achievement: data.length ? data.reduce((sum, row) => sum + row.achievement, 0) / data.length : 0,
  };

  const footer = () => (
    <tr className="bg-[#978B87] text-white">
      <td className="px-4 py-3 font-semibold">Total (THB)</td>
      <td className="px-4 py-3 text-right"><InputNumber readOnly value={totals.target} formatter={fmt} className="w-full" /></td>
      <td className="px-4 py-3 text-right"><InputNumber readOnly value={totals.actual_point} formatter={fmt} className="w-full" /></td>
      <td className="px-4 py-3 text-right"><InputNumber readOnly value={totals.actual_value} formatter={fmt} className="w-full" /></td>
      <td className="px-4 py-3 text-right"><InputNumber readOnly value={totals.achievement} formatter={(x) => `${Number(x || 0).toFixed(1)}%`} className="w-full" /></td>
    </tr>
  );

  const handleSearch = async () => {
    setTableLoading(true);
    try {
      const payload = {
        year: form.getFieldValue("year") || dayjs().year(),
        area_id: form.getFieldValue("area_id") || "",
        user_id: form.getFieldValue("sales_id") || "",
        dealer_id: form.getFieldValue("dealer_id") || "",
        sub_dealer_id: form.getFieldValue("sub_dealer_id") || "",
      };
      await useServiceAPI.get(paths.pathReportSaleHistory, payload);
      setData(mockRows);
    } catch {
      setData(mockRows);
    } finally {
      setTableLoading(false);
    }
  };

  const handleClear = () => {
    form.resetFields();
    form.setFieldsValue({ year: yearList[0]?.value ?? dayjs().year() });
    setDealerList([]);
    setSubDealerList([]);
    setData(mockRows);
  };

  return (
    <MainLayout loading={loading}>
      <Title prefix="Sell-In Report by Farmer" />
      <BoxPrimary className="m-1 mb-4">
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col xs={24} md={6}><Form.Item label="Area" name="area_id"><Select options={areaList} allowClear placeholder="All" /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label="Sales" name="sales_id"><Select options={salesList} allowClear placeholder="All" /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label="Dealer" name="dealer_id"><Select options={dealerList} allowClear placeholder="All" disabled={!selectedSales} /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label="Sub Dealer" name="sub_dealer_id"><Select options={subDealerList} allowClear placeholder="All" disabled={!selectedDealer} /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label="Year" name="year"><Select options={yearList} allowClear={false} /></Form.Item></Col>
          </Row>
          <div className="flex justify-end gap-3">
            <DynamicButton onClick={handleSearch} text="Search" name="search" className="text-white bg-[#7DB41E]" />
            <DynamicButton onClick={handleClear} text="Clear" name="clear" className="text-white bg-[#B6AEAB]" />
          </div>
        </Form>
      </BoxPrimary>
      <BoxPrimary>
        <TableCustomComponent header={columns} dataSource={data} pagination={false} footer={footer} loading={tableLoading} scroll scrollX scrollY rowHeight={54} extraY={120} />
      </BoxPrimary>
    </MainLayout>
  );
}

