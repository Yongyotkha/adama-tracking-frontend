// Shared helpers for Territory pages. Response shapes are parsed defensively
// because the deployed controller field names still need confirming.

export const asList = (body) => {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.data?.data)) return body.data.data;
  if (Array.isArray(body.items)) return body.items;
  return [];
};

export const totalOf = (body, fallback = 0) => {
  const src = body?.data && !Array.isArray(body.data) ? body.data : body;
  const value =
    src?.records_filtered ?? src?.total ?? src?.records_total ?? src?.meta?.total;
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
};

export const firstText = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value != null && String(value).trim() !== "") return String(value);
  }
  return "";
};

export const toId = (value) =>
  value == null || value === "" ? undefined : String(value);

export const toNumberId = (value) => {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? value : n;
};

export const isActive = (row) => {
  const flag = row?.use_flag ?? row?.status;
  return flag === 1 || flag === "1" || flag === true || String(flag).toLowerCase() === "active";
};

export const apiError = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.data?.message ||
  error?.message ||
  fallback;

export const isSuccess = (response) =>
  response?.status === 200 || response?.status === 201 || response?.success === true;

// Normalise a dealer row from any of the territory endpoints.
export const mapDealer = (item) => {
  const dealerId = item?.dealer_id ?? item?.id;
  return {
    key: String(dealerId),
    dealer_id: toNumberId(dealerId),
    dealer_code: firstText(item, ["dealer_code", "code"]) || "-",
    dealer_name: firstText(item, ["dealer_name", "dealer_name_en"]) || "-",
    address: firstText(item, ["address", "dealer_address", "contact_address"]) || "-",
    current_territory_id: item?.current_territory_id ?? item?.territory_id ?? null,
    current_territory_name:
      firstText(item, ["current_territory_name", "territory_name", "current_territory"]) || "",
  };
};
