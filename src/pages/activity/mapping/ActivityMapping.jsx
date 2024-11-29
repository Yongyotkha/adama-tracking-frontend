import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import MainLayout from "../../../layouts/MainLayout";
import { Navigate } from "react-router-dom";
import ActionButton from "../../../components/button/ActionButton";

const mapContainerStyle = {
  width: "100%",
  height: "500px", // Adjust based on your layout
};

const center = {
  lat: 13.736717, // Default latitude
  lng: 100.523186, // Default longitude
};

const locations = [
  { id: 1, title: "Demo Plot", lat: 13.736717, lng: 100.523186, details: "H3Q8+8FW ตำบล กุรุพุ่ง อำเภอ สันเขา" },
  { id: 2, title: "Small FMT", lat: 14.736717, lng: 101.523186, details: "Sample Address 2" },
  // Add more locations
];

export default function ActivityMapping() {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <MainLayout loading={loading}>
      <div className="flex items-center justify-between mb-4">
        <div className="title-page">Mapping</div>
        <ActionButton
          mode="create"
          text="Create"
        />
      </div>
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
    </MainLayout>
  );
}
