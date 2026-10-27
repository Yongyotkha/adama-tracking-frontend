import { useContext, useEffect, useMemo, useState } from "react";
import { Col, Form, Input, Row, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import ActionButton from "../../../components/button/ActionButton";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";

const asList = (body) => {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.data?.data)) return body.data.data;
  return [];
};

const firstText = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value != null && String(value).trim() !== "") return String(value);
  }
  return "";
};

const dealerIdsOf = (detail) => {
  if (!detail) return [];
  if (Array.isArray(detail.dealer_ids)) return detail.dealer_ids.filter((id) => id != null);
  if (!Array.isArray(detail.dealers)) return [];
  return detail.dealers.map((item) => item.id ?? item.dealer_id).filter((id) => id != null);
};

export default function TerritoryForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg } = useContext(AuthContext);
  const [form] = Form.useForm();
  const isEdit = location.pathname.endsWith("/edit");
  const record = location.state?.record;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [areas, setAreas] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [areaSaleIds, setAreaSaleIds] = useState([]);
  const [dealerLoading, setDealerLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50", "100"],
    },
  });

  const areaId = Form.useWatch("area_id", form);

  useEffect(() => {
    const loadMaster = async () => {
      setLoading(true);
      try {
        const [areaRes, optionRes, dealerRes] = await Promise.all([
          useServiceAPI.get(paths.pathMasterAreas, {}).catch(() => null),
          useServiceAPI.get(paths.pathTerritoryTransferOptions, {}).catch(() => null),
          useServiceAPI
            .get(paths.pathCustomerDealer, { page_length: 1, page_size: 500, use_flag: "" })
            .catch(() => null),
        ]);

        if (!areaRes && !optionRes) {
          showMsg("error", "โหลดข้อมูล Territory ไม่สำเร็จ");
        }

        const masterAreas = asList(areaRes?.data ?? areaRes);
        const optionAreas = Array.isArray(optionRes?.data?.areas) ? optionRes.data.areas : [];
        setAreas(masterAreas.length ? masterAreas : optionAreas);
        setDealers(asList(dealerRes?.data ?? dealerRes));
      } catch (error) {
        showMsg("error", error?.message || "โหลดข้อมูล Territory ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    loadMaster();
  }, [showMsg]);

  useEffect(() => {
    if (!isEdit || !record?.id) return;

    const province = record.province === "-" ? "" : record.province;
    const name = record.territoryName === "-" ? "" : record.territoryName;
    form.setFieldsValue({
      territory_name: name || "",
      province: province || "",
      area_id: record.areaId ?? undefined,
    });

    const presetIds = []
      .concat(record.dealerIds || [], record.raw?.dealer_ids || [])
      .filter((id) => id != null);
    if (presetIds.length) setSelectedRowKeys(presetIds);

    const loadDetail = async () => {
      try {
        const detailRes = await useServiceAPI.get(paths.pathTerritoryDetail, { id: record.id });
        const detail = detailRes?.data && !Array.isArray(detailRes.data) ? detailRes.data : null;
        if (!detail) return;
        form.setFieldsValue({
          territory_name: detail.name || detail.territory_name || name || "",
          province: detail.province || detail.province_name || province || "",
          area_id: detail.area_id ?? record.areaId ?? undefined,
        });
        setSelectedRowKeys(dealerIdsOf(detail));
      } catch {
        // Detail API is optional until the backend ships it.
      }
    };

    loadDetail();
  }, [form, isEdit, record]);

  useEffect(() => {
    if (!areaId) {
      setAreaSaleIds([]);
      return;
    }

    let cancelled = false;
    const loadAreaSales = async () => {
      setDealerLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathMasterUserByArea, { area_id: areaId });
        if (!cancelled) {
          setAreaSaleIds(
            asList(response?.data ?? response)
              .map((sale) => sale.id ?? sale.user_id)
              .filter((id) => id != null)
          );
        }
      } catch (error) {
        if (!cancelled) {
          setAreaSaleIds([]);
          showMsg("error", error?.message || "โหลด Dealer ไม่สำเร็จ");
        }
      } finally {
        if (!cancelled) setDealerLoading(false);
      }
    };

    loadAreaSales();
    return () => {
      cancelled = true;
    };
  }, [areaId, showMsg]);

  const areaOptions = useMemo(
    () =>
      areas
        .map((area) => ({
          value: area.id ?? area.area_id,
          label: firstText(area, ["name", "area_name", "sale_area_name"]),
        }))
        .filter((area) => area.value != null && area.label),
    [areas]
  );

  const dealerRows = useMemo(() => {
    if (!areaId) return [];
    const saleIds = new Set(areaSaleIds.map(String));
    const query = keyword.trim().toLowerCase();

    return dealers
      .filter((item) => {
        const saleId = item.sale_id ?? item.user_id;
        if (saleId == null || !saleIds.has(String(saleId))) return false;
        if (!query) return true;
        const address = firstText(item, ["address", "contact_address"]).toLowerCase();
        return address.includes(query);
      })
      .map((item, index) => ({
        key: item.id ?? item.dealer_id ?? index,
        id: item.id ?? item.dealer_id ?? index,
        dealer: firstText(item, ["dealer_name_en", "dealer_name_th", "dealer_name", "name"]) || "-",
        address: firstText(item, ["address", "contact_address"]) || "-",
      }));
  }, [areaId, areaSaleIds, dealers, keyword]);

  const pageCurrent = tableParams.pagination.current || 1;
  const pageSize = tableParams.pagination.pageSize || 10;

  const pagedDealerRows = useMemo(() => {
    const start = (pageCurrent - 1) * pageSize;
    return dealerRows.slice(start, start + pageSize);
  }, [dealerRows, pageCurrent, pageSize]);

  useEffect(() => {
    setTableParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1, total: dealerRows.length },
    }));
  }, [dealerRows.length]);

  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedRowKeys.length) {
        showMsg("warning", "กรุณาเลือก Dealer");
        return;
      }

      const payload = {
        name: values.territory_name,
        province: values.province || "",
        area_id: values.area_id,
        dealer_ids: selectedRowKeys,
      };
      if (isEdit) payload.id = record?.id;

      setSaving(true);
      const response = await useServiceAPI.post(
        isEdit ? paths.pathTerritoryUpdate : paths.pathTerritoryCreate,
        payload
      );
      if (response?.status === 200 || response?.status === 201) {
        showMsg("success", response?.message || "บันทึกสำเร็จ");
        navigate("/setting/territory");
        return;
      }
      showMsg("error", response?.message || "บันทึกไม่สำเร็จ");
    } catch (error) {
      if (error?.errorFields) return;
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data?.message ||
        error?.message ||
        "บันทึกไม่สำเร็จ";
      showMsg("error", message);
    } finally {
      setSaving(false);
    }
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 80, align: "center" },
    { title: "Dealer", dataIndex: "dealer", key: "dealer", width: 280 },
    { title: "Address", dataIndex: "address", key: "address" },
  ];

  return (
    <MainLayout loading={loading || saving}>
      <div className="title-page">{isEdit ? "Edit Territory" : "Create Territory"}</div>

      <BoxPrimary>
        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Territory Name"
                name="territory_name"
                rules={[{ required: true, whitespace: true, message: "Please enter territory name" }]}
              >
                <Input placeholder="Territory name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Province" name="province">
                <Input placeholder="Province" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Area"
                name="area_id"
                rules={[{ required: true, message: "Please select area" }]}
              >
                <Select
                  allowClear
                  showSearch
                  className="w-full"
                  optionFilterProp="label"
                  options={areaOptions}
                  placeholder="Select area"
                  onChange={(value) => {
                    form.setFieldValue("area_id", value);
                    setKeyword("");
                    setSelectedRowKeys([]);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BoxPrimary>

      <BoxPrimary>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-semibold text-[#00783F]">
            Dealer ({selectedRowKeys.length})
          </div>
          <Input
            allowClear
            value={keyword}
            placeholder={areaId ? "Search address" : "Select area first"}
            prefix={<SearchOutlined className="text-[#978B87]" />}
            onChange={(event) => setKeyword(event.target.value)}
            disabled={!areaId}
            className="w-full sm:w-[280px]"
          />
        </div>

        <TableComponent
          header={header}
          dataSource={pagedDealerRows}
          rowSelection={rowSelection}
          loading={dealerLoading}
          pagination={{
            ...tableParams.pagination,
            current: pageCurrent,
            pageSize,
            total: dealerRows.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={(pagination) => {
            const nextSize = Number(pagination?.pageSize) || 10;
            const maxPage = Math.max(1, Math.ceil(dealerRows.length / nextSize) || 1);
            const nextCurrent = Math.min(Number(pagination?.current) || 1, maxPage);
            setTableParams((prev) => ({
              ...prev,
              pagination: {
                ...prev.pagination,
                current: nextCurrent,
                pageSize: nextSize,
                total: dealerRows.length,
              },
            }));
          }}
        />
      </BoxPrimary>

      <div className="mt-4 flex justify-end gap-3">
        <ActionButton mode="back" text="Back" onClick={() => navigate("/setting/territory")} />
        <ActionButton mode="save" text="Save" disabled={saving} onClick={handleSave} />
      </div>
    </MainLayout>
  );
}
