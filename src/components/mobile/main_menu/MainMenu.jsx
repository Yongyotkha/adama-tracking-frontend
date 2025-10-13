import MenuButton from "../button/MenuButton";
import React, { useContext, useEffect, useState } from "react";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import { Spin } from "antd";
import { AuthContext } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const MainMenu = () => {
  const { userInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  console.log('location.state', location)
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathProfileDetail, {
          id: userInfo.id,
        });

        if (response.status === 200 && response.result) {
          console.log("hls:", response.data.count_sale_point);
          if (response.data.shop_type == 'dealer') {
            setMenuItems([
              {
                icon: "/img/icons/redeem-oa.png",
                text: "แลกคะแนนสะสม",
                url: "/mobile/redeem-point",
                count: response.data.count_sale_point, // << ตัวอย่างค่า
              },
              {
                icon: "/img/icons/history-oa.png",
                text: "ประวัติการซื้อสินค้า",
                url: "/mobile/order-history",
              },
              {
                icon: "/img/icons/history-redeem-oa.png",
                text: "ประวัติการแลกคะแนน",
                url: "/mobile/point-history",
              },
            ])
          } else {
            setMenuItems([
              {
                icon: "/img/icons/scan-collect-oa.png",
                text: "รับสินค้าเพื่อสะสมคะแนน",
                url: "/mobile/collect-points",
                count: response.data.count_sale_point, // << ตัวอย่างค่า
              },
              {
                icon: "/img/icons/redeem-oa.png",
                text: "แลกคะแนนสะสม",
                url: "/mobile/redeem-point",
                // count: 5, // << ตัวอย่างค่า
              },
              {
                icon: "/img/icons/history-oa.png",
                text: "ประวัติการซื้อสินค้า",
                url: "/mobile/order-history",
              },
              {
                icon: "/img/icons/history-redeem-oa.png",
                text: "ประวัติการแลกคะแนน",
                url: "/mobile/point-history",
              },
            ])

          }

        } else {
          console.error("Failed to fetch user profile:", response);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);


  return (
    <div className="w-full max-w-md my-4 pb-4 flex flex-col space-y-3">
      {menuItems.map((item, index) => (
        <MenuButton
          key={index}
          icon={item.icon}
          text={item.text}
          url={item.url}
          count={item.count || 0}   // << เพิ่มบรรทัดนี้
        />
      ))}
    </div>
  );
};

export default MainMenu;
