import { Outlet, useNavigate  } from "react-router-dom";
import { useEffect, useState } from "react";
import liff from "@line/liff"; // ตรวจสอบให้แน่ใจว่ามีการติดตั้ง `@line/liff`

const LineOARoute = () => {
  const navigate = useNavigate(); // ใช้เพื่อเปลี่ยนเส้นทางไปยัง CheckLogin
  const [userId, setUserId] = useState("");



  useEffect(() => {
    const initLIFF = async () => {
      try {
        await liff.init({ liffId: "2007054859-ln0D549D", withLoginOnExternalBrowser: true });

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          // console.log("LINE Profile:", profile);
          // console.log(profile.userId);
          setUserId(profile.userId);
          
        } else {
          liff.login();
        }
      } catch (error) {
        console.error("LIFF Initialization Failed:", error);
      }
    };
    fetchCheckLoging(userId);

    initLIFF();
  }, []);


  useEffect(() => {
    if (userId) {
      fetchCheckLoging(userId);
    }
  }, [userId]); // ทำให้ fetchCheckLoging ทำงานเมื่อ userId เปลี่ยนแปลง

  
  const fetchCheckLoging = async (userId) => {
    try {
      console.log("userId",userId);
      
      // const response = await useServiceAPI.get(`${paths.pathSaleManagementProductsUpdate}/${userId}`);
      // if (response.status === 200) {
      //   navigate("/dashboard"); // ไปที่หน้า Dashboard ถ้าพบข้อมูล
      // } else {
      //   navigate("/mobile/verify"); // ไปที่หน้า verify ถ้าไม่พบข้อมูล
      // }
    } catch (error) {
      console.error("Error checking userId:", error);
      navigate("/mobile/verify"); // กรณี error ก็ให้ไปหน้า verify
    }
  };


  
  return <Outlet />;
};

export { LineOARoute };
