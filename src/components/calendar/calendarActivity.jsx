import React, { useState, useEffect } from "react";

const Calendar = ({ selectedYear, selectedMonth, events }) => {
  const [days, setDays] = useState([]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Generate days for the selected month
  useEffect(() => {
    const generateDays = () => {
      const firstDay = new Date(selectedYear, months.indexOf(selectedMonth), 1);
      const lastDay = new Date(selectedYear, months.indexOf(selectedMonth) + 1, 0);

      const daysArray = [];
      for (let i = 1; i <= lastDay.getDate(); i++) {
        daysArray.push(new Date(selectedYear, months.indexOf(selectedMonth), i));
      }
      setDays(daysArray);
    };

    generateDays();
  }, [selectedYear, selectedMonth]);

  const formatDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  // Render Badge Events in a single row
  const renderBadges = (badgeEvents) => (
    <div
      style={{
        display: "flex",
        flexWrap: "nowrap",
        gap: "5px",
        overflow: "hidden",
      }}
    >
      {badgeEvents.map((event, index) => (
        <div
          key={index}
          style={{
            backgroundColor: event.color,
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {event.icons[0] || "?"}
        </div>
      ))}
    </div>
  );

  // Render Ribbon Events in a column
  const renderRibbons = (ribbonEvents) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      {ribbonEvents.map((event, index) => (
        <div
          key={index}
          style={{
            backgroundColor: event.color,
            borderRadius: "5px",
            padding: "5px",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "12px",
            justifyContent: "space-between",
          }}
        >
          <span>{event.title}</span>
          <div style={{ display: "flex", gap: "3px" }}>
            {event.icons.map((icon, i) => (
              <span key={i}>{icon}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", border: "1px solid #ddd" }}>
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div
          key={day}
          style={{
            fontWeight: "bold",
            textAlign: "center",
            padding: "5px",
            background: "#00783F",
            color: "white",
          }}
        >
          {day}
        </div>
      ))}

      {/* Fill empty cells for days before the first day of the month */}
      {Array.from({ length: new Date(selectedYear, months.indexOf(selectedMonth), 1).getDay() }).map((_, index) => (
        <div key={`empty-${index}`} style={{ padding: "5px", background: "#f5f5f5" }}></div>
      ))}

      {/* Render days */}
      {days.map((day) => {
        const formattedDate = formatDate(day);
        const dayEvents = events[formattedDate] || [];
        const badgeEvents = dayEvents.filter((event) => event.type === "badge");
        const ribbonEvents = dayEvents.filter((event) => event.type === "ribbon");

        // Limit to first 3 events (Badge and Ribbon combined)
        const visibleEvents = dayEvents.slice(0, 3);
        const hiddenEventCount = dayEvents.length - visibleEvents.length;

        return (
          <div
            key={formattedDate}
            style={{
              border: "1px solid #ddd",
              padding: "5px",
              minHeight: "80px",
              position: "relative",
            }}
          >
            <div style={{ textAlign: "right", fontWeight: "bold" }}>{day.getDate()}</div>

            {/* Render Badge Events */}
            {badgeEvents.length > 0 && renderBadges(badgeEvents.slice(0, 3))}

            {/* Render Ribbon Events */}
            {ribbonEvents.length > 0 && renderRibbons(ribbonEvents.slice(0, 3 - badgeEvents.length))}

            {/* Show "+X more" if there are hidden events */}
            {hiddenEventCount > 0 && (
              <div
                style={{
                  marginTop: "5px",
                  fontSize: "10px",
                  textAlign: "center",
                  color: "#888",
                }}
              >
                +{hiddenEventCount} more
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const CalendarApp = ({ events }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1></h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{
              color: '#00783F',
              padding: "5px",
              border: "1px solid #00783F",
              borderRadius: "5px",
            }}
          >
            {Array.from({ length: 11 }, (_, index) => {
              const y = new Date().getFullYear() - 5 + index;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{
              color: '#00783F',
              padding: "5px",
              border: "1px solid #00783F",
              borderRadius: "5px",
            }}
          >
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Calendar selectedYear={year} selectedMonth={month} events={events} />
    </div>
  );
};

export default CalendarApp;
