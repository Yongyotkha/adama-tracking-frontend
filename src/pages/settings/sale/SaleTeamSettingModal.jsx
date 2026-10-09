import { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ConfigProvider, Modal, Radio, Select } from "antd";
import ActionButton from "../../../components/button/ActionButton";
import { AuthContext } from "../../../contexts/AuthContext";
import useServiceAPI from "../../../services/corsService";
import { paths } from "../../../services/CorsPath";

const SALES_ROLE_ID = 4;
const TEAM_ROLE_IDS = [5, 6];

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

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

const matchUser = (users, person) => {
  if (!person || !users?.length) return null;

  const explicitId = personIdOf(person);
  if (explicitId != null) {
    const byId = users.find((user) => String(user.id) === String(explicitId));
    if (byId) return byId;
  }

  if (person.id != null && person.role_id != null) {
    const byUser = users.find((user) => String(user.id) === String(person.id));
    if (byUser) return byUser;
  }

  const name = normalize(person.name);
  if (!name) return null;
  const territory = normalize(person.territory || person.territory_name);
  const sameName = users.filter(
    (user) => normalize(user.name) === name && !user.is_pending
  );
  if (!sameName.length) return null;
  if (territory) {
    const byTerritory = sameName.find(
      (user) => normalize(user.territory_name) === territory
    );
    if (byTerritory) return byTerritory;
  }
  return sameName[0];
};

const toPerson = (user, source) => ({
  id: user.id,
  name: source?.name || user.name,
  position:
    source?.position ||
    source?.position_name ||
    user.position_name ||
    user.role_name ||
    "",
  territory: source?.territory || source?.territory_name || user.territory_name || "",
  roleId: user.role_id,
  areaId: user.area_id,
  territoryId: user.territory_id,
});

const personLabel = (person) =>
  person.position ? `${person.name} (${person.position})` : person.name;

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
  const [moveTerritoryId, setMoveTerritoryId] = useState(undefined);
  const [personId, setPersonId] = useState(undefined);
  const [newRoleId, setNewRoleId] = useState(undefined);
  const [targetAreaId, setTargetAreaId] = useState(undefined);
  const [targetTerritoryId, setTargetTerritoryId] = useState(undefined);
  const [targetRoleId, setTargetRoleId] = useState(undefined);
  const [parentSaleId, setParentSaleId] = useState(undefined);

  const areas = useMemo(() => options?.areas || [], [options]);
  const territories = useMemo(() => options?.territories || [], [options]);
  const roles = useMemo(() => options?.roles || [], [options]);
  const users = useMemo(() => options?.users || [], [options]);

  useEffect(() => {
    if (!open) return;
    setAction("resign");
    setReplacementId(undefined);
    setMoveTerritoryId(undefined);
    setPersonId(undefined);
    setNewRoleId(undefined);
    setTargetAreaId(undefined);
    setTargetTerritoryId(undefined);
    setTargetRoleId(undefined);
    setParentSaleId(undefined);
  }, [open, record]);

  const context = useMemo(() => {
    const self = matchUser(users, record);
    const territory =
      territories.find(
        (item) =>
          record?.territoryId && String(item.id) === String(record.territoryId)
      ) ||
      territories.find(
        (item) => self?.territory_id && String(item.id) === String(self.territory_id)
      ) ||
      territories.find(
        (item) => normalize(item.name) === normalize(record?.territory)
      );
    const areaId = record?.areaId || self?.area_id || territory?.area_id || null;
    return {
      user: self,
      userId: self?.id || personIdOf(record) || null,
      roleId: self?.role_id ?? record?.roleId ?? null,
      territoryId: territory?.id || self?.territory_id || record?.territoryId || null,
      areaId,
    };
  }, [users, territories, record]);

  const teamPeople = useMemo(() => {
    return (record?.team || [])
      .map((member) => {
        const user = matchUser(users, member);
        return user ? toPerson(user, member) : null;
      })
      .filter(Boolean)
      .filter((person) => String(person.id) !== String(context.userId));
  }, [record, users, context.userId]);

  const territoryPeople = useMemo(() => {
    return users
      .filter((user) => {
        if (user.is_pending) return false;
        if (String(user.id) === String(context.userId)) return false;
        if (
          context.territoryId &&
          String(user.territory_id) === String(context.territoryId)
        ) {
          return true;
        }
        return (
          normalize(user.territory_name) !== "" &&
          normalize(user.territory_name) === normalize(record?.territory)
        );
      })
      .map((user) => toPerson(user, user));
  }, [users, context.userId, context.territoryId, record]);

  const people = useMemo(() => {
    const list = [];
    const push = (person) => {
      if (!person?.id) return;
      if (list.some((item) => String(item.id) === String(person.id))) return;
      list.push(person);
    };
    if (context.user) push(toPerson(context.user, record));
    teamPeople.forEach(push);
    territoryPeople.forEach(push);
    return list;
  }, [context.user, record, teamPeople, territoryPeople]);

  const replacementOptions = useMemo(() => {
    const source = teamPeople.length ? teamPeople : territoryPeople;
    return source.map((person) => ({
      value: person.id,
      label: person.name,
    }));
  }, [teamPeople, territoryPeople]);

  const sameAreaTerritories = useMemo(() => {
    const excludeCurrent = (item) =>
      !context.territoryId || String(item.id) !== String(context.territoryId);
    const hasArea = territories.some(
      (item) => item.area_id !== undefined && item.area_id !== null && item.area_id !== ""
    );
    return territories.filter((item) => {
      if (
        context.areaId &&
        hasArea &&
        String(item.area_id) !== String(context.areaId)
      ) {
        return false;
      }
      return excludeCurrent(item);
    });
  }, [territories, context.areaId, context.territoryId]);

  const otherAreas = useMemo(
    () => areas.filter((item) => String(item.id) !== String(context.areaId)),
    [areas, context.areaId]
  );

  const crossAreaTerritories = useMemo(
    () =>
      territories.filter(
        (item) => targetAreaId && String(item.area_id) === String(targetAreaId)
      ),
    [territories, targetAreaId]
  );

  const selectedPerson = people.find(
    (person) => String(person.id) === String(personId)
  );

  const roleOptions = roles.filter(
    (role) =>
      !selectedPerson?.roleId || String(role.id) !== String(selectedPerson.roleId)
  );

  const needsParent =
    TEAM_ROLE_IDS.includes(Number(newRoleId)) &&
    !!personId &&
    (String(personId) === String(context.userId) || !context.userId);

  const crossNeedsParent = TEAM_ROLE_IDS.includes(Number(targetRoleId));

  const parentOptions = users
    .filter(
      (user) =>
        Number(user.role_id) === SALES_ROLE_ID &&
        user.in_team &&
        !user.is_pending &&
        String(user.id) !== String(personId || context.userId)
    )
    .map((user) => ({
      value: user.id,
      label: `${user.name} (${user.territory_name || "-"})`,
    }));

  const notifyError = (error, fallback) => {
    const payload = error?.response?.data || error;
    const message =
      payload?.data?.message || payload?.message || error?.message || fallback;
    showNotification("error", "ไม่สำเร็จ", message);
  };

  const postAction = async (url, payload, fallback) => {
    const res = await useServiceAPI.post(url, payload);
    if (res.status !== 200) {
      const error = new Error(res.data?.message || res.message || fallback);
      error.response = { data: res };
      throw error;
    }
    return res;
  };

  const handleOk = async () => {
    if (saving) return;
    if (!context.userId) {
      showNotification(
        "error",
        "ไม่สำเร็จ",
        "ไม่พบข้อมูลพนักงานของรายการนี้"
      );
      return;
    }

    setSaving(true);
    try {
      if (action === "resign") {
        const payload = { user_id: context.userId };
        if (replacementId) payload.replacement_user_id = replacementId;
        const res = await postAction(
          paths.pathTerritoryTransferResign,
          payload,
          "บันทึกลาออกไม่สำเร็จ"
        );
        showNotification("success", "บันทึกลาออกสำเร็จ", res.data?.message || "");
      }

      if (action === "move") {
        if (!moveTerritoryId) throw new Error("เลือก Territory");
        const res = await postAction(
          paths.pathTerritoryTransferMove,
          {
            user_id: context.userId,
            target_area_id: context.areaId,
            target_territory_id: moveTerritoryId,
            keep_dealers_with_territory: 1,
          },
          "ย้ายเขตไม่สำเร็จ"
        );
        showNotification("success", "ย้ายเขตสำเร็จ", res.data?.message || "");
      }

      if (action === "role") {
        if (!personId) throw new Error("เลือกรายชื่อ");
        if (!newRoleId) throw new Error("เลือกตำแหน่ง");
        const payload = {
          user_id: personId,
          new_role_id: newRoleId,
        };
        if (Number(newRoleId) === SALES_ROLE_ID) {
          if (!context.areaId || !context.territoryId) {
            throw new Error("ไม่พบ Area หรือ Territory ปัจจุบัน");
          }
          payload.target_area_id = context.areaId;
          payload.target_territory_id = context.territoryId;
        }
        if (TEAM_ROLE_IDS.includes(Number(newRoleId))) {
          const parentId =
            String(personId) === String(context.userId)
              ? parentSaleId
              : context.userId || parentSaleId;
          if (!parentId || String(parentId) === String(personId)) {
            throw new Error("เลือก Sales หัวเขต");
          }
          payload.parent_sale_id = parentId;
        }
        const res = await postAction(
          paths.pathTerritoryTransferChangeRole,
          payload,
          "ปรับตำแหน่งไม่สำเร็จ"
        );
        showNotification("success", "ปรับตำแหน่งสำเร็จ", res.data?.message || "");
      }

      if (action === "move-area") {
        if (!targetAreaId) throw new Error("เลือก Area");
        if (!targetTerritoryId) throw new Error("เลือก Territory");
        const roleChanged =
          targetRoleId && String(targetRoleId) !== String(context.roleId || "");

        if (!roleChanged) {
          const res = await postAction(
            paths.pathTerritoryTransferMove,
            {
              user_id: context.userId,
              target_area_id: targetAreaId,
              target_territory_id: targetTerritoryId,
              keep_dealers_with_territory: 1,
            },
            "ย้ายเขตไม่สำเร็จ"
          );
          showNotification("success", "ย้ายเขตสำเร็จ", res.data?.message || "");
        } else if (Number(targetRoleId) === SALES_ROLE_ID) {
          const res = await postAction(
            paths.pathTerritoryTransferChangeRole,
            {
              user_id: context.userId,
              new_role_id: targetRoleId,
              target_area_id: targetAreaId,
              target_territory_id: targetTerritoryId,
            },
            "ย้ายเขตไม่สำเร็จ"
          );
          showNotification("success", "ย้ายเขตสำเร็จ", res.data?.message || "");
        } else {
          if (!parentSaleId) throw new Error("เลือก Sales หัวเขต");
          await postAction(
            paths.pathTerritoryTransferMove,
            {
              user_id: context.userId,
              target_area_id: targetAreaId,
              target_territory_id: targetTerritoryId,
              keep_dealers_with_territory: 1,
            },
            "ย้ายเขตไม่สำเร็จ"
          );
          const res = await postAction(
            paths.pathTerritoryTransferChangeRole,
            {
              user_id: context.userId,
              new_role_id: targetRoleId,
              parent_sale_id: parentSaleId,
            },
            "ปรับตำแหน่งไม่สำเร็จ"
          );
          showNotification("success", "ย้ายเขตสำเร็จ", res.data?.message || "");
        }
      }

      onClose?.();
      onSuccess?.();
    } catch (error) {
      if (error?.message && !error?.response) {
        showNotification("error", "ไม่สำเร็จ", error.message);
      } else {
        notifyError(error, "บันทึกไม่สำเร็จ");
      }
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
                {record?.position || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Territory</div>
              <div className="font-medium text-gray-800">
                {record?.territory || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-h-[240px] grid-cols-1 rounded border border-gray-200 md:grid-cols-[220px_1fr]">
          <div className="border-b border-gray-200 p-4 md:border-b-0 md:border-r">
            <Radio.Group
              className="flex flex-col gap-3"
              value={action}
              onChange={(event) => setAction(event.target.value)}
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
                  placeholder="เลือกผู้รับช่วง"
                  value={replacementId}
                  options={replacementOptions}
                  onChange={setReplacementId}
                />
                <p className="mt-2 text-xs text-gray-400">
                  ไม่เลือกผู้รับช่วง ร้านในเขตจะไปที่ Sales Pending
                </p>
              </div>
            )}

            {action === "move" && (
              <div>
                <label className="mb-1 block text-sm text-gray-600">Territory</label>
                <Select
                  {...selectProps}
                  placeholder="เลือก Territory"
                  value={moveTerritoryId}
                  options={sameAreaTerritories.map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  onChange={setMoveTerritoryId}
                />
              </div>
            )}

            {action === "role" && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">รายชื่อ</label>
                  <Select
                    {...selectProps}
                    placeholder="รายชื่อที่ขาย และ รายชื่อใน Territory"
                    value={personId}
                    options={people.map((person) => ({
                      value: person.id,
                      label: personLabel(person),
                    }))}
                    onChange={(value) => {
                      setPersonId(value);
                      setNewRoleId(undefined);
                      setParentSaleId(undefined);
                    }}
                  />
                  {selectedPerson && (
                    <p className="mt-1 text-xs text-gray-400">
                      ตำแหน่งปัจจุบัน: {selectedPerson.position || "-"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600">ตำแหน่ง</label>
                  <Select
                    {...selectProps}
                    placeholder="เลือกตำแหน่ง"
                    value={newRoleId}
                    disabled={!personId}
                    options={(roleOptions.length ? roleOptions : roles).map((role) => ({
                      value: role.id,
                      label: role.name,
                    }))}
                    onChange={(value) => {
                      setNewRoleId(value);
                      setParentSaleId(undefined);
                    }}
                  />
                </div>
                {needsParent && (
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      สังกัด Sales
                    </label>
                    <Select
                      {...selectProps}
                      placeholder="เลือก Sales หัวเขต"
                      value={parentSaleId}
                      options={parentOptions}
                      onChange={setParentSaleId}
                    />
                  </div>
                )}
              </div>
            )}

            {action === "move-area" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">Area</label>
                    <Select
                      {...selectProps}
                      placeholder="Area"
                      value={targetAreaId}
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
                    <label className="mb-1 block text-sm text-gray-600">
                      Territory
                    </label>
                    <Select
                      {...selectProps}
                      placeholder="Territory"
                      value={targetTerritoryId}
                      disabled={!targetAreaId}
                      options={crossAreaTerritories.map((item) => ({
                        value: item.id,
                        label: item.name,
                      }))}
                      onChange={setTargetTerritoryId}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      Position
                    </label>
                    <Select
                      {...selectProps}
                      allowClear
                      placeholder="Position"
                      value={targetRoleId}
                      options={roles.map((role) => ({
                        value: role.id,
                        label: role.name,
                      }))}
                      onChange={(value) => {
                        setTargetRoleId(value);
                        setParentSaleId(undefined);
                      }}
                    />
                  </div>
                </div>
                {crossNeedsParent && (
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      สังกัด Sales
                    </label>
                    <Select
                      {...selectProps}
                      placeholder="เลือก Sales หัวเขต"
                      value={parentSaleId}
                      options={parentOptions}
                      onChange={setParentSaleId}
                    />
                  </div>
                )}
              </div>
            )}

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
                disabled={saving || optionsLoading}
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
