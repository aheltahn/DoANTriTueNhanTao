// src/services/distanceService.js
import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

export class DistanceService {
  static async calculateDistance(origin, destination) {
    try {
      // Validate coordinates
      if (!this.isValidCoordinate(origin.lat, origin.lng) || 
          !this.isValidCoordinate(destination.lat, destination.lng)) {
        console.warn('Invalid coordinates:', { origin, destination });
        return this.calculateFallbackDistance(origin, destination);
      }

      const params = {
        origins: `${origin.lat},${origin.lng}`,
        destinations: `${destination.lat},${destination.lng}`,
        key: API_CONFIG.DISTANCE_MATRIX.API_KEY
      };

      console.log('Calculating distance with params:', params);

      const response = await axios.get(API_CONFIG.DISTANCE_MATRIX.BASE_URL, { params });
      
      if (response.data.status === 'OK') {
        const element = response.data.rows[0].elements[0];
        
        if (element.status === 'OK') {
          return {
            distance: element.distance?.text || 'N/A',
            duration: element.duration?.text || 'N/A',
            status: element.status,
            rawDistance: element.distance?.value, // Lưu giá trị số để so sánh
            rawDuration: element.duration?.value
          };
        } else {
          console.warn('Element status not OK:', element.status);
          return this.calculateFallbackDistance(origin, destination);
        }
      }
      
      console.error('API Error:', response.data);
      return this.calculateFallbackDistance(origin, destination);
      
    } catch (error) {
      console.error('Distance calculation error:', error);
      return this.calculateFallbackDistance(origin, destination);
    }
  }

  // Tính khoảng cách dự phòng (Haversine formula)
  static calculateFallbackDistance(origin, destination) {
    const distance = this.calculateHaversineDistance(origin, destination);
    const duration = this.estimateTravelTime(distance);
    
    return {
      distance: `${distance.toFixed(1)} km`,
      duration: `${duration} phút`,
      status: 'FALLBACK',
      rawDistance: distance,
      rawDuration: duration * 60 // convert to seconds
    };
  }

  // Haversine formula tính khoảng cách đường chim bay
  static calculateHaversineDistance(origin, destination) {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(destination.lat - origin.lat);
    const dLng = this.toRad(destination.lng - origin.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(origin.lat)) * Math.cos(this.toRad(destination.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  // Ước tính thời gian di chuyển (giả định tốc độ trung bình 50km/h)
  static estimateTravelTime(distanceKm) {
    const averageSpeed = 50; // km/h
    const timeHours = distanceKm / averageSpeed;
    return Math.round(timeHours * 60); // convert to minutes
  }

  static toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  static isValidCoordinate(lat, lng) {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  static async geocodeAddress(address) {
    try {
      const response = await axios.get(
        `https://api.distancematrix.ai/maps/api/geocode/json`,
        {
          params: {
            address: address,
            key: API_CONFIG.DISTANCE_MATRIX.API_KEY
          }
        }
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
          address: response.data.results[0].formatted_address
        };
      }
      
      throw new Error('Geocoding failed');
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }
}