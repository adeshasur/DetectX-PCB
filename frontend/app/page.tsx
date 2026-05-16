'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu, Box, LayoutDashboard, Settings, Bell, Search, RefreshCw, Zap, Layers, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [stats, setStats] = useState({
    total_inspected: "0",
    defects_found: "0",
    inference_time: "0ms",
    yield_rate: "100%"
  });
  const [history, setHistory] = useState([]);

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
        inference_time: statsData.avg_inference_time,
        yield_rate: statsData.yield_rate
      });
      setHistory(historyData);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const formData = new FormData();
      const blob = new Blob(["dummy content"], { type: 'image/jpeg' });
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
    <div className="h-screen bg-[#030712] flex text-gray-100 selection:bg-blue-500/30 overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className="w-60 border-r border-white/5 bg-gray-950/50 backdrop-blur-2xl p-5 flex flex-col gap-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 pulse-glow">
            <Cpu className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter leading-none">DetectX<span className="text-blue-500">PCB</span></h1>
            <p className="text-[7px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Protocol v4.2.0</p>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          <NavItem icon={<LayoutDashboard size={16} />} label="Dashboard" active />
          <NavItem icon={<Activity size={16} />} label="Live Analytics" />
          <NavItem icon={<ShieldAlert size={16} />} label="Security Vault" />
          <NavItem icon={<Layers size={16} />} label="Line Control" />
          <NavItem icon={<BarChart3 size={16} />} label="Yield Reports" />
          <NavItem icon={<Settings size={16} />} label="System Config" />
        </nav>

        <div className="mt-auto">
          <div className="glass-card bg-blue-600/5 border-blue-500/10 !p-3 rounded-xl">
            <p className="text-[9px] text-gray-400 mb-0.5 font-medium">System Health</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Optimal</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-transparent via-transparent to-blue-500/5">
        <header className="px-8 py-4 flex justify-between items-end shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-[9px] font-bold text-blue-500 tracking-widest uppercase">Ops Terminal</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight">Factory <span className="gradient-text">Intelligence</span></h2>
            <p className="text-gray-400 text-xs font-medium">Line 04 — AOI Ingest Pipeline</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-gray-900/50 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:border-blue-500/50 w-48 transition-all text-xs placeholder:text-gray-600 font-medium"
              />
            </div>
            <button className="p-2.5 bg-gray-900/50 rounded-xl border border-white/5 hover:bg-gray-800 transition-colors relative">
              <Bell size={18} className="text-gray-400" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-gray-950" />
            </button>
          </div>
        </header>

        <div className="flex-1 px-8 pb-6 flex flex-col gap-4 overflow-hidden">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 shrink-0">
            <StatCard label="Total Inspected" value={stats.total_inspected} icon={<Layers className="text-blue-400" size={16} />} />
            <StatCard label="Defects Found" value={stats.defects_found} icon={<ShieldAlert className="text-red-400" size={16} />} status="danger" />
            <StatCard label="Inference Time" value={stats.inference_time} icon={<Zap className="text-yellow-400" size={16} />} />
            <StatCard label="Factory Yield" value={stats.yield_rate} icon={<Activity className="text-emerald-400" size={16} />} status="success" />
          </div>

          {/* Main Grid */}
          <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden min-h-0">
            <div className="col-span-2 glass-card border-white/5 !p-5 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <div>
                  <h3 className="text-lg font-bold">Live Inspection Feed</h3>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">Camera 01 — Optical Scanner</p>
                </div>
                <button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className={`px-5 py-2.5 rounded-xl font-black tracking-tight transition-all flex items-center gap-2 text-xs ${isScanning ? 'bg-blue-600/20 text-blue-400 cursor-not-allowed border border-blue-500/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20 active:scale-95'}`}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} />
                      ANALYZING...
                    </>
                  ) : (
                    <>
                      <Zap size={14} fill="currentColor" />
                      INITIATE SCAN
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex-1 bg-gray-950 rounded-2xl relative overflow-hidden border border-white/5 shadow-inner group">
                {isScanning ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_#3b82f6] z-10 animate-scan-line" />
                    <div className="absolute inset-0 bg-blue-500/5 grid grid-cols-6 grid-rows-6 opacity-20">
                      {Array.from({length: 36}).map((_, i) => (
                        <div key={i} className="border border-white/10" />
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 to-gray-950">
                    <Activity size={48} className="mb-3 opacity-10" />
                    <p className="text-base font-black tracking-tight opacity-30 uppercase">Pipeline Standby</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card flex flex-col bg-gray-950/40 !p-5 overflow-hidden">
              <h3 className="text-lg font-bold mb-4 shrink-0 uppercase tracking-tight">Audit Logs</h3>
              <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar flex flex-col gap-2 min-h-0">
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
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-600 text-center py-6"
                    >
                      <Box size={24} className="mx-auto mb-2 opacity-10" />
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-30">No logs found</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button className="mt-4 w-full py-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all font-bold text-[9px] text-gray-500 uppercase tracking-widest shrink-0">
                All Logs
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 group ${active ? 'nav-active' : 'hover:bg-white/5 text-gray-500 hover:text-gray-200'}`}>
      <span className={active ? 'text-blue-400' : 'group-hover:scale-110 transition-transform'}>{icon}</span>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </div>
  );
}

function StatCard({ label, value, icon, status = 'default' }) {
  return (
    <div className="glass-card !p-4">
      <div className="flex justify-between items-start mb-2">
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
        <div className="p-1.5 bg-gray-950/50 rounded-lg border border-white/5">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <h4 className="text-3xl font-black tracking-tighter leading-none">{value}</h4>
        <div className={`text-[8px] font-black px-1.5 py-0.5 rounded mb-1 ${status === 'danger' ? 'bg-red-500/10 text-red-400' : status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
          {status === 'danger' ? 'WARN' : status === 'success' ? 'GOOD' : 'LIVE'}
        </div>
      </div>
    </div>
  );
}

function DetectionItem({ id, type, time, clean = false }) {
  return (
    <motion.div 
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="p-4 rounded-2xl bg-gray-900/50 border border-white/5 flex justify-between items-center group hover:border-white/10 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${clean ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
        <div>
          <p className="text-xs font-black tracking-tight">{id}</p>
          <p className={`text-[9px] font-black uppercase tracking-widest ${clean ? 'text-emerald-500' : 'text-red-500'}`}>{type}</p>
        </div>
      </div>
      <span className="text-[9px] font-bold text-gray-600 group-hover:text-gray-200 transition-colors">{time}</span>
    </motion.div>
  );
}
