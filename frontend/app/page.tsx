'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Activity, ShieldAlert, Cpu, Box, LayoutDashboard, Settings, Bell, Search, RefreshCw, Zap, Layers, BarChart3, Camera, CameraOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraState, setCameraState] = useState('IDLE'); // IDLE, LOADING, ACTIVE, MOCK, ERROR
  const [stats, setStats] = useState({
    total_inspected: "0",
    defects_found: "0",
    inference_time: "0ms",
    yield_rate: "100%"
  });
  const [history, setHistory] = useState([]);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        fetch('http://localhost:8000/stats'),
        fetch('http://localhost:8000/history?limit=5')
      ]);
      const statsData = await statsRes.json();
      const historyData = await historyRes.json();
      
      setStats({
        total_inspected: statsData.total_inspected.toString(),
        defects_found: statsData.defects_found.toString(),
        inference_time: `${statsData.avg_inference_time.toFixed(1)}ms`,
        yield_rate: `${statsData.yield_rate.toFixed(1)}%`
      });
      setHistory(historyData);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraState('LOADING');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraState('ACTIVE');
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable, using Mock Feed.", err);
      setCameraState('MOCK');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraState('IDLE');
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      let blob;
      
      if (cameraState === 'ACTIVE' && videoRef.current && canvasRef.current) {
        // Capture frame from video
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      } else {
        // Mock Scan using the stored image
        const response = await fetch('/mock_pcb.png');
        blob = await response.blob();
      }

      const formData = new FormData();
      formData.append('file', blob, 'pcb_scan.jpg');

      const response = await fetch('http://localhost:8000/detect', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="h-screen bg-[#0b0f1a] flex text-slate-300 selection:bg-sky-500/30 overflow-hidden text-sm font-['Inter']">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="px-10 py-6 flex justify-between items-center shrink-0 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white tracking-tight">Factory Dashboard</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-sky-500/50 w-64 transition-all text-sm"
              />
            </div>
            <button className="p-2 bg-slate-900 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors">
              <Bell size={20} className="text-slate-400" />
            </button>
          </div>
        </header>

        <div className="flex-1 px-10 pb-8 mt-8 flex flex-col gap-6 overflow-hidden">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 shrink-0">
            <StatCard label="Total Scanned" value={stats.total_inspected} icon={<Layers className="text-sky-400" size={20} />} />
            <StatCard label="Defects" value={stats.defects_found} icon={<ShieldAlert className="text-rose-400" size={20} />} status="danger" />
            <StatCard label="Processing" value={stats.inference_time} icon={<Zap className="text-sky-400" size={20} />} />
            <StatCard label="Efficiency" value={stats.yield_rate} icon={<Activity className="text-sky-400" size={20} />} status="success" />
          </div>

          {/* Main Grid */}
          <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden min-h-0">
            <div className="col-span-2 minimal-card flex flex-col overflow-hidden relative">
              <div className="flex justify-between items-center mb-6 shrink-0 z-10">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    Live Feed
                    {cameraState === 'ACTIVE' && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">
                    {cameraState === 'MOCK' ? 'Simulation Mode — Mock Feed' : 'Station 01 — Optical Ingest'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={cameraState === 'IDLE' ? startCamera : stopCamera}
                    className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-xs border ${cameraState === 'ACTIVE' || cameraState === 'MOCK' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-sky-500/50 hover:text-sky-400'}`}
                  >
                    {cameraState === 'ACTIVE' || cameraState === 'MOCK' ? (
                      <>
                        <CameraOff size={14} />
                        Stop Feed
                      </>
                    ) : (
                      <>
                        <Camera size={14} />
                        Start Feed
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleScan}
                    disabled={isScanning || cameraState === 'IDLE'}
                    className={`px-6 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 text-sm ${(isScanning || cameraState === 'IDLE') ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20 active:scale-95'}`}
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap size={16} fill="currentColor" />
                        Scan Now
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-slate-950/50 rounded-xl relative overflow-hidden border border-slate-800 group flex items-center justify-center">
                {/* Hidden Canvas for Capturing */}
                <canvas ref={canvasRef} className="hidden" />

                {cameraState === 'IDLE' && (
                  <div className="flex flex-col items-center justify-center text-slate-800 transition-all group-hover:text-slate-700">
                    <Activity size={48} className="mb-4 opacity-10" />
                    <p className="text-sm font-semibold opacity-30 uppercase tracking-widest">Feed Standby</p>
                  </div>
                )}

                {cameraState === 'LOADING' && (
                  <div className="flex flex-col items-center">
                    <RefreshCw className="animate-spin text-sky-500 mb-4" size={32} />
                    <p className="text-xs font-bold text-sky-500 uppercase tracking-widest">Initializing Hardware...</p>
                  </div>
                )}

                {(cameraState === 'ACTIVE' || cameraState === 'MOCK') && (
                  <div className="absolute inset-0 w-full h-full">
                    {cameraState === 'ACTIVE' ? (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <img 
                        src="/mock_pcb.png" 
                        alt="Mock PCB Feed" 
                        className="w-full h-full object-cover opacity-60"
                      />
                    )}
                    
                    {/* UI Overlay */}
                    <div className="absolute inset-0 border-[20px] border-slate-950/20 pointer-events-none" />
                    
                    <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none">
                      <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live Stream</span>
                      </div>
                      <div className="bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">4K AOI Ingest</span>
                      </div>
                    </div>

                    {isScanning && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-20"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.5)] animate-scan-line" />
                        <div className="absolute inset-0 bg-sky-500/5 backdrop-blur-[1px]" />
                      </motion.div>
                    )}
                  </div>
                )}

                {cameraState === 'MOCK' && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/20 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 z-30">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Hardware not found — Simulation Active</span>
                  </div>
                )}
              </div>
            </div>

            <div className="minimal-card flex flex-col overflow-hidden bg-[#141b2d]/50 border-slate-800/50">
              <h3 className="text-lg font-semibold text-white mb-6 shrink-0">Recent Logs</h3>
              <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar flex flex-col gap-3 min-h-0">
                <AnimatePresence mode="popLayout">
                  {history.length > 0 ? history.map((item) => (
                    <DetectionItem 
                      key={item.id} 
                      id={item.board_id} 
                      type={item.status} 
                      time={new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                      clean={item.status === 'CLEAN'} 
                    />
                  )) : (
                    <div className="text-slate-800 text-center py-10 h-full flex flex-col items-center justify-center">
                      <Box size={32} className="mx-auto mb-3 opacity-10" />
                      <p className="text-xs font-semibold opacity-30 uppercase tracking-widest">No Records Found</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
              <button className="mt-6 w-full py-3 bg-slate-800/30 border border-slate-800 rounded-lg hover:bg-slate-800 transition-all font-bold text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest shrink-0">
                Full Protocol Logs
              </button>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes scan-line {
          0% { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
        .animate-scan-line {
          animation: scan-line 3s linear infinite;
        }
        .nav-active {
          background: rgba(56, 189, 248, 0.08);
          color: #38bdf8;
          border-left: 2px solid #38bdf8;
          border-radius: 0 8px 8px 0;
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon, status = 'default' }) {
  return (
    <div className="minimal-card !p-5 border-slate-800/50">
      <div className="flex justify-between items-start mb-3">
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{label}</p>
        <div className="p-2 bg-slate-800/30 rounded-lg border border-slate-800/50">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <h4 className="text-3xl font-bold text-white tracking-tight leading-none">{value}</h4>
        <div className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${status === 'danger' ? 'bg-rose-500/10 text-rose-500' : status === 'success' ? 'bg-sky-500/10 text-sky-500' : 'bg-slate-800/50 text-slate-500'}`}>
          {status === 'danger' ? 'Alert' : status === 'success' ? 'Stable' : 'Live'}
        </div>
      </div>
    </div>
  );
}

function DetectionItem({ id, type, time, clean = false }) {
  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex justify-between items-center group hover:border-slate-700/50 transition-all hover:bg-slate-900/60"
    >
      <div className="flex items-center gap-3">
        <div className={`w-1.5 h-1.5 rounded-full ${clean ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'}`} />
        <div>
          <p className="text-[10px] font-bold text-white tracking-tight truncate w-32">{id}</p>
          <p className={`text-[9px] font-black uppercase tracking-widest ${clean ? 'text-sky-400' : 'text-rose-400'}`}>{type}</p>
        </div>
      </div>
      <span className="text-[9px] font-bold text-slate-600 group-hover:text-slate-400 transition-colors uppercase tracking-widest">{time}</span>
    </motion.div>
  );
}

