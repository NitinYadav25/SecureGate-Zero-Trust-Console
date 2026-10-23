'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  ShieldCheck, 
  KeyRound, 
  WifiOff, 
  ChevronDown, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { Environment } from '@/types';

interface TopBarProps {
  onOpenMobileNav: () => void;
  selectedEnvironment: 'all' | Environment;
  onSelectEnvironment: (env: 'all' | Environment) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  openSimulator: () => void;
  activeTunnelErrorsCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileNav,
  selectedEnvironment,
  onSelectEnvironment,
  searchQuery,
  onSearchChange,
  openSimulator,
  activeTunnelErrorsCount,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs">
      {/* Left: Mobile Toggle & Environment Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Environment Selector */}
        <div className="relative">
          <button
            onClick={() => setShowEnvDropdown(!showEnvDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Scope:</span>
            <span className="font-semibold capitalize text-slate-900">{selectedEnvironment}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showEnvDropdown && (
            <div 
              className="absolute left-0 mt-1 w-44 rounded-xl bg-white border border-slate-200 shadow-lg py-1 z-50 text-xs"
              onMouseLeave={() => setShowEnvDropdown(false)}
            >
              {(['all', 'production', 'staging', 'development'] as const).map(env => (
                <button
                  key={env}
                  onClick={() => {
                    onSelectEnvironment(env);
                    setShowEnvDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors capitalize cursor-pointer"
                >
                  <span>{env === 'all' ? 'All Environments' : `${env} tier`}</span>
                  {selectedEnvironment === env && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Quick Search Filter */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search applications, routes, owners, or audit logs..."
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
          <kbd className="absolute right-2.5 top-2 px-1.5 py-0.5 text-[10px] bg-slate-100 border border-slate-200 rounded text-slate-500 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls: Notifications, Test Access & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Security Notifications"
          >
            <Bell className="w-4 h-4" />
            {activeTunnelErrorsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
            {activeTunnelErrorsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div 
              className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in duration-100"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Security Alerts</span>
                <span className="text-[10px] text-slate-400">Real-time Zero-Trust feed</span>
              </div>
              <div className="space-y-2 text-xs">
                {activeTunnelErrorsCount > 0 && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-800">
                    <WifiOff className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-[11px]">Tunnel Disconnected</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        apac-tokyo-tunnel-01 dropped. Fail-closed safeguard engaged. Public fallback blocked.
                      </p>
                    </div>
                  </div>
                )}
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-[11px]">Denied Access Spike</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      3 unauthorized requests blocked at Cloudflare Edge in last 2 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 pr-1.5 py-1 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
              ER
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-medium text-slate-900 block leading-tight">
                Elena Rostova
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">SecOps Architect</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-3 z-50 text-xs"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="pb-2 mb-2 border-b border-slate-100">
                <p className="font-medium text-slate-900">Elena Rostova</p>
                <p className="text-[11px] text-slate-500">elena.rostova@securegate.io</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> FIDO2 MFA Verified
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    openSimulator();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Access Path Sandbox</span>
                </button>
                <div className="pt-1 border-t border-slate-100 text-[11px] text-amber-700 px-2.5 py-1 font-medium">
                  Local Demo Session (Non-production)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
