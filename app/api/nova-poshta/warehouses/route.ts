import { NextRequest, NextResponse } from 'next/server';
import { getWarehouses } from '@/lib/nova-poshta';

/**
 * GET /api/nova-poshta/warehouses?cityRef=<ref>
 * Get warehouses for a specific city
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cityRef = searchParams.get('cityRef');

    if (!cityRef) {
      return NextResponse.json(
        { error: "Параметр cityRef є обов'язковим" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NOVA_POSHTA_API_KEY;
    if (!apiKey) {
      console.error('NOVA_POSHTA_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Помилка конфігурації сервера' },
        { status: 500 }
      );
    }

    const warehouses = await getWarehouses(apiKey, cityRef);

    return NextResponse.json({ data: warehouses, success: true });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не вдалося завантажити відділення',
        success: false,
      },
      { status: 500 }
    );
  }
}
