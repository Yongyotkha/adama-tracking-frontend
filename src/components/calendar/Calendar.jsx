import React, { useEffect, useState } from "react";
import { Select } from "antd";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";

const Calendar = ({ events, fetchEvents, loading }) => {
  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // State for Sale Territory and Shop options
  const [saleOptions, setSaleOptions] = useState([]);
  const [shopOptions, setShopOptions] = useState([]);

  useEffect(() => {
    // Fetch Sale Territory options on mount
    const fetchSaleOptions = async () => {
      try {
        const response = await useServiceAPI.get(paths.pathMasterSaleDropdown, {
          status: "all",
        });
        setSaleOptions(
          response.data.map((item) => ({
            label: item.name,
            value: item.id,
          }))
        );
      } catch (error) {
        console.error("Error fetching Sale options:", error);
      }
    };

    fetchSaleOptions();
  }, []);

  const handleSaleChange = async (saleId) => {
    if (saleId) {
      try {
        const response = await useServiceAPI.get(paths.pathMasterDealerDropdown, {
          user_id: saleId,
        });
        setShopOptions(
          response.data.map((item) => ({
            label: item.name,
            value: item.id,
          }))
        );
      } catch (error) {
        console.error("Error fetching Shop options:", error);
      }
    } else {
      setShopOptions([]);
    }
  };

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const startDayOfWeek = startOfMonth.getDay();

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
    fetchEvents(newDate.getMonth() + 1, newDate.getFullYear());
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
    fetchEvents(newDate.getMonth() + 1, newDate.getFullYear());
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const renderEventsForDate = (date) => {
    const dateEvents = events.filter((event) => event.date === date);

    if (dateEvents.length === 0) return null;

    return (
      <div className="flex flex-col gap-1 mt-2 w-full">
        {dateEvents.slice(0, 2).map((event, index) => (
          <div
            key={index}
            className="flex items-center justify-between px-2 py-1 rounded text-white text-sm"
            style={{ backgroundColor: event.color }}
          >
            <span>{event.title}</span>
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {event.attendees.slice(0, 3).map((attendee, idx) => (
                  <img
                    key={idx}
                    src={attendee.avatar}
                    alt={attendee.name}
                    className="w-5 h-5 rounded-full border-2 border-white"
                  />
                ))}
              </div>
              {event.attendees.length > 3 && (
                <span className="text-xs font-bold">+{event.attendees.length - 3}</span>
              )}
            </div>
          </div>
        ))}
        {dateEvents.length > 2 && (
          <div className="px-2 py-1 rounded bg-gray-400 text-white text-center text-sm">
            +{dateEvents.length - 2}
          </div>
        )}
      </div>
    );
  };

  const renderWeeklyCalendar = () => {
    const startOfWeek = new Date(
      currentDate.setDate(currentDate.getDate() - currentDate.getDay())
    );

    return (
      <div className="grid grid-cols-8">
        <div className="border p-2 font-bold text-center bg-gray-200">Time</div>
        {weekdays.map((day, index) => {
          const date = new Date(startOfWeek);
          date.setDate(date.getDate() + index);

          return (
            <div
              key={day}
              className="border p-2 font-bold text-center bg-gray-200"
            >
              {day} <br />
              {date.toLocaleDateString("en-US", { day: "numeric" })}
            </div>
          );
        })}

        {Array.from({ length: 9 }, (_, i) => 9 + i).map((hour) => (
          <React.Fragment key={hour}>
            <div className="border-t border-r p-2 text-center bg-gray-100">
              {hour}:00
            </div>
            {weekdays.map((day, index) => {
              const date = new Date(startOfWeek);
              date.setDate(date.getDate() + index);

              return (
                <div
                  key={`${day}-${hour}`}
                  className="border-t border-r p-2 min-h-[60px] bg-white"
                >
                  {/* Events */}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-rows-[auto,1fr] h-screen">
      <header className="p-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded ${
                  view === "weekly" ? "bg-gray-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setView("weekly")}
              >
                Weekly
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  view === "month" ? "bg-green-600 text-white" : "bg-gray-200"
                }`}
                onClick={() => setView("month")}
              >
                Month
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handlePrevMonth}
              >
                &lt;
              </button>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded">
                {months[currentDate.getMonth()]}
              </span>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleNextMonth}
              >
                &gt;
              </button>
            </div>
          </div>
          <span className="text-lg font-bold text-green-600">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <div className="flex items-center gap-4">
            <Select
              className="w-40"
              placeholder="Select a Sale Territory"
              options={[{ label: "All", value: "all" }, ...saleOptions]}
              defaultValue="all"
              onChange={handleSaleChange}
            />
            <Select
              className="w-40"
              placeholder="Select a Shop"
              options={[{ label: "All", value: "all" }, ...shopOptions]}
              defaultValue="all"
              disabled={!shopOptions.length}
            />
          </div>
        </div>
      </header>
      <main className="grid grid-cols-12 gap-4 p-4 bg-gray-50">
        <div className="col-span-8">
          {view === "month" ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startDayOfWeek }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="border p-2 bg-gray-100 min-h-[170px]"
                />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const date = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  index + 1
                );

                return (
                  <div
                    key={index}
                    className="border p-2 rounded bg-gray-50 cursor-pointer flex flex-col items-center justify-start min-h-[170px] hover:bg-green-100 transition"
                    onClick={() => handleDateClick(date.toISOString().split("T")[0])}
                  >
                    <div className="text-right font-bold w-full text-gray-700">
                      {index + 1}
                    </div>
                    {renderEventsForDate(date.toISOString().split("T")[0])}
                  </div>
                );
              })}
            </div>
          ) : (
            renderWeeklyCalendar()
          )}
        </div>
        {/* Right Side: Event Details */}
        <div
          className="col-span-4 p-4 bg-gray-100 rounded shadow border-t border-green-600"
          style={{ borderTopWidth: "10px" }}
        >
          {selectedDate ? (
            <>
              <h3 className="text-lg font-bold text-green-600 mb-4">
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              <div className="space-y-4">
                {events
                  .filter((event) => event.date === selectedDate)
                  .map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 flex items-center justify-center rounded-full text-white`}
                          style={{ backgroundColor: event.color }}
                        >
                          <span className="text-xl font-bold">{event.icon || "⭐"}</span>
                        </div>
                        <div>
                          <h4 className="text-md font-bold text-gray-800">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            Location: {event.location}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex -space-x-2">
                              {event.attendees.slice(0, 3).map((attendee, idx) => (
                                <img
                                  key={idx}
                                  src={attendee.avatar}
                                  alt={attendee.name}
                                  className="w-6 h-6 rounded-full border-2 border-white"
                                />
                              ))}
                            </div>
                            {event.attendees.length > 3 && (
                              <span className="text-xs font-bold text-gray-600">
                                +{event.attendees.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="px-3 py-1 border rounded-full text-sm text-gray-600">
                          {event.time}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p>Select a date to view events.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Calendar;
