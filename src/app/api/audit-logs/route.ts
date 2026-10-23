import { NextResponse } from 'next/server';
import { INITIAL_AUDIT_LOGS } from '@/lib/demo-data';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    mode: 'demo',
    data: INITIAL_AUDIT_LOGS,
    meta: {
      total: INITIAL_AUDIT_LOGS.length,
      redactedFields: ['tokens', 'secrets', 'mfa_codes', 'private_keys'],
    },
  });
}
