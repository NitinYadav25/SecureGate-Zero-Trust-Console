import { NextResponse } from 'next/server';
import { evaluateZeroTrustAccess } from '@/lib/evaluator';
import { INITIAL_APPLICATIONS, INITIAL_POLICIES, INITIAL_TUNNELS, INITIAL_USERS } from '@/lib/demo-data';
import { simulationSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = simulationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          status: 'error',
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { userId, applicationId, mfaCompleted } = validated.data;

    const user = INITIAL_USERS.find(u => u.id === userId);
    const application = INITIAL_APPLICATIONS.find(a => a.id === applicationId);

    if (!user || !application) {
      return NextResponse.json(
        { status: 'error', message: 'User or Application not found in directory' },
        { status: 404 }
      );
    }

    const policy = INITIAL_POLICIES.find(p => p.id === application.policyId) || {
      id: 'default-deny',
      name: 'Default Deny Fallback',
      description: 'Fallback deny policy',
      defaultDecision: 'deny',
      allowedRoles: [],
      allowedGroups: [],
      allowedEmailDomains: [],
      allowedUsers: [],
      mfaRequired: true,
      mfaLevel: 'webauthn',
      sessionTimeoutMinutes: 0,
      ipRestrictionsEnabled: false,
      updatedAt: new Date().toISOString(),
    };

    const tunnel = INITIAL_TUNNELS.find(t => t.id === application.tunnelId);

    const result = evaluateZeroTrustAccess({
      user,
      application,
      policy,
      tunnel,
      mfaVerifiedInSession: mfaCompleted,
    });

    return NextResponse.json({
      status: 'success',
      mode: 'demo',
      data: result,
    });
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Simulation evaluation failure' },
      { status: 500 }
    );
  }
}
