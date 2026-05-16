'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu, Box, LayoutDashboard, Settings, Bell, Search, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [stats, setStats] = useState({
    total_inspected: "0",
    defects_found: "0",
    inference_time: "0ms",
    yield_rate: "100%"
  });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      // Simulate a file upload for the scan
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
    <div className="min-h-screen flex text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center pulse-primary">
            <Cpu className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">DetectX<span className="text-blue-500">PCB</span></h1>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Activity size={20} />} label="Live Feed" />
          <NavItem icon={<ShieldAlert size={20} />} label="Alerts" />
          <NavItem icon={<Box size={20} />} label="Inventory" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold">Factory Protocol <span className="gradient-text">Active</span></h2>
            <p className="text-slate-400 mt-1">Monitoring Line 4 - High Precision AOI Ingest</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search PCB ID..." 
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
            <button className="p-2 bg-white/5 rounded-full border border-white/10">
              <Bell size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500" />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <StatCard label="Total Inspected" value={stats.total_inspected} delta="+12%" />
          <StatCard label="Defects Found" value={stats.defects_found} delta="-3%" status="danger" />
          <StatCard label="Inference Time" value={stats.inference_time} delta="Optimal" />
          <StatCard label="Yield Rate" value={stats.yield_rate} delta="+0.4%" status="success" />
        </div>

        {/* Live Monitoring Section */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 glass-card min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Live Inspection Stream</h3>
              <div className="flex gap-2">
                <button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isScanning ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      Analyzing...
                    </>
                  ) : 'Start New Scan'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-black/40 rounded-xl relative overflow-hidden border border-white/5 flex items-center justify-center">
              {isScanning ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_15px_#3b82f6] animate-scan" />
                  <div className="p-8">
                    <div className="w-full h-full border-2 border-dashed border-blue-500/30 rounded-lg" />
                  </div>
                </motion.div>
              ) : (
                <div className="text-slate-500 text-center">
                  <Activity size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Stream Standby - Waiting for Trigger</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card flex flex-col">
            <h3 className="text-xl font-semibold mb-6">Recent Detections</h3>
            <div className="flex flex-col gap-4">
              {history.length > 0 ? history.map((item) => (
                <DetectionItem 
                  key={item.id} 
                  id={item.board_id} 
                  type={item.status} 
                  time={new Date(item.created_at).toLocaleTimeString()} 
                  clean={item.status === 'CLEAN'} 
                />
              )) : (
                <p className="text-slate-500 text-sm text-center py-4 italic">No detections yet</p>
              )}
            </div>
            <button className="mt-auto w-full py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              View Detailed Logs
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes scan {
          from { top: 0%; }
          to { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'hover:bg-white/5 text-slate-400'}`}>
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function StatCard({ label, value, delta, status = 'default' }) {
  return (
    <div className="glass-card">
      <p className="text-slate-400 text-sm">{label}</p>
      <div className="flex items-end gap-3 mt-2">
        <h4 className="text-3xl font-bold">{value}</h4>
        <span className={`text-xs font-semibold mb-1 ${status === 'danger' ? 'text-red-500' : status === 'success' ? 'text-emerald-500' : 'text-blue-500'}`}>
          {delta}
        </span>
      </div>
    </div>
  );
}

function DetectionItem({ id, type, time, clean = false }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
      <div>
        <p className="text-sm font-bold">{id}</p>
        <p className={`text-xs ${clean ? 'text-emerald-500' : 'text-red-500'}`}>{type}</p>
      </div>
      <span className="text-[10px] text-slate-500">{time}</span>
    </div>
  );
}
