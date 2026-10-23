export type Environment = 'development' | 'staging' | 'production';

export type TunnelStatus = 'connected' | 'degraded' | 'disconnected' | 'pending';

export type ProtectionStatus = 
  | 'Protected' 
  | 'Pending verification' 
  | 'Tunnel disconnected' 
  | 'Disabled';

export type MfaRequirementLevel = 'webauthn' | 'totp' | 'any';

export interface Application {
  id: string;
  name: string;
  description?: string;
  internalHostname: string; // e.g. http://vault-prod.internal:8200
  edgeUrl: string; // e.g. https://vault.corp.securegate.io
  environment: Environment;
  owner: string;
  tunnelId: string;
  tunnelStatus: TunnelStatus;
  protectionStatus: ProtectionStatus;
  policyId: string;
  policyName?: string;
  mfaRequired: boolean;
  mfaLevel: MfaRequirementLevel;
  sessionDuration: string; // e.g. '15m', '1h', '8h'
  createdAt: string;
  updatedAt: string;
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  defaultDecision: 'deny'; // Zero-Trust default deny
  allowedRoles: string[];
  allowedGroups: string[];
  allowedEmailDomains: string[];
  allowedUsers: string[];
  mfaRequired: boolean;
  mfaLevel: MfaRequirementLevel;
  sessionTimeoutMinutes: number;
  ipRestrictionsEnabled: boolean;
  allowedCidrs?: string[];
  updatedAt: string;
}

export interface Tunnel {
  id: string;
  name: string;
  maskedConnectorId: string; // Masked connector ID (e.g. cf-tun-••••••••9a1f)
  datacenter: string;
  status: TunnelStatus;
  activeConnections: number;
  latencyMs: number;
  ingressRulesCount: number;
  edgeAnycastIp: string; // Cloudflare Anycast edge IP, strictly non-origin
  version: string;
  failClosedEnforced: boolean;
  lastHeartbeat: string;
}

export type AuditOutcome = 'allowed' | 'denied' | 'warning' | 'info';

export type AuditEventType = 
  | 'ACCESS_PERMITTED'
  | 'ACCESS_DENIED_MFA'
  | 'ACCESS_DENIED_UNAUTHORIZED'
  | 'ACCESS_DENIED_TUNNEL_DOWN'
  | 'POLICY_CREATED'
  | 'POLICY_UPDATED'
  | 'POLICY_DELETED'
  | 'APPLICATION_CREATED'
  | 'APPLICATION_UPDATED'
  | 'APPLICATION_DISABLED'
  | 'TUNNEL_STATE_MUTATED'
  | 'SIMULATED_ACCESS_CHECK';

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    email: string;
    role: string;
    ip: string;
  };
  eventType: AuditEventType;
  targetApp: string;
  outcome: AuditOutcome;
  reason: string;
  policyEvaluated?: string;
  mfaVerified?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  groups: string[];
  mfaEnrolled: boolean;
  mfaMethod: 'FIDO2 Hardware Key' | 'Authenticator App (TOTP)' | 'Not Enrolled';
  status: 'active' | 'suspended';
  lastActive: string;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  riskTier: 'low' | 'medium' | 'high';
  assignedPolicies: string[];
}

export interface ZeroTrustStep {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  technicalDetails?: string;
}

export interface ZeroTrustEvaluationResult {
  allowed: boolean;
  decisionReason: string;
  steps: ZeroTrustStep[];
  timestamp: string;
  failClosedSafeguardActive: boolean;
}
