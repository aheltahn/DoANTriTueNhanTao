import math
import time
from typing import List, Dict, Any

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def gbfs_tsp(city_data: List[Dict]) -> Dict[str, Any]:
    """
    GBFS TSP: luôn chọn thành phố tiếp theo dựa trên heuristic distance đến goal
    Trả về format có steps + cities + edges để frontend animation
    """
    start_time = time.time()
    
    # Validate input
    if not city_data or len(city_data) < 2:
        return {
            "best_solution": [],
            "best_distance": 0,
            "execution_time": 0,
            "cities": [],
            "edges": [],
            "steps": [],
            "starting_point": "",
            "algorithm": "GBFS"
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
    
    # GBFS traversal
    unvisited = set(cities)
    start_city = cities[0]
    current_city = start_city
    path = [current_city]
    unvisited.remove(current_city)
    
    steps = []
    step_num = 1
    
    while unvisited:
        # Tạo danh sách neighbors với format phù hợp frontend
        neighbors = []
        for city in unvisited:
            distance = distance_matrix[name_to_idx[current_city]][name_to_idx[city]]
            neighbors.append({
                "name": city, 
                "h": round(distance, 2)  # Làm tròn để hiển thị đẹp
            })
        
        # Chọn thành phố tiếp theo có heuristic nhỏ nhất
        next_city = min(neighbors, key=lambda x: x["h"])["name"]
        
        # Tạo step với đầy đủ thông tin
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
        
        # Di chuyển đến thành phố tiếp theo
        current_city = next_city
        path.append(current_city)
        unvisited.remove(current_city)
        step_num += 1
    
    # Trở về start để khép vòng
    final_step = {
        "step": step_num,
        "currentCity": current_city,
        "neighbors": [],  # Không có neighbors khi trở về start
        "chosenCity": start_city,
        "consideredEdge": {"from": current_city, "to": start_city},
        "chosenEdge": {"from": current_city, "to": start_city},
        "partialPath": path.copy() + [start_city]
    }
    steps.append(final_step)
    path.append(start_city)
    
    # Tính tổng khoảng cách
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
    
    return {
        "best_solution": path,
        "best_distance": round(total_distance, 2),
        "execution_time": round(time.time() - start_time, 4),
        "cities": city_data,
        "edges": edges,
        "steps": steps,
        "starting_point": start_city,
        "algorithm": "GBFS"
    }