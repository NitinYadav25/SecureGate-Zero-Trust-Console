import { describe, it, expect } from 'vitest';
import { applicationSchema, policySchema, internalHostnameRegex } from '@/lib/validations';

describe('Zod Validation Schemas', () => {
  it('validates a valid application input payload', () => {
    const validApp = {
      name: 'Kubernetes Production',
      description: 'Production control plane',
      internalHostname: 'http://k8s-master.corp.internal:6443',
      edgeSubdomain: 'k8s-prod',
      environment: 'production',
      owner: 'Platform Team',
      tunnelId: 'tun-us-east-01',
      policyId: 'pol-platform',
      mfaRequired: true,
      mfaLevel: 'webauthn',
      sessionDuration: '1h',
    };

    const parsed = applicationSchema.safeParse(validApp);
    expect(parsed.success).toBe(true);
  });

  it('rejects internal URLs with embedded user credentials', () => {
    const badApp = {
      name: 'Exposed Bastion',
      internalHostname: 'http://admin:secretPass123@vault.internal:8200',
      edgeSubdomain: 'bad-bastion',
      environment: 'production',
      owner: 'SecOps',
      tunnelId: 'tun-01',
      policyId: 'pol-01',
    };

    const parsed = applicationSchema.safeParse(badApp);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.internalHostname).toBeDefined();
    }
  });

  it('enforces Zero-Trust defaultDecision as deny in policy schema', () => {
    const validPolicy = {
      name: 'Platform Engineering Access',
      description: 'Enforces Zero Trust for cluster operators',
      defaultDecision: 'deny',
      allowedRoles: ['Platform Engineer'],
      allowedGroups: ['devops'],
      allowedEmailDomains: ['securegate.io'],
      allowedUsers: [],
      mfaRequired: true,
      mfaLevel: 'any',
      sessionTimeoutMinutes: 120,
    };

    const parsed = policySchema.safeParse(validPolicy);
    expect(parsed.success).toBe(true);

    const invalidPolicy = {
      ...validPolicy,
      defaultDecision: 'allow', // Prohibited!
    };
    const invalidParsed = policySchema.safeParse(invalidPolicy);
    expect(invalidParsed.success).toBe(false);
  });

  it('validates private and internal hostnames against internalHostnameRegex', () => {
    expect(internalHostnameRegex.test('http://vault.internal:8200')).toBe(true);
    expect(internalHostnameRegex.test('http://k8s.corp.internal:6443')).toBe(true);
    expect(internalHostnameRegex.test('http://10.200.1.5:8080')).toBe(true);
  });
});
