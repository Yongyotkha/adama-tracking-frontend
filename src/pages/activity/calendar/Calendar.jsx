import React, { useEffect, useState } from "react";
import MainLayout from "../../../layouts/MainLayout";
import Calendar from "../../../components/calendar/Calendar";
import ActionButton from "../../../components/button/ActionButton";
import { useNavigate } from "react-router-dom";

export default function ActivityPlanList() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Example events passed via props
    const events = [
        {
          title: "Demo Plot",
          date: "2024-10-07",
          time: "08:00 - 10:00",
          location: "จิตสมานการเกษตร H3Q8+8FW",
          color: "#e3342f",
          icon: "⭐",
          attendees: [
            { name: "Alice", avatar: "https://via.placeholder.com/150" },
            { name: "Bob", avatar: "https://via.placeholder.com/150" },
            { name: "Charlie", avatar: "https://via.placeholder.com/150" },
            { name: "Daisy", avatar: "https://via.placeholder.com/150" },
          ],
        },
        {
          title: "Small FMT",
          date: "2024-10-07",
          time: "08:00 - 10:00",
          location: "จิตสมานการเกษตร H3Q8+8FW",
          color: "#3490dc",
          icon: "🔵",
          attendees: [
            { name: "Emily", avatar: "https://via.placeholder.com/150" },
            { name: "Frank", avatar: "https://via.placeholder.com/150" },
            { name: "Grace", avatar: "https://via.placeholder.com/150" },
          ],
        },
        {
          title: "Field Day",
          date: "2024-10-07",
          time: "08:00 - 10:00",
          location: "จิตสมานการเกษตร H3Q8+8FW",
          color: "#38c172",
          icon: "⭐",
          attendees: [],
        },
    ];
      
    return (
        <MainLayout loading={loading}>

            <div className="flex items-center justify-between">
                <div className="title-page">Calendar</div>
                <ActionButton mode="create" text="Create" onClick={(e) => navigate("/activity/create")} />
            </div>

            <div style={{ padding: "0px" }}>
                <Calendar events={events}/>
            </div>
        </MainLayout>
    );
}
