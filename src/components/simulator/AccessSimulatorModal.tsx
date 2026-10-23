'use client';

import React, { useState } from 'react';
import { X, Play, ShieldAlert, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, UserCheck, KeyRound, Network } from 'lucide-react';
import { Application, AccessPolicy, Tunnel, User, ZeroTrustEvaluationResult } from '@/types';
import { evaluateZeroTrustAccess } from '@/lib/evaluator';
import { appendAuditLog } from '@/lib/data-store';
import { formatTime } from '@/lib/utils';

interface AccessSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  applications: Application[];
  policies: AccessPolicy[];
  tunnels: Tunnel[];
  preselectedAppId?: string;
}

export const AccessSimulatorModal: React.FC<AccessSimulatorModalProps> = ({
  isOpen,
  onClose,
  users,
  applications,
  policies,
  tunnels,
  preselectedAppId,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [selectedAppId, setSelectedAppId] = useState<string>(preselectedAppId || applications[0]?.id || '');
  const [mfaCompleted, setMfaCompleted] = useState<boolean>(true);
  const [result, setResult] = useState<ZeroTrustEvaluationResult | null>(null);

  if (!isOpen) return null;

  const handleEvaluate = () => {
    const user = users.find(u => u.id === selectedUserId);
    const app = applications.find(a => a.id === selectedAppId);
    if (!user || !app) return;

    const policy = policies.find(p => p.id === app.policyId) || {
      id: 'default-deny',
      name: 'Default Deny Fallback',
      description: 'Zero-Trust fallback policy',
      defaultDecision: 'deny',
      allowedRoles: [],
      allowedGroups: [],
      allowedEmailDomains: [],
      allowedUsers: [],
      mfaRequired: true,
      mfaLevel: 'webauthn',
      sessionTimeoutMinutes: 0,
      ipRestrictionsEnabled: false,
      updatedAt: new Date().toISOString(),
    };

    const tunnel = tunnels.find(t => t.id === app.tunnelId);

    const evalResult = evaluateZeroTrustAccess({
      user,
      application: app,
      policy,
      tunnel,
      mfaVerifiedInSession: mfaCompleted,
    });

    setResult(evalResult);

    // Record this simulated access test to the audit logs
    appendAuditLog({
      actor: {
        name: user.name,
        email: user.email,
        role: user.role,
        ip: '198.51.100.24 (Simulated Edge PoP)',
      },
      eventType: 'SIMULATED_ACCESS_CHECK',
      targetApp: app.name,
      outcome: evalResult.allowed ? 'allowed' : 'denied',
      reason: `[Zero-Trust Simulator] ${evalResult.decisionReason}`,
      policyEvaluated: policy.name,
      mfaVerified: mfaCompleted && user.mfaEnrolled,
    });
  };

  const selectedUser = users.find(u => u.id === selectedUserId);
  const selectedApp = applications.find(a => a.id === selectedAppId);
  const selectedTunnel = selectedApp ? tunnels.find(t => t.id === selectedApp.tunnelId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                Zero-Trust Access Path Evaluator
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Interactive Simulator
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Simulate end-to-end edge policy evaluation chain without exposing internal services
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* User Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                Select Identity (Subject)
              </label>
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role}) - {user.mfaEnrolled ? user.mfaMethod : 'No MFA'}
                  </option>
                ))}
              </select>
              {selectedUser && (
                <div className="mt-1.5 text-[11px] text-slate-500 space-y-0.5">
                  <div>Groups: <span className="text-slate-800 font-medium">{selectedUser.groups.join(', ') || 'None'}</span></div>
                  <div>Account Status: <span className={selectedUser.status === 'active' ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>{selectedUser.status}</span></div>
                </div>
              )}
            </div>

            {/* Application Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                Target Protected Application
              </label>
              <select
                value={selectedAppId}
                onChange={e => setSelectedAppId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
              >
                {applications.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.name} [{app.environment.toUpperCase()}]
                  </option>
                ))}
              </select>
              {selectedApp && (
                <div className="mt-1.5 text-[11px] text-slate-500 space-y-0.5">
                  <div>Assigned Policy: <span className="text-indigo-700 font-medium">{selectedApp.policyName || 'Custom'}</span></div>
                  <div>
                    Tunnel State: 
                    <span className={`ml-1 font-semibold ${selectedTunnel?.status === 'connected' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {selectedTunnel?.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MFA Verification Toggle */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Simulate MFA Challenge Completion
                </span>
                <span className="text-[11px] text-slate-500">
                  Toggle whether the user has fulfilled a biometric/WebAuthn or TOTP challenge in this session
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mfaCompleted}
                onChange={e => setMfaCompleted(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Action Button */}
          <button
            onClick={handleEvaluate}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Evaluate Zero-Trust Policy Path</span>
          </button>

          {/* Evaluation Results */}
          {result && (
            <div className="space-y-3 pt-2">
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  result.allowed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                {result.allowed ? (
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {result.allowed ? 'VERIFIED: ACCESS PERMITTED' : 'BLOCKED: ACCESS DENIED'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono" suppressHydrationWarning>
                      {formatTime(result.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs mt-1 font-semibold text-slate-900">{result.decisionReason}</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Recorded in demonstration audit log with full actor context.
                  </p>
                </div>
              </div>

              {/* Step by step pipeline */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  Zero-Trust Policy Execution Pipeline
                </span>
                <div className="space-y-1.5">
                  {result.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-start gap-2.5 text-xs"
                    >
                      {step.status === 'pass' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {step.status === 'fail' && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      {step.status === 'warn' && (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{step.name}</span>
                          <span className={`text-[10px] font-bold uppercase ${
                            step.status === 'pass' ? 'text-emerald-700' : step.status === 'fail' ? 'text-rose-700' : 'text-amber-700'
                          }`}>
                            {step.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{step.message}</p>
                        {step.technicalDetails && (
                          <p className="text-[10px] text-slate-700 font-mono mt-1 bg-white p-1 rounded border border-slate-200">
                            {step.technicalDetails}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Fail-Closed Check: Inbound requests fail closed if Cloudflare Tunnel drops.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
