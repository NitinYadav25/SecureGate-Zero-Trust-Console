import { NextResponse } from 'next/server';
import { INITIAL_POLICIES } from '@/lib/demo-data';
import { policySchema } from '@/lib/validations';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    mode: 'demo',
    data: INITIAL_POLICIES,
    meta: {
      defaultInvariant: 'deny',
      note: 'Zero-Trust Default Deny enforced across all policies.',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = policySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          status: 'error',
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const newPolicy = {
      id: `pol-${Date.now().toString(36)}`,
      ...validated.data,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        status: 'success',
        mode: 'demo',
        data: newPolicy,
        message: 'Zero-Trust policy created (Demo Mode)',
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Failed to create access policy' },
      { status: 500 }
    );
  }
}
