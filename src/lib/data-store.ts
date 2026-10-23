'use client';

import { Application, AccessPolicy, Tunnel, AuditLog, User, UserGroup } from '@/types';
import {
  INITIAL_APPLICATIONS,
  INITIAL_POLICIES,
  INITIAL_TUNNELS,
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS,
  INITIAL_GROUPS,
} from './demo-data';

const STORAGE_KEYS = {
  APPLICATIONS: 'securegate_apps_v1',
  POLICIES: 'securegate_policies_v1',
  TUNNELS: 'securegate_tunnels_v1',
  AUDIT_LOGS: 'securegate_audit_logs_v1',
  USERS: 'securegate_users_v1',
  GROUPS: 'securegate_groups_v1',
};

// Helper to check browser environment
const isBrowser = typeof window !== 'undefined';

export function getStoredApplications(): Application[] {
  if (!isBrowser) return INITIAL_APPLICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPLICATIONS;
  }
}

export function saveApplications(apps: Application[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    window.dispatchEvent(new Event('securegate_data_changed'));
  } catch (e) {
    console.error('Failed to save applications to local storage', e);
  }
}

export function getStoredPolicies(): AccessPolicy[] {
  if (!isBrowser) return INITIAL_POLICIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POLICIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(INITIAL_POLICIES));
      return INITIAL_POLICIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_POLICIES;
  }
}

export function savePolicies(policies: AccessPolicy[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(policies));
    window.dispatchEvent(new Event('securegate_data_changed'));
  } catch (e) {
    console.error('Failed to save policies to local storage', e);
  }
}

export function getStoredTunnels(): Tunnel[] {
  if (!isBrowser) return INITIAL_TUNNELS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TUNNELS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TUNNELS, JSON.stringify(INITIAL_TUNNELS));
      return INITIAL_TUNNELS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TUNNELS;
  }
}

export function saveTunnels(tunnels: Tunnel[]): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEYS.TUNNELS, JSON.stringify(tunnels));
    window.dispatchEvent(new Event('securegate_data_changed'));
  } catch (e) {
    console.error('Failed to save tunnels to local storage', e);
  }
}

export function getStoredAuditLogs(): AuditLog[] {
  if (!isBrowser) return INITIAL_AUDIT_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function appendAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
  if (!isBrowser) return;
  try {
    const current = getStoredAuditLogs();
    const newEntry: AuditLog = {
      ...entry,
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...current].slice(0, 150); // Keep last 150 events
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
    window.dispatchEvent(new Event('securegate_data_changed'));
  } catch (e) {
    console.error('Failed to append audit log', e);
  }
}

export function getStoredUsers(): User[] {
  if (!isBrowser) return INITIAL_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

export function getStoredGroups(): UserGroup[] {
  if (!isBrowser) return INITIAL_GROUPS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(INITIAL_GROUPS));
      return INITIAL_GROUPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_GROUPS;
  }
}

export function resetDemoState(): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(INITIAL_POLICIES));
    localStorage.setItem(STORAGE_KEYS.TUNNELS, JSON.stringify(INITIAL_TUNNELS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(INITIAL_GROUPS));
    window.dispatchEvent(new Event('securegate_data_changed'));
  } catch (e) {
    console.error('Failed to reset demo state', e);
  }
}
