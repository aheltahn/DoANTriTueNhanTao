// src/config/mapStyles.js
export const MAP_STYLES = {
  // Vietnam Style - Bản đồ tập trung vào Việt Nam (Mặc định mới)
  VIETNAM: {
    name: "Việt Nam",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a>',
  },

  // Vietnam Focus - Bản đồ tối ưu cho Đông Nam Á
  VIETNAM_FOCUS: {
    name: "Việt Nam Nổi Bật",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  // Vietnam Satellite - Ảnh vệ tinh
  VIETNAM_SATELLITE: {
    name: "Vệ Tinh Việt Nam",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },

  // Vietnam Topo - Địa hình
  VIETNAM_TOPO: {
    name: "Địa Hình Việt Nam",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },

  // Vietnam Traditional - Cổ điển
  VIETNAM_TRADITIONAL: {
    name: "Truyền Thống Việt Nam",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  // Dark mode - hiện đại
  DARK: {
    name: "Dark Mode",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },

  // Màu sáng, ít chi tiết - tập trung vào dữ liệu
  LIGHT: {
    name: "Light Mode",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },

  // Màu xanh nước biển - phù hợp hiển thị sông ngòi
  WATER: {
    name: "Water Color",
    url: "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  // Màu xám - chuyên nghiệp
  GRAY: {
    name: "Gray Scale",
    url: "https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};
