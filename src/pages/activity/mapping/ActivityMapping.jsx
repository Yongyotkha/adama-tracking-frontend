import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Layout, Checkbox, Button, Collapse } from "antd";
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
  const [checkedFilters, setCheckedFilters] = useState({}); // Manage checked state for all filters

  const [dataApiKey, setDataApiKay] = useState("AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik");

  const [dataMapZoom, setDataMapZoom] = useState(10);
  const [dataMapping, setDataMapping] = useState([]);
  const [locations, setLocations] = useState([]);
  const [activityType, setActivityType] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSubDealer, setDataSubDealer] = useState([]);
  const [dataterritory, setDataTerritory] = useState([]);
  const [dataArea, setDataArea] = useState([]);
  const [dataYear, setDataYear] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({ lat: 0.00, lng: 0.00 });
  const [currentLocationAddress, setCurrentLocationAddress] = useState("");

  const [searchOptions, setSearchOptions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch Data
  useEffect(() => {
    const loadDataMappingList = async () => {
      setLoading(true);
      try {
        const [mapping] = await Promise.all([
          useServiceAPI.get(paths.pathActivityMapList, {
            keyword: "",
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
            lat: parseFloat(data.location_latitude),
            lng: parseFloat(data.location_longitude),
            details: data.location_address,
          }))
        );

        setActivityType(
          mapping.data
            .filter(
              (value, index, self) =>
                self.findIndex((item) => item.activity_type_name === value.activity_type_name) === index
            )
            .map((data) => data.activity_type_name)
        );

        setDataDealer(
          mapping.data
            .filter(
              (value, index, self) =>
                self.findIndex((item) => item.dealer_name === value.dealer_name) === index
            )
            .map((data) => data.dealer_name)
        );

        setDataArea(
          mapping.data
            .filter(
              (value, index, self) =>
                self.findIndex((item) => item.area_name === value.area_name) === index
            )
            .map((data) => data.area_name)
        );

        setDataYear(
          mapping.data
            .filter(
              (value, index, self) =>
                self.findIndex((item) => item.year === value.year) === index
            )
            .map((data) => data.year)
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
  const mockFilters = {
    "Activity Type": activityType,
    Dealer: dataDealer,
    // "Sub Dealer": dataSubDealer,
    // Territory: dataterritory,
    Area: dataArea,
    Year: dataYear,
  };

  // Initialize all checkboxes as selected on page load
  useEffect(() => {
    // Set Current Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const fetchCurrentLocation = async () => {
            // ดึงข้อมูลที่อยู่จาก Google Maps Geocoding API
            const fetchedAddress = await fetchAddress(lat, lng);
            setCurrentLocationAddress(fetchedAddress);
          }
          fetchCurrentLocation();

          const getCurrentLocation = {
            key: locations.length + 1,
            id: locations.length + 1,
            document_number: "",
            title: "ตำแหน่งที่อยู่ปัจจุบัน",
            lat: lat,
            lng: lng,
            details: currentLocationAddress,
          };

          // Set State: ตำแหน่งปัจจุบัน
          setCurrentLocation(getCurrentLocation);
          // Set State: ตำแหน่งปัจจุบันและ Marker
          setLocations((prev) => [...prev, getCurrentLocation]);
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );

    }

    const initialCheckedFilters = {};
    Object.keys(mockFilters).forEach((category) => {
      initialCheckedFilters[category] = mockFilters[category].reduce(
        (acc, item) => {
          acc[item] = true;
          return acc;
        },
        {}
      );
    });
    setCheckedFilters(initialCheckedFilters);
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

  // Toggle a specific checkbox
  const toggleCheckbox = (category, item) => {
    setCheckedFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: !prev[category][item],
      },
    }));
    console.log(checkedFilters);
  };

  // Check/Uncheck all categories and items
  const toggleAll = (isChecked) => {
    const updatedFilters = {};
    Object.keys(mockFilters).forEach((category) => {
      updatedFilters[category] = mockFilters[category].reduce((acc, item) => {
        acc[item] = isChecked;
        return acc;
      }, {});
    });
    console.log(updatedFilters);

    setCheckedFilters(updatedFilters);
  };

  const handleSearch = (text) => {
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

  const isAllChecked = Object.keys(checkedFilters).every((category) =>
    Object.values(checkedFilters[category] || {}).every(Boolean)
  );

  return (
    <MainLayout loading={loading}>
      <Layout>
        {/* Filter Section */}
        <div
          className={`absolute z-20 left-5 top-[8.5rem] bg-white shadow-lg rounded-md transition-all duration-300 overflow-hidden ${isFilterCollapsed ? "max-h-12" : "max-h-auto"
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
          <div className="w-full mb-4 mt-2 px-2">
            <DynamicAutoComplete
              options={searchOptions}
              placeholder="Search locations"
              onSearch={handleSearch}
              onSelect={handleSelect} // Trigger when a location is selected
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div
            className={`transition-all duration-300 ${isFilterCollapsed ? "opacity-0" : "opacity-100"
              } px-4 pb-4`}
          >
            {/* Master "All" Checkbox */}
            <div className="flex justify-between">
              <Checkbox
                className="mb-4"
                checked={isAllChecked}
                onChange={(e) => toggleAll(e.target.checked)}
              >
                All
              </Checkbox>
              <img
                src="/img/icons/reload.png"
                alt=""
                className="h-6 w-6 cursor-pointer"
                onClick={{}}
              />
            </div>

            {/* Collapsible Filter Categories */}
            <Collapse defaultActiveKey={["Activity Type"]}>
              {Object.keys(mockFilters).map((category, categoryKey) => (
                <Panel header={category} key={categoryKey}>
                  <div className="flex flex-col space-y-2">
                    {mockFilters[category].map((item, itemKey) => (
                      <Checkbox
                        key={itemKey}
                        checked={checkedFilters[category]?.[item]}
                        onChange={() => toggleCheckbox(category, item)}
                      >
                        {item}
                      </Checkbox>
                    ))}
                  </div>
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
                {(filteredData.length > 0 ? filteredData : locations).map((location) => (
                  <Marker
                    key={location.id}
                    position={{ lat: location.lat, lng: location.lng }}
                    onClick={() => setSelected(location)}
                  />
                ))}

                {selected && (
                  <InfoWindow
                    position={{ lat: selected.lat, lng: selected.lng }}
                    onCloseClick={() => setSelected(null)}
                  >
                    <div>
                      <h3>{selected.title}</h3>
                      <p>{selected.details}</p>
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
