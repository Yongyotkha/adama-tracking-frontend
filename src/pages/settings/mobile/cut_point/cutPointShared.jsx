import dayjs from "dayjs";
import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";
import useServiceAPI from "../../../../services/CorsService";
import { paths } from "../../../../services/CorsPath";

export const CUT_POINT_LIST_PATH = "/points/line/cut-point";
export const CUT_POINT_CREATE_PATH = "/points/line/cut-point/create";
export const CUT_POINT_VIEW_PATH = "/points/line/cut-point/view";

export function formatPoint(value) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return number.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function formatDateTime(value) {
  if (!value) return "-";
  const date = dayjs(value);
  return date.isValid() ? date.format("DD/MM/YYYY HH:mm") : String(value);
}

export function normalizeType(raw = {}) {
  const value = String(raw.type || raw.customer_type || raw.shop_type || "").toLowerCase();
  if (value === "fm" || value === "farmer") return "FM";
  if (["sd", "sub_dealer", "subdealer", "sub-dealer"].includes(value)) return "SD";
  if (raw.farmer_id || raw.farmer_name) return "FM";
  return "SD";
}

export function cutPointTypeLabel(type) {
  return type === "FM" ? "Farmer" : "Sub Dealer";
}

export function normalizeStatus(raw = {}) {
  const value = String(raw.status || raw.status_code || raw.status_name || "").toLowerCase();
  if (value.includes("refund")) return "refunded";
  return "active";
}

export function mapCutPointRow(raw = {}) {
  const type = normalizeType(raw);
  const files = raw.files || raw.file_list || raw.attachments || [];

  return {
    id: raw.id ?? raw.cut_point_id ?? null,
    documentNumber: raw.document_number || raw.doc_no || "",
    type,
    saleName: raw.sale_name || "-",
    dealerName: raw.dealer_name || "-",
    subDealerName: raw.sub_dealer_name || "-",
    farmerName: raw.farmer_name || "-",
    cutPoint: Number(raw.cut_point ?? 0) || 0,
    currentPoint: raw.current_point ?? null,
    balanceAfter: raw.balance_after ?? null,
    userId: raw.user_id ?? null,
    dealerId: raw.dealer_id ?? null,
    subDealerId: raw.sub_dealer_id ?? null,
    farmerId: raw.farmer_id ?? null,
    walletUserId: raw.wallet_user_id ?? null,
    walletType: raw.wallet_type || "",
    reason: raw.reason || "",
    createdAt: raw.created_at || "",
    status: normalizeStatus(raw),
    statusLabel: raw.status_label || "",
    canRefund: raw.can_refund === true || raw.can_refund === 1,
    files: Array.isArray(files) ? files : [],
    refundRemark: raw.refund_remark || "",
    refundedAt: raw.refunded_at || raw.refund_date || "",
    actions: Array.isArray(raw.action) ? raw.action : [],
  };
}

export function cutPointStatusText(record) {
  const label = String(record?.statusLabel || "").trim().toLowerCase();
  const status = String(record?.status || "").toLowerCase();
  if (label.includes("refund") || status.includes("refund")) return "Refunded";
  if (
    label === "complete" ||
    label === "completed" ||
    status === "complete" ||
    status === "completed" ||
    status === "active"
  ) {
    return "Complete";
  }
  if (record?.statusLabel) return record.statusLabel;
  return "Complete";
}

export function cutPointStatusColor(record) {
  const label = String(record?.statusLabel || "").toLowerCase();
  const status = String(record?.status || "").toLowerCase();
  if (
    label === "complete" ||
    label === "completed" ||
    status === "complete" ||
    status === "completed" ||
    status === "active"
  ) {
    return { bgColor: "#00783F", textColor: "#FFFFFF" };
  }
  if (label.includes("refund") || status.includes("refund")) {
    return { bgColor: "#F89E18", textColor: "#FFFFFF" };
  }
  return { bgColor: "#9CA3AF", textColor: "#FFFFFF" };
}

export function unwrapList(res) {
  const top = res || {};
  const nested = top.data && !Array.isArray(top.data) ? top.data : null;
  const rows = Array.isArray(nested?.data)
    ? nested.data
    : Array.isArray(top.data)
      ? top.data
      : [];
  const total = nested?.records_filtered ?? top.records_filtered ?? nested?.total ?? rows.length;
  const permission = nested?.permission || top.permission || {};
  return { rows, total, permission };
}

export function unwrapDetail(res) {
  const candidates = [res?.data?.data, res?.data, res];
  return (
    candidates.find(
      (item) =>
        item &&
        !Array.isArray(item) &&
        (item.id || item.document_number || item.cut_point != null || item.reason)
    ) || null
  );
}

export function getBalancePoint(res) {
  return (
    res?.data?.data?.users?.balance_point ??
    res?.data?.users?.balance_point ??
    res?.users?.balance_point ??
    res?.data?.data?.balance_point ??
    res?.data?.balance_point ??
    res?.balance_point ??
    0
  );
}

export function toUploadFiles(files = []) {
  return files.map((file, index) => ({
    uid: file.file_key || file.uid || `file-${index}`,
    name: file.file_name || file.name || `file-${index + 1}`,
    status: "done",
    url: file.file_url || file.url || "",
  }));
}

export function apiErrorText(error, fallback) {
  const data = error?.response?.data;
  const header = data?.data?.Message?.Message_Header;
  const lines = data?.data?.Message?.Message_Line;
  if (header && Array.isArray(lines) && lines.length) return `${header}: ${lines.join(" ")}`;
  if (Array.isArray(lines) && lines.length) return lines.join(" ");
  return data?.message || error?.message || fallback;
}

export function isApiOk(res) {
  if (!res) return false;
  if (res.status === undefined) return true;
  return res.status === 200 || res.status === "200";
}

export function cutPointViewPath(record) {
  const search = new URLSearchParams();
  if (record?.id != null && record.id !== "") search.set("id", record.id);
  if (record?.documentNumber) search.set("document_number", record.documentNumber);
  const query = search.toString();
  return query ? `${CUT_POINT_VIEW_PATH}?${query}` : CUT_POINT_VIEW_PATH;
}

export function openRefundModal({ record, onDone, showMsg }) {
  let remark = "";
  const targetName = record.type === "FM" ? record.farmerName : record.subDealerName;

  Modal.confirm({
    title: "Refund",
    icon: <ExclamationCircleFilled />,
    centered: true,
    okText: "Refund",
    cancelText: "Cancel",
    content: (
      <div className="mt-3">
        <p className="mb-3 text-sm text-gray-600">
          Return {formatPoint(record.cutPoint)} points to {record.type === "FM" ? "Farmer" : "Sub Dealer"} {targetName}. Use this when the cut point was entered incorrectly.
        </p>
        <div className="mb-2 text-sm font-medium">
          Remark <span className="text-red-500">*</span>
        </div>
        <textarea
          className="w-full rounded-md border border-gray-300 p-2"
          rows={3}
          placeholder="Enter a remark"
          onChange={(event) => {
            remark = event.target.value;
          }}
        />
      </div>
    ),
    async onOk() {
      if (!remark.trim()) {
        showMsg?.("warning", "Please enter a remark", 2);
        return Promise.reject();
      }

      try {
        const res = await useServiceAPI.put(paths.pathCutPointRefund, {
          id: record.id,
          document_number: record.documentNumber,
          remark: remark.trim(),
          user_id: record.userId ?? null,
          dealer_id: record.dealerId ?? null,
          sub_dealer_id: record.subDealerId ?? null,
          farmer_id: record.farmerId ?? null,
          wallet_user_id: record.walletUserId ?? null,
          wallet_type: record.walletType || "",
          current_point: record.currentPoint,
          cut_point: record.cutPoint,
          balance_after: record.balanceAfter,
        });

        if (!isApiOk(res)) {
          showMsg?.("warning", res?.message || "Refund failed", 2);
          return Promise.reject();
        }

        showMsg?.("success", "Refund successful", 2);
        onDone?.();
      } catch (error) {
        showMsg?.("error", apiErrorText(error, "Refund failed"), 3);
        return Promise.reject();
      }
    },
  });
}