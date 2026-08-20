import React, { useContext, useEffect, useMemo, useState } from "react";
import { Checkbox, Form, Input, InputNumber, Modal, Select, Switch, Table, Tabs, message } from "antd";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../components/button/ActionButton";
import { AuthContext } from "../../../contexts/AuthContext";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

const ACTION_LABELS = {
  view: "View",
  save_draft: "Save Draft",
  save: "Save",
};

export default function SettingMenu() {
  const { showNotification } = useContext(AuthContext);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [roleAccess, setRoleAccess] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);

  const isEdit = !!editingId;

  const fetchTree = async (search = keyword) => {
    setLoading(true);
    try {
      const res = await useServiceAPI.get(paths.pathMenuTree, {
        keyword: search || "",
      });
      setTreeData(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      message.error("Unable to load menus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const tableData = useMemo(() => {
    const mapNode = (node) => ({
      ...node,
      key: node.id,
      children: node.children?.length ? node.children.map(mapNode) : undefined,
    });
    return (treeData || []).map(mapNode);
  }, [treeData]);

  const openCreate = async () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ order_by: 1, parent_id: null });
    await loadParents();
    await loadEmptyRoles();
    setModalOpen(true);
  };

    const loadParents = async (excludeId) => {
    const res = await useServiceAPI.get(paths.pathMenuParents, {
      exclude_id: excludeId || "",
    });
    const parents = (Array.isArray(res?.data) ? res.data : []).filter(
      (item) => item.parent_id == null || item.parent_id === "" || item.parent_id === 0
    );
    setParentOptions(parents);
  };

  const loadEmptyRoles = async () => {
    const res = await useServiceAPI.get(paths.pathMasterRoles, {});
    const roles = Array.isArray(res?.data) ? res.data : [];
    setRoleAccess(
      roles.map((role) => ({
        role_id: role.id,
        role_name: role.name,
        use_flag: false,
        actions: { view: false, save_draft: false, save: false },
      }))
    );
  };

  const openEdit = async (id) => {
    setLoading(true);
    try {
      const [detailRes] = await Promise.all([
        useServiceAPI.get(`${paths.pathMenuDetail}/${id}`),
        loadParents(id),
      ]);
      const menu = detailRes?.data?.menu;
      const roles = detailRes?.data?.roles || [];
      if (!menu) {
        message.error("Menu not found");
        return;
      }
      setEditingId(id);
      form.setFieldsValue({
        name: menu.name,
        url: menu.url,
        parent_id: menu.parent_id || null,
        order_by: menu.order_by,
        icon: menu.icon,
      });
      setRoleAccess(roles);
      setModalOpen(true);
    } catch (error) {
      message.error("Unable to load menu detail");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleFlag = (roleId, checked) => {
    setRoleAccess((prev) =>
      prev.map((role) =>
        role.role_id === roleId
          ? {
              ...role,
              use_flag: checked,
              actions: checked
                ? { ...role.actions, view: role.actions.view || true }
                : { view: false, save_draft: false, save: false },
            }
          : role
      )
    );
  };

  const handleActionFlag = (roleId, actionCode, checked) => {
    setRoleAccess((prev) =>
      prev.map((role) =>
        role.role_id === roleId
          ? {
              ...role,
              use_flag: checked ? true : role.use_flag,
              actions: { ...role.actions, [actionCode]: checked },
            }
          : role
      )
    );
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        ...values,
        parent_id: values.parent_id || null,
        roles: roleAccess,
      };

      const res = isEdit
        ? await useServiceAPI.put(paths.pathMenuUpdate, { ...payload, id: editingId })
        : await useServiceAPI.post(paths.pathMenuCreate, payload);

      if (res?.status === 200) {
        showNotification("success", isEdit ? "Updated" : "Created", "Menu has been saved.");
        setModalOpen(false);
        fetchTree();
      } else {
        showNotification("error", "Save failed", res?.data?.message || res?.message);
      }
    } catch (error) {
      if (!error?.errorFields) {
        showNotification("error", "Save failed", error?.message || "Unexpected error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (record) => {
    if (record.children?.length) {
      Modal.warning({
        title: "Cannot delete",
        content: "Please delete sub menus first.",
      });
      return;
    }

    Modal.confirm({
      title: "Delete menu",
      content: `Delete "${record.name}" ? Role access will be removed as well.`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        const res = await useServiceAPI.delete(paths.pathMenuDelete, { id: record.id });
        if (res?.status === 200) {
          showNotification("success", "Deleted", "Menu has been deleted.");
          setModalOpen(false);
          fetchTree();
        } else {
          showNotification("error", "Delete failed", res?.data?.message || res?.message);
        }
      },
    });
  };

  const columns = [
    {
      title: "Menu",
      dataIndex: "name",
      render: (name, record) => (
        <div className="flex items-center gap-2">
          {record.icon ? (
            <img
              src={`/${record.icon}`}
              alt=""
              className="w-5 h-5 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
          <span className="font-medium">{name}</span>
        </div>
      ),
    },
    {
      title: "URL",
      dataIndex: "url",
      width: 280,
      render: (url) => url || <span className="text-gray-400">Parent menu</span>,
    },
    {
      title: "Order",
      dataIndex: "order_by",
      width: 90,
      align: "center",
    },
    {
      title: "Roles",
      dataIndex: "role_count",
      width: 90,
      align: "center",
    },
    {
      title: "Action",
      key: "action",
      width: 240,
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center items-center whitespace-nowrap">
          <ActionButton mode="edit" text="Edit" onClick={() => openEdit(record.id)} />
          <ActionButton
            mode="delete"
            text="Delete"
            className="ml-3"
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Manage Menus</div>

      <BoxPrimary>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Input.Search
            allowClear
            placeholder="Search menu name or URL"
            className="max-w-sm"
            onSearch={(value) => {
              setKeyword(value);
              fetchTree(value);
            }}
          />
          <ActionButton mode="add" text="Add Menu" onClick={openCreate} />
        </div>

        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          expandable={{ defaultExpandAllRows: true }}
          scroll={{ x: 900 }}
        />
      </BoxPrimary>

      <Modal
        title={isEdit ? "Edit Menu" : "Add Menu"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={920}
        footer={
          <div className="flex justify-end gap-2">
            {isEdit && (
              <ActionButton
                mode="delete"
                text="Delete"
                onClick={() =>
                  handleDelete({
                    id: editingId,
                    name: form.getFieldValue("name"),
                    children: [],
                  })
                }
              />
            )}
            <ActionButton mode="back" text="Cancel" onClick={() => setModalOpen(false)} />
            <ActionButton mode="save" text="Save" onClick={handleSave} disabled={saving} />
          </div>
        }
      >
        <Tabs
          items={[
            {
              key: "detail",
              label: "Menu Detail",
              children: (
                <Form layout="vertical" form={form} className="pt-2">
                  <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: "Please enter menu name" }]}
                  >
                    <Input placeholder="Dash Board" />
                  </Form.Item>
                  <Form.Item label="URL" name="url">
                    <Input placeholder="/sale-plan/work-plan or leave empty for parent" />
                  </Form.Item>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item label="Parent Menu" name="parent_id">
                      <Select
                        allowClear
                        placeholder="Top level"
                        options={parentOptions.map((item) => ({
                          value: item.id,
                          label: item.name,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item label="Order" name="order_by">
                      <InputNumber className="w-full" min={0} step={0.1} />
                    </Form.Item>
                  </div>
                  <Form.Item label="Icon" name="icon">
                    <Input placeholder="img/icons/dashboard.png" />
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "roles",
              label: "Role Access",
              children: (
                <div className="pt-2">
                  <p className="text-gray-500 mb-3">
                    Maps to <b>menu_roles.use_flag</b>. Turn on to show this menu for the role.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {roleAccess.map((role) => (
                      <div
                        key={role.role_id}
                        className="flex items-center justify-between border rounded px-3 py-2"
                      >
                        <span>{role.role_name}</span>
                        <Switch
                          checked={!!role.use_flag}
                          onChange={(checked) => handleRoleFlag(role.role_id, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ),
            },
            {
              key: "actions",
              label: "Actions",
              children: (
                <div className="pt-2">
                  <p className="text-gray-500 mb-3">
                    Maps to <b>menu_role_action</b> (`view`, `save_draft`, `save`).
                  </p>
                  <Table
                    pagination={false}
                    size="small"
                    dataSource={roleAccess.map((role) => ({ ...role, key: role.role_id }))}
                    columns={[
                      { title: "Role", dataIndex: "role_name" },
                      {
                        title: "Menu On",
                        dataIndex: "use_flag",
                        width: 90,
                        align: "center",
                        render: (value, record) => (
                          <Switch
                            size="small"
                            checked={!!value}
                            onChange={(checked) => handleRoleFlag(record.role_id, checked)}
                          />
                        ),
                      },
                      ...Object.keys(ACTION_LABELS).map((code) => ({
                        title: ACTION_LABELS[code],
                        dataIndex: ["actions", code],
                        align: "center",
                        render: (_, record) => (
                          <Checkbox
                            disabled={!record.use_flag}
                            checked={!!record.actions?.[code]}
                            onChange={(e) =>
                              handleActionFlag(record.role_id, code, e.target.checked)
                            }
                          />
                        ),
                      })),
                    ]}
                  />
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </MainLayout>
  );
}
