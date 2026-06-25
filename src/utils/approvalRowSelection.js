const EXCLUDED_STATUS_KEYS = new Set(["draft", "reject", "convert"]);

export const getRowStatusCode = (record) => {
  const row = record?.raw ?? record;
  return String(row?.transaction_status_code ?? row?.trasaction_status_code ?? "").trim();
};

export const getRowStatusName = (record) => {
  const row = record?.raw ?? record;
  return String(row?.transaction_status_name ?? "").trim();
};

/** Normalized key for comparing / locking row status (code preferred, name fallback). */
export const getRowStatusKey = (record) => {
  const code = getRowStatusCode(record);
  if (code) return code.toLowerCase();
  return getRowStatusName(record).toLowerCase();
};

export const isExcludedApprovalStatus = (record) => {
  const code = getRowStatusCode(record).toLowerCase();
  const name = getRowStatusName(record).toLowerCase();
  return EXCLUDED_STATUS_KEYS.has(code) || EXCLUDED_STATUS_KEYS.has(name);
};

export const findStatusLabel = (statusKey, statusOptions = []) => {
  if (!statusKey) return "";
  const normalized = statusKey.toLowerCase();
  const match = statusOptions.find((opt) => String(opt.value).toLowerCase() === normalized);
  return match?.label || statusKey;
};
