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
    <div className="h-screen bg-[#0b0f1a] flex text-slate-300 selection:bg-sky-500/30 overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className="w-60 border-r border-slate-800 bg-[#0d121f] p-6 flex flex-col gap-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center">
            <Cpu className="text-slate-950" size={18} />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">DetectX</h1>
        </div>

        <nav className="flex flex-col gap-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <NavItem icon={<Activity size={18} />} label="Analytics" />
          <NavItem icon={<ShieldAlert size={18} />} label="Security" />
          <NavItem icon={<Layers size={18} />} label="Inventory" />
          <NavItem icon={<BarChart3 size={18} />} label="Reports" />
          <NavItem icon={<Settings size={18} />} label="Settings" />
        </nav>

        <div className="mt-auto">
          <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl">
            <p className="text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wider">System Status</p>
            <div className="flex items-center gap-2 text-sky-400 font-medium">
              <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
              <span className="text-xs uppercase">Operational</span>
            </div>
          </div>
        </div>
      </aside>

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
            <div className="col-span-2 minimal-card flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                  <h3 className="text-lg font-semibold text-white">Live Feed</h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">Station 01 — Optical</p>
                </div>
                <button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className={`px-6 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2 text-sm ${isScanning ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-sky-500 hover:bg-sky-400 text-slate-950 active:scale-95'}`}
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
              
              <div className="flex-1 bg-slate-950/50 rounded-xl relative overflow-hidden border border-slate-800 group">
                {isScanning ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0"
                  >
                    <div className="animate-scan-line" />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800">
                    <Activity size={48} className="mb-4 opacity-10" />
                    <p className="text-sm font-semibold opacity-30 uppercase tracking-widest">Idle State</p>
                  </div>
                )}
              </div>
            </div>

            <div className="minimal-card flex flex-col overflow-hidden bg-[#141b2d]/50">
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
                    <div className="text-slate-800 text-center py-10">
                      <Box size={32} className="mx-auto mb-3 opacity-10" />
                      <p className="text-xs font-semibold opacity-30 uppercase tracking-widest">Empty</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
              <button className="mt-6 w-full py-3 bg-slate-800/50 border border-slate-800 rounded-lg hover:bg-slate-800 transition-all font-semibold text-xs text-slate-400 uppercase tracking-wider shrink-0">
                View History
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
    <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors group ${active ? 'nav-active' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'}`}>
      <span className={active ? 'text-sky-400' : 'group-hover:scale-105 transition-transform'}>{icon}</span>
      <span className="font-semibold text-sm tracking-tight">{label}</span>
    </div>
  );
}

function StatCard({ label, value, icon, status = 'default' }) {
  return (
    <div className="minimal-card !p-5">
      <div className="flex justify-between items-start mb-3">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
        <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-800">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <h4 className="text-3xl font-bold text-white tracking-tight">{value}</h4>
        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded mb-1 uppercase ${status === 'danger' ? 'text-rose-400' : status === 'success' ? 'text-sky-400' : 'text-slate-500'}`}>
          {status === 'danger' ? 'Alert' : status === 'success' ? 'Stable' : 'Live'}
        </div>
      </div>
    </div>
  );
}

function DetectionItem({ id, type, time, clean = false }) {
  return (
    <motion.div 
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center group hover:border-slate-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${clean ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.3)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'}`} />
        <div>
          <p className="text-xs font-bold text-white tracking-tight">{id}</p>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${clean ? 'text-sky-400' : 'text-rose-400'}`}>{type}</p>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-slate-600 group-hover:text-slate-400 transition-colors">{time}</span>
    </motion.div>
  );
}
