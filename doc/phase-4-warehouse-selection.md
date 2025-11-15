# Phase 4: Warehouse Selection Component

**PR Title:** Implement warehouse selection with city filtering and search capabilities

**Description:** Build a warehouse selection component that fetches and displays warehouses for a selected city, with local search/filter functionality, loading states, and responsive layout.

**Prerequisites:** Phase 3 must be completed (city autocomplete implemented).

---

## Steps to Execute

### 1. Create Custom Hooks

#### `lib/hooks/use-warehouses.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';
import type { Warehouse } from '@/types/nova-poshta';
import type { WarehousesApiResponse } from '@/types/api';

export function useWarehouses(cityRef: string | null) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cityRef) {
      setWarehouses([]);
      setError(null);
      return;
    }

    const fetchWarehouses = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/nova-poshta/warehouses?cityRef=${encodeURIComponent(cityRef)}`
        );

        if (!response.ok) {
          throw new Error('Не вдалося завантажити відділення');
        }

        const data: WarehousesApiResponse = await response.json();

        if (data.success) {
          setWarehouses(data.data);
        } else {
          setError(data.error || 'Помилка завантаження відділень');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Помилка з'єднання");
        setWarehouses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, [cityRef]);

  return { warehouses, loading, error };
}
```

#### Update `lib/hooks/index.ts`

```typescript
export { useCities } from './use-cities';
export { useWarehouses } from './use-warehouses';
```

### 2. Create Warehouse Search Utility

#### `lib/warehouse-utils.ts`

```typescript
import type { Warehouse } from '@/types/nova-poshta';

/**
 * Filter warehouses by search query
 * Searches in Description, ShortAddress, and Number fields
 */
export function filterWarehouses(
  warehouses: Warehouse[],
  query: string
): Warehouse[] {
  if (!query.trim()) {
    return warehouses;
  }

  const searchTerm = query.toLowerCase().trim();

  return warehouses.filter((warehouse) => {
    const description = warehouse.Description?.toLowerCase() || '';
    const shortAddress = warehouse.ShortAddress?.toLowerCase() || '';
    const number = warehouse.Number?.toLowerCase() || '';

    return (
      description.includes(searchTerm) ||
      shortAddress.includes(searchTerm) ||
      number.includes(searchTerm)
    );
  });
}

/**
 * Group warehouses by type
 */
export function groupWarehousesByType(
  warehouses: Warehouse[]
): Record<string, Warehouse[]> {
  return warehouses.reduce((groups, warehouse) => {
    const type = warehouse.TypeOfWarehouse || 'Інше';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(warehouse);
    return groups;
  }, {} as Record<string, Warehouse[]>);
}

/**
 * Sort warehouses by number
 */
export function sortWarehousesByNumber(warehouses: Warehouse[]): Warehouse[] {
  return [...warehouses].sort((a, b) => {
    const numA = parseInt(a.Number) || 0;
    const numB = parseInt(b.Number) || 0;
    return numA - numB;
  });
}
```

### 3. Create UI Components

#### `components/ui/badge.tsx`

```typescript
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
```

#### `components/ui/card.tsx`

```typescript
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function Card({
  children,
  className,
  onClick,
  selected = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border transition-all',
        onClick && 'cursor-pointer hover:shadow-md',
        selected
          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
          : 'border-gray-200 hover:border-gray-300',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-4 py-3 border-b border-gray-200', className)}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('p-4', className)}>{children}</div>;
}
```

### 4. Create Warehouse Selection Component

#### `components/warehouse-selector.tsx`

```typescript
'use client';

import { useState, useMemo } from 'react';
import { useWarehouses } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  filterWarehouses,
  sortWarehousesByNumber,
} from '@/lib/warehouse-utils';
import type { Warehouse } from '@/types/nova-poshta';

interface WarehouseSelectorProps {
  cityRef: string | null;
  cityName?: string;
  onWarehouseSelect: (warehouse: Warehouse) => void;
  selectedWarehouse: Warehouse | null;
  className?: string;
}

export function WarehouseSelector({
  cityRef,
  cityName,
  onWarehouseSelect,
  selectedWarehouse,
  className,
}: WarehouseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { warehouses, loading, error } = useWarehouses(cityRef);

  // Filter and sort warehouses
  const filteredWarehouses = useMemo(() => {
    const filtered = filterWarehouses(warehouses, searchQuery);
    return sortWarehousesByNumber(filtered);
  }, [warehouses, searchQuery]);

  if (!cityRef) {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className='text-lg font-semibold text-gray-900'>
          Відділення Nova Poshta
        </h3>
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 text-center'>
          <p className='text-gray-600'>
            Спочатку оберіть місто для перегляду відділень
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Відділення Nova Poshta
        </h3>
        {cityName && <Badge variant='secondary'>{cityName}</Badge>}
      </div>

      {loading && (
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <Spinner size='lg' className='mx-auto mb-3' />
            <p className='text-gray-600 text-sm'>Завантаження відділень...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-800 text-sm'>{error}</p>
        </div>
      )}

      {!loading && !error && warehouses.length > 0 && (
        <>
          <div>
            <Input
              type='text'
              placeholder='Пошук за номером або адресою...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full'
            />
            {searchQuery && (
              <p className='mt-2 text-sm text-gray-600'>
                Знайдено: {filteredWarehouses.length} з {warehouses.length}
              </p>
            )}
          </div>

          {filteredWarehouses.length === 0 ? (
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-6 text-center'>
              <p className='text-gray-600'>
                Не знайдено відділень за запитом "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className='grid gap-3 max-h-96 overflow-y-auto pr-2'>
              {filteredWarehouses.map((warehouse) => (
                <Card
                  key={warehouse.Ref}
                  selected={selectedWarehouse?.Ref === warehouse.Ref}
                  onClick={() => onWarehouseSelect(warehouse)}
                >
                  <CardContent className='py-3'>
                    <div className='flex items-start gap-3'>
                      <div className='flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                        <span className='text-blue-700 font-bold text-sm'>
                          №{warehouse.Number}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-gray-900 mb-1'>
                          {warehouse.Description}
                        </h4>
                        {warehouse.ShortAddress && (
                          <p className='text-sm text-gray-600'>
                            {warehouse.ShortAddress}
                          </p>
                        )}
                        {warehouse.Phone && (
                          <p className='text-xs text-gray-500 mt-1'>
                            {warehouse.Phone}
                          </p>
                        )}
                      </div>
                      {selectedWarehouse?.Ref === warehouse.Ref && (
                        <div className='flex-shrink-0'>
                          <div className='w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center'>
                            <svg
                              className='w-4 h-4 text-white'
                              fill='none'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path d='M5 13l4 4L19 7'></path>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !error && warehouses.length === 0 && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center'>
          <p className='text-yellow-800'>
            У вибраному місті немає відділень Nova Poshta
          </p>
        </div>
      )}
    </div>
  );
}
```

### 5. Create Demo Page

#### `app/warehouse-demo/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { CityAutocomplete } from '@/components/city-autocomplete';
import { WarehouseSelector } from '@/components/warehouse-selector';
import type { Settlement, Warehouse } from '@/types/nova-poshta';

export default function WarehouseDemoPage() {
  const [selectedCity, setSelectedCity] = useState<Settlement | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );

  const handleCitySelect = (city: Settlement | null) => {
    setSelectedCity(city);
    setSelectedWarehouse(null); // Reset warehouse when city changes
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Демо: Вибір Відділення
          </h1>
          <p className='text-gray-600'>
            Тест компонентів пошуку міста та вибору відділення Nova Poshta
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-6 mb-6'>
          {/* City Selection */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <CityAutocomplete
              onCitySelect={handleCitySelect}
              selectedCity={selectedCity}
            />
          </div>

          {/* Warehouse Selection */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <WarehouseSelector
              cityRef={selectedCity?.Ref || null}
              cityName={selectedCity?.MainDescription}
              onWarehouseSelect={setSelectedWarehouse}
              selectedWarehouse={selectedWarehouse}
            />
          </div>
        </div>

        {/* Selected Data Display */}
        {(selectedCity || selectedWarehouse) && (
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
            <h2 className='text-xl font-semibold mb-4'>Обрані дані</h2>

            {selectedCity && (
              <div className='mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md'>
                <h3 className='font-semibold text-blue-900 mb-2'>Місто:</h3>
                <dl className='space-y-1 text-sm'>
                  <div>
                    <dt className='inline font-medium text-blue-800'>Назва:</dt>
                    <dd className='inline ml-2 text-blue-700'>
                      {selectedCity.MainDescription}
                    </dd>
                  </div>
                  <div>
                    <dt className='inline font-medium text-blue-800'>Ref:</dt>
                    <dd className='inline ml-2 text-blue-700 font-mono text-xs'>
                      {selectedCity.Ref}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {selectedWarehouse && (
              <div className='p-4 bg-green-50 border border-green-200 rounded-md'>
                <h3 className='font-semibold text-green-900 mb-2'>
                  Відділення:
                </h3>
                <dl className='space-y-1 text-sm'>
                  <div>
                    <dt className='inline font-medium text-green-800'>
                      Номер:
                    </dt>
                    <dd className='inline ml-2 text-green-700'>
                      №{selectedWarehouse.Number}
                    </dd>
                  </div>
                  <div>
                    <dt className='inline font-medium text-green-800'>
                      Адреса:
                    </dt>
                    <dd className='inline ml-2 text-green-700'>
                      {selectedWarehouse.Description}
                    </dd>
                  </div>
                  {selectedWarehouse.Phone && (
                    <div>
                      <dt className='inline font-medium text-green-800'>
                        Телефон:
                      </dt>
                      <dd className='inline ml-2 text-green-700'>
                        {selectedWarehouse.Phone}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className='inline font-medium text-green-800'>Ref:</dt>
                    <dd className='inline ml-2 text-green-700 font-mono text-xs'>
                      {selectedWarehouse.Ref}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        )}

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6'>
          <h3 className='font-semibold text-blue-900 mb-3'>Функціонал</h3>
          <ul className='space-y-2 text-sm text-blue-800'>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Автоматичне завантаження відділень при виборі міста</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Локальний пошук по номеру відділення або адресі</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Сортування відділень за номером</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Індикатор завантаження під час отримання даних</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Відображення повної адреси та телефону відділення</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Візуальне виділення обраного відділення</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Скидання вибору відділення при зміні міста</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

### 6. Update Main Page

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
          <h2 className='text-xl font-semibold mb-4'>Прогрес розробки</h2>
          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <span className='flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm'>
                ✓
              </span>
              <span className='text-gray-700'>Ініціалізація проєкту</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm'>
                ✓
              </span>
              <span className='text-gray-700'>API сервісний шар</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm'>
                ✓
              </span>
              <span className='text-gray-700'>Автозаповнення міст</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm'>
                ✓
              </span>
              <span className='text-gray-700'>Вибір відділення</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='flex-shrink-0 w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm'>
                5
              </span>
              <span className='text-gray-500'>Форма декларації</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='flex-shrink-0 w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm'>
                6
              </span>
              <span className='text-gray-500'>
                Підтвердження та обробка помилок
              </span>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Демонстрації</h2>
          <div className='space-y-2'>
            <Link
              href='/city-demo'
              className='block text-blue-600 hover:text-blue-800 font-medium'
            >
              Тест пошуку міст →
            </Link>
            <Link
              href='/warehouse-demo'
              className='block text-blue-600 hover:text-blue-800 font-medium'
            >
              Тест вибору відділення →
            </Link>
          </div>
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='font-semibold text-blue-900 mb-2'>Наступні кроки</h3>
          <p className='text-blue-800 text-sm'>
            Фаза 5 інтегрує компоненти у повноцінну форму декларації з
            валідацією та відправкою даних до Nova Poshta API.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## Verification Steps

1. **Start development server:**

   ```bash
   npm run dev
   ```

2. **Test warehouse selector:**

   - Navigate to http://localhost:3000/warehouse-demo
   - Select a city (e.g., "Київ")
   - Verify warehouses load automatically
   - Check that loading spinner appears during fetch

3. **Test warehouse search:**

   - After warehouses load, type in search box
   - Try searching by number (e.g., "15")
   - Try searching by address keyword
   - Verify filtered results update instantly

4. **Test warehouse selection:**

   - Click on a warehouse
   - Verify it gets highlighted with blue border
   - Check that selected data appears below
   - Select another city and verify warehouse resets

5. **Test edge cases:**

   - Try a city with no warehouses
   - Search for non-existent warehouse
   - Verify appropriate messages display

6. **Verify TypeScript compilation:**
   ```bash
   npm run build
   ```

---

## Success Criteria

- ✅ Warehouse selector component created and working
- ✅ Automatic warehouse loading when city is selected
- ✅ Local search/filter by warehouse number or address
- ✅ Warehouses sorted by number
- ✅ Loading state with spinner
- ✅ Empty state when no city selected
- ✅ Error handling with Ukrainian messages
- ✅ Selected warehouse visually highlighted
- ✅ Warehouse resets when city changes
- ✅ Responsive card-based layout
- ✅ Custom hook `useWarehouses` for API integration
- ✅ Reusable UI components (Badge, Card)
- ✅ Utility functions for filtering and sorting
- ✅ Demo page with integrated city and warehouse selection

---

## Files Changed/Created

**Created:**

- `lib/hooks/use-warehouses.ts` - Custom hook for warehouse fetching
- `lib/warehouse-utils.ts` - Warehouse filtering and sorting utilities
- `components/ui/badge.tsx` - Badge component
- `components/ui/card.tsx` - Card components
- `components/warehouse-selector.tsx` - Main warehouse selector component
- `app/warehouse-demo/page.tsx` - Demo page with integrated flow

**Modified:**

- `lib/hooks/index.ts` - Added `useWarehouses` export
- `app/page.tsx` - Added warehouse demo link and updated progress

---

## Component Features

### Warehouse Selector

- **Auto-loading:** Fetches warehouses automatically when city is selected
- **Local Search:** Client-side filtering for instant results
- **Sorting:** Warehouses sorted numerically by number
- **Visual States:**
  - Empty state when no city selected
  - Loading state with spinner
  - Error state with message
  - No results state when search has no matches
- **Warehouse Display:**
  - Number badge
  - Full description
  - Short address
  - Phone number
  - Selection indicator
- **Responsive Layout:**
  - Scrollable warehouse list (max 96 height units)
  - Card-based design
  - Mobile-friendly

---

## Design Decisions

1. **Automatic loading:**

   - Warehouses load immediately when city is selected
   - No manual "Load" button needed
   - Better UX for typical flow

2. **Local search:**

   - Filter on client-side for instant feedback
   - No API calls for search
   - Works with cached warehouse data

3. **Reset on city change:**

   - Prevents invalid state (warehouse from wrong city)
   - Clear user feedback
   - Parent component manages the reset

4. **Card-based layout:**

   - More information-dense than list
   - Better visual hierarchy
   - Easier to scan

5. **Utility functions:**
   - Separate filtering logic for testability
   - Reusable sorting functions
   - Clean separation of concerns

---

## Next Phase

**Phase 5:** Develop declaration form page integrating city/warehouse selectors with static sender/parcel fields, form validation, and submission to Nova Poshta API.
