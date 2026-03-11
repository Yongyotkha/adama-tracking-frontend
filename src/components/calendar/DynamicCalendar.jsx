import React, { useEffect, useState, useContext } from "react";
import { Select } from "antd";
import useServiceAPI from "../../services/CorsService";
import { paths } from "../../services/CorsPath";
import { Button, Tooltip, Popconfirm } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import ActionButton from "../button/ActionButton";
import BadgeStatus from "../badge/BadgeStatus";
import FormMappingModal from "../modal/FormMappingModal";

const DynamicCalendar = ({ events, fetchEvents, loading, sendData }) => {
  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [saleOptions, setSaleOptions] = useState([]);
  const [shopOptions, setShopOptions] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null); // Default value for SaleID
  const [selectedShop, setSelectedShop] = useState(null); // Default value for ShopID
  const { showNotification, userInfo } = useContext(AuthContext);

  const navigate = useNavigate(); // Initialize useNavigate

  const handleEdit = (documentNumber) => {
    navigate('/activity/edit', {
      state: {
        documentNumber: documentNumber,
        pageCode: 'activity_transaction',
      },
    });
  };

  const handleViewNewTab = (documentNumber) => {
    const targetUrl = `/activity/view?documentNumber=${encodeURIComponent(documentNumber)}&pageCode=activity_transaction&page_mode=view&from=calendar`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (documentNumber) => {
    try {
      // Call API to delete the event
      const response = await useServiceAPI.delete(
        `/activity/delete?document_number=${encodeURIComponent(documentNumber)}`
      );

      if (response.status === 200) {
        // Show success notification
        showNotification(
          "success",
          response.data.message || "Event deleted successfully!",
          response.data.message_line || ["The event has been removed."]
        );

        // Fetch the updated events for the current month and year
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth());
        setCurrentDate(newDate);
        fetchEvents(newDate.getMonth() + 1, newDate.getFullYear());
      } else {
        // Show error notification if response is not 200
        console.error("Failed to delete event:", response.message);
        showNotification(
          "error",
          response.message || "Failed to delete event.",
          response.message_line || ["Please try again later."]
        );
      }
    } catch (error) {
      // Handle errors and show an error notification
      console.error("Error deleting event:", error);
      showNotification("error", "An error occurred while deleting the event.", [
        "Please try again later.",
      ]);
    }
  };

  const handleActionButtonClick = () => {
    navigate("/activity/creates", {
      state: {
        pageCode: "activity_transaction",
        dateCalendar: selectedDate,
      },
    });
  };

  console.log(userInfo);

  useEffect(() => {
    const fetchSaleOptions = async () => {
      try {
        let send_sale = {
          status: "all",
        }
        if (userInfo.role_id == 3) {
          send_sale = {
            mode: "all",
          }
        }
        const response = await useServiceAPI.get(paths.pathMasterSaleTeam, send_sale);

        const saleList = response.data.map((item) => ({
          label: item.name,
          value: item.id,
          user_id: item.id,
          dealer_id: item.id,
        }));

        setSaleOptions(saleList);

        // 👇 หาก role_id === 4 ให้ set ค่า default เป็น userInfo.id
        if (userInfo.role_id == 4) {

          setSelectedSale(userInfo.id);
          handleSaleChange(userInfo.id);
          console.log('selected sale : ', userInfo.id)
        } else if (userInfo.role_id == 5 || userInfo.role_id == 6) {
          console.log('userInfo : ', userInfo)

          const headerResponse = await useServiceAPI.get(paths.pathMasterGetSaleHeader, {
            status: "all",
            user_id: userInfo.id,
          });
          console.log('header sale : ', headerResponse)
          const sale_header_id = parseInt(headerResponse.data.header_user_id)
          setSelectedSale(sale_header_id)
          handleSaleChange(sale_header_id)
          console.log('selected sale : ', sale_header_id)

        }

      } catch (error) {
        console.error("Error fetching Sale options:", error);
      }
    };

    fetchSaleOptions();
  }, [userInfo]);

  const handleSaleChange = async (saleId) => {
    // ✅ กด clear (saleId จะเป็น undefined)
    if (!saleId) {
      setSelectedSale(null);
      setSelectedShop(null);
      setShopOptions([]);

      // fetch all
      sendData({ saleId: "", shopId: "" });
      return;
    }

    setSelectedSale(saleId);

    // โหลด shop ตาม sale
    try {
      const response = await useServiceAPI.get(paths.pathMasterSubDealerAll, {
        user_id: saleId,
      });

      if (response.result) {
        setShopOptions(
          response.data.map((item) => ({
            label: item.sub_dealer_name,
            value: item.sub_dealer_id,
          }))
        );
      } else {
        setShopOptions([]);
      }
    } catch (e) {
      setShopOptions([]);
    }

    // reset shop เมื่อเปลี่ยน sale
    setSelectedShop(null);

    sendData({
      saleId,
      shopId: "",
    });
  };

  const handleShopChange = (shopId) => {
    // ✅ กด clear (shopId จะเป็น undefined)
    if (!shopId) {
      setSelectedShop(null);

      // fetch all ของ shop ภายใต้ sale เดิม (หรือถ้าอยาก all ทั้งหมดให้ส่ง saleId ด้วยเป็น "")
      sendData({ shopId: "" });
      return;
    }

    setSelectedShop(shopId);
    sendData({ shopId });
  };

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const daysInMonth = endOfMonth.getDate();
  const startDayOfWeek = (startOfMonth.getDay() + 6) % 7; // Adjust for Monday start

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

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    fetchEvents(newDate.getMonth() + 1, newDate.getFullYear());
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    fetchEvents(newDate.getMonth() + 1, newDate.getFullYear());
  };

  const handleDateClick = (date) => {
    const correctedDate = new Date(date);
    correctedDate.setDate(correctedDate.getDate() + 1); // Adjust the date
    setSelectedDate(correctedDate.toISOString().split("T")[0]);
  };

  const [isMappingModalVisible, setIsMappingModalVisible] = useState(false);
  const [mappingData, setMappingData] = useState({});
  const [perceptionData, setPerceptionData] = useState([]); // ดึง perception list

  const handleBadgeClick = (eventData) => {
    console.log(eventData);
    setMappingData(eventData);
    setIsMappingModalVisible(true);
  };

  useEffect(() => {
    const fetchPerception = async () => {
      try {
        const res = await useServiceAPI.get(paths.pathMasterPerception, {});
        setPerceptionData(res.data);
      } catch (error) {
        console.error("Failed to load perception data:", error);
      }
    };
    fetchPerception();
  }, []);


  const renderEventsForDate = (date) => {
    const dateEvents = events.filter((event) => event.date === date);

    if (dateEvents.length === 0) return null;

    return (
      <div className="flex flex-col gap-1 mt-2 w-full">
        {dateEvents.slice(0, 2).map((event, index) => (
          <div
            lang="th"
            key={index}
            className="flex items-center justify-between px-2 py-1 rounded-[10px] text-white text-sm"
            style={{ backgroundColor: event.color }}
          >
            <span>{event.title}</span>
            <div className="flex flex-col items-center gap-1">
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
                <span className="text-xs font-bold">
                  +{event.attendees.length - 3}
                </span>
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
      <header className="pb-3 bg-[#F5F3F3]">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex gap-2">
            </div>
          </div>
        </div>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-4 bg-[#F5F3F3]">
        <div className="col-span-1 md:col-span-2 lg:col-span-9 bg-[#F5F3F3]">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pb-2">
              <Button
                className="!bg-[#00783F] !text-white hover:!bg-[#005f32] !border-none"
                icon={<LeftOutlined />}
                onClick={handlePrevMonth}
              />
              <span className="px-4 py-2 bg-white text-gray-700 rounded font-semibold">
                {months[currentDate.getMonth()]}
              </span>
              <Button
                className="!bg-[#00783F] !text-white hover:!bg-[#005f32] !border-none"
                icon={<RightOutlined />}
                onClick={handleNextMonth}
              />
            </div>
            <span className="text-[25px] font-bold text-[#00783F] w-full block text-center mb-2">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
          </div>

          {view === "month" ? (
            <div className="rounded-xl shadow-md border-t mb-5">
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
                      <div className="text-start font-bold">
                        {date.getDate()}
                      </div>
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

                  const correctedDate = new Date(date);
                  correctedDate.setDate(correctedDate.getDate() + 1); // Add the same adjustment here
                  const isActive =
                    selectedDate === correctedDate.toISOString().split("T")[0];

                  return (
                    <div
                      key={`current-${index}`}
                      className={`border p-2 rounded cursor-pointer flex flex-col items-center justify-start min-h-[170px] transition ${isActive
                        ? "bg-gray-100 border-[#009845]"
                        : "bg-gray-50 hover:bg-green-100"
                        }`}
                      onClick={() =>
                        handleDateClick(date.toISOString().split("T")[0])
                      }
                    >
                      <div
                        className={`text-start font-bold w-full ${isActive ? "text-[#009845]" : "text-gray-700"
                          }`}
                      >
                        {index + 1}
                      </div>
                      {renderEventsForDate(
                        correctedDate.toISOString().split("T")[0]
                      )}
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
                      <div className="text-start font-bold">
                        {date.getDate()}
                      </div>
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
        <div className="col-span-1 md:col-span-1 lg:col-span-3 bg-[#F5F3F3] mb-5">
          <div className="flex justify-end items-center gap-4 pb-4">
            <Select
              lang="th"
              name="select_sale"
              className="min-w-[150px]"
              placeholder="Select a Sale Territory"
              options={[{ label: "All", value: "" }, ...saleOptions]}
              value={selectedSale}
              onChange={handleSaleChange}
              showSearch
              allowClear
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />

            <Select
              lang="th"
              className="min-w-[150px]"
              placeholder="Select a Shop"
              options={[{ label: "All", value: "" }, ...shopOptions]}
              value={selectedShop}
              onChange={handleShopChange}
              disabled={!selectedSale}   // ✅ clear แล้วจะ disabled
              showSearch
              allowClear
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>
          {selectedDate ? (
            <>
              <div
                className="border-t border-[#009845] rounded-xl p-3 bg-white shadow"
                style={{ borderTopWidth: "10px" }}
              >
                <div className="flex justify-between">
                  <h3 className="text-lg font-bold text-[#009845] mb-4">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </h3>
                  {/* {events.filter((event) => event.date === selectedDate).length === 0 && ( */}
                  <ActionButton
                    mode="add"
                    className="min-w-fit h-6"
                    style={{ gap: "0" }}
                    onClick={handleActionButtonClick} // Add onClick event handler
                  />
                  {/* )} */}
                </div>
                <div className="space-y-4">
                  {events.filter((event) => event.date === selectedDate)
                    .length > 0 ? (events
                      .filter((event) => event.date === selectedDate)
                      .map((event, index) => (
                        // console.log(event),
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md"
                        >
                          <div className="flex items-start gap-4 w-full">
                            <div className="w-full">
                              <div className="flex justify-between">
                                <div
                                  className={`h-10 flex items-center justify-between w-full`}
                                >
                                  <img
                                    src={event.icon}
                                    alt={event.title}
                                    className="w-6 h-6 rounded-full me-2"
                                  />
                                  <h4 className="text-md font-bold text-gray-800">
                                    {event.title}
                                  </h4>
                                  <BadgeStatus className="ms-auto"
                                    text={event.status_mapping.name}
                                    textColor={event.status_mapping.color}
                                    bgColor={event.status_mapping.background}
                                    onClick={() => handleBadgeClick(event)}
                                  />
                                </div>
                                <span className="px-3 py-1 border rounded-full text-sm text-gray-600 flex items-center hidden">
                                  {event.time}
                                </span>
                              </div>
                              <p lang="th" className="text-sm text-gray-600 flex">
                                <img src="/img/icons/location.png" className="h-6 w-6 me-2" alt="" />
                                {!event.location || event.location === "N/A" ? "-" : event.location}
                              </p>
                              <div className="flex items-center justify-between gap-2 mt-2">
                                <div className="flex items-center -space-x-2">
                                  {event.attendees
                                    .slice(0, 3)
                                    .map((attendee, idx) => (
                                      <img
                                        key={idx}
                                        src={attendee.avatar}
                                        alt={attendee.name}
                                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                                      />
                                    ))}
                                  {event.attendees.length > 3 && (
                                    <span
                                      lang="th"
                                      className="text-xs font-bold w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md"
                                    >
                                      +{event.attendees.length - 3}
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <Tooltip title="View" placement="bottom">
                                    <Popconfirm
                                      placement="leftTop"
                                      title={null}
                                      description={
                                        <div>
                                          <div className="flex items-center justify-between w-full gap-2">
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                                              <img
                                                src={event.icon} // Add icon before title
                                                alt="Event Icon"
                                                className="w-6 h-6"
                                              />
                                              {event.title}
                                            </h3>
                                            <BadgeStatus
                                              text={event.status_mapping.name}
                                              textColor={event.status_mapping.color}
                                              bgColor={event.status_mapping.background}
                                            />
                                          </div>
                                          <p
                                            lang="th"
                                            className="my-2 px-3 py-1 border rounded-full text-sm text-gray-600 flex items-center w-fit"
                                          >
                                            {new Date(
                                              event.date
                                            ).toLocaleDateString("th-TH", {
                                              weekday: "short",
                                              year: "numeric",
                                              month: "2-digit",
                                              day: "2-digit",
                                            })}
                                            {/* <span className="mx-1">|</span> */}
                                            {/* {event.time || "-"} */}
                                          </p>

                                          <p
                                            className="flex gap-1 mb-2 items-center mt-2"
                                          >
                                            <img
                                              src="/img/icons/details.png"
                                              className="h-6 w-6 me-2"
                                              alt=""
                                            />
                                            <a
                                              href={`/activity/view?documentNumber=${encodeURIComponent(event.document_number)}&pageCode=activity_transaction&page_mode=view&from=calendar`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[#00783F] font-semibold underline"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {event.document_number || "-"}
                                            </a>
                                          </p>
                                          <p
                                            lang="th"
                                            className="flex gap-1 mb-2 items-center"
                                          >
                                            <img
                                              src="/img/icons/shop.png"
                                              className="h-6 w-6 me-2"
                                              alt=""
                                            />
                                            {event.dealer_name || "-"}
                                          </p>

                                          <p
                                            lang="th"
                                            className="flex gap-1 mb-2 items-center"
                                          >
                                            <img
                                              src="/img/icons/location.png"
                                              className="h-6 w-6 me-2"
                                              alt=""
                                            />
                                            {/* {event.location || "-"} */}
                                            {!event.location || event.location === "N/A" ? "-" : event.location}
                                          </p>
                                          <p className="flex  gap-1 mb-2 items-center mt-2">
                                            <img
                                              src="/img/icons/crops.png"
                                              className="h-6 w-6 me-2"
                                              alt=""
                                            />
                                            {event.crops || "-"}
                                          </p>
                                          <p
                                            lang="th"
                                            className="flex gap-1 mb-2 items-top mt-2 max-w-md"
                                          >
                                            <img
                                              src="/img/icons/details.png"
                                              className="h-6 w-6 me-2"
                                              alt=""
                                            />
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html:
                                                  event.description ||
                                                  "<span>No description available</span>",
                                              }}
                                            />
                                          </p>

                                          {/* Attendees Section */}
                                          <div className="mt-2">
                                            {/* <p className="flex gap-1 mb-2 items-center">
                                              <img
                                                src="/img/icons/attendees.png"
                                                alt="Attendees Icon"
                                                className="h-6 w-6 me-2"
                                              />
                                              <span className="text-gray-600">Attendees</span>
                                            </p> */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                              {event.attendees.length > 0 ? (
                                                event.attendees.map(
                                                  (attendee, index) => (
                                                    <div
                                                      key={attendee.id || index}
                                                      className="flex items-center gap-2 px-2 py-1 bg-gray-100 rounded-lg shadow-md"
                                                    >
                                                      <img
                                                        src={
                                                          attendee.avatar ||
                                                          "/img/default-avatar.png"
                                                        }
                                                        alt={
                                                          attendee.name ||
                                                          "No Name"
                                                        }
                                                        className="w-8 h-8 rounded-full border border-gray-300"
                                                      />
                                                      <span className="text-sm text-gray-600">
                                                        {attendee.name ||
                                                          "Unknown"}
                                                      </span>
                                                    </div>
                                                  )
                                                )
                                              ) : (
                                                <span className="text-gray-500">
                                                  No attendees available
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* Conditionally render buttons */}
                                          {event.permission.edit && (
                                            <Button
                                              className="me-2 mt-2 border border-[#00783F] text-[#00783F] !border-[#00783F] !text-[#00783F] hover:!border-[#005f32] hover:!text-[#005f32]"
                                              icon={<EditOutlined />}
                                              onClick={() =>
                                                handleEdit(
                                                  event.document_number
                                                )
                                              } // Pass document_number
                                            >
                                              Edit
                                            </Button>
                                          )}
                                          {event.permission.btn_delete && (
                                            <Button
                                              className="me-2 border border-[#978B87] text-[#978B87] !border-[#978B87] !text-[#978B87] hover:!border-[red] hover:!text-[red]"
                                              icon={<DeleteOutlined />}
                                              onClick={() =>
                                                handleDelete(
                                                  event.document_number
                                                )
                                              } // Pass document_number
                                            >
                                              Delete
                                            </Button>
                                          )}
                                        </div>
                                      }
                                      okButtonProps={{
                                        style: { display: "none" },
                                      }} // Hide ok button
                                      cancelButtonProps={{
                                        style: { display: "none" },
                                      }} // Hide cancel button
                                    >
                                      <img
                                        src="/img/icons/view.png"
                                        alt="View"
                                        className="w-6 h-6 rounded-full border-2 border-white cursor-pointer"
                                      />
                                    </Popconfirm>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <img
                        src="/img/icons/schedule.png"
                        alt="No Events"
                        className="max-w-[150px] mt-4"
                      />
                      <p className="text-gray-500 mt-2">
                        Nothing was planned for the day.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div
              className="border-t border-[#009845] rounded-xl p-3 bg-white shadow flex flex-col items-center py-5"
              style={{ borderTopWidth: "10px" }}
            >
              <img
                src="/img/icons/schedule.png"
                alt="No Events"
                className="max-w-[150px] mt-4"
              />
              <p className="text-gray-500 mt-2">
                Select a date to view events.
              </p>
            </div>
          )}
        </div>
      </main>

      <FormMappingModal
        isVisible={isMappingModalVisible}
        onClose={() => setIsMappingModalVisible(false)}
        onOk={(data) => {
          const body = {
            document_number: data.document_number,
            location_longitude: data.location_longitude,
            location_latitude: data.location_latitude,
            location_address: data.location_address,
            perception_id: data.perception_id,
            remark: data.remark,
            image_list: data.image_list || ["defaultImage"],
          };

          useServiceAPI
            .put(paths.pathActivityMappingStatusDetailUpdate, body)
            .then((res) => {
              setIsMappingModalVisible(false);
              console.log("Mapping updated:", res);
            })
            .catch((err) => {
              console.error("Mapping update failed:", err);
            });
        }}
        title="Mapping"
        dataSource={mappingData}
        perceptionData={perceptionData}
      />

    </div>
  );
};

export default DynamicCalendar;
