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
          category_id: "", // Send empty string to fetch all promotions
        });

        if (response.status === 200 && response.result) {
          setPromotions(response.data);
        } else {
          console.error("Failed to fetch promotions:", response);
        }
      } catch (error) {
        console.error("Error fetching promotions:", error);
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
          onClick={() => window.location.href = "/mobile/promotion"}
        >
          ดูทั้งหมด
        </button>
      </div>
      

      {loading ? (
        <p className="text-center text-gray-500">กำลังโหลด...</p>
      ) : (
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
          {promotions.length > 0 ? (
            promotions.map((promo) => (
              <SplideSlide key={promo.id}>
                <div className="flex flex-col items-center text-center">
                  <img
                    src={promo.logo}
                    alt={promo.name}
                    className="w-full max-w-full object-cover rounded-xl shadow-lg"
                  />
                  {/* <p className="mt-2 text-sm font-semibold">{promo.name}</p> */}
                  {/* <p className="text-xs text-gray-500">{promo.description_shot}</p> */}
                </div>
              </SplideSlide>
            ))
          ) : (
            <p className="text-center text-gray-500">ไม่มีโปรโมชั่นในขณะนี้</p>
          )}
        </Splide>
      )}
    </div>
  );
};

export default SplideComponent;
