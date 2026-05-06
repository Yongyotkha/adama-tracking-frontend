import React, { useEffect, useMemo, useState } from "react";
import { DatePicker, Form, Input, Select } from "antd";
import { DeleteOutlined, MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import MainLayout from "../../../../layouts/MainLayout";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import ActionButton from "../../../../components/button/ActionButton";
import TableComponent from "../../../../components/table/TableComponent";
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

  const renderStepperInput = (index, key, value) => (
    <div className="flex items-center justify-center gap-2">
      {!readOnly && (
        <button
          type="button"
          className="text-[#978B87] transition duration-150 ease-out hover:scale-110 hover:text-[#6F625E] active:scale-95"
          onClick={() => updateRow(index, key, Number(value || 0) - 1)}
        >
          <MinusCircleOutlined className="text-[22px]" />
        </button>
      )}
      <Input
        value={value}
        disabled={readOnly}
        onChange={(event) => updateRow(index, key, event.target.value)}
        className="max-w-[90px] text-center"
      />
      {!readOnly && (
        <button
          type="button"
          className="text-[#009845] transition duration-150 ease-out hover:scale-110 hover:text-[#00B050] active:scale-95"
          onClick={() => updateRow(index, key, Number(value || 0) + 1)}
        >
          <PlusCircleOutlined className="text-[22px]" />
        </button>
      )}
    </div>
  );

  const productColumns = [
    {
      title: "No",
      dataIndex: "no",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    { title: "SKU", dataIndex: "sku", width: 140 },
    { title: "Product Name", dataIndex: "productName", width: 220 },
    { title: "Unit", dataIndex: "unit", width: 120 },
    {
      title: "THB/Unit",
      dataIndex: "thbPerUnit",
      width: 130,
      align: "right",
      render: (value) => formatNumber(value, 2),
    },
    {
      title: "Point/Ctn",
      dataIndex: "pointPerCtn",
      width: 120,
      align: "center",
      render: (value) => formatNumber(value),
    },
    {
      title: "QTY (ctn)",
      dataIndex: "qty",
      width: 180,
      align: "center",
      render: (value, _, index) => renderStepperInput(index, "qty", value),
    },
    {
      title: "X Point",
      dataIndex: "xPoint",
      width: 180,
      align: "center",
      render: (value, _, index) => renderStepperInput(index, "xPoint", value),
    },
    {
      title: "Point",
      dataIndex: "point",
      width: 120,
      align: "right",
      render: (value) => formatNumber(value),
    },
    {
      title: "Sub Total (THB)",
      dataIndex: "subTotal",
      width: 150,
      align: "right",
      render: (value) => formatNumber(value, 2),
    },
    {
      title: "Action",
      dataIndex: "action",
      width: 90,
      align: "center",
      render: (_, __, index) =>
        !readOnly ? (
          <button
            type="button"
            className="text-[#978B87] transition duration-150 ease-out hover:scale-110 hover:text-[#D4380D] active:scale-95"
            onClick={() =>
              setRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index))
            }
          >
            <DeleteOutlined className="text-[20px]" />
          </button>
        ) : null,
    },
  ];

  const productFooter = () => (
    <tr className="bg-[#978B87]">
      <td colSpan={11} className="text-right pr-4 py-3 text-white">
        Item : {rows.length} | QTY (ctn): {formatNumber(totals.qty)} | Total Point :
        {" "}
        {formatNumber(totals.point)} | Total: {formatNumber(totals.value, 2)}
      </td>
    </tr>
  );

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

        <BoxPrimary title="Product List">
          <TableComponent
            header={productColumns}
            dataSource={rows.map((row, index) => ({
              key: `${row.sku}-${index}`,
              ...row,
            }))}
            pagination={false}
            footer={productFooter}
            scroll
          />
        </BoxPrimary>

        <div className="flex justify-end gap-4 mt-4">
          <ActionButton
            mode="back"
            text="Back"
            onClick={() => navigate("/setting/line/draft-campaign")}
          />
          {isView && (
            <ActionButton
              mode="custom"
              text="PDF"
              className="bg-[#F89E18]"
              onClick={() =>
                window.open(
                  `/setting/line/draft-campaign/pdf?id=${encodeURIComponent(
                    selectedCampaign?.id || initialData.id || "dc-001"
                  )}`,
                  "_blank"
                )
              }
            />
          )}
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
