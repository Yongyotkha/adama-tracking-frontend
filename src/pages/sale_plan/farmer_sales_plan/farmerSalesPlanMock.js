export const FARMER_PLAN_YEARS = [2024, 2025, 2026, 2027];

export const FARMER_PLAN_CROPS = [
  { id: 1, name: "Rice" },
  { id: 2, name: "Corn" },
  { id: 3, name: "Sugarcane" },
  { id: 4, name: "Cassava" },
];

export const FARMER_PLAN_PRODUCTS = [
  { id: 1, sku: "3021Q00113", name: "Barleye P", unit: "0.5 KG/20", price: 8500, pointPerUnit: 1 },
  { id: 2, sku: "3071Y0001-120", name: "Memory 500EC", unit: "1L x20", price: 6800, pointPerUnit: 2 },
  { id: 3, sku: "3011A00021", name: "Agil 100EC", unit: "1L x12", price: 1250, pointPerUnit: 1 },
  { id: 4, sku: "3055B00088", name: "Galigan 240EC", unit: "1L x12", price: 980, pointPerUnit: 1 },
];

const row = (id, dealerId, dealer, subDealerId, subDealer, farmerId, farmer, status) => ({
  id,
  year: 2026,
  dealerId,
  dealer,
  subDealerId,
  subDealer,
  farmerId,
  farmer,
  targetValue: 100000,
  targetPoint: 100,
  status,
});

export const FARMER_PLAN_ROWS = [
  row(1, 1, "Chonburi Klongluang Co.,Ltd.", 11, "ร้านค้าตัวอย่าง", 101, "คุณ สมชาย", ""),
  row(2, 2, "Sahakit Chemi Kaset Co.,Ltd.", 21, "ร้านสมชายเกษตร", 201, "คุณ ประสิทธิ์", "Completed"),
  row(3, 1, "Chonburi Klongluang Co.,Ltd.", 12, "ร้านเจริญเกษตร", 102, "คุณ วิชัย", ""),
  row(4, 1, "Chonburi Klongluang Co.,Ltd.", 11, "ร้านค้าตัวอย่าง", 103, "คุณ มานะ", "Completed"),
  row(5, 2, "Sahakit Chemi Kaset Co.,Ltd.", 22, "ร้านเขียวขจี", 202, "คุณ สมศรี", ""),
  row(6, 3, "Pa Mok Chemi Kaset Ltd. Part.", 31, "ร้านป่าโมก", 301, "คุณ สุชาติ", "Completed"),
  row(7, 3, "Pa Mok Chemi Kaset Ltd. Part.", 32, "ร้านอ่างทอง", 302, "คุณ นิรันดร์", ""),
  row(8, 2, "Sahakit Chemi Kaset Co.,Ltd.", 21, "ร้านสมชายเกษตร", 203, "คุณ อนันต์", ""),
  row(9, 1, "Chonburi Klongluang Co.,Ltd.", 13, "ร้านนาดี", 104, "คุณ ประภา", "Completed"),
  row(10, 3, "Pa Mok Chemi Kaset Ltd. Part.", 31, "ร้านป่าโมก", 303, "คุณ ชัยวัฒน์", ""),
  row(11, 2, "Sahakit Chemi Kaset Co.,Ltd.", 23, "ร้านทุ่งนา", 204, "คุณ ศิริ", ""),
  row(12, 1, "Chonburi Klongluang Co.,Ltd.", 12, "ร้านเจริญเกษตร", 105, "คุณ บุญมี", "Completed"),
  row(13, 3, "Pa Mok Chemi Kaset Ltd. Part.", 33, "ร้านรวงข้าว", 304, "คุณ อรุณ", ""),
  row(14, 2, "Sahakit Chemi Kaset Co.,Ltd.", 22, "ร้านเขียวขจี", 205, "คุณ ทองดี", "Completed"),
];

export const money = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const defaultPlanLines = () =>
  FARMER_PLAN_PRODUCTS.slice(0, 2).map((product) => ({
    ...product,
    key: product.id,
    qty: 10,
  }));

export const uniqueOptions = (rows, idKey, nameKey) => {
  const seen = new Set();
  const options = [];
  rows.forEach((item) => {
    const id = item[idKey];
    if (id == null || seen.has(id)) return;
    seen.add(id);
    options.push({ id, name: item[nameKey] });
  });
  return options;
};
