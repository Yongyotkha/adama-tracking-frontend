import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import DynamicCalendar from "../../../components/calendar/DynamicCalendar";
import ActionButton from "../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function ActivityCalendar() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [userId, setUserId] = useState("");
  const [dealerId, setDealerId] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // Current month
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Current year
  const navigate = useNavigate();

  const fetchEvents = async (month, year) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathActivityCalendarList, {
        platform: "web",
        keyword: "",
        month,
        year,
        user_id: userId || "",
        dealer_id: dealerId || "",
      });

      console.log(response);

      if (response.result) {

        const formattedEvents = response.data.map((item) => ({
          title: item.activity_type_name,
          date: item.document_date,
          time:
            (item.time_start && item.time_end)
              ? `${item.time_start} - ${item.time_end}`
              : new Date(item.created_at).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              }),
          location: item.location_address || "-",
          color: item.activity_color,
          icon: item.activity_image || "https://via.placeholder.com/50",
          crops: item.crop_id_list.map((crop) => crop.name).join(", "),
          description: item.description,
          attendees: item.assing_user_list.map((user) => ({
            name: user.name,
            avatar: user.profile_image,
          })),
          permission: {
            edit: item.permission?.edit || false,
            btn_delete: item.permission?.btn_delete || false,
          },
          document_number: item.document_number,
          dealer_name: item.dealer_name,
          status_mapping: {
            name: item.status_mapping_name,
            color: item.status_mapping_color,
            background: item.status_mapping_bg_color,
          },
        }));

        // console.log(formattedEvents);
        setEvents(formattedEvents);


      } else {
        console.error("Error fetching events:", response.message);
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };


  const receiveData = (data) => {
    if (data.saleId !== undefined) {
      setUserId(data.saleId);
    }

    if (data.shopId !== undefined) {
      setDealerId(data.shopId);
    }

    console.log("Updated data:", { saleId: data.saleId, shopId: data.shopId });
  };

  useEffect(() => {
    fetchEvents(currentMonth, currentYear);
  }, [currentMonth, currentYear, userId, dealerId]);

  return (
    <MainLayout loading={loading}>
      {/* <div className="flex items-center justify-between">
        <div className="title-page">Calendar</div>
        <ActionButton
          mode="create"
          text="Create"
          onClick={() => navigate("/activity/create?pageCode=activity_transaction")}
        />
      </div> */}

      <DynamicCalendar
        events={events}
        fetchEvents={(month, year) => {
          setCurrentMonth(month);
          setCurrentYear(year);
          fetchEvents(month, year); // Trigger fetch with updated parameters
        }}
        loading={loading}
        sendData={(data) => {
          setUserId(data.saleId || ""); // Handle empty or undefined saleId
          setDealerId(data.shopId || ""); // Handle empty or undefined shopId
        }}
      />

    </MainLayout>
  );
}
