import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { Layout, Checkbox, Button, Collapse } from "antd";
import { UpOutlined, DownOutlined } from "@ant-design/icons";
import MainLayout from "../../../layouts/MainLayout";

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

const locations = [
  { id: 1, title: "Demo Plot", lat: 13.736717, lng: 100.523186, details: "H3Q8+8FW ตำบล กุรุพุ่ง อำเภอ สันเขา" },
  { id: 2, title: "Small FMT", lat: 14.736717, lng: 101.523186, details: "Sample Address 2" },
];

// Mock data for filter categories
const mockFilters = {
  "Activity Type": ["Demo Plot", "Small FMT", "Big FMT", "Key FMT", "ADAMA Day"],
  Dealer: ["Dealer 1", "Dealer 2", "Dealer 3", "Dealer 4"],
  "Sub Dealer": ["Sub Dealer 1", "Sub Dealer 2", "Sub Dealer 3"],
  Territory: ["North", "South", "East", "West"],
  Area: ["Area 1", "Area 2"],
  Year: ["2023", "2024"],
};

export default function ActivityMapping() {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false); // Manage vertical collapse state
  const [checkedFilters, setCheckedFilters] = useState({}); // Manage checked state for all filters

  // Initialize all checkboxes as selected on page load
  useEffect(() => {
    const initialCheckedFilters = {};
    Object.keys(mockFilters).forEach((category) => {
      initialCheckedFilters[category] = mockFilters[category].reduce((acc, item) => {
        acc[item] = true;
        return acc;
      }, {});
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
    setCheckedFilters(updatedFilters);
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
            isFilterCollapsed ? "max-h-12" : "max-h-[500px]"
          }`}
          style={{ width: "300px" }}
        >
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <h2 className="text-lg font-semibold">Filter</h2>
            <Button
              type="text"
              icon={isFilterCollapsed ? <DownOutlined /> : <UpOutlined />}
              onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
            />
          </div>
          <div className={`transition-all duration-300 ${isFilterCollapsed ? "opacity-0" : "opacity-100"} p-4`}>
            {/* Master "All" Checkbox */}
            <Checkbox
              className="mb-4"
              checked={isAllChecked}
              onChange={(e) => toggleAll(e.target.checked)}
            >
              All
            </Checkbox>
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
