import React, { useEffect, useState } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";

const SplideComponent = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const response = await useServiceAPI.get(paths.pathNewsPublicListByCategory, {
          category_id: "", // ดึงทั้งหมด
        });

        if (response.status === 200 && response.result) {
          const items = Array.isArray(response.data) ? response.data : [];

          // เรียง "ล่าสุด" ก่อน: มี created_at ใช้ created_at, ถ้าไม่มีก็ใช้งาน id (เลขมาก = ใหม่)
          const sorted = [...items].sort((a, b) => {
            if (a.created_at && b.created_at) {
              return new Date(b.created_at) - new Date(a.created_at);
            }
            const ai = Number(a.id) || 0;
            const bi = Number(b.id) || 0;
            return bi - ai;
          });

          // เลือกมา 5 รายการล่าสุด และกันรายการที่ไม่มีรูป
          const top5 = sorted.filter(it => !!it.logo).slice(0, 5);

          setPromotions(top5);
        } else {
          console.error("Failed to fetch promotions:", response);
          setPromotions([]);
        }
      } catch (error) {
        console.error("Error fetching promotions:", error);
        setPromotions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  return (
    <div className="w-full max-w-md mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[#00783F] text-lg font-semibold sarabun-font">
          ข่าวสารและโปรโมชั่น
        </h3>
        <button
          className="text-[#009845] sarabun-font text-sm"
          onClick={() => (window.location.href = "/mobile/promotion")}
        >
          ดูทั้งหมด
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">กำลังโหลด...</p>
      ) : promotions.length > 0 ? (
        <Splide
          options={{
            type: "loop",
            perPage: 1,
            perMove: 1,
            autoplay: true,
            interval: 5000,
            pagination: true,
            arrows: false,
            width: "100%",
            height: "200px",
          }}
          className="shadow-lg rounded-xl mb-5 mt-2"
        >
          {promotions.map((promo) => (
            <SplideSlide key={promo.id}>
              <img
                src={promo.logo}
                alt={promo.name || "promotion"}
                className="w-full h-[200px] object-cover rounded-xl"
                loading="lazy"
              />
            </SplideSlide>
          ))}
        </Splide>
      ) : (
        <p className="text-center text-gray-500">ไม่มีโปรโมชั่นในขณะนี้</p>
      )}
    </div>
  );
};

export default SplideComponent;
