'use client';

import { useState, useRef, useEffect } from 'react';
import { useCities } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { Settlement } from '@/types/nova-poshta';

interface CityAutocompleteProps {
  onCitySelect: (city: Settlement | null) => void;
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
  // This effect keeps the text input aligned with externally selected cities.
  useEffect(() => {
    if (selectedCity) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(selectedCity.MainDescription);
      setIsOpen(false);
    }
  }, [selectedCity]);

  // Reset highlighted index when cities change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHighlightedIndex(-1);
  }, [cities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);

    // Clear selection if input is cleared
    if (!value && selectedCity) {
      onCitySelect(null);
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
    isOpen && query.length >= 2 && (cities.length > 0 || loading || !!error);

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
