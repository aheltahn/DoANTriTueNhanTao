// src/services/api.js
import axios from "axios";

export const API_BASE_URL = "http://localhost:5000";

export async function sendCoordinates(selectedCities) {
  try {
    const response = await axios.post(`${API_BASE_URL}/calculate`, {
      cities: selectedCities,
    });
    console.log("Kết quả từ backend:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi gửi tọa độ:", error);
  }
}
