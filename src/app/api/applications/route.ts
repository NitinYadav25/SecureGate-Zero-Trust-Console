import { NextResponse } from 'next/server';
import { INITIAL_APPLICATIONS } from '@/lib/demo-data';
import { applicationSchema } from '@/lib/validations';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    mode: 'demo',
    data: INITIAL_APPLICATIONS,
    meta: {
      total: INITIAL_APPLICATIONS.length,
      note: 'Demo mode active. Connect PostgreSQL via DATABASE_URL and Prisma for persistent production storage.',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = applicationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          status: 'error',
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const newApp = {
      id: `app-${Date.now().toString(36)}`,
      name: validated.data.name,
      description: validated.data.description,
      internalHostname: validated.data.internalHostname,
      edgeUrl: `https://${validated.data.edgeSubdomain}.corp.securegate.io`,
      environment: validated.data.environment,
      owner: validated.data.owner,
      tunnelId: validated.data.tunnelId,
      tunnelStatus: 'connected' as const,
      protectionStatus: 'Protected' as const,
      policyId: validated.data.policyId,
      mfaRequired: validated.data.mfaRequired,
      mfaLevel: validated.data.mfaLevel,
      sessionDuration: validated.data.sessionDuration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        status: 'success',
        mode: 'demo',
        data: newApp,
        message: 'Application registered in Zero-Trust Edge Catalog (Demo Mode)',
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Failed to process application registration' },
      { status: 500 }
    );
  }
}
