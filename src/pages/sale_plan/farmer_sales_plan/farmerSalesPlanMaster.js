import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export const asList = (body) => {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.data?.data)) return body.data.data;
  return [];
};

export const text = (value) => String(value ?? "").trim();

export const num = (value) => Number(String(value ?? 0).replace(/,/g, "")) || 0;

export const money = (value) =>
  num(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const pointText = (value) => num(value).toLocaleString("en-US");

export const apiError = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.data?.message ||
  error?.message ||
  fallback;

export const isSuccess = (response) =>
  response?.status === 200 || response?.status === 201 || response?.success === true;

export const STATUS_OPTIONS = [
  { code: "create_plan", name: "Create Plan" },
  { code: "FSPD", name: "Draft" },
  { code: "FSPC", name: "Completed" },
];

const safeGet = (path, params) => useServiceAPI.get(path, params).catch(() => null);

export async function loadFarmerPlanMasters({ includeCrops = false } = {}) {
  const [yearRes, dealerRes, subRes, cropRes] = await Promise.all([
    safeGet(paths.pathMasterYear, {}),
    safeGet(paths.pathMasterDealerAll, {}),
    safeGet(paths.pathMasterSubDealerAll, {}),
    includeCrops ? safeGet(paths.pathMasterCrop, {}) : Promise.resolve(null),
  ]);

  const years = asList(yearRes?.data ?? yearRes)
    .map((item) => {
      const value = item.name ?? item.id;
      return { value: num(value) || value, label: `Year ${text(value)}` };
    })
    .filter((item) => item.value != null && item.label !== "Year ");

  const dealers = asList(dealerRes?.data ?? dealerRes)
    .map((item) => ({ id: item.id ?? item.dealer_id, name: text(item.name ?? item.dealer_name) }))
    .filter((item) => item.id != null && item.name);

  const subDealers = asList(subRes?.data ?? subRes)
    .map((item) => ({
      id: item.sub_dealer_id ?? item.id,
      name: text(item.sub_dealer_name ?? item.name),
      dealerId: item.dealer_id ?? null,
    }))
    .filter((item) => item.id != null && item.name);

  const crops = asList(cropRes?.data ?? cropRes)
    .map((item) => ({ id: item.id ?? item.crop_id, name: text(item.name ?? item.crop_name) }))
    .filter((item) => item.id != null && item.name);

  return { years, dealers, subDealers, crops };
}

export async function searchPlanProducts(keyword) {
  const response = await useServiceAPI.get(paths.pathMasterProducts, { keyword });
  return asList(response?.data ?? response)
    .map((item) => ({ value: item.id, label: text(item.name || item.product_name) }))
    .filter((item) => item.value != null && item.label);
}

// Price/point here are only a preview; the backend recalculates on save.
export async function loadPlanProduct(productId) {
  const response = await useServiceAPI.get(paths.pathMasterProductDetail, { product_id: productId });
  const data = response?.data && !Array.isArray(response.data) ? response.data : response?.data?.data;
  if (!data) throw new Error("โหลดสินค้าไม่สำเร็จ");
  return {
    id: data.id ?? productId,
    sku: text(data.product_code) || "-",
    name: text(data.product_name || data.name) || "-",
    unit: text(data.packing_list) || "-",
    price: num(data.bath_unit ?? data.unit_convert_order_value),
    pointPerUnit: num(data.point_farmer ?? data.point),
    qty: 1,
  };
}

// Normalise one product line from /farmer-sales-plan/detail.
export const mapDetailLine = (item) => {
  const qty = num(item.quantity ?? item.qty) || 1;
  const price = num(item.unit_price ?? item.price ?? item.bath_unit);
  const amount = item.amount ?? item.total_amount ?? item.sub_total;
  const point = item.point ?? item.total_point;
  return {
    id: item.product_id ?? item.id,
    sku: text(item.product_code ?? item.sku) || "-",
    name: text(item.product_name ?? item.name) || "-",
    unit: text(item.unit ?? item.packing_list) || "-",
    price,
    pointPerUnit: point != null ? num(point) / qty : num(item.point_per_unit),
    qty,
    backendAmount: amount != null ? num(amount) : null,
    backendPoint: point != null ? num(point) : null,
  };
};
