'use client';

import React, { useState } from 'react';
import { 
  Users, 
  KeyRound, 
  Radio, 
  Search 
} from 'lucide-react';
import { User, UserGroup } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';

interface UsersAndGroupsViewProps {
  users: User[];
  groups: UserGroup[];
  onOpenSimulatorForUser?: (userId: string) => void;
}

export const UsersAndGroupsView: React.FC<UsersAndGroupsViewProps> = ({
  users,
  groups,
  onOpenSimulatorForUser,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  const filteredGroups = groups.filter((g) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Identity Directory: Users & Groups</h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
              Simulated IdP (Okta / Entra ID)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized corporate identities, group bindings, and hardware MFA credential enrollment
          </p>
        </div>

        {/* Directory Sync Badge */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-600 shadow-2xs">
          <Radio className="w-3 h-3 text-emerald-600" />
          <span>SCIM Directory Sync: <strong className="text-slate-900">Simulated Healthy</strong></span>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Users Roster ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'groups'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Security Groups ({groups.length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Users Tab Table */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">User</th>
                  <th className="py-3 px-3.5">Department & Role</th>
                  <th className="py-3 px-3.5">Groups</th>
                  <th className="py-3 px-3.5">MFA Enrollment Method</th>
                  <th className="py-3 px-3.5">Account Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="text-slate-900 font-medium block">{user.role}</span>
                      <span className="text-[11px] text-slate-500">{user.department}</span>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {user.groups.map((grp) => (
                          <span
                            key={grp}
                            className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-indigo-700 border border-slate-200 rounded font-medium"
                          >
                            {grp}
                          </span>
                        ))}
                        {user.groups.length === 0 && (
                          <span className="text-slate-400 text-[11px]">No assigned groups</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${
                        user.mfaEnrolled
                          ? user.mfaMethod === 'FIDO2 Hardware Key'
                            ? 'text-emerald-700 font-semibold'
                            : 'text-indigo-700 font-semibold'
                          : 'text-rose-700 font-semibold'
                      }`}>
                        <KeyRound className="w-3.5 h-3.5" />
                        {user.mfaMethod}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <StatusBadge status={user.status} size="sm" />
                    </td>

                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      {onOpenSimulatorForUser && (
                        <button
                          onClick={() => onOpenSimulatorForUser(user.id)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-indigo-700 rounded transition-colors cursor-pointer"
                        >
                          Simulate Access
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Groups Tab Table */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 font-mono">{group.name}</h3>
                      <span className="text-[11px] text-slate-500">{group.memberCount} enrolled members</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded border ${
                    group.riskTier === 'high'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : group.riskTier === 'medium'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {group.riskTier} Risk Tier
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-3">{group.description}</p>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">
                    Bound Zero-Trust Policies
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {group.assignedPolicies.map((pol) => (
                      <span
                        key={pol}
                        className="px-2 py-0.5 text-[11px] bg-white text-indigo-700 border border-slate-200 rounded font-medium"
                      >
                        {pol}
                      </span>
                    ))}
                    {group.assignedPolicies.length === 0 && (
                      <span className="text-slate-400 text-[11px]">No direct policy bindings</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
