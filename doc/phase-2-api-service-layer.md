# Phase 2: Nova Poshta API Service Layer

**PR Title:** Implement Nova Poshta API integration with type-safe methods and Next.js API routes

**Description:** Create the complete Nova Poshta API service layer including type-safe client methods for city search and warehouse retrieval, plus secure Next.js API routes that protect the API key on the server side.

**Prerequisites:** Phase 1 must be completed (project initialized with types defined).

---

## Steps to Execute

### 1. Create API Client Library

#### `lib/nova-poshta/client.ts`

```typescript
import type {
  NovaPoshtaApiRequest,
  NovaPoshtaApiResponse,
  City,
  Settlement,
  Warehouse,
} from '@/types/nova-poshta';

const API_URL = 'https://api.novaposhta.ua/v2.0/json/';

/**
 * Base function to call Nova Poshta API
 * This should only be used server-side where API key is available
 */
async function callNovaPoshtaApi<T>(
  apiKey: string,
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, any>
): Promise<NovaPoshtaApiResponse<T>> {
  const requestBody: NovaPoshtaApiRequest = {
    apiKey,
    modelName,
    calledMethod,
    methodProperties,
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Nova Poshta API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Search for cities by partial name (Ukrainian)
 * Uses searchSettlements method for better autocomplete support
 */
export async function searchCities(
  apiKey: string,
  query: string
): Promise<Settlement[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const response = await callNovaPoshtaApi<Settlement>(
    apiKey,
    'Address',
    'searchSettlements',
    {
      CityName: query,
      Limit: 20,
    }
  );

  if (!response.success) {
    console.error('Nova Poshta API errors:', response.errors);
    throw new Error(response.errors.join(', ') || 'Failed to search cities');
  }

  return response.data[0]?.Addresses || [];
}

/**
 * Get cities by string (alternative method)
 * Uses getCities method
 */
export async function getCitiesByString(
  apiKey: string,
  query: string
): Promise<City[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const response = await callNovaPoshtaApi<City>(
    apiKey,
    'Address',
    'getCities',
    {
      FindByString: query,
    }
  );

  if (!response.success) {
    console.error('Nova Poshta API errors:', response.errors);
    throw new Error(response.errors.join(', ') || 'Failed to get cities');
  }

  return response.data;
}

/**
 * Get warehouses for a specific city
 * @param cityRef - City reference ID from search results
 */
export async function getWarehouses(
  apiKey: string,
  cityRef: string
): Promise<Warehouse[]> {
  if (!cityRef) {
    return [];
  }

  const response = await callNovaPoshtaApi<Warehouse>(
    apiKey,
    'Address',
    'getWarehouses',
    {
      CityRef: cityRef,
      Language: 'UA',
    }
  );

  if (!response.success) {
    console.error('Nova Poshta API errors:', response.errors);
    throw new Error(response.errors.join(', ') || 'Failed to get warehouses');
  }

  return response.data;
}

/**
 * Get warehouse by city name (alternative method)
 */
export async function getWarehousesByCityName(
  apiKey: string,
  cityName: string
): Promise<Warehouse[]> {
  if (!cityName) {
    return [];
  }

  const response = await callNovaPoshtaApi<Warehouse>(
    apiKey,
    'Address',
    'getWarehouses',
    {
      CityName: cityName,
      Language: 'UA',
    }
  );

  if (!response.success) {
    console.error('Nova Poshta API errors:', response.errors);
    throw new Error(response.errors.join(', ') || 'Failed to get warehouses');
  }

  return response.data;
}
```

#### `lib/nova-poshta/index.ts`

```typescript
/**
 * Nova Poshta API Client
 * Export all client methods
 */

export {
  searchCities,
  getCitiesByString,
  getWarehouses,
  getWarehousesByCityName,
} from './client';
```

### 2. Create Next.js API Routes

#### `app/api/nova-poshta/cities/route.ts`

```typescript
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
```

#### `app/api/nova-poshta/warehouses/route.ts`

```typescript
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
```

#### `app/api/nova-poshta/health/route.ts`

```typescript
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
```

### 3. Update Type Definitions

#### Update `types/nova-poshta.ts`

Add the following types to the existing file:

```typescript
/**
 * API Response wrapper for client-side consumption
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Search settlements response structure
 * The API returns nested Addresses array
 */
export interface SearchSettlementsResponse {
  TotalCount: number;
  Addresses: Settlement[];
}
```

### 4. Create API Response Types File

#### `types/api.ts`

```typescript
import type { Settlement, Warehouse } from './nova-poshta';

/**
 * API endpoint response types for client-side usage
 */

export interface CitiesApiResponse {
  data: Settlement[];
  success: boolean;
  error?: string;
}

export interface WarehousesApiResponse {
  data: Warehouse[];
  success: boolean;
  error?: string;
}

export interface HealthApiResponse {
  status: 'ok' | 'misconfigured';
  message: string;
  timestamp: string;
}
```

### 5. Update Home Page with API Test

#### Update `app/page.tsx`

```typescript
import Link from 'next/link';

export default function Home() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>Nova Poshta</h1>
        <p className='text-gray-600 mb-8'>Створення декларації відправлення</p>

        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Статус API</h2>
          <p className='text-gray-700 mb-4'>
            API-сервіси Nova Poshta готові до використання.
          </p>
          <div className='space-y-2 text-sm'>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-2 bg-green-500 rounded-full'></span>
              <code className='text-gray-600'>/api/nova-poshta/cities</code>
              <span className='text-gray-500'>- Пошук міст</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-2 bg-green-500 rounded-full'></span>
              <code className='text-gray-600'>/api/nova-poshta/warehouses</code>
              <span className='text-gray-500'>- Відділення міста</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-2 bg-green-500 rounded-full'></span>
              <code className='text-gray-600'>/api/nova-poshta/health</code>
              <span className='text-gray-500'>- Перевірка налаштувань</span>
            </div>
          </div>
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='font-semibold text-blue-900 mb-2'>Наступні кроки</h3>
          <p className='text-blue-800 text-sm'>
            Фаза 3 додасть компонент автозаповнення для пошуку міст з підтримкою
            клавіатури та української мови.
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 6. Create API Testing Documentation

#### `docs/api-testing.md`

````markdown
# API Testing Guide

## Health Check

Test that your API key is configured:

```bash
curl http://localhost:3000/api/nova-poshta/health
```
````

Expected response:

```json
{
  "status": "ok",
  "message": "API key is configured",
  "timestamp": "2025-11-15T10:30:00.000Z"
}
```

## Search Cities

Test city search (use Ukrainian characters):

```bash
curl "http://localhost:3000/api/nova-poshta/cities?query=Київ"
```

Expected response:

```json
{
  "data": [
    {
      "Ref": "8d5a980d-391c-11dd-90d9-001a92567626",
      "MainDescription": "Київ",
      "Area": "...",
      "Region": "..."
    }
  ],
  "success": true
}
```

## Get Warehouses

Test warehouse retrieval (use a valid city Ref from search):

```bash
curl "http://localhost:3000/api/nova-poshta/warehouses?cityRef=8d5a980d-391c-11dd-90d9-001a92567626"
```

Expected response:

```json
{
  "data": [
    {
      "Ref": "...",
      "Description": "Відділення №1: вул. Хрещатик, 1",
      "ShortAddress": "Хрещатик, 1",
      "CityRef": "8d5a980d-391c-11dd-90d9-001a92567626",
      "Number": "1"
    }
  ],
  "success": true
}
```

## Browser Testing

Open in browser:

- Health: http://localhost:3000/api/nova-poshta/health
- Cities: http://localhost:3000/api/nova-poshta/cities?query=Львів
- Warehouses: http://localhost:3000/api/nova-poshta/warehouses?cityRef=<REF>

````

---

## Verification Steps

1. **Ensure API key is set in `.env.local`:**
   ```bash
   cat .env.local
````

Should show: `NOVA_POSHTA_API_KEY=<your-actual-key>`

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Test health endpoint:**

   ```bash
   curl http://localhost:3000/api/nova-poshta/health
   ```

4. **Test city search:**

   ```bash
   curl "http://localhost:3000/api/nova-poshta/cities?query=Київ"
   ```

5. **Test warehouse retrieval:**

   - Get a city Ref from step 4
   - Run: `curl "http://localhost:3000/api/nova-poshta/warehouses?cityRef=<REF>"`

6. **Verify TypeScript compilation:**
   ```bash
   npm run build
   ```

---

## Success Criteria

- ✅ API client library created in `lib/nova-poshta/` with type-safe methods
- ✅ Three API routes created and working:
  - `/api/nova-poshta/cities` - City search
  - `/api/nova-poshta/warehouses` - Warehouse listing
  - `/api/nova-poshta/health` - Configuration check
- ✅ API key is securely stored and only accessible server-side
- ✅ All endpoints return Ukrainian error messages
- ✅ Type definitions updated with API response types
- ✅ Health check passes with configured API key
- ✅ City search returns results for Ukrainian city names
- ✅ Warehouse endpoint returns warehouses for valid city reference
- ✅ Error handling works for missing/invalid parameters

---

## Files Changed/Created

**Created:**

- `lib/nova-poshta/client.ts` - Nova Poshta API client methods
- `lib/nova-poshta/index.ts` - Client exports
- `app/api/nova-poshta/cities/route.ts` - City search endpoint
- `app/api/nova-poshta/warehouses/route.ts` - Warehouse listing endpoint
- `app/api/nova-poshta/health/route.ts` - Health check endpoint
- `types/api.ts` - API response type definitions
- `docs/api-testing.md` - API testing documentation

**Modified:**

- `types/nova-poshta.ts` - Added `ApiResponse` and `SearchSettlementsResponse` types
- `app/page.tsx` - Added API status display

---

## API Design Decisions

1. **Using `searchSettlements` instead of `getCities`:**

   - Better for autocomplete (supports partial matching)
   - Returns more detailed settlement information
   - Can search by postal code as well

2. **Server-side API routes:**

   - Protects API key from client exposure
   - Allows request validation and rate limiting
   - Enables caching strategies in future phases

3. **Ukrainian error messages:**

   - All user-facing errors are in Ukrainian
   - Server logs remain in English for debugging
   - Consistent with app's language requirements

4. **Type safety:**
   - Full TypeScript coverage for API requests/responses
   - Separate types for internal API and client consumption
   - Compile-time validation of API calls

---

## Next Phase

**Phase 3:** Build city autocomplete component with debounced search, keyboard navigation, and Ukrainian text predictions.
