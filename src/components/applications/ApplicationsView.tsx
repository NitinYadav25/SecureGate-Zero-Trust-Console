'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Filter, 
  KeyRound, 
  Edit3, 
  PowerOff, 
  Power, 
  Layers, 
  Sparkles, 
  X, 
  Info, 
  Trash2 
} from 'lucide-react';
import { Application, AccessPolicy, Tunnel, Environment } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { applicationSchema } from '@/lib/validations';
import { formatDate } from '@/lib/utils';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

interface ApplicationsViewProps {
  applications: Application[];
  policies: AccessPolicy[];
  tunnels: Tunnel[];
  selectedEnvironment: 'all' | Environment;
  searchQuery: string;
  onSaveApplication: (app: Partial<Application>, isNew: boolean) => void;
  onToggleStatus: (appId: string) => void;
  onDeleteApplication: (appId: string) => void;
  onOpenSimulator: (appId: string) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  policies,
  tunnels,
  selectedEnvironment,
  searchQuery,
  onSaveApplication,
  onToggleStatus,
  onDeleteApplication,
  onOpenSimulator,
  isCreateOpen,
  setIsCreateOpen,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [inspectingApp, setInspectingApp] = useState<Application | null>(null);
  const [confirmApp, setConfirmApp] = useState<Application | null>(null);
  const [deleteConfirmApp, setDeleteConfirmApp] = useState<Application | null>(null);

  // Form State for Create / Edit
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formInternalHostname, setFormInternalHostname] = useState('');
  const [formSubdomain, setFormSubdomain] = useState('');
  const [formEnvironment, setFormEnvironment] = useState<Environment>('production');
  const [formOwner, setFormOwner] = useState('');
  const [formTunnelId, setFormTunnelId] = useState(tunnels[0]?.id || '');
  const [formPolicyId, setFormPolicyId] = useState(policies[0]?.id || '');
  const [formMfaRequired, setFormMfaRequired] = useState(true);
  const [formMfaLevel, setFormMfaLevel] = useState<'webauthn' | 'totp' | 'any'>('webauthn');
  const [formSessionDuration, setFormSessionDuration] = useState('1h');
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const openCreateModal = () => {
    setEditingApp(null);
    setFormName('');
    setFormDescription('');
    setFormInternalHostname('http://console.internal:8080');
    setFormSubdomain('');
    setFormEnvironment('production');
    setFormOwner('DevSecOps Team');
    setFormTunnelId(tunnels[0]?.id || '');
    setFormPolicyId(policies[0]?.id || '');
    setFormMfaRequired(true);
    setFormMfaLevel('webauthn');
    setFormSessionDuration('1h');
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const openEditModal = (app: Application) => {
    setEditingApp(app);
    setFormName(app.name);
    setFormDescription(app.description || '');
    setFormInternalHostname(app.internalHostname);
    const sub = app.edgeUrl.replace('https://', '').split('.')[0] || 'app';
    setFormSubdomain(sub);
    setFormEnvironment(app.environment);
    setFormOwner(app.owner);
    setFormTunnelId(app.tunnelId);
    setFormPolicyId(app.policyId);
    setFormMfaRequired(app.mfaRequired);
    setFormMfaLevel(app.mfaLevel);
    setFormSessionDuration(app.sessionDuration);
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const payload = {
      name: formName,
      description: formDescription,
      internalHostname: formInternalHostname,
      edgeSubdomain: formSubdomain.toLowerCase().trim(),
      environment: formEnvironment,
      owner: formOwner,
      tunnelId: formTunnelId,
      policyId: formPolicyId,
      mfaRequired: formMfaRequired,
      mfaLevel: formMfaLevel,
      sessionDuration: formSessionDuration as '15m' | '1h' | '4h' | '8h' | '24h',
    };

    const validation = applicationSchema.safeParse(payload);

    if (!validation.success) {
      setFormErrors(validation.error.flatten().fieldErrors);
      return;
    }

    const assignedPolicy = policies.find(p => p.id === formPolicyId);
    const selectedTunnel = tunnels.find(t => t.id === formTunnelId);

    const appData: Partial<Application> = {
      name: validation.data.name,
      description: validation.data.description,
      internalHostname: validation.data.internalHostname,
      edgeUrl: `https://${validation.data.edgeSubdomain}.corp.securegate.io`,
      environment: validation.data.environment,
      owner: validation.data.owner,
      tunnelId: validation.data.tunnelId,
      tunnelStatus: selectedTunnel?.status || 'connected',
      protectionStatus: 'Protected',
      policyId: validation.data.policyId,
      policyName: assignedPolicy?.name || 'Custom Policy',
      mfaRequired: validation.data.mfaRequired,
      mfaLevel: validation.data.mfaLevel,
      sessionDuration: validation.data.sessionDuration,
    };

    if (editingApp) {
      onSaveApplication({ ...appData, id: editingApp.id }, false);
    } else {
      onSaveApplication(appData, true);
    }

    setIsCreateOpen(false);
  };

  // Filter logic
  const filteredApps = applications.filter((app) => {
    if (selectedEnvironment !== 'all' && app.environment !== selectedEnvironment) {
      return false;
    }
    if (filterStatus !== 'all' && app.protectionStatus.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        app.name.toLowerCase().includes(q) ||
        app.internalHostname.toLowerCase().includes(q) ||
        app.edgeUrl.toLowerCase().includes(q) ||
        app.owner.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* View Header with Filters and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Protected Applications</h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
              {filteredApps.length} cataloged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal services shielded by Cloudflare Tunnel and Zero-Trust Edge Policies
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Protection Statuses</option>
              <option value="protected">Protected</option>
              <option value="pending verification">Pending Verification</option>
              <option value="tunnel disconnected">Tunnel Disconnected</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {/* Create Button */}
          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Protect Service</span>
          </button>
        </div>
      </div>

      {/* Applications Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => {
          return (
            <div
              key={app.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all group relative"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {app.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">Owner: {app.owner}</span>
                  </div>
                  <StatusBadge status={app.protectionStatus} size="sm" />
                </div>

                {/* Description */}
                {app.description && (
                  <p className="text-xs text-slate-600 mb-3.5 line-clamp-2">
                    {app.description}
                  </p>
                )}

                {/* Technical Routing Details */}
                <div className="space-y-2 bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs mb-3.5">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-0.5">
                      Edge Zero-Trust URL
                    </span>
                    <span className="font-mono text-[11px] text-indigo-700 font-medium flex items-center gap-1 truncate">
                      {app.edgeUrl}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-0.5">
                      Internal Hostname (Tunnel Target)
                    </span>
                    <span className="font-mono text-[11px] text-slate-700 truncate block">
                      {app.internalHostname}
                    </span>
                  </div>
                </div>

                {/* Meta properties */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] mb-3">
                  <span className={`px-2 py-0.5 rounded font-medium capitalize ${
                    app.environment === 'production' 
                      ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                      : app.environment === 'staging'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {app.environment}
                  </span>

                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1 font-medium">
                    <KeyRound className="w-3 h-3 text-indigo-600" />
                    {app.mfaRequired ? 'MFA Required' : 'No MFA'}
                  </span>

                  <span className="text-slate-500">
                    Session: <strong className="text-slate-700 font-medium">{app.sessionDuration}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setInspectingApp(app)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    title="View details and routing inspection"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(app)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    title="Edit configuration"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmApp(app)}
                    className={`p-1.5 rounded transition-colors ${
                      app.protectionStatus === 'Disabled'
                        ? 'text-emerald-600 hover:bg-emerald-50'
                        : 'text-amber-600 hover:bg-amber-50'
                    }`}
                    title={app.protectionStatus === 'Disabled' ? 'Enable application' : 'Disable application'}
                  >
                    {app.protectionStatus === 'Disabled' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setDeleteConfirmApp(app)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onOpenSimulator(app.id)}
                  className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Test Path</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredApps.length === 0 && (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
          <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900">No applications matched criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your environment or status filter, or clear your search term.
          </p>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {editingApp ? 'Edit Protected Application' : 'Register New Internal Service'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure Cloudflare Tunnel routing target and Zero-Trust protection
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* App Name */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Service Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. HashiCorp Vault Production"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                {formErrors.name && (
                  <p className="text-rose-600 text-[11px] mt-1">{formErrors.name[0]}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Description / Purpose
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Secrets management and PKI authority for platform"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Internal Hostname */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Internal Target Hostname / Port <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formInternalHostname}
                  onChange={(e) => setFormInternalHostname(e.target.value)}
                  placeholder="http://vault-prod.internal:8200"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Private URL inside your internal VPC/datacenter. Not directly resolvable on the public internet.
                </p>
                {formErrors.internalHostname && (
                  <p className="text-rose-600 text-[11px] mt-1">{formErrors.internalHostname[0]}</p>
                )}
              </div>

              {/* Edge Subdomain */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Edge Subdomain <span className="text-rose-600">*</span>
                </label>
                <div className="flex items-center">
                  <span className="bg-slate-100 text-slate-500 px-3 py-2 rounded-l-lg border border-r-0 border-slate-300 font-mono text-[11px]">
                    https://
                  </span>
                  <input
                    type="text"
                    value={formSubdomain}
                    onChange={(e) => setFormSubdomain(e.target.value.toLowerCase())}
                    placeholder="vault-prod"
                    className="flex-1 bg-white border-y border-slate-300 px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <span className="bg-slate-100 text-slate-500 px-3 py-2 rounded-r-lg border border-l-0 border-slate-300 font-mono text-[11px]">
                    .corp.securegate.io
                  </span>
                </div>
                {formErrors.edgeSubdomain && (
                  <p className="text-rose-600 text-[11px] mt-1">{formErrors.edgeSubdomain[0]}</p>
                )}
              </div>

              {/* Environment & Owner */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Environment
                  </label>
                  <select
                    value={formEnvironment}
                    onChange={(e) => setFormEnvironment(e.target.value as Environment)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Owner / Team <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                    placeholder="e.g. DevSecOps"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                  {formErrors.owner && (
                    <p className="text-rose-600 text-[11px] mt-1">{formErrors.owner[0]}</p>
                  )}
                </div>
              </div>

              {/* Tunnel & Policy */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Cloudflare Tunnel
                  </label>
                  <select
                    value={formTunnelId}
                    onChange={(e) => setFormTunnelId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {tunnels.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Access Policy
                  </label>
                  <select
                    value={formPolicyId}
                    onChange={(e) => setFormPolicyId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {policies.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* MFA Settings */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-800 block">Require Multi-Factor Authentication</span>
                    <span className="text-[11px] text-slate-500">Strictly enforce second-factor challenge at Edge</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formMfaRequired}
                    onChange={(e) => setFormMfaRequired(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {formMfaRequired && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">MFA Assurance Level</label>
                      <select
                        value={formMfaLevel}
                        onChange={(e) => setFormMfaLevel(e.target.value as 'webauthn' | 'totp' | 'any')}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-[11px] text-slate-900 focus:outline-none cursor-pointer"
                      >
                        <option value="webauthn">FIDO2 / WebAuthn Hardware Key</option>
                        <option value="totp">Authenticator App (TOTP)</option>
                        <option value="any">Any Registered MFA Method</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Session Duration</label>
                      <select
                        value={formSessionDuration}
                        onChange={(e) => setFormSessionDuration(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-[11px] text-slate-900 focus:outline-none cursor-pointer"
                      >
                        <option value="15m">15 Minutes</option>
                        <option value="1h">1 Hour</option>
                        <option value="4h">4 Hours</option>
                        <option value="8h">8 Hours</option>
                        <option value="24h">24 Hours</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {editingApp ? 'Save Changes' : 'Register Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Drawer / Modal */}
      {inspectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden p-6 relative">
            <button
              onClick={() => setInspectingApp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{inspectingApp.name}</h3>
                  <StatusBadge status={inspectingApp.protectionStatus} size="sm" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{inspectingApp.description}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-5">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Edge URL:</span>
                <span className="font-mono text-indigo-700 font-semibold">{inspectingApp.edgeUrl}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Internal Target:</span>
                <span className="font-mono text-slate-800">{inspectingApp.internalHostname}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Assigned Policy:</span>
                <span className="text-slate-900 font-medium">{inspectingApp.policyName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Cloudflare Tunnel:</span>
                <span className="text-slate-900">{inspectingApp.tunnelId} ({inspectingApp.tunnelStatus})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Fail-Closed Invariant:</span>
                <span className="text-emerald-700 font-semibold">Active (No public fallback)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Created:</span>
                <span className="text-slate-500 font-mono" suppressHydrationWarning>{formatDate(inspectingApp.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const id = inspectingApp.id;
                  setInspectingApp(null);
                  onOpenSimulator(id);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Zero-Trust Evaluation</span>
              </button>

              <button
                onClick={() => setInspectingApp(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Disable / Enable */}
      <ConfirmationModal
        isOpen={!!confirmApp}
        title={confirmApp?.protectionStatus === 'Disabled' ? 'Re-enable Application?' : 'Disable Protected Application?'}
        message={
          confirmApp?.protectionStatus === 'Disabled'
            ? `Re-enabling ${confirmApp?.name} will restore Cloudflare Access policy enforcement and tunnel routing.`
            : `Disabling ${confirmApp?.name} will immediately revoke all access at the Cloudflare Edge. Zero-Trust Default Deny will block all future requests.`
        }
        confirmLabel={confirmApp?.protectionStatus === 'Disabled' ? 'Enable Service' : 'Disable Service'}
        isDestructive={confirmApp?.protectionStatus !== 'Disabled'}
        onConfirm={() => {
          if (confirmApp) onToggleStatus(confirmApp.id);
          setConfirmApp(null);
        }}
        onCancel={() => setConfirmApp(null)}
      />

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={!!deleteConfirmApp}
        title="Delete Protected Application?"
        message={`Are you sure you want to remove ${deleteConfirmApp?.name} from the Zero-Trust Edge Catalog? This action will remove its routing rules.`}
        confirmLabel="Delete Application"
        isDestructive={true}
        onConfirm={() => {
          if (deleteConfirmApp) onDeleteApplication(deleteConfirmApp.id);
          setDeleteConfirmApp(null);
        }}
        onCancel={() => setDeleteConfirmApp(null)}
      />
    </div>
  );
};
