'use client';

import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  KeyRound, 
  ShieldAlert, 
  ArrowUpRight, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Application, AccessPolicy, Tunnel, AuditLog, User } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DemoNoticeBanner } from '@/components/common/DemoNoticeBanner';
import { NavTab } from '@/components/layout/Sidebar';
import { formatTime } from '@/lib/utils';

interface SecurityOverviewProps {
  applications: Application[];
  policies: AccessPolicy[];
  tunnels: Tunnel[];
  auditLogs: AuditLog[];
  users: User[];
  onNavigate: (tab: NavTab) => void;
  onOpenSimulator: (appId?: string) => void;
  onNewApp: () => void;
}

export const SecurityOverview: React.FC<SecurityOverviewProps> = ({
  applications,
  policies,
  tunnels,
  auditLogs,
  users,
  onNavigate,
  onOpenSimulator,
  onNewApp,
}) => {
  // Compute Key Security Posture Metrics
  const totalApps = applications.length;
  const protectedApps = applications.filter(a => a.protectionStatus === 'Protected').length;
  const prodApps = applications.filter(a => a.environment === 'production').length;

  const connectedTunnels = tunnels.filter(t => t.status === 'connected').length;
  const unhealthyTunnels = tunnels.filter(t => t.status !== 'connected').length;

  const mfaEnforcedApps = applications.filter(a => a.mfaRequired).length;
  const mfaPercentage = totalApps > 0 ? Math.round((mfaEnforcedApps / totalApps) * 100) : 0;

  const deniedAttempts = auditLogs.filter(
    l => l.outcome === 'denied' || l.eventType.includes('DENIED')
  );

  const policyChanges = auditLogs.filter(
    l => l.eventType === 'POLICY_CREATED' || l.eventType === 'POLICY_UPDATED' || l.eventType === 'POLICY_DELETED'
  );

  const recentActivity = auditLogs.slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Demo Architecture Notice Banner */}
      <DemoNoticeBanner onOpenSimulator={() => onOpenSimulator()} />

      {/* KPI Security Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Protected Applications */}
        <div 
          onClick={() => onNavigate('applications')}
          className="bg-white border border-slate-200/90 hover:border-slate-300 p-4 rounded-xl shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Protected Applications</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{protectedApps}</span>
            <span className="text-xs text-slate-500">of {totalApps} total</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>{prodApps} in Production</span>
            <span className="text-indigo-600 font-medium group-hover:underline flex items-center gap-0.5">
              Manage <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Cloudflare Tunnels */}
        <div 
          onClick={() => onNavigate('tunnels')}
          className="bg-white border border-slate-200/90 hover:border-slate-300 p-4 rounded-xl shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Cloudflare Tunnels</span>
            <div className={`p-2 rounded-lg transition-transform group-hover:scale-105 ${
              unhealthyTunnels > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {unhealthyTunnels > 0 ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{connectedTunnels}</span>
            <span className="text-xs text-emerald-700 font-semibold">active</span>
            {unhealthyTunnels > 0 && (
              <span className="text-xs text-rose-700 font-semibold">({unhealthyTunnels} offline)</span>
            )}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span className="text-emerald-700 font-medium">Fail-Closed Active</span>
            <span className="text-indigo-600 font-medium group-hover:underline flex items-center gap-0.5">
              Inspect <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: MFA Enforcement Rate */}
        <div 
          onClick={() => onNavigate('policies')}
          className="bg-white border border-slate-200/90 hover:border-slate-300 p-4 rounded-xl shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">MFA Policy Enforcement</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{mfaPercentage}%</span>
            <span className="text-xs text-indigo-700 font-semibold">FIDO2 / TOTP</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>{mfaEnforcedApps} of {totalApps} apps • {policies.length} policies</span>
            <span className="text-indigo-600 font-medium group-hover:underline flex items-center gap-0.5">
              Policies <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Denied Access Attempts */}
        <div 
          onClick={() => onNavigate('audit')}
          className="bg-white border border-slate-200/90 hover:border-slate-300 p-4 rounded-xl shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Blocked Access Attempts</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{deniedAttempts.length}</span>
            <span className="text-xs text-rose-700 font-semibold">denied at Edge</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>{policyChanges.length} policy changes • {users.length} users</span>
            <span className="text-indigo-600 font-medium group-hover:underline flex items-center gap-0.5">
              Audit Feed <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Quick Security Posture & Sandbox Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Zero-Trust Verification Sandbox
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Safely test how Cloudflare Access, MFA tokens, and tunnel routes evaluate a specific user request in real time.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenSimulator()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Access Evaluator</span>
          </button>
          <button
            onClick={onNewApp}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-medium transition-colors border border-slate-200 cursor-pointer"
          >
            Register Application
          </button>
        </div>
      </div>

      {/* Main Grid: Application Posture & Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: High-Priority Application Health (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Protected Internal Services</h2>
              <p className="text-xs text-slate-500">Administrative endpoints routed via Cloudflare Zero Trust</p>
            </div>
            <button
              onClick={() => onNavigate('applications')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View all ({applications.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Environment</th>
                  <th className="py-2.5 px-3">Protection Status</th>
                  <th className="py-2.5 px-3">MFA Policy</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{app.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-xs">
                        {app.edgeUrl}
                      </div>
                    </td>
                    <td className="py-3 px-3 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        app.environment === 'production' 
                          ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                          : app.environment === 'staging'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {app.environment}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={app.protectionStatus} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] text-slate-700 flex items-center gap-1 font-medium">
                        <KeyRound className="w-3 h-3 text-indigo-600" />
                        {app.mfaRequired ? 'Required (Hardware / TOTP)' : 'Optional'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onOpenSimulator(app.id)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-indigo-700 rounded transition-colors cursor-pointer"
                      >
                        Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Security Feed (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Live Security Events</h2>
              <p className="text-xs text-slate-500">Zero-Trust decisions & audit log</p>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              Full Log <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {recentActivity.map((log) => {
              const isAllowed = log.outcome === 'allowed';
              const isDenied = log.outcome === 'denied';

              return (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-50/70 border border-slate-200/70 text-xs flex items-start gap-2.5"
                >
                  <div className="mt-0.5 shrink-0">
                    {isAllowed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {isDenied && <ShieldAlert className="w-4 h-4 text-rose-600" />}
                    {!isAllowed && !isDenied && <AlertCircle className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium text-slate-900 truncate">{log.targetApp}</span>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono" suppressHydrationWarning>
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                      {log.reason}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="truncate">{log.actor.name || log.actor.email}</span>
                      <StatusBadge status={log.outcome} size="sm" showIcon={false} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
