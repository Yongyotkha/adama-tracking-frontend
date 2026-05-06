export const draftCampaignSalesOptions = [
  { id: "sale-1", name: "Amorn Sriworakul" },
  { id: "sale-2", name: "Piyanuch K." },
  { id: "sale-3", name: "Thanawat S." },
];

export const draftCampaignStatusOptions = [
  { id: "draft", name: "Draft" },
  { id: "pending", name: "Pending" },
  { id: "active", name: "Active" },
];

export const draftCampaignCategoryOptions = [
  { id: "crop-protection", name: "Crop Protection" },
  { id: "dealer-growth", name: "Dealer Growth" },
  { id: "seasonal-push", name: "Seasonal Push" },
];

export const draftCampaignFarmerOptions = [
  { id: "farmer-1", name: "นายกหน่อย" },
  { id: "farmer-2", name: "นายสมชาย" },
  { id: "farmer-3", name: "นางสาวสายฝน" },
];

export const draftCampaignProductOptions = [
  {
    id: "3027200113",
    sku: "3027200113",
    productName: "Bumper P",
    unit: "0.5 ltX20",
    thbPerUnit: 12380,
    pointPerCtn: 20,
  },
  {
    id: "207920011520",
    sku: "207920011520",
    productName: "Memory 300EC",
    unit: "1lt X20",
    thbPerUnit: 6960,
    pointPerCtn: 10,
  },
  {
    id: "3077100220",
    sku: "3077100220",
    productName: "Adama Gold",
    unit: "250 mlX24",
    thbPerUnit: 4860,
    pointPerCtn: 8,
  },
];

const calculateLine = (product, qty, xPoint) => ({
  id: `${product.id}-${qty}-${xPoint}`,
  sku: product.sku,
  productName: product.productName,
  unit: product.unit,
  thbPerUnit: product.thbPerUnit,
  pointPerCtn: product.pointPerCtn,
  qty,
  xPoint,
  point: qty * xPoint * product.pointPerCtn,
  subTotal: qty * product.thbPerUnit,
});

export const createDraftCampaignTemplate = () => ({
  rewardCode: "DC-2025-001",
  rewardName: "North Rice Booster",
  category: draftCampaignCategoryOptions[0]?.id,
  sale: draftCampaignSalesOptions[0]?.id,
  dealer: "Somporn Panich Chemi Kaset Ltd.part.",
  subDealer: "sub-1",
  farmer: draftCampaignFarmerOptions[0]?.id,
  draftDate: "2025-05-27",
  currentPoint: 60,
  targetPoint: 1500,
  diffFromTarget: 1440,
  productSelection: undefined,
  createdBy: "Admin",
  status: "draft",
  products: [
    calculateLine(draftCampaignProductOptions[0], 10, 5),
    calculateLine(draftCampaignProductOptions[1], 10, 5),
  ],
});

export const draftCampaignList = [
  {
    id: "dc-001",
    code: "DC-2025-001",
    name: "North Rice Booster",
    ...createDraftCampaignTemplate(),
  },
  {
    id: "dc-002",
    code: "DC-2025-002",
    name: "Dealer Growth Push",
    rewardCode: "DC-2025-002",
    rewardName: "Dealer Growth Push",
    category: draftCampaignCategoryOptions[1]?.id,
    sale: draftCampaignSalesOptions[1]?.id,
    dealer: "รุ่งเรืองเกษตร",
    subDealer: "sub-2",
    farmer: draftCampaignFarmerOptions[1]?.id,
    draftDate: "2025-06-05",
    currentPoint: 180,
    targetPoint: 2200,
    diffFromTarget: 2020,
    productSelection: undefined,
    createdBy: "Marketing",
    status: "pending",
    products: [
      calculateLine(draftCampaignProductOptions[1], 12, 4),
      calculateLine(draftCampaignProductOptions[2], 8, 3),
    ],
  },
];

export const draftCampaignDealerOptions = [
  { id: "dealer-1", name: "Somporn Panich Chemi Kaset Ltd.part." },
  { id: "dealer-2", name: "รุ่งเรืองเกษตร" },
  { id: "dealer-3", name: "ชัยมงคลพืชผล" },
];

export const draftCampaignSubDealerOptions = [
  { id: "sub-1", name: "นายกหน่อย" },
  { id: "sub-2", name: "คุณวิชิต" },
  { id: "sub-3", name: "คุณรุ่งอรุณ" },
];
