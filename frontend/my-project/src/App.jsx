// App.jsx
import React, { useState } from 'react';
import './index.css';
import VietnamMapWithProvinces from './components/VietnamMapWithProvinces';
import GbfsVisualization from './GBFS/GBFSVisualization';
import WcoVisualization from './WCO/WCOVisualization';
import AlgorithmComparison from '../AlgorithmComparison/AlgorithmComparison';

function App() {
  const [gbfsResult, setGbfsResult] = useState(null);
  const [wcoResult, setWcoResult] = useState(null);

  const handleGbfsResult = (result) => {
    console.log("App received GBFS result:", result);
    setGbfsResult(result);
  };

  const handleWcoResult = (result) => {
    console.log("App received WCO result:", result);
    setWcoResult(result);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      
      {/* Bản đồ */}
      <div className="flex-shrink-0">
        <VietnamMapWithProvinces 
          onGbfsResult={handleGbfsResult}
          onWcoResult={handleWcoResult}
        />
      </div>

      {/* PHẦN DƯỚI - HIỆN CẢ 2 KẾT QUẢ */}
      <div className="flex-1 p-5 w-full">
  <div className="max-w-[1400px] mx-auto space-y-8">
    {/* GBFS Visualization */}
    <div>
      <h2 className="text-4xl font-extrabold text-center mb-8 text-white">
        KẾT QUẢ ĐƯỜNG ĐI TỐI ƯU BẰNG THUẬT TOÁN GBFS
      </h2>
      <div className=" rounded-3xl shadow-2xl p-8 ">
        <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner">
          <GbfsVisualization gbfsResult={gbfsResult} width={800} height={384} />
        </div>
      </div>
    </div>

    {/* WCO Visualization */}
    <div>
      <h2 className="text-4xl font-extrabold text-center mb-8 text-white">
      KẾT QUẢ ĐƯỜNG ĐI TỐI ƯU BẰNG THUẬT TOÁN WCO
      </h2>
      <div className="-3xl shadow-2xl p-8 ">
        <div className="h-full w-full overflow-hidden shadow-inner">
          <WcoVisualization wcoResult={wcoResult} width={800} height={384} />
        </div>
      </div>
    </div>

    {/* So sánh hiệu suất */}
    <div>
      <h2 className="text-4xl font-extrabold text-center mb-8 text-white">
        SO SÁNH HIỆU SUẤT GBFS & WCO
      </h2>
      <div className=" shadow-2xl p-8 ">
        <AlgorithmComparison gbfsResult={gbfsResult} wcoResult={wcoResult} width="100%" />
      </div>
    </div>
  </div>
</div>
    </div>
  );
}

export default App;
