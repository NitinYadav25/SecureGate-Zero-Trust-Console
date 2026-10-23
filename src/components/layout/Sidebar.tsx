'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  KeyRound, 
  Network, 
  ClipboardList, 
  Users, 
  Settings, 
  Sparkles,
  Lock,
  ChevronRight,
  Radio,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab = 
  | 'overview' 
  | 'applications' 
  | 'policies' 
  | 'tunnels' 
  | 'audit' 
  | 'users' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  openSimulator: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  counts: {
    applications: number;
    policies: number;
    tunnels: number;
    auditLogs: number;
    users: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openSimulator,
  mobileOpen,
  onCloseMobile,
  counts,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Security Overview',
      icon: ShieldCheck,
      badge: null,
    },
    {
      id: 'applications' as NavTab,
      label: 'Protected Applications',
      icon: Layers,
      badge: counts.applications,
    },
    {
      id: 'policies' as NavTab,
      label: 'Access Policies',
      icon: KeyRound,
      badge: counts.policies,
    },
    {
      id: 'tunnels' as NavTab,
      label: 'Cloudflare Tunnels',
      icon: Network,
      badge: counts.tunnels,
    },
    {
      id: 'audit' as NavTab,
      label: 'Activity & Audit Log',
      icon: ClipboardList,
      badge: counts.auditLogs,
    },
    {
      id: 'users' as NavTab,
      label: 'Users & Groups',
      icon: Users,
      badge: counts.users,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings & Integrations',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-200 ease-in-out shadow-sm',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-slate-900 tracking-tight">SecureGate</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                  MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Zero-Trust Console</p>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Posture Status Widget */}
        <div className="p-3.5 mx-3.5 my-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
                Fail-Closed Active
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Zero-Trust</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            Outbound tunnel routing active. Public origin fallback disabled.
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
            Core Management
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group cursor-pointer',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-[10px] rounded-full font-mono',
                      isActive
                        ? 'bg-indigo-100 text-indigo-800 font-medium'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Simulator CTA */}
        <div className="p-3.5 border-t border-slate-100 bg-white">
          <button
            onClick={() => {
              openSimulator();
              onCloseMobile();
            }}
            className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Simulate Access Path</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-600" />
              <span>Simulated Cloudflare</span>
            </span>
            <span className="text-amber-700 font-medium">Demo Mode</span>
          </div>
        </div>
      </aside>
    </>
  );
};
