import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import DynamicButton from "../../../components/button/DynamicButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Select, Form } from "antd";

const { Option } = Select;

export default function EditProduct() {
  const [loading, setLoading] = useState(false);
  // Mock crop data for the multi-select dropdown
  const cropOptions = [
    "Rice", "Wheat", "Corn", "Soybean", "Cotton", "Barley", "Sugarcane", "Potato", "Tomato", "Lettuce"
  ];
  useEffect(() => { }, []);


  const formFields = [
    { label: "Product Code", name: "product_code", type: "text", required: true, col: 6, disabled: true, value: "303710131300" },
    { label: "Product Name", name: "product_name", type: "text", required: true, col: 6, disabled: true, value: "Apopo 20%SE" },
    { label: "AI and content", name: "ai_content", type: "text", required: false, col: 12, disabled: true, value: "Azoxystrobin + propiconazole 7.5+12.5% SE" },
    { label: "Product Type", name: "product_type", type: "select", required: true, col: 6, options: ["Special", "Commodity", "3rd Party", "SAS"], value: "Special" },
    { label: "Product Group", name: "product_group", type: "select", required: true, col: 6, options: ["Gold", "Silver", "Bronz"], value: "Gold" },
    { label: "Category", name: "category", type: "text", required: false, col: 6, disabled: true, value: "FUN" },
    { label: "Packing list", name: "packing_list", type: "text", required: false, col: 6, disabled: true, value: "0.5 ltX20" },
    { label: "Packing unit size (lt,kg)", name: "packing_unit_size", type: "text", required: false, col: 6, disabled: true, value: "0.5" },
    { label: "Net Price", name: "net_price", type: "text", required: false, col: 6, disabled: true, value: "440.63" },
  ];

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Product</div>

      <FormUser fields={formFields} />

      <BoxPrimary>
      <Form layout="vertical">
          <Form.Item label="Crop" name="crop">
            <Select
              mode="multiple"
              showSearch
              placeholder="Select Crop(s)"
              optionFilterProp="children"
              className="w-full"
            >
              {cropOptions.map((crop) => (
                <Option key={crop} value={crop}>
                  {crop}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </BoxPrimary>
      
      <div className="flex justify-end space-x-4">
        <DynamicButton
          text="Back"
          className="bg-[#B6AEAB] min-w-[96px] text-[#ffff] rounded-sm p-2"
          path='/setting/product'
        />
        <DynamicButton
          text="Update"
          className="bg-[#00783F] min-w-[96px] text-[#ffff] rounded-sm p-2"
          path='/setting/product'
        />
      </div>

    </MainLayout>
  );
}
