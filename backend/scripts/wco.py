import random
import math
import time

def wco_tsp(city_data: list, num_whales=30, max_iter=100):
    """
    WCO (Whale Optimization Algorithm) cho TSP - Phiên bản sửa lỗi hoàn toàn
    """
    start_time = time.time()
    
    if not city_data or len(city_data) < 2:
        return {
            "best_solution": [], "best_distance": 0, "execution_time": 0,
            "cities": [], "edges": [], "steps": [], 
            "starting_point": "", "algorithm": "WCO"
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
        return dist
    
    # Toán tử cho TSP
    def swap_mutation(path):
        """Đột biến hoán đổi 2 thành phố"""
        if len(path) < 2:
            return path.copy()
        new_path = path.copy()
        i, j = random.sample(range(len(new_path)), 2)
        new_path[i], new_path[j] = new_path[j], new_path[i]
        return new_path
    
    def inversion_mutation(path):
        """Đột biến đảo ngược đoạn"""
        if len(path) < 3:
            return path.copy()
        new_path = path.copy()
        i, j = sorted(random.sample(range(len(new_path)), 2))
        new_path[i:j+1] = reversed(new_path[i:j+1])
        return new_path
    
    def crossover(parent1, parent2):
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
    
    # Khởi tạo quần thể
    whales = []
    for _ in range(num_whales):
        path = cities.copy()
        random.shuffle(path)
        path.append(path[0])  # khép vòng
        whales.append(path)
    
    best_whale = min(whales, key=total_distance)
    best_distance = total_distance(best_whale)
    
    steps = []
    iteration_best_distances = []  # Lưu best distance của từng iteration
    
    print(f"🎯 WCO starting - Population: {num_whales}, Iterations: {max_iter}")
    print(f"📊 Initial best distance: {best_distance:.2f} km")
    
    for iteration in range(max_iter):
        a = 2.0 - iteration * (2.0 / max_iter)  # a giảm từ 2 -> 0
        
        iteration_best = best_distance
        iteration_best_whale = best_whale.copy()
        
        for i in range(num_whales):
            current_whale = whales[i][:-1]  # bỏ city cuối
            
            r = random.random()
            A = 2 * a * r - a  # A ∈ [-a, a]
            p = random.random()
            
            if p < 0.5:
                if abs(A) < 1:
                    # EXPLOITATION: Di chuyển về best solution
                    if random.random() < 0.7:
                        new_whale = crossover(current_whale, best_whale[:-1])
                    else:
                        new_whale = swap_mutation(best_whale[:-1])
                else:
                    # EXPLORATION: Tìm kiếm ngẫu nhiên
                    rand_idx = random.randint(0, num_whales-1)
                    rand_whale = whales[rand_idx][:-1]
                    
                    if random.random() < 0.7:
                        new_whale = crossover(current_whale, rand_whale)
                    else:
                        new_whale = swap_mutation(rand_whale)
            else:
                # SPIRAL UPDATE: Local search
                if random.random() < 0.5:
                    new_whale = inversion_mutation(current_whale)
                else:
                    new_whale = swap_mutation(current_whale)
            
            # Đảm bảo lộ trình hợp lệ
            new_whale.append(new_whale[0])
            
            # Chọn lọc
            new_distance = total_distance(new_whale)
            if new_distance < total_distance(whales[i]):
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
    
    print(f"✅ WCO completed - Total iterations: {max_iter}")
    print(f"📊 Steps generated: {len(steps)}")
    print(f"🎯 Final best distance: {round(best_distance, 2)} km")
    print(f"📈 Best distance improvement: {iteration_best_distances[0]:.2f} -> {best_distance:.2f} km")
    
    return {
        "best_solution": best_whale,
        "best_distance": round(best_distance, 2),
        "execution_time": round(time.time() - start_time, 4),
        "cities": city_data,
        "edges": edges,
        "steps": steps,
        "starting_point": best_whale[0],
        "algorithm": "WCO"
    }