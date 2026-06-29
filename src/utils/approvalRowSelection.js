const EXCLUDED_STATUS_KEYS = new Set(["draft", "reject", "convert"]);
const COMPLETE_STATUS_KEYS = new Set(["eac", "complete"]);

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

export const isCompleteStatus = (recordOrStatus) => {
  if (!recordOrStatus) return false;
  if (typeof recordOrStatus === "string") {
    return COMPLETE_STATUS_KEYS.has(recordOrStatus.toLowerCase());
  }
  const code = getRowStatusCode(recordOrStatus).toLowerCase();
  const name = getRowStatusName(recordOrStatus).toLowerCase();
  return COMPLETE_STATUS_KEYS.has(code) || COMPLETE_STATUS_KEYS.has(name);
};

export const isExcludedApprovalStatus = (record) => {
  const code = getRowStatusCode(record).toLowerCase();
  const name = getRowStatusName(record).toLowerCase();
  return EXCLUDED_STATUS_KEYS.has(code) || EXCLUDED_STATUS_KEYS.has(name);
};

export const isBlockedClearingApprovalStatus = (record) =>
  isExcludedApprovalStatus(record) || isCompleteStatus(record);

export const findStatusLabel = (statusKey, statusOptions = []) => {
  if (!statusKey) return "";
  const normalized = statusKey.toLowerCase();
  const match = statusOptions.find((opt) => String(opt.value).toLowerCase() === normalized);
  return match?.label || statusKey;
};

export const getBulkApproveFeedback = (response, successFallback, errorFallback) => {
  const isSuccess = response?.result === true || response?.data?.Result === true;
  const messageHeader =
    response?.data?.Message?.Message_Header || (isSuccess ? "Success" : "Failed");
  const messageLines =
    response?.data?.Message?.Message_Line ||
    (isSuccess ? [successFallback] : [response?.message || errorFallback]);

  return { isSuccess, messageHeader, messageLines };
};
