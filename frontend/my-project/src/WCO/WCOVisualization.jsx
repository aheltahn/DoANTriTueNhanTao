import React, { useState, useEffect, useRef, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Calculator,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 500;

const projectLatLngToXY = (lat, lng, w, h) => {
  const latMin = 8.0;
  const latMax = 23.5;
  const lngMin = 102.0;
  const lngMax = 109.5;

  const x = ((lng - lngMin) / (lngMax - lngMin)) * (w - 80) + 40;
  const y = (1 - (lat - latMin) / (latMax - latMin)) * (h - 80) + 40;
  return { x, y };
};

const WcoVisualization = ({
  wcoResult = null,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [simSpeed, setSimSpeed] = useState(900);

  const fgRef = useRef();
  const playTimerRef = useRef(null);

  // DEBUG: Log dữ liệu nhận được
  useEffect(() => {
    console.log("🔍 WCO Result received:", wcoResult);
    if (wcoResult) {
      console.log("📊 Steps data:", wcoResult.steps);
      console.log("💰 Best distance:", wcoResult.best_distance);
      console.log("🎯 Total steps:", wcoResult.steps?.length);
    }
  }, [wcoResult]);

  // 🎯 Reset khi có dữ liệu mới
  useEffect(() => {
    if (wcoResult?.steps) {
      setStepIndex(0);
      setPlaying(false);
    }
  }, [wcoResult]);

  // 🎯 Xử lý steps cho WCO
  const steps = useMemo(() => {
    if (!wcoResult?.steps) return [];
    return wcoResult.steps;
  }, [wcoResult]);

  // 🎯 Tính convergence data với best distance thực tế từ backend
  const convergenceData = useMemo(() => {
    if (!steps.length) return [];

    console.log("📈 Calculating convergence data from", steps.length, "steps");

    const data = [];
    let minDistanceSoFar = Infinity;

    steps.forEach((step, index) => {
      // SỬA: Sử dụng currentBestDistance từ backend nếu có
      const currentBestDistance =
        step.currentBestDistance || wcoResult?.best_distance || 0;

      if (currentBestDistance < minDistanceSoFar) {
        minDistanceSoFar = currentBestDistance;
      }

      data.push({
        iteration: step.step || index + 1,
        bestDistance: minDistanceSoFar,
        currentDistance: currentBestDistance,
      });
    });

    console.log("📊 Convergence data:", data);
    return data;
  }, [steps, wcoResult]);

  const graphData = useMemo(() => {
    if (!wcoResult) {
      return { nodes: [], links: [] };
    }

    const cities = wcoResult.cities || [];
    const edges = wcoResult.edges || [];

    const nodes = cities.map((c, i) => {
      const node = {
        id: c.name,
        name: c.name,
      };

      if (c.lat !== undefined && c.lng !== undefined) {
        const p = projectLatLngToXY(c.lat, c.lng, width, height);
        node.x = p.x;
        node.y = p.y;
        node.lat = c.lat;
        node.lng = c.lng;
      } else {
        node.x = Math.random() * (width - 100) + 50;
        node.y = Math.random() * (height - 100) + 50;
      }
      return node;
    });

    const links = edges
      .map((e) => {
        const sourceNode = nodes.find((n) => n.id === e.from);
        const targetNode = nodes.find((n) => n.id === e.to);

        if (!sourceNode || !targetNode) return null;

        return {
          source: sourceNode,
          target: targetNode,
          distance: e.distance,
          status: "default",
          id: `${e.from}-${e.to}`,
        };
      })
      .filter((link) => link !== null);

    return { nodes, links };
  }, [wcoResult, width, height]);

  // 🎯 Highlight best path hiện tại
  const visualLinks = useMemo(() => {
    if (!graphData.links.length) {
      return [];
    }

    const linksCopy = graphData.links.map((l) => ({ ...l, status: "default" }));

    if (!wcoResult?.best_solution) return linksCopy;

    // Highlight best path
    const bestPath = wcoResult.best_solution;
    for (let k = 0; k < bestPath.length - 1; k++) {
      const a = bestPath[k];
      const b = bestPath[k + 1];
      linksCopy.forEach((l) => {
        if (
          (l.source.id === a && l.target.id === b) ||
          (l.source.id === b && l.target.id === a)
        ) {
          l.status = "selected";
        }
      });
    }

    return linksCopy;
  }, [graphData.links, wcoResult]);

  // Auto-play effect - SỬA LỖI TRIỆT ĐỂ
  useEffect(() => {
    if (!playing) {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
      return;
    }

    const minSpeed = 200;
    const maxSpeed = 2000;
    const intervalTime = maxSpeed - simSpeed + minSpeed;

    console.log(
      `🎯 Starting auto-play: steps=${steps.length}, interval=${intervalTime}ms`
    );

    playTimerRef.current = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        console.log(`🎯 Auto-play step: ${prev} -> ${next} / ${steps.length}`);

        if (next >= steps.length) {
          console.log("✅ Auto-play completed - stopping");
          clearInterval(playTimerRef.current);
          playTimerRef.current = null;
          setPlaying(false);
          return steps.length - 1;
        }
        return next;
      });
    }, intervalTime);

    return () => {
      if (playTimerRef.current) {
        console.log("🛑 Clearing auto-play interval");
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, [playing, simSpeed, steps.length]);

  const handleNext = () => {
    console.log("⏭️ Next button clicked");
    setPlaying(false);
    setStepIndex((prev) => {
      const next = prev + 1;
      return next >= steps.length ? steps.length - 1 : next;
    });
  };

  const handleReset = () => {
    console.log("🔄 Reset button clicked");
    setPlaying(false);
    setStepIndex(0);
    if (fgRef.current) {
      fgRef.current.zoomToFit(400);
    }
  };

  const handlePlayPause = () => {
    console.log("🎵 Play/Pause clicked:", {
      currentPlaying: playing,
      currentStep: stepIndex,
      totalSteps: steps.length,
    });

    if (stepIndex >= steps.length - 1) {
      // Nếu đã ở step cuối, reset về đầu
      setStepIndex(0);
    }
    setPlaying((prev) => !prev);
  };

  const linkCanvasObject = useMemo(() => {
    return (link, ctx, globalScale) => {
      const MAX_LABEL_FONT = 14;
      const label = link.distance ? `${Math.round(link.distance)} km` : "";

      let color = "#ddd";
      let width = 1;

      if (link.status === "selected") {
        color = "#10b981";
        width = 3;
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(width, width * Math.min(2, globalScale));

      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      ctx.stroke();

      if (label && link.status === "selected") {
        const midX = (link.source.x + link.target.x) / 2;
        const midY = (link.source.y + link.target.y) / 2;
        ctx.font = `${Math.min(MAX_LABEL_FONT, 10 * globalScale)}px Sans-Serif`;
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, midX + 4, midY - 4);
      }
    };
  }, []);

  const nodeCanvasObject = useMemo(() => {
    return (node, ctx, globalScale) => {
      const label = node.id || node.name;
      const fontSize = 12 * Math.min(1.2, globalScale);

      ctx.beginPath();
      ctx.arc(node.x, node.y, 6 + globalScale * 0.6, 0, 2 * Math.PI, false);
      ctx.fillStyle = "steelblue";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#222";
      ctx.stroke();

      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, node.x + 12, node.y);
    };
  }, []);

  useEffect(() => {
    if (!fgRef.current) return;
    setTimeout(() => {
      try {
        fgRef.current.zoomToFit(400);
      } catch (e) {
        console.error("Error zooming to fit:", e);
      }
    }, 300);
  }, [graphData.nodes.length]);

  // 🎯 Tính toán dữ liệu cho biểu đồ hội tụ
  const chartData = convergenceData;

  // 🎯 Tính min/max cho biểu đồ
  const chartStats = useMemo(() => {
    if (!convergenceData.length) return { min: 0, max: 1 };

    const distances = convergenceData.map((d) => d.bestDistance);
    return {
      min: Math.min(...distances),
      max: Math.max(...distances),
    };
  }, [convergenceData]);

  // 🎯 TRẠNG THÁI KHI CHƯA CÓ DỮ LIỆU
  if (!wcoResult) {
    return (
      <div className="w-full rounded-lg shadow-lg border-2 border-dashed border-gray-300 relative">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Calculator size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Mô Phỏng Thuật Toán WCO
          </h3>
          <p className="text-white mb-4">
            Chưa có dữ liệu mô phỏng. Hãy chọn các tỉnh thành và tính toán đường
            đi tối ưu để xem kết quả.
          </p>
        </div>
      </div>
    );
  }

  const currentStep = steps[stepIndex];
  const isCompleted = stepIndex >= steps.length - 1;
  const canPlay = steps.length > 0 && !isCompleted;

  console.log("🔄 Render state:", {
    stepIndex,
    stepsLength: steps.length,
    isCompleted,
    canPlay,
    playing,
  });

  return (
    <div className="w-full  relative">
      {/* HEADER */}
      <div className="p-4 border-b ">
        <h3 className="text-lg font-bold text-white">
          Mô Phỏng Thuật Toán Whale Optimization
        </h3>
        <p className="text-sm text-white">
          Thuật toán:{" "}
          <span className="font-semibold">{wcoResult.algorithm}</span> | Khoảng
          cách tối ưu:{" "}
          <span className="font-semibold">{wcoResult.best_distance} km</span> |
          Số lần lặp: <span className="font-semibold">{steps.length}</span>
        </p>
      </div>

      {/* 2 CỘT CHÍNH */}
      <div className="flex p-4 gap-4">
        {/* 🟥 BÊN TRÁI — ĐỒ THỊ + BIỂU ĐỒ HỘI TỤ */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* ĐỒ THỊ LỘ TRÌNH */}
          <div
            className=" p-4 rounded-lg shadow-inner border"
            style={{
              borderColor: "#01eae6",
              boxShadow: "0 0 10px #d3ffc8, 0 0 10px #d3ffc8",
            }}
          >
            <div className="text-white  font-bold mb-3">Lộ Trình Tối Ưu</div>
            <div
              style={{
                width: width,
                height: height * 0.6,
                borderRadius: 8,
                overflow: "hidden",
                backgroundColor: "#000",
              }}
            >
              <ForceGraph2D
                ref={fgRef}
                graphData={{ nodes: graphData.nodes, links: visualLinks }}
                width={width}
                height={height * 0.6}
                linkDirectionalParticles={0}
                linkCanvasObject={linkCanvasObject}
                nodeCanvasObject={nodeCanvasObject}
                onNodeClick={(node) =>
                  fgRef.current.centerAt(node.x, node.y, 300)
                }
                enableNodeDrag={false}
                cooldownTicks={0}
                backgroundColor="#000"
              />
            </div>
          </div>
          {/* BIỂU ĐỒ HỘI TỤ - ĐÃ ĐIỀU CHỈNH THEO YÊU CẦU */}
          <div className="mt-4 rounded-2xl shadow-2xl border overflow-hidden" style={{ borderColor: "#01eae6", boxShadow: "0 0 10px #d3ffc8, 0 0 10px #d3ffc8", }}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4">
              <h3 className="text-white font-bold text-xl flex items-center gap-3">
                <TrendingUp className="w-6 h-6" />
                Quá Trình Hội Tụ Thuật Toán
              </h3>
              
            </div>

            <div className="h-[500px]  p-6 relative">
              {chartData.length > 0 ? (
                <div className="h-full w-full flex items-center justify-center text-white">
                  <svg
                    className="w-full h-full max-w-full max-h-full text-white"
                    viewBox="0 0 120 100"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ overflow: "visible" }}
                  >
                    
                    {(() => {
                      // === MARGIN ĐIỀU CHỈNH ===
                      const left = 12;
                      const right = 108;
                      const top = 15;
                      const bottom = 85;

                      const widthSVG = right - left;
                      const heightSVG = bottom - top;

                      const denom = chartStats.max - chartStats.min || 1;

                      // === THÊM PADDING CHO TRỤC Y ===
                      const bottomPadding = 8; // khoảng cách từ giá trị min đến đáy
                      const topPadding = 8; // khoảng cách từ giá trị max đến đỉnh
                      const effectiveHeight =
                        heightSVG - bottomPadding - topPadding;

                      // === THÊM PADDING CHO TRỤC X (BÊN TRÁI) ===
                      const leftPadding = 10; // khoảng cách từ trục Y đến điểm đầu tiên
                      const effectiveWidth = widthSVG - leftPadding;

                      // === TOẠ ĐỘ ĐIỂM ===
                      const points = chartData.map((d, i) => {
                        const t =
                          chartData.length === 1
                            ? 0.5
                            : i / (chartData.length - 1);
                        const x = left + leftPadding + t * effectiveWidth; // THÊM leftPadding

                        const ratio = (d.bestDistance - chartStats.min) / denom;
                        const y =
                          top + topPadding + (1 - ratio) * effectiveHeight;

                        return { x, y, d, i };
                      });

                      const polyPoints = points
                        .map((p) => `${p.x},${p.y}`)
                        .join(" ");
                      const polyFill = `${polyPoints} ${right},${bottom} ${left},${bottom}`;

                      return (
                        <>
                          {/* Vùng bóng dưới đường - MỎNG HƠN */}
                          <polygon
                            fill="rgba(16,185,129,0.08)"
                            points={polyFill}
                          />

                          {/* Grid ngang - DÙNG CÙNG CÔNG THỨC PADDING */}
                          {[0, 0.25, 0.5, 0.75, 1].map((g, idx) => {
                            const gy =
                              top + topPadding + (1 - g) * effectiveHeight;
                            return (
                              <line
                                key={idx}
                                x1={left}
                                x2={right}
                                y1={gy}
                                y2={gy}
                                stroke="#e6f4ee"
                                strokeDasharray="2 4"
                                strokeWidth="0.5"
                              />
                            );
                          })}

                          {/* Đường hội tụ - MỎNG HƠN */}
                          <polyline
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="1" // GIẢM từ 3.5 xuống 2.5
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={polyPoints}
                          />

                          {/* Các điểm - ĐIỂM ĐẦU MÀU XANH NHƯ CÁC ĐIỂM KHÁC */}
                          {points.map(({ x, y, d, i }) => {
                            const isFirst = i === 0;
                            const isLast = i === points.length - 1;
                            const currentIter =
                              currentStep?.step ?? stepIndex + 1;
                            const isActive = d.iteration <= currentIter;

                            // Hiển thị ít điểm hơn để tránh quá tải
                            const shouldShow =
                              isFirst ||
                              isLast ||
                              i % Math.ceil(chartData.length / 10) === 0;

                            return (
                              <g key={i}>
                                {(shouldShow || isActive) && (
                                  <>
                                    <circle
                                      cx={x}
                                      cy={y}
                                      r={isFirst || isLast ? 3 : 2} // NHỎ HƠN
                                      fill="#10b981" // TẤT CẢ ĐIỂM MÀU XANH
                                      stroke="#ffffff"
                                      strokeWidth={
                                        isFirst || isLast ? "1" : "0.6"
                                      } // MỎNG HƠN
                                      opacity={isActive ? 1 : 0.5}
                                      style={{ transition: "all 300ms" }}
                                    />

                                    {/* Nhãn điểm đầu và cuối */}
                                    {(isFirst || isLast) && (
                                      <text
                                        x={isFirst ? x + 4 : x} // Bắt đầu: sang phải; Kết thúc: giữ x
                                        y={isFirst ? y : y - 6} // Bắt đầu: giữ y; Kết thúc: lên trên
                                        textAnchor={
                                          isFirst ? "start" : "middle"
                                        } // Bắt đầu: text bắt đầu từ trái; Kết thúc: căn giữa
                                        fontSize="3"
                                        fill="#10b981"
                                        fontWeight="600"
                                      >
                                        {isFirst ? "BẮT ĐẦU" : "KẾT THÚC"}
                                      </text>
                                    )}
                                  </>
                                )}

                                {/* BỎ HIỆU ỨNG NHẤP NHÁY Ở ĐIỂM KẾT THÚC */}
                              </g>
                            );
                          })}

                          {/* Tọa độ trục - MỎNG HƠN */}
                          <line
                            x1={left}
                            x2={left}
                            y1={top}
                            y2={bottom}
                            stroke="#94a3b8"
                            strokeWidth="0.8" // MỎNG HƠN
                          />
                          <line
                            x1={left}
                            x2={right}
                            y1={bottom}
                            y2={bottom}
                            stroke="#94a3b8"
                            strokeWidth="0.8" // MỎNG HƠN
                          />

                          {/* Nhãn Y - ĐIỀU CHỈNH VỊ TRÍ THEO PADDING */}
                          <text
                            x={left - 3}
                            y={top + topPadding}
                            fontSize="3.5"
                            textAnchor="end"
                            fill="#ffffff"
                            fontWeight="600"
                            style={{ userSelect: "none" }}
                          >
                            {chartStats.max.toFixed(0)} km
                          </text>
                          <text
                            x={left - 3}
                            y={(top + bottom) / 2}
                            fontSize="3"
                            textAnchor="end"
                            fill="#ffffff"
                            fontWeight="500"
                            style={{ userSelect: "none" }}
                          >
                            {Math.round((chartStats.max + chartStats.min) / 2)}{" "}
                            km
                          </text>
                          <text
                            x={left - 3}
                            y={bottom - bottomPadding}
                            fontSize="3.5"
                            textAnchor="end"
                            fill="#ffffff"
                            fontWeight="600"
                            style={{ userSelect: "none" }}
                          >
                            {chartStats.min.toFixed(0)} km
                          </text>

                          {/* Nhãn X - ĐIỀU CHỈNH VỊ TRÍ */}
                          <text
                            x={left + leftPadding} // THÊM leftPadding để khớp với điểm bắt đầu
                            y={bottom + 7}
                            fontSize="3"
                            textAnchor="start"
                           fill="#ffffff"
                            fontWeight="500"
                            style={{ userSelect: "none" }}
                          >
                            Lần 1
                          </text>
                          <text
                            x={(left + right) / 2}
                            y={bottom + 7}
                            fontSize="3.5"
                            textAnchor="middle"
                            fill="#059669"
                            fontWeight="700"
                            style={{ userSelect: "none" }}
                          >
                            ← Đang tối ưu →
                          </text>
                          <text
                            x={right}
                            y={bottom + 7}
                            fontSize="3"
                            textAnchor="end"
                            fill="#ffffff"
                            fontWeight="500"
                            style={{ userSelect: "none" }}
                          >
                            Lần{" "}
                            {chartData[chartData.length - 1]?.iteration || 1}
                          </text>
                        </>
                      );
                    })()}
                  </svg>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-lg">
                  Đang tải dữ liệu hội tụ...
                </div>
              )}
            </div>

            {/* Footer */}
            <div className=" px-8 py-6 border-t-2 border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white font-medium text-lg">
                    Cải thiện:
                  </span>
                  <span className="ml-4 text-4xl font-bold text-emerald-600">
                    {Math.round(chartStats.max - chartStats.min)} km
                  </span>
                </div>
                <div>
                  <span className="text-white font-medium text-lg">
                    Tỷ lệ cải thiện:
                  </span>
                  <span className="ml-4 text-4xl font-bold text-emerald-600">
                    {chartStats.max > 0
                      ? ((1 - chartStats.min / chartStats.max) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  BÊN PHẢI — THÔNG TIN WCO */}
        <div className="w-96 shrink-0 flex flex-col gap-4">
          {/*  CONTROLS */}
          <div className=" rounded-lg shadow p-3"  style={{
    background: "linear-gradient(to right, rgba(123,253,251,0.4), rgba(157,253,123,0.4))"
  }}>
            <div className="text-white font-bold mb-2">
               Điều Khiển Mô Phỏng
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded bg-[#9dfd7b] text-white hover:bg-green-600 transition"
                onClick={handlePlayPause}
                disabled={!canPlay}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                className="px-3 py-2 rounded bg-[#7bfdfb]  text-white hover:bg-[#126b6a] transition"
                onClick={handleNext}
                disabled={isCompleted}
              >
                <StepForward size={16} />
              </button>
              <button
                className="px-3 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 transition"
                onClick={handleReset}
              >
                <RotateCcw size={16} />
              </button>
              <div className="ml-2 text-sm text-white flex items-center gap-1">
                <span>Chậm</span>
                <input
                  type="range"
                  min={200}
                  max={2000}
                  step={100}
                  value={simSpeed}
                  onChange={(e) => setSimSpeed(Number(e.target.value))}
                  className="w-32"
                />
                <span>Nhanh</span>
              </div>
            </div>
          </div>

          {/*  THÔNG TIN THUẬT TOÁN */}
          <div className=" rounded-lg shadow p-3"  style={{
    background: "linear-gradient(to right, rgba(123,253,251,0.4), rgba(157,253,123,0.4))"
  }}>
            <div className="font-bold text-white mb-3">
               Thông Tin Thuật Toán
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-white" />
                  <span className="text-sm">Lần lặp hiện tại:</span>
                </div>
                <span className="font-semibold">
                  {currentStep?.step || stepIndex + 1}
                </span>
              </div>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-white" />
                  <span className="text-sm">Khoảng cách tốt nhất:</span>
                </div>
                <span className="font-semibold">
                  {wcoResult.best_distance} km
                </span>
              </div>
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-white" />
                  <span className="text-sm">Kích thước quần thể:</span>
                </div>
                <span className="font-semibold">30 cá voi</span>
              </div>
            </div>
          </div>

          {/* KẾT QUẢ */}
          <div className="rounded-lg shadow p-3" style={{
    background: "linear-gradient(to right, rgba(123,253,251,0.4), rgba(157,253,123,0.4))"
  }}>
            <div className="font-bold text-white mb-3">
               Kết Quả Tối Ưu
            </div>
            <div className="text-sm">
              <div className="mb-2 text-white">
                <strong>Lộ trình:</strong>
              </div>
              <div className=" text-white p-2 rounded text-xs">
                {wcoResult.best_solution
                  ? wcoResult.best_solution.join(" → ")
                  : "—"}
              </div>
            </div>
          </div>

          {/* 📈 TIẾN TRÌNH */}
          <div className="rounded-lg shadow p-3" style={{
    background: "linear-gradient(to right, rgba(123,253,251,0.4), rgba(157,253,123,0.4))"
  }}>
            <div className="font-bold text-white mb-2"> Tiến Trình</div>
            <div className="text-sm space-y-2">
              <div className="flex justify-between text-white">
                <span>Bước mô phỏng:</span>
                <span className="font-semibold">
                  {stepIndex + 1} / {steps.length}
                </span>
              </div>
              <div className="flex justify-between text-white">
                <span>Lần lặp thực:</span>
                <span className="font-semibold">
                  {currentStep?.step || stepIndex + 1} /{" "}
                  {steps[steps.length - 1]?.step || steps.length}
                </span>
              </div>
              <div className="flex justify-between text-white">
                <span>Trạng thái:</span>
                <span
                  className={`font-semibold ${
                    isCompleted ? "text-[#9dfd7b]" : "text-[#7bfdfb]"
                  }`}
                >
                  {isCompleted ? " Đã hoàn thành" : " Đang tối ưu"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WcoVisualization;
