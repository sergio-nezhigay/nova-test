import { NextResponse } from 'next/server';

/**
 * GET /api/nova-poshta/health
 * Health check endpoint to verify API key is configured
 */
export async function GET() {
  const apiKey = process.env.NOVA_POSHTA_API_KEY;
  const isConfigured = !!apiKey && apiKey !== 'your_api_key_here';

  return NextResponse.json({
    status: isConfigured ? 'ok' : 'misconfigured',
    message: isConfigured
      ? 'API key is configured'
      : 'API key is missing or not set',
    timestamp: new Date().toISOString(),
  });
}
