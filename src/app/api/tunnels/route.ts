import { NextResponse } from 'next/server';
import { INITIAL_TUNNELS } from '@/lib/demo-data';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    mode: 'demo',
    data: INITIAL_TUNNELS,
    meta: {
      failClosedInvariant: 'Enforced. Outbound Cloudflare Tunnels have zero public origin fallback.',
      credentialsExposed: false,
    },
  });
}
