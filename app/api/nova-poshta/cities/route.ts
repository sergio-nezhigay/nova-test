import { NextRequest, NextResponse } from 'next/server';
import { searchCities } from '@/lib/nova-poshta';

/**
 * GET /api/nova-poshta/cities?query=Київ
 * Search for cities by partial name
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Запит повинен містити мінімум 2 символи' },
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

    const cities = await searchCities(apiKey, query);

    return NextResponse.json({ data: cities, success: true });
  } catch (error) {
    console.error('Error searching cities:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Не вдалося знайти міста',
        success: false,
      },
      { status: 500 }
    );
  }
}
