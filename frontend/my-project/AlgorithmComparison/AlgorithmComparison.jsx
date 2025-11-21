// AlgorithmComparison.jsx - COMPLETELY NEW CHARTS
import React, { useMemo } from "react";
import { TrendingUp, Clock, Target, Repeat } from "lucide-react";

const AlgorithmComparison = ({ gbfsResult, wcoResult }) => {
  if (!gbfsResult || !wcoResult) {
    return (
      <div className="text-center p-8 text-gray-500">
        Chưa có dữ liệu để so sánh.
      </div>
    );
  }

  // Process data - SIMPLIFIED AND RELIABLE
  const chartData = useMemo(() => {
    const processAlgorithm = (data, name) => {
      const executionTime = data.execution_time || data.executionTime || 0;
      const bestDistance = data.best_distance || data.bestDistance || 0;
      const solutionQuality =
        data.solution_quality || data.solutionQuality || 0;
      const iterations = data.steps?.length || 0;

      return {
        name: name,
        executionTimeMs: Math.max(Number(executionTime) * 1000, 0.1),
        bestDistance: Math.max(Number(bestDistance), 0.1),
        solutionQuality: Math.min(Math.max(Number(solutionQuality), 0), 100),
        iterations: Math.max(iterations, 1),
        color: name === "GBFS" ? "#3b82f6" : "#10b981",
      };
    };

    const gbfs = processAlgorithm(gbfsResult, "GBFS");
    const wco = processAlgorithm(wcoResult, "WCO");

    console.log("Processed GBFS:", gbfs);
    console.log("Processed WCO:", wco);

    return { gbfs, wco };
  }, [gbfsResult, wcoResult]);

  // Simple Bar Chart Component
  const BarChart = ({ title, data, valueKey, formatValue, maxValue }) => {
    const algorithms = [chartData.gbfs, chartData.wco];

    return (
      <div className=" p-6 shadow-lg">
        <h3 className="text-gray-800 font-bold mb-6 text-center text-lg">
          {title}
        </h3>

        <div className="flex items-end justify-between gap-4 h-48 px-4">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between h-40 text-xs text-gray-500">
            <span>{formatValue(maxValue)}</span>
            <span>{formatValue(maxValue * 0.75)}</span>
            <span>{formatValue(maxValue * 0.5)}</span>
            <span>{formatValue(maxValue * 0.25)}</span>
            <span>0</span>
          </div>

          {/* Bars */}
          <div className="flex-1 flex items-end justify-center gap-8 h-40">
            {algorithms.map((algo) => {
              const value = algo[valueKey];
              const height = Math.max((value / maxValue) * 140, 8); // Minimum 8px height

              return (
                <div key={algo.name} className="flex flex-col items-center">
                  {/* Value label on top */}
                  <div
                    className="mb-2 text-sm font-bold"
                    style={{ color: algo.color }}
                  >
                    {formatValue(value)}
                  </div>

                  {/* Bar */}
                  <div
                    className="w-16 rounded-t-lg transition-all duration-1000 ease-out shadow-lg relative"
                    style={{
                      height: `${height}px`,
                      background: `linear-gradient(to top, ${algo.color}40, ${algo.color})`,
                    }}
                  >
                    {/* Bar fill */}
                    <div
                      className="w-full rounded-t-lg absolute bottom-0"
                      style={{
                        height: "100%",
                        background: `linear-gradient(to top, ${algo.color}80, ${algo.color})`,
                        border: `2px solid ${algo.color}`,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {/* Algorithm name */}
                  <div className="mt-3 text-center">
                    <div
                      className="font-bold text-lg"
                      style={{ color: algo.color }}
                    >
                      {algo.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {algo.iterations} vòng lặp
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Time comparison chart
  const TimeChart = () => {
    const algorithms = [chartData.gbfs, chartData.wco];
    const maxTime = Math.max(...algorithms.map((a) => a.executionTimeMs), 1);

    return (
      <div className=" p-6 shadow-lg">
        <h3 className="text-white font-bold mb-6 text-center text-lg">
          Thời Gian Thực Thi (ms)
        </h3>

        <div className="flex">
          {/* Chart content */}
          <div className="flex-1 flex items-end justify-between gap-4 h-48 px-4">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between h-40 text-xs text-white">
              <span>{maxTime.toFixed(1)}ms</span>
              <span>{(maxTime * 0.75).toFixed(1)}ms</span>
              <span>{(maxTime * 0.5).toFixed(1)}ms</span>
              <span>{(maxTime * 0.25).toFixed(1)}ms</span>
              <span>0ms</span>
            </div>

            {/* Bars */}
            <div
              className="flex-1 flex items-end justify-center gap-12 h-40"
              style={{ gap: "48px" }}
            >
              {algorithms.map((algo) => {
                const height = Math.max(
                  (algo.executionTimeMs / maxTime) * 140,
                  8
                );

                return (
                  <div key={algo.name} className="flex flex-col items-center">
                    <div
                      className="mb-2 text-sm font-bold"
                      style={{ color: algo.color }}
                    >
                      {algo.executionTimeMs.toFixed(2)}ms
                    </div>

                    <div
                      style={{
                        height: "140px",
                        display: "flex",
                        alignItems: "flex-end",
                      }}
                    >
                      <div
                        className="rounded-t-lg transition-all duration-1000 ease-out shadow-lg"
                        style={{
                          width: "96px",
                          height: `${height}px`,
                          background: `linear-gradient(to top, ${algo.color}80, ${algo.color})`,
                          border: `2px solid ${algo.color}`,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend - BẢNG CHÚ THÍCH MÀU SẮC */}
          <div className="w-48 border-l border-gray-200 pl-4">
            <h4 className="font-semibold text-white mb-3 text-center">
              Chú Thích
            </h4>
            <div className="space-y-3">
              {algorithms.map((algo) => (
                <div key={algo.name} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: algo.color }}
                  />
                  <div>
                    <div
                      className="font-medium text-sm text-white"
                      style={{ color: algo.color }}
                    >
                      {algo.name}
                    </div>
                    <div className="text-xs text-white">
                      {algo.iterations} vòng lặp
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Quality comparison chart
  const QualityChart = () => {
    const algorithms = [chartData.gbfs, chartData.wco];
    const maxQuality = 100;

    return (
      <div className=" rounded-xl p-6 shadow-lg mt-8">
        <h3 className="text-white font-bold mb-6 text-center text-lg">
          Chất Lượng Nghiệm (%)
        </h3>

        <div className="flex">
          {/* Chart content */}
          <div className="flex-1 flex items-end justify-between gap-4 h-48 px-4">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between h-40 text-xs text-white">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* Bars */}
            <div
              className="flex-1 flex items-end justify-center h-40"
              style={{ gap: "48px" }}
            >
              {algorithms.map((algo) => {
                const height = Math.max(
                  (algo.solutionQuality / maxQuality) * 140,
                  8
                );

                return (
                  <div
                    key={algo.name}
                    className="flex flex-col items-center mx-4"
                  >
                    <div
                      className="mb-2 text-sm font-bold"
                      style={{ color: algo.color }}
                    >
                      {algo.solutionQuality.toFixed(1)}%
                    </div>

                    <div
                      style={{
                        height: "140px",
                        display: "flex",
                        alignItems: "flex-end",
                      }}
                    >
                      <div
                        className="rounded-t-lg transition-all duration-1000 ease-out shadow-lg"
                        style={{
                          width: "96px",
                          height: `${height}px`,
                          background: `linear-gradient(to top, ${algo.color}80, ${algo.color})`,
                          border: `2px solid ${algo.color}`,
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend - BẢNG CHÚ THÍCH MÀU SẮC */}
          <div className="w-48 border-l border-gray-200 pl-4">
            <h4 className="font-semibold text-white mb-3 text-center">
              Chú Thích
            </h4>
            <div className="space-y-3">
              {algorithms.map((algo) => (
                <div key={algo.name} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: algo.color }}
                  />
                  <div>
                    <div
                      className="font-medium text-sm text-white"
                      style={{ color: algo.color }}
                    >
                      {algo.name}
                    </div>
                    <div className="text-xs text-white">
                      {algo.iterations} vòng lặp
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className=" p-6 space-y-8">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* GBFS Time */}
        <div className="flex flex-col items-center">
          {/* Label phía trên */}
          <div className="flex items-center gap-1 text-white text-xl font-bold mb-1">
            <Clock size={10} />
            <span className="text-[10px]">Thời gian GBFS</span>
          </div>

          {/* Vòng tròn */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox="0 0 140 140"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="gradientGBFS"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#a3e635" />
                  <stop offset="50%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
              <circle
                cx="70"
                cy="70"
                r="35"
                stroke="url(#gradientGBFS)"
                strokeWidth="6"
                fill="none"
              />
            </svg>

            {/* Giá trị giữa vòng tròn */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-[12px] font-bold text-white">
                {chartData.gbfs.executionTimeMs.toFixed(2)} ms
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {/* Label phía trên */}
          <div className="flex items-center gap-1 text-white text-xl font-bold mb-1">
            <Clock size={10} />
            <span className="text-[10px]">Thời gian WCO</span>
          </div>

          {/* Vòng tròn */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox="0 0 140 140"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="gradientWCO"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#7bfdfb" />
                  <stop offset="50%" stopColor="#7bfdfb80" />
                  <stop offset="100%" stopColor="#7bfdfb" />
                </linearGradient>
              </defs>
              <circle
                cx="70"
                cy="70"
                r="35"
                stroke="url(#gradientWCO)"
                strokeWidth="6"
                fill="none"
              />
            </svg>

            {/* Giá trị giữa vòng tròn */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-[10px] font-bold text-white">
                {chartData.wco.executionTimeMs.toFixed(2)} ms
              </span>
            </div>
          </div>
        </div>

        {/* GBFS Distance */}
        <div className="flex flex-col items-center">
          {/* Label phía trên */}
          <div className="flex items-center gap-1 text-white text-xl font-bold mb-1">
            <Target size={10} />
            <span className="text-[10px]">Khoảng cách GBFS</span>
          </div>

          {/* Vòng tròn GBFS */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox="0 0 140 140"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="gradientGBFS"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#a3e635" />
                  <stop offset="50%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
              <circle
                cx="70"
                cy="70"
                r="35"
                stroke="url(#gradientGBFS)"
                strokeWidth="6"
                fill="none"
              />
            </svg>

            {/* Giá trị giữa vòng tròn */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-[10px] font-bold text-white">
                {chartData.gbfs.bestDistance.toFixed(2)} km
              </span>
            </div>
          </div>
        </div>

        {/* WCO Distance */}
        <div className="flex flex-col items-center">
          {/* Label phía trên */}
          <div className="flex items-center gap-1 text-white text-xl font-bold mb-1">
            <Target size={10} />
            <span className="text-[10px]">Khoảng cách WCO</span>
          </div>

          {/* Vòng tròn WCO */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox="0 0 140 140"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="gradientWCO"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#7bfdfb" />
                  <stop offset="50%" stopColor="#7bfdfb80" />
                  <stop offset="100%" stopColor="#7bfdfb" />
                </linearGradient>
              </defs>
              <circle
                cx="70"
                cy="70"
                r="35"
                stroke="url(#gradientWCO)"
                strokeWidth="6"
                fill="none"
              />
            </svg>

            {/* Giá trị giữa vòng tròn */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-[10px] font-bold text-white">
                {chartData.wco.bestDistance.toFixed(2)} km
              </span>
            </div>
          </div>
        </div>

        {/* GBFS Quality */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-white text-xl font-bold mb-1">
            <TrendingUp size={10} />
            <span className="text-[10px]">Chất lượng GBFS</span>
          </div>
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox="0 0 140 140"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="gradientGBFS"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#a3e635" />
                  <stop offset="50%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
              <circle
                cx="70"
                cy="70"
                r="35"
                stroke="url(#gradientGBFS)"
                strokeWidth="6"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-[10px] font-bold text-white">
                {chartData.gbfs.solutionQuality.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* WCO Quality */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-white text-xl font-bold mb-1">
            <TrendingUp size={10} />
            <span className="text-[10px]">Chất lượng WCO</span>
          </div>
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox="0 0 140 140"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="gradientWCO"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#7bfdfb" />
                  <stop offset="50%" stopColor="#7bfdfb80" />
                  <stop offset="100%" stopColor="#7bfdfb" />
                </linearGradient>
              </defs>
              <circle
                cx="70"
                cy="70"
                r="35"
                stroke="url(#gradientWCO)"
                strokeWidth="6"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-[10px] font-bold text-white">
                {chartData.wco.solutionQuality.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* GBFS Iterations */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-white text-xl font-bold mb-1">
            <Repeat size={10} />
            <span className="text-[10px]">Vòng lặp GBFS</span>
          </div>
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox="0 0 140 140"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="gradientGBFS"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#a3e635" />
                  <stop offset="50%" stopColor="#6ee7b7" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
              </defs>
              <circle
                cx="70"
                cy="70"
                r="35"
                stroke="url(#gradientGBFS)"
                strokeWidth="6"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-[10px] font-bold text-white">
                {chartData.gbfs.iterations}
              </span>
            </div>
          </div>
        </div>

        {/* WCO Iterations */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-white text-xl font-bold mb-1">
            <Repeat size={10} />
            <span className="text-[10px]">Vòng lặp WCO</span>
          </div>
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox="0 0 140 140"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="gradientWCO"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#7bfdfb" />
                  <stop offset="50%" stopColor="#7bfdfb80" />
                  <stop offset="100%" stopColor="#7bfdfb" />
                </linearGradient>
              </defs>
              <circle
                cx="70"
                cy="70"
                r="35"
                stroke="url(#gradientWCO)"
                strokeWidth="6"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-[10px] font-bold text-white">
                {chartData.wco.iterations}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimeChart />
        <QualityChart />
      </div>
    </div>
  );
};

export default AlgorithmComparison;
