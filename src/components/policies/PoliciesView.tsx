'use client';

import React, { useState } from 'react';
import { 
  KeyRound, 
  Plus, 
  Clock, 
  Edit3, 
  Trash2, 
  X, 
  Lock, 
  Sparkles 
} from 'lucide-react';
import { AccessPolicy, UserGroup } from '@/types';
import { policySchema } from '@/lib/validations';
import { formatDate } from '@/lib/utils';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

interface PoliciesViewProps {
  policies: AccessPolicy[];
  groups: UserGroup[];
  onSavePolicy: (policy: Partial<AccessPolicy>, isNew: boolean) => void;
  onDeletePolicy: (policyId: string) => void;
  onOpenSimulator: () => void;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({
  policies,
  groups,
  onSavePolicy,
  onDeletePolicy,
  onOpenSimulator,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AccessPolicy | null>(null);
  const [deleteConfirmPolicy, setDeleteConfirmPolicy] = useState<AccessPolicy | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formRoles, setFormRoles] = useState('Security Engineer, Platform Engineer');
  const [formGroups, setFormGroups] = useState<string[]>(['secops-core']);
  const [formDomains, setFormDomains] = useState('securegate.io');
  const [formUsers, setFormUsers] = useState('');
  const [formMfaRequired, setFormMfaRequired] = useState(true);
  const [formMfaLevel, setFormMfaLevel] = useState<'webauthn' | 'totp' | 'any'>('webauthn');
  const [formTimeout, setFormTimeout] = useState(60);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const openCreateModal = () => {
    setEditingPolicy(null);
    setFormName('');
    setFormDescription('');
    setFormRoles('Security Engineer, Platform Engineer');
    setFormGroups(['secops-core']);
    setFormDomains('securegate.io');
    setFormUsers('');
    setFormMfaRequired(true);
    setFormMfaLevel('webauthn');
    setFormTimeout(60);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (p: AccessPolicy) => {
    setEditingPolicy(p);
    setFormName(p.name);
    setFormDescription(p.description);
    setFormRoles(p.allowedRoles.join(', '));
    setFormGroups(p.allowedGroups);
    setFormDomains(p.allowedEmailDomains.join(', '));
    setFormUsers(p.allowedUsers.join(', '));
    setFormMfaRequired(p.mfaRequired);
    setFormMfaLevel(p.mfaLevel);
    setFormTimeout(p.sessionTimeoutMinutes);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const rolesArr = formRoles.split(',').map(s => s.trim()).filter(Boolean);
    const domainsArr = formDomains.split(',').map(s => s.trim()).filter(Boolean);
    const usersArr = formUsers.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      name: formName,
      description: formDescription,
      defaultDecision: 'deny' as const,
      allowedRoles: rolesArr,
      allowedGroups: formGroups,
      allowedEmailDomains: domainsArr,
      allowedUsers: usersArr,
      mfaRequired: formMfaRequired,
      mfaLevel: formMfaLevel,
      sessionTimeoutMinutes: Number(formTimeout),
      ipRestrictionsEnabled: false,
    };

    const validation = policySchema.safeParse(payload);
    if (!validation.success) {
      setFormErrors(validation.error.flatten().fieldErrors);
      return;
    }

    const policyData: Partial<AccessPolicy> = {
      ...validation.data,
      defaultDecision: 'deny' as const,
      updatedAt: new Date().toISOString(),
    };

    if (editingPolicy) {
      onSavePolicy({ ...policyData, id: editingPolicy.id }, false);
    } else {
      onSavePolicy(policyData, true);
    }

    setIsModalOpen(false);
  };

  const toggleGroupSelection = (grpName: string) => {
    if (formGroups.includes(grpName)) {
      setFormGroups(formGroups.filter(g => g !== grpName));
    } else {
      setFormGroups([...formGroups, grpName]);
    }
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Zero-Trust Access Policies</h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
              Default Deny Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cloudflare Access policy definitions enforcing explicit identity and MFA validation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSimulator}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-indigo-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Test Policy in Simulator</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Access Policy</span>
          </button>
        </div>
      </div>

      {/* Zero Trust Invariant Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
        <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
          <Lock className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <span className="font-semibold text-slate-900 block">
            Zero-Trust Architectural Invariant: Explicit Allow Only
          </span>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            Every access request begins in a <strong className="text-rose-700">DENY</strong> state. Authorization is only issued when subject identity matches explicit group/role bindings and fulfills active MFA challenges.
          </p>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors"
          >
            <div>
              {/* Policy Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">{policy.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{policy.description}</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-50 text-rose-800 border border-rose-200 rounded font-semibold shrink-0">
                  Default Deny
                </span>
              </div>

              {/* Rules Specs */}
              <div className="space-y-2.5 my-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">
                    Allowed Identity Groups ({policy.allowedGroups.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {policy.allowedGroups.map((grp) => (
                      <span
                        key={grp}
                        className="px-2 py-0.5 text-[11px] bg-indigo-50 border border-indigo-200 text-indigo-700 rounded font-medium"
                      >
                        {grp}
                      </span>
                    ))}
                    {policy.allowedGroups.length === 0 && (
                      <span className="text-slate-400 text-[11px]">No specific groups bound</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">
                    Permitted Roles
                  </span>
                  <p className="text-[11px] text-slate-800 font-medium">
                    {policy.allowedRoles.join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                    MFA Assurance:
                  </span>
                  <span className="font-semibold text-slate-800 uppercase">
                    {policy.mfaLevel === 'webauthn' ? 'FIDO2 Hardware Key' : policy.mfaLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Session Timeout:
                  </span>
                  <span className="text-slate-800 font-mono font-medium">
                    {policy.sessionTimeoutMinutes} minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Policy Card Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono" suppressHydrationWarning>
                Updated: {formatDate(policy.updatedAt)}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(policy)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                  title="Edit policy"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmPolicy(policy)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Delete policy"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Policy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {editingPolicy ? 'Edit Zero-Trust Policy' : 'Create Access Policy'}
                </h3>
                <p className="text-xs text-slate-500">
                  Define explicit user/group allow-rules and MFA criteria
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Policy Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Production Infrastructure Admins"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                {formErrors.name && (
                  <p className="text-rose-600 text-[11px] mt-1">{formErrors.name[0]}</p>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Policy Description <span className="text-rose-600">*</span>
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Enforces hardware security keys for platform engineers"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                {formErrors.description && (
                  <p className="text-rose-600 text-[11px] mt-1">{formErrors.description[0]}</p>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Allowed Roles (Comma separated) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formRoles}
                  onChange={(e) => setFormRoles(e.target.value)}
                  placeholder="Security Engineer, Principal Architect, Platform Engineer"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                {formErrors.allowedRoles && (
                  <p className="text-rose-600 text-[11px] mt-1">{formErrors.allowedRoles[0]}</p>
                )}
              </div>

              {/* Group selection */}
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  Allowed Directory Groups
                </label>
                <div className="flex flex-wrap gap-2">
                  {groups.map((grp) => {
                    const isSelected = formGroups.includes(grp.name);
                    return (
                      <button
                        type="button"
                        key={grp.id}
                        onClick={() => toggleGroupSelection(grp.name)}
                        className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {grp.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email Domains */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Permitted Email Domains (Comma separated)
                </label>
                <input
                  type="text"
                  value={formDomains}
                  onChange={(e) => setFormDomains(e.target.value)}
                  placeholder="securegate.io, audit-partner.com"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Specific User Emails */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Explicit User Whitelist (Optional, comma separated emails)
                </label>
                <input
                  type="text"
                  value={formUsers}
                  onChange={(e) => setFormUsers(e.target.value)}
                  placeholder="elena.rostova@securegate.io"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* MFA & Timeout */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    MFA Assurance Required
                  </label>
                  <select
                    value={formMfaLevel}
                    onChange={(e) => setFormMfaLevel(e.target.value as 'webauthn' | 'totp' | 'any')}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="webauthn">FIDO2 WebAuthn Hardware Key</option>
                    <option value="totp">Authenticator App (TOTP)</option>
                    <option value="any">Any Registered Method</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Session Timeout (Minutes)
                  </label>
                  <input
                    type="number"
                    value={formTimeout}
                    onChange={(e) => setFormTimeout(Number(e.target.value))}
                    min={5}
                    max={1440}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {editingPolicy ? 'Update Policy' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Policy */}
      <ConfirmationModal
        isOpen={!!deleteConfirmPolicy}
        title="Delete Access Policy?"
        message={`Deleting '${deleteConfirmPolicy?.name}' will cause any applications bound to it to revert to unconditional Default Deny until a new policy is attached.`}
        confirmLabel="Delete Policy"
        isDestructive={true}
        onConfirm={() => {
          if (deleteConfirmPolicy) onDeletePolicy(deleteConfirmPolicy.id);
          setDeleteConfirmPolicy(null);
        }}
        onCancel={() => setDeleteConfirmPolicy(null)}
      />
    </div>
  );
};
