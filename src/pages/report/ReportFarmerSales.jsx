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

const GREEN_DARK = "#0A8A43";
const GREEN_MID = "#86B91B";
const GREEN_LIGHT = "#A8D11F";

const mockRows = [
  { key: 1, product_name: "Apopo", pack_size: "0.5 Lt x 20", actual_kg: 100, actual_point: 100, actual_bath: 100000 },
  { key: 2, product_name: "Atranez 90 WG", pack_size: "0.9 kg x 20", actual_kg: 0, actual_point: 0, actual_bath: 0 },
  { key: 3, product_name: "Custodia 320 SC", pack_size: "40 x 0.25 Lt", actual_kg: 0, actual_point: 0, actual_bath: 0 },
  { key: 4, product_name: "Fiesta 100 EC", pack_size: "0.25 Lt x 24", actual_kg: 100, actual_point: 100, actual_bath: 100000 },
  { key: 5, product_name: "Hamper 300 SC", pack_size: "0.25 Lt x 24", actual_kg: 0, actual_point: 0, actual_bath: 0 },
  { key: 6, product_name: "Kanto 50 SC", pack_size: "1 Lt x 10", actual_kg: 100, actual_point: 100, actual_bath: 100000 },
];

export default function ReportFarmerSales() {
  const [form] = Form.useForm();
  const { showNotification } = useContext(AuthContext) || {};
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [areaList, setAreaList] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [subDealerList, setSubDealerList] = useState([]);
  const [farmerList, setFarmerList] = useState([]);
  const [yearList, setYearList] = useState([]);
  const [data, setData] = useState(mockRows);

  const selectedSales = Form.useWatch("sales_id", form);
  const selectedDealer = Form.useWatch("dealer_id", form);
  const selectedSubDealer = Form.useWatch("sub_dealer_id", form);

  useEffect(() => {
    const loadMasters = async () => {
      setLoading(true);
      try {
        const [areaRes, salesRes, yearRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterAreas),
          useServiceAPI.get(paths.pathMasterSaleDropdown),
          useServiceAPI.get(paths.pathMasterYear),
        ]);

        const areas = Array.isArray(areaRes?.data) ? areaRes.data : [];
        const sales = Array.isArray(salesRes?.data) ? salesRes.data : [];
        const years = Array.isArray(yearRes?.data) ? yearRes.data : [];

        setAreaList(areas.map((item) => ({ value: item.id, label: item.name })));
        setSalesList(sales.map((item) => ({ value: item.id, label: item.name })));
        setYearList(years.map((item) => ({ value: item.id, label: item.name })));
        form.setFieldsValue({ year: years[0]?.id ?? dayjs().year() });
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

  useEffect(() => {
    const loadFarmers = async () => {
      if (!selectedSubDealer) return setFarmerList([]);
      try {
        const res = await useServiceAPI.get(paths.pathMasterFarmer, { sub_dealer_id: selectedSubDealer });
        const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
        setFarmerList(list.map((item) => ({ value: item.farmer_id ?? item.id, label: item.farmer_name ?? item.name })));
      } catch {
        setFarmerList([]);
      }
    };
    loadFarmers();
  }, [selectedSubDealer]);

  const columns = [
    {
      title: "Product Name",
      dataIndex: "product_name",
      width: 200,
      onHeaderCell: () => ({ style: { backgroundColor: GREEN_DARK, color: "white", textAlign: "center" } }),
    },
    {
      title: "Pack Size",
      dataIndex: "pack_size",
      width: 160,
      onHeaderCell: () => ({ style: { backgroundColor: GREEN_DARK, color: "white", textAlign: "center" } }),
    },
    {
      title: "Actual (KG)",
      dataIndex: "actual_kg",
      align: "right",
      width: 180,
      onHeaderCell: () => ({ style: { backgroundColor: GREEN_MID, color: "white", textAlign: "center" } }),
      render: (value) => <InputNumber readOnly value={value} formatter={fmt} className="w-full" />,
    },
    {
      title: "Actual (Point)",
      dataIndex: "actual_point",
      align: "right",
      width: 180,
      onHeaderCell: () => ({ style: { backgroundColor: GREEN_LIGHT, color: "white", textAlign: "center" } }),
      render: (value) => <InputNumber readOnly value={value} formatter={fmt} className="w-full" />,
    },
    {
      title: "Actual (Baht)",
      dataIndex: "actual_bath",
      align: "right",
      width: 180,
      onHeaderCell: () => ({ style: { backgroundColor: GREEN_DARK, color: "white", textAlign: "center" } }),
      render: (value) => <InputNumber readOnly value={value} formatter={fmt} className="w-full" />,
    },
  ];

  const totals = {
    actual_kg: data.reduce((sum, row) => sum + row.actual_kg, 0),
    actual_point: data.reduce((sum, row) => sum + row.actual_point, 0),
    actual_bath: data.reduce((sum, row) => sum + row.actual_bath, 0),
  };

  const footer = () => (
    <tr className="bg-[#978B87] text-white">
      <td className="px-4 py-3 font-semibold" colSpan={2}>Total (THB)</td>
      <td className="px-4 py-3 text-right"><InputNumber readOnly value={totals.actual_kg} formatter={fmt} className="w-full" /></td>
      <td className="px-4 py-3 text-right"><InputNumber readOnly value={totals.actual_point} formatter={fmt} className="w-full" /></td>
      <td className="px-4 py-3 text-right"><InputNumber readOnly value={totals.actual_bath} formatter={fmt} className="w-full" /></td>
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
        farmer_id: form.getFieldValue("farmer_id") || "",
      };
      await useServiceAPI.get(paths.pathReportSellOut, payload);
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
    setFarmerList([]);
    setData(mockRows);
  };

  return (
    <MainLayout loading={loading}>
      <Title prefix="Report Farmer Sales" />
      <BoxPrimary className="m-1 mb-4">
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col xs={24} md={6}><Form.Item label="Area" name="area_id"><Select options={areaList} allowClear placeholder="All" /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label="Sales" name="sales_id"><Select options={salesList} allowClear placeholder="All" /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label="Dealer" name="dealer_id"><Select options={dealerList} allowClear placeholder="All" disabled={!selectedSales} /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label="Sub Dealer" name="sub_dealer_id"><Select options={subDealerList} allowClear placeholder="All" disabled={!selectedDealer} /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label="Farmer" name="farmer_id"><Select options={farmerList} allowClear placeholder="All" disabled={!selectedSubDealer} /></Form.Item></Col>
            <Col xs={24} md={6}><Form.Item label="Month" name="month"><Select options={[{ value: "All", label: "All" }]} allowClear placeholder="All" /></Form.Item></Col>
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

