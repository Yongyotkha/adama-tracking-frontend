import { Select, Checkbox } from "antd";
import ActionButton from "../button/ActionButton";
import { AuditOutlined, CloseOutlined, CheckOutlined } from "@ant-design/icons";

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
  lockedTableStatus,
  lockedTableStatusLabel,
  showUpdateAll = true,
}) => {
  return (
    <div className="flex items-center gap-3 mt-4 mb-4">
      <ActionButton
        mode="custom"
        text={isApprovalMode ? "Exit Approval Mode" : "Approval Mode"}
        onClick={onToggleApprovalMode}
        className={isApprovalMode ? "bg-[#f11113] hover:bg-[#d00f11]" : "bg-[#752157] hover:bg-[#5b1943]"}
        icon={isApprovalMode ? <CloseOutlined /> : <AuditOutlined />}
      />

      {isApprovalMode && (
        <>
          <div className="flex items-center gap-2">
            {showUpdateAll && (
              <Checkbox checked={updateAll} onChange={(e) => onUpdateAllChange(e.target.checked)}>
                Update All
              </Checkbox>
            )}
            {updateAll ? (
              <>
                <span className="text-sm font-medium text-gray-700">Select Status:</span>
                <Select
                  value={selectedStatus}
                  onChange={onStatusChange}
                  placeholder="Select status to approve"
                  style={{ width: 250 }}
                  allowClear
                  options={statusOptions}
                />
              </>
            ) : (
              lockedTableStatus && (
                <span className="text-sm font-medium text-gray-700">
                  Status locked: {lockedTableStatusLabel || lockedTableStatus}
                </span>
              )
            )}
          </div>

          <ActionButton
            mode="save"
            text="Approve"
            onClick={onApprove}
            icon={<CheckOutlined />}
            disabled={
              updateAll
                ? !selectedStatus
                : !lockedTableStatus || selectedRowKeys.length === 0
            }
          />
        </>
      )}
    </div>
  );
};

export default ApprovalMode;