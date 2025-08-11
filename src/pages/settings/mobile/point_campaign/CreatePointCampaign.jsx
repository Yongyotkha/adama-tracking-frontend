import React, { useContext, useMemo, useState, useEffect, useRef } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ActionButton from "../../../../components/button/ActionButton";
import {
  Form,
  Input,
  Checkbox,
  Row,
  Col,
  Radio,
  DatePicker,
  Select,
  InputNumber,
  Button,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { AuthContext } from "../../../../contexts/AuthContext";
import TableComponent from "../../../../components/table/TableComponent";
import useServiceAPI from "../../../../services/corsService";
import { paths } from "../../../../services/CorsPath";

const { RangePicker } = DatePicker;
const { Search } = Input;

export default function CreatePointCampaign() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { showNotification } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // ====== mode & id ======
  const { mode } = useParams(); // 'create' | 'edit' | 'view'
  const location = useLocation();
  const idFromState = location.state?.id;
  const idFromQuery = new URLSearchParams(location.search).get("id");
  const recordId = idFromState ?? (idFromQuery ? Number(idFromQuery) : undefined);

  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const pageTitle = isCreate ? "Create Point Campaign" : isEdit ? "Edit Point Campaign" : "View Point Campaign";

  // ============ Target / Crop options from API ============
  const [dealerOptions, setDealerOptions] = useState([]);
  const [subDealerOptions, setSubDealerOptions] = useState([]);
  const [farmerOptions, setFarmerOptions] = useState([]);
  const [cropOptions, setCropOptions] = useState([]);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathPointCampaignTarget);
        const arr = res?.data?.data || res?.data || [];

        const groupMap = { Dealer: "dealer", "Sub Dealer": "sub", Farmer: "farmer" };
        const buckets = { dealer: [], sub: [], farmer: [] };
        const seen = { dealer: new Set(), sub: new Set(), farmer: new Set() };

        arr.forEach((it) => {
          const g = groupMap[(it?.target_name || "").trim()];
          if (!g) return;
          const label = (it?.type_id || "").trim();
          const id = String(it?.target_id || "");
          if (!label || !id) return;
          if (seen[g].has(label.toLowerCase())) return;
          seen[g].add(label.toLowerCase());
          buckets[g].push({ label, value: id });
        });

        setDealerOptions(buckets.dealer);
        setSubDealerOptions(buckets.sub);
        setFarmerOptions(buckets.farmer);
      } catch (_) {}
    };

    const fetchCrops = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterCrop);
        const arr = res?.data?.data || res?.data || [];
        setCropOptions(arr.map((c) => ({ label: c?.name || "-", value: String(c?.id) })));
      } catch (_) {}
    };

    fetchTargets();
    fetchCrops();
  }, []);

  // ====== เงื่อนไขโชว์ input ======
  const productMode = Form.useWatch("product_mode", form);
  const campaignMode = Form.useWatch("campaign_mode", form);

  // ===== Product Categories (from API) =====
  const [productCategories, setProductCategories] = useState([]); // [{ key(record_id str), record_id num, id str, name str }]
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [selectedCategoryKeys, setSelectedCategoryKeys] = useState([]); // record_id (string)
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCategoryLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathMasterProductCategorys);
        const arr = res?.data?.data || res?.data || [];
        const rows = arr.map((c) => ({
          key: String(c?.record_id ?? c?.id ?? c?.name ?? ""),
          record_id: Number(c?.record_id ?? 0),
          id: String(c?.id ?? ""),
          name: c?.name ?? "-",
        }));
        if (!cancelled) setProductCategories(rows);
      } catch (_) {
        if (!cancelled) setProductCategories([]);
      } finally {
        if (!cancelled) setCategoryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return productCategories;
    const q = categorySearch.toLowerCase();
    return productCategories.filter((c) => c.name.toLowerCase().includes(q));
  }, [productCategories, categorySearch]);

  const categoryOptionsForFilter = useMemo(
    () => productCategories.map((c) => ({ label: c.name, value: c.id })),
    [productCategories]
  );

  // ===== Products (from API) =====
  const [productRaw, setProductRaw] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState(undefined);
  const [selectedProductKeys, setSelectedProductKeys] = useState([]); // number[]

  useEffect(() => {
    if (productMode !== "specific") return;
    let cancelled = false;
    (async () => {
      setProductLoading(true);
      try {
        const body = { category_id: productCategoryFilter ?? "" }; // ถ้า wrapper รองรับ GET+params ได้
        const res = await useServiceAPI.get(paths.pathMasterProductList, body);
        const arr = res?.data?.data || res?.data || [];
        const rows = arr.map((p) => ({
          key: Number(p?.id),
          sku: p?.product_code || "-",
          name: p?.product_name || "-",
          packsize: p?.packing_list || "-",
          category: p?.product_category || p?.product_group || "-",
        }));
        if (!cancelled) {
          setProductRaw(rows);
          setSelectedProductKeys((prev) => prev.filter((k) => rows.some((r) => r.key === k)));
        }
      } catch (_) {
        if (!cancelled) {
          setProductRaw([]);
          setSelectedProductKeys([]);
          showNotification?.("error", "โหลดรายการสินค้าไม่สำเร็จ");
        }
      } finally {
        if (!cancelled) setProductLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [productMode, productCategoryFilter, showNotification]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return productRaw;
    const q = productSearch.toLowerCase();
    return productRaw.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.packsize || "").toLowerCase().includes(q)
    );
  }, [productRaw, productSearch]);

  // ====== Watch selections ======
  const watchDealer = Form.useWatch("target_dealer", form) || [];
  const watchSub = Form.useWatch("target_subdealer", form) || [];
  const watchFarmer = Form.useWatch("target_farmer", form) || [];

  const selectedTargetIds = useMemo(() => {
    const arr = [...watchDealer, ...watchSub, ...watchFarmer];
    return Array.from(new Set(arr)).map((x) => Number(x)).filter(Boolean);
  }, [watchDealer, watchSub, watchFarmer]);

  const showSelectTargetTable = selectedTargetIds.length > 0;

  // ====== Table: Select Target (REAL API) ======
  const [targetRows, setTargetRows] = useState([]);
  const [targetLoading, setTargetLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // customer_id[]

  const targetKey = useMemo(() => {
    const ids = [...watchDealer, ...watchSub, ...watchFarmer]
      .map(Number)
      .filter(Boolean)
      .sort((a, b) => a - b);
    return ids.join(",");
  }, [watchDealer, watchSub, watchFarmer]);

  const lastFetchKeyRef = useRef("");

  useEffect(() => {
    if (!targetKey) {
      setTargetRows([]);
      setSelectedRowKeys([]);
      lastFetchKeyRef.current = "";
      return;
    }
    if (lastFetchKeyRef.current === targetKey) return;
    lastFetchKeyRef.current = targetKey;

    let cancelled = false;
    (async () => {
      setTargetLoading(true);
      try {
        const ids = targetKey.split(",").map(Number);
        const res = await useServiceAPI.post(paths.pathPointCampaignCustomer, { target_id: ids });
        const data = res?.data?.data || res?.data || [];
        const rows = data.map((it) => ({
          key: Number(it?.customer_id),
          name: it?.customer_name || "-",
          target_group: it?.target_name || "-",
          type: it?.type || "-",
          address: it?.address || "-",
        }));
        if (!cancelled) {
          setTargetRows(rows);
          setSelectedRowKeys((prev) => prev.filter((k) => rows.some((r) => r.key === k)));
        }
      } catch (e) {
        if (!cancelled) {
          showNotification?.("error", e?.response?.data?.message || "โหลดรายชื่อลูกค้าไม่สำเร็จ");
          setTargetRows([]);
          setSelectedRowKeys([]);
        }
      } finally {
        if (!cancelled) setTargetLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [targetKey, showNotification]);

  const filteredTargetRows = useMemo(() => {
    if (!searchKeyword) return targetRows;
    const q = searchKeyword.toLowerCase();
    return targetRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.target_group.toLowerCase().includes(q)
    );
  }, [targetRows, searchKeyword]);

  const selectTargetColumns = [
    { title: "No", render: (_, __, index) => index + 1, width: 70 },
    { title: "Name", dataIndex: "name" },
    { title: "Target Group", dataIndex: "target_group", width: 140 },
    { title: "Type", dataIndex: "type", width: 140 },
    { title: "Address", dataIndex: "address" },
  ];

  const selectTargetRowSel = isView
    ? undefined
    : {
        selectedRowKeys,
        onChange: (keys) => setSelectedRowKeys(keys),
      };

  // ==========================
  // Extra / Topup editable tables
  // ==========================
  const [extraRows, setExtraRows] = useState([
    { key: 1, value_start: undefined, value_end: undefined, point: undefined },
  ]);
  const handleAddExtra = () =>
    setExtraRows((prev) => [
      ...prev,
      {
        key: (prev[prev.length - 1]?.key || 0) + 1,
        value_start: undefined,
        value_end: undefined,
        point: undefined,
      },
    ]);

  const [topupRows, setTopupRows] = useState([
    { key: 1, name: "", description: "", point: undefined, value_thb: undefined },
  ]);
  const handleAddTopup = () =>
    setTopupRows((prev) => [
      ...prev,
      {
        key: (prev[prev.length - 1]?.key || 0) + 1,
        name: "",
        description: "",
        point: undefined,
        value_thb: undefined,
      },
    ]);

  // ===== helpers =====
  const PRODUCT_MODE_MAP = { all: 1, category: 2, specific: 3 };
  const TYPE_MODE_MAP = { extra: 1, topup: 2, xpoint: 3 };
  const PRODUCT_MODE_REVERSE = { 1: "all", 2: "category", 3: "specific" };
  const TYPE_MODE_REVERSE = { 1: "extra", 2: "topup", 3: "xpoint" };

  function deriveCustomerType(dealerArr = [], subArr = [], farmerArr = []) {
    const picked = [
      dealerArr?.length ? "dealer" : null,
      subArr?.length ? "sub" : null,
      farmerArr?.length ? "farmer" : null,
    ].filter(Boolean);
    if (picked.length !== 1) return 0;
    return picked[0] === "dealer" ? 1 : picked[0] === "sub" ? 2 : 3;
  }

  function firstValidExtraRow(rows = []) {
    for (const r of rows) {
      const s = Number(r?.value_start);
      const e = Number(r?.value_end);
      const p = Number(r?.point);
      if (!Number.isNaN(s) && !Number.isNaN(e) && !Number.isNaN(p)) {
        return { start: s, end: e, point: p };
      }
    }
    return null;
  }

  function firstValidTopupRow(rows = []) {
    for (const r of rows) {
      const name = (r?.name || "").trim();
      const description = (r?.description || "").trim();
      const point = Number(r?.point);
      const value = Number(r?.value_thb);
      if (name && description && !Number.isNaN(point) && !Number.isNaN(value)) {
        return { name, description, point, value };
      }
    }
    return null;
  }

  // ====== detail preload targets (กระจาย target_id ไปยัง dealer/sub/farmer หลัง options มาแล้ว) ======
  const [targetsFromDetail, setTargetsFromDetail] = useState([]); // number[]

  useEffect(() => {
    if (!targetsFromDetail.length) return;
    const ids = targetsFromDetail.map(String);
    const dealerSel = dealerOptions.map((o) => o.value).filter((v) => ids.includes(v));
    const subSel = subDealerOptions.map((o) => o.value).filter((v) => ids.includes(v));
    const farmerSel = farmerOptions.map((o) => o.value).filter((v) => ids.includes(v));
    form.setFieldsValue({
      target_dealer: dealerSel,
      target_subdealer: subSel,
      target_farmer: farmerSel,
    });
  }, [targetsFromDetail, dealerOptions, subDealerOptions, farmerOptions, form]);

  // ====== fetch detail เมื่อ mode เป็น view/edit ======
  useEffect(() => {
    if (isCreate || !recordId) return;

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await useServiceAPI.post(paths.pathPointCampaignDetail, { id: recordId });
        const d = res?.data || {};
        const c = d?.campaign || {};

        const product_mode = PRODUCT_MODE_REVERSE[Number(c.product)] || "all";
        const campaign_mode = TYPE_MODE_REVERSE[Number(c.type)] || undefined;
        const xpointVal = Number(c?.xpoint ?? 0);

        const crops = (d?.crops || []).map(String);
        const targetsArr = (d?.targets || []).map((x) => Number(x)).filter(Boolean);

        if (!cancelled) {
          form.setFieldsValue({
            campaign_name: c?.name ?? "",
            product_mode,
            campaign_mode,
            campaign_value: campaign_mode === "xpoint" ? xpointVal : undefined,
            period: [
              c?.date_start ? dayjs(c.date_start) : null,
              c?.date_end ? dayjs(c.date_end) : null,
            ],
            status: Number(c?.use_flag ?? 1),
            target_crop: crops,
          });
          setTargetsFromDetail(targetsArr);
        }
      } catch (e) {
        showNotification?.("error", "โหลดข้อมูลไม่สำเร็จ", e?.response?.data?.message || "");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isCreate, recordId, form, showNotification]);

  // ====== Save (รองรับ create/edit + ส่งเฉพาะฟิลด์ตาม type) ======
  const onSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const [start, end] = values.period || [];

      const productModeNum = PRODUCT_MODE_MAP[values.product_mode]; // 1/2/3
      const typeNum = TYPE_MODE_MAP[values.campaign_mode]; // 1/2/3

      const categoryIds = (selectedCategoryKeys || []).map(Number).filter(Number.isFinite);
      const productIds = (selectedProductKeys || []).map(Number).filter(Number.isFinite);

      const targets = selectedTargetIds;
      const crops = (values.target_crop || []).map(Number).filter(Number.isFinite);

      const customer_type = deriveCustomerType(
        values.target_dealer,
        values.target_subdealer,
        values.target_farmer
      );

      const payload = {
        name: (values.campaign_name || "").trim(),
        product: productModeNum,
        type: typeNum,
        use_flag: Number(values.status ?? 1),
        customer_type,
        targets,
        crops,
        date_start: start ? dayjs(start).startOf("day").format("YYYY-MM-DD HH:mm:ss") : null,
        date_end: end ? dayjs(end).endOf("day").format("YYYY-MM-DD HH:mm:ss") : null,
      };

      if (productModeNum === 2) payload.categorys = categoryIds;   // record_id[]
      if (productModeNum === 3) payload.products = productIds;     // product id[]

      if (typeNum === 3) {
        payload.xpoint = Number(values.campaign_value || 0);
        if (!payload.xpoint) throw new Error("กรุณากรอก X Point ให้ถูกต้อง");
      } else if (typeNum === 1) {
        const extra = firstValidExtraRow(extraRows);
        if (!extra) throw new Error("กรุณากรอก Extra Point อย่างน้อย 1 แถวให้ครบ");
        payload.extra_point = extra;
      } else if (typeNum === 2) {
        const topup = firstValidTopupRow(topupRows);
        if (!topup) throw new Error("กรุณากรอก Topup Point อย่างน้อย 1 แถวให้ครบ");
        payload.topup_point = topup;
      }

      let res;
      if (isEdit) {
        res = await useServiceAPI.put(paths.pathPointCampaignUpdate, { ...payload, id: recordId });
      } else {
        res = await useServiceAPI.post(paths.pathPointCampaignCreate, payload);
      }

      
      if (res?.status === 200) {
        const id = res?.data?.data?.id;
        showNotification?.(
          "success",
          isEdit ? "อัปเดตข้อมูล Point Campaign เรียบร้อยแล้ว" : "เพิ่มข้อมูล Point Campaign เรียบร้อยแล้ว",
          `ID: ${id ?? recordId ?? "-"}`
        );
        navigate(-1);
      } else {
        throw new Error(res?.data?.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ");
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "บันทึกไม่สำเร็จ";
      showNotification?.("error", "บันทึกไม่สำเร็จ", msg);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { label: "Active", value: 1 },
    { label: "Inactive", value: 0 },
  ];

  const formDisabled = isView;

  return (
    <MainLayout loading={loading}>
      <div className="title-page">{pageTitle}</div>

      <BoxPrimary>
        <Form
          layout="vertical"
          form={form}
          disabled={formDisabled}
          initialValues={{ status: 1, product_mode: "all" }}
        >
          {/* Campaign Name */}
          <Form.Item
            label="Campaign Name"
            name="campaign_name"
            rules={[{ required: true, message: "Please input campaign name" }]}
          >
            <Input placeholder="Campaign 1" />
          </Form.Item>

          {/* Target Group */}
          <div className="text-[#333] font-medium mt-4 mb-2">
            Target Group <span className="text-[#ff4d4f]">*</span>
          </div>
          <Row gutter={[24, 16]}>
            <Col xs={24} md={6}>
              <div className="text-[#666] mb-2">Dealer</div>
              <Form.Item name="target_dealer" noStyle>
                <Checkbox.Group options={dealerOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <div className="text-[#666] mb-2">Sub Dealer</div>
              <Form.Item name="target_subdealer" noStyle>
                <Checkbox.Group options={subDealerOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <div className="text-[#666] mb-2">Farmer</div>
              <Form.Item name="target_farmer" noStyle>
                <Checkbox.Group options={farmerOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <div className="text-[#666] mb-2">Crop</div>
              <Form.Item name="target_crop" noStyle>
                <Checkbox.Group options={cropOptions} />
              </Form.Item>
            </Col>
          </Row>

          {/* Product & Campaign */}
          <Row gutter={24} className="mt-4">
            <Col xs={24} md={12}>
              <Form.Item
                label="Product"
                name="product_mode"
                rules={[{ required: true, message: "Please select product mode" }]}
              >
                <Radio.Group>
                  <Radio value="all">All Product</Radio>
                  <Radio value="category">Category</Radio>
                  <Radio value="specific">Specific</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Campaign"
                name="campaign_mode"
                rules={[{ required: true, message: "Please select campaign type" }]}
              >
                <Radio.Group>
                  <Radio value="extra">Extra Point</Radio>
                  <Radio value="topup">Topup Point</Radio>
                  <Radio value="xpoint">X Point</Radio>
                </Radio.Group>
              </Form.Item>

              {campaignMode === "xpoint" && (
                <Form.Item
                  name="campaign_value"
                  rules={[{ required: true, message: "Please enter a number" }]}
                >
                  <InputNumber style={{ width: 160 }} placeholder="Enter point (X)" min={0} />
                </Form.Item>
              )}
            </Col>
          </Row>

          {/* Period + Status */}
          <Row gutter={24} className="mt-2">
            <Col xs={24} md={12}>
              <Form.Item
                label="Period"
                name="period"
                rules={[{ required: true, message: "Please select period" }]}
              >
                <RangePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Status" name="status">
                <Select options={statusOptions} placeholder="Select status" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BoxPrimary>

      {/* Select Target */}
      {showSelectTargetTable && (
        <BoxPrimary>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[#00783F] text-lg font-semibold">Select Target</div>
            <div style={{ width: 280 }}>
              <Search placeholder="Search" allowClear onChange={(e) => setSearchKeyword(e.target.value)} />
            </div>
          </div>
          <TableComponent
            header={selectTargetColumns}
            dataSource={filteredTargetRows}
            loading={targetLoading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll
            rowSelection={selectTargetRowSel}
          />
        </BoxPrimary>
      )}

      {/* Product Mode: Category */}
      {productMode === "category" && (
        <BoxPrimary>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[#00783F] text-lg font-semibold">Select Category</div>
            <div style={{ width: 280 }}>
              <Search placeholder="Search" allowClear onChange={(e) => setCategorySearch(e.target.value)} />
            </div>
          </div>
          <TableComponent
            header={[
              { title: "No", render: (_, __, i) => i + 1, width: 70 },
              { title: "Category", dataIndex: "name" },
            ]}
            dataSource={filteredCategories}
            loading={categoryLoading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll
            rowSelection={
              isView
                ? undefined
                : {
                    selectedRowKeys: selectedCategoryKeys, // record_id (string)
                    onChange: (keys) => setSelectedCategoryKeys(keys),
                  }
            }
          />
        </BoxPrimary>
      )}

      {/* Product Mode: Specific */}
      {productMode === "specific" && (
        <BoxPrimary>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[#00783F] text-lg font-semibold">Select Product</div>
            <div className="flex items-center gap-2">
              <Select
                allowClear
                placeholder="Select Category"
                options={categoryOptionsForFilter}
                style={{ width: 220 }}
                value={productCategoryFilter}
                onChange={setProductCategoryFilter}
                disabled={isView}
              />
              <div style={{ width: 280 }}>
                <Search placeholder="Search" allowClear onChange={(e) => setProductSearch(e.target.value)} disabled={isView} />
              </div>
            </div>
          </div>
          <TableComponent
            header={[
              { title: "No", render: (_, __, i) => i + 1, width: 70 },
              { title: "SKU", dataIndex: "sku", width: 160 },
              { title: "Product Name", dataIndex: "name" },
              { title: "Packsize", dataIndex: "packsize", width: 160 },
              { title: "Category", dataIndex: "category", width: 160 },
            ]}
            dataSource={filteredProducts}
            loading={productLoading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll
            rowSelection={
              isView
                ? undefined
                : {
                    selectedRowKeys: selectedProductKeys,
                    onChange: (keys) => setSelectedProductKeys(keys),
                  }
            }
          />
        </BoxPrimary>
      )}

      {/* Extra Point */}
      {campaignMode === "extra" && (
        <BoxPrimary>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[#00783F] text-lg font-semibold">Extra Point</div>
            <div className="flex items-center gap-2">
              <div style={{ width: 280 }}>
                <Search placeholder="Search" disabled />
              </div>
              {!isView && (
                <Button className="bg-[#00783f] text-white" type="button" icon={<PlusOutlined />} onClick={handleAddExtra}>
                  Add Item
                </Button>
              )}
            </div>
          </div>
          <TableComponent
            header={[
              { title: "No", render: (_, __, i) => i + 1, width: 70 },
              {
                title: "Value Start (THB)",
                dataIndex: "value_start",
                render: (v, record) => (
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter"
                    value={v}
                    disabled={isView}
                    onChange={(val) =>
                      setExtraRows((prev) => prev.map((r) => (r.key === record.key ? { ...r, value_start: val } : r)))
                    }
                  />
                ),
              },
              {
                title: "Value End (THB)",
                dataIndex: "value_end",
                render: (v, record) => (
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter"
                    value={v}
                    disabled={isView}
                    onChange={(val) =>
                      setExtraRows((prev) => prev.map((r) => (r.key === record.key ? { ...r, value_end: val } : r)))
                    }
                  />
                ),
              },
              {
                title: "Point",
                dataIndex: "point",
                render: (v, record) => (
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter"
                    value={v}
                    disabled={isView}
                    onChange={(val) =>
                      setExtraRows((prev) => prev.map((r) => (r.key === record.key ? { ...r, point: val } : r)))
                    }
                  />
                ),
                width: 160,
              },
              {
                title: "Action",
                width: 90,
                align: "center",
                render: (_, record) =>
                  isView ? null : (
                    <DeleteOutlined
                      onClick={() =>
                        setExtraRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== record.key)))
                      }
                      style={{
                        color: "#ff4d4f",
                        cursor: "pointer",
                      }}
                    />
                  ),
              },
            ]}
            dataSource={extraRows}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll
          />
        </BoxPrimary>
      )}

      {/* Topup Point */}
      {campaignMode === "topup" && (
        <BoxPrimary>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[#00783F] text-lg font-semibold">Topup Point</div>
            <div className="flex items-center gap-2">
              <div style={{ width: 280 }}>
                <Search placeholder="Search" disabled />
              </div>
              {!isView && (
                <Button
                  className="bg-[#00783f] text-white"
                  type="button"
                  icon={<PlusOutlined />}
                  onClick={handleAddTopup}
                >
                  Add Item
                </Button>
              )}
            </div>
          </div>
          <TableComponent
            header={[
              { title: "No", render: (_, __, i) => i + 1, width: 70 },
              {
                title: "Name",
                dataIndex: "name",
                render: (v, record) => (
                  <Input
                    placeholder="Enter"
                    value={v}
                    disabled={isView}
                    onChange={(e) =>
                      setTopupRows((prev) => prev.map((r) => (r.key === record.key ? { ...r, name: e.target.value } : r)))
                    }
                  />
                ),
                width: 240,
              },
              {
                title: "Description",
                dataIndex: "description",
                render: (v, record) => (
                  <Input
                    placeholder="Enter"
                    value={v}
                    disabled={isView}
                    onChange={(e) =>
                      setTopupRows((prev) =>
                        prev.map((r) => (r.key === record.key ? { ...r, description: e.target.value } : r))
                      )
                    }
                  />
                ),
              },
              {
                title: "Point",
                dataIndex: "point",
                render: (v, record) => (
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter"
                    value={v}
                    disabled={isView}
                    onChange={(val) =>
                      setTopupRows((prev) => prev.map((r) => (r.key === record.key ? { ...r, point: val } : r)))
                    }
                  />
                ),
                width: 160,
              },
              {
                title: "Value (THB)",
                dataIndex: "value_thb",
                render: (v, record) => (
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Enter"
                    value={v}
                    disabled={isView}
                    onChange={(val) =>
                      setTopupRows((prev) => prev.map((r) => (r.key === record.key ? { ...r, value_thb: val } : r)))
                    }
                  />
                ),
                width: 180,
              },
              {
                title: "Action",
                width: 90,
                align: "center",
                render: (_, record) =>
                  isView ? null : (
                    <DeleteOutlined
                      onClick={() =>
                        setTopupRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== record.key)))
                      }
                      style={{ color: "#ff4d4f", cursor: "pointer" }}
                    />
                  ),
              },
            ]}
            dataSource={topupRows}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll
          />
        </BoxPrimary>
      )}

      <div className="flex justify-end space-x-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        {!isView && <ActionButton text="Save" mode="save" onClick={onSave} />}
      </div>
    </MainLayout>
  );
}
