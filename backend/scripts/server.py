from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import math
import numpy as np
import time
import random

# Import các thuật toán từ file bên ngoài
from GBFS import gbfs_tsp
from wco import wco_tsp

app = Flask(__name__)
CORS(app)

# Health check endpoint, kiểm tra server có hoạt động không
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "success", 
        "message": "Flask backend is running!",
        "timestamp": datetime.now().isoformat()
    })

# --------------------------
# Endpoint tích hợp cả 2 thuật toán - SỬ DỤNG IMPORT
# --------------------------
@app.route('/api/calculate-route', methods=['POST'])
def calculate_route():
    try:
        data = request.get_json()
        cities = data.get('cities', [])
        starting_point = data.get('starting_point', '')
        
        if len(cities) < 2:
            return jsonify({"error": "Need at least 2 cities"}), 400

        # Đặt điểm xuất phát
        if starting_point:
            for i, city in enumerate(cities):
                if city['name'] == starting_point:
                    if i != 0:
                        cities[0], cities[i] = cities[i], cities[0]
                    break

        # Tính GBFS - SỬ DỤNG HÀM IMPORT
        gbfs_result = gbfs_tsp(cities)
        # Tính WCO - SỬ DỤNG HÀM IMPORT
        wco_result = wco_tsp(cities)

        return jsonify({"GBFS": gbfs_result, "WCO": wco_result})
        
    except Exception as e:
        print(f" Error in calculate-route: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print(" Starting Flask GBFS + WCO TSP Server...")
    print(" Endpoint: http://127.0.0.1:5000")
    print(" Available routes:")
    print("   GET  /api/health")
    print("   POST /api/calculate-route   (GBFS + WCO)")
    print(" Using imported algorithms from external files")
    app.run(debug=True, host='127.0.0.1', port=5000)