'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import type { Settlement } from '@/types/nova-poshta';
import type { CitiesApiResponse } from '@/types/api';

export function useCities(query: string, delay: number = 300) {
  const [cities, setCities] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery] = useDebounce(query, delay);

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
