import React, { useEffect, useState, useContext, useMemo } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import DynamicButton from "../../../components/button/DynamicButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Select, Form } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import ActionButton from "../../../components/button/ActionButton";

const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseInteger = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const buildProductPayload = (values, selectedCrops, productImageFallback) => ({
  product_name: values.product_name,
  ai_and_content: values.ai_and_content,
  product_type: values.product_type,
  product_group: values.product_group,
  product_category: values.product_category,
  product_image: values.profile ?? productImageFallback,
  packing_list: values.packing_list,
  packing_unit_size: parseNumber(values.packing_unit_size),
  net_price: parseNumber(values.net_price),
  bath_ltkg: parseNumber(values.bath_ltkg),
  bath_unit: parseNumber(values.bath_unit),
  sub_dealer: parseNumber(values.sub_dealer),
  farmer: parseNumber(values.farmer),
  remark: values.remark,
  unit_convert_value: parseNumber(values.unit_convert_value),
  product_campaign_order_min_foc: parseInteger(values.product_campaign_order_min_foc),
  product_campaign_foc: parseInteger(values.product_campaign_foc),
  use_flag: parseInteger(values.use_flag) ?? 1,
  status: parseInteger(values.status),
  order_by: parseInteger(values.order_by),
  unit_convert_order_value: parseNumber(values.unit_convert_order_value),
  point: parseInteger(values.point),
  unit_convert_sales_order: parseInteger(values.unit_convert_sales_order),
  unit_size: parseInteger(values.unit_size),
  crop_list: selectedCrops,
});

export default function EditProduct() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [form] = Form.useForm();
  const { showMsg, showNotification } = useContext(AuthContext);
  const navigate = useNavigate();

  const productId = location.state?.id;
  const mode = location.state?.mode || (location.pathname.endsWith("/create") ? "create" : "view");
  const isCreateMode = mode === "create";
  const isViewMode = mode === "view";

  const [productInfo, setProductInfo] = useState({});
  const [productTypes, setProductTypes] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cropOptions, setCropOptions] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [canEdit, setCanEdit] = useState(isCreateMode);

  const isFieldDisabled = isViewMode || (!isCreateMode && !canEdit);

  useEffect(() => {
    if (!isCreateMode && !productId) {
      showMsg("error", "ไม่พบข้อมูลสินค้า");
      navigate("/setting/product");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const masterRequests = [
          useServiceAPI.get(paths.pathMasterProductTypes, {}),
          useServiceAPI.get(paths.pathMasterProductGroups, {}),
          useServiceAPI.get(paths.pathMasterProductCategorys, {}),
          useServiceAPI.get(paths.pathMasterCrop, {}),
        ];

        if (isCreateMode) {
          const [typesResponse, groupsResponse, categoriesResponse, cropsResponse] =
            await Promise.all(masterRequests);

          setProductTypes(typesResponse.data || []);
          setProductGroups(groupsResponse.data || []);
          setCategories(categoriesResponse.data || []);
          setCropOptions(cropsResponse.data || []);
          setSelectedCrops([]);
          setCanEdit(true);
          setDataLoaded(true);
          return;
        }

        const [productResponse, typesResponse, groupsResponse, categoriesResponse, cropsResponse] =
          await Promise.all([
            useServiceAPI.get(`${paths.pathSaleManagementProductsDetail}/${productId}`),
            ...masterRequests,
          ]);

        if (productResponse.status !== 200) {
          showMsg("error", productResponse.message || "ไม่พบข้อมูลสินค้า");
          navigate("/setting/product");
          return;
        }

        const data = productResponse.data;
        setProductInfo(data);
        setCanEdit(Boolean(data.permission?.edit));
        setProductTypes(typesResponse.data || []);
        setProductGroups(groupsResponse.data || []);
        setCategories(categoriesResponse.data || []);
        setCropOptions(cropsResponse.data || []);
        setSelectedCrops((data.crop_list || []).map((crop) => Number(crop.id)));
        setDataLoaded(true);
      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, isCreateMode, navigate, showMsg]);

  const useFlagOptions = [
    { name: "Active", id: 1 },
    { name: "Inactive", id: 0 },
  ];

  const statusOptions = [
    { name: "Active", id: 1 },
    { name: "InActive", id: 0 },
  ];

  const formFields = useMemo(() => {
    const useFlagValue = isCreateMode
      ? 1
      : productInfo.use_flag === 1 ||
          productInfo.use_flag === "1" ||
          productInfo.use_flag === true
        ? 1
        : 0;

    const statusCode = parseInteger(productInfo.status_code ?? productInfo.status);
    const statusValue = isCreateMode ? 1 : statusCode === 1 ? 1 : 0;

    return [
      {
        label: "",
        name: "profile",
        type: "picture",
        required: false,
        col: 24,
        value: productInfo.product_image,
      },
      {
        label: "Product Code",
        name: "product_code",
        type: "text",
        required: false,
        col: 6,
        disabled: true,
        value: isCreateMode ? "" : productInfo.product_code,
      },
      {
        label: "Product Name",
        name: "product_name",
        type: "text",
        required: true,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.product_name,
      },
      {
        label: "Common Name",
        name: "ai_and_content",
        type: "text",
        required: false,
        col: 12,
        disabled: isFieldDisabled,
        value: productInfo.ai_and_content,
      },
      {
        label: "Product Type",
        name: "product_type",
        type: "select",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        options: productTypes,
        value: productInfo.product_type,
      },
      {
        label: "Product Group",
        name: "product_group",
        type: "select",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        options: productGroups,
        value: productInfo.product_group,
      },
      {
        label: "Category",
        name: "product_category",
        type: "select",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        options: categories,
        value: productInfo.product_category,
      },
      {
        label: "Packing List",
        name: "packing_list",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.packing_list,
      },
      {
        label: "Packing Unit Size (lt,kg)",
        name: "packing_unit_size",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.packing_unit_size,
      },
      {
        label: "Net Price",
        name: "net_price",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.net_price,
      },
      {
        label: "Baht/lt,kg",
        name: "bath_ltkg",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.bath_ltkg,
      },
      {
        label: "Baht/Unit",
        name: "bath_unit",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.bath_unit,
      },
      {
        label: "Sub Dealer",
        name: "sub_dealer",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.sub_dealer,
      },
      {
        label: "Farmer",
        name: "farmer",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.farmer,
      },
      {
        label: "Unit Convert Value",
        name: "unit_convert_value",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.unit_convert_value,
      },
      {
        label: "Unit Convert Order Value",
        name: "unit_convert_order_value",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.unit_convert_order_value,
      },
      {
        label: "Unit Convert Sales Order",
        name: "unit_convert_sales_order",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.unit_convert_sales_order,
      },
      {
        label: "Unit Size",
        name: "unit_size",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.unit_size,
      },
      {
        label: "Campaign Order Min FOC",
        name: "product_campaign_order_min_foc",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.product_campaign_order_min_foc,
      },
      {
        label: "Campaign FOC",
        name: "product_campaign_foc",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.product_campaign_foc,
      },
      {
        label: "Point",
        name: "point",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.point,
      },
      {
        label: "Point Farmer",
        name: "point_farmer",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.point_farmer,
      },
      {
        label: "Order By",
        name: "order_by",
        type: "text",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        value: productInfo.order_by,
      },
      {
        label: "Status",
        name: "status",
        type: "select",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        options: statusOptions,
        value: statusValue,
      },
      {
        label: "Use Flag",
        name: "use_flag",
        type: "select",
        required: false,
        col: 6,
        disabled: isFieldDisabled,
        options: useFlagOptions,
        value: useFlagValue,
      },
      {
        label: "Remark",
        name: "remark",
        type: "text",
        required: false,
        col: 12,
        disabled: isFieldDisabled,
        value: productInfo.remark,
      },
    ];
  }, [
    productInfo,
    productTypes,
    productGroups,
    categories,
    isFieldDisabled,
    isCreateMode,
  ]);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const payload = buildProductPayload(
          values,
          selectedCrops,
          productInfo.product_image
        );

        const request = isCreateMode
          ? useServiceAPI.post(
              paths.pathSaleManagementProductsCreate,
              payload,
              setLoading
            )
          : useServiceAPI.put(
              paths.pathSaleManagementProductsUpdate,
              { ...payload, id: productId },
              setLoading
            );

        request
          .then((response) => {
            if (response.status === 200) {
              navigate("/setting/product");
              showNotification(
                "success",
                response.data.message,
                response.data.message_line
              );
            }
          })
          .catch((error) => {
            if (error.status === 422) {
              showMsg("error", error.message);
            } else {
              showMsg("error", error.message || "เกิดข้อผิดพลาด");
            }
          });
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };

  const transformedCropOptions = cropOptions.map((option) => ({
    label: option.name,
    value: Number(option.id),
  }));

  const pageTitle = isCreateMode
    ? "Create Product"
    : isViewMode
      ? "View Product"
      : "Edit Product";

  return (
    <MainLayout loading={loading}>
      <div className="title-page">{pageTitle}</div>

      {dataLoaded ? (
        <FormUser
          profile={productInfo.product_image}
          fields={formFields}
          form={form}
          disableImageUpload={isFieldDisabled}
        />
      ) : (
        <div />
      )}

      <BoxPrimary>
        <Form layout="vertical">
          <Form.Item label="Crop">
            <Select
              mode="multiple"
              showSearch
              placeholder="Select Crop(s)"
              optionFilterProp="label"
              className="w-full"
              value={selectedCrops}
              onChange={(value) => setSelectedCrops(value)}
              options={transformedCropOptions}
              disabled={isFieldDisabled}
            />
          </Form.Item>
        </Form>
      </BoxPrimary>

      <div className="flex justify-end space-x-4">
        <DynamicButton
          text="Back"
          className="bg-[#B6AEAB] min-w-[96px] text-[#ffff] rounded-sm p-2"
          path="/setting/product"
        />

        {isCreateMode && (
          <ActionButton
            text="Create"
            mode="create"
            onClick={handleSave}
          />
        )}

        {!isCreateMode && !isViewMode && canEdit && (
          <ActionButton
            text="Update"
            mode="update"
            onClick={handleSave}
            path="/setting/product"
          />
        )}
      </div>
    </MainLayout>
  );
}
