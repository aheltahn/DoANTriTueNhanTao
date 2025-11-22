import math
import time
from typing import List, Dict, Any

# Hàm tính khoảng cách giữa hai thành phố ( Haversine )
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
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
# HÀM GBFS CHÍNH - GIỮ NGUYÊN CẤU TRÚC CŨ + BỔ SUNG TÍNH NĂNG MỚI
# --------------------------
def gbfs_tsp(city_data: List[Dict]) -> Dict[str, Any]:
    """
    GBFS TSP: luôn chọn thành phố tiếp theo dựa trên heuristic distance đến goal
    Trả về format có steps + cities + edges để frontend animation
    """
    start_time = time.time()
    
    # Kiểm tra dữ liệu đầu vào, nếu không có dữ liệu hoặc dưới 2 thành phố thì trả về kết quả trống
    if not city_data or len(city_data) < 2:
        return {
            "best_solution": [],
            "best_distance": 0,
            "execution_time": 0,
            "cities": [],
            "edges": [],
            "steps": [],
            "starting_point": "",
            "algorithm": "GBFS",
            "optimal_distance": 0,        # BỔ SUNG MỚI
            "solution_quality": 0         # BỔ SUNG MỚI
        }
    
    # Chuẩn bị danh sách tên thành phố (tạo map để truy cập nhanh ma trận khoảng cách)
    cities = [c["name"] for c in city_data]
    num_cities = len(cities)
    
    name_to_idx = {c["name"]: i for i, c in enumerate(city_data)}
    
    # Ma trận khoảng cách (sử dụng haversine_distance để tính toán khoảng cách giữa mọi thành phố)
    distance_matrix = [[0]*num_cities for _ in range(num_cities)]
    for i in range(num_cities):
        for j in range(num_cities):
            if i != j:
                distance_matrix[i][j] = haversine_distance(
                    city_data[i]["lat"], city_data[i]["lng"],
                    city_data[j]["lat"], city_data[j]["lng"]
                )
    
    # GBFS khởi tạo thuật toán
    unvisited = set(cities) #chứa các thành phố chưa thăm
    start_city = cities[0] #bắt đầu từ thành phố đầu tiên
    current_city = start_city #thành phố hiện tại
    path = [current_city] #lưu hành trình đường đi
    unvisited.remove(current_city) #đánh dấu thành phố hiện tại đã thăm
    
    steps = []
    step_num = 1
    
    #Vòng lặp chính
    while unvisited:
        # Tạo danh sách neighbors, tính heuristic h(n) cho tất cả hàng xóm
        # Với GBFS, heuristic = khoảng cách nhỏ nhất đến thành phố mục tiêu (ở đây mục tiêu = gần nhất tiếp theo).
        neighbors = []
        for city in unvisited:
            distance = distance_matrix[name_to_idx[current_city]][name_to_idx[city]]
            neighbors.append({
                "name": city, 
                "h": round(distance, 2)  # Làm tròn để hiển thị đẹp
            })
        
        # Chọn thành phố tiếp theo có heuristic nhỏ nhất
        next_city = min(neighbors, key=lambda x: x["h"])["name"]
        
        # Tạo step với đầy đủ thông tin gửi cho frontend
        step_info = {
            "step": step_num,
            "currentCity": current_city,
            "neighbors": neighbors,  # Đảm bảo là array of objects
            "chosenCity": next_city,
            "consideredEdge": {"from": current_city, "to": next_city},
            "chosenEdge": {"from": current_city, "to": next_city},
            "partialPath": path.copy()
        }
        
        steps.append(step_info)
        
        # Di chuyển đến thành phố tiếp theo (cập nhật vị trí mới, thêm vào hành trình (path), loại bỏ khỏi danh sách chưa thăm(unvisited))
        current_city = next_city
        path.append(current_city)
        unvisited.remove(current_city)
        step_num += 1
    
    # Trở về start (thành phố đầu) để khép vòng, hoàn thành chu trình TSP
    final_step = {
        "step": step_num,
        "currentCity": current_city,
        "neighbors": [],  # Không có neighbors khi trở về start
        "chosenCity": start_city,
        "consideredEdge": {"from": current_city, "to": start_city},
        "chosenEdge": {"from": current_city, "to": start_city},
        "partialPath": path.copy() + [start_city]
    }
    steps.append(final_step) #thêm 1 step để fe vẽ điểm quay lại vị trí đầu
    path.append(start_city)
    
    # Tính tổng khoảng cách giữa các thành phố liên tiếp trong hành trình = chiều dài đường đi
    total_distance = 0
    for i in range(len(path)-1):
        total_distance += distance_matrix[name_to_idx[path[i]]][name_to_idx[path[i+1]]]
    
    # Tạo edges (2 chiều cho trực quan, làm tròn distance)
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
    solution_quality = calculate_solution_quality(total_distance, optimal_distance)
    
    return {
        "best_solution": path,
        "best_distance": round(total_distance, 2),
        "execution_time": round(time.time() - start_time, 4),
        "cities": city_data,
        "edges": edges,
        "steps": steps,
        "starting_point": start_city,
        "algorithm": "GBFS",
        "optimal_distance": optimal_distance,        # BỔ SUNG MỚI
        "solution_quality": solution_quality         # BỔ SUNG MỚI
    }
    
# --------------------------
# TEST VÀ IN KẾT QUẢ
# --------------------------
if __name__ == "__main__":
    # Dữ liệu mẫu để test
    sample_cities = [
        {"name": "Hanoi", "lat": 21.0278, "lng": 105.8342},
        {"name": "Haiphong", "lat": 20.8449, "lng": 106.6881},
        {"name": "Danang", "lat": 16.0544, "lng": 108.2022},
        {"name": "Hochiminh", "lat": 10.7758, "lng": 106.7019},
        {"name": "Cantho", "lat": 10.0454, "lng": 105.7469}
    ]
    
    print("=" * 70)
    print("KẾT QUẢ THUẬT TOÁN GBFS CHO BÀI TOÁN TSP")
    print("=" * 70)
    
    # Chạy thuật toán
    result = gbfs_tsp(sample_cities)
    
    # In thông tin tổng quan
    print(f"\n THÔNG TIN TỔNG QUAN:")
    print(f"   - Thuật toán: {result['algorithm']}")
    print(f"   - Thời gian thực thi: {result['execution_time']} giây")
    print(f"   - Điểm xuất phát: {result['starting_point']}")
    print(f"   - Khoảng cách tối ưu ước tính: {result['optimal_distance']} km")
    print(f"   - Chất lượng nghiệm: {result['solution_quality']}%")
    
    # In hành trình tốt nhất
    print(f"\n HÀNH TRÌNH TỐT NHẤT ({len(result['best_solution'])-1} chặng):")
    path = result['best_solution']
    for i in range(len(path) - 1):
        print(f"   {i+1:2d}. {path[i]:<12} → {path[i+1]:<12}")
    
    # In tổng khoảng cách
    print(f"\n TỔNG KHOẢNG CÁCH: {result['best_distance']} km")
    
    # In ma trận khoảng cách
    print(f"\n MA TRẬN KHOẢNG CÁCH GIỮA CÁC THÀNH PHỐ (km):")
    cities = [city["name"] for city in sample_cities]
    print(" " * 12, end="")
    for city in cities:
        print(f"{city[:8]:<10}", end="")
    print()
    
    for i, city1 in enumerate(cities):
        print(f"{city1:<12}", end="")
        for j, city2 in enumerate(cities):
            if i == j:
                print(f"{'0':<10}", end="")
            else:
                distance = haversine_distance(
                    sample_cities[i]["lat"], sample_cities[i]["lng"],
                    sample_cities[j]["lat"], sample_cities[j]["lng"]
                )
                print(f"{distance:<10.1f}", end="")
        print()
    
    # In chi tiết từng bước thực hiện
    print(f"\n CHI TIẾT CÁC BƯỚC THỰC HIỆN:")
    for step in result['steps']:
        print(f"\n   Bước {step['step']}:")
        print(f"     - Thành phố hiện tại: {step['currentCity']}")
        print(f"     - Các lựa chọn kế tiếp:")
        
        if step['neighbors']:
            for neighbor in step['neighbors']:
                marker = "✓" if neighbor['name'] == step['chosenCity'] else " "
                print(f"        {marker} {neighbor['name']}: {neighbor['h']} km")
        else:
            print(f"        ✓ Quay về {step['chosenCity']}")
        
        print(f"     - Đường đi được chọn: {step['chosenEdge']['from']} → {step['chosenEdge']['to']}")
        print(f"     - Hành trình hiện tại: {' → '.join(step['partialPath'])}")
    
    # In kết luận
    print(f"\n KẾT LUẬN:")
    print(f"   Thuật toán GBFS đã tìm được hành trình với tổng khoảng cách {result['best_distance']} km.")
    print(f"   Chất lượng nghiệm so với tối ưu: {result['solution_quality']}%")
    
    if result['solution_quality'] >= 90:
        print(" Chất lượng nghiệm rất tốt!")
    elif result['solution_quality'] >= 70:
        print(" Chất lượng nghiệm ở mức chấp nhận được.")
    else:
        print(" Chất lượng nghiệm cần cải thiện.")
    
    print("=" * 70)