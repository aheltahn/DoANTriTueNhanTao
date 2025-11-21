from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import math
import numpy as np
import time
import random

app = Flask(__name__)
CORS(app)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "success", 
        "message": "Flask backend is running!",
        "timestamp": datetime.now().isoformat()
    })

# --------------------------
# HÀM HỖ TRỢ
# --------------------------
def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate Haversine distance between two points in km"""
    R = 6371  # Earth radius in kilometers
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

# --------------------------
# HÀM TÍNH OPTIMAL DISTANCE - FIXED
# --------------------------
def calculate_optimal_distance(city_data):
    """
    Tính khoảng cách tối ưu sử dụng Nearest Neighbor heuristic
    """
    if len(city_data) < 2:
        return 0
    
    cities = [c["name"] for c in city_data]
    num_cities = len(cities)
    name_to_idx = {c["name"]: i for i, c in enumerate(city_data)}
    
    # Tạo ma trận khoảng cách
    distance_matrix = [[0]*num_cities for _ in range(num_cities)]
    for i in range(num_cities):
        for j in range(num_cities):
            if i != j:
                distance_matrix[i][j] = haversine_distance(
                    city_data[i]["lat"], city_data[i]["lng"],
                    city_data[j]["lat"], city_data[j]["lng"]
                )
    
    def tour_distance(path):
        """Tính tổng khoảng cách của tour"""
        dist = 0
        for i in range(len(path)-1):
            dist += distance_matrix[name_to_idx[path[i]]][name_to_idx[path[i+1]]]
        # Quay lại điểm xuất phát
        dist += distance_matrix[name_to_idx[path[-1]]][name_to_idx[path[0]]]
        return dist
    
    # Sử dụng Nearest Neighbor algorithm để tìm tour gần tối ưu
    start_city = cities[0]
    unvisited = set(cities[1:])  # Bỏ qua thành phố đầu
    current_city = start_city
    tour = [current_city]
    
    while unvisited:
        # Tìm thành phố gần nhất
        nearest_city = min(unvisited, 
                          key=lambda city: distance_matrix[name_to_idx[current_city]][name_to_idx[city]])
        tour.append(nearest_city)
        unvisited.remove(nearest_city)
        current_city = nearest_city
    
    # Quay lại điểm xuất phát
    tour.append(start_city)
    
    # Tính khoảng cách tour
    nn_distance = tour_distance(tour)
    
    # Có thể thử thêm 2-opt local search để cải thiện
    improved_distance = two_opt_improvement(tour, distance_matrix, name_to_idx)
    
    return round(min(nn_distance, improved_distance), 2)

def two_opt_improvement(tour, distance_matrix, name_to_idx):
    """
    Cải thiện tour bằng 2-opt local search
    """
    best_tour = tour[:-1]  # Bỏ điểm cuối (trùng với điểm đầu)
    best_distance = tour_distance(best_tour + [best_tour[0]], distance_matrix, name_to_idx)
    improved = True
    
    while improved:
        improved = False
        for i in range(1, len(best_tour)-2):
            for j in range(i+1, len(best_tour)):
                if j - i == 1:
                    continue  # Bỏ qua cạnh liền kề
                
                # Tạo tour mới bằng cách đảo ngược đoạn i-j
                new_tour = best_tour[:i] + best_tour[i:j+1][::-1] + best_tour[j+1:]
                new_distance = tour_distance(new_tour + [new_tour[0]], distance_matrix, name_to_idx)
                
                if new_distance < best_distance:
                    best_tour = new_tour
                    best_distance = new_distance
                    improved = True
                    break
            if improved:
                break
    
    return best_distance

def tour_distance(path, distance_matrix, name_to_idx):
    """Tính khoảng cách tour với ma trận khoảng cách cho trước"""
    dist = 0
    for i in range(len(path)-1):
        dist += distance_matrix[name_to_idx[path[i]]][name_to_idx[path[i+1]]]
    return dist

# --------------------------
# HÀM TÍNH SOLUTION QUALITY - THÊM MỚI
# --------------------------
# TRONG Backend - SỬA HÀM calculate_solution_quality
def calculate_solution_quality(best_distance, optimal_distance):
    """
    Tính chất lượng nghiệm (0-100%)
    - 100% khi best_distance = optimal_distance  
    - Giảm dần khi best_distance > optimal_distance
    - KHÔNG BAO GIỜ vượt quá 100%
    """
    if best_distance <= 0 or optimal_distance <= 0:
        return 0.0
    
    # ✅ CÔNG THỨC ĐÚNG: (optimal / best) * 100
    # Luôn ≤ 100% vì optimal ≤ best trong thực tế
    quality = (optimal_distance / best_distance) * 100
    
    # Giới hạn tối đa 100%
    return min(round(quality, 1), 100.0)

# --------------------------
# GBFS TSP - THÊM SOLUTION_QUALITY
# --------------------------
def gbfs_tsp(city_data):
    start_time = time.time()
    if not city_data or len(city_data) < 2:
        return {
            "best_solution": [], "best_distance": 0, "execution_time": 0,
            "cities": [], "edges": [], "steps": [], "starting_point": "", 
            "algorithm": "GBFS", "optimal_distance": 0, "solution_quality": 0
        }
    
    cities = [c["name"] for c in city_data]
    num_cities = len(cities)
    name_to_idx = {c["name"]: i for i, c in enumerate(city_data)}
    
    distance_matrix = [[0]*num_cities for _ in range(num_cities)]
    for i in range(num_cities):
        for j in range(num_cities):
            if i != j:
                distance_matrix[i][j] = haversine_distance(
                    city_data[i]["lat"], city_data[i]["lng"],
                    city_data[j]["lat"], city_data[j]["lng"]
                )
    
    unvisited = set(cities)
    start_city = cities[0]
    current_city = start_city
    path = [current_city]
    unvisited.remove(current_city)
    
    steps = []
    step_num = 1
    
    while unvisited:
        neighbors = []
        for city in unvisited:
            distance = distance_matrix[name_to_idx[current_city]][name_to_idx[city]]
            neighbors.append({"name": city, "h": round(distance,2)})
        
        next_city = min(neighbors, key=lambda x: x["h"])["name"]
        step_info = {
            "step": step_num,
            "currentCity": current_city,
            "neighbors": neighbors,
            "chosenCity": next_city,
            "consideredEdge": {"from": current_city, "to": next_city},
            "chosenEdge": {"from": current_city, "to": next_city},
            "partialPath": path.copy()
        }
        steps.append(step_info)
        
        current_city = next_city
        path.append(current_city)
        unvisited.remove(current_city)
        step_num += 1
    
    # Return to start
    path.append(start_city)
    final_step = {
        "step": step_num,
        "currentCity": current_city,
        "neighbors": [],
        "chosenCity": start_city,
        "consideredEdge": {"from": current_city, "to": start_city},
        "chosenEdge": {"from": current_city, "to": start_city},
        "partialPath": path.copy()
    }
    steps.append(final_step)
    
    total_distance = sum(distance_matrix[name_to_idx[path[i]]][name_to_idx[path[i+1]]] for i in range(len(path)-1))
    
    edges = []
    for i in range(num_cities):
        for j in range(i+1, num_cities):
            edges.append({"from": cities[i], "to": cities[j], "distance": round(distance_matrix[i][j],2)})
    
    # ✅ TÍNH OPTIMAL VÀ SOLUTION QUALITY
    optimal_distance = calculate_optimal_distance(city_data)
    solution_quality = calculate_solution_quality(total_distance, optimal_distance)
    
    return {
        "best_solution": path,
        "best_distance": round(total_distance,2),
        "execution_time": round(time.time() - start_time,4),
        "cities": city_data,
        "edges": edges,
        "steps": steps,
        "starting_point": start_city,
        "algorithm": "GBFS",
        "optimal_distance": optimal_distance,
        "solution_quality": solution_quality  # ✅ THÊM VÀO
    }

# --------------------------
# WCO TSP - THÊM SOLUTION_QUALITY
# --------------------------
def wco_tsp(city_data, population_size=20, max_iter=50):
    start_time = time.time()
    
    if not city_data or len(city_data) < 2:
        return {
            "best_solution": [], "best_distance": 0, "execution_time": 0,
            "cities": [], "edges": [], "steps": [], 
            "starting_point": "", "algorithm": "WCO", "optimal_distance": 0, "solution_quality": 0
        }
    
    cities = [c["name"] for c in city_data]
    num_cities = len(cities)
    name_to_idx = {c["name"]: i for i, c in enumerate(city_data)}
    
    # Ma trận khoảng cách
    distance_matrix = [[0]*num_cities for _ in range(num_cities)]
    for i in range(num_cities):
        for j in range(num_cities):
            if i != j:
                distance_matrix[i][j] = haversine_distance(
                    city_data[i]["lat"], city_data[i]["lng"],
                    city_data[j]["lat"], city_data[j]["lng"]
                )
    
    def total_distance(path):
        """Tính tổng khoảng cách của lộ trình TSP"""
        dist = 0
        for i in range(len(path)-1):
            dist += distance_matrix[name_to_idx[path[i]]][name_to_idx[path[i+1]]]
        # Về điểm đầu
        dist += distance_matrix[name_to_idx[path[-1]]][name_to_idx[path[0]]]
        return dist
    
    # TOÁN TỬ TSP CHUẨN
    def swap_mutation(path):
        """Đột biến hoán đổi 2 thành phố (trừ thành phố đầu)"""
        if len(path) < 3:
            return path.copy()
        new_path = path.copy()
        # Chỉ hoán đổi các thành phố từ vị trí 1 trở đi
        i, j = random.sample(range(1, len(new_path)), 2)
        new_path[i], new_path[j] = new_path[j], new_path[i]
        return new_path
    
    def inversion_mutation(path):
        """Đột biến đảo ngược đoạn (trừ thành phố đầu)"""
        if len(path) < 4:
            return path.copy()
        new_path = path.copy()
        # Chỉ đảo ngược các thành phố từ vị trí 1 trở đi
        i, j = sorted(random.sample(range(1, len(new_path)), 2))
        new_path[i:j+1] = reversed(new_path[i:j+1])
        return new_path
    
    def order_crossover(parent1, parent2):
        """Lai ghép OX - giữ nguyên điểm xuất phát"""
        if len(parent1) != len(parent2):
            return parent1.copy()
            
        size = len(parent1)
        # Chọn đoạn từ vị trí 1 trở đi (giữ nguyên vị trí 0)
        start, end = sorted(random.sample(range(1, size), 2))
        
        child = parent1.copy()  # Bắt đầu từ parent1
        
        # Tập hợp các thành phố trong đoạn được chọn
        segment_set = set(parent1[start:end+1])
        
        # Điền các thành phố còn lại từ parent2 (bỏ qua những cái đã có trong đoạn)
        current_pos = (end + 1) % size
        for i in range(size):
            city = parent2[(end + 1 + i) % size]
            if city not in segment_set:
                child[current_pos] = city
                current_pos = (current_pos + 1) % size
                if current_pos == start:  # Nhảy qua đoạn đã copy
                    current_pos = (end + 1) % size
        
        return child
    
    # 🎯 KHỞI TẠO QUẦN THỂ - GIỮ NGUYÊN ĐIỂM XUẤT PHÁT
    start_city = cities[0]  # Điểm xuất phát luôn là thành phố đầu tiên
    other_cities = cities[1:]  # Các thành phố còn lại
    
    whales = []
    for _ in range(population_size):
        # Xáo trộn các thành phố còn lại, giữ nguyên điểm xuất phát
        shuffled_others = other_cities.copy()
        random.shuffle(shuffled_others)
        path = [start_city] + shuffled_others
        whales.append(path)
    
    best_whale = min(whales, key=total_distance)
    best_distance = total_distance(best_whale)
    steps = []
    
    print(f"🎯 WCO starting - Population: {population_size}, Iterations: {max_iter}")
    print(f"📍 Start city: {start_city}")
    print(f"📊 Initial best: {best_distance:.2f} km")
    
    best_distances_history = [best_distance]  # Lưu lịch sử best distance
    
    for iteration in range(max_iter):
        a = 2.0 - iteration * (2.0 / max_iter)  # a giảm từ 2 -> 0
        
        iteration_improved = False
        
        for i in range(population_size):
            r = random.random()
            A = 2 * a * r - a  # A ∈ [-a, a]
            p = random.random()
            
            current_whale = whales[i]
            new_whale = current_whale.copy()
            
            if p < 0.5:
                if abs(A) < 1:
                    # EXPLOITATION: Di chuyển về best solution
                    if random.random() < 0.7:
                        new_whale = order_crossover(current_whale, best_whale)
                    else:
                        new_whale = swap_mutation(best_whale)
                else:
                    # EXPLORATION: Tìm kiếm ngẫu nhiên
                    rand_idx = random.randint(0, population_size-1)
                    rand_whale = whales[rand_idx]
                    if random.random() < 0.7:
                        new_whale = order_crossover(current_whale, rand_whale)
                    else:
                        new_whale = swap_mutation(rand_whale)
            else:
                # SPIRAL UPDATE: Local search
                if random.random() < 0.5:
                    new_whale = inversion_mutation(current_whale)
                else:
                    new_whale = swap_mutation(current_whale)
            
            # Đảm bảo điểm xuất phát không thay đổi
            if new_whale[0] != start_city:
                # Nếu bị thay đổi, sửa lại
                new_whale = [start_city] + [city for city in new_whale if city != start_city]
            
            # Đánh giá và chọn lọc
            new_distance = total_distance(new_whale)
            current_distance = total_distance(current_whale)
            
            if new_distance < current_distance:
                whales[i] = new_whale
                current_distance = new_distance
            
            # Cập nhật best toàn cục
            if new_distance < best_distance:
                best_whale = new_whale.copy()
                best_distance = new_distance
                iteration_improved = True
                print(f"🔥 Iteration {iteration+1}: New best = {best_distance:.2f} km")
        
        best_distances_history.append(best_distance)
        
        # 🎯 TẠO STEP CHO ANIMATION - VỚI DỮ LIỆU THỰC
        current_best = best_whale
        
        # Tạo neighbors thực tế từ current city (luôn là start_city)
        current_city = start_city
        neighbors = []
        for city in other_cities:  # Chỉ các thành phố khác start
            distance = distance_matrix[name_to_idx[current_city]][name_to_idx[city]]
            neighbors.append({
                "name": city, 
                "h": round(distance, 2)
            })
        
        # Sắp xếp neighbors theo khoảng cách
        neighbors.sort(key=lambda x: x["h"])
        
        # Lấy thành phố tiếp theo trong best solution hiện tại
        chosen_city = current_best[1] if len(current_best) > 1 else current_city
        
        steps.append({
            "step": iteration + 1,
            "currentCity": current_city,
            "neighbors": neighbors[:4],  # 4 neighbors gần nhất
            "chosenCity": chosen_city,
            "consideredEdge": {"from": current_city, "to": chosen_city},
            "chosenEdge": {"from": current_city, "to": chosen_city},
            "partialPath": current_best,
            "currentBestDistance": round(best_distance, 2)
        })
    
    # Tạo edges
    edges = []
    for i in range(num_cities):
        for j in range(i+1, num_cities):
            edges.append({
                "from": cities[i],
                "to": cities[j], 
                "distance": round(distance_matrix[i][j], 2)
            })
    
    # Tạo solution cuối cùng (thêm điểm về start)
    final_solution = best_whale + [start_city]
    
    # ✅ TÍNH OPTIMAL VÀ SOLUTION QUALITY
    optimal_distance = calculate_optimal_distance(city_data)
    solution_quality = calculate_solution_quality(best_distance, optimal_distance)
    
    print(f"✅ WCO completed - Final best: {best_distance:.2f} km")
    print(f"📊 Total steps: {len(steps)}")
    print(f"📈 Improvement: {best_distances_history[0]:.2f} -> {best_distance:.2f} km")
    print(f"🎯 Optimal distance: {optimal_distance:.2f} km")
    print(f"🎯 Solution quality: {solution_quality}%")
    print(f"📏 Gap to optimal: {best_distance - optimal_distance:.2f} km")
    
    return {
        "best_solution": final_solution,
        "best_distance": round(best_distance, 2),
        "execution_time": round(time.time() - start_time, 4),
        "cities": city_data,
        "edges": edges,
        "steps": steps,
        "starting_point": start_city,
        "algorithm": "WCO",
        "optimal_distance": optimal_distance,
        "solution_quality": solution_quality  # ✅ THÊM VÀO
    }

# --------------------------
# Endpoint tích hợp cả 2 thuật toán
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

        # Tính GBFS
        gbfs_result = gbfs_tsp(cities)
        # Tính WCO
        wco_result = wco_tsp(cities)

        return jsonify({"GBFS": gbfs_result, "WCO": wco_result})
        
    except Exception as e:
        print(f"❌ Error in calculate-route: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Flask GBFS + WCO TSP Server...")
    print("📍 Endpoint: http://127.0.0.1:5000")
    print("📌 Available routes:")
    print("   GET  /api/health")
    print("   POST /api/calculate-route  🎯 (GBFS + WCO)")
    app.run(debug=True, host='127.0.0.1', port=5000)