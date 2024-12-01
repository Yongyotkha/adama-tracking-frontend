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

export default function ActivityMapping() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false); // Manage vertical collapse state
  const [checkedFilters, setCheckedFilters] = useState({}); // Manage checked state for all filters

  const [dataMapping, setDataMapping] = useState([]);
  const [locations, setLocations] = useState([]);
  const [activityType, setActivityType] = useState([]);
  const [dataDealer, setDataDealer] = useState([]);
  const [dataSubDealer, setDataSubDealer] = useState([]);
  const [dataterritory, setDataTerritory] = useState([]);
  const [dataArea, setDataArea] = useState([]);
  const [dataYear, setDataYear] = useState([]);

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

        console.log(mapping.data);
        setDataMapping(mapping.data);

        // Set Locations
        setLocations(
          mapping.data.map((data, index) => ({
            id: locations.length + 1,
            title: data.activity_type_name,
            lat: data.location_latitude,
            lng: data.location_longitude,
            details: data.location_address,
          }))
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
        
        // const [activityType, setActivityType] = useState([]);
        // const [dataDealer, setDataDealer] = useState([]);
        // const [dataSubDealer, setDataSubDealer] = useState([]);
        // const [dataterritory, setDataTerritory] = useState([]);
        // const [dataArea, setDataArea] = useState([]);
        // const [dataYear, setDataYear] = useState([]);
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

  const center = {
    lat: 13.736717,
    lng: 100.523186,
  };

  // const [activityType, setActivityType] = useState([]);
  // const [dataDealer, setDataDealer] = useState([]);
  // const [dataSubDealer, setDataSubDealer] = useState([]);
  // const [dataterritory, setDataTerritory] = useState([]);
  // const [dataArea, setDataArea] = useState([]);
  // const [dataYear, setDataYear] = useState([]);

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
  }, []);

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
    setQuery(text);
    if (text) {
      const results = locationData.filter((item) =>
        item.location_address.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(results);
    } else {
      setFilteredData([]);
    }
  };

  const isAllChecked = Object.keys(checkedFilters).every((category) =>
    Object.values(checkedFilters[category] || {}).every(Boolean)
  );

  return (
    <MainLayout loading={loading}>
      <Layout>
        {/* Filter Section */}
        <div
          className={`absolute z-20 left-5 top-[8.5rem] bg-white shadow-lg rounded-md transition-all duration-300 overflow-hidden ${
            isFilterCollapsed ? "max-h-12" : "max-h-auto"
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
          <div
            className={`transition-all duration-300 ${
              isFilterCollapsed ? "opacity-0" : "opacity-100"
            } p-4`}
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
              {Object.keys(mockFilters).map((category) => (
                <Panel header={category} key={category}>
                  <div className="flex flex-col space-y-2">
                    {mockFilters[category].map((item) => (
                      <Checkbox
                        key={item}
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
            <LoadScript googleMapsApiKey="AIzaSyDUeNLdnx0CqDtfCXRywGdcizCnBVCdwik">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={6}
              >
                {locations.map((location) => (
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
