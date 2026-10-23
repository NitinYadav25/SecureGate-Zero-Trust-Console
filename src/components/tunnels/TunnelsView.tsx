'use client';

import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  Radio, 
  Copy, 
  Check, 
  RefreshCw, 
  Info 
} from 'lucide-react';
import { Tunnel } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDate } from '@/lib/utils';

interface TunnelsViewProps {
  tunnels: Tunnel[];
  onToggleTunnelStatus: (tunnelId: string) => void;
}

export const TunnelsView: React.FC<TunnelsViewProps> = ({
  tunnels,
  onToggleTunnelStatus,
}) => {
  const [copiedConfig, setCopiedConfig] = useState(false);

  const sampleConfig = `# /etc/cloudflared/config.yml (Sanitized Example)
tunnel: <UUID-REDACTED-DEMO>
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: vault.corp.securegate.io
    service: http://vault-prod.internal:8200
  - hostname: k8s-prod.corp.securegate.io
    service: http://k8s-master.corp.internal:6443
  - hostname: grafana.internal.securegate.io
    service: http://grafana.internal:3000
  # ZERO-TRUST FAIL-CLOSED FALLBACK RULE:
  # Under NO circumstance does traffic fall back to a public origin IP.
  - service: http_status:503`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleConfig);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Cloudflare Tunnels (Zero-Trust Connectors)</h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
              Fail-Closed Enforced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Outbound-only WireGuard/QUIC tunnels routing internal administrative traffic without opening firewall inbound ports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-2xs">
            <Radio className="w-3 h-3 text-emerald-600" />
            <span>Telemetry Mode: <strong className="text-slate-900">Simulated Demo</strong></span>
          </span>
        </div>
      </div>

      {/* Critical Zero-Trust Architectural Principle Card */}
      <div className="bg-white border border-rose-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Architectural Invariant: Fail-Closed Protection
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
                Never Public Fallback
              </span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
              In a true Zero-Trust design, if a tunnel connector daemon disconnects or encounters an error, <strong>traffic strictly fails closed</strong>. The Cloudflare Edge serves an administrative HTTP 503 error. <em>Under no circumstances</em> is direct public origin fallback permitted, and internal IP/hostnames are never revealed to unauthorized end users.
            </p>
          </div>
        </div>
      </div>

      {/* Tunnel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tunnels.map((tunnel) => {
          const isConnected = tunnel.status === 'connected';

          return (
            <div
              key={tunnel.id}
              className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-colors ${
                isConnected ? 'border-slate-200 hover:border-slate-300' : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${
                      isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900">{tunnel.name}</h3>
                      <p className="text-xs text-slate-500">{tunnel.datacenter}</p>
                    </div>
                  </div>
                  <StatusBadge status={tunnel.status} size="sm" />
                </div>

                {/* Tunnel Details */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs mb-4">
                  <div className="flex justify-between py-1 border-b border-slate-200/80">
                    <span className="text-slate-500">Connector ID:</span>
                    <span className="font-mono text-slate-800 font-semibold">{tunnel.maskedConnectorId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/80">
                    <span className="text-slate-500">Daemon Version:</span>
                    <span className="font-mono text-slate-700">{tunnel.version}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/80">
                    <span className="text-slate-500">Cloudflare Edge IP:</span>
                    <span className="font-mono text-indigo-700 font-medium">{tunnel.edgeAnycastIp}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/80">
                    <span className="text-slate-500">Active Multiplexed Flows:</span>
                    <span className="text-slate-900 font-bold">{tunnel.activeConnections} active</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/80">
                    <span className="text-slate-500">Round-trip Latency:</span>
                    <span className="text-slate-800 font-mono font-medium">
                      {tunnel.latencyMs > 0 ? `${tunnel.latencyMs} ms` : 'Offline'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Fail-Closed Guarantee:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Enforced
                    </span>
                  </div>
                </div>
              </div>

              {/* Tunnel Card Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono" suppressHydrationWarning>
                  Last Heartbeat: {formatDate(tunnel.lastHeartbeat)}
                </span>

                <button
                  onClick={() => onToggleTunnelStatus(tunnel.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isConnected
                      ? 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                  title={isConnected ? 'Simulate disconnecting tunnel to test fail-closed posture' : 'Reconnect tunnel daemon'}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isConnected ? 'Simulate Disconnect' : 'Reconnect Connector'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cloudflare Connector Setup Instructions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Cloudflare Connector (<code className="text-indigo-700 font-mono">cloudflared</code>) Deployment Guide
              </h3>
              <p className="text-xs text-slate-500">
                Production architecture: Internal daemons establish outbound tunnels. No inbound firewall rules required.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedConfig ? 'Copied' : 'Copy Sample Ingress'}</span>
          </button>
        </div>

        <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
          {sampleConfig}
        </pre>

        <div className="mt-3.5 flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            <strong>Security Note:</strong> All daemon credentials and token files are generated on your secure internal host and are never transmitted to this administrative dashboard.
          </span>
        </div>
      </div>
    </div>
  );
};
