import React, { useState, useEffect, useRef, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Play, Pause, StepForward, RotateCcw, Calculator } from "lucide-react";

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

const GbfsVisualization = ({
  gbfsResult = null,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [simSpeed, setSimSpeed] = useState(900);
  const [hoveredLink, setHoveredLink] = useState(null);

  const fgRef = useRef();
  const playTimerRef = useRef(null);

  // DEBUG: Log dữ liệu nhận được
  useEffect(() => {
    console.log("GBFS Result received:", gbfsResult);
    if (gbfsResult) {
      console.log(" Steps data:", gbfsResult.steps);
      console.log(" Cities data:", gbfsResult.cities);
      console.log(" Edges data:", gbfsResult.edges);
    }
  }, [gbfsResult]);

  //  KHAI BÁO steps TRƯỚC KHI SỬ DỤNG
  const steps = useMemo(() => {
    if (!gbfsResult?.steps) return [];
    const originalSteps = gbfsResult.steps;
    if (originalSteps.length === 0) return [];

    const lastStep = originalSteps[originalSteps.length - 1];
    const firstCity = originalSteps[0].currentCity;

    // Tạo bước ảo quay về điểm xuất phát
    const returnStep = {
      currentCity: lastStep.currentCity,
      chosenCity: firstCity,
      partialPath: [...(lastStep.partialPath || []), firstCity],
      neighbors: [], // bảng neighbors trống cho bước ảo
    };

    // Trả về toàn bộ steps + bước ảo
    return [...originalSteps, returnStep];
  }, [gbfsResult]);

  const graphData = useMemo(() => {
    if (!gbfsResult) {
      return { nodes: [], links: [] };
    }

    const cities = gbfsResult.cities || [];
    const edges = gbfsResult.edges || [];

    console.log(
      `Building graph with ${cities.length} cities and ${edges.length} edges`
    );

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
        console.log(
          ` Node ${node.id}: (${c.lat}, ${c.lng}) -> (${node.x}, ${node.y})`
        );
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

        if (!sourceNode || !targetNode) {
          console.warn(` Cannot find nodes for link: ${e.from} -> ${e.to}`);
          return null;
        }

        return {
          source: sourceNode,
          target: targetNode,
          distance: e.distance,
          status: "default",
          id: `${e.from}-${e.to}`,
        };
      })
      .filter((link) => link !== null);

    console.log(" Final graph data:", {
      nodes: nodes.length,
      links: links.length,
      nodeIds: nodes.map((n) => n.id),
      linkSources: links.map((l) => l.source.id),
      linkTargets: links.map((l) => l.target.id),
    });

    return { nodes, links };
  }, [gbfsResult, width, height]);

  //  KHAI BÁO visualLinks TRƯỚC KHI SỬ DỤNG
  const visualLinks = useMemo(() => {
    if (!graphData.links.length) {
      return [];
    }

    const linksCopy = graphData.links.map((l) => ({ ...l, status: "default" }));

    const s = steps[stepIndex];
    if (!s) return linksCopy;

    // Reset all links first
    linksCopy.forEach((l) => (l.status = "default"));

    // Highlight considered edge
    if (s.consideredEdge) {
      linksCopy.forEach((l) => {
        if (
          (l.source.id === s.consideredEdge.from &&
            l.target.id === s.consideredEdge.to) ||
          (l.source.id === s.consideredEdge.to &&
            l.target.id === s.consideredEdge.from)
        ) {
          l.status = "current";
        }
      });
    }

    // Highlight chosen edge
    if (s.chosenEdge) {
      linksCopy.forEach((l) => {
        if (
          (l.source.id === s.chosenEdge.from &&
            l.target.id === s.chosenEdge.to) ||
          (l.source.id === s.chosenEdge.to && l.target.id === s.chosenEdge.from)
        ) {
          l.status = "selected";
        }
      });
    }

    // Highlight partial path
    if (s.partialPath && Array.isArray(s.partialPath)) {
      for (let k = 0; k < s.partialPath.length - 1; k++) {
        const a = s.partialPath[k];
        const b = s.partialPath[k + 1];
        linksCopy.forEach((l) => {
          if (
            (l.source.id === a && l.target.id === b) ||
            (l.source.id === b && l.target.id === a)
          ) {
            l.status = "selected";
          }
        });
      }
    }

    return linksCopy;
  }, [graphData.links, stepIndex, steps]);

  useEffect(() => {
    if (!playing) {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
      return;
    }
    const minSpeed = 200; // tốc độ nhanh nhất
    const maxSpeed = 2000; // tốc độ chậm nhất

    playTimerRef.current = setInterval(() => {
      setStepIndex((prev) => {
        const N = steps.length;
        if (N === 0) return 0;
        const next = prev + 1;
        if (next >= N) {
          clearInterval(playTimerRef.current);
          playTimerRef.current = null;
          setPlaying(false);
          return prev;
        }
        return next;
      });
    }, maxSpeed - simSpeed + minSpeed);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    };
  }, [playing, simSpeed, steps.length]);

  useEffect(() => {
    const s = steps[stepIndex];
    if (s && fgRef.current) {
      try {
        const nodeId = s.currentCity;
        const node = graphData.nodes.find((n) => n.id === nodeId);
        if (node) {
          fgRef.current.centerAt(node.x, node.y, 400);
          fgRef.current.zoom(1.0, 400);
        }
      } catch (err) {
        console.error("Error centering graph:", err);
      }
    }
  }, [stepIndex, steps, graphData.nodes]);

  const handleNext = () => {
    setPlaying(false);
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleReset = () => {
    setPlaying(false);
    setStepIndex(0);
    if (fgRef.current) {
      fgRef.current.zoomToFit(400);
    }
  };

  const linkCanvasObject = useMemo(() => {
    return (link, ctx, globalScale) => {
      // Màu sắc
      let color = "#bbb";
      if (link.status === "current") color = "orange";
      else if (link.status === "selected") color = "green";
      else if (link.status === "candidate") color = "#888";

      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, 1.5 * Math.min(2, globalScale));

      // Vẽ đường thẳng
      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      ctx.stroke();

      // Hiển thị label chỉ khi hover vào link
      if (hoveredLink === link && link.distance) {
        const midX = (link.source.x + link.target.x) / 2;
        const midY = (link.source.y + link.target.y) / 2;
        ctx.font = `${Math.min(14, 12 * globalScale)}px Sans-Serif`;
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.fillText(`${Math.round(link.distance)} km`, midX + 4, midY - 4);
      }
    };
  }, [hoveredLink]);

  const nodeCanvasObject = useMemo(() => {
    return (node, ctx, globalScale) => {
      const label = node.id || node.name;
      const fontSize = 12 * Math.min(1.2, globalScale);

      const currentStep = steps[stepIndex];
      const currentCity = currentStep ? currentStep.currentCity : null;
      const chosen = currentStep ? currentStep.chosenCity : null;

      // Nếu bước cuối (bước ảo quay về xuất phát)
      const isReturnStep = stepIndex === steps.length - 1 && chosen !== null;

      const currentNodeId = isReturnStep ? chosen : currentCity;

      const isCurrent = node.id === currentNodeId;
      const isChosen = !isReturnStep && chosen && node.id === chosen;

      ctx.beginPath();
      ctx.arc(
        node.x,
        node.y,
        isCurrent ? 10 + globalScale : 6 + globalScale * 0.6,
        0,
        2 * Math.PI,
        false
      );
      ctx.fillStyle = isCurrent
        ? "yellow"
        : isChosen
        ? "lightgreen"
        : "steelblue";
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#222";
      ctx.stroke();

      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#111";
      ctx.fillStyle = "#fff";
      ctx.fillText(label, node.x + 12, node.y);
    };
  }, [stepIndex, steps]);

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

  //  DEBUG COMPONENT
  const DebugInfo = () => (
    <div className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded text-xs z-50">
      DEBUG: Nodes: {graphData.nodes.length}, Links: {visualLinks.length},
      Steps: {steps.length}, StepIndex: {stepIndex}
    </div>
  );

  //  TRẠNG THÁI KHI CHƯA CÓ DỮ LIỆU
  if (!gbfsResult) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg border-2 border-dashed border-gray-300 relative">
        <div className="p-8 text-center">
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            Mô Phỏng Thuật Toán GBFS
          </h3>
          <p className="text-gray-500 mb-4">
            Chưa có dữ liệu mô phỏng. Hãy chọn các tỉnh thành và tính toán đường
            đi tối ưu để xem kết quả.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-blue-700">
              <strong>Hướng dẫn:</strong>
              <br />
              1. Chọn ít nhất 2 tỉnh/thành phố
              <br />
              2. Chọn điểm xuất phát
              <br />
              3. Nhấn "Tính đường đi tối ưu"
            </p>
          </div>
        </div>
      </div>
    );
  }

  //  TRẠNG THÁI KHI ĐÃ CÓ KẾT QUẢ
  return (
    <div className="w-full rounded-lg shadow-lg  relative">
      {/* HEADER */}
      <div className="p-4 border-b ">
        <h3 className="text-lg font-bold text-white">
          Mô Phỏng Thuật Toán GBFS
        </h3>
        <p className="text-sm text-white">
          Thuật toán:{" "}
          <span className="font-semibold">{gbfsResult.algorithm}</span> | Tổng
          khoảng cách:{" "}
          <span className="font-semibold">{gbfsResult.best_distance} km</span>
        </p>
      </div>

      {/* 2 CỘT CHÍNH */}
      <div className="flex p-4 gap-4">
        {/*  BÊN TRÁI — CHỈ HIỂN THỊ ĐỒ THỊ */}

        <div
          className="flex-1 min-w-0  p-2 rounded-lg shadow-inner border min-h-[500px]"
          style={{
            borderColor: "#01eae6",
            boxShadow: "0 0 10px #d3ffc8, 0 0 10px #d3ffc8",
          }}
        >
          <div className="text-white font-bold mb-3">Biểu Đồ Mô Phỏng</div>
          <div
            style={{
              width: width, // <-- sửa từ width cố định sang 100%
              height: height,
              borderRadius: 8,
              overflow: "hidden",
              backgroundColor: "#000",
            }}
          >
            <ForceGraph2D
              ref={fgRef}
              graphData={{ nodes: graphData.nodes, links: visualLinks }}
              width={width}
              height={height}
              linkDirectionalParticles={0}
              linkCanvasObject={linkCanvasObject}
              nodeCanvasObject={nodeCanvasObject}
              nodePointerAreaPaint={(node, color, ctx) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false);
                ctx.fill();
              }}
              onNodeClick={(node) =>
                fgRef.current.centerAt(node.x, node.y, 300)
              }
              onLinkHover={(link) => setHoveredLink(link)} // <--- đây
              enableNodeDrag={false}
              dagMode={null}
              cooldownTicks={0}
              linkWidth={(link) => (link.status === "selected" ? 3 : 1)}
              backgroundColor="#000"
            />
          </div>
        </div>

        {/* BÊN PHẢI — CONTROL + THÔNG SỐ + BẢNG */}
        <div className="w-96 shrink-0 flex flex-col gap-4">
          {/*  CONTROLS */}
          <div
            className="  rounded-lg shadow p-3"
            style={{
              background:
                "linear-gradient(to right, rgba(123,253,251,0.4), rgba(157,253,123,0.4))",
            }}
          >
            <div className="text-white font-bold mb-2"> Điều Khiển</div>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-2 rounded bg-[#9dfd7b] text-white hover:bg-green-600 transition"
                onClick={() => setPlaying((prev) => !prev)}
                disabled={steps.length === 0}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>

              <button
                className="px-3 py-2 rounded bg-[#7bfdfb]  text-white hover:bg-[#126b6a] transition"
                onClick={handleNext}
                disabled={stepIndex >= steps.length - 1}
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
                  min={200} // tốc độ chậm nhất (ms)
                  max={2000} // tốc độ nhanh nhất (ms)
                  step={100}
                  value={simSpeed}
                  onChange={(e) => setSimSpeed(Number(e.target.value))}
                  className="w-32"
                />
                <span>Nhanh</span>
              </div>
            </div>
          </div>

          {/*  THÔNG SỐ */}
          <div
            className=" rounded-lg shadow p-3 text-sm text-white"
            style={{
              background:
                "linear-gradient(to right, rgba(123,253,251,0.4), rgba(157,253,123,0.4))",
            }}
          >
            <div>
              <strong>Lộ trình tối ưu:</strong>{" "}
              {gbfsResult.best_solution
                ? gbfsResult.best_solution.join(" → ")
                : "—"}
            </div>
            <div>
              <strong>Tổng quãng đường:</strong> {gbfsResult.best_distance} km
            </div>
            <div>
              <strong>Bước hiện tại:</strong> {stepIndex + 1} / {steps.length}
            </div>
            <div>
              <strong>Thành phố hiện tại:</strong>{" "}
              {steps[stepIndex]?.currentCity ?? "—"}
            </div>
            <div>
              <strong>Đi đến:</strong> {steps[stepIndex]?.chosenCity ?? "—"}
            </div>
          </div>

          {/*  BẢNG BƯỚC */}
          <div
            className=" rounded-lg shadow p-3"
            style={{
              background:
                "linear-gradient(to right, rgba(123,253,251,0.4), rgba(157,253,123,0.4))",
            }}
          >
            <div className="font-bold text-white mb-2">Chi Tiết Từng Bước</div>

            <div className="max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#057937] sticky top-0 text-white">
                    <th className="p-2 border-b">Bước</th>
                    <th className="p-2 border-b">Hiện tại</th>
                    <th className="p-2 border-b">Láng giềng</th>
                    <th className="p-2 border-b">Chọn</th>
                  </tr>
                </thead>

                <tbody>
                  {steps
                    .slice(0, steps.length - 1) // loại bỏ bước cuối (bước ảo)
                    .map((s, idx) => (
                      <tr
                        key={idx}
                        className={idx === stepIndex ? "bg-[#286013]" : ""}
                      >
                        <td className="p-2 border-b text-white">{idx + 1}</td>
                        <td className="p-2 border-b font-semibold text-white">
                          {s.currentCity}
                        </td>
                        <td className="p-2 border-b text-xs text-white">
                          {Array.isArray(s.neighbors) && s.neighbors.length > 0
                            ? s.neighbors
                                .map((n) =>
                                  typeof n === "object"
                                    ? `${n.name} (${n.h})`
                                    : n
                                )
                                .join(", ")
                            : "—"}
                        </td>
                        <td className="p-2 border-b font-bold text-white">
                          {s.chosenCity ?? "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GbfsVisualization;
