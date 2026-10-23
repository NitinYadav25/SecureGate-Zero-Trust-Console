'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldAlert, 
  X, 
  FileJson, 
  FileSpreadsheet 
} from 'lucide-react';
import { AuditLog } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/utils';

interface AuditLogsViewProps {
  auditLogs: AuditLog[];
  searchQuery: string;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  auditLogs,
  searchQuery: externalSearch,
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<AuditLog | null>(null);

  const activeSearch = externalSearch || internalSearch;

  const filteredLogs = auditLogs.filter((log) => {
    if (outcomeFilter !== 'all' && log.outcome !== outcomeFilter) {
      return false;
    }
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      const match =
        log.targetApp.toLowerCase().includes(q) ||
        log.actor.name.toLowerCase().includes(q) ||
        log.actor.email.toLowerCase().includes(q) ||
        log.reason.toLowerCase().includes(q) ||
        log.eventType.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `securegate-audit-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportToCsv = () => {
    const headers = ['Timestamp', 'Actor Name', 'Actor Email', 'Event Type', 'Application', 'Outcome', 'Reason', 'Policy Evaluated'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.actor.name}"`,
      `"${l.actor.email}"`,
      `"${l.eventType}"`,
      `"${l.targetApp}"`,
      `"${l.outcome}"`,
      `"${l.reason.replace(/"/g, '""')}"`,
      `"${l.policyEvaluated || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute('download', `securegate-audit-logs-${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Zero-Trust Activity & Audit Logs</h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
              {filteredLogs.length} events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sanitized telemetry of access authorizations, edge denials, and configuration shifts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Outcome Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Outcomes</option>
              <option value="allowed">Allowed (Permitted)</option>
              <option value="denied">Denied (Blocked)</option>
              <option value="warning">Warning / Tunnel Down</option>
              <option value="info">Configuration Mutations</option>
            </select>
          </div>

          {/* Export Buttons */}
          <button
            onClick={exportToCsv}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Export filtered events as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV</span>
          </button>

          <button
            onClick={exportToJson}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Export filtered events as JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-indigo-600" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Internal Search bar on mobile */}
      <div className="sm:hidden">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            placeholder="Search audit events..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Outcome</th>
                <th className="py-3 px-3.5">Timestamp</th>
                <th className="py-3 px-3.5">Subject (Actor)</th>
                <th className="py-3 px-3.5">Target Application</th>
                <th className="py-3 px-3.5">Event Type</th>
                <th className="py-3 px-3.5">Decision Summary</th>
                <th className="py-3 px-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedEvent(log)}
                  >
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <StatusBadge status={log.outcome} size="sm" />
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]" suppressHydrationWarning>
                      {formatDate(log.timestamp)}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{log.actor.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs">{log.actor.email}</div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-medium text-slate-900">{log.targetApp}</span>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-indigo-700 border border-slate-200 font-medium">
                        {log.eventType}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 max-w-md">
                      <p className="text-slate-600 truncate text-[11px]">{log.reason}</p>
                    </td>

                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(log);
                        }}
                        className="px-2.5 py-1 text-[11px] bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-10 text-center text-slate-500 text-xs">
            No audit events found matching the specified search or outcome filters.
          </div>
        )}
      </div>

      {/* Inspect Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden p-6 relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3 mb-4">
              <div className={`p-3 rounded-xl border ${
                selectedEvent.outcome === 'allowed'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : selectedEvent.outcome === 'denied'
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}>
                {selectedEvent.outcome === 'allowed' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <ShieldAlert className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedEvent.eventType}</h3>
                  <StatusBadge status={selectedEvent.outcome} size="sm" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Event ID: {selectedEvent.id}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-5">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Timestamp (UTC):</span>
                <span className="font-mono text-slate-800">{selectedEvent.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Subject Identity:</span>
                <span className="text-slate-900 font-semibold">{selectedEvent.actor.name} ({selectedEvent.actor.email})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Target Application:</span>
                <span className="text-indigo-700 font-semibold">{selectedEvent.targetApp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Source IP / Edge PoP:</span>
                <span className="font-mono text-slate-700">{selectedEvent.actor.ip}</span>
              </div>
              {selectedEvent.policyEvaluated && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Policy Evaluated:</span>
                  <span className="text-slate-900">{selectedEvent.policyEvaluated}</span>
                </div>
              )}
              {selectedEvent.mfaVerified !== undefined && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">MFA Verification Status:</span>
                  <span className={selectedEvent.mfaVerified ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                    {selectedEvent.mfaVerified ? 'Verified in Session' : 'Unfulfilled / Missing'}
                  </span>
                </div>
              )}
              <div className="py-2">
                <span className="text-slate-500 block mb-1">Zero-Trust Evaluator Reason:</span>
                <p className="text-slate-800 font-medium bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                  {selectedEvent.reason}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
