import { useContext, useEffect, useState } from "react";
import { Button, Input, Select, Checkbox, DatePicker } from "antd";
import { MobileLayout } from "../../../components/navbar/NavbarMobile";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { AuthContext } from "../../../contexts/AuthContext";
import BackButton from "../../../components/mobile/button/BackButton";
import ModalRegisterPopup from "../../../components/mobile/popup/ModalRegisterPopup";
import DynamicPopUp from "../../../components/mobile/popup/DynamicPopUp";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import dayjs from "dayjs";
const { Option } = Select;

export default function RegisterOA() {
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isFailModalVisible, setIsFailModalVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [stageUser, setStageUser] = useState({});
  const { userInfo, showMsg, loginLineUid } =
    useContext(AuthContext);


  const { lineProfile } = useOutletContext() || {};
  const [receive_point, set_receive_point] = useState(0);
  useEffect(() => {
    console.log("lineProfile", lineProfile);

    setFormData({
      ...formData,
      line_id_token: lineProfile.userId,
      line_name: lineProfile.displayName,
    });
  }, [lineProfile]);

  // const [formData, setFormData] = useState(location.state || {});
  const [formData, setFormData] = useState(location.state || {
    shop_name: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    line_id: "",
    address: "",
    email: "",
    shop_code: "",
    birth_date: null,
    birth_date_day: "",
    birth_date_month: "",
    birth_date_year: "",
    shop_type: "",
  });

  console.log("formData", formData);

  const handleCheckboxClick = () => {
    setIsModalVisible(true);
  };

  const handleModalConfirm = () => {
    setIsChecked(true);
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState(2568);

  // Function to check if a year is a leap year
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  // Function to determine the number of days in the selected month
  const getDaysInMonth = (month, year) => {
    const monthsWith31Days = [
      "January",
      "March",
      "May",
      "July",
      "August",
      "October",
      "December",
    ];
    const monthsWith30Days = ["April", "June", "September", "November"];

    if (monthsWith31Days.includes(month)) return 31;
    if (monthsWith30Days.includes(month)) return 30;
    return isLeapYear(year) ? 29 : 28; // February logic
  };


  const handleRegister = () => {

    if (!isChecked) return;

    const formattedData = {
      birth_date: formData.birth_date,
      shop_name: formData.shop_name,
      shop_code: formData.shop_code,
      phone_number: formData.phone_number,
      first_name: formData.first_name, // ต้องแก้
      last_name: formData.last_name, // ต้องแก้
      birth_date_day: formData.birth_date_day,
      birth_date_month: formData.birth_date_month,
      birth_date_year: formData.birth_date_year,
      line_id: formData.line_id,
      address: formData.address,
      email: formData.email,
      is_condition: isChecked,
      shop_type: formData.shop_type,
      image_url: imagePreview,
      line_id_token: formData.line_id_token,
      line_name: formData.line_name,
    };

    // console.log('formattedData : ', formattedData)
    // return false;
    setLoading(true);
    useServiceAPI
      .post(paths.pathRegisterShop, formattedData)
      .then((response) => {
        if (response.status === 200) {
          set_receive_point(response.data.point)
          //localStorage.setItem("redirectPath", "/mobile/main");
          setIsSuccessModalVisible(true);
          //navigate("/mobile/main", { state: formattedData });

          const {
            message,
            token,
            token_expired_date,
            step_number,
            shop_code,
            shop_name,
            address,
            phone_number,
            first_name,
            last_name,
            birth_date_day,
            birth_date_month,
            birth_date_year,
            line_id,
            is_condition,
            shop_type,
            user_id, // <<< เพิ่มตรงนี้
          } = response.data;

          // 👉 Save user_id to localStorage for all steps
          localStorage.setItem("user_id", user_id);
          console.log(user_id);

          const stateData = {
            message,
            token,
            token_expired_date,
            step_number,
            shop_code,
            shop_name,
            address,
            phone_number,
            first_name,
            last_name,
            birth_date_day,
            birth_date_month,
            birth_date_year,
            line_id,
            is_condition,
            shop_type,
          };

          setStageUser(stateData)
          
          const fetchUserProfile = async () => {

            try {

              const results = await loginLineUid(response.data.user_id);
              console.log(results);
              // console.log('case 4')
              // return false
              if (results.status === 200) {
                //navigate("/mobile/main", { state: stateData });
              }
            } catch (error) {

              console.error("Error fetching user profile:", error);
              // console.log('case 5')
              // return false
              if (error?.response?.status === 401) {
                // setRedirectPath("/mobile/verify");
                //navigate("/mobile/verify");
              }
            }
          };

          if (response.data.user_id && !userInfo) {
            fetchUserProfile();
          } else {
            // console.log('case 6')
            // return false
            //navigate("/mobile/main", { state: stateData });
          }
        }
      })
      .catch((error) => {
        setIsFailModalVisible(true);
        console.error("API Error:", error);
      })
      .finally(() => setLoading(false));
  };

  const [imagePreview, setImagePreview] = useState("/img/icons/profile.png");

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImagePreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "profile");
    try {
      const response = await useServiceAPI.post(
        paths.pathUpload,
        formData,
        setLoading
      );
      setImagePreview(response.data.file_url);
    } catch (error) {
      console.error("Error uploading form data:", error);
      showMsg("error", "เกิดข้อผิดพลาด");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name,);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };



  return (
    <MobileLayout loading={loading}>
      <div className="flex flex-col items-center w-full h-full">
        {/* Header Section */}
        <div className="w-full max-w-md py-4 flex justify-between items-center">
          <h2 className="text-[#009845] text-lg font-semibold sarabun-font">
            ลงทะเบียน
          </h2>
        </div>

        {/* Profile Info Section */}
        <div className="w-full max-w-md mt-4">
          <div className="flex justify-start items-center relative">
            <img
              src={imagePreview}
              alt="Profile"
              onClick={() => document.getElementById("imageUpload").click()}
              className="w-24 h-24 rounded-full object-cover mb-2 cursor-pointer shadow-lg"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
              id="imageUpload"
            />
            <Button
              icon={
                imagePreview !== "/img/icons/profile.png" ? (
                  <EditOutlined />
                ) : (
                  <PlusOutlined />
                )
              }
              onClick={() => document.getElementById("imageUpload").click()}
              className="text-white absolute bottom-0 bg-[#009845] ms-[65px] rounded-full"
            ></Button>
          </div>
        </div>
        {/* User Details Form */}
        <div className="w-full max-w-md mt-4">
          <form className="space-y-4 sarabun-font">
            {/* ชื่อร้าน */}
            <div>
              <label className="text-gray-600 font-medium sarabun-font">
                ชื่อร้าน<span className="text-red-500">*</span>
              </label>
              <Input
                className="mt-1 rounded-md h-10 sarabun-font"
                value={formData.shop_name}
                onChange={handleInputChange}
                name="shop_name"
                disabled
                placeholder="ชื่อร้าน"
              />
            </div>

            {/* ชื่อ */}
            <div>
              <label className="text-gray-600 font-medium sarabun-font">
                ชื่อ<span className="text-red-500">*</span>
              </label>
              <Input
                className="mt-1 rounded-md h-10 sarabun-font"
                value={formData.first_name}
                onChange={handleInputChange}
                name="first_name"
                placeholder="ชื่อ"
              />
            </div>

            {/* นามสกุล */}
            <div>
              <label className="text-gray-600 font-medium sarabun-font">
                นามสกุล<span className="text-red-500">*</span>
              </label>
              <Input
                className="mt-1 rounded-md h-10 sarabun-font"
                value={formData.last_name}
                name="last_name"
                onChange={handleInputChange}
                placeholder="นามสกุล"
              />
            </div>

            {/* วันเดือนปีเกิด */}
            <div>
              <label className="text-gray-600 font-medium sarabun-font">
                วันเกิด<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mt-1">
                <DatePicker
                  value={formData.birth_date ? dayjs(formData.birth_date, "YYYY-MM-DD") : null}
                  onChange={(date) => {
                    setFormData(prev => ({
                      ...prev,
                      birth_date: date ? date.format("YYYY-MM-DD") : null, // เก็บเป็น string
                    }));
                  }}
                  format="DD/MM/YYYY"
                  className="mt-1 rounded-md h-10 sarabun-font w-full"
                />

              </div>
            </div>

            {/* เบอร์โทรศัพท์มือถือ */}
            <div>
              <label className="text-gray-600 font-medium sarabun-font">
                เบอร์โทรศัพท์<span className="text-red-500">*</span>
              </label>
              <Input
                className="mt-1 rounded-md h-10 sarabun-font"
                value={formData.phone_number}
                name="phone_number"
                onChange={handleInputChange}
                disabled
                placeholder="เบอร์มือถือ"
              />
            </div>

            {/* ไลน์ไอดี */}
            <div>
              <label className="text-gray-600 font-medium sarabun-font">ไลน์ไอดี</label>
              <Input
                className="mt-1 rounded-md h-10 sarabun-font"
                value={formData.line_id}
                name="line_id"
                onChange={handleInputChange}
                placeholder="ระบุ"
              />
            </div>

            {/* ที่อยู่ */}
            <div>
              <label className="text-gray-600 font-medium sarabun-font">
                ที่อยู่<span className="text-red-500">*</span>
              </label>
              <Input.TextArea
                className="mt-1 rounded-md sarabun-font"
                rows={2}
                value={formData.address}
                name="address"
                onChange={handleInputChange}
                placeholder="ระบุที่อยู่"
              />
            </div>


            {/* Checkbox */}
            <div>
              <Checkbox
                className={`sarabun-font ${isChecked ? "text-[#00783F]" : "text-[#A19793]"}`}
                checked={isChecked}
                onClick={handleCheckboxClick}
              >
                <span className="sarabun-font">
                  ตกลงยินยอมตามรายละเอียดข้อตกลงและเงื่อนไข
                </span>
              </Checkbox>
            </div>
          </form>


        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md flex justify-between align-bottom mt-auto space-x-2">
          <BackButton url="/mobile/login" />

          <div className="w-full max-w-md mt-auto py-2">
            <button
              // onClick={() => setIsSuccessModalVisible(true)}
              onClick={handleRegister}
              disabled={!isChecked}
              className="w-full py-3 bg-[#009845] rounded-lg text-white sarabun-font flex items-center justify-center space-x-2"
            >
              <span className="sarabun-font">ลงทะเบียน</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal RegisterPopup */}
      <ModalRegisterPopup
        visible={isModalVisible}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />

      {/* Modal Point */}
      {/* Success DynamicPopUp */}

      <DynamicPopUp
        visible={isSuccessModalVisible}
        onConfirm={() => {
          setIsSuccessModalVisible(false);
          //navigate("/mobile/verify");
          navigate("/mobile/main", { state: stageUser });
        }}
        src="/img/icons/check-circle.png"
        text={`<p class='text-[#8A8A8A] text-center sarabun-font'>ยินดีด้วย<br/>คุณลงทะเบียนสำเร็จ ได้รับ Welcome Point</p>
         <p class='text-[#009845] text-center text-[24px] font-bold sarabun-font'>${Number(receive_point).toLocaleString()} Point</p>`}
        confirmText="เริ่มใช้งานกันเลย !"
      />

      <DynamicPopUp
        visible={isFailModalVisible}
        onConfirm={() => setIsFailModalVisible(false)}
        src="/logo/Logo-Adama-Smile-2-New 1.png" // Replace with actual image path
        text="<p class='text-[#978B87] text-center sarabun-font'>ไม่สารมารถลงทะเบียนได้กรุณาตรวจสอบข้อมูล</p>"
        confirmText="ตกลง"
      />
    </MobileLayout>
  );
}
