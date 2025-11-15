# Phase 3: City Autocomplete Component

**PR Title:** Implement city autocomplete with debounced search and keyboard navigation

**Description:** Build a reusable autocomplete component for city search with debounced API calls, keyboard navigation (arrow keys, Enter, Escape), loading states, and Ukrainian text display.

**Prerequisites:** Phase 2 must be completed (API service layer implemented).

---

## Steps to Execute

### 1. Install Dependencies

```bash
npm install use-debounce
```

### 2. Create Custom Hooks

#### `lib/hooks/use-cities.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useDebouncedValue } from 'use-debounce';
import type { Settlement } from '@/types/nova-poshta';
import type { CitiesApiResponse } from '@/types/api';

export function useCities(query: string, delay: number = 300) {
  const [cities, setCities] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery] = useDebouncedValue(query, delay);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setCities([]);
      setError(null);
      return;
    }

    const fetchCities = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/nova-poshta/cities?query=${encodeURIComponent(debouncedQuery)}`
        );

        if (!response.ok) {
          throw new Error('Не вдалося завантажити міста');
        }

        const data: CitiesApiResponse = await response.json();

        if (data.success) {
          setCities(data.data);
        } else {
          setError(data.error || 'Помилка пошуку міст');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Помилка з'єднання");
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [debouncedQuery]);

  return { cities, loading, error };
}
```

#### `lib/hooks/index.ts`

```typescript
export { useCities } from './use-cities';
```

### 3. Create UI Components

#### `components/ui/spinner.tsx`

```typescript
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className
      )}
      role='status'
      aria-label='Завантаження'
    >
      <span className='sr-only'>Завантаження...</span>
    </div>
  );
}
```

#### `components/ui/input.tsx`

```typescript
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
```

### 4. Create City Autocomplete Component

#### `components/city-autocomplete.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { useCities } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { Settlement } from '@/types/nova-poshta';

interface CityAutocompleteProps {
  onCitySelect: (city: Settlement) => void;
  selectedCity: Settlement | null;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function CityAutocomplete({
  onCitySelect,
  selectedCity,
  label = 'Місто',
  placeholder = 'Почніть вводити назву міста...',
  className,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const { cities, loading, error } = useCities(query);

  // Update input when city is selected externally
  useEffect(() => {
    if (selectedCity) {
      setQuery(selectedCity.MainDescription);
      setIsOpen(false);
    }
  }, [selectedCity]);

  // Reset highlighted index when cities change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [cities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);

    // Clear selection if input is cleared
    if (!value && selectedCity) {
      onCitySelect(null as any);
    }
  };

  const handleCitySelect = (city: Settlement) => {
    onCitySelect(city);
    setQuery(city.MainDescription);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && cities.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < cities.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : cities.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && cities[highlightedIndex]) {
          handleCitySelect(cities[highlightedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;

      case 'Tab':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown =
    isOpen && query.length >= 2 && (cities.length > 0 || loading || error);

  return (
    <div className={cn('relative', className)}>
      <label
        htmlFor='city-input'
        className='block text-sm font-medium text-gray-700 mb-1'
      >
        {label}
      </label>

      <div className='relative'>
        <Input
          ref={inputRef}
          id='city-input'
          type='text'
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete='off'
          aria-autocomplete='list'
          aria-controls='city-listbox'
          aria-expanded={showDropdown}
          aria-activedescendant={
            highlightedIndex >= 0
              ? `city-option-${highlightedIndex}`
              : undefined
          }
        />

        {loading && (
          <div className='absolute right-3 top-1/2 -translate-y-1/2'>
            <Spinner size='sm' />
          </div>
        )}
      </div>

      {showDropdown && (
        <ul
          ref={listRef}
          id='city-listbox'
          role='listbox'
          className={cn(
            'absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg',
            'max-h-60 overflow-auto'
          )}
        >
          {error && <li className='px-4 py-3 text-sm text-red-600'>{error}</li>}

          {!error && cities.length === 0 && !loading && (
            <li className='px-4 py-3 text-sm text-gray-500'>
              Міста не знайдено
            </li>
          )}

          {cities.map((city, index) => (
            <li
              key={city.Ref}
              id={`city-option-${index}`}
              role='option'
              aria-selected={highlightedIndex === index}
              className={cn(
                'px-4 py-2 cursor-pointer text-sm',
                'hover:bg-blue-50 transition-colors',
                highlightedIndex === index && 'bg-blue-50'
              )}
              onClick={() => handleCitySelect(city)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className='font-medium text-gray-900'>
                {city.MainDescription}
              </div>
              {city.AreaDescription && (
                <div className='text-xs text-gray-500'>
                  {city.AreaDescription}
                  {city.RegionDescription && `, ${city.RegionDescription}`}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Helper text */}
      {query.length > 0 && query.length < 2 && (
        <p className='mt-1 text-xs text-gray-500'>
          Введіть мінімум 2 символи для пошуку
        </p>
      )}
    </div>
  );
}
```

### 5. Create Demo Page

#### `app/city-demo/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { CityAutocomplete } from '@/components/city-autocomplete';
import type { Settlement } from '@/types/nova-poshta';

export default function CityDemoPage() {
  const [selectedCity, setSelectedCity] = useState<Settlement | null>(null);

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-2xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Демо: Пошук Міста
          </h1>
          <p className='text-gray-600'>
            Тест компонента автозаповнення для пошуку міст Nova Poshta
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <CityAutocomplete
            onCitySelect={setSelectedCity}
            selectedCity={selectedCity}
          />

          {selectedCity && (
            <div className='mt-6 p-4 bg-green-50 border border-green-200 rounded-md'>
              <h3 className='font-semibold text-green-900 mb-2'>
                Обране місто:
              </h3>
              <dl className='space-y-1 text-sm'>
                <div>
                  <dt className='inline font-medium text-green-800'>Назва:</dt>
                  <dd className='inline ml-2 text-green-700'>
                    {selectedCity.MainDescription}
                  </dd>
                </div>
                <div>
                  <dt className='inline font-medium text-green-800'>
                    Область:
                  </dt>
                  <dd className='inline ml-2 text-green-700'>
                    {selectedCity.AreaDescription}
                  </dd>
                </div>
                {selectedCity.RegionDescription && (
                  <div>
                    <dt className='inline font-medium text-green-800'>
                      Район:
                    </dt>
                    <dd className='inline ml-2 text-green-700'>
                      {selectedCity.RegionDescription}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className='inline font-medium text-green-800'>Ref:</dt>
                  <dd className='inline ml-2 text-green-700 font-mono text-xs'>
                    {selectedCity.Ref}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='font-semibold text-blue-900 mb-3'>Функціонал</h3>
          <ul className='space-y-2 text-sm text-blue-800'>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Пошук міст з затримкою (debounce) 300ms</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>
                Навігація клавіатурою: ↑↓ для переміщення, Enter для вибору, Esc
                для закриття
              </span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Індикатор завантаження під час запиту</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Відображення області та району для кожного міста</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Обробка помилок з зрозумілими повідомленнями</span>
            </li>
            <li className='flex items-start gap-2'>
              <span className='text-blue-600 mt-0.5'>✓</span>
              <span>Закриття списку при кліку поза компонентом</span>
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
              <span className='flex-shrink-0 w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm'>
                4
              </span>
              <span className='text-gray-500'>Вибір відділення</span>
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
          <Link
            href='/city-demo'
            className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium'
          >
            <span>Тест пошуку міст</span>
            <span>→</span>
          </Link>
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
          <h3 className='font-semibold text-blue-900 mb-2'>Наступні кроки</h3>
          <p className='text-blue-800 text-sm'>
            Фаза 4 додасть компонент вибору відділення з фільтрацією по обраному
            місту та можливостями пошуку.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## Verification Steps

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Test city autocomplete:**

   - Navigate to http://localhost:3000/city-demo
   - Type "Київ" in the search box
   - Verify cities appear in dropdown
   - Verify loading spinner appears during search

4. **Test keyboard navigation:**

   - Type a city name
   - Press Arrow Down to highlight first result
   - Press Arrow Up/Down to navigate
   - Press Enter to select highlighted city
   - Press Escape to close dropdown

5. **Test click outside:**

   - Open dropdown
   - Click outside the component
   - Verify dropdown closes

6. **Verify TypeScript compilation:**
   ```bash
   npm run build
   ```

---

## Success Criteria

- ✅ City autocomplete component created and working
- ✅ Debounced search implemented (300ms delay)
- ✅ Keyboard navigation works (↑↓ Enter Esc)
- ✅ Loading state displays spinner
- ✅ Ukrainian city names display correctly
- ✅ Area and region information shown for each city
- ✅ Selected city state managed correctly
- ✅ Error states handled with Ukrainian messages
- ✅ Click outside closes dropdown
- ✅ Accessible with proper ARIA attributes
- ✅ Custom hook `useCities` for API integration
- ✅ Reusable UI components (Input, Spinner)
- ✅ Demo page created for testing

---

## Files Changed/Created

**Created:**

- `lib/hooks/use-cities.ts` - Custom hook for city search
- `lib/hooks/index.ts` - Hooks exports
- `components/ui/spinner.tsx` - Loading spinner component
- `components/ui/input.tsx` - Input field component
- `components/city-autocomplete.tsx` - Main autocomplete component
- `app/city-demo/page.tsx` - Demo page for testing

**Modified:**

- `app/page.tsx` - Added progress tracker and demo link
- `package.json` - Added `use-debounce` dependency

---

## Component Features

### City Autocomplete

- **Debouncing:** 300ms delay prevents excessive API calls
- **Keyboard Navigation:**
  - ↑/↓ to navigate options
  - Enter to select highlighted option
  - Escape to close dropdown and blur input
  - Tab to close dropdown and move to next field
- **Mouse Interaction:**
  - Click to select
  - Hover to highlight
  - Click outside to close
- **Accessibility:**
  - ARIA attributes for screen readers
  - Semantic HTML roles
  - Visible focus states
  - Status announcements
- **Visual Feedback:**
  - Loading spinner during API calls
  - Highlighted selection state
  - Empty state messaging
  - Error state messaging
- **Data Display:**
  - City name (MainDescription)
  - Area (AreaDescription)
  - Region (RegionDescription) if available

---

## Design Decisions

1. **use-debounce library:**

   - Simple, reliable debouncing
   - React-specific implementation
   - Minimal bundle size

2. **Keyboard navigation:**

   - Following standard autocomplete patterns
   - Circular navigation (top↑ goes to bottom)
   - Smooth scrolling for highlighted items

3. **Component composition:**

   - Separate Input and Spinner components for reusability
   - Hook-based API integration for testability
   - Props interface for flexibility

4. **State management:**
   - Local component state for UI concerns
   - Parent component manages selected city
   - Clear separation of concerns

---

## Next Phase

**Phase 4:** Create warehouse selection component that filters warehouses by selected city with search/filter capabilities.
