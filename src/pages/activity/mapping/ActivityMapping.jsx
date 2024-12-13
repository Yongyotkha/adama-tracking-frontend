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

export default function ActivityMapping() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false); // Manage vertical collapse state
  // const [checkedFilters, setCheckedFilters] = useState({}); // Manage checked state for all filters
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
  const [dataterritory, setDataTerritory] = useState([]);
  const [dataArea, setDataArea] = useState([]);
  const [dataYear, setDataYear] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({
    lat: 0.0,
    lng: 0.0,
  });
  const [currentLocationAddress, setCurrentLocationAddress] = useState("");

  const [searchOptions, setSearchOptions] = useState([]);
  const [filteredData, setFilteredData] = useState("");

  // Fetch Data
  useEffect(() => {
    const loadDataMappingList = async () => {
      setLoading(true);
      try {
        const [mapping, activity, dealers, areas, years] = await Promise.all([
          useServiceAPI.post(paths.pathActivityMapList, {
            keyword: "",
            activity_type: [],
            dealer: [],
            area: [],
            year: [],
          }),
          useServiceAPI.get(paths.pathMasterActivityType, {
            status: "",
          }),
          useServiceAPI.get(paths.pathMasterDealerAll, {}),
          useServiceAPI.get(paths.pathMasterAreas, {}),
          useServiceAPI.get(paths.pathMasterYear, {}),
        ]);

        // Mapping Detail
        setDataMapping(mapping.data);

        // Set Locations
        const newLocations = mapping.data.map((data, index) => ({
          key: locations.length + 1,
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
    // {
    //   key: 3,
    //   filter_type: "area",
    //   filter_type_name: "Area",
    //   data: dataArea,
    // },
    // {
    //   key: 4,
    //   filter_type: "year",
    //   filter_type_name: "Year",
    //   data: dataYear,
    // },
  ];

  // สร้างค่าเริ่มต้นของ checkedFilters จาก mockFilters
  const getDefaultFilters = () => {
    const defaultFilters = {};
    mockFilters.forEach((filterItem) => {
      defaultFilters[filterItem.filter_type] = filterItem.data.map(
        (item) => item.id
      );
    });
    return defaultFilters;
  };
  const [checkedFilters, setCheckedFilters] = useState(getDefaultFilters()); // ตั้งค่าตอนเริ่มต้น

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

  // ฟังก์ชันสำหรับการเลือกหรือยกเลิกเลือกทั้งหมด
  const toggleAll = (isChecked) => {
    // console.log(isChecked);
    const updatedFilters = {};

    if (isChecked) {
      mockFilters.forEach((filterItem) => {
        updatedFilters[filterItem.filter_type] = isChecked
          ? filterItem.data.map((item) => item.id) // เลือกทั้งหมด
          : []; // ยกเลิกทั้งหมด
      });

    }

    setCheckedFilters(updatedFilters);
    setIsAllChecked(isChecked); // กำหนดสถานะของ "Check All" ให้ตรงกับตัวเลือก

    // Render MarkerLocation
    renderMarkerLocation();
  };

  const renderMarkerLocation = () => {
    // Set MarkerLocation
    setLocationMarkerIcon(
      locations.map((data, index) => ({
        key: locations.length + 1,
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
      }))
    );
  }

  const handleCheckboxChange = (filterType, id) => {
    setCheckedFilters((prevState) => {
      const newFilters = { ...prevState };

      if (!newFilters[filterType]) {
        newFilters[filterType] = [];
      }

      if (newFilters[filterType].includes(id)) {
        // Remove the item if it's already checked
        newFilters[filterType] = newFilters[filterType].filter((i) => i !== id);
      } else {
        // Add the item to the checked filter
        newFilters[filterType].push(id);
      }

      return newFilters;
    });
  };

  // ฟังก์ชันสำหรับการตรวจสอบว่าเลือกทั้งหมดหรือไม่
  useEffect(() => {
    const allFiltersSelected = mockFilters.every((filterItem) => {
      return filterItem.data.every((item) =>
        checkedFilters[filterItem.filter_type]?.includes(item.id)
      );
    });

    setIsAllChecked(allFiltersSelected); // ถ้าทุกตัวเลือกถูกเลือก ก็จะเป็น true
  }, [checkedFilters]);

  useEffect(() => {
    if (locations.length > 0) {
      renderMarkerLocation();
    }
  }, [locations, selected, locationWindowInfo]);

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
          const year =
            Array.isArray(checkedFilters.year) && checkedFilters.year.length > 0
              ? checkedFilters.year
              : [];

          const [mapping] = await Promise.all([
            useServiceAPI.post(paths.pathActivityMapList, {
              keyword: "",
              activity_type: activityType,
              dealer: dealer,
              area: area,
              year: year,
            }),
          ]);

          // Mapping Detail
          setDataMapping(mapping.data);

          // Set Locations
          setLocations(
            mapping.data.map((data, index) => ({
              key: locations.length + 1,
              id: locations.length + 1,
              document_number: data.document_number,
              title: data.activity_type_name,
              // lat: parseFloat(data.location_latitude),
              // lng: parseFloat(data.location_longitude),
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
    console.log(text);
    
    if (text) {
      // Filter names from dataMapping
      const results = dataMapping.filter((item) =>
        item.location_address.toLowerCase().includes(text.toLowerCase())
      );
 
      // Update search options for AutoComplete
      setSearchOptions(
        results.map((item) => ({
          value: item.location_address,
          lat: parseFloat(item.location_latitude),
          lng: parseFloat(item.location_longitude),
        }))
      );
    } else {
      setSearchOptions([]);
    }
  };

  const handleSelect = (value, option) => {
    // Set the map center to the selected lat and lng
    setCurrentLocation({ lat: option.lat, lng: option.lng });
    setDataMapZoom(15); // Set a higher zoom level for focusing
  };

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
                indeterminate={
                  Object.keys(checkedFilters).some(
                    (filterType) =>
                      checkedFilters[filterType].length > 0 &&
                      checkedFilters[filterType].length <
                      mockFilters.find((filter) => filter.filter_type === filterType).data
                        .length
                  )
                }
                checked={isAllChecked}
                onChange={(e) => toggleAll(e.target.checked)}
              >
                Check All
              </Checkbox>

              <Tooltip title="Reload data" placement="bottom">
                <img
                  src="/img/icons/reload.png"
                  alt="Reload Icon"
                  className="h-6 w-6 cursor-pointer"
                />
              </Tooltip>
            </div>

            {/* Collapsible Filter Categories */}
            <Collapse defaultActiveKey={["Activity Type"]} className="rounded-lg border-0">
              {mockFilters.map((category) => (
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
                      setCheckedFilters((prevFilters) => ({
                        ...prevFilters,
                        [category.filter_type]: list,
                      }));
                    }}
                    className="filter-checkbox-group"
                  />
                </Panel>
              ))}
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
              >
                {locationMarkerIcon.map((location, locationIndex) => (
                  <Marker
                    key={locationIndex}
                    position={{ lat: parseFloat(location.lat), lng: parseFloat(location.lng) }}
                    icon={{
                      url: location.activity_image_location,
                      scaledSize: { width: 30, height: 30 },
                    }}
                    onClick={() => {
                      // Set the location information for the InfoWindow
                      const newLocationWindowInfo = {
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
                      };                      
                      setlocationWindowInfo(newLocationWindowInfo);

                      // // Log the necessary details to the console
                      // console.log("Dealer Name:", newLocationWindowInfo.dealer_name);
                      // console.log("Address:", newLocationWindowInfo.address);
                      // console.log("Crops List:", newLocationWindowInfo.crop_list);
                      // console.log("Document Date Display:", newLocationWindowInfo.document_date_display);
                    }}
                  />

                ))}

                {locationWindowInfo && (
                  <InfoWindow
                    position={{ lat: parseFloat(locationWindowInfo.lat), lng: parseFloat(locationWindowInfo.lng) }}
                    onCloseClick={() => setlocationWindowInfo(null)}
                    options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="https://api-uat.adama.co.th/images/activity-type-mark-location/DemoPlot.png" className="w-6 h-6" alt="" />{locationWindowInfo.activity_type_name || "No Activity Type"}
                      </div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/shop.png" className="w-6 h-6" alt="" />{locationWindowInfo.dealer_name || "No Dealer Name"}
                      </div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/location.png" className="w-6 h-6" alt="" />{locationWindowInfo.address || "No Address Available"}
                      </div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/crops.png" className="w-6 h-6" alt="" />{locationWindowInfo.crop_list || "No Crops Listed"}
                      </div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/details.png" className="w-6 h-6" alt="" />{locationWindowInfo.document_date_display || "No Date Available"}
                      </div>
                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img src="/img/icons/shop.png" className="w-6 h-6" alt="" />
                        {locationWindowInfo.details || "No Description"}
                        {/* ถ้ามีตัวแปรจะให้อ่าน Html ลอง Search ใช้ Code นี้
                        dangerouslySetInnerHTML={{
                          __html: event.description || "<span>No description available</span>",
                        }} */}
                      </div>

                      <div className="flex items-center gap-2 mb-1 border-b pb-2">
                        <img
                          src={"/img/icons/default-avatar.png"}
                          alt={"No Name"}
                          className="w-6 h-6 rounded-full border border-gray-300"
                        />
                        <span>{"Unknown"}</span>
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
