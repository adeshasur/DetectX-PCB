'use client';

import { LayoutDashboard, Activity, Cpu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 border-r border-slate-800 bg-[#0d121f] p-6 flex flex-col gap-8 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center">
          <Cpu className="text-slate-950" size={18} />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-white">DetectX</h1>
      </div>

      <nav className="flex flex-col gap-1">
        <NavItem 
          href="/" 
          icon={<LayoutDashboard size={18} />} 
          label="Dashboard" 
          active={pathname === '/'} 
        />
        <NavItem 
          href="/analytics" 
          icon={<Activity size={18} />} 
          label="Analytics" 
          active={pathname === '/analytics'} 
        />
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
  );
}

function NavItem({ href, icon, label, active = false }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors group ${active ? 'nav-active' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'}`}
    >
      <span className={active ? 'text-sky-400' : 'group-hover:scale-105 transition-transform'}>{icon}</span>
      <span className="font-semibold text-sm tracking-tight">{label}</span>
    </Link>
  );
}
