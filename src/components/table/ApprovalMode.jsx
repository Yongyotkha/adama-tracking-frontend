import { Select, Checkbox } from "antd";
import ActionButton from "../button/ActionButton";

const ApprovalMode = ({
  isApprovalMode,
  onToggleApprovalMode,
  selectedStatus,
  onStatusChange,
  statusOptions,
  onApprove,
  selectedRowKeys,
  updateAll,
  onUpdateAllChange,
}) => {
  const filteredStatusOptions = selectedStatus
    ? statusOptions.map((opt) => ({
        ...opt,
        disabled: opt.value !== selectedStatus,
      }))
    : statusOptions;

  return (
    <div className="flex items-center gap-3 mb-3">
      <ActionButton
        mode="custom"
        text={isApprovalMode ? "Exit Approval Mode" : "Approval Mode"}
        onClick={onToggleApprovalMode}
        className={isApprovalMode ? "bg-[#752157]" : "bg-[#00783F]"}
      />

      {isApprovalMode && (
        <>
          <div className="flex items-center gap-2">
            <Checkbox checked={updateAll} onChange={(e) => onUpdateAllChange(e.target.checked)}>
              Update All
            </Checkbox>
            <span className="text-sm font-medium text-gray-700">Select Status:</span>
            <Select
              value={selectedStatus}
              onChange={onStatusChange}
              placeholder="Select status to approve"
              style={{ width: 250 }}
              allowClear
              options={filteredStatusOptions}
              disabled={!updateAll}
            />
          </div>

          <ActionButton
            mode="save"
            text="Approve"
            onClick={onApprove}
            disabled={!selectedStatus || selectedRowKeys.length === 0}
          />
        </>
      )}
    </div>
  );
};

export default ApprovalMode;