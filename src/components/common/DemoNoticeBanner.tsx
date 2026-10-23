import React from 'react';
import { AlertTriangle, Shield, Database, Sparkles } from 'lucide-react';

interface DemoNoticeBannerProps {
  onOpenSimulator?: () => void;
}

export const DemoNoticeBanner: React.FC<DemoNoticeBannerProps> = ({ onOpenSimulator }) => {
  return (
    <div className="bg-white border border-indigo-100/80 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0 mt-0.5">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-slate-900">
                SecureGate Architecture Mode: Zero-Trust Prototype
              </span>
              <span className="px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-md flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" /> Demo Mode Active
              </span>
              <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md flex items-center gap-1">
                Fail-Closed Invariant Guaranteed
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
              Cloudflare Access with MFA and Cloudflare Tunnel (<code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono text-[11px]">cloudflared</code>) are simulated for demonstration. All internal console routes operate under strict <strong className="text-slate-800">Default Deny</strong> and <strong className="text-slate-800">Fail-Closed</strong> constraints (no public origin fallback). Real enforcement requires active Cloudflare Zero Trust API credentials and enterprise IdP sync.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>Store: Local / In-Memory (PostgreSQL Ready)</span>
          </div>
          {onOpenSimulator && (
            <button
              onClick={onOpenSimulator}
              className="px-3.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Test Access Path</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
