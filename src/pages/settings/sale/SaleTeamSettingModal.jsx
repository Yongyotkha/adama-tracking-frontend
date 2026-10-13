import { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ConfigProvider, Modal, Radio, Select } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import { AuthContext } from "../../../contexts/AuthContext";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

const ROLE = {
  SALES: 4,
  BDE: 5,
  ASSISTANT: 6,
};

const ROLE_LABEL = {
  4: "Sales",
  5: "BDE",
  6: "Sales Assistant",
};

const MANAGED_ROLES = [ROLE.SALES, ROLE.BDE, ROLE.ASSISTANT];

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const asId = (value) => {
  if (value === undefined || value === null || value === "") return value;
  const number = Number(value);
  return Number.isFinite(number) ? number : value;
};

const personIdOf = (person) => {
  if (!person) return null;
  const id =
    person.userId ??
    person.user_id ??
    person.sub_user_id ??
    person.sale_user_id ??
    person.sale_id;
  return id === undefined || id === null || id === "" ? null : id;
};

const isPendingUser = (user) => {
  if (!user) return false;
  if (user.is_pending === true || user.is_pending === 1 || user.is_pending === "1") {
    return true;
  }
  const name = normalize(user.name || user.user_name);
  return name.includes("รอสรรหา") || name.includes("sales pending");
};

const matchUser = (users, person) => {
  if (!person || !users?.length) return null;

  const explicitId = personIdOf(person);
  if (explicitId != null) {
    const byId = users.find((user) => String(user.id) === String(explicitId));
    if (byId) return byId;
  }

  const name = normalize(person.name);
  if (!name) return null;
  const territory = normalize(person.territory || person.territory_name);
  const sameName = users.filter((user) => normalize(user.name) === name);
  if (!sameName.length) return null;
  if (territory) {
    const byTerritory = sameName.find(
      (user) => normalize(user.territory_name) === territory
    );
    if (byTerritory) return byTerritory;
  }
  return sameName[0];
};

const samePlace = (left, right) =>
  left != null && right != null && String(left) === String(right);

const roleName = (roles, roleId) =>
  roles.find((role) => String(role.id) === String(roleId))?.name ||
  ROLE_LABEL[Number(roleId)] ||
  "-";

const errorText = (error, fallback) => {
  const payload = error?.response?.data || error;
  if (typeof payload?.message === "string" && payload.message) return payload.message;
  if (payload?.data?.message) return payload.data.message;
  const errors = payload?.errors;
  if (errors && typeof errors === "object") {
    const first = Object.values(errors)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
    if (typeof first === "string") return first;
  }
  return error?.message || fallback;
};

export default function SaleTeamSettingModal({
  open,
  record,
  options,
  optionsLoading,
  onClose,
  onSuccess,
}) {
  const { showNotification } = useContext(AuthContext);
  const [action, setAction] = useState("resign");
  const [saving, setSaving] = useState(false);
  const [replacementId, setReplacementId] = useState(undefined);
  const [targetUserId, setTargetUserId] = useState(undefined);
  const [newRoleId, setNewRoleId] = useState(undefined);
  const [targetAreaId, setTargetAreaId] = useState(undefined);
  const [targetTerritoryId, setTargetTerritoryId] = useState(undefined);

  const areas = useMemo(() => options?.areas || [], [options]);
  const territories = useMemo(() => options?.territories || [], [options]);
  const roles = useMemo(() => options?.roles || [], [options]);
  const users = useMemo(() => options?.users || [], [options]);

  useEffect(() => {
    if (!open) return;
    setAction("resign");
    setReplacementId(undefined);
    setTargetUserId(undefined);
    setNewRoleId(undefined);
    setTargetAreaId(undefined);
    setTargetTerritoryId(undefined);
  }, [open, record]);

  const context = useMemo(() => {
    const self = matchUser(users, record);
    const territory =
      territories.find((item) => samePlace(item.id, record?.territoryId)) ||
      territories.find((item) => samePlace(item.id, self?.territory_id)) ||
      territories.find((item) => normalize(item.name) === normalize(record?.territory));
    const areaId = record?.areaId || self?.area_id || territory?.area_id || null;
    return {
      user: self,
      userId: self?.id || personIdOf(record) || null,
      roleId: self?.role_id ?? record?.roleId ?? null,
      territoryId: territory?.id || self?.territory_id || record?.territoryId || null,
      areaId,
      pending: Boolean(record?.isPending) || isPendingUser(self),
    };
  }, [users, territories, record]);

  const sourceActive = Boolean(context.userId) && !context.pending;
  const roleKnown = MANAGED_ROLES.includes(Number(context.roleId));
  const inArea = (user) =>
    !context.areaId || !user.area_id || samePlace(user.area_id, context.areaId);
  const inTerritory = (user) => {
    if (context.territoryId && user.territory_id) {
      return samePlace(user.territory_id, context.territoryId);
    }
    return (
      normalize(user.territory_name) !== "" &&
      normalize(user.territory_name) === normalize(record?.territory)
    );
  };

  const replacementOptions = useMemo(
    () =>
      users
        .filter((user) => {
          if (isPendingUser(user)) return false;
          if (samePlace(user.id, context.userId)) return false;
          return inTerritory(user);
        })
        .map((user) => ({
          value: user.id,
          label: user.position_name || user.role_name
            ? `${user.name} (${user.position_name || user.role_name})`
            : user.name,
        })),
    [users, context.userId, context.territoryId, record]
  );

  const pendingAreaSlots = useMemo(
    () =>
      users
        .filter((user) => {
          if (!isPendingUser(user)) return false;
          if (samePlace(user.id, context.userId)) return false;
          if (!inArea(user)) return false;
          if (inTerritory(user)) return false;
          return true;
        })
        .map((user) => ({
          value: user.id,
          label: `${user.territory_name || "Territory"} - ${user.name}`,
          territoryName: user.territory_name || "",
          name: user.name,
        })),
    [users, context.userId, context.areaId, context.territoryId]
  );

  const roleOnlyChange =
    MANAGED_ROLES.includes(Number(context.roleId)) &&
    MANAGED_ROLES.includes(Number(newRoleId)) &&
    Number(context.roleId) !== ROLE.SALES &&
    Number(newRoleId) !== ROLE.SALES;

  const positionRoles = useMemo(
    () =>
      MANAGED_ROLES.filter((roleId) => !samePlace(roleId, context.roleId)).map((roleId) => ({
        value: roleId,
        label: roleName(roles, roleId),
      })),
    [roles, context.roleId]
  );

  const pendingRoleSlots = useMemo(() => {
    if (!newRoleId || roleOnlyChange) return [];
    return users
      .filter((user) => {
        if (!isPendingUser(user)) return false;
        if (!samePlace(user.role_id, newRoleId)) return false;
        if (!inArea(user) || !inTerritory(user)) return false;
        return true;
      })
      .map((user) => ({
        value: user.id,
        label: user.name,
      }));
  }, [users, newRoleId, roleOnlyChange, context.areaId, context.territoryId]);

  const otherAreas = useMemo(
    () => areas.filter((item) => !samePlace(item.id, context.areaId)),
    [areas, context.areaId]
  );

  const crossTerritories = useMemo(
    () =>
      territories.filter((territory) => {
        if (!targetAreaId || !samePlace(territory.area_id, targetAreaId)) return false;
        return users.some(
          (user) =>
            isPendingUser(user) &&
            Number(user.role_id) === ROLE.SALES &&
            samePlace(user.territory_id, territory.id)
        );
      }),
    [territories, users, targetAreaId]
  );

  const replacement = replacementOptions.find((item) => samePlace(item.value, replacementId));
  const areaSlot = pendingAreaSlots.find((item) => samePlace(item.value, targetUserId));
  const roleSlot = pendingRoleSlots.find((item) => samePlace(item.value, targetUserId));
  const targetArea = otherAreas.find((item) => samePlace(item.id, targetAreaId));
  const targetTerritory = crossTerritories.find((item) => samePlace(item.id, targetTerritoryId));

  const destinationText = () => {
    if (action === "resign") return replacement?.label || "ไม่ระบุคนแทน";
    if (action === "move") return areaSlot?.label || "-";
    if (action === "role") {
      const roleLabel = newRoleId ? roleName(roles, newRoleId) : "-";
      if (roleOnlyChange) return `${roleLabel} (เปลี่ยน Role อย่างเดียว)`;
      return roleSlot ? `${roleLabel} - ${roleSlot.label}` : roleLabel;
    }
    const areaLabel = targetArea?.name || "-";
    const territoryLabel = targetTerritory?.name || "-";
    return `${areaLabel} / ${territoryLabel} / Sales (รอสรรหา)`;
  };

  const changeAction = (value) => {
    setAction(value);
    setReplacementId(undefined);
    setTargetUserId(undefined);
    setNewRoleId(undefined);
    setTargetAreaId(undefined);
    setTargetTerritoryId(undefined);
  };

  const handleOk = async () => {
    if (saving) return;
    if (!sourceActive) {
      showNotification(
        "error",
        "ไม่สำเร็จ",
        "ต้องเลือกพนักงานจริงที่ Active เป็นบุคคลต้นทาง"
      );
      return;
    }

    setSaving(true);
    try {
      let payload = null;
      if (action === "resign") {
        payload = { mode: "RESIGN", user_id: asId(context.userId) };
        if (replacementId) payload.replacement_user_id = asId(replacementId);
      }

      if (action === "move") {
        if (!targetUserId) throw new Error("เลือกตำแหน่ง รอสรรหา ปลายทาง");
        payload = {
          mode: "TRANSFER_AREA",
          user_id: asId(context.userId),
          target_user_id: asId(targetUserId),
        };
      }

      if (action === "role") {
        if (!newRoleId) throw new Error("เลือกตำแหน่งปลายทาง");
        if (!roleOnlyChange && !targetUserId) {
          throw new Error("เลือกตำแหน่ง รอสรรหา ใน Territory เดียวกัน");
        }
        payload = {
          mode: "CHANGE_POSITION",
          user_id: asId(context.userId),
          target_role_id: asId(newRoleId),
        };
        if (!roleOnlyChange) payload.target_user_id = asId(targetUserId);
      }

      if (action === "move-area") {
        if (!targetAreaId) throw new Error("เลือก Area");
        if (!targetTerritoryId) throw new Error("เลือก Territory ที่มี Sales รอสรรหา");
        payload = {
          mode: "TRANSFER_CROSS_AREA",
          user_id: asId(context.userId),
          target_area_id: asId(targetAreaId),
          target_territory_id: asId(targetTerritoryId),
          target_role_id: ROLE.SALES,
        };
      }

      const res = await useServiceAPI.post(paths.pathSaleManagementAction, payload);
      const accepted =
        res?.status == null || res.status === true || Number(res.status) === 200;
      if (!accepted) {
        throw new Error(res.message || res.data?.message || "บันทึกไม่สำเร็จ");
      }
      showNotification("success", "บันทึกสำเร็จ", res?.message || res?.data?.message || "");
      onClose?.();
      onSuccess?.();
    } catch (error) {
      showNotification("error", "ไม่สำเร็จ", errorText(error, "บันทึกไม่สำเร็จ"));
    } finally {
      setSaving(false);
    }
  };

  const selectProps = {
    className: "w-full",
    showSearch: true,
    optionFilterProp: "label",
    loading: optionsLoading,
  };

  const canSubmit =
    sourceActive &&
    !optionsLoading &&
    (action === "resign" ||
      (action === "move" && targetUserId) ||
      (action === "role" && roleKnown && newRoleId && (roleOnlyChange || targetUserId)) ||
      (action === "move-area" && roleKnown && targetAreaId && targetTerritoryId));

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#00783F" } }}>
      <Modal
        title="ตั้งค่า"
        open={open}
        onCancel={saving ? undefined : onClose}
        footer={null}
        width={780}
        destroyOnClose
        maskClosable={!saving}
      >
        <div className="mb-4">
          <div className="mb-2 text-sm font-medium text-[#00783F]">ที่เก่า</div>
          <div className="grid grid-cols-3 gap-3 rounded border border-gray-200 px-3 py-2 text-sm">
            <div>
              <div className="text-xs text-gray-500">Name</div>
              <div className="font-medium text-gray-800">{record?.name || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Position</div>
              <div className="font-medium text-gray-800">
                {record?.position || roleName(roles, context.roleId)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Territory</div>
              <div className="font-medium text-gray-800">{record?.territory || "-"}</div>
            </div>
          </div>
          {!sourceActive && (
            <p className="mt-2 text-xs text-[#C47B16]">
              ต้องเป็นพนักงานจริงที่ Active และอยู่ในตำแหน่ง Sales, BDE หรือ Sales Assistant
            </p>
          )}
        </div>

        <div className="grid min-h-[280px] grid-cols-1 rounded border border-gray-200 md:grid-cols-[220px_1fr]">
          <div className="border-b border-gray-200 p-4 md:border-b-0 md:border-r">
            <Radio.Group
              className="flex flex-col gap-3"
              value={action}
              onChange={(event) => changeAction(event.target.value)}
            >
              <Radio value="resign">ลาออก</Radio>
              <Radio value="move">ย้ายเขต</Radio>
              <Radio value="role">ปรับตำแหน่ง</Radio>
              <Radio value="move-area">ย้ายเขตข้าม Area</Radio>
            </Radio.Group>
          </div>

          <div className="flex flex-col p-4">
            {action === "resign" && (
              <div>
                <label className="mb-1 block text-sm text-gray-600">ขอแทนที่</label>
                <Select
                  {...selectProps}
                  allowClear
                  placeholder="เลือกคนใน Territory เดียวกัน"
                  value={replacementId}
                  options={replacementOptions}
                  onChange={setReplacementId}
                  disabled={!sourceActive}
                />
                <p className="mt-2 text-xs text-gray-400">
                  ไม่เลือกคนแทนก็ได้ คนแทนต้องอยู่ใน Territory เดียวกัน
                </p>
              </div>
            )}

            {action === "move" && (
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  ตำแหน่งปลายทาง (รอสรรหา)
                </label>
                <Select
                  {...selectProps}
                  placeholder="เลือก รอสรรหา ใน Area เดียวกัน"
                  value={targetUserId}
                  options={pendingAreaSlots}
                  onChange={setTargetUserId}
                  disabled={!sourceActive}
                />
                {!pendingAreaSlots.length && (
                  <p className="mt-2 text-xs text-gray-400">
                    ไม่มีตำแหน่ง รอสรรหา ใน Area นี้ที่อยู่คนละ Territory
                  </p>
                )}
              </div>
            )}

            {action === "role" && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">ตำแหน่งปลายทาง</label>
                  <Select
                    {...selectProps}
                    placeholder="เลือกตำแหน่ง"
                    value={newRoleId}
                    options={positionRoles}
                    disabled={!sourceActive || !roleKnown}
                    onChange={(value) => {
                      setNewRoleId(value);
                      setTargetUserId(undefined);
                    }}
                  />
                </div>
                {newRoleId && roleOnlyChange && (
                  <p className="text-xs text-gray-400">
                    BDE กับ Sales Assistant เปลี่ยน Role อย่างเดียว
                  </p>
                )}
                {newRoleId && !roleOnlyChange && (
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      รอสรรหาใน Territory เดียวกัน
                    </label>
                    <Select
                      {...selectProps}
                      placeholder="เลือกตำแหน่ง รอสรรหา"
                      value={targetUserId}
                      options={pendingRoleSlots}
                      onChange={setTargetUserId}
                    />
                    {!pendingRoleSlots.length && (
                      <p className="mt-2 text-xs text-gray-400">
                        ไม่มีตำแหน่ง รอสรรหา ของตำแหน่งนี้ใน Territory เดียวกัน
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {action === "move-area" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Area</label>
                  <Select
                    {...selectProps}
                    placeholder="Area"
                    value={targetAreaId}
                    disabled={!sourceActive || !roleKnown}
                    options={otherAreas.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                    onChange={(value) => {
                      setTargetAreaId(value);
                      setTargetTerritoryId(undefined);
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Territory</label>
                  <Select
                    {...selectProps}
                    placeholder="Territory ที่มี Sales รอสรรหา"
                    value={targetTerritoryId}
                    disabled={!targetAreaId}
                    options={crossTerritories.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                    onChange={setTargetTerritoryId}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Position</label>
                  <Select
                    className="w-full"
                    disabled
                    value={ROLE.SALES}
                    options={[{ value: ROLE.SALES, label: "Sales" }]}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 rounded bg-[#F4F8F5] px-3 py-2 text-sm text-gray-700">
              <div>
                <span className="text-gray-500">ต้นทาง: </span>
                {record?.name || "-"} / {record?.position || roleName(roles, context.roleId)} /{" "}
                {record?.territory || "-"}
              </div>
              <div>
                <span className="text-gray-500">ปลายทาง: </span>
                {destinationText()}
              </div>
            </div>

            <div className="mt-auto flex justify-end gap-2 pt-6">
              <ActionButton
                mode="close"
                text="ยกเลิก"
                onClick={onClose}
                disabled={saving}
              />
              <ActionButton
                mode="save"
                text="ตกลง"
                onClick={handleOk}
                disabled={saving || !canSubmit}
              />
            </div>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
}

const idType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

SaleTeamSettingModal.propTypes = {
  open: PropTypes.bool,
  record: PropTypes.shape({
    name: PropTypes.string,
    position: PropTypes.string,
    territory: PropTypes.string,
    userId: idType,
    territoryId: idType,
    areaId: idType,
    areaName: PropTypes.string,
    roleId: idType,
    isPending: PropTypes.bool,
    team: PropTypes.array,
  }),
  options: PropTypes.shape({
    areas: PropTypes.array,
    territories: PropTypes.array,
    roles: PropTypes.array,
    users: PropTypes.array,
  }),
  optionsLoading: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};
