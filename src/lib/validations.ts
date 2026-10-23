import { z } from 'zod';

// Safe internal hostname pattern or private URL
export const internalHostnameRegex = /^(https?:\/\/)?(([a-zA-Z0-9-]+\.)*(internal|corp|local|lan|priv|cluster\.local|svc)|localhost|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})(:[0-9]{1,5})?(\/.*)?$/i;

export const applicationSchema = z.object({
  name: z.string().min(2, 'Application name must be at least 2 characters').max(64, 'Name is too long'),
  description: z.string().max(250, 'Description cannot exceed 250 characters').optional().default(''),
  internalHostname: z.string()
    .min(3, 'Internal hostname or URL is required')
    .refine((val) => {
      // Must not expose credentials
      if (val.includes('@')) return false;
      return true;
    }, 'Internal URL cannot contain credentials')
    .refine((val) => {
      // Ensure it is not an open public domain without internal reference
      return internalHostnameRegex.test(val) || val.includes('.internal') || val.includes('.corp') || val.includes('.local');
    }, 'Internal hostname should be a valid private hostname (e.g. http://vault.internal:8200)'),
  edgeSubdomain: z.string()
    .min(2, 'Edge subdomain is required')
    .max(63, 'Subdomain too long')
    .regex(/^[a-z0-9-]+$/, 'Subdomain may only contain lowercase letters, numbers, and hyphens'),
  environment: z.enum(['development', 'staging', 'production']),
  owner: z.string().min(2, 'Owner or team name is required').max(64),
  tunnelId: z.string().min(1, 'Target Cloudflare Tunnel must be selected'),
  policyId: z.string().min(1, 'Access Policy must be assigned'),
  mfaRequired: z.boolean().default(true),
  mfaLevel: z.enum(['webauthn', 'totp', 'any']).default('webauthn'),
  sessionDuration: z.enum(['15m', '1h', '4h', '8h', '24h']).default('1h'),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const policySchema = z.object({
  name: z.string().min(3, 'Policy name must be at least 3 characters').max(64),
  description: z.string().min(5, 'Policy description is required').max(200),
  defaultDecision: z.literal('deny'),
  allowedRoles: z.array(z.string()).min(1, 'At least one role or group must be permitted'),
  allowedGroups: z.array(z.string()).default([]),
  allowedEmailDomains: z.array(z.string()).default(['corp.internal']),
  allowedUsers: z.array(z.string().email('Invalid email')).default([]),
  mfaRequired: z.boolean().default(true),
  mfaLevel: z.enum(['webauthn', 'totp', 'any']).default('webauthn'),
  sessionTimeoutMinutes: z.number().int().min(5).max(1440).default(60),
  ipRestrictionsEnabled: z.boolean().default(false),
  allowedCidrs: z.array(z.string()).optional(),
});

export type PolicyInput = z.infer<typeof policySchema>;

export const simulationSchema = z.object({
  userId: z.string().min(1, 'Select a user to simulate'),
  applicationId: z.string().min(1, 'Select an application to evaluate'),
  mfaCompleted: z.boolean().default(false),
  customIp: z.string().optional(),
});

export type SimulationInput = z.infer<typeof simulationSchema>;
