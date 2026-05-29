import dayjs from "dayjs";

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

export const toNumber = (value) => {
  const normalized = String(value ?? "")
    .replace(/,/g, "")
    .trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatNumber = (value, digits = 0) =>
  toNumber(value).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const formatDate = (value, pattern = "DD/MM/YYYY") => {
  if (!value) return "-";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(pattern) : String(value);
};

export const getListPayload = (response) => response?.data?.data || {};

export const getDetailPayload = (response) => response?.data || {};

export const normalizeOption = (item, config = {}) => {
  const rawValue =
    item?.[config.valueKey || "id"] ??
    item?.id ??
    item?.user_id ??
    item?.dealer_id ??
    item?.sub_dealer_id ??
    item?.farmer_id ??
    item?.target_id ??
    item?.customer_id ??
    item?.code;

  const value = String(rawValue ?? "");
  const label = firstNonEmpty(
    item?.[config.labelKey || "name"],
    item?.name,
    item?.name_en,
    item?.dealer_name,
    item?.sub_dealer_name,
    item?.farmer_name,
    item?.farm_name,
    item?.farmer_contact_name,
    item?.title,
    item?.product_name,
    item?.target,
    item?.customer_name,
    item?.product_code,
    value
  );

  return {
    id: value,
    name: label || "-",
    raw: item,
  };
};

export const mapProductSearchOption = (item) => ({
  value: String(item?.id ?? item?.product_id ?? ""),
  label: `${item?.product_code || item?.code || ""} ${item?.name || item?.product_name || ""}`.trim(),
});

export const calculateDraftPoint = (row) => {
  if (row?.draft_point !== undefined && row?.draft_point !== null && row?.draft_point !== "") {
    return toNumber(row.draft_point);
  }
  return toNumber(row.quantity) * toNumber(row.xpoint) * toNumber(row.master_point);
};

export const calculateNetAmount = (row) => {
  const unitTotal = toNumber(row.unit_convert_value || row.price_for_total || row.master_price || row.bath_unit);
  return toNumber(row.quantity) * unitTotal;
};

export const recalculateProductRow = (row) => ({
  ...row,
  quantity: toNumber(row.quantity),
  xpoint: toNumber(row.xpoint),
  point: calculateDraftPoint(row),
  net_amount: calculateNetAmount(row),
});

export const mapDraftCampaignProduct = (item) =>
  recalculateProductRow({
    product_id: String(item?.product_id ?? item?.id ?? ""),
    product_code: item?.product_code || item?.code || "",
    product_name: item?.product_name || item?.name || "",
    packing_list: item?.packing_list || item?.unit || "",
    unit_convert_value: toNumber(item?.unit_convert_value),
    master_price: toNumber(item?.master_price ?? item?.bath_unit ?? item?.unit_convert_value),
    price_for_total: toNumber(item?.unit_convert_value ?? item?.master_price ?? item?.bath_unit),
    master_point: toNumber(item?.master_point ?? item?.point ?? item?.standard_point),
    quantity: toNumber(item?.quantity || 0),
    xpoint: toNumber(item?.xpoint || 0),
    point: item?.draft_point ?? item?.point ?? 0,
    draft_point: item?.draft_point,
    net_amount: item?.net_amount ?? 0,
  });

export const mapDraftCampaignDetail = (item, currentPoint = 0) => {
  const products = Array.isArray(item?.items) ? item.items.map(mapDraftCampaignProduct) : [];

  return {
    document_number: item?.document_number || "",
    document_date: item?.document_date || "",
    user_id: String(item?.user_id ?? ""),
    dealer_id: String(item?.dealer_id ?? ""),
    sub_dealer_id: String(item?.sub_dealer_id ?? ""),
    farmer_id: String(item?.farmer_id ?? ""),
    sale_name: item?.name_en || item?.sale_name || "-",
    dealer_name: item?.dealer_name || "-",
    sub_dealer_name: item?.sub_dealer_name || "-",
    farmer_name: item?.farm_name || item?.farmer_name || "-",
    current_point: toNumber(currentPoint),
    target_point: toNumber(item?.target_point),
    diff_form_target: toNumber(item?.diff_form_target),
    current_value: toNumber(item?.value_of_year ?? item?.current_value),
    target_value: toNumber(item?.target_value),
    diff_value_form_target: toNumber(item?.diff_value_form_target),
    value_to_point: toNumber(item?.value_to_point),
    total_point: toNumber(item?.point),
    net_amount: products.reduce((sum, product) => sum + toNumber(product.net_amount), 0),
    products,
    permission: item?.permission || {},
  };
};

export const buildDraftCampaignPayload = ({ values, rows, documentNumber }) => {
  const payload = {
    platform: "web",
    document_date: values.document_date,
    user_id: toNumber(values.user_id),
    dealer_id: toNumber(values.dealer_id),
    target_point: toNumber(values.target_point),
    diff_form_target: toNumber(values.diff_form_target),
    products: rows.map((row) => ({
      product_id: toNumber(row.product_id),
      quantity: toNumber(row.quantity),
      xpoint: toNumber(row.xpoint),
    })),
  };

  if (values.sub_dealer_id) {
    payload.sub_dealer_id = toNumber(values.sub_dealer_id);
  }

  if (values.farmer_id) {
    payload.farmer_id = toNumber(values.farmer_id);
  }

  if (!values.sub_dealer_id && !values.farmer_id) {
    payload.target_value = toNumber(values.target_value);
    payload.diff_value_form_target = toNumber(values.diff_value_form_target);
    payload.value_to_point = toNumber(values.value_to_point);
    payload.point_your_get = toNumber(values.point_your_get);
  }

  if (documentNumber) {
    payload.document_number = documentNumber;
  }

  return payload;
};
