import { describe, it, expect } from 'vitest';
import { evaluateZeroTrustAccess } from '@/lib/evaluator';
import { Application, AccessPolicy, Tunnel, User } from '@/types';

const mockApp: Application = {
  id: 'app-vault-prod',
  name: 'HashiCorp Vault Production',
  internalHostname: 'http://vault-prod.internal:8200',
  edgeUrl: 'https://vault.corp.securegate.io',
  environment: 'production',
  owner: 'DevSecOps Team',
  tunnelId: 'tun-us-east-01',
  tunnelStatus: 'connected',
  protectionStatus: 'Protected',
  policyId: 'pol-secops-crit',
  mfaRequired: true,
  mfaLevel: 'webauthn',
  sessionDuration: '1h',
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
};

const mockPolicy: AccessPolicy = {
  id: 'pol-secops-crit',
  name: 'Critical Infrastructure & Vault Admins',
  description: 'Strict Zero-Trust policy',
  defaultDecision: 'deny',
  allowedRoles: ['Security Engineer', 'Principal Architect'],
  allowedGroups: ['secops-core'],
  allowedEmailDomains: ['securegate.io'],
  allowedUsers: ['elena.rostova@securegate.io'],
  mfaRequired: true,
  mfaLevel: 'webauthn',
  sessionTimeoutMinutes: 60,
  ipRestrictionsEnabled: false,
  updatedAt: '2026-10-01T00:00:00Z',
};

const mockTunnelConnected: Tunnel = {
  id: 'tun-us-east-01',
  name: 'us-east-dc-tunnel-01',
  maskedConnectorId: 'cf-tun-••••••••7a3b',
  datacenter: 'US East (IAD)',
  status: 'connected',
  activeConnections: 12,
  latencyMs: 14,
  ingressRulesCount: 4,
  edgeAnycastIp: '172.64.32.18',
  version: 'cloudflared 2026.4.1',
  failClosedEnforced: true,
  lastHeartbeat: '2026-10-23T05:00:00Z',
};

const mockTunnelDisconnected: Tunnel = {
  ...mockTunnelConnected,
  status: 'disconnected',
  activeConnections: 0,
  latencyMs: 0,
};

const mockValidUser: User = {
  id: 'usr-elena',
  name: 'Elena Rostova',
  email: 'elena.rostova@securegate.io',
  department: 'Security',
  role: 'Principal Architect',
  groups: ['secops-core'],
  mfaEnrolled: true,
  mfaMethod: 'FIDO2 Hardware Key',
  status: 'active',
  lastActive: 'Now',
};

const mockTotpUser: User = {
  id: 'usr-arun',
  name: 'Arun Patel',
  email: 'arun.patel@securegate.io',
  department: 'Engineering',
  role: 'Platform Engineer',
  groups: ['platform-engineering'],
  mfaEnrolled: true,
  mfaMethod: 'Authenticator App (TOTP)',
  status: 'active',
  lastActive: 'Now',
};

describe('Zero-Trust Policy Evaluator Engine', () => {
  it('ALLOWS access when user, policy, MFA, and tunnel all satisfy Zero-Trust requirements', () => {
    const result = evaluateZeroTrustAccess({
      user: mockValidUser,
      application: mockApp,
      policy: mockPolicy,
      tunnel: mockTunnelConnected,
      mfaVerifiedInSession: true,
    });

    expect(result.allowed).toBe(true);
    expect(result.failClosedSafeguardActive).toBe(true);
    expect(result.steps.some(s => s.name === 'Cloudflare Tunnel Fail-Closed Guard' && s.status === 'pass')).toBe(true);
    expect(result.steps.some(s => s.name === 'Default-Deny Policy Evaluation' && s.status === 'pass')).toBe(true);
    expect(result.steps.some(s => s.name === 'MFA Enforcement' && s.status === 'pass')).toBe(true);
  });

  it('DENIES access and engages Fail-Closed guard when tunnel is disconnected (prohibiting public fallback)', () => {
    const result = evaluateZeroTrustAccess({
      user: mockValidUser,
      application: mockApp,
      policy: mockPolicy,
      tunnel: mockTunnelDisconnected,
      mfaVerifiedInSession: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.decisionReason).toContain('Fail-Closed');
    expect(result.steps.some(s => s.name === 'Cloudflare Tunnel Fail-Closed Guard' && s.status === 'fail')).toBe(true);
  });

  it('DENIES access by Default Deny when user role/group does not match policy allow-rules', () => {
    const unauthorizedUser: User = {
      ...mockValidUser,
      role: 'Junior Developer',
      groups: ['contractors'],
      email: 'vendor@external-domain.org',
    };

    const result = evaluateZeroTrustAccess({
      user: unauthorizedUser,
      application: mockApp,
      policy: mockPolicy,
      tunnel: mockTunnelConnected,
      mfaVerifiedInSession: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.decisionReason).toContain('Default Deny');
  });

  it('DENIES access when MFA challenge is unfulfilled in active session', () => {
    const result = evaluateZeroTrustAccess({
      user: mockValidUser,
      application: mockApp,
      policy: mockPolicy,
      tunnel: mockTunnelConnected,
      mfaVerifiedInSession: false, // Session challenge not completed
    });

    expect(result.allowed).toBe(false);
    expect(result.decisionReason).toContain('MFA challenge incomplete');
  });

  it('DENIES access when policy mandates FIDO2 WebAuthn hardware key but user has software TOTP', () => {
    const result = evaluateZeroTrustAccess({
      user: {
        ...mockTotpUser,
        role: 'Principal Architect', // matches role
        groups: ['secops-core'], // matches group
      },
      application: mockApp,
      policy: mockPolicy, // requires webauthn
      tunnel: mockTunnelConnected,
      mfaVerifiedInSession: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.decisionReason).toContain('FIDO2/WebAuthn hardware key required');
  });

  it('DENIES access when application protection status is administratively Disabled', () => {
    const disabledApp: Application = {
      ...mockApp,
      protectionStatus: 'Disabled',
    };

    const result = evaluateZeroTrustAccess({
      user: mockValidUser,
      application: disabledApp,
      policy: mockPolicy,
      tunnel: mockTunnelConnected,
      mfaVerifiedInSession: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.decisionReason).toContain('disabled');
  });
});
