import React, { useEffect, useMemo, useState } from "react";
import { DatePicker, Form, Input, Select } from "antd";
import { DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import {
  createDraftCampaignTemplate,
  draftCampaignDealerOptions,
  draftCampaignFarmerOptions,
  draftCampaignList,
  draftCampaignProductOptions,
  draftCampaignSalesOptions,
  draftCampaignSubDealerOptions,
} from "./mockDraftCampaignData";

const formatNumber = (value, digits = 0) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const buildLine = (baseProduct, qty = 1, xPoint = 1) => ({
  sku: baseProduct.sku,
  productName: baseProduct.productName,
  unit: baseProduct.unit,
  thbPerUnit: baseProduct.thbPerUnit,
  pointPerCtn: baseProduct.pointPerCtn,
  qty,
  xPoint,
  point: qty * xPoint * baseProduct.pointPerCtn,
  subTotal: qty * baseProduct.thbPerUnit,
});

export default function DraftCampaignAction() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useParams();
  const [form] = Form.useForm();
  const [productSelection, setProductSelection] = useState();

  const isView = String(mode).toLowerCase() === "view";
  const isEdit = String(mode).toLowerCase() === "edit";
  const pageTitle = isView
    ? "View Draft Campaign"
    : isEdit
      ? "Edit Draft Campaign"
      : "Create Draft Campaign";

  const selectedCampaign = useMemo(() => {
    const found = draftCampaignList.find(
      (item) => String(item.id) === String(location.state?.id)
    );
    return found || null;
  }, [location.state?.id]);

  const initialData = useMemo(() => {
    if (selectedCampaign) {
      return {
        ...selectedCampaign,
        products: selectedCampaign.products.map((item) => ({ ...item })),
      };
    }
    return createDraftCampaignTemplate();
  }, [selectedCampaign]);

  const [rows, setRows] = useState(initialData.products);

  useEffect(() => {
    setRows(initialData.products);
    form.setFieldsValue({
      sale: initialData.sale,
      dealer: initialData.dealer,
      subDealer: initialData.subDealer,
      farmer: initialData.farmer,
      draftDate: initialData.draftDate ? dayjs(initialData.draftDate) : dayjs(),
      currentPoint: initialData.currentPoint,
      targetPoint: initialData.targetPoint,
      diffFromTarget: initialData.diffFromTarget,
    });
  }, [form, initialData]);

  const recalculate = (line) => ({
    ...line,
    qty: Number(line.qty || 0),
    xPoint: Number(line.xPoint || 0),
    point: Number(line.qty || 0) * Number(line.xPoint || 0) * Number(line.pointPerCtn || 0),
    subTotal: Number(line.qty || 0) * Number(line.thbPerUnit || 0),
  });

  const updateRow = (index, key, value) => {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? recalculate({ ...row, [key]: Math.max(0, Number(value || 0)) }) : row
      )
    );
  };

  const addSelectedProduct = () => {
    const product = draftCampaignProductOptions.find(
      (item) => String(item.id) === String(productSelection)
    );
    if (!product) return;

    setRows((prev) => [...prev, buildLine(product, 1, 1)]);
    setProductSelection(undefined);
  };

  const totals = useMemo(() => {
    return rows.reduce(
      (sum, row) => ({
        qty: sum.qty + Number(row.qty || 0),
        point: sum.point + Number(row.point || 0),
        value: sum.value + Number(row.subTotal || 0),
      }),
      { qty: 0, point: 0, value: 0 }
    );
  }, [rows]);

  useEffect(() => {
    const targetPoint = Number(form.getFieldValue("targetPoint") || 0);
    const diff = Math.max(0, targetPoint - totals.point);
    form.setFieldValue("diffFromTarget", diff);
  }, [form, totals.point]);

  const readOnly = isView;

  return (
    <MainLayout loading={false}>
      <div className="title-page">{pageTitle}</div>

      <Form form={form} layout="vertical">
        <BoxPrimary>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <Form.Item
              label="Sales"
              name="sale"
              rules={[{ required: true, message: "Please select sales" }]}
            >
              <Select
                options={draftCampaignSalesOptions.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                disabled={readOnly}
                placeholder="Select"
              />
            </Form.Item>

            <Form.Item label="Dealer" name="dealer">
              <Select
                options={draftCampaignDealerOptions.map((item) => ({
                  label: item.name,
                  value: item.name,
                }))}
                disabled={readOnly}
                placeholder="Select"
              />
            </Form.Item>

            <Form.Item label="Sub Dealer" name="subDealer">
              <Select
                options={draftCampaignSubDealerOptions.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                disabled={readOnly}
                placeholder="Select"
              />
            </Form.Item>

            <Form.Item label="Farmer" name="farmer">
              <Select
                options={draftCampaignFarmerOptions.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
                disabled={readOnly}
                placeholder="Select"
              />
            </Form.Item>

            <Form.Item label="Draft Date" name="draftDate">
              <DatePicker
                className="w-full"
                format="YYYY-MM-DD"
                disabled={readOnly}
              />
            </Form.Item>
          </div>
        </BoxPrimary>

        <BoxPrimary>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item label="Current Point" name="currentPoint">
              <Input disabled />
            </Form.Item>

            <Form.Item
              label="Target Point"
              name="targetPoint"
              rules={[{ required: true, message: "Please enter target point" }]}
            >
              <Input
                disabled={readOnly}
                onChange={(event) =>
                  form.setFieldValue("targetPoint", Number(event.target.value || 0))
                }
              />
            </Form.Item>

            <Form.Item label="Diff From Target" name="diffFromTarget">
              <Input disabled />
            </Form.Item>
          </div>
        </BoxPrimary>

        <BoxPrimary title="Product">
          <div className="flex flex-col md:flex-row gap-3">
            <Select
              className="flex-1"
              placeholder="Select Product"
              value={productSelection}
              onChange={setProductSelection}
              disabled={readOnly}
              options={draftCampaignProductOptions.map((item) => ({
                label: `${item.sku} - ${item.productName}`,
                value: item.id,
              }))}
            />
            {!readOnly && (
              <ActionButton mode="add" text="Add Product" onClick={addSelectedProduct} />
            )}
          </div>
        </BoxPrimary>

        <BoxPrimary title="Product List" className="overflow-x-auto">
          <div className="min-w-[1100px]">
            <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-[4px]">
              <thead>
                <tr className="bg-[#00783F] text-white">
                  <th className="text-left p-4 font-medium">No</th>
                  <th className="text-left p-4 font-medium">SKU</th>
                  <th className="text-left p-4 font-medium">Product Name</th>
                  <th className="text-left p-4 font-medium">Unit</th>
                  <th className="text-right p-4 font-medium">THB/Unit</th>
                  <th className="text-center p-4 font-medium">Point/Ctn</th>
                  <th className="text-center p-4 font-medium">QTY (ctn)</th>
                  <th className="text-center p-4 font-medium">X Point</th>
                  <th className="text-right p-4 font-medium">Point</th>
                  <th className="text-right p-4 font-medium">Sub Total (THB)</th>
                  <th className="text-center p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.sku}-${index}`} className="bg-[#F7F3F3] border-b border-[#E5DEDC]">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{row.sku}</td>
                    <td className="p-4">{row.productName}</td>
                    <td className="p-4">{row.unit}</td>
                    <td className="p-4 text-right">{formatNumber(row.thbPerUnit, 2)}</td>
                    <td className="p-4 text-center">{formatNumber(row.pointPerCtn)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {!readOnly && (
                          <button
                            type="button"
                            className="text-[#978B87]"
                            onClick={() => updateRow(index, "qty", Number(row.qty || 0) - 1)}
                          >
                            <MinusCircleOutlined className="text-[22px]" />
                          </button>
                        )}
                        <Input
                          value={row.qty}
                          disabled={readOnly}
                          onChange={(event) => updateRow(index, "qty", event.target.value)}
                          className="max-w-[90px] text-center"
                        />
                        {!readOnly && (
                          <button
                            type="button"
                            className="text-[#009845]"
                            onClick={() => updateRow(index, "qty", Number(row.qty || 0) + 1)}
                          >
                            <PlusCircleOutlined className="text-[22px]" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {!readOnly && (
                          <button
                            type="button"
                            className="text-[#978B87]"
                            onClick={() => updateRow(index, "xPoint", Number(row.xPoint || 0) - 1)}
                          >
                            <MinusCircleOutlined className="text-[22px]" />
                          </button>
                        )}
                        <Input
                          value={row.xPoint}
                          disabled={readOnly}
                          onChange={(event) => updateRow(index, "xPoint", event.target.value)}
                          className="max-w-[90px] text-center"
                        />
                        {!readOnly && (
                          <button
                            type="button"
                            className="text-[#009845]"
                            onClick={() => updateRow(index, "xPoint", Number(row.xPoint || 0) + 1)}
                          >
                            <PlusCircleOutlined className="text-[22px]" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">{formatNumber(row.point)}</td>
                    <td className="p-4 text-right">{formatNumber(row.subTotal, 2)}</td>
                    <td className="p-4 text-center">
                      {!readOnly && (
                        <button
                          type="button"
                          className="text-[#978B87]"
                          onClick={() => setRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index))}
                        >
                          <DeleteOutlined className="text-[20px]" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#978B87] text-white">
                  <td colSpan={11} className="p-4 text-right">
                    Item : {rows.length} | QTY (ctn): {formatNumber(totals.qty)} | Total Point : {formatNumber(totals.point)} | Total: {formatNumber(totals.value, 2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </BoxPrimary>

        <div className="flex justify-end gap-4 mt-4">
          <ActionButton
            mode="back"
            text="Back"
            onClick={() => navigate("/setting/line/draft-campaign")}
          />
          {!isView && (
            <ActionButton
              mode={isEdit ? "update" : "save"}
              text={isEdit ? "Update" : "Save"}
              onClick={() => navigate("/setting/line/draft-campaign")}
            />
          )}
        </div>
      </Form>
    </MainLayout>
  );
}
