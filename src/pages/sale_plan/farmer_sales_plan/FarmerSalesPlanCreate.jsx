import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Col, Row, Select } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import ActionButton from "../../../components/button/ActionButton";
import { AuthContext } from "../../../contexts/AuthContext";
import { defaultPlanLines, money } from "./farmerSalesPlanMock";
import {
  ensureOption,
  loadFarmerPlanMasters,
  loadPlanProduct,
  searchPlanProducts,
} from "./farmerSalesPlanMaster";

const yearSelectClass =
  "min-w-[140px] [&_.ant-select-selector]:border-[#00783F] [&_.ant-select-selection-item]:font-semibold [&_.ant-select-selection-item]:text-[#00783F]";

export default function FarmerSalesPlanCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg } = useContext(AuthContext);
  const plan = location.state?.plan;
  const isView = location.state?.mode === "view" || plan?.status === "Completed";

  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(location.state?.year || plan?.year || 2026);
  const [years, setYears] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [subDealers, setSubDealers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [dealerId, setDealerId] = useState(plan?.dealerId);
  const [subDealerId, setSubDealerId] = useState(plan?.subDealerId);
  const [farmerId, setFarmerId] = useState(plan?.farmerId);
  const [cropId, setCropId] = useState(plan?.cropId);
  const [lines, setLines] = useState(defaultPlanLines);
  const [productOptions, setProductOptions] = useState([]);
  const productSearchRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const master = await loadFarmerPlanMasters({ includeCrops: true });
        if (cancelled) return;
        setYears(master.years);
        setDealers(master.dealers);
        setSubDealers(master.subDealers);
        setFarmers(master.farmers);
        setCrops(master.crops);
      } catch (error) {
        if (!cancelled) showMsg("error", error?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [showMsg]);

  const dealerOptions = useMemo(
    () => ensureOption(dealers, dealerId, plan?.dealer),
    [dealerId, dealers, plan?.dealer]
  );
  const subDealerOptions = useMemo(() => {
    const source = dealerId
      ? subDealers.filter((item) => String(item.dealerId) === String(dealerId))
      : subDealers;
    return ensureOption(
      source.map((item) => ({ id: item.id, name: item.name })),
      subDealerId,
      plan?.subDealer
    );
  }, [dealerId, plan?.subDealer, subDealerId, subDealers]);
  const farmerOptions = useMemo(() => {
    const source = farmers.filter((item) => {
      if (subDealerId) return String(item.subDealerId) === String(subDealerId);
      if (dealerId) return String(item.dealerId) === String(dealerId);
      return false;
    });
    return ensureOption(
      source.map((item) => ({ id: item.id, name: item.name })),
      farmerId,
      plan?.farmer
    );
  }, [dealerId, farmerId, farmers, plan?.farmer, subDealerId]);

  const onSearchProduct = (value) => {
    const requestId = productSearchRef.current + 1;
    productSearchRef.current = requestId;
    const keyword = String(value || "").trim();
    if (keyword.length < 3) {
      setProductOptions([]);
      return;
    }
    searchPlanProducts(keyword)
      .then((options) => {
        if (requestId === productSearchRef.current) setProductOptions(options);
      })
      .catch(() => {
        if (requestId === productSearchRef.current) setProductOptions([]);
      });
  };

  const addProduct = async (productId) => {
    if (lines.some((line) => String(line.id) === String(productId))) {
      showMsg("warning", "สินค้านี้มีอยู่ในรายการแล้ว");
      return;
    }
    setLoading(true);
    try {
      const product = await loadPlanProduct(productId);
      setLines((prev) => [...prev, product]);
      setProductOptions([]);
    } catch (error) {
      showMsg("error", error?.message || "โหลดสินค้าไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);

  const changeQty = (id, qty) => {
    const next = Math.max(1, Number(qty) || 1);
    setLines((prev) => prev.map((line) => (line.id === id ? { ...line, qty: next } : line)));
  };

  const mockSave = (label) => {
    showMsg("warning", `${label} ยังไม่บันทึก หน้านี้เป็น UI จำลอง`);
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 70, align: "center" },
    { title: "SKU", dataIndex: "sku", key: "sku", width: 150 },
    { title: "Product Name", dataIndex: "name", key: "name" },
    { title: "Unit", dataIndex: "unit", key: "unit", width: 120 },
    {
      title: "THB/Unit",
      dataIndex: "price",
      key: "price",
      align: "right",
      width: 120,
      render: (value) => money(value),
    },
    {
      title: "QTY",
      dataIndex: "qty",
      key: "qty",
      width: 160,
      align: "center",
      render: (_, record) =>
        isView ? (
          record.qty
        ) : (
          <div className="flex items-center justify-center">
            <img
              src="/img/icons/collapse.png"
              alt="decrease"
              className="h-6 w-6 cursor-pointer"
              onClick={() => changeQty(record.id, record.qty - 1)}
            />
            <input
              inputMode="numeric"
              value={record.qty}
              onChange={(event) => changeQty(record.id, event.target.value)}
              className="mx-2 w-16 rounded border border-solid border-[#00783F] py-1 text-center text-[#00783F]"
            />
            <img
              src="/img/icons/expand.png"
              alt="increase"
              className="h-6 w-6 cursor-pointer"
              onClick={() => changeQty(record.id, record.qty + 1)}
            />
          </div>
        ),
    },
    {
      title: "Sub Total (THB)",
      key: "sub_total",
      align: "right",
      width: 150,
      render: (_, record) => money(record.price * record.qty),
    },
    {
      title: "Point",
      key: "point",
      align: "right",
      width: 90,
      render: (_, record) => Number(record.pointPerUnit * record.qty).toLocaleString("en-US"),
    },
    !isView && {
      title: "Action",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) => (
        <button onClick={() => setLines((prev) => prev.filter((line) => line.id !== record.id))}>
          <img src="/img/icons/delete.png" alt="delete" className="inline-block h-6 w-6" />
        </button>
      ),
    },
  ].filter(Boolean);

  return (
    <MainLayout loading={loading}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="title-page">{isView ? "View Sales Plan" : "Create Sales Plan"}</div>
        <Select
          value={year}
          disabled={isView}
          onChange={setYear}
          options={years}
          className={yearSelectClass}
        />
      </div>

      <BoxPrimary>
        <Row gutter={24}>
          <Col xs={24} md={6}>
            <label className="mb-1 block text-gray-700">Dealer</label>
            <Select
              className="w-full"
              disabled={isView}
              value={dealerId}
              options={dealerOptions.map((item) => ({ value: item.id, label: item.name }))}
              onChange={(value) => {
                setDealerId(value);
                setSubDealerId(undefined);
                setFarmerId(undefined);
              }}
            />
          </Col>
          <Col xs={24} md={6}>
            <label className="mb-1 block text-gray-700">Sub Dealer</label>
            <Select
              className="w-full"
              disabled={isView}
              value={subDealerId}
              placeholder="Select sub dealer"
              options={subDealerOptions.map((item) => ({ value: item.id, label: item.name }))}
              onChange={(value) => {
                setSubDealerId(value);
                setFarmerId(undefined);
              }}
            />
          </Col>
          <Col xs={24} md={6}>
            <label className="mb-1 block text-gray-700">Farmer</label>
            <Select
              className="w-full"
              disabled={isView}
              value={farmerId}
              placeholder="Select farmer"
              options={farmerOptions.map((item) => ({ value: item.id, label: item.name }))}
              onChange={setFarmerId}
            />
          </Col>
          <Col xs={24} md={6}>
            <label className="mb-1 block text-gray-700">Crop</label>
            <Select
              className="w-full"
              disabled={isView}
              allowClear
              value={cropId}
              placeholder="Select crop"
              options={crops.map((item) => ({ value: item.id, label: item.name }))}
              onChange={setCropId}
            />
          </Col>
        </Row>
      </BoxPrimary>

      <BoxPrimary>
        <div className="mb-3 text-lg font-semibold text-[#00783F]">
          {isView ? "Products" : "Product"}
        </div>
        {!isView && (
          <Select
            showSearch
            filterOption={false}
            value={null}
            placeholder="Search Product"
            options={productOptions}
            onSearch={onSearchProduct}
            onChange={addProduct}
            className="mb-4 w-full"
          />
        )}

        {!isView && <div className="mb-3 text-lg font-semibold text-[#00783F]">List</div>}
        <TableComponent
          header={header}
          dataSource={lines}
          rowKey="id"
          pagination={false}
          footer={() => (
            <tr>
              <td colSpan={header.length} className="pr-4 text-right text-white">
                Item: {lines.length}&nbsp;&nbsp;Total: {money(total)}
              </td>
            </tr>
          )}
        />
      </BoxPrimary>

      <div className="mt-4 flex justify-end gap-3">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/sale-plan/farmer-sales-plan")} />
        {!isView && (
          <>
            <ActionButton mode="saveDraft" text="Save Draft" onClick={() => mockSave("Save Draft")} />
            <ActionButton mode="save" text="Save" onClick={() => mockSave("Save")} />
          </>
        )}
      </div>
    </MainLayout>
  );
}
