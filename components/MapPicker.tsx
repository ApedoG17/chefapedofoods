"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icons missing in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

export default function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
  // Default center: Accra, Ghana (vicinity of University of Ghana / East Legon: 5.6505, -0.1870)
  const [position, setPosition] = useState<{ lat: number; lng: number }>(
    initialLocation || {
      lat: 5.6505,
      lng: -0.1870,
    }
  );

  // This sub-component listens for clicks on the map to move the pin
  function LocationMarker() {
    useMapEvents({
      click(e) {
        const coords = { lat: e.latlng.lat, lng: e.latlng.lng };
        setPosition(coords);
        onLocationSelect(coords);
      },
    });

    return <Marker position={[position.lat, position.lng]} icon={defaultIcon} />;
  }

  return (
    <div className="w-full h-[320px] rounded-2xl overflow-hidden border-2 border-brand-cream-dark shadow-inner relative z-0">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
}
