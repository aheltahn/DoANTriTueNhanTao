// src/components/VietnamMap.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_STYLES } from "../config/mapStyles";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons (đỏ - vàng - xanh)
const createCustomIcon = (type = "province", size = "normal") => {
  const sizes = {
    small: [20, 33],
    normal: [25, 41],
    large: [30, 50],
  };

  const colors = {
    current: "blue",
    province: "red",
    calculated: "gold",
  };

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${colors[type]}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: sizes[size],
    iconAnchor: [sizes[size][0] / 2, sizes[size][1]],
    popupAnchor: [0, -sizes[size][1] + 10],
    shadowSize: [sizes[size][0] + 15, sizes[size][1] + 15],
  });
};

const VietnamMap = ({
  selectedProvinces,
  onProvinceSelect,
  currentLocation,
}) => {
  const [selectedStyle, setSelectedStyle] = useState("VIETNAM");
  const center = [16.4637, 107.5909]; // Trung tâm Việt Nam

  return (
    /* ĐÃ SỬA: bọc toàn bộ trong một div có height 100% + rounded */
    <div className="h-full w-full rounded-xl overflow-hidden shadow-2xl relative bg-gray-50">
      {/* Style Selector */}
      <div className="absolute top-4 right-4 z-[1000] bg-black rounded-lg shadow-lg p-3 min-w-48 border">
        <label className="block text-sm font-medium text-white mb-2">
          Kiểu bản đồ:
        </label>
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          className="w-full p-2 border  rounded-md text-sm bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#7bfdfb]"
        >
          {Object.entries(MAP_STYLES).map(([key, style]) => (
            <option key={key} value={key} className="bg-black">
              {style.name}
            </option>
          ))}
        </select>
      </div>

      {/* ĐÃ SỬA: MapContainer có style height 100% + className không cần h-full nữa */}
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        zoomControl={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
      >
        <TileLayer
          url={MAP_STYLES[selectedStyle].url}
          attribution={MAP_STYLES[selectedStyle].attribution}
        />

        {/* Current location marker */}
        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={createCustomIcon("current", "large")}
          >
            <Popup className="custom-popup vietnam-popup">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  Vị trí của bạn
                </div>
                <div className="mt-1 text-gray-700">{currentLocation.name}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {currentLocation.lat.toFixed(4)},{" "}
                  {currentLocation.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
            <Tooltip
              permanent
              direction="top"
              className="custom-tooltip vietnam-tooltip current-tooltip"
            >
              Vị trí của bạn
            </Tooltip>
          </Marker>
        )}

        {/* Selected provinces */}
        {selectedProvinces.map((province) => (
          <Marker
            key={province.id}
            position={[province.lat, province.lng]}
            icon={createCustomIcon(
              province.distance ? "calculated" : "province",
              "normal"
            )}
            eventHandlers={{
              click: () => onProvinceSelect?.(province),
            }}
          >
            <Popup className="custom-popup vietnam-popup">
              <div className="min-w-48">
                <div className="font-bold text-lg text-red-600 border-b border-red-200 pb-2 mb-2">
                  {province.name}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600">
                    Khu vực: {province.region}
                  </div>
                  {province.distance && (
                    <>
                      <div className="text-green-600 font-medium">
                        Khoảng cách: {province.distance}
                      </div>
                      <div className="text-yellow-600 font-medium">
                        Thời gian: {province.duration}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Popup>
            <Tooltip
              permanent
              direction="top"
              className={`custom-tooltip vietnam-tooltip ${
                province.distance ? "calculated-tooltip" : "province-tooltip"
              }`}
            >
              {province.name}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* Hướng dẫn */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span>Kéo để di chuyển</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Cuộn để zoom</span>
        </div>
      </div>
    </div>
  );
};

export default VietnamMap;
