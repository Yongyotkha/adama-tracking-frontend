import React, { useContext, useMemo, useState } from "react";
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
} from "antd";
import dayjs from "dayjs";
import { AuthContext } from "../../../../contexts/AuthContext";
import TableComponent from "../../../../components/table/TableComponent";

const { RangePicker } = DatePicker;
const { Search } = Input;

export default function CreatePointCampaign() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { showNotification } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  // ---- Options ----
  const dealerOptions = [
    { label: "Star", value: "dealer_star" },
    { label: "Non Star", value: "dealer_non_star" },
  ];
  const subDealerOptions = [
    { label: "Push", value: "sub_push" },
    { label: "Pull", value: "sub_pull" },
    { label: "หน้าร้าน", value: "sub_shopfront" },
  ];
  const farmerOptions = [
    { label: "KOL", value: "farmer_kol" },
    { label: "Big Farmer", value: "farmer_big" },
    { label: "General", value: "farmer_general" },
  ];
  const cropOptions = [
    { label: "Rice", value: "crop_rice" },
    { label: "Fruits", value: "crop_fruits" },
    { label: "Sugarcane", value: "crop_sugarcane" },
    { label: "Vegetable", value: "crop_veg" },
    { label: "Corn", value: "crop_corn" },
    { label: "Pineapple", value: "crop_pineapple" },
    { label: "Other", value: "crop_other" },
  ];
  const statusOptions = [
    { label: "Active", value: 1 },
    { label: "Inactive", value: 0 },
  ];

  // ====== เงื่อนไขโชว์ input ======
  const productMode = Form.useWatch("product_mode", form);
  const campaignMode = Form.useWatch("campaign_mode", form);

  // ====== Watch Target Group selections ======
  const watchDealer = Form.useWatch("target_dealer", form) || [];
  const watchSub = Form.useWatch("target_subdealer", form) || [];
  const watchFarmer = Form.useWatch("target_farmer", form) || [];
  const watchCrop = Form.useWatch("target_crop", form) || [];

  const hasAnyTargetSelected =
    watchDealer.length || watchSub.length || watchFarmer.length || watchCrop.length;

  // ====== Mock Target (ตัวอย่าง) ======
  const ALL_TARGETS = useMemo(
    () => [
      { key: 1, name: "Pa Mok Chemi Kaset Ltd. Part.", target_group: "Dealer", type: "Star", address: "อ่างทอง", tags: ["dealer_star"] },
      { key: 2, name: "Sup Ruam Chai Co.,Ltd.", target_group: "Dealer", type: "Star", address: "บุรีรัมย์", tags: ["dealer_star"] },
      { key: 3, name: "Tawat Karn Kaset Hunka Ltd. Part.", target_group: "Dealer", type: "Non Star", address: "ชัยนาท", tags: ["dealer_non_star"] },
      { key: 4, name: "Chantaburi Klangkaset Co.,Ltd.", target_group: "Sub Dealer", type: "Push", address: "จันทบุรี", tags: ["sub_push"] },
      { key: 5, name: "Charoen Suk", target_group: "Sub Dealer", type: "Pull", address: "จันทบุรี", tags: ["sub_pull"] },
      { key: 6, name: "Siam Agri KOL", target_group: "Farmer", type: "KOL", address: "—", tags: ["farmer_kol"] },
      { key: 7, name: "Prasert Big Farm", target_group: "Farmer", type: "Big Farmer", address: "—", tags: ["farmer_big"] },
      { key: 8, name: "Somchai General Farm", target_group: "Farmer", type: "General", address: "—", tags: ["farmer_general"] },
      { key: 9, name: "Kaset Pineapple Group", target_group: "Crop", type: "Pineapple", address: "—", tags: ["crop_pineapple"] },
      { key: 10, name: "Kaset Rice Group", target_group: "Crop", type: "Rice", address: "—", tags: ["crop_rice"] },
    ],
    []
  );

  // ====== Table: Select Target ======
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const selectedCodes = useMemo(
    () => new Set([...watchDealer, ...watchSub, ...watchFarmer, ...watchCrop]),
    [watchDealer, watchSub, watchFarmer, watchCrop]
  );

  const tableData = useMemo(() => {
    if (!hasAnyTargetSelected) return [];
    const base = ALL_TARGETS.filter((row) => row.tags.some((t) => selectedCodes.has(t)));
    if (!searchKeyword) return base;
    const q = searchKeyword.toLowerCase();
    return base.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.target_group.toLowerCase().includes(q)
    );
  }, [ALL_TARGETS, hasAnyTargetSelected, selectedCodes, searchKeyword]);

  const columns = [
    { title: "No", render: (_, __, index) => index + 1, width: 70 },
    { title: "Name", dataIndex: "name" },
    { title: "Target Group", dataIndex: "target_group", width: 140 },
    { title: "Type", dataIndex: "type", width: 140 },
    { title: "Address", dataIndex: "address" },
  ];
  const rowSelection = { selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) };

  // ====== Table: Select Category ======
  const CATEGORY_LIST = useMemo(
    () => [
      { key: 1, name: "Herbicide" },
      { key: 2, name: "Fungicide" },
      { key: 3, name: "Insecticide" },
      { key: 4, name: "Other" },
      // ... เพิ่มได้
    ],
    []
  );
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategoryKeys, setSelectedCategoryKeys] = useState([]);
  const categoryColumns = [
    { title: "No", render: (_, __, index) => index + 1, width: 70 },
    { title: "Category", dataIndex: "name" },
  ];
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return CATEGORY_LIST;
    const q = categorySearch.toLowerCase();
    return CATEGORY_LIST.filter((c) => c.name.toLowerCase().includes(q));
  }, [CATEGORY_LIST, categorySearch]);
  const categoryRowSelection = {
    selectedRowKeys: selectedCategoryKeys,
    onChange: (keys) => setSelectedCategoryKeys(keys),
  };

  // ====== Table: Select Product ======
  const PRODUCT_LIST = useMemo(
    () => [
      { key: 1, sku: "303710131300", name: "Apopo", packsize: "0.5 Lt x 20", category: "Fungicide" },
      { key: 2, sku: "308220061100", name: "Bla-S", packsize: "0.1 Kg x 10 x 6", category: "Fungicide" },
      { key: 3, sku: "3027200113", name: "Bumper P 490 EC", packsize: "0.50 Lt x 20", category: "Fungicide" },
      { key: 4, sku: "2025200112", name: "Fiesta 100 EC", packsize: "0.25 Lt x 24", category: "Herbicide" },
      { key: 5, sku: "201920071520", name: "Hexaron 60 WG", packsize: "1 Kg x 20", category: "Herbicide" },
      { key: 6, sku: "201520071520", name: "Karmex Gold 80 WG", packsize: "1 Kg x 20", category: "Herbicide" },
      { key: 7, sku: "102020032301", name: "Kohinor X 350 SC", packsize: "200 Lt", category: "Insecticide" },
      { key: 8, sku: "103110021300", name: "Kestrel", packsize: "0.5 Lt x 20", category: "Insecticide" },
      { key: 9, sku: "103120021512", name: "Kestrel", packsize: "1 Lt x 12", category: "Insecticide" },
      { key: 10, sku: "405420021300", name: "X-Grow", packsize: "0.5 Lt x 40", category: "Other" },
      // ... เพิ่มได้
    ],
    []
  );
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState(undefined);
  const [selectedProductKeys, setSelectedProductKeys] = useState([]);
  const productColumns = [
    { title: "No", render: (_, __, index) => index + 1, width: 70 },
    { title: "SKU", dataIndex: "sku", width: 160 },
    { title: "Product Name", dataIndex: "name" },
    { title: "Packsize", dataIndex: "packsize", width: 160 },
    { title: "Category", dataIndex: "category", width: 160 },
  ];
  const productRowSelection = {
    selectedRowKeys: selectedProductKeys,
    onChange: (keys) => setSelectedProductKeys(keys),
  };
  const categoryOptionsForFilter = useMemo(() => {
    const set = new Set(PRODUCT_LIST.map((p) => p.category));
    return Array.from(set).map((c) => ({ label: c, value: c }));
  }, [PRODUCT_LIST]);
  const filteredProducts = useMemo(() => {
    let list = PRODUCT_LIST;
    if (productCategoryFilter) list = list.filter((p) => p.category === productCategoryFilter);
    if (!productSearch) return list;
    const q = productSearch.toLowerCase();
    return list.filter(
      (p) =>
        p.sku.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [PRODUCT_LIST, productCategoryFilter, productSearch]);

  // ====== Save ======
  const onSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const [start, end] = values.period || [];
      const payload = {
        campaign_name: values.campaign_name?.trim(),
        target_group: {
          dealer: values.target_dealer || [],
          sub_dealer: values.target_subdealer || [],
          farmer: values.target_farmer || [],
          crop: values.target_crop || [],
        },
        product_scope: {
          mode: values.product_mode, // all | category | specific
          selected_categories: selectedCategoryKeys, // ✅ ids ที่เลือกจากตาราง category
          selected_products: selectedProductKeys,   // ✅ ids ที่เลือกจากตาราง product
        },
        campaign_type: {
          mode: values.campaign_mode, // extra | topup | xpoint
          value: Number(values.campaign_value || 0),
        },
        period: {
          start_date: start ? dayjs(start).format("YYYY-MM-DD") : null,
          end_date: end ? dayjs(end).format("YYYY-MM-DD") : null,
        },
        status: Number(values.status),
        selected_targets: selectedRowKeys, // จากตาราง Select Target
      };

      console.log("Payload:", payload);
      showNotification("success", "Created", "Point campaign has been created.");
      navigate(-1);
    } catch (_) {
      // antd จะ highlight fields ที่ขาดให้เอง
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Create Point Campaign</div>

      {/* ---------- ฟอร์มส่วนบน ---------- */}
      <BoxPrimary>
        <Form
          layout="vertical"
          form={form}
          initialValues={{ status: 1, product_mode: "all", campaign_mode: "extra" }}
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

              <Form.Item name="campaign_value" rules={[{ required: true, message: "Please enter a number" }]}>
                <InputNumber
                  style={{ width: 160 }}
                  placeholder={campaignMode === "xpoint" ? "Enter X (e.g. 2)" : "Enter point"}
                  min={0}
                />
              </Form.Item>
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

      {/* ---------- Select Target (โชว์เมื่อเลือก Target Group) ---------- */}
      {hasAnyTargetSelected ? (
        <BoxPrimary>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[#00783F] text-lg font-semibold">Select Target</div>
            <div style={{ width: 280 }}>
              <Search placeholder="Search" allowClear onChange={(e) => setSearchKeyword(e.target.value)} />
            </div>
          </div>

          <TableComponent
            header={columns}
            dataSource={tableData}
            loading={false}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll
            rowSelection={rowSelection}
          />
        </BoxPrimary>
      ) : null}

      {/* ---------- Product Mode: Category ---------- */}
      {productMode === "category" && (
        <BoxPrimary>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[#00783F] text-lg font-semibold">Select Category</div>
            <div style={{ width: 280 }}>
              <Search placeholder="Search" allowClear onChange={(e) => setCategorySearch(e.target.value)} />
            </div>
          </div>

          <TableComponent
            header={categoryColumns}
            dataSource={filteredCategories}
            loading={false}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll
            rowSelection={categoryRowSelection}
          />
        </BoxPrimary>
      )}

      {/* ---------- Product Mode: Specific (Product) ---------- */}
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
                onChange={setProductCategoryFilter}
              />
              <div style={{ width: 280 }}>
                <Search placeholder="Search" allowClear onChange={(e) => setProductSearch(e.target.value)} />
              </div>
            </div>
          </div>

          <TableComponent
            header={productColumns}
            dataSource={filteredProducts}
            loading={false}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll
            rowSelection={productRowSelection}
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
