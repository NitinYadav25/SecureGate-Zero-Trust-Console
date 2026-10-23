import { Application, AccessPolicy, Tunnel, User, ZeroTrustEvaluationResult, ZeroTrustStep } from '@/types';

export function evaluateZeroTrustAccess({
  user,
  application,
  policy,
  tunnel,
  mfaVerifiedInSession,
}: {
  user: User;
  application: Application;
  policy: AccessPolicy;
  tunnel?: Tunnel;
  mfaVerifiedInSession: boolean;
}): ZeroTrustEvaluationResult {
  const steps: ZeroTrustStep[] = [];
  const timestamp = new Date().toISOString();

  // Step 1: Check Application Operational & Protection Status
  if (application.protectionStatus === 'Disabled') {
    steps.push({
      name: 'Application Status Check',
      status: 'fail',
      message: 'Access Denied: The requested application is administratively disabled.',
      technicalDetails: `Application '${application.name}' (ID: ${application.id}) is set to Disabled status.`,
    });
    return {
      allowed: false,
      decisionReason: 'Application is administratively disabled',
      steps,
      timestamp,
      failClosedSafeguardActive: true,
    };
  } else {
    steps.push({
      name: 'Application Status Check',
      status: 'pass',
      message: `Application '${application.name}' is active in ${application.environment.toUpperCase()} environment.`,
    });
  }

  // Step 2: Zero-Trust Invariant - Cloudflare Tunnel Route & Fail-Closed Guard
  if (!tunnel || tunnel.status !== 'connected') {
    steps.push({
      name: 'Cloudflare Tunnel Fail-Closed Guard',
      status: 'fail',
      message: 'Access Denied: Cloudflare Tunnel connector is offline or degraded. Fail-closed safeguard engaged.',
      technicalDetails: `Tunnel status: ${tunnel ? tunnel.status : 'notFound'}. CRITICAL ZERO-TRUST POLICY: Outbound tunnel routes do NOT fall back to direct public origin IPs under any circumstance.`,
    });
    return {
      allowed: false,
      decisionReason: 'Tunnel connector offline (Fail-Closed triggered; direct public origin fallback prohibited)',
      steps,
      timestamp,
      failClosedSafeguardActive: true,
    };
  } else {
    steps.push({
      name: 'Cloudflare Tunnel Fail-Closed Guard',
      status: 'pass',
      message: `Active encrypted tunnel verified (${tunnel.datacenter}, ${tunnel.latencyMs}ms latency). No public IP exposed.`,
      technicalDetails: `Connector: ${tunnel.maskedConnectorId} | Edge IP: ${tunnel.edgeAnycastIp}`,
    });
  }

  // Step 3: Identity & Default-Deny Authorization Check
  if (user.status === 'suspended') {
    steps.push({
      name: 'Identity Status Check',
      status: 'fail',
      message: 'Access Denied: User account is suspended in IdP directory.',
    });
    return {
      allowed: false,
      decisionReason: 'User account is suspended',
      steps,
      timestamp,
      failClosedSafeguardActive: true,
    };
  }

  const emailDomain = user.email.split('@')[1] || '';
  const domainMatches = policy.allowedEmailDomains.some(d => d.toLowerCase() === emailDomain.toLowerCase());
  const userMatches = policy.allowedUsers.some(u => u.toLowerCase() === user.email.toLowerCase());
  const roleMatches = policy.allowedRoles.includes(user.role);
  const groupMatches = user.groups.some(g => policy.allowedGroups.includes(g));

  const identityAuthorized = domainMatches || userMatches || roleMatches || groupMatches;

  if (!identityAuthorized) {
    steps.push({
      name: 'Default-Deny Policy Evaluation',
      status: 'fail',
      message: `Access Denied: Zero-Trust Default Deny rule triggered. Subject has not been explicitly granted access by policy '${policy.name}'.`,
      technicalDetails: `Evaluated User: ${user.email} (Role: ${user.role}, Groups: [${user.groups.join(', ')}]). No matching allowed roles, groups, or explicit emails.`,
    });
    return {
      allowed: false,
      decisionReason: `Unauthorized: User does not satisfy policy '${policy.name}' criteria (Default Deny).`,
      steps,
      timestamp,
      failClosedSafeguardActive: true,
    };
  } else {
    steps.push({
      name: 'Default-Deny Policy Evaluation',
      status: 'pass',
      message: `Identity authorized by policy '${policy.name}' via matching ${roleMatches ? 'role' : groupMatches ? 'group' : 'explicit rule'}.`,
      technicalDetails: `Matched rule for ${user.email}`,
    });
  }

  // Step 4: Multi-Factor Authentication (MFA) Verification
  const mfaRequired = application.mfaRequired || policy.mfaRequired;
  const effectiveMfaLevel = application.mfaLevel || policy.mfaLevel || 'webauthn';

  if (mfaRequired) {
    if (!user.mfaEnrolled) {
      steps.push({
        name: 'MFA Enforcement',
        status: 'fail',
        message: 'Access Denied: Strong Multi-Factor Authentication is required, but user is not enrolled.',
        technicalDetails: 'Policy requires MFA enrollment before access can be provisioned.',
      });
      return {
        allowed: false,
        decisionReason: 'MFA required but user has not registered an MFA credential',
        steps,
        timestamp,
        failClosedSafeguardActive: true,
      };
    }

    if (!mfaVerifiedInSession) {
      steps.push({
        name: 'MFA Enforcement',
        status: 'fail',
        message: 'Access Denied: Multi-Factor challenge has not been satisfied for this session.',
        technicalDetails: `Required level: ${effectiveMfaLevel.toUpperCase()}. User must complete challenge prompt.`,
      });
      return {
        allowed: false,
        decisionReason: 'MFA challenge incomplete or pending in active session',
        steps,
        timestamp,
        failClosedSafeguardActive: true,
      };
    }

    if (effectiveMfaLevel === 'webauthn' && user.mfaMethod !== 'FIDO2 Hardware Key') {
      steps.push({
        name: 'MFA Enforcement',
        status: 'fail',
        message: 'Access Denied: High-assurance FIDO2/WebAuthn Hardware Key required. Current TOTP method is insufficient.',
        technicalDetails: `Policy specifies WebAuthn hardware key only. Enrolled method: ${user.mfaMethod}`,
      });
      return {
        allowed: false,
        decisionReason: 'High-assurance FIDO2/WebAuthn hardware key required by policy',
        steps,
        timestamp,
        failClosedSafeguardActive: true,
      };
    }

    steps.push({
      name: 'MFA Enforcement',
      status: 'pass',
      message: `MFA verified: ${user.mfaMethod} passed for current session.`,
      technicalDetails: `Level satisfied: ${effectiveMfaLevel}`,
    });
  } else {
    steps.push({
      name: 'MFA Enforcement',
      status: 'warn',
      message: 'MFA is not strictly required for this low-risk route, but recommended.',
    });
  }

  // Step 5: Final Zero-Trust Grant
  steps.push({
    name: 'Edge Access Token Issuance',
    status: 'pass',
    message: `Zero-Trust validation successful. Access allowed to ${application.edgeUrl} for session duration (${application.sessionDuration}).`,
    technicalDetails: `Internal target ${application.internalHostname} proxied exclusively via Cloudflare Tunnel.`,
  });

  return {
    allowed: true,
    decisionReason: 'All Zero-Trust access criteria satisfied',
    steps,
    timestamp,
    failClosedSafeguardActive: true,
  };
}
