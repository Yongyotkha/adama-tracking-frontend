import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Button, Col, Form, Input, Modal, Row, Select, Tag } from "antd";
import { DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import AddDealerModal from "./AddDealerModal";
import {
  apiError,
  asList,
  firstText,
  isActive,
  isSuccess,
  mapDealer,
  toId,
  toNumberId,
} from "./territoryShared";

// One page for /create, /edit and /view (read-only).
export default function TerritoryForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg } = useContext(AuthContext);
  const [form] = Form.useForm();

  const isEdit = location.pathname.endsWith("/edit");
  const isView = location.pathname.endsWith("/view");
  const territoryId = location.state?.id ?? location.state?.record?.id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [areas, setAreas] = useState([]);
  const [currentArea, setCurrentArea] = useState(null);
  const [detail, setDetail] = useState(null);
  // Dealers already saved on this territory (from the backend).
  const [savedDealers, setSavedDealers] = useState([]);
  // Dealers added in this session, not yet saved.
  const [newDealers, setNewDealers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    useServiceAPI
      .get(paths.pathMasterAreas, {})
      .then((res) => setAreas(asList(res?.data ?? res)))
      .catch(() => setAreas([]));
  }, []);

  const loadDetail = useCallback(async () => {
    if (!territoryId) return;
    setLoading(true);
    try {
      // detail already returns the territory's dealers, so territory/dealers isn't needed here.
      const detailRes = await useServiceAPI.get(paths.pathTerritoryDetail, { id: territoryId });
      const data = detailRes?.data && !Array.isArray(detailRes.data) ? detailRes.data : {};
      setDetail(data);
      form.setFieldsValue({
        name: firstText(data, ["name", "territory_name"]),
        area_id: toId(data.area_id),
        description: data.description || "",
      });
      const areaName = firstText(data, ["area_name", "sale_area_name"]);
      if (data.area_id != null && areaName) {
        setCurrentArea({ value: toId(data.area_id), label: areaName });
      }
      setSavedDealers(asList(data.dealers).map(mapDealer));
      setNewDealers([]);
    } catch (error) {
      showMsg("error", apiError(error, "โหลดข้อมูล Territory ไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  }, [form, showMsg, territoryId]);

  useEffect(() => {
    if (isEdit || isView) loadDetail();
  }, [isEdit, isView, loadDetail]);

  const areaOptions = useMemo(() => {
    const options = areas
      .map((area) => ({
        value: toId(area.id ?? area.area_id),
        label: firstText(area, ["name", "area_name", "sale_area_name"]),
      }))
      .filter((area) => area.value != null && area.label);
    if (currentArea && !options.some((option) => option.value === currentArea.value)) {
      options.unshift(currentArea);
    }
    return options;
  }, [areas, currentArea]);

  const allDealers = useMemo(
    () => [...savedDealers, ...newDealers.map((d) => ({ ...d, isNew: true }))],
    [savedDealers, newDealers]
  );

  const filteredDealers = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return allDealers;
    return allDealers.filter((d) =>
      [d.dealer_name, d.address].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [allDealers, keyword]);

  // Dealers being moved from another territory -> need confirm_transfer.
  const transferDealers = useMemo(
    () =>
      newDealers.filter(
        (d) => d.current_territory_id != null && String(d.current_territory_id) !== String(territoryId)
      ),
    [newDealers, territoryId]
  );

  const handleAddDealers = (rows) => {
    const existing = new Set(allDealers.map((d) => d.key));
    setNewDealers((prev) => [...prev, ...rows.filter((r) => !existing.has(r.key))]);
    setModalOpen(false);
  };

  const removeDealer = (record) => {
    if (record.isNew) {
      setNewDealers((prev) => prev.filter((d) => d.key !== record.key));
      return;
    }
    Modal.confirm({
      title: "Remove dealer from territory?",
      content: `${record.dealer_name} will be removed from this territory.`,
      okText: "Remove",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          const response = await useServiceAPI.put(paths.pathTerritoryRemoveDealer, {
            id: toNumberId(territoryId),
            dealer_id: record.dealer_id,
          });
          if (!isSuccess(response)) {
            showMsg("error", response?.message || "ถอด Dealer ไม่สำเร็จ");
            return;
          }
          showMsg("success", response?.message || "ถอด Dealer สำเร็จ");
          setSavedDealers((prev) => prev.filter((d) => d.key !== record.key));
        } catch (error) {
          showMsg("error", apiError(error, "ถอด Dealer ไม่สำเร็จ"));
        }
      },
    });
  };

  const submit = async (values, confirmTransfer) => {
    const payload = {
      name: values.name.trim(),
      area_id: toNumberId(values.area_id),
      description: values.description || "",
      dealer_ids: (isEdit ? newDealers : allDealers).map((d) => d.dealer_id),
    };
    if (isEdit) payload.confirm_transfer = confirmTransfer;
    if (isEdit) payload.id = toNumberId(territoryId);

    setSaving(true);
    try {
      const response = isEdit
        ? await useServiceAPI.put(paths.pathTerritoryUpdate, payload)
        : await useServiceAPI.post(paths.pathTerritoryCreate, payload);
      if (!isSuccess(response)) {
        showMsg("error", response?.message || "บันทึกไม่สำเร็จ");
        return;
      }
      showMsg("success", response?.message || "บันทึกสำเร็จ");
      if (isEdit) {
        await loadDetail();
      } else {
        navigate("/setting/territory");
      }
    } catch (error) {
      showMsg("error", apiError(error, "บันทึกไม่สำเร็จ"));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    // Create: backend already filters available dealers, so save directly.
    if (!isEdit || !transferDealers.length) {
      submit(values, false);
      return;
    }
    Modal.confirm({
      title: "Confirm dealer transfer",
      width: 560,
      centered: true,
      okText: "Confirm & Save",
      cancelText: "Cancel",
      content: (
        <div>
          <p className="mb-2">These dealers already belong to another territory and will be moved:</p>
          <ul className="list-disc pl-5">
            {transferDealers.map((d) => (
              <li key={d.key}>
                {d.dealer_name} <span className="text-gray-500">(from {d.current_territory_name || "-"})</span>
              </li>
            ))}
          </ul>
        </div>
      ),
      onOk: () => submit(values, true),
    });
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 70, align: "center" },
    {
      title: "Dealer Name (EN)",
      dataIndex: "dealer_name",
      key: "dealer_name",
      width: 260,
      render: (value, record) => (
        <span>
          {value}
          {record.isNew && <Tag color="green" className="ml-2">New</Tag>}
        </span>
      ),
    },
    { title: "Address", dataIndex: "address", key: "address" },
  ];
  if (!isView) {
    header.push({
      title: "Action",
      key: "action",
      width: 90,
      align: "center",
      render: (_, record) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeDealer(record)} />
      ),
    });
  }

  const title = isView ? "View Territory" : isEdit ? "Edit Territory" : "Create Territory";

  return (
    <MainLayout loading={loading || saving}>
      <div className="title-page">{title}</div>

      <BoxPrimary>
        <Form form={form} layout="vertical" disabled={isView}>
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Territory Name"
                name="name"
                rules={[{ required: true, whitespace: true, message: "Please enter territory name" }]}
              >
                <Input placeholder="Territory name" maxLength={255} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Area"
                name="area_id"
                rules={[{ required: true, message: "Please select area" }]}
              >
                <Select
                  disabled={isEdit}
                  allowClear={!isEdit}
                  showSearch
                  optionFilterProp="label"
                  options={areaOptions}
                  placeholder="Select area"
                />
              </Form.Item>
            </Col>
            {isView && (
              <Col xs={24} md={8}>
                <Form.Item label="Status">
                  <BadgeStatus
                    text={isActive(detail) ? "Active" : "Inactive"}
                    bgColor={isActive(detail) ? "#00783F" : "#978B87"}
                    textColor="#FFFFFF"
                  />
                </Form.Item>
              </Col>
            )}
            <Col xs={24}>
              <Form.Item label="Description" name="description">
                <Input.TextArea rows={3} placeholder="Description" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BoxPrimary>

      <BoxPrimary>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-semibold text-[#00783F]">Dealer ({allDealers.length})</div>
          <div className="flex flex-wrap gap-3">
            <Input
              allowClear
              value={keyword}
              placeholder="Search dealer name / address"
              prefix={<SearchOutlined className="text-[#978B87]" />}
              onChange={(event) => {
                setKeyword(event.target.value);
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              className="w-full sm:w-[300px]"
            />
            {!isView && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                Add Dealer
              </Button>
            )}
          </div>
        </div>

        <TableComponent
          header={header}
          dataSource={filteredDealers}
          pagination={{
            ...pagination,
            total: filteredDealers.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={(next) => setPagination({ current: next.current, pageSize: next.pageSize })}
        />
      </BoxPrimary>

      <div className="mt-4 flex justify-end gap-3">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/setting/territory")} />
        {!isView && <ActionButton mode="save" text="Save" disabled={saving} onClick={handleSave} />}
      </div>

      {!isView && (
        <AddDealerModal
          open={modalOpen}
          territoryId={isEdit ? territoryId : undefined}
          excludeIds={allDealers.map((d) => d.key)}
          onCancel={() => setModalOpen(false)}
          onConfirm={handleAddDealers}
        />
      )}
    </MainLayout>
  );
}
