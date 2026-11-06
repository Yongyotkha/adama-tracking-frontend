import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Col, Input, Row, Select } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../components/table/TableComponent";
import ActionButton from "../../../components/button/ActionButton";
import BadgeStatus from "../../../components/badge/BadgeStatus";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  apiError,
  asList,
  isSuccess,
  loadFarmerPlanMasters,
  loadPlanProduct,
  mapDetailLine,
  money,
  num,
  pointText,
  searchPlanProducts,
  text,
} from "./farmerSalesPlanMaster";

const LIST_PATH = "/sale-plan/farmer-sales-plan";
const yearSelectClass =
  "min-w-[140px] [&_.ant-select-selector]:border-[#00783F] [&_.ant-select-selection-item]:font-semibold [&_.ant-select-selection-item]:text-[#00783F]";

const mappingKey = (item) => `${item.dealer_id ?? ""}|${item.sub_dealer_id ?? ""}`;

// One page for create / edit / view, chosen by the route's last segment.
export default function FarmerSalesPlanCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showMsg } = useContext(AuthContext);
  const state = location.state || {};
  const row = state.row || {};
  const mode = location.pathname.split("/").pop();
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const farmerId = state.farmer_id ?? row.farmer_id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [years, setYears] = useState([]);
  const [crops, setCrops] = useState([]);
  const [year, setYear] = useState(state.year_code ?? row.year_code ?? new Date().getFullYear());
  const [farmerName, setFarmerName] = useState(text(row.farmer_name));
  const [mappings, setMappings] = useState([]);
  const [mappingValue, setMappingValue] = useState();
  const [cropId, setCropId] = useState();
  const [remark, setRemark] = useState("");
  const [lines, setLines] = useState([]);
  const [planInfo, setPlanInfo] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const productSearchRef = useRef(0);

  useEffect(() => {
    if (!farmerId) navigate(LIST_PATH, { replace: true });
  }, [farmerId, navigate]);

  useEffect(() => {
    if (!farmerId) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [master, mappingRes, detailRes] = await Promise.all([
          loadFarmerPlanMasters({ includeCrops: true }),
          useServiceAPI
            .get(paths.pathFarmerSalesPlanMappings, { farmer_id: farmerId, year_code: year })
            .catch(() => null),
          isEdit || isView
            ? useServiceAPI.get(paths.pathFarmerSalesPlanDetail, {
                plan_id: state.plan_id ?? row.plan_id,
                farmer_id: farmerId,
                year_code: year,
              })
            : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setYears(master.years);
        setCrops(master.crops);

        const mapList = asList(mappingRes?.data ?? mappingRes);
        setMappings(mapList);

        const detail =
          detailRes?.data && !Array.isArray(detailRes.data) ? detailRes.data : null;
        if (detail) {
          setPlanInfo(detail);
          setFarmerName(text(detail.farmer_name) || text(row.farmer_name));
          if (detail.year_code) setYear(detail.year_code);
          setCropId(detail.crop_id ?? undefined);
          setRemark(detail.remark || "");
          setLines(asList(detail.products ?? detail.items ?? detail.details).map(mapDetailLine));
          if (detail.dealer_id != null || detail.sub_dealer_id != null) {
            setMappingValue(mappingKey(detail));
            if (!mapList.some((m) => mappingKey(m) === mappingKey(detail))) {
              setMappings([detail, ...mapList]);
            }
          }
        } else if (mapList.length === 1) {
          setMappingValue(mappingKey(mapList[0]));
        } else if (row.dealer_id != null || row.sub_dealer_id != null) {
          setMappingValue(mappingKey(row));
          if (!mapList.length) setMappings([row]);
        }
      } catch (error) {
        if (!cancelled) showMsg("error", apiError(error, "โหลดข้อมูล Sales Plan ไม่สำเร็จ"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // Load once per farmer/mode; year change in create doesn't reload detail.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerId, mode]);

  const mappingOptions = useMemo(
    () =>
      mappings.map((item) => {
        const dealer = text(item.dealer_name);
        const sub = text(item.sub_dealer_name);
        return {
          value: mappingKey(item),
          label: [dealer, sub].filter(Boolean).join(" / ") || "-",
        };
      }),
    [mappings]
  );

  const yearOptions = useMemo(
    () =>
      years.some((item) => String(item.value) === String(year))
        ? years
        : [{ value: year, label: `Year ${year}` }, ...years],
    [year, years]
  );

  const cropOptions = useMemo(() => {
    const options = crops.map((item) => ({ value: item.id, label: item.name }));
    if (cropId != null && !options.some((o) => String(o.value) === String(cropId)) && planInfo?.crop_name) {
      options.unshift({ value: cropId, label: planInfo.crop_name });
    }
    return options;
  }, [crops, cropId, planInfo]);

  const onSearchProduct = (value) => {
    const requestId = productSearchRef.current + 1;
    productSearchRef.current = requestId;
    const keyword = String(value || "").trim();
    if (keyword.length < 3) {
      setProductOptions([]);
      return;
    }
    searchPlanProducts(keyword)
      .then((options) => requestId === productSearchRef.current && setProductOptions(options))
      .catch(() => requestId === productSearchRef.current && setProductOptions([]));
  };

  const addProduct = async (productId) => {
    if (lines.some((line) => String(line.id) === String(productId))) {
      showMsg("warning", "สินค้านี้มีอยู่ในรายการแล้ว");
      return;
    }
    setLoading(true);
    try {
      const product = await loadPlanProduct(productId);
      setLines((prev) => [...prev, product]);
      setDirty(true);
      setProductOptions([]);
    } catch (error) {
      showMsg("error", apiError(error, "โหลดสินค้าไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  };

  const changeQty = (id, qty) => {
    const next = Math.max(1, Number(qty) || 1);
    setLines((prev) =>
      prev.map((line) =>
        line.id === id ? { ...line, qty: next, backendAmount: null, backendPoint: null } : line
      )
    );
    setDirty(true);
  };

  const removeLine = (id) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
    setDirty(true);
  };

  const lineAmount = (line) => line.backendAmount ?? line.price * line.qty;
  const linePoint = (line) => line.backendPoint ?? line.pointPerUnit * line.qty;

  // Backend totals win until the user changes something (spec rule 8).
  const totalAmount =
    !dirty && planInfo?.total_amount != null
      ? num(planInfo.total_amount)
      : lines.reduce((sum, line) => sum + lineAmount(line), 0);
  const totalPoint =
    !dirty && planInfo?.total_point != null
      ? num(planInfo.total_point)
      : lines.reduce((sum, line) => sum + linePoint(line), 0);

  const save = async (saveMode) => {
    if (saveMode === "save" && !lines.length) {
      showMsg("warning", "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ");
      return;
    }
    const mapping = mappings.find((item) => mappingKey(item) === mappingValue);
    if (mappings.length > 1 && !mapping) {
      showMsg("warning", "กรุณาเลือก Dealer / Sub Dealer");
      return;
    }
    const payload = {
      mode: saveMode,
      farmer_id: farmerId,
      year_code: year,
      dealer_id: mapping?.dealer_id ?? null,
      sub_dealer_id: mapping?.sub_dealer_id ?? null,
      crop_id: cropId ?? null,
      remark,
      products: lines.map((line) => ({ product_id: line.id, quantity: line.qty })),
    };
    const planId = planInfo?.plan_id ?? planInfo?.id ?? state.plan_id ?? row.plan_id;
    if (planId) payload.plan_id = planId;

    setSaving(true);
    try {
      const response = await useServiceAPI.post(paths.pathFarmerSalesPlanSave, payload);
      if (!isSuccess(response)) {
        showMsg("error", response?.message || "บันทึกไม่สำเร็จ");
        return;
      }
      showMsg("success", response?.message || "บันทึกสำเร็จ");
      navigate(LIST_PATH);
    } catch (error) {
      showMsg("error", apiError(error, "บันทึกไม่สำเร็จ"));
    } finally {
      setSaving(false);
    }
  };

  const header = [
    { title: "No", dataIndex: "no", key: "no", width: 70, align: "center" },
    { title: "SKU", dataIndex: "sku", key: "sku", width: 150 },
    { title: "Product Name", dataIndex: "name", key: "name" },
    { title: "Unit", dataIndex: "unit", key: "unit", width: 120 },
    {
      title: "THB/Unit",
      dataIndex: "price",
      key: "price",
      align: "right",
      width: 120,
      render: (value) => money(value),
    },
    {
      title: "QTY",
      dataIndex: "qty",
      key: "qty",
      width: 160,
      align: "center",
      render: (_, record) =>
        isView ? (
          record.qty
        ) : (
          <div className="flex items-center justify-center">
            <img
              src="/img/icons/collapse.png"
              alt="decrease"
              className="h-6 w-6 cursor-pointer"
              onClick={() => changeQty(record.id, record.qty - 1)}
            />
            <input
              inputMode="numeric"
              value={record.qty}
              onChange={(event) => changeQty(record.id, event.target.value)}
              className="mx-2 w-16 rounded border border-solid border-[#00783F] py-1 text-center text-[#00783F]"
            />
            <img
              src="/img/icons/expand.png"
              alt="increase"
              className="h-6 w-6 cursor-pointer"
              onClick={() => changeQty(record.id, record.qty + 1)}
            />
          </div>
        ),
    },
    {
      title: "Sub Total (THB)",
      key: "sub_total",
      align: "right",
      width: 150,
      render: (_, record) => money(lineAmount(record)),
    },
    {
      title: "Point",
      key: "point",
      align: "right",
      width: 90,
      render: (_, record) => pointText(linePoint(record)),
    },
    !isView && {
      title: "Action",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) => (
        <button onClick={() => removeLine(record.id)}>
          <img src="/img/icons/delete.png" alt="delete" className="inline-block h-6 w-6" />
        </button>
      ),
    },
  ].filter(Boolean);

  const title = isView ? "View Sales Plan" : isEdit ? "Edit Sales Plan" : "Create Sales Plan";
  const docNo = text(planInfo?.document_no ?? planInfo?.document_number ?? row.document_no);

  return (
    <MainLayout loading={loading || saving}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="title-page">{title}</div>
          {planInfo?.status_label && (
            <BadgeStatus
              text={planInfo.status_label}
              bgColor={planInfo.status_bg_color || "#978B87"}
              textColor={planInfo.status_color || "#FFFFFF"}
            />
          )}
        </div>
        <Select
          value={year}
          disabled={mode !== "create"}
          onChange={setYear}
          options={yearOptions}
          className={yearSelectClass}
        />
      </div>

      <BoxPrimary>
        <Row gutter={24}>
          <Col xs={24} md={6} className="mb-3">
            <label className="mb-1 block text-gray-700">Farmer</label>
            <Input value={farmerName || "-"} disabled />
          </Col>
          <Col xs={24} md={6} className="mb-3">
            <label className="mb-1 block text-gray-700">Dealer / Sub Dealer</label>
            <Select
              className="w-full"
              disabled={isView || mappingOptions.length <= 1}
              value={mappingValue}
              placeholder={mappingOptions.length ? "Select dealer / sub dealer" : "-"}
              options={mappingOptions}
              onChange={setMappingValue}
            />
          </Col>
          <Col xs={24} md={6} className="mb-3">
            <label className="mb-1 block text-gray-700">Crop</label>
            <Select
              className="w-full"
              disabled={isView}
              allowClear
              showSearch
              optionFilterProp="label"
              value={cropId}
              placeholder="Select crop"
              options={cropOptions}
              onChange={setCropId}
            />
          </Col>
          {docNo && (
            <Col xs={24} md={6} className="mb-3">
              <label className="mb-1 block text-gray-700">Document Number</label>
              <Input value={docNo} disabled />
            </Col>
          )}
          <Col xs={24}>
            <label className="mb-1 block text-gray-700">Remark</label>
            <Input.TextArea
              rows={2}
              disabled={isView}
              value={remark}
              placeholder="Remark"
              onChange={(event) => setRemark(event.target.value)}
            />
          </Col>
        </Row>
      </BoxPrimary>

      <BoxPrimary>
        <div className="mb-3 text-lg font-semibold text-[#00783F]">Products</div>
        {!isView && (
          <Select
            showSearch
            filterOption={false}
            value={null}
            placeholder="Search Product (at least 3 characters)"
            options={productOptions}
            onSearch={onSearchProduct}
            onChange={addProduct}
            className="mb-4 w-full"
          />
        )}
        <TableComponent
          header={header}
          dataSource={lines}
          rowKey="id"
          pagination={false}
          footer={() => (
            <tr>
              <td colSpan={header.length} className="pr-4 text-right text-white">
                Item: {lines.length}&nbsp;&nbsp;Total: {money(totalAmount)}&nbsp;&nbsp;Point:{" "}
                {pointText(totalPoint)}
              </td>
            </tr>
          )}
        />
      </BoxPrimary>

      <div className="mt-4 flex justify-end gap-3">
        <ActionButton mode="back" text="Back" onClick={() => navigate(LIST_PATH)} />
        {!isView && (
          <>
            <ActionButton mode="saveDraft" text="Save Draft" disabled={saving} onClick={() => save("draft")} />
            <ActionButton mode="save" text="Save" disabled={saving} onClick={() => save("save")} />
          </>
        )}
      </div>
    </MainLayout>
  );
}
