import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

const asList = (body) => {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.data?.data)) return body.data.data;
  return [];
};

const text = (value) => String(value ?? "").trim();

const safeGet = (path, params) => useServiceAPI.get(path, params).catch(() => null);

export const ensureOption = (options, id, name) => {
  if (id == null || id === "") return options;
  if (options.some((item) => String(item.id) === String(id))) return options;
  const label = text(name);
  if (!label) return options;
  return [{ id, name: label }, ...options];
};

export async function loadFarmerPlanMasters({ includeCrops = false } = {}) {
  const [yearRes, dealerRes, subRes, farmerRes, cropRes] = await Promise.all([
    safeGet(paths.pathMasterYear, {}),
    safeGet(paths.pathMasterDealerAll, {}),
    safeGet(paths.pathMasterSubDealerAll, {}),
    safeGet(paths.pathMasterFarmer, {}),
    includeCrops ? safeGet(paths.pathMasterCrop, {}) : Promise.resolve(null),
  ]);

  const years = asList(yearRes?.data ?? yearRes)
    .map((item) => ({
      value: item.id ?? item.name,
      label: `Year ${text(item.name || item.id)}`,
    }))
    .filter((item) => item.value != null && item.label !== "Year ");

  const dealers = asList(dealerRes?.data ?? dealerRes)
    .map((item) => ({
      id: item.id ?? item.dealer_id,
      name: text(item.name ?? item.dealer_name),
    }))
    .filter((item) => item.id != null && item.name);

  const subDealers = asList(subRes?.data ?? subRes)
    .map((item) => ({
      id: item.sub_dealer_id ?? item.id,
      name: text(item.sub_dealer_name ?? item.name),
      dealerId: item.dealer_id ?? null,
    }))
    .filter((item) => item.id != null && item.name);

  const farmers = asList(farmerRes?.data ?? farmerRes)
    .map((item) => ({
      id: item.farmer_id ?? item.id,
      name: text(item.farmer_name || item.farmer_contact_name || item.name),
      dealerId: item.dealer_id ?? null,
      subDealerId: item.sub_dealer_id ?? null,
    }))
    .filter((item) => item.id != null && item.name);

  const crops = asList(cropRes?.data ?? cropRes)
    .map((item) => ({
      id: item.id ?? item.crop_id,
      name: text(item.name ?? item.crop_name),
    }))
    .filter((item) => item.id != null && item.name);

  return { years, dealers, subDealers, farmers, crops };
}

export async function searchPlanProducts(keyword) {
  const response = await useServiceAPI.get(paths.pathMasterProducts, { keyword });
  return asList(response?.data ?? response)
    .map((item) => ({
      value: item.id,
      label: text(item.name || item.product_name),
    }))
    .filter((item) => item.value != null && item.label);
}

export async function loadPlanProduct(productId) {
  const response = await useServiceAPI.get(paths.pathMasterProductDetail, { product_id: productId });
  const data = response?.data && !Array.isArray(response.data) ? response.data : response?.data?.data;
  if (!data) throw new Error("โหลดสินค้าไม่สำเร็จ");

  const price = Number(String(data.bath_unit ?? data.unit_convert_order_value ?? 0).replace(/,/g, "")) || 0;
  const pointPerUnit = Number(String(data.point_farmer ?? data.point ?? 0).replace(/,/g, "")) || 0;

  return {
    id: data.id ?? productId,
    key: data.id ?? productId,
    sku: text(data.product_code) || "-",
    name: text(data.product_name || data.name) || "-",
    unit: text(data.packing_list) || "-",
    price,
    pointPerUnit,
    qty: 1,
  };
}
