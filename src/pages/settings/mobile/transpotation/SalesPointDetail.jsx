import React from "react";
import { Form, Input } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../../../layouts/MainLayout";
import FormUser from "../../../../components/form_user/FormUser";
import BoxPrimary from "../../../../components/box_primary/BoxPrimary";
import TableComponent from "../../../../components/table/TableComponent";
import ActionButton from "../../../../components/button/ActionButton";

export default function SalesPointDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location?.state?.mode || "view";

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const formFieldData = [
    {
      label: "Document No",
      name: "doc_no",
      type: "text",
      disabled: !isCreate,
      value: isCreate ? "Generate Order no" : "O2025040108",
    },
    {
      label: "Sales",
      name: "sales",
      type: "text",
      disabled: isView,
      value: "Amorn Sriworakul",
      required: true,
    },
    {
      label: "Dealer",
      name: "dealer",
      type: "text",
      disabled: isView,
      value: "Somporn Panich Chemi Kaset Ltd.part.",
      required: true,
    },
    {
      label: "Sub Dealer",
      name: "sub_dealer",
      type: "text",
      disabled: isView,
      value: "นายกหน่อย",
      required: true,
    },
    {
      label: "Contact Number",
      name: "contact",
      type: "text",
      disabled: isView,
      value: "086-3199695",
    },
    {
      label: "Date",
      name: "date",
      type: "date",
      disabled: isView,
      value: "2025-05-27",
    },
    {
      label: "Status",
      name: "status",
      type: "text",
      disabled: true,
      value: isCreate ? "-" : isEdit ? "Waiting for Receive" : "Completed",
    },
  ];

  const orderListData = [
    {
      key: 1,
      sku: "3027200113",
      name: "Bumper P 490 EC",
      unit: "0.5 Lt x 20",
      price: "12,380.00",
      qty: 10,
      foc: 1,
      subtotal: "123,800.00",
      point: 300,
    },
    {
      key: 2,
      sku: "303710131300",
      name: "Apopo",
      unit: "0.5 Lt x 20",
      price: "9,900.00",
      qty: 5,
      foc: 0,
      subtotal: "49,500.00",
      point: 150,
    },
  ];

  const orderListColumns = [
    { title: "No", render: (_, __, index) => index + 1 },
    { title: "SKU", dataIndex: "sku" },
    { title: "Product Name", dataIndex: "name" },
    { title: "Unit", dataIndex: "unit" },
    { title: "THB/Unit", dataIndex: "price" },
    { title: "QTY (ctn)", dataIndex: "qty" },
    { title: "FOC (ctn)", dataIndex: "foc" },
    { title: "Sub Total (THB)", dataIndex: "subtotal" },
    { title: "Point Earned", dataIndex: "point" },
  ];

  const footerOrder = () => (
    <tr className="bg-[#978B87] text-white">
      <td colSpan={9} className="text-right pr-2">
        Item: 2 &nbsp;&nbsp; QTY (ctn): 15+1 &nbsp;&nbsp; Total: 173,300.00 &nbsp;&nbsp; Point Total: 450
      </td>
    </tr>
  );

  const attachmentImages = ["/img/attachment1.png"];
  const productImages = ["/img/product1.png", "/img/product2.png"];

  return (
    <MainLayout loading={false}>
      <div className="title-page">Sale Points Detail</div>

      <FormUser fields={formFieldData} form={Form.useForm()[0]} />

      <BoxPrimary title="Order List">
        <TableComponent
          header={orderListColumns}
          dataSource={orderListData}
          footer={footerOrder}
          pagination={false}
        />
      </BoxPrimary>

      <BoxPrimary title="Attachments">
        <div className="flex gap-4">
          {attachmentImages.map((img, i) => (
            <img key={i} src={img} alt={`attachment-${i}`} className="w-32 border" />
          ))}
        </div>
      </BoxPrimary>

      <BoxPrimary title="Picture Of Product Receipt">
        <div className="flex gap-4">
          {productImages.map((img, i) => (
            <img key={i} src={img} alt={`product-${i}`} className="w-32 border" />
          ))}
        </div>
      </BoxPrimary>

      <BoxPrimary title="Remark">
        <Input.TextArea
          placeholder="Enter"
          disabled={isView}
          defaultValue={isCreate ? "" : ""}
        />
      </BoxPrimary>

      <div className="flex justify-end mt-4 gap-4">
        <ActionButton mode="back" text="Back" onClick={() => navigate(-1)} />
        {(isCreate || isEdit) && (
          <ActionButton
            mode="save"
            text="Save"
            onClick={() => {
              console.log("Saving...");
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
