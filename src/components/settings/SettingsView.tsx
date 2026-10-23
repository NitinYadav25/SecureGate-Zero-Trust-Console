'use client';

import React, { useState } from 'react';
import { 
  RotateCcw, 
  Database, 
  CheckCircle2, 
  Radio, 
  Lock, 
  Check 
} from 'lucide-react';
import { resetDemoState } from '@/lib/data-store';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

interface SettingsViewProps {
  onResetComplete: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetComplete }) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    resetDemoState();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      onResetComplete();
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-slate-900">Settings & Zero-Trust Integration Posture</h1>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
            Environment Status
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Integration status check, architectural security constraints, and demo data management
        </p>
      </div>

      {/* Integration Status Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-600" />
          Integration Connectors Readiness Checklist
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Item 1: Cloudflare Tunnel Daemon */}
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Cloudflare Tunnel Connector</span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono font-medium">SIMULATED (Demo)</span>
              </div>
              <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                Connects internal admin VPCs to Cloudflare Edge using outbound TLS/QUIC. No inbound public ports.
              </p>
              <div className="mt-2 text-[10px] text-slate-500">
                To connect live: Run <code className="text-indigo-700 bg-white px-1 py-0.5 rounded border border-slate-200">cloudflared tunnel run &lt;tunnel-name&gt;</code> and supply <code className="text-indigo-700 bg-white px-1 py-0.5 rounded border border-slate-200">CLOUDFLARE_API_TOKEN</code>.
              </div>
            </div>
          </div>

          {/* Item 2: Cloudflare Access & MFA */}
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Cloudflare Access MFA Engine</span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono font-medium">SIMULATED (Demo)</span>
              </div>
              <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                Edge identity enforcement validating FIDO2 WebAuthn keys and SAML claims prior to tunnel ingress.
              </p>
              <div className="mt-2 text-[10px] text-slate-500">
                To connect live: Configure Cloudflare Zero Trust Access Application and link your domain DNS.
              </div>
            </div>
          </div>

          {/* Item 3: Identity Provider */}
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Enterprise IdP (Okta / Entra ID)</span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono font-medium">MOCK DIRECTORY</span>
              </div>
              <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                Simulated SCIM directory providing user roles, group memberships, and MFA enrollment state.
              </p>
              <div className="mt-2 text-[10px] text-slate-500">
                To connect live: Configure OIDC/SAML IdP in Cloudflare Zero Trust Settings &gt; Authentication.
              </div>
            </div>
          </div>

          {/* Item 4: Database Layer */}
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">Persistence Store</span>
                <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-mono font-medium">LOCAL STORAGE & MEMORY</span>
              </div>
              <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                Current prototype uses an isolated client-side and Route Handler data layer. Schema is designed for PostgreSQL with Prisma.
              </p>
              <div className="mt-2 text-[10px] text-slate-500">
                To connect PostgreSQL: Set <code className="text-indigo-700 bg-white px-1 py-0.5 rounded border border-slate-200">DATABASE_URL</code> and run <code className="text-indigo-700 bg-white px-1 py-0.5 rounded border border-slate-200">npx prisma db push</code>.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Architecture Posture Rules */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-600" />
          Mandatory Zero-Trust Operating Constraints
        </h3>

        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <strong className="text-slate-900">Strict Fail-Closed Invariant:</strong> If a tunnel or connector terminates, the edge immediately terminates connectivity. Direct public IP origin fallback is prohibited by policy.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <strong className="text-slate-900">No Secrets in UI or Logs:</strong> Tunnel private credentials, API tokens, and second-factor OTP keys are never rendered in client UI, audit feeds, or serialized state.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
            <div>
              <strong className="text-slate-900">Internal Topology Shielding:</strong> Internal RFC1918 hostnames (<code className="text-slate-600 bg-white px-1 rounded border border-slate-200">*.internal</code>) are only visible to authorized administrators and are never surfaced in public 403/503 end-user error screens.
            </div>
          </div>
        </div>
      </div>

      {/* Prototype Reset Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              Reset Demonstration State
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              Restore all applications, access policies, tunnels, and audit logs to their initial default sample data set.
            </p>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Demonstration state successfully re-initialized to defaults!</span>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={showResetConfirm}
        title="Reset All Demo Data?"
        message="This will overwrite all created applications, custom access policies, and audit events with the initial seed state. This cannot be undone."
        confirmLabel="Reset State"
        isDestructive={true}
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
