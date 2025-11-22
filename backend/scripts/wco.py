import random
import math
import time

# Hàm tính khoảng cách Haversine - BỔ SUNG MỚI
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
# HÀM TÍNH OPTIMAL DISTANCE - BỔ SUNG MỚI
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
# HÀM TÍNH SOLUTION QUALITY - BỔ SUNG MỚI
# --------------------------
def calculate_solution_quality(best_distance, optimal_distance):
    """
    Tính chất lượng nghiệm (0-100%)
    """
    if best_distance <= 0 or optimal_distance <= 0:
        return 0.0
    
    quality = (optimal_distance / best_distance) * 100
    
    # Giới hạn tối đa 100%
    return min(round(quality, 1), 100.0)

# --------------------------
# HÀM WCO CHÍNH - GIỮ NGUYÊN CẤU TRÚC CŨ + BỔ SUNG TÍNH NĂNG MỚI
# --------------------------
def wco_tsp(city_data: list, num_whales=30, max_iter=100):
    """
    WCO (Whale Optimization Algorithm) cho TSP - Phiên bản sửa lỗi hoàn toàn
    """
    start_time = time.time() #Lưu thời gian bắt đầu, tính toán thời gian chạy
    
    if not city_data or len(city_data) < 2: #Nếu không có dữ liệu hoặc dưới 2 thành phố thì trả về kết quả trống
        return {
            "best_solution": [], "best_distance": 0, "execution_time": 0,
            "cities": [], "edges": [], "steps": [], 
            "starting_point": "", "algorithm": "WCO",
            "optimal_distance": 0, "solution_quality": 0  # BỔ SUNG MỚI
        }
    
    cities = [c["name"] for c in city_data] #Chuẩn bị danh sách tên thành phố
    num_cities = len(cities)
    name_to_idx = {c["name"]: i for i, c in enumerate(city_data)} #Lưu chỉ số (index) cho từng thành phố => Tạo map để truy cập nhanh ma trận khoảng cách
    
    # Ma trận khoảng cách (tính toán khoảng cách giữa mọi thành phố bằng công thức haversine)
    distance_matrix = [[0]*num_cities for _ in range(num_cities)]
    for i in range(num_cities):
        for j in range(num_cities):
            if i != j:
                distance_matrix[i][j] = haversine_distance(
                    city_data[i]["lat"], city_data[i]["lng"],
                    city_data[j]["lat"], city_data[j]["lng"]
                )
    
    # Hàm tính tổng khoảng cách lộ trình (đánh giá chất lượng lộ trình)
    def total_distance(path):
        """Tính tổng khoảng cách của lộ trình TSP"""
        dist = 0
        for i in range(len(path)-1):
            dist += distance_matrix[name_to_idx[path[i]]][name_to_idx[path[i+1]]]
        return dist
    
    # Toán tử cho TSP hoán đổi và đảo ngược (toán tử tiến hóa mutation và crossover)
    def swap_mutation(path): # hoán đổi giúp đa dạng hóa quần thể
        """Đột biến hoán đổi 2 thành phố"""
        if len(path) < 2:
            return path.copy()
        new_path = path.copy()
        i, j = random.sample(range(len(new_path)), 2)
        new_path[i], new_path[j] = new_path[j], new_path[i]
        return new_path
    
    def inversion_mutation(path): # đảo ngược giúp tìm kiếm cục bộ, cải thiện khai phá
        """Đột biến đảo ngược đoạn"""
        if len(path) < 3:
            return path.copy()
        new_path = path.copy()
        i, j = sorted(random.sample(range(len(new_path)), 2))
        new_path[i:j+1] = reversed(new_path[i:j+1])
        return new_path
    
    def crossover(parent1, parent2): # lai giúp kết hợp thông tin từ 2 cá thể tốt, giữ nguyên thứ tự thành phố
        """Lai ghép OX (Order Crossover) cho TSP"""
        if len(parent1) != len(parent2):
            return parent1.copy()
            
        size = len(parent1)
        start, end = sorted(random.sample(range(size), 2))
        
        child = [None] * size
        child[start:end+1] = parent1[start:end+1]
        
        # Điền các thành phố còn lại từ parent2
        pointer = (end + 1) % size
        for city in parent2:
            if city not in child:
                child[pointer] = city
                pointer = (pointer + 1) % size
        
        return child
    
    # Khởi tạo quần thể cá voi (whales) với các lộ trình ngẫu nhiên
    whales = []
    for _ in range(num_whales): #mỗi cá thể là một lộ trình ngẫu nhiên
        path = cities.copy()
        random.shuffle(path)
        path.append(path[0])  # khép vòng bằng việc append city đầu tiên vào cuối
        whales.append(path)
    
    best_whale = min(whales, key=total_distance) #tìm cá thể tốt nhất ban đầu
    best_distance = total_distance(best_whale)
    
    steps = []
    iteration_best_distances = []  # Lưu best distance của từng iteration
    
    print(f" WCO starting - Population: {num_whales}, Iterations: {max_iter}")
    print(f" Initial best distance: {best_distance:.2f} km")
    
    #vòng lặp chính của WCO
    for iteration in range(max_iter):
        a = 2.0 - iteration * (2.0 / max_iter)  # a giảm từ 2 -> 0, điều khiển cân bằng khám phá và khai thác
        
        iteration_best = best_distance
        iteration_best_whale = best_whale.copy()
        
        for i in range(num_whales):
            current_whale = whales[i][:-1]  # bỏ city cuối
            
            #cập nhật vị trí cá voi, A,p quyết định chiến lược di chuyển
            r = random.random()
            A = 2 * a * r - a  # A ∈ [-a, a]
            p = random.random()
            
            if p < 0.5: 
                if abs(A) < 1: # nếu |A| < 1 thì thực hiện khai thác
                    # EXPLOITATION: Di chuyển về best solution
                    if random.random() < 0.7:
                        new_whale = crossover(current_whale, best_whale[:-1])
                    else:
                        new_whale = swap_mutation(best_whale[:-1])
                else:
                    # nếu |A| >= 1 thì thực hiện khám phá ngẫu nhiên
                    # EXPLORATION: Tìm kiếm ngẫu nhiên
                    rand_idx = random.randint(0, num_whales-1)
                    rand_whale = whales[rand_idx][:-1]
                    
                    if random.random() < 0.7:
                        new_whale = crossover(current_whale, rand_whale)
                    else:
                        new_whale = swap_mutation(rand_whale)
            else:
                # SPIRAL UPDATE: Local search
                if random.random() < 0.5: # cập nhật bằng xoắn ốc (spiral)
                    new_whale = inversion_mutation(current_whale)
                else:
                    new_whale = swap_mutation(current_whale)
            
            # Đảm bảo lộ trình hợp lệ
            new_whale.append(new_whale[0])
            
            # Chọn lọc
            new_distance = total_distance(new_whale)
            if new_distance < total_distance(whales[i]): # giữ cá thể tốt hơn
                whales[i] = new_whale
            
            # Cập nhật best toàn cục
            if new_distance < best_distance:
                best_whale = new_whale.copy()
                best_distance = new_distance
                print(f"🔥 Iteration {iteration}: New best distance = {best_distance:.2f} km")
            
            # Cập nhật best của iteration
            if new_distance < iteration_best:
                iteration_best = new_distance
                iteration_best_whale = new_whale.copy()
        
        # Lưu best distance của iteration
        iteration_best_distances.append(iteration_best)
        
        # Lưu bước cho animation - MỖI ITERATION ĐỀU CÓ DỮ LIỆU KHÁC NHAU
        current_best_for_step = iteration_best_whale
        
        # Tạo neighbors thực tế
        current_city = current_best_for_step[0]
        neighbors = []
        for city in cities:
            if city != current_city and city in current_best_for_step:
                distance = distance_matrix[name_to_idx[current_city]][name_to_idx[city]]
                neighbors.append({
                    "name": city, 
                    "h": round(distance, 2)
                })
        
        # Lấy thành phố tiếp theo trong lộ trình
        next_city_idx = (current_best_for_step.index(current_city) + 1) % len(current_best_for_step)
        chosen_city = current_best_for_step[next_city_idx]
        
        steps.append({
            "step": iteration + 1,
            "currentCity": current_city,
            "neighbors": neighbors[:3],  # Chỉ lấy 3 neighbors đầu
            "chosenCity": chosen_city,
            "consideredEdge": {"from": current_city, "to": chosen_city},
            "chosenEdge": {"from": current_city, "to": chosen_city},
            "partialPath": current_best_for_step[:-1],  # Bỏ city cuối
            "currentBestDistance": round(iteration_best, 2)
        })
    
    # Đảm bảo có đúng 50 steps (lấy đều từ các iteration)
    if len(steps) > 50:
        step_interval = max(1, len(steps) // 50)
        steps = steps[::step_interval][:50]
    
    # Cập nhật step numbers
    for i, step in enumerate(steps):
        step["step"] = i + 1
    
    # Tạo edges
    edges = []
    for i in range(num_cities):
        for j in range(i+1, num_cities):
            edges.append({
                "from": cities[i],
                "to": cities[j], 
                "distance": round(distance_matrix[i][j], 2)
            })
    
    # BỔ SUNG TÍNH NĂNG MỚI TỪ SERVER
    optimal_distance = calculate_optimal_distance(city_data)
    solution_quality = calculate_solution_quality(best_distance, optimal_distance)
    
    print(f" WCO completed - Total iterations: {max_iter}")
    print(f" Steps generated: {len(steps)}")
    print(f" Final best distance: {round(best_distance, 2)} km")
    print(f" Best distance improvement: {iteration_best_distances[0]:.2f} -> {best_distance:.2f} km")
    print(f" Optimal distance: {optimal_distance:.2f} km")  # BỔ SUNG MỚI
    print(f" Solution quality: {solution_quality}%")  # BỔ SUNG MỚI
    
    return {
        "best_solution": best_whale,
        "best_distance": round(best_distance, 2),
        "execution_time": round(time.time() - start_time, 4),
        "cities": city_data,
        "edges": edges,
        "steps": steps,
        "starting_point": best_whale[0],
        "algorithm": "WCO",
        "optimal_distance": optimal_distance,  # BỔ SUNG MỚI
        "solution_quality": solution_quality   # BỔ SUNG MỚI
    }