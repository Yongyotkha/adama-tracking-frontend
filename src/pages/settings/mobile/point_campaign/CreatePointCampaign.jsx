import React, { useContext, useMemo, useState, useEffect, useRef } from "react";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import { useNavigate } from "react-router-dom";
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

        // group ตาม target_name และลบ label ซ้ำ
        const groupMap = { Dealer: "dealer", "Sub Dealer": "sub", Farmer: "farmer" };
        const buckets = { dealer: [], sub: [], farmer: [] };
        const seen = { dealer: new Set(), sub: new Set(), farmer: new Set() };

        arr.forEach((it) => {
          const g = groupMap[(it?.target_name || "").trim()];
          if (!g) return;
          const label = (it?.type_id || "").trim();
          const id = String(it?.target_id || "");
          if (!label || !id) return;
          if (seen[g].has(label.toLowerCase())) return; // กันซ้ำ
          seen[g].add(label.toLowerCase());
          buckets[g].push({ label, value: id });
        });

        setDealerOptions(buckets.dealer);
        setSubDealerOptions(buckets.sub);
        setFarmerOptions(buckets.farmer);
      } catch (e) {
        // เงียบไว้ ไม่ให้ฟอร์มพัง
      }
    };

    const fetchCrops = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterCrop);
        const arr = res?.data?.data || res?.data || [];
        setCropOptions(arr.map((c) => ({ label: c?.name || "-", value: String(c?.id) })));
      } catch (e) { }
    };

    fetchTargets();
    fetchCrops();
  }, []);

  // ====== เงื่อนไขโชว์ input ======
  const productMode = Form.useWatch("product_mode", form);
  const campaignMode = Form.useWatch("campaign_mode", form);

  // ===== Product Categories (from API) =====
  const [productCategories, setProductCategories] = useState([]); // [{key,id,name}]
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [selectedCategoryKeys, setSelectedCategoryKeys] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");

  // โหลดหมวดเมื่อ mount
  // useEffect(() => {
  //   let cancelled = false;
  //   (async () => {
  //     setCategoryLoading(true);
  //     try {
  //       const res = await useServiceAPI.get(paths.pathMasterProductCategorys);
  //       const arr = res?.data?.data || res?.data || [];
  //       const rows = arr.map((c) => ({
  //         key: String(c?.id ?? c?.name ?? ""),
  //         id: String(c?.id ?? ""),
  //         name: c?.name ?? "-",
  //       }));
  //       if (!cancelled) setProductCategories(rows);
  //     } catch (e) {
  //       if (!cancelled) setProductCategories([]);
  //     } finally {
  //       if (!cancelled) setCategoryLoading(false);
  //     }
  //   })();
  //   return () => {
  //     cancelled = true;
  //   };
  // }, []);

  // โหลดหมวดเมื่อ mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCategoryLoading(true);
      try {
        const res = await useServiceAPI.get(paths.pathMasterProductCategorys);
        const arr = res?.data?.data || res?.data || [];
        const rows = arr.map((c) => ({
          key: String(c?.record_id ?? c?.id ?? c?.name ?? ""),  // ใช้ record_id เป็น key
          record_id: Number(c?.record_id ?? 0),                  // <- เก็บ record_id ไว้ใช้ส่ง backend
          id: String(c?.id ?? ""),                               // <- ใช้ id (เช่น "Fungicide") สำหรับ filter products
          name: c?.name ?? "-",
        }));
        if (!cancelled) setProductCategories(rows);
      } catch (e) {
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

  // ใช้ list เดียวกันทำ options ของตัวกรองในหน้า Specific
  const categoryOptionsForFilter = useMemo(
    () => productCategories.map((c) => ({ label: c.name, value: c.id })),
    [productCategories]
  );

  // ===== Products (from API) =====
  const [productRaw, setProductRaw] = useState([]); // เก็บของจริงจาก API
  const [productLoading, setProductLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState(undefined);
  const [selectedProductKeys, setSelectedProductKeys] = useState([]);

  // โหลดสินค้าเมื่อเข้าโหมด specific หรือเปลี่ยน filter category
  // โหลดสินค้าเมื่อเข้าโหมด specific หรือเปลี่ยน filter category
  useEffect(() => {
    if (productMode !== "specific") return;
    console.log(productMode);
    let cancelled = false;
    (async () => {
      setProductLoading(true);
      try {
        const body = { category_id: productCategoryFilter ?? "" }; // ว่าง = ทั้งหมด
        const res = await useServiceAPI.get(paths.pathMasterProductList, body);
        console.log(res);
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
          // sync selection เผื่อ key หายหลังเปลี่ยนหมวด
          setSelectedProductKeys((prev) => prev.filter((k) => rows.some((r) => r.key === k)));
        }
      } catch (e) {
        if (!cancelled) {
          setProductRaw([]);
          setSelectedProductKeys([]);
          showNotification?.("error", "โหลดรายการสินค้าไม่สำเร็จ");
        }
      } finally {
        if (!cancelled) setProductLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
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
  const watchCrop = Form.useWatch("target_crop", form) || []; // (ไม่ใช้ยิง API customer ตอนนี้)

  // target_id ที่ต้องยิง API customer
  const selectedTargetIds = useMemo(() => {
    const arr = [...watchDealer, ...watchSub, ...watchFarmer];
    return Array.from(new Set(arr)).map((x) => Number(x)).filter(Boolean);
  }, [watchDealer, watchSub, watchFarmer]);

  // แสดงตาราง Select Target เมื่อเลือก Dealer/Sub/Farmer อย่างน้อย 1 รายการ
  const showSelectTargetTable = selectedTargetIds.length > 0;

  // ====== Table: Select Target (REAL API) ======
  const [targetRows, setTargetRows] = useState([]);
  const [targetLoading, setTargetLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // customer_id ที่เลือก

  // สร้าง key เสถียรจาก checkbox ทั้งสามกลุ่ม
  const targetKey = useMemo(() => {
    const ids = [...watchDealer, ...watchSub, ...watchFarmer]
      .map(Number)
      .filter(Boolean)
      .sort((a, b) => a - b);
    return ids.join(","); // "" = ไม่ได้เลือกอะไร
  }, [watchDealer, watchSub, watchFarmer]);

  const lastFetchKeyRef = useRef(""); // กันยิงซ้ำ/กัน StrictMode

  useEffect(() => {
    // ไม่มี target -> เคลียร์ตารางและ state
    if (!targetKey) {
      setTargetRows([]);
      setSelectedRowKeys([]);
      lastFetchKeyRef.current = "";
      return;
    }

    // key เดิม -> ไม่ต้องยิงซ้ำ
    if (lastFetchKeyRef.current === targetKey) return;
    lastFetchKeyRef.current = targetKey;

    let cancelled = false; // กัน setState หลัง unmount
    (async () => {
      setTargetLoading(true);
      try {
        const ids = targetKey.split(",").map(Number);
        const res = await useServiceAPI.post(paths.pathPointCampaignCustomer, {
          target_id: ids, // ✅ ส่งเป็น body JSON
        });
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

    return () => {
      cancelled = true;
    };
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

  const selectTargetRowSel = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys), // keys = customer_id[]
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
  const handleExtraChange = (key, field, value) =>
    setExtraRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  const handleRemoveExtra = (key) =>
    setExtraRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)));

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
  const handleTopupChange = (key, field, value) =>
    setTopupRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  const handleRemoveTopup = (key) =>
    setTopupRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)));

  // ====== Save ======
  // const onSave = async () => {
  //   try {
  //     setLoading(true);
  //     const values = await form.validateFields();
  //     const [start, end] = values.period || [];
  //     const payload = {
  //       campaign_name: values.campaign_name?.trim(),
  //       target_group: {
  //         dealer: values.target_dealer || [], // target_id[] (string)
  //         sub_dealer: values.target_subdealer || [],
  //         farmer: values.target_farmer || [],
  //         crop: values.target_crop || [], // crop id[]
  //       },
  //       product_scope: {
  //         mode: values.product_mode, // all | category | specific
  //         selected_categories: selectedCategoryKeys, // string ids
  //         selected_products: selectedProductKeys, // product ids
  //       },
  //       campaign_type: {
  //         mode: values.campaign_mode, // extra | topup | xpoint
  //         value: values.campaign_mode === "xpoint" ? Number(values.campaign_value || 0) : null,
  //         // ✅ extra_items ใช้ field 'point' แล้ว
  //         extra_items: values.campaign_mode === "extra" ? extraRows : [],
  //         topup_items: values.campaign_mode === "topup" ? topupRows : [],
  //       },
  //       period: {
  //         start_date: start ? dayjs(start).format("YYYY-MM-DD") : null,
  //         end_date: end ? dayjs(end).format("YYYY-MM-DD") : null,
  //       },
  //       status: Number(values.status ?? 1),
  //       selected_targets: selectedRowKeys, // ✅ customer_id[] จากตาราง
  //     };

  //     console.log("Payload:", payload);
  //     showNotification("success", "Created", "Point campaign has been created.");
  //     navigate(-1);
  //   } catch (_) {
  //     // antd จัดการ highlight ให้เอง
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // ===== helpers (วางเหนือ onSave) =====
  const PRODUCT_MODE_MAP = { all: 1, category: 2, specific: 3 };
  const TYPE_MODE_MAP = { extra: 1, topup: 2, xpoint: 3 };

  function deriveCustomerType(dealerArr = [], subArr = [], farmerArr = []) {
    const picked = [
      dealerArr?.length ? "dealer" : null,
      subArr?.length ? "sub" : null,
      farmerArr?.length ? "farmer" : null,
    ].filter(Boolean);
    if (picked.length !== 1) return 0; // เลือกหลายกลุ่ม/ไม่เลือก -> 0
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


  // ====== Save (วางแทนของเดิม) ======
  const onSave = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();
      const [start, end] = values.period || [];

      // map radio -> ตัวเลขตามสเปค
      const productModeNum = PRODUCT_MODE_MAP[values.product_mode]; // 1/2/3
      const typeNum = TYPE_MODE_MAP[values.campaign_mode];          // 1/2/3

      // category ids (ใช้ key ที่เราเซ็ตเป็น record_id)
      const categoryIds = (selectedCategoryKeys || [])
        .map((k) => Number(k))
        .filter((n) => Number.isFinite(n));

      // product ids
      const productIds = (selectedProductKeys || [])
        .map((k) => Number(k))
        .filter((n) => Number.isFinite(n));

      // targets = target group ids จาก checkbox (dealer/sub/farmer)
      const targets = selectedTargetIds; // มีอยู่แล้วเป็น number[]

      // crops
      const crops = (values.target_crop || [])
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n));

      // customer_type: เดาแบบ single-group เท่านั้น
      const customer_type = deriveCustomerType(
        values.target_dealer,
        values.target_subdealer,
        values.target_farmer
      );

      // base payload
      const payload = {
        name: (values.campaign_name || "").trim(),
        product: productModeNum, // 1:all, 2:category, 3:specific
        type: typeNum,           // 1:extra, 2:topup, 3:xpoint
        use_flag: Number(values.status ?? 1),
        customer_type,
        targets,                 // target group ids
        crops,                   // crop ids
        // date range with time boundary
        date_start: start ? dayjs(start).startOf("day").format("YYYY-MM-DD HH:mm:ss") : null,
        date_end: end ? dayjs(end).endOf("day").format("YYYY-MM-DD HH:mm:ss") : null,
      };

      // ใส่ products/categorys ตาม product mode
      if (productModeNum === 2) {
        // category
        payload.categorys = categoryIds;
      } else if (productModeNum === 3) {
        // specific products
        payload.products = productIds;
      }
      // mode=all ไม่ต้องส่งอะไรเพิ่ม

      // ใส่แค่ฟิลด์ของ type ที่เลือก
      if (typeNum === 3) {
        // x-point
        payload.xpoint = Number(values.campaign_value || 0);
        if (!payload.xpoint) {
          showNotification?.("error", "กรุณากรอก X Point ให้ถูกต้อง");
          setLoading(false);
          return;
        }
      } else if (typeNum === 1) {
        // extra point
        const extra = firstValidExtraRow(extraRows);
        if (!extra) {
          showNotification?.("error", "กรุณากรอก Extra Point อย่างน้อย 1 แถวให้ครบ");
          setLoading(false);
          return;
        }
        payload.extra_point = extra;
      } else if (typeNum === 2) {
        // topup point
        const topup = firstValidTopupRow(topupRows);
        if (!topup) {
          showNotification?.("error", "กรุณากรอก Topup Point อย่างน้อย 1 แถวให้ครบ");
          setLoading(false);
          return;
        }
        payload.topup_point = topup;
      }

      // (ตัวอย่าง) เรียก API จริง
      // ปรับ path ตามของจริง เช่น paths.pathPointCampaignCreate
      const res = await useServiceAPI.post(paths.pathPointCampaignCreate, payload);

      const ok = res?.result === true && Number(res?.status) === 200;
      if (ok) {
        const id = res?.data?.id;
        showNotification?.("success", "เพิ่มข้อมูล Point Campaign เรียบร้อยแล้ว", `ID: ${id ?? "-"}`);
        navigate(-1);
      } else {
        showNotification?.(
          "error",
          "บันทึกไม่สำเร็จ",
          res?.data?.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ"
        );
      }
    } catch (e) {
      // antd จะ highlight field ที่ไม่ครบให้เอง
      if (e?.response?.data?.message) {
        showNotification?.("error", "บันทึกไม่สำเร็จ", e.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };


  const statusOptions = [
    { label: "Active", value: 1 },
    { label: "Inactive", value: 0 },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Point Campaign</div>

      <BoxPrimary>
        <Form
          layout="vertical"
          form={form}
          initialValues={{ status: 1, product_mode: "all" /* campaign_mode: ให้เลือกเอง */ }}
        >
          {/* Campaign Name */}
          <Form.Item
            label="Campaign Name"
            name="campaign_name"
            rules={[{ required: true, message: "Please input campaign name" }]}
          >
            <Input placeholder="Campaign 1" />
          </Form.Item>

          {/* Target Group (จาก API) */}
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

          {/* Product */}
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

            {/* Campaign */}
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

              {/* X Point input */}
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
            rowSelection={{
              selectedRowKeys: selectedCategoryKeys, // ใช้ id string เป็น key
              onChange: (keys) => setSelectedCategoryKeys(keys),
            }}
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
              />
              <div style={{ width: 280 }}>
                <Search placeholder="Search" allowClear onChange={(e) => setProductSearch(e.target.value)} />
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
            rowSelection={{
              selectedRowKeys: selectedProductKeys, // id (number) ของสินค้า
              onChange: (keys) => setSelectedProductKeys(keys),
            }}
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
              <Button
                className="bg-[#00783f] text-white"
                type="button"
                icon={<PlusOutlined />}
                onClick={handleAddExtra}
              >
                Add Item
              </Button>
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
                render: (_, record) => (
                  <DeleteOutlined
                    onClick={() =>
                      setExtraRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== record.key)))
                    }
                    style={{
                      color: extraRows.length <= 1 ? "#ccc" : "#ff4d4f",
                      cursor: extraRows.length <= 1 ? "not-allowed" : "pointer",
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
              <Button
                className="bg-[#00783f] text-white"
                type="button"
                icon={<PlusOutlined />}
                onClick={() =>
                  setTopupRows((prev) => [
                    ...prev,
                    {
                      key: (prev[prev.length - 1]?.key || 0) + 1,
                      name: "",
                      description: "",
                      point: undefined,
                      value_thb: undefined,
                    },
                  ])
                }
              >
                Add Item
              </Button>
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
                render: (_, record) => (
                  <DeleteOutlined
                    onClick={() =>
                      setTopupRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== record.key)))
                    }
                    style={{
                      color: topupRows.length <= 1 ? "#ccc" : "#ff4d4f",
                      cursor: topupRows.length <= 1 ? "not-allowed" : "pointer",
                    }}
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
        <ActionButton text="Save" mode="save" onClick={onSave} />
      </div>
    </MainLayout>
  );
}
