import React, { useEffect, useState, useContext } from "react";
import MainLayout from "../../../layouts/MainLayout";
import FormUser from "../../../components/form_user/FormUser";
import DynamicButton from "../../../components/button/DynamicButton";
import BoxPrimary from "../../../components/box_primary/BoxPrimary";
import { Select, Form } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";
import useServiceAPI from "../../../services/corsService";
import { paths } from "../../../services/CorsPath";

const { Option } = Select;

export default function EditProduct() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [form] = Form.useForm();
  const { showMsg, showNotification } = useContext(AuthContext);
  const id = location.state?.id; // รับค่า id จาก state
  const [roles, setRoles] = useState([]);
  const [position, setPosition] = useState([]);
  const [cropOptions, setCropOptions] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [selectedCropsIDs, setSelectedCropsIDs ] = useState([]);
  const [selectedCropsName, setSelectedCropsName ] = useState([]);

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        await fetchProductDetails(location.state.id);

        const [positions, roles, crops] = await Promise.all([
          useServiceAPI.get(paths.pathMasterProductTypes, {}),
          useServiceAPI.get(paths.pathMasterProductCategorys, {}),
          useServiceAPI.get(paths.pathMasterCrop, {}), 
        ]);

        setPosition(positions.data);
        setRoles(roles.data);
        setCropOptions(crops.data);         

      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      }
    };
  
    fetchData();
  }, []);
  
  // useEffect(() => {
  //   const getMaster = async () => {
  //     setLoading(true);
  //     try {
  //       const [positions, roles] = await Promise.all([
  //         useServiceAPI.get(paths.pathMasterProductTypes, {}),
  //         useServiceAPI.get(paths.pathMasterProductGroups, {}),
  //       ]);

  //       setPosition(positions.data);
  //       setRoles(roles.data);
  //     } catch (error) {
  //       showMsg("error", error.message || "เกิดข้อผิดพลาด");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   getMaster();
  // }, []);


  const fetchProductDetails = async (id) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(`${paths.pathSaleManagementProductsDetail}/${id}`);
      if (response.status === 200) {
        const { data } = response; 

        const defaultCropName = data.crop_list.map((crop) => crop.name);  
        const defaultCropIds = data.crop_list.map((crop) => crop.id);  

        const updatedFields = [
          { label: "Product Code", name: "product_code", type: "text", required: true, col: 6, disabled: true, value: data.product_code },
          { label: "Product Name", name: "product_name", type: "text", required: true, col: 6, disabled: true, value: data.product_name },
          { label: "AI and content", name: "ai_content", type: "text", required: false, col: 12, disabled: true, value: data.ai_and_content },
          { label: "Product Type", name: "product_type", type: "select", required: false, col: 6, options: position, value:data.product_type },
          { label: "Product Group", name: "product_group", type: "select", required: false, col: 6, options: roles ,value:data.product_group},
          { label: "Category", name: "category", type: "text", required: false, col: 6, disabled: true, value: data.product_category},
          { label: "Packing list", name: "packing_list", type: "text", required: false, col: 6, disabled: true, value: data.packing_list },
          { label: "Packing unit size (lt,kg)", name: "packing_unit_size", type: "text", required: false, col: 6, disabled: true, value: data.packing_unit_size },
          { label: "Net Price", name: "net_price", type: "text", required: false, col: 6, disabled: true, value: data.net_price },
          {
            label: "Status",
            name: "use_flag",
            type: "select",
            required: false,
            col: 6,
            options: [
              { name: "Active", id: 1, selected: true },
              { name: "Inactive", id: 0, selected: false },
            ],
            value: data.use_flag === "1" ? "Active" : "Inactive" 
          },
        ];
        
        setSelectedCropsIDs(defaultCropIds);
        setSelectedCropsName(defaultCropName);
        setFormCrop(defaultCropName);
        setSelectedCrops(defaultCropIds);
        setFormFields(updatedFields);

        const initialValues = updatedFields.reduce((acc, field) => {
          acc[field.name] = field.value;
          return acc;
        }, {});

        initialValues['crop_list'] = defaultCropName;
        initialValues['crop_ID'] = defaultCropIds;

        form.setFieldsValue(initialValues);

      } else {
        console.error("Failed to fetch promotion details:", response.message);
      }
    } catch (error) {
      console.error("Error fetching promotion details:", error);
    } finally {
      setLoading(false);
    }
  };


  const [formFields, setFormFields] = useState([]);
  const [formCrop, setFormCrop] = useState([]);

  

  // const cropOptions = [
  //   "Rice", "Wheat", "Corn", "Soybean", "Cotton", "Barley", "Sugarcane", "Potato", "Tomato", "Lettuce"
  // ];

  // const formFields = [
  //   { label: "Product Code", name: "product_code", type: "text", required: true, col: 6, disabled: true, value: "303710131300" },
  //   { label: "Product Name", name: "product_name", type: "text", required: true, col: 6, disabled: true, value: "Apopo 20%SE" },
  //   { label: "AI and content", name: "ai_content", type: "text", required: false, col: 12, disabled: true, value: "Azoxystrobin + propiconazole 7.5+12.5% SE" },
  //   { label: "Product Type", name: "product_type", type: "select", required: true, col: 6, options: ["Special", "Commodity", "3rd Party", "SAS"], value: "Special" },
  //   { label: "Product Group", name: "product_group", type: "select", required: true, col: 6, options: ["Gold", "Silver", "Bronz"], value: "Gold" },
  //   { label: "Category", name: "category", type: "text", required: false, col: 6, disabled: true, value: "FUN" },
  //   { label: "Packing list", name: "packing_list", type: "text", required: false, col: 6, disabled: true, value: "0.5 ltX20" },
  //   { label: "Packing unit size (lt,kg)", name: "packing_unit_size", type: "text", required: false, col: 6, disabled: true, value: "0.5" },
  //   { label: "Net Price", name: "net_price", type: "text", required: false, col: 6, disabled: true, value: "440.63" },
  // ];

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {

        const cropListToSend = selectedCrops.length > 0 
        ? selectedCrops 
        : form.getFieldValue("crop_ID"); 

        const dataToSend = {
          ...values,
          id: location.state.id, 
          // crop_list: selectedCrops.length > 0 ? selectedCrops : form.getFieldValue("crop_ID"),
          // crop_list: selectedCropsIDs,
          crop_list: cropListToSend, // ส่ง crop_list

        };
        
        useServiceAPI
          .put(paths.pathSaleManagementProductsUpdate, dataToSend, setLoading)
          .then((response) => {
            if (response.status === 201) {
              showMsg("success", response.data.message).then(() => {
                navigate("/setting/user");
              });
            }
          })
          .catch((error) => {
            console.error(error);
            if (error.status === 422) {
              showMsg("error", error.message);
            } else {
              showMsg("error", "เกิดข้อผิดพลาด");
            }
          });
      })
      .catch((errorInfo) => {
        console.error("Validation Failed:", errorInfo);
      });
  };

  // const handleCropChange = (value) => {    
  //   // setSelectedCrops(value.target.value); 
  //     setSelectedCrops(value); 
  //     console.log(value);
  // };
  

  const handleCropChange = (value) => {
    console.log("Selected Value:", value); // ตรวจสอบค่าที่ส่งมา (ทั้ง id และ name)
      const selectedIds = value.map((item) => {
      if (typeof item === "number" || !isNaN(Number(item))) {
        return item;
      } else {
        // หากเป็น name ให้ค้นหา id จาก cropOptions
        const crop = cropOptions.find((option) => option.name === item);
        return crop ? crop.id : null; // ส่ง id หรือ null หากไม่พบ
      }
    });
      const filteredIds = selectedIds.filter((id) => id !== null);
  
    setSelectedCrops(filteredIds); // อัปเดต selectedCrops ด้วย id
    console.log("Selected IDs:", filteredIds); // แสดงผล id
  };
  

  

  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Product</div>
      <FormUser profile="/img/profile.jpg" fields={formFields} form={form}/>

      <BoxPrimary>
      <Form layout="vertical"  form={form}>
          <Form.Item label="Crop" name="crop_list">
            <Select
              mode="multiple"
              showSearch
              placeholder="Select Crop(s)"
              optionFilterProp="children"
              className="w-full"
              onChange={handleCropChange} 
            >
              {
              cropOptions.map((crop) => (
                <Option key={crop.id} value={crop.id}>
                  {crop.name}
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
          // path='/setting/product'
          mode="update"
          onClick={handleSave} 
        />
      </div>

    </MainLayout>
  );
}
