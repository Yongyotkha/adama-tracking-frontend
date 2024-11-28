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
            className="flex items-center justify-between px-2 py-1 rounded-[10px] text-white text-sm"
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
      <header className="p-4 bg-[#F5F3F3]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded ${view === "weekly" ? "bg-gray-500 text-white" : "bg-gray-200"
                  }`}
                onClick={() => setView("weekly")}
              >
                Weekly
              </button>
              <button
                className={`px-4 py-2 rounded ${view === "month" ? "bg-green-600 text-white" : "bg-gray-200"
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
              <span className="px-4 py-2 bg-white text-gray-700 rounded font-semibold">
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
            // disabled={!shopOptions.length}
            />
          </div>
        </div>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-4 bg-[#F5F3F3]">
        <div className="col-span-1 md:col-span-2 lg:col-span-9 bg-[#F5F3F3]">
          {view === "month" ? (
            <div className="rounded-xl shadow-md border-t">
              {/* Header of the calendar */}
              <div className="grid grid-cols-7 bg-gray-100 text-gray-600 font-bold text-center py-2 rounded-t-xl">
                {weekdays.map((day) => (
                  <div key={day} className="p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 rounded-[20px]">
                {/* Days from the previous month */}
                {Array.from({ length: startDayOfWeek }).map((_, index) => {
                  const date = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    -startDayOfWeek + index + 1
                  );
                  return (
                    <div
                      key={`prev-${index}`}
                      className="border p-2 bg-[#CBC5C3] text-gray-500 min-h-[170px]"
                    >
                      <div className="text-start font-bold">{date.getDate()}</div>
                    </div>
                  );
                })}

                {/* Days of the current month */}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const date = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    index + 1
                  );
                  const isActive = selectedDate === date.toISOString().split("T")[0];

                  return (
                    <div
                      key={`current-${index}`}
                      className={`border p-2 rounded cursor-pointer flex flex-col items-center justify-start min-h-[170px] transition ${isActive ? "bg-gray-100 border-green-600" : "bg-gray-50 hover:bg-green-100"
                        }`}
                      onClick={() => handleDateClick(date.toISOString().split("T")[0])}
                    >
                      <div
                        className={`text-start font-bold w-full ${isActive ? "text-green-600" : "text-gray-700"
                          }`}
                      >
                        {index + 1}
                      </div>
                      {renderEventsForDate(date.toISOString().split("T")[0])}
                    </div>
                  );
                })}

                {/* Fill up remaining cells to ensure 5 rows */}
                {Array.from({
                  length: Math.max(0, 35 - (startDayOfWeek + daysInMonth)),
                }).map((_, index) => {
                  const date = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    index + 1
                  );
                  return (
                    <div
                      key={`next-${index}`}
                      className="border p-2 bg-[#CBC5C3] text-gray-500 min-h-[170px]"
                    >
                      <div className="text-start font-bold">{date.getDate()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            renderWeeklyCalendar()
          )}

        </div>

        {/* Right Side: Event Details */}
        <div className="col-span-1 md:col-span-1 lg:col-span-3 p-4 bg-white rounded-xl shadow border-t border-green-600"
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
                          <div className="flex justify-between">
                            <h4 className="text-md font-bold text-gray-800">{event.title}</h4>
                            <span className="px-3 py-1 border rounded-full text-sm text-gray-600">
                              {event.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 flex">
                            <img src="/img/icons/location.png" className="h-6 w-6" alt="" /> {event.location}
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
