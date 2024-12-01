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
import ActionButton from "../../../components/button/ActionButton";

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
  const [userinfo, setUserInfo ] = useState([]);
  const navigate = useNavigate();
  const [cropList, setCropList] = useState([]); // state สำหรับ crop_list
  const [defaultSelectedCrops, setDefaultSelectedCrops] = useState([]); // กำหนด state สำหรับ defaultSelectedCrops

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
        setCropList(crops.data || []);

      } catch (error) {
        showMsg("error", error.message || "เกิดข้อผิดพลาด");
      }
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    console.log("Roles:", roles);
    console.log("Crop Options:", cropOptions);
  }, [roles, cropOptions]);
  


  const fetchProductDetails = async (id) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(`${paths.pathSaleManagementProductsDetail}/${id}`);
      if (response.status === 200) {
        const { data } = response; 
        setUserInfo(data);
        setCropList(data.crop_list || []); 
        setCropOptions(data.crop_list);
        setSelectedCrops(data.crop_list.map((crop) => crop.id));

        const cropNames = data.crop_list?.map((crop) => Number(crop.id)) || [];
        setDefaultSelectedCrops(cropNames);

        const Test = response.data.data;        
        const territoryData = Test.map((item, index) => ({
          key: index + 1,
          name: item.name,
          territory: item.territory_name,
          position: item.position_name,
        }));
      setUserList(territoryData);


      } else {
        console.error("Failed to fetch promotion details:", response.message);
      }
    } catch (error) {
      console.error("Error fetching promotion details:", error);
    } finally {
      setLoading(false);
    }
  };


  const updatedFields = [
    { label: "Product Code", name: "product_code", type: "text", required: true, col: 6, disabled: true, value: userinfo.product_code },
    { label: "Product Name", name: "product_name", type: "text", required: true, col: 6, disabled: true, value: userinfo.product_name },
    { label: "AI and content", name: "ai_content", type: "text", required: false, col: 12, disabled: true, value: userinfo.ai_and_content },
    { label: "Product Type", name: "product_type", type: "select", required: false, col: 6, options: position, value:userinfo.product_type },
    { label: "Product Group", name: "product_group", type: "select", required: false, col: 6, options: roles ,value:userinfo.product_group},
    { label: "Category", name: "category", type: "text", required: false, col: 6, disabled: true, value: userinfo.product_category},
    { label: "Packing list", name: "packing_list", type: "text", required: false, col: 6, disabled: true, value: userinfo.packing_list },
    { label: "Packing unit size (lt,kg)", name: "packing_unit_size", type: "text", required: false, col: 6, disabled: true, value: userinfo.packing_unit_size },
    { label: "Net Price", name: "net_price", type: "text", required: false, col: 6, disabled: true, value: userinfo.net_price },
    { label: "Status", name: "use_flag", type: "select", required: false, col: 6,
      options: [
        { name: "Active", id: 1, selected: true },
        { name: "Inactive", id: 0, selected: false },
      ],
      value: userinfo.use_flag === "1" ? "Active" : "Inactive" 
    },
  ];

  const handleSave = () => { 
    form
      .validateFields()
      .then((values) => {
        // const useFlagValue = values.use_flag === "Active" ? 1 : 0;
        const cropListToSend = selectedCrops.length > 0 
          ? selectedCrops 
          : form.getFieldValue("crop_ID"); 
  
          let useFlagValue;
          if (values.use_flag === 1 || values.use_flag === 0) {
            useFlagValue = values.use_flag; // ถ้าค่าเป็น 1 หรือ 0 อยู่แล้ว ใช้ค่าเดิม
          } else {
            useFlagValue = values.use_flag === "Active" ? 1 : 0; // แปลงค่าจาก "Active" หรือ "Inactive"
          }

          const dataToSend = {
          ...values,
          id: location.state.id,
          use_flag: useFlagValue, // ส่งค่า use_flag เป็น 1 หรือ 0
          crop_list: defaultSelectedCrops, // ส่ง crop_list
        };

        useServiceAPI
          .put(paths.pathSaleManagementProductsUpdate, dataToSend, setLoading)
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

  const handleCropChange = (value) => {
    const intValues = value.map((v) => parseInt(v, 10)); // แปลง string เป็น integer
    setSelectedCrops(value.map((v) => parseInt(v, 10))); // เก็บค่าเป็น integer

    // setSelectedCrops(intValues);
    
  };
  


  // const cropOptions = [
  //   "Rice", "Wheat", "Corn", "Soybean", "Cotton", "Barley", "Sugarcane", "Potato", "Tomato", "Lettuce"
  // ];

  // const handleSave = () => {
  //   form
  //     .validateFields()
  //     .then((values) => {
  //       const cropListToSend = selectedCrops.length > 0 
  //       ? selectedCrops 
  //       : form.getFieldValue("crop_ID"); 
  //       const dataToSend = {
  //         ...values,
  //         id: location.state.id, 
  //         // crop_list: selectedCrops.length > 0 ? selectedCrops : form.getFieldValue("crop_ID"),
  //         // crop_list: selectedCropsIDs,
  //         crop_list: cropListToSend, // ส่ง crop_list

  //       };
        
  //       useServiceAPI
  //         .put(paths.pathSaleManagementProductsUpdate, dataToSend, setLoading)
  //         .then((response) => {
  //           if (response.status === 201) {
  //             showMsg("success", response.data.message).then(() => {
  //               navigate("/setting/product");
  //             });
  //           }
  //         })
  //         .catch((error) => {
  //           console.error(error);
  //           if (error.status === 422) {
  //             showMsg("error", error.message);
  //           } else {
  //             showMsg("error", "เกิดข้อผิดพลาด");
  //           }
  //         });
  //     })
  //     .catch((errorInfo) => {
  //       console.error("Validation Failed:", errorInfo);
  //     });
  // };


  // const handleCropChange = (value) => {    
  //   // setSelectedCrops(value.target.value); 
  //     setSelectedCrops(value); 
  //     console.log(value);
  // };
  
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

  const transformedCropOptions = cropOptions.map((option) => ({
    label: option.name, // เปลี่ยนจาก name เป็น label
    value: option.id, // คงค่า value เดิมไว้
  }));
  
  return (
    <MainLayout loading={loading}>
      <div className="title-page">Edit Product</div>
      <FormUser profile="/img/profile.jpg" fields={updatedFields} form={form}/>

      <BoxPrimary>
      <Form layout="vertical">
          <Form.Item label="Crop">
            <Select
                  mode="multiple"
                  showSearch
                  placeholder="Select Crop(s)"
                  optionFilterProp="children"
                  className="w-full"
                  value={defaultSelectedCrops} 
                  onChange={(value) => setDefaultSelectedCrops(value)} // จัดการการเปลี่ยนแปลงค่า
                  options={transformedCropOptions} 
            />

          </Form.Item>
        </Form>
      </BoxPrimary>
      
      <div className="flex justify-end space-x-4">
        <DynamicButton
          text="Back"
          className="bg-[#B6AEAB] min-w-[96px] text-[#ffff] rounded-sm p-2"
          path='/setting/product'
        />

        <ActionButton 
          text="Update" 
          mode="update" 
          onClick={handleSave} 
          path='/setting/product'
        />
      </div>

    </MainLayout>
  );
}
