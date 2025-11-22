// src/components/ProvinceList.jsx
import React, { useState } from "react";
import { DistanceService } from "../services/distanceService";
import { Search, Navigation, Check, X } from "lucide-react";

const ProvinceList = ({
  provinces,
  selectedProvinces,
  startingPoint, //  Nhận điểm xuất phát
  onProvinceToggle,
  onSetStartingPoint, //  Hàm mới
  onCalculateDistance,
  currentLocation,
  onRemoveCurrentLocation, //  Thêm prop mới
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  const filteredProvinces = provinces.filter(
    (province) =>
      province.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedRegion === "" || province.region === selectedRegion)
  );

  const regions = [...new Set(provinces.map((p) => p.region))];

  const handleCalculateDistance = async (province) => {
    if (!currentLocation) {
      alert("Vui lòng lấy vị trí hiện tại trước");
      return;
    }

    console.log("Calculating distance from:", currentLocation, "to:", province);

    try {
      const result = await DistanceService.calculateDistance(
        currentLocation,
        province
      );
      console.log("Distance result:", result);
      onCalculateDistance(province.id, result);

      if (result.status === "FALLBACK") {
        alert(
          ` Khoảng cách ước lượng: ${result.distance} (${result.duration})`
        );
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
      alert("Lỗi tính khoảng cách. Vui lòng thử lại.");
    }
  };

  return (
    <div className="h-full flex flex-col ">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b">
        <h2 className="text-xl font-bold text-white mb-4">
          TỈNH/THÀNH PHỐ VIỆT NAM
        </h2>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm tỉnh/thành phố..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-white p-3 pl-10 border border-gray-300 rounded-lg placeholder-white bg-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white"
              size={18}
            />
          </div>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white/30 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="" className="bg-white/30 text-black">
              Tất cả khu vực
            </option>
            {regions.map((region) => (
              <option key={region} value={region} className=" text-black">
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-[#7bfdfb] rounded-lg text-center">
            <div className="font-semibold text-[#126b6a]">
              {selectedProvinces.length}
            </div>
            <div className="text-[#126b6a]">Đã chọn</div>
          </div>
          <div className="p-2 bg-[#9dfd7b] rounded-lg text-center">
            <div className="flex items-center justify-center font-semibold text-[#286013]  mb-1">
              {startingPoint ? <Check size={20} /> : <X size={20} />}
            </div>
            <div className="text-[#286013]">Điểm xuất phát</div>
          </div>
        </div>
      </div>

      {/* Scrollable Province List */}
      <div className="flex-1 min-h-0 overflow-auto p-4">
        <div className="space-y-3">
          {filteredProvinces.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy tỉnh/thành phố phù hợp
            </div>
          ) : (
            filteredProvinces.map((province) => {
              const isSelected = selectedProvinces.some(
                (p) => p.id === province.id
              );
              const isStartingPoint = startingPoint?.id === province.id;

              return (
                <div
                  key={province.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    isStartingPoint
                      ? "border-[#e0c4d2] bg-[#9dfd7b]/80 shadow-md "
                      : isSelected
                      ? "border-[#c2e1f0] bg-[#7bfdfb]/80 "
                      : "border-gray-200 bg-white/30  hover:border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-bold text-white text-lg">
                        {province.name}
                        {isStartingPoint && (
                          <span className="ml-2 text-[#278903] text-sm">
                            {" "}
                            Điểm xuất phát
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-white mt-1">
                        {" "}
                        {province.region}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3">
                      {/*  Nút đặt làm điểm xuất phát */}
                      {isSelected && !isStartingPoint && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetStartingPoint(province);
                          }}
                          className="px-3 py-1 bg-[#9dfd7b]/80 text-white text-sm rounded-lg hover:bg-[#278903] transition-colors"
                          title="Đặt làm điểm xuất phát"
                        >
                          <Navigation size={14} />
                        </button>
                      )}

                      {/* Nút chọn tỉnh */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onProvinceToggle(province);
                        }}
                        className={`w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                          isSelected
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-white border-gray-300 text-transparent"
                        }`}
                      >
                        ✓
                      </button>

                      {/*  Nút bỏ vị trí hiện tại khỏi tuyến đường */}
                      {province.id === currentLocation?.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveCurrentLocation();
                          }}
                          className="px-2 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                          title="Bỏ vị trí hiện tại khỏi tuyến đường"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Distance Info */}
                  {isSelected && province.distance && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-medium text-green-800">
                        Khoảng cách:{" "}
                        <span className="font-bold">{province.distance}</span>
                      </div>
                      <div className="text-sm font-medium text-green-700">
                        Thời gian:{" "}
                        <span className="font-bold">{province.duration}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ProvinceList;
