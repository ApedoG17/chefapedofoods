'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

const customIcon = typeof window !== 'undefined'
  ? L.divIcon({
      className: 'chef-map-pin',
      html: `
        <div style="position: relative; width: 34px; height: 34px;">
          <div style="
            width: 34px; 
            height: 34px; 
            background: #F5A623; 
            border: 2.5px solid #FFFFFF; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg); 
            box-shadow: 0 4px 14px rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 10px; height: 10px; background: #18110E; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    })
  : undefined;

interface OrderMapPinProps {
  lat: number;
  lng: number;
  customerName?: string;
  address?: string;
}

export default function OrderMapPin({ lat, lng, customerName, address }: OrderMapPinProps) {
  const center: [number, number] = [lat, lng];

  return (
    <div className="w-full h-48 rounded-xl overflow-hidden relative border border-white/10 z-0">
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {customIcon && (
          <Marker position={center} icon={customIcon}>
            <Popup>
              <div className="text-xs text-[#18110E] p-1 font-sans">
                <strong className="block font-bold">{customerName || 'Customer'}</strong>
                <p className="text-[11px] text-gray-700 mt-0.5">{address || 'Delivery destination'}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
