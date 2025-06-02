import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Layout, Checkbox, Button, Collapse, Tooltip } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import MainLayout from "../../../layouts/MainLayout";
import { useNavigate, useLocation } from "react-router-dom";
import useServiceAPI from "../../../services/CorsService";
import { paths } from "../../../services/CorsPath";
import DynamicAutoComplete from "../../../components/autocomplete/DynamicAutoComplete";
import dayjs from "dayjs";

export default function ActivityMapping() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false); // Manage vertical collapse state
  const [checkedFilters, setCheckedFilters] = useState({}); // Manage checked state for all filters
  const [isAllChecked, setIsAllChecked] = useState(true);

  const [dataApiKey, setDataApiKay] = useState(
    "AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik"
  );

  const [locations, setLocations] = useState([]);
  const [locationMarkerIcon, setLocationMarkerIcon] = useState([]);
  const [locationWindowInfo, setlocationWindowInfo] = useState(null);
  const [dataMapZoom, setDataMapZoom] = useState(10);
  const [dataMapping, setDataMapping] = useState([]);
  const [activityType, setActivityType] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSubDealer, setDataSubDealer] = useState([]);
  const [dataArea, setDataArea] = useState([]);
  const [dataYear, setDataYear] = useState([]);
  const [dataMonths, setDataMonths] = useState([]);


  const [currentLocation, setCurrentLocation] = useState({
    lat: 0.0,
    lng: 0.0,
  });

  const [currentLocationAddress, setCurrentLocationAddress] = useState("");

  const [searchOptions, setSearchOptions] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  // Fetch Data
  useEffect(() => {
    const loadDataMappingList = async () => {
      setLoading(true);
      try {
        const [mapping, activity, dealers, areas, years, subdealers, months] =
          await Promise.all([
            useServiceAPI.post(paths.pathActivityMapList, {
              keyword: "",
              activity_type: [],
              dealer: [],
              area: [],
              year: [],
              sub_dealers: [],
              month: [],
            }),
            useServiceAPI.get(paths.pathMasterActivityType, {
              status: "",
            }),
            useServiceAPI.get(paths.pathMasterDealerAll, {}),
            useServiceAPI.get(paths.pathMasterAreas, {}),
            useServiceAPI.get(paths.pathMasterYear, {}),
            useServiceAPI.get(paths.pathMasterSubDealer, {}),
            useServiceAPI.get(paths.pathMasterMonths, {}),

          ]);
        // Mapping Detail
        setDataMapping(mapping.data);

        // Set Locations
        const newLocations = mapping.data.map((data, index) => ({
          key: index + 1,
          id: locations.length + 1,
          document_number: data.document_number,
          title: data.activity_type_name,
          lat: data.location_latitude,
          lng: data.location_longitude,
          address: data.location_address,
          details: data.description,
          activity_type_id: data.activity_type_id,
          activity_type_name: data.activity_type_name,
          dealer_id: data.dealer_id,
          dealer_name: data.dealer_name,
          area_id: data.area_id,
          area_name: data.area_name,
          year: data.year,
          activity_image: data.activity_image,
          activity_image_location: data.activity_image_location,
          crop_id_list: data.crop_id_list,
          document_date_display: data.document_date_display,
          assing_user_list: data.assing_user_list,
          remark: data.remark,
        }));

        setLocations(newLocations);

        setActivityType(
          activity.data
            .filter(
              (value, index, self) =>
                self.findIndex((item) => item.name === value.name) === index
            )
            .map((data, index) => ({
              key: index,
              id: data.id,
              name: data.name,
            }))
        );

        setDataDealer(
          dealers.data
            .filter(
              (value, index, self) =>
                self.findIndex((item) => item.name === value.name) === index
            )
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((data, index) => ({
              key: index,
              id: data.id,
              name: data.name,
            }))
        );

        setDataArea(
          areas.data
            .filter(
              (value, index, self) =>
                self.findIndex((item) => item.name === value.name) === index
            )
            .map((data, index) => ({
              key: index,
              id: data.id,
              name: data.name,
            }))
        );

        setDataYear(
          years.data
            .filter(
              (value, index, self) =>
                self.findIndex((item) => item.name === value.name) === index
            )
            .map((data, index) => ({
              key: index,
              id: data.id,
              name: data.name,
            }))
        );

        setDataMonths(
          months.data
            .filter(
              (value, index, self) =>
                self.findIndex((item) => item.name === value.name) === index
            )
            .map((data, index) => ({
              key: index,
              id: data.id,
              name: data.name,
            }))
        );


        setDataSubDealer(
          subdealers.data
            .filter(
              (value, index, self) =>
                self.findIndex(
                  (item) => item.sub_dealer_name === value.sub_dealer_name
                ) === index
            )
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((data, index) => ({
              key: index,
              id: data.sub_dealer_id,
              name: data.sub_dealer_name,
            }))
        );
      } catch (error) {
        // showMsg("error", error.message || "เกิดข้อผิดพลาด");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadDataMappingList();
  }, []);

  const { Content } = Layout;
  const { Panel } = Collapse;

  const mapContainerStyle = {
    width: "100%",
    height: "100vh",
  };

  // Mock data for filter categories
  const mockFilters = [
    {
      key: 1,
      filter_type: "activity_type",
      filter_type_name: "Activity Type",
      data: activityType,
    },
    {
      key: 2,
      filter_type: "dealer",
      filter_type_name: "Dealer",
      data: dataDealer,
    },
    {
      key: 3,
      filter_type: "sub_dealers",
      filter_type_name: "Sub Dealer",
      data: dataSubDealer,
    },
    {
      key: 4,
      filter_type: "year",
      filter_type_name: "Years",
      data: dataYear,
    },
    {
      key: 5,
      filter_type: "month",
      filter_type_name: "Months",
      data: dataMonths,
    },
  ];

  console.log('mockFilters : ', mockFilters)

  // Initialize all checkboxes as selected on page load
  useEffect(() => {
    // Set Current Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude);
          const lng = parseFloat(position.coords.longitude);

          const fetchCurrentLocation = async () => {
            // ดึงข้อมูลที่อยู่จาก Google Maps Geocoding API
            const fetchedAddress = await fetchAddress(lat, lng);
            setCurrentLocationAddress(fetchedAddress);
          };
          fetchCurrentLocation();

          const getCurrentLocation = {
            key: locations.length + 1,
            id: locations.length + 1,
            document_number: "",
            title: "",
            lat: lat,
            lng: lng,
            details: currentLocationAddress,
          };

          // Set State: ตำแหน่งปัจจุบัน
          setCurrentLocation(getCurrentLocation);
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  }, [dataMapping]);

  // ดึงที่อยู่จาก Google Maps Geocoding API
  const fetchAddress = async (lat, lng) => {
    const apiKey = dataApiKey; // ใส่ Google Maps API Key ของคุณ
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address; // คืนค่าที่อยู่
      } else {
        console.error("Geocoding API error:", data.status);
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Error fetching address";
    }
  };

  const toggleAll = (isChecked) => {
    const updatedFilters = {};
    mockFilters.forEach((filterItem) => {
      updatedFilters[filterItem.filter_type] = isChecked
        ? filterItem.data.map((item) => item.id)
        : [];
    });
    setCheckedFilters(updatedFilters);
    setIsAllChecked(isChecked);
    // if (isChecked) {
    // setLocationMarkerIcon(locations);
    // } else {
    //   setLocationMarkerIcon([]);
    // }
  };

  useEffect(() => {
    if (locations.length > 0) {
      renderMarkerLocation();
    } else {
      setLocationMarkerIcon([]); // 👉 clear marker ด้วยถ้าไม่มี location
    }
    console.log("locations", locations);
  }, [locations]);


  useEffect(() => {
    console.log("locationMarkerIcon", locationMarkerIcon);
  }, [locationMarkerIcon]);

  const renderMarkerLocation = () => {
    // Set MarkerLocation
    setLocationMarkerIcon(
      locations.map((data, index) => ({
        key: index + 1,
        id: locations.length + 1,
        document_number: data.document_number,
        title: data.activity_type_name,
        lat: data.lat,
        lng: data.lng,
        address: data.address,
        details: data.description,
        activity_type_id: data.activity_type_id,
        activity_type_name: data.activity_type_name,
        dealer_id: data.dealer_id,
        dealer_name: data.dealer_name,
        area_id: data.area_id,
        area_name: data.area_name,
        year: data.year,
        activity_image: data.activity_image,
        activity_image_location: data.activity_image_location,
        crop_id_list: data.crop_id_list,
        document_date_display: data.document_date_display,
        assing_user_list: data.assing_user_list,
        remark: data.remark,
      }))
    );
  };

  // ฟังก์ชันสำหรับการตรวจสอบว่าเลือกทั้งหมดหรือไม่
  useEffect(() => {
    const allFiltersSelected = mockFilters.every((filterItem) => {
      return filterItem.data.every((item) =>
        checkedFilters[filterItem.filter_type]?.includes(item.id)
      );
    });

    setIsAllChecked(allFiltersSelected);
  }, [checkedFilters]);

  useEffect(() => {
    if (dataYear.length > 0) {
      setCheckedFilters((prev) => ({
        ...prev,
        year: [dataYear[0].id], // 👈 เลือก default ปีแรกใน list
      }));
    }
  }, [dataYear]);

  // Set New Marker
  useEffect(() => {
    if (checkedFilters != null) {
      const loadDataMappingList = async () => {
        setLoading(true);
        try {
          const activityType =
            Array.isArray(checkedFilters.activity_type) &&
              checkedFilters.activity_type.length > 0
              ? checkedFilters.activity_type
              : [];
          const dealer =
            Array.isArray(checkedFilters.dealer) &&
              checkedFilters.dealer.length > 0
              ? checkedFilters.dealer
              : [];
          const area =
            Array.isArray(checkedFilters.area) && checkedFilters.area.length > 0
              ? checkedFilters.area
              : [];
          // const year =
          //   Array.isArray(checkedFilters.year) && checkedFilters.year.length > 0
          //     ? checkedFilters.year
          //     : [];
          const sub_dealers =
            Array.isArray(checkedFilters.sub_dealers) &&
              checkedFilters.sub_dealers.length > 0
              ? checkedFilters.sub_dealers
              : [];
          // const month =
          //   Array.isArray(checkedFilters.month) && checkedFilters.month.length > 0
          //     ? checkedFilters.month
          //     : [];
          const year =
            Array.isArray(checkedFilters.year) && checkedFilters.year.length > 0
              ? checkedFilters.year.map(String) // 👈 แปลงให้เป็น string
              : [];

          const month =
            Array.isArray(checkedFilters.month) && checkedFilters.month.length > 0
              ? checkedFilters.month.map(String) // 👈 แปลงให้เป็น string
              : [];

          const [mapping] = await Promise.all([
            useServiceAPI.post(paths.pathActivityMapList, {
              keyword: searchKeyword,
              activity_type: activityType,
              dealer: dealer,
              area: area,
              year: year,
              month: month,
              sub_dealers: sub_dealers,
            }),
          ]);

          // Mapping Detail
          // setDataMapping(mapping.data);

          // Mapping Detail
          let filteredData = mapping.data;

          // Apply filtering based on year and month if selected
          if (year.length > 0 || month.length > 0) {
            filteredData = filteredData.filter((item) => {
              if (!item.document_date_display) return false;

              const date = dayjs(item.document_date_display);
              if (!date.isValid()) return false;

              const itemYear = date.year().toString();
              const itemMonth = (date.month() + 1).toString();

              const matchYear = year.length === 0 || year.includes(itemYear);
              const matchMonth = month.length === 0 || month.includes(itemMonth);

              return matchYear && matchMonth;
            });

          }

          setDataMapping(filteredData);

          // Set Locations
          // setLocations(
          //   mapping.data.map((data, index) => ({
          //     key: locations.length + 1,
          //     id: locations.length + 1,
          //     document_number: data.document_number,
          //     title: data.activity_type_name,
          //     lat: parseFloat(data.location_latitude),
          //     lng: parseFloat(data.location_longitude),
          //     // lat: data.location_latitude,
          //     // lng: data.location_longitude,
          //     address: data.location_address,
          //     details: data.description,
          //     activity_type_id: data.activity_type_id,
          //     activity_type_name: data.activity_type_name,
          //     dealer_id: data.dealer_id,
          //     dealer_name: data.dealer_name,
          //     area_id: data.area_id,
          //     area_name: data.area_name,
          //     year: data.year,
          //     activity_image: data.activity_image,
          //     activity_image_location: data.activity_image_location,
          //     crop_id_list: data.crop_id_list,
          //     document_date_display: data.document_date_display,
          //   }))
          // );
          setLocations(
            filteredData.map((data, index) => ({
              key: index + 1,
              id: index + 1, // Better to use index here instead of locations.length + 1
              document_number: data.document_number,
              title: data.activity_type_name,
              lat: parseFloat(data.location_latitude),
              lng: parseFloat(data.location_longitude),
              address: data.location_address,
              details: data.description,
              activity_type_id: data.activity_type_id,
              activity_type_name: data.activity_type_name,
              dealer_id: data.dealer_id,
              dealer_name: data.dealer_name,
              area_id: data.area_id,
              area_name: data.area_name,
              year: data.year,
              activity_image: data.activity_image,
              activity_image_location: data.activity_image_location,
              crop_id_list: data.crop_id_list,
              document_date_display: data.document_date_display,
              assing_user_list: data.assing_user_list ?? [], // 👈 MAKE SURE this is included
              remark: data.remark ?? "", // Optional fallback
            }))
          );

        } catch (error) {
          // showMsg("error", error.message || "เกิดข้อผิดพลาด");
          console.log(error);
        } finally {
          setLoading(false);
        }
      };

      loadDataMappingList();
    }
  }, [checkedFilters]);

  const handleSearch = (text) => {
    setSearchKeyword(text);

    if (text) {
      // ใช้ RegExp เพื่อค้นหาข้อความที่คล้ายกัน
      const regex = new RegExp(text, "i"); // 'i' หมายถึง case-insensitive
      console.log(regex);

      // ค้นหาใน dataMapping
      const results = dataMapping.filter(
        (item) => item.location_address && regex.test(item.location_address) // ค้นหาข้อความใน location_address
      );

      console.log(results);

      // อัปเดต options สำหรับ AutoComplete
      setSearchOptions(
        results.map((item) => ({
          value: item.location_address,
          lat: parseFloat(item.location_latitude),
          lng: parseFloat(item.location_longitude),
        }))
      );

      // อัปเดต checkbox ให้ตรงกับผลลัพธ์
      const updatedFilters = { ...checkedFilters };
      mockFilters.forEach((filterCategory) => {
        const matchingIds = results
          .map((result) => result[filterCategory.filter_type + "_id"])
          .filter((id) => id !== undefined); // ลบค่าที่เป็น undefined

        updatedFilters[filterCategory.filter_type] = [
          ...(updatedFilters[filterCategory.filter_type] || []),
          ...matchingIds,
        ].filter((id, index, self) => self.indexOf(id) === index); // ลบค่าซ้ำ
      });

      setCheckedFilters(updatedFilters);
    } else {
      setSearchOptions([]);
    }
  };

  const handleSelect = (value, option) => {
    // Set the map center to the selected lat and lng
    setCurrentLocation({ lat: option.lat, lng: option.lng });
    setDataMapZoom(15); // Set a higher zoom level for focusing
  };

  useEffect(() => {
    console.log(locationWindowInfo);
  }, [locationWindowInfo]);

  return (
    <MainLayout loading={loading}>
      <Layout>
        {/* Filter Section */}
        <div
          className={`absolute z-20 left-5 top-[8.5rem] bg-white shadow-lg rounded-md transition-all duration-300 overflow-hidden ${isFilterCollapsed ? "max-h-12" : "max-h-[600px] overflow-y-auto"
            }`}
          style={{ width: "300px" }}
        >
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <div className="flex items-center gap-2">
              <img
                src="/img/icons/filter-green.png"
                alt="Filter Icon"
                className="w-5 h-5"
              />
              <span className="text-lg text-[#00783F]">Filter</span>
            </div>
            <Button
              type="text"
              icon={isFilterCollapsed ? <DownOutlined /> : <UpOutlined />}
              onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
            />
          </div>
          {/* Search Box */}
          <div className="w-full my-2 px-2">
            <DynamicAutoComplete
              options={searchOptions}
              placeholder="Search locations (Min length 3)"
              onSearch={handleSearch}
              onSelect={handleSelect} // Trigger when a location is selected
              className="w-full rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              style={{ width: "100%" }}
            />
          </div>

          <div
            className={`transition-all duration-300 ${isFilterCollapsed ? "opacity-0" : "opacity-100"
              } px-3 pb-4`}
          >
            {/* Master "All" Checkbox */}
            <div className="flex justify-between">
              <Checkbox
                indeterminate={Object.keys(checkedFilters).some(
                  (filterType) =>
                    checkedFilters[filterType].length > 0 &&
                    checkedFilters[filterType].length <
                    mockFilters.find(
                      (filter) => filter.filter_type === filterType
                    ).data.length
                )}
                // checked={isAllChecked}
                onChange={(e) => toggleAll(e.target.checked)}
              >
                Check All
              </Checkbox>

              <Tooltip title="Reload data" placement="bottom">
                <img
                  src="/img/icons/reload.png"
                  alt="Reload Icon"
                  className="h-6 w-6 cursor-pointer"
                  onClick={() => renderMarkerLocation()} // 👈 ตรงนี้แหละ!
                />
              </Tooltip>

            </div>

            {/* Collapsible Filter Categories */}
            <Collapse
              defaultActiveKey={["Activity Type"]}
              className="rounded-lg border-0"
            >
              {mockFilters.map((category) => {
                // console.log(category); // Log the full category object

                return (
                  <Panel
                    header={category.filter_type_name}
                    key={category.key}
                    className="custom-collapse my-2"
                  >
                    <Checkbox.Group
                      options={category.data.map((item) => ({
                        label: item.name,
                        value: item.id,
                      }))}
                      value={checkedFilters[category.filter_type]}
                      onChange={(list) => {
                        console.log(list, category.filter_type);

                        setCheckedFilters((prevFilters) => ({
                          ...prevFilters,
                          [category.filter_type]: list,
                        }));
                      }}
                      className="filter-checkbox-group"
                    />
                  </Panel>
                );
              })}

            </Collapse>
          </div>
        </div>

        {/* Map Section */}
        <Layout>
          <Content>
            <LoadScript googleMapsApiKey={dataApiKey}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={currentLocation}
                zoom={dataMapZoom}
                options={{
                  styles: [
                    {
                      featureType: "poi", // Points of Interest
                      stylers: [{ visibility: "off" }], // Turn off POI visibility
                    },
                  ],
                }}
              >
                {locationMarkerIcon.length > 0 &&
                  locationMarkerIcon.map((location, locationIndex) => (
                    <Marker
                      key={crypto.randomUUID()}
                      position={{
                        lat: parseFloat(location.lat),
                        lng: parseFloat(location.lng),
                      }}
                      icon={{
                        url: location.activity_image_location,
                        scaledSize: { width: 25.5, height: 35 },
                      }}
                      options={{
                        suppressInfoWindow: true, // ปิดการแสดง InfoWindow เริ่มต้น
                      }}
                      onClick={() => {
                        const newLocationWindowInfo = {
                          url_img: location.activity_image,
                          lat: parseFloat(location.lat),
                          lng: parseFloat(location.lng),
                          address: location.address,
                          title: location.title || "No Title",
                          details: location.details || "No Details",
                          activity_type_name: location.activity_type_name,
                          dealer_name: location.dealer_name,
                          area_name: location.area_name,
                          crop_list: location.crop_id_list,
                          document_date_display: location.document_date_display,
                          assing_user_list: location.assing_user_list,
                          remark: location.remark,
                          document_number: location.document_number,
                        };
                        setlocationWindowInfo(newLocationWindowInfo);
                        console.log(
                          "newLocationWindowInfo",
                          newLocationWindowInfo
                        );
                      }}
                    />
                  ))}

                {locationWindowInfo && (
                  <InfoWindow
                    position={{
                      lat: parseFloat(locationWindowInfo.lat),
                      lng: parseFloat(locationWindowInfo.lng),
                    }}
                    onCloseClick={() => setlocationWindowInfo(null)}
                    options={{
                      pixelOffset: new window.google.maps.Size(0, -30),
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img
                          src={locationWindowInfo.url_img}
                          className="w-6 h-6"
                          alt=""
                        />
                        {locationWindowInfo.activity_type_name ||
                          "No Activity Type"}
                        <img
                          src="/img/icons/view.png"
                          alt="View"
                          className="w-6 h-6 rounded-sm cursor-pointer ms-5"
                          onClick={() => {
                            navigate("/activity/view", {
                              state: {
                                documentNumber:
                                  locationWindowInfo.document_number,
                                pageCode: "activity_transaction",
                              },
                            });
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img
                          src="/img/icons/shop.png"
                          className="w-6 h-6"
                          alt=""
                        />
                        {locationWindowInfo.dealer_name || "No Dealer Name"}
                      </div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img
                          src="/img/icons/location.png"
                          className="w-6 h-6"
                          alt=""
                        />
                        {locationWindowInfo.address || "No Address Available"}
                      </div>
                      {/* <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/crops.png" className="w-6 h-6" alt="" />{locationWindowInfo.crop_id_list || "No Crops Listed"}
                      </div> */}
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img
                          src="/img/icons/crops.png"
                          className="w-6 h-6"
                          alt=""
                        />
                        {locationWindowInfo.crop_list &&
                          locationWindowInfo.crop_list.length > 0
                          ? locationWindowInfo.crop_list
                            .map((crop) => crop.name)
                            .join(", ")
                          : "No Crops Listed"}
                      </div>

                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img
                          src="/img/icons/calendar.png"
                          className="w-6 h-6"
                          alt=""
                        />
                        {locationWindowInfo.document_date_display ||
                          "No Date Available"}
                      </div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img
                          src="/img/icons/details.png"
                          className="w-6 h-6"
                          alt=""
                        />
                        {locationWindowInfo.remark || "No Description"}
                      </div>

                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        {/* <img
                          src={"/img/icons/default-avatar.png"}
                          alt={"No Name"}
                          className="w-6 h-6 rounded-full border border-gray-300"
                        /> */}
                        {Array.isArray(locationWindowInfo?.assing_user_list) &&
                          locationWindowInfo.assing_user_list.length > 0 ? (
                          locationWindowInfo.assing_user_list.map((user) => (
                            <div key={user.id} className="flex items-center gap-2">
                              <img
                                src={user.profile_image || "/img/icons/default-avatar.png"}
                                alt={user.name}
                                className="w-6 h-6 rounded-full border border-gray-300"
                              />
                              <span className="text-sm text-gray-700">{user.name}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No assigned users</span>
                        )}

                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </Content>
        </Layout>
      </Layout>
    </MainLayout>
  );
}
