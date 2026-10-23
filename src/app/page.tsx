'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { SecurityOverview } from '@/components/overview/SecurityOverview';
import { ApplicationsView } from '@/components/applications/ApplicationsView';
import { PoliciesView } from '@/components/policies/PoliciesView';
import { TunnelsView } from '@/components/tunnels/TunnelsView';
import { AuditLogsView } from '@/components/audit/AuditLogsView';
import { UsersAndGroupsView } from '@/components/users/UsersAndGroupsView';
import { SettingsView } from '@/components/settings/SettingsView';
import { AccessSimulatorModal } from '@/components/simulator/AccessSimulatorModal';
import { 
  getStoredApplications, 
  saveApplications, 
  getStoredPolicies, 
  savePolicies, 
  getStoredTunnels, 
  saveTunnels, 
  getStoredAuditLogs, 
  appendAuditLog, 
  getStoredUsers, 
  getStoredGroups 
} from '@/lib/data-store';
import { Application, AccessPolicy, Tunnel, AuditLog, User, UserGroup, Environment, ProtectionStatus, TunnelStatus } from '@/types';
import { Check, Info, ShieldAlert } from 'lucide-react';

export default function SecureGateApp() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedEnvironment, setSelectedEnvironment] = useState<'all' | Environment>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Core Data States initialized synchronously
  const [applications, setApplications] = useState<Application[]>(() => getStoredApplications());
  const [policies, setPolicies] = useState<AccessPolicy[]>(() => getStoredPolicies());
  const [tunnels, setTunnels] = useState<Tunnel[]>(() => getStoredTunnels());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStoredAuditLogs());
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [groups, setGroups] = useState<UserGroup[]>(() => getStoredGroups());
  const [isLoaded] = useState(true);

  // Modals & Simulator
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simulatorPreselectAppId, setSimulatorPreselectAppId] = useState<string | undefined>();
  const [isCreateAppOpen, setIsCreateAppOpen] = useState(false);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'warning'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Synchronize data from local storage / demo seed
  const loadData = () => {
    setApplications(getStoredApplications());
    setPolicies(getStoredPolicies());
    setTunnels(getStoredTunnels());
    setAuditLogs(getStoredAuditLogs());
    setUsers(getStoredUsers());
    setGroups(getStoredGroups());
  };

  useEffect(() => {
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('securegate_data_changed', handleStorageChange);
    return () => {
      window.removeEventListener('securegate_data_changed', handleStorageChange);
    };
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Application Handlers
  const handleSaveApplication = (appData: Partial<Application>, isNew: boolean) => {
    if (isNew) {
      const newApp: Application = {
        id: `app-${Date.now().toString(36)}`,
        name: appData.name || 'Untitled Service',
        description: appData.description || '',
        internalHostname: appData.internalHostname || 'http://internal.svc:8080',
        edgeUrl: appData.edgeUrl || 'https://service.corp.securegate.io',
        environment: appData.environment || 'production',
        owner: appData.owner || 'SecOps Team',
        tunnelId: appData.tunnelId || tunnels[0]?.id || 'tun-us-east-01',
        tunnelStatus: appData.tunnelStatus || 'connected',
        protectionStatus: 'Protected',
        policyId: appData.policyId || policies[0]?.id || 'pol-secops-crit',
        policyName: appData.policyName || 'Default Policy',
        mfaRequired: appData.mfaRequired ?? true,
        mfaLevel: appData.mfaLevel || 'webauthn',
        sessionDuration: appData.sessionDuration || '1h',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newApp, ...applications];
      setApplications(updated);
      saveApplications(updated);

      appendAuditLog({
        actor: {
          name: 'Elena Rostova',
          email: 'elena.rostova@securegate.io',
          role: 'Principal Architect',
          ip: '198.51.100.42 (Edge PoP IAD)',
        },
        eventType: 'APPLICATION_CREATED',
        targetApp: newApp.name,
        outcome: 'info',
        reason: `Registered new internal application '${newApp.name}' protected via tunnel '${newApp.tunnelId}'.`,
      });

      showToast(`Protected application '${newApp.name}' successfully registered.`);
    } else {
      const updated = applications.map((a) => {
        if (a.id === appData.id) {
          return {
            ...a,
            ...appData,
            updatedAt: new Date().toISOString(),
          };
        }
        return a;
      });
      setApplications(updated);
      saveApplications(updated);

      appendAuditLog({
        actor: {
          name: 'Elena Rostova',
          email: 'elena.rostova@securegate.io',
          role: 'Principal Architect',
          ip: '198.51.100.42 (Edge PoP IAD)',
        },
        eventType: 'APPLICATION_UPDATED',
        targetApp: appData.name || 'Application',
        outcome: 'info',
        reason: `Updated configuration and access policies for '${appData.name}'.`,
      });

      showToast(`Application '${appData.name}' updated.`);
    }
  };

  const handleToggleAppStatus = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    const newStatus = app.protectionStatus === 'Disabled' ? 'Protected' : 'Disabled';
    const updated = applications.map((a) => {
      if (a.id === appId) {
        return {
          ...a,
          protectionStatus: newStatus as ProtectionStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return a;
    });

    setApplications(updated);
    saveApplications(updated);

    appendAuditLog({
      actor: {
        name: 'Elena Rostova',
        email: 'elena.rostova@securegate.io',
        role: 'Principal Architect',
        ip: '198.51.100.42 (Edge PoP IAD)',
      },
      eventType: 'APPLICATION_DISABLED',
      targetApp: app.name,
      outcome: newStatus === 'Disabled' ? 'warning' : 'info',
      reason: `Application administration status mutated to '${newStatus}'. Zero-Trust edge rules updated.`,
    });

    showToast(`Application '${app.name}' is now ${newStatus}.`, newStatus === 'Disabled' ? 'warning' : 'success');
  };

  const handleDeleteApplication = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    const updated = applications.filter(a => a.id !== appId);
    setApplications(updated);
    saveApplications(updated);

    if (app) {
      appendAuditLog({
        actor: {
          name: 'Elena Rostova',
          email: 'elena.rostova@securegate.io',
          role: 'Principal Architect',
          ip: '198.51.100.42 (Edge PoP IAD)',
        },
        eventType: 'APPLICATION_DISABLED',
        targetApp: app.name,
        outcome: 'warning',
        reason: `Application '${app.name}' removed from Zero-Trust Edge Catalog.`,
      });
      showToast(`Application '${app.name}' deleted.`, 'info');
    }
  };

  // Policy Handlers
  const handleSavePolicy = (policyData: Partial<AccessPolicy>, isNew: boolean) => {
    if (isNew) {
      const newPolicy: AccessPolicy = {
        id: `pol-${Date.now().toString(36)}`,
        name: policyData.name || 'Untitled Policy',
        description: policyData.description || '',
        defaultDecision: 'deny',
        allowedRoles: policyData.allowedRoles || ['Security Engineer'],
        allowedGroups: policyData.allowedGroups || [],
        allowedEmailDomains: policyData.allowedEmailDomains || ['securegate.io'],
        allowedUsers: policyData.allowedUsers || [],
        mfaRequired: policyData.mfaRequired ?? true,
        mfaLevel: policyData.mfaLevel || 'webauthn',
        sessionTimeoutMinutes: policyData.sessionTimeoutMinutes || 60,
        ipRestrictionsEnabled: false,
        updatedAt: new Date().toISOString(),
      };
      const updated = [newPolicy, ...policies];
      setPolicies(updated);
      savePolicies(updated);

      appendAuditLog({
        actor: {
          name: 'Elena Rostova',
          email: 'elena.rostova@securegate.io',
          role: 'Principal Architect',
          ip: '198.51.100.42 (Edge PoP IAD)',
        },
        eventType: 'POLICY_CREATED',
        targetApp: 'Global Policy Engine',
        outcome: 'info',
        reason: `Created new Zero-Trust Access Policy '${newPolicy.name}' (Default Deny).`,
      });

      showToast(`Policy '${newPolicy.name}' created.`);
    } else {
      const updated = policies.map((p) => {
        if (p.id === policyData.id) {
          return {
            ...p,
            ...policyData,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      setPolicies(updated);
      savePolicies(updated);

      appendAuditLog({
        actor: {
          name: 'Elena Rostova',
          email: 'elena.rostova@securegate.io',
          role: 'Principal Architect',
          ip: '198.51.100.42 (Edge PoP IAD)',
        },
        eventType: 'POLICY_UPDATED',
        targetApp: 'Global Policy Engine',
        outcome: 'info',
        reason: `Updated rule definitions for policy '${policyData.name}'.`,
      });

      showToast(`Policy '${policyData.name}' updated.`);
    }
  };

  const handleDeletePolicy = (policyId: string) => {
    const policy = policies.find(p => p.id === policyId);
    const updated = policies.filter(p => p.id !== policyId);
    setPolicies(updated);
    savePolicies(updated);

    if (policy) {
      appendAuditLog({
        actor: {
          name: 'Elena Rostova',
          email: 'elena.rostova@securegate.io',
          role: 'Principal Architect',
          ip: '198.51.100.42 (Edge PoP IAD)',
        },
        eventType: 'POLICY_DELETED',
        targetApp: 'Global Policy Engine',
        outcome: 'warning',
        reason: `Deleted access policy '${policy.name}'. Associated applications will fallback to Default Deny.`,
      });
      showToast(`Policy '${policy.name}' deleted.`, 'info');
    }
  };

  // Tunnel Simulation Toggle
  const handleToggleTunnelStatus = (tunnelId: string) => {
    const tunnel = tunnels.find(t => t.id === tunnelId);
    if (!tunnel) return;

    const newStatus = tunnel.status === 'connected' ? 'disconnected' : 'connected';
    const updated = tunnels.map((t) => {
      if (t.id === tunnelId) {
        return {
          ...t,
          status: newStatus as TunnelStatus,
          latencyMs: newStatus === 'connected' ? 22 : 0,
          activeConnections: newStatus === 'connected' ? 35 : 0,
          lastHeartbeat: new Date().toISOString(),
        };
      }
      return t;
    });

    setTunnels(updated);
    saveTunnels(updated);

    // Also update any applications mapped to this tunnel
    const updatedApps = applications.map((a) => {
      if (a.tunnelId === tunnelId) {
        return {
          ...a,
          tunnelStatus: newStatus as TunnelStatus,
          protectionStatus: newStatus === 'connected' ? ('Protected' as const) : ('Tunnel disconnected' as const),
        };
      }
      return a;
    });
    setApplications(updatedApps);
    saveApplications(updatedApps);

    appendAuditLog({
      actor: {
        name: 'Elena Rostova (Simulation)',
        email: 'elena.rostova@securegate.io',
        role: 'Principal Architect',
        ip: '198.51.100.42 (Edge PoP IAD)',
      },
      eventType: 'TUNNEL_STATE_MUTATED',
      targetApp: tunnel.name,
      outcome: newStatus === 'connected' ? 'info' : 'warning',
      reason: `Connector '${tunnel.name}' simulated status set to '${newStatus}'. Fail-closed guard engaged.`,
    });

    showToast(
      newStatus === 'connected'
        ? `Tunnel '${tunnel.name}' connected.`
        : `Tunnel '${tunnel.name}' disconnected. Fail-closed safeguard engaged!`,
      newStatus === 'connected' ? 'success' : 'warning'
    );
  };

  const handleOpenSimulator = (appId?: string) => {
    setSimulatorPreselectAppId(appId);
    setSimulatorOpen(true);
  };

  const activeTunnelErrorsCount = tunnels.filter(t => t.status !== 'connected').length;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-mono">
        Loading SecureGate Zero-Trust Environment...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      <div className="flex-1 flex w-full">
        {/* Responsive Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          openSimulator={() => handleOpenSimulator()}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
          counts={{
            applications: applications.length,
            policies: policies.length,
            tunnels: tunnels.length,
            auditLogs: auditLogs.length,
            users: users.length,
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar Navigation */}
          <TopBar
            onOpenMobileNav={() => setMobileNavOpen(true)}
            selectedEnvironment={selectedEnvironment}
            onSelectEnvironment={setSelectedEnvironment}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            openSimulator={() => handleOpenSimulator()}
            activeTunnelErrorsCount={activeTunnelErrorsCount}
          />

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
              <div
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold backdrop-blur-md ${
                  toastMessage.type === 'success'
                    ? 'bg-white border-emerald-200 text-emerald-900'
                    : toastMessage.type === 'warning'
                    ? 'bg-white border-amber-200 text-amber-900'
                    : 'bg-white border-indigo-200 text-indigo-900'
                }`}
              >
                {toastMessage.type === 'success' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                {toastMessage.type === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />}
                {toastMessage.type === 'info' && <Info className="w-4 h-4 text-indigo-600 shrink-0" />}
                <span>{toastMessage.text}</span>
              </div>
            </div>
          )}

          {/* View Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentTab === 'overview' && (
              <SecurityOverview
                applications={applications}
                policies={policies}
                tunnels={tunnels}
                auditLogs={auditLogs}
                users={users}
                onNavigate={setCurrentTab}
                onOpenSimulator={handleOpenSimulator}
                onNewApp={() => {
                  setCurrentTab('applications');
                  setIsCreateAppOpen(true);
                }}
              />
            )}

            {currentTab === 'applications' && (
              <ApplicationsView
                applications={applications}
                policies={policies}
                tunnels={tunnels}
                selectedEnvironment={selectedEnvironment}
                searchQuery={searchQuery}
                onSaveApplication={handleSaveApplication}
                onToggleStatus={handleToggleAppStatus}
                onDeleteApplication={handleDeleteApplication}
                onOpenSimulator={handleOpenSimulator}
                isCreateOpen={isCreateAppOpen}
                setIsCreateOpen={setIsCreateAppOpen}
              />
            )}

            {currentTab === 'policies' && (
              <PoliciesView
                policies={policies}
                groups={groups}
                onSavePolicy={handleSavePolicy}
                onDeletePolicy={handleDeletePolicy}
                onOpenSimulator={() => handleOpenSimulator()}
              />
            )}

            {currentTab === 'tunnels' && (
              <TunnelsView
                tunnels={tunnels}
                onToggleTunnelStatus={handleToggleTunnelStatus}
              />
            )}

            {currentTab === 'audit' && (
              <AuditLogsView
                auditLogs={auditLogs}
                searchQuery={searchQuery}
              />
            )}

            {currentTab === 'users' && (
              <UsersAndGroupsView
                users={users}
                groups={groups}
                onOpenSimulatorForUser={() => {
                  setSimulatorOpen(true);
                }}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                onResetComplete={() => {
                  loadData();
                  showToast('Demo environment reset to initial defaults.', 'info');
                }}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Interactive Simulator Modal */}
      <AccessSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        users={users}
        applications={applications}
        policies={policies}
        tunnels={tunnels}
        preselectedAppId={simulatorPreselectAppId}
      />
    </div>
  );
}
