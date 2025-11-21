// src/components/VietnamMapWithProvinces.jsx
import React, { useState, useEffect } from 'react';
import VietnamMap from './VietnamMap';
import ProvinceList from './ProvinceList';
import { VIETNAM_PROVINCES } from '../config/apiConfig';
import axios from 'axios';

const VietnamMapWithProvinces = ({ onGbfsResult, onWcoResult }) => { 
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [startingPoint, setStartingPoint] = useState(null);
  const [tspResults, setTspResults] = useState(null);
  const [loading, setLoading] = useState(false);
  

 // Component cha
const handleProvinceToggle = (province, forceRemove = false) => {
  if (forceRemove) {
    // Bỏ chọn bắt buộc
    setSelectedProvinces(prev => prev.filter(p => p.id !== province.id));
  } else {
    // Toggle thông thường
    setSelectedProvinces(prev => {
      const exists = prev.some(p => p.id === province.id);
      if (exists) return prev.filter(p => p.id !== province.id);
      return [...prev, province];
    });
  }
};


  // 🆕 THÊM HÀM handleGetCurrentLocation BỊ THIẾU
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ vị trí.');
      return;
    }
  
    setLoading(true);
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
  
        const calibratedCoords = calibrateCoordinatesForVietnam(latitude, longitude);
  
        setCurrentLocation({
          id: 'current_location', // dùng id cố định
          name: "Vị trí hiện tại của tôi",
          lat: calibratedCoords.lat,
          lng: calibratedCoords.lng,
          accuracy: accuracy,
          rawLat: latitude,
          rawLng: longitude
        });
  
        setLoading(false);
        alert(`✅ Đã lấy vị trí! (Sai số: ±${Math.round(accuracy)}m)`);
      },
      (error) => {
        setLoading(false);
        console.error('Geolocation error:', error);
        alert('Không thể lấy vị trí chính xác. Hãy thử lại trên điện thoại hoặc HTTPS.');
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );
  };
  
  
  // 🆕 HÀM HIỆU CHUẨN TỌA ĐỘ CHO VIỆT NAM
  const calibrateCoordinatesForVietnam = (lat, lng) => {
    // Hiệu chuẩn cho hệ tọa độ WGS84 tại Việt Nam
    // Điều chỉnh nhỏ để khớp với bản đồ Việt Nam
    const calibrationFactors = {
      lat: 0.0001,  // Hiệu chuẩn vĩ độ
      lng: 0.00015  // Hiệu chuẩn kinh độ
    };
  
    return {
      lat: parseFloat((lat + calibrationFactors.lat).toFixed(6)),
      lng: parseFloat((lng + calibrationFactors.lng).toFixed(6))
    };
  };
  

  // 🆕 Hàm xử lý chọn điểm xuất phát
  const handleSetStartingPoint = (province) => {
    setStartingPoint(province);
    // Nếu chưa có trong selected, tự động thêm
    if (!selectedProvinces.some(p => p.id === province.id)) {
      setSelectedProvinces(prev => [province, ...prev]);
    }
  };

  // 🆕 Hàm dùng vị trí hiện tại làm điểm xuất phát
  const handleUseCurrentLocationAsStart = () => {
    if (!currentLocation) {
      alert('Vui lòng lấy vị trí hiện tại trước');
      return;
    }
  
    setStartingPoint(currentLocation);
  
    // Nếu chưa có trong selected, tự động thêm
    if (!selectedProvinces.some(p => p.id === currentLocation.id)) {
      setSelectedProvinces(prev => [currentLocation, ...prev]);
    }
  };
  
  // 🆕 Hàm bỏ vị trí hiện tại khỏi tuyến đường
const handleRemoveCurrentLocation = () => {
  if (!currentLocation) return;

  // Xóa khỏi danh sách đã chọn
  setSelectedProvinces(prev => prev.filter(p => p.id !== currentLocation.id));

  // Nếu đang là điểm xuất phát thì reset luôn
  if (startingPoint?.id === currentLocation.id) {
    setStartingPoint(null);
  }

  // Reset currentLocation (nếu bạn muốn bỏ hẳn khỏi bản đồ)
  setCurrentLocation(null);
};


  // 🆕 Hàm reset điểm xuất phát
  const handleClearStartingPoint = () => {
    if (startingPoint?.id === currentLocation?.id) {
      // Nếu vị trí hiện tại đang là điểm xuất phát, thì bỏ nó khỏi danh sách luôn
      setSelectedProvinces(prev => prev.filter(p => p.id !== currentLocation.id));
    }
  
    setStartingPoint(null);
  };
  
  // 🆕 Hàm tính khoảng cách (nếu cần)
  const handleCalculateDistance = (provinceId, distanceInfo) => {
    setSelectedProvinces(prev =>
      prev.map(p => p.id === provinceId ? { ...p, ...distanceInfo } : p)
    );
  };

  // Tính đường đi tối ưu với điểm xuất phát
  // Tính đường đi tối ưu với điểm xuất phát
const handleCalculateRoute = async () => {
  if (selectedProvinces.length < 2) {
    alert('Vui lòng chọn ít nhất 2 tỉnh/thành phố để tính đường đi');
    return;
  }

  if (!startingPoint) {
    alert('Vui lòng chọn điểm xuất phát');
    return;
  }

  setLoading(true);


  try {
    // 🆕 Đảm bảo điểm xuất phát là đầu tiên
    let cities = [];
    
    if (startingPoint.id === currentLocation?.id) {
      // Nếu dùng vị trí hiện tại
      cities = [
        { 
          name: startingPoint.name, 
          lat: startingPoint.lat, 
          lng: startingPoint.lng
        },
        ...selectedProvinces
          .filter(p => p.id !== startingPoint.id)
          .map(p => ({ name: p.name, lat: p.lat, lng: p.lng }))
      ];
    } else {
      // Nếu dùng tỉnh thành làm điểm xuất phát
      const otherProvinces = selectedProvinces.filter(p => p.id !== startingPoint.id);
      cities = [
        { name: startingPoint.name, lat: startingPoint.lat, lng: startingPoint.lng },
        ...otherProvinces.map(p => ({ name: p.name, lat: p.lat, lng: p.lng }))
      ];
    }

    console.log('Sending cities to backend:', cities);

    const response = await axios.post('http://127.0.0.1:5000/api/calculate-route', 
      { 
        cities,
        starting_point: startingPoint.name
      },
      { 
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('✅ Backend response:', response.data);
    
    // 🎯 XỬ LÝ CẢ 2 ĐỊNH DẠNG BACKEND
    let gbfsData;
    let wcoData;
    
    if (response.data.GBFS) {
      // Backend mới: {GBFS: ..., WCO: ...}
      gbfsData = response.data.GBFS;
      wcoData = response.data.WCO;
      console.log("🔄 Using GBFS data from combined response");
    } else {
      // Backend cũ: trực tiếp gbfs_result
      gbfsData = response.data;
      wcoData = null; // Backend cũ không có WCO
      console.log("🔄 Using direct GBFS result");
    }
    
    // 🎯 GỬI KẾT QUẢ LÊN APP COMPONENT
    if (onGbfsResult) {
      onGbfsResult(gbfsData);
    }
    
    if (onWcoResult && wcoData) {
      onWcoResult(wcoData);
    }

    // Lưu kết quả để hiển thị (nếu cần)
    setTspResults(response.data);

    console.log('📊 GBFS visualization data:', {
      steps: gbfsData.steps?.length,
      cities: gbfsData.cities?.length, 
      edges: gbfsData.edges?.length,
      best_solution: gbfsData.best_solution
    });

  } catch (error) {
    console.error('❌ Backend error:', error);
    alert('Lỗi backend: ' + error.message);
  } finally {
    setLoading(false);
  }
};
  // 🆕 Hàm reset toàn bộ trạng thái
  const handleResetAll = () => {
    if (window.confirm("⚠️ Bạn có chắc muốn xóa tất cả và bắt đầu lại không?")) {
      setSelectedProvinces([]);
      setStartingPoint(null);
      setCurrentLocation(null);
      setTspResults(null);
      setLoading(false);
    }
  };
  // 🆕 Test backend connection
  // const testBackendConnection = async () => {
  //   try {
  //     const response = await axios.get('http://127.0.0.1:5000/api/health', {
  //       timeout: 5000
  //     });
  //     alert(`✅ Backend connected: ${response.data.message}`);
  //     console.log('Health check response:', response.data);
  //   } catch (error) {
  //     console.error('Health check failed:', error);
  //     alert(`❌ Backend connection failed: ${error.message}`);
  //   }
  // };

  return (
    <div 
    style={{ height: '100vh' }}>
      <div className="max-w-[1400px] mx-auto rounded-xl shadow-2xl h-full flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex-shrink-0 p-5 ">
          <h1 className="text-5xl font-extrabold mb-1 text-white"> BẢN ĐỒ THÀNH PHỐ VIỆT NAM</h1>
          <p className="text-sm text-blue-100">Khám phá các điểm đến và lập kế hoạch hành trình của bạn</p>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          
          {/* Map Section */}
          <div className="flex-1 p-5 min-h-0">
            <VietnamMap
              selectedProvinces={selectedProvinces}
              startingPoint={startingPoint}
              onProvinceSelect={(p) => console.log('Selected on map:', p)}
              currentLocation={currentLocation}
            />
          </div>

          {/* Sidebar */}
          <div className="w-96  flex flex-col flex-shrink-0">
            
            {/* Province List */}
            <div className="flex-1 min-h-0">
            <ProvinceList
  provinces={VIETNAM_PROVINCES} // truyền trực tiếp từ file config
  selectedProvinces={selectedProvinces}
  startingPoint={startingPoint}
  onProvinceToggle={handleProvinceToggle}
  onSetStartingPoint={handleSetStartingPoint}
  onCalculateDistance={handleCalculateDistance}
  currentLocation={currentLocation}
  onRemoveCurrentLocation={handleRemoveCurrentLocation}
/>


            </div>

            {/* Control Section */}
            <div className="flex-shrink-0 p-4 border-t border-gray-300space-y-3">
              
              {/* 🆕 Starting Point Section */}
              <div className="bg-white/30 border border-white rounded-lg p-3">
                <div className="font-bold text-white mb-2"> Điểm xuất phát:</div>
                
                {startingPoint ? (
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-white">
                      {startingPoint.name}
                      {startingPoint.id === currentLocation?.id && (
                        <span className="text-[#9dfd7b] ml-2">(Vị trí hiện tại)</span>
                      )}
                    </div>
                    <button
                      onClick={handleClearStartingPoint}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    Chưa chọn điểm xuất phát
                  </div>
                )}
              </div>

              {/* Location Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleGetCurrentLocation}
                  className="mt-2 mb-2 px-3 py-2 bg-[#7bfdfb] text-[#126b6a] rounded hover:text-white hover:bg-[#046c6a] transition text-sm"
                >
                   Lấy vị trí
                </button>
                <button
                  onClick={handleUseCurrentLocationAsStart}
                  disabled={!currentLocation}
                  className={`mt-2 mb-2 px-3 py-2 rounded transition text-sm ${
                    !currentLocation 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#9dfd7b] text-[#286013] hover:text-white hover:bg-[#3bba0d]'
                  }`}
                >
                 Dùng làm điểm xuất phát
                </button>
              </div>

              {/* Test Connection Button */}
              {/* <button
                onClick={testBackendConnection}
                className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm"
              >
                🔌 Test Backend Connection
              </button> */}

              {/* Calculate Route Button */}
              <button
  onClick={handleCalculateRoute}
  disabled={loading || selectedProvinces.length < 2 || !startingPoint}
  style={
    !(loading || selectedProvinces.length < 2 || !startingPoint)
      ? {
          borderColor: "#b2f2bb",
          boxShadow: "0 0 10px #9fd700, 0 0 10px #9fd700",
        }
      : {}
  }
  className={`
    mb-2 w-full px-4 py-3 font-bold text-white rounded border transition
    ${
      loading || selectedProvinces.length < 2 || !startingPoint
        ? "border-white cursor-not-allowed"
        : ""
    }
  `}
>
  {loading ? "Đang tính toán..." : "Tính đường đi tối ưu"}
</button>

{/* Reset All Button */}
<button
  onClick={handleResetAll}
  className="w-full px-4 py-3 font-bold border text-white rounded hover:bg-[#046c6a] transition"
  style={{ borderColor: "#01eae6", boxShadow: "0 0 10px #d3ffc8, 0 0 10px #d3ffc8", }}
>
   Tạo mới
</button>

              {/* Validation Messages */}
              {!startingPoint && (
                <div className="text-xs text-red-500 text-center">
                  ⚠️ Vui lòng chọn điểm xuất phát
                </div>
              )}
              {startingPoint && selectedProvinces.length < 2 && (
                <div className="text-xs text-red-500 text-center">
                  ⚠️ Chọn ít nhất 1 tỉnh khác để tính đường đi
                </div>
              )}

              {/* Results */}
              {/* {tspResult && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm">
                  <div className="font-bold text-green-800 mb-2">📊 Kết quả:</div>
                  <div><strong>🗺️ Lộ trình:</strong> {tspResult.best_solution.join(' → ')}</div>
                  <div><strong>📏 Khoảng cách:</strong> {tspResult.best_distance} km</div>
                  <div><strong>⏱️ Thời gian:</strong> {tspResult.execution_time} giây</div>
                  {tspResult.starting_point && (
                    <div><strong>📍 Điểm xuất phát:</strong> {tspResult.starting_point}</div>
                  )}
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VietnamMapWithProvinces;