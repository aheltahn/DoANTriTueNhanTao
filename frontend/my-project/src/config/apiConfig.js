// src/config/apiConfig.js
export const API_CONFIG = {
    DISTANCE_MATRIX: {
      BASE_URL: 'https://api.distancematrix.ai/maps/api/distancematrix/json',
      API_KEY: import.meta.env.VITE_DISTANCE_MATRIX_API_KEY
    },
    OPENSTREETMAP: {
      TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  };

  export const VIETNAM_BOUNDS = {
    north: 23.392, 
    south: 8.380,
    west: 102.144,
    east: 114.333
  };
  
  // Danh sách 63 tỉnh/thành phố Việt Nam - Tọa độ đã sửa chuẩn 100%
export const VIETNAM_PROVINCES = [
  { id: 1,  name: "Hà Nội",                  lat: 21.0280, lng: 105.8542, region: "Miền Bắc" },
  { id: 2,  name: "Hồ Chí Minh",             lat: 10.7765, lng: 106.7019, region: "Miền Nam" },
  { id: 3,  name: "Hải Phòng",               lat: 20.8449, lng: 106.6881, region: "Miền Bắc" },
  { id: 4,  name: "Đà Nẵng",                 lat: 16.0544, lng: 108.2022, region: "Miền Trung" },
  { id: 5,  name: "Cần Thơ",                 lat: 10.0342, lng: 105.7656, region: "Miền Nam" },        // Sửa
  { id: 6,  name: "An Giang",                lat: 10.5216, lng: 105.4230, region: "Miền Nam" },        // Long Xuyên
  { id: 7,  name: "Bà Rịa – Vũng Tàu",       lat: 10.4114, lng: 107.1362, region: "Miền Nam" },        // Vũng Tàu
  { id: 8,  name: "Bắc Giang",               lat: 21.2732, lng: 106.1946, region: "Miền Bắc" },
  { id: 9,  name: "Bắc Kạn",                 lat: 22.1470, lng: 105.8348, region: "Miền Bắc" },
  { id: 10, name: "Bạc Liêu",                lat: 9.2942,  lng: 105.7277, region: "Miền Nam" },
  { id: 11, name: "Bắc Ninh",                lat: 21.1861, lng: 106.0710, region: "Miền Bắc" },
  { id: 12, name: "Bến Tre",                 lat: 10.2415, lng: 106.3759, region: "Miền Nam" },
  { id: 13, name: "Bình Định",               lat: 13.7829, lng: 109.2197, region: "Miền Trung" },      // Quy Nhơn
  { id: 14, name: "Bình Dương",              lat: 10.9798, lng: 106.6522, region: "Miền Nam" },        // Thủ Dầu Một
  { id: 15, name: "Bình Phước",              lat: 11.7519, lng: 106.7232, region: "Miền Nam" },        // Đồng Xoài
  { id: 16, name: "Bình Thuận",              lat: 10.9333, lng: 108.1033, region: "Miền Nam" },        // Phan Thiết
  { id: 17, name: "Cà Mau",                  lat: 9.1768,  lng: 105.1502, region: "Miền Nam" },
  { id: 18, name: "Cao Bằng",                lat: 22.6660, lng: 106.2580, region: "Miền Bắc" },
  { id: 19, name: "Đắk Lắk",                 lat: 12.7100, lng: 108.2377, region: "Miền Trung" },      // Buôn Ma Thuột - Sửa
  { id: 20, name: "Đắk Nông",                lat: 11.9375, lng: 107.6922, region: "Miền Trung" },      // Gia Nghĩa - Sửa
  { id: 21, name: "Điện Biên",               lat: 21.3886, lng: 103.0198, region: "Miền Bắc" },        // TP. Điện Biên Phủ
  { id: 22, name: "Đồng Nai",                lat: 10.9447, lng: 106.8243, region: "Miền Nam" },        // Biên Hòa
  { id: 23, name: "Đồng Tháp",               lat: 10.4938, lng: 105.6885, region: "Miền Nam" },        // Cao Lãnh
  { id: 24, name: "Gia Lai",                 lat: 13.9833, lng: 108.0000, region: "Miền Trung" },      // Pleiku
  { id: 25, name: "Hà Giang",                lat: 22.8019, lng: 104.9786, region: "Miền Bắc" },
  { id: 26, name: "Hà Nam",                  lat: 20.5400, lng: 105.9140, region: "Miền Bắc" },        // Phủ Lý
  { id: 27, name: "Hà Tĩnh",                 lat: 18.3420, lng: 105.9056, region: "Miền Trung" },
  { id: 28, name: "Hải Dương",               lat: 20.9390, lng: 106.3307, region: "Miền Bắc" },
  { id: 29, name: "Hậu Giang",               lat: 9.7827,  lng: 105.4663, region: "Miền Nam" },        // Vị Thanh
  { id: 30, name: "Hòa Bình",                lat: 20.8270, lng: 105.3400, region: "Miền Bắc" },
  { id: 31, name: "Hưng Yên",                lat: 20.6464, lng: 106.0511, region: "Miền Bắc" },
  { id: 32, name: "Khánh Hòa",               lat: 12.2451, lng: 109.1943, region: "Miền Trung" },      // Nha Trang
  { id: 33, name: "Kiên Giang",              lat: 10.0120, lng: 105.0809, region: "Miền Nam" },        // Rạch Giá - Sửa lớn
  { id: 34, name: "Kon Tum",                 lat: 14.3545, lng: 108.0076, region: "Miền Trung" },
  { id: 35, name: "Lai Châu",                lat: 22.3960, lng: 103.4580, region: "Miền Bắc" },
  { id: 36, name: "Lâm Đồng",                lat: 11.9465, lng: 108.4419, region: "Miền Nam" },        // Đà Lạt - Sửa
  { id: 37, name: "Lạng Sơn",                lat: 21.8525, lng: 106.7610, region: "Miền Bắc" },
  { id: 38, name: "Lào Cai",                 lat: 22.4856, lng: 103.9707, region: "Miền Bắc" },
  { id: 39, name: "Long An",                 lat: 10.6956, lng: 106.2430, region: "Miền Nam" },        // Tân An
  { id: 40, name: "Nam Định",                lat: 20.4339, lng: 106.1624, region: "Miền Bắc" },
  { id: 41, name: "Nghệ An",                 lat: 18.6767, lng: 105.6813, region: "Miền Trung" },      // Vinh
  { id: 42, name: "Ninh Bình",               lat: 20.2581, lng: 105.9797, region: "Miền Bắc" },
  { id: 43, name: "Ninh Thuận",              lat: 11.5672, lng: 108.9917, region: "Miền Trung" },      // Phan Rang
  { id: 44, name: "Phú Thọ",                 lat: 21.3262, lng: 105.1320, region: "Miền Bắc" },        // Việt Trì
  { id: 45, name: "Phú Yên",                 lat: 13.1046, lng: 109.0922, region: "Miền Trung" },      // Tuy Hòa
  { id: 46, name: "Quảng Bình",              lat: 17.4669, lng: 106.6009, region: "Miền Trung" },      // Đồng Hới - Sửa
  { id: 47, name: "Quảng Nam",               lat: 15.5762, lng: 108.4800, region: "Miền Trung" },      // Tam Kỳ
  { id: 48, name: "Quảng Ngãi",              lat: 15.1214, lng: 108.8045, region: "Miền Trung" },
  { id: 49, name: "Quảng Ninh",              lat: 20.9562, lng: 107.0425, region: "Miền Bắc" },        // Hạ Long - Sửa
  { id: 50, name: "Quảng Trị",               lat: 16.7942, lng: 107.1410, region: "Miền Trung" },      // Đông Hà
  { id: 51, name: "Sóc Trăng",               lat: 9.5999,  lng: 105.9719, region: "Miền Nam" },
  { id: 52, name: "Sơn La",                  lat: 21.3270, lng: 103.9180, region: "Miền Bắc" },
  { id: 53, name: "Tây Ninh",                lat: 11.3085, lng: 106.0957, region: "Miền Nam" },
  { id: 54, name: "Thái Bình",               lat: 20.4460, lng: 106.3400, region: "Miền Bắc" },
  { id: 55, name: "Thái Nguyên",             lat: 21.5942, lng: 105.8435, region: "Miền Bắc" },
  { id: 56, name: "Thanh Hóa",               lat: 19.8070, lng: 105.7764, region: "Miền Trung" },
  { id: 57, name: "Thừa Thiên Huế",          lat: 16.4637, lng: 107.5909, region: "Miền Trung" },      // Huế
  { id: 58, name: "Tiền Giang",              lat: 10.3722, lng: 106.3600, region: "Miền Nam" },        // Mỹ Tho
  { id: 59, name: "Trà Vinh",                lat: 9.9472,  lng: 106.3422, region: "Miền Nam" },
  { id: 60, name: "Tuyên Quang",             lat: 21.8143, lng: 105.2146, region: "Miền Bắc" },
  { id: 61, name: "Vĩnh Long",               lat: 10.2537, lng: 105.9722, region: "Miền Nam" },
  { id: 62, name: "Vĩnh Phúc",               lat: 21.3055, lng: 105.6049, region: "Miền Bắc" },        // Vĩnh Yên
  { id: 63, name: "Yên Bái",                 lat: 21.7168, lng: 104.8984, region: "Miền Bắc" }
];