import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import DynamicCalendar from "../../../components/calendar/Calendar";
import ActionButton from "../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";

export default function ActivityCalendar() {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // Current month
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Current year
  const navigate = useNavigate();

  const fetchEvents = async (month, year) => {
    setLoading(true);
    try {
      const response = await useServiceAPI.get(paths.pathActivatyCalendarList, {
        platform: "web",
        keyword: "",
        month,
        year,
        user_id: "",
        dealer_id: "",
      });

      if (response.result) {
        const formattedEvents = response.data.map((item) => ({
          title: item.activity_type_name,
          date: item.document_date,
          time: `${item.time_start} - ${item.time_end}`,
          location: item.location_address || "N/A",
          color: item.activity_color,
          icon: "⭐",
          attendees: item.assing_user_list.map((user) => ({
            name: user.name,
            avatar: user.profile_image,
          })),
        }));
        setEvents(formattedEvents);
        // console.log(response);
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

  useEffect(() => {
    fetchEvents(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between">
        <div className="title-page">Calendar</div>
        <ActionButton mode="create" text="Create" onClick={() => navigate("/activity/create")} />
      </div>

      <DynamicCalendar
        events={events}
        fetchEvents={(month, year) => {
          setCurrentMonth(month);
          setCurrentYear(year);
        }}
        loading={loading}
      />
    </MainLayout>
  );
}
