'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Search, Bell, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

export default function Analytics() {
  const [stats, setStats] = useState({
    total_inspected: 0,
    defects_found: 0,
    yield_rate: 0,
    avg_inference_time: 0
  });

  const [chartData, setChartData] = useState([
    { name: '08:00', yield: 98, defects: 2 },
    { name: '10:00', yield: 95, defects: 5 },
    { name: '12:00', yield: 99, defects: 1 },
    { name: '14:00', yield: 94, defects: 6 },
    { name: '16:00', yield: 97, defects: 3 },
    { name: '18:00', yield: 98, defects: 2 },
  ]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('http://localhost:8000/stats');
        const data = await res.json();
        setStats(data);
      } catch (e) { console.error(e); }
    };
    fetchAnalytics();
  }, []);

  const pieData = [
    { name: 'Clean', value: Number(stats.total_inspected || 0) - Number(stats.defects_found || 0) },
    { name: 'Defective', value: Number(stats.defects_found || 0) },
  ];

  const COLORS = ['#38bdf8', '#f43f5e'];

  return (
    <div className="h-screen bg-[#0b0f1a] flex text-slate-300 selection:bg-sky-500/30 overflow-hidden text-sm">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="px-10 py-6 flex justify-between items-center shrink-0 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white tracking-tight">Performance Analytics</h2>
          
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

        <div className="flex-1 px-10 pb-8 mt-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-6 shrink-0">
            <MetricCard 
              label="Yield Stability" 
              value={`${Number(stats.yield_rate || 0).toFixed(1)}%`} 
              trend="+2.4%" 
              up={true}
              icon={<Target className="text-sky-400" size={20} />} 
            />
            <MetricCard 
              label="Defect Rate" 
              value={`${((Number(stats.defects_found || 0) / (Number(stats.total_inspected || 1))) * 100).toFixed(1)}%`} 
              trend="-0.8%" 
              up={true}
              icon={<TrendingDown className="text-rose-400" size={20} />} 
            />
            <MetricCard 
              label="AI Optimization" 
              value={`${Number(stats.avg_inference_time || 0).toFixed(1)}ms`} 
              trend="-12ms" 
              up={true}
              icon={<Zap className="text-sky-400" size={20} />} 
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-3 gap-6 h-[400px]">
            <div className="col-span-2 minimal-card flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-6">Yield Trends</h3>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Area type="monotone" dataKey="yield" stroke="#38bdf8" fillOpacity={1} fill="url(#colorYield)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="minimal-card flex flex-col items-center">
              <h3 className="text-lg font-semibold text-white mb-6 w-full text-left">Defect Ratio</h3>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <p className="text-2xl font-bold text-white">{Number(stats.yield_rate || 0).toFixed(0)}%</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Yield</p>
                </div>
              </div>
              <div className="w-full flex justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sky-400" />
                  <span className="text-xs text-slate-400">Clean</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-xs text-slate-400">Defective</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ label, value, trend, up, icon }) {
  return (
    <div className="minimal-card">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-800">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
          {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
        <h4 className="text-3xl font-bold text-white tracking-tight">{value}</h4>
      </div>
    </div>
  );
}
